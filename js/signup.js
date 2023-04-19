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
	onValue,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

const auth = getAuth()

const form = document.querySelector("form")

form.addEventListener("submit", (e) => {
	e.preventDefault()

	const professorChecked = document.getElementById("radio-professor").checked

	const email_input = document.querySelector("#email")
	const password_input = document.querySelector("#password")

	const submitter = e.submitter.getAttribute("id")

	if (submitter === "signin") {
		createUserWithEmailAndPassword(
			auth,
			email_input.value,
			password_input.value
		)
			.then((userCredential) => {
				const user = userCredential.user
				const db = getDatabase()

				if (professorChecked) {
					set(ref(db, `professors/${user.uid}/`), { professor: true })
				} else {
					set(ref(db, `students/${user.uid}/`), { student: true })
				}

				clearInputs()
				alert("Conta criada com sucesso!")
			})
			.catch((error) => {
				const errorMessage = error.message

				if (error.code == "auth/email-already-in-use") {
					clearInputs()
					alert("Este email já está cadastrado na plataforma")
				}
			})
	} else if (submitter === "signin-with-google") {
		const provider = new GoogleAuthProvider()

		signInWithPopup(auth, provider)
			.then((result) => {
				const user = result.user
				const dbRef = ref(getDatabase())
				const db = getDatabase()

				onValue(dbRef, (snapshot) => {
					let usersId = []

					for (const i in snapshot.val()) {
						for (const j in snapshot.val()[i]) {
							usersId.push(j)
						}
					}

					const userAlreadyInDb = usersId.some((el) => el == user.uid)

					if (professorChecked && !userAlreadyInDb) {
						set(ref(db, `professors/${user.uid}/`), { student: true })
						console.log("professor criado")
						return
					} else if (!professorChecked && !userAlreadyInDb) {
						set(ref(db, `students/${user.uid}/`), { student: true })
						console.log("estudante criado")
						return
					} else if (userAlreadyInDb) {
						confirm(
							"Você já possui uma conta.\nClique em OK para ir para a página de login."
						)
							? (window.location = "/html/login.html")
							: undefined

							clearInputs()
					}
				})
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
	document.querySelector('#email').value = '';
	document.querySelector('#password').value = '';
	document.querySelector('#radio-professor').checked = false;
	document.querySelector('#radio-professor').checked = false;
}