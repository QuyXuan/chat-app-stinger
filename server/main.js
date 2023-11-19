const TCPServer = require("./servers/tcp-server.js");
// const FTPServer = require("./servers/ftp-server.js");

const chatServer = new TCPServer();
chatServer.start(3000);

// const fileServer = new FTPServer();
// fileServer.start(4000);