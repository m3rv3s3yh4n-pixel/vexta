import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

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

document.body.innerHTML = `
  <div style="max-width:860px;margin:32px auto;font-family:system-ui;padding:16px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
      <h1 style="margin:0">Vexta Admin Panel</h1>
      <div style="opacity:.7;font-size:13px">Geliştirici: Merve Mina Seyhan</div>
    </div>

    <div id="authBox" style="border:1px solid #e5e5e5;padding:16px;border-radius:14px;margin:16px 0">
      <h3 style="margin:0 0 10px">Giriş</h3>
      <input id="email" type="email" placeholder="E-posta" style="width:100%;padding:12px;margin:6px 0;border:1px solid #ddd;border-radius:12px" />
      <input id="pass" type="password" placeholder="Şifre" style="width:100%;padding:12px;margin:6px 0;border:1px solid #ddd;border-radius:12px" />
      <button id="loginBtn" style="padding:12px 14px;border:0;border-radius:12px;cursor:pointer;font-weight:700">Giriş Yap</button>
      <p id="authMsg" style="color:#b00;margin-top:10px"></p>
    </div>

    <div id="panel" style="display:none;border:1px solid #e5e5e5;padding:16px;border-radius:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
        <h3 style="margin:0">İçerikler</h3>
        <button id="logoutBtn" style="padding:12px 14px;border:0;border-radius:12px;cursor:pointer;font-weight:700">Çıkış</button>
      </div>

      <div style="margin-top:14px;border-top:1px solid #eee;padding-top:14px">
        <h4>Yeni içerik ekle</h4>

        <input id="title" placeholder="Başlık" style="width:100%;padding:12px;margin:6px 0;border:1px solid #ddd;border-radius:12px" />
        <input id="category" placeholder="Kategori (Fantastik / Komedi / Gerilim...)" style="width:100%;padding:12px;margin:6px 0;border:1px solid #ddd;border-radius:12px" />
        <input id="poster" placeholder="Poster URL (https://...png/jpg)" style="width:100%;padding:12px;margin:6px 0;border:1px solid #ddd;border-radius:12px" />

        <div style="display:flex;gap:10px;flex-wrap:wrap;margin:8px 0">
          <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="badgeFeatured" /> Öne Çıkan</label>
          <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="badgeTrend" /> Trend</label>
          <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="badgeEditor" /> Editörün Seçimi</label>
        </div>

        <textarea id="desc" placeholder="Açıklama" rows="3" style="width:100%;padding:12px;margin:6px 0;border:1px solid #ddd;border-radius:12px"></textarea>

        <button id="addBtn" style="padding:12px 14px;border:0;border-radius:12px;cursor:pointer;font-weight:800">Ekle</button>
        <p id="msg" style="margin-top:10px"></p>
      </div>

      <div style="margin-top:18px">
        <button id="refreshBtn" style="padding:12px 14px;border:0;border-radius:12px;cursor:pointer;font-weight:700">Listeyi Yenile</button>
        <div id="list" style="margin-top:14px;display:grid;gap:10px"></div>
      </div>
    </div>
  </div>
`;

const $ = (id) => document.getElementById(id);

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

async function refresh() {
  $("msg").textContent = "Yükleniyor...";
  $("list").innerHTML = "";

  const snap = await getDocs(collection(db, "contents"));
  const items = [];
  snap.forEach((d) => items.push({ id: d.id, ...d.data() }));

  $("msg").textContent = `Toplam içerik: ${items.length}`;

  items
    .sort((a,b) => (b?.createdAt?.seconds || 0) - (a?.createdAt?.seconds || 0))
    .forEach((it) => {
      const badges = [];
      if (it.badges?.featured) badges.push("Öne Çıkan");
      if (it.badges?.trend) badges.push("Trend");
      if (it.badges?.editor) badges.push("Editörün Seçimi");

      const box = document.createElement("div");
      box.style.border = "1px solid #eee";
      box.style.borderRadius = "14px";
      box.style.padding = "12px";

      box.innerHTML = `
        <div style="display:flex;gap:12px;align-items:flex-start">
          <div style="width:84px;height:112px;border-radius:12px;background:#f4f4f4;overflow:hidden;flex:0 0 auto">
            ${it.posterUrl ? `<img src="${escapeHtml(it.posterUrl)}" style="width:100%;height:100%;object-fit:cover" />` : ""}
          </div>
          <div style="flex:1">
            <div style="font-weight:900">${escapeHtml(it.title || "")}</div>
            <div style="opacity:.7;font-size:13px">${escapeHtml(it.category || "")}</div>
            <div style="margin-top:6px;font-size:13px;line-height:1.35">${escapeHtml(it.desc || "")}</div>
            <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
              ${badges.map(b => `<span style="font-size:12px;border:1px solid #ddd;padding:4px 8px;border-radius:999px">${b}</span>`).join("")}
            </div>
            <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap">
              <button class="del" data-id="${it.id}" style="padding:8px 10px;border:0;border-radius:12px;cursor:pointer;font-weight:700">Sil</button>
            </div>
          </div>
        </div>
      `;
      $("list").appendChild(box);
    });

  document.querySelectorAll(".del").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await deleteDoc(doc(db, "contents", id));
      await refresh();
    });
  });
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
  const category = $("category").value.trim();
  const posterUrl = $("poster").value.trim();

  if (!title) return ($("msg").textContent = "Başlık boş olamaz.");

  const badges = {
    featured: $("badgeFeatured").checked,
    trend: $("badgeTrend").checked,
    editor: $("badgeEditor").checked
  };

  await addDoc(collection(db, "contents"), {
    title,
    desc,
    category,
    posterUrl,
    badges,
    createdAt: serverTimestamp()
  });

  $("title").value = "";
  $("desc").value = "";
  $("category").value = "";
  $("poster").value = "";
  $("badgeFeatured").checked = false;
  $("badgeTrend").checked = false;
  $("badgeEditor").checked = false;

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
