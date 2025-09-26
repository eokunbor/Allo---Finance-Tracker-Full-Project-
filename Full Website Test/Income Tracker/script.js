//This code is the income & expense tracker. 
// It uses Firebase to manage user accounts and store transaction data.
// Users can log in, add income or expenses, see their balance, and delete transactions.
// It also updates the display and saves changes to the database.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { 
  getFirestore, 
  doc,
  updateDoc,
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


const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);


// Function to check if the user is already logged in
document.addEventListener('DOMContentLoaded', function() {
  console.log("Document loaded, initializing income tracker");
  const list = document.getElementById("transactionList");
  const form = document.getElementById("transactionForm");
  const balance = document.getElementById("balance");
  const income = document.getElementById("income");
  const expense = document.getElementById("expense");
  const dateInput = document.getElementById("date");
  
  if (!list || !form || !balance || !income || !expense || !dateInput) {
    console.error("Could not find all required DOM elements", {
      list: !!list,
      form: !!form,
      balance: !!balance,
      income: !!income,
      expense: !!expense,
      dateInput: !!dateInput
    });
    alert("Error initializing the application. Some elements are missing.");
    return;
  }
  
  dateInput.defaultValue = new Date().toISOString().split("T")[0];
  
  let transactions = [];
  
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    signDisplay: "always",
  });

// Function to check if the user is already logged in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User authenticated:", user.uid);
      console.log("User email:", user.email);
      
      ensureUserDocument(user)
        .then(() => {
          loadTransactionsFromFirestore(user.uid);
          form.addEventListener("submit", (e) => addTransaction(e, user.uid));
        })
        .catch((error) => {
          console.error("Error ensuring user document:", error);
          alert("Error loading your financial data. Please refresh the page.");
        });
    } else {
      console.log("No user logged in");
      
      window.location.href = "/Full Website Test/Login Form/login.html";
    }
  });
  

  async function ensureUserDocument(user) {
    try {
      console.log("Checking if user document exists:", user.uid);
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      
      if (!docSnap.exists()) {
        console.log("Creating new user document");
        await setDoc(userRef, {
          email: user.email,
          createdAt: new Date().toISOString(),
          transactions: [], 
          notes: [] 
        });
        console.log("Created new user document for:", user.uid);
        return true;
      } else {
        console.log("User document exists, checking for transactions array");
        const userData = docSnap.data();
        if (!userData.transactions) {
          console.log("Adding transactions array to existing user");
          await updateDoc(userRef, {
            transactions: []
          });
          console.log("Added transactions array to existing user:", user.uid);
          return true;
        }
        console.log("User document is already properly set up");
        return false;
      }
    } catch (error) {
      console.error("Error ensuring user document:", error);
      throw error;
    }
  }
  
