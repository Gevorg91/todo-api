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
const cors = require("cors");
const { instrument } = require("@socket.io/admin-ui");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("./models/userModel");
const {
  joinToRoom,
  emitEventToRoom,
  broadcastEventToRoom,
  getSocketsInRoom,
} = require("./socket/socket_manager");

const appFactory = async (appStartupConfig) => {
  await connectDB(appStartupConfig.dbUri);

  const app = express();
  const nodeServer = http.createServer(app);

  const io = new Server(nodeServer, {
    cors: {
      origin: ["https://admin.socket.io", "http://localhost:58389"],
      methods: "*",
      credentials: true,
    },
  });

  instrument(io, {
    mode: "development",
    auth: false,
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

  io.use(async (socket, next) => {
    const { token } = socket.handshake.auth;
    const decoded = jwt.verify(token, config.get("JWT_SECRET"));
    const user = await User.findById(decoded.user.id);
    socket.user = user;
    console.log(`Socket connected with User: ${user}`);
    next();
  });

  io.on(SocketEvent.CONNECTION, (socket) => {
    console.log(
      `Socket connection was established for the client: ${socket.id}`
    );

    socket.on("joinRoom", async (roomId) => {
      await joinToRoom(socket, roomId);
    });

    socket.on("emitToRoom", async ({ roomId, eventType, eventData }) => {
      await emitEventToRoom(socket, roomId, eventType, eventData);
    });

    socket.on("broadcastToRoom", async ({ roomId, eventType, eventData }) => {
      await broadcastEventToRoom(socket, roomId, eventType, eventData);
    });

    socket.on("getSocketsInRoom", async ({ roomId }) => {
      await getSocketsInRoom(io, roomId);
    });

    socket.on("getRoomsForSocket", async () => {
      await getSocketsInRoom(socket);
    });

    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} disconnected`);
    });
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
  });

  const PORT = appStartupConfig.port;
  const server = nodeServer.listen(PORT);
  return { app, server };
};

module.exports = { appFactory };
