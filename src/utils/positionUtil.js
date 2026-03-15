import { POSITION_LEVEL } from "../utils/constant.js";

export const getPositionLevel = (level) => {
  switch (level) {
    case "member":
      return POSITION_LEVEL.MEMBER;
    case "middle_vice_head":
      return POSITION_LEVEL.MIDDLE_VICE_HEAD;
    case "middle_head":
      return POSITION_LEVEL.MIDDLE_HEAD;
    case "top_vice_head":
      return POSITION_LEVEL.TOP_VICE_HEAD;
    case "top_head":
      return POSITION_LEVEL.TOP_HEAD;
    default:
      return POSITION_LEVEL.MEMBER;
  }
};