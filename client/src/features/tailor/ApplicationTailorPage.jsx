import React, { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  FileSearch,
  Wand2,
  Check,
  X,
  Copy,
  ArrowRight,
  Loader2,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

export const ApplicationTailorPage = () => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('jd-matcher'); // 'jd-matcher' | 'bullet-polisher'

  // Tool 1: JD Extractor State
  const [jobText, setJobText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [jdError, setJdError] = useState('');
  const [jdResult, setJdResult] = useState(null);

  // Tool 2: Bullet Improver State
  const [bulletRole, setBulletRole] = useState('');
  const [rawBullet, setRawBullet] = useState('');
  const [bulletCount, setBulletCount] = useState(3);
  const [improvingBullet, setImprovingBullet] = useState(false);
  const [bulletResult, setBulletResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Extract skills from pasted JD
  const handleExtractFromJD = async (e) => {
    e.preventDefault();
    if (!jobText.trim() || extracting) return;

    setExtracting(true);
    setJdError('');

    try {
      const res = await api.post('/careers/extract-skills', { text: jobText.trim() });
      if (res.data.success) {
        setJdResult(res.data);
        toast.success(`Extracted ${res.data.extracted?.totalCount || 0} skills from job description!`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to extract skills from job description.';
      setJdError(msg);
      toast.error(msg);
    } finally {
      setExtracting(false);
    }
  };

  // Bridge from Tool 1 to Tool 2
  const handleProceedToBulletTailoring = () => {
    if (jdResult?.extracted?.jobTitle) {
      setBulletRole(jdResult.extracted.jobTitle);
    }
    setActiveTab('bullet-polisher');
    toast.info('Switched to Bullet Polisher. Craft resume bullets targeting this role!');
  };

  // Polish resume bullet points
  const handleImproveBullet = async (e) => {
    e.preventDefault();
    if (!rawBullet.trim() || improvingBullet) return;

    setImprovingBullet(true);
    setBulletResult(null);

    try {
      const res = await api.post('/resume/improve-bullet', {
        bullet: rawBullet.trim(),
        jobRole: bulletRole.trim(),
        count: bulletCount,
      });

      if (res.data.success) {
        setBulletResult(res.data);
        toast.success(`Generated ${res.data.bullets?.length || bulletCount} high-impact bullet points!`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to polish bullet points.';
      toast.error(msg);
    } finally {
      setImprovingBullet(false);
    }
  };

  const copyToClipboard = (text, idx = null) => {
    navigator.clipboard.writeText(text);
    if (idx !== null) {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#f5efe4] dark:bg-[#1e1e23] border border-[#ded6c5] dark:border-[#2a2a30] text-stone-900 dark:text-[#f5efe4] text-xs font-semibold mb-2">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Job Application Tailor</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-[#f5efe4] tracking-tight">
          Application Tailor
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 max-w-2xl">
          Match target job postings to your skill profile, identify exact missing requirements, and formulate high-impact resume bullet points.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-[#ded6c5] dark:border-[#2a2a30] gap-6">
        <button
          onClick={() => setActiveTab('jd-matcher')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'jd-matcher'
              ? 'border-stone-900 text-stone-900 dark:border-[#f5efe4] dark:text-[#f5efe4]'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#f5efe4]'
          }`}
        >
          <FileSearch className="w-4 h-4" />
          <span>1. Job Description Matcher</span>
        </button>

        <button
          onClick={() => setActiveTab('bullet-polisher')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'bullet-polisher'
              ? 'border-stone-900 text-stone-900 dark:border-[#f5efe4] dark:text-[#f5efe4]'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#f5efe4]'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>2. Resume Bullet Polisher</span>
        </button>
      </div>

      {/* TAB 1: Job Description Matcher */}
      {activeTab === 'jd-matcher' && (
        <div className="space-y-6">
          <form
            onSubmit={handleExtractFromJD}
            className="bg-white dark:bg-[#101312] p-6 sm:p-8 rounded-xl border border-[#ded6c5] dark:border-[#2A302D] shadow-xs space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700 dark:text-[#F5F4EF] uppercase tracking-wider">
                  Paste Job Description (LinkedIn / Indeed / Careers Page):
                </label>
                <span className="text-[11px] text-stone-400 dark:text-[#A2AAA5]">{jobText.length}/5000</span>
              </div>
              <textarea
                rows={7}
                required
                maxLength={5000}
                placeholder="Paste the job posting text here... (e.g. 'We are hiring a Full-Stack Engineer with experience in React, Node.js, TypeScript, PostgreSQL, Docker, and AWS...')"
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#ded6c5] dark:border-[#2A302D] text-sm focus:outline-none bg-[#faf7f2] dark:bg-[#191E1C] text-stone-900 dark:text-[#F5F4EF] placeholder:text-stone-400 dark:placeholder:text-[#A2AAA5]/50 leading-relaxed focus:border-[#2A8278]"
              />
            </div>

            <button
              type="submit"
              disabled={!jobText.trim() || extracting}
              className="w-full py-3 rounded-lg bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {extracting ? <Loader2 className="w-5 h-5 animate-spin text-[#F5F4EF]" /> : <FileSearch className="w-5 h-5 text-[#F5F4EF]" />}
              <span>{extracting ? 'Analyzing Job Posting...' : 'Extract Required Skills & Compare with Profile'}</span>
            </button>
          </form>

          {jdError && (
            <div className="p-4 rounded-xl bg-[#222825] border border-[#2A302D] text-[#F5F4EF] text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-[#D5B777]" />
              <span>{jdError}</span>
            </div>
          )}

          {jdResult && (
            <div className="bg-white dark:bg-[#101312] p-6 sm:p-8 rounded-xl border border-[#ded6c5] dark:border-[#2A302D] shadow-xs space-y-6">
              {/* Header breakdown */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#ded6c5] dark:border-[#2A302D] pb-4">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-[#F5F4EF]">
                    Job Description Competencies
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-[#A2AAA5] mt-0.5">
                    Found {jdResult.extracted?.totalCount || 0} recognized technical competencies in this posting
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-3xl font-black text-stone-900 dark:text-[#F5F4EF]">
                      {jdResult.comparison?.matchPercentage}%
                    </div>
                    <span className="text-xs font-semibold text-stone-500 dark:text-[#A2AAA5]">Profile Match</span>
                  </div>

                  <button
                    onClick={handleProceedToBulletTailoring}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] text-xs font-semibold transition-all shadow-xs cursor-pointer"
                  >
                    <span>Tailor Bullets</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#F5F4EF]" />
                  </button>
                </div>
              </div>

              {/* Matched vs Missing Skills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#f5efe4] dark:bg-[#191E1C] border border-[#ded6c5] dark:border-[#2A302D] space-y-2">
                  <span className="text-xs font-bold text-stone-900 dark:text-[#F5F4EF] flex items-center gap-1">
                    <Check className="w-4 h-4 text-[#2A8278]" />
                    <span>Skills You Have ({jdResult.comparison?.matchedSkills?.length || 0})</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(jdResult.comparison?.matchedSkills || []).map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-md bg-white dark:bg-[#222825] text-xs font-medium text-stone-900 dark:text-[#F5F4EF] border border-[#ded6c5] dark:border-[#2A302D] shadow-2xs"
                      >
                        {s}
                      </span>
                    ))}
                    {(jdResult.comparison?.matchedSkills || []).length === 0 && (
                      <span className="text-xs text-stone-400 dark:text-[#A2AAA5] italic">No direct profile skill matches.</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#f5efe4] dark:bg-[#191E1C] border border-[#ded6c5] dark:border-[#2A302D] space-y-2">
                  <span className="text-xs font-bold text-stone-900 dark:text-[#F5F4EF] flex items-center gap-1">
                    <X className="w-4 h-4 text-[#D5B777]" />
                    <span>Missing Requirements ({jdResult.comparison?.missingSkills?.length || 0})</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(jdResult.comparison?.missingSkills || []).map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-md bg-white dark:bg-[#222825] text-xs font-medium text-stone-900 dark:text-[#D5B777] border border-[#ded6c5] dark:border-[#2A302D] shadow-2xs"
                      >
                        + {s}
                      </span>
                    ))}
                    {(jdResult.comparison?.missingSkills || []).length === 0 && (
                      <span className="text-xs font-semibold text-stone-900 dark:text-[#2A8278]">100% matched with all requirements!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Categorized Skills Breakdown */}
              {jdResult.extracted?.byCategory && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Categorized Competencies:
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(jdResult.extracted.byCategory).map(([cat, list]) => (
                      <div
                        key={cat}
                        className="p-3 bg-[#faf7f2] dark:bg-[#101012] border border-[#ded6c5] dark:border-[#2a2a30] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <span className="font-bold text-stone-900 dark:text-[#f5efe4] shrink-0">{cat}</span>
                        <div className="flex flex-wrap gap-1">
                          {list.map((item) => (
                            <span
                              key={item}
                              className="px-2 py-0.5 bg-white dark:bg-[#161619] border border-[#ded6c5] dark:border-[#2a2a30] rounded text-stone-800 dark:text-[#f5efe4] font-medium"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Resume Bullet Polisher */}
      {activeTab === 'bullet-polisher' && (
        <div className="bg-white dark:bg-[#101312] p-6 sm:p-8 rounded-xl border border-[#ded6c5] dark:border-[#2A302D] shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-[#F5F4EF]">
              Formulate Impactful Resume Bullets
            </h2>
            <p className="text-xs text-stone-500 dark:text-[#A2AAA5] mt-1">
              Transforms passive responsibility statements and rough draft notes into high-impact accomplishments following the proven formula: <span className="font-semibold text-stone-900 dark:text-[#F5F4EF]">"Accomplished [X], measured by [Y], by doing [Z]"</span>.
            </p>
          </div>

          <form onSubmit={handleImproveBullet} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-[#F5F4EF] mb-1">
                  Target Role / Job Title (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Backend Engineer, Full-Stack Developer"
                  value={bulletRole}
                  onChange={(e) => setBulletRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#ded6c5] dark:border-[#2A302D] bg-[#faf7f2] dark:bg-[#191E1C] text-sm focus:outline-none text-stone-900 dark:text-[#F5F4EF] placeholder:text-stone-400 dark:placeholder:text-[#A2AAA5]/50 focus:border-[#2A8278]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-[#F5F4EF] mb-1">
                  Bullet Points to Generate:
                </label>
                <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBulletCount(num)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        bulletCount === num
                          ? 'bg-[#2A8278] text-[#F5F4EF] border-[#2A8278] shadow-xs'
                          : 'bg-[#faf7f2] dark:bg-[#191E1C] text-stone-700 dark:text-[#A2AAA5] border-[#ded6c5] dark:border-[#2A302D] hover:border-stone-900 dark:hover:border-[#2A8278]'
                      }`}
                    >
                      {num} {num === 1 ? 'Pt' : 'Pts'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700 dark:text-[#F5F4EF]">
                  Experience, Project Details, or Draft Notes:
                </label>
                <span className="text-[11px] text-stone-400 dark:text-[#A2AAA5]">{rawBullet.length}/3000</span>
              </div>
              <textarea
                rows={6}
                required
                maxLength={3000}
                placeholder="Paste what you worked on, rough project bullets, or task descriptions... Generates professional, metric-driven bullet points."
                value={rawBullet}
                onChange={(e) => setRawBullet(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#ded6c5] dark:border-[#2A302D] bg-[#faf7f2] dark:bg-[#191E1C] text-sm focus:outline-none text-stone-900 dark:text-[#F5F4EF] placeholder:text-stone-400 dark:placeholder:text-[#A2AAA5]/50 leading-relaxed focus:border-[#2A8278]"
              />
            </div>

            <button
              type="submit"
              disabled={!rawBullet.trim() || improvingBullet}
              className="w-full py-2.5 rounded-lg bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] font-semibold text-sm transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {improvingBullet ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#F5F4EF]" />
              ) : (
                <Wand2 className="w-5 h-5 text-[#F5F4EF]" />
              )}
              <span>
                {improvingBullet
                  ? `Formulating ${bulletCount} Impactful Bullets...`
                  : `Generate ${bulletCount} Metric-Driven Bullet Points`}
              </span>
            </button>
          </form>

          {/* Result Output */}
          {bulletResult && (
            <div className="p-6 rounded-xl bg-[#faf7f2] dark:bg-[#101312] border border-[#ded6c5] dark:border-[#2A302D] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-stone-900 dark:text-[#F5F4EF] uppercase tracking-wider flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-[#D5B777]" />
                  <span>Optimized Bullet Points ({bulletResult.bullets?.length || 1})</span>
                </span>

                <button
                  onClick={() => {
                    const allText = (bulletResult.bullets || [{ bullet: bulletResult.improvedBullet }])
                      .map((b) => `• ${b.bullet}`)
                      .join('\n\n');
                    copyToClipboard(allText);
                  }}
                  className="px-3 py-1 bg-white dark:bg-[#222825] border border-[#ded6c5] dark:border-[#2A302D] text-stone-900 dark:text-[#F5F4EF] rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-[#f5efe4] dark:hover:bg-[#2A302D] transition-colors shadow-xs cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'All Copied!' : 'Copy All Bullets'}</span>
                </button>
              </div>

              {bulletResult.summaryOverview && (
                <p className="text-xs text-stone-700 dark:text-[#A2AAA5] bg-white dark:bg-[#191E1C] p-2.5 rounded-lg border border-[#ded6c5] dark:border-[#2A302D]">
                  {bulletResult.summaryOverview}
                </p>
              )}

              <div className="space-y-3">
                {(bulletResult.bullets || [
                  {
                    bullet: bulletResult.improvedBullet,
                    actionVerb: bulletResult.actionVerbUsed,
                    rationale: bulletResult.rationale,
                  },
                ]).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white dark:bg-[#161619] rounded-xl border border-[#ded6c5] dark:border-[#2a2a30] shadow-xs space-y-2 group transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#f5efe4] dark:bg-[#1e1e23] border border-[#ded6c5] dark:border-[#2a2a30] text-stone-900 dark:text-[#f5efe4] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-stone-900 dark:text-[#f5efe4] leading-relaxed">
                          • {item.bullet}
                        </p>
                      </div>

                      <button
                        onClick={() => copyToClipboard(`• ${item.bullet}`, idx)}
                        className="p-1.5 rounded-lg border border-[#ded6c5] dark:border-[#2a2a30] hover:bg-[#f5efe4] dark:hover:bg-[#1e1e23] text-stone-500 dark:text-stone-400 text-xs shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copy this bullet"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold">
                          {copiedIndex === idx ? 'Copied' : 'Copy'}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 pt-1 border-t border-[#ded6c5] dark:border-[#2a2a30] flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {item.actionVerb && (
                          <span className="px-2 py-0.5 rounded-md bg-[#f5efe4] dark:bg-[#1e1e23] text-stone-900 dark:text-[#f5efe4] font-semibold text-[10px] border border-[#ded6c5] dark:border-[#2a2a30]">
                            Verb: {item.actionVerb}
                          </span>
                        )}
                        {item.metric && (
                          <span className="px-2 py-0.5 rounded-md bg-[#f5efe4] dark:bg-[#1e1e23] text-stone-900 dark:text-[#f5efe4] font-semibold text-[10px] border border-[#ded6c5] dark:border-[#2a2a30]">
                            Impact: {item.metric}
                          </span>
                        )}
                      </div>

                      {item.rationale && (
                        <span className="text-[11px] text-stone-500 italic">
                          {item.rationale}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationTailorPage;
