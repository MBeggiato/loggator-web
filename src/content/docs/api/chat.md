---
title: Chat API
description: AI-powered chat endpoint for log analysis
---

The Chat API enables natural language interaction with your logs through an AI assistant.

## Endpoint

```
POST /api/chat
```

## Request

### Headers

```
Content-Type: application/json
```

### Body Parameters

| Parameter  | Type  | Required | Description           |
| ---------- | ----- | -------- | --------------------- |
| `messages` | Array | Yes      | Conversation messages |

### Message Format

Each message in the array:

| Field     | Type   | Required | Description           |
| --------- | ------ | -------- | --------------------- |
| `role`    | String | Yes      | `user` or `assistant` |
| `content` | String | Yes      | Message text          |

### Example Request

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Show me errors from the last hour"
      }
    ]
  }'
```

### Multi-Turn Conversation

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Show me nginx logs"
      },
      {
        "role": "assistant",
        "content": "Here are the nginx logs..."
      },
      {
        "role": "user",
        "content": "Any errors in there?"
      }
    ]
  }'
```

## Response

### Success Response

```json
{
  "success": true,
  "message": "AI response text with markdown formatting",
  "toolCalls": [],
  "iterations": 2,
  "model": "xiaomi/mimo-v2-flash:free",
  "usage": {
    "prompt_tokens": 245,
    "completion_tokens": 123,
    "total_tokens": 368
  }
}
```

### Response Fields

| Field        | Type    | Description                   |
| ------------ | ------- | ----------------------------- |
| `success`    | Boolean | Request success status        |
| `message`    | String  | AI's text response (markdown) |
| `toolCalls`  | Array   | Tools called (if any)         |
| `iterations` | Number  | Tool calling iterations       |
| `model`      | String  | AI model used                 |
| `usage`      | Object  | Token usage statistics        |

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": 400
}
```

## Examples

### Basic Query

**Request:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What containers are you monitoring?"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "I'm currently monitoring 3 containers:\n\n1. **nginx** (running)\n2. **api** (running)\n3. **database** (running)",
  "toolCalls": [
    {
      "function": {
        "name": "list_containers"
      }
    }
  ],
  "iterations": 1,
  "model": "xiaomi/mimo-v2-flash:free"
}
```

### Error Search

**Request:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Show me all errors from nginx in the last hour"
    }
  ]
}
```

**Response:**

````json
{
  "success": true,
  "message": "Found 3 errors from nginx in the last hour:\n\n```\n2026-01-20 14:23:45 - Connection timeout to upstream\n2026-01-20 14:45:12 - 502 Bad Gateway\n2026-01-20 15:01:33 - Failed to connect to backend\n```\n\nThese appear to be backend connectivity issues.",
  "toolCalls": [
    {
      "function": {
        "name": "search_logs",
        "arguments": {
          "query": "error",
          "container": "nginx"
        }
      }
    }
  ],
  "iterations": 1
}
````

### Health Analysis

**Request:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Is my api container healthy?"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "The **api** container appears healthy:\n\n- **Status:** Running\n- **Error Rate:** 0.5% (2 errors in 400 logs)\n- **Recent Errors:** Minor connection timeouts\n\nNo critical issues detected.",
  "toolCalls": [
    {
      "function": {
        "name": "analyze_container_health",
        "arguments": {
          "containerName": "api",
          "minutes": 60
        }
      }
    }
  ],
  "iterations": 1
}
```

## AI Tools

The AI automatically calls these tools based on your query:

### search_logs

Search container logs with filters.

**Parameters:**

- `query` (string, required): Search terms
- `container` (string, optional): Container name
- `stream` (string, optional): `stdout` or `stderr`
- `limit` (number, optional): Max results (default: 50)

**Triggered by:**

- "Show me errors"
- "Find timeout logs"
- "Search for exception"

### list_containers

List all monitored containers.

**Parameters:**

- `all` (boolean, optional): Include stopped containers

**Triggered by:**

- "What containers are monitored?"
- "List containers"
- "Show me all containers"

### get_container_info

Get detailed container information.

**Parameters:**

- `containerName` (string, required): Container name

**Triggered by:**

- "Tell me about nginx"
- "Info for api container"
- "What's the status of database?"

### analyze_container_health

Analyze container health from logs.

**Parameters:**

- `containerName` (string, required): Container name
- `minutes` (number, optional): Time window (default: 60)

**Triggered by:**

- "Is nginx healthy?"
- "Check api container health"
- "Analyze database logs"

## Limits

