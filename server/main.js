const TCPServer = require("./server.js");

const chatServer = new TCPServer();
chatServer.start(3000);