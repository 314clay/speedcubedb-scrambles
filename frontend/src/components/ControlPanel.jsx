const COLORS = ['white', 'yellow', 'green', 'blue', 'red', 'orange'];

export function ControlPanel({ settings, onChange }) {
  const { difficulty, pairsAttempting, crossColor } = settings;

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <div className="flex items-center gap-2">
        <label className="text-gray-400 text-sm">Difficulty:</label>
        <select
          value={difficulty}
          onChange={(e) => onChange({ ...settings, difficulty: parseInt(e.target.value) })}
          className="bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <option key={n} value={n}>{n} move{n > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-gray-400 text-sm">Planning:</label>
        <select
          value={pairsAttempting}
          onChange={(e) => onChange({ ...settings, pairsAttempting: parseInt(e.target.value) })}
          className="bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[0, 1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>{n} pair{n !== 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-gray-400 text-sm">Color:</label>
        <select
          value={crossColor}
          onChange={(e) => onChange({ ...settings, crossColor: e.target.value })}
          className="bg-gray-700 text-white rounded px-3 py-2 capitalize focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {COLORS.map((c) => (
            <option key={c} value={c} className="capitalize">{c}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
