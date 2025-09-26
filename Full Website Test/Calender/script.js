//This js code is for the calendar. 
// It lets users log in, view events, add new events, and delete events. 
// It uses Firebase to save and load events, and it updates the calendar display based on the current date or user input.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

const date = document.querySelector(".date"),
  daysContainer = document.querySelector(".days"),
  todayBtn = document.querySelector(".today-btn"),
  gotoBtn = document.querySelector(".goto-btn"),
  dateInput = document.querySelector(".date-input"),
  eventDay = document.querySelector(".event-day"),
  eventDate = document.querySelector(".event-date"),
  eventsContainer = document.querySelector(".events"),
  addEventBtn = document.querySelector(".add-event"),
  addEventWrapper = document.querySelector(".add-event-wrapper"),
  addEventCloseBtn = document.querySelector(".close"),
  addEventTitle = document.querySelector(".event-name"),
  addEventFrom = document.querySelector(".event-time-from"),
  addEventTo = document.querySelector(".event-time-to"),
  addEventSubmit = document.querySelector(".add-event-btn");
  const prevButton = document.querySelector(".prev");
  const nextButton = document.querySelector(".next");

if (prevButton) {
  prevButton.addEventListener("click", prevMonth);
}

if (nextButton) {
  nextButton.addEventListener("click", nextMonth);
}

let today = new Date();
let activeDay;
let month = today.getMonth();
let year = today.getFullYear();

let currentUser = null;
let eventsArr = [];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


function prevMonth() {
  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
  initCalendar();
}

function nextMonth() {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
  initCalendar();
}


// Function to check if the user is already logged in
document.addEventListener('DOMContentLoaded', function() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      ensureUserDocument(user)
        .then(() => {
          loadEventsFromFirestore();
        })
        .catch((error) => {
          console.error("Error ensuring user document:", error);
          showErrorMessage("Error preparing data. Please refresh the page.");
        });
    } else {
      currentUser = null;
      eventsArr = [];
      showNotLoggedInMessage();
      initCalendar();
    }
  });
});

// Function to ensure user document exists in Firestore
async function ensureUserDocument(user) {
  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      email: user.email,
      displayName: user.displayName || '',
      createdAt: new Date().toISOString(),
      transactions: [],
      events: []
    });
  } else if (!userDoc.data().events) {
    await updateDoc(userDocRef, {
      events: []
    });
  }
}

function showErrorMessage(message) {
  if (eventsContainer) {
    eventsContainer.innerHTML = `
      <div class="error-message" style="color: #e53935; text-align: center; padding: 20px;">
        <p>${message}</p>
      </div>
    `;
  }
}

function showNotLoggedInMessage() {
  if (eventsContainer) {
    eventsContainer.innerHTML = `
      <div class="not-logged-in" style="text-align: center; padding: 20px;">
        <p>Please log in to view your events.</p>
      </div>
    `;
  }
  
  if (addEventBtn) {
    addEventBtn.disabled = true;
    addEventBtn.style.opacity = "0.5";
    addEventBtn.title = "Please log in to add events";
  }
}

// Function to check if the user is logged in
async function loadEventsFromFirestore() {
  if (!currentUser) {
    return;
  }
  
  try {
    const userDocRef = doc(db, "users", currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      eventsArr = userData.events || [];
      initCalendar();
      
      if (
        today.getDate() === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear()
      ) {
        updateEvents(today.getDate());
      }
      
      if (addEventBtn) {
        addEventBtn.disabled = false;
        addEventBtn.style.opacity = "1";
        addEventBtn.title = "Add Event";
      }
    }
  } catch (error) {
    console.error("Error loading events:", error);
    showErrorMessage("Error loading events. Please try again later.");
  }
}

// Function to save events to Firestore
async function saveEventsToFirestore() {
  if (!currentUser) {
    return;
  }
  
  try {
    const userDocRef = doc(db, "users", currentUser.uid);
    await updateDoc(userDocRef, {
      events: eventsArr
    });
  } catch (error) {
    console.error("Error saving events:", error);
    alert("Error saving events. Please try again.");
  }
}

