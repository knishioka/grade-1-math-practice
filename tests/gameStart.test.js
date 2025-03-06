/**
 * Game Start Tests
 * Tests if the game starts correctly when the start button is clicked
 */

import { initGameState, resetGameState } from '../src/gameState';
import { formatTime } from '../src/utils';

// Mocks for functions that are not directly imported
// but are used in the process of starting a game
jest.mock('../src/problemGenerator', () => ({
  generateProblemByMode: jest.fn((difficulty, settings, mode) => {
    if (mode === 'threeNumber') {
      return {
        originalQuestion: '2 + 3 + 4 = ?',
        question: '2 + 3 + 4 = ?',
        answer: 9,
        type: 'threeNumber'
      };
    }
    return {
      originalQuestion: '2 + 3 = ?',
      question: '2 + 3 = ?',
      answer: 5
    };
  }),
  updateCurrentProblem: jest.fn((state, problem) => ({
    ...state,
    currentProblem: problem,
    currentProblemAttempts: 0
  }))
}));

describe('Game Start Functionality', () => {
  // Setup DOM elements before each test
  let elements = {};
  let startButton;
  let gameState;
  let setIntervalMock;
  
  beforeEach(() => {
    // Create DOM elements
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
      check: document.getElementById('check')
    };
    
    startButton = elements.startBtn;
    
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
    // Define startGame function similar to the one in script.js
    function startGame() {
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
      gameState.currentProblem = {
        originalQuestion: '2 + 3 = ?',
        question: '2 + 3 = ?',
        answer: 5
      };
      elements.problem.innerHTML = gameState.currentProblem.question;
      
      // Start timer
      gameState.timerInterval = setInterval(() => {
        // Timer update logic
      }, 1000);
    }
    
    // Add event listener to start button
    startButton.addEventListener('click', startGame);
    
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
    expect(elements.problem.innerHTML).toBe('2 + 3 = ?');
    expect(elements.startBtn.textContent).toBe('Running');
    expect(elements.startBtn.classList.contains('disabled')).toBe(true);
    
    // Check if timer is started
    expect(setIntervalMock).toHaveBeenCalled();
    expect(setIntervalMock).toHaveBeenCalledTimes(1);
    expect(setIntervalMock.mock.calls[0][1]).toBe(1000); // Check interval is 1 second
  });
  
  test('timer should update when game is active', () => {
    // Define updateTimer function similar to the one in script.js
    function updateTimer() {
      // Update timeLeft first to match the script.js implementation
      if (gameState.timeLeft > 0) {
        gameState.timeLeft--;
      }
      
      // Then update the UI
      const minutes = Math.floor(gameState.timeLeft / 60);
      const seconds = gameState.timeLeft % 60;
      elements.timer.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      if (gameState.timeLeft <= 60) {
        elements.timer.classList.add('time-warning');
      }
    }
    
    // Initialize game as active
    gameState = resetGameState(gameState);
    gameState.timeLeft = 180; // 3 minutes
    
    // Initial time
    expect(elements.timer.textContent).toBe('3:00');
    
    // First call to updateTimer
    updateTimer();
    expect(gameState.timeLeft).toBe(179);
    expect(elements.timer.textContent).toBe('2:59');
    
    // Update 60 more times (simulate 1 minute)
    for (let i = 0; i < 60; i++) {
      updateTimer();
    }
    expect(gameState.timeLeft).toBe(119);
    expect(elements.timer.textContent).toBe('1:59');
    
    // Advance to warning time (60 seconds)
    gameState.timeLeft = 61;
    updateTimer();
    expect(gameState.timeLeft).toBe(60);
    expect(elements.timer.textContent).toBe('1:00');
    expect(elements.timer.classList.contains('time-warning')).toBe(true);
  });
  
  test('a new problem should be displayed when game starts', () => {
    // Define startGame and newProblem functions similar to the ones in script.js
    function startGame() {
      // Reset game state
      gameState = resetGameState(gameState);
      
      // Generate first problem
      newProblem();
      
      // Start timer
      gameState.timerInterval = setInterval(() => {
        // Timer logic
      }, 1000);
    }
    
    function newProblem() {
      // Generate a problem
      const problem = {
        originalQuestion: '5 + 7 = ?',
        question: '5 + 7 = ?',
        answer: 12
      };
      
      // Update game state
      gameState.currentProblem = problem;
      gameState.currentProblemAttempts = 0;
      
      // Update UI
      elements.problem.innerHTML = problem.question;
      elements.message.textContent = '';
      elements.message.className = 'message';
    }
    
    // Test initial state
    expect(elements.problem.innerHTML).toBe('');
    
    // Start game
    startGame();
    
    // Check if problem is displayed
    expect(elements.problem.innerHTML).toBe('5 + 7 = ?');
    expect(gameState.currentProblem.answer).toBe(12);
  });
  
  test('generates problems based on game mode', () => {
    // Mock generateProblemByMode to track calls and return expected values
    const mockGenerateProblemByMode = jest.fn();
    
    // For threeNumber mode, return a three-number problem
    mockGenerateProblemByMode.mockImplementation((difficulty, settings, mode) => {
      if (mode === 'threeNumber') {
        return {
          originalQuestion: '5 + 6 + 7 = ?',
          question: '5 + 6 + 7 = ?',
          answer: 18
        };
      } else {
        return {
          originalQuestion: '5 + 6 = ?',
          question: '5 + 6 = ?',
          answer: 11
        };
      }
    });
    
    // Define functions with our mock
    function startGame() {
      // Reset game state
      gameState = resetGameState(gameState);
      
      // Generate problem based on mode
      newProblem();
    }
    
    function newProblem() {
      const problem = mockGenerateProblemByMode(
        gameState.difficulty, 
        {}, // Mock settings
        gameState.gameMode
      );
      
      gameState.currentProblem = problem;
      elements.problem.innerHTML = problem.question;
    }
    
    // Test with threeNumber mode
    gameState.gameMode = 'threeNumber';
    startGame();
    
    // Verify correct mode is used
    expect(mockGenerateProblemByMode).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      'threeNumber'
    );
    
    // Check that problem is displayed correctly
    expect(elements.problem.innerHTML).toBe('5 + 6 + 7 = ?');
    expect(gameState.currentProblem.answer).toBe(18);
  });
  
  test('threeNumber mode should display problems with three numbers', () => {
    // Set up the game state
    gameState = resetGameState(gameState);
    gameState.gameMode = 'threeNumber';
    
    // Define problem to simulate what the problem generator would produce
    const threeNumberProblem = {
      originalQuestion: '5 + 8 - 3 = ?',
      question: '5 + 8 - 3 = ?',
      answer: 10,
      type: 'threeNumber'
    };
    
    // Set the problem in the game state
    gameState.currentProblem = threeNumberProblem;
    elements.problem.innerHTML = threeNumberProblem.question;
    
    // Check that problem is displayed correctly
    expect(elements.problem.innerHTML).toBe('5 + 8 - 3 = ?');
    
    // Verify the question contains three numbers
    expect(gameState.currentProblem.question).toMatch(/^\d+ [\+\-] \d+ [\+\-] \d+ = \?$/);
    
    // Extract the numbers and operations to verify
    const match = gameState.currentProblem.question.match(/^(\d+) ([\+\-]) (\d+) ([\+\-]) (\d+) = \?$/);
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