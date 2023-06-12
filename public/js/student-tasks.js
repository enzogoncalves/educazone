import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import { getFirestore, getDocs, collection, doc, query, where, onSnapshot, updateDoc, addDoc, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js"

const storage = getStorage()

import { app } from "./initializeFirebase.js"

import { createProfilePicture, redirectToLoginPage } from "./modules.js"

const auth = getAuth()
const firestoreDb = getFirestore(app)

const tasksContainer = document.querySelector("#tasksContainer")
const assignmentContent = document.querySelector("#assignment")

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
				if (assignment.type === "modified") {
					console.log("modificada")
					console.log(assignment.doc.data().delivered)
					if (assignment.doc.data().delivered) {
						selectWhichTask(assignment.doc.data(), assignment.doc.id)
					}
				}
			})
		})
	} else {
		redirectToLoginPage()
	}
})

const alreadySelectedTasks = []

async function selectWhichTask(task, taskId) {
	let taskIndex
	if (
		alreadySelectedTasks.find((el, elId) => {
			taskIndex = elId
			return el.taskId == taskId
		})
	) {
		if (task.delivered) {
			alreadySelectedTasks[taskIndex].task.delivered = true
			selectTask(alreadySelectedTasks[taskIndex].task, alreadySelectedTasks[taskIndex].taskId, alreadySelectedTasks[taskIndex].studentTaskFiles, alreadySelectedTasks[taskIndex].professorTaskFiles)
			return
		}
		selectTask(alreadySelectedTasks[taskIndex].task, alreadySelectedTasks[taskIndex].taskId, alreadySelectedTasks[taskIndex].studentTaskFiles, alreadySelectedTasks[taskIndex].professorTaskFiles)
	} else {
		const taskRef = doc(firestoreDb, "tasks", taskId)

		if (task.status !== "Visualizado" && task.delivered === false) {
			await updateDoc(taskRef, {
				status: "Visualizado",
			})
		}

		selectTask(task, taskId, [], undefined)
	}
}

function selectTask(task, taskId, studentTaskFiles, professorTaskFiles) {
	const taskDate = String(task.expireDate.toDate().toLocaleDateString())
	assignmentContent.innerHTML = `
		<div class="task-header">
			<h2 id="taskTitle">${task.title}</h2>
			<p id="expireDate">Vence em ${taskDate}</p>
			<p id="description">${task.description}</p>
			<div class="task-files"></div>
		</div>
		<div class="task-body">
			
		</div>
	`

	if (task.delivered) {
		document.querySelector(".task-body").innerHTML = `
			<p>Tarefa entregue</p>
		`
		return
	} else {
		document.querySelector(".task-body").innerHTML = `
			<p>Adicione sua resposta</p>
				<div>
					<button id="write-task">Escrever</button>
					<label for="add-docs">Adicionar arquivo</label>
					<input type="file" id="add-docs" multiple style="display:none;"></button>
					<div class="student-task-files"></div>
					<button id="send-task">Entregar</button>
				</div>
		`
	}

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
					alreadySelectedTasks[alreadySelectedTasks.findIndex(e => e.taskId == taskId)].professorTaskFiles.push({ url: url, fileName: fileName })

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

	const taskFiles = studentTaskFiles

	const taskFilesName = []

	taskFiles.forEach(taskFile => {
		document.querySelector(".student-task-files").textContent += taskFile.name
	})

	addDocsBtn.addEventListener("change", e => {
		if (e.target.files[e.target.files.length - 1] === undefined) return
		taskFiles.push(e.target.files[e.target.files.length - 1])

		document.querySelector(".student-task-files").textContent += e.target.files[e.target.files.length - 1].name
		alreadySelectedTasks[alreadySelectedTasks.findIndex(e => e.taskId == taskId)].studentTaskFiles.push(e.target.files[e.target.files.length - 1])

		taskFilesName.push(e.target.files[e.target.files.length - 1].name)
	})

	const sendTaskBtn = document.querySelector("#send-task")
	sendTaskBtn.addEventListener("click", () => {
		const taskRef = doc(firestoreDb, "tasks", taskId)

		updateDoc(taskRef, {
			delivered: true,
			studentAnswer: {
				deliveredAt: serverTimestamp(),
				written: document.querySelector(".writeTask textarea").value,
				files: taskFilesName,
			},
			status: "Entregue",
		})
			.then(() => {
				alert("entregue com sucesso")
			})
			.catch(error => {
				console.log(error)
			})

		if (taskFiles.length !== 0) {
			taskFiles.forEach(file => {
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
