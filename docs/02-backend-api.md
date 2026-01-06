# Phase 2: Backend API

## Overview

Create a Node.js/Express API that serves scrambles and records practice attempts to the database. This API will be consumed by the frontend trainer.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (via `pg` package)
- **Existing Assets**: Use the existing `cross_*.json` scramble files

## Project Structure

```
speedcubedb-scrambles/
├── server/
│   ├── index.js          # Express app entry point
│   ├── db.js             # Database connection pool
│   ├── routes/
│   │   ├── scrambles.js  # GET scrambles
│   │   ├── sessions.js   # Session management
│   │   ├── attempts.js   # Record/query attempts
│   │   ├── stats.js      # Statistics endpoints
│   │   └── srs.js        # SRS trainer endpoints
│   └── services/
│       ├── scrambles.js  # Load and serve scrambles from JSON
│       ├── reconstruction.js  # Parse solve reconstructions
│       └── sm2.js        # SM-2 spaced repetition algorithm
├── cross_1_move.json     # Existing scramble data
├── cross_2_move.json
├── ...
└── package.json
```

## API Endpoints

### Scrambles

#### `GET /api/scrambles/random`
Get a random scramble at a specified difficulty.

**Query params:**
- `moves` (required): 1-7, the cross difficulty
- `color` (optional): white, yellow, etc. (default: white)
- `count` (optional): number of scrambles to return (default: 1)

**Response:**
```json
{
  "scrambles": [
    {
      "scramble": "R U R' U' F' U F ...",
      "moves": 3,
      "color": "white"
    }
  ]
}
```

**Implementation notes:**
- Load from existing `cross_X_move.json` files
- Cache in memory on startup for fast access
- Random selection from the array

### Sessions

#### `POST /api/sessions`
Start a new practice session.

**Response:**
```json
{
  "session": {
    "id": 123,
    "started_at": "2026-01-05T10:30:00Z"
  }
}
```

#### `PATCH /api/sessions/:id`
End a session or add notes.

**Body:**
```json
{
  "ended_at": "2026-01-05T11:00:00Z",
  "notes": "Good session, struggled with 5-move crosses"
}
```

#### `GET /api/sessions`
List recent sessions.

**Query params:**
- `limit` (optional): default 10
- `offset` (optional): for pagination

### Attempts

#### `POST /api/attempts`
Record a single attempt.

**Body:**
```json
{
  "session_id": 123,
  "scramble": "R U R' U' F' U F ...",
  "cross_moves": 3,
  "cross_color": "white",
  "pairs_attempted": 2,
  "cross_success": true,
  "pairs_planned": 1,
  "inspection_time_ms": 12500,
  "used_unlimited_time": false,
  "notes": "Missed the blue-red pair location"
}
```

**Response:**
```json
{
  "attempt": {
    "id": 456,
    "session_id": 123,
    "created_at": "2026-01-05T10:35:00Z"
  }
}
```

#### `GET /api/attempts`
Query attempts with filters.

**Query params:**
- `session_id` (optional): filter by session
- `cross_moves` (optional): filter by difficulty
- `date_from` (optional): ISO date string
- `date_to` (optional): ISO date string
- `limit` (optional): default 50
- `offset` (optional): for pagination

### Statistics

#### `GET /api/stats/summary`
Get overall statistics.

**Query params:**
- `date_from` (optional)
- `date_to` (optional)

**Response:**
```json
{
  "total_attempts": 500,
  "total_sessions": 25,
  "overall_cross_success_rate": 78.5,
  "by_difficulty": {
    "1": { "attempts": 50, "success_rate": 98.0 },
    "2": { "attempts": 80, "success_rate": 95.0 },
    "3": { "attempts": 120, "success_rate": 85.0 },
    "4": { "attempts": 100, "success_rate": 72.0 },
    "5": { "attempts": 80, "success_rate": 60.0 },
    "6": { "attempts": 50, "success_rate": 45.0 },
    "7": { "attempts": 20, "success_rate": 30.0 }
  },
  "by_pairs_attempted": {
    "0": { "attempts": 100, "success_rate": 95.0 },
    "1": { "attempts": 200, "success_rate": 80.0 },
    "2": { "attempts": 150, "success_rate": 65.0 },
    "3": { "attempts": 40, "success_rate": 40.0 },
    "4": { "attempts": 10, "success_rate": 20.0 }
  },
  "avg_inspection_time_ms": 11200
}
```

#### `GET /api/stats/daily`
Get daily breakdown for charts.

**Query params:**
- `days` (optional): number of days to return (default: 30)

**Response:**
```json
{
  "daily": [
    {
      "date": "2026-01-05",
      "attempts": 25,
      "success_rate": 80.0,
      "avg_difficulty": 3.5,
      "avg_pairs_attempted": 1.2
    }
  ]
}
```

#### `GET /api/stats/recent-notes`
Get recent attempts with notes for review.

**Query params:**
- `limit` (optional): default 20

### SRS (Spaced Repetition)

#### `GET /api/srs/due`
Get SRS items due for review.

