const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const config = require("config");
const { errorFactory } = require("../utils/errorHandler");
const { StatusCodes } = require("../utils/statusCodes");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, config.get("JWT_SECRET"));
    const user = await User.findById(decoded.user.id);

    if (!user) {
      return next(errorFactory(StatusCodes.NOT_FOUND));
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return next(errorFactory(StatusCodes.UNAUTHORIZED));
  }
};

module.exports = authMiddleware;
