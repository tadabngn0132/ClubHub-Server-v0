import { INTERVIEW_STATUS } from "../utils/constant.js";

export const getInterviewStatus = (status) => {
  switch (status) {
    case "pending":
      return INTERVIEW_STATUS.PENDING;
    case "passed":
      return INTERVIEW_STATUS.PASSED;
    case "failed":
      return INTERVIEW_STATUS.FAILED;
    default:
      return INTERVIEW_STATUS.PENDING;
  }
};