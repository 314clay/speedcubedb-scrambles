import { useState, useEffect, useCallback } from 'react';
import { getSolves, addToSRS } from '../../api/client';

const DEPTH_LABELS = ['Cross', '+1 pair', '+2 pairs', '+3 pairs'];

export function SRSBrowser({ onAdd }) {
  const [solves, setSolves] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    solver: '',
    maxResult: '',
    limit: 20,
    offset: 0,
  });
  const [addingState, setAddingState] = useState({});

  const fetchSolves = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSolves({
        solver: filters.solver || undefined,
        maxResult: filters.maxResult || undefined,
        limit: filters.limit,
        offset: filters.offset,
      });
      setSolves(data.solves);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch solves:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSolves();
  }, [fetchSolves]);

  const handleAddToSRS = async (solveId, depth) => {
    const key = `${solveId}-${depth}`;
    setAddingState(prev => ({ ...prev, [key]: 'loading' }));

    try {
      await addToSRS(solveId, depth);
      setAddingState(prev => ({ ...prev, [key]: 'success' }));
      // Update the local state to show it's in SRS
      setSolves(prev => prev.map(solve => {
        if (solve.id === solveId) {
          return {
            ...solve,
            in_srs: [...(solve.in_srs || []), depth],
          };
        }
        return solve;
      }));
      onAdd?.();
    } catch (err) {
      console.error('Failed to add to SRS:', err);
      setAddingState(prev => ({ ...prev, [key]: 'error' }));
      setTimeout(() => {
        setAddingState(prev => ({ ...prev, [key]: undefined }));
      }, 2000);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, offset: 0 }));
  };

  const handlePageChange = (newOffset) => {
    setFilters(prev => ({ ...prev, offset: newOffset }));
  };

  const currentPage = Math.floor(filters.offset / filters.limit) + 1;
  const totalPages = Math.ceil(total / filters.limit);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <form onSubmit={handleSearch} className="bg-gray-800 rounded-lg p-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-1">Solver</label>
            <input
              type="text"
              value={filters.solver}
              onChange={(e) => setFilters(prev => ({ ...prev, solver: e.target.value }))}
              placeholder="Search by solver name..."
              className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-32">
            <label className="block text-sm text-gray-400 mb-1">Max time</label>
            <input
              type="number"
              step="0.01"
              value={filters.maxResult}
              onChange={(e) => setFilters(prev => ({ ...prev, maxResult: e.target.value }))}
              placeholder="e.g. 5.0"
              className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-400 animate-pulse">Loading...</div>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-400">
            Showing {solves.length} of {total} solves
          </div>

          <div className="space-y-4">
            {solves.map(solve => (
              <div key={solve.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {solve.solver} - {solve.result}s
                    </h3>
                    <p className="text-sm text-gray-400">
                      {solve.competition || 'Practice'} | {solve.solve_date ? new Date(solve.solve_date).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                  {solve.stm_cross1 && (
                    <span className="text-sm bg-gray-700 px-2 py-1 rounded">
                      Cross: {solve.stm_cross1} STM
                    </span>
                  )}
                </div>

                {/* Scramble preview */}
                <div className="bg-gray-900 rounded p-2 mb-3 text-sm">
                  <code className="text-gray-300 font-mono line-clamp-1">
                    {solve.scramble}
                  </code>
                </div>

                {/* Add to SRS buttons */}
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-400">Add to SRS:</span>
                  {[0, 1, 2, 3].map(depth => {
                    const key = `${solve.id}-${depth}`;
                    const isInSRS = solve.in_srs?.includes(depth);
                    const state = addingState[key];

                    if (isInSRS || state === 'success') {
                      return (
                        <span
                          key={depth}
                          className="px-3 py-1.5 bg-green-900 text-green-300 rounded text-sm"
                        >
                          {DEPTH_LABELS[depth]} ✓
                        </span>
                      );
                    }

                    return (
                      <button
                        key={depth}
                        onClick={() => handleAddToSRS(solve.id, depth)}
                        disabled={state === 'loading'}
                        className={`px-3 py-1.5 rounded text-sm transition-colors ${
                          state === 'loading'
                            ? 'bg-gray-600 text-gray-400 cursor-wait'
                            : state === 'error'
                            ? 'bg-red-900 text-red-300'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {state === 'loading' ? '...' : state === 'error' ? 'Error' : `+${DEPTH_LABELS[depth]}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handlePageChange(filters.offset - filters.limit)}
                disabled={filters.offset === 0}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(filters.offset + filters.limit)}
                disabled={filters.offset + filters.limit >= total}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
