import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

import { getIsStudent, getUserData, createProfilePicture } from "./modules.js"

const auth = getAuth()

const body = document.querySelector("body")

const professorId = body.getAttribute("id")

let professor

let studentId

onAuthStateChanged(auth, user => {
	if (user) {
		getIsStudent(user.uid)
			.then(isStudent => {
				if (isStudent === false) {
					alert("Professores não podem contratar professores. Faça o login como estudante para continuar.")
					window.location = `/hireTeacher/${professorId}`
					return
				}

				studentId = user.uid

				getUserData(professorId)
					.then(professorData => {
						document.querySelector(".page-skeleton").classList.remove("active")
						body.style.overflowY = "visible"
						body.style.pointerEvents = "all"
						professor = professorData
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
	document.getElementById("price").textContent = `R$ ${professorData.price},00`
	document.getElementById("fullname").textContent = `${professorData.firstName} ${professorData.lastName}`
	document.getElementById("firstName").textContent = `Contratar ${professorData.firstName}`

	if (professorData.pictureUrl === undefined) {
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

document.querySelector("#pay").addEventListener("click", () => {
	fetch("/create-checkout-session", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			payment: {
				price: professor.price,
				name: professor.firstName,
				studentId: studentId,
				professorId: professorId,
			},
		}),
	})
		.then(res => {
			if (res.ok) return res.json()
			return res.json().then(json => Promise.reject(json))
		})
		.then(({ url }) => {
			window.location = url
		})
		.catch(e => {
			console.error(e.error)
		})
})