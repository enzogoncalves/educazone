import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

import { getIsStudent, getUserData, createProfilePicture } from "./modules.js"

const auth = getAuth()

const body = document.querySelector("body")

const professorId = body.getAttribute("id")

onAuthStateChanged(auth, user => {
	if (user) {
		getIsStudent(user.uid)
			.then(isStudent => {
				if (isStudent === false) {
					alert("Professores não podem contratar professores. Faça o login como estudante para continuar.")
					window.location = `/hireTeacher/${professorId}`
				}

				getUserData(professorId)
					.then(professorData => {
						document.querySelector(".page-skeleton").classList.remove("active")
						loadProfessorData(professorData)
					})
					.catch(error => console.error(error))
			})
			.catch(error => console.error(error))
	} else {
		// Caso não tiver um usuário conectado, ele vai para a página de login
		redirectToLoginPage()
	}
})

function loadProfessorData(professorData) {
	document.getElementById("price").textContent = professorData.price
	document.getElementById("fullname").textContent = `${professorData.firstName} ${professorData.lastName}`
	document.getElementById("firstName").textContent = `Contratar ${professorData.firstName}`

	if(professorData.pictureUrl === undefined) {
		document.getElementById("professorPicture").innerHTML += `
			<img src="${professorData.pictureUrl}" alt="Imagem do professor" class="profilePicture"/>
		`
	} else {
		document.getElementById("professorPicture").appendChild(createProfilePicture(professorData.firstName, professorData.lastName))
	}
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
