import { getFirestore, doc, getDoc, getDocs, collection, query, where, setDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { app } from "./initializeFirebase.js"

const studentId = "uWGDHuwADSYDu3Cfhp3w7DBl3323"
const professorId = "2GXl4EP5uQhb9JaQRDNpAdm2PET2"

const db = getFirestore(app)

// const docRef = doc(db, "professors", "2GXl4EP5uQhb9JaQRDNpAdm2PET2");
// const docSnap = await getDoc(docRef);

// const querySnapshot = await getDocs(collection(db, "professors"));
// querySnapshot.forEach((doc) => {
//   // doc.data() is never undefined for query doc snapshots
//   console.log(doc.id, " => ", doc.data());
// });

// if (docSnap.exists()) {
//   console.log("Document data:", docSnap.data());
// } else {
//   // docSnap.data() will be undefined in this case
//   console.log("No such document!");
// }

// Pega todos os alunos de acordo com o id do professor
// const q = query(collection(db, "students"), where("professors", "array-contains", professorId));

// Pega todos os pagamentos do aluno de acordo com o ID do aluno

const q = query(collection(db, "payments"), where("studentId", "==", studentId))

const querySnapshot = await getDocs(q)
querySnapshot.forEach(doc => {
	console.log(doc.id, " => ", doc.data())
})
