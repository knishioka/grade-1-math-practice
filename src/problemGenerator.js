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
  console.log('generateThreeNumberProblem called with difficulty:', difficulty);
  console.log('Available difficulty settings:', Object.keys(difficultySettings));
  
  // Check if threeNumber settings exist in difficultySettings
  if (!difficultySettings.threeNumber) {
    console.error('ERROR: threeNumber settings not found in difficultySettings:', difficultySettings);
    // Fallback to addition if settings are missing
    return generateAdditionProblem(difficulty, difficultySettings);
  }
  
  const settings = difficultySettings.threeNumber[difficulty];
  console.log('Using threeNumber settings:', settings);
  
  if (!settings) {
    console.error(`ERROR: No settings found for difficulty '${difficulty}' in threeNumber mode`);
    // Fallback to addition if settings are missing
    return generateAdditionProblem(difficulty, difficultySettings);
  }
  
  const num1 = getRandomNumber(settings.min1, settings.max1);
  const num2 = getRandomNumber(settings.min2, settings.max2);
  const num3 = getRandomNumber(settings.min3, settings.max3);
  
  console.log(`Generated numbers: ${num1}, ${num2}, ${num3}`);
  
  // Randomly choose problem type:
  // 1. a + b + c
  // 2. a + b - c
  // 3. a - b + c
  // Exclude a - b - c because it might result in negative numbers more easily
  
  // Randomly choose problem type from 1-3
  const problemType = getRandomNumber(1, 3);
  console.log(`Selected problem type: ${problemType}`);
  
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
  
  const result = {
    originalQuestion: question,
    question: question,
    answer: answer,
    type: 'threeNumber' // Add a type marker to identify this as a three-number problem
  };
  
  console.log('Generated three-number problem:', result);
  return result;
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
  console.log('generateProblemByMode called with mode:', gameMode, 'and difficulty:', difficulty);
  
  let problem;
  
  switch (gameMode) {
    case 'addition':
      problem = generators.addition(difficulty, difficultySettings);
      break;

    case 'subtraction':
      problem = generators.subtraction(difficulty, difficultySettings);
      break;

    case 'threeNumber':
      console.log('Explicitly generating a threeNumber problem');
      console.log('Generator function:', generators.threeNumber.name);
      console.log('Difficulty settings for threeNumber mode:', JSON.stringify(difficultySettings.threeNumber));
      // Call the generator directly with detailed troubleshooting
      try {
        problem = generators.threeNumber(difficulty, difficultySettings);
        console.log('Successfully generated threeNumber problem:', problem);
      } catch (err) {
        console.error('ERROR generating threeNumber problem:', err);
        // Create a simple three-number problem as fallback
        // DO NOT fallback to addition - this would make a two-number problem
        
        // Get the settings or use defaults
        const settings = difficultySettings.threeNumber && difficultySettings.threeNumber[difficulty] ? 
          difficultySettings.threeNumber[difficulty] : 
          { min1: 1, max1: 10, min2: 1, max2: 5, min3: 1, max3: 5 };
        
        // Generate three random numbers
        const getRandomNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const num1 = getRandomNum(settings.min1, settings.max1);
        const num2 = getRandomNum(settings.min2, settings.max2);
        const num3 = getRandomNum(settings.min3, settings.max3);
        
        // Create a simple a + b + c problem
        const question = `${num1} + ${num2} + ${num3} = ?`;
        
        problem = {
          originalQuestion: question,
          question: question,
          answer: num1 + num2 + num3,
          type: 'threeNumber'
        };
        
        console.log('Created fallback three-number problem:', problem);
      }
      break;

    case 'mixed':
      // Randomly choose between addition, subtraction, and threeNumber
      const randomValue = Math.random();
      console.log('Mixed mode random value:', randomValue);
      if (randomValue < 0.33) {
        problem = generators.addition(difficulty, difficultySettings);
      } else if (randomValue < 0.67) {
        problem = generators.subtraction(difficulty, difficultySettings);
      } else {
        problem = generators.threeNumber(difficulty, difficultySettings);
      }
      break;

    case 'counting':
      problem = generators.counting(difficulty, difficultySettings);
      break;

    default:
      console.warn('Unknown game mode:', gameMode, 'falling back to addition');
      problem = generators.addition(difficulty, difficultySettings);
      break;
  }
  
  // Add source information to the problem object
  problem.sourceMode = gameMode;
  
  console.log('Problem generated from mode', gameMode, ':', problem);
  return problem;
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