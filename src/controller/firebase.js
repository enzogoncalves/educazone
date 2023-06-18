const { initializeApp } = require("@firebase/app")
const { getFirestore, collection, doc, serverTimestamp, writeBatch, arrayUnion } = require("@firebase/firestore")

const firebaseConfig = {
	apiKey: "AIzaSyDAIsfI77QWn1P-brER4E11ikPWJRdvQfc",
	authDomain: "tutormanagement-ff356.firebaseapp.com",
	databaseURL: "https://tutormanagement-ff356-default-rtdb.firebaseio.com",
	projectId: "tutormanagement-ff356",
	storageBucket: "tutormanagement-ff356.appspot.com",
	messagingSenderId: "202617977326",
	appId: "1:202617977326:web:554950c0b4ab924af7f6ff",
}

const app = initializeApp(firebaseConfig)
const firestoreDb = getFirestore(app)

module.exports = {
	async completedPayment(req, res) {
		const studentId = req.params.studentId
		const professorId = req.params.professorId

		const d = new Date()
		const minutes = d.getMinutes()
		const hour = d.getHours()
		const seconds = d.getSeconds() == "0" ? d.getSeconds() + "0" : d.getSeconds()
		const day = d.getUTCDate()
		let nextDay
		let month = d.getMonth() + 1
		let nextMonth
		const year = d.getFullYear()
		let nextYear

		const date = `${month}-${day}-${year}`
		const datetime = `${hour}:${minutes}:${seconds}`

		if (month == "12") {
			nextMonth = "1"
		} else {
			nextMonth = d.getMonth() + 2
		}

		if (nextMonth == "2" && day == 30) {
			nextDay = 28
		} else if (day == "31") {
			nextDay = "30"
		} else {
			nextDay = day
		}

		if (month == "12") {
			nextYear = year + 1
		} else {
			nextYear = year
		}

		const batch = writeBatch(firestoreDb)

		const nextDate = `${nextMonth}-${nextDay}-${nextYear}`

		const newPaymentKey = doc(collection(firestoreDb, "payments"))
		const newNextPaymentKey = doc(collection(firestoreDb, "payments"))

		const studentRef = doc(firestoreDb, "students", studentId)
		const professorRef = doc(firestoreDb, "professors", professorId)

		batch.set(newPaymentKey, {
			amount: Number(req.params.amount),
			studentId: studentId,
			professorId: professorId,
			date: date,
			datetime: datetime,
			paid: true,
			timestamp: serverTimestamp(),
		})

		batch.set(newNextPaymentKey, {
			amount: Number(req.params.amount),
			studentId: studentId,
			professorId: professorId,
			date: nextDate,
			paid: false,
			timestamp: serverTimestamp(),
		})

		batch.update(studentRef, {
			professors: arrayUnion(professorId),
		})

		batch.update(professorRef, {
			students: arrayUnion(studentId),
		})

		batch
			.commit()
			.then(() => {
				res.redirect(`${process.env.SERVER_URL}/studentProfile`)
			})
			.catch(error => {
				console.log(error)
				res.redirect(`${process.env.SERVER_URL}/cancel/${professorId}`)
			})
	},
}
