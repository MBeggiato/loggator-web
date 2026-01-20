---
title: Contributing
description: Guidelines for contributing to Loggator
---

Thank you for your interest in contributing to Loggator! This guide will help you get started.

## Ways to Contribute

### 🐛 Report Bugs

Found a bug? Please open an issue:

1. Search [existing issues](https://github.com/MBeggiato/loggator/issues) first
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Docker version, etc.)
   - Screenshots if applicable

### 💡 Suggest Features

Have an idea for improvement?

1. Check [existing feature requests](https://github.com/MBeggiato/loggator/issues?q=is%3Aissue+label%3Aenhancement)
2. Open a new issue with:
   - Clear use case
   - Proposed solution
   - Alternative approaches considered
   - Any implementation ideas

### 📝 Improve Documentation

Documentation improvements are always welcome:

- Fix typos or unclear explanations
- Add missing examples
- Improve API documentation
- Add tutorials or guides

### 🔧 Submit Code

Ready to write code? Great!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Development Setup

See [Local Development Setup](/development/local-setup/) for detailed instructions.

**Quick start:**

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/loggator.git
cd loggator

# Install dependencies
bun install

# Start dev environment
bun run dev:services  # Terminal 1
bun run dev          # Terminal 2
```

## Code Guidelines

### TypeScript

Always use TypeScript with proper types:

```typescript
// ✅ Good - Typed parameters and return
async function searchLogs(params: SearchParams): Promise<SearchResult> {
  // ...
}

// ❌ Bad - Any types
async function searchLogs(params: any): Promise<any> {
  // ...
}
```

### Code Style

We use Prettier for formatting:

```bash
# Format all files
bun run format

# Check formatting
bun run lint
```

**Key style points:**

- Use tabs for indentation
- Single quotes for strings
- Trailing commas
- Semicolons

### Component Structure

Svelte components should follow this structure:

```svelte
<script lang="ts">
  // 1. Imports
  import { Component } from '$lib/components';

  // 2. Types/Interfaces
  interface Props {
    data: string;
  }

  // 3. Props
  let { data }: Props = $props();

  // 4. State
  let count = $state(0);

  // 5. Derived state
  let doubled = $derived(count * 2);

  // 6. Functions
  function handleClick() {
    count++;
  }

  // 7. Effects
  $effect(() => {
    console.log('count changed');
  });
</script>

<!-- 8. Template -->
<div>
  {data}
</div>

<!-- 9. Styles (if needed) -->
<style>
  div {
    padding: 1rem;
  }
</style>
```

### File Naming

- **Components:** PascalCase (e.g., `LogViewer.svelte`)
- **Utilities:** kebab-case (e.g., `log-aggregator.ts`)
- **Routes:** SvelteKit conventions (e.g., `+page.svelte`)

## Git Workflow

### Branch Names

Use descriptive branch names:

- **Features:** `feature/add-log-export`
- **Bugs:** `fix/chat-timeout-error`
- **Docs:** `docs/improve-api-reference`
- **Refactor:** `refactor/simplify-indexer`

### Commit Messages

Write clear commit messages:

```bash
# ✅ Good
git commit -m "Add log export feature"
git commit -m "Fix chat API timeout handling"
git commit -m "Update API documentation with examples"

# ❌ Bad
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

**Format:**

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Formatting changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Example Commit

```
feat: Add log export to CSV

Implements CSV export functionality for search results.
Users can now download filtered logs as CSV files.

Closes #123
```

## Pull Request Process

### Before Submitting

1. **Update from main:**

   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Test your changes:**

   ```bash
   bun run check    # Type checking
   bun run lint     # Linting
   bun run format   # Formatting
   ```

3. **Test manually:**
   - Start dev environment
   - Test affected features
   - Check for console errors

### Submitting

1. Push to your fork:

   ```bash
   git push origin your-branch
   ```

2. Open PR on GitHub

3. Fill out PR template:
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots (if UI changes)

### PR Template

```markdown
## Description

Brief description of what this PR does.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues

Closes #123

## Testing

- [ ] Manual testing performed
- [ ] Type checking passed
- [ ] Linting passed

## Screenshots (if applicable)

Add screenshots here
```

## Code Review

### What We Look For

- **Correctness:** Does it work as intended?
- **Code Quality:** Is it readable and maintainable?
- **Type Safety:** Are types used properly?
- **Performance:** Any performance concerns?
- **Security:** Any security implications?
- **Documentation:** Is it well documented?

### Addressing Feedback

1. Make requested changes
2. Commit and push
3. Respond to comments
4. Request re-review

### Getting Approved

PRs need:

- ✅ All checks passing
- ✅ At least one approval
- ✅ No merge conflicts
- ✅ Documentation updated (if needed)

## Testing Guidelines

### Manual Testing

**For all PRs:**

1. Start dev environment
2. Test your feature/fix
3. Test related features
4. Check different browsers (if UI)
5. Check mobile (if UI)

**Common scenarios:**

- Test with empty state (no logs/containers)
- Test with error conditions
- Test with large datasets
- Test edge cases

### API Testing

Use curl or Postman:

```bash
# Test endpoint
curl "http://localhost:5173/api/your-endpoint"

# With parameters
curl "http://localhost:5173/api/logs/search?query=test&limit=10"

# POST request
curl -X POST http://localhost:5173/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'
```

## Documentation

### When to Update Docs

Update documentation for:

- New features
- Changed behavior
- New API endpoints
- New configuration options
- Breaking changes

### Documentation Location

- **User Docs:** `loggator-web/src/content/docs/`
- **Code Comments:** Inline in source files
- **README:** `loggator/README.md`

### Writing Style

- **Clear and concise**
- **Examples for everything**
- **Use code blocks** with syntax highlighting
- **Add screenshots** for UI features
- **Link related pages**

## Community Guidelines

### Code of Conduct

Be respectful and constructive:

- 🤝 Be welcoming and inclusive
- 💬 Use clear communication
- 🎯 Stay on topic
- 🙏 Be patient with others
- ❤️ Show empathy

### Getting Help

Need help?

- 📖 Read the [documentation](/guides/quickstart/)
- 🐛 Check [existing issues](https://github.com/MBeggiato/loggator/issues)
- 💬 Ask in discussions
- 📧 Contact maintainers

## Recognition

Contributors are recognized in:

- GitHub contributors page
- Release notes (for significant contributions)
- Special thanks in documentation

## License

By contributing, you agree that your contributions will be licensed under the project's license (see LICENSE file).

## Questions?

Have questions about contributing?

- Open a [discussion](https://github.com/MBeggiato/loggator/discussions)
- Comment on an existing issue
- Reach out to maintainers

## Next Steps

Ready to contribute?

1. [Set up your development environment](/development/local-setup/)
2. [Understand the architecture](/development/architecture/)
3. [Pick an issue](https://github.com/MBeggiato/loggator/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
4. Start coding!

Thank you for contributing to Loggator! 🎉
