---
title: Container Monitoring
description: Monitor Docker containers and their logs
---

Loggator automatically discovers and monitors Docker containers based on labels, providing real-time insights into their logs and health.

## How It Works

Loggator connects to the Docker socket and:

1. **Discovers** containers with the monitoring label
2. **Streams** logs in real-time (both stdout and stderr)
3. **Indexes** logs into Meilisearch
4. **Monitors** container lifecycle events

## Container Discovery

### Automatic Discovery

When Loggator starts:

- Scans all running containers
- Checks for the monitoring label
- Begins streaming logs immediately

### Dynamic Monitoring

Loggator listens for Docker events:

- **Container started:** Monitoring begins automatically
- **Container stopped:** Monitoring stops gracefully
- **Container recreated:** Reconnects to new instance

No manual configuration required!

### Label-Based Security

Only containers with the specified label are accessed:

```yaml
services:
  my-app:
    labels:
      - "loggator.enable=true" # This container will be monitored
```

This prevents:

- Unauthorized access to containers
- Accidental monitoring of sensitive services
- Resource waste on irrelevant logs

## Log Streaming

### Dual Streams

Loggator captures both output streams:

#### stdout (Standard Output)

- Normal application logs
- Info messages
- Debug output
- Access logs

#### stderr (Standard Error)

- Error messages
- Warnings
- Exceptions
- Stack traces

### Stream Processing

For each log line:

1. **Timestamp Extraction:** Parses Docker timestamps
2. **Stream Tagging:** Labels as stdout or stderr
3. **Metadata Addition:** Container name, ID, labels
4. **Batch Buffering:** Groups for efficient indexing
5. **Indexing:** Sends to Meilisearch

### Real-Time Performance

- **Latency:** 5-10 seconds from log to index
- **Throughput:** ~1000 logs/second
- **Batch Size:** 100 logs or 5-second timeout

## Container Information

For each monitored container, Loggator tracks:

### Basic Info

- **Name:** Container name (without leading `/`)
- **ID:** Full container ID
- **Short ID:** First 12 characters
- **Image:** Docker image and tag

### Status

- **State:** running, stopped, paused, restarting
- **Status:** Human-readable status message
- **Exit Code:** If stopped
- **Health:** Container health check status

### Timestamps

- **Created:** When container was created
- **Started:** When last started
- **Finished:** When stopped (if applicable)

### Network

- **Ports:** Port mappings
- **Networks:** Connected networks
- **IP Addresses:** Per network

### Resources

- **CPU:** Current CPU usage (if available)
- **Memory:** Current memory usage (if available)
- **Labels:** All Docker labels

## Container Lifecycle

### Starting a Container

```bash
docker run -d \
  --label loggator.enable=true \
  --name my-app \
  nginx:latest
```

Loggator:

1. Detects `start` event
2. Inspects container for label
3. Begins log streaming
4. Adds to monitored list

### Stopping a Container

```bash
docker stop my-app
```

Loggator:

1. Detects `stop` event
2. Closes log stream gracefully
3. Removes from active monitoring
4. Historical logs remain searchable

### Restarting a Container

```bash
docker restart my-app
```

Loggator:

1. Detects `stop` event → closes old stream
2. Detects `start` event → opens new stream
3. Continues logging seamlessly

### Removing a Container

```bash
docker rm my-app
```

Loggator:

1. Detects `destroy` event
2. Removes from monitoring
3. Logs remain in Meilisearch
4. Can still be searched by name

## Health Monitoring

### Container Health Checks

If your container has a health check:

