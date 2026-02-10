<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// 🔥 VEXTA Firebase Config (senin paylaştığın)
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

document.body.style.background = "#0f0f0f";
document.body.style.color = "#fff";
document.body.style.fontFamily = "system-ui";

document.body.innerHTML = `
<div style="max-width:900px;margin:20px auto;padding:16px">
  <h1 style="text-align:center">🎬 Vexta – Admin Panel</h1>

  <div id="authBox" style="background:#1a1a1a;padding:16px;border-radius:12px">
    <input id="email" placeholder="E-posta" style="width:100%;padding:10px;margin:6px 0"/>
    <input id="pass" type="password" placeholder="Şifre" style="width:100%;padding:10px;margin:6px 0"/>
    <button id="loginBtn" style="width:100%;padding:12px;background:#e50914;color:#fff;border:0;border-radius:10px">Giriş Yap</button>
    <p id="authMsg"></p>
  </div>

  <div id="panel" style="display:none;margin-top:20px">
    <button id="logoutBtn" style="float:right;background:#333;color:#fff;padding:8px;border:0;border-radius:8px">Çıkış</button>

    <h2>Yeni Dizi / Bölüm Ekle</h2>
    <input id="title" placeholder="Başlık" style="width:100%;padding:10px;margin:6px 0"/>
    <input id="poster" placeholder="Poster URL" style="width:100%;padding:10px;margin:6px 0"/>
    <select id="category" style="width:100%;padding:10px;margin:6px 0">
      <option>Fantastik</option>
      <option>Gerilim</option>
      <option>Absürd Komedi</option>
      <option>Aksiyon</option>
      <option>Bilim Kurgu</option>
      <option>Dram</option>
      <option>Romantik Komedi</option>
    </select>

    <label>
      <input type="checkbox" id="featured"/> Öne Çıkan
    </label>
    <label>
      <input type="checkbox" id="trending"/> Trend
    </label>

    <button id="addBtn" style="width:100%;padding:12px;background:#e50914;color:#fff;border:0;border-radius:10px;margin-top:8px">Kaydet</button>

    <h3 style="margin-top:20px">Yüklenenler</h3>
    <ul id="list"></ul>
  </div>

  <p style="text-align:center;opacity:.5;margin-top:40px">Geliştirici: Merve Mina Seyhan</p>
</div>
`;

const $ = (id) => document.getElementById(id);

async function refresh() {
  $("list").innerHTML = "";
  const snap = await getDocs(collection(db, "series"));
  snap.forEach((d) => {
    const it = d.data();
    const li = document.createElement("li");
    li.style.margin = "10px 0";
    li.innerHTML = `
      <b>${it.title}</b> (${it.category}) 
      ${it.featured ? "⭐" : ""} ${it.trending ? "🔥" : ""}
      <br/><img src="${it.poster}" style="height:120px;border-radius:8px;margin:6px 0"/>
      <br/><button data-id="${d.id}" class="del">Sil</button>
    `;
    $("list").appendChild(li);
  });

  document.querySelectorAll(".del").forEach(btn => {
    btn.onclick = async () => {
      await deleteDoc(doc(db, "series", btn.dataset.id));
      refresh();
    };
  });
}

$("loginBtn").onclick = async () => {
  try {
    await signInWithEmailAndPassword(auth, $("email").value, $("pass").value);
  } catch(e) {
    $("authMsg").innerText = "Giriş hatası";
  }
};

$("logoutBtn").onclick = () => signOut(auth);

$("addBtn").onclick = async () => {
  await addDoc(collection(db, "series"), {
    title: $("title").value,
    poster: $("poster").value,
    category: $("category").value,
    featured: $("featured").checked,
    trending: $("trending").checked,
    createdAt: serverTimestamp()
  });
  refresh();
};

onAuthStateChanged(auth, (u) => {
  $("authBox").style.display = u ? "none" : "block";
  $("panel").style.display = u ? "block" : "none";
  if (u) refresh();
});
</script>
