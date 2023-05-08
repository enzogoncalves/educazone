import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
// import { getUserData } from "./modules.js"

const auth = getAuth()
const db = getDatabase()
let userId;

// onAuthStateChanged(auth, (user) => {
//   userId = user.uid

//   if (user) {
//     const db = getDatabase()
//     const professorsRef = ref(db, "/professors/" + userId + "/studentss");

//     onValue(professorsRef, (snapshot) => {
//       const studentsIdsObj = snapshot.val();
//       if (studentsIdsObj !== null) {
//         const studentIds = Object.values(studentsIdsObj); 
//         console.log("Student IDs:", studentIds);

//         const table = document.getElementById("studentTable").getElementsByTagName("tbody")[0];
//         let tbody = table.getElementsByTagName("tbody")[0];

//         if (!tbody) {
//           tbody = document.createElement("tbody");
//           table.appendChild(tbody);
//         }
//         studentIds.forEach((studentId) => {
//           const studentRef = ref(db, `/students/${studentId}`);

//           onValue(studentRef, (snapshot) => {
//             const studentData = snapshot.val();
//             const row = table.insertRow();

//             const imgCell = row.insertCell();
//             imgCell.textContent = "---FOTO---";

//             const firstNameCell = row.insertCell();
//             firstNameCell.textContent = studentData.firstName;

//             const lastNameCell = row.insertCell();
//             lastNameCell.textContent = studentData.lastName;

//             const accessPerfilCell  = row.insertCell();
//             const btn = document.createElement('a');
//             btn.setAttribute('href', '#')
//             btn.textContent = "Acessar Aluno";
//             accessPerfilCell.appendChild(btn);
//           });
//         });
//       }
//       else {
//         console.log("Você não possui nenhum aluno")
//       }
//     });
//   }
// })


// function testes() {
//   const auth = getAuth();
//   onAuthStateChanged(auth, (user) => {
//     if (user) {
//       const userId = user.uid;
//       const db = getDatabase();
//       const professorsRef = ref(db, "/professors/" + userId + "/students");
//       // Rest of your code related to professorsRef
//       console.log('to no teste')
//     }
//   });
// }

// testes()


// function createTable() {
//   const table = document.getElementById("studentTable").getElementsByTagName("tbody")[0];

//   if (!table) {
//     const newTable = document.createElement("tbody");
//     newTable.id = "studentTableBody";
//     table.appendChild(newTable);
//   }
// }

// function addStudentRow(studentData) {
//   createTable()

//   const tableBody = document.getElementById("studentsfinancies");
//   const newRow = document.createElement("tr");

//   newRow.innerHTML = `
//     <td>---FOTO---</td>
//     <td>studentData.firstName</td>
//     <td>studentData.lastName</td>
//     <td><a href="#">Acessar Aluno</a></td>

//   `;

//   tableBody.appendChild(newRow);
// }
// addStudentRow()






// ======================================
// para criar a tabela dos meus alunos

function retrieveData() {
  const auth = getAuth();
  const db = getDatabase();
  let userId;

  onAuthStateChanged(auth, (user) => {
    userId = user.uid;

    if (user) {
      const professorsRef = ref(db, "/professors/" + userId + "/studentss");

      onValue(professorsRef, (snapshot) => {
        const studentsIdsObj = snapshot.val();
        if (studentsIdsObj !== null) {
          const studentIds = Object.values(studentsIdsObj);
          console.log("Student IDs:", studentIds);

          createTable(studentIds, db, "studentTable");
          tableFinancies(studentIds, db, "financies"); // Call tableFinancies here

        } else {
          console.log("Você não possui nenhum aluno");
        }
      });
    }
  });
}


function createTable(studentIds, db, tableId) {
  const table = document.getElementById(tableId).getElementsByTagName("tbody")[0];
  console.log(tableId)
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
      imgCell.classList.add('studentData')
      imgCell.textContent = "---FOTO---";

      const firstNameCell = row.insertCell();
      firstNameCell.classList.add('studentData')
      firstNameCell.textContent = studentData.firstName;

      const lastNameCell = row.insertCell();
      lastNameCell.classList.add('studentData')
      lastNameCell.textContent = studentData.lastName;

      const accessPerfilCell = row.insertCell();
      const btn = document.createElement("a");
      btn.setAttribute("href", "#");
      btn.textContent = "Acessar Aluno";
      accessPerfilCell.appendChild(btn);

    });
  });
}

retrieveData()
// =================================================

// methodo de finanças

// 1. pegar os alunos que estão registrados no professor logado
// 2. acessar os dados desse alunos
// 3. acessar o nó específico de pagamentos nesses alunos ou será que esse nó fica com o professor?
// 4. criar a tabela no HTML
// 5. criar as linhas dessa tabela com o javascript
// 6. adicionar os dados nas linhas dessa tabela
// 7. adicionar essas linhas no HTML

// para isso será necessario:
// 1. metodo para criar a tabela
// 2. metodo para pegar os dados e adicionbar esses dados na tabela

function tableFinancies(studentIds, db, tableId) {
  const table = document.getElementById(tableId).getElementsByTagName("tbody")[0];
  // verificar se existe o tbody. Se nao existe, cria um elemento tbody
  if (!tbody) {
    tbody = document.createElement('tbody');
    table.appendChild(tbody)
  }

  studentIds.forEach((studentId) => {
    // selecionar os dados do firebase
    const studentRef = ref(db, 'students/' + studentId );
    onValue(studentRef, (snapshot) => {
      const data = snapshot.val();
      if(!data)
      {
        console.log("Name:", data.firstName);
        console.log("data true: " + data)
      }
      console.log("tableId:"+tableId);
      console.log("studentId:"+studentId)

      var pendencia = ""
      if (data ) {
        const firstName = data.firstName;
        const pendencies = data.pendencies;
        
        if(pendencies == true)
        {
          pendencia = "pago"
          console.log('pago')
        }
        else{
          pendencia = "nao pago"
          console.log('nao pago')
        }
        console.log("Name:", firstName);
        console.log("Pendencies:", pendencies);
  
      }
      
      const row = table.insertRow();

      const imgCell = row.insertCell();
      imgCell.classList.add('studentData')
      imgCell.textContent = "---FOTO---";

      const firstNameCell = row.insertCell();
      firstNameCell.classList.add('pendencies')
      firstNameCell.textContent = data.firstName;

      const lastNameCell = row.insertCell();
      lastNameCell.classList.add('studentData')
      lastNameCell.textContent = pendencia;

      const accessPerfilCell = row.insertCell();
      const btn = document.createElement("a");
      btn.setAttribute("href", "#");
      btn.textContent = "Acessar Aluno";
      accessPerfilCell.appendChild(btn);
    });
  });
}


const studentIds = []; // Replace with actual studentIds array

const tableId = "studentsfinancies";
tableFinancies(studentIds, db, tableId);













