import jwt from 'jsonwebtoken'

export const verifyAccessToken = (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1]

  if (!accessToken) {
    return res.status(401).json({
      error: "No access token"
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