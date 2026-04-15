import { ai } from "../libs/googleGenAI.js";
import dotenv from "dotenv";
import { THINKING_LEVELS, SYSTEM_INSTRUCTIONS } from "../utils/constant.js";

dotenv.config();

export const generateResponse = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.content_generator,
        maxOutputTokens: 100,
        temperature: THINKING_LEVELS.MEDIUM,
      },
    });

    return response.text || "";
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to generate AI response");
  }
};
