import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ✅ Vexta Firebase Config (senin paylaştığın)
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

// ---------- UI + STYLE ----------
document.body.innerHTML = `
  <div class="wrap">
    <header class="top">
      <div class="brand">Vexta <span>Admin</span></div>
      <button id="logoutBtn" class="btn ghost" style="display:none">Çıkış</button>
    </header>

    <section id="authBox" class="card">
      <h2>Giriş</h2>
      <p class="muted">Yönetici hesabınla giriş yap.</p>
      <input id="email" type="email" placeholder="E-posta" />
      <input id="pass" type="password" placeholder="Şifre" />
      <button id="loginBtn" class="btn primary">Giriş Yap</button>
      <div id="authMsg" class="err"></div>
    </section>

    <section id="panel" class="card" style="display:none">
      <h2>Dizi Ekle</h2>
      <p class="muted">Vitrine düşecek içerikleri buradan ekle.</p>

      <div class="grid">
        <div>
          <label>Başlık</label>
          <input id="title" placeholder="Örn: Evrenin Ötesi" />
        </div>
        <div>
          <label>Kategori</label>
          <select id="category">
            <option>Fantastik</option>
            <option>Gerilim – Korku</option>
            <option>Absürd Komedi</option>
            <option>Aksiyon – Polisiye</option>
            <option>Bilim Kurgu</option>
            <option>Dram</option>
            <option>Romantik Komedi</option>
          </select>
        </div>
      </div>

      <label>Poster URL</label>
      <input id="poster" placeholder="https://... (catbox vs)" />

      <div class="row">
        <label class="check"><input type="checkbox" id="featured"> <span>Öne Çıkan</span></label>
        <label class="check"><input type="checkbox" id="trending"> <span>Trend</span></label>
      </div>

      <button id="addBtn" class="btn primary">Kaydet</button>
      <div id="msg" class="muted" style="margin-top:10px"></div>

      <h3 style="margin-top:18px">Yayınlananlar</h3>
      <div id="list" class="list"></div>
    </section>

    <footer class="foot">Geliştirici: <b>Merve Mina Seyhan</b></footer>
  </div>
`;

const style = document.createElement("style");
style.textContent = `
  :root{
    --bg:#070A12;
    --card:#0B1022;
    --line:rgba(0,229,255,.18);
    --txt:#EAF2FF;
    --muted:rgba(234,242,255,.72);
    --cyan:#00E5FF;
    --red:#E50914;
    --shadow:0 18px 60px rgba(0,0,0,.55);
    --r:16px;
  }
  body{
    margin:0;
    color:var(--txt);
    font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;
    background:
      radial-gradient(1200px 600px at 15% 10%, rgba(0,229,255,.16), transparent 60%),
      radial-gradient(900px 500px at 85% 0%, rgba(229,9,20,.10), transparent 60%),
      var(--bg);
  }
  .wrap{max-width:980px;margin:0 auto;padding:16px}
  .top{display:flex;justify-content:space-between;align-items:center;margin:8px 0 14px}
  .brand{font-weight:900;font-size:22px}
  .brand span{color:var(--cyan)}
  .card{
    background:linear-gradient(180deg, rgba(11,16,34,.92), rgba(10,14,27,.82));
    border:1px solid var(--line);
    border-radius:var(--r);
    padding:16px;
    box-shadow:var(--shadow);
  }
  h2{margin:0 0 6px}
  .muted{color:var(--muted)}
  input,select{
    width:100%;
    padding:12px;
    margin-top:8px;
    border-radius:12px;
    border:1px solid rgba(255,255,255,.10);
    background:rgba(0,0,0,.25);
    color:var(--txt);
    outline:none;
  }
  label{display:block;margin-top:10px;color:var(--muted);font-size:13px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  @media(max-width:680px){.grid{grid-template-columns:1fr}}
  .row{display:flex;gap:14px;flex-wrap:wrap;margin:10px 0}
  .check{display:flex;align-items:center;gap:8px;margin:0;color:var(--txt)}
  .check input{width:auto;margin:0}
  .btn{
    display:inline-flex;align-items:center;justify-content:center;
    padding:12px 14px;border-radius:12px;border:0;cursor:pointer;
    font-weight:900;
  }
  .btn.primary{background:linear-gradient(135deg,var(--cyan),#37F3FF);color:#06131a}
  .btn.ghost{background:transparent;border:1px solid var(--line);color:var(--txt)}
  .err{color:#ffb4b4;margin-top:10px}
  .list{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px}
  @media(max-width:920px){.list{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:520px){.list{grid-template-columns:1fr}}
  .item{
    border:1px solid var(--line);
    border-radius:14px;
    overflow:hidden;
    background:rgba(0,0,0,.18);
  }
  .ph{height:160px;background:rgba(0,229,255,.08);display:flex;align-items:center;justify-content:center;color:var(--muted)}
  .body{padding:12px}
  .badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
  .badge{font-size:12px;padding:6px 10px;border-radius:999px;border:1px solid var(--line);color:var(--muted)}
  .badge.hot{border-color:rgba(229,9,20,.35);color:#ffd0d0}
  .actions{display:flex;justify-content:flex-end;margin-top:10px}
  .del{background:rgba(229,9,20,.15);color:#ffd0d0;border:1px solid rgba(229,9,20,.35)}
  .foot{opacity:.7;text-align:center;margin-top:16px;font-size:12px}
`;
document.head.appendChild(style);

