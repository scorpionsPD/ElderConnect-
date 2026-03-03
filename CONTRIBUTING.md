# Contributing to ElderConnect+

We're thrilled that you're interested in contributing! This document will help guide you through the contribution process.

## Code of Conduct

This project adheres to the Contributor Covenant Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to hello@elderconnect.plus.

## Getting Started

### 1. Fork the Repository
Click the "Fork" button in the top right corner of the GitHub repository.

### 2. Clone Your Fork
```bash
git clone https://github.com/YOUR_USERNAME/elderconnect-plus.git
cd ElderConnect+
```

### 3. Add Upstream Remote
```bash
git remote add upstream https://github.com/elderconnect-plus/app.git
```

### 4. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## Development Workflow

### Before Starting Development
1. Ensure you have all prerequisites installed
2. Read the [ARCHITECTURE.md](docs/ARCHITECTURE.md) to understand project structure
3. Check existing issues to avoid duplicate work
4. For major changes, open an issue to discuss approach

### Code Style

#### Dart/Flutter
- Follow [Effective Dart](https://dart.dev/guides/language/effective-dart)
- Use `dart format` for formatting
- Run `dart analyze` before committing
- Max line length: 100 characters
- Naming: `camelCase` for variables/functions, `PascalCase` for classes

#### Example:
```dart
// Good
class UserEntity {
  final String userId;
  final String firstName;
  
  const UserEntity({
    required this.userId,
    required this.firstName,
  });
}

// Avoid
class user_entity {
  var user_id;
  var first_name;
}
```

#### TypeScript/JavaScript
- Use ESLint configuration provided
- Format with Prettier
- Use TypeScript for type safety
- Naming: `camelCase` for variables, `PascalCase` for components

#### SQL
- Use lowercase for keywords
- Use meaningful names with underscores
- Add comments for complex logic
- Keep migrations atomic and reversible

### Testing

#### Flutter Tests
```bash
cd mobile

# Run all tests
flutter test

# Run specific test file
flutter test test/src/data/repositories/auth_repository_test.dart

# Generate coverage
flutter test --coverage
```

#### TypeScript Tests
```bash
cd backend
npm test

# With coverage
npm run test:coverage
```

### Making Commits

#### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, etc.

**Example:**
```
feat(auth): add two-factor authentication support

Implement TOTP-based 2FA using Time-based One-Time Password (TOTP) standard.
Added setup flow with QR code generation and verification.

Closes #234
```

### Before Submitting a PR

1. **Update from upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Test thoroughly**
   ```bash
   flutter test              # Mobile tests
   npm test                  # Backend tests
   flutter analyze           # Code analysis
   dart format .            # Format code
   ```

3. **Update documentation**
   - Update README if needed
   - Add/update docstrings for new functions
   - Update CHANGELOG.md

4. **Verify GDPR compliance**
   - No hardcoded sensitive data
   - New data fields have retention policies
   - Personal data is minimized

## Submitting a Pull Request

### 1. Create Pull Request
- Go to the original repository
- Click "New Pull Request"
- Select your fork and branch
- Fill out the PR template

### 2. PR Title & Description
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests pass locally
- [ ] No new warnings generated
```

### 3. PR Review Process
- At least 2 maintainers will review
- Provide feedback within 48 hours
- Request changes if needed
- We'll merge once approved

## Areas for Contribution

### 🐛 Bug Fixes
- Check [Issues](https://github.com/elderconnect-plus/app/issues?q=is%3Aopen+is%3Aissue+label%3Abug)
- Label: `bug` or `good-first-issue`

### ✨ New Features
- Check [Issues](https://github.com/elderconnect-plus/app/issues?q=is%3Aopen+is%3Aissue+label%3Afeature)
- Label: `feature` or `help-wanted`
- Start with [Discussions](https://github.com/elderconnect-plus/app/discussions) for major features

### 📝 Documentation
- Improve README
- Add API documentation
- Create guides and tutorials
- Fix typos and clarity

### 🧪 Tests
- Add unit tests
- Add integration tests
- Improve test coverage
- Test with real devices

### ♿ Accessibility
- Improve large font support
- Test with screen readers
- Enhance voice assistance
- Improve color contrast

### 🌍 Translations
- Add new language support
- Improve existing translations
- Fix translation issues

### 🎨 Design
- Improve UI/UX
- Create design specifications
- Contribute icons and graphics

## Reporting Bugs

### Before Reporting
1. Check existing issues
2. Update to latest version
3. Try to reproduce the issue

### Bug Report Template
```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable

## Environment
- OS: [iOS/Android/Web]
- App Version: [version]
- Device: [device model]
```

## Proposing Enhancements

Open a GitHub Discussion with:
1. Clear description of the enhancement
2. Why it would be useful
3. Possible implementation approach
4. Any potential impact on existing features

## Questions?

- 💬 GitHub Discussions: [Link](https://github.com/elderconnect-plus/app/discussions)
- 📧 Email: hello@elderconnect.plus
- 🗣️ Discord: [Join our community](https://discord.gg/elderconnect)

## Special Thanks

Thank you for contributing to ElderConnect+! Your efforts help us make connection accessible to everyone.

---

Happy contributing! 🚀
