const express = require('express');
const config = require('config');
const connectDB = require('./config/dbConfig');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes')
const auth = require('./middleware/authMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');
const invalidSyntaxMiddleware = require('./middleware/invalidSyntaxMiddleware');

const appFactory = async (appStartupConfig) => {
    await connectDB(appStartupConfig.dbUri);

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

    const PORT = appStartupConfig.port;

    const server = app.listen(PORT);

    return { app, server };
}

module.exports = { appFactory };
