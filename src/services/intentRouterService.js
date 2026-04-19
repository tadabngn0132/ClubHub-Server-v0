import { ai } from "../libs/googleGenAI.js";
import dotenv from "dotenv";

dotenv.config();

// ─── Keyword banks ────────────────────────────────────────────────────────────
// Những từ/cụm từ gợi ý câu hỏi đang hỏi về DATA THẬT trong hệ thống

const RAG_KEYWORDS = [
  // Hỏi về người
  "ai là",
  "ai đang",
  "ai được",
  "có ai",
  "ai phụ trách",
  "thành viên nào",
  "member nào",
  "ai làm",
  "ai tạo",
  "trưởng phòng",
  "phó phòng",
  "chủ tịch",
  "phó chủ tịch",

  // Hỏi về task/công việc
  "task nào",
  "công việc nào",
  "nhiệm vụ nào",
  "deadline",
  "hạn nộp",
  "hạn chót",
  "đã xong chưa",
  "hoàn thành chưa",
  "còn tồn đọng",
  "đang làm",
  "chưa làm",
  "bị trễ",
  "task của tôi",
  "task của tôi",
  "việc của tôi",

  // Hỏi về hoạt động/sự kiện
  "hoạt động nào",
  "event nào",
  "sự kiện nào",
  "buổi nào",
  "buổi tập",
  "buổi họp",
  "sắp diễn ra",
  "đang diễn ra",
  "đã kết thúc",
  "tuần này",
  "tháng này",
  "sắp tới",
  "upcoming",
  "lịch",
  "schedule",
  "kế hoạch",

  // Hỏi về phòng ban/tổ chức
  "phòng ban",
  "department",
  "ban nào",
  "có bao nhiêu",
  "tổng số",
  "danh sách",
  "liệt kê",
  "cho tôi biết",
  "tìm kiếm",
  "tìm",
  "thông tin về",
  "chi tiết về",

  // Hỏi về trạng thái
  "trạng thái",
  "status",
  "tình trạng",
  "còn không",
  "có không",
  "bao nhiêu người",
  "khi nào",
  "ngày nào",
  "lúc nào",
  "ở đâu",
];

// Những từ/cụm từ gợi ý yêu cầu TẠO NỘI DUNG / SÁNG TẠO
const AI_KEYWORDS = [
  // Yêu cầu viết lách
  "viết",
  "soạn",
  "draft",
  "tạo",
  "generate",
  "viết cho tôi",
  "soạn cho tôi",
  "giúp tôi viết",
  "viết thông báo",
  "soạn email",
  "viết bài",

  // Yêu cầu gợi ý / đề xuất sáng tạo
  "gợi ý",
  "đề xuất",
  "suggest",
  "recommend",
  "caption",
  "slogan",
  "tagline",
  "ý tưởng",
  "idea",
  "brainstorm",
  "nội dung",
  "content",
  "bài post",
  "bài viết",

  // Yêu cầu giải thích kiến thức chung
  "giải thích",
  "hướng dẫn",
  "làm thế nào",
  "cách nào",
  "tips",
  "mẹo",
  "ý nghĩa của",
  "định nghĩa",
  "là gì",

  // Yêu cầu chỉnh sửa
  "chỉnh sửa",
  "cải thiện",
  "sửa lại",
  "viết lại",
  "rút gọn",
  "mở rộng",
  "dịch",
];

// ─── Rule-based classifier ────────────────────────────────────────────────────

const ruleBasedClassify = (query) => {
  const lower = query.toLowerCase();

  const ragScore = RAG_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  const aiScore = AI_KEYWORDS.filter((kw) => lower.includes(kw)).length;

  return { ragScore, aiScore };
};

// ─── Gemini-based classifier (tiebreaker) ─────────────────────────────────────

const CLASSIFIER_SYSTEM_PROMPT = `
Bạn là bộ phân loại intent cho AI assistant của GDC (Greenwich Dance Crew).

Phân loại câu hỏi/yêu cầu vào đúng 1 trong 2 loại:

"rag" — khi người dùng hỏi về dữ liệu thực tế trong hệ thống:
  - Hỏi về thành viên, task, hoạt động, phòng ban cụ thể
  - Hỏi deadline, lịch, trạng thái, danh sách
  - Ví dụ: "task nào sắp deadline?", "ai trưởng HR?", "buổi tập tuần này?"

"ai" — khi người dùng muốn tạo nội dung hoặc hỏi kiến thức chung:
  - Yêu cầu viết, soạn, tạo nội dung
  - Hỏi gợi ý, ý tưởng, cách làm
  - Ví dụ: "viết thông báo buổi tập", "gợi ý caption", "giải thích RBAC là gì"

Chỉ trả về đúng 1 từ: "rag" hoặc "ai". Tuyệt đối không giải thích thêm.
`.trim();

const geminiClassify = async (query) => {
  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: query }] }],
      config: {
        systemInstruction: CLASSIFIER_SYSTEM_PROMPT,
        maxOutputTokens: 5,
        temperature: 0, // deterministic
      },
    });

    const result = response.text?.trim().toLowerCase();
    return result === "ai" ? "ai" : "rag";
  } catch (err) {
    console.warn(
      "[IntentRouter] Gemini classify failed, fallback to rag:",
      err.message,
    );
    return "rag"; // safe fallback
  }
};

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Hybrid intent detection:
 *   - Nếu rule-based rõ ràng (score lệch >= 2) → quyết định ngay, zero latency
 *   - Nếu không rõ (tie hoặc score gần nhau) → nhờ Gemini phân loại
 *
 * @param {string} query
 * @returns {Promise<'rag' | 'ai'>}
 */
export const detectIntent = async (query) => {
  if (!query || query.trim().length === 0) return "rag";

  const { ragScore, aiScore } = ruleBasedClassify(query);

  console.log(
    `[IntentRouter] query="${query.slice(0, 50)}..." | ragScore=${ragScore} aiScore=${aiScore}`,
  );

  // Rõ ràng nghiêng về RAG
  if (ragScore >= aiScore + 2) {
    console.log("[IntentRouter] Decision: rag (rule-based)");
    return "rag";
  }

  // Rõ ràng nghiêng về AI
  if (aiScore >= ragScore + 2) {
    console.log("[IntentRouter] Decision: ai (rule-based)");
    return "ai";
  }

  // Không rõ → nhờ Gemini
  console.log("[IntentRouter] Ambiguous → calling Gemini classifier");
  const intent = await geminiClassify(query);
  console.log(`[IntentRouter] Decision: ${intent} (gemini)`);
  return intent;
};
