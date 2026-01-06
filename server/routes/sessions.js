const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/sessions - Start a new practice session
router.post('/', async (req, res) => {
  try {
    const result = await db.query(
      `INSERT INTO cross_trainer.practice_sessions (started_at)
       VALUES (NOW())
       RETURNING id, started_at`,
    );

    res.status(201).json({
      session: {
        id: result.rows[0].id,
        started_at: result.rows[0].started_at
      }
    });
  } catch (err) {
    console.error('Error creating session:', err);
    res.status(500).json({
      error: {
        message: 'Failed to create session',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// GET /api/sessions - List recent sessions
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const result = await db.query(
      `SELECT
         s.id,
         s.started_at,
         s.ended_at,
         s.notes,
         s.created_at,
         COUNT(a.id) as attempt_count
       FROM cross_trainer.practice_sessions s
       LEFT JOIN cross_trainer.attempts a ON a.session_id = s.id
       GROUP BY s.id
       ORDER BY s.started_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ sessions: result.rows });
  } catch (err) {
    console.error('Error listing sessions:', err);
    res.status(500).json({
      error: {
        message: 'Failed to list sessions',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// GET /api/sessions/:id - Get a single session
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT
         s.id,
         s.started_at,
         s.ended_at,
         s.notes,
         s.created_at
       FROM cross_trainer.practice_sessions s
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Session not found',
          code: 'NOT_FOUND'
        }
      });
    }

    res.json({ session: result.rows[0] });
  } catch (err) {
    console.error('Error getting session:', err);
    res.status(500).json({
      error: {
        message: 'Failed to get session',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// PATCH /api/sessions/:id - End a session or add notes
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ended_at, notes } = req.body;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (ended_at !== undefined) {
      updates.push(`ended_at = $${paramIndex++}`);
      values.push(ended_at);
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      values.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: {
          message: 'No updates provided',
          code: 'INVALID_PARAMS'
        }
      });
    }

    values.push(id);
    const result = await db.query(
      `UPDATE cross_trainer.practice_sessions
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, started_at, ended_at, notes`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Session not found',
          code: 'NOT_FOUND'
        }
      });
    }

    res.json({ session: result.rows[0] });
  } catch (err) {
    console.error('Error updating session:', err);
    res.status(500).json({
      error: {
        message: 'Failed to update session',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

module.exports = router;
