const ChatServer = require("./chat-server/chat-server.js");
const FileServer = require("./file-server/file-server.js");

const chatServer = new ChatServer();
chatServer.start(3000);

const fileServer = new FileServer();