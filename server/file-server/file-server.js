const http = require('http');
const socketIo = require('socket.io');

class FileServer {
    constructor() {
        this.server = null;
        this.initializeServer();
    }
    start(port) {
        this.server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
    initializeServer() {
        this.server = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Socket.IO server is running\n');
        });
    }
}

module.exports = FileServer;