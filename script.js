/**
 * Grade 1 Math Practice App
 *
 * ARCHITECTURE & DESIGN PRINCIPLES:
 *
 * 1. MODULAR DESIGN
 *    - Code is organized into logical functional units
 *    - Each module has a single responsibility
 *    - Clear separation between game state, UI, and business logic
 *
 * 2. STATE MANAGEMENT
 *    - Single source of truth (gameState object)
 *    - State is only modified through specific functions
 *    - UI reflects state changes, not the other way around
 *
 * 3. EVENT-DRIVEN
 *    - Application responds to user events (clicks, input)
 *    - Event handlers maintain separation of concerns
 *    - UI updates happen in response to state changes
 *
 * 4. EXTENSIBILITY
 *    - Problem generators are separated by operation type
 *    - Difficulty settings are configurable per operation
 *    - New operation types can be added with minimal changes
 *
 * GUIDELINES FOR FUTURE DEVELOPMENT:
 *
 * 1. ADDING NEW OPERATION TYPES:
 *    - Add new operation button in HTML
 *    - Create new problem generator function
 *    - Add difficulty settings to difficultySettings object
 *    - Add case to the generateProblemByMode switch statement
 *
 * 2. EXTENDING DIFFICULTY LEVELS:
 *    - Add new difficulty option in HTML
 *    - Add new difficulty settings to each operation in difficultySettings
 *    - Update getRandomDifficulty if needed for mixed mode
 *
 * 3. ADDING NEW FEATURES:
 *    - For UI features: Add HTML elements, then corresponding handlers
 *    - For game mechanics: Extend gameState, then add logic to process function
 *    - For statistics/tracking: Add to endGame/showGameResults functions
 *
 * 4. CODE STYLE:
 *    - Use camelCase for variables and functions
 *    - Group related functions under clear section comments
 *    - Keep functions small and focused on a single task
 */

import { 
  initGameState, 
  resetGameState, 
  updateScore, 
  recordIncorrectProblem, 
  getUniqueIncorrectProblems, 
  calculateAccuracy, 
  updateGameMode, 
  updateDifficulty,
  hasReachedMaxAttempts 
} from './src/gameState.js';

import { 
  generateProblemByMode, 
  updateCurrentProblem
} from './src/problemGenerator.js';

import { 
  getRandomDifficulty,
  formatTime
} from './src/utils.js';

