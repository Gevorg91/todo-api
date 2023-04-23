const express = require("express");
const taskController = require("../controllers/taskController");
const taskValidator = require("../validators/taskValidator");
const objectIdValidator = require("../middleware/objectIDMiddleware");
const router = express.Router();

router.post("/", taskValidator.validateTaskCreate, taskController.createTask);

router.get("/", taskController.getTasks);

router.get("/:id", objectIdValidator, taskController.getTaskById);

router.put(
  "/:id",
  objectIdValidator,
  taskValidator.validateTaskModify,
  taskController.updateTask
);

router.delete("/:id", objectIdValidator, taskController.deleteTask);

module.exports = router;
