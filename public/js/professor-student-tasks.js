import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import { getFirestore, getDocs, collection, doc, query, where, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { app } from "./initializeFirebase.js"

import { createProfilePicture, redirectToLoginPage } from "./modules.js"

const auth = getAuth()
const firestoreDb = getFirestore(app)

const querySnapshot = await getDocs(collection(firestoreDb, "professors"))

const studentId = document.querySelector("body").getAttribute("id")
document.querySelector(".page-skeleton").classList.remove("active")

onAuthStateChanged(auth, async authUser => {
	if (authUser) {
		const userId = authUser.uid

		const qProfessor = query(collection(firestoreDb, "professors"), where("__name__", "==", userId))
		const queryProfessor = await getDocs(qProfessor)
		const isProfessor = !queryProfessor.empty

		if (isProfessor === false) {
			window.location = "/building"
			return
		}

		queryProfessor.forEach(doc => {
			// doc.data() is never undefined for query doc snapshots
			console.log(doc.id, " => ", doc.data())
			doc.data().students.filter(student => {
				console.log(student == studentId)
			})
		})

		// const firestoreListenner = onSnapshot(isProfessor ? qProfessor : qStudent, querySnapshot => {
		// 	querySnapshot.forEach(user => {
		// 		document.querySelector(".page-skeleton").classList.remove("active")
		// 		showUserData(user.data(), authUser, fields)
		// 	})
		// })
	} else {
		redirectToLoginPage()
	}
})
