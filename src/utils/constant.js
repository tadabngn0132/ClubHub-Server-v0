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
    position: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
    },
    department: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
    },
    memberApplications: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true,
    },
    departmentApplications: {
      create: true,
      read: true,
      update: true,
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
    position: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    department: {
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
      softDelete: false,
      hardDelete: false,
    },
    departmentApplications: {
      create: true,
      read: true,
      update: true,
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
    position: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    department: {
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
      softDelete: false,
      hardDelete: false,
    },
    departmentApplications: {
      create: false,
      read: false,
      update: false,
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
    position: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false,
    },
    department: {
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
      softDelete: false,
      hardDelete: false,
    },
    departmentApplications: {
      create: false,
      read: false,
      update: false,
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
