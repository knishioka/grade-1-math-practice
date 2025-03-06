/**
 * Problem Generator Tests
 * Tests to ensure problem generation works correctly for each operation type
 */

import {
  generateAdditionProblem,
  generateSubtractionProblem,
  generateThreeNumberProblem,
  generateCountingProblem,
  generateProblemByMode,
  updateCurrentProblem
} from '../src/problemGenerator';

// Mock difficulty settings
const mockDifficultySettings = {
  addition: {
    easy: { min1: 1, max1: 10, min2: 1, max2: 10 },
    medium: { min1: 1, max1: 20, min2: 1, max2: 20 },
    hard: { min1: 10, max1: 50, min2: 10, max2: 50 },
  },
  subtraction: {
    easy: { min1: 1, max1: 10, min2: 1, max2: 10 },
    medium: { min1: 10, max1: 20, min2: 1, max2: 10 },
    hard: { min1: 20, max1: 100, min2: 1, max2: 20 },
  },
  threeNumber: {
    easy: { min1: 1, max1: 10, min2: 1, max2: 5, min3: 1, max3: 5 },
    medium: { min1: 5, max1: 15, min2: 1, max2: 10, min3: 1, max3: 10 },
    hard: { min1: 10, max1: 25, min2: 5, max2: 15, min3: 5, max3: 15 },
  },
  counting: {
    easy: { min: 5, max: 10 },
    medium: { min: 10, max: 20 },
    hard: { min: 15, max: 30 },
  },
};

