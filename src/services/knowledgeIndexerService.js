// TODO: Implement indexing data from database to vector database logic
import { prisma } from "../libs/prisma.js";
import { upsertChunk, deleteChunksBySource } from "./documentChunkService.js";

// ─── Text formatters ─────────────────────────────────────────────────────────
// Convert Prisma record → text mô tả để embed vào Chroma.
// Viết tiếng Việt để khớp với câu hỏi của user GDC.

const fmt = (lines) => lines.filter(Boolean).join(". ");

const formatActivity = (a) =>
  fmt([
    `Hoạt động: ${a.title}`,
    `Loại: ${a.type}`,
    `Trạng thái: ${a.status}`,
    `Mô tả: ${a.description}`,
    `Bắt đầu: ${a.startDate?.toLocaleDateString("vi-VN")}`,
    `Kết thúc: ${a.endDate?.toLocaleDateString("vi-VN")}`,
    a.locationType && `Hình thức: ${a.locationType}`,
    a.venueName && `Địa điểm: ${a.venueName}`,
    a.venueAddress && `Địa chỉ: ${a.venueAddress}`,
    a.meetingLink && `Link: ${a.meetingLink}`,
    a.organizer && `Tổ chức bởi: ${a.organizer.fullname}`,
    a.maxParticipants && `Tối đa: ${a.maxParticipants} người`,
    a.requireRegistration && "Yêu cầu đăng ký",
    a.isFeatured && "Hoạt động nổi bật",
  ]);

const formatTask = (t) => {
  const assigneeNames = t.assignees
    ?.map((a) => a.user?.fullname)
    .filter(Boolean)
    .join(", ");
  return fmt([
    `Công việc: ${t.title}`,
    `Trạng thái: ${t.status}`,
    t.description && `Mô tả: ${t.description}`,
    t.dueDate && `Deadline: ${t.dueDate.toLocaleDateString("vi-VN")}`,
    t.assignedBy && `Giao bởi: ${t.assignedBy.fullname}`,
    assigneeNames && `Thực hiện bởi: ${assigneeNames}`,
    t.isCheckCf && "Yêu cầu xác nhận hoàn thành",
    t.assigneeScope !== "ALL" && `Phạm vi: ${t.assigneeScope}`,
  ]);
};

const formatMember = (u) => {
  const primaryPos = u.userPosition?.find((up) => up.isPrimary);
  const allTitles = u.userPosition
    ?.map((up) => up.position?.title)
    .filter(Boolean)
    .join(", ");
  return fmt([
    `Thành viên: ${u.fullname}`,
    `Email: ${u.email}`,
    u.studentId && `MSSV: ${u.studentId}`,
    u.major && `Ngành: ${u.major}`,
    u.generation && `Gen ${u.generation}`,
    u.gender && `Giới tính: ${u.gender}`,
    `Trạng thái: ${u.status}`,
    primaryPos && `Chức vụ chính: ${primaryPos.position?.title}`,
    primaryPos?.position?.department &&
      `Phòng ban: ${primaryPos.position.department.name}`,
    allTitles && `Tất cả chức vụ: ${allTitles}`,
    u.bio && `Bio: ${u.bio}`,
  ]);
};

const formatDepartment = (d) =>
  fmt([
    `Phòng ban: ${d.name}`,
    `Mô tả: ${d.description}`,
    `Trạng thái: ${d.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}`,
    d._count?.rootUsers != null && `Số thành viên: ${d._count.rootUsers}`,
  ]);

// ─── Individual indexers ──────────────────────────────────────────────────────
// Mỗi hàm: đọc record từ Prisma/Neon → format text → upsert vào Chroma.
// Nếu record đã bị delete → xóa chunk khỏi Chroma.

export const indexActivity = async (activityId) => {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      organizer: { select: { fullname: true } },
    },
  });

  if (!activity || activity.isDeleted) {
    return deleteChunksBySource("activity", activityId);
  }

  return upsertChunk({
    sourceType: "activity",
    sourceId: activityId,
    content: formatActivity(activity),
    metadata: {
      title: activity.title,
      status: activity.status,
      type: activity.type,
      slug: activity.slug,
      startDate: activity.startDate?.toISOString(),
    },
  });
};

export const indexTask = async (taskId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignedBy: { select: { fullname: true } },
      assignees: { select: { user: { select: { fullname: true } } } },
    },
  });

  if (!task || task.isDeleted) {
    return deleteChunksBySource("task", taskId);
  }

  return upsertChunk({
    sourceType: "task",
    sourceId: taskId,
    content: formatTask(task),
    metadata: {
      title: task.title,
      status: task.status,
      dueDate: task.dueDate?.toISOString() ?? null,
    },
  });
};

export const indexMember = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userPosition: {
        include: {
          position: {
            include: { department: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!user || user.isDeleted) {
    return deleteChunksBySource("member", userId);
  }

  return upsertChunk({
    sourceType: "member",
    sourceId: userId,
    content: formatMember(user),
    metadata: {
      fullname: user.fullname,
      email: user.email,
      status: user.status,
    },
  });
};

export const indexDepartment = async (departmentId) => {
  const dept = await prisma.department.findUnique({
    where: { id: departmentId },
    include: { _count: { select: { rootUsers: true } } },
  });

  if (!dept || dept.isDeleted) {
    return deleteChunksBySource("department", departmentId);
  }

  return upsertChunk({
    sourceType: "department",
    sourceId: departmentId,
    content: formatDepartment(dept),
    metadata: { name: dept.name, isActive: dept.isActive },
  });
};

// ─── Full reindex ─────────────────────────────────────────────────────────────
// Đọc toàn bộ data từ Prisma/Neon rồi đẩy embedding vào Chroma.
// Chạy khi server start hoặc ADMIN trigger thủ công.

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 150; // tránh rate limit Gemini embedding API

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const indexBatch = async (ids, indexFn, label) => {
  let success = 0;
  let failed = 0;

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map((id) =>
        indexFn(id)
          .then(() => success++)
          .catch((err) => {
            failed++;
            console.error(`[RAG] index ${label} ${id} failed:`, err.message);
          }),
      ),
    );

    if (i + BATCH_SIZE < ids.length) await sleep(BATCH_DELAY_MS);
  }

  console.log(
    `[RAG] ${label}: ${success} indexed, ${failed} failed / total ${ids.length}`,
  );
};

export const reindexAll = async () => {
  console.log(
    "[RAG] Starting full reindex — reading from Neon, writing to Chroma...",
  );
  const t0 = Date.now();

  // Đọc IDs từ Prisma/Neon
  const [activities, tasks, users, departments] = await Promise.all([
    prisma.activity.findMany({
      where: { isDeleted: false },
      select: { id: true },
    }),
    prisma.task.findMany({ where: { isDeleted: false }, select: { id: true } }),
    prisma.user.findMany({ where: { isDeleted: false }, select: { id: true } }),
    prisma.department.findMany({
      where: { isDeleted: false },
      select: { id: true },
    }),
  ]);

  // Index từng loại — tuần tự để Gemini không bị rate limit
  await indexBatch(
    activities.map((r) => r.id),
    indexActivity,
    "activity",
  );
  await indexBatch(
    tasks.map((r) => r.id),
    indexTask,
    "task",
  );
  await indexBatch(
    users.map((r) => r.id),
    indexMember,
    "member",
  );
  await indexBatch(
    departments.map((r) => r.id),
    indexDepartment,
    "department",
  );

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(
    `[RAG] Full reindex done in ${elapsed}s — ` +
      `${activities.length} activities, ${tasks.length} tasks, ` +
      `${users.length} members, ${departments.length} departments.`,
  );
};
