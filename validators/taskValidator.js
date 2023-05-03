const { check, validationResult } = require("express-validator");
const { errorFactory } = require("../utils/errorHandler");
const { StatusCodes } = require("../utils/statusCodes");

const isValidObjectId = (value) => {
  const mongoose = require("mongoose");
  return mongoose.Types.ObjectId.isValid(value);
};

const taskCreateRules = [
  check("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1 })
    .withMessage("Title must be at least 1 character long"),
  check("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  check("completed")
    .optional()
    .isBoolean()
    .withMessage("Completed must be a boolean"),
  check("workspace")
    .notEmpty()
    .withMessage("workspace is required")
    .isString()
    .withMessage("Should be a string")
    .custom(isValidObjectId)
    .withMessage("Invalid ID"),
];

const taskModifyRules = [
  check("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1 })
    .withMessage("Title must be at least 1 character long"),
  check("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  check("completed")
    .optional()
    .isBoolean()
    .withMessage("Completed must be a boolean"),
  check("workspace")
    .optional()
    .isString()
    .withMessage("Should be a string")
    .custom(isValidObjectId)
    .withMessage("Invalid ID"),
];

exports.validateTaskCreate = async (req, res, next) => {
  const promises = taskCreateRules.map((rule) => rule.run(req));
  await Promise.all(promises);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      errorFactory(StatusCodes.BAD_REQUEST, "Validation error", errors.array())
    );
  }

  next();
};

exports.validateTaskModify = async (req, res, next) => {
  const promises = taskModifyRules.map((rule) => rule.run(req));
  await Promise.all(promises);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      errorFactory(StatusCodes.BAD_REQUEST, "Validation error", errors.array())
    );
  }

  next();
};
