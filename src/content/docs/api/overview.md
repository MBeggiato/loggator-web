---
title: API Overview
description: RESTful API reference for Loggator
---

Loggator provides a comprehensive REST API for programmatic access to logs, containers, and AI chat functionality.

## Base URL

```
http://localhost:3000/api
```

For production, replace with your deployment URL.

## Authentication

Currently, Loggator does not require authentication for API access. If you need authentication:

1. Use a reverse proxy (nginx, Traefik)
2. Implement API keys at the proxy level
3. Or fork the project and add custom auth

## API Endpoints

### Health & Status

| Endpoint       | Method | Description           |
| -------------- | ------ | --------------------- |
| `/api/status`  | GET    | Service health check  |
| `/api/version` | GET    | Loggator version info |

### Containers

| Endpoint               | Method | Description                   |
| ---------------------- | ------ | ----------------------------- |
| `/api/containers`      | GET    | List all monitored containers |
| `/api/containers/[id]` | GET    | Get specific container info   |

### Logs

| Endpoint               | Method | Description                     |
| ---------------------- | ------ | ------------------------------- |
| `/api/logs/search`     | GET    | Search logs with filters        |
| `/api/logs/containers` | GET    | List containers with log counts |
| `/api/logs/histogram`  | GET    | Get log histogram data          |

### AI Chat

| Endpoint    | Method | Description            |
| ----------- | ------ | ---------------------- |
| `/api/chat` | POST   | Chat with AI assistant |

## Response Format

All API responses follow this structure:

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## HTTP Status Codes

| Code | Meaning               | Description        |
| ---- | --------------------- | ------------------ |
| 200  | OK                    | Request succeeded  |
| 400  | Bad Request           | Invalid parameters |
| 404  | Not Found             | Resource not found |
| 500  | Internal Server Error | Server error       |
| 503  | Service Unavailable   | Service not ready  |

## Rate Limiting

Currently, Loggator does not implement rate limiting. Consider:

- Using a reverse proxy for rate limiting
- Implementing caching for frequent queries
- Being respectful of server resources

## CORS

Loggator allows CORS from all origins by default. To restrict:

1. Use a reverse proxy
2. Configure CORS headers at proxy level
3. Or modify the SvelteKit configuration

## Pagination

Endpoints that return lists support pagination:

### Query Parameters

- `limit` - Number of results (default: 50, max: 100)
- `offset` - Skip N results (default: 0)

### Example

```bash
curl "http://localhost:3000/api/logs/search?query=error&limit=20&offset=40"
```

## Filtering

Many endpoints support filtering:

### Time Filters

- `fromTimestamp` - Unix timestamp (milliseconds)
- `toTimestamp` - Unix timestamp (milliseconds)

### Container Filters

- `container` - Container name or ID
- `containerId` - Exact container ID

### Stream Filters

- `stream` - `stdout` or `stderr`

## Examples

### Search for Errors

```bash
curl "http://localhost:3000/api/logs/search?query=error&limit=10"
```

### Get Container Info

```bash
curl "http://localhost:3000/api/containers"
```

### AI Chat Query

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Show me errors"}
    ]
  }'
```

## SDK & Libraries

Currently, no official SDKs exist. Use any HTTP client:

### JavaScript/TypeScript

```typescript
const response = await fetch(
  "http://localhost:3000/api/logs/search?query=error",
);
const data = await response.json();
```

### Python

```python
import requests

response = requests.get('http://localhost:3000/api/logs/search',
    params={'query': 'error'})
data = response.json()
```

### Go

```go
resp, err := http.Get("http://localhost:3000/api/logs/search?query=error")
```

### cURL

```bash
curl "http://localhost:3000/api/logs/search?query=error"
```

## Webhooks

Loggator does not currently support webhooks. For notifications:

1. Poll the API periodically
2. Use external monitoring tools
3. Or implement custom webhooks via fork

## API Versioning

Current API version: **v1** (implicit, no version in URL)

Future versions will use URL versioning:

- `/api/v1/...` - Version 1
- `/api/v2/...` - Version 2

## Error Handling

### Common Errors

#### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid query parameter",
  "code": "INVALID_PARAMETER"
}
```

**Solution:** Check parameter format and values

#### 404 Not Found

```json
{
  "success": false,
  "error": "Container not found",
  "code": "NOT_FOUND"
}
```

**Solution:** Verify resource exists

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

**Solution:** Check Loggator logs, report bug if persistent

## Performance Considerations

### Caching

Implement client-side caching for:

- Container lists (change infrequently)
- Version info (static)
- Historical logs (immutable)

### Query Optimization

For better performance:

1. **Use filters:** Reduce result set size
2. **Limit results:** Request only what you need
3. **Use time ranges:** Narrow search scope
4. **Cache responses:** Avoid redundant requests

### Batch Requests

For multiple queries, consider:

- Combining filters in single request
- Using AI chat to aggregate multiple queries
- Implementing request queuing

## Security Best Practices

### 1. Use HTTPS

In production:

```
https://your-domain.com/api/...
```

Use a reverse proxy (nginx, Traefik) for SSL termination.

### 2. Implement Authentication

Add auth at reverse proxy:

```nginx
location /api/ {
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://loggator:3000;
}
```

### 3. Validate Inputs

Always validate:

- Query parameters
- Request body
- File uploads (if any)

### 4. Rate Limiting

Protect against abuse:

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20;
    proxy_pass http://loggator:3000;
}
```

### 5. Monitor Access

Log API requests:

- Track usage patterns
- Detect anomalies
- Identify abuse

## API Testing

### curl Examples

See individual endpoint pages for detailed examples.

### Postman Collection

Create a Postman collection:

```json
{
  "info": {
    "name": "Loggator API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Search Logs",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/logs/search?query=error"
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```

## Next Steps

- [Chat API](/api/chat/) - AI assistant integration
- [Logs API](/api/logs/) - Search and filter logs
- [Containers API](/api/containers/) - Container management
