export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

export const ROLE = {
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
  MEMBER: "MEMBER",
};

export const PROVIDER = {
  LOCAL: "LOCAL",
  GOOGLE: "GOOGLE",
  BOTH: "BOTH",
};

export const ACTIVITY_TYPE = {
  MEETING: "MEETING",
  WORKSHOP: "WORKSHOP",
  TRAINING: "TRAINING",
  PERFORMANCE: "PERFORMANCE",
  COMPETITION: "COMPETITION",
  SOCIAL: "SOCIAL",
  VOLUNTEER: "VOLUNTEER",
};

export const ACTIVITY_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  POSTPONED: "POSTPONED",
};

export const PARTICIPATION_STATUS = {
  REGISTERED: "REGISTERED",
  CONFIRMED: "CONFIRMED",
  ATTENDED: "ATTENDED",
  ABSENT: "ABSENT",
  CANCELLED: "CANCELLED",
};

export const CV_STATUS = {
  PENDING: "PENDING",
  PASSED: "PASSED",
  FAILED: "FAILED",
};

export const FINAL_STATUS = {
  PENDING: "PENDING",
  PASSED: "PASSED",
  FAILED: "FAILED",
};

export const INTERVIEW_STATUS = {
  PENDING: "PENDING",
  PASSED: "PASSED",
  FAILED: "FAILED",
};

export const TASK_STATUS = {
  NEW: "NEW",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
  CANCELLED: "CANCELLED",
  ON_HOLD: "ON_HOLD",
};

export const POSITION_LEVEL = {
  MEMBER: "MEMBER",
  MIDDLE_VICE_HEAD: "MIDDLE_VICE_HEAD",
  MIDDLE_HEAD: "MIDDLE_HEAD",
  TOP_VICE_HEAD: "TOP_VICE_HEAD",
  TOP_HEAD: "TOP_HEAD",
};

export const ROLE_PERMISSIONS = {
  ADMIN: {
    users: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
    },
    activities: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
    },
    tasks: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
    },
    positions: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
    },
    departments: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
    },
    memberApplications: {
      create: false,
      read: true,
      update: true,
      cvReview: true,
      finalReview: true,
      createUserFromApplication: true,
      softDelete: true,
      hardDelete: true,
    },
    departmentApplications: {
      create: true,
      read: true,
      update: true,
      interviewReview: true,
      softDelete: true,
      hardDelete: true,
    },
    notifications: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
    },
    activityParticipants: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
    },
    activityParticipations: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
    },
    messages: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
    },
    dashboard: {
      read: true,
    },
    chatRooms: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
      manageMembers: true,
    },
    notificationPreferences: {
      read: true,
      update: true,
    },
    systemLogs: {
      read: true,
    },
    rag: {
      query: true,
      reindex: true,
      viewHealth: true,
    },
  },
  MODERATOR: {
    users: {
      create: false,
      read: true,
      update: true,
      softDelete: false,
      hardDelete: false,
    },
    activities: {
      create: true,
      read: true,
      update: true,
      softDelete: false,
      hardDelete: false,
    },
    tasks: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: false,
    },
    positions: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    departments: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    memberApplications: {
      create: false,
      read: true,
      update: true,
      cvReview: true,
      finalReview: true,
      createUserFromApplication: true,
      softDelete: false,
      hardDelete: false,
    },
    departmentApplications: {
      create: true,
      read: true,
      update: true,
      interviewReview: true,
      softDelete: true,
      hardDelete: false,
    },
    notifications: {
      create: true,
      read: true,
      update: true,
      softDelete: false,
      hardDelete: false,
    },
    activityParticipants: {
      create: true,
      read: true,
      update: true,
      softDelete: false,
      hardDelete: false,
    },
    activityParticipations: {
      create: true,
      read: true,
      update: true,
      softDelete: false,
      hardDelete: false,
    },
    messages: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
    },
    dashboard: {
      read: true,
    },
    chatRooms: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: false,
      manageMembers: true,
    },
    notificationPreferences: {
      read: true,
      update: true,
    },
    systemLogs: {
      read: false,
    },
    rag: {
      query: true,
      reindex: false,
      viewHealth: true,
    },
  },
  MEMBER: {
    users: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    activities: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    tasks: {
      create: false,
      read: true,
      update: true,
      softDelete: false,
      hardDelete: false,
    },
    positions: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    departments: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    memberApplications: {
      create: false,
      read: true,
      update: false,
      cvReview: false,
      finalReview: false,
      createUserFromApplication: false,
      softDelete: false,
      hardDelete: false,
    },
    departmentApplications: {
      create: false,
      read: false,
      update: false,
      interviewReview: false,
      softDelete: false,
      hardDelete: false,
    },
    notifications: {
      create: true,
      read: true,
      update: true,
      softDelete: false,
      hardDelete: false,
    },
    activityParticipants: {
      create: true,
      read: true,
      update: true,
      softDelete: false,
      hardDelete: false,
    },
    activityParticipations: {
      create: true,
      read: true,
      update: true,
      softDelete: false,
      hardDelete: false,
    },
    messages: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: false,
    },
    dashboard: {
      read: false,
    },
    chatRooms: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: false,
      manageMembers: false,
    },
    notificationPreferences: {
      read: true,
      update: true,
    },
    systemLogs: {
      read: false,
    },
    rag: {
      query: true,
      reindex: false,
      viewHealth: false,
    },
  },
  GUEST: {
    users: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    activities: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    tasks: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    positions: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    departments: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    memberApplications: {
      create: true,
      read: true,
      update: false,
      cvReview: false,
      finalReview: false,
      createUserFromApplication: false,
      softDelete: false,
      hardDelete: false,
    },
    departmentApplications: {
      create: false,
      read: false,
      update: false,
      interviewReview: false,
      softDelete: false,
      hardDelete: false,
    },
    notifications: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    activityParticipants: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    activityParticipations: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    messages: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    dashboard: {
      read: false,
    },
    chatRooms: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
      manageMembers: false,
    },
    notificationPreferences: {
      read: false,
      update: false,
    },
    systemLogs: {
      read: false,
    },
    rag: {
      query: false,
      reindex: false,
      viewHealth: false,
    },
  },
};

