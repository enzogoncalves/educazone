import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import { createProfilePicture } from "./modules.js"

import { getFirestore, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { app } from "./initializeFirebase.js"

const firestoreDb = getFirestore(app)

const auth = getAuth()

const body = document.querySelector("body")

const professorId = body.getAttribute("id")

let professor

let studentId

onAuthStateChanged(auth, async authUser => {
	if (authUser) {
		const qProfessor = query(collection(firestoreDb, "professors"), where("__name__", "==", professorId))
		const queryProfessor = await getDocs(qProfessor)

		const qUser = query(collection(firestoreDb, "professors"), where("__name__", "==", authUser.uid))
		const queryUser = await getDocs(qUser)
		const isProfessor = !queryUser.empty

		if (isProfessor) {
			alert("Professores não podem contratar outros professores. Faça o login como estudante para continuar.")
			window.location = `/hireTeacher/${professorId}`
			return
		}

		studentId = authUser.uid

		queryProfessor.forEach(doc => {
			document.querySelector(".page-skeleton").classList.remove("active")
			body.style.overflowY = "visible"
			body.style.pointerEvents = "all"
			professor = doc.data()
			loadProfessorData(doc.data())
		})
	} else {
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
