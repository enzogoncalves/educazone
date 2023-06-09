import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

import { getFirestore, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"

import { app } from "./initializeFirebase.js"

const auth = getAuth()
const firestoreDb = getFirestore(app)

onAuthStateChanged(auth, async authUser => {
	if (authUser) {
		const qProfessor = query(collection(firestoreDb, "professors"), where("__name__", "==", authUser.uid))
		const queryProfessor = await getDocs(qProfessor)
		const isProfessor = !queryProfessor.empty

		if (isProfessor) window.location = "/professorDashboard"
		else window.location = "/studentProfile"
	} else {
		return
	}
})
