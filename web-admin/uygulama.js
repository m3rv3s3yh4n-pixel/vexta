import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "BURAYA_API_KEY",
  authDomain: "vexta-1cce5.firebaseapp.com",
  projectId: "vexta-1cce5",
  storageBucket: "vexta-1cce5.appspot.com",
  messagingSenderId: "630352061374",
  appId: "1:630352061374:web:6883c8ac0c99cce4530fef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.querySelector("p").textContent = "Admin panel Firebase'e bağlandı ✅";

console.log("Firebase OK");
