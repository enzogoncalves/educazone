import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

export function logOut() {
	const auth = getAuth()

	signOut(auth)
		.then(() => {
			alert("deslogado")
			window.location = "/login"
		})
		.catch(error => {
			console.error(error)
		})
}

export function createProfilePicture(firstName, lastName) {
	const firstLetterOfTheFirstName = firstName ? firstName.split("")[0].toUpperCase() : "?"
	const firstLetterOfTheLastName = lastName ? lastName.split("")[0].toUpperCase() : "?"

	const image = document.createElement("div")
	image.classList.add("profilePicture")

	image.textContent = `${firstLetterOfTheFirstName}${firstLetterOfTheLastName}`

	return image
}

export function createPageSkeleton() {
	const skeleton = document.createElement("div")
	skeleton.classList.add("page-skeleton", "active")

	skeleton.innerHTML = `
		<div class="loading"></div>
	`

	const body = document.querySelector("body")

	body.style.overflowY = "hidden"
	body.style.pointerEvents = "none"
	body.appendChild(skeleton)
}

export function redirectToLoginPage() {
	window.location = "/login"
}
