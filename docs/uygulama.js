// Vexta Admin - Firebase bağlantısı (CDN modül)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// 🔴 Firebase config – seninki birebir burada:
const firebaseConfig = {
  apiKey: "AIzaSyCuN-z_3yIGkakwLj8eehcXap6Nts8Efks",
  authDomain: "vexta-1cce5.firebaseapp.com",
  projectId: "vexta-1cce5",
  storageBucket: "vexta-1cce5.firebasestorage.app",
  messagingSenderId: "630352061374",
  appId: "1:630352061374:web:6883c8ac0c99cce4530fef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// UI
document.body.innerHTML = `
  <div style="max-width:720px;margin:40px auto;font-family:system-ui;padding:16px">
    <h1>Vexta Admin Panel</h1>

    <div id="authBox" style="border:1px solid #ddd;padding:16px;border-radius:12px;margin:16px 0">
      <h3>Giriş</h3>
      <input id="email" type="email" placeholder="E-posta" style="width:100%;padding:10px;margin:6px 0;border:1px solid #ddd;border-radius:10px" />
      <input id="pass" type="password" placeholder="Şifre" style="width:100%;padding:10px;margin:6px 0;border:1px solid #ddd;border-radius:10px" />
      <button id="loginBtn" style="padding:10px 14px;border:0;border-radius:10px;cursor:pointer">Giriş Yap</button>
      <p id="authMsg" style="color:#b00;margin-top:10px"></p>
    </div>

    <div id="panel" style="display:none;border:1px solid #ddd;padding:16px;border-radius:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
        <h3 style="margin:0">Bölümler</h3>
        <button id="logoutBtn" style="padding:10px 14px;border:0;border-radius:10px;cursor:pointer">Çıkış</button>
      </div>

      <div style="margin-top:14px;border-top:1px solid #eee;padding-top:14px">
        <h4>Yeni bölüm ekle</h4>
        <input id="title" placeholder="Başlık" style="width:100%;padding:10px;margin:6px 0;border:1px solid #ddd;border-radius:10px" />
        <textarea id="desc" placeholder="Açıklama" rows="3" style="width:100%;padding:10px;margin:6px 0;border:1px solid #ddd;border-radius:10px"></textarea>
        <button id="addBtn" style="padding:10px 14px;border:0;border-radius:10px;cursor:pointer">Ekle</button>
        <p id="msg" style="margin-top:10px"></p>
      </div>

      <div style="margin-top:18px">
        <button id="refreshBtn" style="padding:10px 14px;border:0;border-radius:10px;cursor:pointer">Listeyi Yenile</button>
        <ul id="list" style="margin-top:14px;padding-left:18px"></ul>
      </div>
    </div>
  </div>
`;

const $ = (id) => document.getElementById(id);

async function refresh() {
  $("msg").textContent = "Yükleniyor...";
  $("list").innerHTML = "";

  const snap = await getDocs(collection(db, "bölümler")); // 🔴 Firestore koleksiyon adı
  const items = [];
  snap.forEach((d) => items.push({ id: d.id, ...d.data() }));

  $("msg").textContent = `Toplam: ${items.length}`;

  items.forEach((it) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${it.başlık || it.title || ""}</strong><br/>
      <small>${it.açıklama || it.desc || ""}</small><br/>
      <button data-id="${it.id}" class="del">Sil</button>
    `;
    $("list").appendChild(li);
  });

  document.querySelectorAll(".del").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await deleteDoc(doc(db, "bölümler", id));
      await refresh();
    });
  });
}

$("loginBtn").onclick = async () => {
  try {
    await signInWithEmailAndPassword(auth, $("email").value, $("pass").value);
  } catch (e) {
    $("authMsg").textContent = e.message;
  }
};

$("logoutBtn").onclick = async () => signOut(auth);

$("addBtn").onclick = async () => {
  await addDoc(collection(db, "bölümler"), {
    başlık: $("title").value,
    açıklama: $("desc").value,
    createdAt: serverTimestamp(),
  });
  $("title").value = "";
  $("desc").value = "";
  refresh();
};

$("refreshBtn").onclick = refresh;

onAuthStateChanged(auth, (user) => {
  $("authBox").style.display = user ? "none" : "block";
  $("panel").style.display = user ? "block" : "none";
  if (user) refresh();
});
