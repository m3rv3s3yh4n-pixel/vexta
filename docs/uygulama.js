// Vexta Admin - Netflix vibe panel (HAZIR DOSYA)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// 🔥 SENİN FIREBASE CONFIG (Vexta)
const firebaseConfig = {
  apiKey: "AIzaSyCuN-z_3yIGkakwLj8eehcXap6Nts8Efks",
  authDomain: "vexta-1cce5.firebaseapp.com",
  projectId: "vexta-1cce5",
  storageBucket: "vexta-1cce5.firebasestorage.app",
  messagingSenderId: "630352061374",
  appId: "1:630352061374:web:6883c8ac0c99cce4530fef",
};

// 📦 Firestore koleksiyon adı
const COL = "contents";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// helpers
const $ = (id) => document.getElementById(id);
const setText = (id, t) => { const el = $(id); if (el) el.textContent = t; };
const show = (id) => { const el = $(id); if (el) el.classList.remove("hidden"); };
const hide = (id) => { const el = $(id); if (el) el.classList.add("hidden"); };

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

function setPill(text, ok=true){
  const pill = document.getElementById("statusPill");
  if (!pill) return;
  pill.textContent = text;
  pill.style.borderColor = ok ? "rgba(0,229,255,.18)" : "rgba(239,68,68,.35)";
  pill.style.background = ok ? "rgba(11,16,34,.55)" : "rgba(239,68,68,.10)";
}

function setTab(tabId){
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t => {
    if (t.getAttribute("data-tab") === tabId) t.classList.add("active");
  });

  ["tabAdd","tabList","tabSettings"].forEach(id => hide(id));
  show(tabId);
}

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => setTab(btn.getAttribute("data-tab")));
});

async function refreshList() {
  setText("listHint", "Yükleniyor...");
  const cards = document.getElementById("cards");
  if (cards) cards.innerHTML = "";

  const snap = await getDocs(collection(db, COL));
  const items = [];
  snap.forEach(d => items.push({ id: d.id, ...d.data() }));

  setText("kpiTotal", String(items.length));
  setText("kpiLast", items.length ? "Güncellendi" : "—");

  const q = (document.getElementById("q")?.value || "").trim().toLowerCase();
  const filtered = q
    ? items.filter(it => String(it.title || "").toLowerCase().includes(q))
    : items;

  setText("listHint", filtered.length ? "" : "Henüz içerik yok.");

  filtered.forEach((it, idx) => {
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="poster"></div>
      <div class="badgeRow">
        <div class="badge badgeCyan">Öne Çıkan</div>
        <div class="badge">Editörün Seçimi</div>
      </div>
      <div class="itemBody">
        <div class="itemTitle">${escapeHtml(it.title || "")}</div>
        <div class="itemDesc">${escapeHtml(it.desc || "")}</div>
        <div class="meta">
          <span>#${idx + 1}</span>
          <span>${COL}</span>
        </div>
        <div class="miniBtns">
          <button class="mini danger" data-del="${it.id}">Sil</button>
        </div>
      </div>
    `;
    cards?.appendChild(el);
  });

  document.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-del");
      if (!id) return;
      await deleteDoc(doc(db, COL, id));
      await refreshList();
    });
  });
}

document.getElementById("refreshBtn")?.addEventListener("click", refreshList);
document.getElementById("refreshBtnTop")?.addEventListener("click", refreshList);
document.getElementById("q")?.addEventListener("input", refreshList);

document.getElementById("loginBtn")?.addEventListener("click", async () => {
  setText("authMsg", "");
  try {
    setPill("Giriş yapılıyor...", true);
    await signInWithEmailAndPassword(auth, document.getElementById("email").value.trim(), document.getElementById("pass").value);
  } catch (e) {
    setPill("Giriş hatası", false);
    setText("authMsg", e?.message || "Giriş hatası");
  }
});

document.getElementById("logoutBtnTop")?.addEventListener("click", async () => {
  await signOut(auth);
});

document.getElementById("addBtn")?.addEventListener("click", async () => {
  const title = document.getElementById("title").value.trim();
  const desc = document.getElementById("desc").value.trim();

  if (!title) return setText("msg", "Başlık boş olamaz.");

  setText("msg", "Ekleniyor...");
  await addDoc(collection(db, COL), { title, desc, createdAt: serverTimestamp() });

  document.getElementById("title").value = "";
  document.getElementById("desc").value = "";
  setText("msg", "✅ Eklendi!");
  setTab("tabList");
  await refreshList();
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    hide("authBox");
    show("panel");
    show("logoutBtnTop");
    setPill("Admin oturum açık ✅", true);
    setText("kpiAuth", "Açık");
    setTab("tabList");
    await refreshList();
  } else {
    show("authBox");
    hide("panel");
    hide("logoutBtnTop");
    setPill("Giriş bekleniyor...", true);
    setText("kpiAuth", "Kapalı");
    setText("kpiTotal", "—");
    setText("kpiLast", "—");
  }
});
