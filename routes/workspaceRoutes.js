const express = require("express");
const workspaceController = require("../controllers/workspaceController");
const validator = require("../validators/workspaceValidator");
const objectIdValidator = require("../middleware/objectIDMiddleware");

const router = express.Router();

router.post(
  "/",
  validator.validateWorkspace,
  workspaceController.createWorkspace
);
router.get("/", workspaceController.getWorkspaces);
router.get("/:id", objectIdValidator, workspaceController.getWorkspace);
router.put(
  "/:id",
  objectIdValidator,
  validator.validateWorkspace,
  workspaceController.updateWorkspace
);
router.delete("/:id", objectIdValidator, workspaceController.deleteWorkspace);
router.post("/:id/members", objectIdValidator, workspaceController.addMember);

module.exports = router;
