import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Layers,
  HelpCircle,
  FolderGit2,
  Lightbulb,
  Loader2,
  Compass,
  Search,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const ProgressBar = ({ progress = 0 }) => (
  <div className="w-full bg-[#222825] h-1.5 rounded-full overflow-hidden border border-[#2A302D]">
    <div
      className="bg-[#2A8278] h-1.5 rounded-full transition-all duration-700"
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  </div>
);

const QUICK_SUGGESTIONS = [
  'Full-Stack Developer',
  'Backend Developer',
  'Frontend Developer',
  'MLOps Engineer',
  'Cloud Architect',
  'DevOps Engineer',
  'Data Scientist',
  'Cybersecurity Analyst',
  'Rust Distributed Systems',
  'Blockchain Developer',
];

export const SkillGapPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const toast = useToast();

  const initialRole =
    location.state?.targetRole ||
    user?.profile?.targetCareer ||
    'Full-Stack Developer';

  const [roleInput, setRoleInput] = useState(initialRole);
  const [currentRole, setCurrentRole] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [benchmarkCareers, setBenchmarkCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  // 1. Initial Load: fetch benchmark careers and run initial analysis
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        setLoading(true);
        const careersRes = await api.get('/careers').catch(() => null);
        if (isMounted && careersRes?.data?.success && careersRes.data.careers) {
          setBenchmarkCareers(careersRes.data.careers);
        }

        await executeAnalysis(initialRole, false);
      } catch (err) {
        console.error('Initialization error in SkillGapPage:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initialize();
    return () => {
      isMounted = false;
    };
  }, []);

  const executeAnalysis = async (roleName, showToast = true) => {
    const cleanTitle = (roleName || roleInput || '').trim();
    if (!cleanTitle) {
      setError('Please enter a career role name.');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const res = await api.post('/careers/analyze-custom-role', {
        target_career: cleanTitle,
        title: cleanTitle,
      });

      if (res.data.success && res.data.role) {
        setCurrentRole(res.data.role);
        setCurrentAnalysis(res.data.analysis || res.data.role.analysis);
        setRoleInput(res.data.role.title);
        if (showToast) {
          toast.success(`Skill gap analysis updated for "${res.data.role.title}"!`);
        }
      }
    } catch (err) {
      console.error('Skill gap analysis failed:', err);
      const msg =
        err.response?.data?.message ||
        'Could not evaluate this career role right now. Please try again.';
      setError(msg);
      if (showToast) {
        toast.error(msg);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeAnalysis(roleInput, true);
  };

  const handleSelectSuggestion = (suggestionTitle) => {
    setRoleInput(suggestionTitle);
    executeAnalysis(suggestionTitle, true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Executive Clean Header */}
      <div className="pb-4 border-b border-[#2A302D]">
        <h1 className="text-xl sm:text-2xl font-bold text-[#F5F4EF] tracking-tight">
          Skill Gap Evaluation
        </h1>
        <p className="text-xs sm:text-sm text-[#A2AAA5] mt-1">
          Benchmark registered competencies against standard or custom role requirements.
        </p>
      </div>

      {/* SINGLE UNIFIED EVALUATION BOX */}
      <div className="bg-[#191E1C] p-5 sm:p-6 rounded-xl border border-[#2A302D] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2A302D]">
          <div>
            <h2 className="text-sm font-bold text-[#F5F4EF]">
              Target Role
            </h2>
            <p className="text-xs text-[#A2AAA5] mt-0.5">
              Type any role or select a benchmark to view required skills.
            </p>
          </div>

          {currentAnalysis && (
            <div className="flex items-baseline gap-2 self-start sm:self-auto">
              <span className="text-xl sm:text-2xl font-bold text-[#D5B777]">
                {currentAnalysis?.score ?? 0}%
              </span>
              <span className="text-xs text-[#A2AAA5]">
                Readiness Match
              </span>
            </div>
          )}
        </div>

        {/* Single Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A2AAA5]" />
              <input
                type="text"
                required
                list="benchmark-career-list"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                placeholder="Type any career role (e.g. MLOps Engineer, Cloud Architect, Full-Stack Developer...)"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[#2A302D] bg-[#222825] text-[#F5F4EF] placeholder:text-[#A2AAA5]/60 text-xs font-semibold focus:outline-none focus:border-[#2A8278] transition-colors"
              />
              <datalist id="benchmark-career-list">
                {benchmarkCareers.map((c) => (
                  <option key={c.id || c.title} value={c.title} />
                ))}
              </datalist>
            </div>

            <button
              type="submit"
              disabled={!roleInput.trim() || analyzing}
              className="px-5 py-2.5 rounded-lg bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5" />
                  <span>Evaluate Role</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-medium text-[#A2AAA5] mr-1">
              Quick Suggestions:
            </span>
            {QUICK_SUGGESTIONS.map((suggestion) => {
              const isSelected =
                currentRole?.title?.toLowerCase() === suggestion.toLowerCase();
              return (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-[#2A8278] text-[#F5F4EF] border-[#2A8278]'
                      : 'bg-[#222825] text-[#A2AAA5] border-[#2A302D] hover:border-[#3A423E] hover:text-[#F5F4EF]'
                  }`}
                >
                  {suggestion}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#222825] border border-[#2A302D] text-[#F5F4EF] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D5B777]" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      {/* Analysis Results */}
      {loading ? (
        <div className="min-h-[25vh] flex flex-col items-center justify-center gap-2.5">
          <Loader2 className="w-6 h-6 animate-spin text-[#2A8278]" />
          <p className="text-xs text-[#A2AAA5]">
            Evaluating competencies against benchmark taxonomy...
          </p>
        </div>
      ) : currentAnalysis && currentRole ? (
        <div className="bg-[#191E1C] p-5 sm:p-6 rounded-xl border border-[#2A302D] space-y-5">
          {/* Role Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#2A302D] pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-[#F5F4EF]">
                  {currentRole.title}
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#222825] text-[#D5B777] border border-[#2A302D]">
                  {currentRole.isCustom ? 'Custom Role Profile' : 'Industry Benchmark'}
                </span>
              </div>
              {currentRole.description && (
                <p className="text-xs text-[#A2AAA5] mt-1 max-w-2xl leading-relaxed">
                  {currentRole.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                navigate('/roadmaps', { state: { targetRole: currentRole.title } })
              }
              className="px-3.5 py-2 rounded-lg bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Generate Roadmap</span>
            </button>
          </div>

          {/* Advice Callout */}
          {currentRole.learning_advice && (
            <div className="p-3.5 rounded-lg bg-[#222825] border border-[#2A302D] flex items-start gap-2.5 text-xs">
              <Lightbulb className="w-4 h-4 text-[#D5B777] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#F5F4EF] block">
                  Guidance Note:
                </span>
                <p className="text-[#A2AAA5] mt-0.5 leading-relaxed">
                  {currentRole.learning_advice}
                </p>
              </div>
            </div>
          )}

          {/* Progress & Alignment */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-[#F5F4EF] mb-1.5">
              <span>Overall Skill Alignment</span>
              <span>
                {(currentAnalysis?.matched || []).length} of {currentAnalysis?.total || 0} Required Skills ({currentAnalysis?.score ?? 0}%)
              </span>
            </div>
            <ProgressBar progress={currentAnalysis?.score ?? 0} />
            <div className="mt-2 text-xs text-[#A2AAA5] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                Readiness: <strong className="text-[#D5B777]">{currentAnalysis?.readinessStatus || 'Evaluating'}</strong> • Benchmarked against registered profile competencies.
              </span>
            </div>
          </div>

          {/* Required Skill Breakdown List (Human Table Row Style) */}
          <div className="space-y-3 pt-3 border-t border-[#2A302D]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#F5F4EF] uppercase tracking-wider text-[#A2AAA5]">
                Competency Breakdown
              </h3>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="text-[#F5F4EF] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2A8278]" />
                  {(currentAnalysis?.matched || []).length} Acquired
                </span>
                <span className="text-[#A2AAA5] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D5B777]" />
                  {(currentAnalysis?.missing || []).length} Priority Gaps
                </span>
              </div>
            </div>

            <div className="divide-y divide-[#2A302D] border border-[#2A302D] rounded-lg overflow-hidden bg-[#101312]">
              {currentRole.required_skills?.map((skill, idx) => {
                const isAcquired = (currentAnalysis?.matched || []).some(
                  (m) => m.toLowerCase().trim() === skill.toLowerCase().trim()
                );
                return (
                  <div
                    key={`${skill}-${idx}`}
                    className="p-3 flex items-center justify-between text-xs hover:bg-[#191E1C] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isAcquired ? 'bg-[#2A8278]' : 'bg-[#D5B777]'}`} />
                      <span className="font-semibold text-[#F5F4EF]">{skill}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        isAcquired
                          ? 'bg-[#2A8278]/20 text-[#2A8278]'
                          : 'bg-[#222825] text-[#D5B777] border border-[#2A302D]'
                      }`}
                    >
                      {isAcquired ? 'Verified' : 'Priority Gap'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Projects (if available) */}
          {currentRole.recommended_projects?.length > 0 && (
            <div className="pt-3 border-t border-[#2A302D] space-y-2.5">
              <h4 className="text-xs font-bold text-[#A2AAA5] uppercase tracking-wider flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-[#D5B777]" />
                <span>Recommended Projects</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentRole.recommended_projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-[#2A302D] bg-[#222825] text-xs"
                  >
                    <span className="font-bold text-[#F5F4EF] block">
                      {typeof proj === 'string' ? proj : proj.title}
                    </span>
                    {typeof proj === 'object' && proj.description && (
                      <span className="text-[#A2AAA5] block mt-1 leading-relaxed">
                        {proj.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default SkillGapPage;
