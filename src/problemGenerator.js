/**
 * Problem Generator Functions
 * Functions for generating math problems with different operations and difficulties
 */

import { getRandomNumber } from './utils';

// Emoji array moved to a constant to avoid duplication
const EMOJIS = ['🍎', '🍕', '🐶', '🐱', '🦄', '🍦', '🚗', '🌈', '⭐'];

/**
 * Generate an addition problem based on difficulty
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @param {Object} difficultySettings - Settings for different difficulties
 * @return {Object} Problem object with question and answer
 */
export function generateAdditionProblem(difficulty, difficultySettings) {
  const settings = difficultySettings.addition[difficulty];
  const num1 = getRandomNumber(settings.min1, settings.max1);
  const num2 = getRandomNumber(settings.min2, settings.max2);

  return {
    originalQuestion: `${num1} + ${num2} = ?`,
    question: `${num1} + ${num2} = ?`,
    answer: num1 + num2,
  };
}

/**
 * Generate a subtraction problem based on difficulty
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @param {Object} difficultySettings - Settings for different difficulties
 * @return {Object} Problem object with question and answer
 */
export function generateSubtractionProblem(difficulty, difficultySettings) {
  const settings = difficultySettings.subtraction[difficulty];
  // Ensure the result is never negative
  const num1 = getRandomNumber(settings.min1, settings.max1);
  const num2 = getRandomNumber(settings.min2, Math.min(settings.max2, num1));

  return {
    originalQuestion: `${num1} - ${num2} = ?`,
    question: `${num1} - ${num2} = ?`,
    answer: num1 - num2,
  };
}

/**
 * Generate a counting problem based on difficulty
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @param {Object} difficultySettings - Settings for different difficulties
 * @return {Object} Problem object with question and answer
 */
export function generateCountingProblem(difficulty, difficultySettings) {
  const settings = difficultySettings.counting[difficulty];
  const count = getRandomNumber(settings.min, settings.max);

  // Select a random emoji
  const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

  let emojiString = '';
  for (let i = 0; i < count; i++) {
    emojiString += randomEmoji + ' ';
    // Add a line break for better grouping in harder levels
    if (difficulty !== 'easy' && i % 5 === 4) {
      emojiString += '<br>';
    }
  }

  const countingQuestion = `How many ${randomEmoji}?<br>${emojiString}`;
  return {
    originalQuestion: countingQuestion,
    question: countingQuestion,
    answer: count,
  };
}

/**
 * Generate a problem based on the current game mode
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @param {Object} difficultySettings - Settings for different difficulties
 * @param {string} gameMode - Current game mode
 * @param {Object} [generators] - Optional generator functions for testing
 * @return {Object} Problem object with question and answer
 */
export function generateProblemByMode(
  difficulty,
  difficultySettings,
  gameMode,
  generators = {
    addition: generateAdditionProblem,
    subtraction: generateSubtractionProblem,
    counting: generateCountingProblem,
  }
) {
  switch (gameMode) {
    case 'addition':
      return generators.addition(difficulty, difficultySettings);

    case 'subtraction':
      return generators.subtraction(difficulty, difficultySettings);

    case 'mixed':
      // Randomly choose between addition and subtraction
      return Math.random() < 0.5
        ? generators.addition(difficulty, difficultySettings)
        : generators.subtraction(difficulty, difficultySettings);

    case 'counting':
      return generators.counting(difficulty, difficultySettings);

    default:
      // Default to addition if mode is unknown
      return generators.addition(difficulty, difficultySettings);
  }
}

/**
 * Update current problem in game state
 * @param {Object} state - Current game state
 * @param {Object} problem - New problem
 * @return {Object} Updated game state with new problem
 */
export function updateCurrentProblem(state, problem) {
  return {
    ...state,
    currentProblem: problem,
    currentProblemAttempts: 0
  };
}