import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
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

const loginCard = document.getElementById("loginCard");
const issueCard = document.getElementById("issueCard");
const statusCard = document.getElementById("statusCard");
const statusList = document.getElementById("statusList");
const loginResult = document.getElementById("loginResult");
const emailBtn = document.getElementById("emailBtn");

let cooldown = false;

/* AUTH STATE */
onAuthStateChanged(auth, user => {
  loginCard.classList.toggle("active", !user);
  issueCard.classList.toggle("active", !!user);
  statusCard.classList.remove("active");
  if (user) loadStatus();
});

/* COOLDOWN */
function startCooldown() {
  cooldown = true;
  emailBtn.disabled = true;
  setTimeout(() => {
    cooldown = false;
    emailBtn.disabled = false;
  }, 3000);
}

/* LOGIN */
window.emailLogin = async () => {
  if (cooldown) return;
  loginResult.innerText = "";
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
  } catch {
    loginResult.innerText = "Invalid email or password.";
    startCooldown();
  }
};

/* SIGNUP */
window.emailSignup = async () => {
  if (cooldown) return;
  loginResult.innerText = "";
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
  } catch {
    loginResult.innerText = "Account exists or weak password.";
    startCooldown();
  }
};

/* GOOGLE */
window.googleLogin = async () => {
  await signInWithPopup(auth, new GoogleAuthProvider());
};

/* LOGOUT */
window.logout = async () => {
  await signOut(auth);
};

/* SUBMIT */
window.submitComplaint = async () => {
  await addDoc(collection(db, "complaints"), {
    description: description.value,
    category: imageSelect.value,
    userEmail: auth.currentUser.email,
    status: "Pending",
    createdAt: serverTimestamp()
  });
  result.innerText = "Issue submitted successfully!";
  description.value = "";
};

/* LOAD + DELETE */
function loadStatus() {
  const q = query(
    collection(db, "complaints"),
    where("userEmail", "==", auth.currentUser.email)
  );

  onSnapshot(q, snapshot => {
    statusList.innerHTML = "";
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      statusList.innerHTML += `
        <div class="query-item">
          <b>${d.description}</b><br>
          Category: ${d.category}<br>
          Status: ${d.status}<br>
          <button class="delete-btn" onclick="deleteQuery('${docSnap.id}')">
            Delete
          </button>
        </div>
      `;
    });
  });
}

/* DELETE QUERY */
window.deleteQuery = async (id) => {
  if (confirm("Are you sure you want to delete this query?")) {
    await deleteDoc(doc(db, "complaints", id));
  }
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
