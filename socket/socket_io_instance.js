const { Server } = require("socket.io");

let serverIo;

exports.initializeSocketConnection = (server, cors) => {
  serverIo = new Server(server, {
    cors: cors,
  });
  return serverIo;
};

exports.getServerIoInstance = () => {
  return serverIo;
};
