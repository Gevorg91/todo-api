exports.joinToRoom = async (socket, roomId) => {
  await socket.join(roomId);
  console.log(`The user ${socket.user.id} joined ${roomId} room!`);
};

exports.leaveRoom = async (socket, roomId) => {
  await socket.leave(roomId);
};
