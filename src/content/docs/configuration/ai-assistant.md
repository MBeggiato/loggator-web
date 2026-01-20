---
title: AI Assistant Configuration
description: Set up and configure the AI-powered log analysis assistant
---

The AI Assistant is Loggator's most powerful feature, enabling natural language queries and automated log analysis.

## Overview

The AI Assistant can:

- Search logs using natural language
- Analyze container health
- Explain errors and suggest solutions
- Filter logs by time, container, or stream
- Aggregate and summarize log patterns

## Setup

### 1. Get an OpenRouter API Key

OpenRouter provides access to multiple AI models through a single API:

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for a free account
3. Go to [Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy the key (starts with `sk-or-v1-`)

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
AI_MODEL=xiaomi/mimo-v2-flash:free
SITE_URL=http://localhost:3000
```

### 3. Restart Loggator

```bash
docker compose restart loggator
```

The AI chat will now be available in the UI!

## Model Selection

### Free Models

Perfect for getting started and most log analysis tasks:

#### xiaomi/mimo-v2-flash:free (Recommended)

- **Speed:** Very fast
- **Quality:** Good for log analysis
- **Best for:** Quick queries, error detection
- **Rate Limits:** Generous free tier

```yaml
AI_MODEL: xiaomi/mimo-v2-flash:free
```

#### google/gemini-2.0-flash-thinking-exp:free

- **Speed:** Fast
- **Quality:** Excellent reasoning
- **Best for:** Complex analysis, troubleshooting
- **Rate Limits:** Moderate

```yaml
AI_MODEL: google/gemini-2.0-flash-thinking-exp:free
```

#### meta-llama/llama-3.2-3b-instruct:free

- **Speed:** Very fast
- **Quality:** Good for simple queries
- **Best for:** Basic log search
- **Rate Limits:** High

```yaml
AI_MODEL: meta-llama/llama-3.2-3b-instruct:free
```

### Paid Models

For production use with high volumes:

#### anthropic/claude-3.5-sonnet

- **Speed:** Moderate
- **Quality:** Excellent
- **Best for:** Complex analysis, detailed explanations
- **Cost:** ~$3 per 1M input tokens

```yaml
AI_MODEL: anthropic/claude-3.5-sonnet
```

#### openai/gpt-4-turbo

- **Speed:** Moderate
- **Quality:** Very good
- **Best for:** General purpose
- **Cost:** ~$10 per 1M input tokens

```yaml
AI_MODEL: openai/gpt-4-turbo
```

#### google/gemini-pro-1.5

- **Speed:** Fast
- **Quality:** Good
- **Best for:** High volume, cost-effective
- **Cost:** ~$3.50 per 1M input tokens

```yaml
AI_MODEL: google/gemini-pro-1.5
```

:::tip[Recommendation]
Start with **xiaomi/mimo-v2-flash:free**. It's fast, free, and works great for log analysis. Upgrade to paid models only if you need:

- Higher rate limits
- Better reasoning for complex issues
- More detailed explanations
  :::

## Available Tools

The AI assistant has access to these tools:

### search_logs

Search container logs with filters.

**Parameters:**

- `query` (required): Search terms
- `container` (optional): Filter by container name
- `stream` (optional): `stdout` or `stderr`
- `limit` (optional): Max results (default: 50, max: 100)

**Example Query:**

> "Show me all errors from nginx in the last hour"

### list_containers

List all monitored Docker containers.

**Parameters:**

- `all` (optional): Include stopped containers

**Example Query:**

> "What containers are you monitoring?"

### get_container_info

Get detailed information about a specific container.

**Parameters:**

- `containerName` (required): Container name

**Example Query:**

> "Tell me about the api container"

### analyze_container_health

Analyze container health based on recent logs.

**Parameters:**

- `containerName` (required): Container name
- `minutes` (optional): Time window (default: 60, max: 1440)

**Example Query:**

> "Is my web container healthy?"

## Example Queries

### Basic Search

```
Show me recent logs
Find errors
What's in the logs from nginx?
```

### Time-Based

```
Show errors from the last 2 hours
What happened in the last 30 minutes?
Any warnings today?
```

### Container-Specific

```
Show me logs from the api container
What errors does the database container have?
Is the web server working correctly?
```

### Stream Filtering

```
Show me stderr logs
Any errors in the error stream?
What's in stdout for the api container?
```

### Health Analysis

```
Is the api container healthy?
Analyze the web container
Check for problems in nginx
What's wrong with my database?
```

### Complex Queries

```
Show me all 500 errors from the api container in the last hour
Find connection timeout errors
What containers are logging errors?
Analyze patterns in the nginx access logs
```

## Chat Features

### Persistent History

Your chat history is saved automatically:

- Conversations persist across browser sessions
- Context is maintained for follow-up questions
- Clear history button available

### Markdown Formatting

Responses include:

- **Code blocks** with syntax highlighting
- **Tables** for structured data
- **Lists** for multiple items
- **Bold/Italic** for emphasis

### Tool Calling Visibility

Watch the AI work:

- See which tools are being called
- View tool parameters
- Inspect tool results

## Usage Limits

### Free Tier

OpenRouter free models typically include:

- Rate limits: 10-20 requests/minute
- Daily quotas: 100-200 requests/day
- Response size limits

### Paid Tier

Paid models offer:

- Higher rate limits
- No daily quotas
- Priority access
- Better performance

:::note
Limits vary by model. Check [OpenRouter](https://openrouter.ai/models) for current rates.
:::

## Cost Optimization

### 1. Use Free Models

Free models are sufficient for most log analysis:

```yaml
AI_MODEL: xiaomi/mimo-v2-flash:free
```

### 2. Be Specific

More specific queries = less token usage:

❌ "Tell me everything about my logs"
✅ "Show errors from nginx in the last hour"

### 3. Limit Results

Request only what you need:

❌ "Show me all logs" (thousands of results)
✅ "Show me the last 20 error logs"

### 4. Use Direct Search

For simple searches, use the search page instead of AI:

- Faster response
- No API costs
- Full Meilisearch power

## Security

### API Key Protection

- Never commit keys to version control
- Use `.env` files (add to `.gitignore`)
- Rotate keys regularly
- Use separate keys per environment

### Data Privacy

Logs sent to OpenRouter:

- Are processed by the AI model
- May be used for model improvement (check provider policy)
- Should not contain sensitive data

:::caution
Avoid monitoring containers that log:

- API keys or passwords
- Personal information (PII)
- Financial data
- Health records

Or implement log redaction first.
:::

### Label-Based Access Control

The AI can only access containers with the monitoring label:

```yaml
DOCKER_LABEL_FILTER: loggator.enable=true
```

This prevents unauthorized access to sensitive containers.

## Troubleshooting

### "AI features disabled"

Check:

1. `OPENROUTER_API_KEY` is set
2. Key is valid and active
3. Loggator was restarted after adding the key

```bash
# Verify environment variable
docker exec loggator env | grep OPENROUTER_API_KEY

# Restart
docker compose restart loggator
```

### "Rate limit exceeded"

Solutions:

1. Wait for the limit to reset (usually 1 minute)
2. Upgrade to a paid model
3. Use direct search for simple queries

### Poor responses

Try:

1. Be more specific in your query
2. Try a different model
3. Check if logs are being indexed: `http://localhost:3000/search`

### Slow responses

Causes:

- Model is slow (try a "flash" variant)
- Large result sets (limit your query)
- High load on OpenRouter

Solutions:

```yaml
# Switch to a faster model
AI_MODEL: xiaomi/mimo-v2-flash:free  # Very fast

# Or
AI_MODEL: google/gemini-pro-1.5  # Fast paid option
```

## Advanced Configuration

### Custom System Prompt

The system prompt is defined in the source code. To customize:

1. Fork the repository
2. Edit `src/routes/api/chat/+server.ts`
3. Modify the `SYSTEM_MESSAGE` constant
4. Rebuild and deploy

### Multiple AI Models

Run multiple Loggator instances with different models:

```yaml
services:
  loggator-free:
    image: ghcr.io/mbeggiato/loggator:latest
    ports:
      - "3000:3000"
    environment:
      AI_MODEL: xiaomi/mimo-v2-flash:free

  loggator-premium:
    image: ghcr.io/mbeggiato/loggator:latest
    ports:
      - "3001:3000"
    environment:
      AI_MODEL: anthropic/claude-3.5-sonnet
```

### Monitoring API Usage

Check OpenRouter dashboard for:

- Request counts
- Token usage
- Costs (for paid models)
- Rate limit status

## Next Steps

- [Log Search](/features/log-search/) - Manual search without AI
- [API Reference](/api/chat/) - Integrate AI chat in your apps
- [Container Monitoring](/features/container-monitoring/) - Dashboard features