### Message Limits

- **Maximum messages:** 50 per request
- **Maximum message length:** 10,000 characters each
- **Maximum iterations:** 5 tool calling loops

### Rate Limits

Rate limits depend on your AI model:

**Free Models:**

- 10-20 requests/minute
- 100-200 requests/day

**Paid Models:**

- Higher limits (varies by provider)

See [OpenRouter Models](https://openrouter.ai/models) for details.

## Error Handling

### Common Errors

#### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid request: messages array required",
  "code": 400
}
```

**Causes:**

- Missing `messages` field
- Invalid message format
- Message too long

#### 401 Unauthorized

```json
{
  "success": false,
  "error": "OpenRouter API key not configured",
  "code": 401
}
```

**Solution:** Set `OPENROUTER_API_KEY` environment variable

#### 429 Rate Limit

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": 429
}
```

**Solution:** Wait and retry, or upgrade to paid model

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```

**Solution:** Check Loggator logs, report if persistent

## Best Practices

### 1. Keep Messages Concise

❌ Long:

```json
{
  "content": "I want you to search through all the logs and find any errors that might have occurred in the last hour or so, especially from the nginx container if possible..."
}
```

✅ Concise:

```json
{
  "content": "Show nginx errors from the last hour"
}
```

### 2. Maintain Context

Include previous messages for follow-up questions:

```json
{
  "messages": [
    { "role": "user", "content": "Show me logs" },
    { "role": "assistant", "content": "Here are the logs..." },
    { "role": "user", "content": "Any errors in there?" }
  ]
}
```

### 3. Be Specific

Better results with specific queries:

- ✅ "Show stderr logs from api in last 30 minutes"
- ❌ "Show me some logs"

### 4. Handle Errors Gracefully

Always check `success` field:

```javascript
const response = await fetch("/api/chat", {
  method: "POST",
  body: JSON.stringify({ messages }),
});

const data = await response.json();

if (!data.success) {
  console.error("Chat error:", data.error);
  // Handle error
} else {
  console.log("Response:", data.message);
}
```

### 5. Implement Timeouts

AI requests can take time:

```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

try {
  const response = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
    signal: controller.signal,
  });
  // Process response
} catch (error) {
  if (error.name === "AbortError") {
    console.error("Request timeout");
  }
} finally {
  clearTimeout(timeoutId);
}
```

## Integration Examples

### JavaScript/TypeScript

```typescript
async function chatWithAI(message: string): Promise<string> {
  const response = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: message }],
    }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.message;
}

// Usage
const response = await chatWithAI("Show me errors");
console.log(response);
```

### Python

```python
import requests

def chat_with_ai(message: str) -> str:
    response = requests.post(
        'http://localhost:3000/api/chat',
        json={
            'messages': [
                {'role': 'user', 'content': message}
            ]
        }
    )

    data = response.json()

    if not data['success']:
        raise Exception(data['error'])

    return data['message']

# Usage
response = chat_with_ai('Show me errors')
print(response)
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

type ChatRequest struct {
    Messages []Message `json:"messages"`
}

type Message struct {
    Role    string `json:"role"`
    Content string `json:"content"`
}

type ChatResponse struct {
    Success bool   `json:"success"`
    Message string `json:"message"`
    Error   string `json:"error,omitempty"`
}

func chatWithAI(message string) (string, error) {
    reqBody, _ := json.Marshal(ChatRequest{
        Messages: []Message{
            {Role: "user", Content: message},
        },
    })

    resp, err := http.Post(
        "http://localhost:3000/api/chat",
        "application/json",
        bytes.NewBuffer(reqBody),
    )
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()

    var chatResp ChatResponse
    json.NewDecoder(resp.Body).Decode(&chatResp)

    if !chatResp.Success {
        return "", fmt.Errorf(chatResp.Error)
    }

    return chatResp.Message, nil
}
```

## Security Considerations

### Input Validation

The API validates:

- Message array is present
- Each message has `role` and `content`
- Message length < 10,000 characters
- Total messages < 50

### Output Sanitization

AI responses may contain:

- Markdown formatting (safe)
- Code blocks (safe)
- Log data (ensure no secrets in logs)

### Rate Protection

Implement rate limiting on your end:

- Track requests per user/IP
- Implement backoff strategies
- Cache common queries

## Next Steps

- [Logs API](/api/logs/) - Direct log search
- [AI Assistant](/features/ai-assistant/) - Feature documentation
- [AI Configuration](/configuration/ai-assistant/) - Model setup
