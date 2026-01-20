---
title: Environment Variables
description: Complete reference for Loggator environment variables
---

Configure Loggator using environment variables in your `docker-compose.yml` or `.env` file.

## Required Variables

### MEILISEARCH_HOST

The URL where Meilisearch is accessible.

```yaml
MEILISEARCH_HOST: http://meilisearch:7700
```

- **Default:** `http://meilisearch:7700`
- **Format:** `http://host:port` or `https://host:port`
- **Example:** `http://localhost:7700` (for development)

### MEILISEARCH_API_KEY

The master key for authenticating with Meilisearch.

```yaml
MEILISEARCH_API_KEY: your-secure-key-here
```

- **Default:** None (required)
- **Format:** Base64 string
- **Security:** Must match `MEILI_MASTER_KEY` in Meilisearch container
- **Generate:** `openssl rand -base64 32`

:::danger[Security]
Never commit API keys to version control. Always use `.env` files or secrets management.
:::

## Container Filtering

### DOCKER_LABEL_FILTER

Define which containers Loggator should monitor.

```yaml
DOCKER_LABEL_FILTER: loggator.enable=true
```

- **Default:** `loggator.enable=true`
- **Format:** `key=value`
- **Examples:**
  - `app.monitor=true` - Custom label
  - `environment=production` - Filter by environment

Only containers with this exact label will be monitored.

## Web Server

### PORT

The port on which Loggator's web interface runs.

```yaml
PORT: 3000
```

- **Default:** `3000`
- **Format:** Integer (1-65535)
- **Note:** This is the internal port. Map it differently in Docker:
  ```yaml
  ports:
    - "8080:3000" # Access on port 8080
  ```

## AI Assistant Configuration

All AI variables are optional. Without them, Loggator works as a log viewer without AI features.

### OPENROUTER_API_KEY

Your OpenRouter API key for AI-powered chat.

```yaml
OPENROUTER_API_KEY: sk-or-v1-...
```

- **Default:** None (AI disabled)
- **Format:** String starting with `sk-or-v1-`
- **Get Key:** [OpenRouter Dashboard](https://openrouter.ai/keys)
- **Free Tier:** Available with rate limits

### AI_MODEL

The OpenRouter model to use for chat.

```yaml
AI_MODEL: xiaomi/mimo-v2-flash:free
```

- **Default:** `xiaomi/mimo-v2-flash:free`
- **Format:** `provider/model-name` or `provider/model-name:variant`

**Recommended Free Models:**

- `xiaomi/mimo-v2-flash:free` - Fast, good for logs
- `google/gemini-2.0-flash-thinking-exp:free` - Reasoning model
- `meta-llama/llama-3.2-3b-instruct:free` - Lightweight

**Paid Models (Better Quality):**

- `anthropic/claude-3.5-sonnet` - Best quality
- `openai/gpt-4-turbo` - Very capable
- `google/gemini-pro-1.5` - Fast and good

:::tip
Free models work great for log analysis! Paid models offer better reasoning but aren't necessary.
:::

### SITE_URL

Your site's URL for OpenRouter attribution.

```yaml
SITE_URL: http://localhost:3000
```

- **Default:** `http://localhost:3000`
- **Format:** Full URL with protocol
- **Purpose:** OpenRouter uses this for usage tracking
- **Production Example:** `https://logs.mycompany.com`

## Development Variables

### NODE_ENV

Set the application environment.

```yaml
NODE_ENV: production
```

- **Default:** `production`
- **Options:** `development`, `production`
- **Effect:** Enables/disables debug logging

## Meilisearch Configuration

These are set on the Meilisearch container, not Loggator.

### MEILI_MASTER_KEY

Master key for Meilisearch authentication.

```yaml
# In meilisearch service
MEILI_MASTER_KEY: your-secure-key-here
```

- **Must Match:** `MEILISEARCH_API_KEY` in Loggator
- **Generate:** `openssl rand -base64 32`
- **Min Length:** 16 characters

### MEILI_ENV

Meilisearch environment mode.

```yaml
MEILI_ENV: production
```

- **Default:** `development`
- **Options:** `development`, `production`
- **Production:** Disables development features, improves performance

## Complete Example

### .env File

```bash
# Required
MEILI_MASTER_KEY=bLwLpwgIW6VQTBrt7ZhUw9MiJXYh8Vat7YVr4lU-5XA

# Optional - AI Features
OPENROUTER_API_KEY=sk-or-v1-1234567890abcdef
AI_MODEL=xiaomi/mimo-v2-flash:free
SITE_URL=http://localhost:3000

# Optional - Customization
DOCKER_LABEL_FILTER=loggator.enable=true
PORT=3000
NODE_ENV=production
```

### docker-compose.yml

```yaml
services:
  meilisearch:
    image: getmeili/meilisearch:v1.12
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY}
      MEILI_ENV: production

  loggator:
    image: ghcr.io/mbeggiato/loggator:latest
    environment:
      MEILISEARCH_HOST: http://meilisearch:7700
      MEILISEARCH_API_KEY: ${MEILI_MASTER_KEY}
      DOCKER_LABEL_FILTER: ${DOCKER_LABEL_FILTER:-loggator.enable=true}
      PORT: ${PORT:-3000}
      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
      AI_MODEL: ${AI_MODEL:-xiaomi/mimo-v2-flash:free}
      SITE_URL: ${SITE_URL:-http://localhost:3000}
      NODE_ENV: ${NODE_ENV:-production}
```

## Validation

Check if variables are loaded correctly:

```bash
# Inside Loggator container
docker exec loggator env | grep MEILISEARCH

# Test Meilisearch connection
docker exec loggator curl http://meilisearch:7700/health
```

## Security Best Practices

1. **Never hardcode secrets** in `docker-compose.yml`
2. **Use `.env` files** and add them to `.gitignore`
3. **Rotate keys regularly** (every 90 days)
4. **Use strong keys** (minimum 32 characters)
5. **Limit container access** with the label filter
6. **Use read-only Docker socket** (`:ro` flag)

## Troubleshooting

### Connection refused to Meilisearch

Check that:

1. `MEILISEARCH_HOST` points to the correct container name
2. Both containers are on the same Docker network
3. Meilisearch is running: `docker compose ps meilisearch`

### Authentication failed

Verify:

1. `MEILI_MASTER_KEY` and `MEILISEARCH_API_KEY` are identical
2. Keys are at least 16 characters long
3. No extra spaces in environment values

### AI not working

Confirm:

1. `OPENROUTER_API_KEY` is valid
2. API key has credits/quota available
3. Model name is correct and available

Test the API key:

```bash
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

## Next Steps

- [Docker Setup](/configuration/docker/) - Configure container monitoring
- [AI Assistant](/configuration/ai-assistant/) - Choose the best AI model
- [API Reference](/api/overview/) - Use Loggator programmatically
