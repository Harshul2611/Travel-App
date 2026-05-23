import mongoose, { Document, Schema } from "mongoose";

export interface IItinerary extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  documentUrl: string;
  extractedData: string;
  itinerary: {
    destination: string;
    startDate: string;
    endDate: string;
    flights: Array<{
      from: string;
      to: string;
      date: string;
      time: string;
      airline: string;
      flightNumber: string;
    }>;
    hotels: Array<{
      name: string;
      checkIn: string;
      checkOut: string;
      address: string;
    }>;
    activities: Array<{
      day: string;
      description: string;
    }>;
    summary: string;
  };
  shareId: string;
  createdAt: Date;
}

const ItinerarySchema = new Schema<IItinerary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    documentUrl: { type: String, required: true },
    extractedData: { type: String },
    itinerary: {
      destination: String,
      startDate: String,
      endDate: String,
      flights: [
        {
          from: String,
          to: String,
          date: String,
          time: String,
          airline: String,
          flightNumber: String,
        },
      ],
      hotels: [
        {
          name: String,
          checkIn: String,
          checkOut: String,
          address: String,
        },
      ],
      activities: [
        {
          day: String,
          description: String,
        },
      ],
      summary: String,
    },
    shareId: { type: String, unique: true },
  },
  { timestamps: true },
);

export default mongoose.model<IItinerary>("Itinerary", ItinerarySchema);
