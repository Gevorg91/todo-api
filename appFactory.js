const express = require("express");
const { connectDB, dropDatabase } = require("./config/dbConfig");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const auth = require("./middleware/authMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");
const invalidSyntaxMiddleware = require("./middleware/invalidSyntaxMiddleware");
const http = require("http");
const { Server } = require("socket.io");
const SocketEvent = require("./socket/socket_event");
const SocketManager = require("./socket/socket_manager");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("./models/userModel");
const { errorFactory } = require("./utils/errorHandler");
const { StatusCodes } = require("./utils/statusCodes");
const { emitEvent } = require("./socket/socket_manager");

const appFactory = async (appStartupConfig) => {
  await connectDB(appStartupConfig.dbUri);
  // await dropDatabase();

  const app = express();
  const nodeServer = http.createServer(app);

  const io = new Server(nodeServer, {
    cors: {
      methods: ["GET", "POST"],
    },
  });

  app.use(
    cors({
      origin: "*",
      methods: "*",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(invalidSyntaxMiddleware);
  app.use("/api/tasks", auth, taskRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/workspaces", auth, workspaceRoutes);
  app.use(errorMiddleware);

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
  });

  io.use(async (socket, next) => {
    const { token } = socket.handshake.auth;
    socket.token = token;
    next();
  });

  io.on(SocketEvent.CONNECTION, (socket) => {
    console.log(
      `Socket connection was established for the client: ${socket.id}`
    );
  });

  const PORT = appStartupConfig.port;
  const server = nodeServer.listen(PORT);
  return { app, server };
};

module.exports = { appFactory };
