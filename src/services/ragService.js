// TODO: Implement RAG main pipeline
import { ai } from "../libs/googleGenAI.js";
import { embedText } from "./embeddingService.js";
import { searchSimilarChunks } from "./documentChunkService.js";

const RAG_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const SIMILARITY_THRESHOLD = 0.55; // bỏ chunk không liên quan
const TOP_K = 6;

const SYSTEM_PROMPT = `
Bạn là AI assistant của GDC (Greenwich Dance Crew) — hệ thống quản lý câu lạc bộ nhảy.

Nguyên tắc:
1. Chỉ trả lời dựa trên thông tin trong [CONTEXT] bên dưới.
2. Nếu context không đủ → nói "Tôi không tìm thấy thông tin này trong hệ thống."
3. Trả lời tiếng Việt, ngắn gọn, rõ ràng.
4. Dùng gạch đầu dòng khi liệt kê nhiều mục.
5. Không tiết lộ email hay số điện thoại khi không cần thiết.
`.trim();

const buildUserPrompt = (query, chunks) => {
  if (chunks.length === 0) {
    return `[CONTEXT]\nKhông có dữ liệu liên quan trong hệ thống GDC.\n\n[CÂU HỎI]\n${query}`;
  }

  const contextText = chunks
    .map((c, i) => {
      const label = String(c.metadata?.sourceType ?? "unknown").toUpperCase();
      return `[${i + 1}] (${label}) ${c.content}`;
    })
    .join("\n\n");

  return `[CONTEXT]\n${contextText}\n\n[CÂU HỎI]\n${query}`;
};

/**
 * RAG query pipeline:
 *  1. Embed câu hỏi (Gemini)
 *  2. Tìm chunks liên quan (Chroma)
 *  3. Filter theo similarity threshold
 *  4. Generate câu trả lời (Gemini + context)
 *
 * @param {string} query
 * @param {{ sourceType?: string|null, topK?: number }} options
 */
export const ragQuery = async (query, options = {}) => {
  const { sourceType = null, topK = TOP_K } = options;

  // 1. Embed query — dùng Gemini embedding API
  const queryVector = await embedText(query);

  // 2. Search Chroma — vector similarity
  const rawChunks = await searchSimilarChunks(queryVector, {
    topK,
    sourceType,
  });

  // 3. Lọc chunk không đủ liên quan
  const relevantChunks = rawChunks.filter(
    (c) => c.similarity >= SIMILARITY_THRESHOLD,
  );

  // 4. Build prompt với context từ Chroma
  const userPrompt = buildUserPrompt(query, relevantChunks);

  // 5. Generate với Gemini
  const response = await ai.models.generateContent({
    model: RAG_MODEL,
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 1024,
      temperature: 0.2, // thấp = ít hallucinate, bám sát context
    },
  });

  return {
    answer: response.text?.trim() || "Không thể tạo câu trả lời.",
    sources: relevantChunks.map((c) => ({
      sourceType: c.metadata?.sourceType,
      sourceId: Number(c.metadata?.sourceId),
      similarity: Number(c.similarity).toFixed(3),
      metadata: c.metadata,
    })),
    chunksUsed: relevantChunks.length,
    totalChunksFound: rawChunks.length,
  };
};
