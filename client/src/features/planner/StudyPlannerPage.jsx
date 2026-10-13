import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTimer } from '../../context/TimerContext';
import { useToast } from '../../context/ToastContext';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Route,
  BookOpen,
  Volume2,
  X,
  Target,
  Calendar,
  Flame,
} from 'lucide-react';

export const StudyPlannerPage = () => {
  const { user } = useAuth();
  const {
    activeSession,
    timeLeftSeconds,
    timerRunning,
    progress,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    stopTimer,
  } = useTimer();

  const defaultHours = Math.round((user?.profile?.weeklyStudyHours || 14) / 7) || 2;

  const [availableHours, setAvailableHours] = useState(defaultHours);
  const [subjects, setSubjects] = useState(() => {
    try {
      const saved = localStorage.getItem('career_mentor_study_subjects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newSubject, setNewSubject] = useState('');
  const [newHours, setNewHours] = useState(1);
  const [activeRoadmapTasks, setActiveRoadmapTasks] = useState([]);

  // Completed sessions history state
  const [sessionsHistory, setSessionsHistory] = useState([]);
  const [weeklyTargetHours, setWeeklyTargetHours] = useState(user?.profile?.weeklyStudyHours || 14);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Sync subjects with local storage
  useEffect(() => {
    try {
      localStorage.setItem('career_mentor_study_subjects', JSON.stringify(subjects));
    } catch {
      // Non-blocking storage
    }
  }, [subjects]);

  // Fetch pending tasks from active roadmap if available
  useEffect(() => {
    const fetchActiveRoadmap = async () => {
      try {
        const res = await api.get('/roadmaps');
        if (res.data.success && res.data.roadmaps?.length > 0) {
          const firstRm = res.data.roadmaps[0];
          const detRes = await api.get(`/roadmaps/${firstRm.id}`);
          if (detRes.data.success && detRes.data.roadmap?.tasks) {
            const pending = detRes.data.roadmap.tasks.filter((t) => t.status !== 'Completed');
            setActiveRoadmapTasks(pending);
          }
        }
      } catch {
        // Non-blocking
      }
    };
    fetchActiveRoadmap();
  }, []);

  const toast = useToast();

  const handleImportRoadmapTasks = () => {
    if (!activeRoadmapTasks.length) return;
    const existingNames = new Set(subjects.map((s) => s.name.toLowerCase()));
    const unadded = activeRoadmapTasks.filter((t) => !existingNames.has(t.title.toLowerCase()));
    const tasksToAdd = (unadded.length > 0 ? unadded : activeRoadmapTasks).slice(0, 3).map((t, idx) => ({
      id: Date.now() + idx,
      name: t.title,
      hours: 1,
    }));
    setSubjects((prev) => [...prev, ...tasksToAdd]);
    toast.success(`Imported ${tasksToAdd.length} tasks from your active roadmap!`);
  };

  const handleClearAllSubjects = () => {
    setSubjects([]);
    toast.info('Cleared today\'s scheduled study tasks.');
  };

  const fetchSessionsHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await api.get('/planner/sessions');
      if (res.data.success) {
        setSessionsHistory(res.data.sessions || []);
        if (res.data.weeklyTargetHours) {
          setWeeklyTargetHours(res.data.weeklyTargetHours);
        }
      }
    } catch {
      // Non-blocking history fetch
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionsHistory();
  }, [timerRunning]);

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    const taskName = newSubject.trim();
    const taskHours = parseFloat(newHours) || 1;
    setSubjects((prev) => [
      ...prev,
      { id: Date.now(), name: taskName, hours: taskHours },
    ]);
    setNewSubject('');
    setNewHours(1);
    toast.success(`Added "${taskName}" (${taskHours}h) to study timeline!`);
  };

  const handleRemoveSubject = (id) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    toast.info('Task removed from schedule.');
  };

  const totalAllocatedHours = subjects.reduce((sum, s) => sum + s.hours, 0);

  // Generate sequential timeline starting from 09:00 AM
  let startMinutes = 9 * 60; // 09:00 AM in minutes
  const timeline = subjects.map((s) => {
    const sStart = startMinutes;
    const durationMins = Math.round(s.hours * 60);
    const sEnd = sStart + durationMins;
    startMinutes = sEnd;

    const formatTime = (mins) => {
      const h = Math.floor(mins / 60) % 24;
      const m = mins % 60;
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const displayM = m < 10 ? `0${m}` : m;
      return `${displayH}:${displayM} ${period}`;
    };

    return {
      ...s,
      timeSlot: `${formatTime(sStart)} – ${formatTime(sEnd)}`,
    };
  });

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Calculate total minutes studied this week
  const totalMinutesStudied = sessionsHistory.reduce((sum, sess) => sum + (sess.duration_minutes || 0), 0);
  const totalHoursStudied = (totalMinutesStudied / 60).toFixed(1);
  const weeklyTargetProgress = weeklyTargetHours > 0
    ? Math.min(100, Math.round(((totalMinutesStudied / 60) / weeklyTargetHours) * 100))
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="pb-4 border-b border-[#2A302D]">
        <h1 className="text-xl sm:text-2xl font-bold text-[#F5F4EF] tracking-tight">Study Time Planner</h1>
        <p className="text-xs sm:text-sm text-[#A2AAA5] mt-1">
          Organize daily study commitments, generate sequential timelines, and focus with interactive timers.
        </p>
      </div>

      {/* Active Focus Timer Card (Persistent Everywhere) */}
      {activeSession && (
        <div className="p-5 sm:p-6 rounded-xl bg-[#191E1C] border border-[#2A302D] text-[#F5F4EF] shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  {timerRunning && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f5efe4] opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      timerRunning ? 'bg-[#f5efe4]' : 'bg-stone-500'
                    }`}
                  ></span>
                </span>
                <span className="text-xs font-semibold text-stone-300 dark:text-stone-300 uppercase tracking-wider">
                  {timerRunning ? 'Active Focus Session • Running' : 'Focus Session Paused'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#faf7f2] tracking-tight">{activeSession.name}</h2>
              <p className="text-xs text-stone-300 dark:text-stone-400 mt-1">
                Stay focused on this single objective. Timer continues even if you visit other pages or switch tabs.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={stopTimer}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                title="Stop and Dismiss Session"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#f5efe4] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-stone-400 dark:text-stone-400 font-medium">
              <span>{progress}% Completed</span>
              <span>{activeSession.hours}h Target ({Math.round(activeSession.hours * 60)} mins)</span>
            </div>
          </div>

          {/* Large Countdown and Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-stone-800">
            <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-[#faf7f2]">
              {formatTimer(timeLeftSeconds)}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={timerRunning ? pauseTimer : resumeTimer}
                className="px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] cursor-pointer"
              >
                {timerRunning ? <Pause className="w-4 h-4 text-[#F5F4EF]" /> : <Play className="w-4 h-4 text-[#F5F4EF]" />}
                <span>{timerRunning ? 'Pause Timer' : 'Resume Timer'}</span>
              </button>

              <button
                type="button"
                onClick={resetTimer}
                className="p-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-[#faf7f2] border border-stone-700 transition-colors cursor-pointer"
                title="Reset timer to beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Study Allocation Form */}
      <div className="bg-[#191E1C] p-5 sm:p-6 rounded-xl border border-[#2A302D] shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-[#ded6c5]/60 dark:border-[#2a2a30] pb-6">
          <div>
            <label className="block text-xs font-bold text-stone-900 dark:text-[#faf7f2] uppercase tracking-wider mb-1">
              Available Study Time Today:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="16"
                value={availableHours}
                onChange={(e) => setAvailableHours(parseFloat(e.target.value) || 1)}
                className="w-28 px-3.5 py-2 rounded-xl border border-[#ded6c5] dark:border-[#2a2a30] text-sm font-bold text-stone-900 dark:text-[#faf7f2] bg-[#faf7f2] dark:bg-[#1a1a1e]"
              />
              <span className="text-xs text-stone-500 dark:text-zinc-400 font-semibold">Hours available</span>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="block text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Allocation Status:
            </span>
            <div className="text-lg font-bold text-stone-900 dark:text-[#faf7f2]">
              {totalAllocatedHours} / {availableHours} hrs
            </div>
            <span
              className={`text-xs font-semibold ${
                totalAllocatedHours > availableHours ? 'text-stone-600 dark:text-stone-400 underline' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              {totalAllocatedHours > availableHours
                ? `Exceeds available time by ${totalAllocatedHours - availableHours}h`
                : `${availableHours - totalAllocatedHours}h unallocated`}
            </span>
          </div>
        </div>

        {/* Add Subject Item */}
        <form onSubmit={handleAddSubject} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Subject or Roadmap task name (e.g. Distributed Systems, LeetCode Trees)..."
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#ded6c5] dark:border-[#2a2a30] text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-[#faf7f2] dark:bg-[#1a1a1e] text-stone-900 dark:text-[#faf7f2] placeholder:text-stone-400 dark:placeholder:text-zinc-500"
          />
          <div className="flex gap-2">
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="8"
              value={newHours}
              onChange={(e) => setNewHours(e.target.value)}
              className="w-24 px-3 py-2.5 rounded-xl border border-[#ded6c5] dark:border-[#2a2a30] text-sm text-center font-semibold bg-[#faf7f2] dark:bg-[#1a1a1e] text-stone-900 dark:text-[#faf7f2]"
              title="Hours for this task"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#F5F4EF]" />
              <span>Add Subject</span>
            </button>
          </div>
        </form>

        {/* Sequential Schedule Timeline */}
        <div className="space-y-3 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-[#faf7f2]">Generated Daily Timeline</h3>
              <span className="text-xs text-stone-500 dark:text-zinc-400">Sequential order from 9:00 AM</span>
            </div>
            <div className="flex items-center gap-2">
              {activeRoadmapTasks.length > 0 && (
                <button
                  type="button"
                  onClick={handleImportRoadmapTasks}
                  className="px-3 py-1.5 rounded-lg bg-[#222825] hover:bg-[#2A302D] text-[#F5F4EF] text-xs font-medium flex items-center gap-1.5 border border-[#2A302D] transition-colors cursor-pointer"
                >
                  <Route className="w-3.5 h-3.5 text-[#2A8278]" />
                  <span>Import from Roadmap ({activeRoadmapTasks.length} pending)</span>
                </button>
              )}
              {subjects.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllSubjects}
                  className="px-2.5 py-1.5 rounded-lg text-stone-500 dark:text-[#A2AAA5] hover:text-stone-900 dark:hover:text-[#F5F4EF] hover:bg-[#f5efe4] dark:hover:bg-[#222825] text-xs font-medium transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            {timeline.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-[#ded6c5] dark:border-[#2A302D] bg-[#faf7f2]/50 dark:bg-[#101312]/40 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-lg bg-[#f5efe4] dark:bg-[#222825] border border-[#ded6c5] dark:border-[#2A302D] flex items-center justify-center text-stone-900 dark:text-[#D5B777]">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-[#F5F4EF]">No Study Tasks Scheduled Today</h4>
                  <p className="text-xs text-stone-500 dark:text-[#A2AAA5] mt-1">
                    Add your custom subjects above, or import pending tasks directly from your active roadmap to generate your sequential daily timeline.
                  </p>
                </div>
                {activeRoadmapTasks.length > 0 && (
                  <button
                    type="button"
                    onClick={handleImportRoadmapTasks}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Route className="w-3.5 h-3.5 text-[#F5F4EF]" />
                    <span>Import {Math.min(3, activeRoadmapTasks.length)} Tasks from Active Roadmap</span>
                  </button>
                )}
              </div>
            ) : (
              timeline.map((item, idx) => {
                const isCurrentlyActive = activeSession?.name === item.name;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                      isCurrentlyActive
                        ? 'bg-[#222825] border-[#2A8278] ring-1 ring-[#2A8278]'
                        : 'bg-[#faf7f2]/70 dark:bg-[#101312] border-[#ded6c5] dark:border-[#2A302D]'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="w-7 h-7 rounded-full bg-[#2A8278] text-[#F5F4EF] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {idx + 1}
                      </span>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-stone-900 dark:text-[#faf7f2] truncate block">
                            {item.name}
                          </span>
                          {isCurrentlyActive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#2A8278] text-[#F5F4EF] shrink-0">
                              {timerRunning ? 'Timer Active' : 'Paused'}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                          {item.timeSlot} ({item.hours}h)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (isCurrentlyActive) {
                            if (timerRunning) pauseTimer();
                            else resumeTimer();
                          } else {
                            startTimer(item);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        {isCurrentlyActive && timerRunning ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>{isCurrentlyActive ? 'Resume' : 'Focus Timer'}</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(item.id)}
                        className="p-1.5 text-stone-400 hover:text-stone-900 dark:text-zinc-500 dark:hover:text-[#faf7f2] transition-colors cursor-pointer"
                        title="Remove task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Weekly Goal Progress & Recorded Sessions History */}
      <div className="bg-[#191E1C] p-5 sm:p-6 rounded-xl border border-[#2A302D] shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f5efe4] dark:bg-[#1a1a1e] border border-[#ded6c5] dark:border-[#2a2a30] flex items-center justify-center text-stone-900 dark:text-[#faf7f2]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-[#faf7f2]">
                Weekly Study Hours Goal
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Logged automatically each time a focus timer session finishes.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-lg font-bold text-stone-900 dark:text-[#faf7f2]">
              {totalHoursStudied} / {weeklyTargetHours} hrs
            </span>
            <span className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400">
              {weeklyTargetProgress}% Goal Completed
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#f0e9dc] dark:bg-[#25252b] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-stone-900 dark:bg-[#f5efe4] h-full rounded-full transition-all duration-500"
            style={{ width: `${weeklyTargetProgress}%` }}
          />
        </div>

        {/* Completed Sessions Log */}
        <div className="pt-2 space-y-3">
          <h4 className="text-xs font-bold text-stone-900 dark:text-[#faf7f2] uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-stone-900 dark:text-[#faf7f2]" />
            <span>Completed Study Logs ({sessionsHistory.length})</span>
          </h4>

          {sessionsHistory.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-[#faf7f2]/60 dark:bg-[#101312] border border-[#ded6c5] dark:border-[#2A302D] text-stone-500 dark:text-[#A2AAA5] text-xs">
              No sessions completed yet. Start a focus timer above to log your hours!
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {sessionsHistory.slice(0, 10).map((sess) => (
                <div
                  key={sess.id}
                  className="p-3 rounded-xl bg-[#faf7f2] dark:bg-[#1a1a1e] border border-[#ded6c5] dark:border-[#2a2a30] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-2 h-2 rounded-full bg-stone-900 dark:bg-[#faf7f2] shrink-0"></span>
                    <span className="font-semibold text-stone-900 dark:text-[#faf7f2] truncate">
                      {sess.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-stone-500 dark:text-zinc-400">
                    <span className="font-mono font-bold text-stone-900 dark:text-[#faf7f2]">
                      {sess.duration_minutes}m ({(sess.duration_minutes / 60).toFixed(1)}h)
                    </span>
                    <span>{sess.session_date || 'Today'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlannerPage;
