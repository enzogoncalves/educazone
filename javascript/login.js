import {
    getAuth,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
   } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

   const auth = getAuth()

const form = document.querySelector('form')

form.addEventListener("submit", (e) => {
  e.preventDefault()
  
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

    alert('Autenticado')
    console.log(user)

    }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;

    alert(errorCode, errorMessage)
  });
  }
  })