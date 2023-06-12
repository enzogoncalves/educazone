import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import { getFirestore, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

const auth = getAuth()

import { app } from "./initializeFirebase.js"
import { redirectToLoginPage } from "./modules.js"

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
			students.push(studentData)
		})

		document.querySelector(".page-skeleton").classList.remove("active")

		displayStudentsTable(students) // Display students in the HTML table
		getPaymentDate(userId)
	} else {
		redirectToLoginPage()
	}
})

function displayStudentsTable(students) {
	const tbody = document.getElementById("tbody")

	students.forEach(student => {
		const row = tbody.insertRow()

		const pictureCell = row.insertCell()
		pictureCell.textContent = "--FOTO--"

		const nameCell = row.insertCell()
		nameCell.textContent = student.firstName

		const buttonCell = row.insertCell()
		const button = document.createElement("button")
		button.textContent = "Acessar aluno"
		button.addEventListener("click", () => {
			window.location = `professor/${student.studentId}/`
		})
		buttonCell.appendChild(button)
	})
}

function formatDate(dateString) {
	const parts = dateString.split("-")
	const day = parts[0]
	const month = parts[1]
	const year = parts[2]

	const formattedDate = `${month}-${day}-${year}`
	return formattedDate
}

async function getPaymentDate(teacherId) {
	const paymentCollection = query(collection(firestoreDb, "payments"), where("professorId", "==", teacherId))

	const currentDate = new Date()
	let received = 0
	let toReceive = 0
	let totalAmountMonth = 0

	const totalHTML = document.getElementById("total")
	const receivedAmountHTML = document.getElementById("recebido")
	const toReceiveHTML = document.getElementById("upcomingPayment")

	try {
		const snapshot = await getDocs(paymentCollection)
		snapshot.forEach(doc => {
			const paymentDate = doc.data().date
			const paymentAmount = Number(doc.data().amount)
			const firebaseFormatted = new Date(formatDate(paymentDate))

			if (currentDate < firebaseFormatted) {
				toReceive = paymentAmount
			} else if (currentDate >= firebaseFormatted) {
				received = paymentAmount
			}

			totalAmountMonth += received + toReceive
		})

		const totalText = document.createTextNode(totalAmountMonth)
		const receivedText = document.createTextNode(received)
		const toReceiveText = document.createTextNode(toReceive)

		totalHTML.appendChild(totalText)

		receivedAmountHTML.appendChild(receivedText)

		toReceiveHTML.appendChild(toReceiveText)
	} catch (error) {
		console.error("Error getting payment documents:", error)
	}
}
