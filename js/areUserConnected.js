import {
	getAuth,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"
import {
	getDatabase,
	ref,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

const auth = getAuth()

onAuthStateChanged(auth, (user) => {
	if (user) {
		const db = getDatabase()
		const dbRef = ref(db)

		createHeader(user.photoURL)
	} else {
		// Caso não tiver um usuário conectado, ele vai para a página inicial
		redirectToLoginPage()
	}
})

export function getUserData(snapshot, userUid) {
	let userData

	for (const i in snapshot) {
		for (const j in snapshot[i]) {
			if (j === userUid) userData = snapshot[i][j]
		}
	}

	return userData
}

function createHeader(imageUrl) {
	const body = document.querySelector("body")
	const header = document.createElement("header")

	header.innerHTML = `
        <header id="user-header">
            <nav>
                <a href="/" id="title">Educa<span>Zone</span></a>
                <ul role="navigation">
                    <a href="#" id="logout">Sair</a>
                    <a href="/html/profile.html"><img src="${imageUrl}"></a>
                </ul>
            </nav>
        </header>
    `

	body.childNodes[1].remove()
	body.appendChild(header)
}

export function redirectToLoginPage() {
	window.location = "/html/login.html"
}
