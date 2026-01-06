import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function DailyChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Daily Progress</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data yet. Start practicing to see your progress!
        </div>
      </div>
    );
  }

  const chartData = [...data].reverse().map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    attempts: d.attempts,
    successRate: d.success_rate,
  }));

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Daily Progress</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="attempts" fill="#3B82F6" name="Attempts" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="successRate" stroke="#10B981" strokeWidth={2} name="Success %" dot={{ fill: '#10B981' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
