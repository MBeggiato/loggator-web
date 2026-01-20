---
title: Local Development Setup
description: Set up Loggator for local development
---

Learn how to set up Loggator for local development with hot-reload and debugging.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** or **Bun** (recommended)
- **Docker** and **Docker Compose**
- **Git**
- A code editor (VS Code recommended)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/MBeggiato/loggator.git
cd loggator
```

### 2. Install Dependencies

```bash
# Using bun (recommended)
bun install

# Or using npm
npm install
```

### 3. Start Development Services

Start Meilisearch and a test logger container:

```bash
bun run dev:services
```

This starts:

- **Meilisearch** on `localhost:7700`
- **Test Logger** (generates sample logs)

### 4. Start the Dev Server

In a new terminal:

```bash
bun run dev
```

The application will be available at: **http://localhost:5173**

## Development Environment

### What's Running

When you run `bun run dev:services`:

| Service     | Port | Purpose               |
| ----------- | ---- | --------------------- |
| Meilisearch | 7700 | Search engine         |
| Test Logger | -    | Generates sample logs |

When you run `bun run dev`:

| Service              | Port | Purpose                |
| -------------------- | ---- | ---------------------- |
| SvelteKit Dev Server | 5173 | Web UI with hot-reload |

### Environment Configuration

Development uses `.env.development`:

```bash
# .env.development
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=aSampleMasterKey1234567890abcdef
DOCKER_LABEL_FILTER=loggator.enable=true
PORT=5173

# Optional - AI Features
OPENROUTER_API_KEY=sk-or-v1-your-key-here
AI_MODEL=xiaomi/mimo-v2-flash:free
SITE_URL=http://localhost:5173
```

## Development Workflow

### Hot Reload

SvelteKit provides hot module replacement (HMR):

- Edit a `.svelte` file → Browser updates instantly
- Edit a `.ts` file → Server restarts automatically
- Edit a `.css` file → Styles update without reload

### File Structure

```
loggator/
├── src/
│   ├── routes/              # SvelteKit routes
│   │   ├── +page.svelte    # Dashboard
│   │   ├── +layout.svelte  # Layout
│   │   └── api/            # API endpoints
│   │       ├── chat/
│   │       ├── containers/
│   │       └── logs/
│   ├── lib/
│   │   ├── components/     # Svelte components
│   │   ├── server/         # Server-side code
│   │   │   ├── ai-tools.ts
│   │   │   ├── docker-collector.ts
│   │   │   ├── log-aggregator.ts
│   │   │   └── meilisearch-indexer.ts
│   │   └── i18n/           # Translations
│   └── app.css             # Global styles
├── static/                  # Static assets
├── package.json
├── svelte.config.js
├── vite.config.ts
└── tsconfig.json
```

### Development Commands

```bash
# Start dev services (Meilisearch + Test Logger)
bun run dev:services

# Start dev server
bun run dev

# Both in one command
bun run dev:full

# Stop dev services
bun run dev:stop

# Type checking
bun run check

# Linting
bun run lint

# Formatting
bun run format

# Build for production
bun run build

# Preview production build
bun run preview
```

## Debugging

### Server-Side Debugging

Add `console.log` statements in server code:

```typescript
// src/lib/server/log-aggregator.ts
console.log("Indexing log:", log);
```

Logs appear in the terminal running `bun run dev`.

### Client-Side Debugging

Use browser DevTools:

```svelte
<script>
  console.log('Component mounted:', data);
</script>
```

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Dev Server",
      "runtimeExecutable": "bun",
      "runtimeArgs": ["run", "dev"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Docker Logs

Check Meilisearch logs:

```bash
docker logs meilisearch-dev
```

Check test logger:

```bash
docker logs test-logger
```

## Testing

### Manual Testing

1. Start dev environment
2. Open http://localhost:5173
3. Test features manually

### API Testing

Use curl or Postman:

```bash
# Test log search
curl "http://localhost:5173/api/logs/search?query=test"

# Test AI chat
curl -X POST http://localhost:5173/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'
```

### Test Containers

Label test containers:

```bash
docker run -d \
  --label loggator.enable=true \
  --name test-app \
  nginx:latest
```

## Common Issues

### Port Already in Use

If port 5173 is occupied:

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or change the port in package.json
"dev": "vite dev --port 3000"
```

### Meilisearch Connection Failed

Check Meilisearch is running:

```bash
docker ps | grep meilisearch-dev
curl http://localhost:7700/health
```

Restart if needed:

```bash
bun run dev:stop
bun run dev:services
```

### No Logs Appearing

1. Check test logger is running:

   ```bash
   docker ps | grep test-logger
   ```

2. Verify label:

   ```bash
   docker inspect test-logger | grep loggator.enable
   ```

3. Check Loggator server logs in terminal

### Type Errors

Run type checking:

```bash
bun run check
```

Fix errors in TypeScript files.

## Best Practices

### 1. Use TypeScript

Always type your code:

```typescript
// ✅ Good
interface LogEntry {
  message: string;
  timestamp: number;
}

function processLog(log: LogEntry): void {
  // ...
}

// ❌ Bad
function processLog(log: any): void {
  // ...
}
```

### 2. Follow Code Style

Run formatter before committing:

```bash
bun run format
```

### 3. Test Changes

Test your changes:

- Manually in the browser
- With API calls
- With different scenarios

### 4. Check for Errors

Before committing:

```bash
bun run check  # Type checking
bun run lint   # Linting
bun run format # Formatting
```

### 5. Use Git Branches

Create feature branches:

```bash
git checkout -b feature/my-feature
# Make changes
git commit -m "Add my feature"
git push origin feature/my-feature
```

## Hot Reload Tips

### Client-Side Changes

- **Components:** Update instantly
- **Routes:** Update instantly
- **Styles:** Update instantly

### Server-Side Changes

- **API routes:** Server restarts (2-3 seconds)
- **Server utilities:** Server restarts
- **Environment vars:** Manual restart required

### Forcing Reload

If hot reload doesn't work:

```bash
# Ctrl+C to stop
# Then restart
bun run dev
```

## Environment Variables

### Local Development

Create `.env.development.local` (gitignored):

```bash
# Override for local dev
OPENROUTER_API_KEY=your-local-key
AI_MODEL=your-preferred-model
```

### Production Testing

Test production build locally:

```bash
# Build
bun run build

# Preview
bun run preview

# Open http://localhost:4173
```

## Docker Development

### Testing in Docker

Build and run in Docker:

```bash
# Build image
docker build -t loggator:dev .

# Run with docker-compose
docker compose -f docker-compose.dev.yml up
```

### Volume Mounts

For live code changes in Docker:

```yaml
services:
  loggator:
    volumes:
      - ./src:/app/src
      - ./package.json:/app/package.json
```

## Performance Optimization

### Development Performance

For faster development:

1. **Use Bun:** Faster than npm
2. **Use SSD:** Faster file operations
3. **Close unused tabs:** Less memory usage
4. **Disable source maps:** In vite.config.ts (if needed)

### Build Performance

For faster builds:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    minify: "esbuild", // Faster than terser
    sourcemap: false, // Skip source maps
  },
});
```

## Next Steps

- [Architecture](/development/architecture/) - Understand the codebase
- [Contributing](/development/contributing/) - Contribution guidelines
- [API Reference](/api/overview/) - API documentation
