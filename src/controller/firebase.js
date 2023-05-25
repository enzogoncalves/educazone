const { initializeApp } = require("@firebase/app")
const { getDatabase, ref, set, child, update, push } = require("@firebase/database")

const firebaseConfig = {
	apiKey: "AIzaSyDAIsfI77QWn1P-brER4E11ikPWJRdvQfc",
	authDomain: "tutormanagement-ff356.firebaseapp.com",
	databaseURL: "https://tutormanagement-ff356-default-rtdb.firebaseio.com",
	projectId: "tutormanagement-ff356",
	storageBucket: "tutormanagement-ff356.appspot.com",
	messagingSenderId: "202617977326",
	appId: "1:202617977326:web:554950c0b4ab924af7f6ff",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

module.exports = {
	completedPayment(req, res) {
		const d = new Date()
		const minutes = d.getMinutes()
		const hour = d.getHours()
		const seconds = d.getSeconds() == "0" ? d.getSeconds() + "0" : d.getSeconds()
		const day = d.getUTCDate()
		let nextDay;
		let month = d.getMonth() + 1
		let nextMonth;
		const year = d.getFullYear()
		let nextYear;

		console.log(day)

		const date = `${day}-${month}-${year}`
		const datetime = `${hour}:${minutes}:${seconds}`

		if(month == "12") {
			nextMonth = "1"
		} else {
			nextMonth = d.getMonth() + 2
		}

		if(nextMonth == "2" && day == 30) {
			nextDay = 28;
		} else if(day == "31"){
			nextDay = "30";
		} else {
			nextDay = day;
		}

		if(month == "12") {
			nextYear = year + 1;
		} else {
			nextYear = year;
		}
	
		const nextDate = `${nextDay}-${nextMonth}-${nextYear}`

		const newPaymentKey = push(child(ref(db), "payment")).key
		const newNextPaymentKey = push(child(ref(db), "payment")).key

		Promise.all([
			set(ref(db, `payments/${newPaymentKey}/`), {
				amount: req.params.amount,
				studentId: req.params.studentId,
				professorId: req.params.professorId,
				date: date,
				datetime: datetime,
				paid: true
			}),
			
			set(ref(db, `payments/${newNextPaymentKey}/`), {
				studentId: req.params.studentId,
				professorId: req.params.professorId,
				date: nextDate,
				paid: false
			}),

			update(ref(db, `professors/${req.params.professorId}/studentss`), {
				[req.params.studentId]: [newPaymentKey]
			})
		])
		.then(() => {
			res.redirect(`${process.env.SERVER_URL}/success`)
		})
		.catch(error => {
			console.log(error)
			res.redirect(`${process.env.SERVER_URL}/cancel`)
		})	
	},
}
