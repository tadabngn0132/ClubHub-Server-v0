import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.BACKUP_GEMINI_API_KEY,
});

// Define different system instructions for different use cases
const SYSTEM_INSTRUCTIONS = {
  activity_recommender: `You are an activity recommendation assistant for a dance crew management system. 
    Help suggest activities, training sessions, and performance opportunities based on member profiles and preferences.
    Keep responses concise and actionable.`,

  content_generator: `You are a content generation assistant for a dance crew.
    Help create event descriptions, announcements, training plans, and motivational messages.
    Match the tone to be professional yet engaging for a dance community.`,

  communication_helper: `You are a communication assistant that helps draft messages for members.
    Help with clarity, tone, and professionalism. Keep responses brief and direct.`,

  task_planner: `You are a project planning assistant for event management.
    Help break down complex tasks into actionable steps with timelines.
    Consider resource constraints typical for a volunteer-run dance crew.`,
};

const THINKING_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

/**
 * Generate content with specified system instruction
 * @param {string} prompt - The user's prompt
 * @param {string} instructionType - Type of instruction (activity_recommender, content_generator, etc.)
 * @returns {Promise<Object>} Response with success status and content
 */
export async function generateContent(
  prompt,
  instructionType = "content_generator",
) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        thinkingConfig: {
          thinkingLevel: THINKING_LEVELS.MEDIUM,
        },
        systemInstruction:
          SYSTEM_INSTRUCTIONS[instructionType] ||
          SYSTEM_INSTRUCTIONS.content_generator,
      },
    });

    return {
      success: true,
      content: response.text,
      model: "gemini-3-flash-preview",
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return {
      success: false,
      error: error.message,
      content: null,
    };
  }
}

/**
 * Batch generate content for multiple prompts
 * @param {string[]} prompts - Array of prompts
 * @param {string} instructionType - Type of instruction
 * @returns {Promise<Object[]>} Array of results
 */
export async function generateContentBatch(
  prompts,
  instructionType = "content_generator",
) {
  try {
    const results = await Promise.all(
      prompts.map((prompt) => generateContent(prompt, instructionType)),
    );
    return results;
  } catch (error) {
    console.error("Batch Generation Error:", error);
    throw error;
  }
}

/**
 * Fine-tuned generation with custom options
 * @param {string} prompt - The user's prompt
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Response with content and usage stats
 */
export async function generateWithOptions(prompt, options = {}) {
  const {
    instructionType = "content_generator",
    temperature = 0.7,
    thinkingLevel = "MEDIUM",
    maxTokens = null,
  } = options;

  try {
    const config = {
      temperature,
      thinkingConfig: {
        thinkingLevel:
          THINKING_LEVELS[thinkingLevel.toUpperCase()] ||
          THINKING_LEVELS.MEDIUM,
      },
      systemInstruction:
        SYSTEM_INSTRUCTIONS[instructionType] ||
        SYSTEM_INSTRUCTIONS.content_generator,
    };

    if (maxTokens) {
      config.maxOutputTokens = maxTokens;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config,
    });

    return {
      success: true,
      content: response.text,
      usage: {
        inputTokens: response.usageMetadata?.inputTokens || 0,
        outputTokens: response.usageMetadata?.outputTokens || 0,
      },
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return {
      success: false,
      error: error.message,
      content: null,
    };
  }
}

/**
 * Safe AI call with retry mechanism
 * @param {string} prompt - The user's prompt
 * @param {string} instructionType - Type of instruction
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise<Object>} Response with content
 */
export async function safeAICall(
  prompt,
  instructionType = "content_generator",
  maxRetries = 3,
) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await generateContent(prompt, instructionType);
      if (result.success) return result;
      lastError = result.error;
    } catch (error) {
      lastError = error;
      // Exponential backoff: wait before retry
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 1000),
        );
      }
    }
  }

  return {
    success: false,
    error: `Failed after ${maxRetries} retries: ${lastError}`,
    content: null,
  };
}

export { SYSTEM_INSTRUCTIONS, THINKING_LEVELS };
