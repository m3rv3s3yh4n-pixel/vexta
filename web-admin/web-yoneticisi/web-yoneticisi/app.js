// Firebase config (kendi projeninkini buraya yapıştır)
const firebaseConfig = {
  apiKey: "BURAYA_KENDİ_API_KEY",
  authDomain: "vexta-1cce5.firebaseapp.com",
  projectId: "vexta-1cce5",
  storageBucket: "vexta-1cce5.appspot.com",
  messagingSenderId: "630352061374",
  appId: "BURAYA_KENDİ_APP_ID"
};

// Firebase başlat
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Submissions listele
async function loadSubmissions() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  const snap = await db.collection("submissions").get();
  snap.forEach(doc => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${doc.id} - ${doc.data().status}
      <button onclick="approve('${doc.id}')">Onayla</button>
      <button onclick="reject('${doc.id}')">Reddet</button>
    `;
    list.appendChild(li);
  });
}

function approve(id) {
  db.collection("submissions").doc(id).update({ status: "approved" });
}

function reject(id) {
  db.collection("submissions").doc(id).update({ status: "rejected" });
}
