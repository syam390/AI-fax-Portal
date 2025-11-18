import { GoogleGenAI, Type } from "@google/genai";
import { ReferralData, ReferralStatus } from "../types";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor(apiKey: string) {
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  /**
   * Simulates the "File Processing" and "Format to JSON" features from the PDF.
   * Handles Images, PDFs (inline) and Text (extracted from Docx).
   */
  async processDocument(
    fileData: string | null, 
    mimeType: string, 
    textContent?: string
  ): Promise<Partial<ReferralData>> {
    if (!this.ai) {
      throw new Error("AI Service not initialized with API Key");
    }

    // Schema definition matches the PDF requirement
    const schema = {
      type: Type.OBJECT,
      properties: {
        isReferral: {
          type: Type.BOOLEAN,
          description: "True if the document appears to be a medical referral, form, letter, or note. False only if clearly irrelevant (e.g. a landscape photo, recipe).",
        },
        PatientName: { type: Type.STRING, description: "Full name of the patient" },
        ReferredBy: { type: Type.STRING, description: "Name of referring physician or clinic" },
        ReferredTo: { type: Type.STRING, description: "Name of physician or clinic being referred to" },
        Diagnosis: { type: Type.STRING, description: "ICD code or diagnosis description" },
        DOB: { type: Type.STRING, description: "Date of birth of the patient (YYYY-MM-DD)" },
        ReferralDate: { type: Type.STRING, description: "Date of the referral (YYYY-MM-DD)" },
        Summary: { type: Type.STRING, description: "Brief summary of the document content, including any handwritten notes if present." }
      },
      required: ["isReferral", "PatientName", "ReferredBy", "ReferredTo", "Diagnosis"],
    };

    const parts: any[] = [];

    // 1. Add File Content (PDF or Image)
    if (fileData && (mimeType.startsWith('image/') || mimeType === 'application/pdf')) {
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: fileData,
        },
      });
    }

    // 2. Add Text Content (e.g. from Word Doc extraction)
    if (textContent) {
      parts.push({
        text: `Document Text Content:\n${textContent}`
      });
    }

    // 3. Add Instructions
    parts.push({
      text: `Analyze the provided document content (which may include an image, PDF pages, or extracted text).
      
      Role: You are an expert medical intake automation system.
      
      Goal: Extract structured data for the referral database.
      
      Strict Rules:
      1. 'isReferral': Set to true if the document contains ANY patient information, medical terminology, or looks like a form, letter, or note regarding a patient. Only set to false if it is clearly junk (e.g., a blank page, a picture of a cat).
      2. 'PatientName': Look for patterns like "Patient:", "Name:", or capitalized names at the top.
      3. 'Diagnosis': Look for "Dx", "Diagnosis", "Reason for referral", or ICD codes (e.g., M54.5).
      4. Handwriting: The document might be handwritten. Do your best to decipher it.
      5. If a field is not found, use "Unknown".
      
      Output JSON only.`,
    });

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: parts,
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.1, // Low temperature for factual extraction
          systemInstruction: "You are an expert medical administrative assistant capable of reading complex, handwritten, and low-quality fax documents."
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      const parsed = JSON.parse(text);
      
      // Determine status based on AI classification
      // If isReferral is false, we mark it REJECTED but still return the data (so it goes to the "Rejected" bucket).
      const status = parsed.isReferral ? ReferralStatus.PENDING : ReferralStatus.REJECTED;

      return {
        PatientName: parsed.PatientName || 'Unknown',
        ReferredBy: parsed.ReferredBy || 'Unknown',
        ReferredTo: parsed.ReferredTo || 'Unknown',
        Diagnosis: parsed.Diagnosis || 'Unknown',
        DOB: parsed.DOB,
        ReferralDate: parsed.ReferralDate,
        Status: status,
        Notes: parsed.Summary
      };

    } catch (error) {
      console.error("Error processing document with Gemini:", error);
      throw error;
    }
  }
}