import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import { getFirestore, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

const auth = getAuth()

import { app } from "./initializeFirebase.js"
import { createProfilePicture, redirectToLoginPage } from "./modules.js"

const firestoreDb = getFirestore(app)

onAuthStateChanged(auth, async authUser => {
	if (authUser) {
		const userId = authUser.uid

		const qProfessor = query(collection(firestoreDb, "professors"), where("__name__", "==", userId))
		const queryProfessor = await getDocs(qProfessor)
		const isProfessor = !queryProfessor.empty

		if (isProfessor === false) window.location = "/studentProfile"

		const studentsRef = collection(firestoreDb, "students")
		const querySnapshot = await getDocs(query(studentsRef, where("professors", "array-contains", userId)))

		const students = []

		querySnapshot.forEach(doc => {
			const studentData = doc.data()
			students.push({ ...studentData, studentId: doc.id })
		})

		const tasksRef = collection(firestoreDb, "tasks")
		const tasksSnapshot = await getDocs(query(tasksRef, where("professorId", "==", userId)))

		const tasksStatus = {
			total: 0,
			corrigida: 0,
			falta_entregar: 0,
			falta_corrigir: 0,
		}

		tasksSnapshot.forEach(task => {
			const professorTask = task.data()
			tasksStatus.total++

			if (professorTask.delivered && professorTask.status == "Entregue") {
				tasksStatus.falta_corrigir++
			} else if (professorTask.status == "Corrigida") {
				tasksStatus.corrigida++
			} else if (!professorTask.delivered) {
				tasksStatus.falta_entregar++
			}
		})

		document.querySelector(".page-skeleton").classList.remove("active")

		displayStudentsTable(students) // Display students in the HTML table
		displayTasks(tasksStatus)
		getPaymentDate(userId)
	} else {
		redirectToLoginPage()
	}
})

function displayTasks(tasksStatus) {
	const tasks = document.querySelector("#activities > div")

	tasks.innerHTML += `
		<div>
		<i class="icon-download"></i>
		<p>${tasksStatus.total}</p>
		<span>Total</span>
		</div>
		<div>
		<i class="icon-upload"></i>
		<p>${tasksStatus.falta_entregar}</p>
		<span>Faltam entregar</span>
		</div>
		<div>
		<i class="icon-document-time"></i>
		<p>${tasksStatus.falta_corrigir}</p>
		<span>Correção Pendente</span>
		</div>
		<div>
		<i class="icon-thumbs-up"></i>
		<p>${tasksStatus.corrigida}</p>
		<span>Corrigda</span>
		</div>
	`
}

function displayStudentsTable(students) {
	const studentsContainer = document.querySelector("#myStudents")

	if (students.length == 0) {
		studentsContainer.innerHTML += `
			<p>Você não possui nenhum aluno registrado</p>
		`

		return
	}

	students.forEach(student => {
		const studentDiv = document.createElement("div")

		if (student.pictureUrl) {
			studentDiv.innerHTML += `
				<img src="${student.pictureUrl}" alt="Foto de perfil"/>
			`
		} else {
			studentDiv.appendChild(createProfilePicture(student.firstName, student.lastName))
		}

		studentDiv.innerHTML += `
			<p class="studentName">${student.firstName} ${student.lastName}</p> 
		`

		const accessStudentBtn = document.createElement("button")
		accessStudentBtn.textContent = "Acessar aluno"
		accessStudentBtn.addEventListener("click", () => {
			window.location = `professor/${student.studentId}/`
		})

		studentDiv.appendChild(accessStudentBtn)

		studentsContainer.appendChild(studentDiv)
	})
}

async function getPaymentDate(teacherId) {
	const paymentCollection = query(collection(firestoreDb, "payments"), where("professorId", "==", teacherId))

	const currentDate = new Date()
	let received = 0
	let toReceive = 0
	let totalAmountMonth = 0
	let late = 0

	try {
		const financies = document.querySelector("#financies")

		const snapshot = await getDocs(paymentCollection)

		if (snapshot.empty) {
			financies.innerHTML += `
				<p>Nenhum pagamento encontrado</p>
			`
		} else {
			snapshot.forEach(doc => {
				const paid = doc.data().paid
				const paymentDate = doc.data().date
				const paymentAmount = doc.data().amount
				const firebaseFormatted = new Date(paymentDate)

				if (currentDate < firebaseFormatted) {
					toReceive += paymentAmount
					totalAmountMonth += paymentAmount
				} else if (currentDate >= firebaseFormatted && paid) {
					received += paymentAmount
					totalAmountMonth += paymentAmount
				} else if (currentDate >= firebaseFormatted && !paid) {
					late += paymentAmount
					totalAmountMonth += paymentAmount
				}
			})

			financies.innerHTML += `
				<div id="total">
					<h5>Total</h5>
					<p>R$ ${totalAmountMonth}</p>
				</div>
				<div class="recebido" id="recebido">
						<h5>Recebidos</h5>
						<p>R$ ${received}</p>
				</div>
				<div class="faltante" id="upcomingPayment">
						<h5>A receber até o fim do mês</h5>
						<p>R$ ${toReceive}</p>
				</div>
				<div class="late" id="late">
						<h5>Atrasado</h5>
						<p>R$ ${late}</p>
				</div>
			`
		}
	} catch (error) {
		console.error("Error getting payment documents:", error)
	}
}
