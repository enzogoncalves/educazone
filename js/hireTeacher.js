import {
	getDatabase,
	ref,
	onValue,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

const professorId = localStorage.getItem("professorId")

if (professorId === null) {
	window.location = "/html/searchTeacher.html"
}

const db = getDatabase()
const teacherRef = ref(db, "professors/" + professorId)

onValue(teacherRef, (snapshot) => {
	loadTeacherData(snapshot.val())
})

function loadTeacherData(teacherData) {
	console.log(teacherData.pictureUrl)
	const hireSection = document.querySelector("#hire")

	hireSection.innerHTML = `
    <div class="picture-price">
      ${
				teacherData.picture
					? `<img src="${teacherData.pictureUrl}" alt="Foto do professor" />`
					: "sem imagem"
			}
      
      <span></span>
    </div>
    <p class="name">Nome</p>
    <button id="${professorId}">Contratar</button>
    <button data-sendMessage="${professorId}">Mandar mensagem</button>
    <button data-reportTeacher="${professorId}">Denunciar</button>
  `
}
