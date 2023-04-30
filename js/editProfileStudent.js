import {
	getAuth,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import {
	getDatabase,
	ref,
	onValue,
	update
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

// importo uma função de pegar os dados do usuário dado o id dele
import { findUserData } from "./modules.js"
import { redirectToLoginPage } from "./areUserConnected.js"

const auth = getAuth()
let ids;
onAuthStateChanged(auth, (user) => {
	let dbUserData
	ids = user.uid

	if (user) {
		const db = getDatabase()
		const dbRef = ref(db)

		onValue(dbRef, (snapshot) => {
			dbUserData = findUserData(snapshot.val(), user.uid)
			handleUserData(dbUserData, user)
		})
	} else {
		// Caso não tiver um usuário conectado, ele vai para a página de login
		redirectToLoginPage()
	}
})

const fullname_label = document.querySelector("#fullname")
const username_label = document.querySelector("#username")
const email_label = document.querySelector("#email")
const conf_email_label = document.querySelector("#confirm-email")
const phoneNumber_label = document.querySelector("#number-phone")

// função para carregar o dado do usuário na página
function handleUserData(dbUserData, authUserData) {
	// fullname_label.value = authUserData.displayName
	email_label.value = authUserData.email
	fullname_label.value = dbUserData.name
	username_label.value = dbUserData.username
	phoneNumber_label.value = dbUserData.phoneNumber
}

//update

function updateEmailStudent() {
	const db = getDatabase()
	console.log(ids)

	const postData = {
		firstName: fullname_label.value,
		//coloquei firstName pq o email não altera. Deve ter método específico para alterar o email da autenticação
	}
	update(ref(db, "students/" + ids), postData)
		.then(() => {
			// Cadastrado com sucesso
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
