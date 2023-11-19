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

    async saveBase64ToImageFolder(base64Data, fileName) {
        // Do base64 đọc lúc đọc file có xuất hiện data:image/png;base64, ở phía trước nên ta cần loại bỏ nó trước khi lưu vào firebase
        const base64 = base64Data.split(',')[1];
        const buffer = Buffer.from(base64, 'base64');

        // Tạo ra 1 đường dẫn lưu trong thư mục images
        const file = this.bucket.file(`images/${fileName}`);
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

    async saveBufferToAudioFolder(bufferData, fileName) {
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

    async saveAudioIntoDB(chatId, fromUserId, audioURL) {
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

    async saveImagesIntoDB(chatId, fromUserId, uploadImages) {
        const db = admin.firestore();
        const userRef = db.collection('users').doc(fromUserId);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
            const chatRef = db.collection('chats').doc(chatId);
            const messageCollection = chatRef.collection('messages');
            const today = admin.firestore.FieldValue.serverTimestamp();

            await chatRef.update({
                lastMessage: `${userDoc.data()['displayName']} đã gửi ${uploadImages.length} ảnh.`,
                lastMessageDate: today
            });

            await messageCollection.add({
                senderId: fromUserId,
                sentDate: today,
                displayName: userDoc.data()['displayName'],
                avatar: userDoc.data()['photoURL'],
                images: uploadImages,
                type: 'image'
            });
        }
    }

    async getUsersInChatRoom(chatId) {
        const db = admin.firestore();
        const chatRef = db.collection('chats').doc(chatId);
        const chatDoc = await chatRef.get();
        if (chatDoc.exists) {
            return chatDoc.data()['userIds'];
        }
        return [];
    }
}

module.exports = FirebaseService;