export const ASSIGNEE_SCOPE = {
  ALL: "ALL",
  DEPTS: "DEPTS",
  MEMBERS: "MEMBERS",
};

export const AVATAR_PROVIDERS = {
  GOOGLE: "GOOGLE",
  CLOUDINARY: "CLOUDINARY",
};

export const THINKING_LEVELS = {
  LOW: 0.2,
  MEDIUM: 0.5,
  HIGH: 0.8,
};

// Define different system instructions for different use cases
export const SYSTEM_INSTRUCTIONS = {
  activity_recommender: `You are a website usage assistant for a dance crew management system.
    Help users understand where to click, what each page does, and how to complete actions on the website.
    Give step-by-step instructions, keep guidance clear, practical, and easy to follow.`,

  content_generator: `You are a website usage assistant for a dance crew management system.
    Focus only on guiding users to use website features such as activities, tasks, chat, notifications, and profile settings.
    Do not generate creative content; provide actionable navigation and usage help.`,

  communication_helper: `You are a website usage assistant for a dance crew management system.
    Help users interact with website communication features like chat rooms, messages, and notifications.
    Explain usage steps clearly and keep responses concise and direct.`,

  task_planner: `You are a website usage assistant for a dance crew management system.
    Help users manage tasks on the website by explaining workflows, status updates, and assignment steps.
    Provide straightforward step-by-step instructions based on available web features.`,
};

export const ASSIGNEE_TASK_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
};

export const DEFAULT_PASSWORD = "WelcometoGDC22%^&";

export const SOCKET_EVENTS = {
  NOTIFICATION_SEND: "notification:send",
  NOTIFICATION_RECEIVE: "notification:receive",
  NOTIFICATION_READ: "notification:read",
  NOTIFICATION_SOFT_DELETE: "notification:softDelete",
  NOTIFICATION_HARD_DELETE: "notification:hardDelete",
  CHAT_MESSAGE_SEND: "chatMessage:send",
  CHAT_MESSAGE_RECEIVE: "chatMessage:receive",
  CHAT_MESSAGE_UPDATE: "chatMessage:update",
  CHAT_MESSAGE_SOFT_DELETE: "chatMessage:softDelete",
  CHAT_MESSAGE_HARD_DELETE: "chatMessage:hardDelete",
  USERS_ONLINE_STATUS_UPDATE: "usersOnlineStatus:update",
  CHAT_ROOM_JOIN: "chatRoom:join",
  CHAT_ROOM_LEAVE: "chatRoom:leave",
  USER_TYPING: "user:typing",
  USER_STOP_TYPING: "user:stopTyping",
  USER_ONLINE: "user:online",
};

export const ACTIVITY_PARTICIPATION_STATUS = {
  REGISTERED: "REGISTERED",
  CONFIRMED: "CONFIRMED",
  ATTENDED: "ATTENDED",
  ABSENT: "ABSENT",
  CANCELLED: "CANCELLED",
};

export const POSITION_NUMERIC_LEVEL = {
  MEMBER: 1,
  MIDDLE_VICE_HEAD: 2,
  MIDDLE_HEAD: 3,
  TOP_VICE_HEAD: 4,
  TOP_HEAD: 5,
};

export const MEMBER_APPLICATION_STATE = {
  SUBMITTED: "SUBMITTED",
  CV_PENDING: "CV_PENDING",
  CV_PASSED: "CV_PASSED",
  CV_FAILED: "CV_FAILED",
  DEPARTMENT_INTERVIEW_PENDING: "DEPARTMENT_INTERVIEW_PENDING",
  DEPARTMENT_INTERVIEW_PASSED: "DEPARTMENT_INTERVIEW_PASSED",
  DEPARTMENT_INTERVIEW_FAILED: "DEPARTMENT_INTERVIEW_FAILED",
  FINAL_PENDING: "FINAL_PENDING",
  FINAL_PASSED: "FINAL_PASSED",
  FINAL_FAILED: "FINAL_FAILED",
  WITHDRAWN: "WITHDRAWN",
};
