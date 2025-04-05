// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

// Configuración de Firebase (usa tu propia configuración)
const firebaseConfig = {
    apiKey: "AIzaSyBbkEAhpV3yuBkvCBUzfaKKHXfsD4ySymg",
    authDomain: "rifa-solidaria-e39f3.firebaseapp.com",
    databaseURL: "https://rifa-solidaria-e39f3-default-rtdb.firebaseio.com",
    projectId: "rifa-solidaria-e39f3",
    storageBucket: "rifa-solidaria-e39f3.firebasestorage.app",
    messagingSenderId: "890763679093",
    appId: "1:890763679093:web:61992cc114a824dacdef3c",
    measurementId: "G-9QK9MCH3JQ"
  };

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Referencia a la base de datos
const db = getDatabase(app);

// Función para actualizar el número ganador en Firebase
const updateWinner = (winnerNumber) => {
  set(ref(db, 'rifa/winner'), winnerNumber);
};

// Función para escuchar cambios en Firebase
const listenToWinner = (callback) => {
  const winnerRef = ref(db, 'rifa/winner');
  onValue(winnerRef, (snapshot) => {
    const winner = snapshot.val();
    callback(winner);
  });
};

export { updateWinner, listenToWinner };
