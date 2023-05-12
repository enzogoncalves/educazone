import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

import { getIsStudent, logOut } from "./modules.js"
import { findUserData } from "./modules.js"

const auth = getAuth()

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
	header.setAttribute("id", "user-header")

	const navigationUl = document.querySelector("header nav ul")
	navigationUl.classList.add("profile-links")
	navigationUl.innerHTML = ""

	const signOutBtn = document.createElement("a")
	signOutBtn.setAttribute("id", "logout")
	signOutBtn.addEventListener("click", logOut)
	signOutBtn.textContent = "Sair"

	if (imageUrl !== null) {
		const userPictureLink = document.createElement("a")
		userPictureLink.innerHTML = `<img src="${imageUrl}" alt="Foto de perfil">`
		navigationUl.append(signOutBtn, userPictureLink)
	} else {
		const image = createProfilePicture(firstName, lastName)
		navigationUl.append(signOutBtn, image)
	}

	const links = document.createElement("ul")
	links.setAttribute("role", "navigation")
	links.classList.add("links")

	if(document.querySelector("header nav .links") !== null) return

	getIsStudent(userUid).then(isStudent => {
		if (isStudent) {
			links.innerHTML = `
			<li><a href="dashboardStudent">Home</a></li>
			<li><a href="myTeachers">Meus professores</a></li>
			<li><a href="studentAssignments">Tarefas</a></li>
			<li><a href="searchTeacher">Encontrar um professor</a></li>
		`
			const navigation = document.querySelector("header nav")
			navigation.appendChild(links)
		} else {
			links.innerHTML = `
			<li><a href="dashboardTeacher">Home</a></li>
			<li><a href="myStudents">Meus Alunos</a></li>
			<li><a href="financial">Financeiro</a></li>
			<li><a href="assignments">Tarefas</a></li>
		`
			const navigation = document.querySelector("header nav")
			navigation.appendChild(links)
		}
	})
}

export function redirectToLoginPage() {
	window.location = "/login"
}

export function createProfilePicture(firstName, lastName) {
	const firstLetterOfTheFirstName = firstName.split("")[0].toUpperCase()
	const firstLetterOfTheLastName = lastName.split("")[0].toUpperCase()

	const image = document.createElement("div")
	image.classList.add("profilePicture")

	image.textContent = `${firstLetterOfTheFirstName}${firstLetterOfTheLastName}`

	return image
}

function createPageSkeleton() {
	const skeleton = document.createElement("div")
	skeleton.classList.add("page-skeleton", "active")

	skeleton.innerHTML = `
		<div class="loading"></div>
	`

	body.style.overflowY = "hidden"
	body.style.pointerEvents = "none"
	body.appendChild(skeleton)
}

createPageSkeleton()
