---
title: Logs API
description: Search and retrieve container logs
---

The Logs API provides endpoints for searching, filtering, and retrieving container logs from Meilisearch.

## Search Logs

Search logs with full-text search and filters.

### Endpoint

```
GET /api/logs/search
```

### Query Parameters

| Parameter       | Type   | Required | Description                         |
| --------------- | ------ | -------- | ----------------------------------- |
| `query`         | String | No       | Full-text search term               |
| `container`     | String | No       | Container name filter               |
| `stream`        | String | No       | `stdout` or `stderr`                |
| `fromTimestamp` | Number | No       | Start time (Unix ms)                |
| `toTimestamp`   | Number | No       | End time (Unix ms)                  |
| `limit`         | Number | No       | Max results (default: 50, max: 100) |
| `offset`        | Number | No       | Skip N results (default: 0)         |

### Example Request

```bash
curl "http://localhost:3000/api/logs/search?query=error&container=nginx&limit=20"
```

### Example Response

```json
{
  "success": true,
  "total": 145,
  "returned": 20,
  "processingTimeMs": 12,
  "logs": [
    {
      "id": "abc123-1705761234567-xyz",
      "containerId": "abc123def456",
      "containerName": "nginx",
      "timestamp": 1705761234567,
      "timestampISO": "2026-01-20T14:23:54.567Z",
      "message": "Connection timeout to upstream server",
      "stream": "stderr",
      "labels": {
        "loggator.enable": "true",
        "app": "web"
      }
    }
  ]
}
```

## List Containers

Get a list of containers with log counts.

### Endpoint

```
GET /api/logs/containers
```

### Example Request

```bash
curl "http://localhost:3000/api/logs/containers"
```

### Example Response

```json
{
  "success": true,
  "totalCount": 1523,
  "containers": [
    {
      "id": "abc123def456",
      "name": "nginx",
      "count": 845
    },
    {
      "id": "def456ghi789",
      "name": "api",
      "count": 523
    },
    {
      "id": "ghi789jkl012",
      "name": "database",
      "count": 155
    }
  ]
}
```

## Log Histogram

Get log count histogram over time.

### Endpoint

```
GET /api/logs/histogram
```

### Query Parameters

| Parameter   | Type   | Required | Description               |
| ----------- | ------ | -------- | ------------------------- |
| `minutes`   | Number | No       | Time window (default: 60) |
| `container` | String | No       | Filter by container       |

### Example Request

```bash
curl "http://localhost:3000/api/logs/histogram?minutes=120&container=nginx"
```

### Example Response

```json
{
  "success": true,
  "buckets": [
    {
      "minute": "2026-01-20T12:00:00Z",
      "count": 45,
      "timestamp": 1705752000000
    },
    {
      "minute": "2026-01-20T12:01:00Z",
      "count": 52,
      "timestamp": 1705752060000
    }
  ],
  "total": 2547,
  "timeWindow": "120 minutes"
}
```

## Search Examples

### Basic Search

Find logs containing "error":

```bash
curl "http://localhost:3000/api/logs/search?query=error"
```

### Container Filter

Logs from specific container:

```bash
curl "http://localhost:3000/api/logs/search?container=nginx"
```

### Stream Filter

Only stderr logs:

```bash
curl "http://localhost:3000/api/logs/search?stream=stderr"
```

### Time Range

Logs from last hour:

```bash
NOW=$(date +%s)000
HOUR_AGO=$((NOW - 3600000))
curl "http://localhost:3000/api/logs/search?fromTimestamp=$HOUR_AGO&toTimestamp=$NOW"
```

### Combined Filters

Error logs from nginx's stderr in the last 2 hours:

```bash
NOW=$(date +%s)000
TWO_HOURS_AGO=$((NOW - 7200000))
curl "http://localhost:3000/api/logs/search?query=error&container=nginx&stream=stderr&fromTimestamp=$TWO_HOURS_AGO"
```

### Pagination

Get results 20-40:

```bash
curl "http://localhost:3000/api/logs/search?query=error&limit=20&offset=20"
```

## Integration Examples

### JavaScript/TypeScript

```typescript
interface LogSearchParams {
  query?: string;
  container?: string;
  stream?: "stdout" | "stderr";
  fromTimestamp?: number;
  toTimestamp?: number;
  limit?: number;
  offset?: number;
}

async function searchLogs(params: LogSearchParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(
    `http://localhost:3000/api/logs/search?${searchParams}`,
  );

  return await response.json();
}

// Usage
const logs = await searchLogs({
  query: "error",
  container: "nginx",
  limit: 50,
});

console.log(`Found ${logs.total} logs, showing ${logs.returned}`);
logs.logs.forEach((log) => {
  console.log(`[${log.timestampISO}] ${log.containerName}: ${log.message}`);
});
```

### Python

```python
import requests
from datetime import datetime, timedelta
from typing import Optional

