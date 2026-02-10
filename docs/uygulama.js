// Vexta Admin - Firebase bağlantısı (CDN modül)
// 1) Firebase Console > Proje Ayarları > Uygulamalarınız > "Vexta Yöneticisi (Web)"
// 2) Oradaki config değerlerini aşağıdaki firebaseConfig içine kopyala

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ✅ BURAYI Firebase Console’dan kopyaladığın config ile değiştir
const firebaseConfig = {
  apiKey: "BURAYA",
  authDomain: "BURAYA",
  projectId: "BURAYA",
  storageBucket: "BURAYA",
  messagingSenderId: "BURAYA",
  appId: "BURAYA",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Basit UI (index.html'deki <body> içine yazdırıyoruz)
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
        <h3 style="margin:0">İçerikler</h3>
        <button id="logoutBtn" style="padding:10px 14px;border:0;border-radius:10px;cursor:pointer">Çıkış</button>
      </div>

      <div style="margin-top:14px;border-top:1px solid #eee;padding-top:14px">
        <h4>Yeni içerik ekle</h4>
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

  const snap = await getDocs(collection(db, "contents"));
  const items = [];
  snap.forEach((d) => items.push({ id: d.id, ...d.data() }));

  $("msg").textContent = `Toplam: ${items.length}`;

  items.forEach((it) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${escapeHtml(it.title || "")}</strong><br/>
      <small>${escapeHtml(it.desc || "")}</small><br/>
      <button data-id="${it.id}" class="del" style="margin-top:8px;padding:6px 10px;border:0;border-radius:10px;cursor:pointer">Sil</button>
    `;
    $("list").appendChild(li);
  });

  document.querySelectorAll(".del").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await deleteDoc(doc(db, "contents", id));
      await refresh();
    });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

$("loginBtn").addEventListener("click", async () => {
  $("authMsg").textContent = "";
  try {
    await signInWithEmailAndPassword(auth, $("email").value.trim(), $("pass").value);
  } catch (e) {
    $("authMsg").textContent = e?.message || "Giriş hatası";
  }
});

$("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
});

$("addBtn").addEventListener("click", async () => {
  $("msg").textContent = "";
  const title = $("title").value.trim();
  const desc = $("desc").value.trim();
  if (!title) return ($("msg").textContent = "Başlık boş olamaz.");

  await addDoc(collection(db, "contents"), {
    title,
    desc,
    createdAt: serverTimestamp(),
  });

  $("title").value = "";
  $("desc").value = "";
  await refresh();
});

$("refreshBtn").addEventListener("click", refresh);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    $("authBox").style.display = "none";
    $("panel").style.display = "block";
    await refresh();
  } else {
    $("authBox").style.display = "block";
    $("panel").style.display = "none";
  }
});
