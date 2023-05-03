const { errorFactory } = require("../utils/errorHandler");
const { sendResponse } = require("../utils/responseHandler");
const { StatusCodes } = require("../utils/statusCodes");
const { validationResult } = require("express-validator");
const userService = require("../services/userService");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const config = require("config");

exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      errorFactory(StatusCodes.BAD_REQUEST, "Validation error", errors.array())
    );
  }

  try {
    const { username, password, email } = req.body;
    const verificationToken = await bcrypt.genSalt(7);
    const result = await userService.register(
      username,
      password,
      email,
      verificationToken
    );

    if (!result.created) {
      return next(errorFactory(StatusCodes.BAD_REQUEST, "User already exists"));
    }
    let resData = formatUserResponse(result);
    sendResponse(res, StatusCodes.CREATED, resData);
    await sendVerificationEmail(email, verificationToken);
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

    let resData = formatUserResponse(result);
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
    let resData = formatUserResponse(result);
    sendResponse(res, StatusCodes.OK, resData);
  } catch (err) {
    next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const result = await userService.verifyEmail(token);

    if (!result.verified) {
      return next(
        errorFactory(StatusCodes.BAD_REQUEST, "Invalid verification token")
      );
    }

    sendResponse(res, StatusCodes.OK, {
      message: "Email verified successfully",
    });
  } catch (err) {
    next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.changePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      errorFactory(StatusCodes.BAD_REQUEST, "Validation error", errors.array())
    );
  }

  try {
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword(
      req.user,
      currentPassword,
      newPassword
    );

    if (!result.success) {
      return next(errorFactory(StatusCodes.BAD_REQUEST, result.message));
    }

    sendResponse(res, StatusCodes.OK, {
      message: "Password changed successfully",
    });
  } catch (err) {
    next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.forgotPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      errorFactory(StatusCodes.BAD_REQUEST, "Validation error", errors.array())
    );
  }

  try {
    const { email } = req.body;
    const result = await userService.forgotPassword(email);

    if (!result.success) {
      return next(errorFactory(StatusCodes.BAD_REQUEST, result.message));
    }

    sendResponse(res, StatusCodes.OK, { message: "Password reset email sent" });
  } catch (err) {
    next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.resetPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      errorFactory(StatusCodes.BAD_REQUEST, "Validation error", errors.array())
    );
  }

  try {
    const { token, newPassword } = req.body;
    const result = await userService.resetPassword(token, newPassword);

    if (!result.success) {
      return next(errorFactory(StatusCodes.BAD_REQUEST, result.message));
    }

    sendResponse(res, StatusCodes.OK, { message: "Password reset successful" });
  } catch (err) {
    next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

async function sendVerificationEmail(email, verificationToken) {
  const verificationLink = `http://localhost:3000/api/users/verify-email?token=${verificationToken}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.get("MAIL_USERNAME"),
      pass: config.get("MAIL_PASSWORD"),
    },
  });

  const mailOptions = {
    to: email,
    subject: "Email Verification",
    text: `Please click the link to verify your email: ${verificationLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

function formatUserResponse(data) {
  return {
    id: data.user._id,
    username: data.user.username,
    createdAt: data.user.createdAt,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    verificationToken: data.verificationToken,
  };
}
