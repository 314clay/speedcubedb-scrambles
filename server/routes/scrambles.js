const express = require('express');
const router = express.Router();
const scrambleService = require('../services/scrambles');

// GET /api/scrambles/random
router.get('/random', (req, res) => {
  const moves = parseInt(req.query.moves);
  const color = req.query.color || 'white';
  const count = parseInt(req.query.count) || 1;

  if (!moves || moves < 1 || moves > 7) {
    return res.status(400).json({
      error: {
        message: 'moves parameter required (1-7)',
        code: 'INVALID_PARAMS'
      }
    });
  }

  if (count < 1 || count > 100) {
    return res.status(400).json({
      error: {
        message: 'count must be between 1 and 100',
        code: 'INVALID_PARAMS'
      }
    });
  }

  const scrambles = scrambleService.getRandomScrambles(moves, count, color);

  if (scrambles.length === 0) {
    return res.status(404).json({
      error: {
        message: `No scrambles available for ${moves}-move cross`,
        code: 'NOT_FOUND'
      }
    });
  }

  res.json({ scrambles });
});

// GET /api/scrambles/count - Get count of available scrambles per difficulty
router.get('/count', (req, res) => {
  const counts = {};
  for (let moves = 1; moves <= 7; moves++) {
    counts[moves] = scrambleService.getScrambleCount(moves);
  }
  res.json({ counts });
});

module.exports = router;
