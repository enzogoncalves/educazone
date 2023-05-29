import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

import { getIsStudent, logOut, findUserData, createProfilePicture, createPageSkeleton, redirectToLoginPage } from "./modules.js"

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import { getFirestore, doc, getDocs, collection, query, where, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { app } from "./initializeFirebase.js"

const auth = getAuth()
const firestoreDb = getFirestore(app)

const body = document.querySelector("body")

onAuthStateChanged(auth, user => {
	if (user) {
		const db = getDatabase()
		const dbRef = ref(db)

		onValue(dbRef, snapshot => {
			const userData = findUserData(snapshot.val(), user.uid)
			createHeader(user.photoURL, userData.firstName, userData.lastName, user.uid)
		})
	} else {
		// Caso não tiver um usuário conectado, ele vai para a página de login
		redirectToLoginPage()
	}
})

function createHeader(imageUrl, firstName, lastName, userUid) {
	body.style.overflowY = "visible"
	body.style.pointerEvents = "all"

	const header = document.querySelector("header")
	header.id = "user-header"

	const navigationUl = document.querySelector("header nav ul")
	navigationUl.classList.add("profile-links")
	navigationUl.innerHTML = ""

	const signOutBtn = document.createElement("a")
	signOutBtn.id = "logout"
	signOutBtn.addEventListener("click", logOut)
	signOutBtn.textContent = "Sair"

	if (imageUrl !== null) {
		const userPictureLink = document.createElement("a")
		userPictureLink.innerHTML = `<img src="${imageUrl}" alt="Foto de perfil">`
		navigationUl.append(signOutBtn, userPictureLink)
	} else {
		const image = createProfilePicture(firstName, lastName)
		image.addEventListener("click", () => (window.location = "/editProfile"))
		navigationUl.append(signOutBtn, image)
	}

	const links = document.createElement("ul")
	links.setAttribute("role", "navigation")
	links.classList.add("links")

	if (document.querySelector("header nav .links") !== null) return

	const toggle = document.createElement("div")
	toggle.classList.add("toggle")
	toggle.innerHTML = '<div class="toggle"><i class="fa-solid fa-bars"></i></div>'

	toggle.addEventListener("click", e => {
		document.querySelector("header#user-header nav ul.profile-links").classList.toggle("active")
		document.querySelector("header#user-header nav ul.links").classList.toggle("active")
	})

	getIsStudent(userUid).then(isStudent => {
		const navigation = document.querySelector("header nav")
		if (isStudent) {
			links.innerHTML = `
			<li><a href="building">Home</a></li>
			<li><a href="building">Meus professores</a></li>
			<li><a href="building">Tarefas</a></li>
			<li><a href="searchTeacher">Encontrar um professor</a></li>
		`

			navigation.appendChild(links)
		} else {
			links.innerHTML = `
			<li><a href="dashboardTeacher">Home</a></li>
			<li><a href="building">Meus Alunos</a></li>
			<li><a href="building">Financeiro</a></li>
			<li><a href="building">Tarefas</a></li>
		`
			navigation.appendChild(links)
		}

		navigation.appendChild(toggle)
	})
}

createPageSkeleton()
