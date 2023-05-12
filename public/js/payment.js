import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

import { getIsStudent, logOut, findUserData, getUserData } from "./modules.js"

const auth = getAuth()

const body = document.querySelector("body")

const professorId = body.getAttribute("id")

onAuthStateChanged(auth, user => {
	if (user) {
		getIsStudent(user.uid)
        .then(isStudent => {
            if(isStudent === false) {
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
    console.log(professorData)
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

