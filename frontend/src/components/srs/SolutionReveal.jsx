const DEPTH_LABELS = {
  0: 'Cross',
  1: 'Cross + 1 pair',
  2: 'Cross + 2 pairs',
  3: 'Cross + 3 pairs',
};

export function SolutionReveal({ solution, depth }) {
  if (!solution) return null;

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-blue-400">
          Pro Solution ({DEPTH_LABELS[depth]})
        </h3>
        <span className="text-sm text-gray-400">
          {solution.move_count} moves
        </span>
      </div>

      {/* Segments shown */}
      <div className="space-y-3 mb-4">
        {solution.segments_shown?.map((segment, idx) => (
          <div key={idx} className="border-l-2 border-blue-500 pl-3">
            <div className="text-xs text-gray-500 uppercase">{segment.name}</div>
            <code className="text-white font-mono">{segment.line}</code>
          </div>
        ))}
      </div>

      {/* Combined moves */}
      {solution.moves_at_depth && (
        <div className="bg-gray-800 rounded p-3 mb-4">
          <div className="text-xs text-gray-500 mb-1">Combined solution:</div>
          <code className="text-lg text-green-400 font-mono">
            {solution.moves_at_depth}
          </code>
        </div>
      )}

      {/* alg.cubing.net link */}
      {solution.alg_cubing_url && (
        <a
          href={solution.alg_cubing_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View on alg.cubing.net
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}

      {/* Cross type info */}
      {solution.segments?.crossType && solution.segments.crossType !== 'cross' && (
        <div className="mt-4 text-sm text-yellow-400">
          Note: This solve uses {solution.segments.crossType} (cross + {solution.segments.crossType === 'xxcross' ? '2 pairs' : '1 pair'} combined)
        </div>
      )}
    </div>
  );
}
