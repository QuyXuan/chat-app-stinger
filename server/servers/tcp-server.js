const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const firebaseService = require('../services/firebase.js');

class TCPServer {
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

        // Lưu lại 1 Map các id user và Socket của họ để khi server gửi lại thì sẽ biết dùng gửi đến client bằng socket nào
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
            let currentUserId = '';

            // Dùng 1 mảng lưu lại các ảnh mà user này đã upload, mục đích lưu cả danh sách này vào 1 collection trong 1 message mới
            let uploadImages = [];

            socket.on('login', (data) => {
                console.log(socket.id);
                // console.log(`Client ${data.userId} đã kết nối`);
                currentUserId = data.userId;
                this.users.set(currentUserId, socket);
                // if (!this.users.has(currentUserId)) {
                // }
                this.socketDataMap.set(currentUserId, {});
            });

            socket.on('images', (data) => {
                this.combineChunksOfImage(currentUserId, data, uploadImages);
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
    combineChunksOfImage(currentUserId, data, uploadImages) {
        const socketData = this.socketDataMap.get(currentUserId);
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
            this.saveImagesIntoDB(currentUserId, data.chatId, data.imageId, data.fileName, completeBase64Data, uploadImages, data.imageCount)
        }
    }

    saveImagesIntoDB(fromUserId, chatId, imageId, fileName, base64Data, uploadImages, imageCount) {
        const fileNameInFirebase = `${new Date().getTime()}_${chatId}_${imageId}_${fileName}`;
        firebaseService.saveBase64ToImageFolder(base64Data, fileNameInFirebase)
            .then((imageURL) => {
                uploadImages.push(imageURL);
                if (uploadImages.length === imageCount) {
                    firebaseService.saveImagesIntoDB(chatId, fromUserId, uploadImages)
                        .then(() => {
                            this.sendDataToChatRoom(fromUserId, chatId, {
                                content: uploadImages,
                                type: 'images'
                            });
                        });
                }
            });
    }

    sendDataToChatRoom(fromUserId, chatId, data) {
        firebaseService.getUsersInChatRoom(chatId)
            .then((userIds) => {
                const promises = userIds.map((userId) => {
                    const socket = this.users.get(userId);
                    if (socket) {
                        socket.emit(data.type, data.content);
                        return Promise.resolve();
                    } else {
                        return firebaseService.saveDataInNotification(fromUserId, userId, chatId, data);
                    }
                });

                // Chờ cho tất cả các Promises hoàn thành trước khi tiếp tục
                return Promise.all(promises);
            })
            .then(() => {
                const uploadImages = data.content;
                uploadImages.splice(0, uploadImages.length);
            });
    }

}

module.exports = TCPServer;