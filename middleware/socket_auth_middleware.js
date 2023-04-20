const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/userModel");

const socketAuthMiddleware = async (socket, next) => {
  const { token } = socket.handshake.auth;
  const decoded = jwt.verify(token, config.get("JWT_SECRET"));
  const user = await User.findById(decoded.user.id);
  socket.user = user;
  console.log(`Socket connected with User: ${user}`);
  next();
};

module.exports = socketAuthMiddleware;
