import { PDFParse } from "pdf-parse";

export const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  } catch {
    throw new Error("Failed to extract text from PDF");
  }
};
