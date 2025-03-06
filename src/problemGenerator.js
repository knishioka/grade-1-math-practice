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
 * Generate a problem with three numbers using addition and/or subtraction
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @param {Object} difficultySettings - Settings for different difficulties
 * @return {Object} Problem object with question and answer
 */
export function generateThreeNumberProblem(difficulty, difficultySettings) {
  const settings = difficultySettings.threeNumber[difficulty];
  const num1 = getRandomNumber(settings.min1, settings.max1);
  const num2 = getRandomNumber(settings.min2, settings.max2);
  const num3 = getRandomNumber(settings.min3, settings.max3);
  
  // Randomly choose problem type:
  // 1. a + b + c
  // 2. a + b - c
  // 3. a - b + c
  // Exclude a - b - c because it might result in negative numbers more easily
  
  const problemType = getRandomNumber(1, 3);
  
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
        const maxNum3 = Math.max(1, num1 + num2 - 1);
        const adjustedNum3 = getRandomNumber(1, maxNum3);
        question = `${num1} + ${num2} - ${adjustedNum3} = ?`;
        answer = num1 + num2 - adjustedNum3;
      } else {
        question = `${num1} + ${num2} - ${num3} = ?`;
        answer = num1 + num2 - num3;
      }
      break;
      
    case 3: // a - b + c
      // Ensure a > b to avoid negative intermediate results
      if (num1 <= settings.min2) {
        // If num1 is too small, use a simple addition problem instead
        question = `${num1} + ${num2} + ${num3} = ?`;
        answer = num1 + num2 + num3;
      } else {
        const safeMax = Math.max(1, num1 - 1);
        const adjustedNum2 = getRandomNumber(settings.min2, Math.min(settings.max2, safeMax));
        question = `${num1} - ${adjustedNum2} + ${num3} = ?`;
        answer = num1 - adjustedNum2 + num3;
      }
      break;
  }
  
  return {
    originalQuestion: question,
    question: question,
    answer: answer
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
    threeNumber: generateThreeNumberProblem
  }
) {
  switch (gameMode) {
    case 'addition':
      return generators.addition(difficulty, difficultySettings);

    case 'subtraction':
      return generators.subtraction(difficulty, difficultySettings);

    case 'threeNumber':
      return generators.threeNumber(difficulty, difficultySettings);

    case 'mixed':
      // Randomly choose between addition, subtraction, and threeNumber
      const randomValue = Math.random();
      if (randomValue < 0.33) {
        return generators.addition(difficulty, difficultySettings);
      } else if (randomValue < 0.67) {
        return generators.subtraction(difficulty, difficultySettings);
      } else {
        return generators.threeNumber(difficulty, difficultySettings);
      }

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