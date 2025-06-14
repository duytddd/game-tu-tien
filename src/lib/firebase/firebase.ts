// src/lib/firebase/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { firebaseConfig } from "@/lib/firebase/config"; // File này đọc "chìa khóa" từ file config bên cạnh

// Khởi tạo Firebase App một cách an toàn để tránh lỗi khi Next.js render nhiều lần
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo các dịch vụ cần thiết
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, 'asia-southeast1'); // Chọn đúng khu vực của em

// Xuất ra để các file khác trong dự án có thể sử dụng
export { app, auth, db, functions };