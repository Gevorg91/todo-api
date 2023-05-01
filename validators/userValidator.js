const { check } = require("express-validator");

exports.validateRegister = [
  check("email").isEmail().withMessage("Please enter a valid email address"),
  check("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 4 })
    .withMessage("Username must be at least 3 characters long"),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

exports.validateLogin = [
  check("username").notEmpty().withMessage("Username is required"),
  check("password").notEmpty().withMessage("Password is required"),
];

exports.validateRefreshToken = [
  check("refreshToken").notEmpty().withMessage("Refresh token is required"),
];

exports.validateChangePassword = [
  check("currentPassword", "Current password is required").notEmpty(),
  check(
    "newPassword",
    "New password is required and should be at least 6 characters long"
  ).isLength({ min: 6 }),
];

exports.validateForgotPassword = [
  check("email").isEmail().withMessage("Email is invalid"),
];

exports.validateResetPassword = [
  check("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];
