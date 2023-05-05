import {
	getAuth,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import {
	getDatabase,
	ref,
	onValue,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

import { logOut } from "./modules.js"
import { findUserData } from "./modules.js"

const auth = getAuth()

const body = document.querySelector("body");

onAuthStateChanged(auth, (user) => {
	if (user) {
		const db = getDatabase()
		const dbRef = ref(db)
		
		onValue(dbRef, (snapshot) => {
			const userData = findUserData(snapshot.val(), user.uid)
			createHeader(user.photoURL, userData.firstName, userData.lastName)
		})
	} else {
		// Caso não tiver um usuário conectado, ele vai para a página de login
		redirectToLoginPage()
	}
})

function createHeader(imageUrl, firstName, lastName) {
	document.querySelector('.page-skeleton').classList.remove('active')
	body.style.overflowY = "visible"
	body.style.pointerEvents = "all"

	const header = document.querySelector('header')
	header.setAttribute("id", "user-header")

	const navigationUl = document.querySelector('header nav ul')
	navigationUl.innerHTML = ''

	const signOutBtn = document.createElement("a")
	signOutBtn.setAttribute("id", "logout")
	signOutBtn.addEventListener("click", logOut)
	signOutBtn.textContent = "Sair"

	const userPictureLink = document.createElement("a")

	if (imageUrl !== null) {
		userPictureLink.innerHTML = `<img src="${imageUrl}" alt="Foto de perfil">`
		navigationUl.append(signOutBtn, userPictureLink)
	} else {
		const image = createProfilePicture(firstName, lastName)
		navigationUl.append(signOutBtn, image)
	}
}

export function redirectToLoginPage() {
	window.location = "/html/login.html"
}

function createProfilePicture(firstName, lastName) {
	const firstLetterOfTheFirstName = firstName.split('')[0].toUpperCase()
	const firstLetterOfTheLastName = lastName.split('')[0].toUpperCase()
	
	const image = document.createElement('div')
	image.classList.add('profilePicture')
	
	image.textContent = `${firstLetterOfTheFirstName}${firstLetterOfTheLastName}`
	
	return image;
}

function createPageSkeleton() {
	const skeleton = document.createElement('div')
	skeleton.classList.add('page-skeleton', 'active')

	skeleton.innerHTML = `
		<div class="loading"></div>
	`

	body.style.overflowY = "hidden"
	body.style.pointerEvents = "none"
	body.appendChild(skeleton)
}	

createPageSkeleton()