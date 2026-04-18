import { POSITION_LEVEL, POSITION_NUMERIC_LEVEL } from "../utils/constant.js";

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

const getNumericPositionLevel = (level) => {
  const normalizedLevel = String(level || "");
  switch (normalizedLevel) {
    case POSITION_LEVEL.MEMBER:
      return POSITION_NUMERIC_LEVEL.MEMBER;
    case POSITION_LEVEL.MIDDLE_VICE_HEAD:
      return POSITION_NUMERIC_LEVEL.MIDDLE_VICE_HEAD;
    case POSITION_LEVEL.MIDDLE_HEAD:
      return POSITION_NUMERIC_LEVEL.MIDDLE_HEAD;
    case POSITION_LEVEL.TOP_VICE_HEAD:
      return POSITION_NUMERIC_LEVEL.TOP_VICE_HEAD;
    case POSITION_LEVEL.TOP_HEAD:
      return POSITION_NUMERIC_LEVEL.TOP_HEAD;
    default:
      return 0;
  }
};

export const getHighestPositionLevel = (positions) => {
  if (!positions || !Array.isArray(positions) || positions.length === 0) {
    return null;
  }

  const sortedUserPositions = positions
    .filter((p) => p?.id && p?.level)
    .sort(
      (a, b) =>
        getNumericPositionLevel(b.level) - getNumericPositionLevel(a.level),
    );

  return sortedUserPositions[0]?.id || null;
};
