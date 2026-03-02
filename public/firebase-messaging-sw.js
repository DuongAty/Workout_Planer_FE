// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAy-xpcpnATS04ZjD9u_zWu2FyXFsUyafs",
  authDomain: "duongaty-ec76a.firebaseapp.com",
  projectId: "duongaty-ec76a",
  storageBucket: "duongaty-ec76a.firebasestorage.app",
  messagingSenderId: "707050885655",
  appId: "1:707050885655:web:2aef1a220411d98fe90252",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Lắng nghe thông báo khi ứng dụng chạy ngầm (background)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png' // Đường dẫn icon nếu có
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});