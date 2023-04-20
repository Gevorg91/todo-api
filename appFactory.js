const express = require("express");
const { connectDB, dropDatabase } = require("./config/dbConfig");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const auth = require("./middleware/authMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");
const invalidSyntaxMiddleware = require("./middleware/invalidSyntaxMiddleware");
const http = require("http");
const SocketEvent = require("./socket/socket_event");
const cors = require("cors");
const { instrument } = require("@socket.io/admin-ui");
const { joinToRoom } = require("./socket/socket_manager");
const { initializeSocketServer } = require("./socket/socket_io_instance");
const socketAuthMiddleware = require("./middleware/socket_auth_middleware");

const appFactory = async (appStartupConfig) => {
  await connectDB(appStartupConfig.dbUri);

  const app = express();
  const nodeServer = http.createServer(app);

  const io = initializeSocketServer(nodeServer, {
    origin: ["https://admin.socket.io", "http://localhost:58389"],
    methods: "*",
    credentials: true,
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
  app.use("/api/users", userRoutes);
  app.use("/api/tasks", auth, taskRoutes);
  app.use("/api/workspaces", auth, workspaceRoutes);
  app.use(errorMiddleware);

  io.use(socketAuthMiddleware);

  io.on(SocketEvent.CONNECTION, (socket) => {
    console.log(
      `Socket connection was established for the client: ${socket.id}`
    );

    socket.on(SocketEvent.JOIN_TO_ROOM, async (roomId) => {
      await joinToRoom(socket, roomId);
    });

    socket.on(SocketEvent.DISCONNECT, () => {
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
