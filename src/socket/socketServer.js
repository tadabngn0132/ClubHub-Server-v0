import { setupUserHandler } from "./handlers/userHandler.js";
import { setupMessageHandler } from "./handlers/messageHandler.js";
import { setupNotificationHandler } from "./handlers/notificationHandler.js";
import { setupTypingHandler } from "./handlers/typingHandler.js";
import { socketAuthMiddleware } from "./middlewares/socketAuthMiddleware.js";
import { setSocketIO } from "./socketGateway.js";

export const initializeSocketServer = (io) => {
  setSocketIO(io);
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Set up all event handlers for this socket connection
    setupMessageHandler(io, socket);
    setupNotificationHandler(io, socket);
    setupTypingHandler(io, socket);
    setupUserHandler(io, socket);

    // Global error handler
    socket.on("error", (err) => {
      console.error(`Error on socket ${socket.id}:`, err);
      socket.emit("socket:error", {
        message: "An error occurred on the server.",
      });
    });

    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });

  return io;
};