```yaml
services:
  api:
    image: myapi:latest
    labels:
      - "loggator.enable=true"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Loggator shows health status:

- **healthy:** Green indicator
- **unhealthy:** Red indicator
- **starting:** Yellow indicator

### Log-Based Health Analysis

The AI assistant can analyze container health:

```
Query: "Is my api container healthy?"
```

Analyzes:

- Error rate in recent logs
- Warning patterns
- Critical messages
- Crash indicators

## Container List View

The container list shows:

### Visual Indicators

- **Running:** Green badge with "running" text
- **Stopped:** Red badge with "exited" text
- **Status:** Full Docker status string

### Sort Options

Sort containers by:

- Name (alphabetical)
- Status (running first)
- Created (newest first)
- Log count (highest first)

### Filter Options

Filter containers by:

- Status (running/stopped)
- Name (search)
- Image (specific image)
- Label (additional labels)

## API Access

Get container information programmatically:

### List All Containers

```bash
curl http://localhost:3000/api/containers
```

### Get Container Details

```bash
curl http://localhost:3000/api/containers/my-app
```

### Container Logs

```bash
curl "http://localhost:3000/api/logs/search?container=my-app&limit=100"
```

See [Containers API](/api/containers/) for full documentation.

## Best Practices

### 1. Label Consistently

Use the same label across environments:

```yaml
labels:
  - "loggator.enable=true"
```

### 2. Don't Monitor Everything

Skip containers with:

- High log volume (databases)
- Sensitive data (auth services)
- Temporary purpose (build containers)

### 3. Organize with Additional Labels

Use extra labels for organization:

```yaml
labels:
  - "loggator.enable=true"
  - "app=myapp"
  - "tier=backend"
  - "environment=production"
```

### 4. Monitor Container Health

Add health checks to your containers:

```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
  interval: 30s
```

### 5. Use Meaningful Names

Clear names help in logs:
❌ `container_1`, `app_web_1`
✅ `myapp-api`, `myapp-web`

## Troubleshooting

### Container not appearing

Check:

```bash
# Container is running
docker ps | grep my-app

# Has correct label
docker inspect my-app | grep loggator.enable

# Loggator can access Docker socket
docker logs loggator | grep "Docker"
```

### No logs from container

Verify:

```bash
# Container is producing logs
docker logs my-app

# Logs go to stdout/stderr (not files)
# Check application log configuration
```

### Container shows but no logs

Causes:

- Container hasn't logged yet
- Logs go to files instead of stdout/stderr
- Meilisearch indexing issue

Solutions:

1. Trigger some application activity
2. Configure app to log to stdout/stderr
3. Check Meilisearch: `curl http://localhost:7700/health`

### Duplicate logs

Cause: Container was restarted while Loggator was running

Solution: This is normal. Both old and new logs are preserved.

### High resource usage

If monitoring many containers:

1. **Filter selectively:** Only label necessary containers
2. **Increase resources:** More RAM for Loggator
3. **Batch settings:** Increase batch size (requires code change)
4. **Log retention:** Delete old logs periodically

## Advanced Configuration

### Custom Label Filter

Change the label Loggator looks for:

```yaml
loggator:
  environment:
    DOCKER_LABEL_FILTER: app.monitor=production
```

### Multiple Loggator Instances

Run separate instances for different purposes:

```yaml
services:
  loggator-prod:
    environment:
      DOCKER_LABEL_FILTER: environment=production
    ports:
      - "3000:3000"

  loggator-dev:
    environment:
      DOCKER_LABEL_FILTER: environment=development
    ports:
      - "3001:3000"
```

### Docker Socket Alternatives

For Docker Swarm or remote Docker:

```yaml
loggator:
  environment:
    DOCKER_HOST: tcp://remote-docker:2376
    DOCKER_CERT_PATH: /certs
    DOCKER_TLS_VERIFY: 1
  volumes:
    - ./certs:/certs:ro
```

## Security Considerations

### Read-Only Socket

Always use read-only mount:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
```

### Label-Based Access Control

Only labeled containers are accessed:

- Prevents information leakage
- Reduces attack surface
- Supports multi-tenant setups

### Sensitive Containers

Avoid labeling containers with:

- Secrets or credentials
- Personal information (PII)
- Financial data
- Authentication tokens

## Next Steps

- [Docker Setup](/configuration/docker/) - Configure container labels
- [Dashboard](/features/dashboard/) - Monitor containers visually
- [API Reference](/api/containers/) - Integrate container data
