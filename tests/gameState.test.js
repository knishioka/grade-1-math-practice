/**
 * Game State Management Tests
 * Tests for core game state functionality
 */

import {
  initGameState,
  resetGameState,
  updateScore,
  recordIncorrectProblem,
  getUniqueIncorrectProblems,
  calculateAccuracy,
  setGameActive,
} from '../src/gameState';

describe('Game State Management', () => {
  // Initial game state for testing
  let gameState;

  beforeEach(() => {
    gameState = initGameState();
  });

  describe('initGameState', () => {
    test('creates a new game state with default values', () => {
      expect(gameState).toEqual({
        gameMode: 'addition',
        difficulty: 'easy',
        currentProblem: {},
        score: 0,
        incorrectAttempts: 0,
        currentProblemAttempts: 0,
        timeLeft: 180, // 3 minutes in seconds
        gameActive: false,
        incorrectProblems: [],
      });
    });
  });

  describe('resetGameState', () => {
    test('resets score and attempts without changing mode and difficulty', () => {
      // Modify game state
      gameState.score = 10;
      gameState.incorrectAttempts = 5;
      gameState.gameMode = 'subtraction';
      gameState.difficulty = 'hard';
      gameState.incorrectProblems = [{ question: '5 - 2 = ?', answer: 3 }];

      // Reset
      const newState = resetGameState(gameState);

      // Check results - mode and difficulty should be preserved
      expect(newState.score).toBe(0);
      expect(newState.incorrectAttempts).toBe(0);
      expect(newState.incorrectProblems).toEqual([]);
      expect(newState.gameMode).toBe('subtraction');
      expect(newState.difficulty).toBe('hard');
    });
  });

  describe('updateScore', () => {
    test('increments score by 1 by default', () => {
      const newState = updateScore(gameState);
      expect(newState.score).toBe(1);

      // Increment again
      const newerState = updateScore(newState);
      expect(newerState.score).toBe(2);
    });

    test('can increment by specific amounts', () => {
      const newState = updateScore(gameState, 5);
      expect(newState.score).toBe(5);
    });
  });

  describe('recordIncorrectProblem', () => {
    test('adds problem to incorrect problems list', () => {
      const problem = { question: '2 + 2 = ?', answer: 4 };
      const newState = recordIncorrectProblem(gameState, problem);

      expect(newState.incorrectProblems).toEqual([problem]);
      expect(newState.incorrectAttempts).toBe(1);
    });

    test('increments current problem attempts', () => {
      const problem = { question: '2 + 2 = ?', answer: 4 };
      const newState = recordIncorrectProblem(gameState, problem);

      expect(newState.currentProblemAttempts).toBe(1);

      // Record another attempt for the same problem
      const newerState = recordIncorrectProblem(newState, problem);
      expect(newerState.currentProblemAttempts).toBe(2);
    });
  });

  describe('getUniqueIncorrectProblems', () => {
    test('returns unique problems by removing duplicates', () => {
      // Add some duplicate problems
      gameState.incorrectProblems = [
        { question: '2 + 2 = ?', answer: 4 },
        { question: '3 + 5 = ?', answer: 8 },
        { question: '2 + 2 = ?', answer: 4 }, // Duplicate
      ];

      const uniqueProblems = getUniqueIncorrectProblems(gameState);
      expect(uniqueProblems.length).toBe(2);
      expect(uniqueProblems).toEqual([
        { question: '2 + 2 = ?', answer: 4 },
        { question: '3 + 5 = ?', answer: 8 },
      ]);
    });
  });

  describe('calculateAccuracy', () => {
    test('calculates accuracy as percentage of correct answers', () => {
      // 3 correct, 2 incorrect
      gameState.score = 3;
      gameState.incorrectAttempts = 2;

      const accuracy = calculateAccuracy(gameState);
      expect(accuracy).toBe(60); // 3/5 = 60%
    });

    test('returns 0 when no attempts made', () => {
      const accuracy = calculateAccuracy(gameState); // Both score and incorrectAttempts are 0
      expect(accuracy).toBe(0);
    });

    test('returns 100 when all answers are correct', () => {
      gameState.score = 10;
      gameState.incorrectAttempts = 0;

      const accuracy = calculateAccuracy(gameState);
      expect(accuracy).toBe(100);
    });
  });

  describe('setGameActive', () => {
    test('activates the game', () => {
      expect(gameState.gameActive).toBe(false);

      const newState = setGameActive(gameState);
      expect(newState.gameActive).toBe(true);
    });

    test('deactivates the game when false is passed', () => {
      // First activate the game
      gameState = setGameActive(gameState);
      expect(gameState.gameActive).toBe(true);

      // Then deactivate it
      const newState = setGameActive(gameState, false);
      expect(newState.gameActive).toBe(false);
    });
  });
});
