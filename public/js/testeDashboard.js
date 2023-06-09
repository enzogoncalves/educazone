import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, getDocs, collection, addDoc, updateDoc, deleteDoc, deleteField, query, where } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCxXjZ-SC2sjvfAwujLwnaUkK96rVWyoTM",
    authDomain: "schoolmanagement-f6f5a.firebaseapp.com",
    databaseURL: "https://schoolmanagement-f6f5a-default-rtdb.firebaseio.com",
    projectId: "schoolmanagement-f6f5a",
    storageBucket: "schoolmanagement-f6f5a.appspot.com",
    messagingSenderId: "163064410626",
    appId: "1:163064410626:web:a9c5da04c478d7086dad1b"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();

let teacherId = 'CjMFjMeMRMK3YJd7nWoR';
let teacherId2 = 'N4Vph3NQjzf0A26QYtkt';


async function getAllMyStudents2 (studentCollection) {
    try {
      const studentsRef = collection(db, 'students');
      const querySnapshot = await getDocs(query(studentsRef, where("teacher_id", "==",teacherId), where("isActive", "==", true)));
  
      const students = []; 
  
      querySnapshot.forEach((doc) => {
        const studentData = doc.data();
        students.push({
          //como pegar foto ###########################
          name: studentData.name,        
        });
      });
  
      displayStudentsTable(students); // Display students in the HTML table
    } catch (error) {
      console.error("Error getting documents:", error);
    }
  };


function displayStudentsTable(students) {
    const tbody = document.getElementById('tbody');
  
    students.forEach((student) => {
      const { picture, name} = student;
  
      const row = tbody.insertRow();
  
      const pictureCell = row.insertCell();
      pictureCell.textContent = '--FOTO--';
  
      const nameCell = row.insertCell();
      nameCell.textContent = name;
  
      const buttonCell = row.insertCell();
      const button = document.createElement('button');
      button.textContent = 'Acessar aluno';
      button.addEventListener('click', () => {
  
        console.log('Button clicked for student:', student);
      });
      buttonCell.appendChild(button);
    });
  }
  getAllMyStudents2("students")
  


function formatDate(dateString) {
    const parts = dateString.split('-');
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
  
    const formattedDate = `${month}-${day}-${year}`;
    return formattedDate;
  }

  async function getPaymentDate(teacherId) {
    const paymentCollection = collection(db, 'payment');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    let received = 0;
    let toReceive = 0;
    let totalAmountMonth = received + toReceive;
  
    const totalHTML = document.getElementById('total');
    const receivedAmountHTML = document.getElementById('recebido');
    const toReceiveHTML = document.getElementById('upcomingPayment');
  
    try {
      const snapshot = await getDocs(paymentCollection);
      snapshot.forEach((doc) => {
        const paymentDate = doc.data().date;
        const paymentAmount = doc.data().amount;
        const firebaseFormatted = new Date(formatDate(paymentDate));
        const firebaseYear = firebaseFormatted.getFullYear();
        const firebaseMonth = firebaseFormatted.getMonth();
        const firebaseDay = firebaseFormatted.getDate();
  
        const teacher = doc.data().teacher_id;
  
        if (currentYear === firebaseYear && currentMonth === firebaseMonth && teacher === 'CjMFjMeMRMK3YJd7nWoR') {
          if (currentDay < firebaseDay) {
            console.log(currentDay + " é menor que a do firebase " + firebaseDay);
            toReceive += paymentAmount;
          } else if (currentDay >= firebaseDay) {
            console.log(currentDay + " é maior ou igual a do firebase " + firebaseDay);
            received += paymentAmount;
          }
  
          totalAmountMonth = received + toReceive;
        }
  
        console.log('Payment Amount:', paymentAmount + ' ' + teacher);
      });
  
      const totalText = document.createTextNode(totalAmountMonth);
      const receivedText = document.createTextNode(received);
      const toReceiveText = document.createTextNode(toReceive);
  
      totalHTML.appendChild(totalText);
  
      receivedAmountHTML.appendChild(receivedText);
  
      toReceiveHTML.appendChild(toReceiveText);
    } catch (error) {
      console.error('Error getting payment documents:', error);
    }
  
    console.log('received:', received);
    console.log('To receive:', toReceive);
    console.log('Total:', totalAmountMonth);
  }
  
getPaymentDate(teacherId2);




