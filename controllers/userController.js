const { errorFactory } = require("../utils/errorHandler");
const { sendResponse } = require("../utils/responseHandler");
const { StatusCodes } = require("../utils/statusCodes");
const { validationResult } = require("express-validator");
const userService = require("../services/userService");

exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      errorFactory(StatusCodes.BAD_REQUEST, "Validation error", errors.array())
    );
  }

  try {
    const { username, password } = req.body;
    const result = await userService.register(username, password);

    if (!result.created) {
      return next(errorFactory(StatusCodes.BAD_REQUEST, "User already exists"));
    }
    let resData = formatUserResponse(
      result.user,
      result.accessToken,
      result.refreshToken
    );
    sendResponse(res, StatusCodes.CREATED, resData);
  } catch (err) {
    next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      errorFactory(StatusCodes.BAD_REQUEST, "Validation error", errors.array())
    );
  }

  try {
    const { username, password } = req.body;
    const result = await userService.login(username, password);

    if (!result.authenticated) {
      return next(
        errorFactory(StatusCodes.UNAUTHORIZED, "Invalid username or password")
      );
    }

    let resData = formatUserResponse(
      result.user,
      result.accessToken,
      result.refreshToken
    );
    sendResponse(res, StatusCodes.OK, resData);
  } catch (err) {
    next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.refreshToken = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      errorFactory(StatusCodes.BAD_REQUEST, "Validation error", errors.array())
    );
  }

  const { refreshToken } = req.body;
  if (!refreshToken) {
    return next(
      errorFactory(
        StatusCodes.UNAUTHORIZED,
        "No refresh token, authorization denied"
      )
    );
  }

  try {
    const result = await userService.refreshToken(refreshToken);
    if (!result.valid) {
      return next(
        errorFactory(StatusCodes.UNAUTHORIZED, "Invalid refresh token")
      );
    }
    let resData = formatUserResponse(
      result.user,
      result.newAccessToken,
      result.refreshToken
    );
    sendResponse(res, StatusCodes.OK, resData);
  } catch (err) {
    next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

function formatUserResponse(user, accessToken, refreshToken) {
  return {
    id: user._id,
    username: user.username,
    createdAt: user.createdAt,
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
}
