const express = require('express');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./config/dbConfig');
const config = require('config');

connectDB();

const app = express();
app.use(express.json());
// TODO: All tasks will be using auth middleware, move it here.
app.use('/api/tasks', taskRoutes);
// TODO: Enable CORS also
app.use('/api/users', userRoutes);

const PORT = config.get('PORT');
app.listen(PORT, () => console.log(`Server running on port ${PORT} in ${config.get('NODE_ENV')} mode`));
