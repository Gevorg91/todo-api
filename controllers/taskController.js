const Task = require('../models/taskModel');

exports.createTask = async (req, res) => {
    try {
        const task = new Task({ ...req.body, user: req.user.id });
        const savedTask = await task.save();
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id });
        res.json(tasks);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getTask = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
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
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true }
        );
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
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!task) {
            res.status(404).send({ message: 'Task not found.' });
        } else {
            res.json({ message: 'Task deleted successfully.' });
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
