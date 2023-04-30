import {
	getAuth,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import { logOut } from "./modules.js"

const auth = getAuth()

onAuthStateChanged(auth, (user) => {
	if (user) {
		createHeader(user.photoURL)
	} else {
		// Caso não tiver um usuário conectado, ele vai para a página de login
		redirectToLoginPage()
	}
})

function createHeader(imageUrl) {
	const body = document.querySelector("body")

	const header = document.createElement("header")
	header.setAttribute("id", "user-header")

	const signOutBtn = document.createElement("a")
	signOutBtn.setAttribute("id", "logout")
	signOutBtn.addEventListener("click", logOut)
	signOutBtn.textContent = "Sair"

	const userPictureLink = document.createElement("a")

	if (imageUrl !== null) {
		userPictureLink.innerHTML = `<img src="${imageUrl}" alt="Foto de perfil">`
	} else {
		userPictureLink.innerHTML = `<img alt="Foto">`
	}

	header.innerHTML = `
		<nav>
				<a href="/" id="title">Educa<span>Zone</span></a>
				<ul role="navigation">
				</ul>
		</nav>
	`

	body.childNodes[1].remove()
	body.appendChild(header)
	document.querySelector("header nav ul").append(signOutBtn, userPictureLink)
}

export function redirectToLoginPage() {
	window.location = "/html/login.html"
}
