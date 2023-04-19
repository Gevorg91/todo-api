exports.joinToRoom = async (socket, roomId) => {
  await socket.join(roomId);
  console.log(`Socket ${this.socket.id} joined room "${roomId}"`);
};

exports.emitEvent = async (socket, roomId, eventType, eventData) => {
  await socket.to(roomId).emit(eventType, eventData);
  console.log(
    `Event ${eventType} with data: ${eventData} was sent to room: ${roomId}`
  );
};
