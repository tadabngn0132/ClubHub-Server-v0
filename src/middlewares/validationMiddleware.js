const FPT_EMAIL_REGEX = /^[A-Za-z0-9]+@fpt\.edu\.vn$/;
const PHONE_NUMBER_REGEX = /^0\d{9}$/;
const STUDENT_ID_REGEX = /^[A-Za-z]{2}[A-Za-z0-9]{6,10}$/;
const URL_REGEX = /^https?:\/\//i;

const USER_STATUS_VALUES = ["ACTIVE", "INACTIVE"];
const ACTIVITY_TYPE_VALUES = [
  "MEETING",
  "WORKSHOP",
  "TRAINING",
  "PERFORMANCE",
  "COMPETITION",
  "SOCIAL",
  "VOLUNTEER",
];
const ACTIVITY_STATUS_VALUES = [
  "DRAFT",
  "PUBLISHED",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
  "POSTPONED",
];
const REVIEW_STATUS_VALUES = ["PASSED", "FAILED"];
const INTERVIEW_STATUS_VALUES = [
  "PENDING",
  "SCHEDULED",
  "INTERVIEWED",
  "PASSED",
  "FAILED",
];
const POSITION_LEVEL_VALUES = [
  "MEMBER",
  "MIDDLE_VICE_HEAD",
  "MIDDLE_HEAD",
  "TOP_VICE_HEAD",
  "TOP_HEAD",
];
const BOOLEAN_STRINGS = ["true", "false"];

const isEmpty = (value) =>
  value === undefined || value === null || String(value).trim() === "";
const getNormalized = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/-/g, "_");
const isPositiveIntegerLike = (value) =>
  Number.isInteger(Number(value)) && Number(value) > 0;
const isBooleanLike = (value) =>
  typeof value === "boolean" ||
  (typeof value === "string" && BOOLEAN_STRINGS.includes(value.toLowerCase()));
const isValidDateLike = (value) => !Number.isNaN(new Date(value).getTime());
const failValidation = (res, message) =>
  res.status(400).json({
    success: false,
    message,
  });
const getRouteId = (req) =>
  req.params?.id ||
  req.params?.taskId ||
  req.params?.activityId ||
  req.params?.userId;

export const validateLogin = (req, res, next) => {
  const { email, password, rememberMe, rememberForDays } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email cannot be empty",
    });
  } else if (!FPT_EMAIL_REGEX.test(email)) {
    return failValidation(res, "Email must be Example123456@fpt.edu.vn");
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password cannot be empty",
    });
  }

  if (rememberMe !== undefined && typeof rememberMe !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "rememberMe must be a boolean",
    });
  }

  if (rememberForDays !== undefined) {
    const parsedRememberDays = Number(rememberForDays);
    if (![1, 7, 30].includes(parsedRememberDays)) {
      return res.status(400).json({
        success: false,
        message: "rememberForDays must be one of: 1, 7, 30",
      });
    }
  }

  next();
};

export const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email cannot be empty",
    });
  } else if (!/^[A-Za-z0-9]+@fpt\.edu\.vn$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Email must be Example123456@fpt.edu.vn",
    });
  }

  next();
};

export const validateResetPassword = (req, res, next) => {
  const { newPassword } = req.body;
  const { token, email } = req.query;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is required",
    });
  }

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  } else if (!/^[A-Za-z0-9]+@fpt\.edu\.vn$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Email must be Example123456@fpt.edu.vn",
    });
  }

  if (!newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password is required",
    });
  }

  if (String(newPassword).length < 8) {
    return failValidation(res, "New password must be at least 8 characters");
  }

  next();
};

export const validateChangePassword = (req, res, next) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  } else if (!/^[A-Za-z0-9]+@fpt\.edu\.vn$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Email must be Example123456@fpt.edu.vn",
    });
  }

  if (!currentPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password is required",
    });
  }

  if (!newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password is required",
    });
  }

  if (String(currentPassword).length < 8 || String(newPassword).length < 8) {
    return failValidation(res, "Passwords must be at least 8 characters");
  }

  next();
};

