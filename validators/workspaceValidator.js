const { check } = require("express-validator");

exports.validateWorkspace = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 1 })
    .withMessage("Name must be at least 1 character long"),
];
