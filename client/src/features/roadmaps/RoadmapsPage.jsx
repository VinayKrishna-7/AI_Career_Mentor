import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Compass,
  Calendar,
  Trash2,
  Plus,
  Loader2,
  FolderGit2,
} from 'lucide-react';

const ProgressBar = ({ progress = 0 }) => (
  <div className="w-full bg-[#ede6d8] dark:bg-[#25252b] h-2 rounded-full overflow-hidden">
    <div
      className="bg-stone-900 dark:bg-[#f5efe4] h-2 rounded-full transition-all duration-700"
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  </div>
);

const QUICK_CAREER_SUGGESTIONS = [
  'Full-Stack Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'Data Scientist',
  'DevOps Engineer',
  'Mobile App Developer',
  'MLOps Engineer',
  'Cloud Architect',
];

export const RoadmapsPage = () => {
  const location = useLocation();
  const toast = useToast();

  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // Interactive Generator Form State
  const [showGeneratorPanel, setShowGeneratorPanel] = useState(false);
  const [targetRoleInput, setTargetRoleInput] = useState('');
  const [focusAreasInput, setFocusAreasInput] = useState('');
  const [customGoalsInput, setCustomGoalsInput] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [weeklyHours, setWeeklyHours] = useState(10);

  // 1. Fetch user's saved roadmaps
  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const res = await api.get('/roadmaps');
      if (res.data.success) {
        setRoadmaps(res.data.roadmaps);
        if (res.data.roadmaps.length > 0) {
          fetchRoadmapDetails(res.data.roadmaps[0].id);
        } else {
          setSelectedRoadmap(null);
          setShowGeneratorPanel(true);
        }
      }
    } catch (err) {
      setError('Failed to load your roadmaps.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  // 2. Pre-fill role from navigation state if passed (e.g. from Recommendations / Skill Gap)
  useEffect(() => {
    if (location.state?.targetRole) {
      setTargetRoleInput(location.state.targetRole);
      setShowGeneratorPanel(true);
    }
  }, [location.state]);

  // 3. Fetch single roadmap details & tasks
  const fetchRoadmapDetails = async (id) => {
    try {
      const res = await api.get(`/roadmaps/${id}`);
      if (res.data.success) {
        setSelectedRoadmap(res.data.roadmap);
      }
    } catch (err) {
      toast.error('Failed to load roadmap details.');
    }
  };

  // 4. Generate new custom career roadmap with user's choices
  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    const cleanRole = targetRoleInput.trim();
    if (!cleanRole || generating) return;

    setGenerating(true);
    setError('');

    try {
      const res = await api.post('/roadmaps/generate', {
        targetRole: cleanRole,
        focusAreas: focusAreasInput.trim() || undefined,
        customGoals: customGoalsInput.trim() || undefined,
        experienceLevel,
        weeklyHours: Number(weeklyHours),
      });

      if (res.data.success) {
        toast.success(`Custom roadmap for "${cleanRole}" generated!`);
        setShowGeneratorPanel(false);
        setTargetRoleInput('');
        setFocusAreasInput('');
        setCustomGoalsInput('');
        await fetchRoadmaps();
        if (res.data.roadmap?.id) {
          await fetchRoadmapDetails(res.data.roadmap.id);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate roadmap.';
      setError(msg);
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  // 5. Toggle task completion status
  const handleToggleTask = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Not Started' : 'Completed';
    try {
      const res = await api.patch(`/roadmaps/tasks/${taskId}`, { status: newStatus });
      if (res.data.success && selectedRoadmap) {
        const updatedTasks = selectedRoadmap.tasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        );
        const completedCount = updatedTasks.filter((t) => t.status === 'Completed').length;
        const total = updatedTasks.length;
        const progressPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

        setSelectedRoadmap({
          ...selectedRoadmap,
          tasks: updatedTasks,
          completedTasks: completedCount,
          progressPercentage,
        });
      }
    } catch (err) {
      toast.error('Failed to update task.');
    }
  };

  // 6. Delete a roadmap
  const handleDeleteRoadmap = async (id) => {
    if (!window.confirm('Are you sure you want to delete this career roadmap?')) return;
    try {
      const res = await api.delete(`/roadmaps/${id}`);
      if (res.data.success) {
        toast.success('Roadmap deleted.');
        fetchRoadmaps();
      }
    } catch (err) {
      toast.error('Could not delete roadmap.');
    }
  };

  if (loading && roadmaps.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-stone-900 dark:text-[#f5efe4]" />
        <p className="text-xs text-stone-500 dark:text-stone-400">Loading your roadmaps...</p>
      </div>
    );
  }

  const roadmapData = selectedRoadmap?.roadmap_data || {};
  const tasksList = selectedRoadmap?.tasks || [];

  // Group tasks by phase_name
  const phases = tasksList.reduce((acc, t) => {
    const p = t.phase_name || 'Phase';
    if (!acc[p]) acc[p] = [];
    acc[p].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#f5efe4] dark:bg-[#1e1e23] border border-[#ded6c5] dark:border-[#2a2a30] text-stone-900 dark:text-[#f5efe4] text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Curriculum Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-[#f5efe4] tracking-tight">Career Roadmaps</h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm mt-1">
            Personalized, milestone-driven technical curricula with task tracking for any career path you choose.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowGeneratorPanel((prev) => !prev)}
          className="shrink-0 px-4 py-2.5 rounded-xl border border-[#ded6c5] dark:border-[#2a2a30] bg-white dark:bg-[#161619] hover:bg-[#f5efe4] dark:hover:bg-[#1e1e23] text-stone-800 dark:text-[#f5efe4] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-stone-900 dark:text-[#f5efe4]" />
          <span>{showGeneratorPanel ? 'Hide Generator' : 'New Custom Roadmap'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#f5efe4] dark:bg-[#1e1e23] border border-[#ded6c5] dark:border-[#2a2a30] text-stone-900 dark:text-[#f5efe4] text-xs flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* Interactive Custom Career Choice Generator Panel */}
      {showGeneratorPanel && (
        <div className="bg-[#191E1C] p-5 sm:p-6 rounded-xl border border-[#2A302D] space-y-4">
          <div className="flex items-center justify-between border-b border-[#ded6c5] dark:border-[#2a2a30] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#f5efe4] dark:bg-[#1e1e23] border border-[#ded6c5] dark:border-[#2a2a30] flex items-center justify-center text-stone-900 dark:text-[#f5efe4]">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-[#f5efe4]">
                  Create Custom Career Roadmap
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Input your exact career choice. Tailor a 5-phase progressive roadmap.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#f5efe4] dark:bg-[#1e1e23] text-stone-700 dark:text-stone-300 border border-[#ded6c5] dark:border-[#2a2a30] hidden sm:inline-block">
              Custom Builder
            </span>
          </div>

          <form onSubmit={handleGenerateRoadmap} className="space-y-4">
            {/* 1. Custom Career Input */}
            <div>
              <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                Target Career / Role (Your Choice)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Systems Engineer, Quant Developer, Rust Distributed Systems, Cloud Architect..."
                  value={targetRoleInput}
                  onChange={(e) => setTargetRoleInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ded6c5] dark:border-[#2a2a30] bg-[#faf7f2] dark:bg-[#101012] text-stone-900 dark:text-[#f5efe4] text-sm focus:outline-none transition-colors"
                />
              </div>

              {/* Quick Suggestion Pills */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mr-1">
                  Popular Suggestions:
                </span>
                {QUICK_CAREER_SUGGESTIONS.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => setTargetRoleInput(suggestion)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                      targetRoleInput.toLowerCase() === suggestion.toLowerCase()
                        ? 'bg-[#2A8278] text-[#F5F4EF] border-[#2A8278]'
                        : 'bg-[#222825] text-[#A2AAA5] border-[#2A302D] hover:text-[#F5F4EF]'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Optional Focus Areas & Custom Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  Specific Focus / Tech Preferences <span className="font-normal text-stone-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Focus on LLM Fine-Tuning, Docker, Microservices, Next.js"
                  value={focusAreasInput}
                  onChange={(e) => setFocusAreasInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ded6c5] dark:border-[#2a2a30] bg-[#faf7f2] dark:bg-[#101012] text-stone-900 dark:text-[#f5efe4] text-xs focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  Target Timeline & Goals <span className="font-normal text-stone-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Preparing for FAANG summer internship, or junior to mid transition"
                  value={customGoalsInput}
                  onChange={(e) => setCustomGoalsInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#ded6c5] dark:border-[#2a2a30] bg-[#faf7f2] dark:bg-[#101012] text-stone-900 dark:text-[#f5efe4] text-xs focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* 3. Level & Hours Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  Experience Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                    <button
                      type="button"
                      key={level}
                      onClick={() => setExperienceLevel(level)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        experienceLevel === level
                          ? 'bg-[#2A8278] text-[#F5F4EF] border-[#2A8278] shadow-xs'
                          : 'bg-[#faf7f2] dark:bg-[#101012] text-stone-700 dark:text-stone-300 border-[#ded6c5] dark:border-[#2a2a30]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  Weekly Study Hours Commitment
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((hours) => (
                    <button
                      type="button"
                      key={hours}
                      onClick={() => setWeeklyHours(hours)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        weeklyHours === hours
                          ? 'bg-[#2A8278] text-[#F5F4EF] border-[#2A8278] shadow-xs'
                          : 'bg-[#faf7f2] dark:bg-[#101012] text-stone-700 dark:text-stone-300 border-[#ded6c5] dark:border-[#2a2a30]'
                      }`}
                    >
                      {hours}h / wk
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={generating || !targetRoleInput.trim()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#F5F4EF]" />
                    <span>Analyzing Role & Generating 5-Phase Roadmap...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4 text-[#F5F4EF]" />
                    <span>Generate Custom Roadmap</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roadmaps selector pills */}
      {roadmaps.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {roadmaps.map((r) => (
            <button
              key={r.id}
              onClick={() => fetchRoadmapDetails(r.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                selectedRoadmap?.id === r.id
                  ? 'bg-[#2A8278] text-[#F5F4EF] border-[#2A8278] shadow-xs'
                  : 'bg-white dark:bg-[#161619] text-stone-600 dark:text-stone-300 border-[#ded6c5] dark:border-[#2a2a30] hover:border-stone-900'
              }`}
            >
              <span>{r.career_title}</span>
              <span className="ml-2 opacity-75 font-normal">({r.progressPercentage}%)</span>
            </button>
          ))}
        </div>
      )}

      {/* Selected Roadmap View */}
      {selectedRoadmap ? (
        <div className="bg-[#191E1C] rounded-xl border border-[#2A302D] p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ded6c5] dark:border-[#2a2a30] pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-stone-900 dark:text-[#f5efe4]">{selectedRoadmap.career_title}</h2>
                <button
                  onClick={() => handleDeleteRoadmap(selectedRoadmap.id)}
                  className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Delete roadmap"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                {roadmapData.overview || 'Personalized technical curriculum.'}
              </p>

              {/* Assessment & Skill Gaps Badges */}
              {roadmapData.skillGaps && roadmapData.skillGaps.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 mr-1">
                    Key Skill Gaps Targeted:
                  </span>
                  {roadmapData.skillGaps.map((gap) => (
                    <span
                      key={gap}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#f5efe4] dark:bg-[#1e1e23] text-stone-900 dark:text-[#f5efe4] border border-[#ded6c5] dark:border-[#2a2a30]"
                    >
                      {gap}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="sm:text-right shrink-0">
              <div className="text-2xl font-black text-stone-900 dark:text-[#f5efe4]">
                {selectedRoadmap.progressPercentage}%
              </div>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {selectedRoadmap.completedTasks} of {selectedRoadmap.totalTasks} Tasks Done
              </span>
              {roadmapData.estimatedTotalWeeks && (
                <div className="text-[11px] font-medium text-stone-400 dark:text-stone-500 mt-1 flex items-center sm:justify-end gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Est. {roadmapData.estimatedTotalWeeks} Weeks</span>
                </div>
              )}
            </div>
          </div>

          <ProgressBar progress={selectedRoadmap.progressPercentage} />

          {/* Phased Task Checklist */}
          <div className="space-y-6 pt-4">
            {Object.entries(phases).map(([phaseName, tasks], pIndex) => {
              const phaseMeta = roadmapData.phases?.[pIndex];

              return (
                <div
                  key={phaseName}
                  className="p-4 sm:p-5 rounded-xl bg-[#222825] border border-[#2A302D] space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ded6c5] dark:border-[#2a2a30] pb-3">
                    <h3 className="font-bold text-sm text-stone-900 dark:text-[#f5efe4] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#2A8278] text-[#F5F4EF] text-xs font-black flex items-center justify-center shadow-xs">
                        {pIndex + 1}
                      </span>
                      <span>{phaseName}</span>
                    </h3>
                    <div className="flex items-center gap-3">
                      {phaseMeta?.durationWeeks && (
                        <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 bg-white dark:bg-[#161619] px-2 py-0.5 rounded border border-[#ded6c5] dark:border-[#2a2a30]">
                          {phaseMeta.durationWeeks} Weeks
                        </span>
                      )}
                      <span className="text-xs text-stone-500 dark:text-stone-400">
                        {tasks.filter((t) => t.status === 'Completed').length}/{tasks.length} Completed
                      </span>
                    </div>
                  </div>

                  {/* Phase Project Suggestion */}
                  {phaseMeta?.projectSuggestion && (
                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#161619] border border-[#ded6c5] dark:border-[#2a2a30] text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-[#f5efe4] mb-1">
                        <FolderGit2 className="w-3.5 h-3.5" />
                        <span>Recommended Capstone Project: {phaseMeta.projectSuggestion.title}</span>
                      </div>
                      <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                        {phaseMeta.projectSuggestion.description}
                      </p>
                    </div>
                  )}

                  {/* Tasks */}
                  <div className="space-y-2">
                    {tasks.map((task) => {
                      const isCompleted = task.status === 'Completed';
                      return (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTask(task.id, task.status)}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isCompleted
                              ? 'bg-[#f5efe4] dark:bg-[#1e1e23] border-[#ded6c5] dark:border-[#2a2a30] text-stone-500 dark:text-stone-400'
                              : 'bg-white dark:bg-[#161619] border-[#ded6c5] dark:border-[#2a2a30] hover:border-stone-900 dark:hover:border-stone-400 text-stone-900 dark:text-[#f5efe4] shadow-2xs'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => {}}
                            className="mt-0.5 w-4 h-4 rounded text-stone-900 border-[#ded6c5] dark:border-[#2a2a30] cursor-pointer"
                          />
                          <div className="flex-1">
                            <span
                              className={`text-xs sm:text-sm font-semibold block ${
                                isCompleted ? 'line-through text-stone-400 dark:text-stone-500' : ''
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.description && (
                              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 shrink-0">
                            ~{task.estimated_hours}h
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-[#191E1C] p-8 sm:p-12 text-center rounded-xl border border-[#2A302D] space-y-3">
          <Compass className="w-8 h-8 text-[#D5B777] mx-auto" />
          <h2 className="text-base font-bold text-[#F5F4EF]">No Career Roadmaps Yet</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            Input your chosen career in the generator above and click "Generate Custom Roadmap" to build your interactive curriculum.
          </p>
        </div>
      )}
    </div>
  );
};

export default RoadmapsPage;
