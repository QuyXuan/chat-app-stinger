const http = require('http');
const socketIo = require('socket.io');

class ChatServer {
    constructor() {
        this.connectedUsers = {};
        this.groups = {};
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

        this.io = socketIo(this.server);
        this.io.on('connection', (socket) => {

            // Khi 1 client login sẽ tạo 1 socket duy nhất và dùng chung lại cho các trang
            socket.on('login', (userId) => {
                // Thêm client mới vào danh sách người kết nối
                this.connectedUsers[userId] = socket;
                console.log(`Client connected: ${userName}`);
            });


            socket.on('privateMessage', (data) => {
                const { fromUserId, receiveId, message } = data;
                if (this.connectedUsers[receiveId]) {
                    // Lưu xuống CSDL phần chat thông tin người nhận, người gửi, message
                    connectedUsers[receiveId].emit('privateMessage', { message: message });
                } else {
                    // Lưu vào phần notification
                }
            });

            socket.on('groupMessage', (data) => {
                const { fromUserId, groupId, message } = data;
                if (this.groups[groupId]) {
                    this.groups[groupId].forEach((otherClient) => {
                        otherClient.emit('groupMessage', { from: fromUserId, message: message });
                    });
                }
            });

            socket.on('joinGroup', (groupId) => {
                if (!this.groups[groupId]) {
                    this.groups[groupId] = [];
                }

                // Thêm người dùng hiện tại vào group có id là groupId
                this.groups[groupId].push(socket);
            });

            socket.on('leaveGroup', (data) => {
                const { userId, groupId } = data;
                if (this.groups[groupId]) {
                    this.updateClientsInGroup(groupId, socket);

                    // Gửi cho tất cả user còn lại rằng user này đã rời nhóm
                    this.groups[groupId].forEach((remainingClient) => {
                        // Gửi UserId của người rời nhóm cho tất user còn lại
                        remainingClient.emit('leaveGroup', { userId: userId })
                    })
                }
            });

            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
                for (const groupId in this.groups) {
                    this.updateClientsInGroup(groupId, socket);
                }
                delete this.connectedUsers[socket.id];
            });
        })
    }

    /**
     * Cập nhật lại danh sách user trong 1 nhóm sau khi có 1 user rời nhóm hoặc disconnect 
     * @param {number} groupId 
     * @param {socketIo} socket 
     */
    updateClientsInGroup(groupId, socket) {
        this.groups[groupId] = this.groups[groupId].filter((client) => client !== socket);
    }
}

module.exports = ChatServer;