/**
 * Problem Generator Tests
 * Tests to ensure problem generation works correctly for each operation type
 */

import { 
  generateAdditionProblem,
  generateSubtractionProblem,
  generateCountingProblem,
  generateProblemByMode
} from '../src/problemGenerator';

// Mock game state
const mockGameState = {
  gameMode: 'addition',
  difficulty: 'easy',
  currentProblem: {}
};

// Mock difficulty settings
const mockDifficultySettings = {
  addition: {
    easy: { min1: 1, max1: 10, min2: 1, max2: 10 },
    medium: { min1: 1, max1: 20, min2: 1, max2: 20 },
    hard: { min1: 10, max1: 50, min2: 10, max2: 50 }
  },
  subtraction: {
    easy: { min1: 1, max1: 10, min2: 1, max2: 10 },
    medium: { min1: 10, max1: 20, min2: 1, max2: 10 },
    hard: { min1: 20, max1: 100, min2: 1, max2: 20 }
  },
  counting: {
    easy: { min: 5, max: 10 },
    medium: { min: 10, max: 20 },
    hard: { min: 15, max: 30 }
  }
};

describe('Problem Generator Functions', () => {
  describe('generateAdditionProblem', () => {
    test('creates valid addition problems', () => {
      const result = generateAdditionProblem('easy', mockDifficultySettings, mockGameState);
      
      expect(result).toEqual(expect.objectContaining({
        originalQuestion: expect.stringMatching(/^\d+ \+ \d+ = \?$/),
        question: expect.stringMatching(/^\d+ \+ \d+ = \?$/),
        answer: expect.any(Number)
      }));
      
      // Verify that the answer is correct
      const match = result.question.match(/^(\d+) \+ (\d+) = \?$/);
      const num1 = parseInt(match[1]);
      const num2 = parseInt(match[2]);
      expect(result.answer).toBe(num1 + num2);
    });
    
    test('respects difficulty settings', () => {
      // Test easy difficulty
      const easyResult = generateAdditionProblem('easy', mockDifficultySettings, mockGameState);
      const easyMatch = easyResult.question.match(/^(\d+) \+ (\d+) = \?$/);
      const easyNum1 = parseInt(easyMatch[1]);
      const easyNum2 = parseInt(easyMatch[2]);
      
      expect(easyNum1).toBeInRange(1, 10);
      expect(easyNum2).toBeInRange(1, 10);
      
      // Test hard difficulty
      const hardResult = generateAdditionProblem('hard', mockDifficultySettings, mockGameState);
      const hardMatch = hardResult.question.match(/^(\d+) \+ (\d+) = \?$/);
      const hardNum1 = parseInt(hardMatch[1]);
      const hardNum2 = parseInt(hardMatch[2]);
      
      expect(hardNum1).toBeInRange(10, 50);
      expect(hardNum2).toBeInRange(10, 50);
    });
  });

  describe('generateSubtractionProblem', () => {
    test('creates valid subtraction problems with positive results', () => {
      const result = generateSubtractionProblem('easy', mockDifficultySettings, mockGameState);
      
      expect(result).toEqual(expect.objectContaining({
        originalQuestion: expect.stringMatching(/^\d+ - \d+ = \?$/),
        question: expect.stringMatching(/^\d+ - \d+ = \?$/),
        answer: expect.any(Number)
      }));
      
      // Verify that the answer is correct and non-negative
      const match = result.question.match(/^(\d+) - (\d+) = \?$/);
      const num1 = parseInt(match[1]);
      const num2 = parseInt(match[2]);
      
      expect(result.answer).toBe(num1 - num2);
      expect(result.answer).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateCountingProblem', () => {
    test('creates valid counting problems', () => {
      const result = generateCountingProblem('easy', mockDifficultySettings, mockGameState);
      
      expect(result).toEqual(expect.objectContaining({
        originalQuestion: expect.stringMatching(/How many .+\?<br>.+/),
        question: expect.stringMatching(/How many .+\?<br>.+/),
        answer: expect.any(Number)
      }));
      
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
        counting: jest.fn().mockReturnValue({ question: 'Count', answer: 5 })
      };
      
      // Test addition mode
      mockGameState.gameMode = 'addition';
      generateProblemByMode('easy', mockDifficultySettings, mockGameState, mockGenerators);
      expect(mockGenerators.addition).toHaveBeenCalledWith('easy', mockDifficultySettings, mockGameState);
      
      // Test subtraction mode
      mockGameState.gameMode = 'subtraction';
      generateProblemByMode('easy', mockDifficultySettings, mockGameState, mockGenerators);
      expect(mockGenerators.subtraction).toHaveBeenCalledWith('easy', mockDifficultySettings, mockGameState);
      
      // Test counting mode
      mockGameState.gameMode = 'counting';
      generateProblemByMode('easy', mockDifficultySettings, mockGameState, mockGenerators);
      expect(mockGenerators.counting).toHaveBeenCalledWith('easy', mockDifficultySettings, mockGameState);
    });
    
    test('handles mixed mode by choosing addition or subtraction', () => {
      const mixedResult = generateProblemByMode('easy', mockDifficultySettings, {
        ...mockGameState,
        gameMode: 'mixed'
      });
      
      // Should either be an addition or subtraction problem
      const isAddition = mixedResult.question.includes('+');
      const isSubtraction = mixedResult.question.includes('-');
      
      expect(isAddition || isSubtraction).toBe(true);
    });
  });
});