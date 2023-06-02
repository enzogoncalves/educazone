import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import { getFirestore, getDocs, collection, doc, query, where, onSnapshot, updateDoc, addDoc, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { app } from "./initializeFirebase.js"

import { createProfilePicture, redirectToLoginPage } from "./modules.js"

const auth = getAuth()
const firestoreDb = getFirestore(app)

let userId

const studentId = document.querySelector("body").getAttribute("id")

const tasksContainer = document.getElementById("tasksContainer")

document.querySelector(".page-skeleton").classList.remove("active")

onAuthStateChanged(auth, async authUser => {
	if (authUser) {
		userId = authUser.uid

		document.querySelector(".page-skeleton").classList.remove("active")

		const qProfessor = query(collection(firestoreDb, "professors"), where("__name__", "==", userId))
		const queryProfessor = await getDocs(qProfessor)
		const isProfessor = !queryProfessor.empty

		if (isProfessor === false) {
			window.location = "/building"
			return
		}

		let qStudent

		queryProfessor.forEach(doc => {
			console.log(doc.id, " => ", doc.data())
			doc.data().students.filter(async student => {
				if (student == studentId) {
					qStudent = query(collection(firestoreDb, "students"), where("__name__", "==", studentId))
				}
			})
		})

		const studentDoc = await getDocs(qStudent)

		if (studentDoc.empty) {
			window.location = "/building"
			return
		}

		studentDoc.forEach(user => {
			document.querySelector("#fullName").textContent = `${user.data().firstName} ${user.data().lastName}`
			if (user.data().pictureUrl === undefined) {
				document.querySelector("#side-navigation").appendChild(createProfilePicture(user.data().firstName, user.data().lastName))
			} else {
				document.querySelector("#side-navigation").innerHTML += `
					<img src="${user.data().pictureUrl}" alt="Imagem de perfil" class="profilePicture"/>
				`
			}
		})

		const qTasks = query(collection(firestoreDb, "tasks"), where("studentId", "==", studentId))

		let i = 0
		const table = document.createElement("table")

		const tasksListener = onSnapshot(qTasks, querySnapshot => {
			if (querySnapshot.docChanges().length == 0) {
				document.getElementById("tasksContainer").innerHTML += `
					<p>Nenhuma tarefa foi criada ainda</p>
				`
			} else if (i == 0) {
				table.innerHTML = `
				<tr>
					<th>Nome</th>
					<th>Status</th>
					<th>Criado em</th>
					<th>Entregue em</th>
					<th>Descrição</th>
				</tr>
			`

				tasksContainer.appendChild(table)
				i++
			}

			querySnapshot.docChanges().forEach(change => {
				if (change.type === "added") {
					table.innerHTML += `
						<tr id="${change.doc.id}">
							<td>${change.doc.data().title}</td>
							<td>${change.doc.data().expireDate}</td>
							<td>${change.doc.data().delivered ? change.doc.data().delivered : "Não entregue"}</td>
							<td>${change.doc.data().title}</td>
							<td>${change.doc.data().description}</td>
						</tr>
					`
				}
				if (change.type === "removed") {
					document.getElementById(change.doc.id).remove()
				}
			})
		})
	} else {
		redirectToLoginPage()
	}
})

const openAddTaskModal = document.getElementById("openAddTaskModal")
const createTaskBtn = document.getElementById("createTask")

openAddTaskModal.addEventListener("click", () => {
	document.getElementById("createTaskModal").classList.add("active")
})

const cancelTaskBtn = document.getElementById("cancelTask")

cancelTaskBtn.addEventListener("click", e => {
	e.preventDefault()

	document.getElementById("createTaskModal").classList.remove("active")
})

createTaskBtn.addEventListener("click", e => {
	e.preventDefault()

	const title = document.getElementById("taskTitle").value
	const expireDate = document.getElementById("expireDate").value
	const description = document.getElementById("description").value

	addTask(title, expireDate, description)
})

function addTask(title, expireDate, description) {
	addDoc(collection(firestoreDb, "tasks"), {
		studentId: studentId,
		professorId: userId,
		title: title,
		expireDate: Timestamp.fromDate(new Date(expireDate)),
		description: description,
		createdAt: serverTimestamp(),
	})
		.then(data => {})
		.catch(error => {
			console.error(error.message)
		})
}
