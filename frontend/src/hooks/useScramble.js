import { useState, useCallback } from 'react';
import { getScramble } from '../api/client';

export function useScramble() {
  const [scramble, setScramble] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchScramble = useCallback(async (moves) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getScramble(moves);
      const newScramble = data.scrambles[0];
      setScramble(newScramble);
      return newScramble;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    scramble,
    loading,
    error,
    fetchScramble,
  };
}
