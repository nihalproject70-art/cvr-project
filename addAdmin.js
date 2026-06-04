import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcxvKbVoSiR2LSin2R-LvMui8aXibObQE",
  authDomain: "cvr-e85c2.firebaseapp.com",
  projectId: "cvr-e85c2",
  storageBucket: "cvr-e85c2.firebasestorage.app",
  messagingSenderId: "112010781487",
  appId: "1:112010781487:web:efe27c9cd45625cc86f7da"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addAdmin() {
  const email = "jayaharisb@gmail.com".toLowerCase();
  
  try {
    await setDoc(doc(db, "admins", email), {
      role: "superAdmin",
      addedBy: "system",
      createdAt: serverTimestamp(),
    });
    console.log(`Successfully added ${email} as superAdmin!`);
  } catch (e) {
    console.error(`Error adding admin:`, e);
  }
  process.exit(0);
}

addAdmin();
