# Phase 5 Implementation Prompt

## Context

Phases 1-4 of the Cross Planning Trainer have been implemented:
- Database schema (`cross_trainer` schema with `practice_sessions`, `attempts` tables)
- Backend API (Express.js server with scrambles, sessions, attempts, stats endpoints)
- Frontend trainer (React app with keyboard shortcuts, timer, result input)
- Frontend stats page (charts, breakdowns, session history)

## Your Task

Implement Phase 5: **SRS Solve Trainer** - a spaced repetition trainer that uses real elite solves from `cubing.solves` (250+ reconstructed competition solves).

## Reference Documentation

Read these docs for full specifications:
- `/docs/05-srs-solve-trainer.md` - Complete Phase 5 spec
- `/docs/01-database-schema.md` - Has SRS table definitions (sections 4 & 5)
- `/docs/02-backend-api.md` - Has SRS API endpoints (search for "### SRS")

## Key Implementation Steps

### 1. Database Tables

Add to `cross_trainer` schema (run migration via Alembic in `~/w/connect/database/`):

```sql
-- cross_trainer.srs_items (references cubing.solves)
-- cross_trainer.srs_reviews (review history)
```

See `01-database-schema.md` for full table definitions.

### 2. Backend Services

Create in `server/services/`:

**`reconstruction.js`** - Parse solve reconstructions:
```javascript
// Parse reconstruction text into segments:
// { inspection, cross, pair1, pair2, pair3, pair4, oll, pll }
// Handle xcross/xxcross (includes pairs in cross)
function parseReconstruction(text) { ... }
```

**`sm2.js`** - SM-2 spaced repetition algorithm:
```javascript
// Input: current item state + quality rating (0-5)
// Output: new ease_factor, interval_days, repetitions, next_review_at
function sm2(item, quality) { ... }
```

### 3. Backend Routes

Create `server/routes/srs.js` with endpoints:
- `GET /api/srs/due` - Items due for review
- `POST /api/srs/review` - Record review, update scheduling
- `GET /api/srs/item/:id/solution` - Get pro solution at depth
- `POST /api/srs/add` - Add solve to SRS
- `DELETE /api/srs/item/:id` - Remove from SRS
- `GET /api/srs/stats` - SRS statistics

Create `server/routes/solves.js` for browsing:
- `GET /api/solves` - Browse cubing.solves
- `GET /api/solves/:id` - Get full solve with parsed reconstruction

See `02-backend-api.md` for full request/response specs.

### 4. Frontend Components

Add to `frontend/src/`:

**`pages/SRS.jsx`** - Main SRS page with tabs:
- Train tab (review due items)
- Browse tab (find solves to add)

**`components/SRSTrainer.jsx`**:
- Shows scramble + solve metadata
- "Show Solution" button reveals pro solution at configured depth
- Quality rating buttons (0-5) after viewing solution
- Notes input
- Keyboard shortcuts: 0-5 for rating, Space to show solution

**`components/SRSBrowser.jsx`**:
- List of solves from cubing.solves
- Filter by solver, result time
- Buttons to add at each depth (0-3)
- Shows which depths already in SRS

**`components/SolutionReveal.jsx`**:
- Displays parsed reconstruction up to current depth
- Link to alg.cubing.net
- Move count

### 5. Navigation

Update navigation to include SRS:
```
[Train] [SRS] [Stats]
```

### 6. API Client

Add to `frontend/src/api/client.js`:
```javascript
// SRS endpoints
getSRSDue(depth, limit)
recordSRSReview(itemId, quality, responseTimeMs, notes)
getSRSSolution(itemId, depth)
addToSRS(solveId, depth, notes)
removeFromSRS(itemId)
getSRSStats()

// Solves browser
getSolves(filters)
getSolve(id)
```

## Database Connection

Same as existing:
- Host: localhost
- Port: 5433
- Database: connectingservices
- Existing table to query: `cubing.solves`

## Testing

After implementation, verify:
- [ ] Can browse solves from cubing.solves
- [ ] Can add a solve to SRS at depth 0, 1, 2, 3
- [ ] Due items appear in trainer
- [ ] Solution reveal shows correct segments for each depth
- [ ] Quality ratings update SRS scheduling correctly
- [ ] Stats show SRS metrics
- [ ] Navigation between Train/SRS/Stats works

## Notes

- The `cubing.solves` table already exists with 250+ solves
- Reconstructions use comments like `// xcross`, `// 2nd pair`, etc.
- Some solves have `xxcross` (cross + 2 pairs in one)
- Handle missing segments gracefully (some solves may not have all pairs labeled)
