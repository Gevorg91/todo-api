const express = require("express");
const invalidSyntaxMiddleware = require("../middleware/invalidSyntaxMiddleware");
const auth = require("../middleware/authMiddleware");
const taskRoutes = require("../routes/taskRoutes");
const userRoutes = require("../routes/userRoutes");
const workspaceRoutes = require("../routes/workspaceRoutes");
const errorMiddleware = require("../middleware/errorMiddleware");
const config = require("config");

const app = express();
app.use(express.json());
app.use(invalidSyntaxMiddleware);
app.use('/api/tasks', auth, taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workspaces', auth, workspaceRoutes);
app.use(errorMiddleware);

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

const PORT = config.get('PORT');

const server = app.listen(PORT, (error) => {
    if (error) {
        console.error('Failed to start server:', error);
    }
});

module.exports = { app, server };
