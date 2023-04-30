import {
	getDatabase,
	ref,
	get,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

import {
	getAuth,
	signOut,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

export async function getUserData(userUid) {
	const db = getDatabase()
	const dbRef = ref(db)

	const promise = await get(dbRef)
		.then((snapshot) => {
			return findUserData(snapshot.val(), userUid)
		})
		.catch((error) => {
			return error
		})

	return promise
}

export async function getIsStudent(userUid) {
	const db = getDatabase()
	const dbRef = ref(db)

	const promise = await get(dbRef)
		.then((snapshot) => {
			return isStudent(snapshot.val(), userUid)
		})
		.catch((error) => {
			return error
		})

	return promise
}

export function findUserData(snapshot, userUid) {
	let userData

	for (const i in snapshot) {
		for (const j in snapshot[i]) {
			if (j === userUid) userData = snapshot[i][j]
		}
	}

	return userData
}

export function isStudent(snapshot, userUid) {
	let studentKnot

	for (const i in snapshot) {
		for (const j in snapshot[i]) {
			if (j === userUid) studentKnot = i
		}
	}

	return studentKnot == "students"
}

export function logOut() {
	const auth = getAuth()

	signOut(auth)
		.then(() => {
			alert("deslogado")
			window.location = "/html/login.html"
		})
		.catch((error) => {
			console.error(error)
		})
}
