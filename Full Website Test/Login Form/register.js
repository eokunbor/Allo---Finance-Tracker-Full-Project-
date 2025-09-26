//This code sets up a registration form for Allo through Firebase. 
// It lets users create an account by entering their email, password, first name, and last name. 
// If all fields are filled, it saves the user's info in the database and redirects them to the login page. 
// If there's an error, such as an incorrect input, it shows an alert.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlx5ypA2TEOb2NNPGgNmSz6scai46gLB8",
  authDomain: "allo---budget-tracker.firebaseapp.com",
  projectId: "allo---budget-tracker",
  storageBucket: "allo---budget-tracker.appspot.com",
  messagingSenderId: "321102004874",
  appId: "1:321102004874:web:4cbcba3c76e2f49dc0e373",
  measurementId: "G-9V6M6G836D"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function showAlert(message) {
  alert(message);
}

// Function to check if the user is already logged in
document.addEventListener('DOMContentLoaded', function() {
  const signUp = document.getElementById('submit');
  
  if (signUp) {
    signUp.addEventListener('click', function(event) {
      event.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const firstName = document.getElementById('fName').value;
      const lastName = document.getElementById('lName').value;
      
      if (!email || !password || !firstName || !lastName) {
        showAlert('Please fill in all required fields');
        return;
      }
      
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          
          const userData = {
            email: email,
            firstName: firstName,
            lastName: lastName,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          };
          
          return setDoc(doc(db, "users", user.uid), userData);
        })
        .then(() => {
          showAlert('Account created successfully!');
          setTimeout(() => {
            window.location.href = "login.html";
          }, 1500);
        })
        .catch((error) => {
          showAlert('Error: ' + error.message);
        });
    });
  }
});
