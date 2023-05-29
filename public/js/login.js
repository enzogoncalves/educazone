import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import { getFirestore, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { app } from "./initializeFirebase.js"

const firestoreDb = getFirestore(app)

const auth = getAuth()

const form = document.querySelector("form")

form.addEventListener("submit", e => {
	e.preventDefault()

	const email_input = document.querySelector("#email")
	const password_input = document.querySelector("#password")

	const submitter = e.submitter.getAttribute("id")

	if (submitter === "signin") {
		signInWithEmailAndPassword(auth, email_input.value, password_input.value)
			.then(async userCredential => {
				const q = query(collection(firestoreDb, "students"), where("__name__", "==", userCredential.user.uid))
				const queryStudents = await getDocs(q)

				const isStudent = !queryStudents.empty

				if (isStudent) {
					window.location = "/studentProfile"
				} else {
					window.location = "/professorProfile"
				}
			})
			.catch(error => {
				const errorMessage = error.message

				if (errorMessage == "Firebase: Error (auth/user-not-found).") {
					alert("Você precisa criar uma conta primeiro.")
				} else {
					alert(errorMessage)
				}

				clearInputs()
			})
	} else if (submitter === "signin-with-google") {
		const provider = new GoogleAuthProvider()

		signInWithPopup(auth, provider)
			.then(async userCredential => {
				const qProfessor = query(collection(firestoreDb, "professors"), where("__name__", "==", userCredential.user.uid))
				const qStudents = query(collection(firestoreDb, "students"), where("__name__", "==", userCredential.user.uid))

				const queryProfssors = await getDocs(qProfessor)
				const queryStudents = await getDocs(qStudents)

				const isProfessor = !queryProfssors.empty
				const isStudent = !queryStudents.empty

				if (isStudent === isProfessor) {
					alert("Você precisa criar uma conta primeiro.")
				} else if (isStudent) {
					window.location = "/studentProfile"
				} else {
					window.location = "/professorProfile"
				}
			})
			.catch(error => {
				const errorCode = error.code
				const errorMessage = error.message

				clearInputs()
				alert(errorCode, errorMessage)
			})
	}
})

function clearInputs() {
	document.querySelector("#email").value = ""
	document.querySelector("#password").value = ""
}
