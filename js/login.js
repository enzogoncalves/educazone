import {
	getAuth,
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import { getIsStudent } from "./modules.js"

const auth = getAuth()

const form = document.querySelector("form")

form.addEventListener("submit", (e) => {
	e.preventDefault()

	const email_input = document.querySelector("#email")
	const password_input = document.querySelector("#password")

	const submitter = e.submitter.getAttribute("id")

	if (submitter === "signin") {
		signInWithEmailAndPassword(auth, email_input.value, password_input.value)
			.then((userCredential) => {
				getIsStudent(userCredential.user.uid).then((isStudent) => {
					if (isStudent !== undefined) {
						if (isStudent) {
							window.location = "/html/editProfileStudent.html"
						} else {
							window.location = "/html/editProfile.html"
						}
					} else {
						alert("Não conseguimos encontrar o usuário no banco de dados.")
						clearInputs()
					}
				})
			})
			.catch((error) => {
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
			.then((userCredential) => {
				getIsStudent(userCredential.user.uid).then((isStudent) => {
					if (isStudent === undefined) {
						alert("Você precisa criar uma conta primeiro.")
					} else if (isStudent) {
						window.location = "/html/editProfileStudent.html"
					} else {
						window.location = "/html/editProfile.html"
					}
				})
			})
			.catch((error) => {
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