**Query params:**
- `depth` (optional): filter by depth (0-3)
- `limit` (optional): max items to return (default: 10)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "solve_id": 12464,
      "depth": 1,
      "scramble": "D2 F D2 F D2 R2 U2 F' U2 B' F2 L B D R2 B R U' B D2",
      "solver": "Yiheng Wang",
      "result": 4.05,
      "competition": "Zhengzhou Zest 2025",
      "interval_days": 3,
      "repetitions": 2,
      "ease_factor": 2.5
    }
  ],
  "total_due": 8
}
```

#### `POST /api/srs/review`
Record a review and update SRS scheduling.

**Body:**
```json
{
  "srs_item_id": 1,
  "quality": 4,
  "response_time_ms": 12000,
  "user_solution": "R U R' D L ...",
  "notes": "Forgot the key insight about edge orientation"
}
```

**Response:**
```json
{
  "item": {
    "id": 1,
    "next_review_at": "2026-01-08T10:00:00Z",
    "interval_days": 6,
    "ease_factor": 2.6,
    "repetitions": 3
  }
}
```

#### `GET /api/srs/item/:id/solution`
Get the pro's solution for comparison (after attempt).

**Query params:**
- `depth`: how much to reveal (0-3)

**Response:**
```json
{
  "solve_id": 12464,
  "solver": "Yiheng Wang",
  "result": 4.05,
  "segments": {
    "inspection": "x z2 // inspection",
    "cross": "r U2' L' B U' D R2' U R U r U' r' // xxcross",
    "pair2": "R U' R' U' R U R' // 3rd pair",
    "pair3": "y' R U R2' F R F' // 4th pair"
  },
  "moves_at_depth": "r U2' L' B U' D R2' U R U r U' r'",
  "move_count": 13,
  "alg_cubing_url": "https://alg.cubing.net/?setup=..."
}
```

#### `POST /api/srs/add`
Add a solve to SRS training at a specific depth.

**Body:**
```json
{
  "solve_id": 12464,
  "depth": 2,
  "notes": "Great example of xxcross with edge insertion"
}
```

**Response:**
```json
{
  "item": {
    "id": 5,
    "solve_id": 12464,
    "depth": 2,
    "next_review_at": "2026-01-05T10:00:00Z"
  }
}
```

#### `DELETE /api/srs/item/:id`
Remove an item from SRS.

#### `GET /api/srs/stats`
SRS-specific statistics.

**Response:**
```json
{
  "total_items": 50,
  "due_today": 8,
  "by_depth": {
    "0": { "items": 20, "avg_ease": 2.4 },
    "1": { "items": 15, "avg_ease": 2.3 },
    "2": { "items": 10, "avg_ease": 2.1 },
    "3": { "items": 5, "avg_ease": 2.0 }
  },
  "reviews_last_7_days": 45,
  "retention_rate": 0.82
}
```

### Solves Browser

#### `GET /api/solves`
Browse available solves from `cubing.solves`.

**Query params:**
- `solver` (optional): filter by solver name
- `min_result` (optional): minimum solve time
- `max_result` (optional): maximum solve time
- `limit` (optional): default 20
- `offset` (optional): for pagination

**Response:**
```json
{
  "solves": [
    {
      "id": 12464,
      "solver": "Yiheng Wang",
      "result": 4.05,
      "competition": "Zhengzhou Zest 2025",
      "solve_date": "2025-12-29",
      "scramble": "D2 F D2 F D2 R2...",
      "has_reconstruction": true,
      "stm_cross1": 13,
      "in_srs": [1, 2]  // depths already in SRS
    }
  ],
  "total": 250
}
```

#### `GET /api/solves/:id`
Get full solve details including parsed reconstruction.

**Response:**
```json
{
  "id": 12464,
  "solver": "Yiheng Wang",
  "result": 4.05,
  "competition": "Zhengzhou Zest 2025",
  "scramble": "D2 F D2 F D2 R2 U2 F' U2 B' F2 L B D R2 B R U' B D2",
  "reconstruction": "...",
  "parsed_segments": {
    "inspection": "x z2",
    "cross": "r U2' L' B U' D R2' U R U r U' r'",
    "pair1": "(in xxcross)",
    "pair2": "R U' R' U' R U R'",
    "pair3": "y' R U R2' F R F'",
    "pair4": null,
    "oll": "U2 R' U' F' U F R",
    "pll": "U D' R2 U R' U R' U' R U' R2 U' D R' U R"
  },
  "alg_cubing_url": "https://alg.cubing.net/?..."
}
```

## Database Connection

```javascript
// server/db.js
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'connectingservices',
  user: process.env.USER || 'clayarnold',
});

module.exports = pool;
```

## Dependencies to Add

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "cors": "^2.8.5"
  }
}
```

## Running the Server

Add to package.json:
```json
{
  "scripts": {
    "server": "node server/index.js",
    "dev": "node --watch server/index.js"
  }
}
```

Default port: 3001 (to avoid conflicts with frontend dev servers)

## Error Handling

All endpoints should return consistent error format:
```json
{
  "error": {
    "message": "Session not found",
    "code": "NOT_FOUND"
  }
}
```

## CORS

Enable CORS for local development (frontend will likely be on a different port).
