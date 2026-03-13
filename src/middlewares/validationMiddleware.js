export const validateAuthentication = (req, res, next) => {
  const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email cannot be empty'
        })
    } else if (!/^[A-Za-z0-9]+@fpt\.edu\.vn$/.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Email must be Example123456@fpt.edu.vn'
        })
    }

    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'Password cannot be empty'
        })
    }

    next();
}

export const validateUserCreation = (req, res, next) => {
  const payload = req.body;

    if (!payload.email || !payload.fullname || !payload.positionId) {
      return res.status(400).json({
        success: false,
        message: "Email, fullname and positionId are required",
      });
    }

    const email = String(payload.email).trim().toLowerCase();
    const fullname = String(payload.fullname).trim();
    const positionId = Number(payload.positionId);
    const generation =
      payload.generation !== undefined && payload.generation !== null
        ? Number(payload.generation)
        : null;
    const rootDepartmentId =
      payload.rootDepartmentId !== undefined && payload.rootDepartmentId !== null
        ? Number(payload.rootDepartmentId)
        : null;

    if (Number.isNaN(positionId)) {
      return res.status(400).json({
        success: false,
        message: "positionId must be a valid number",
      });
    }

    if (generation !== null && Number.isNaN(generation)) {
      return res.status(400).json({
        success: false,
        message: "generation must be a valid number",
      });
    }

    if (rootDepartmentId !== null && Number.isNaN(rootDepartmentId)) {
      return res.status(400).json({
        success: false,
        message: "rootDepartmentId must be a valid number",
      });
    }

    const parsedDateOfBirth = payload.dateOfBirth
      ? new Date(payload.dateOfBirth)
      : null;

    if (payload.dateOfBirth && Number.isNaN(parsedDateOfBirth.getTime())) {
      return res.status(400).json({
        success: false,
        message: "dateOfBirth is invalid",
      });
    }

    const parsedJoinedAt = payload.joinedAt
      ? new Date(payload.joinedAt)
      : new Date();

    if (Number.isNaN(parsedJoinedAt.getTime())) {
      return res.status(400).json({
        success: false,
        message: "joinedAt is invalid",
      });
    }
    next();
}