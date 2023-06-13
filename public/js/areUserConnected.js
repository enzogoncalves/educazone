import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import { logOut, createProfilePicture, createPageSkeleton, redirectToLoginPage } from "./modules.js"

import { getFirestore, getDocs, collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { app } from "./initializeFirebase.js"

const auth = getAuth()
const firestoreDb = getFirestore(app)

const body = document.querySelector("body")

onAuthStateChanged(auth, async authUser => {
	if (authUser) {
		const qProfessor = query(collection(firestoreDb, "professors"), where("__name__", "==", authUser.uid))
		const queryProfessor = await getDocs(qProfessor)
		const isProfessor = !queryProfessor.empty

		const qStudent = query(collection(firestoreDb, "students"), where("__name__", "==", authUser.uid))

		const unsubscribe = onSnapshot(isProfessor ? qProfessor : qStudent, querySnapshot => {
			querySnapshot.forEach(user => {
				createHeader(authUser.photoURL, user.data().firstName, user.data().lastName, isProfessor === false)
			})
		})
	} else {
		redirectToLoginPage()
	}
})

function createHeader(imageUrl, firstName, lastName, isStudent) {
	body.style.overflowY = "visible"
	body.style.pointerEvents = "all"

	const header = document.querySelector("header")

	document.querySelector("header nav").classList.add("connected-navigation")

	const navigationUl = document.querySelector("header nav ul")
	navigationUl.classList.add("profile-links")
	navigationUl.innerHTML = ""

	const links = document.createElement("ul")
	links.setAttribute("role", "navigation")
	links.classList.add("nav-links")

	if (document.querySelector("header nav .links") !== null) return

	const navigation = document.querySelector("header nav")
	if (isStudent) {
		links.innerHTML = `
		<a href="/building">Home</a>
		<a href="/building">Meus professores</a>
		<a href="/student/tasks">Tarefas</a>
		<a href="/searchTeacher">Encontrar professor</a>
		<a href="/studentProfile">Meu perfil</a>
	`
	} else {
		links.innerHTML = `
		<a href="professorDashboard">Home</a>
		<a href="/myStudentsList">Meus Alunos</a>
		<a href="/building">Financeiro</a>
		<a href="/building">Tarefas</a>
		<a href="/professorProfile">Meu perfil</a>
	`
	}

	navigation.appendChild(links)

	const signOutBtn = document.createElement("a")
	signOutBtn.id = "logout"
	signOutBtn.addEventListener("click", e => {
		e.preventDefault()
		logOut()
	})
	signOutBtn.textContent = "Sair"

	if (imageUrl !== null) {
		const userPictureLink = document.createElement("a")
		userPictureLink.addEventListener("click", e => {
			e.preventDefault()

			document.querySelector("header nav ul.nav-links").classList.toggle("active")
		})
		userPictureLink.innerHTML = `<img src="${imageUrl}" alt="Foto de perfil" class="profilePicture">`
		navigationUl.append(signOutBtn, userPictureLink)
	} else {
		const image = createProfilePicture(firstName, lastName)
		image.addEventListener("click", () => document.querySelector("header nav ul.nav-links").classList.toggle("active"))
		navigationUl.append(signOutBtn, image)
	}
}

createPageSkeleton()
