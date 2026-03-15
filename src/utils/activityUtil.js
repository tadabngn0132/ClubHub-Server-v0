import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  PARTICIPATION_STATUS,
} from "../utils/constant.js";

export const getActivityStatus = (status) => {
  switch (status) {
    case "draft":
      return ACTIVITY_STATUS.DRAFT;
    case "published":
      return ACTIVITY_STATUS.PUBLISHED;
    case "ongoing":
      return ACTIVITY_STATUS.ONGOING;
    case "completed":
      return ACTIVITY_STATUS.COMPLETED;
    case "cancelled":
      return ACTIVITY_STATUS.CANCELLED;
    case "postponed":
      return ACTIVITY_STATUS.POSTPONED;
    default:
      return ACTIVITY_STATUS.DRAFT;
  }
};

export const getActivityType = (type) => {
  switch (type) {
    case "meeting":
      return ACTIVITY_TYPE.MEETING;
    case "workshop":
      return ACTIVITY_TYPE.WORKSHOP;
    case "training":
      return ACTIVITY_TYPE.TRAINING;
    case "performance":
      return ACTIVITY_TYPE.PERFORMANCE;
    case "competition":
      return ACTIVITY_TYPE.COMPETITION;
    case "social":
      return ACTIVITY_TYPE.SOCIAL;
    case "volunteer":
      return ACTIVITY_TYPE.VOLUNTEER;
    default:
      return ACTIVITY_TYPE.MEETING;
  }
};

export const getParticipationStatus = (status) => {
  switch (status) {
    case "registered":
      return PARTICIPATION_STATUS.REGISTERED;
    case "confirmed":
      return PARTICIPATION_STATUS.CONFIRMED;
    case "attended":
      return PARTICIPATION_STATUS.ATTENDED;
    case "absent":
      return PARTICIPATION_STATUS.ABSENT;
    case "cancelled":
      return PARTICIPATION_STATUS.CANCELLED;
    default:
      return PARTICIPATION_STATUS.REGISTERED;
  }
};
