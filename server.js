import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { limiter } from "./src/middlewares/rateLimiting.js";
import { prisma } from "./src/libs/prisma.js";

import authRouter from "./src/routes/authRoute.js";
import userRouter from "./src/routes/userRoute.js";
import activityRouter from "./src/routes/activityRoute.js";
import taskRouter from "./src/routes/taskRoute.js";
import activityParticipationRouter from "./src/routes/activityParticipationRoute.js";
import memberApplicationRouter from "./src/routes/memberApplicationRoute.js";
import notificationRouter from "./src/routes/notificationRoute.js";
import departmentRouter from "./src/routes/departmentRoute.js";
import positionRouter from "./src/routes/positionRoute.js";
import departmentApplicationRouter from "./src/routes/departmentApplicationRoute.js";
import { ensureClubStructure } from "./src/bootstrap/seedClubStructure.js";

import { corsOptions } from "./src/configs/corsConfig.js";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";
import { initializeSocketServer } from "./src/socket/socketServer.js";
import messageRoute from "./src/routes/messageRoute.js";
import chatRoomRoute from "./src/routes/chatRoomRoute.js";

const app = express();
const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

initializeSocketServer(io);

app.use(cors(corsOptions));
app.use(limiter);
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  }),
);

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/activities", activityRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/activity-participations", activityParticipationRouter);
app.use("/api/member-applications", memberApplicationRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/positions", positionRouter);
app.use("/api/department-applications", departmentApplicationRouter);
app.use("/api/messages", messageRoute);
app.use("/api/chat-rooms", chatRoomRoute);

async function testDatabaseConnection() {
  await prisma.$queryRaw`SELECT 1`;
  console.log("Database connection successful");
}

async function startServer() {
  try {
    await testDatabaseConnection();
    await ensureClubStructure();

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Go to http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
