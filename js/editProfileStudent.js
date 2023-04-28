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
	update,
	set
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

// importo uma função de pegar os dados do usuário dado o id dele
import getUserData from "./modules.js"

const auth = getAuth()
const db = getDatabase()
const dbRef = ref(db)
let idUser;

onAuthStateChanged(auth, (user) => {
	let dbUserData
	idUser = user.uid;

	if (user) {
		

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


// função para carregar o dado do usuário na página
function handleUserData(dbUserData, authUserData) {
	// fullname_label.value = authUserData.displayName
	email_label.value = authUserData.email
		fullname_label.value = dbUserData.name
		username_label.value = dbUserData.username
		phoneNumber_label.value = dbUserData.phoneNumber
		conf_email_label.value = dbUserData.confEmail
		
	console.log(authUserData)
}

//update


// Update the data of the selected row with the new values
function writeNewPostStudent() {
	const db = getDatabase();
	console.log(idUser)
	let name = 'Ulisses 2asdat';
	let email = 'email2@gmail.sd';
	let username = 'German';
  
	// A post entry.
	const postData = {
	name: name,
	email: email,
	username: username  
	};
// Write the new post's data simultaneously in the posts list and the user's post list.
set(ref(db, 'students/' + idUser), 
		postData
	)
  .then(() => {
	// Data saved successfully!
  })
  .catch((error) => {
	// The write failed...
  });
}

const updatesUser = document.getElementById('editUser')
updatesUser.addEventListener('click', writeNewPostStudent)

// eu aconselho a fazer um update no banco de dados de todos os campos exceto: nome completo, senha e email, pois terá que usar uma função para cada um do próprio firebase.

document.querySelector("form").addEventListener("submit", (e) => {
	e.preventDefault() // impede que o evento padrão aconteça
})
