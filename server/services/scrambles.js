const fs = require('fs');
const path = require('path');

// Cache scrambles in memory by move count
const scrambleCache = new Map();

function loadScrambles() {
  const projectRoot = path.join(__dirname, '../..');

  for (let moves = 1; moves <= 7; moves++) {
    const filePath = path.join(projectRoot, `cross_${moves}_move.json`);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      scrambleCache.set(moves, data);
      console.log(`Loaded ${data.length} scrambles for ${moves}-move cross`);
    } catch (err) {
      console.error(`Failed to load ${filePath}:`, err.message);
      scrambleCache.set(moves, []);
    }
  }
}

function getRandomScrambles(moves, count = 1, color = 'white') {
  const scrambles = scrambleCache.get(moves) || [];

  if (scrambles.length === 0) {
    return [];
  }

  const result = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * scrambles.length);
    const scramble = scrambles[randomIndex];

    result.push({
      scramble: scramble,
      moves: moves,
      color: color
    });
  }

  return result;
}

function getScrambleCount(moves) {
  const scrambles = scrambleCache.get(moves);
  return scrambles ? scrambles.length : 0;
}

module.exports = {
  loadScrambles,
  getRandomScrambles,
  getScrambleCount
};
