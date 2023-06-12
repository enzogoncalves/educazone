import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import { getFirestore, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { app } from "./initializeFirebase.js"
import { createProfilePicture, redirectToLoginPage } from "./modules.js"

const auth = getAuth()
const firestoreDb = getFirestore(app)

onAuthStateChanged(auth, async authUser => {
	if (authUser) {
		const qProfessor = query(collection(firestoreDb, "professors"), where("__name__", "==", authUser.uid))
		const queryProfessor = await getDocs(qProfessor)
		const isProfessor = !queryProfessor.empty

		if (isProfessor === false) {
			alert("Apenas professores podem acessar esta página")
			window.location = "/"
		}

		retrieveStudents(authUser.uid)
	} else {
		redirectToLoginPage()
	}
})

async function retrieveStudents(teacherId) {
	try {
		const studentsCollection = collection(firestoreDb, "students")
		const studentsQuery = query(studentsCollection, where("professors", "array-contains", teacherId))
		const studentsSnapshot = await getDocs(studentsQuery)

		const studentsData = []

		for (const student of studentsSnapshot.docs) {
			const studentId = student.id
			const firstName = student.data().firstName
			const lastName = student.data().lastName
			const profilePicture = student.data().profile_picture

			const tasksQuery = query(collection(firestoreDb, "tasks"), where("studentId", "==", studentId))
			const tasksSnapshot = await getDocs(tasksQuery)
			const totalTasksSent = tasksSnapshot.size

			let totalDeliveredTasks = 0
			tasksSnapshot.forEach(taskDoc => {
				const taskData = taskDoc.data()
				if (taskData.delivered === true) {
					totalDeliveredTasks++
				}
			})

			studentsData.push({ firstName: firstName, lastName: lastName, taskCount: totalDeliveredTasks + "/" + totalTasksSent, studentId: student.id, profilePicture: profilePicture })
		}

		displayStudentsTable(studentsData)
	} catch (error) {
		console.error("Error retrieving students:", error)
	}
}

function displayStudentsTable(students) {
	const container = document.getElementById("studentTableContainer")
	container.innerHTML = ""

	students.forEach(student => {
		const { firstName, lastName, profilePicture, taskCount, studentId } = student

		const row = document.createElement("div")

		const pictureCell = document.createElement("div")
		if (profilePicture) {
			const pictureImg = document.createElement("img")
			pictureImg.src = profilePicture
			pictureImg.alt = "Profile Picture"
			pictureCell.appendChild(pictureImg)
		} else {
			row.appendChild(createProfilePicture(firstName, lastName))
		}

		const nameCell = document.createElement("p")
		nameCell.textContent = `${firstName} ${lastName}`
		row.appendChild(nameCell)

		const taskCountCell = document.createElement("p")
		taskCountCell.textContent = taskCount + " Tarefas entregues"
		row.appendChild(taskCountCell)

		const deleteBtn = document.createElement("a")
		deleteBtn.href = "#"
		deleteBtn.textContent = "Delete button"
		row.appendChild(deleteBtn)

		const studentProfile = document.createElement("a")
		studentProfile.href = `/professor/${studentId}`
		studentProfile.textContent = "Profile button"
		row.appendChild(studentProfile)

		container.appendChild(row)
	})

	document.querySelector(".page-skeleton").classList.remove("active")
}
