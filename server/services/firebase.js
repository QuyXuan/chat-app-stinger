// Firebase chỉ cho phép khởi tạo một Firebase App duy nhất trong một ứng dụng.
// Nên sẽ export ra cho các file dùng
const FirebaseService = require('../services/firebase-service');
const firebaseService = new FirebaseService();

module.exports = firebaseService;