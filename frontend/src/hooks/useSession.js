import { useState, useEffect, useCallback } from 'react';
import { createSession, endSession as endSessionApi, getSessionAttempts } from '../api/client';

const SESSION_KEY = 'crossTrainer_activeSession';

export function useSession() {
  const [session, setSession] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setSession(parsed);
        getSessionAttempts(parsed.id)
          .then(data => setAttempts(data.attempts || []))
          .catch(console.error);
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const startSession = useCallback(async () => {
    const data = await createSession();
    const newSession = data.session;
    setSession(newSession);
    setAttempts([]);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    return newSession;
  }, []);

  const endSession = useCallback(async (notes) => {
    if (!session) return;
    await endSessionApi(session.id, notes);
    setSession(null);
    setAttempts([]);
    localStorage.removeItem(SESSION_KEY);
  }, [session]);

  const addAttempt = useCallback((attempt) => {
    setAttempts(prev => [...prev, attempt]);
  }, []);

  const getSessionStats = useCallback(() => {
    const total = attempts.length;
    const successful = attempts.filter(a => a.cross_success).length;
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;
    return { total, successful, successRate };
  }, [attempts]);

  return {
    session,
    attempts,
    loading,
    startSession,
    endSession,
    addAttempt,
    getSessionStats,
  };
}
