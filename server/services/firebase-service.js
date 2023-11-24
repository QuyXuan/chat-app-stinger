const admin = require('firebase-admin');
const serviceAccount = require('../firebase-admin-key.json');
const storageBucketName = 'chatappstinger.appspot.com';

class FirebaseService {
    constructor() {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: storageBucketName
        });

        this.bucket = admin.storage().bucket();
    }

    async saveBase64ToImageFolder(base64Data, fileName, type) {
        try {
            // Do base64 đọc lúc đọc file có xuất hiện data:image/png;base64, ở phía trước nên ta cần loại bỏ nó trước khi lưu vào firebase
            const base64 = base64Data.split(',')[1];
            const buffer = Buffer.from(base64, 'base64');

            // Tạo ra 1 đường dẫn lưu trong thư mục images
            const file = this.bucket.file(`${type}s/${fileName}`);
            await file.save(buffer, {
                metadata: {
                    content: 'image/jpeg'
                }
            });

            // Lấy đường link mà ta đã lưu ảnh vào Storage
            const [url] = await file.getSignedUrl({
                action: 'read',
                // Nếu không chỉ định expires thì thời hạn của url này chỉ được 15 phút
                expires: '01-01-2100'
            });

            return url;
        }
        catch (e) {
            console.log('saveBase64ToImageFolder' + e.message);
        }
    }

    async saveBufferToAudioFolder(bufferData, fileName) {
        try {
            const file = this.bucket.file(`audios/${fileName}`);
            await file.save(bufferData, {
                metadata: {
                    content: 'audio/ogg'
                }
            });
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '01-01-2100'
            });
            return url;
        }
        catch (e) {
            console.log('saveBufferToAudioFolder' + e.message);
        }
    }

    async saveAudioIntoDB(chatId, fromUserId, audioURL) {
        try {
            const db = admin.firestore();
            const userRef = db.collection('users').doc(fromUserId);
            const userDoc = await userRef.get();
            if (userDoc.exists) {
                const chatRef = db.collection('chats').doc(chatId);
                const messageCollection = chatRef.collection('messages');
                const today = admin.firestore.FieldValue.serverTimestamp();

                await chatRef.update({
                    lastMessage: `audio.xyz`,
                    lastMessageDate: today
                });

                await messageCollection.add({
                    senderId: fromUserId,
                    displayName: userDoc.data()['displayName'],
                    sentDate: today,
                    avatar: userDoc.data()['photoURL'],
                    text: audioURL,
                    type: 'audio'
                });
            }
        }
        catch (e) {
            console.log('saveAudioIntoDB' + e.message);
        }
    }

    async saveDataFilesIntoDB(chatId, fromUserId, uploadDataFiles, type) {
        try {
            const db = admin.firestore();
            const userRef = db.collection('users').doc(fromUserId);
            const userDoc = await userRef.get();
            if (userDoc.exists) {
                const chatRef = db.collection('chats').doc(chatId);
                const messageCollection = chatRef.collection('messages');
                const today = admin.firestore.FieldValue.serverTimestamp();

                await chatRef.update({
                    lastMessage: `${userDoc.data()['displayName']} had sent ${uploadDataFiles.length} ${type}(s).`,
                    lastMessageDate: today
                });

                await messageCollection.add({
                    senderId: fromUserId,
                    displayName: userDoc.data()['displayName'],
                    sentDate: today,
                    avatar: userDoc.data()['photoURL'],
                    dataFiles: uploadDataFiles,
                    type: type
                });
            }
        }
        catch (e) {
            console.log('saveDataFilesIntoDB' + e.message);
        }
    }

    async saveMessageIntoDB(chatId, fromUserId, message, type) {
        try {
            const db = admin.firestore();
            const userRef = db.collection('users').doc(fromUserId);
            const userDoc = await userRef.get();
            if (userDoc.exists) {
                const chatRef = db.collection('chats').doc(chatId);
                const messageCollection = chatRef.collection('messages');
                const today = admin.firestore.FieldValue.serverTimestamp();

                await chatRef.update({
                    lastMessage: (type === 'link') ? 'link.xyz' : message,
                    lastMessageDate: today
                });

                await messageCollection.add({
                    senderId: fromUserId,
                    displayName: userDoc.data()['displayName'],
                    sentDate: today,
                    avatar: userDoc.data()['photoURL'],
                    text: message,
                    type: type
                });
            }
        }
        catch (e) {
            console.log('saveMessageIntoDB' + e.message);
        }
    }

    async getUsersInChatRoom(chatId) {
        try {
            const db = admin.firestore();
            const chatRef = db.collection('chats').doc(chatId);
            const chatDoc = await chatRef.get();
            if (chatDoc.exists) {
                return chatDoc.data()['userIds'];
            }
            return [];
        }
        catch (e) {
            console.log('getUsersInChatRoom' + e.message);
        }
    }
}

module.exports = FirebaseService;