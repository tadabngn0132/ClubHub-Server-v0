export const validateAuthentication = (req, res, next) => {
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

export const validateUserCreation = (req, res, next) => {
  const payload = req.body;

  if (!payload.email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
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
