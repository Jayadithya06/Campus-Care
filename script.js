// 🔥 Firebase SDK imports
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
  onSnapshot
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

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* 🧩 UI ELEMENTS */
const loginCard = document.getElementById("loginCard");
const issueCard = document.getElementById("issueCard");
const statusCard = document.getElementById("statusCard");

const email = document.getElementById("email");
const password = document.getElementById("password");
const description = document.getElementById("description");
const imageSelect = document.getElementById("imageSelect");
const result = document.getElementById("result");
const statusList = document.getElementById("statusList");

/* 🔄 AUTH STATE LISTENER */
onAuthStateChanged(auth, user => {
  if (user) {
    loginCard.classList.remove("active");
    issueCard.classList.add("active");
    loadStatus();
  } else {
    loginCard.classList.add("active");
    issueCard.classList.remove("active");
    statusCard.classList.remove("active");
  }
});

/* 📧 EMAIL LOGIN / SIGNUP */
window.emailLogin = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
  } catch (error) {
    // If user not found, create new account
    await createUserWithEmailAndPassword(auth, email.value, password.value);
  }
};

/* 🔵 GOOGLE LOGIN */
window.googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
};

/* 📝 SUBMIT ISSUE */
window.submitComplaint = async () => {
  if (!auth.currentUser) return;

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

/* 📡 REAL-TIME STATUS TRACKING */
function loadStatus() {
  const q = query(
    collection(db, "complaints"),
    where("userEmail", "==", auth.currentUser.email)
  );

  onSnapshot(q, snapshot => {
    statusList.innerHTML = "";
    snapshot.forEach(doc => {
      const d = doc.data();
      statusList.innerHTML += `
        <p>
          <b>${d.description}</b><br>
          Status: ${d.status}
        </p>
      `;
    });
  });
}

/* 🔁 NAVIGATION */
window.showStatus = () => {
  issueCard.classList.remove("active");
  statusCard.classList.add("active");
};

window.backToReport = () => {
  statusCard.classList.remove("active");
  issueCard.classList.add("active");
};
