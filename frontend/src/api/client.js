const API_BASE = '/api';

export async function getScramble(moves, count = 1) {
  const res = await fetch(`${API_BASE}/scrambles/random?moves=${moves}&count=${count}`);
  if (!res.ok) throw new Error('Failed to fetch scramble');
  return res.json();
}

export async function createSession() {
  const res = await fetch(`${API_BASE}/sessions`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to create session');
  return res.json();
}

export async function endSession(sessionId, notes) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ended_at: new Date().toISOString(), notes }),
  });
  if (!res.ok) throw new Error('Failed to end session');
  return res.json();
}

export async function recordAttempt(attempt) {
  const res = await fetch(`${API_BASE}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attempt),
  });
  if (!res.ok) throw new Error('Failed to record attempt');
  return res.json();
}

export async function getSessionAttempts(sessionId) {
  const res = await fetch(`${API_BASE}/attempts?session_id=${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch attempts');
  return res.json();
}

export async function getStats(dateFrom, dateTo) {
  const params = new URLSearchParams();
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo) params.append('date_to', dateTo);
  const query = params.toString() ? `?${params}` : '';
  const res = await fetch(`${API_BASE}/stats/summary${query}`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function getDailyStats(days = 30) {
  const res = await fetch(`${API_BASE}/stats/daily?days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch daily stats');
  return res.json();
}

export async function getTimeByDifficulty(dateFrom) {
  const params = new URLSearchParams();
  if (dateFrom) params.append('date_from', dateFrom);
  const query = params.toString() ? `?${params}` : '';
  const res = await fetch(`${API_BASE}/stats/time-by-difficulty${query}`);
  if (!res.ok) throw new Error('Failed to fetch time by difficulty');
  return res.json();
}

export async function getRecentNotes(limit = 20) {
  const res = await fetch(`${API_BASE}/stats/recent-notes?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch recent notes');
  return res.json();
}

export async function getSessions(limit = 10, offset = 0) {
  const res = await fetch(`${API_BASE}/sessions?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

// SRS Endpoints

export async function getSRSDue(depth, limit = 10) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (depth !== undefined && depth !== null) params.append('depth', String(depth));
  const res = await fetch(`${API_BASE}/srs/due?${params}`);
  if (!res.ok) throw new Error('Failed to fetch due items');
  return res.json();
}

export async function recordSRSReview(srsItemId, quality, responseTimeMs, notes, userSolution) {
  const res = await fetch(`${API_BASE}/srs/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      srs_item_id: srsItemId,
      quality,
      response_time_ms: responseTimeMs,
      notes,
      user_solution: userSolution,
    }),
  });
  if (!res.ok) throw new Error('Failed to record review');
  return res.json();
}

export async function getSRSSolution(srsItemId, depth) {
  const res = await fetch(`${API_BASE}/srs/item/${srsItemId}/solution?depth=${depth}`);
  if (!res.ok) throw new Error('Failed to fetch solution');
  return res.json();
}

export async function addToSRS(solveId, depth, notes) {
  const res = await fetch(`${API_BASE}/srs/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ solve_id: solveId, depth, notes }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to add to SRS');
  }
  return res.json();
}

export async function removeFromSRS(srsItemId) {
  const res = await fetch(`${API_BASE}/srs/item/${srsItemId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove from SRS');
  return res.json();
}

export async function getSRSStats() {
  const res = await fetch(`${API_BASE}/srs/stats`);
  if (!res.ok) throw new Error('Failed to fetch SRS stats');
  return res.json();
}

// Solves Browser Endpoints

export async function getSolves(filters = {}) {
  const params = new URLSearchParams();
  if (filters.solver) params.append('solver', filters.solver);
  if (filters.minResult) params.append('min_result', String(filters.minResult));
  if (filters.maxResult) params.append('max_result', String(filters.maxResult));
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.offset) params.append('offset', String(filters.offset));
  const query = params.toString() ? `?${params}` : '';
  const res = await fetch(`${API_BASE}/solves${query}`);
  if (!res.ok) throw new Error('Failed to fetch solves');
  return res.json();
}

export async function getSolve(id) {
  const res = await fetch(`${API_BASE}/solves/${id}`);
  if (!res.ok) throw new Error('Failed to fetch solve');
  return res.json();
}
