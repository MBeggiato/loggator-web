---
title: Architecture
description: Technical architecture and design decisions
---

Understanding Loggator's architecture helps you navigate the codebase and make effective contributions.

## High-Level Overview

```
┌─────────────┐
│   Browser   │
│   (Svelte)  │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────────────────────────┐
│    SvelteKit Server            │
│  ┌──────────┐  ┌─────────────┐ │
│  │   API    │  │   Server    │ │
│  │  Routes  │  │  Services   │ │
│  └──────────┘  └─────────────┘ │
└───┬──────┬──────────┬───────────┘
    │      │          │
    │      │          ▼
    │      │   ┌──────────────┐
    │      │   │ OpenRouter   │
    │      │   │     AI       │
    │      │   └──────────────┘
    │      │
    │      ▼
    │  ┌──────────────────┐
    │  │  Meilisearch     │
    │  │  (Log Index)     │
    │  └──────────────────┘
    │
    ▼
┌──────────────────┐
│  Docker Socket   │
│  (Container Logs)│
└──────────────────┘
```

## Core Components

### 1. SvelteKit Application

**Location:** `src/routes/`

The web interface and API server built with SvelteKit 2 and Svelte 5.

**Key Features:**

- Server-side rendering (SSR)
- API routes alongside UI routes
- File-based routing
- Hot module replacement

**Structure:**

```
routes/
├── +layout.svelte           # Root layout
├── +page.svelte             # Dashboard
├── search/+page.svelte      # Search page
├── live/+page.svelte        # Live logs
├── containers/+page.svelte  # Container list
└── api/                     # API endpoints
    ├── chat/+server.ts
    ├── containers/+server.ts
    └── logs/+server.ts
```

### 2. Log Aggregator Service

**Location:** `src/lib/server/log-aggregator.ts`

Singleton service that coordinates log collection and indexing.

**Responsibilities:**

- Initialize and manage services
- Coordinate Docker collector and Meilisearch indexer
- Handle service lifecycle

**Code Example:**

```typescript
export class LogAggregatorService {
  private collector: DockerLogCollector | null = null;
  private indexer: MeilisearchIndexer | null = null;

  async start() {
    this.indexer = new MeilisearchIndexer(host, key);
    await this.indexer.initialize();

    this.collector = new DockerLogCollector(label, async (log) => {
      await this.indexer.indexLog(log);
    });

    await this.collector.start();
  }
}
```

### 3. Docker Log Collector

**Location:** `src/lib/server/docker-collector.ts`

Connects to Docker socket and streams container logs.

**Key Features:**

- Automatic container discovery
- Label-based filtering
- Event-driven monitoring
- Dual stream handling (stdout/stderr)
- Timestamp parsing

**Flow:**

```
Docker Socket → Container Discovery → Label Check → Log Streaming → Callback
```

**Code Example:**

```typescript
export class DockerLogCollector {
  async start() {
    await this.discoverContainers(); // Find existing
    this.listenToDockerEvents(); // Watch for new ones
  }

  private async monitorContainer(container) {
    const logStream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
      timestamps: true,
    });

    // Parse and emit logs
    logStream.on("data", (chunk) => {
      this.parseAndEmitLog(chunk);
    });
  }
}
```

### 4. Meilisearch Indexer

**Location:** `src/lib/server/meilisearch-indexer.ts`

Batches and indexes logs into Meilisearch.

**Key Features:**

- Batch buffering (100 logs or 5 seconds)
- Automatic ID generation
- Searchable field configuration
- Type conversion (Date → Unix timestamp)

**Batching Strategy:**

```
Log → Buffer → (100 logs OR 5s) → Flush to Meilisearch
```

**Code Example:**

```typescript
export class MeilisearchIndexer {
  private batchBuffer: IndexedLog[] = [];
  private batchSize = 100;
  private batchTimeout: NodeJS.Timeout | null = null;

  async indexLog(log: LogEntry) {
    this.batchBuffer.push(transformLog(log));

    if (this.batchBuffer.length >= this.batchSize) {
      await this.flushBatch();
    } else if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.flushBatch(), 5000);
    }
  }
}
```

### 5. AI Tools

**Location:** `src/lib/server/ai-tools.ts`

Tools that the AI assistant can call.

**Available Tools:**

- `search_logs` - Search with filters
- `list_containers` - List monitored containers
- `get_container_info` - Container details
- `analyze_container_health` - Health analysis

**Security:**

```typescript
function filterMonitoredContainers(containers) {
  return containers.filter((c) => hasRequiredLabel(c.Labels));
}
```

**Tool Definition:**

```typescript
export const tools = [
  {
    type: "function",
    function: {
      name: "search_logs",
      description: "Search logs with filters",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          container: { type: "string" },
          limit: { type: "number" },
        },
      },
    },
  },
];
```

### 6. UI Components

**Location:** `src/lib/components/`

Reusable Svelte components.

**Key Components:**

- `ChatWindow.svelte` - AI chat interface
- `ChatMessage.svelte` - Single chat message
- `LogViewer.svelte` - Log display
- `LogHistogram.svelte` - Chart.js histogram
- `ui/` - shadcn-svelte components

**Component Pattern:**

```svelte
<script lang="ts">
  // Props
  interface Props {
    data: LogEntry[];
  }

  let { data }: Props = $props();

  // Reactive state
  let filtered = $derived(data.filter(log => log.stream === 'stderr'));
</script>

<div>
  {#each filtered as log}
    <LogEntry {log} />
  {/each}
</div>
```

## Data Flow

### Log Collection Flow

