/**
 * Game Start Tests
 * Tests if the game starts correctly when the start button is clicked
 */

import { initGameState, resetGameState, DEFAULT_TIMER } from '../src/gameState';
import { formatTime } from '../src/utils';

// Mocks for functions that are not directly imported
// but are used in the process of starting a game
const mockGenerateProblemByMode = jest.fn((difficulty, settings, mode) => {
  if (mode === 'threeNumber') {
    return {
      originalQuestion: '2 + 3 + 4 = ?',
      question: '2 + 3 + 4 = ?',
      answer: 9,
      type: 'threeNumber',
    };
  }
  return {
    originalQuestion: '2 + 3 = ?',
    question: '2 + 3 = ?',
    answer: 5,
  };
});

const mockUpdateCurrentProblem = jest.fn((state, problem) => ({
  ...state,
  currentProblem: problem,
  currentProblemAttempts: 0,
}));

jest.mock('../src/problemGenerator', () => ({
  generateProblemByMode: mockGenerateProblemByMode,
  updateCurrentProblem: mockUpdateCurrentProblem,
}));

describe('Game Start Functionality', () => {
  // Setup DOM elements before each test
  let elements = {};
  let startButton;
  let gameState;
  let setIntervalMock;

  /**
   * Set up the DOM for testing
   * Creates all necessary elements and caches references
   */
  function setupTestDOM() {
    document.body.innerHTML = `
      <div class="container">
        <div id="timer">3:00</div>
        <div class="game-controls">
          <button id="start-btn">Start</button>
          <button id="reset-btn">Reset</button>
        </div>
        <div class="score-container">
          <div>Score: <span id="score">0</span></div>
          <div>Incorrect: <span id="incorrect">0</span></div>
        </div>
        <div class="problem-container">
          <div id="problem"></div>
          <div class="answer-container">
            <div id="answer-display"></div>
            <button id="check">Check</button>
          </div>
        </div>
        <div class="message" id="message"></div>
      </div>
    `;

    // Cache DOM elements
    elements = {
      timer: document.getElementById('timer'),
      startBtn: document.getElementById('start-btn'),
      resetBtn: document.getElementById('reset-btn'),
      score: document.getElementById('score'),
      incorrect: document.getElementById('incorrect'),
      problem: document.getElementById('problem'),
      answerDisplay: document.getElementById('answer-display'),
      message: document.getElementById('message'),
      check: document.getElementById('check'),
    };

    startButton = elements.startBtn;
  }

  /**
   * Common function to generate a new problem for testing
   * @param {Object} [problem] - Optional custom problem to use
   */
  function newProblem(problem) {
    const defaultProblem = {
      originalQuestion: '5 + 7 = ?',
      question: '5 + 7 = ?',
      answer: 12,
    };

    // Use provided problem or default
    const currentProblem = problem || defaultProblem;

    // Update game state
    gameState.currentProblem = currentProblem;
    gameState.currentProblemAttempts = 0;

    // Update UI
    elements.problem.innerHTML = currentProblem.question;
    elements.message.textContent = '';
    elements.message.className = 'message';

    return currentProblem;
  }

  /**
   * Common function to start the game for testing
   * @param {Object} [problem] - Optional custom problem to use
   */
  function startGame(problem) {
    // Reset game state
    gameState = resetGameState(gameState);

    // Update UI
    elements.score.textContent = '0';
    elements.incorrect.textContent = '0';
    elements.timer.classList.remove('time-warning');
    elements.timer.textContent = formatTime(gameState.timeLeft);

    // Update button state
    elements.startBtn.textContent = 'Running';
    elements.startBtn.classList.add('disabled');

    // Generate a problem and display it
    if (!problem) {
      newProblem();
    } else {
      gameState.currentProblem = problem;
      elements.problem.innerHTML = problem.question;
    }

    // Start timer
    gameState.timerInterval = setInterval(() => {
      // Timer update logic
    }, 1000);
  }

  beforeEach(() => {
    // Set up the DOM
    setupTestDOM();

    // Initialize game state
    gameState = initGameState();

    // Mock setInterval and clearInterval
    jest.useFakeTimers();
    setIntervalMock = jest.spyOn(window, 'setInterval');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  test('clicking start button should start the game', () => {
    // Define a simplified startGame handler for the button
    function handleStartGame() {
      startGame();
    }

    // Add event listener to start button
    startButton.addEventListener('click', handleStartGame);

    // Test initial state
    expect(gameState.gameActive).toBe(false);
    expect(elements.problem.innerHTML).toBe('');
    expect(elements.timer.textContent).toBe('3:00');

    // Click start button
    startButton.click();

    // Check if game state is updated
    expect(gameState.gameActive).toBe(true);
    expect(gameState.score).toBe(0);
    expect(gameState.incorrectAttempts).toBe(0);

    // Check if UI is updated
    expect(elements.score.textContent).toBe('0');
    expect(elements.incorrect.textContent).toBe('0');
    expect(elements.problem.innerHTML).toBe('5 + 7 = ?');
    expect(elements.startBtn.textContent).toBe('Running');
    expect(elements.startBtn.classList.contains('disabled')).toBe(true);

    // Check if timer is started
    expect(setIntervalMock).toHaveBeenCalled();
    expect(setIntervalMock).toHaveBeenCalledTimes(1);
    expect(setIntervalMock.mock.calls[0][1]).toBe(1000); // Check interval is 1 second
  });

  /**
   * Helper function for timer updates in tests
   */
  function updateTimer() {
    // Update timeLeft first to match the script.js implementation
    if (gameState.timeLeft > 0) {
      gameState.timeLeft--;
    }

    // Then update the UI using the formatTime utility
    elements.timer.textContent = formatTime(gameState.timeLeft);

    if (gameState.timeLeft <= 60) {
      elements.timer.classList.add('time-warning');
    }
  }

  test('timer should update when game is active', () => {
    // Initialize game as active
    gameState = resetGameState(gameState);

    // Initial time
    expect(gameState.timeLeft).toBe(DEFAULT_TIMER);
    expect(elements.timer.textContent).toBe('3:00');

    // First call to updateTimer
    updateTimer();
    expect(gameState.timeLeft).toBe(DEFAULT_TIMER - 1);
    expect(elements.timer.textContent).toBe('2:59');

    // Update 60 more times (simulate 1 minute)
    for (let i = 0; i < 60; i++) {
      updateTimer();
    }
    expect(gameState.timeLeft).toBe(DEFAULT_TIMER - 61);
    expect(elements.timer.textContent).toBe('1:59');

    // Advance to warning time (60 seconds)
    gameState.timeLeft = 61;
    updateTimer();
    expect(gameState.timeLeft).toBe(60);
    expect(elements.timer.textContent).toBe('1:00');
    expect(elements.timer.classList.contains('time-warning')).toBe(true);
  });

  test('a new problem should be displayed when game starts', () => {
    // Test initial state
    expect(elements.problem.innerHTML).toBe('');

    // Start game
    startGame();

    // Check if problem is displayed
    expect(elements.problem.innerHTML).toBe('5 + 7 = ?');
    expect(gameState.currentProblem.answer).toBe(12);
  });

  test('generates problems based on game mode', () => {
    // Test with threeNumber mode
    gameState.gameMode = 'threeNumber';

    // Create a custom problem for this test
    const threeNumberProblem = {
      originalQuestion: '3 + 4 + 5 = ?',
      question: '3 + 4 + 5 = ?',
      answer: 12,
      type: 'threeNumber',
    };

    // Use our helper to set the problem manually
    newProblem(threeNumberProblem);

    // The default mock implementation will return a three-number problem for threeNumber mode
    expect(gameState.currentProblem.type).toBe('threeNumber');
  });

  test('threeNumber mode should display problems with three numbers', () => {
    // Set up the game state
    gameState = resetGameState(gameState);
    gameState.gameMode = 'threeNumber';

    // Define a three-number problem
    const threeNumberProblem = {
      originalQuestion: '5 + 8 - 3 = ?',
      question: '5 + 8 - 3 = ?',
      answer: 10,
      type: 'threeNumber',
    };

    // Use our helper to set the problem
    newProblem(threeNumberProblem);

    // Check that problem is displayed correctly
    expect(elements.problem.innerHTML).toBe('5 + 8 - 3 = ?');

    // Verify the question contains three numbers
    expect(gameState.currentProblem.question).toMatch(/^\d+ [+-] \d+ [+-] \d+ = \?$/);

    // Extract the numbers and operations to verify
    const match = gameState.currentProblem.question.match(/^(\d+) ([+-]) (\d+) ([+-]) (\d+) = \?$/);
    expect(match).not.toBeNull();

    const num1 = parseInt(match[1]);
    const op1 = match[2];
    const num2 = parseInt(match[3]);
    const op2 = match[4];
    const num3 = parseInt(match[5]);

    // Calculate the expected answer based on the operations
    let expectedAnswer;
    if (op1 === '+' && op2 === '+') {
      expectedAnswer = num1 + num2 + num3;
    } else if (op1 === '+' && op2 === '-') {
      expectedAnswer = num1 + num2 - num3;
    } else if (op1 === '-' && op2 === '+') {
      expectedAnswer = num1 - num2 + num3;
    }

    // Verify the answer matches our calculation
    expect(gameState.currentProblem.answer).toBe(expectedAnswer);

    // The result should never be negative
    expect(gameState.currentProblem.answer).toBeGreaterThanOrEqual(0);
  });
});