describe('Problem Generator Functions', () => {
  describe('generateAdditionProblem', () => {
    test('creates valid addition problems', () => {
      const result = generateAdditionProblem('easy', mockDifficultySettings);

      expect(result).toEqual(
        expect.objectContaining({
          originalQuestion: expect.stringMatching(/^\d+ \+ \d+ = \?$/),
          question: expect.stringMatching(/^\d+ \+ \d+ = \?$/),
          answer: expect.any(Number),
        })
      );

      // Verify that the answer is correct
      const match = result.question.match(/^(\d+) \+ (\d+) = \?$/);
      const num1 = parseInt(match[1]);
      const num2 = parseInt(match[2]);
      expect(result.answer).toBe(num1 + num2);
    });

    test('respects difficulty settings', () => {
      // Test easy difficulty
      const easyResult = generateAdditionProblem('easy', mockDifficultySettings);
      const easyMatch = easyResult.question.match(/^(\d+) \+ (\d+) = \?$/);
      const easyNum1 = parseInt(easyMatch[1]);
      const easyNum2 = parseInt(easyMatch[2]);

      expect(easyNum1).toBeInRange(1, 10);
      expect(easyNum2).toBeInRange(1, 10);

      // Test hard difficulty
      const hardResult = generateAdditionProblem('hard', mockDifficultySettings);
      const hardMatch = hardResult.question.match(/^(\d+) \+ (\d+) = \?$/);
      const hardNum1 = parseInt(hardMatch[1]);
      const hardNum2 = parseInt(hardMatch[2]);

      expect(hardNum1).toBeInRange(10, 50);
      expect(hardNum2).toBeInRange(10, 50);
    });
  });

  describe('generateSubtractionProblem', () => {
    test('creates valid subtraction problems with positive results', () => {
      const result = generateSubtractionProblem('easy', mockDifficultySettings);

      expect(result).toEqual(
        expect.objectContaining({
          originalQuestion: expect.stringMatching(/^\d+ - \d+ = \?$/),
          question: expect.stringMatching(/^\d+ - \d+ = \?$/),
          answer: expect.any(Number),
        })
      );

      // Verify that the answer is correct and non-negative
      const match = result.question.match(/^(\d+) - (\d+) = \?$/);
      const num1 = parseInt(match[1]);
      const num2 = parseInt(match[2]);

      expect(result.answer).toBe(num1 - num2);
      expect(result.answer).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateThreeNumberProblem', () => {
    test('creates valid three-number problems', () => {
      const result = generateThreeNumberProblem('easy', mockDifficultySettings);

      expect(result).toEqual(
        expect.objectContaining({
          originalQuestion: expect.stringMatching(/^\d+ [\+\-] \d+ [\+\-] \d+ = \?$/),
          question: expect.stringMatching(/^\d+ [\+\-] \d+ [\+\-] \d+ = \?$/),
          answer: expect.any(Number),
        })
      );

      // Verify that the answer is correct
      const match = result.question.match(/^(\d+) ([\+\-]) (\d+) ([\+\-]) (\d+) = \?$/);
      const num1 = parseInt(match[1]);
      const op1 = match[2];
      const num2 = parseInt(match[3]);
      const op2 = match[4];
      const num3 = parseInt(match[5]);

      let expectedAnswer;
      if (op1 === '+' && op2 === '+') {
        expectedAnswer = num1 + num2 + num3;
      } else if (op1 === '+' && op2 === '-') {
        expectedAnswer = num1 + num2 - num3;
      } else if (op1 === '-' && op2 === '+') {
        expectedAnswer = num1 - num2 + num3;
      }

      expect(result.answer).toBe(expectedAnswer);
      
      // Result should never be negative
      expect(result.answer).toBeGreaterThanOrEqual(0);
    });
    
    test('ensures all operations maintain non-negative results', () => {
      // Test 50 problems to verify no negative intermediate results
      for (let i = 0; i < 50; i++) {
        const result = generateThreeNumberProblem('medium', mockDifficultySettings);
        const match = result.question.match(/^(\d+) ([\+\-]) (\d+) ([\+\-]) (\d+) = \?$/);
        const num1 = parseInt(match[1]);
        const op1 = match[2];
        const num2 = parseInt(match[3]);
        
        // If first operation is subtraction, num1 must be >= num2
        if (op1 === '-') {
          expect(num1).toBeGreaterThanOrEqual(num2);
        }
        
        // Final result should always be non-negative
        expect(result.answer).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('generateCountingProblem', () => {
    test('creates valid counting problems', () => {
      const result = generateCountingProblem('easy', mockDifficultySettings);

      expect(result).toEqual(
        expect.objectContaining({
          originalQuestion: expect.stringMatching(/How many .+\?<br>.+/),
          question: expect.stringMatching(/How many .+\?<br>.+/),
          answer: expect.any(Number),
        })
      );

      // Verify the answer is within the expected range
      expect(result.answer).toBeInRange(5, 10);
    });
  });

  describe('generateProblemByMode', () => {
    test('calls the correct generator based on game mode', () => {
      // Mock generator functions
      const mockGenerators = {
        addition: jest.fn().mockReturnValue({ question: '1 + 1 = ?', answer: 2 }),
        subtraction: jest.fn().mockReturnValue({ question: '2 - 1 = ?', answer: 1 }),
        threeNumber: jest.fn().mockReturnValue({ question: '2 + 3 + 4 = ?', answer: 9 }),
        counting: jest.fn().mockReturnValue({ question: 'Count', answer: 5 }),
      };

      // Test addition mode
      generateProblemByMode('easy', mockDifficultySettings, 'addition', mockGenerators);
      expect(mockGenerators.addition).toHaveBeenCalledWith(
        'easy',
        mockDifficultySettings
      );

      // Test subtraction mode
      generateProblemByMode('easy', mockDifficultySettings, 'subtraction', mockGenerators);
      expect(mockGenerators.subtraction).toHaveBeenCalledWith(
        'easy',
        mockDifficultySettings
      );

      // Test threeNumber mode
      generateProblemByMode('easy', mockDifficultySettings, 'threeNumber', mockGenerators);
      expect(mockGenerators.threeNumber).toHaveBeenCalledWith(
        'easy',
        mockDifficultySettings
      );

      // Test counting mode
      generateProblemByMode('easy', mockDifficultySettings, 'counting', mockGenerators);
      expect(mockGenerators.counting).toHaveBeenCalledWith(
        'easy',
        mockDifficultySettings
      );
    });

    test('handles mixed mode by including threeNumber problems', () => {
      // Override Math.random to test all possibilities
      const originalRandom = Math.random;
      
      try {
        // Test a large sample to ensure we hit all 3 operation types
        const operations = {
          addition: 0,
          subtraction: 0,
          threeNumber: 0,
        };
        
        for (let i = 0; i < 300; i++) {
          const mixedResult = generateProblemByMode('easy', mockDifficultySettings, 'mixed');
          
          // Count occurrences of each problem type
          if (mixedResult.question.includes('+') && !mixedResult.question.match(/\d+ \+ \d+ \+ \d+/) && !mixedResult.question.match(/\d+ \+ \d+ \- \d+/)) {
            operations.addition++;
          } else if (mixedResult.question.match(/\d+ \- \d+ = \?$/)) {
            operations.subtraction++;
          } else if (mixedResult.question.match(/\d+ [\+\-] \d+ [\+\-] \d+/)) {
            operations.threeNumber++;
          }
        }
        
        // We should have some of each type
        expect(operations.addition).toBeGreaterThan(0);
        expect(operations.subtraction).toBeGreaterThan(0);
        expect(operations.threeNumber).toBeGreaterThan(0);
      } finally {
        // Restore original random function
        Math.random = originalRandom;
      }
    });
  });

  describe('updateCurrentProblem', () => {
    test('updates game state with new problem and resets attempts', () => {
      const gameState = {
        currentProblem: {},
        currentProblemAttempts: 5,
        otherProperty: 'value'
      };
      
      const problem = {
        question: '1 + 1 = ?',
        answer: 2
      };
      
      const result = updateCurrentProblem(gameState, problem);
      
      expect(result).toEqual({
        currentProblem: problem,
        currentProblemAttempts: 0,
        otherProperty: 'value'
      });
    });
  });
});
