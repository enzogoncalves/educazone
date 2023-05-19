import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"
import { createProfilePicture } from "./modules.js"

const professorId = document.querySelector("body").getAttribute("id")

if (professorId === null) {
	window.location = "/searchTeacher"
}

const db = getDatabase()
const teacherRef = ref(db, "professors/" + professorId)

onValue(teacherRef, snapshot => {
	loadTeacherData(snapshot.val())
	document.querySelector(".page-skeleton").classList.remove("active")
})

function loadTeacherData(professor) {
	document.querySelector("#price").textContent = professor.price || "R$ Não inserido"
	document.querySelector(".name").textContent = professor.firstName + " " + professor.lastName
	document.querySelector(".aboutMe").innerHTML = professor.aboutMe
	document.querySelector(".didactic").innerHTML = professor.didactic
	document.querySelector(".phoneNumber").innerHTML = professor.phoneNumber
	document.querySelector(".email").innerHTML = professor.email

	const picturePriceElement = document.querySelector("#hire .picture-price")

	if (professor.pictureUrl === undefined) {
		if (document.querySelector("#hire .picture-price .profilePicture") === null) {
			const profilePicture = createProfilePicture(professor.firstName, professor.lastName)
			picturePriceElement.appendChild(profilePicture)
		} else {
			document.querySelector("#hire .picture-price .profilePicture").remove()
			const profilePicture = createProfilePicture(professor.firstName, professor.lastName)
			picturePriceElement.appendChild(profilePicture)
		}
	} else {
		if (document.querySelector("#hire .picture-price .profilePicture") === null) {
			picturePriceElement.innerHTML += `
				<img src="${professor.pictureUrl}" alt="Foto de perfil" class="profilePicture"/>
			`
		} else {
			document.querySelector("#hire .picture-price .profilePicture").remove()
			picturePriceElement.innerHTML += `
				<img src="${professor.pictureUrl}" alt="Foto de perfil" class="profilePicture"/>
			`
		}
	}
}

document.querySelector("#hire-btn").addEventListener("click", () => {
	window.location = `/payment/${professorId}`
})
