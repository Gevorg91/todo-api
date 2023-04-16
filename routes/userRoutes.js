const express = require("express");
const userController = require("../controllers/userController");
const userValidator = require("../validators/userValidator");

const router = express.Router();

router.post(
  "/register",
  userValidator.validateRegister,
  userController.register
);
router.post("/login", userValidator.validateLogin, userController.login);
router.post(
  "/refresh-token",
  userValidator.validateRefreshToken,
  userController.refreshToken
);

module.exports = router;
