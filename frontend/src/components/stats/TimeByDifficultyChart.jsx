import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function TimeByDifficultyChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Inspection Time by Difficulty</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No timing data yet. Start practicing with the timer!
        </div>
      </div>
    );
  }

  const chartData = data.map(d => ({
    difficulty: `${d.cross_moves} move${d.cross_moves > 1 ? 's' : ''}`,
    successTime: d.success_avg_ms ? d.success_avg_ms / 1000 : null,
    failTime: d.fail_avg_ms ? d.fail_avg_ms / 1000 : null,
    successCount: d.success_count || 0,
    failCount: d.fail_count || 0,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
        <p className="text-white font-medium mb-2">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value?.toFixed(1)}s
            <span className="text-gray-400 ml-2">
              ({entry.name === 'Success'
                ? chartData.find(d => d.difficulty === label)?.successCount
                : chartData.find(d => d.difficulty === label)?.failCount} attempts)
            </span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-2">Inspection Time by Difficulty</h2>
      <p className="text-sm text-gray-400 mb-4">Average time to plan (success vs fail)</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="difficulty" stroke="#9CA3AF" fontSize={12} />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(v) => `${v}s`}
              label={{ value: 'Time (s)', angle: -90, position: 'insideLeft', fill: '#9CA3AF', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="successTime"
              fill="#10B981"
              name="Success"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="failTime"
              fill="#EF4444"
              name="Fail"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
