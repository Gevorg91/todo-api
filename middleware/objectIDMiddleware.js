const mongoose = require("mongoose");
const { errorFactory } = require("../utils/errorHandler");
const { StatusCodes } = require("../utils/statusCodes");

const validate = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return next(errorFactory(StatusCodes.NOT_FOUND));
  }

  next();
};

module.exports = validate;
