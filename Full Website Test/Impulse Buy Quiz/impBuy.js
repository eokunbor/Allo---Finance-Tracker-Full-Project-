//This code is for a quiz that helps users decide if a purchase is impulsive.
//  It asks 10 questions, calculates a score based on answers, and gives advice at the end. 
// Users can retake the quiz if they want.

// The questions and their scores
const questions = [
    {
        question: "1. Do you already own something similar to this item?",
        answers: [
            { text: "A) Nope, this would be brand new for me.", score: 0 },
            { text: "B) Kinda, but this one's better.", score: 2 },
            { text: "C) I own 3 versions, and I want more!", score: 3 }
        ]
    },
    {
        question: "2. How often would you actually use this item?",
        answers: [
            { text: "A) Daily or weekly", score: 0 },
            { text: "B) A couple times a month.", score: 2 },
            { text: "C) Probably once then forget about it.", score: 3 }
        ]
    },
    {
        question: "3. Why are you considering this item right now?",
        answers: [
            { text: "A) I've been planning to get it for a while.", score: 0 },
            { text: "B) I just saw it and it looks cool.", score: 2 },
            { text: "C) I'm bored or stressed.", score: 3 }
        ]
    },
    {
        question: "4. If this item sold out today, how would you feel?",
        answers: [
            { text: "A) Genuinely disappointed - I've needed this.", score: 0 },
            { text: "B) I'd move on.", score: 2 },
            { text: "C) I'd probably forget about it in 5 minutes.", score: 3 }
        ]
    },
    {
        question: "5. Is this item solving a problem in your life?",
        answers: [
            { text: "A) Yes, it fixes something or makes life easier.", score: 0 },
            { text: "B) Not really, but it would make things more fun.", score: 2 },
            { text: "C) No, but it's cute and I want it.", score: 3 }
        ]
    },
    {
        question: "6. Is the price within your budget?",
        answers: [
            { text: "A) Yes, I've budgeted for it.", score: 0 },
            { text: "B) It's a stretch, but doable.", score: 2 },
            { text: "C) Not really, but YOLO!", score: 3 }
        ]
    },
    {
        question: "7. How long have you been thinking about buying this?",
        answers: [
            { text: "A) Weeks or months - I've done my research.", score: 0 },
            { text: "B) A few days - it's been on my mind.", score: 2 },
            { text: "C) Just saw it now and I'm obsessed.", score: 3 }
        ]
    },
    {
        question: "8. Can you name more than two ways this would benefit you?",
        answers: [
            { text: "A) Yes, absolutely!", score: 0 },
            { text: "B) One or two fun uses maybe.", score: 2 },
            { text: "C) I just like how it looks.", score: 3 }
        ]
    },
    {
        question: "9. Is this item something you'll still want in a month?",
        answers: [
            { text: "A) Definitely - it's timeless.", score: 0 },
            { text: "B) Maybe, but not sure.", score: 2 },
            { text: "C) Probably not.", score: 3 }
        ]
    },
    {
        question: "10. Be honest - will this item will boost your mood if purchased?",
        answers: [
            { text: "A) No, it's a practical choice.", score: 0 },
            { text: "B) A little, but I'll use it too.", score: 2 },
            { text: "C) 100% - I'll be so happy I have it.", score: 3 }
        ]
    }
];

const questionEl = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");

let currentQuestion = 0;
let score = 0;
let selectedScore = null;

document.addEventListener('DOMContentLoaded', function() {
    startQuiz();
});

/// Function to start the quiz and reset variables
function startQuiz() {
    currentQuestion = 0;
    score = 0;
    selectedScore = null;
    nextButton.innerText = "Next";
    showQuestion();
}

/// Function to display the current question and its answers
function showQuestion() {
    resetState();
    let q = questions[currentQuestion];
    questionEl.innerText = q.question;

    q.answers.forEach(answer => {
        const btn = document.createElement("button");
        btn.innerText = answer.text;
        btn.classList.add("btn", "answer-btn");
        btn.style.display = "block";
        btn.style.width = "100%";
        btn.addEventListener("click", () => selectAnswer(answer.score, btn));
        answerButtons.appendChild(btn);
    });
}

function resetState() {
    nextButton.style.display = "none";
    answerButtons.innerHTML = "";
    selectedScore = null;
}

function selectAnswer(scoreValue, selectedBtn) {
    Array.from(answerButtons.children).forEach(btn => {
        btn.classList.remove("selected");
    });

    selectedBtn.classList.add("selected");
    selectedScore = scoreValue;
    nextButton.style.display = "block";
}

/// Function to show the result based on the score
function showResult() {
    resetState();
    let message = "";

    if (score <= 10) {
        message = "This is a reasonable buy.";
    } else if (score > 10 && score <= 15) {
        message = "It could be impulsive. Think twice.";
    } else {
        message = "100% Impulse Buy. Close that tab!";
    }

    questionEl.innerHTML = `<div style="text-align: center;">
        <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Your Score: ${score}</h3>
        <p style="font-size: 1.2rem; font-weight: 500;">${message}</p>
    </div>`;
    
    nextButton.innerText = "Retake Quiz";
    nextButton.style.display = "block";
}

nextButton.addEventListener("click", () => {
    if (nextButton.innerText === "Retake Quiz") {
        startQuiz();
        return;
    }
    
    if (selectedScore !== null) {
        score += selectedScore;
    }

    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        showQuestion();
    } else {
        showResult();
    }
});
