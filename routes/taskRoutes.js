const express = require('express');
const taskController = require('../controllers/taskController');
const taskValidator = require("../validators/taskValidator")
const objectIdValidator = require("../middleware/objectIDMiddleware");
const router = express.Router();

router.post(
    '/',
    taskValidator.validateTaskCreate,
    // validateTaskAccess(Type.CREATE),
    taskController.createTask);

router.get(
    '/',
    taskController.getTasks);

router.get(
    '/:id',
    objectIdValidator,
    // validateTaskAccess(Type.GET_TASK),
    taskController.getTask);

router.put(
    '/:id',
    objectIdValidator,
    taskValidator.validateTaskModify,
    // validateTaskAccess(Type.EDIT),
    taskController.updateTask);

router.delete(
    '/:id',
    objectIdValidator,
    // validateTaskAccess(Type.DELETE),
    taskController.deleteTask);

module.exports = router;