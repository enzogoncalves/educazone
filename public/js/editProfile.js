import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import { getFirestore, doc, getDocs, collection, query, where, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { app } from "./initializeFirebase.js"

import { createProfilePicture, redirectToLoginPage } from "./modules.js"

const auth = getAuth()
const firestoreDb = getFirestore(app)

let userId

onAuthStateChanged(auth, async user => {
	if (user) {
		userId = user.uid

		const qProfessor = query(collection(firestoreDb, "professors"), where("__name__", "==", userId))

		const queryProfessor = await getDocs(qProfessor)

		const isProfessor = !queryProfessor.empty

		if (!isProfessor) {
			window.location = "/editProfileStudent"
			return
		}

		const professorFields = ["fullname", "firstName", "lastName", "email", "phoneNumber", "site", "aboutMe", "didactic", "class", "price"]

		const unsubscribe = onSnapshot(qProfessor, querySnapshot => {
			querySnapshot.forEach(professor => {
				document.querySelector(".page-skeleton").classList.remove("active")

				showUserData(professor.data(), user, professorFields)
			})
		})
	} else {
		redirectToLoginPage()
	}
})

const body = document.querySelector("body")
const pageShadow = document.querySelector(".pageShadow")
const editModal = document.createElement("div")
editModal.classList.add("editModal")
body.appendChild(editModal)

// função para carregar o dado do usuário na página
function showUserData(dbUserData, authUserData, fields) {
	fields.forEach(field => {
		if (field == "fullname") {
			document.querySelector(`#${field}`).textContent = `${dbUserData.firstName} ${dbUserData.lastName}`
			return
		}

		if (field == "price") {
			document.querySelector(`#${field}`).value = `R$ ${dbUserData.price},00`
			createEditButton(field)
			return
		}

		if (dbUserData[field] === undefined) {
			if (authUserData[field] === undefined) {
				createEditButton(field)
				return
			}
			// pega o dado do authentication
			document.querySelector(`#${field}`).value = authUserData[field]
			createEditButton(field)
			return
		}

		// pega o dado do banco de dados
		document.querySelector(`#${field}`).value = dbUserData[field]
		createEditButton(field)
	})

	if (dbUserData.pictureUrl === undefined) {
		if (document.querySelector("#user-profile .profilePicture") === null) {
			document.querySelector("#user-profile").appendChild(createProfilePicture(dbUserData.firstName, dbUserData.lastName))
		} else {
			document.querySelector("#user-profile .profilePicture").remove()
			document.querySelector("#user-profile").appendChild(createProfilePicture(dbUserData.firstName, dbUserData.lastName))
		}
	} else {
		if (document.querySelector("#user-profile .profilePicture") === null) {
			document.querySelector("#user-profile").innerHTML += `
			<img src="${dbUserData.pictureUrl}" alt="Imagem de perfil" class="profilePicture"/>
		`
		} else {
			document.querySelector("#user-profile .profilePicture").remove()
			document.querySelector("#user-profile").innerHTML += `
			<img src="${dbUserData.pictureUrl}" alt="Imagem de perfil" class="profilePicture"/>
		`
		}
	}
}

function createEditButton(field) {
	const el = document.querySelector(`#${field}`)
	const parentEl = el.parentElement

	const existFieldEditBtn = parentEl.children[parentEl.children.length - 1].dataset.field

	if (existFieldEditBtn !== undefined) return

	const editFieldBtn = document.createElement("button")
	editFieldBtn.setAttribute("type", "submit")
	editFieldBtn.dataset.field = field
	editFieldBtn.textContent = "Editar"

	parentEl.appendChild(editFieldBtn)
}

async function updateUser(professorOrStudent, field, dataField, inputType) {
	const newDataField = inputType == "price" ? dataField.replace("R$ ", "").replace(" ", "").slice(0, -3) : dataField

	let updatedUserData = {}
	updatedUserData[field] = newDataField

	const fieldRef = doc(firestoreDb, professorOrStudent, userId)

	updateDoc(fieldRef, updatedUserData)
		.then(() => {
			alert("editado com sucesso")
			pageShadow.classList.remove("active")
			editModal.classList.remove("active")
		})
		.catch(error => {
			console.log(error)
			pageShadow.classList.remove("active")
			editModal.classList.remove("active")
		})
}

function openEditModal(submitter, professorOrStudent) {
	editModal.innerHTML = ""
	editModal.classList.add("active")

	pageShadow.classList.add("active")

	const submitterId = submitter.dataset.field
	const submitterParent = submitter.parentElement.cloneNode(true)

	submitterParent.children[submitterParent.children.length - 1].remove()

	const input = submitterParent.children[1]

	input.removeAttribute("readonly")
	input.removeAttribute("id")
	input.removeAttribute("disabled")
	input.setAttribute("placeholder", input.value)
	const previousDataField = input.value
	input.value = ""

	const editBtn = document.createElement("button")
	editBtn.textContent = "Confirmar edição"

	editBtn.addEventListener("click", () => {
		const dataField = input.value

		if (dataField == "") {
			alert("Campo vazio")
			return
		} else if (input.nodeName === "SELECT") {
			if (dataField === "Selecione uma disciplina") {
				alert("Selecione uma disciplina válida")
				return
			}
			editUserInfo(professorOrStudent, submitterId, dataField, "price")
			return
		} else if (input.nodeName === "SELECT" && dataField === "Selecione um valor") {
			alert("Selecione um valor válido")
			return
		} else if (dataField === previousDataField) {
			alert("Não pode editar se não alterou nada")
			return
		} else {
			editUserInfo(professorOrStudent, submitterId, dataField)
		}
	})

	const cancelBtn = document.createElement("button")
	cancelBtn.textContent = "Cancelar"
	cancelBtn.addEventListener("click", closeEditModal)

	submitterParent.appendChild(editBtn)
	submitterParent.appendChild(cancelBtn)

	editModal.appendChild(submitterParent)
}

function editUserInfo(professorOrStudent, field, dataField, inputType) {
	updateUser(professorOrStudent, field, dataField, inputType)
}

function closeEditModal() {
	editModal.classList.remove("active")
	pageShadow.classList.remove("active")
}

document.querySelector("form").addEventListener("submit", e => {
	e.preventDefault()

	const submitter = e.submitter

	openEditModal(submitter, "professors")
})