const $ = (id) => document.getElementById(id);

function safe(s){ return String(s||"").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }

async function refresh(){
  $("msg").textContent = "Yükleniyor...";
  $("list").innerHTML = "";

  const snap = await getDocs(collection(db, "series"));
  const items = [];
  snap.forEach(d => items.push({ id:d.id, ...d.data() }));

  $("msg").textContent = `Toplam içerik: ${items.length}`;

  items.forEach(it=>{
    const div = document.createElement("div");
    div.className = "item";

    const poster = it.poster ? `<img src="${safe(it.poster)}" style="width:100%;height:160px;object-fit:cover;display:block" />`
                             : `<div class="ph">Poster yok</div>`;

    div.innerHTML = `
      ${poster}
      <div class="body">
        <div style="font-weight:900">${safe(it.title)}</div>
        <div class="muted" style="margin-top:4px">${safe(it.category)}</div>
        <div class="badges">
          ${it.featured ? `<span class="badge">Öne Çıkan</span>` : ``}
          ${it.trending ? `<span class="badge hot">Trend</span>` : ``}
        </div>
        <div class="actions">
          <button class="btn del" data-id="${safe(it.id)}">Sil</button>
        </div>
      </div>
    `;
    $("list").appendChild(div);
  });

  document.querySelectorAll(".del").forEach(btn=>{
    btn.onclick = async ()=>{
      await deleteDoc(doc(db,"series",btn.dataset.id));
      refresh();
    };
  });
}

$("loginBtn").onclick = async ()=>{
  $("authMsg").textContent = "";
  try{
    await signInWithEmailAndPassword(auth, $("email").value.trim(), $("pass").value);
  }catch(e){
    $("authMsg").textContent = e?.message || "Giriş hatası";
  }
};

$("logoutBtn").onclick = async ()=> { await signOut(auth); };

$("addBtn").onclick = async ()=>{
  const title = $("title").value.trim();
  const poster = $("poster").value.trim();
  const category = $("category").value;
  if(!title){ $("msg").textContent="Başlık boş olamaz."; return; }

  await addDoc(collection(db,"series"),{
    title,
    poster,
    category,
    featured: $("featured").checked,
    trending: $("trending").checked,
    createdAt: serverTimestamp()
  });

  $("title").value="";
  $("poster").value="";
  $("featured").checked=false;
  $("trending").checked=false;

  await refresh();
};

onAuthStateChanged(auth, async (user)=>{
  if(user){
    $("authBox").style.display="none";
    $("panel").style.display="block";
    $("logoutBtn").style.display="inline-flex";
    await refresh();
  }else{
    $("authBox").style.display="block";
    $("panel").style.display="none";
    $("logoutBtn").style.display="none";
  }
});
