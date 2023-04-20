const { Server } = require("socket.io");

let serverIo;

exports.initializeSocketServer = (server, cors) => {
  serverIo = new Server(server, {
    cors: cors,
  });
  return serverIo;
};

exports.getServerIoInstance = () => {
  return serverIo;
};