export const validateUserCreation = (req, res, next) => {
  const payload = req.body;

  if (isEmpty(payload.email)) return failValidation(res, "Email is required");
  if (!FPT_EMAIL_REGEX.test(payload.email))
    return failValidation(res, "Email must be Example123456@fpt.edu.vn");
  if (isEmpty(payload.fullname) || String(payload.fullname).trim().length < 2) {
    return failValidation(res, "Full name must contain at least 2 characters");
  }
  if (isEmpty(payload.status)) return failValidation(res, "Status is required");
  if (!USER_STATUS_VALUES.includes(getNormalized(payload.status))) {
    return failValidation(res, "Status must be ACTIVE or INACTIVE");
  }
  if (!isPositiveIntegerLike(payload.positionId))
    return failValidation(res, "Position ID is required");
  if (
    !isEmpty(payload.phoneNumber) &&
    !PHONE_NUMBER_REGEX.test(String(payload.phoneNumber).trim())
  ) {
    return failValidation(
      res,
      "Phone number must be 10 digits and start with 0",
    );
  }
  if (
    !isEmpty(payload.studentId) &&
    !STUDENT_ID_REGEX.test(String(payload.studentId).trim())
  ) {
    return failValidation(res, "Student ID format is invalid");
  }

  next();
};

export const validateUserUpdate = (req, res, next) => {
  const id = getRouteId(req);
  const payload = req.body;

  if (!isPositiveIntegerLike(id))
    return failValidation(res, "User ID is required");
  if (isEmpty(payload.email)) return failValidation(res, "Email is required");
  if (!FPT_EMAIL_REGEX.test(payload.email))
    return failValidation(res, "Email must be Example123456@fpt.edu.vn");
  if (isEmpty(payload.fullname) || String(payload.fullname).trim().length < 2) {
    return failValidation(res, "Full name must contain at least 2 characters");
  }
  if (isEmpty(payload.status)) return failValidation(res, "Status is required");
  if (!USER_STATUS_VALUES.includes(getNormalized(payload.status))) {
    return failValidation(res, "Status must be ACTIVE or INACTIVE");
  }
  if (!isPositiveIntegerLike(payload.positionId))
    return failValidation(res, "Position ID is required");
  if (
    !isEmpty(payload.phoneNumber) &&
    !PHONE_NUMBER_REGEX.test(String(payload.phoneNumber).trim())
  ) {
    return failValidation(
      res,
      "Phone number must be 10 digits and start with 0",
    );
  }

  next();
};

export const validateUserProfileUpdate = (req, res, next) => {
  const id = getRouteId(req);
  const payload = req.body;

  if (!isPositiveIntegerLike(id))
    return failValidation(res, "User ID is required");
  if (isEmpty(payload.fullname) || String(payload.fullname).trim().length < 2) {
    return failValidation(res, "Full name must contain at least 2 characters");
  }
  if (
    !isEmpty(payload.phoneNumber) &&
    !PHONE_NUMBER_REGEX.test(String(payload.phoneNumber).trim())
  ) {
    return failValidation(
      res,
      "Phone number must be 10 digits and start with 0",
    );
  }
  if (
    !isEmpty(payload.studentId) &&
    !STUDENT_ID_REGEX.test(String(payload.studentId).trim())
  ) {
    return failValidation(res, "Student ID format is invalid");
  }
  next();
};

export const validateActivityCreation = (req, res, next) => {
  const payload = req.body;

  if (isEmpty(payload.title) || String(payload.title).trim().length < 3) {
    return failValidation(
      res,
      "Activity title must contain at least 3 characters",
    );
  }
  if (
    isEmpty(payload.description) ||
    String(payload.description).trim().length < 10
  ) {
    return failValidation(
      res,
      "Activity description must contain at least 10 characters",
    );
  }
  if (isEmpty(payload.startDate) || !isValidDateLike(payload.startDate)) {
    return failValidation(res, "Activity start date is required");
  }
  if (isEmpty(payload.endDate) || !isValidDateLike(payload.endDate)) {
    return failValidation(res, "Activity end date is required");
  }
  if (
    new Date(payload.endDate).getTime() <= new Date(payload.startDate).getTime()
  ) {
    return failValidation(
      res,
      "Activity end date must be greater than start date",
    );
  }
  if (isEmpty(payload.locationType))
    return failValidation(res, "Activity location type is required");
  if (isEmpty(payload.type))
    return failValidation(res, "Activity type is required");
  if (isEmpty(payload.status))
    return failValidation(res, "Activity status is required");

  const locationType = String(payload.locationType).trim().toLowerCase();
  if (!["online", "in_person", "hybrid"].includes(locationType)) {
    return failValidation(
      res,
      "Location type must be online, in_person, or hybrid",
    );
  }
  if (!ACTIVITY_TYPE_VALUES.includes(getNormalized(payload.type))) {
    return failValidation(res, "Activity type is invalid");
  }
  if (!ACTIVITY_STATUS_VALUES.includes(getNormalized(payload.status))) {
    return failValidation(res, "Activity status is invalid");
  }

  if (["online", "hybrid"].includes(locationType)) {
    if (isEmpty(payload.meetingPlatform))
      return failValidation(res, "Meeting platform is required");
    if (
      isEmpty(payload.meetingLink) ||
      !URL_REGEX.test(String(payload.meetingLink).trim())
    ) {
      return failValidation(res, "Meeting link must be a valid URL");
    }
  }

  if (["in_person", "hybrid"].includes(locationType)) {
    if (isEmpty(payload.venueName))
      return failValidation(res, "Venue name is required");
    if (isEmpty(payload.venueAddress))
      return failValidation(res, "Venue address is required");
  }

  next();
};