```
1. Docker Container produces log
   ↓
2. DockerLogCollector receives log via stream
   ↓
3. Parse timestamp and message
   ↓
4. Call logCallback (defined in LogAggregatorService)
   ↓
5. MeilisearchIndexer.indexLog()
   ↓
6. Add to batch buffer
   ↓
7. (When buffer full or timeout) flushBatch()
   ↓
8. Meilisearch indexes logs
   ↓
9. Logs become searchable
```

### Search Flow

```
1. User enters query in UI
   ↓
2. Frontend calls /api/logs/search
   ↓
3. API route receives request
   ↓
4. Query Meilisearch with filters
   ↓
5. Transform results
   ↓
6. Return JSON response
   ↓
7. Frontend displays results
```

### AI Chat Flow

```
1. User sends message
   ↓
2. Frontend calls /api/chat with messages array
   ↓
3. Add system prompt
   ↓
4. Call OpenRouter API
   ↓
5. AI decides to call tools
   ↓
6. Execute tools (search_logs, etc.)
   ↓
7. Send tool results back to AI
   ↓
8. AI generates response
   ↓
9. Return formatted response to user
```

## Design Decisions

### Why SvelteKit?

- **SSR Support:** Better SEO and initial load
- **File-based Routing:** Intuitive structure
- **API Routes:** Backend + frontend in one project
- **Modern:** Svelte 5 with runes
- **Fast:** Excellent performance

### Why Meilisearch?

- **Fast:** Sub-50ms search times
- **Typo Tolerant:** Forgiving search
- **Easy:** Simple REST API
- **Lightweight:** Low resource usage
- **Real-time:** Instant indexing

### Why OpenRouter?

- **Multi-Model:** Access to many AI models
- **Free Tier:** Free models available
- **Unified API:** OpenAI-compatible
- **No Vendor Lock-in:** Easy to switch models

### Why Batch Indexing?

Individual log indexing would be slow:

- **Without batching:** 1000 API calls for 1000 logs
- **With batching:** 10 API calls for 1000 logs (100/batch)

Trade-off: 5-10 second delay vs. massive performance gain

### Why Label-Based Filtering?

Security and flexibility:

- **Security:** Only explicitly allowed containers
- **Flexibility:** Easy to add/remove monitoring
- **Multi-tenant:** Different labels per team/environment

## State Management

### Server-Side State

**Singleton Pattern:**

```typescript
let serviceInstance: LogAggregatorService | null = null;

export function getLogAggregatorService() {
  if (!serviceInstance) {
    serviceInstance = new LogAggregatorService();
  }
  return serviceInstance;
}
```

**Why:** Ensure only one log collector instance across all requests

### Client-Side State

**Svelte Runes (Svelte 5):**

```svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log('count changed:', count);
  });
</script>
```

**Benefits:**

- Explicit reactivity
- Better performance
- Easier to understand

## Performance Considerations

### Batch Processing

Logs are buffered and indexed in batches:

- Reduces API calls by 100x
- Improves indexing throughput
- Adds 0-5 second latency

### Docker Socket

Single persistent connection:

- No reconnection overhead
- Event-driven (push, not poll)
- Low CPU usage

### Meilisearch

Optimized for log search:

- In-memory indexes
- Fast prefix matching
- Efficient filtering

### Frontend

Modern optimizations:

- Component code splitting
- Lazy loading
- Minimal JavaScript bundle

## Security Architecture

### Input Validation

All API routes validate:

```typescript
if (!messages || !Array.isArray(messages)) {
  throw error(400, "Invalid request");
}

for (const msg of messages) {
  if (msg.content.length > 10000) {
    throw error(400, "Message too long");
  }
}
```

### Label-Based Access Control

```typescript
function hasRequiredLabel(labels: Record<string, string>) {
  const [key, value] = LABEL_FILTER.split("=");
  return labels[key] === value;
}

// Only return containers with label
const filtered = containers.filter((c) => hasRequiredLabel(c.Labels));
```

### Docker Socket

Read-only mount:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
```

### API Key Protection

Environment variables:

```typescript
const apiKey = env.OPENROUTER_API_KEY;
// Never exposed to client
```

## Testing Strategy

### Manual Testing

Primary testing approach:

1. Start dev environment
2. Test features in browser
3. Check logs for errors

### API Testing

Use curl/Postman:

```bash
curl "http://localhost:3000/api/logs/search?query=test"
```

### Future: Automated Tests

Planned:

- Unit tests (Vitest)
- Integration tests (Playwright)
- E2E tests (Playwright)

## Deployment Architecture

### Docker Compose

Standard deployment:

```yaml
services:
  meilisearch:
    # Search engine

  loggator:
    # Main application
    depends_on:
      - meilisearch
```

### Production Considerations

- **Reverse Proxy:** nginx/Traefik for HTTPS
- **Backup:** Meilisearch data volume
- **Monitoring:** Container health checks
- **Scaling:** Horizontal scaling possible

## Extension Points

### Adding New AI Tools

1. Define tool in `ai-tools.ts`:

```typescript
{
  type: 'function',
  function: {
    name: 'my_tool',
    description: 'Does something',
    parameters: { ... }
  }
}
```

2. Implement function:

```typescript
async function myTool(params) {
  // Implementation
  return { success: true, data: ... };
}
```

3. Add to executor:

```typescript
case 'my_tool':
  return await myTool(args);
```

### Adding New API Endpoints

1. Create route file:

```typescript
// src/routes/api/my-endpoint/+server.ts
export const GET: RequestHandler = async () => {
  return json({ data: ... });
};
```

### Adding New UI Pages

1. Create page file:

```svelte
<!-- src/routes/my-page/+page.svelte -->
<script lang="ts">
  // Page logic
</script>

<div>
  <!-- Page content -->
</div>
```

## Next Steps

- [Local Setup](/development/local-setup/) - Development environment
- [Contributing](/development/contributing/) - Contribution guidelines
- [API Reference](/api/overview/) - API documentation
