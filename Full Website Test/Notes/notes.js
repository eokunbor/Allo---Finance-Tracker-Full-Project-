//This js code is for a notes app. 
// It first validates a user through their login/User ID, lets users write notes, save them to a database, and see their saved notes. 
// Users can also delete notes or hide the list of notes.
//  If there's an error, it shows a message.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { 
    getFirestore, 
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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
const db = getFirestore(app);

const noteInput = document.getElementById('purchase-note-input');
const saveBtn = document.getElementById('save-note-btn');
const saveMsg = document.getElementById('save-msg');
const notesList = document.getElementById('notes-list');
let notesVisible = true;
let currentUser = null;

//Function to show/hide the notes list
document.addEventListener('DOMContentLoaded', function() {
        const previousNotesHeading = document.querySelector('#saved-notes h2');
        if (previousNotesHeading) {
                previousNotesHeading.style.cursor = 'pointer';
                previousNotesHeading.innerHTML += ' <span class="toggle-indicator">▼</span>';
                previousNotesHeading.addEventListener('click', function() {
                        toggleNotesVisibility();
                });
        }
        onAuthStateChanged(auth, (user) => {
                if (user) {
                        currentUser = user;
                        ensureUserDocument(user)
                                .then(() => {
                                        loadNotesFromFirestore();
                                })
                                .catch((error) => {
                                        console.error("Error ensuring user document:", error);
                                        showErrorMessage("Error preparing notes. Please refresh the page.");
                                });
                } else {
                        currentUser = null;
                        notesList.innerHTML = '<p class="no-user-message">Please log in to view your notes.</p>';
                }
        });
        saveBtn.addEventListener('click', function(e) {
                e.preventDefault();
                saveNoteToFirestore();
        });
        noteInput.addEventListener('keydown', function(event) {
                if (event.ctrlKey && event.key === 'Enter') {
                        event.preventDefault();
                        saveNoteToFirestore();
                }
        });
});

async function ensureUserDocument(user) {
        try {
                const userRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userRef);
                if (!docSnap.exists()) {
                        await setDoc(userRef, {
                                email: user.email,
                                createdAt: new Date().toISOString(),
                                notes: []
                        });
                } else {
                        const userData = docSnap.data();
                        if (!userData.notes) {
                                await updateDoc(userRef, {
                                        notes: []
                                });
                        }
                }
        } catch (error) {
                console.error("Error ensuring user document:", error);
                throw error;
        }
}

//Function to toggle the visibility of the notes list
function toggleNotesVisibility() {
        const toggleIndicator = document.querySelector('.toggle-indicator');
        if (notesVisible) {
                notesList.style.display = 'none';
                if (toggleIndicator) toggleIndicator.textContent = '►';
        } else {
                notesList.style.display = 'block';
                if (toggleIndicator) toggleIndicator.textContent = '▼';
        }
        notesVisible = !notesVisible;
}


//Function to load notes from Firestore
async function loadNotesFromFirestore() {
        if (!currentUser) {
                return;
        }
        try {
                notesList.innerHTML = '';
                const userRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userRef);
                if (!userDoc.exists()) {
                        await ensureUserDocument(currentUser);
                        showEmptyState();
                        return;
                }
                const userData = userDoc.data();
                const userNotes = userData.notes || [];
                if (userNotes.length === 0) {
                        showEmptyState();
                        return;
                }
                userNotes.sort((a, b) => {
                        return new Date(b.timestamp) - new Date(a.timestamp);
                });
                userNotes.forEach((note, index) => {
                        const noteEl = document.createElement('div');
                        noteEl.classList.add('note-item');
                        noteEl.dataset.index = index;
                        const timeEl = document.createElement('div');
                        timeEl.classList.add('note-time');
                        const noteDate = new Date(note.timestamp);
                        timeEl.innerText = noteDate.toLocaleString();
                        const textEl = document.createElement('div');
                        textEl.classList.add('note-text');
                        textEl.innerText = note.text;
                        const deleteBtn = document.createElement('button');
                        deleteBtn.classList.add('delete-btn');
                        deleteBtn.innerText = 'Delete';
                        deleteBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                deleteNoteFromFirestore(note);
                        });
                        noteEl.appendChild(deleteBtn);
                        noteEl.appendChild(timeEl);
                        noteEl.appendChild(textEl);
                        notesList.appendChild(noteEl);
                });
        } catch (error) {
                console.error("Error loading notes:", error);
                showErrorMessage("Error loading notes. Please try again later.");
        }
}

function showEmptyState() {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No notes yet. Add your first note above!';
        emptyMessage.style.color = '#777';
        emptyMessage.style.fontStyle = 'italic';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.marginTop = '20px';
        notesList.appendChild(emptyMessage);
}

function showErrorMessage(message) {
        notesList.innerHTML = `
                <p style="color: #e53935; text-align: center; margin-top: 20px;">
                        ${message}
                </p>
        `;
}


//Function to save a note to Firestore
async function saveNoteToFirestore() {
        if (!currentUser) {
                saveMsg.textContent = 'Please log in to save notes';
                saveMsg.style.color = '#e53935';
                saveMsg.style.display = 'block';
                setTimeout(() => saveMsg.style.display = 'none', 2000);
                return;
        }
        const text = noteInput.value.trim();
        if (!text) {
                saveMsg.textContent = 'Please enter some text!';
                saveMsg.style.color = '#e53935';
                saveMsg.style.display = 'block';
                setTimeout(() => saveMsg.style.display = 'none', 1500);
                return;
        }
        try {
                const newNote = {
                        text: text,
                        timestamp: new Date().toISOString(),
                        id: Date.now().toString()
                };
                const userRef = doc(db, "users", currentUser.uid);
                await updateDoc(userRef, {
                        notes: arrayUnion(newNote)
                });
                noteInput.value = '';
                saveMsg.textContent = 'Note saved successfully!';
                saveMsg.style.color = '#92b603';
                saveMsg.style.display = 'block';
                setTimeout(() => saveMsg.style.display = 'none', 1500);
                if (!notesVisible) {
                        toggleNotesVisibility();
                }
                loadNotesFromFirestore();
        } catch (error) {
                console.error("Error saving note:", error);
                saveMsg.textContent = 'Error saving note. Please try again.';
                saveMsg.style.color = '#e53935';
                saveMsg.style.display = 'block';
                setTimeout(() => saveMsg.style.display = 'none', 2000);
        }
}

//Function to delete a note from Firestore
async function deleteNoteFromFirestore(note) {
        if (!currentUser) {
                return;
        }
        if (!confirm('Are you sure you want to delete this note?')) {
                return;
        }
        try {
                const userRef = doc(db, "users", currentUser.uid);
                await updateDoc(userRef, {
                        notes: arrayRemove(note)
                });
                loadNotesFromFirestore();
        } catch (error) {
                console.error("Error deleting note:", error);
                alert("Error deleting note. Please try again.");
        }
}
