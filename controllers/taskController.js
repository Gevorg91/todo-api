const Task = require('../models/taskModel');

exports.createTask = async (req, res) => {
    try {
        // TODO: We need to include creator user
        const task = new Task(req.body);
        const savedTask = await task.save();
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getTasks = async (req, res) => {
    try {
        // TODO: We need to get the user id from auth middleware and check tasks for the user, but not the entire DB.
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getTask = async (req, res) => {
    try {
        // TODO: We need to check if the user has permission to get this task. Id can be some other users.
        const task = await Task.findById(req.params.id);
        if (!task) {
            res.status(404).send({ message: 'Task not found.' });
        } else {
            res.json(task);
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        // TODO: The same, we need query tasks for the user
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!task) {
            res.status(404).send({ message: 'Task not found.' });
        } else {
            res.json(task);
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.deleteTask = async (req, res) => {
    // TODO: The same, we need to check if the user can delete this task
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            res.status(404).send({ message: 'Task not found.' });
        } else {
            res.json({ message: 'Task deleted successfully.' });
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
