import React, { useState } from 'react';
import api from '../../services/api';
import { Wand2, Check, Copy, X, Loader2, AlertCircle } from 'lucide-react';

const SummaryImproverModal = ({
  isOpen,
  onClose,
  initialSummary = '',
  skills = [],
  jobTitle = '',
  jobDescription = ''
}) => {
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleImprove = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const userGeminiKey = localStorage.getItem('resumeiq_user_gemini_key');
      const headers = {};
      if (userGeminiKey) {
        headers['x-user-gemini-key'] = userGeminiKey;
      }

      const res = await api.post(
        '/ai/improve-summary',
        {
          originalSummary: summary.trim(),
          skills,
          jobTitle,
          jobDescription
        },
        { headers }
      );

      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to optimize summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.improvedSummary) {
      navigator.clipboard.writeText(result.improvedSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-xl border border-[#ded6c5] bg-white p-6 shadow-2xl dark:border-[#2A302D] dark:bg-[#101312] sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#ded6c5]/60 dark:border-[#2A302D]">
          <div className="flex items-center gap-2 text-stone-900 dark:text-[#F5F4EF] font-bold text-base">
            <Wand2 className="h-4 w-4 text-[#D5B777]" />
            <span>Professional Summary Optimizer</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-[#ede6d8] dark:hover:bg-[#222825] dark:text-[#A2AAA5] hover:text-[#F5F4EF] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-[#2A302D] bg-[#222825] p-3 text-xs text-[#F5F4EF]">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#D5B777]" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-[#A2AAA5] mb-1">
              <span className="font-semibold text-stone-900 dark:text-[#F5F4EF]">Target Role:</span>
              <span className="font-bold text-stone-900 dark:text-[#D5B777]">{jobTitle || 'Software Engineer'}</span>
            </div>
            <label className="block text-xs font-semibold text-stone-900 dark:text-[#F5F4EF]">
              Original Summary
            </label>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Paste or edit your original professional summary..."
              className="mt-1.5 w-full rounded-lg border border-[#ded6c5] bg-[#faf7f2] p-3 text-xs text-stone-900 focus:outline-hidden dark:border-[#2A302D] dark:bg-[#191E1C] dark:text-[#F5F4EF] focus:border-[#2A8278]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleImprove}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[#2A8278] hover:bg-[#236e66] px-4 py-2 text-xs font-semibold text-[#F5F4EF] shadow-xs disabled:opacity-60 transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F5F4EF]" />
                  <span>Aligning with Target Role...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-3.5 w-3.5 text-[#F5F4EF]" />
                  <span>{result ? 'Regenerate Summary' : 'Optimize Summary'}</span>
                </>
              )}
            </button>
          </div>

          {result && (
            <div className="mt-5 space-y-4 rounded-lg border border-[#ded6c5] bg-[#faf7f2] p-5 dark:border-[#2A302D] dark:bg-[#191E1C]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 dark:text-[#F5F4EF]">
                  Tailored Professional Summary:
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-md border border-[#ded6c5] bg-white px-2.5 py-1 text-xs font-medium text-stone-900 shadow-2xs hover:bg-[#ede6d8] dark:border-[#2A302D] dark:bg-[#222825] dark:text-[#F5F4EF] hover:dark:bg-[#2A302D] transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-[#2A8278]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Summary</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs font-medium text-stone-900 dark:text-[#F5F4EF] leading-relaxed bg-white dark:bg-[#101312] p-3.5 rounded-lg border border-[#ded6c5] dark:border-[#2A302D]">
                {result.improvedSummary}
              </p>

              {result.keyChanges && result.keyChanges.length > 0 && (
                <div className="pt-2 border-t border-[#ded6c5]/60 dark:border-[#2A302D]">
                  <span className="text-[11px] font-semibold text-stone-900 dark:text-[#D5B777]">
                    Strategic Adjustments:
                  </span>
                  <ul className="mt-1 space-y-1 text-[11px] text-stone-700 dark:text-[#A2AAA5]">
                    {result.keyChanges.map((change, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-[#2A8278] shrink-0" />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryImproverModal;
