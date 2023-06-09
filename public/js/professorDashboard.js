import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import { getFirestore, doc, getDoc, getDocs, collection, addDoc, updateDoc, deleteDoc, deleteField, query, where } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

const auth = getAuth()

import { app } from "./initializeFirebase.js"

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
	const paymentCollection = collection(firestoreDb, "payment")
	const currentDate = new Date()
	const currentYear = currentDate.getFullYear()
	const currentMonth = currentDate.getMonth()
	const currentDay = currentDate.getDate()
	let received = 0
	let toReceive = 0
	let totalAmountMonth = received + toReceive

	const totalHTML = document.getElementById("total")
	const receivedAmountHTML = document.getElementById("recebido")
	const toReceiveHTML = document.getElementById("upcomingPayment")

	try {
		const snapshot = await getDocs(paymentCollection)
		snapshot.forEach(doc => {
			const paymentDate = doc.data().date
			const paymentAmount = doc.data().amount
			const firebaseFormatted = new Date(formatDate(paymentDate))
			const firebaseYear = firebaseFormatted.getFullYear()
			const firebaseMonth = firebaseFormatted.getMonth()
			const firebaseDay = firebaseFormatted.getDate()

			const teacher = doc.data().teacher_id

			if (currentYear === firebaseYear && currentMonth === firebaseMonth && teacher === "CjMFjMeMRMK3YJd7nWoR") {
				if (currentDay < firebaseDay) {
					toReceive += paymentAmount
				} else if (currentDay >= firebaseDay) {
					received += paymentAmount
				}

				totalAmountMonth = received + toReceive
			}
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

	console.log("received:", received)
	console.log("To receive:", toReceive)
	console.log("Total:", totalAmountMonth)
}

getPaymentDate()
