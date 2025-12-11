
    let studentName = '';
    let studentUSN = '';
    let quizSubmitted = false;
    let questions = [];
    let answers = {};
    let currentQuestionIndex = 0;
    let timerInterval;
    let timeLeft = 300; // Default, will be updated from API
let violationCount = 0;
const API_BASE = `${window.location.origin}/api/quiz`;

// Toast notification function
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    error: '⚠️',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✓'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-content">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after duration
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
  
  return toast;
}

    function startQuiz() {
      // studentName = document.getElementById("studentName").value.trim();
      studentUSN = document.getElementById("studentusn").value.trim();
      const quizCode = document.getElementById("quizcode").value.trim();
      const quizPassword = document.getElementById("quizpassword").value;
      const agreed = document.getElementById("agreeRules").checked;

      if (!studentUSN || !quizCode || !quizPassword || !agreed) {
        showToast("Enter USN, quiz code, your contestant password, and agree to the rules.", "warning");
        return;
      }

      document.getElementById("startScreen").classList.add("hidden");
      document.getElementById("loadingScreen").classList.remove("hidden");

      const params = new URLSearchParams({ usn: studentUSN, quizCode, password: quizPassword });

      fetch(`${API_BASE}/random?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          document.getElementById("loadingScreen").classList.add("hidden");
          if (data.error) {
            showToast(data.error, "error");
            document.getElementById("startScreen").classList.remove("hidden");
          } else {
            console.log(data)
            questions = data.questions;
            document.getElementById("name").textContent = data.name;
            // Update quiz time from API response (default to 300 if not provided)
            timeLeft = data.quizTime || 300;
            // Update initial timer display
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById("timer").textContent = `Time Left: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            openFullscreen();
            currentQuestionIndex = 0;
            renderQuestion();
            startTimer();
            document.getElementById("quizScreen").classList.remove("hidden");
          }
        })
        .catch((err) => {
          showToast("Failed to load quiz. Please try again.", "error");
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
        input.addEventListener('change', function() {
          // Remove selected class from all labels
          questionContainer.querySelectorAll('label').forEach(l => l.classList.remove('selected'));
          // Add selected class to this label
          if (this.checked) {
            label.classList.add('selected');
          }
        });
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
          showToast("Something went wrong. Please try again.", "error", 5000);
          setTimeout(() => location.reload(), 2000);
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
          showToast("Time's up! Submitting quiz...", "warning");
          setTimeout(() => submitQuiz(), 1000);
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
    showToast(message + " This is your warning. Next violation will end the quiz.", "warning", 5000);
    openFullscreen();
    return;
  }

  if (violationCount > 2) {
    showToast(message + " Ending quiz...", "error", 3000);
    setTimeout(() => submitQuiz(), 1500);
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

