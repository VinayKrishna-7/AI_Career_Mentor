import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Compass,
  AlertCircle,
  Loader2,
  Route,
  Check,
  Plus,
} from 'lucide-react';

export const CareerRecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [customCareerQuery, setCustomCareerQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await api.post('/careers/recommend');
        if (res.data.success) {
          setRecommendations(res.data.recommendations);
        }
      } catch (err) {
        setError('Failed to load career recommendations.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleCreateRoadmap = (careerTitle) => {
    navigate('/roadmaps', { state: { targetRole: careerTitle } });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-stone-900 dark:text-[#f5efe4]" />
        <p className="text-sm text-stone-600 dark:text-stone-400 font-medium">
          Analyzing your skills and generating recommendations...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#f5efe4] dark:bg-[#1e1e23] border border-[#ded6c5] dark:border-[#2a2a30] text-stone-900 dark:text-[#f5efe4] text-xs font-semibold mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Role Matcher</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-[#f5efe4] tracking-tight">Career Recommendations</h1>
        <p className="text-stone-600 dark:text-stone-400 text-sm mt-1 max-w-2xl leading-relaxed">
          Ranked based on your current skills and interests, verified through our skill dictionary and enriched with personalized guidance.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-[#222825] border border-[#2A302D] text-[#F5F4EF] text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-[#D5B777]" />
          <span>{error}</span>
        </div>
      )}

      {/* Custom Career Choice Exploration Bar */}
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#101312] border border-[#ded6c5] dark:border-[#2A302D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#f5efe4] dark:bg-[#222825] border border-[#ded6c5] dark:border-[#2A302D] flex items-center justify-center text-stone-900 dark:text-[#2A8278] shrink-0">
            <Route className="w-4 h-4 text-[#2A8278]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 dark:text-[#F5F4EF]">
              Have a specific career in mind?
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-[#A2AAA5]">
              Input your custom career choice and build a tailored roadmap according to it.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (customCareerQuery.trim()) {
              handleCreateRoadmap(customCareerQuery.trim());
            }
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            required
            placeholder="e.g. MLOps Engineer, Quant Dev..."
            value={customCareerQuery}
            onChange={(e) => setCustomCareerQuery(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#ded6c5] dark:border-[#2A302D] bg-[#faf7f2] dark:bg-[#191E1C] text-stone-900 dark:text-[#F5F4EF] text-xs focus:outline-none w-full sm:w-56 focus:border-[#2A8278]"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] text-xs font-semibold shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            Create Roadmap
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {recommendations.map((role) => (
          <div
            key={role.id || role.title}
            className="bg-white dark:bg-[#101312] p-6 sm:p-7 rounded-xl border border-[#ded6c5] dark:border-[#2A302D] shadow-xs hover:border-[#2A8278] dark:hover:border-[#2A8278] transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-stone-900 dark:text-[#F5F4EF]">{role.title}</h2>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#f5efe4] dark:bg-[#222825] text-stone-900 dark:text-[#D5B777] border border-[#ded6c5] dark:border-[#2A302D]">
                    {role.overallFitScore}% Match
                  </span>
                </div>
                <p className="text-stone-600 dark:text-[#A2AAA5] text-xs sm:text-sm mt-1 leading-relaxed max-w-3xl">
                  {role.description}
                </p>
              </div>

              <button
                onClick={() => handleCreateRoadmap(role.title)}
                className="shrink-0 px-4 py-2 rounded-lg bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] text-xs sm:text-sm font-semibold transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Route className="w-4 h-4 text-[#F5F4EF]" />
                <span>Build Roadmap</span>
              </button>
            </div>

            {/* Why Fit Card */}
            <div className="p-4 rounded-xl bg-[#faf7f2] dark:bg-[#101012] border border-[#ded6c5] dark:border-[#2a2a30] mb-5">
              <span className="text-xs font-bold text-stone-900 dark:text-[#f5efe4] uppercase tracking-wider block mb-1">
                Why this role fits you
              </span>
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{role.whyFit}</p>
            </div>

            {/* Skill Matches vs Missing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#f5efe4] dark:bg-[#1e1e23] border border-[#ded6c5] dark:border-[#2a2a30]">
                <span className="font-bold text-stone-900 dark:text-[#f5efe4] block mb-2">
                  Skills You Have ({role.skillAnalysis.matchedCount})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {role.skillAnalysis.matchedSkills.length > 0 ? (
                    role.skillAnalysis.matchedSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-md bg-white dark:bg-[#161619] text-stone-900 dark:text-[#f5efe4] border border-[#ded6c5] dark:border-[#2a2a30] font-medium shadow-2xs"
                      >
                        ✓ {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-stone-400 italic">No overlapping skills yet.</span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf7f2] dark:bg-[#101012] border border-[#ded6c5] dark:border-[#2a2a30]">
                <span className="font-bold text-stone-900 dark:text-[#f5efe4] block mb-2">
                  Skills to Learn ({role.skillAnalysis.missingCount})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {role.skillAnalysis.missingSkills.slice(0, 6).map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md bg-white dark:bg-[#161619] text-stone-800 dark:text-[#f5efe4] border border-[#ded6c5] dark:border-[#2a2a30] font-medium shadow-2xs"
                    >
                      + {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerRecommendationsPage;
