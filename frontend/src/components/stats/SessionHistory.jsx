export function SessionHistory({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Session History</h2>
        <div className="text-gray-500 text-center py-4">
          No sessions yet. Start practicing!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Session History</h2>
      <div className="space-y-3">
        {sessions.map((session) => {
          const start = new Date(session.started_at);
          const end = session.ended_at ? new Date(session.ended_at) : null;
          const duration = end ? Math.round((end - start) / 1000 / 60) : null;

          return (
            <div key={session.id} className="border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium">
                    {start.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-400">
                    {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    {end && (
                      <span> - {end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                    {duration && <span className="ml-2">({duration} min)</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{session.attempt_count} attempts</div>
                </div>
              </div>
              {session.notes && (
                <div className="text-sm text-gray-400 mt-2 italic">
                  {session.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
