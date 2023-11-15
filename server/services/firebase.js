// Firebase chỉ cho phép khởi tạo một Firebase App duy nhất trong một ứng dụng.
// Nên sẽ export ra cho các file dùng
const FirebaseStorage = require('../services/firebase-service');
const firebaseStorage = new FirebaseStorage();

module.exports = firebaseStorage;