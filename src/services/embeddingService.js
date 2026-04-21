// TODO: Implement Gemini embedding API call
import { ai } from "../libs/googleGenAI.js";
import { BadRequestError } from "../utils/AppError.js";

const EMBEDDING_MODELS = [
  process.env.GEMINI_EMBEDDING_MODEL,
  "gemini-embedding-001",
  "text-embedding-004",
].filter(Boolean);
const MAX_CHARS = 2000;

const isModelNotFoundError = (error) => {
  const message = error?.message || "";
  return (
    error?.status === 404 ||
    error?.code === 404 ||
    message.includes("NOT_FOUND") ||
    message.includes("is not found")
  );
};

const tryEmbedWithModel = async (model, text) => {
  const response = await ai.models.embedContent({
    model,
    contents: text,
  });

  const values = response.embeddings?.[0]?.values;

  if (!Array.isArray(values) || values.length === 0) {
    throw new BadRequestError("embedText: Gemini does not return embedding");
  }

  return values;
};

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

  let lastError = null;

  for (const model of EMBEDDING_MODELS) {
    try {
      return await tryEmbedWithModel(model, truncated);
    } catch (error) {
      lastError = error;
      if (!isModelNotFoundError(error)) {
        throw error;
      }
    }
  }

  throw lastError || new BadRequestError("embedText: No embedding model is available");
};
