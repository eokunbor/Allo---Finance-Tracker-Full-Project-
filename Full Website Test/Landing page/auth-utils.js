//This code sets up Firebase for the app and lets users log out. 
// When they click the "Sign Out" button, it logs them out and sends them back to the landing page.
//  If something goes wrong, it shows an error message.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

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

// Function to check if the user is already logged in, then takes them back to the landing page for login again
document.addEventListener('DOMContentLoaded', function() {
  const signOutButton = document.querySelector('.sign-out-button');
  if (signOutButton) {
    signOutButton.addEventListener('click', function(event) {
      event.preventDefault();
      signOut(auth).then(() => {
        window.location.href = "landing.html";
      }).catch((error) => {
        console.error('Sign out error:', error);
        alert('Error signing out: ' + error.message);
      });
    });
  }
});
