exports.joinToRoom = async (socket, roomId) => {
  await socket.join(roomId);
  console.log(`Socket ${this.socket.id} joined room "${roomId}"`);
};

exports.leaveRoom = async (socket, roomId) => {
  await socket.leave(roomId);
  console.log(`Socket ${socket.id} left room "${roomId}"`);
};
