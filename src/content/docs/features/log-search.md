---
title: Log Search
description: Search and filter container logs with full-text search
---

Loggator provides powerful full-text search capabilities powered by Meilisearch, enabling you to find specific log entries quickly and efficiently.

## Search Interface

Access the search interface at [http://localhost:3000/search](http://localhost:3000/search)

### Basic Search

Simply type your query in the search box:

```
error
exception
timeout
failed
404
```

Meilisearch automatically:

- Finds relevant matches
- Ranks results by relevance
- Handles typos and fuzzy matching
- Highlights matching terms

### Advanced Filters

#### Container Filter

Search logs from specific containers:

1. Click the **Container** dropdown
2. Select one or more containers
3. Results are automatically filtered

#### Stream Filter

Filter by output stream:

- **stdout:** Standard output (normal logs)
- **stderr:** Error output (error logs)
- **Both:** No filter (default)

#### Time Range

Filter by timestamp:

- **Last 15 minutes**
- **Last hour**
- **Last 24 hours**
- **Last 7 days**
- **Custom range** (date picker)

## Search Syntax

### Simple Terms

Search for any word:

```
error
failed
nginx
```

### Multiple Terms

All terms must match (AND logic):

```
error timeout
nginx 404
database connection
```

### Phrases

Exact phrase matching with quotes:

```
"connection refused"
"out of memory"
"fatal error"
```

### Wildcards

Not directly supported, but Meilisearch handles:

- Prefix matching: `erro` matches `error`, `errors`
- Typo tolerance: `errro` still finds `error`

## Filtering Examples

### Find Errors

```
Query: error
Stream: stderr
Time: Last 24 hours
```

### Database Issues

```
Query: connection database
Container: postgres
Time: Last hour
```

### Specific Error Codes

```
Query: "500 Internal Server Error"
Container: nginx
Stream: stdout
```

### Recent Warnings

```
Query: warning
Time: Last 15 minutes
```

## Search Results

Each result shows:

- **Timestamp:** When the log was created
- **Container:** Which container produced it
- **Stream:** stdout (blue) or stderr (red)
- **Message:** The log message with highlighted matches
- **Context:** Surrounding text for better understanding

### Result Actions

- **Copy:** Copy log message to clipboard
- **Scroll:** Auto-scroll to follow new logs
- **Export:** Download results as JSON or CSV

## Performance

### Indexing Speed

Loggator indexes logs in batches:

- **Batch size:** 100 logs
- **Batch timeout:** 5 seconds
- **Throughput:** ~1000 logs/second

### Search Speed

Meilisearch provides:

- **Response time:** <50ms for most queries
- **Typo tolerance:** Built-in fuzzy matching
- **Ranking:** Relevance-based sorting

### Scaling

For high-volume logging:

1. **Increase batch size** (requires code change)
2. **Use SSD storage** for Meilisearch
3. **Allocate more RAM** to Meilisearch container
4. **Enable log rotation** to limit index size

## API Search

Search programmatically via API:

```bash
curl "http://localhost:3000/api/logs/search?query=error&limit=10"
```

See [Logs API](/api/logs/) for full documentation.

## Log Retention

### Automatic Cleanup

Loggator does not automatically delete old logs. To implement retention:

#### Option 1: Periodic Deletion

```bash
# Delete logs older than 7 days
curl -X POST http://localhost:7700/indexes/logs/documents/delete \
  -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": "timestamp < '$(($(date +%s) - 604800))'"
  }'
```

#### Option 2: Volume Cleanup

```bash
# Stop services
docker compose down

# Delete Meilisearch data
rm -rf ./meilisearch-data/*

# Restart services
docker compose up -d
```

#### Option 3: Scheduled Cleanup

Add a cron job:

```bash
# /etc/cron.daily/loggator-cleanup
#!/bin/bash
SEVEN_DAYS_AGO=$(($(date +%s) - 604800))
curl -X POST http://localhost:7700/indexes/logs/documents/delete \
  -H "Authorization: Bearer $MEILISEARCH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"filter\": \"timestamp < $SEVEN_DAYS_AGO\"}"
```

## Search Tips

### 1. Be Specific

❌ Generic: `log`
✅ Specific: `connection timeout error`

### 2. Use Filters

Combine search with filters for precision:

- Container + Query
- Time range + Stream
- All three together

### 3. Check Both Streams

Some applications log errors to stdout. Always check:

- stderr first (typical errors)
- stdout second (application-specific)

### 4. Use Time Ranges

Narrow down issues:

- Recent problems: Last 15 minutes
- Ongoing issues: Last 24 hours
- Historical analysis: Last 7 days

### 5. Try Variations

If no results:

- Remove some terms
- Try synonyms (`error` vs `fail` vs `exception`)
- Check spelling
- Broaden time range

## Common Searches

### Application Errors

```
Query: error exception fatal
Stream: stderr
Container: <your-app>
```

### HTTP Errors

```
Query: 500 502 503 504
Container: nginx
Stream: stdout
```

### Database Problems

```
Query: connection refused timeout deadlock
Container: postgres
```

### Out of Memory

```
Query: "out of memory" OOM killed
Time: Last 24 hours
```

### Authentication Issues

```
Query: authentication failed unauthorized 401 403
```

## Troubleshooting

### No results found

Check:

1. **Logs are being collected:** Visit Dashboard
2. **Container is labeled:** `docker inspect <container> | grep loggator`
3. **Spelling:** Try simpler terms
4. **Time range:** Expand the time window
5. **Indexing delay:** Wait 5-10 seconds for recent logs

### Search is slow

Causes:

- Large index size (millions of logs)
- Insufficient resources
- Complex queries

Solutions:

1. Implement log retention
2. Increase Meilisearch RAM:
   ```yaml
   meilisearch:
     deploy:
       resources:
         limits:
           memory: 2G
   ```
3. Use SSD for storage

### Results not relevant

Meilisearch uses ranking. To improve:

1. Use **exact phrases** in quotes
2. Add more **specific terms**
3. Use **filters** to narrow scope

### Logs not appearing

Check:

1. Container is running: `docker ps`
2. Container has label: See [Docker Setup](/configuration/docker/)
3. Loggator is running: `docker logs loggator`
4. Meilisearch is healthy: `curl http://localhost:7700/health`

## Advanced Features

### Highlighting

Matching terms are automatically highlighted in:

- Search results
- AI chat responses
- Live log viewer

### Sorting

Results are sorted by:

1. **Relevance** (default)
2. **Timestamp** (newest first)

### Pagination

- Default: 50 results per page
- Maximum: 100 results per page
- Use API for larger result sets

### Export

Download search results:

- **JSON:** Machine-readable format
- **CSV:** Spreadsheet-compatible
- **Text:** Plain log messages

(Feature may require implementation)

## Next Steps

- [AI Chat Assistant](/features/ai-assistant/) - Natural language search
- [Real-time Dashboard](/features/dashboard/) - Live log streaming
- [Logs API](/api/logs/) - Programmatic access
