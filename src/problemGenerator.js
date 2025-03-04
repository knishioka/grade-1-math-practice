/**
 * Problem Generator Functions
 * Functions for generating math problems with different operations and difficulties
 */

import { getRandomNumber } from './utils';

/**
 * Generate an addition problem based on difficulty
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @param {Object} difficultySettings - Settings for different difficulties
 * @param {Object} gameState - Current game state
 * @return {Object} Problem object with question and answer
 */
export function generateAdditionProblem(difficulty, difficultySettings, gameState) {
  const settings = difficultySettings.addition[difficulty];
  const num1 = getRandomNumber(settings.min1, settings.max1);
  const num2 = getRandomNumber(settings.min2, settings.max2);

  const problem = {
    originalQuestion: `${num1} + ${num2} = ?`,
    question: `${num1} + ${num2} = ?`,
    answer: num1 + num2,
  };

  // Update game state if provided
  if (gameState) {
    gameState.currentProblem = problem;
  }

  return problem;
}

/**
 * Generate a subtraction problem based on difficulty
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @param {Object} difficultySettings - Settings for different difficulties
 * @param {Object} gameState - Current game state
 * @return {Object} Problem object with question and answer
 */
export function generateSubtractionProblem(difficulty, difficultySettings, gameState) {
  const settings = difficultySettings.subtraction[difficulty];
  // Ensure the result is never negative
  const num1 = getRandomNumber(settings.min1, settings.max1);
  const num2 = getRandomNumber(settings.min2, Math.min(settings.max2, num1));

  const problem = {
    originalQuestion: `${num1} - ${num2} = ?`,
    question: `${num1} - ${num2} = ?`,
    answer: num1 - num2,
  };

  // Update game state if provided
  if (gameState) {
    gameState.currentProblem = problem;
  }

  return problem;
}

/**
 * Generate a counting problem based on difficulty
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @param {Object} difficultySettings - Settings for different difficulties
 * @param {Object} gameState - Current game state
 * @return {Object} Problem object with question and answer
 */
export function generateCountingProblem(difficulty, difficultySettings, gameState) {
  const settings = difficultySettings.counting[difficulty];
  const count = getRandomNumber(settings.min, settings.max);

  // Create an array of emoji objects to count
  const emojis = ['🍎', '🍕', '🐶', '🐱', '🦄', '🍦', '🚗', '🌈', '⭐'];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  let emojiString = '';
  for (let i = 0; i < count; i++) {
    emojiString += randomEmoji + ' ';
    // Add a line break for better grouping in harder levels
    if (difficulty !== 'easy' && i % 5 === 4) {
      emojiString += '<br>';
    }
  }

  const countingQuestion = `How many ${randomEmoji}?<br>${emojiString}`;
  const problem = {
    originalQuestion: countingQuestion,
    question: countingQuestion,
    answer: count,
  };

  // Update game state if provided
  if (gameState) {
    gameState.currentProblem = problem;
  }

  return problem;
}

/**
 * Generate a problem based on the current game mode
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @param {Object} difficultySettings - Settings for different difficulties
 * @param {Object} gameState - Current game state
 * @param {Object} [generators] - Optional generator functions for testing
 * @return {Object} Problem object with question and answer
 */
export function generateProblemByMode(
  difficulty,
  difficultySettings,
  gameState,
  generators = {
    addition: generateAdditionProblem,
    subtraction: generateSubtractionProblem,
    counting: generateCountingProblem,
  }
) {
  const { gameMode } = gameState;

  switch (gameMode) {
    case 'addition':
      return generators.addition(difficulty, difficultySettings, gameState);

    case 'subtraction':
      return generators.subtraction(difficulty, difficultySettings, gameState);

    case 'mixed':
      // Randomly choose between addition and subtraction
      return Math.random() < 0.5
        ? generators.addition(difficulty, difficultySettings, gameState)
        : generators.subtraction(difficulty, difficultySettings, gameState);

    case 'counting':
      return generators.counting(difficulty, difficultySettings, gameState);

    default:
      // Default to addition if mode is unknown
      return generators.addition(difficulty, difficultySettings, gameState);
  }
}
