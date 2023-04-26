import {
	getAuth,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import {
	getDatabase,
	ref,
	get,
	child,
	onValue,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

// importo uma função de pegar os dados do usuário dado o id dele
import { getUserData } from "./areUserConnected.js"

const auth = getAuth()

onAuthStateChanged(auth, (user) => {
	let dbUserData

	if (user) {
		const db = getDatabase()
		const dbRef = ref(db)

		onValue(dbRef, (snapshot) => {
			// snapshot.val() -> dados do usuário no banco de dados
			// user -> dados do usuário no authentication

			dbUserData = getUserData(snapshot.val(), user.uid)
			handleUserData(dbUserData, user)
		})
	} else {
		// Caso não tiver um usuário conectado, ele vai para a página inicial
		window.location.pathname = "/"
	}
})

const fullname_label = document.querySelector("#fullname")
const username_label = document.querySelector("#username")
const email_label = document.querySelector("#email")
const conf_email_label = document.querySelector("#confirm-email")
const phoneNumber_label = document.querySelector("#number-phone")
const site_label = document.querySelector("#site")
const about_label = document.querySelector("#about")
const didactic_label = document.querySelector("#didatica")

// função para carregar o dado do usuário na página
function handleUserData(dbUserData, authUserData) {
	// fullname_label.value = authUserData.displayName
	email_label.value = authUserData.email

	const db = getDatabase()
	const dbRef = ref(db)
	get(child(dbRef, `professors/${authUserData.uid}`))
		.then((snapshot) => {
			if (snapshot.exists()) {
				const userData = snapshot.val()

				fullname_label.value = userData.name
				username_label.value = userData.username
				phoneNumber_label.value = userData.phoneNumber
				site_label.value = userData.site
				about_label.value = userData.aboutme
				conf_email_label.value = userData.confEmail
				didactic_label.value = userData.didactic

				console.log(snapshot.val())
			} else {
				console.log("No data available")
			}
		})
		.catch((error) => {
			console.error(error)
		})

	console.log(authUserData)
}

// eu aconselho a fazer um update no banco de dados de todos os campos exceto: nome completo, senha e email, pois terá que usar uma função para cada um do próprio firebase.

document.querySelector("form").addEventListener("submit", (e) => {
	e.preventDefault() // impede que o evento padrão aconteça
})
