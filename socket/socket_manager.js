exports.joinToRoom = async (socket, roomId) => {
  await socket.join(roomId);
};

exports.leaveRoom = async (socket, roomId) => {
  await socket.leave(roomId);
};
