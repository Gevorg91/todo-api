const express = require("express");
const userController = require("../controllers/userController");
const userValidator = require("../validators/userValidator");
const auth = require("../middleware/authMiddleware");

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
router.post(
  "/change-password",
  auth,
  userValidator.validateChangePassword,
  userController.changePassword
);
router.post(
  "/forgot-password",
  userValidator.validateForgotPassword,
  userController.forgotPassword
);
router.post(
  "/reset-password",
  userValidator.validateResetPassword,
  userController.resetPassword
);
router.get("/verify-email", userController.verifyEmail);

module.exports = router;
