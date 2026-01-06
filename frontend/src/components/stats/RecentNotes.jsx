export function RecentNotes({ attempts }) {
  if (!attempts || attempts.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Notes</h2>
        <div className="text-gray-500 text-center py-4">
          No notes yet. Add notes during practice to track your learnings!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Notes</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {attempts.map((attempt) => (
          <div key={attempt.id} className="border-b border-gray-700 pb-4 last:border-0">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-gray-400">
                {new Date(attempt.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                <span className="mx-2">-</span>
                <span>{attempt.cross_moves} move</span>
                {attempt.pairs_attempted > 0 && (
                  <span>, {attempt.pairs_attempted} pair{attempt.pairs_attempted > 1 ? 's' : ''}</span>
                )}
              </div>
              <span className={`text-sm px-2 py-0.5 rounded ${
                attempt.cross_success ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
              }`}>
                {attempt.cross_success ? 'Success' : 'Fail'}
                {attempt.pairs_attempted > 0 && ` (${attempt.pairs_planned}/${attempt.pairs_attempted})`}
              </span>
            </div>
            <p className="text-gray-200">{attempt.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
