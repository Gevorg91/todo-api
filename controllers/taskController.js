const {errorFactory} = require('../utils/errorHandler');
const {sendResponse} = require('../utils/responseHandler');
const {StatusCodes} = require("../utils/statusCodes");
const {validationResult} = require("express-validator");
const taskService = require("../services/taskService")

exports.createTask = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorFactory(StatusCodes.BAD_REQUEST, 'Validation error', errors.array()));
    }

    try {
        const {title, description, completed, workspace} = req.body;

        const taskData = {
            title,
            description,
            completed,
            workspace
        };
        const task = await taskService.createTask(req.user.id, taskData);
        sendResponse(res, StatusCodes.CREATED, formatTaskResponse(task));
    } catch (err) {
        next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

//TODO: Add filtering by workspace || workspace && user
exports.getTasks = async (req, res, next) => {
    try {
        const tasks = await taskService.getAllTasks(req.user.id)
        sendResponse(res, StatusCodes.OK, tasks.map(formatTaskResponse));
    } catch (err) {
        next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

exports.getTask = async (req, res, next) => {
    try {
        const {id} = req.params;
        const task = await taskService.getTaskById(id);

        if (!task) {
            return next(errorFactory(StatusCodes.NOT_FOUND));
        }

        sendResponse(res, StatusCodes.OK, formatTaskResponse(task));
    } catch (err) {
        next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

exports.getTaskById = async (req, res, next) => {
    try {
        const {id} = req.params;
        const task = await taskService.getTaskById(id);

        if (!task) {
            return next(errorFactory(StatusCodes.NOT_FOUND));
        }

        sendResponse(res, StatusCodes.OK, formatTaskResponse(task));
    } catch (err) {
        next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

exports.updateTask = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(errorFactory(StatusCodes.BAD_REQUEST, 'Validation error', errors.array()));
    }

    try {
        const {id} = req.params;
        const {title, description, status} = req.body;

        const taskData = {
            title,
            description,
            status,
        };

        const updatedTask = await taskService.updateTask(id,  taskData);

        if (!updatedTask) {
            return next(errorFactory(StatusCodes.NOT_FOUND));
        }

        sendResponse(res, StatusCodes.OK, formatTaskResponse(updatedTask));
    } catch (err) {
        next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

exports.deleteTask = async (req, res, next) => {
    try {
        const {id} = req.params;
        const isDeleted = await taskService.deleteTask(id);
        if (!isDeleted) {
            return next(errorFactory(StatusCodes.NOT_FOUND));
        }

        sendResponse(res, StatusCodes.OK);
    } catch (err) {
        next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

function formatTaskResponse(task) {
    return {
        id: task._id,
        title: task.title,
        description: task.description,
        workspace: task.workspace,
        completed: task.completed,
        user: task.user,
    };
}