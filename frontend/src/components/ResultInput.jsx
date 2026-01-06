export function ResultInput({
  crossSuccess,
  pairsPlanned,
  pairsAttempting,
  onCrossSuccess,
  onPairsPlanned
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-gray-400 mb-3">Cross Result:</div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => onCrossSuccess(true)}
            className={`px-8 py-3 rounded-lg font-medium text-lg transition-all ${
              crossSuccess === true
                ? 'bg-green-600 text-white ring-2 ring-green-400'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Success (s)
          </button>
          <button
            onClick={() => onCrossSuccess(false)}
            className={`px-8 py-3 rounded-lg font-medium text-lg transition-all ${
              crossSuccess === false
                ? 'bg-red-600 text-white ring-2 ring-red-400'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Fail (f)
          </button>
        </div>
      </div>

      {pairsAttempting > 0 && (
        <div>
          <div className="text-sm text-gray-400 mb-3">
            Pairs Planned (attempting {pairsAttempting}):
          </div>
          <div className="flex gap-2 justify-center">
            {Array.from({ length: pairsAttempting + 1 }, (_, i) => (
              <button
                key={i}
                onClick={() => onPairsPlanned(i)}
                disabled={crossSuccess === null}
                className={`w-12 h-12 rounded-lg font-medium text-lg transition-all ${
                  pairsPlanned === i
                    ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
                    : crossSuccess === null
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
