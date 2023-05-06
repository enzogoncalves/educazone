import {
	getDatabase,
	ref,
	onValue,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

const db = getDatabase()
const professorsRef = ref(db, "professors/")

onValue(professorsRef, (snapshot) => {
	handleProfessorsData(snapshot.val())
})

const professorsSection = document.querySelector("#professors")

// função para carregar o dado do usuário na página
function handleProfessorsData(professors) {
	for (const professorId in professors) {
		const professor = professors[professorId]

		const professorElement = document.createElement("div")
		professorElement.classList.add("professor")
		professorElement.innerHTML = `
			<div class="picture-price">
				<img src="${professor.pictureUrl}" alt="Foto do professor">
				<span>R$ ${professor.price}</span>
			</div>
			<div class="info">
				<p>
					<span>${professor.firstName}</span>
					<span>${professor.class}</span>
				</p>
				<p>${professor.aboutMe}</p>
				<button type="submit" id="${professorId}">Mostrar detalhes</button>
			</div>
		`

		professorsSection.appendChild(professorElement)
	}

	document.querySelectorAll(".professor .info button").forEach((button) => {
		button.addEventListener("click", () => {
			localStorage.setItem("professorId", button.getAttribute("id"))
			window.location = "/html/hireTeacher.html"
		})
	})
}