export const validateActivityUpdate = (req, res, next) => {
  const id = getRouteId(req);
  const payload = req.body;

  if (!isPositiveIntegerLike(id))
    return failValidation(res, "Activity ID is required");
  if (isEmpty(payload.title) || String(payload.title).trim().length < 3) {
    return failValidation(
      res,
      "Activity title must contain at least 3 characters",
    );
  }
  if (
    isEmpty(payload.description) ||
    String(payload.description).trim().length < 10
  ) {
    return failValidation(
      res,
      "Activity description must contain at least 10 characters",
    );
  }
  if (isEmpty(payload.startDate) || !isValidDateLike(payload.startDate)) {
    return failValidation(res, "Activity start date is required");
  }
  if (isEmpty(payload.endDate) || !isValidDateLike(payload.endDate)) {
    return failValidation(res, "Activity end date is required");
  }
  if (
    new Date(payload.endDate).getTime() <= new Date(payload.startDate).getTime()
  ) {
    return failValidation(
      res,
      "Activity end date must be greater than start date",
    );
  }
  if (isEmpty(payload.locationType))
    return failValidation(res, "Activity location type is required");
  if (isEmpty(payload.type))
    return failValidation(res, "Activity type is required");
  if (isEmpty(payload.status))
    return failValidation(res, "Activity status is required");

  const locationType = String(payload.locationType).trim().toLowerCase();
  if (!["online", "in_person", "hybrid"].includes(locationType)) {
    return failValidation(
      res,
      "Location type must be online, in_person, or hybrid",
    );
  }
  if (!ACTIVITY_TYPE_VALUES.includes(getNormalized(payload.type))) {
    return failValidation(res, "Activity type is invalid");
  }
  if (!ACTIVITY_STATUS_VALUES.includes(getNormalized(payload.status))) {
    return failValidation(res, "Activity status is invalid");
  }

  next();
};

const hasAtLeastOneTarget = (target) => {
  if (!target || typeof target !== "object") return false;
  const hasAllClub = target.allClub === true;
  const hasDepartments =
    Array.isArray(target.departmentIds) && target.departmentIds.length > 0;
  const hasUsers = Array.isArray(target.userIds) && target.userIds.length > 0;
  return hasAllClub || hasDepartments || hasUsers;
};

export const validateTaskCreation = (req, res, next) => {
  const payload = req.body;

  if (isEmpty(payload.title) || String(payload.title).trim().length < 3) {
    return failValidation(res, "Task title must contain at least 3 characters");
  }
  if (!isPositiveIntegerLike(payload.assignorId))
    return failValidation(res, "Assignor user ID is required");
  if (isEmpty(payload.assigneeScope))
    return failValidation(res, "Assignee scope is required");
  if (payload.isCheckCf === undefined || !isBooleanLike(payload.isCheckCf)) {
    return failValidation(res, "isCheckCf field must be a boolean");
  }
  if (!isEmpty(payload.status)) {
    const taskStatus = getNormalized(payload.status);
    if (
      !["NEW", "IN_PROGRESS", "DONE", "CANCELLED", "ON_HOLD"].includes(
        taskStatus,
      )
    ) {
      return failValidation(res, "Task status is invalid");
    }
  }

  if (!hasAtLeastOneTarget(payload.target || payload)) {
    return failValidation(
      res,
      "At least one target (allClub, departmentIds, or userIds) must be specified",
    );
  }

  next();
};

