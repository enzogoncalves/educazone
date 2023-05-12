import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

const professorId = localStorage.getItem("professorId")

if (professorId === null) {
	window.location = "/searchTeacher"
}

document.querySelector(".page-skeleton").classList.remove("active")

const db = getDatabase()
const teacherRef = ref(db, "professors/" + professorId)

onValue(teacherRef, snapshot => {
	loadTeacherData(snapshot.val())
})

function loadTeacherData(teacherData) {
	document.querySelector("#profile-picture").src = teacherData.pictureUrl
	document.querySelector("#price").textContent = teacherData.price
	document.querySelector(".name").textContent = teacherData.firstName + " " + teacherData.lastName
	document.querySelector(".aboutMe").innerHTML = teacherData.aboutMe
	document.querySelector(".didactic").innerHTML = teacherData.didactic
	document.querySelector(".phoneNumber").innerHTML = teacherData.phoneNumber
	document.querySelector(".email").innerHTML = teacherData.email
}
