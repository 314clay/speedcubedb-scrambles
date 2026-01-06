const express = require('express');
const router = express.Router();
const pool = require('../db');
const { parseReconstruction, generateAlgCubingUrl } = require('../services/reconstruction');

// GET /api/solves - Browse available solves
router.get('/', async (req, res) => {
  try {
    const { solver, min_result, max_result, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT
        s.id,
        s.solver,
        s.result,
        s.competition,
        s.solve_date,
        s.scramble,
        s.reconstruction IS NOT NULL as has_reconstruction,
        s.stm_cross1,
        s.method,
        (
          SELECT ARRAY_AGG(depth)
          FROM cross_trainer.srs_items
          WHERE solve_id = s.id
        ) as in_srs
      FROM cubing.solves s
      WHERE s.puzzle = '3x3'
        AND s.reconstruction IS NOT NULL
        AND s.scramble IS NOT NULL
    `;

    const params = [];

    if (solver) {
      params.push(`%${solver}%`);
      query += ` AND s.solver ILIKE $${params.length}`;
    }

    if (min_result) {
      params.push(parseFloat(min_result));
      query += ` AND s.result >= $${params.length}`;
    }

    if (max_result) {
      params.push(parseFloat(max_result));
      query += ` AND s.result <= $${params.length}`;
    }

    query += ` ORDER BY s.result ASC`;

    params.push(parseInt(limit, 10));
    query += ` LIMIT $${params.length}`;

    params.push(parseInt(offset, 10));
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM cubing.solves s
      WHERE s.puzzle = '3x3'
        AND s.reconstruction IS NOT NULL
        AND s.scramble IS NOT NULL
    `;
    const countParams = [];

    if (solver) {
      countParams.push(`%${solver}%`);
      countQuery += ` AND s.solver ILIKE $${countParams.length}`;
    }
    if (min_result) {
      countParams.push(parseFloat(min_result));
      countQuery += ` AND s.result >= $${countParams.length}`;
    }
    if (max_result) {
      countParams.push(parseFloat(max_result));
      countQuery += ` AND s.result <= $${countParams.length}`;
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      solves: result.rows.map(row => ({
        ...row,
        in_srs: row.in_srs || [],
      })),
      total: parseInt(countResult.rows[0].total, 10),
    });
  } catch (err) {
    console.error('Error fetching solves:', err);
    res.status(500).json({ error: { message: 'Failed to fetch solves', code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/solves/:id - Get full solve details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        s.*,
        (
          SELECT ARRAY_AGG(depth)
          FROM cross_trainer.srs_items
          WHERE solve_id = s.id
        ) as in_srs
       FROM cubing.solves s
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Solve not found', code: 'NOT_FOUND' } });
    }

    const solve = result.rows[0];
    const parsedSegments = parseReconstruction(solve.reconstruction);

    res.json({
      id: solve.id,
      solver: solve.solver,
      result: solve.result,
      competition: solve.competition,
      solve_date: solve.solve_date,
      scramble: solve.scramble,
      reconstruction: solve.reconstruction,
      parsed_segments: parsedSegments,
      method: solve.method,
      stm_cross1: solve.stm_cross1,
      time_cross1: solve.time_cross1,
      in_srs: solve.in_srs || [],
      alg_cubing_url: solve.alg_cubing_url || generateAlgCubingUrl(solve.scramble, solve.reconstruction),
    });
  } catch (err) {
    console.error('Error fetching solve:', err);
    res.status(500).json({ error: { message: 'Failed to fetch solve', code: 'INTERNAL_ERROR' } });
  }
});

module.exports = router;
