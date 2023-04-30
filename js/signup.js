import {
	getAuth,
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import {
	getDatabase,
	ref,
	set,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

import { getUserData } from "./modules.js"

const form = document.querySelector("form")

form.addEventListener("submit", (e) => {
	e.preventDefault()

	const professorChecked = document.getElementById("radio-professor").checked

	const email_input = document.querySelector("#email")
	const password_input = document.querySelector("#password")
	const firstName_input = document.querySelector("#firstName")
	const lastName_input = document.querySelector("#lastName")

	const submitter = e.submitter.getAttribute("id")

	if (submitter === "signin") {
		const auth = getAuth()

		if (
			email_input.value === "" ||
			password_input.value === "" ||
			firstName_input.value === "" ||
			lastName_input.value === ""
		) {
			alert("Preencha todos os campos corretamente.")
			return
		}

		createUserWithEmailAndPassword(
			auth,
			email_input.value,
			password_input.value
		)
			.then((userCredential) => {
				const user = userCredential.user
				const db = getDatabase()

				const userData = {
					firstName: firstName_input.value,
					lastName: lastName_input.value,
				}

				if (professorChecked) {
					set(ref(db, `professors/${user.uid}/`), userData)
						.then((data) => {
							alert("Conta criada com sucesso!")
							window.location = "/html/login.html"
						})
						.catch((error) =>
							console.error(
								"Houve um erro ao adicionar no banco de dados",
								error
							)
						)
				} else {
					set(ref(db, `students/${user.uid}/`), userData)
						.then((data) => {
							alert("Conta criada com sucesso!")
							window.location = "/html/login.html"
						})
						.catch((error) =>
							console.error(
								"Houve um erro ao adicionar no banco de dados",
								error
							)
						)
				}

				clearInputs()
			})
			.catch((error) => {
				const errorMessage = error.message

				if (error.code == "auth/email-already-in-use") {
					clearInputs()
					alert("Este email já está cadastrado na plataforma")
				} else {
					alert(errorMessage)
				}
			})
	} else if (submitter === "signin-with-google") {
		const auth = getAuth()

		const provider = new GoogleAuthProvider()

		signInWithPopup(auth, provider)
			.then((userCredential) => {
				const user = userCredential.user

				getUserData(user.uid)
					.then((snapshot) => {
						const userAlreadyInDb = snapshot !== undefined

						const userCompleteName = userCredential.user.displayName.split(" ")

						const userData = {
							firstName: userCompleteName[0],
							lastName: userCompleteName[userCompleteName.length - 1],
						}

						const db = getDatabase()

						if (professorChecked && !userAlreadyInDb) {
							set(ref(db, `professors/${user.uid}/`), userData)
								.then((data) => {
									alert("Conta criada com sucesso!")
									window.location = "/html/login.html"
								})
								.catch((error) =>
									console.error(
										"Houve um erro ao adicionar no banco de dados",
										error
									)
								)
						} else if (!professorChecked && !userAlreadyInDb) {
							set(ref(db, `students/${user.uid}/`), userData)
								.then((data) => {
									alert("Conta criada com sucesso!")
									window.location = "/html/login.html"
								})
								.catch((error) =>
									console.error(
										"Houve um erro ao adicionar no banco de dados",
										error
									)
								)
						} else if (userAlreadyInDb) {
							confirm(
								"Você já possui uma conta.\nClique em OK para ir para a página de login."
							)
								? (window.location = "/html/login.html")
								: undefined

							clearInputs()
						}
					})
					.catch((error) => console.error(error))
			})
			.catch((error) => {
				const errorCode = error.code
				const errorMessage = error.message

				clearInputs()
				alert(errorCode + errorMessage)
			})
	}
})

function clearInputs() {
	document.querySelector("#radio-professor").checked = false
	document.querySelector("#radio-professor").checked = false
	document.querySelector("#email").value = ""
	document.querySelector("#password").value = ""
	document.querySelector("#firstName").value = ""
	document.querySelector("#lastName").value = ""
}
