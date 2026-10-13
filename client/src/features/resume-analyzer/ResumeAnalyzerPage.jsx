import React, { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  UploadCloud,
  Check,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const ProgressBar = ({ progress = 0 }) => (
  <div className="w-full bg-[#222825] h-1.5 rounded-full overflow-hidden border border-[#2A302D]">
    <div
      className="bg-[#2A8278] h-1.5 rounded-full transition-all duration-700"
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  </div>
);

export const ResumeAnalyzerPage = () => {
  const toast = useToast();

  const [targetRole, setTargetRole] = useState('Full-Stack Developer');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        setError('Only PDF resumes are supported.');
        setFile(null);
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setError('File size must be under 5MB.');
        setFile(null);
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleUploadAndAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF resume to analyze.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);
    formData.append('target_role', targetRole);
    if (jobDescription) {
      formData.append('jobDescription', jobDescription);
      formData.append('job_description', jobDescription);
    }

    try {
      const res = await api.post('/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        const rawAna = res.data.analysis;
        const normalizedAna = rawAna?.analysis_result
          ? { ...rawAna, ...rawAna.analysis_result }
          : rawAna;
        setAnalysis(normalizedAna);
        toast.success('Resume analyzed successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to analyze resume. Please ensure it is a valid text-based PDF.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const displayAnalysis = analysis
    ? (analysis.analysis_result ? { ...analysis, ...analysis.analysis_result } : analysis)
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Executive Clean Header */}
      <div className="pb-4 border-b border-[#2A302D]">
        <h1 className="text-xl sm:text-2xl font-bold text-[#F5F4EF] tracking-tight">
          Resume Review & ATS Verification
        </h1>
        <p className="text-xs sm:text-sm text-[#A2AAA5] mt-1">
          Evaluate ATS compatibility, identify keyword alignment, and review bullet points against industry standards.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-[#222825] border border-[#2A302D] text-[#F5F4EF] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#D5B777]" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload & Target Role Form */}
      <div className="space-y-6">
        <form
          onSubmit={handleUploadAndAnalyze}
          className="bg-[#191E1C] p-5 sm:p-6 rounded-xl border border-[#2A302D] space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#A2AAA5] uppercase tracking-wider mb-1">
                Target Role
              </label>
              <input
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Backend Developer"
                className="w-full px-3 py-2 rounded-lg border border-[#2A302D] text-xs focus:outline-none focus:border-[#2A8278] bg-[#222825] text-[#F5F4EF] placeholder:text-[#A2AAA5]/50 font-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#A2AAA5] uppercase tracking-wider mb-1">
                Job Description (Optional)
              </label>
              <input
                type="text"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job posting snippet or core requirements..."
                className="w-full px-3 py-2 rounded-lg border border-[#2A302D] text-xs focus:outline-none focus:border-[#2A8278] bg-[#222825] text-[#F5F4EF] placeholder:text-[#A2AAA5]/50 font-medium transition-colors"
              />
            </div>
          </div>

          {/* Minimalist Upload Area */}
          <div
            className={`border border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              file
                ? 'border-[#2A8278] bg-[#222825]'
                : 'border-[#2A302D] hover:border-[#3A423E] bg-[#191E1C] hover:bg-[#222825]/60'
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              id="resume-file-input"
              className="hidden"
            />
            <label htmlFor="resume-file-input" className="cursor-pointer block space-y-2">
              <div className="w-10 h-10 rounded-lg mx-auto flex items-center justify-center bg-[#222825] border border-[#2A302D]">
                {file ? (
                  <CheckCircle2 className="w-5 h-5 text-[#2A8278]" />
                ) : (
                  <UploadCloud className="w-5 h-5 text-[#A2AAA5]" />
                )}
              </div>
              <div className="text-xs font-semibold text-[#F5F4EF]">
                {file ? file.name : 'Select or drag a PDF resume here'}
              </div>
              <p className="text-[11px] text-[#A2AAA5]">
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB • Ready for evaluation` : 'Text-based PDF documents up to 5MB supported'}
              </p>
            </label>
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full py-2.5 px-4 rounded-lg bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            <span>{loading ? 'Evaluating Resume...' : 'Analyze Resume'}</span>
          </button>
        </form>

        {/* Results Card */}
        {displayAnalysis && (
          <div className="bg-[#191E1C] p-5 sm:p-6 rounded-xl border border-[#2A302D] space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A302D] pb-4">
              <div>
                <span className="text-[11px] font-semibold text-[#D5B777] uppercase tracking-wider block mb-0.5">
                  Evaluation Complete
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[#F5F4EF]">
                  {displayAnalysis.targetRole || targetRole}
                </h2>
                <p className="text-xs text-[#A2AAA5] mt-0.5">
                  {displayAnalysis.wordCount || 0} words parsed • {(displayAnalysis.detectedSkills || []).length} technical skills verified
                </p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-3xl font-extrabold text-[#D5B777]">{displayAnalysis.overallScore ?? 0}%</div>
                <span className="text-xs font-medium text-[#A2AAA5]">Overall ATS Match</span>
              </div>
            </div>

            {/* Metric Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-[#222825] rounded-lg border border-[#2A302D]">
                <div className="flex justify-between text-xs font-semibold text-[#F5F4EF] mb-1.5">
                  <span>Skill Alignment</span>
                  <span className="font-bold text-[#D5B777]">{displayAnalysis.skillScore ?? 0}%</span>
                </div>
                <ProgressBar progress={displayAnalysis.skillScore ?? 0} />
              </div>

              <div className="p-3.5 bg-[#222825] rounded-lg border border-[#2A302D]">
                <div className="flex justify-between text-xs font-semibold text-[#F5F4EF] mb-1.5">
                  <span>Document Structure</span>
                  <span className="font-bold text-[#D5B777]">{displayAnalysis.formattingScore ?? 0}%</span>
                </div>
                <ProgressBar progress={displayAnalysis.formattingScore ?? 0} />
              </div>
            </div>

            {/* Skill Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#222825] border border-[#2A302D] space-y-2.5">
                <h3 className="text-xs font-bold text-[#F5F4EF] flex items-center gap-1.5 uppercase tracking-wider">
                  <Check className="w-3.5 h-3.5 text-[#2A8278]" />
                  <span>Detected Competencies ({(displayAnalysis.matchedSkills || []).length})</span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(displayAnalysis.matchedSkills || []).map((s, idx) => (
                    <span key={`${s}-${idx}`} className="px-2 py-0.5 rounded bg-[#191E1C] border border-[#2A302D] text-[11px] font-medium text-[#F5F4EF]">
                      {s}
                    </span>
                  ))}
                  {(!displayAnalysis.matchedSkills || displayAnalysis.matchedSkills.length === 0) && (
                    <span className="text-xs text-[#A2AAA5]">No verified competencies detected.</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#222825] border border-[#2A302D] space-y-2.5">
                <h3 className="text-xs font-bold text-[#F5F4EF] flex items-center gap-1.5 uppercase tracking-wider">
                  <X className="w-3.5 h-3.5 text-[#D5B777]" />
                  <span>Missing Target Skills ({(displayAnalysis.missingSkills || []).length})</span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(displayAnalysis.missingSkills || []).map((s, idx) => (
                    <span key={`${s}-${idx}`} className="px-2 py-0.5 rounded bg-[#191E1C] border border-[#2A302D] text-[11px] font-medium text-[#D5B777]">
                      + {s}
                    </span>
                  ))}
                  {(!displayAnalysis.missingSkills || displayAnalysis.missingSkills.length === 0) && (
                    <span className="text-xs text-[#A2AAA5]">All critical role skills detected!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            {displayAnalysis.executiveSummary && (
              <div className="p-3.5 rounded-lg bg-[#222825] border border-[#2A302D] space-y-1">
                <span className="text-[11px] font-bold text-[#D5B777] uppercase tracking-wider block">
                  Recruiter Evaluation
                </span>
                <p className="text-xs text-[#F5F4EF] leading-relaxed">
                  {displayAnalysis.executiveSummary}
                </p>
              </div>
            )}

            {/* Bullet Point Rewrites */}
            {displayAnalysis.bulletRevisions && displayAnalysis.bulletRevisions.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-[#2A302D]">
                <h3 className="text-xs font-bold text-[#F5F4EF] uppercase tracking-wider">
                  High-Impact Bullet Recommendations
                </h3>
                <div className="space-y-2.5">
                  {displayAnalysis.bulletRevisions.map((rev, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-3.5 rounded-lg bg-[#222825] border border-[#2A302D] space-y-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-[#A2AAA5]">
                          Draft:
                        </span>
                        <p className="text-[#A2AAA5] line-through">
                          "{rev.original}"
                        </p>
                      </div>
                      <div className="space-y-0.5 pt-1 border-t border-[#2A302D]">
                        <span className="text-[10px] uppercase font-bold text-[#D5B777]">
                          Impact Rewrite:
                        </span>
                        <p className="text-[#F5F4EF] font-semibold leading-relaxed">
                          • {rev.revised}
                        </p>
                      </div>
                      {rev.reason && (
                        <p className="text-[11px] text-[#A2AAA5]">
                          {rev.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Observations */}
            <div className="space-y-2.5 pt-2 border-t border-[#2A302D]">
              <h3 className="text-xs font-bold text-[#F5F4EF] uppercase tracking-wider">
                Key Observations
              </h3>
              <div className="space-y-1.5">
                {(displayAnalysis.strengths || []).map((str, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#F5F4EF]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2A8278] shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </div>
                ))}
                {(displayAnalysis.improvements || []).map((imp, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#A2AAA5]">
                    <AlertCircle className="w-3.5 h-3.5 text-[#D5B777] shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzerPage;
