const { Workspace, Role } = require("../models/workspaceModel");
const SocketManager = require("../socket/socket_manager");

exports.createWorkspace = async (userid, data) => {
  const { name } = data;
  const workspace = new Workspace({ name, owner: userid });
  workspace.members.push({ user: userid, role: Role.ADMIN });
  await workspace.save();
  return workspace;
};

exports.getWorkspaces = async (userId, filter) => {
  let filterObj;
  switch (filter) {
    case "owner":
      filterObj = { owner: userId };
      break;
    case "member":
      filterObj = { "members.user": userId };
      break;
    case "invited":
      filterObj = { owner: { $ne: userId }, "members.user": userId };
      break;
    default:
      filterObj = { "members.user": userId };
      break;
  }
  const workspaces = await Workspace.find(filterObj).populate("tasks");
  return workspaces;
};

exports.getWorkspaceById = async (workspaceId, userId) => {
  return Workspace.findOne({ _id: workspaceId, "members.user": userId });
};

exports.updateWorkspace = async (workspaceId, userId, updates) => {
  return Workspace.findOneAndUpdate(
    { _id: workspaceId, owner: userId },
    updates,
    { new: true }
  );
};

exports.deleteWorkspace = async (workspaceId, userId) => {
  return Workspace.findOneAndDelete({ _id: workspaceId, owner: userId });
};

exports.getWorkspaceMemberById = async (workspaceId, userId) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    "members.user": userId,
  });
  if (workspace) {
    return workspace.members.find(
      (member) => member.user.toString() === userId
    );
  }
  return null;
};

exports.addMember = async (workspaceId, userId, newMember) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    "members.user": userId,
  });
  if (workspace) {
    workspace.members.push(newMember);
    await workspace.save();
    return newMember;
  }
  return null;
};
