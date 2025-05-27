/**
 * Utility Functions
 * General-purpose utility functions used throughout the application
 */

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @return {number} Random integer between min and max
 */
export function getRandomNumber(min, max) {
  if (min > max) {
    throw new Error('Min value must be less than or equal to max value');
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random difficulty level for mixed difficulty mode
 * Currently returns either 'medium' or 'hard'
 * @return {string} Random difficulty level
 */
export function getRandomDifficulty() {
  const difficulties = ['medium', 'hard'];
  return difficulties[Math.floor(Math.random() * difficulties.length)];
}

/**
 * Format seconds into MM:SS format
 * @param {number} seconds - Seconds to format
 * @return {string} Formatted time string
 */
export function formatTime(seconds) {
  if (seconds < 0) {
    return '0:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

/**
 * Check if a value is a valid number
 * @param {*} value - Value to check
 * @return {boolean} True if value is a valid number, false otherwise
 */
export function isValidNumber(value) {
  const parsed = parseInt(value, 10);
  return !isNaN(parsed) && isFinite(parsed);
}
