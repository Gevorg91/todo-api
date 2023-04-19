const SocketEvent = {
  CONNECTION: "connection",
  SEND_MESSAGE: "sendMessage",
};

Object.freeze(SocketEvent); // Make the object immutable

module.exports = SocketEvent;
