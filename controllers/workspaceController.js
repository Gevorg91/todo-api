const { validationResult } = require("express-validator");
const { errorFactory } = require("../utils/errorHandler");
const { StatusCodes } = require("../utils/statusCodes");
const { sendResponse } = require("../utils/responseHandler");
const workspaceService = require("../services/workspaceService");
const { joinToRoom } = require("../socket/socket_manager");

exports.createWorkspace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      errorFactory(StatusCodes.BAD_REQUEST, "Validation error", errors.array())
    );
  }

  try {
    const { name } = req.body;
    const data = { name };
    const workspace = await workspaceService.createWorkspace(req.user.id, data);
    sendResponse(res, StatusCodes.CREATED, formatTaskResponse(workspace));
    if (req.user.socketId) {
      // TODO: Fix this
      const ioInstance =
        await require("../socket/socket_io_instance").getServerIoInstance();
      const allConnectedSockets = await ioInstance.sockets.sockets;
      const socket = allConnectedSockets.get(req.user.socketId);
      await joinToRoom(socket, workspace._id);
    }
  } catch (err) {
    console.log(err);
    next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.getWorkspaces = async (req, res, next) => {
  const { filter } = req.query;

  try {
    const workspaces = await workspaceService.getWorkspaces(
      req.user.id,
      filter
    );
    sendResponse(res, StatusCodes.OK, workspaces.map(formatTaskResponse));
  } catch (err) {
    next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.getWorkspace = async (req, res, next) => {
  try {
    const workspace = await workspaceService.getWorkspaceById(
      req.params.id,
      req.user.id
    );
    if (!workspace) {
      return next(errorFactory(StatusCodes.NOT_FOUND));
    } else {
      sendResponse(res, StatusCodes.OK, formatTaskResponse(workspace));
    }
  } catch (err) {
    next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.updateWorkspace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      errorFactory(StatusCodes.BAD_REQUEST, "Validation error", errors.array())
    );
  }

  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedWorkspace = await workspaceService.updateWorkspace(
      id,
      req.user.id,
      { name }
    );

    if (!updatedWorkspace) {
      return next(errorFactory(StatusCodes.NOT_FOUND));
    }

    sendResponse(
      res,
      StatusCodes.OK,
      formatWorkspaceResponse(updatedWorkspace)
    );
  } catch (err) {
    next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.deleteWorkspace = async (req, res, next) => {
  try {
    const workspace = await workspaceService.deleteWorkspace(
      req.params.id,
      req.user.id
    );
    if (!workspace) {
      return next(errorFactory(StatusCodes.NOT_FOUND));
    } else {
      sendResponse(res, StatusCodes.OK, formatTaskResponse(workspace));
    }
  } catch (err) {
    next(errorFactory(StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const newMember = req.body.member;

    const addedMember = await workspaceService.addMember(id, userId, newMember);

    if (addedMember) {
      sendResponse(res, StatusCodes.OK, addedMember);
    } else {
      return next(errorFactory(StatusCodes.FORBIDDEN));
    }
  } catch (error) {
    next(error);
  }
};

function formatTaskResponse(workspace) {
  return {
    id: workspace._id,
    name: workspace.name,
    owner: workspace.owner,
    members: workspace.members,
  };
}
