// lib/firebase.ts
import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
    apiKey: "AIzaSyBii-DJzkmjgD7NF6icKudoaENOIySk8XM",
    authDomain: "six666-52a13.firebaseapp.com",
    projectId: "six666-52a13",
    storageBucket: "six666-52a13.firebasestorage.app",
    messagingSenderId: "541804078830",
    appId: "1:541804078830:web:b7d18539a026e307a2b5ff"
  };

const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

export { storage }
