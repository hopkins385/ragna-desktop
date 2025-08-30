# Contributing to RAGNA Desktop

Thank you for your interest in contributing to RAGNA Desktop! This document provides guidelines and information for contributors.

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, please include:

- A clear and descriptive title
- Steps to reproduce the behavior
- Expected behavior vs actual behavior
- Screenshots if applicable
- Environment details (OS, Node.js version, etc.)
- Console logs or error messages

### Suggesting Features

Feature suggestions are welcome! Please:

- Use a clear and descriptive title
- Provide a detailed description of the suggested feature
- Explain why this feature would be useful
- Consider the scope and complexity of the feature

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** following the coding standards
4. **Test your changes**: Ensure the app builds and runs correctly
5. **Run linting**: `npm run lint`
6. **Run type checking**: `npm run typecheck`
7. **Commit your changes** with a clear commit message
8. **Push to your fork** and create a pull request

#### Pull Request Guidelines

- Fill out the pull request template completely
- Link any related issues
- Include screenshots for UI changes
- Ensure all checks pass
- Keep pull requests focused on a single feature or fix
- Write clear, concise commit messages

## Development Setup

### Prerequisites

- Node.js 18+
- npm 8+
- Git

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ragna-desktop.git
cd ragna-desktop

# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure

```
src/
├── main/           # Electron main process
│   ├── database/   # Database entities and connections
│   ├── handlers/   # IPC handlers
│   ├── parsers/    # Document parsers
│   ├── services/   # Business logic
│   └── utils/      # Utilities
├── preload/        # Electron preload scripts
└── renderer/       # Vue.js frontend
    ├── components/ # Vue components
    ├── pages/      # Application pages
    ├── stores/     # State management
    └── composables/ # Vue composables
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` types when possible
- Use strict type checking

### Vue.js

- Use Vue 3 Composition API
- Follow Vue.js style guide
- Use TypeScript with Vue components
- Prefer `<script setup>` syntax

### Code Style

- Use Prettier for code formatting: `npm run format`
- Follow ESLint rules: `npm run lint`
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused

### Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:

```
feat(chat): add message history persistence
fix(parser): handle empty PDF documents
docs: update installation instructions
```

## Testing

### Manual Testing

- Test the application on your target platform
- Verify all features work as expected
- Test edge cases and error scenarios
- Check for memory leaks during extended use

### Automated Testing

Currently, the project relies on manual testing. Contributions to add automated testing are welcome!

## Building

### Development Build

```bash
npm run build
```

### Platform-specific Builds

```bash
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
```

## Documentation

- Update README.md for user-facing changes
- Update this CONTRIBUTING.md for process changes
- Add JSDoc comments for new APIs
- Update type definitions as needed

## Questions?

If you have questions about contributing, feel free to:

- Open an issue with the "question" label
- Start a discussion in the repository
- Contact the maintainers

Thank you for contributing to RAGNA Desktop! 🚀