// Function to load transactions from Firestore
  async function loadTransactionsFromFirestore(userId) {
    try {
      console.log("Loading transactions for user:", userId);
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.error("User document not found, cannot load transactions");
        return;
      }

      const userData = userDoc.data();
      transactions = userData.transactions || [];
      
      transactions = transactions.map(trx => {
        if (typeof trx.date === 'string') {
          return {
            ...trx,
            date: trx.date 
          };
        }
        return trx;
      });
      
      console.log("Loaded transactions:", transactions.length);

      renderList();
      updateTotal();
      
    } catch (error) {
      console.error("Error loading transactions:", error);
      alert("Error loading your transactions. Please refresh the page.");
    }
  }
  

  function formatCurrency(value) {
    if (value === 0) {
      return formatter.format(0).replace(/^[+-]/, "");
    }
    return formatter.format(value);
  }
  

  function createItem({ id, name, amount, date, type }) {
    const sign = "income" === type ? 1 : -1;
  
    const li = document.createElement("li");

    let formattedDate;
    try {
      formattedDate = new Date(date).toLocaleDateString();
    } catch (e) {
      console.error("Error formatting date:", date);
      formattedDate = date; 
    }
  

    li.innerHTML = `
      <div class="name">
        <h4>${name}</h4>
        <p>${formattedDate}</p>
      </div>
      <div class="amount ${type}">
        <span>${formatCurrency(amount * sign)}</span>
      </div>
    `;
  
    li.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("Delete transaction?")) {
        const currentUser = auth.currentUser;
        if (currentUser) {
          deleteTransaction(id, currentUser.uid);
        } else {
          alert("You must be logged in to delete transactions");
        }
      }
    });
  
    return li;
  }
  

  function updateTotal() {
    const incomeTotal = transactions
      .filter((trx) => trx.type === "income")
      .reduce((total, trx) => total + trx.amount, 0);

    const expenseTotal = transactions
      .filter((trx) => trx.type === "expense")
      .reduce((total, trx) => total + trx.amount, 0);
  
    const balanceTotal = incomeTotal - expenseTotal;
  
    balance.textContent = formatCurrency(balanceTotal).replace(/^\+/, "");
    income.textContent = formatCurrency(incomeTotal);
    expense.textContent = formatCurrency(expenseTotal * -1);
  }

  function renderList() {
    list.innerHTML = "";
    
    if (transactions.length === 0) {
      list.innerHTML = `<p style="text-align: center; color: #777; font-style: italic; padding: 20px;">No transactions yet. Add your first one above!</p>`;
      return;
    }
  
    transactions.forEach((transaction) => {
      const li = createItem(transaction);
      list.appendChild(li);
    });
  }
  
  async function deleteTransaction(id, userId) {
    const index = transactions.findIndex((trx) => trx.id === id);
    if (index === -1) {
      console.error("Transaction not found:", id);
      return;
    }
    
    transactions.splice(index, 1);

    const listItems = list.querySelectorAll("li");
    if (listItems[index]) {
      list.removeChild(listItems[index]);
    }
  
    updateTotal();
    
    try {
      await saveTransactionsToFirestore(userId);
      console.log("Transaction deleted successfully");
    } catch (error) {
      console.error("Error saving after deletion:", error);
      alert("Error deleting transaction. Please try again.");
    }
    
    if (transactions.length === 0) {
      renderList(); 
    }
  }
  

  async function addTransaction(e, userId) {
    e.preventDefault();
    
    if (!userId) {
      console.error("No user ID provided for adding transaction");
      alert("You must be logged in to add transactions");
      return;
    }
  
    const formData = new FormData(form);

    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
  
    const newTransaction = {
      id: uniqueId,
      name: formData.get("name"),
      amount: parseFloat(formData.get("amount")),
      date: formData.get("date"), 
      type: "on" === formData.get("type") ? "expense" : "income",
    };
  
    if (
      !newTransaction.name ||
      isNaN(newTransaction.amount) ||
      !newTransaction.date
    ) {
      alert("Please fill in all fields correctly.");
      return;
    }
    
    console.log("Adding new transaction:", newTransaction);

    transactions.push(newTransaction);
    
    form.reset();

    dateInput.value = new Date().toISOString().split("T")[0];
    
    transactions.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
  
    try {
      await saveTransactionsToFirestore(userId);
      console.log("Transaction saved successfully");
      

      renderList();
      
      updateTotal();
      
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Error saving transaction. Please try again.");
      
      const index = transactions.findIndex((trx) => trx.id === uniqueId);
      if (index !== -1) {
        transactions.splice(index, 1);
      }
    }
  }
  

  async function saveTransactionsToFirestore(userId) {
    try {
      console.log("Saving transactions to Firestore for user:", userId);
      
      const userRef = doc(db, "users", userId);
      
      await updateDoc(userRef, {
        transactions: transactions
      });
      
      console.log("Transactions saved successfully, count:", transactions.length);
      return true;
    } catch (error) {
      console.error("Error saving transactions:", error);
      throw error;
    }
  }
});