import {
	getAuth,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import {
	getDatabase,
	ref,
	onValue,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

import { findUserData } from "./modules.js"
import { redirectToLoginPage } from "./areUserConnected.js"
import { openEditModal, showUserData } from "./editProfile.js"

const auth = getAuth()

let userId

const fields = ["firstName", "lastName", "email", "phoneNumber"]

onAuthStateChanged(auth, (user) => {
	let dbUserData
	userId = user.uid
	if (user) {
		const db = getDatabase()
		const dbRef = ref(db)

		onValue(dbRef, (snapshot) => {
			dbUserData = findUserData(snapshot.val(), userId)
			showUserData(dbUserData, user, fields)
		})
	} else {
		redirectToLoginPage()
	}
})

document.querySelector("form").addEventListener("submit", (e) => {
	e.preventDefault()

	const submitter = e.submitter

	openEditModal(submitter, "students")
})
