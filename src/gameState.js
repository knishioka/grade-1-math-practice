/**
 * Game State Management
 * Functions for manipulating the core game state
 */

// Game constants
export const DEFAULT_GAME_MODE = 'addition';
export const DEFAULT_DIFFICULTY = 'easy';
export const DEFAULT_TIMER = 180; // 3 minutes in seconds
export const MAX_PROBLEM_ATTEMPTS = 3;

/**
 * Initialize a new game state with default values
 * @return {Object} New game state
 */
export function initGameState() {
  return {
    gameMode: DEFAULT_GAME_MODE,
    difficulty: DEFAULT_DIFFICULTY,
    currentProblem: {},
    score: 0,
    incorrectAttempts: 0,
    currentProblemAttempts: 0,
    timeLeft: DEFAULT_TIMER,
    gameActive: false,
    incorrectProblems: [],
  };
}

/**
 * Reset the game state for a new game
 * Preserves mode and difficulty settings
 * @param {Object} state - Current game state
 * @return {Object} Reset game state
 */
export function resetGameState(state) {
  return {
    ...state,
    score: 0,
    incorrectAttempts: 0,
    currentProblemAttempts: 0,
    timeLeft: DEFAULT_TIMER,
    gameActive: true,
    incorrectProblems: [],
    currentProblem: {},
  };
}

/**
 * Update the score by incrementing it
 * @param {Object} state - Current game state
 * @param {number} [increment=1] - Amount to increment by
 * @return {Object} Updated game state
 */
export function updateScore(state, increment = 1) {
  return {
    ...state,
    score: state.score + increment,
  };
}

/**
 * Record an incorrect problem attempt
 * @param {Object} state - Current game state
 * @param {Object} problem - The problem that was answered incorrectly
 * @return {Object} Updated game state
 */
export function recordIncorrectProblem(state, problem) {
  return {
    ...state,
    incorrectAttempts: state.incorrectAttempts + 1,
    currentProblemAttempts: state.currentProblemAttempts + 1,
    incorrectProblems: [...state.incorrectProblems, problem],
  };
}

/**
 * Get unique incorrect problems (no duplicates)
 * @param {Object} state - Current game state
 * @return {Array} Array of unique incorrect problems
 */
export function getUniqueIncorrectProblems(state) {
  const seen = new Set();
  const uniqueProblems = [];

  for (const problem of state.incorrectProblems) {
    const key = problem.question + problem.answer;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueProblems.push(problem);
    }
  }

  return uniqueProblems;
}

/**
 * Calculate accuracy percentage
 * @param {Object} state - Current game state
 * @return {number} Accuracy percentage (0-100)
 */
export function calculateAccuracy(state) {
  const totalAttempts = state.score + state.incorrectAttempts;
  if (totalAttempts === 0) return 0;

  return Math.round((state.score / totalAttempts) * 100);
}

/**
 * Check if a problem has reached the maximum attempts
 * @param {Object} state - Current game state
 * @param {number} maxAttempts - Maximum attempts allowed
 * @return {boolean} True if max attempts reached, false otherwise
 */
export function hasReachedMaxAttempts(state, maxAttempts = MAX_PROBLEM_ATTEMPTS) {
  return state.currentProblemAttempts >= maxAttempts;
}

/**
 * Update game mode
 * @param {Object} state - Current game state
 * @param {string} mode - New game mode
 * @return {Object} Updated game state
 */
export function updateGameMode(state, mode) {
  return {
    ...state,
    gameMode: mode,
  };
}

/**
 * Update difficulty level
 * @param {Object} state - Current game state
 * @param {string} difficulty - New difficulty level
 * @return {Object} Updated game state
 */
export function updateDifficulty(state, difficulty) {
  return {
    ...state,
    difficulty,
  };
}

/**
 * Set game to active state
 * @param {Object} state - Current game state
 * @param {boolean} isActive - Whether the game should be active
 * @return {Object} Updated game state
 */
export function setGameActive(state, isActive = true) {
  return {
    ...state,
    gameActive: isActive,
  };
}
