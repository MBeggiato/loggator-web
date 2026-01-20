---
title: Installation
description: Detailed installation guide for Loggator
---

This guide covers different installation methods for Loggator.

## Docker Compose (Recommended)

The easiest way to run Loggator is with Docker Compose.

### Complete docker-compose.yml

```yaml
services:
  meilisearch:
    image: getmeili/meilisearch:v1.12
    container_name: meilisearch
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY}
      MEILI_ENV: production
    volumes:
      - ./meilisearch-data:/meili_data
    networks:
      - loggator-network
    restart: unless-stopped

  loggator:
    image: ghcr.io/mbeggiato/loggator:latest
    container_name: loggator
    ports:
      - "3000:3000"
    environment:
      MEILISEARCH_HOST: http://meilisearch:7700
      MEILISEARCH_API_KEY: ${MEILI_MASTER_KEY}
      DOCKER_LABEL_FILTER: loggator.enable=true
      PORT: 3000
      # AI Configuration (optional)
      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
      AI_MODEL: xiaomi/mimo-v2-flash:free
      SITE_URL: ${SITE_URL:-http://localhost:3000}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on:
      - meilisearch
    networks:
      - loggator-network
    restart: unless-stopped
    labels:
      - "loggator.enable=true"

networks:
  loggator-network:
    driver: bridge
```

### Environment File (.env)

Create a `.env` file in the same directory:

```bash
# Required
MEILI_MASTER_KEY=your-generated-secure-key-here

# Optional - AI Assistant
OPENROUTER_API_KEY=sk-or-v1-your-key-here
SITE_URL=http://localhost:3000
```

### Start Services

```bash
docker compose up -d
```

## Standalone Docker

If you prefer to run containers individually:

### 1. Start Meilisearch

```bash
docker run -d \
  --name meilisearch \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY=your-secure-key \
  -v $(pwd)/meilisearch-data:/meili_data \
  getmeili/meilisearch:v1.12
```

### 2. Start Loggator

```bash
docker run -d \
  --name loggator \
  -p 3000:3000 \
  -e MEILISEARCH_HOST=http://meilisearch:7700 \
  -e MEILISEARCH_API_KEY=your-secure-key \
  -e OPENROUTER_API_KEY=your-openrouter-key \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --link meilisearch \
  ghcr.io/mbeggiato/loggator:latest
```

## Building from Source

For development or custom builds:

### Prerequisites

- Node.js 20+ or Bun
- Docker (for running Meilisearch)

### Clone Repository

```bash
git clone https://github.com/MBeggiato/loggator.git
cd loggator
```

### Install Dependencies

```bash
# Using npm
npm install

# Or using bun (recommended)
bun install
```

### Start Development Services

```bash
# Start Meilisearch and test logger
bun run dev:services

# In another terminal, start dev server
bun run dev
```

The application will be available at http://localhost:5173

### Production Build

```bash
# Build the application
bun run build

# Preview production build
bun run preview
```

## System Requirements

### Minimum Requirements

- **CPU:** 1 core
- **RAM:** 512 MB (without logs), 1 GB+ recommended
- **Disk:** 1 GB + space for logs
- **Docker:** 20.10+
- **Docker Compose:** 2.0+

### Recommended Requirements

- **CPU:** 2+ cores
- **RAM:** 2 GB+
- **Disk:** SSD with 10+ GB
- **Network:** Stable connection for AI features

## Port Configuration

By default, Loggator uses these ports:

- `3000` - Loggator Web UI
- `7700` - Meilisearch (internal, can be exposed)

To change ports, update the `docker-compose.yml`:

```yaml
services:
  loggator:
    ports:
      - "8080:3000" # Access on port 8080
```

## Volume Mounts

### Meilisearch Data

Persistent storage for indexed logs:

```yaml
volumes:
  - ./meilisearch-data:/meili_data
```

### Docker Socket

Required for reading container logs:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
```

:::caution[Security Note]
The Docker socket mount gives Loggator read access to Docker. This is required for log collection but should be used with caution. The `:ro` (read-only) flag limits access.
:::

## Network Configuration

Loggator and Meilisearch should be on the same network:

```yaml
networks:
  loggator-network:
    driver: bridge
```

## Health Checks

Verify services are running:

```bash
# Check Loggator
curl http://localhost:3000/api/status

# Check Meilisearch
curl http://localhost:7700/health
```

## Upgrading

To upgrade to the latest version:

```bash
# Pull latest images
docker compose pull

# Restart services
docker compose up -d
```

:::tip
Loggator will notify you when updates are available through the UI.
:::

## Uninstalling

To completely remove Loggator:

```bash
# Stop and remove containers
docker compose down

# Remove volumes (deletes all logs!)
docker compose down -v

# Remove images
docker rmi ghcr.io/mbeggiato/loggator:latest
docker rmi getmeili/meilisearch:v1.12
```

## Next Steps

- [Environment Variables](/configuration/environment/) - Configure Loggator
- [Docker Setup](/configuration/docker/) - Label your containers
- [AI Assistant](/configuration/ai-assistant/) - Set up the AI chat
