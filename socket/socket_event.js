const SocketEvent = {
  CONNECTION: "connection",
  JOIN_TO_ROOM: "join_to_room",
  EMIT_TO_ROOM: "emit_to_room",
  BROADCAST_TO_ROOM: "broadcast_to_room",
};

Object.freeze(SocketEvent);

module.exports = SocketEvent;
