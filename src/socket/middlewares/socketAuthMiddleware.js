import jwt from "jsonwebtoken";

const getTokenFromSocket = (socket) => {
  const handshakeToken = socket.handshake?.auth?.token;

  if (handshakeToken) {
    return String(handshakeToken).replace(/^Bearer\s+/i, "").trim();
  }

  const authHeader = socket.handshake?.headers?.authorization;

  if (authHeader) {
    return String(authHeader).replace(/^Bearer\s+/i, "").trim();
  }

  return null;
};

export const socketAuthMiddleware = (socket, next) => {
  try {
    const token = getTokenFromSocket(socket);

    if (!token) {
      return next(new Error("Unauthorized: Missing access token"));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    socket.data.userId = decodedToken.userId;
    socket.data.userRole = decodedToken.userRole;

    return next();
  } catch (error) {
    return next(new Error("Unauthorized: Invalid or expired access token"));
  }
};
