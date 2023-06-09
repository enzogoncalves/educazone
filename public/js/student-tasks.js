import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import { getFirestore, getDocs, collection, doc, query, where, onSnapshot, updateDoc, addDoc, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { getStorage, ref, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js"

const storage = getStorage()

import { app } from "./initializeFirebase.js"

import { createProfilePicture, redirectToLoginPage } from "./modules.js"

const auth = getAuth()
const firestoreDb = getFirestore(app)

const tasksContainer = document.querySelector("#tasksContainer")

let userId

onAuthStateChanged(auth, async authUser => {
	if (authUser) {
		userId = authUser.uid

		document.querySelector(".page-skeleton").classList.remove("active")

		const qStudent = query(collection(firestoreDb, "students"), where("__name__", "==", userId))
		const queryStudent = await getDocs(qStudent)
		const isStudent = !queryStudent.empty

		if (isStudent === false) {
			window.location = "/building"
			return
		}

		const qTasks = query(collection(firestoreDb, "tasks"), where("studentId", "==", userId))

		let i

		const tasksListener = onSnapshot(qTasks, querySnapshot => {
			if (querySnapshot.docChanges().length == 0) {
				const p = document.createElement("p")
				p.textContent = "Nenhuma tarefa foi criada ainda"
				tasksContainer.appendChild(p)
			} else if (i == 0) {
				tasksContainer.innerHTML = ""
				i++
			}

			querySnapshot.docChanges().forEach(assignment => {
				if (assignment.type === "added") {
					const task = document.createElement("div")
					task.classList.add("task")
					task.addEventListener("click", () => {
						document.querySelectorAll(".task").forEach(a => {
							a.classList.remove("active")
						})
						task.classList.add("active")
						selectTask(assignment.doc.data(), assignment.doc.id)
					})

					task.innerHTML = `<p>${assignment.doc.data().title}</p>`

					tasksContainer.appendChild(task)
				}
				if (assignment.type === "removed") {
					document.getElementById(assignment.doc.id).remove()
				}
			})
		})
	} else {
		redirectToLoginPage()
	}
})

function selectTask(task, taskId) {
	const assignmentContent = document.querySelector("#assignment")
	const taskDate = String(task.expireDate.toDate().toLocaleDateString())
	assignmentContent.innerHTML = `
		<div class="task-header">
			<h2 id="taskTitle">${task.title}</h2>
			<p id="expireDate">Vence em ${taskDate}</p>
			<p id="description">${task.description}</p>
		</div>
		<div class="task-body">
			<p>Adicione sua resposta</p>
				<div>
					<button id="write-task">Escrever</button>
					<label for="add-docs">Adicionar arquivo</label>
					<input type="file" id="add-docs" multiple style="display:none;"></button>
					<button id="send-task">Entregar</button>
				</div>
		</div>
	`

	const writeTaskBtn = document.querySelector("#write-task")
	writeTaskBtn.addEventListener("click", () => {})

	const addDocsBtn = document.querySelector("#add-docs")

	const tasksFile = []

	addDocsBtn.addEventListener("change", e => {
		if (e.target.files[e.target.files.length - 1] === undefined) return
		tasksFile.push(e.target.files[e.target.files.length - 1])
	})

	const sendTaskBtn = document.querySelector("#send-task")
	sendTaskBtn.addEventListener("click", () => {
		console.log(tasksFile)
		if (tasksFile.length !== 0) {
			tasksFile.forEach(file => {
				const storageRef = ref(storage, `assignments/${taskId}/student/${file.name}`)
				const uploadTaskFile = uploadBytesResumable(storageRef, file)

				uploadTaskFile.on(
					"state_changed",
					snapshot => {
						const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
						document.querySelector("progress").value = progress
					},
					error => {
						console.error(error)
					}
				)
			})
		}
	})
}

function addTask(title, expireDate, description) {
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
	})
		.then(data => {})
		.catch(error => {
			console.error(error.message)
		})
}
