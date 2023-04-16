const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const config = require("config");

exports.register = async (username, password) => {
  let user = await User.findOne({ username: username });
  if (user) {
    return { created: false };
  }

  user = new User({ username, password });
  await user.save();
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { created: true, user, accessToken, refreshToken };
};

exports.login = async (username, password) => {
  let user = await User.findOne({ username: username });
  if (!user) {
    return { authenticated: false };
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return { authenticated: false };
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { authenticated: true, user, accessToken, refreshToken };
};

exports.refreshToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.user.id);

  if (!user) {
    return { valid: false };
  }

  const newAccessToken = generateAccessToken(user);
  return { valid: true, user, newAccessToken, refreshToken };
};

function generateAccessToken(user) {
  const payload = { user: { id: user.id } };
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: "100d" });
}

function generateRefreshToken(user) {
  const payload = { user: { id: user.id } };
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: "400d" });
}
