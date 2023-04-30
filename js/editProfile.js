import {
	getAuth,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import {
	getDatabase,
	ref,
	onValue,
	set,
	update,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

import { findUserData } from "./modules.js"
import { redirectToLoginPage } from "./areUserConnected.js"

const auth = getAuth()
let userId
onAuthStateChanged(auth, (user) => {
	let dbUserData
	userId = user.uid
	if (user) {
		const db = getDatabase()
		const dbRef = ref(db)

		onValue(dbRef, (snapshot) => {
			dbUserData = findUserData(snapshot.val(), userId)
			handleUserData(dbUserData, user)
		})
	} else {
		redirectToLoginPage()
	}
})

const firstName_label = document.querySelector("#firstName")
const lastName_label = document.querySelector("#lastName")
const email_label = document.querySelector("#email")
const conf_email_label = document.querySelector("#confirm-email")
const phoneNumber_label = document.querySelector("#number-phone")
const site_label = document.querySelector("#site")
const about_label = document.querySelector("#about")
const didactic_label = document.querySelector("#didatica")

// função para carregar o dado do usuário na página
function handleUserData(dbUserData, authUserData) {
	firstName_label.value = dbUserData.firstName
	lastName_label.value = dbUserData.lastName
	email_label.value = authUserData.email
	// fullname_label.value = dbUserData.name
	// phoneNumber_label.value = dbUserData.phoneNumber
	// site_label.value = dbUserData.site
	// about_label.value = dbUserData.aboutme
	// didactic_label.value = dbUserData.didactic
}

function updateEmailStudent() {
	const db = getDatabase()
	console.log(ids)
	let emails = email_label.value

	const postData = {
		email: emails,
	}

	// Update the email field
	update(ref(db, "professors/" + ids), postData)
		.then(() => {
			// editado com sucesso
		})
		.catch((error) => {
			// Algo deu errado...
		})
}

const updatesUser = document.getElementById("editUser")
updatesUser.addEventListener("click", updateEmailStudent)
// eu aconselho a fazer um update no banco de dados de todos os campos exceto: nome completo, senha e email, pois terá que usar uma função para cada um do próprio firebase.

document.querySelector("form").addEventListener("submit", (e) => {
	e.preventDefault() // impede que o evento padrão aconteça
})
