# Cross Planning Trainer - Project Overview

## Summary

A web-based training tool for practicing Rubik's cube cross planning and F2L pair tracking during inspection time.

## Implementation Phases

Run these prompts in order:

| Phase | File | Description |
|-------|------|-------------|
| 1 | [01-database-schema.md](./01-database-schema.md) | PostgreSQL schema in `cross_trainer` schema |
| 2 | [02-backend-api.md](./02-backend-api.md) | Express.js API for scrambles and recording |
| 3 | [03-frontend-trainer.md](./03-frontend-trainer.md) | React training interface with keyboard shortcuts |
| 4 | [04-frontend-stats.md](./04-frontend-stats.md) | Statistics and progress tracking page |
| 5 | [05-srs-solve-trainer.md](./05-srs-solve-trainer.md) | SRS trainer using real elite solves from `cubing.solves` |

## Core Features (v1)

### Training
- Difficulty levels (1-7 moves for cross)
- Pair planning targets (0-4 F2L pairs)
- Partial success tracking (attempted 3, planned 2)
- Notes/annotations per attempt
- Cross color selection (W/Y/G/B/R/O)
- Timed inspection (15s WCA-style) or unlimited mode
- Keyboard shortcuts for fast workflow

### Statistics
- Daily practice log
- Success rate by difficulty
- Success rate by pairs attempted
- Historical trends/graphs
- Session summaries
- Recent notes review

### SRS Solve Trainer
- Study real elite solves from `cubing.solves` (250+ reconstructions)
- Train at different depths: cross only, +1 pair, +2 pairs, +3 pairs
- SM-2 spaced repetition algorithm for optimal retention
- Browse solves and add to SRS deck
- Compare your solution to pro solutions
- Track retention rates and review stats

## Tech Stack

- **Database**: PostgreSQL (existing ConnectingServices on port 5433)
- **Backend**: Node.js + Express
- **Frontend**: React (Vite) + Tailwind CSS
- **Data**: Existing scramble JSON files from SpeedCubeDB

## Future Considerations

- Smart cube Bluetooth integration (auto-verify cross solved)
- XCross mode (solve cross + 1 pair simultaneously)
- Blindfold verification mode
- Competition simulation with penalties
- Solution reveal/hints
- 3D cube visualizer

## Directory Structure (Final)

```
speedcubedb-scrambles/
├── docs/                    # Implementation prompts
├── server/                  # Express.js backend
│   ├── index.js
│   ├── db.js
│   ├── routes/
│   │   ├── scrambles.js
│   │   ├── sessions.js
│   │   ├── attempts.js
│   │   ├── stats.js
│   │   └── srs.js           # SRS endpoints
│   └── services/
│       ├── scrambles.js
│       ├── reconstruction.js # Parse solve reconstructions
│       └── sm2.js           # SM-2 algorithm
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Trainer.jsx
│   │   │   ├── SRSTrainer.jsx
│   │   │   ├── SRSBrowser.jsx
│   │   │   └── ...
│   │   ├── hooks/
│   │   ├── api/
│   │   └── pages/
│   │       ├── Train.jsx
│   │       ├── SRS.jsx
│   │       └── Stats.jsx
│   └── vite.config.js
├── cross_*.json             # Scramble data files
├── download_scrambles.js    # Original scramble fetcher
├── get_scramble.js          # CLI scramble tool
└── package.json
```
