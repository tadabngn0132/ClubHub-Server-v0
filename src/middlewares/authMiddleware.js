import jwt from 'jsonwebtoken'

export const verifyAccessToken = (req, res, next) => {
  if (!req.headers) {
    return res.status(401).json({
      error: "No headers found"
    })
  }

  if (!req.headers.authorization) {
    return res.status(401).json({
      error: "No authorization header"
    })
  }

  if (!req.headers.authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Invalid authorization header format"
    })
  }

  const accessToken = req.headers.authorization.split(" ")[1]

  if (!accessToken || accessToken.trim().length === 0 || accessToken.trim() === "") {
    return res.status(401).json({
      error: "Access token is missing"
    })
  }

  try {
    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    req.userId = decodedToken.userId
    next()
  } catch (error) {
    res.status(401).json({
      error: "Access token is invalid or expired"
    })
  }
}