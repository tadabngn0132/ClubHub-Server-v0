// TODO: Implement CRUD chunks + vector search logic
import { getCollection } from "../libs/chroma.js";
import { embedText } from "./embeddingService.js";

// ID convention trong Chroma: "{sourceType}_{sourceId}"
// Ví dụ: "activity_12", "member_5", "task_3"
const makeChunkId = (sourceType, sourceId) => `${sourceType}_${sourceId}`;

/**
 * Upsert một chunk vào Chroma.
 * Chroma tự handle insert vs update dựa trên ID — hoàn toàn idempotent.
 *
 * Prisma vẫn giữ data thật trong Neon.
 * Chroma chỉ giữ embedding + text để search.
 *
 * @param {{ sourceType: string, sourceId: number, content: string, metadata?: object }}
 */
export const upsertChunk = async ({
  sourceType,
  sourceId,
  content,
  metadata = {},
}) => {
  const collection = await getCollection();
  const id = makeChunkId(sourceType, sourceId);
  const vector = await embedText(content);

  await collection.upsert({
    ids: [id],
    embeddings: [vector],
    documents: [content],
    metadatas: [
      {
        sourceType,
        sourceId: Number(sourceId),
        ...metadata,
      },
    ],
  });
};

/**
 * Tìm top-K chunks liên quan nhất với query vector.
 * Filter theo sourceType nếu cần.
 *
 * @param {number[]} queryVector
 * @param {{ topK?: number, sourceType?: string|null }} options
 * @returns {Promise<Array<{ id, content, metadata, similarity }>>}
 */
export const searchSimilarChunks = async (
  queryVector,
  { topK = 5, sourceType = null } = {},
) => {
  const collection = await getCollection();
  const k = Math.max(1, Math.min(topK, 20));

  // Chroma where filter — chỉ tìm trong đúng loại nếu có filter
  const whereClause = sourceType
    ? { sourceType: { $eq: sourceType } }
    : undefined;

  const results = await collection.query({
    queryEmbeddings: [queryVector],
    nResults: k,
    ...(whereClause ? { where: whereClause } : {}),
  });

  // Chroma trả array lồng vì support batch query
  // Index [0] vì mình chỉ query 1 vector
  const ids = results.ids?.[0] ?? [];
  const documents = results.documents?.[0] ?? [];
  const metadatas = results.metadatas?.[0] ?? [];
  const distances = results.distances?.[0] ?? [];

  // Chroma dùng cosine distance (0 = identical, 2 = opposite)
  // Convert sang similarity để dễ dùng: similarity = 1 - distance
  return ids.map((id, i) => ({
    id,
    content: documents[i] ?? "",
    metadata: metadatas[i] ?? {},
    similarity: 1 - (distances[i] ?? 1),
  }));
};

/**
 * Xóa chunk của một entity khỏi Chroma.
 * Gọi khi entity bị soft/hard delete trong Prisma.
 */
export const deleteChunksBySource = async (sourceType, sourceId) => {
  const collection = await getCollection();
  const id = makeChunkId(sourceType, sourceId);

  try {
    await collection.delete({ ids: [id] });
  } catch {
    // Bỏ qua nếu ID không tồn tại trong Chroma
  }
};

/**
 * Đếm tổng chunks đang có trong Chroma (dùng cho health check)
 */
export const countChunks = async () => {
  const collection = await getCollection();
  return collection.count();
};