export const validateTaskUpdate = (req, res, next) => {
  const id = req.params?.taskId || req.params?.id;
  const payload = req.body;

  if (!isPositiveIntegerLike(id))
    return failValidation(res, "Task ID is required");
  if (isEmpty(payload.title) || String(payload.title).trim().length < 3) {
    return failValidation(res, "Task title must contain at least 3 characters");
  }
  if (!isPositiveIntegerLike(payload.assignorId))
    return failValidation(res, "Assignor user ID is required");
  if (isEmpty(payload.assigneeScope))
    return failValidation(res, "Assignee scope is required");
  if (payload.isCheckCf === undefined || !isBooleanLike(payload.isCheckCf)) {
    return failValidation(res, "isCheckCf field must be a boolean");
  }
  if (!isEmpty(payload.status)) {
    const taskStatus = getNormalized(payload.status);
    if (
      !["NEW", "IN_PROGRESS", "DONE", "CANCELLED", "ON_HOLD"].includes(
        taskStatus,
      )
    ) {
      return failValidation(res, "Task status is invalid");
    }
  }

  if (!hasAtLeastOneTarget(payload.target || payload)) {
    return res.status(400).json({
      success: false,
      message:
        "At least one target (allClub, departmentIds, or userIds) must be specified",
    });
  }

  next();
};

export const validatePositionCreation = (req, res, next) => {
  const payload = req.body;

  if (isEmpty(payload.title) || String(payload.title).trim().length < 2) {
    return failValidation(res, "Position title is required");
  }
  if (!isPositiveIntegerLike(payload.departmentId))
    return failValidation(res, "Department ID is required");
  if (isEmpty(payload.level))
    return failValidation(res, "Position level is required");
  if (isEmpty(payload.systemRole))
    return failValidation(res, "System role is required");
  if (!POSITION_LEVEL_VALUES.includes(getNormalized(payload.level))) {
    return failValidation(res, "Position level is invalid");
  }

  next();
};

export const validatePositionUpdate = (req, res, next) => {
  const id = getRouteId(req);
  const payload = req.body;

  if (!isPositiveIntegerLike(id))
    return failValidation(res, "Position ID is required");
  if (isEmpty(payload.title) || String(payload.title).trim().length < 2) {
    return failValidation(res, "Position title is required");
  }
  if (!isPositiveIntegerLike(payload.departmentId))
    return failValidation(res, "Department ID is required");
  if (isEmpty(payload.level))
    return failValidation(res, "Position level is required");
  if (isEmpty(payload.systemRole))
    return failValidation(res, "System role is required");
  if (!POSITION_LEVEL_VALUES.includes(getNormalized(payload.level))) {
    return failValidation(res, "Position level is invalid");
  }

  next();
};

export const validateDepartmentCreation = (req, res, next) => {
  const payload = req.body;

  if (isEmpty(payload.name) || String(payload.name).trim().length < 2) {
    return failValidation(res, "Department name is required");
  }
  if (
    isEmpty(payload.description) ||
    String(payload.description).trim().length < 10
  ) {
    return failValidation(res, "Department description is required");
  }

  next();
};

export const validateDepartmentUpdate = (req, res, next) => {
  const id = getRouteId(req);
  const payload = req.body;

  if (!isPositiveIntegerLike(id))
    return failValidation(res, "Department ID is required");
  if (isEmpty(payload.name) || String(payload.name).trim().length < 2) {
    return failValidation(res, "Department name is required");
  }
  if (
    isEmpty(payload.description) ||
    String(payload.description).trim().length < 10
  ) {
    return failValidation(res, "Department description is required");
  }

  next();
};

export const validateMemberApplicationCreation = (req, res, next) => {
  const payload = req.body;

  if (isEmpty(payload.fullname) || String(payload.fullname).trim().length < 2) {
    return failValidation(res, "Full name is required");
  }
  if (isEmpty(payload.email)) return failValidation(res, "Email is required");
  if (!FPT_EMAIL_REGEX.test(payload.email)) {
    return failValidation(
      res,
      "Email must be a valid FPT University email address",
    );
  }
  if (
    isEmpty(payload.phoneNumber) ||
    !PHONE_NUMBER_REGEX.test(String(payload.phoneNumber).trim())
  ) {
    return failValidation(
      res,
      "Phone number must be 10 digits and start with 0",
    );
  }
  if (isEmpty(payload.dateOfBirth) || !isValidDateLike(payload.dateOfBirth)) {
    return failValidation(res, "Date of birth is required");
  }
  if (new Date(payload.dateOfBirth).getTime() > Date.now()) {
    return failValidation(res, "Date of birth cannot be in the future");
  }
  if (isEmpty(payload.gender)) return failValidation(res, "Gender is required");
  if (
    !["male", "female", "other"].includes(
      String(payload.gender).trim().toLowerCase(),
    )
  ) {
    return failValidation(res, "Gender is invalid");
  }
  if (isEmpty(payload.major) || String(payload.major).trim().length < 2)
    return failValidation(res, "Major is required");
  if (isEmpty(payload.studentId))
    return failValidation(res, "Student ID is required");
  if (!STUDENT_ID_REGEX.test(String(payload.studentId).trim())) {
    return failValidation(res, "Student ID format is invalid");
  }

  next();
};

