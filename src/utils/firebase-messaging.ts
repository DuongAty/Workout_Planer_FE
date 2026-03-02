// src/utils/firebase-messaging.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios"; // Hoặc instance API của bạn
import axiosClient from "../api/axiosClient";


const firebaseConfig = {
  apiKey: String(import.meta.env.VITE_FIREBASE_APIKEY),
  authDomain: String(import.meta.env.VITE_FIREBASE_AUTHDOMAIN),
  projectId: String(import.meta.env.VITE_FIREBASE_PROJECTID),
  storageBucket: String(import.meta.env.VITE_FIREBASE_STORAGEBUCKET),
  messagingSenderId: String(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: String(import.meta.env.VITE_FIREBASE_APPID),
  measurementId: String(import.meta.env.VITE_FIREBASE_MEASUREMENTID),
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      const currentToken = await getToken(messaging, { 
        vapidKey: String(import.meta.env.VITE_FIREBASE_VAPID),
        serviceWorkerRegistration: registration
      });

      if (currentToken) {
        console.log('FCM Token:', currentToken);
        await axiosClient.patch('/v1/auth/fcm-token', { fcmToken: currentToken });
      }
    }
  } catch (err) {
    console.error('Lỗi khi lấy token:', err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Nhận thông báo mới:", payload);
      resolve(payload);
    });
  });