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
import getUserData from "./areUserConnected.js"

const auth = getAuth()

onAuthStateChanged(auth, (user) => {
	let dbUserData

	if (user) {
		const db = getDatabase()
		const dbRef = ref(db)

		onValue(dbRef, (snapshot) => {
			dbUserData = getUserData(snapshot.val(), user.uid)
			handleUserData(dbUserData, user)
		})
	} else {
		// Caso não tiver um usuário conectado, ele vai para a página inicial
		window.location.pathname = "/"
	}
})

const fullname_label = document.querySelector("#fullname")
const email_label = document.querySelector("#email")
const phoneNumber_label = document.querySelector("#phone-number")
const site_label = document.querySelector("#site")

// função para carregar o dado do usuário na página
function handleUserData(dbUserData, authUserData) {
	fullname_label.textContent = authUserData.displayName
	email_label.textContent = authUserData.email
}
