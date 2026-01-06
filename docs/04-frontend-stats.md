# Phase 4: Frontend - Statistics Page

## Overview

Build a dedicated statistics/tracking page that shows practice history, progress over time, and insights. This is a separate view from the trainer, accessible via navigation.

## Navigation

Add a simple nav to switch between:
- **Train** (the main trainer from Phase 3)
- **Stats** (this page)

Use React Router or simple conditional rendering.

## Stats Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Cross Planning Trainer                    [Train] [Stats*] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  OVERVIEW                           [Last 7d ▼]     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │   Total Attempts    Success Rate    Avg Difficulty  │   │
│  │      247              78.5%            3.2          │   │
│  │                                                     │   │
│  │   Sessions          Avg Pairs        Avg Time       │   │
│  │       12              1.4            11.2s          │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  DAILY PROGRESS                                     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │   [Chart: Attempts per day + success rate line]     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │  BY DIFFICULTY       │  │  BY PAIRS ATTEMPTED      │   │
│  ├──────────────────────┤  ├──────────────────────────┤   │
│  │  1 move: 98% (50)    │  │  0 pairs: 95% (100)      │   │
│  │  2 move: 95% (80)    │  │  1 pair:  80% (200)      │   │
│  │  3 move: 85% (120)   │  │  2 pairs: 65% (150)      │   │
│  │  4 move: 72% (100)   │  │  3 pairs: 40% (40)       │   │
│  │  5 move: 60% (80)    │  │  4 pairs: 20% (10)       │   │
│  │  6 move: 45% (50)    │  │                          │   │
│  │  7 move: 30% (20)    │  │                          │   │
│  └──────────────────────┘  └──────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  RECENT NOTES                                       │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │  Jan 5, 10:35 - 4 move, 2 pairs (planned 1)        │   │
│  │  "Missed blue-red pair, need to track edge better" │   │
│  │                                                     │   │
│  │  Jan 5, 10:32 - 5 move, 1 pair (success)           │   │
│  │  "Good cross, found pair during last move"         │   │
│  │                                                     │   │
│  │  [Load more...]                                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  SESSION HISTORY                                    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │  Jan 5, 2026 (10:30 - 11:00)                       │   │
│  │  25 attempts | 80% success | avg 3.2 moves         │   │
│  │                                                     │   │
│  │  Jan 4, 2026 (20:15 - 20:45)                       │   │
│  │  30 attempts | 75% success | avg 3.5 moves         │   │
│  │                                                     │   │
│  │  [Load more...]                                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Components

### `<StatsPage />`
Main container for the stats view. Fetches data on mount and manages date range filter.

### `<OverviewCards dateRange={} />`
Top-level summary cards showing:
- Total attempts
- Overall success rate
- Average difficulty practiced
- Number of sessions
- Average pairs attempted
- Average inspection time

### `<DailyChart data={} />`
Line/bar chart showing daily progress.
- X-axis: dates
- Y-axis (left): number of attempts (bars)
- Y-axis (right): success rate % (line)
- Hover for details

**Charting library options** (pick one):
- **Recharts**: React-friendly, simple API
- **Chart.js + react-chartjs-2**: Popular, flexible
- **Lightweight**: Just use CSS bars if keeping deps minimal

### `<DifficultyBreakdown data={} />`
Table or list showing:
- Each difficulty level (1-7)
- Success rate at that level
- Number of attempts
- Visual bar showing rate

Color code: green (>80%), yellow (50-80%), red (<50%)

### `<PairsBreakdown data={} />`
Similar to difficulty breakdown but grouped by pairs_attempted.
- 0 pairs (cross only)
- 1 pair
- 2 pairs
- 3 pairs
- 4 pairs

Also show average pairs_planned when attempting X pairs.

### `<RecentNotes limit={20} />`
List of recent attempts that have notes.
- Show date/time
- Show scramble difficulty + pairs attempted
- Show result (success/fail, pairs planned)
- Show the note text
- Expandable to show full scramble?

### `<SessionHistory limit={10} />`
List of past sessions with summary stats:
- Date and time range
- Total attempts in session
- Success rate
- Average difficulty
- Session notes (if any)

Click to expand and see individual attempts?

## Date Range Filter

Dropdown or button group at top:
- Last 7 days
- Last 30 days
- Last 90 days
- All time
- Custom range (date pickers)

All stats components respond to this filter.

## API Calls

```javascript
// Fetch overview stats
const overview = await fetch(`${API}/stats/summary?date_from=${from}&date_to=${to}`);

// Fetch daily data for chart
const daily = await fetch(`${API}/stats/daily?days=30`);

// Fetch recent notes
const notes = await fetch(`${API}/stats/recent-notes?limit=20`);

// Fetch sessions
const sessions = await fetch(`${API}/sessions?limit=10`);

// Fetch attempts for a session
const attempts = await fetch(`${API}/attempts?session_id=${id}`);
```

## Data Refresh

- Fetch fresh data when navigating to Stats page
- Optional: auto-refresh every 60s if page is visible
- Show "last updated" timestamp

## Empty States

Handle cases where there's no data:
- "No practice data yet. Start training to see your stats!"
- "No attempts with notes in this time period."

## Responsive Design

- Desktop: Multi-column layout as shown
- Tablet: 2 columns
- Mobile: Single column, stacked sections
- Charts should resize appropriately

## Export Feature (Nice to Have)

Button to export data:
- CSV of all attempts in date range
- Include: date, scramble, difficulty, pairs_attempted, cross_success, pairs_planned, inspection_time, notes

```javascript
function exportToCSV(attempts) {
  const headers = ['date', 'scramble', 'difficulty', 'pairs_attempted', 'cross_success', 'pairs_planned', 'inspection_time_ms', 'notes'];
  const rows = attempts.map(a => [
    a.created_at,
    a.scramble,
    a.cross_moves,
    a.pairs_attempted,
    a.cross_success,
    a.pairs_planned,
    a.inspection_time_ms,
    a.notes
  ]);
  // Generate and download CSV...
}
```

## Performance Considerations

- Paginate large lists (sessions, notes)
- Use virtual scrolling if lists get very long
- Cache stats data briefly to avoid re-fetching on navigation
- Consider summary tables/materialized views in DB for faster queries

## Testing Checklist

- [ ] Overview cards show correct totals
- [ ] Chart renders with real data
- [ ] Date range filter updates all sections
- [ ] Difficulty breakdown percentages are accurate
- [ ] Pairs breakdown shows correct data
- [ ] Notes list loads and displays properly
- [ ] Session history shows correct summaries
- [ ] Empty states display when no data
- [ ] Works on mobile
- [ ] Navigation between Train and Stats works