def search_logs(
    query: Optional[str] = None,
    container: Optional[str] = None,
    stream: Optional[str] = None,
    from_timestamp: Optional[int] = None,
    to_timestamp: Optional[int] = None,
    limit: int = 50,
    offset: int = 0
):
    params = {
        'limit': limit,
        'offset': offset
    }

    if query:
        params['query'] = query
    if container:
        params['container'] = container
    if stream:
        params['stream'] = stream
    if from_timestamp:
        params['fromTimestamp'] = from_timestamp
    if to_timestamp:
        params['toTimestamp'] = to_timestamp

    response = requests.get(
        'http://localhost:3000/api/logs/search',
        params=params
    )

    return response.json()

# Usage - errors from last hour
one_hour_ago = int((datetime.now() - timedelta(hours=1)).timestamp() * 1000)
logs = search_logs(
    query='error',
    from_timestamp=one_hour_ago,
    limit=100
)

print(f"Found {logs['total']} errors")
for log in logs['logs']:
    print(f"{log['timestamp']}: {log['message']}")
```

### Go

```go
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "net/url"
    "time"
)

type LogSearchParams struct {
    Query         string
    Container     string
    Stream        string
    FromTimestamp int64
    ToTimestamp   int64
    Limit         int
    Offset        int
}

type LogSearchResponse struct {
    Success bool `json:"success"`
    Total   int  `json:"total"`
    Logs    []Log `json:"logs"`
}

type Log struct {
    ID            string            `json:"id"`
    ContainerName string            `json:"containerName"`
    Message       string            `json:"message"`
    Stream        string            `json:"stream"`
    TimestampISO  string            `json:"timestampISO"`
    Labels        map[string]string `json:"labels"`
}

func searchLogs(params LogSearchParams) (*LogSearchResponse, error) {
    baseURL := "http://localhost:3000/api/logs/search"
    queryParams := url.Values{}

    if params.Query != "" {
        queryParams.Add("query", params.Query)
    }
    if params.Container != "" {
        queryParams.Add("container", params.Container)
    }
    if params.Limit > 0 {
        queryParams.Add("limit", fmt.Sprintf("%d", params.Limit))
    }

    resp, err := http.Get(baseURL + "?" + queryParams.Encode())
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var result LogSearchResponse
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }

    return &result, nil
}

// Usage
func main() {
    logs, err := searchLogs(LogSearchParams{
        Query:     "error",
        Container: "nginx",
        Limit:     50,
    })

    if err != nil {
        panic(err)
    }

    fmt.Printf("Found %d logs\n", logs.Total)
    for _, log := range logs.Logs {
        fmt.Printf("[%s] %s: %s\n",
            log.TimestampISO,
            log.ContainerName,
            log.Message)
    }
}
```

### Bash/cURL

```bash
#!/bin/bash

# Search function
search_logs() {
    local query=$1
    local container=$2
    local limit=${3:-50}

    local url="http://localhost:3000/api/logs/search"
    local params="limit=$limit"

    if [ -n "$query" ]; then
        params="$params&query=$query"
    fi

    if [ -n "$container" ]; then
        params="$params&container=$container"
    fi

    curl -s "$url?$params" | jq '.logs[] | "\(.timestampISO) [\(.containerName)] \(.message)"'
}

# Usage
search_logs "error" "nginx" 20
```

## Error Handling

### 400 Bad Request

Invalid parameters:

```json
{
  "success": false,
  "error": "Invalid parameter: limit must be between 1 and 100"
}
```

### 500 Internal Server Error

Server error:

```json
{
  "success": false,
  "error": "Meilisearch connection failed"
}
```

## Performance Tips

### 1. Use Appropriate Limits

Request only what you need:

- ❌ `limit=1000` (slow, may timeout)
- ✅ `limit=50` (fast, paginate if needed)

### 2. Add Time Filters

Reduce search scope:

```bash
# Last hour only
fromTimestamp=$(($(date +%s) - 3600))000
```

### 3. Use Container Filters

Search specific containers:

```bash
container=nginx
```

### 4. Leverage Caching

Cache results when appropriate:

```javascript
const cache = new Map();

async function getCachedLogs(params) {
  const key = JSON.stringify(params);

  if (cache.has(key)) {
    return cache.get(key);
  }

  const logs = await searchLogs(params);
  cache.set(key, logs);

  return logs;
}
```

### 5. Implement Pagination

For large result sets:

```javascript
async function getAllLogs(query) {
  const allLogs = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await searchLogs({ query, limit, offset });
    allLogs.push(...response.logs);

    if (response.returned < limit) {
      break; // No more results
    }

    offset += limit;
  }

  return allLogs;
}
```

## Next Steps

- [Containers API](/api/containers/) - Container information
- [Chat API](/api/chat/) - AI-powered log analysis
- [Log Search](/features/log-search/) - Web UI search
