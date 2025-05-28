// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBCIiibwfWCX-424qX_wImSSrCpaKf0kU4",
  authDomain: "crossplat-lec.firebaseapp.com",
  projectId: "crossplat-lec",
  storageBucket: "crossplat-lec.appspot.com", // ✅ Diperbaiki dari .firebasestorage.app
  messagingSenderId: "397652802997",
  appId: "1:397652802997:web:a6966a06f24c329632edfc"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi layanan Firestore dan Storage
export const db = getFirestore(app);
export const storage = getStorage(app); // ✅ Tambahkan 'app' sebagai parameter

// Jika ingin, bisa tetap export config
export default firebaseConfig;
