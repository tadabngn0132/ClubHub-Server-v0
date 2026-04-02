import { ai } from "../libs/googleGenAI.js";
import dotenv from "dotenv";
import { THINKING_LEVELS, SYSTEM_INSTRUCTIONS } from '../utils/constant.js';

dotenv.config();

export const generateResponse = async (prompt) => {
    try {
        const response = await ai.generateContent({
            model: "gemini-1.5-pro",
            content: [
                {
                    role: "system",
                    text: SYSTEM_INSTRUCTIONS
                },
                {
                    role: "user",
                    text: prompt
                }
            ],
            maxTokens: 100,
            temperature: THINKING_LEVELS.MEDIUM,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating AI response:", error);
        throw new Error("Failed to generate AI response");
    }
}
