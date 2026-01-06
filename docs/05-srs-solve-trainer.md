# Phase 5: SRS Solve Trainer

## Overview

An SRS (Spaced Repetition System) trainer that uses real elite solves from `cubing.solves` as training material. Instead of random scrambles, you study actual competition solves and learn the patterns/tricks the pros use.

## Core Concept

Train at different **depths** of planning:

| Depth | What you plan | After attempt, reveal shows |
|-------|---------------|----------------------------|
| 0 | Cross only | Pro's cross solution |
| 1 | Cross + 1 pair | Pro's xcross or cross + 1st pair |
| 2 | Cross + 2 pairs | Through 2nd pair |
| 3 | Cross + 3 pairs | Through 3rd pair |

## Data Source

Uses existing `cubing.solves` table (250+ reconstructed solves):

```sql
SELECT
    id,
    scramble,
    reconstruction,
    solver,
    result,
    competition,
    time_cross1,
    stm_cross1
FROM cubing.solves
WHERE puzzle = '3x3'
  AND reconstruction IS NOT NULL
  AND scramble IS NOT NULL;
```

## Reconstruction Parsing

The `reconstruction` field contains commented steps like:
```
x z2 // inspection
r U2' L' B U' D R2' U R U r U' r' // xxcross
R U' R' U' R U R' // 3rd pair
y' R U R2' F R F' // 4th pair
U2 R' U' F' U F R // OLL
U D' R2 U R' U R' U' R U' R2 U' D R' U R // PLL
```

**Parse into segments:**
- Cross/XCross: lines containing `cross`, `xcross`, `xxcross`
- 1st pair: line containing `1st pair` or part of xcross
- 2nd pair: line containing `2nd pair`
- 3rd pair: line containing `3rd pair`
- 4th pair: line containing `4th pair`

```javascript
function parseReconstruction(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const segments = {
    inspection: null,
    cross: null,      // or xcross/xxcross
    pair1: null,
    pair2: null,
    pair3: null,
    pair4: null,
    oll: null,
    pll: null
  };

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('inspection')) segments.inspection = line;
    else if (lower.includes('xxcross')) segments.cross = line; // includes 2 pairs
    else if (lower.includes('xcross')) segments.cross = line;  // includes 1 pair
    else if (lower.includes('cross')) segments.cross = line;
    else if (lower.includes('1st pair')) segments.pair1 = line;
    else if (lower.includes('2nd pair')) segments.pair2 = line;
    else if (lower.includes('3rd pair')) segments.pair3 = line;
    else if (lower.includes('4th pair')) segments.pair4 = line;
    else if (lower.includes('oll')) segments.oll = line;
    else if (lower.includes('pll')) segments.pll = line;
  }

  return segments;
}
```

## Database Schema

Add to `cross_trainer` schema:

```sql
-- SRS items for solve study
CREATE TABLE cross_trainer.srs_items (
    id SERIAL PRIMARY KEY,

    -- Source solve reference
    solve_id INTEGER REFERENCES cubing.solves(id),

    -- Training configuration
    depth INTEGER NOT NULL CHECK (depth BETWEEN 0 AND 3),  -- 0=cross, 1=+1pair, etc.

    -- SRS algorithm fields (SM-2 based)
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

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(solve_id, depth)  -- One SRS item per solve per depth
);

CREATE INDEX idx_srs_next_review ON cross_trainer.srs_items(next_review_at);
CREATE INDEX idx_srs_solve_id ON cross_trainer.srs_items(solve_id);

-- Review history for analytics
CREATE TABLE cross_trainer.srs_reviews (
    id SERIAL PRIMARY KEY,
    srs_item_id INTEGER REFERENCES cross_trainer.srs_items(id) ON DELETE CASCADE,

    -- What happened
    quality INTEGER CHECK (quality BETWEEN 0 AND 5),  -- SM-2 quality rating
    response_time_ms INTEGER,

    -- User's solution attempt (optional, for comparison)
    user_solution TEXT,

    -- Notes for this specific review
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_srs_reviews_item ON cross_trainer.srs_reviews(srs_item_id);
```

## SM-2 Algorithm

Standard spaced repetition algorithm:

```javascript
function sm2(item, quality) {
  // quality: 0-5 (0-2 = fail, 3-5 = pass)

  let { easeFactor, interval, repetitions } = item;

  if (quality < 3) {
    // Failed - reset
    repetitions = 0;
    interval = 1;
  } else {
    // Passed
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  easeFactor = Math.max(1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewAt: nextReview
  };
}
```

## API Endpoints

