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
            this.socketDataMap.set(socket.id, {});
            let currentUserId = '';

            // Dùng 1 mảng lưu lại các ảnh mà user này đã upload, mục đích lưu cả danh sách này vào 1 collection trong 1 message mới
            let uploadImages = [];
            let audioChunksMap = new Map();

            console.log('Client đã kết nối');

            socket.on('login', (data) => {
                console.log(data.userId, socket.id);
                currentUserId = data.userId;
                this.users.set(data.userId, socket);
            });

            socket.on('images', (data) => {
                this.combineChunksOfImage(socket, data, uploadImages);
            });

            socket.on('text', (data) => {
                console.log('Text: ', data);
                this.sendMessageToChatRoom(currentUserId, data.chatId, data.text, data.type);
            });

            socket.on('addToGroupChat', (data) => {
                console.log('Add to group chat: ', data);
                this.addToGroupChat(currentUserId, data.newUserIds, data.chatId);
            });

            socket.on('audio', (data) => {
                console.log('audio: ', data);
                this.combineChunksOfAudio(data, audioChunksMap);
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
    combineChunksOfImage(socket, data, uploadImages) {
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
            this.saveDataIntoDB(data.fromUser, data.chatId, data.imageId, data.fileName, completeBase64Data, uploadImages, data.imageCount)
        }
    }

    combineChunksOfAudio(data, audioChunksMap) {
        const { fromUser, chatId, chunkIndex, chunk, totalChunks } = data;
        if (!audioChunksMap.has(chatId)) {
            audioChunksMap.set(chatId, new Array(totalChunks).fill(null));
        }
        const chunksArray = audioChunksMap.get(chatId);
        chunksArray[chunkIndex] = chunk;
        const hasAllChunks = chunksArray.every((chunk) => chunk !== null);
        if (hasAllChunks) {
            const audioBuffer = Buffer.concat(chunksArray.map((chunk) => Buffer.from(chunk)));
            this.saveAudioIntoDB(fromUser, chatId, audioBuffer)
            audioChunksMap.delete(chatId);
        }
    }

    saveAudioIntoDB(fromUserId, chatId, bufferData) {
        const fileNameInFirebase = `${new Date().getTime()}_${chatId}.ogg`;
        firebaseService.saveBufferToAudioFolder(bufferData, fileNameInFirebase)
            .then((audioURL) => {
                firebaseService.saveAudioIntoDB(chatId, fromUserId, audioURL);
            });
    }

    saveDataIntoDB(fromUserId, chatId, imageId, fileName, base64Data, uploadImages, imageCount) {
        const fileNameInFirebase = `${new Date().getTime()}_${chatId}_${imageId}_${fileName}`;
        firebaseService.saveBase64ToImageFolder(base64Data, fileNameInFirebase)
            .then((imageURL) => {
                uploadImages.push(imageURL);
                if (uploadImages.length === imageCount) {
                    firebaseService.saveImagesIntoDB(chatId, fromUserId, uploadImages)
                        .then(() => {
                            this.sendDataToChatRoom(chatId, uploadImages);
                        });
                }
            });
    }

    sendDataToChatRoom(chatId, uploadImages) {
        firebaseService.getUsersInChatRoom(chatId)
            .then((userIds) => {
                console.log('Nội dung gửi: ', uploadImages);
                userIds.forEach((userId) => {
                    const socket = this.users.get(userId);
                    socket.emit('images', uploadImages);
                });

                // Xoá danh sách ảnh đã upload ngay sau khi gửi xong để sẵn sàng nhận cho
                uploadImages.splice(0, uploadImages.length);
            });
    }

    sendMessageToChatRoom(currentUserId, chatId, text, type) {
        const socket = this.users.get(currentUserId);
        console.log(currentUserId, chatId, text)
        socket.emit('text', { chatId: chatId, text: text, type: type });
    }

    addToGroupChat(currentUserId, newUserIds, chatId) {
        const socket = this.users.get(currentUserId);
        socket.emit('addToGroupChat', { newUserIds: newUserIds, chatId: chatId });
    }

}

module.exports = TCPServer;