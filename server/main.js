const TCPServer = require("./server.js");

const chatServer = new TCPServer();
chatServer.start(process.env.PORT || 3000);