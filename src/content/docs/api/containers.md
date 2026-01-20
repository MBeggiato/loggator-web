---
title: Containers API
description: Docker container information and management
---

The Containers API provides endpoints for retrieving information about monitored Docker containers.

## List Containers

Get all monitored Docker containers with their status.

### Endpoint

```
GET /api/containers
```

### Query Parameters

| Parameter | Type    | Required | Description                                 |
| --------- | ------- | -------- | ------------------------------------------- |
| `all`     | Boolean | No       | Include stopped containers (default: false) |

### Example Request

```bash
# Running containers only
curl "http://localhost:3000/api/containers"

# All containers (including stopped)
curl "http://localhost:3000/api/containers?all=true"
```

### Example Response

```json
{
  "success": true,
  "containers": [
    {
      "id": "abc123def456",
      "shortId": "abc123def456",
      "name": "nginx",
      "image": "nginx:latest",
      "state": "running",
      "status": "Up 2 hours",
      "created": 1705674234
    },
    {
      "id": "def456ghi789",
      "shortId": "def456ghi789",
      "name": "api",
      "image": "myapp/api:1.2.3",
      "state": "running",
      "status": "Up 1 hour",
      "created": 1705678234
    }
  ]
}
```

## Get Container Details

Get detailed information about a specific container.

### Endpoint

```
GET /api/containers/[id]
```

### Path Parameters

| Parameter | Type   | Description          |
| --------- | ------ | -------------------- |
| `id`      | String | Container name or ID |

### Example Request

```bash
# By name
curl "http://localhost:3000/api/containers/nginx"

# By ID
curl "http://localhost:3000/api/containers/abc123def456"
```

### Example Response

```json
{
  "success": true,
  "container": {
    "id": "abc123def456",
    "shortId": "abc123",
    "name": "nginx",
    "image": "nginx:latest",
    "state": "running",
    "status": "Up 2 hours",
    "created": "2026-01-19T12:30:34.000Z",
    "started": "2026-01-19T12:30:35.000Z",
    "ports": [
      {
        "private": 80,
        "public": 8080,
        "type": "tcp"
      }
    ],
    "networks": {
      "bridge": {
        "ipAddress": "172.17.0.2"
      }
    },
    "labels": {
      "loggator.enable": "true",
      "app": "web",
      "tier": "frontend"
    },
    "restartCount": 0,
    "health": "healthy"
  }
}
```

## Container Status

Get quick status of all monitored containers.

### Endpoint

```
GET /api/status
```

### Example Request

```bash
curl "http://localhost:3000/api/status"
```

### Example Response

```json
{
  "success": true,
  "service": "loggator",
  "version": "2.0.3",
  "meilisearch": {
    "connected": true,
    "health": "available"
  },
  "docker": {
    "connected": true,
    "containersMonitored": 3
  },
  "ai": {
    "enabled": true,
    "model": "xiaomi/mimo-v2-flash:free"
  }
}
```

## Response Fields

### Container Object

| Field          | Type          | Description                               |
| -------------- | ------------- | ----------------------------------------- |
| `id`           | String        | Full container ID                         |
| `shortId`      | String        | First 12 characters of ID                 |
| `name`         | String        | Container name (without leading `/`)      |
| `image`        | String        | Docker image with tag                     |
| `state`        | String        | Current state (`running`, `exited`, etc.) |
| `status`       | String        | Human-readable status                     |
| `created`      | Number/String | Creation timestamp                        |
| `started`      | String        | Start timestamp (detailed view)           |
| `ports`        | Array         | Port mappings                             |
| `networks`     | Object        | Network connections                       |
| `labels`       | Object        | Docker labels                             |
| `restartCount` | Number        | Restart count                             |
| `health`       | String        | Health check status                       |

### Port Object

| Field     | Type   | Description               |
| --------- | ------ | ------------------------- |
| `private` | Number | Container port            |
| `public`  | Number | Host port (if mapped)     |
| `type`    | String | Protocol (`tcp` or `udp`) |

## Integration Examples

### JavaScript/TypeScript

```typescript
interface Container {
  id: string;
  name: string;
  image: string;
  state: string;
  status: string;
}

async function listContainers(includeAll = false): Promise<Container[]> {
  const url = `http://localhost:3000/api/containers${includeAll ? "?all=true" : ""}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.containers;
}

async function getContainer(nameOrId: string) {
  const response = await fetch(
    `http://localhost:3000/api/containers/${nameOrId}`,
  );
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.container;
}

// Usage
const containers = await listContainers();
console.log(`Monitoring ${containers.length} containers`);

const nginx = await getContainer("nginx");
console.log(`nginx is ${nginx.state}`);
```

### Python

```python
import requests
from typing import List, Dict, Optional

