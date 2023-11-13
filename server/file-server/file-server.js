const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const FirebaseStorage = require('../services/firebase-service');
const firebaseStorage = new FirebaseStorage();

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
        this.users = new Map();

        // Lưu thông tin 
        this.socketDataMap = new Map();
        this.io = socketIO(this.server, {
            cors: {
                origin: 'http://localhost:4200',
                methods: ['GET', 'POST'],
            },
            maxHttpBufferSize: 1e8, // 100MB
            maxWebsocketFrameSize: 1e8, // 100MB
        });

        // Sử dụng middleware cors
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
            res.header('Access-Control-Allow-Methods', 'GET, POST');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });


        this.io.on('connection', (socket) => {
            this.socketDataMap.set(socket.id, {});
            let currentUserId = '';
            console.log('Client đã kết nối');

            socket.on('login', (data) => {
                currentUserId = data.userId;
                this.users.set(data.userId, socket);
            });

            socket.on('image', (data) => {
                this.combineChunksOfImage(socket, data);
            })

            socket.on('disconnect', () => {
                console.log('Client đã ngắt kết nối');
                this.users.delete(currentUserId);
            });
        });
    }

    /**
     * Tiến hành gộp các đoạn của ảnh đã được gửi từ client
     * @param socket: socket của user đang kết nối 
     * @param data:  id, chunkIndex, chunk, totalChunk
     */
    combineChunksOfImage(socket, data) {
        console.log(`Received data from client (${socket.id}, ${data.chunkIndex}): ${data.chunk.length} bytes to clients: ${data.toUsers}`);
        const socketData = this.socketDataMap.get(socket.id);
        if (!socketData[data.imageId]) {
            socketData[data.imageId] = {};
        }
        socketData[data.imageId][data.chunkIndex] = data.chunk;

        const totalChunks = data.totalChunks;
        const receivedChunks = Object.keys(socketData[data.imageId]).length;
        if (totalChunks == receivedChunks) {
            // Khi đã nhận đã số chunk đã chia nhỏ của file thì tiến hành gộp lại
            const completeBase64Data = Object.values(socketData[data.imageId]).join('');
            delete socketData[data.imageId];
            console.log(`All chunks from ${socket.id} for image ${data.imageId} received and combined successfully`);
            this.saveDataIntoDB(data.chatId, data.imageId, data.fileName, completeBase64Data);
        }
    }

    saveDataIntoDB(chatId, imageId, fileName, base64Data) {
        const fileNameInFirebase = `${new Date().getTime()}_${chatId}_${imageId}_${fileName}`;
        firebaseStorage.saveBase64ToImageFolder(base64Data, fileNameInFirebase);
    }
}

module.exports = FileServer;