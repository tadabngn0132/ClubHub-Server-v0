import { ai } from "../libs/googleGenAI.js";
import dotenv from "dotenv";
import { THINKING_LEVELS, SYSTEM_INSTRUCTIONS } from "../utils/constant.js";

dotenv.config();

const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter(Boolean);

export const generateResponse = async (prompt) => {
  try {
    for (const model of MODEL_CANDIDATES) {
      try {
        const response = await ai.models.generateContent({
          model,
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
        if (error?.status !== 404) {
          throw error;
        }
      }
    }

    throw new Error(
      `No available Gemini model found. Tried: ${MODEL_CANDIDATES.join(", ")}`
    );
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to generate AI response");
  }
};
