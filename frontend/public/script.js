let studentName = '';
let studentUSN = '';
let quizSubmitted = false;
let questions = [];
let answers = {};
let currentQuestionIndex = 0;
let timerInterval;
let timeLeft = 300; // 3 minutes
let violationCount = 0;
const API_BASE = `${window.location.origin}/api/quiz`;

function startQuiz() {
  // studentName = document.getElementById("studentName").value.trim();
  studentUSN = document.getElementById("studentusn").value.trim();
  const agreed = document.getElementById("agreeRules").checked;

  if (!studentUSN || !agreed) {
    return alert("Please enter your USN and agree to the rules before starting the quiz.");
  }

  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("loadingScreen").classList.remove("hidden");

  fetch(`${API_BASE}/random?usn=${studentUSN}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("loadingScreen").classList.add("hidden");
      if (data.error) {
        alert(data.error);
        document.getElementById("startScreen").classList.remove("hidden");
      } else {
        console.log(data)
        questions = data.questions;
       document.getElementById("name").textContent = data.name;
openFullscreen();
        currentQuestionIndex = 0;
        renderQuestion();
        startTimer();
        document.getElementById("quizScreen").classList.remove("hidden");
      }
    })
    .catch((err) => {
      alert("Failed to load quiz.");
      console.log(err)
      document.getElementById("startScreen").classList.remove("hidden");
      document.getElementById("loadingScreen").classList.add("hidden");
    });
}
function openFullscreen() {
let elem = document.documentElement; // whole page

if (elem.requestFullscreen) {
elem.requestFullscreen();
} else if (elem.webkitRequestFullscreen) { // Safari
elem.webkitRequestFullscreen();
} else if (elem.msRequestFullscreen) { // IE11
elem.msRequestFullscreen();
}
}
function renderQuestion() {
  const questionObj = questions[currentQuestionIndex];
  const questionContainer = document.getElementById('questionContainer');
  questionContainer.innerHTML = '';

  const questionText = document.createElement('h3');
  questionText.textContent = (currentQuestionIndex+1+".")+questionObj.
questionText;
  questionContainer.appendChild(questionText);

  questionObj.options.forEach((option, index) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = option;
    input.id = `option${index}`;
    label.appendChild(input);
    label.appendChild(document.createTextNode(` ${option}`));
    questionContainer.appendChild(label);
  });
}

function nextQuestion() {
const selected = document.querySelector('input[name="answer"]:checked');

const qid = questions[currentQuestionIndex]._id;
answers[qid] = selected ? selected.value : ""; // Store empty string if not answered

if (currentQuestionIndex === questions.length - 1) {
submitQuiz();
} else {
currentQuestionIndex++;
renderQuestion();
}
}


function submitQuiz() {
  if (quizSubmitted) return;
  quizSubmitted = true;
  clearInterval(timerInterval);

  document.getElementById("quizScreen").classList.add("hidden");
  document.getElementById("loadingScreen").classList.remove("hidden");

  fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: studentName,
      usn: studentUSN,
      responses: answers
    })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("loadingScreen").classList.add("hidden");
      document.getElementById("resultScreen").classList.remove("hidden");
      displayResults(data);
    })
    .catch(err => {
      console.error("Error:", err);
      alert("Something went wrong.");
      location.reload();
    });
}

function startTimer() {
  const timerDisplay = document.getElementById("timer");
  timerInterval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `Time Left: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timerInterval);
      alert("Time's up! Submitting quiz...");
      submitQuiz();
    }
  }, 1000);
}

// Anti-cheating: tab switch or blur
document.addEventListener("visibilitychange", () => {
if (document.hidden &&
  !quizSubmitted &&
  !document.getElementById("quizScreen").classList.contains("hidden")) {

handleViolation("Tab switch detected.");
}
});

window.addEventListener("blur", () => {
if (!quizSubmitted &&
  !document.getElementById("quizScreen").classList.contains("hidden")) {

handleViolation("Browser lost focus.");
}
});

document.addEventListener("keydown", (e) => {
if (!quizSubmitted &&
  !document.getElementById("quizScreen").classList.contains("hidden")) {

e.preventDefault();
handleViolation("Keyboard use detected.");
}
});
function handleViolation(message) {
violationCount++;

if (violationCount === 1) {
alert(message + " This is your warning. Next violation will end the quiz.");
openFullscreen();
return;
}

if (violationCount > 2) {
alert(message + " Ending quiz...");
submitQuiz();
}
}

function displayResults(data) {
const resultContent = document.getElementById("resultContent");

if (!data || data.status === "error") {
resultContent.innerHTML = `
  <div class="result-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
    <h3>Error</h3>
    <p>${data?.message || "Unable to retrieve results. Please contact administrator."}</p>
  </div>
`;
return;
}

const score = data.score || 0;
const totalQuestions = data.totalQuestions || questions.length;
const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
const correctAnswers = data.correctAnswers || [];

// Calculate statistics
const correctCount = correctAnswers.filter(q => q.userAnswer === q.correctAnswer).length;
const incorrectCount = correctAnswers.filter(q => q.userAnswer && q.userAnswer !== q.correctAnswer).length;
const unansweredCount = correctAnswers.filter(q => !q.userAnswer || q.userAnswer === "Not answered").length;

let resultHTML = `
<div class="result-card">
  <h3>Congratulations, ${data.name || "Student"}!</h3>
  <div class="score-display">${score}/${totalQuestions}</div>
  <p style="font-size: 18px; margin: 0;">Score: ${percentage}%</p>
</div>

<div class="summary-stats">
  <div class="stat-item">
    <div class="stat-value" style="color: #28a745;">${correctCount}</div>
    <div class="stat-label">Correct</div>
  </div>
  <div class="stat-item">
    <div class="stat-value" style="color: #dc3545;">${incorrectCount}</div>
    <div class="stat-label">Incorrect</div>
  </div>
  <div class="stat-item">
    <div class="stat-value" style="color: #ffc107;">${unansweredCount}</div>
    <div class="stat-label">Unanswered</div>
  </div>
</div>

<div class="result-details">
  <h4>Detailed Results</h4>
`;

correctAnswers.forEach((item, index) => {
const isCorrect = item.userAnswer === item.correctAnswer;
const isUnanswered = !item.userAnswer || item.userAnswer === "Not answered";
let statusClass = "unanswered";
if (isCorrect) statusClass = "correct";
else if (!isUnanswered) statusClass = "incorrect";

resultHTML += `
  <div class="question-result ${statusClass}">
    <h5>Question ${index + 1}: ${item.questionText}</h5>
    <div class="answer-info">
      <span class="correct-answer">✓ Correct Answer: ${item.correctAnswer}</span>
      <span class="user-answer ${isCorrect ? 'correct' : 'incorrect'}">
        ${isUnanswered ? '⚠ Not Answered' : (isCorrect ? '✓ Your Answer: ' : '✗ Your Answer: ')}${item.userAnswer}
      </span>
    </div>
  </div>
`;
});

resultHTML += `
</div>
<button onclick="location.reload()" style="width: 100%; margin-top: 20px;">Take Another Quiz</button>
`;

resultContent.innerHTML = resultHTML;
}
