// Official Google Firebase SDK Configuration (Project: e-school-f0fc3)
window.firebaseConfig = {
  apiKey: "AIzaSyCOlot0FFen7i16KVaJHYwtzJvphCPeF6c",
  authDomain: "e-school-f0fc3.firebaseapp.com",
  projectId: "e-school-f0fc3",
  storageBucket: "e-school-f0fc3.firebasestorage.app",
  messagingSenderId: "494440757378",
  appId: "1:494440757378:web:18d3b1cadf9f7b41cb1c9b",
  measurementId: "G-9G43KLLVF6"
};

// Initialize Firebase SDK & Services
if (typeof firebase !== 'undefined') {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(window.firebaseConfig);
    }
    window.db = firebase.firestore();
    window.auth = firebase.auth();
    console.log("🔥 Live Google Firebase & Cloud Firestore connected! (Project: e-school-f0fc3)");
  } catch (err) {
    console.error("Firebase init error:", err);
  }
}
