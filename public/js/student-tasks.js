import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import { getFirestore, getDocs, collection, doc, query, where, onSnapshot, updateDoc, addDoc, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js"

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
						selectWhichTask(assignment.doc.data(), assignment.doc.id)
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

const alreadySelectedTasks = []

function selectWhichTask(task, taskId) {
	let taskIndex
	if (
		alreadySelectedTasks.find((el, elId) => {
			taskIndex = elId
			return el.taskId == taskId
		})
	) {
		selectTask(alreadySelectedTasks[taskIndex].task, alreadySelectedTasks[taskIndex].taskId, alreadySelectedTasks[taskIndex].studentTaskFiles, alreadySelectedTasks[taskIndex].professorTaskFiles)
	} else {
		selectTask(task, taskId, [], undefined)
	}
}

function selectTask(task, taskId, studentTaskFiles, professorTaskFiles) {
	const assignmentContent = document.querySelector("#assignment")
	const taskDate = String(task.expireDate.toDate().toLocaleDateString())
	assignmentContent.innerHTML = `
		<div class="task-header">
			<h2 id="taskTitle">${task.title}</h2>
			<p id="expireDate">Vence em ${taskDate}</p>
			<p id="description">${task.description}</p>
			<div class="task-files"></div>
		</div>
		<div class="task-body">
			<p>Adicione sua resposta</p>
				<div>
					<button id="write-task">Escrever</button>
					<label for="add-docs">Adicionar arquivo</label>
					<input type="file" id="add-docs" multiple style="display:none;"></button>
					<div class="student-task-files"></div>
					<button id="send-task">Entregar</button>
				</div>
		</div>
	`

	alreadySelectedTasks.push({ task: task, taskId: taskId, professorTaskFiles: [], studentTaskFiles: [] })
	if (professorTaskFiles !== undefined) {
		professorTaskFiles.forEach(professorTaskFile => {
			const taskFile = document.createElement("a")
			taskFile.href = professorTaskFile.url
			taskFile.textContent = professorTaskFile.fileName
			taskFile.setAttribute("target", "_blank")

			document.querySelector(".task-files").appendChild(taskFile)
		})
	} else if (task.files.length !== 0) {
		task.files.forEach(fileName => {
			const fileReference = ref(storage, `assignments/${taskId}/professor/${fileName}`)

			getDownloadURL(fileReference)
				.then(url => {
					alreadySelectedTasks[alreadySelectedTasks.length - 1].professorTaskFiles.push({ url: url, fileName: fileName })

					const taskFile = document.createElement("a")
					taskFile.href = url
					taskFile.textContent = fileName
					taskFile.setAttribute("target", "_blank")

					document.querySelector(".task-files").appendChild(taskFile)
				})
				.catch(error => {
					console.error(error)
				})
		})
	}

	const writeTaskBtn = document.querySelector("#write-task")
	writeTaskBtn.addEventListener("click", () => {})

	const addDocsBtn = document.querySelector("#add-docs")

	const tasksFile = studentTaskFiles

	tasksFile.forEach(taskFile => {
		document.querySelector(".student-task-files").textContent += taskFile.name
	})

	addDocsBtn.addEventListener("change", e => {
		if (e.target.files[e.target.files.length - 1] === undefined) return
		tasksFile.push(e.target.files[e.target.files.length - 1])

		document.querySelector(".student-task-files").textContent += e.target.files[e.target.files.length - 1].name
		alreadySelectedTasks[alreadySelectedTasks.length - 1].studentTaskFiles.push(e.target.files[e.target.files.length - 1])
	})

	const sendTaskBtn = document.querySelector("#send-task")
	sendTaskBtn.addEventListener("click", () => {
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
