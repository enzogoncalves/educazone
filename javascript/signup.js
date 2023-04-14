import {
    getAuth,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
   } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

   import {
    getDatabase,
    ref,
    set,
    onValue,
    remove,
    child,
    push,
    update,
   } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js"

   const auth = getAuth()

const form = document.querySelector('form')

form.addEventListener("submit", (e) => {
  e.preventDefault()
  
  const professorChecked = document.getElementById('radio-professor').checked;
  
  const email_input = document.querySelector("#email")
  const password_input = document.querySelector("#password")
  
  const submitter = e.submitter.getAttribute('id')
  
  if (submitter === 'signin') {
    
    signInWithEmailAndPassword(auth, email_input.value, password_input.value)
    .then((userCredential) => {
      console.log(userCredential)
      alert('autorizado')
    })
    .catch((error) => {
      const errorMessage = error.message
      
      alert(errorMessage)
    })
  } else if (submitter === 'signin-with-google') {
    const provider = new GoogleAuthProvider();
    
    signInWithPopup(auth, provider)
    .then((result) => {
    const user = result.user;

    const db = getDatabase()

    
      // preciso chegar se já existe um usuário com o email e senha que ele está dando, pq se não eu posso alterar o professor pra aluno e vice e versa
      
    // if(professorChecked) {
    //   const userRef = ref(db, "professors/" + user.uid)
    //   onValue(userRef, (snapshot) => {
    //     // snapshot.val() retorna os valores do usuário no do banco de dados
    //     const data = snapshot.val()
    //     console.log(data)
    //   })
    //   set(ref(db, `professors/${user.uid}/`), {
    //     professor: true
    //   })
    // } else {
    //   const userRef = ref(db, "students/" + user.uid)
    //   onValue(userRef, (snapshot) => {
    //   // snapshot.val() retorna os valores do usuário no do banco de dados
    //   const data = snapshot.val()
    //   console.log(data)
    //  })
    //   set(ref(db, `students/${user.uid}/`), {
    //     student: true
    //   })
    // }

    }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;

    alert(errorCode, errorMessage)
  });
  }
  })