export const validateMemberApplicationCVReviewUpdate = (req, res, next) => {
  const id = getRouteId(req);
  const payload = req.body;

  if (!isPositiveIntegerLike(id))
    return failValidation(res, "Member application ID is required");
  if (isEmpty(payload.cvReviewStatus))
    return failValidation(res, "CV review status is required");
  if (!REVIEW_STATUS_VALUES.includes(getNormalized(payload.cvReviewStatus))) {
    return failValidation(res, "CV review status must be PASSED or FAILED");
  }
  if (isEmpty(payload.cvReviewComment)) {
    return failValidation(res, "CV review comment is required");
  }

  next();
};

export const validateMemberApplicationFinalReviewUpdate = (req, res, next) => {
  const id = getRouteId(req);
  const payload = req.body;

  if (!isPositiveIntegerLike(id))
    return failValidation(res, "Member application ID is required");
  if (isEmpty(payload.finalReviewStatus))
    return failValidation(res, "Final review status is required");
  if (
    !REVIEW_STATUS_VALUES.includes(getNormalized(payload.finalReviewStatus))
  ) {
    return failValidation(res, "Final review status must be PASSED or FAILED");
  }
  if (isEmpty(payload.finalReviewComment)) {
    return failValidation(res, "Final review comment is required");
  }

  next();
};

export const validateDepartmentApplicationCreation = (req, res, next) => {
  const payload = req.body;

  if (!isPositiveIntegerLike(payload.memberApplicationId))
    return failValidation(res, "Member application ID is required");
  if (!isPositiveIntegerLike(payload.departmentId))
    return failValidation(res, "Department ID is required");
  if (isEmpty(payload.interviewStatus))
    return failValidation(res, "Interview status is required");
  if (
    !INTERVIEW_STATUS_VALUES.includes(getNormalized(payload.interviewStatus))
  ) {
    return failValidation(res, "Interview status is invalid");
  }
  if (!isPositiveIntegerLike(payload.priority))
    return failValidation(res, "Priority is required");

  next();
};

export const validateDepartmentApplicationUpdate = (req, res, next) => {
  const id = getRouteId(req);
  const payload = req.body;

  if (!isPositiveIntegerLike(id))
    return failValidation(res, "Department application ID is required");
  if (!isPositiveIntegerLike(payload.memberApplicationId))
    return failValidation(res, "Member application ID is required");
  if (!isPositiveIntegerLike(payload.departmentId))
    return failValidation(res, "Department ID is required");
  if (isEmpty(payload.interviewStatus))
    return failValidation(res, "Interview status is required");
  if (
    !INTERVIEW_STATUS_VALUES.includes(getNormalized(payload.interviewStatus))
  ) {
    return failValidation(res, "Interview status is invalid");
  }
  if (!isPositiveIntegerLike(payload.priority))
    return failValidation(res, "Priority is required");

  next();
};

export const validateActivityParticipationCreation = (req, res, next) => {
  const payload = req.body;

  if (!payload.activityId) {
    return res.status(400).json({
      success: false,
      message: "Activity ID is required",
    });
  }

  if (!payload.userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  next();
};

export const validateActivityParticipationUpdate = (req, res, next) => {
  const { id } = req.params;
  const payload = req.body;

  if (!payload.activityId) {
    return res.status(400).json({
      success: false,
      message: "Activity ID is required",
    });
  }

  if (!payload.userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Participation ID is required",
    });
  }

  next();
};

export const validateNotificationCreation = (req, res, next) => {
  const payload = req.body;

  if (!payload.userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  if (!payload.message) {
    return res.status(400).json({
      success: false,
      message: "Notification message is required",
    });
  }

  next();
};

export const validateNotificationUpdate = (req, res, next) => {
  const { id } = req.params;
  const payload = req.body;

  if (!payload.userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  if (!payload.message) {
    return res.status(400).json({
      success: false,
      message: "Notification message is required",
    });
  }

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Notification ID is required",
    });
  }

  next();
};

export const validateChatRoomCreation = (req, res, next) => {
  const payload = req.body;

  if (String(payload.name).trim().length < 3) {
    return failValidation(
      res,
      "Chat room name must contain at least 3 characters",
    );
  }

  next();
};

export const validateChatRoomUpdate = (req, res, next) => {
  const { id } = req.params;
  const payload = req.body;

  if (String(payload.name).trim().length < 3) {
    return failValidation(
      res,
      "Chat room name must contain at least 3 characters",
    );
  }

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Chat room ID is required",
    });
  }

  next();
};
