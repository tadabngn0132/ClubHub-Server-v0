import { ChromaClient } from "chromadb";

// ChromaClient kết nối HTTP server (production)
// hoặc fallback in-memory nếu không có server
const chromaUrl = process.env.CHROMA_URL || "http://localhost:8000";
const parsedChromaUrl = new URL(chromaUrl);

const client = new ChromaClient({
  host: parsedChromaUrl.hostname,
  port: Number(parsedChromaUrl.port || (parsedChromaUrl.protocol === "https:" ? 443 : 80)),
  ssl: parsedChromaUrl.protocol === "https:",
});

export const COLLECTION_NAME = "clubhub_knowledge";

let _collection = null;

/**
 * Lấy hoặc tạo collection — idempotent, safe gọi nhiều lần.
 * Lazy init để không block server startup nếu Chroma chưa ready.
 */
export const getCollection = async () => {
  if (_collection) return _collection;

  _collection = await client.getOrCreateCollection({
    name: COLLECTION_NAME,
    embeddingFunction: null,
    metadata: {
      description: "ClubHub RAG knowledge base",
      "hnsw:space": "cosine", // cosine similarity
    },
  });

  return _collection;
};

export { client };
