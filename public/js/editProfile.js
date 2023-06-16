import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import { getFirestore, doc, getDocs, collection, query, where, onSnapshot, updateDoc, deleteField } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js"

import { app } from "./initializeFirebase.js"

import { createProfilePicture, redirectToLoginPage } from "./modules.js"

const auth = getAuth()
const firestoreDb = getFirestore(app)
const storage = getStorage()

let userId

let professorOrStudent

onAuthStateChanged(auth, async authUser => {
	if (authUser) {
		userId = authUser.uid

		const qProfessor = query(collection(firestoreDb, "professors"), where("__name__", "==", userId))
		const queryProfessor = await getDocs(qProfessor)
		const isProfessor = !queryProfessor.empty

		const qStudent = query(collection(firestoreDb, "students"), where("__name__", "==", userId))

		const userLocation = location.pathname.replace("/", "")

		if (userLocation == "studentProfile" && isProfessor) {
			window.location = "/professorProfile"
		} else if (userLocation == "professorProfile" && isProfessor === false) {
			window.location = "/studentProfile"
		}

		professorOrStudent = isProfessor ? "professors" : "students"

		const fields = isProfessor ? ["fullname", "firstName", "lastName", "email", "phoneNumber", "site", "aboutMe", "didactic", "class", "price"] : ["fullname", "firstName", "lastName", "email", "phoneNumber"]

		const firestoreListenner = onSnapshot(isProfessor ? qProfessor : qStudent, querySnapshot => {
			querySnapshot.forEach(user => {
				document.querySelector(".page-skeleton").classList.remove("active")
				showUserData(user.data(), authUser, fields)
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

function showUserData(dbUserData, authUserData, fields) {
	fields.forEach(field => {
		if (field == "email") {
			document.querySelector("#email").value = authUserData.email;
			return
		}

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
			document.querySelector(`#${field}`).value = authUserData[field]
			createEditButton(field)
			return
		}

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
		const removeProfilePicture = document.createElement("button")
		removeProfilePicture.textContent = "Remover foto"
		removeProfilePicture.id = "removeProfilePicture"
		removeProfilePicture.addEventListener("click", () => {
			const pictureRef = doc(firestoreDb, professorOrStudent, userId)

			updateDoc(pictureRef, {
				pictureUrl: deleteField(),
			})
				.then(() => {
					document.querySelector("#user-profile #removeProfilePicture").remove()
				})
				.catch(error => {
					console.error(error)
				})

			// const storagePictureRef = ref(storage, `profile_images/${userId}/${dbUserData.pictureUrl}`)

			// Delete the file
			// deleteObject(storagePictureRef)
			// 	.then(() => {

			// 	})
			// 	.catch(error => {
			// 		console.log(error)
			// 	})
		})

		if (document.querySelector("#user-profile .profilePicture") === null) {
			document.querySelector("#user-profile").innerHTML += `
			<img src="${dbUserData.pictureUrl}" alt="Imagem de perfil" class="profilePicture"/>
			`
			document.querySelector("#user-profile").appendChild(removeProfilePicture)
		} else {
			document.querySelector("#user-profile .profilePicture").remove()
			document.querySelector("#user-profile").innerHTML += `
				<img src="${dbUserData.pictureUrl}" alt="Imagem de perfil" class="profilePicture"/>
			`
			document.querySelector("#user-profile").appendChild(removeProfilePicture)
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
	const previousFieldData = input.value
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

			if (submitterId == "price") {
				updateUser(professorOrStudent, submitterId, dataField, "price")
				return
			}

			updateUser(professorOrStudent, submitterId, dataField)
		} else if (input.nodeName === "SELECT" && dataField === "Selecione um valor") {
			alert("Selecione um valor válido")
			return
		} else if (dataField === previousFieldData) {
			alert("Não pode editar se não alterou nada")
			return
		} else {
			updateUser(professorOrStudent, submitterId, dataField)
		}
	})

	const cancelBtn = document.createElement("button")
	cancelBtn.textContent = "Cancelar"
	cancelBtn.addEventListener("click", closeEditModal)

	submitterParent.appendChild(editBtn)
	submitterParent.appendChild(cancelBtn)

	editModal.appendChild(submitterParent)
}

function closeEditModal() {
	editModal.classList.remove("active")
	pageShadow.classList.remove("active")
}

document.querySelector("form").addEventListener("submit", e => {
	e.preventDefault()

	const submitter = e.submitter

	openEditModal(submitter, professorOrStudent)
})

document.querySelector("#updateProfilePicture").addEventListener("change", e => {
	const file = e.target.files[0]

	const storageRef = ref(storage, `profile_images/${userId}/${file.name}`)
	const uploadTaskFile = uploadBytesResumable(storageRef, file)

	uploadTaskFile.on(
		"state_changed",
		snapshot => {},
		error => {
			console.error(error)
		},
		() => {
			getDownloadURL(storageRef)
				.then(url => {
					axios
						.get("https://api.sightengine.com/1.0/check.json", {
							params: {
								url: url,
								models: "nudity-2.0,gore",
								api_user: "1237940716",
								api_secret: "JfmRVdZf8EE6UNgZwxXc",
							},
						})
						.then(function (response) {
							if (response.data.nudity.none * 100 > 70) {
								const imageRef = doc(firestoreDb, professorOrStudent, userId)

								updateDoc(imageRef, {
									pictureUrl: url,
								})
									.then(() => {})
									.catch(error => {
										console.log(error)
									})
							} else {
								alert("Arquivo inválido")
							}
						})
						.catch(function (error) {
							if (error.response) console.log(error.response.data)
							else console.log(error.message)
						})
				})
				.catch(error => {
					console.error(error)
				})
		}
	)
})