### `GET /api/srs/due`
Get items due for review.

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
      "repetitions": 2
    }
  ]
}
```

### `POST /api/srs/review`
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

### `GET /api/srs/item/:id/solution`
Get the pro's solution for comparison (after attempt).

**Query params:**
- `depth`: how much to reveal (0-3)

**Response:**
```json
{
  "solve_id": 12464,
  "solver": "Yiheng Wang",
  "segments": {
    "cross": "r U2' L' B U' D R2' U R U r U' r' // xxcross",
    "pair1": "(included in xxcross)",
    "pair2": "R U' R' U' R U R' // 3rd pair"
  },
  "moves_shown": "r U2' L' B U' D R2' U R U r U' r' R U' R' U' R U R'",
  "move_count": 20,
  "alg_cubing_url": "https://alg.cubing.net/?setup=..."
}
```

### `POST /api/srs/add`
Add a solve to SRS training at a specific depth.

**Body:**
```json
{
  "solve_id": 12464,
  "depth": 2,
  "notes": "Great example of xxcross with edge insertion"
}
```

### `GET /api/srs/stats`
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

## UI Components

### `<SRSTrainer />`
Main SRS training view.

```
┌─────────────────────────────────────────────────────────────┐
│  SRS Trainer                         [8 due] [Train] [Stats]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Training: Cross + 1 pair (depth 1)           [Change ▼]   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │   D2 F D2 F D2 R2 U2 F' U2 B' F2 L B D R2 B R U' B D2   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Yiheng Wang - 4.05s @ Zhengzhou Zest 2025                 │
│  Rep: 2 | Interval: 3 days | Ease: 2.5                     │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [Show Solution]                                            │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  After viewing solution, rate your recall:                  │
│                                                             │
│  [0-Forgot] [1-Hard] [2-Medium] [3-Easy] [4-Good] [5-Perfect]│
│                                                             │
│  Notes: [________________________]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Solution Reveal Panel

```
┌─────────────────────────────────────────────────────────────┐
│  PRO SOLUTION (Cross + 1 pair)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  r U2' L' B U' D R2' U R U r U' r' // xxcross              │
│                                                             │
│  13 moves | Includes: cross + 1st pair                     │
│                                                             │
│  [View on alg.cubing.net ↗]                                │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Key insights:                                              │
│  • Uses wide r move to set up edge                         │
│  • D move slots edge while setting up corner               │
│                                                             │
│  Your notes on this solve:                                  │
│  "Edge orientation trick - remember the wide move"         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### `<SRSBrowser />`
Browse all solves and add to SRS.

```
┌─────────────────────────────────────────────────────────────┐
│  Browse Solves                    [Filter ▼] [Search]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Yiheng Wang - 2.40s - Beijing 2025                  │   │
│  │ xxcross in 9 moves (!)                              │   │
│  │ [+Depth 0] [+Depth 1] [+Depth 2] [+Depth 3]        │   │
│  │ Already in SRS: Depth 1 ✓                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Max Park - 3.13s - WCA Worlds 2023                  │   │
│  │ Clean cross + efficient F2L                         │   │
│  │ [+Depth 0] [+Depth 1] [+Depth 2] [+Depth 3]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Workflow

1. **Browse solves** → Find interesting patterns → Add to SRS at desired depth
2. **Daily review** → App shows due items → Study scramble → Reveal solution → Rate recall
3. **Progress** → SRS schedules reviews optimally → Pattern retention improves

## Quality Ratings (SM-2)

| Rating | Meaning | Keyboard |
|--------|---------|----------|
| 0 | Complete blackout, no recall | `0` |
| 1 | Wrong answer, but recognized solution | `1` |
| 2 | Wrong answer, solution seemed easy | `2` |
| 3 | Correct with serious difficulty | `3` |
| 4 | Correct with some hesitation | `4` |
| 5 | Perfect, instant recall | `5` |

## Integration with Random Trainer

The SRS trainer is a **separate mode** from the random scramble trainer (Phases 3-4):

- **Random Trainer**: Practice general cross planning skill
- **SRS Trainer**: Study and memorize specific elite patterns

Navigation:
```
[Train Random] [Train SRS] [Stats]
```

Stats page can show both:
- Random practice stats
- SRS review stats and retention curves

## Future Enhancements

- **Auto-add failed randoms**: When you fail a random scramble, option to add it to SRS
- **Pattern tagging**: Tag solves by technique (xxcross, keyhole, edge control)
- **Solver filtering**: Focus on specific solver's style
- **Difficulty sorting**: Sort by cross move count or xcross efficiency
