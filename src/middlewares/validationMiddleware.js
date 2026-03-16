export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

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

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password cannot be empty",
    });
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

  next();
};

export const validateUserCreation = (req, res, next) => {
  const payload = req.body;

  if (!payload.email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  } else if (!/^[A-Za-z0-9]+@fpt\.edu\.vn$/.test(payload.email)) {
    return res.status(400).json({
      success: false,
      message: "Email must be Example123456@fpt.edu.vn",
    });
  }

  if (!payload.fullname) {
    return res.status(400).json({
      success: false,
      message: "Full name is required",
    });
  }

  if (!payload.status) {
    return res.status(400).json({
      success: false,
      message: "Status is required",
    });
  }

  if (!payload.positionId) {
    return res.status(400).json({
      success: false,
      message: "Position ID is required",
    });
  }

  next();
};

export const validateUserUpdate = (req, res, next) => {
  const { id } = req.params;
  const payload = req.body;

  if (!payload.email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  } else if (!/^[A-Za-z0-9]+@fpt\.edu\.vn$/.test(payload.email)) {
    return res.status(400).json({
      success: false,
      message: "Email must be Example123456@fpt.edu.vn",
    });
  }

  if (!payload.fullname) {
    return res.status(400).json({
      success: false,
      message: "Full name is required",
    });
  }

  if (!payload.status) {
    return res.status(400).json({
      success: false,
      message: "Status is required",
    });
  }

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  if (!payload.positionId) {
    return res.status(400).json({
      success: false,
      message: "Position ID is required",
    });
  }

  next();
};

export const validateActivityCreation = (req, res, next) => {
  const payload = req.body;

  if (!payload.title) {
    return res.status(400).json({
      success: false,
      message: "Activity title is required",
    });
  }

  if (!payload.description) {
    return res.status(400).json({
      success: false,
      message: "Activity description is required",
    });
  }

  if (!payload.startDate) {
    return res.status(400).json({
      success: false,
      message: "Activity start date is required",
    });
  }

  if (!payload.endDate) {
    return res.status(400).json({
      success: false,
      message: "Activity end date is required",
    });
  }

  if (!payload.locationType) {
    return res.status(400).json({
      success: false,
      message: "Activity location type is required",
    });
  }

  if (!payload.type) {
    return res.status(400).json({
      success: false,
      message: "Activity type is required",
    });
  }

  if (!payload.status) {
    return res.status(400).json({
      success: false,
      message: "Activity status is required",
    });
  }

  next();
};

export const validateActivityUpdate = (req, res, next) => {
  const { id } = req.params;
  const payload = req.body;

  if (!payload.title) {
    return res.status(400).json({
      success: false,
      message: "Activity title is required",
    });
  }

  if (!payload.description) {
    return res.status(400).json({
      success: false,
      message: "Activity description is required",
    });
  }

  if (!payload.startDate) {
    return res.status(400).json({
      success: false,
      message: "Activity start date is required",
    });
  }

  if (!payload.endDate) {
    return res.status(400).json({
      success: false,
      message: "Activity end date is required",
    });
  }

  if (!payload.locationType) {
    return res.status(400).json({
      success: false,
      message: "Activity location type is required",
    });
  }

  if (!payload.type) {
    return res.status(400).json({
      success: false,
      message: "Activity type is required",
    });
  }

  if (!payload.status) {
    return res.status(400).json({
      success: false,
      message: "Activity status is required",
    });
  }

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Activity ID is required",
    });
  }

  next();
};

export const validateTaskCreation = (req, res, next) => {
  const payload = req.body;

  if (!payload.title) {
    return res.status(400).json({
      success: false,
      message: "Task title is required",
    });
  }

  if (!payload.assignorId) {
    return res.status(400).json({
      success: false,
      message: "Assignor user ID is required",
    });
  }

  if (!payload.assigneeScope) {
    return res.status(400).json({
      success: false,
      message: "Assignee scope is required",
    });
  }

  if (!payload.isCheckCf) {
    return res.status(400).json({
      success: false,
      message: "isCheckCf field is required",
    });
  }

  next();
};

export const validateTaskUpdate = (req, res, next) => {
  const { id } = req.params;
  const payload = req.body;

  if (!payload.title) {
    return res.status(400).json({
      success: false,
      message: "Task title is required",
    });
  }

  if (!payload.assignorId) {
    return res.status(400).json({
      success: false,
      message: "Assignor user ID is required",
    });
  }

  if (!payload.assigneeScope) {
    return res.status(400).json({
      success: false,
      message: "Assignee scope is required",
    });
  }

  if (!payload.isCheckCf) {
    return res.status(400).json({
      success: false,
      message: "isCheckCf field is required",
    });
  }

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Task ID is required",
    });
  }

  next();
};

