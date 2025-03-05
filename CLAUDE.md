# Grade 1 Math Practice - Development Guidelines

## Commands
- Run all tests: `npm test`
- Run single test: `npm test -- -t 'test name pattern'` 
- Watch tests: `npm run test:watch`
- Test coverage: `npm run test:coverage`
- Format code: `npm run format`
- Lint code: `npm run lint`
- Fix linting: `npm run lint:fix`
- Start app: `npm start`

## Code Style
- **Format**: 2-space indent, 100 char line limit, single quotes, semicolons
- **Naming**: camelCase for variables/functions, descriptive names
- **Functions**: Pure when possible, return values vs exceptions
- **Documentation**: JSDoc comments for all functions with @param and @return
- **State**: Immutable updates with spread operators
- **Modules**: ES modules with named exports/imports
- **Testing**: Jest/JSDOM, describe/test blocks, descriptive titles
- **Components**: Modular design with single responsibility principle