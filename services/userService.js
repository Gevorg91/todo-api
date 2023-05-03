const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

exports.register = async (username, password, email, verificationToken) => {
  let user = await User.findOne({ email: email });
  if (user) {
    return { created: false };
  }

  user = new User({ username, password, email, verificationToken });
  await user.save();
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { created: true, user, accessToken, refreshToken, verificationToken };
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
  const decoded = jwt.verify(refreshToken, config.get("JWT_REFRESH_SECRET"));
  const user = await User.findById(decoded.user.id);

  if (!user) {
    return { valid: false };
  }

  const newAccessToken = generateAccessToken(user);
  return { valid: true, user, newAccessToken, refreshToken };
};

exports.verifyEmail = async (token) => {
  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    return { verified: false };
  }

  user.verificationToken = undefined;
  user.emailVerified = true;
  await user.save();
  return { verified: true };
};

exports.changePassword = async (user, currentPassword, newPassword) => {
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return { success: false, message: "Current password is incorrect" };
  }

  user.password = newPassword;
  await user.save();
  return { success: true };
};

exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    return { success: false, message: "User not found" };
  }

  const resetToken = await generatePasswordResetToken(user);
  await sendPasswordResetEmail(user, resetToken);

  return { success: true };
};

exports.resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return {
      success: false,
      message: "Password reset token is invalid or has expired",
    };
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { success: true };
};

async function generatePasswordResetToken(user) {
  const resetToken = await bcrypt.genSalt(7);
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();
  return resetToken;
}

async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `http://localhost:3000/api/users/reset-password/${resetToken}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.get("MAIL_USERNAME"),
      pass: config.get("MAIL_PASSWORD"),
    },
  });

  const mailOptions = {
    to: user.email,
    subject: "Password Reset",
    text: `You are receiving this email because you (or someone else) requested a password reset for your account.\n\nPlease click the following link to complete the process:\n\n${resetToken}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

function generateAccessToken(user) {
  const payload = { user: { id: user.id } };
  return jwt.sign(payload, config.get("JWT_SECRET"), { expiresIn: "100d" });
};

const generateRefreshToken = (user) => {
  const payload = { user: { id: user.id } };
  return jwt.sign(payload, config.get("JWT_REFRESH_SECRET"), {
    expiresIn: "400d",
  });
};
