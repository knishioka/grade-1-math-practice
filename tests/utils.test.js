/**
 * Utility Function Tests
 * Testing the core utility functions used throughout the application
 */

// Import utility functions for testing
import { 
  getRandomNumber, 
  getRandomDifficulty,
  formatTime
} from '../src/utils';

describe('Utility Functions', () => {
  describe('getRandomNumber', () => {
    test('returns a number within the specified range', () => {
      const min = 1;
      const max = 10;
      
      // Test multiple times to account for randomness
      for (let i = 0; i < 100; i++) {
        const result = getRandomNumber(min, max);
        expect(result).toBeInRange(min, max);
      }
    });

    test('handles min equal to max', () => {
      const result = getRandomNumber(5, 5);
      expect(result).toBe(5);
    });
    
    test('returns integers only', () => {
      const result = getRandomNumber(1, 10);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('getRandomDifficulty', () => {
    test('returns either medium or hard', () => {
      const validDifficulties = ['medium', 'hard'];
      
      // Test multiple times to account for randomness
      for (let i = 0; i < 100; i++) {
        const result = getRandomDifficulty();
        expect(validDifficulties).toContain(result);
      }
    });
  });
  
  describe('formatTime', () => {
    test('formats seconds to MM:SS format', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(30)).toBe('0:30');
      expect(formatTime(60)).toBe('1:00');
      expect(formatTime(65)).toBe('1:05');
      expect(formatTime(125)).toBe('2:05');
      expect(formatTime(3600)).toBe('60:00');
    });

    test('handles negative values by returning 0:00', () => {
      expect(formatTime(-10)).toBe('0:00');
    });
  });
});