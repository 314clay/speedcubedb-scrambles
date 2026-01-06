# Phase 1: Database Schema

## Overview

Create the PostgreSQL schema for the Cross Planning Trainer. This will store all practice sessions, individual attempts, and enable the statistics/tracking features.

## Connection Details

Use the existing ConnectingServices database:
- Host: localhost
- Port: 5433
- Database: connectingservices
- Schema: Create a new schema called `cross_trainer`

## Tables to Create

### 1. `cross_trainer.practice_sessions`

Represents a single practice session (e.g., "my 20-minute practice on Jan 5th").

```sql
CREATE TABLE cross_trainer.practice_sessions (
    id SERIAL PRIMARY KEY,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,  -- Optional session-level notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. `cross_trainer.attempts`

Each individual cross planning attempt within a session.

```sql
CREATE TABLE cross_trainer.attempts (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES cross_trainer.practice_sessions(id) ON DELETE CASCADE,

    -- Scramble info
    scramble TEXT NOT NULL,              -- The scramble notation (e.g., "R U R' U' ...")
    cross_moves INTEGER NOT NULL,        -- Difficulty: 1-7 moves required
    cross_color VARCHAR(10) DEFAULT 'white',  -- white, yellow, green, blue, red, orange

    -- What the user attempted
    pairs_attempted INTEGER NOT NULL DEFAULT 0,  -- How many F2L pairs they tried to plan (0-4)

    -- Results
    cross_success BOOLEAN,               -- Did they successfully plan the cross?
    pairs_planned INTEGER DEFAULT 0,     -- How many pairs they actually planned successfully (0-4)

    -- Timing (optional)
    inspection_time_ms INTEGER,          -- How long they took to plan (if timed)
    used_unlimited_time BOOLEAN DEFAULT FALSE,  -- Was this unlimited inspection?

    -- Notes
    notes TEXT,                          -- What happened, what they learned

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX idx_attempts_session_id ON cross_trainer.attempts(session_id);
CREATE INDEX idx_attempts_cross_moves ON cross_trainer.attempts(cross_moves);
CREATE INDEX idx_attempts_created_at ON cross_trainer.attempts(created_at);
```

### 3. `cross_trainer.daily_summaries` (Materialized View or Table)

For quick access to daily stats. Can be a materialized view refreshed periodically, or computed on-the-fly.

```sql
-- Option A: View (computed on query)
CREATE VIEW cross_trainer.daily_summaries AS
SELECT
    DATE(created_at) as practice_date,
    COUNT(*) as total_attempts,
    COUNT(*) FILTER (WHERE cross_success = true) as successful_crosses,
    ROUND(100.0 * COUNT(*) FILTER (WHERE cross_success = true) / NULLIF(COUNT(*), 0), 1) as cross_success_rate,
    AVG(cross_moves) as avg_difficulty,
    AVG(pairs_attempted) as avg_pairs_attempted,
    AVG(pairs_planned) FILTER (WHERE cross_success = true) as avg_pairs_planned_on_success,
    AVG(inspection_time_ms) FILTER (WHERE inspection_time_ms IS NOT NULL) as avg_inspection_time_ms
FROM cross_trainer.attempts
GROUP BY DATE(created_at);
```

## Migration Instructions

1. Use Alembic in `~/w/connect/database/`
2. Create the schema first: `CREATE SCHEMA IF NOT EXISTS cross_trainer;`
3. Create the tables in order (sessions first, then attempts)
4. Create indexes and views

### 4. `cross_trainer.srs_items`

SRS items for studying real elite solves from `cubing.solves`.

```sql
CREATE TABLE cross_trainer.srs_items (
    id SERIAL PRIMARY KEY,

    -- Source solve reference
    solve_id INTEGER REFERENCES cubing.solves(id),

    -- Training configuration (0=cross, 1=+1pair, 2=+2pairs, 3=+3pairs)
    depth INTEGER NOT NULL CHECK (depth BETWEEN 0 AND 3),

    -- SM-2 algorithm fields
    ease_factor DECIMAL(4,2) DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    repetitions INTEGER DEFAULT 0,
    next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_reviewed_at TIMESTAMP WITH TIME ZONE,

    -- Performance tracking
    times_correct INTEGER DEFAULT 0,
    times_incorrect INTEGER DEFAULT 0,

    -- User notes about this specific solve/pattern
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(solve_id, depth)  -- One SRS item per solve per depth
);

CREATE INDEX idx_srs_next_review ON cross_trainer.srs_items(next_review_at);
CREATE INDEX idx_srs_solve_id ON cross_trainer.srs_items(solve_id);
```

### 5. `cross_trainer.srs_reviews`

History of SRS reviews for analytics.

```sql
CREATE TABLE cross_trainer.srs_reviews (
    id SERIAL PRIMARY KEY,
    srs_item_id INTEGER REFERENCES cross_trainer.srs_items(id) ON DELETE CASCADE,

    -- SM-2 quality rating (0-5)
    quality INTEGER CHECK (quality BETWEEN 0 AND 5),
    response_time_ms INTEGER,

    -- User's solution attempt (optional)
    user_solution TEXT,
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_srs_reviews_item ON cross_trainer.srs_reviews(srs_item_id);
```

## Validation

After creating the schema, verify with:
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'cross_trainer';

-- Expected: practice_sessions, attempts, srs_items, srs_reviews

-- Check columns
\d cross_trainer.attempts
\d cross_trainer.practice_sessions
\d cross_trainer.srs_items
\d cross_trainer.srs_reviews

-- Verify cubing.solves reference works
SELECT COUNT(*) FROM cubing.solves WHERE puzzle = '3x3' AND reconstruction IS NOT NULL;
```
