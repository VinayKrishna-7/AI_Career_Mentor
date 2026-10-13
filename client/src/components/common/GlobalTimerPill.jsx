import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTimer } from '../../context/TimerContext';
import { Play, Pause, RotateCcw, X, Clock, ExternalLink, GripHorizontal, RotateCw } from 'lucide-react';

const STORAGE_KEY = 'study_timer_pill_pos';

const getInitialPosition = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        const maxX = Math.max(16, (window.innerWidth || 1200) - 340);
        const maxY = Math.max(16, (window.innerHeight || 800) - 170);
        return {
          x: Math.max(16, Math.min(maxX, parsed.x)),
          y: Math.max(16, Math.min(maxY, parsed.y)),
        };
      }
    }
  } catch {}

  // Safe default
  const defaultX = typeof window !== 'undefined'
    ? Math.max(24, Math.min(window.innerWidth - 360, 280))
    : 280;
  const defaultY = typeof window !== 'undefined'
    ? Math.max(24, window.innerHeight - 180)
    : 550;

  return { x: defaultX, y: defaultY };
};

export const GlobalTimerPill = () => {
  const {
    activeSession,
    timeLeftSeconds,
    timerRunning,
    progress,
    pauseTimer,
    resumeTimer,
    resetTimer,
    stopTimer,
  } = useTimer();

  const location = useLocation();
  const navigate = useNavigate();

  const [position, setPosition] = useState(getInitialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, posX: 0, posY: 0 });
  const currentPosRef = useRef(position);
  const pillRef = useRef(null);

  currentPosRef.current = position;

  // Reposition within window bounds on resize
  useEffect(() => {
    const handleResize = () => {
      const pillWidth = pillRef.current?.offsetWidth || 340;
      const pillHeight = pillRef.current?.offsetHeight || 160;
      const maxX = Math.max(16, window.innerWidth - pillWidth - 16);
      const maxY = Math.max(16, window.innerHeight - pillHeight - 16);

      setPosition((prev) => {
        const safe = {
          x: Math.max(16, Math.min(maxX, prev.x)),
          y: Math.max(16, Math.min(maxY, prev.y)),
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
        } catch {}
        return safe;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dragging event listeners
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e) => {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

      const deltaX = clientX - dragStartRef.current.startX;
      const deltaY = clientY - dragStartRef.current.startY;

      const pillWidth = pillRef.current?.offsetWidth || 340;
      const pillHeight = pillRef.current?.offsetHeight || 160;

      const maxX = Math.max(16, window.innerWidth - pillWidth - 16);
      const maxY = Math.max(16, window.innerHeight - pillHeight - 16);

      const nextX = Math.max(16, Math.min(maxX, dragStartRef.current.posX + deltaX));
      const nextY = Math.max(16, Math.min(maxY, dragStartRef.current.posY + deltaY));

      setPosition({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPosRef.current));
      } catch {}
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging]);

  const handlePointerDown = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;

    setIsDragging(true);
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleResetPosition = (e) => {
    e.stopPropagation();
    const defaultX = Math.max(24, Math.min(window.innerWidth - 360, 280));
    const defaultY = Math.max(24, window.innerHeight - 180);
    const pos = { x: defaultX, y: defaultY };
    setPosition(pos);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
    } catch {}
  };

  if (!activeSession) return null;
  const isPlannerPage = location.pathname === '/planner';
  if (isPlannerPage) return null;

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={pillRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9990,
      }}
      className={`touch-none select-none transition-shadow ${
        isDragging ? 'shadow-2xl opacity-95 scale-[1.01]' : 'shadow-lg'
      }`}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    >
      <div className="bg-[#FFFFFF]/98 dark:bg-[#101312]/98 border border-[#ded6c5] dark:border-[#2A302D] rounded-xl p-3 sm:p-4 w-80 sm:w-88 text-[#101312] dark:text-[#F5F4EF] backdrop-blur-md transition-colors shadow-xl">
        {/* Drag handle & top actions */}
        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#E2C99B]/60 dark:border-[#75664A] cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#75664A] dark:text-[#E2C99B]">
            <GripHorizontal className="w-3.5 h-3.5 text-[#75664A] dark:text-[#D8BC83]" />
            <span>Focus Timer</span>
            <span className="text-[10px] font-normal text-[#75664A]/70 dark:text-[#E2C99B]/70 hidden sm:inline">
              • Drag anywhere
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleResetPosition}
              className="p-1 rounded-lg text-[#75664A] hover:text-[#003B3B] dark:text-[#D8BC83] dark:hover:text-white hover:bg-[#F2E7D3] dark:hover:bg-[#004D4D] transition-colors cursor-pointer"
              title="Reset position"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/planner')}
              className="p-1 rounded-lg text-[#75664A] hover:text-[#003B3B] dark:text-[#D8BC83] dark:hover:text-white hover:bg-[#F2E7D3] dark:hover:bg-[#004D4D] transition-colors cursor-pointer"
              title="Open Study Planner"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={stopTimer}
              className="p-1 rounded-lg text-[#75664A] hover:text-[#003B3B] dark:text-[#D8BC83] dark:hover:text-white hover:bg-[#F2E7D3] dark:hover:bg-[#004D4D] transition-colors cursor-pointer"
              title="Stop timer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Session Title */}
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2 w-2 shrink-0">
            {timerRunning && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D8BC83] opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                timerRunning ? 'bg-[#003B3B] dark:bg-[#D8BC83]' : 'bg-[#75664A]'
              }`}
            ></span>
          </span>
          <span
            className="text-xs font-bold truncate max-w-[240px] text-[#003B3B] dark:text-white"
            title={activeSession.name}
          >
            {activeSession.name}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E2C99B]/40 dark:bg-[#002B2B] h-1.5 rounded-full overflow-hidden mb-3">
          <div
            className="bg-[#003B3B] dark:bg-[#D8BC83] h-full transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Countdown and controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#003B3B] dark:text-[#D8BC83] shrink-0" />
            <span className="text-2xl font-mono font-bold tracking-tight text-[#003B3B] dark:text-white">
              {formatTimer(timeLeftSeconds)}
            </span>
            <span className="text-[10px] uppercase font-semibold text-[#75664A] dark:text-[#E2C99B] ml-1">
              {timerRunning ? 'Focusing' : 'Paused'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={timerRunning ? pauseTimer : resumeTimer}
              className="px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors bg-[#003B3B] hover:bg-[#002828] text-white dark:bg-[#D8BC83] dark:hover:bg-[#E2C99B] dark:text-[#003B3B] cursor-pointer shadow-xs"
            >
              {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{timerRunning ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              type="button"
              onClick={resetTimer}
              className="p-1.5 rounded-xl text-[#75664A] dark:text-[#E2C99B] hover:bg-[#F2E7D3] dark:hover:bg-[#004D4D] transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalTimerPill;