function initCalendar() {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);
  const prevDays = prevLastDay.getDate();
  const lastDate = lastDay.getDate();
  const day = firstDay.getDay();
  const nextDays = 7 - lastDay.getDay() - 1;

  date.innerHTML = months[month] + " " + year;

  let days = "";

  for (let x = day; x > 0; x--) {
    days += `<div class="day prev-date">${prevDays - x + 1}</div>`;
  }

  for (let i = 1; i <= lastDate; i++) {
    let event = false;
    eventsArr.forEach((eventObj) => {
      if (
        eventObj.day === i &&
        eventObj.month === month + 1 &&
        eventObj.year === year
      ) {
        event = true;
      }
    });
    
    if (
      i === new Date().getDate() &&
      year === new Date().getFullYear() &&
      month === new Date().getMonth()
    ) {
      activeDay = i;
      getActiveDay(i);
      updateEvents(i);
      
      if (event) {
        days += `<div class="day today active event">${i}</div>`;
      } else {
        days += `<div class="day today active">${i}</div>`;
      }
    } else {
      if (event) {
        days += `<div class="day event">${i}</div>`;
      } else {
        days += `<div class="day">${i}</div>`;
      }
    }
  }

  for (let j = 1; j <= nextDays; j++) {
    days += `<div class="day next-date">${j}</div>`;
  }
  
  daysContainer.innerHTML = days;
  addListner();
}

function addListner() {
  const days = document.querySelectorAll(".day");
  days.forEach((day) => {
    day.addEventListener("click", (e) => {
      getActiveDay(e.target.innerHTML);
      updateEvents(Number(e.target.innerHTML));
      activeDay = Number(e.target.innerHTML);
      
      days.forEach((day) => {
        day.classList.remove("active");
      });
      
      if (e.target.classList.contains("prev-date")) {
        prevMonth();
        setTimeout(() => {
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("prev-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");
            }
          });
        }, 100);
      } else if (e.target.classList.contains("next-date")) {
        nextMonth();
        setTimeout(() => {
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("next-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");
            }
          });
        }, 100);
      } else {
        e.target.classList.add("active");
      }
    });
  });
}

todayBtn.addEventListener("click", () => {
  today = new Date();
  month = today.getMonth();
  year = today.getFullYear();
  initCalendar();
});

gotoBtn.addEventListener("click", gotoDate);

function gotoDate() {
  const dateArr = dateInput.value.split("/");
  if (dateArr.length === 2) {
    if (dateArr[0] > 0 && dateArr[0] < 13 && dateArr[1].length === 4) {
      month = dateArr[0] - 1;
      year = dateArr[1];
      initCalendar();
      return;
    }
  }
  alert("Invalid Date");
}

function getActiveDay(date) {
  const day = new Date(year, month, date);
  const dayName = day.toString().split(" ")[0];
  eventDay.innerHTML = dayName;
  eventDate.innerHTML = date + " " + months[month] + " " + year;
}

function updateEvents(date) {
  let events = "";
  eventsArr.forEach((event) => {
    if (
      date === event.day &&
      month + 1 === event.month &&
      year === event.year
    ) {
      event.events.forEach((event) => {
        events += `<div class="event" data-id="${event.id}">
            <div class="title">
              <i class="fas fa-circle"></i>
              <h3 class="event-title">${event.title}</h3>
            </div>
            <div class="event-time">
              <span class="event-time">${event.time}</span>
            </div>
        </div>`;
      });
    }
  });
  if (events === "") {
    events = `<div class="no-event">
            <h3>No Events</h3>
        </div>`;
  }
  eventsContainer.innerHTML = events;
}

addEventBtn.addEventListener("click", () => {
  if (!currentUser) {
    alert("Please log in to add events");
    return;
  }
  addEventWrapper.classList.toggle("active");
});

addEventCloseBtn.addEventListener("click", () => {
  addEventWrapper.classList.remove("active");
});

