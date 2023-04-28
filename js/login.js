import {
	getAuth,
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
	
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import {
	getDatabase,
	ref,
	get,
	child,
	onValue,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

import getUserData from "./modules.js"

const auth = getAuth()

const form = document.querySelector("form")

form.addEventListener("submit", (e) => {
	e.preventDefault()

	const email_input = document.querySelector("#email")
	const password_input = document.querySelector("#password")

	const submitter = e.submitter.getAttribute("id")
	let dbUserData;
	const db = getDatabase()
	const dbRef = ref(db)
	if (submitter === "signin") {
		signInWithEmailAndPassword(auth, email_input.value, password_input.value)
			.then((userCredential) => {
				console.log(userCredential.user.uid)

				onValue(dbRef, (snapshot) => {
					// snapshot.val() -> dados do usuário no banco de dados
					// user -> dados do usuário no authentication
					
					dbUserData = getUserData(snapshot.val(), userCredential.user.uid)
					if(dbUserData.student)
					{
						window.location = '/html/editProfileStudent.html'
					}
					else
					{
						window.location = '/html/editProfile.html'
					}
				})
			})
			.catch((error) => {
				const errorMessage = error.message

				clearInputs()
				alert(errorMessage)
			})
	} else if (submitter === "signin-with-google") {
		const provider = new GoogleAuthProvider()

		signInWithPopup(auth, provider)
			.then((result) => {
				onValue(dbRef, (snapshot) => {
					// snapshot.val() -> dados do usuário no banco de dados
					// user -> dados do usuário no authentication
					
					dbUserData = getUserData(snapshot.val(), userCredential.user.uid)
					if(dbUserData.student)
					{
						window.location = '/html/editProfileStudent.html'

						console.log(dbUserData.username)
					}
					else
					{
						window.location = '/html/editProfile.html'

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
	document.querySelector('#email').value = '';
	document.querySelector('#password').value = '';
}