document.addEventListener('DOMContentLoaded', function () {
  // ===================================
  // STATE VARIABLES
  // ===================================
  // The central state object containing all game data
  // Any changes to the game state should happen through
  // defined functions, not direct manipulation
  let gameState = initGameState();
  // Override initial settings to match UI defaults
  gameState.gameMode = 'mixed';
  gameState.difficulty = 'medium';

  // ===================================
  // DOM ELEMENTS
  // ===================================
  // Cache DOM elements for performance and cleaner code
  // Grouped by functional area to improve readability
  // When adding new UI elements, add them to this object
  const elements = {
    // Problem and answer elements
    problem: document.getElementById('problem'),
    answerDisplay: document.getElementById('answer-display'),
    check: document.getElementById('check'),
    message: document.getElementById('message'),
    score: document.getElementById('score'),
    incorrect: document.getElementById('incorrect'),

    // Operation buttons
    operationButtons: document.querySelectorAll('.operation-btn'),

    // Timer and game controls
    timer: document.getElementById('timer'),
    startBtn: document.getElementById('start-btn'),
    resetBtn: document.getElementById('reset-btn'),

    // Displays and messages
    difficultyDisplay: document.getElementById('current-difficulty-display'),
    modeDisplay: document.getElementById('current-mode-display'),
    difficultyButtons: document.querySelectorAll('.difficulty-btn'),

    // Number buttons
    numberButtons: document.querySelectorAll('.num-btn'),
    clearButton: document.getElementById('clear-btn'),
  };

  // Create message elements for locked controls
  const messages = {
    modeLocked: createMessageElement('mode-locked-message', 'Operation type locked during game'),
    difficultyLocked: document.getElementById('difficulty-locked-message'),
  };

  function createMessageElement(id, text) {
    const el = document.createElement('div');
    el.id = id;
    el.className = 'hidden';
    el.textContent = text;
    document.querySelector('.buttons').appendChild(el);
    return el;
  }

  // ===================================
  // DIFFICULTY SETTINGS
  // ===================================
  // Configuration object for all difficulty levels by operation
  // To add a new operation type or difficulty level:
  // 1. Add a new entry to this object
  // 2. Define appropriate min/max values based on grade level
  // 3. Consider educational progression in your number ranges
  const difficultySettings = {
    addition: {
      easy: { min1: 1, max1: 10, min2: 1, max2: 10 },
      medium: { min1: 1, max1: 20, min2: 1, max2: 20 },
      hard: { min1: 10, max1: 50, min2: 10, max2: 50 },
    },
    subtraction: {
      easy: { min1: 1, max1: 10, min2: 1, max2: 10 },
      medium: { min1: 10, max1: 20, min2: 1, max2: 10 },
      hard: { min1: 20, max1: 100, min2: 1, max2: 20 },
    },
    mixed: {
      easy: { min1: 1, max1: 10, min2: 1, max2: 10 },
      medium: { min1: 1, max1: 20, min2: 1, max2: 20 },
      hard: { min1: 10, max1: 50, min2: 1, max2: 25 },
    },
    counting: {
      easy: { min: 5, max: 10 },
      medium: { min: 10, max: 20 },
      hard: { min: 15, max: 30 },
    },
  };

  // ===================================
  // INITIALIZATION
  // ===================================
  // App startup functions
  // The init function is the entry point of the application
  // Separating initialization from execution improves testability
  function init() {
    // Set initial display
    elements.problem.innerHTML = '<p class="waiting-message">Press Start to begin</p>';
    if (elements.modeDisplay) {
      elements.modeDisplay.textContent = 'Mixed';
    }
    if (elements.difficultyDisplay) {
      elements.difficultyDisplay.textContent = 'Medium';
    }

    // Update active buttons
    updateDefaultActiveButtons();

    // Add event listeners
    attachEventListeners();

    // Disable interactive elements initially
    setControlsEnabled(false);
  }

  function updateDefaultActiveButtons() {
    // Set Mixed as active operation
    elements.operationButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.classList.add('inactive');
      if (btn.id === 'mixed') {
        btn.classList.remove('inactive');
        btn.classList.add('active');
      }
    });

    // Set Medium as active difficulty
    elements.difficultyButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.id === 'medium') {
        btn.classList.add('active');
      }
    });
  }

  function attachEventListeners() {
    // Game controls
    elements.startBtn.addEventListener('click', startGame);
    elements.resetBtn.addEventListener('click', resetGame);
    elements.check.addEventListener('click', checkAnswer);

    // Operation buttons
    elements.operationButtons.forEach(button => {
      button.addEventListener('click', handleOperationButtonClick);
    });

    // Difficulty buttons
    elements.difficultyButtons.forEach(button => {
      button.addEventListener('click', handleDifficultyButtonClick);
    });

    // Number pad
    elements.numberButtons.forEach(button => {
      button.addEventListener('click', () => {
        const currentAnswer = elements.answerDisplay.textContent || '';
        elements.answerDisplay.textContent = currentAnswer + button.textContent;
        checkInputValue();
      });
    });

    // Clear button
    if (elements.clearButton) {
      elements.clearButton.addEventListener('click', () => {
        elements.answerDisplay.textContent = '';
        checkInputValue();
      });
    }
  }

  // ===================================
  // PROBLEM GENERATION
  // ===================================
  // Functions for creating math problems of different types
  // Follow this pattern when adding new operation types:
  // 1. Create a new generator function
  // 2. Add to the generateProblemByMode switch statement
  // 3. Ensure consistent problem object structure
  function newProblem() {
    // Reset input and messages
    elements.answerDisplay.textContent = '';
    elements.message.textContent = '';
    elements.message.className = 'message';

    // Disable check button until an answer is entered
    elements.check.disabled = true;

    // For mixed difficulty, randomly choose medium or hard
    let activeDifficulty = gameState.difficulty;
    if (gameState.difficulty === 'mixed-difficulty') {
      activeDifficulty = getRandomDifficulty();
    }

    // Generate problem based on game mode and update the game state
    const problem = generateProblemByMode(activeDifficulty, difficultySettings, gameState.gameMode);
    gameState = updateCurrentProblem(gameState, problem);

    // Display problem
    elements.problem.innerHTML = gameState.currentProblem.question;
  }

  // ===================================
  // ANSWER CHECKING
  // ===================================
  // Logic for validating and processing user answers
  // Handles both correct and incorrect responses
  // To add new response behaviors, modify these functions
  function checkAnswer() {
    const userAnswer = parseInt(elements.answerDisplay.textContent);

    if (isNaN(userAnswer)) {
      elements.message.textContent = 'Please enter a number!';
      elements.message.className = 'message incorrect';
      return;
    }

    if (userAnswer === gameState.currentProblem.answer) {
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer();
    }
  }

  function handleCorrectAnswer() {
    elements.message.textContent = 'Correct! 🎉';
    elements.message.className = 'message correct';
    gameState = updateScore(gameState);
    elements.score.textContent = gameState.score;
    // Show new problem immediately
    newProblem();
  }

  function handleIncorrectAnswer() {
    gameState = recordIncorrectProblem(gameState, {
      question: gameState.currentProblem.question,
      answer: gameState.currentProblem.answer,
    });
    
    elements.incorrect.textContent = gameState.incorrectAttempts;

    // Clear the input to make it more obvious it was incorrect
    elements.answerDisplay.textContent = '';
    elements.check.disabled = true;

    // Show different messages based on number of attempts
    if (hasReachedMaxAttempts(gameState)) {
      elements.message.textContent = `The answer is ${gameState.currentProblem.answer}`;
      elements.message.className = 'message hint';
      // Show new problem after briefly showing the answer
      setTimeout(newProblem, 1500);
    } else {
      elements.message.textContent = `間違いました！ ✖`;
      elements.message.className = 'message incorrect';
      // Flash the problem to make it more noticeable
      elements.problem.classList.add('shake-animation');
      setTimeout(() => {
        elements.problem.classList.remove('shake-animation');
      }, 500);
    }
  }

  // ===================================
  // GAME CONTROLS
  // ===================================
  // Core game flow functions - starting, ending, and displaying results
  // These functions manage game state transitions
  // When adding new game features, consider their lifecycle integration
  function startGame() {
    if (gameState.gameActive) return;

    // Reset game state with current mode and difficulty
    gameState = resetGameState(gameState);

    // Update UI
    elements.score.textContent = '0';
    elements.incorrect.textContent = '0';
    elements.timer.classList.remove('time-warning');
    updateTimer();

    // Update button state
    elements.startBtn.textContent = 'Running';
    elements.startBtn.classList.add('disabled');

    // Enable inputs
    setControlsEnabled(true);

    // Start timer and first problem
    gameState.timerInterval = setInterval(updateTimer, 1000);
    newProblem();
  }

  function resetGame() {
    // Clear any running timer
    if (gameState.timerInterval) {
      clearInterval(gameState.timerInterval);
    }

    // Reset game state completely with default values
    gameState = initGameState();
    // Override with UI defaults
    gameState = updateGameMode(gameState, 'mixed');
    gameState = updateDifficulty(gameState, 'medium');

    // Update UI
    elements.score.textContent = '0';
    elements.incorrect.textContent = '0';
    elements.timer.textContent = '3:00';
    elements.timer.classList.remove('time-warning');
    elements.problem.innerHTML = '<p class="waiting-message">Press Start to begin</p>';
    elements.message.textContent = '';
    elements.message.className = 'message';
    elements.answerDisplay.textContent = '';

    // Reset button state
    elements.startBtn.textContent = 'Start';
    elements.startBtn.classList.remove('disabled');

    // Disable inputs
    setControlsEnabled(false);

    // Ensure default mode and difficulty are selected
    updateDefaultActiveButtons();

    // Update display
    if (elements.modeDisplay) {
      elements.modeDisplay.textContent = 'Mixed';
    }
    if (elements.difficultyDisplay) {
      elements.difficultyDisplay.textContent = 'Medium';
    }

    // Show confirmation message
    const resetMessage = document.createElement('div');
    resetMessage.textContent = 'ゲームをリセットしました。スタートボタンを押して再開してください。';
    resetMessage.className = 'message';
    resetMessage.style.color = '#0984e3';
    elements.message.innerHTML = '';
    elements.message.appendChild(resetMessage);

    // Allow operation and difficulty selection
    elements.operationButtons.forEach(btn => {
      btn.disabled = false;
    });

    elements.difficultyButtons.forEach(btn => {
      btn.disabled = false;
    });
  }

  function endGame() {
    clearInterval(gameState.timerInterval);
    gameState.gameActive = false;

    // Disable inputs
    setControlsEnabled(false);

    // Update UI
    elements.startBtn.textContent = 'Start Again';
    elements.startBtn.classList.remove('disabled');

    // Display results
    showGameResults();
  }

  function showGameResults() {
    // Calculate stats
    const accuracyRate = calculateAccuracy(gameState);

    // Format difficulty display
    let difficultyDisplay = gameState.difficulty;
    if (gameState.difficulty === 'mixed-difficulty') {
      difficultyDisplay = 'Mixed (Medium-Hard)';
    }

    // Create results HTML
    let resultHTML = `
        <h2>Time's Up!</h2>
        <p>Your final score: ${gameState.score}</p>
        <p>Incorrect attempts: ${gameState.incorrectAttempts}</p>
        <p>Accuracy: ${accuracyRate}%</p>
        <p>Difficulty: ${difficultyDisplay}</p>
    `;

    // Add incorrect problems if there were any
    if (gameState.incorrectProblems.length > 0) {
      resultHTML += createIncorrectProblemsHTML();
    }

    // Display results
    elements.problem.textContent = '';
    elements.message.innerHTML = resultHTML;
    elements.message.className = 'message end-message';
  }

  function createIncorrectProblemsHTML() {
    let html = `<h3>Problems to Practice:</h3><div class="incorrect-problems">`;

    // Get unique problems using the module function
    const uniqueProblems = getUniqueIncorrectProblems(gameState);

    // Add each problem to the results
    for (const problem of uniqueProblems) {
      html += `
        <div class="problem-item">
            <div>${problem.question.replace('= ?', '=')}</div>
            <div class="answer">${problem.answer}</div>
        </div>`;
    }

    return html + '</div>';
  }

  // ===================================
  // TIMER FUNCTIONS
  // ===================================
  // Manages countdown timing and related UI updates
  // For implementing different time modes:
  // 1. Modify timeLeft initial value in gameState
  // 2. Adjust updateTimer for different timing behavior
  function updateTimer() {
    elements.timer.textContent = formatTime(gameState.timeLeft);

    if (gameState.timeLeft <= 60) {
      elements.timer.classList.add('time-warning');
    }

    if (gameState.timeLeft <= 0) {
      endGame();
    } else {
      gameState.timeLeft--;
    }
  }

  // ===================================
  // UI INTERACTION HANDLERS
  // ===================================
  // Event handlers for user interactions
  // Each handler maintains separation of concerns:
  // 1. Update the state
  // 2. Update the UI to reflect the state
  // 3. Trigger any necessary follow-up actions
  function handleOperationButtonClick() {
    if (gameState.gameActive) {
      showMessage(messages.modeLocked);
      return;
    }

    // Update game mode using the module function
    gameState = updateGameMode(gameState, this.id);

    // Update UI
    updateOperationButtons(this);
    if (elements.modeDisplay) {
      elements.modeDisplay.textContent = this.textContent;
    }

    // Update waiting message
    elements.problem.innerHTML = '<p class="waiting-message">Press Start to begin</p>';
  }

  function handleDifficultyButtonClick() {
    if (gameState.gameActive) {
      showMessage(messages.difficultyLocked);
      return;
    }

    // Update difficulty using the module function
    gameState = updateDifficulty(gameState, this.id);

    // Update UI
    updateDifficultyButtons(this);
    if (elements.difficultyDisplay) {
      let displayText = this.textContent;
      if (gameState.difficulty === 'mixed-difficulty') {
        displayText = 'Mixed (Medium-Hard)';
      }
      elements.difficultyDisplay.textContent = displayText;
    }
  }

  function checkInputValue() {
    // Enable/disable check button based on input
    elements.check.disabled = !elements.answerDisplay.textContent;

    // Update the problem display to show entered number
    if (gameState.currentProblem.question && gameState.gameActive) {
      const questionParts = gameState.currentProblem.originalQuestion.split('?');
      if (questionParts.length === 2) {
        const displayValue = elements.answerDisplay.textContent || '?';
        elements.problem.innerHTML = questionParts[0] + displayValue + questionParts[1];
      }
    }
  }

  // ===================================
  // UI HELPER FUNCTIONS
  // ===================================
  // UI-specific utility functions
  function setControlsEnabled(enabled) {
    // Set check button
    elements.check.disabled = true; // Always start disabled until input

    // Set number buttons
    elements.numberButtons.forEach(btn => {
      btn.disabled = !enabled;
    });

    if (elements.clearButton) {
      elements.clearButton.disabled = !enabled;
    }
  }

  function updateOperationButtons(activeButton) {
    elements.operationButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.classList.add('inactive');
    });
    activeButton.classList.remove('inactive');
    activeButton.classList.add('active');
  }

  function updateDifficultyButtons(activeButton) {
    elements.difficultyButtons.forEach(btn => {
      btn.classList.remove('active');
    });
    activeButton.classList.add('active');
  }

  function showMessage(messageElement) {
    messageElement.classList.remove('hidden');
    setTimeout(() => {
      messageElement.classList.add('hidden');
    }, 2000);
  }

  // Initialize the app
  init();
});