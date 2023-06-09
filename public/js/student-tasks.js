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
						selectTask(assignment.doc.data())
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

function selectTask(task) {
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
					<input type="file" id="add-docs">Adicionar Arquivo</button>
					<button id="send">Entregar</button>
				</div>
		</div>
	`

	const writeTaskBtn = document.querySelector("#write-task")
	writeTaskBtn.addEventListener("click", () => {})

	const addDocsBtn = document.querySelector("#add-docs")

	addDocsBtn.addEventListener("change", e => {
		const file = e.target.files[0]

		const storageRef = ref(storage, file.name)
		const uploadTaskFile = uploadBytesResumable(storageRef, file)

		uploadTaskFile.on(
			"state_changed",
			snapshot => {
				const progress = snapshot.bytesTransferred
				console.log("Upload is " + progress + "% done")
				switch (snapshot.state) {
					case "paused":
						console.log("Upload is paused")
						break
					case "running":
						console.log("Upload is running")
						break
				}
			},
			error => {
				// Handle unsuccessful uploads
			}
		)
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
