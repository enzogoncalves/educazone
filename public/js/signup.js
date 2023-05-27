import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import { getFirestore, doc, getDocs, collection, query, where, setDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { app } from "./initializeFirebase.js"

const firestoreDb = getFirestore(app)

const form = document.querySelector("form")

form.addEventListener("submit", async e => {
	e.preventDefault()

	const professorChecked = document.getElementById("radio-professor").checked

	const email_input = document.querySelector("#email")
	const password_input = document.querySelector("#password")
	const firstName_input = document.querySelector("#firstName")
	const lastName_input = document.querySelector("#lastName")

	const submitter = e.submitter.getAttribute("id")

	if (submitter === "signin") {
		const auth = getAuth()

		if (email_input.value === "" || password_input.value === "" || firstName_input.value === "" || lastName_input.value === "") {
			alert("Preencha todos os campos corretamente.")
			return
		}

		createUserWithEmailAndPassword(auth, email_input.value, password_input.value)
			.then(userCredential => {
				const user = userCredential.user

				const userData = {
					firstName: firstName_input.value,
					lastName: lastName_input.value,
					email: email_input.value,
				}

				if (professorChecked) {
					setDoc(doc(firestoreDb, "professors", user.uid), userData)
						.then(data => {
							alert("Conta criada com sucesso!")
							window.location = "/editProfile"
						})
						.catch(error => console.error("Houve um erro ao adicionar no banco de dados", error))
				} else {
					setDoc(doc(firestoreDb, "students", user.uid), userData)
						.then(data => {
							alert("Conta criada com sucesso!")
							window.location = "/editProfileStudent"
						})
						.catch(error => console.error("Houve um erro ao adicionar no banco de dados", error))
				}

				clearInputs()
			})
			.catch(error => {
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
			.then(async userCredential => {
				const user = userCredential.user

				const qProfessor = query(collection(firestoreDb, "professors"), where("__name__", "==", user.uid))
				const qStudents = query(collection(firestoreDb, "students"), where("__name__", "==", user.uid))

				const queryProfssors = await getDocs(qProfessor)
				const queryStudents = await getDocs(qStudents)

				const userAlreadyInDb = queryProfssors.empty !== queryStudents.empty

				if (!userAlreadyInDb) {
					const userCompleteName = userCredential.user.displayName.split(" ")

					const userData = {
						firstName: userCompleteName[0],
						lastName: userCompleteName[userCompleteName.length - 1],
						email: user.email,
					}

					if (professorChecked) {
						setDoc(doc(firestoreDb, "professors", user.uid), userData)
							.then(data => {
								alert("Conta criada com sucesso!")
								window.location = "/editProfile"
							})
							.catch(error => console.error("Houve um erro ao adicionar no banco de dados", error))
					} else if (!professorChecked) {
						setDoc(doc(firestoreDb, "students", user.uid), userData)
							.then(data => {
								alert("Conta criada com sucesso!")
								window.location = "/editProfileStudent"
							})
							.catch(error => console.error("Houve um erro ao adicionar no banco de dados", error))
					}
				} else if (userAlreadyInDb) {
					confirm("Você já possui uma conta.\nClique em OK para ir para a página de login.") ? (window.location = "/login") : undefined

					clearInputs()
				}
			})
			.catch(error => {
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
