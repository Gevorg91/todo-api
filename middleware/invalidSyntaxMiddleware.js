const { StatusCodes } = require("../utils/statusCodes");
const { errorFactory } = require("../utils/errorHandler");
module.exports = function (err, req, res, next) {
  if (
    err instanceof SyntaxError &&
    err.status === StatusCodes.BAD_REQUEST &&
    "body" in err
  ) {
    return next(errorFactory(StatusCodes.BAD_REQUEST, "Invalid JSON format"));
  }
  next(err);
};
