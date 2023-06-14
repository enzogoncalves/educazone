import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import { getFirestore, getDocs, doc, collection, query, where, onSnapshot, updateDoc, addDoc, serverTimestamp, Timestamp, orderBy } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js"

import { app } from "./initializeFirebase.js"

import { createProfilePicture, redirectToLoginPage } from "./modules.js"

const auth = getAuth()
const firestoreDb = getFirestore(app)

let userId

const studentId = document.querySelector("body").getAttribute("id")

const tasksContainer = document.getElementById("tasksContainer")

let lastTaskCreatedAt

onAuthStateChanged(auth, async authUser => {
	if (authUser) {
		userId = authUser.uid

		// const qProfessor = query(collection(firestoreDb, "professors"), where("__name__", "==", userId))
		// const queryProfessor = await getDocs(qProfessor)
		// const isProfessor = !queryProfessor.empty

		// if (isProfessor === false) {
		// 	window.location = "/building"
		// 	return
		// }

		// let qStudent
		// qStudent = query(collection(firestoreDb, "students"), where("__name__", "==", studentId))

		// const studentDoc = await getDocs(qStudent)

		// if (studentDoc.empty) {
		// 	window.location = "/building"
		// 	return
		// }

		// studentDoc.forEach(user => {
		// 	document.querySelector("#fullName").textContent = `${user.data().firstName} ${user.data().lastName}`
		// 	if (user.data().pictureUrl === undefined) {
		// 		document.querySelector("#side-navigation").appendChild(createProfilePicture(user.data().firstName, user.data().lastName))
		// 	} else {
		// 		document.querySelector("#side-navigation").innerHTML += `
		// 			<img src="${user.data().pictureUrl}" alt="Imagem de perfil" class="profilePicture"/>
		// 		`
		// 	}
		// })

		const qTasks = query(collection(firestoreDb, "tasks"), where("studentId", "==", studentId), orderBy("expireDate"))

		let i = 0
		const table = document.createElement("table")

		const tasksListener = onSnapshot(qTasks, { includeMetadataChanges: true }, querySnapshot => {
			if (querySnapshot.docChanges().length == 0) {
				const p = document.createElement("p")
				p.textContent = "Nenhuma tarefa foi criada ainda"
				tasksContainer.appendChild(p)
			} else if (i == 0) {
				const tableHeader = document.createElement("tr")
				tableHeader.innerHTML = `
					<th>Nome</th>
					<th>Status</th>
					<th>Criado em</th>
					<th>Entregue em</th>
					<th>Expira em</th>
					<th>Descrição</th>
				`
				table.appendChild(tableHeader)
				tasksContainer.appendChild(table)
				i++
			}

			querySnapshot.docChanges().forEach(change => {
				if (change.type === "added") {
					const assignment = change.doc.data()
					const tr = document.createElement("tr")
					tr.addEventListener("click", () => {
						selectTask(assignment, change.doc.id)
					})
					tr.setAttribute("id", change.doc.id)
					tr.innerHTML = `
							<td>${assignment.title}</td>
							<td>${assignment.status}</td>
							<td id="createdAt-${change.doc.id}">${assignment.createdAt ? assignment.createdAt.toDate().toLocaleDateString() : ""}</td>
							<td>${assignment.delivered ? (assignment.studentAnswer.deliveredAt ? assignment.studentAnswer.deliveredAt.toDate().toLocaleDateString() : "aguardando") : "Não entregue"}</td>
							<td>${assignment.expireDate.toDate().toLocaleDateString()}</td>
							<td>${assignment.description}</td>
					`
					table.appendChild(tr)

					if (assignment) {
						if (!assignment.createdAt && change.doc.metadata.hasPendingWrites) {
						} else {
							document.querySelector(`#createdAt-${change.doc.id}`).textContent = assignment.createdAt.toDate().toLocaleDateString()
						}
					}
				}
				if (change.type === "removed") {
					document.getElementById(change.doc.id).remove()
				}
			})
		})

		document.querySelector(".page-skeleton").classList.remove("active")
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
const documents = document.getElementById("document")

cancelTaskBtn.addEventListener("click", e => {
	e.preventDefault()

	document.getElementById("createTaskModal").classList.remove("active")
})

let tasksFile = []

const fileForm = document.querySelector(".file-form-item")

documents.addEventListener("change", e => {
	const file = e.target.files[0]

	if (file === undefined) return

	tasksFile.push(file)

	const newTask = document.createElement("p")
	newTask.textContent = file.name

	fileForm.appendChild(newTask)
})

createTaskBtn.addEventListener("click", e => {
	e.preventDefault()

	const title = document.getElementById("taskTitle").value
	const expireDate = document.getElementById("expireDate").value
	const description = document.getElementById("description").value

	addTask(title, expireDate, description)
})

async function addTask(title, expireDate, description) {
	const tasksName = []
	tasksFile.map(taskFile => {
		tasksName.push(taskFile.name)
	})

	let newExpireDate = new Date(new Date(expireDate).setDate(expireDate.split("-")[2]))
	addDoc(collection(firestoreDb, "tasks"), {
		studentId: studentId,
		professorId: userId,
		title: title,
		expireDate: Timestamp.fromDate(newExpireDate),
		description: description,
		createdAt: serverTimestamp(),
		status: "Não visualizado",
		delivered: false,
		files: tasksName.length == 0 ? false : tasksName,
	})
		.then(data => {
			const storage = getStorage()

			tasksFile.forEach(taskFile => {
				const fileRef = ref(storage, `assignments/${data.id}/professor/${taskFile.name}`)
				const uploadTaskFile = uploadBytesResumable(fileRef, taskFile)
			})

			lastTaskCreatedAt = Timestamp.now().toDate().toLocaleDateString()
			document.querySelector(`#createdAt-${data.id}`).textContent = lastTaskCreatedAt

			document.getElementById("createTaskModal").classList.remove("active")
		})
		.catch(error => {
			console.error(error.message)
		})
}

const cancelFixTaskBtn = document.getElementById("cancelFixTask")

cancelFixTaskBtn.addEventListener("click", e => {
	e.preventDefault()

	document.getElementById("fixTaskModal").classList.remove("active")
	tasksContainer.style.display = "flex"

	document.querySelectorAll(".grade").forEach(othersBtn => {
		othersBtn.previousElementSibling.classList.remove("taskGradeActive")
	})

	a("#commentary").value = ""

	document.querySelector("#fixTaskModal").dataset.taskId = ""
})

document.querySelector("#fixTaskForm").addEventListener("submit", e => {
	e.preventDefault()
})

document.querySelectorAll(".grade").forEach(gradeBtn => {
	gradeBtn.addEventListener("click", () => {
		document.querySelectorAll(".grade").forEach(othersBtn => {
			if (!othersBtn.checked) {
				othersBtn.previousElementSibling.classList.remove("taskGradeActive")
			}
		})
		gradeBtn.previousElementSibling.classList.add("taskGradeActive")
	})
})

function selectTask(task, taskId) {
	tasksContainer.style.display = "none"
	a("#fixTaskModal").classList.add("active")
	document.querySelector("#fixTaskModal").dataset.taskId = taskId

	a("#studentTaskTitle").textContent = task.title
	a("#deliveredAt").textContent = task.studentAnswer.deliveredAt.toDate().toLocaleDateString()
	a("#studentFiles").innerHTML = ""

	if (task.studentAnswer.files.length !== 0) {
		const storage = getStorage()

		task.studentAnswer.files.forEach(fileName => {
			const fileReference = ref(storage, `assignments/${taskId}/student/${fileName}`)

			getDownloadURL(fileReference)
				.then(url => {
					a("#studentFiles").innerHTML += `
						<div>
							<p>${fileName}</p>
							<a href="${url}" target="_blank">Abrir</a>
						</div>
					`
				})
				.catch(error => {
					console.error(error)
				})
		})
	}

	if (task.status == "Corrigida") {
		a(".fixTask-actions").style.display = "none"
	}
}

a("#submitGrade").addEventListener("click", () => {
	const taskId = document.querySelector("#fixTaskModal").dataset.taskId
	let selectedGrade
	document.querySelectorAll(".grade").forEach(button => {
		if (button.checked) {
			selectedGrade = button.value
		}
	})

	const commentary = a("#commentary").value

	const taskRef = doc(firestoreDb, "tasks", taskId)

	updateDoc(taskRef, {
		correctedTask: {
			grade: selectedGrade,
			commentary: commentary,
		},
		status: "Corrigida",
	})
		.then(() => {})
		.catch(error => {
			console.log(error)
		})
})

function a(id) {
	return document.querySelector(id)
}
