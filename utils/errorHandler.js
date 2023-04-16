const { StatusCodes } = require("./statusCodes");
const ApiError = require("./apiError");

function getErrorMessage(statusCode) {
  switch (statusCode) {
    case StatusCodes.BAD_REQUEST:
      return "Bad Request";
    case StatusCodes.UNAUTHORIZED:
      return "Unauthorized";
    case StatusCodes.FORBIDDEN:
      return "Forbidden";
    case StatusCodes.NOT_FOUND:
      return "Not Found";
    case StatusCodes.INTERNAL_SERVER_ERROR:
    default:
      return "Internal Server Error";
  }
}

const errorFactory = (statusCode, message = null, data = null) => {
  return new ApiError(statusCode, message || getErrorMessage(statusCode), data);
};

module.exports = { errorFactory };
