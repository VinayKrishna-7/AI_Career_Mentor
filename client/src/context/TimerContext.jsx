import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

const TimerContext = createContext(null);
const STORAGE_KEY = 'career_mentor_focus_timer';

export const TimerProvider = ({ children }) => {
  // Load initial state synchronously from localStorage
  const [activeSession, setActiveSession] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      const data = JSON.parse(saved);
      return data.activeSession || null;
    } catch {
      return null;
    }
  });

  const [totalSeconds, setTotalSeconds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return 0;
      const data = JSON.parse(saved);
      return data.totalSeconds || 0;
    } catch {
      return 0;
    }
  });

  const [timerRunning, setTimerRunning] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return false;
      const data = JSON.parse(saved);
      if (!data.activeSession) return false;
      // If was running, check if time hasn't expired yet
      if (data.timerRunning && data.endTime) {
        return data.endTime > Date.now();
      }
      return false;
    } catch {
      return false;
    }
  });

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return 0;
      const data = JSON.parse(saved);
      if (!data.activeSession) return 0;
      if (data.timerRunning && data.endTime) {
        return Math.max(0, Math.round((data.endTime - Date.now()) / 1000));
      }
      return typeof data.pausedRemainingSeconds === 'number' ? data.pausedRemainingSeconds : 0;
    } catch {
      return 0;
    }
  });

  // End timestamp reference for precise wall-clock time
  const endTimeRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.timerRunning && data.endTime && data.endTime > Date.now()) {
          endTimeRef.current = data.endTime;
        }
      }
    } catch {}
  }, []);

  // Web Audio chime sound
  const playChime = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {
      // AudioContext unallowed or disabled
    }
  }, []);

  // Desktop notification
  const sendDesktopNotification = useCallback((subjectName, durationHours) => {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎯 Focus Study Session Completed!', {
          body: `Awesome job! You finished your ${durationHours}h study session on "${subjectName}".`,
          icon: '/favicon.ico',
        });
      }
    } catch {
      // Notification failed or denied
    }
  }, []);

  // Sync state to localStorage
  const syncToStorage = (session, totalSec, running, endT, pausedSec) => {
    try {
      if (!session) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activeSession: session,
          totalSeconds: totalSec,
          timerRunning: running,
          endTime: endT,
          pausedRemainingSeconds: pausedSec,
        })
      );
    } catch {}
  };

  // Main countdown tick loop
  useEffect(() => {
    if (!timerRunning || !activeSession) return;

    const tick = () => {
      if (!endTimeRef.current) return;
      const now = Date.now();
      const remaining = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
      setTimeLeftSeconds(remaining);

      if (remaining <= 0) {
        // Complete the focus session
        setTimerRunning(false);
        endTimeRef.current = null;
        playChime();
        sendDesktopNotification(activeSession.name, activeSession.hours);

        // Record completed session in database
        api.post('/planner/sessions', {
          subject: activeSession.name,
          duration_minutes: Math.round(activeSession.hours * 60),
          completed: true,
        }).catch(() => {});

        syncToStorage(activeSession, totalSeconds, false, null, 0);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, activeSession, totalSeconds, playChime, sendDesktopNotification]);

  // Re-sync on tab focus or visibility change (e.g. returning to website from another window/tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && timerRunning && endTimeRef.current) {
        const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        setTimeLeftSeconds(remaining);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [timerRunning]);

  // Live browser tab title update
  useEffect(() => {
    if (timerRunning && activeSession && timeLeftSeconds > 0) {
      const m = Math.floor(timeLeftSeconds / 60);
      const s = timeLeftSeconds % 60;
      const formatted = `${m}:${s < 10 ? '0' : ''}${s}`;
      document.title = `(${formatted}) ${activeSession.name} | AI Career Mentor`;
    } else {
      document.title = 'AI Career Mentor';
    }
  }, [timerRunning, activeSession, timeLeftSeconds]);

  // Actions
  const startTimer = (subject) => {
    // Prompt for desktop notification permission if not asked yet
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    const durationSec = Math.round(subject.hours * 60 * 60);
    const endT = Date.now() + durationSec * 1000;
    endTimeRef.current = endT;

    setActiveSession(subject);
    setTotalSeconds(durationSec);
    setTimeLeftSeconds(durationSec);
    setTimerRunning(true);

    syncToStorage(subject, durationSec, true, endT, null);
  };

  const pauseTimer = () => {
    setTimerRunning(false);
    endTimeRef.current = null;
    syncToStorage(activeSession, totalSeconds, false, null, timeLeftSeconds);
  };

  const resumeTimer = () => {
    if (!activeSession) return;
    const currentRemaining = timeLeftSeconds > 0 ? timeLeftSeconds : totalSeconds;
    const endT = Date.now() + currentRemaining * 1000;
    endTimeRef.current = endT;
    setTimeLeftSeconds(currentRemaining);
    setTimerRunning(true);
    syncToStorage(activeSession, totalSeconds, true, endT, null);
  };

  const resetTimer = () => {
    if (!activeSession) return;
    const durationSec = Math.round(activeSession.hours * 60 * 60);
    setTimerRunning(false);
    endTimeRef.current = null;
    setTimeLeftSeconds(durationSec);
    syncToStorage(activeSession, totalSeconds, false, null, durationSec);
  };

  const stopTimer = () => {
    setActiveSession(null);
    setTimerRunning(false);
    endTimeRef.current = null;
    setTimeLeftSeconds(0);
    setTotalSeconds(0);
    syncToStorage(null, 0, false, null, null);
  };

  const progress = totalSeconds > 0
    ? Math.min(100, Math.round(((totalSeconds - timeLeftSeconds) / totalSeconds) * 100))
    : 0;

  return (
    <TimerContext.Provider
      value={{
        activeSession,
        timeLeftSeconds,
        totalSeconds,
        timerRunning,
        progress,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        stopTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export default TimerContext;
