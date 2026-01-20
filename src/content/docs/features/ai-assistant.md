---
title: AI Chat Assistant
description: Natural language log analysis with AI-powered chat
---

The AI Chat Assistant is Loggator's most powerful feature, enabling you to analyze logs using natural language instead of complex queries.

## Overview

Chat with an AI assistant that can:

- Search logs using natural language
- Analyze container health automatically
- Explain errors in plain language
- Suggest solutions to problems
- Filter and aggregate log data
- Answer questions about your infrastructure

## Getting Started

### Enable the AI Assistant

1. Get an [OpenRouter API key](https://openrouter.ai/keys) (free tier available)
2. Add to your `.env` file:
   ```bash
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   AI_MODEL=xiaomi/mimo-v2-flash:free
   ```
3. Restart Loggator: `docker compose restart loggator`

### Access the Chat

Navigate to [http://localhost:3000](http://localhost:3000) and find the chat interface in the sidebar or main page.

## Example Queries

### Basic Questions

```
What containers are you monitoring?
Show me recent logs
What's happening right now?
```

**Response:** List of monitored containers with their status

### Error Detection

```
Show me all errors
Find errors from the last hour
What errors does nginx have?
Are there any exceptions?
```

**Response:** Filtered error logs with analysis

### Container-Specific

```
Tell me about the api container
Is my database healthy?
Show logs from the web container
What's the status of nginx?
```

**Response:** Container info and relevant logs

### Time-Based Analysis

```
What happened in the last 30 minutes?
Show errors from the last 2 hours
Any warnings today?
What changed since yesterday?
```

**Response:** Time-filtered logs with context

### Health Checks

```
Is everything running smoothly?
Check the health of all containers
Are there any problems?
Analyze the api container
```

**Response:** Health analysis with suggestions

### Troubleshooting

```
Why is my api container failing?
What caused the recent errors?
Explain this error: [paste error]
How do I fix connection timeouts?
```

**Response:** Error explanation with solutions

### Pattern Analysis

```
Find all timeout errors
Show me authentication failures
Are there any memory issues?
What 500 errors occurred?
```

**Response:** Pattern-matched logs with analysis

## AI Capabilities

### Automatic Tool Calling

The AI automatically uses these tools based on your query:

#### 1. search_logs

Searches logs with filters

```
Query: "Show me errors from nginx"
Tool: search_logs(query="error", container="nginx")
```

#### 2. list_containers

Lists monitored containers

```
Query: "What containers are running?"
Tool: list_containers(all=false)
```

#### 3. get_container_info

Gets detailed container information

```
Query: "Tell me about the database"
Tool: get_container_info(containerName="database")
```

#### 4. analyze_container_health

Analyzes container health

```
Query: "Is the api healthy?"
Tool: analyze_container_health(containerName="api", minutes=60)
```

### Context Understanding

The AI maintains context across conversations:

```
You: Show me nginx logs
AI: [Shows nginx logs]

You: Any errors in there?
AI: [Filters for errors in nginx logs - understands "there" = nginx]

You: What about timeouts?
AI: [Further filters nginx errors for timeout-related entries]
```

### Response Formatting

Responses include:

- **Markdown formatting** for readability
- **Syntax-highlighted code blocks** for log entries
- **Tables** for structured data
- **Lists** for multiple items
- **Timestamps** in human-readable format

## Advanced Usage

### Complex Queries

Combine multiple filters:

```
Show me all 500 errors from the api container
logged to stderr in the last 2 hours
```

The AI will:

1. Parse your requirements
2. Call `search_logs` with appropriate filters
3. Analyze the results
4. Provide formatted output with insights

### Multi-Step Analysis

Ask follow-up questions:

```
You: What containers have errors?
AI: [Lists containers with error counts]

You: Show me the errors from the top one
AI: [Shows errors from the container with most errors]

You: What's causing those errors?
AI: [Analyzes error patterns and suggests causes]

You: How do I fix it?
AI: [Provides solutions based on error types]
```

### Aggregation and Statistics

```
How many errors per container?
What's the error rate over time?
Which container logs the most?
Show me a summary of the last hour
```

### Comparative Analysis

```
Compare logs from api and database
Did errors increase in the last hour?
Which containers are noisiest?
```

## Chat Features

### Persistent History

- Conversations are saved in your browser
- Context is maintained across page reloads
- Clear history button to start fresh

### Tool Visibility

Watch the AI work:

- See which tools are being called
- View parameters passed to tools
- Inspect raw tool results

Toggle visibility in the chat settings.

### Regenerate Responses

Don't like a response? Request regeneration:

- Click the "Regenerate" button
- AI will retry with different reasoning
- Useful for getting more detail or different perspective

### Copy to Clipboard

Every response has a copy button:

- Copy formatted markdown
- Share with team members
- Save to documentation

## Best Practices

### 1. Be Specific

❌ Vague: "Show me logs"
✅ Specific: "Show me error logs from nginx in the last hour"

### 2. Use Natural Language

Don't try to write code:
❌ `search(query="error", filter="container=nginx")`
✅ "Show me nginx errors"

### 3. Ask Follow-Up Questions

Build on previous context:

```
1. What containers are monitored?
2. Show logs from the first one
3. Any errors there?
4. What caused them?
```

### 4. Be Patient

AI tools can take a few seconds:

- Searching large log sets
- Analyzing patterns
- Generating explanations

### 5. Provide Context

Help the AI understand:
❌ "Fix it"
✅ "How do I fix the connection timeout error in my api container?"

## Example Workflows

### Morning Health Check

```
1. Is everything running smoothly?
2. Show me any errors from the last 8 hours
3. Are there any unusual patterns?
4. Check the health of all containers
```

### Incident Investigation

```
1. What happened at 14:30?
2. Show me errors around that time
3. Which containers were affected?
4. What was the root cause?
5. How can I prevent this?
```

### Performance Analysis

```
1. Show me all timeout errors today
2. Which container has the most timeouts?
3. Analyze that container's health
4. What's causing the timeouts?
```

### Deployment Verification

```
1. Show logs from the last 5 minutes
2. Are there any errors after deployment?
3. Is the new version healthy?
4. Compare with previous hour
```

## Limitations

### Log Volume

- AI analyzes up to 100 logs per query (default)
- Large result sets are summarized
- Use time filters for better results

### Rate Limits

Free models have limits:

- 10-20 requests per minute
- 100-200 requests per day

See [AI Configuration](/configuration/ai-assistant/#usage-limits) for details.

### Context Window

AI has limited memory:

- Keeps recent conversation context
- May forget older messages
- Start fresh for new topics

### Model Capabilities

Different models have different strengths:

- **Free models:** Good for basic queries
- **Paid models:** Better reasoning and explanations

## Troubleshooting

### "AI features disabled"

Cause: OpenRouter API key not configured

Solution:

```bash
# Add to .env
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Restart
docker compose restart loggator
```

### Slow responses

Causes:

- Large result sets
- Complex queries
- Slow AI model

Solutions:

1. Be more specific (reduces search scope)
2. Use time filters
3. Switch to a faster model (e.g., `xiaomi/mimo-v2-flash:free`)

### Incorrect responses

Solutions:

1. Rephrase your question
2. Be more specific
3. Try a different model
4. Check if logs exist (use search page)

### Rate limit errors

Solutions:

1. Wait for limit to reset (usually 1 minute)
2. Use direct search for simple queries
3. Upgrade to paid model

## Security & Privacy

### What Data is Sent?

Only log data matching your query:

- Log messages
- Timestamps
- Container names
- Metadata

### Data Usage

- Processed by OpenRouter's AI models
- May be used for model improvement (check provider policy)
- Not stored by Loggator

### Best Practices

1. **Don't log sensitive data** in containers
2. **Use label filtering** to exclude sensitive containers
3. **Review queries** before sending
4. **Rotate API keys** regularly

See [Security Considerations](/configuration/ai-assistant/#security) for more.

## Next Steps

- [AI Configuration](/configuration/ai-assistant/) - Model selection and setup
- [Log Search](/features/log-search/) - Manual search interface
- [Chat API](/api/chat/) - Integrate AI in your apps
