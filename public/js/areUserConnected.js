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
	header.id = "user-header"

	const navigationUl = document.querySelector("header nav ul")
	navigationUl.classList.add("profile-links")
	navigationUl.innerHTML = ""

	const signOutBtn = document.createElement("a")
	signOutBtn.id = "logout"
	signOutBtn.addEventListener("click", e => {
		e.preventDefault()
		logOut()
	})
	signOutBtn.textContent = "Sair"

	if (imageUrl !== null) {
		const userPictureLink = document.createElement("a")
		userPictureLink.setAttribute("href", `${isStudent ? "/studentProfile" : "/professorProfile"}`)
		userPictureLink.innerHTML = `<img src="${imageUrl}" alt="Foto de perfil">`
		navigationUl.append(signOutBtn, userPictureLink)
	} else {
		const image = createProfilePicture(firstName, lastName)
		image.addEventListener("click", () => (window.location = `${isStudent ? "/studentProfile" : "/professorProfile"}`))
		navigationUl.append(signOutBtn, image)
	}

	const links = document.createElement("ul")
	links.setAttribute("role", "navigation")
	links.classList.add("links")

	if (document.querySelector("header nav .links") !== null) return

	const toggle = document.createElement("div")
	toggle.classList.add("toggle")
	toggle.innerHTML = '<div class="toggle"><i class="fa-solid fa-bars"></i></div>'

	toggle.addEventListener("click", e => {
		document.querySelector("header#user-header nav ul.profile-links").classList.toggle("active")
		document.querySelector("header#user-header nav ul.links").classList.toggle("active")
	})

	const navigation = document.querySelector("header nav")
	if (isStudent) {
		links.innerHTML = `
		<li><a href="/building">Home</a></li>
		<li><a href="/building">Meus professores</a></li>
		<li><a href="/student/tasks">Tarefas</a></li>
		<li><a href="/searchTeacher">Encontrar um professor</a></li>
	`

		navigation.appendChild(links)
	} else {
		links.innerHTML = `
		<li><a href="professorDashboard">Home</a></li>
		<li><a href="/myStudentsList">Meus Alunos</a></li>
		<li><a href="/building">Financeiro</a></li>
		<li><a href="/building">Tarefas</a></li>
	`
		navigation.appendChild(links)
	}

	navigation.appendChild(toggle)
}

createPageSkeleton()
