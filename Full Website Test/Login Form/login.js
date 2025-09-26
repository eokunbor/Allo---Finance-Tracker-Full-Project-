//This code is for the login page. 
// It uses Firebase to check if the email and password entered by the user are correct. 
// If they are, it shows a success message and takes the user to the dashboard.
//  If not, it shows an error message.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlx5ypA2TEOb2NNPGgNmSz6scai46gLB8",
  authDomain: "allo---budget-tracker.firebaseapp.com",
  projectId: "allo---budget-tracker",
  storageBucket: "allo---budget-tracker.appspot.com",
  messagingSenderId: "321102004874",
  appId: "1:321102004874:web:4cbcba3c76e2f49dc0e373"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to check if the user is already logged in
document.addEventListener('DOMContentLoaded', function() {
  const loginBtn = document.getElementById('submit');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', function(event) {
      event.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      if (!email || !password) {
        alert('Please enter both email and password');
        return;
      }
      
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          alert('Login successful!');
          setTimeout(() => {
            window.location.href="index.html";
          }, 1000);
        })
        .catch((error) => {
          if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            alert('Invalid email or password');
          } else {
            alert('Login error: ' + error.message);
          }
        });
    });
  }
});
