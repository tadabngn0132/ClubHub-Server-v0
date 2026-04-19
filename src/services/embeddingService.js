// TODO: Implement Gemini embedding API call
import { ai } from "../libs/googleGenAI.js";
import { BadRequestError } from "../utils/AppError.js";

const EMBEDDING_MODEL = "text-embedding-004"; // 768 dims, Gemini
const MAX_CHARS = 2000;

/**
 * Embed một đoạn text → number[] (768 dimensions)
 */
export const embedText = async (text) => {
  const truncated = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CHARS);

  if (!truncated)
    throw new BadRequestError("embedText: Input is empty after normalization");

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: truncated,
  });

  const values = response.embeddings?.[0]?.values;

  if (!Array.isArray(values) || values.length === 0) {
    throw new BadRequestError("embedText: Gemini does not return embedding");
  }

  return values; // number[768]
};
