const ioInstance =
  require("../socket/socket_io_instance").getServerIoInstance();
const Event = require("./event");

exports.sendTaskEvent = async (event, task) => {
  const roomId = task.workspace;
  await ioInstance.in(roomId).emit(event, task);
};

exports.sendWorkspaceEvent = async (event, workspace) => {
  const roomId = workspace.id;
  await ioInstance.in(roomId).emit(event, workspace);
};

exports.sendTaskCreatedEvent = async (task) => {
  const roomId = task.workspace;
  await ioInstance.in(roomId).emit(Event.TASK_CREATED, task);
};

exports.sendTaskUpdatedEvent = async (task) => {
  const roomId = task.workspace;
  await ioInstance.in(roomId).emit(Event.TASK_UPDATED, task);
};

exports.sendTaskDeletedEvent = async (task) => {
  const roomId = task.workspace;
  await ioInstance.in(roomId).emit(Event.TASK_DELETED, task);
};

exports.sendWorkspaceDeletedEvent = async (workspace) => {
  const roomId = workspace.id;
  await ioInstance.in(roomId).emit(Event.WORKSPACE_DELETED, workspace);
};

exports.sendWorkspaceUpdatedEvent = async (workspace) => {
  const roomId = workspace.id;
  await ioInstance.in(roomId).emit(Event.WORKSPACE_UPDATED, workspace);
};
