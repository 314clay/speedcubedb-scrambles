export function ScrambleDisplay({ scramble, loading }) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="text-2xl text-gray-400 animate-pulse">Loading scramble...</div>
      </div>
    );
  }

  if (!scramble) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="text-2xl text-gray-400">No scramble loaded</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-8">
      <div className="text-3xl md:text-4xl font-mono text-center tracking-wide leading-relaxed select-all">
        {scramble.scramble}
      </div>
      <div className="text-sm text-gray-500 text-center mt-4">
        {scramble.moves}-move cross ({scramble.color})
      </div>
    </div>
  );
}