export const validatePositionCreation = (req, res, next) => {
  const payload = req.body;

  if (!payload.title) {
    return res.status(400).json({
      success: false,
      message: "Position title is required",
    });
  }

  if (!payload.departmentId) {
    return res.status(400).json({
      success: false,
      message: "Department ID is required",
    });
  }

  if (!payload.level) {
    return res.status(400).json({
      success: false,
      message: "Position level is required",
    });
  }

  if (!payload.systemRole) {
    return res.status(400).json({
      success: false,
      message: "System role is required",
    });
  }

  next();
};

export const validatePositionUpdate = (req, res, next) => {
  const { id } = req.params;
  const payload = req.body;

  if (!payload.title) {
    return res.status(400).json({
      success: false,
      message: "Position title is required",
    });
  }

  if (!payload.departmentId) {
    return res.status(400).json({
      success: false,
      message: "Department ID is required",
    });
  }

  if (!payload.level) {
    return res.status(400).json({
      success: false,
      message: "Position level is required",
    });
  }

  if (!payload.systemRole) {
    return res.status(400).json({
      success: false,
      message: "System role is required",
    });
  }

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Position ID is required",
    });
  }

  next();
};

export const validateDepartmentCreation = (req, res, next) => {
  const payload = req.body;

  if (!payload.name) {
    return res.status(400).json({
      success: false,
      message: "Department name is required",
    });
  }

  if (!payload.description) {
    return res.status(400).json({
      success: false,
      message: "Department description is required",
    });
  }

  next();
};

export const validateDepartmentUpdate = (req, res, next) => {
  const { id } = req.params;
  const payload = req.body;

  if (!payload.name) {
    return res.status(400).json({
      success: false,
      message: "Department name is required",
    });
  }

  if (!payload.description) {
    return res.status(400).json({
      success: false,
      message: "Department description is required",
    });
  }

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Department ID is required",
    });
  }

  next();
};

export const validateMemberApplicationCreation = (req, res, next) => {
  const payload = req.body;

  if (!payload.fullname) {
    return res.status(400).json({
      success: false,
      message: "Full name is required",
    });
  }

  if (!payload.email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  } else if (!/^[A-Za-z0-9]+@fpt\.edu\.vn$/.test(payload.email)) {
    return res.status(400).json({
      success: false,
      message: "Email must be a valid FPT University email address",
    });
  }

  if (!payload.gender) {
    return res.status(400).json({
      success: false,
      message: "Gender is required",
    });
  }

  if (!payload.major) {
    return res.status(400).json({
      success: false,
      message: "Major is required",
    });
  }

  if (!payload.studentId) {
    return res.status(400).json({
      success: false,
      message: "Student ID is required",
    });
  }

  next();
};

export const validateMemberApplicationCVReviewUpdate = (req, res, next) => {
  const { id } = req.params;
  const payload = req.body;

  if (!payload.cvReviewStatus) {
    return res.status(400).json({
      success: false,
      message: "CV review status is required",
    });
  }

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Member application ID is required",
    });
  }

  next();
};

export const validateMemberApplicationFinalReviewUpdate = (req, res, next) => {
  const { id } = req.params;
  const payload = req.body;

  if (!payload.finalReviewStatus) {
    return res.status(400).json({
      success: false,
      message: "Final review status is required",
    });
  }

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Member application ID is required",
    });
  }

  next();
};

export const validateDepartmentApplicationCreation = (req, res, next) => {
  const payload = req.body;

  if (!payload.memberApplicationId) {
    return res.status(400).json({
      success: false,
      message: "Member application ID is required",
    });
  }

  if (!payload.departmentId) {
    return res.status(400).json({
      success: false,
      message: "Department ID is required",
    });
  }

  if (!payload.interviewStatus) {
    return res.status(400).json({
      success: false,
      message: "Interview status is required",
    });
  }

  if (!payload.priority) {
    return res.status(400).json({
      success: false,
      message: "Priority is required",
    });
  }

  next();
};

export const validateDepartmentApplicationUpdate = (req, res, next) => {
  const { id } = req.params;
  const payload = req.body;

  if (!payload.memberApplicationId) {
    return res.status(400).json({
      success: false,
      message: "Member application ID is required",
    });
  }

  if (!payload.departmentId) {
    return res.status(400).json({
      success: false,
      message: "Department ID is required",
    });
  }

  if (!payload.interviewStatus) {
    return res.status(400).json({
      success: false,
      message: "Interview status is required",
    });
  }

  if (!payload.priority) {
    return res.status(400).json({
      success: false,
      message: "Priority is required",
    });
  }

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Department application ID is required",
    });
  }

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
