/**
 * Parse solve reconstructions into segments
 * Handles cross, xcross, xxcross, and F2L pair notation
 */

function parseReconstruction(text) {
  if (!text) return null;

  const lines = text.split('\n').filter(l => l.trim());
  const segments = {
    inspection: null,
    cross: null,
    crossType: 'cross', // 'cross', 'xcross', or 'xxcross'
    pair1: null,
    pair2: null,
    pair3: null,
    pair4: null,
    oll: null,
    pll: null,
  };

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower.includes('inspection')) {
      segments.inspection = line;
    } else if (lower.includes('xxcross')) {
      segments.cross = line;
      segments.crossType = 'xxcross';
      // xxcross includes cross + 2 pairs
      segments.pair1 = '(included in xxcross)';
      segments.pair2 = '(included in xxcross)';
    } else if (lower.includes('xcross')) {
      segments.cross = line;
      segments.crossType = 'xcross';
      // xcross includes cross + 1 pair
      segments.pair1 = '(included in xcross)';
    } else if (lower.includes('cross')) {
      segments.cross = line;
      segments.crossType = 'cross';
    } else if (lower.includes('1st pair') || lower.includes('first pair')) {
      segments.pair1 = line;
    } else if (lower.includes('2nd pair') || lower.includes('second pair')) {
      segments.pair2 = line;
    } else if (lower.includes('3rd pair') || lower.includes('third pair')) {
      segments.pair3 = line;
    } else if (lower.includes('4th pair') || lower.includes('fourth pair')) {
      segments.pair4 = line;
    } else if (lower.includes('oll')) {
      segments.oll = line;
    } else if (lower.includes('pll')) {
      segments.pll = line;
    }
  }

  return segments;
}

/**
 * Extract just the moves from a line (strip comments)
 */
function extractMoves(line) {
  if (!line || line.startsWith('(included')) return '';
  // Remove comments (anything after //)
  const withoutComments = line.split('//')[0].trim();
  return withoutComments;
}

/**
 * Get the solution at a specific depth
 * @param {object} segments - parsed reconstruction segments
 * @param {number} depth - 0=cross, 1=+1pair, 2=+2pairs, 3=+3pairs
 */
function getSolutionAtDepth(segments, depth) {
  if (!segments) return { moves: '', moveCount: 0, segmentsShown: [] };

  const segmentsShown = [];
  let moves = [];

  // Always include cross
  if (segments.cross) {
    segmentsShown.push({
      name: segments.crossType,
      line: segments.cross,
    });
    moves.push(extractMoves(segments.cross));
  }

  // For xcross/xxcross, pairs are already included
  const pairsIncluded = segments.crossType === 'xxcross' ? 2 : segments.crossType === 'xcross' ? 1 : 0;

  // Add additional pairs based on depth
  const pairsToAdd = Math.max(0, depth - pairsIncluded);

  if (pairsToAdd >= 1 && segments.pair1 && !segments.pair1.startsWith('(included')) {
    segmentsShown.push({ name: '1st pair', line: segments.pair1 });
    moves.push(extractMoves(segments.pair1));
  }
  if (pairsToAdd >= 2 && segments.pair2 && !segments.pair2.startsWith('(included')) {
    segmentsShown.push({ name: '2nd pair', line: segments.pair2 });
    moves.push(extractMoves(segments.pair2));
  }
  if (pairsToAdd >= 3 && segments.pair3 && !segments.pair3.startsWith('(included')) {
    segmentsShown.push({ name: '3rd pair', line: segments.pair3 });
    moves.push(extractMoves(segments.pair3));
  }

  const movesString = moves.filter(m => m).join(' ');
  const moveCount = countMoves(movesString);

  return {
    moves: movesString,
    moveCount,
    segmentsShown,
  };
}

/**
 * Count STM (Slice Turn Metric) moves
 */
function countMoves(movesString) {
  if (!movesString) return 0;
  // Split by spaces and filter out empty/rotations
  const moves = movesString.split(/\s+/).filter(m => {
    if (!m) return false;
    // Skip rotations (x, y, z and their variants)
    if (/^[xyz]2?'?$/i.test(m)) return false;
    return true;
  });
  return moves.length;
}

/**
 * Generate alg.cubing.net URL
 */
function generateAlgCubingUrl(scramble, solution) {
  const setup = encodeURIComponent(scramble || '');
  const alg = encodeURIComponent(solution || '');
  return `https://alg.cubing.net/?setup=${setup}&alg=${alg}`;
}

module.exports = {
  parseReconstruction,
  extractMoves,
  getSolutionAtDepth,
  countMoves,
  generateAlgCubingUrl,
};
