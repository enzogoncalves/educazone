import {
	getAuth,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import {
	getDatabase,
	ref,
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
	}
})

const fullname_label = document.querySelector("#fullname")
const email_label = document.querySelector("#email")
const phoneNumber_label = document.querySelector("#phone-number")
const site_label = document.querySelector("#site")

// função para carregar o dado do usuário na página
function handleUserData(dbUserData, authUserData) {
	fullname_label.value = authUserData.displayName
	email_label.value = authUserData.email
	console.log(authUserData)
}

// eu aconselho a fazer um update no banco de dados de todos os campos exceto: nome completo, senha e email, pois terá que usar uma função para cada um do próprio firebase.

document.querySelector("form").addEventListener("submit", (e) => {
	e.preventDefault() // impede que o evento padrão aconteça
})
