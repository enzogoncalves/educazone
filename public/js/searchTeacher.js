import { getFirestore, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { app } from "./initializeFirebase.js"

import { createProfilePicture } from "./modules.js"

const firestoreDb = getFirestore(app)

const querySnapshot = await getDocs(collection(firestoreDb, "professors"))

document.querySelector(".page-skeleton").classList.remove("active")

const professorsSection = document.querySelector("#professors")

querySnapshot.forEach(doc => {
	handleProfessorsData(doc.id, doc.data())
})

// função para carregar o dado do usuário na página
function handleProfessorsData(professorId, professor) {
	if (document.getElementById(professorId) !== null) return

	const professorElement = document.createElement("div")
	professorElement.classList.add("professor")
	professorElement.id = professorId
	professorElement.innerHTML = `
		<div class="picture-price">
			<span>${professor.price ? "R$ " + professor.price : ""}</span>
		</div>
		<div class="info">
			<p>
				<span>${professor.firstName}</span>
				<span>${professor.class}</span>
			</p>
			<p>${professor.aboutMe}</p>
			<button type="submit">Mostrar detalhes</button>
		</div>
	`
	professorsSection.appendChild(professorElement)

	const picturePriceElement = document.getElementById(professorId).children[0]

	if (professor.pictureUrl === undefined) {
		const profilePicture = createProfilePicture(professor.firstName, professor.lastName)
		picturePriceElement.appendChild(profilePicture)
	} else {
		picturePriceElement.innerHTML += `
				<img src="${professor.pictureUrl}" alt="Foto de perfil" class="profilePicture"/>
			`
	}

	document.querySelectorAll(".professor .info button").forEach(button => {
		button.addEventListener("click", () => {
			const professorId = button.parentElement.parentElement.getAttribute("id")
			window.location = `/hireTeacher/${professorId}`
		})
	})
}
