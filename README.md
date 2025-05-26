# Grade 1 Math Practice App

A fun and interactive math application designed specifically for Grade 1 elementary students. This app helps young learners practice basic arithmetic skills in a colorful, engaging environment.

## 🌟 Features

- **Multiple Operation Types**:
  - **Addition**: Practice adding numbers with customizable difficulty
  - **Subtraction**: Learn subtraction with positive-only results (grade-appropriate)
  - **Mixed**: Randomly alternates between addition and subtraction
  - **Counting**: Count objects represented by fun emojis

- **Difficulty Levels**:
  - **Easy**: Small numbers (1-10) for beginners
  - **Medium**: Intermediate challenges (numbers up to 20) 
  - **Hard**: More challenging problems for advanced students
  - **Mixed**: Randomly alternates between medium and hard levels

## 📊 Difficulty Settings by Operation

### Addition
- **Easy**: Numbers 1-10 (e.g., 3 + 5 = ?)
- **Medium**: Numbers 1-20 (e.g., 15 + 8 = ?)
- **Hard**: Numbers 10-50 (e.g., 23 + 35 = ?)

### Subtraction
- **Easy**: Numbers 1-10 (e.g., 8 - 3 = ?)
- **Medium**: First number 10-20, second number 1-10 (e.g., 18 - 6 = ?)
- **Hard**: First number 20-100, second number 1-20 (e.g., 65 - 12 = ?)

### Three Number Problems
- **Easy**: Numbers 1-10, 1-5, 1-5 (e.g., 7 + 3 + 2 = ?)
- **Medium**: Numbers 5-15, 1-10, 1-10 (e.g., 12 + 6 - 4 = ?)
- **Hard**: Numbers 10-25, 5-15, 5-15 (e.g., 20 - 8 + 12 = ?)

### Counting
- **Easy**: Count 5-10 objects
- **Medium**: Count 10-20 objects
- **Hard**: Count 15-30 objects

- **Interactive Elements**:
  - On-screen number pad for easy input
  - Answers appear in-place in equations
  - Visual feedback with colors and emojis
  - Timed practice sessions (3 minutes)

- **Smart Learning Features**:
  - Provides up to 3 attempts per problem
  - Shows correct answer after 3 failed attempts
  - Tracks incorrect problems for review
  - Displays accuracy statistics at end of session

## 🚀 How to Use

1. Select an operation type (Addition, Subtraction, Mixed, or Counting)
2. Choose a difficulty level (Easy, Medium, Hard, or Mixed)
3. Press "Start" to begin the 3-minute practice session
4. Solve as many problems as possible within the time limit
5. Review your performance statistics when time is up

## 👨‍👩‍👧‍👦 For Parents and Teachers

This app was designed with educational principles in mind:

- **Age-Appropriate**: Problems match Grade 1 curriculum standards
- **Positive Reinforcement**: Encouraging feedback for both correct and incorrect attempts
- **Progress Tracking**: Helps identify areas needing more practice
- **No Distractions**: Clean interface without ads or unnecessary elements
- **Accessibility**: Large buttons and clear visuals for young users

## 🛠️ Technical Details

Built with:
- HTML5
- CSS3
- Vanilla JavaScript (no external libraries required)
- Mobile-responsive design

### Architecture

The application follows a clean, modular architecture:

- **State Management**: Centralized game state object
- **Event-Driven**: UI and game logic respond to user events
- **Modular Design**: Clear separation of concerns between components
- **Component-Based Structure**: Each part of the app has a single responsibility

### Code Organization

The codebase is structured for maintainability and extensibility:

```
├── index.html         # Main HTML structure and content
├── styles.css         # Visual styling and animations
└── script.js          # Application logic
    ├── State Variables    # Core application state
    ├── DOM Elements       # Cached DOM references
    ├── Problem Generation # Math problem creation
    ├── Answer Checking    # User response validation
    ├── Game Controls      # Flow management
    ├── UI Handlers        # Event handling
    └── Helper Functions   # Utility functions
```

### Design Patterns

- **Publisher/Subscriber**: For event handling
- **Module Pattern**: For code organization
- **Single Source of Truth**: For state management
- **Factory Functions**: For problem generation

## 📝 Future Enhancements

Future versions may include:
- Multiplication and division for higher grades
- Customizable time limits
- Profile system to track progress over time
- Achievement badges
- Printable practice sheets based on problem areas

### Implementation Guidelines

To extend the application with new features:

1. **Adding New Operation Types**:
   ```javascript
   // 1. Add to difficultySettings object
   difficultySettings.multiplication = {
     easy: { min1: 1, max1: 5, min2: 1, max2: 5 },
     medium: { min1: 1, max1: 10, min2: 1, max2: 10 },
     hard: { min1: 2, max1: 12, min2: 2, max2: 12 }
   };
   
   // 2. Create a generator function
   function generateMultiplicationProblem(difficulty) {
     const settings = difficultySettings.multiplication[difficulty];
     const num1 = getRandomNumber(settings.min1, settings.max1);
     const num2 = getRandomNumber(settings.min2, settings.max2);
     
     gameState.currentProblem = {
       originalQuestion: `${num1} × ${num2} = ?`,
       question: `${num1} × ${num2} = ?`,
       answer: num1 * num2
     };
   }
   
   // 3. Add to the switch statement in generateProblemByMode
   case 'multiplication':
     generateMultiplicationProblem(activeDifficulty);
     break;
   ```

2. **Adding New Difficulty Levels**:
   - Add button in HTML with appropriate ID
   - Add settings to each operation in difficultySettings
   - Extend UI handling for the new difficulty selection

3. **Adding Statistics/Progress Tracking**:
   - Extend the gameState object with new tracking properties
   - Update the endGame function to calculate new statistics
   - Modify the showGameResults function to display this information

## ✨ Getting Started

Simply open `index.html` in any modern web browser to start using the app. No installation or internet connection required after initial download.

## 🧪 Testing and Development

This project includes a comprehensive test suite and development tools:

### Setup Development Environment

```bash
# Install dependencies
npm install

# Start local development server
npm start
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

### Code Quality Tools

```bash
# Format code with Prettier
npm run format

# Lint code with ESLint
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### Test Structure

The test suite is organized into the following categories:

- **Unit Tests**: Tests for individual functions
  - `utils.test.js`: Tests for utility functions
  - `gameState.test.js`: Tests for state management functions
  - `problemGenerator.test.js`: Tests for problem generation

### Test Coverage Goals

- Line coverage: >90%
- Function coverage: 100%
- Branch coverage: >85%

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
