---
title: Docker Setup
description: Configure Docker containers for log monitoring
---

Learn how to configure your Docker containers to work with Loggator's label-based filtering system.

## Label-Based Monitoring

Loggator uses Docker labels to determine which containers to monitor. This provides:

- **Security:** Only explicitly labeled containers are accessed
- **Flexibility:** Add/remove monitoring without reconfiguring Loggator
- **Simplicity:** One label per container

## Adding the Label

### Docker Compose

Add the label to your service definition:

```yaml
services:
  my-app:
    image: nginx:latest
    labels:
      - "loggator.enable=true"
    # ... rest of your config
```

### Docker Run

Use the `--label` flag:

```bash
docker run -d \
  --label loggator.enable=true \
  --name my-app \
  nginx:latest
```

### Existing Containers

For running containers, you need to recreate them:

```bash
# Stop the container
docker stop my-app

# Remove the container (data in volumes is preserved)
docker rm my-app

# Start with the label
docker run -d \
  --label loggator.enable=true \
  --name my-app \
  nginx:latest
```

:::tip
With Docker Compose, just add the label and run `docker compose up -d`. Compose will recreate the container automatically.
:::

## Custom Labels

You can configure Loggator to use a different label:

```yaml
# docker-compose.yml for Loggator
services:
  loggator:
    environment:
      DOCKER_LABEL_FILTER: app.monitor=true
```

Then label your containers accordingly:

```yaml
services:
  my-app:
    labels:
      - "app.monitor=true"
```

## Multi-Environment Setup

Use environment-specific labels for better control:

### Production Containers

```yaml
services:
  web:
    labels:
      - "loggator.enable=true"
      - "environment=production"
```

### Development Containers

```yaml
services:
  web:
    labels:
      - "loggator.enable=true"
      - "environment=development"
```

### Environment-Specific Loggator

Run separate Loggator instances:

```yaml
# Production Loggator
services:
  loggator-prod:
    image: ghcr.io/mbeggiato/loggator:latest
    environment:
      DOCKER_LABEL_FILTER: environment=production

  # Development Loggator
  loggator-dev:
    image: ghcr.io/mbeggiato/loggator:latest
    ports:
      - "3001:3000"
    environment:
      DOCKER_LABEL_FILTER: environment=development
```

## Complete Example

Here's a full example with multiple services:

```yaml
services:
  # Your application
  web:
    image: nginx:latest
    labels:
      - "loggator.enable=true"
    ports:
      - "80:80"

  # Your API
  api:
    image: node:20
    labels:
      - "loggator.enable=true"
    command: node server.js

  # Database (not monitored)
  database:
    image: postgres:16
    # No label - logs won't be collected

  # Meilisearch
  meilisearch:
    image: getmeili/meilisearch:v1.12
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY}
    volumes:
      - ./meilisearch-data:/meili_data
    networks:
      - loggator-network

  # Loggator
  loggator:
    image: ghcr.io/mbeggiato/loggator:latest
    ports:
      - "3000:3000"
    environment:
      MEILISEARCH_HOST: http://meilisearch:7700
      MEILISEARCH_API_KEY: ${MEILI_MASTER_KEY}
      DOCKER_LABEL_FILTER: loggator.enable=true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on:
      - meilisearch
    networks:
      - loggator-network
    labels:
      - "loggator.enable=true" # Monitor Loggator itself

networks:
  loggator-network:
    driver: bridge
```

## Log Streams

Docker provides two output streams:

- **stdout:** Standard output (normal logs)
- **stderr:** Error output (error logs)

Loggator captures both and tags them appropriately. You can filter by stream in the UI and AI queries.

### Application Configuration

Ensure your application logs to stdout/stderr:

**Node.js:**

```javascript
console.log("Info message"); // stdout
console.error("Error message"); // stderr
```

**Python:**

```python
print('Info message')           # stdout
print('Error message', file=sys.stderr)  # stderr
```

**Go:**

```go
fmt.Println("Info message")     // stdout
fmt.Fprintln(os.Stderr, "Error message")  // stderr
```

## Verifying Labels

Check if a container has the correct label:

```bash
# Inspect container labels
docker inspect my-app | grep -A 5 Labels

# Specific label check
docker inspect my-app --format '{{.Config.Labels}}'

# Filter for Loggator label
docker inspect my-app | grep loggator.enable
```

## Dynamic Container Discovery

Loggator automatically discovers:

- **New containers:** Monitoring starts immediately when a labeled container starts
- **Stopped containers:** Monitoring stops when containers stop
- **Recreated containers:** Automatically reconnects to logs after restart

No manual configuration needed!

## Best Practices

### 1. Label Consistently

Use the same label across all environments:

```yaml
labels:
  - "loggator.enable=true"
```

### 2. Don't Monitor Everything

Avoid monitoring:

- Databases (high volume, sensitive data)
- Message queues (noisy logs)
- Build containers (temporary)

### 3. Group Related Services

Use additional labels for organization:

```yaml
labels:
  - "loggator.enable=true"
  - "app=myapp"
  - "tier=backend"
```

### 4. Document Your Labels

Add comments in your compose files:

```yaml
services:
  web:
    labels:
      # Enable log collection for Loggator
      - "loggator.enable=true"
```

### 5. Test Before Production

Verify log collection works:

```bash
# Check logs are being collected
curl http://localhost:3000/api/logs/search?query=test

# View in dashboard
open http://localhost:3000
```

## Troubleshooting

### Container not showing up

1. **Check label:**

   ```bash
   docker inspect my-app | grep loggator.enable
   ```

2. **Verify container is running:**

   ```bash
   docker ps | grep my-app
   ```

3. **Check Loggator logs:**

   ```bash
   docker logs loggator
   ```

4. **Restart Loggator:**
   ```bash
   docker compose restart loggator
   ```

### No logs appearing

1. **Check if container is producing logs:**

   ```bash
   docker logs my-app
   ```

2. **Verify Meilisearch connection:**

   ```bash
   docker logs loggator | grep -i meilisearch
   ```

3. **Check log indexing:**
   ```bash
   curl http://localhost:7700/indexes/logs/stats \
     -H "Authorization: Bearer $MEILISEARCH_API_KEY"
   ```

### Logs delayed

- Loggator batches logs for performance (100 logs or 5 seconds)
- Check Meilisearch indexing performance
- Ensure sufficient resources (CPU/RAM)

## Security Considerations

### Docker Socket Access

Loggator needs read access to the Docker socket:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
```

The `:ro` (read-only) flag is **crucial** for security.

### Label-Based Isolation

Labels provide security by:

- Preventing access to unlabeled containers
- Allowing fine-grained control
- Supporting multi-tenant setups

### Sensitive Data

Be cautious monitoring containers that log:

- Passwords or API keys
- Personal information (PII)
- Financial data

Consider using log redaction or filtering at the application level.

## Next Steps

- [Environment Variables](/configuration/environment/) - Configure Loggator behavior
- [AI Assistant](/configuration/ai-assistant/) - Set up AI-powered log analysis
- [Container Monitoring](/features/container-monitoring/) - Learn about the dashboard
