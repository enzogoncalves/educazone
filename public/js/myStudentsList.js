import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import { getFirestore, doc, getDocs, collection, query, where, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { app } from "./initializeFirebase.js"


const auth = getAuth()
const firestoreDb = getFirestore(app)

let userId

let professorOrStudent

onAuthStateChanged(auth, async authUser => {
	if (authUser) {
		const qProfessor = query(collection(firestoreDb, "professors"), where("__name__", "==", authUser.uid))
		const queryProfessor = await getDocs(qProfessor)
		const isProfessor = !queryProfessor.empty

		const qStudent = query(collection(firestoreDb, "students"), where("__name__", "==", authUser.uid))

		const unsubscribe = onSnapshot(isProfessor ? qProfessor : qStudent, querySnapshot => {
			querySnapshot.forEach(user => {
				createHeader(authUser.photoURL, user.data().firstName, user.data().lastName, isProfessor === false)
			})
		})
	} else {
		redirectToLoginPage()
	}
});


  let task = 0;
  
  async function retrieveStudents(teacherId) {
    const professorCollection = collection(firestoreDb, 'professors');
  
    try {
      const professorSnapshot = await getDocs(professorCollection);
      const professorData = professorSnapshot.docs.find((doc) => doc.id === teacherId);
  
      if (professorData) {
        const studentIds = professorData.data().student_id;
        console.log(studentIds);
  
        const studentsCollection = collection(firestoreDb, 'students');
        const studentsQuery = query(studentsCollection, where('professor_id', '==', teacherId));
        const studentsSnapshot = await getDocs(studentsQuery);
  
        const studentsData = [];
  
        for (const student of studentsSnapshot.docs) {
          const studentId = student.id;
          const name = student.data().firstName;
          const profilePicture = student.data().profile_picture;
  
          const tasksQuery = query(collection(firestoreDb, 'tasks'), where('student_id', '==', studentId));
          const tasksSnapshot = await getDocs(tasksQuery);
          const totalTasksSent = tasksSnapshot.size;
  
          let totalDeliveredTasks = 0;
          tasksSnapshot.forEach((taskDoc) => {
            const taskData = taskDoc.data();
            if (taskData.deliver === true) {
              totalDeliveredTasks++;
            }
          });
  
          console.log('Student:', name);
          console.log('Tasks:', totalDeliveredTasks + '/' + totalTasksSent + 'Tarefas entregues');
  
          studentsData.push({ name, profilePicture, taskCount: totalDeliveredTasks + '/' + totalTasksSent });
        }
  
        displayStudentsTable(studentsData);
      } else {
        console.log('Professor not found');
      }
    } catch (error) {
      console.error('Error retrieving students:', error);
    }
  }
  
  
  
  function displayStudentsTable(students) {
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
  
    students.forEach((student) => {
      const { name, profilePicture, taskCount } = student;
  
      const row = document.createElement('tr');
  
      const pictureCell = document.createElement('td');
      const pictureImg = document.createElement('img');
      pictureImg.src = profilePicture;
      pictureImg.alt = 'Profile Picture';
      pictureCell.appendChild(pictureImg);
      row.appendChild(pictureCell);
  
      const nameCell = document.createElement('td');
      nameCell.textContent = name;
      row.appendChild(nameCell);
  
      const taskCountCell = document.createElement('td');
      taskCountCell.textContent = taskCount +  ' Tarefas entregues';
      row.appendChild(taskCountCell);

      const deleteBtn = document.createElement('a')
      deleteBtn.href = '#'
      deleteBtn.textContent = 'Delete button'
      row.appendChild(deleteBtn)

      const studentProfile = document.createElement('a')
      studentProfile.href = '#'
      studentProfile.textContent = 'Profile button'
      row.appendChild(studentProfile)
 
      tbody.appendChild(row);
    });
  
    table.appendChild(tbody);
  
    const container = document.getElementById('studentTableContainer');
    container.innerHTML = '';
    container.appendChild(table);
  }
  
  retrieveStudents('TxFzDy2TKEhxFZCUp63Nepxi87q1');