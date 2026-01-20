---
title: Quick Start
description: Get Loggator up and running in 5 minutes
---

Get Loggator running in just a few steps with Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- Internet connection for downloading images

## Step 1: Download Configuration

Download the example docker-compose file:

```bash
curl -O https://raw.githubusercontent.com/MBeggiato/loggator/main/docker-compose.example.yml
mv docker-compose.example.yml docker-compose.yml
```

## Step 2: Generate Meilisearch Key

Generate a secure master key for Meilisearch:

```bash
# Linux/Mac
openssl rand -base64 32

# Example output (use your own!):
# bLwLpwgIW6VQTBrt7ZhUw9MiJXYh8Vat7YVr4lU-5XA
```

:::caution
Never use the example key in production! Always generate your own secure key.
:::

## Step 3: Update docker-compose.yml

Open `docker-compose.yml` and replace `aSampleMasterKey1234567890abcdef` with your generated key in **both** places:

```yaml {5,12}
services:
  meilisearch:
    image: getmeili/meilisearch:v1.12
    environment:
      MEILI_MASTER_KEY: YOUR_GENERATED_KEY_HERE
    # ...

  loggator:
    image: ghcr.io/mbeggiato/loggator:latest
    environment:
      MEILISEARCH_HOST: http://meilisearch:7700
      MEILISEARCH_API_KEY: YOUR_GENERATED_KEY_HERE
```

:::tip[Important]
Both `MEILI_MASTER_KEY` and `MEILISEARCH_API_KEY` must be **identical**!
:::

## Step 4: Configure AI Chat (Optional)

To enable the AI assistant, get a free API key from [OpenRouter](https://openrouter.ai/keys) and create a `.env` file:

```bash
# .env
OPENROUTER_API_KEY=sk-or-v1-...  # Your OpenRouter API key
AI_MODEL=xiaomi/mimo-v2-flash:free
SITE_URL=http://localhost:3000
```

:::note
The AI assistant is optional. Loggator works fine without it, but you'll miss out on natural language queries and automated log analysis.
:::

## Step 5: Start Loggator

```bash
docker compose up -d
```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Step 6: Enable Container Monitoring

Add the `loggator.enable=true` label to any container you want to monitor:

```yaml
services:
  my-app:
    image: my-app:latest
    labels:
      - "loggator.enable=true"
```

Then restart the container:

```bash
docker compose restart my-app
```

## Verify Installation

1. Check that Loggator is running: `docker compose ps`
2. Open http://localhost:3000 in your browser
3. You should see the dashboard with container statistics
4. Try the AI chat by asking: _"What containers are you monitoring?"_

## Next Steps

- [Configure Environment Variables](/configuration/environment/) - Customize Loggator's behavior
- [AI Assistant Setup](/configuration/ai-assistant/) - Learn about AI models and features
- [API Reference](/api/overview/) - Integrate with your tools

## Troubleshooting

### Meilisearch connection failed

Make sure both keys match exactly in your `docker-compose.yml`:

- `MEILI_MASTER_KEY` (Meilisearch service)
- `MEILISEARCH_API_KEY` (Loggator service)

### No containers showing up

Verify your containers have the correct label:

```bash
docker inspect my-container | grep loggator.enable
```

### AI Chat not working

Check that your OpenRouter API key is valid:

```bash
# Test the API key
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer sk-or-v1-..."
```
