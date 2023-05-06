import {
	getAuth,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import {
	getDatabase,
	ref,
	onValue,
	update,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

import { findUserData } from "./modules.js"
import { redirectToLoginPage } from "./areUserConnected.js"

const auth = getAuth()

let userId

const fields = [
	"firstName",
	"lastName",
	"email",
	"phoneNumber",
	"site",
	"aboutMe",
	"didactic",
	"class",
	"price",
]

onAuthStateChanged(auth, (user) => {
	let dbUserData
	userId = user.uid
	if (user) {
		const db = getDatabase()
		const dbRef = ref(db)

		onValue(dbRef, (snapshot) => {
			dbUserData = findUserData(snapshot.val(), userId)
			showUserData(dbUserData, user, fields)
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
export function showUserData(dbUserData, authUserData, fields) {
	fields.forEach((field) => {
		if (dbUserData[field] === undefined) {
			if (authUserData[field] === undefined) {
				createEditButton(field)
				return
			}
			// pega o dado do authentication
			document.querySelector(`#${field}`).value = authUserData[field]
			return
		}

		// pega o dado do banco de dados
		document.querySelector(`#${field}`).value = dbUserData[field]
		createEditButton(field)
	})
}

function createEditButton(field) {
	const el = document.querySelector(`#${field}`)
	const parentEl = el.parentElement

	const existFieldEditBtn =
		parentEl.children[parentEl.children.length - 1].dataset.field

	if (existFieldEditBtn !== undefined) return

	const editFieldBtn = document.createElement("button")
	editFieldBtn.setAttribute("type", "submit")
	editFieldBtn.dataset.field = field
	editFieldBtn.textContent = "Editar"

	parentEl.appendChild(editFieldBtn)
}

export function updateUser(professorOrStudent, field, dataField) {
	const db = getDatabase()

	let updatedUserData = {}
	updatedUserData[field] = dataField

	// Update the email field
	update(ref(db, `${professorOrStudent}/` + userId), updatedUserData)
		.then(() => {
			alert("editado com sucesso")
			pageShadow.classList.remove("active")
			editModal.classList.remove("active")
		})
		.catch((error) => {
			console.log(error)
			pageShadow.classList.remove("active")
			editModal.classList.remove("active")
		})
}

export function openEditModal(submitter, professorOrStudent) {
	editModal.innerHTML = ""
	editModal.classList.add("active")

	pageShadow.classList.add("active")

	const submitterId = submitter.dataset.field
	const submitterParent = submitter.parentElement.cloneNode(true)

	submitterParent.children[submitterParent.children.length - 1].remove()

	const input = submitterParent.children[1]

	input.removeAttribute("readonly")
	console.log(input)
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
		} else if (
			input.nodeName === "SELECT" &&
			dataField === "Selecione uma disciplina"
		) {
			alert("Selecione uma disciplina válida")
			return
		} else if (
			input.nodeName === "SELECT" &&
			dataField === "Selecione um valor"
		) {
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

export function editUserInfo(professorOrStudent, field, dataField) {
	updateUser(professorOrStudent, field, dataField)
}

export function closeEditModal() {
	editModal.classList.remove("active")
	pageShadow.classList.remove("active")
}

document.querySelector("form").addEventListener("submit", (e) => {
	e.preventDefault()

	const submitter = e.submitter

	openEditModal(submitter, "professors")
})
