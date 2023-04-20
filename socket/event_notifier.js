const ioInstance =
  require("../socket/socket_io_instance").getServerIoInstance();

exports.sendTaskEvent = async (event, task) => {
  const roomId = task.workspace;
  await ioInstance.in(roomId).emit(event, task);
};

exports.sendWorkspaceEvent = async (event, workspace) => {
  const roomId = workspace.id;
  await ioInstance.in(roomId).emit(event, workspace);
};
