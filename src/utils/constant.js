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
      delete: true,
    },
    activities: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
      delete: true,
    },
    tasks: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
      delete: true,
    },
    positions: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
      delete: true,
    },
    departments: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
      delete: true,
    },
    memberApplications: {
      create: true,
      read: true,
      update: true,
      cvReview: true,
      finalReview: true,
      createUserFromApplication: true,
      softDelete: true,
      hardDelete: true,
      delete: true,
    },
    departmentApplications: {
      create: true,
      read: true,
      update: true,
      interviewReview: true,
      softDelete: true,
      hardDelete: true,
      delete: true,
    },
    notifications: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
      delete: true,
    },
    activityParticipants: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
      delete: true,
    },
    activityParticipations: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
      delete: true,
    },
    messages: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
      delete: true,
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
      delete: true,
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
  },
};

export const ASSIGNEE_SCOPE = {
  ALL: "ALL",
  COMMUNICATION_DEPT: "COMMUNICATION_DEPT",
  DESIGN_DEPT: "DESIGN_DEPT",
  CONTENT_DEPT: "CONTENT_DEPT",
  LOGISTICS_DEPT: "LOGISTICS_DEPT",
  HUMAN_RESOURCES_DEPT: "HUMAN_RESOURCES_DEPT",
  EXPERT_COMMITTEE_DEPT: "EXPERT_COMMITTEE_DEPT",
  MEDIA_DEPT: "MEDIA_DEPT",
};

export const AVATAR_PROVIDERS = {
  GOOGLE: "GOOGLE",
  CLOUDINARY: "CLOUDINARY",
};

export const SOCKET_EVENTS = {
  // User events
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USERS_ONLINE_STATUS: 'users:online-status',

  // Message events
  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
  MESSAGE_DELETE: 'message:delete',
  MESSAGE_SENT: 'message:sent',
  MESSAGE_DELETED: 'message:deleted',
  MESSAGE_ERROR: 'message:error',

  // Typing events
  USER_TYPING: 'user:typing',
  USER_STOP_TYPING: 'user:stop-typing',

  // Notification events
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_RECEIVE: 'notification:receive',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_DELETE: 'notification:delete',
};

export const THINKING_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

// Define different system instructions for different use cases
export const SYSTEM_INSTRUCTIONS = {
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
