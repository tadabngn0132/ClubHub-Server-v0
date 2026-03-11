import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const THINKING_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

// TODO: Prepare a more comprehensive system instruction that guides the AI to provide better responses based on the application's needs.
const SYSTEM_INSTRUCTION =
  "You are a helpful assistant that explains complex topics in simple terms.";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.BACKUP_GEMINI_API_KEY,
});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Explain how AI works in a few words.",
    config: {
      temperature: 0.1,
      thinkingConfig: {
        thinkingLevel: THINKING_LEVELS.MEDIUM,
      },
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
  console.log(response.text);
}

await main();
