exports.sendTaskEvent = async (event, task) => {
  const roomId = task.workspace;
  // TODO: Fix this
  const ioInstance =
    await require("../socket/socket_io_instance").getServerIoInstance();
  await ioInstance.in(roomId).emit(event, task);
};

exports.sendWorkspaceEvent = async (event, workspace) => {
  const roomId = workspace.id;
  // TODO: Fix this
  const ioInstance =
    await require("../socket/socket_io_instance").getServerIoInstance();
  await ioInstance.in(roomId).emit(event, workspace);
};
