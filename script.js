import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* 🔐 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyBxyhmJB3PZm2rQh9I6ykwWwHSilG2QAsc",
  authDomain: "campus-care-3e4f3.firebaseapp.com",
  projectId: "campus-care-3e4f3",
  storageBucket: "campus-care-3e4f3.appspot.com",
  messagingSenderId: "186047827004",
  appId: "1:186047827004:web:397d62b5630067772d4739"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* UI */
const loginCard = document.getElementById("loginCard");
const issueCard = document.getElementById("issueCard");
const statusCard = document.getElementById("statusCard");
const logoutBtn = document.getElementById("logoutBtn");

const email = document.getElementById("email");
const password = document.getElementById("password");
const description = document.getElementById("description");
const imageSelect = document.getElementById("imageSelect");
const result = document.getElementById("result");
const loginResult = document.getElementById("loginResult");
const statusList = document.getElementById("statusList");

/* AUTH */
onAuthStateChanged(auth, user => {
  if (user) {
    loginCard.classList.remove("active");
    issueCard.classList.add("active");
    statusCard.classList.remove("active");
    logoutBtn.style.display = "block";
    loadStatus();
  } else {
    loginCard.classList.add("active");
    issueCard.classList.remove("active");
    statusCard.classList.remove("active");
    logoutBtn.style.display = "none";
  }
});

/* LOGIN */
window.emailLogin = async () => {
  loginResult.innerText = "";
  if (!email.value || !password.value) {
    loginResult.innerText = "Please fill all fields";
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
  } catch (e) {
    loginResult.innerText = e.message;
  }
};

/* SIGNUP */
window.emailSignup = async () => {
  loginResult.innerText = "";
  if (!email.value || !password.value) {
    loginResult.innerText = "Please fill all fields";
    return;
  }
  if (password.value.length < 6) {
    loginResult.innerText = "Password must be at least 6 characters";
    return;
  }
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    loginResult.innerText = "Account created. Login now.";
  } catch (e) {
    loginResult.innerText = e.message;
  }
};

/* GOOGLE */
window.googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
};

/* LOGOUT */
window.logout = async () => {
  await auth.signOut();
};

/* SUBMIT */
window.submitComplaint = async () => {
  if (!description.value) {
    result.innerText = "Please describe the issue";
    return;
  }
  await addDoc(collection(db, "complaints"), {
    description: description.value,
    category: imageSelect.value,
    userEmail: auth.currentUser.email,
    status: "pending",
    createdAt: serverTimestamp()
  });
  result.innerText = "Issue submitted successfully!";
  description.value = "";
};

/* STATUS + DELETE */
function loadStatus() {
  const q = query(
    collection(db, "complaints"),
    where("userEmail", "==", auth.currentUser.email)
  );

  onSnapshot(q, snapshot => {
    statusList.innerHTML = "";
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const del = d.status === "completed"
        ? `<span class="delete-btn" onclick="deleteQuery('${docSnap.id}')">✕</span>`
        : "";

      statusList.innerHTML += `
        <p>
          <b>${d.description}</b>
          ${del}<br>
          Status: ${d.status}
        </p>
      `;
    });
  });
}

window.deleteQuery = async (id) => {
  await deleteDoc(doc(db, "complaints", id));
};

/* NAV */
window.showStatus = () => {
  issueCard.classList.remove("active");
  statusCard.classList.add("active");
};

window.backToReport = () => {
  statusCard.classList.remove("active");
  issueCard.classList.add("active");
};
