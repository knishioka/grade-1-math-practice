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
  hasReachedMaxAttempts,
} from '/src/gameState.js';

import {
  generateProblemByMode,
  updateCurrentProblem,
  generateThreeNumberProblem, // <-- Add direct import for three number problems
  generateAdditionProblem,
  generateSubtractionProblem,
} from '/src/problemGenerator.js';

import { getRandomDifficulty, formatTime } from '/src/utils.js';

// 開発モード判定のためのフラグ
const IS_DEBUG = true; // 本番環境ではfalseに設定する

/**
 * デバッグモードのときだけログを出力する
 * @param {...any} args - コンソールに出力する引数
 */
function debug(...args) {
  if (IS_DEBUG) {
    console.log(...args);
  }
}

// Note: We've removed the global gameStart function and custom event listeners
// since they were causing duplicate timer execution

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
    threeNumber: {
      easy: { min1: 1, max1: 10, min2: 1, max2: 5, min3: 1, max3: 5 },
      medium: { min1: 5, max1: 15, min2: 1, max2: 10, min3: 1, max3: 10 },
      hard: { min1: 10, max1: 25, min2: 5, max2: 15, min3: 5, max3: 15 },
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
    debug('Initializing app...');
    debug('Elements:', elements);

    // Check all operation buttons
    debug('Checking all operation buttons at initialization:');
    elements.operationButtons.forEach(btn => {
      debug(
        `Operation button: id=${btn.id}, text="${
          btn.textContent
        }", classList=${btn.classList.toString()}`
      );
    });

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

    // Log active operation button after defaults are set
    debug(
      'Active operation button after defaults:',
      document.querySelector('.operation-btn.active')?.id
    );
    debug('Initial game mode:', gameState.gameMode);

    // Add event listeners
    attachEventListeners();

    // Note: We no longer add a redundant listener to the start button
    // as it was causing the timer to run twice as fast

    // Disable interactive elements initially
    setControlsEnabled(false);

    console.log('Initialization complete!');
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

  // 開発モード判定のためのフラグ
  const IS_DEBUG = true; // 本番環境ではfalseに設定する

  /**
   * デバッグモードのときだけログを出力する
   * @param {...any} args - コンソールに出力する引数
   */
  function debug(...args) {
    if (IS_DEBUG) {
      console.log(...args);
    }
  }

  /**
   * 現在のゲームモードと難易度に基づいて新しい問題を生成し表示する
   */
  function newProblem() {
    // Ensure gameActive is true when generating a new problem
    if (!gameState.gameActive) {
      debug('newProblem called but game not active - fixing');
      gameState.gameActive = true;
    }

    // Log current game mode again before generating problem
    debug(
      'Current gameMode in newProblem:',
      gameState.gameMode,
      'active button:',
      document.querySelector('.operation-btn.active')?.id
    );

    // CRITICAL FIX: Make sure gameMode matches the active button
    // This ensures UI and state are in sync
    const activeButtonId = document.querySelector('.operation-btn.active')?.id;
    if (activeButtonId && gameState.gameMode !== activeButtonId) {
      debug('CRITICAL ERROR: Game mode mismatch detected!');
      debug(`Active button is ${activeButtonId} but gameState.gameMode is ${gameState.gameMode}`);
      debug('Fixing by updating gameState.gameMode to match active button');
      gameState.gameMode = activeButtonId;
    }

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

    debug('Generating problem with mode:', gameState.gameMode, 'and difficulty:', activeDifficulty);

    // Ensure we're actually calling the intended generator
    let problem;
    if (gameState.gameMode === 'threeNumber') {
      try {
        // Force three number problem generation - manually create a problem with 3 numbers
        debug('Manually creating a three-number problem');

        // Lookup difficulty settings
        const settings = difficultySettings.threeNumber[activeDifficulty];
        debug('Using settings:', settings);

        if (!settings) {
          throw new Error('No settings found for threeNumber difficulty: ' + activeDifficulty);
        }

        // Generate three random numbers based on the settings
        const num1 =
          Math.floor(Math.random() * (settings.max1 - settings.min1 + 1)) + settings.min1;
        const num2 =
          Math.floor(Math.random() * (settings.max2 - settings.min2 + 1)) + settings.min2;
        const num3 =
          Math.floor(Math.random() * (settings.max3 - settings.min3 + 1)) + settings.min3;

        debug(`Generated three numbers: ${num1}, ${num2}, ${num3}`);

        // Randomly choose a problem type (1-3) just like in problemGenerator.js
        const problemType = Math.floor(Math.random() * 3) + 1;
        debug('Selected problem type:', problemType);

        let question, answer;

        switch (problemType) {
        case 1: // a + b + c
          question = `${num1} + ${num2} + ${num3} = ?`;
          answer = num1 + num2 + num3;
          break;

        case 2: // a + b - c
          // Make sure sum of first two numbers is greater than third to avoid negative results
          if (num1 + num2 <= num3) {
            // Adjust num3 to be smaller than num1 + num2
            const adjustedNum3 = Math.min(num3, num1 + num2 - 1);
            question = `${num1} + ${num2} - ${adjustedNum3} = ?`;
            answer = num1 + num2 - adjustedNum3;
          } else {
            question = `${num1} + ${num2} - ${num3} = ?`;
            answer = num1 + num2 - num3;
          }
          break;

        case 3: // a - b + c
          // Ensure a > b to avoid negative intermediate results
          if (num1 <= num2) {
            // If num1 is too small, swap num1 and num2 or use a safe value for num2
            const safeNum2 = Math.min(num2, num1 - 1 > 0 ? num1 - 1 : 1);
            question = `${num1} - ${safeNum2} + ${num3} = ?`;
            answer = num1 - safeNum2 + num3;
          } else {
            question = `${num1} - ${num2} + ${num3} = ?`;
            answer = num1 - num2 + num3;
          }
          break;
        }

        // Create the problem object
        problem = {
          originalQuestion: question,
          question: question,
          answer: answer,
          type: 'threeNumber',
          sourceMode: 'threeNumber',
        };

        debug('Manually created problem:', problem);
      } catch (error) {
        debug('Error creating three-number problem:', error);
        // IMPORTANT: Since we need 3 numbers, we must NOT fall back to regular generation
        // Instead, create a simple a + b + c problem as a reliable fallback
        debug('Creating simple a + b + c fallback problem');

        const settings = difficultySettings.threeNumber[activeDifficulty] || {
          min1: 1,
          max1: 10,
          min2: 1,
          max2: 5,
          min3: 1,
          max3: 5,
        };

        const num1 =
          Math.floor(Math.random() * (settings.max1 - settings.min1 + 1)) + settings.min1;
        const num2 =
          Math.floor(Math.random() * (settings.max2 - settings.min2 + 1)) + settings.min2;
        const num3 =
          Math.floor(Math.random() * (settings.max3 - settings.min3 + 1)) + settings.min3;

        const question = `${num1} + ${num2} + ${num3} = ?`;
        const answer = num1 + num2 + num3;

        problem = {
          originalQuestion: question,
          question: question,
          answer: answer,
          type: 'threeNumber',
          sourceMode: 'threeNumber (fallback)',
        };
      }
    } else {
      // Normal flow for other modes
      problem = generateProblemByMode(activeDifficulty, difficultySettings, gameState.gameMode);
      debug('Generated problem via mode:', problem);
    }

    // Update the game state with the new problem
    gameState = updateCurrentProblem(gameState, problem);

    // Preserve gameActive status after updateCurrentProblem
    gameState.gameActive = true;

    // Display problem and add debug information to DOM
    elements.problem.innerHTML = gameState.currentProblem.question;

    // Add debug info (only during development)
    if (IS_DEBUG && gameState.currentProblem.sourceMode) {
      const debugInfo = document.createElement('div');
      debugInfo.style.fontSize = '10px';
      debugInfo.style.color = '#999';
      debugInfo.style.marginTop = '10px';
      debugInfo.textContent = `Debug: Generated from ${gameState.currentProblem.sourceMode} mode`;
      elements.problem.appendChild(debugInfo);
    }
  }

  // リファクタリング過程の関数重複を削除

  // ===================================
  // ANSWER CHECKING
  // ===================================
  // Logic for validating and processing user answers
  // Handles both correct and incorrect responses
  // To add new response behaviors, modify these functions
  function checkAnswer() {
    console.log('checkAnswer called');
    const userAnswer = parseInt(elements.answerDisplay.textContent);
    console.log('User answer:', userAnswer, 'Correct answer:', gameState.currentProblem.answer);

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
      elements.message.textContent = '間違いました！ ✖';
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
    console.log('startGame called');
    console.log('Current gameMode before start:', gameState.gameMode);
    console.log('Active operation button:', document.querySelector('.operation-btn.active')?.id);

    // Save current mode and difficulty
    // Make sure to check active button as well in case gameState is out of sync
    const activeButtonId = document.querySelector('.operation-btn.active')?.id;
    let currentMode = gameState.gameMode;

    // If there's a mismatch, trust the UI (active button) over the state
    if (activeButtonId && currentMode !== activeButtonId) {
      console.log('MISMATCH DETECTED at game start!');
      console.log(`Active button is ${activeButtonId} but gameState.gameMode is ${currentMode}`);
      console.log('Using active button ID as the correct mode');
      currentMode = activeButtonId;
    }

    const currentDifficulty = gameState.difficulty;
    console.log('Saved mode before reset:', currentMode);

    // Initialize a fresh game state and manually set gameActive
    // Don't use resetGameState for now to eliminate any potential issues
    gameState = {
      gameMode: currentMode, // Explicitly preserve the current mode
      difficulty: currentDifficulty, // Explicitly preserve the current difficulty
      score: 0,
      incorrectAttempts: 0,
      currentProblemAttempts: 0,
      timeLeft: 180,
      gameActive: true,
      incorrectProblems: [],
      currentProblem: {},
    };

    console.log('Game state after reset:', gameState);
    console.log('Game mode after reset:', gameState.gameMode);

    // Update UI
    elements.score.textContent = '0';
    elements.incorrect.textContent = '0';
    elements.timer.classList.remove('time-warning');
    elements.timer.textContent = '3:00';

    // Update button state
    elements.startBtn.textContent = 'Running';
    elements.startBtn.classList.add('disabled');

    // Enable inputs
    setControlsEnabled(true);

    // Reset input state
    elements.answerDisplay.textContent = '';
    elements.message.textContent = '';
    elements.message.className = 'message';
    elements.check.disabled = true;

    // Generate a problem based on the selected mode and difficulty
    console.log('Generating problem for mode:', gameState.gameMode);
    newProblem();

    // Start timer
    console.log('Starting timer');
    // Set initial time display (don't update time yet)
    elements.timer.textContent = formatTime(gameState.timeLeft);
    // Start interval for timer updates
    gameState.timerInterval = setInterval(updateTimer, 1000);

    console.log('Game started!');
  }

  function resetGame() {
    // Clear any running timer
    if (gameState.timerInterval) {
      clearInterval(gameState.timerInterval);
      // Remove the reference to prevent accidental timer restart
      gameState.timerInterval = null;
    }

    // Reset game state completely with default values
    gameState = initGameState();
    // Override with UI defaults
    gameState = updateGameMode(gameState, 'mixed');
    gameState = updateDifficulty(gameState, 'medium');

    // Ensure gameActive is false to prevent timer from starting
    gameState.gameActive = false;

    // Update UI
    elements.score.textContent = '0';
    elements.incorrect.textContent = '0';
    elements.timer.textContent = formatTime(gameState.timeLeft);
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

    // Additional check to ensure no timer is running
    if (gameState.timerInterval) {
      console.warn('Timer still exists after reset - clearing again');
      clearInterval(gameState.timerInterval);
      gameState.timerInterval = null;
    }
  }

  function endGame() {
    // First set game to inactive
    gameState.gameActive = false;

    // Clear any running timer
    if (gameState.timerInterval) {
      clearInterval(gameState.timerInterval);
      gameState.timerInterval = null;
    }

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
    let html = '<h3>Problems to Practice:</h3><div class="incorrect-problems">';

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
    console.log(
      'updateTimer called, gameActive:',
      gameState.gameActive,
      'timeLeft:',
      gameState.timeLeft
    );

    // Only update if the game is active
    if (!gameState.gameActive) {
      console.log('Game not active, skipping timer update');
      // Clear the interval if game is not active to ensure timer stops
      if (gameState.timerInterval) {
        console.log('Clearing timer interval because game is not active');
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
      }
      return;
    }

    // First decrement the timeLeft counter
    gameState.timeLeft--;

    // Check if the game should end
    if (gameState.timeLeft < 0) {
      // Set to 0 to ensure we display 0:00 before ending
      gameState.timeLeft = 0;
      // Update display to show 0:00
      elements.timer.textContent = formatTime(gameState.timeLeft);
      // End the game
      endGame();
      return;
    }

    // Update the display with the current time value
    // Use the formatTime utility for consistent time formatting
    elements.timer.textContent = formatTime(gameState.timeLeft);

    // Add warning class when 60 seconds or less remaining
    if (gameState.timeLeft <= 60) {
      elements.timer.classList.add('time-warning');
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

    // Get the button ID and dump ALL operation buttons to check them
    console.log('OPERATION CLICK - All operation buttons:');
    elements.operationButtons.forEach(btn => {
      console.log(
        `Button: id=${btn.id}, text="${btn.textContent}", classList=${btn.classList.toString()}`
      );
    });

    // Verify this button
    console.log('Clicked button:', this);
    console.log('Setting game mode to:', this.id);

    // Update game mode using the module function
    gameState = updateGameMode(gameState, this.id);
    console.log('Updated game state:', gameState);

    // Update UI
    updateOperationButtons(this);
    if (elements.modeDisplay) {
      elements.modeDisplay.textContent = this.textContent;
    }

    // Update waiting message
    elements.problem.innerHTML = '<p class="waiting-message">Press Start to begin</p>';

    // Debug: log ALL DOM elements with id=threeNumber
    console.log('Finding all elements with id=threeNumber:');
    const threeNumberEls = document.querySelectorAll('#threeNumber');
    console.log('Found', threeNumberEls.length, 'elements with id=threeNumber:');
    threeNumberEls.forEach((el, i) => {
      console.log(`Element ${i}:`, el);
    });
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
    console.log('Updating operation buttons, active button id:', activeButton.id);
    elements.operationButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.classList.add('inactive');
      console.log(`Button ${btn.id} - classList:`, btn.classList.toString());
    });
    activeButton.classList.remove('inactive');
    activeButton.classList.add('active');
    console.log('After update, active button classList:', activeButton.classList.toString());
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
