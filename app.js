const express = require('express');
const config = require('config');
const connectDB = require('./config/dbConfig');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes')
const auth = require('./middleware/authMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');
const invalidSyntaxMiddleware = require('./middleware/invalidSyntaxMiddleware');


// TODO: This is a temporary work around to the known issue: https://github.com/Automattic/mongoose/issues/9348
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

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
app.listen(PORT, (error) => {
    if (error) {
        console.error('Failed to start server:', error);
    } else {
        console.log(`Server running on port ${PORT} in ${config.get('NODE_ENV')} mode`);
    }
});

module.exports = app;
