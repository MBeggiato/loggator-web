---
title: Real-time Dashboard
description: Monitor container logs and statistics in real-time
---

The Loggator dashboard provides an at-a-glance view of your container ecosystem with real-time statistics, log histograms, and quick access to all features.

## Dashboard Overview

Access the dashboard at [http://localhost:3000](http://localhost:3000)

The dashboard displays:

- **Container Statistics** - Running/stopped count
- **Log Count** - Total indexed logs
- **Log Histogram** - Visual log activity over time
- **Container List** - All monitored containers
- **AI Chat** - Quick access to the AI assistant

## Statistics Cards

### Container Stats

Shows a summary of your monitored containers:

- **Total Containers:** All containers with the monitoring label
- **Running:** Currently active containers
- **Stopped:** Containers that are not running
- **Status Indicators:** Color-coded badges (green=running, red=stopped)

### Log Count

Displays the total number of logs indexed in Meilisearch:

- **Real-time Updates:** Auto-refreshes periodically
- **Growth Rate:** See how quickly logs accumulate
- **Storage Insight:** Helps plan retention policies

### Container Details

Each container card shows:

- **Container Name:** Friendly name
- **Image:** Docker image and tag
- **Status:** Current state (running/stopped)
- **Created:** When the container was created
- **Ports:** Exposed ports (if any)
- **Log Count:** Number of logs from this container

## Log Histogram

Visual representation of log activity over time.

### Features

- **Time-based Buckets:** Grouped by minute/hour
- **Interactive:** Hover for exact counts
- **Responsive:** Adapts to screen size
- **Color-coded:** Different colors per container (optional)

### Time Ranges

Select different time windows:

- **15 minutes:** High-resolution recent activity
- **1 hour:** Short-term patterns
- **6 hours:** Medium-term trends
- **24 hours:** Daily overview
- **7 days:** Weekly patterns

### Use Cases

#### Detect Anomalies

Sudden spikes indicate:

- Application errors
- Traffic surges
- System events
- Attacks or abuse

#### Identify Patterns

Regular patterns show:

- Scheduled jobs (cron)
- Batch processing
- Peak usage times
- Quiet periods

#### Correlate Events

Compare histogram with:

- Deployment times
- System changes
- External events
- User reports

## Container Filtering

Filter the histogram by container:

1. Click **Container** dropdown
2. Select one or more containers
3. Histogram updates to show only selected containers

This helps:

- Isolate noisy containers
- Focus on specific services
- Compare container behavior

## Auto-Refresh

The dashboard automatically refreshes:

- **Container Stats:** Every 30 seconds
- **Log Counts:** Every 30 seconds
- **Histogram:** Every 60 seconds

Manual refresh available via refresh button.

## Quick Actions

### View Logs

Click a container card to:

- Jump to search page with container filter
- See all logs from that container
- Filter by time or stream

### Chat with AI

Click the chat bubble to:

- Ask questions about the dashboard
- Request health analysis
- Get error summaries
- Troubleshoot issues

### Search

Click the search icon to:

- Open full-text search
- Enter complex queries
- Apply multiple filters

## Dashboard Customization

### Layout

The dashboard is responsive and adapts to:

- Desktop (full layout)
- Tablet (stacked cards)
- Mobile (single column)

### Theme

Loggator supports:

- **Light Mode:** Easy on the eyes during the day
- **Dark Mode:** Reduced eye strain at night
- **Auto:** Follows system preference

(Theme switching may require implementation)

### Widgets

Current widgets:

- Statistics cards
- Log histogram
- Container list
- AI chat bubble

(Additional widgets may be added in future versions)

## Performance

### Data Loading

Dashboard loads data efficiently:

- **Parallel Requests:** Stats and logs load simultaneously
- **Caching:** Repeated data is cached
- **Minimal Payload:** Only necessary data is transferred

### Update Strategy

Smart updates reduce server load:

- **Incremental:** Only changed data is fetched
- **Throttled:** Auto-refresh has reasonable intervals
- **On-Demand:** Manual refresh for immediate updates

## Monitoring Best Practices

### 1. Regular Checks

Check the dashboard:

- **Morning:** Start of day health check
- **After Deployments:** Verify new versions
- **During Incidents:** Monitor in real-time
- **Before Weekend:** Ensure stability

### 2. Watch for Patterns

Look for:

- Sudden log spikes
- Missing logs (silence = problem?)
- Error rate increases
- Unusual timing

### 3. Use Time Windows

Different windows for different purposes:

- **15 min:** Real-time monitoring
- **1 hour:** Recent trends
- **24 hours:** Daily patterns
- **7 days:** Long-term health

### 4. Correlate with Events

Compare dashboard with:

- Deployment schedules
- User complaints
- External monitoring
- System metrics

### 5. Set Expectations

Establish baselines:

- Normal log volume
- Expected error rate
- Peak usage times
- Quiet periods

## Common Scenarios

### Deployment Monitoring

```
1. Note current log rate
2. Deploy new version
3. Watch for error spikes
4. Compare before/after patterns
5. Use AI to analyze changes
```

### Incident Response

```
1. Check dashboard for anomalies
2. Identify affected containers
3. View histogram for timing
4. Use AI for root cause
5. Check container details
```

### Capacity Planning

```
1. Monitor log volume over 7 days
2. Identify growth rate
3. Estimate storage needs
4. Plan retention policies
5. Scale resources accordingly
```

### Health Monitoring

```
1. Daily dashboard check
2. Compare with yesterday
3. Look for gradual changes
4. Use AI for health analysis
5. Act on findings
```

## Troubleshooting

### Dashboard not loading

Check:

```bash
# Loggator is running
docker ps | grep loggator

# No errors in logs
docker logs loggator

# API is responding
curl http://localhost:3000/api/status
```

### Stats show zero

Causes:

- No containers are labeled
- Containers haven't logged yet
- Meilisearch indexing delay

Solutions:

1. Add labels to containers
2. Generate some logs
3. Wait 5-10 seconds for indexing

### Histogram empty

Check:

1. Time range (expand to 24 hours)
2. Container filter (remove filters)
3. Log count (must be > 0)
4. Meilisearch health: `curl http://localhost:7700/health`

### Auto-refresh not working

Causes:

- Browser in background tab
- JavaScript disabled
- Network issues

Solutions:

1. Keep tab active
2. Enable JavaScript
3. Check browser console for errors
4. Manual refresh

### Slow performance

Optimize:

1. **Limit time range:** Shorter = faster
2. **Filter containers:** Fewer = faster
3. **Implement retention:** Less data = faster
4. **Increase resources:** More RAM for Meilisearch

## Next Steps

- [Container Monitoring](/features/container-monitoring/) - Detailed container features
- [Log Search](/features/log-search/) - Full-text search
- [AI Assistant](/features/ai-assistant/) - Natural language queries
