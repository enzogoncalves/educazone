import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"
import { createProfilePicture } from "./modules.js"

const db = getDatabase()
const professorsRef = ref(db, "professors/")

onValue(professorsRef, snapshot => {
	document.querySelector(".page-skeleton").classList.remove("active")
	document.querySelector("#n-results").textContent = Object.keys(snapshot.val()).length + " Resultados"
	handleProfessorsData(snapshot.val())
})

const professorsSection = document.querySelector("#professors")

// função para carregar o dado do usuário na página
function handleProfessorsData(professors) {
	for (const professorId in professors) {
		const professor = professors[professorId]

		if (document.getElementById(professorId) !== null) return

		const professorElement = document.createElement("div")
		professorElement.classList.add("professor")
		professorElement.id = professorId
		professorElement.innerHTML = `
			<div class="picture-price">
				<span>R$ ${professor.price}</span>
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
	}

	document.querySelectorAll(".professor .info button").forEach(button => {
		button.addEventListener("click", () => {
			const professorId = button.parentElement.parentElement.getAttribute("id")
			window.location = `/hireTeacher/${professorId}`
		})
	})
}
