import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import { getFirestore, doc, getDocs, collection, query, where, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { app } from "./initializeFirebase.js"

import { createProfilePicture, redirectToLoginPage } from "./modules.js"

const auth = getAuth()
const firestoreDb = getFirestore(app)

onAuthStateChanged(auth, async authUser => {
	if (authUser) {
		const qProfessor = query(collection(firestoreDb, "students"), where("professors", "array-contains", professorId))
		const queryProfessor = await getDocs(qProfessor)

		queryProfessor.forEach(doc => {
			if (doc.id === authUser.uid) {
				document.querySelector("#hire-btn").remove()
			}
		})
	} else {
		redirectToLoginPage()
	}
})

const professorId = document.querySelector("body").getAttribute("id")

if (professorId === null) {
	window.location = "/searchTeacher"
}

const qProfessor = query(collection(firestoreDb, "professors"), where("__name__", "==", professorId))

const queryProfessor = await getDocs(qProfessor)
const isProfessor = !queryProfessor.empty

if (!isProfessor) {
	window.location = "/searchTeacher"
}

const unsubscribe = onSnapshot(qProfessor, querySnapshot => {
	querySnapshot.forEach(professor => {
		document.querySelector(".page-skeleton").classList.remove("active")
		loadTeacherData(professor.data())
	})
})

function loadTeacherData(professor) {
	document.querySelector("#price").textContent = "R$ " + professor.price + ",00" || "R$ Não inserido"
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
