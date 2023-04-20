exports.joinToRoom = async (socket, roomId) => {
  await socket.join(roomId);
  console.log(`Socket ${this.socket.id} joined room "${roomId}"`);
};

exports.leaveRoom = async (socket, roomId) => {
  await socket.leave(roomId);
  console.log(`Socket ${socket.id} left room "${roomId}"`);
};

exports.emitEventToRoom = async (socket, roomId, eventType, eventData) => {
  await socket.to(roomId).emit(eventType, eventData);
  console.log(
    `Event ${eventType} with data: ${eventData} was sent to room: ${roomId}`
  );
};

exports.broadcastEventToRoom = async (socket, roomId, eventType, eventData) => {
  await socket.to(roomId).broadcast(eventType, eventData);
  console.log(
    `Event ${eventType} with data: ${eventData} was broadcast to room: ${roomId}`
  );
};

exports.getSocketsInRoom = async (io, roomId) => {
  const sockets = await io.in(roomId).allSockets();
  console.log(`Sockets in room "${roomId}": ${[...sockets]}`);
  return sockets;
};

exports.getRoomsForSocket = async (socket) => {
  const rooms = await socket.rooms;
  console.log(`Rooms for socket "${socket.id}": ${rooms}`);
  return rooms;
};