addEventSubmit.addEventListener("click", () => {
  if (!currentUser) {
    alert("Please log in to add events");
    return;
  }
  
  const eventTitle = addEventTitle.value;
  const eventTimeFrom = addEventFrom.value;
  const eventTimeTo = addEventTo.value;
  
  if (eventTitle === "" || eventTimeFrom === "" || eventTimeTo === "") {
    alert("Please fill all the fields");
    return;
  }

  const timeFromArr = eventTimeFrom.split(":");
  const timeToArr = eventTimeTo.split(":");
  if (
    timeFromArr.length !== 2 ||
    timeToArr.length !== 2 ||
    timeFromArr[0] > 23 ||
    timeFromArr[1] > 59 ||
    timeToArr[0] > 23 ||
    timeToArr[1] > 59
  ) {
    alert("Invalid Time Format");
    return;
  }

  const timeFrom = convertTime(eventTimeFrom);
  const timeTo = convertTime(eventTimeTo);

  let eventExist = false;
  eventsArr.forEach((event) => {
    if (
      event.day === activeDay &&
      event.month === month + 1 &&
      event.year === year
    ) {
      event.events.forEach((event) => {
        if (event.title === eventTitle) {
          eventExist = true;
        }
      });
    }
  });
  
  if (eventExist) {
    alert("Event already added");
    return;
  }
  
  const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
  
  const newEvent = {
    id: uniqueId,
    title: eventTitle,
    time: timeFrom + " - " + timeTo,
    userId: currentUser.uid,
    createdAt: new Date().toISOString()
  };
  
  let eventAdded = false;
  if (eventsArr.length > 0) {
    eventsArr.forEach((item) => {
      if (
        item.day === activeDay &&
        item.month === month + 1 &&
        item.year === year
      ) {
        item.events.push(newEvent);
        eventAdded = true;
      }
    });
  }

  if (!eventAdded) {
    eventsArr.push({
      day: activeDay,
      month: month + 1,
      year: year,
      events: [newEvent],
    });
  }

  addEventWrapper.classList.remove("active");
  addEventTitle.value = "";
  addEventFrom.value = "";
  addEventTo.value = "";
  
  updateEvents(activeDay);
  
  const activeDayEl = document.querySelector(".day.active");
  if (!activeDayEl.classList.contains("event")) {
    activeDayEl.classList.add("event");
  }
  
  saveEventsToFirestore();
});

eventsContainer.addEventListener("click", (e) => {
  if (!currentUser) {
    alert("Please log in to delete events");
    return;
  }
  
  if (e.target.closest(".event")) {
    const eventElement = e.target.closest(".event");
    const eventId = eventElement.dataset.id;
    
    if (confirm("Are you sure you want to delete this event?")) {
      let deleted = false;
      
      for (let i = 0; i < eventsArr.length; i++) {
        if (
          eventsArr[i].day === activeDay &&
          eventsArr[i].month === month + 1 &&
          eventsArr[i].year === year
        ) {
          const eventIndex = eventsArr[i].events.findIndex(event => event.id === eventId);
          
          if (eventIndex !== -1) {
            eventsArr[i].events.splice(eventIndex, 1);
            deleted = true;
            
            if (eventsArr[i].events.length === 0) {
              eventsArr.splice(i, 1);
              const activeDayEl = document.querySelector(".day.active");
              if (activeDayEl.classList.contains("event")) {
                activeDayEl.classList.remove("event");
              }
            }
            
            break;
          }
        }
      }
      
      if (deleted) {
        updateEvents(activeDay);
        saveEventsToFirestore();
      }
    }
  }
});

// Function to go to the previous month
function convertTime(time) {
  let timeArr = time.split(":");
  let timeHour = timeArr[0];
  let timeMin = timeArr[1];
  let timeFormat = timeHour >= 12 ? "PM" : "AM";
  timeHour = timeHour % 12 || 12;
  time = timeHour + ":" + timeMin + " " + timeFormat;
  return time;
}
