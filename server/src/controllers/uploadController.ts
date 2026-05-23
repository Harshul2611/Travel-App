import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { uploadToS3 } from "../utils/s3Upload.js";
import { extractTextFromPDF } from "../utils/extractPDF.js";
import Itinerary from "../models/Itinerary.js";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const uploadAndGenerate = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const { buffer, mimetype, originalname } = req.file;

    // 1. Upload to S3
    const documentUrl = await uploadToS3(buffer, mimetype, originalname);

    // 2. Extract text
    let extractedText = "";
    if (mimetype === "application/pdf") {
      extractedText = await extractTextFromPDF(buffer);
    } else {
      // For images — use OpenAI vision
      const base64 = buffer.toString("base64");
      const visionResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimetype};base64,${base64}` },
              },
              {
                type: "text",
                text: "Extract all travel booking information from this image including flight details, hotel bookings, dates, times, locations, booking references.",
              },
            ],
          },
        ],
        max_tokens: 1000,
      });
      extractedText = visionResponse.choices[0]?.message.content ?? "";
    }

    // 3. Generate itinerary using OpenAI
    const prompt = `
You are a travel assistant. Based on the following travel booking information, generate a structured travel itinerary.

Booking Information:
${extractedText}

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Trip title based on destination",
  "destination": "Main destination",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "flights": [
    {
      "from": "departure city",
      "to": "arrival city", 
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "airline": "airline name",
      "flightNumber": "flight number"
    }
  ],
  "hotels": [
    {
      "name": "hotel name",
      "checkIn": "YYYY-MM-DD",
      "checkOut": "YYYY-MM-DD",
      "address": "hotel address"
    }
  ],
  "activities": [
    {
      "day": "Day 1 - YYYY-MM-DD",
      "description": "Suggested activities for this day"
    }
  ],
  "summary": "Brief trip summary"
}
`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const itineraryData = JSON.parse(
      aiResponse.choices[0]?.message.content ?? "{}",
    );

    // 4. Save to MongoDB
    const itinerary = await Itinerary.create({
      userId: req.userId,
      title: itineraryData.title || "My Trip",
      documentUrl,
      extractedData: extractedText,
      itinerary: {
        destination: itineraryData.destination,
        startDate: itineraryData.startDate,
        endDate: itineraryData.endDate,
        flights: itineraryData.flights || [],
        hotels: itineraryData.hotels || [],
        activities: itineraryData.activities || [],
        summary: itineraryData.summary,
      },
      shareId: uuidv4(),
    });

    res.status(201).json({
      message: "Itinerary generated successfully",
      itinerary,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// GET all itineraries for user
export const getItineraries = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const itineraries = await Itinerary.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("-extractedData");

    res.status(200).json({ itineraries });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// GET single itinerary
export const getItinerary = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const id = req.params["id"];
    if (!id || typeof id !== "string") {
      res.status(400).json({ message: "Missing id" });
      return;
    }
    const itinerary = await Itinerary.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!itinerary) {
      res.status(404).json({ message: "Itinerary not found" });
      return;
    }

    res.status(200).json({ itinerary });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// GET shared itinerary — public route
export const getSharedItinerary = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const shareId = req.params["shareId"];
    if (!shareId) {
      res.status(400).json({ message: "Missing shareId" });
      return;
    }
    const itinerary = await Itinerary.findOne({ shareId }).select(
      "-extractedData",
    );

    if (!itinerary) {
      res.status(404).json({ message: "Itinerary not found" });
      return;
    }

    res.status(200).json({ itinerary });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
