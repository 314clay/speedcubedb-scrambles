# Phase 3: Frontend - Training Interface

## Overview

Build the main training interface where the user practices cross planning. This is the primary interaction surface - it needs to be fast, keyboard-friendly, and frictionless.

## Tech Stack

- **Framework**: React (Vite for fast dev)
- **Styling**: Tailwind CSS or simple CSS (keep it minimal)
- **State**: React hooks (useState, useEffect) - no need for Redux
- **HTTP**: fetch API

## Project Structure

```
speedcubedb-scrambles/
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Trainer.jsx        # Main training view
│   │   │   ├── ScrambleDisplay.jsx
│   │   │   ├── ControlPanel.jsx   # Difficulty, pairs, color selectors
│   │   │   ├── ResultInput.jsx    # Success/fail/partial input
│   │   │   ├── Timer.jsx          # Inspection timer
│   │   │   ├── NotesInput.jsx
│   │   │   └── SessionBar.jsx     # Current session info
│   │   ├── hooks/
│   │   │   ├── useSession.js      # Session management
│   │   │   ├── useScramble.js     # Fetch scrambles
│   │   │   └── useKeyboard.js     # Keyboard shortcuts
│   │   ├── api/
│   │   │   └── client.js          # API client
│   │   └── styles/
│   │       └── index.css
│   ├── index.html
│   └── vite.config.js
└── server/
```

## Core UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Cross Planning Trainer                    [Stats] [Session]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │          R U R' U' F' U F R2 U' R' U R              │   │
│  │                    (scramble)                       │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌───────────────────┐  ┌───────────────────┐              │
│  │ Difficulty: [3▼]  │  │ Planning: [2▼] pairs            │
│  └───────────────────┘  └───────────────────┘              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Timer: 15.0s  [Start] [∞]              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                       RESULTS                               │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│    Cross:  [✓ Success] [✗ Fail]                            │
│                                                             │
│    Pairs planned: [0] [1] [2]  (when attempting 2)         │
│                                                             │
│    Notes: [________________________] (optional)             │
│                                                             │
│              [Submit & Next] (Enter)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Keyboard Shortcuts (Critical UX)

| Key | Action |
|-----|--------|
| `Space` | Start/stop inspection timer |
| `Enter` | Submit result and load next scramble |
| `1-7` | Set difficulty (when not in notes field) |
| `Shift+0-4` | Set pairs attempting |
| `s` | Mark cross as Success |
| `f` | Mark cross as Fail |
| `0-4` | Set pairs planned (after cross result) |
| `n` | Focus notes field |
| `Escape` | Clear/cancel current input, blur notes |
| `Tab` | Cycle through result inputs |

## Component Specifications

### `<Trainer />`
Main container component. Manages:
- Current session (auto-creates on first attempt if none)
- Current scramble state
- Result state before submission
- Keyboard event listeners

### `<ScrambleDisplay scramble={string} />`
Large, readable display of the current scramble.
- Monospace font
- Large size (readable from a distance while holding cube)
- Copy button (optional)

### `<ControlPanel />`
Settings for the current training:
- **Difficulty dropdown**: 1-7 moves
- **Pairs attempting dropdown**: 0-4
- **Cross color dropdown**: white, yellow, green, blue, red, orange
- **Timer mode toggle**: 15s WCA / Unlimited

These persist across scrambles (user typically trains at same difficulty for a while).

### `<Timer mode="wca" | "unlimited" />`
Inspection timer:
- **WCA mode**: 15-second countdown
  - Audio beep at 8s and 12s (optional, can be toggled)
  - Visual warning colors (green → yellow at 8s → red at 12s)
  - Auto-records inspection_time_ms when stopped
- **Unlimited mode**: Count-up timer
  - No pressure, for learning
  - Still records time taken

### `<ResultInput />`
The input area for recording results:
1. **Cross success**: Two buttons - Success (green) / Fail (red)
2. **Pairs planned**: Only shown if pairs_attempted > 0
   - Number buttons from 0 to pairs_attempted
   - Disabled until cross result is selected
3. Clear visual state showing what's been selected

### `<NotesInput />`
Optional text input for notes.
- Single line or small textarea
- Keyboard shortcut `n` focuses it
- `Escape` blurs it
- Not required to submit

### `<SessionBar />`
Shows current session info:
- Session start time
- Attempts this session
- Success rate this session
- "End Session" button

## State Flow

```
1. Page loads
   → Check for active session (or create one)
   → Load scramble at default difficulty

2. User adjusts settings (difficulty, pairs, color)
   → Settings persist in localStorage
   → New scramble loaded if difficulty changes

3. User starts timer (Space)
   → Timer begins countdown/countup
   → User studies scramble, plans cross + pairs

4. User stops timer (Space)
   → Time recorded
   → Focus moves to result input

5. User records result
   → Press 's' for success or 'f' for fail
   → If pairs_attempted > 0, press number for pairs planned
   → Optionally add notes

6. User submits (Enter)
   → POST to /api/attempts
   → Load next scramble
   → Reset result state
   → Timer resets (doesn't auto-start)
```

## API Integration

```javascript
// api/client.js
const API_BASE = 'http://localhost:3001/api';

export async function getScramble(moves, count = 1) {
  const res = await fetch(`${API_BASE}/scrambles/random?moves=${moves}&count=${count}`);
  return res.json();
}

export async function createSession() {
  const res = await fetch(`${API_BASE}/sessions`, { method: 'POST' });
  return res.json();
}

export async function recordAttempt(attempt) {
  const res = await fetch(`${API_BASE}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attempt),
  });
  return res.json();
}
```

## localStorage Persistence

Store user preferences:
```javascript
{
  "crossTrainer": {
    "difficulty": 3,
    "pairsAttempting": 1,
    "crossColor": "white",
    "timerMode": "wca",
    "audioAlerts": true
  }
}
```

## Visual Design Notes

- **Dark mode friendly**: Assume dark background, light text
- **High contrast**: Scramble must be very readable
- **Large touch targets**: Buttons should be easy to tap on mobile
- **Minimal chrome**: Focus on the scramble and results
- **Color coding**:
  - Success: Green
  - Fail: Red
  - Partial (some pairs): Yellow/orange
  - Timer warning states: Green → Yellow → Red

## Responsive Behavior

- Desktop: Full layout as shown
- Mobile: Stack vertically, larger buttons
- Keyboard shortcuts only apply on desktop (touch handles mobile)

## Error States

- API down: Show cached scrambles from localStorage, queue attempts for later sync
- Invalid session: Auto-create new session
- Network error on submit: Retry with exponential backoff, show indicator

## Testing Checklist

- [ ] Can load scrambles at each difficulty (1-7)
- [ ] Timer works in both modes
- [ ] Keyboard shortcuts all function
- [ ] Results save to database
- [ ] Session persists across page refresh
- [ ] Settings persist in localStorage
- [ ] Works on mobile (touch)
