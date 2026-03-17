'use strict';
 

let numA = 0;
let numB = 0;
let answered = false; 
 

const elNumA        = document.getElementById('num-a');
const elNumB        = document.getElementById('num-b');
const elInput       = document.getElementById('answer-input');
const elFeedback    = document.getElementById('feedback');
const elFbIcon      = document.getElementById('feedback-icon');
const elFbText      = document.getElementById('feedback-text');
const elCorrect     = document.getElementById('score-correct');
const elIncorrect   = document.getElementById('score-incorrect');
const elAccuracy    = document.getElementById('score-accuracy');
const btnSubmit     = document.getElementById('btn-submit');
const btnNew        = document.getElementById('btn-new');
const btnReset      = document.getElementById('btn-reset');
 

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
 
function newProblem() {
  numA = rand(100, 999);
  numB = rand(100, 999);
  answered = false;
 
  elNumA.textContent = numA;
  elNumB.textContent = numB;
 
  elInput.value = '';
  elInput.className = 'answer-input';
  elInput.disabled = false;
  elInput.focus();
 
  hideFeedback();
  btnSubmit.disabled = false;
}
 
function showFeedback(correct, message) {
  elFbIcon.textContent = correct ? '✓' : '✗';
  elFbText.textContent = message;
  elFeedback.className = `feedback visible ${correct ? 'correct-fb' : 'incorrect-fb'}`;
}
 
function hideFeedback() {
  elFeedback.className = 'feedback';
}
 
function updateScoreDisplay(correct, incorrect) {
  elCorrect.textContent   = correct;
  elIncorrect.textContent = incorrect;
 
  const total = correct + incorrect;
  if (total === 0) {
    elAccuracy.textContent = '—';
  } else {
    const pct = Math.round((correct / total) * 100);
    elAccuracy.textContent = pct + '%';
  }
 
 
  animatePop(correct > parseInt(elCorrect.dataset.prev || 0) ? elCorrect : elIncorrect);
  elCorrect.dataset.prev   = correct;
  elIncorrect.dataset.prev = incorrect;
}
 
function animatePop(el) {
  el.classList.remove('pop');
  void el.offsetWidth; 
  el.classList.add('pop');
  el.addEventListener('animationend', () => el.classList.remove('pop'), { once: true });
}
 
function animateShake(el) {
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}
 
function loadScore(callback) {
  chrome.storage.local.get({ correct: 0, incorrect: 0 }, (data) => {
    callback(data.correct, data.incorrect);
  });
}
 
function saveScore(correct, incorrect) {
  chrome.storage.local.set({ correct, incorrect });
}
 
function handleSubmit() {
  if (answered) return;
 
  const raw = elInput.value.trim();
  if (raw === '') {
    animateShake(elInput);
    elInput.focus();
    return;
  }
 
  const userAnswer = parseInt(raw, 10);
  const rightAnswer = numA + numB;
  answered = true;
  btnSubmit.disabled = true;
  elInput.disabled = true;
 
  loadScore((correct, incorrect) => {
    if (userAnswer === rightAnswer) {
      correct++;
      elInput.className = 'answer-input correct-input';
      showFeedback(true, 'Correct! Well done 🎉');
    } else {
      incorrect++;
      elInput.className = 'answer-input incorrect-input';
      animateShake(elInput);
      showFeedback(false, `Incorrect — the answer is ${rightAnswer}`);
    }
 
    saveScore(correct, incorrect);
    updateScoreDisplay(correct, incorrect);
  });
}
 
btnSubmit.addEventListener('click', handleSubmit);
 
elInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSubmit();
});
 
btnNew.addEventListener('click', newProblem);
 
btnReset.addEventListener('click', () => {
  if (confirm('Reset your score to zero?')) {
    saveScore(0, 0);
    updateScoreDisplay(0, 0);
    newProblem();
  }
});
 
loadScore((correct, incorrect) => {
  updateScoreDisplay(correct, incorrect);
  newProblem();
});
