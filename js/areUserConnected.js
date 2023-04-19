import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import {
	getDatabase,
	ref,
	onValue,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

const auth = getAuth()

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Caso tenha um usuário, pego o id dele e busco os dados no realtime database do firebase

        const db = getDatabase()
        const dbRef = ref(db)

        onValue(dbRef, (snapshot) => {
        loadUserData(snapshot.val(), user)
    })
        // a função onValue roda toda vez que o banco de dados na referência do usuário atual se modifica (quando adiciona, edita ou exclui o usuário)

    } else {
        // Caso não tiver um usuário conectado, ele vai para a página de login/cadastro
        window.location.pathname = "/"
    }
})

function loadUserData(snapshot, user) {
    let userData;
    
    for (const i in snapshot) {
        for (const j in snapshot[i]) {
            if(j === user.uid) userData = snapshot[i][j];
        }
    }
    createHeader(user.photoUEL)
    console.log(user)
}

function createHeader(imageUrl) {
    const body = document.querySelector('body')
    const header = document.createElement('header')

    header.innerHTML = `
        <header>
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