class LoggatorClient:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url

    def list_containers(self, all: bool = False) -> List[Dict]:
        params = {'all': 'true'} if all else {}
        response = requests.get(
            f"{self.base_url}/api/containers",
            params=params
        )
        data = response.json()

        if not data['success']:
            raise Exception(data['error'])

        return data['containers']

    def get_container(self, name_or_id: str) -> Dict:
        response = requests.get(
            f"{self.base_url}/api/containers/{name_or_id}"
        )
        data = response.json()

        if not data['success']:
            raise Exception(data['error'])

        return data['container']

# Usage
client = LoggatorClient()

# List all running containers
containers = client.list_containers()
print(f"Monitoring {len(containers)} containers")

# Get specific container
nginx = client.get_container('nginx')
print(f"nginx state: {nginx['state']}")
```

### Go

```go
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

type ContainersResponse struct {
    Success    bool        `json:"success"`
    Containers []Container `json:"containers"`
}

type ContainerResponse struct {
    Success   bool      `json:"success"`
    Container Container `json:"container"`
}

type Container struct {
    ID       string `json:"id"`
    Name     string `json:"name"`
    Image    string `json:"image"`
    State    string `json:"state"`
    Status   string `json:"status"`
    Created  int64  `json:"created"`
}

func listContainers(includeAll bool) ([]Container, error) {
    url := "http://localhost:3000/api/containers"
    if includeAll {
        url += "?all=true"
    }

    resp, err := http.Get(url)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var result ContainersResponse
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }

    if !result.Success {
        return nil, fmt.Errorf("API error")
    }

    return result.Containers, nil
}

func getContainer(nameOrID string) (*Container, error) {
    url := fmt.Sprintf("http://localhost:3000/api/containers/%s", nameOrID)

    resp, err := http.Get(url)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var result ContainerResponse
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }

    if !result.Success {
        return nil, fmt.Errorf("API error")
    }

    return &result.Container, nil
}

// Usage
func main() {
    containers, _ := listContainers(false)
    fmt.Printf("Monitoring %d containers\n", len(containers))

    nginx, _ := getContainer("nginx")
    fmt.Printf("nginx is %s\n", nginx.State)
}
```

## Use Cases

### Dashboard Display

```javascript
async function updateDashboard() {
  const containers = await listContainers();

  const running = containers.filter((c) => c.state === "running").length;
  const total = containers.length;

  document.getElementById("stats").innerHTML = `
    <div>Total: ${total}</div>
    <div>Running: ${running}</div>
    <div>Stopped: ${total - running}</div>
  `;
}
```

### Health Monitoring

```javascript
async function checkHealth() {
  const containers = await listContainers();
  const unhealthy = [];

  for (const container of containers) {
    const details = await getContainer(container.name);

    if (details.state !== "running" || details.health === "unhealthy") {
      unhealthy.push(container.name);
    }
  }

  if (unhealthy.length > 0) {
    console.warn(`Unhealthy containers: ${unhealthy.join(", ")}`);
  }
}
```

### Automated Alerts

```python
import time

def monitor_containers():
    client = LoggatorClient()

    while True:
        containers = client.list_containers()

        for container in containers:
            if container['state'] != 'running':
                send_alert(f"Container {container['name']} is {container['state']}")

        time.sleep(60)  # Check every minute
```

## Error Handling

### 404 Not Found

Container doesn't exist or isn't monitored:

```json
{
  "success": false,
  "error": "Container 'myapp' not found or not monitored"
}
```

### 500 Internal Server Error

Docker connection error:

```json
{
  "success": false,
  "error": "Failed to connect to Docker"
}
```

## Security Considerations

### Label-Based Access

Only containers with the monitoring label are accessible:

```yaml
services:
  public-api:
    labels:
      - "loggator.enable=true" # Visible via API

  private-db:
    # No label - not accessible via API
```

### Read-Only Access

The API provides read-only access. Containers cannot be:

- Started or stopped
- Modified
- Deleted

For write operations, use Docker CLI directly.

## Best Practices

### 1. Cache Container Lists

Container lists change infrequently:

```javascript
let containerCache = null;
let cacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

async function getCachedContainers() {
  const now = Date.now();

  if (!containerCache || now - cacheTime > CACHE_TTL) {
    containerCache = await listContainers();
    cacheTime = now;
  }

  return containerCache;
}
```

### 2. Handle Errors Gracefully

```javascript
async function safeGetContainer(name) {
  try {
    return await getContainer(name);
  } catch (error) {
    console.error(`Failed to get container ${name}:`, error);
    return null;
  }
}
```

### 3. Use Specific Endpoints

For specific containers, use detail endpoint instead of filtering the list:

❌ Slow:

```javascript
const containers = await listContainers();
const nginx = containers.find((c) => c.name === "nginx");
```

✅ Fast:

```javascript
const nginx = await getContainer("nginx");
```

## Next Steps

- [Logs API](/api/logs/) - Access container logs
- [Container Monitoring](/features/container-monitoring/) - Monitoring features
- [Docker Setup](/configuration/docker/) - Configure containers
