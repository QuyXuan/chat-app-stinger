const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

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
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIO(this.server, {
            cors: {
                origin: 'http://localhost:4200',
                methods: ['GET', 'POST'],
            },
        });

        // Sử dụng middleware cors
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', 'http://localhost:4200'); // Thay đổi tên miền tùy theo ứng dụng Angular của bạn
            res.header('Access-Control-Allow-Methods', 'GET, POST');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });


        this.io.on('connection', (socket) => {
            console.log('Client đã kết nối');

            socket.on('image', (image) => {
                console.log(image);
            })

            socket.on('disconnect', () => {
                console.log('Client đã ngắt kết nối');
            });
        });
    }
}

module.exports = FileServer;