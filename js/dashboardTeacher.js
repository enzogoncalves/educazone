import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import { getUserData } from "./modules.js"

const auth = getAuth()
const db = getDatabase()
let userId;

onAuthStateChanged(auth, (user) => {
  userId = user.uid

  if (user) {
    const db = getDatabase()
    const professorsRef = ref(db, "/professors/" + userId + "/studentss");

    onValue(professorsRef, (snapshot) => {
      const studentsIdsObj = snapshot.val();
      if (studentsIdsObj !== null) {
        const studentIds = Object.values(studentsIdsObj); 
        console.log("Student IDs:", studentIds);

        const table = document.getElementById("studentTable").getElementsByTagName("tbody")[0];
        let tbody = table.getElementsByTagName("tbody")[0];

        if (!tbody) {
          tbody = document.createElement("tbody");
          table.appendChild(tbody);
        }
        studentIds.forEach((studentId) => {
          const studentRef = ref(db, `/students/${studentId}`);

          onValue(studentRef, (snapshot) => {
            const studentData = snapshot.val();
            const row = table.insertRow();

            const imgCell = row.insertCell();
            imgCell.textContent = "---FOTO---";

            const firstNameCell = row.insertCell();
            firstNameCell.textContent = studentData.firstName;

            const lastNameCell = row.insertCell();
            lastNameCell.textContent = studentData.lastName;

            const accessPerfilCell  = row.insertCell();
            const btn = document.createElement('a');
            btn.setAttribute('href', '#')
            btn.textContent = "Acessar Aluno";
            accessPerfilCell.appendChild(btn);
          });
        });
      }
      else {
        console.log("Você não possui nenhum aluno")
      }
    });
  }
})