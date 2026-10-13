import React, { useState } from 'react';
import api from '../../services/api';
import { Wand2, Check, Copy, X, Loader2, AlertCircle } from 'lucide-react';

const BulletImproverModal = ({ isOpen, onClose, initialBullet = '', roleContext = '' }) => {
  const [bullet, setBullet] = useState(initialBullet);
  const [userMetric, setUserMetric] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleImprove = async () => {
    if (!bullet.trim()) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const userGeminiKey = localStorage.getItem('resumeiq_user_gemini_key');
      const headers = {};
      if (userGeminiKey) {
        headers['x-user-gemini-key'] = userGeminiKey;
      }

      const res = await api.post(
        '/ai/improve-bullet',
        {
          bullet: bullet.trim(),
          roleContext,
          userMetric: userMetric.trim()
        },
        { headers }
      );

      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to improve bullet point.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.improvedBullet) {
      navigator.clipboard.writeText(result.improvedBullet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-xl border border-[#ded6c5] bg-white p-6 shadow-2xl dark:border-[#2A302D] dark:bg-[#101312] sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#ded6c5]/60 dark:border-[#2A302D]">
          <div className="flex items-center gap-2 text-stone-900 dark:text-[#F5F4EF] font-bold text-base">
            <Wand2 className="h-4 w-4 text-[#D5B777]" />
            <span>Bullet Point Rewriter</span>
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
            <label className="block text-xs font-semibold text-stone-900 dark:text-[#F5F4EF]">
              Original Experience Bullet
            </label>
            <textarea
              rows={3}
              value={bullet}
              onChange={(e) => setBullet(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#ded6c5] bg-[#faf7f2] p-3 text-xs text-stone-900 focus:outline-hidden dark:border-[#2A302D] dark:bg-[#191E1C] dark:text-[#F5F4EF] focus:border-[#2A8278]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-900 dark:text-[#F5F4EF]">
              Optional Metric or Outcome
            </label>
            <input
              type="text"
              value={userMetric}
              onChange={(e) => setUserMetric(e.target.value)}
              placeholder="e.g. reduced API response latency by 35%, supporting 50k users"
              className="mt-1.5 w-full rounded-lg border border-[#ded6c5] bg-[#faf7f2] py-2 px-3 text-xs text-stone-900 focus:outline-hidden dark:border-[#2A302D] dark:bg-[#191E1C] dark:text-[#F5F4EF] focus:border-[#2A8278]"
            />
            <p className="mt-1 text-[11px] text-stone-500 dark:text-[#A2AAA5]">
              Provide your real metric or outcome to integrate it into the rewritten bullet.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleImprove}
              disabled={loading || !bullet.trim()}
              className="flex items-center gap-2 rounded-lg bg-[#2A8278] hover:bg-[#236e66] px-4 py-2 text-xs font-semibold text-[#F5F4EF] shadow-xs disabled:opacity-60 transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F5F4EF]" />
                  <span>Improving bullet point...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-3.5 w-3.5 text-[#F5F4EF]" />
                  <span>Rewrite Bullet</span>
                </>
              )}
            </button>
          </div>

          {result && (
            <div className="mt-5 space-y-3 rounded-lg border border-[#ded6c5] bg-[#faf7f2] p-4 dark:border-[#2A302D] dark:bg-[#191E1C]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 dark:text-[#F5F4EF]">
                  Grounded Improved Bullet:
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
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs font-medium text-stone-900 dark:text-[#F5F4EF] leading-relaxed">
                • {result.improvedBullet}
              </p>

              {result.rationale && result.rationale.length > 0 && (
                <div className="pt-2 border-t border-[#ded6c5]/60 dark:border-[#2A302D]">
                  <span className="text-[11px] font-semibold text-stone-900 dark:text-[#D5B777]">
                    Why this is better:
                  </span>
                  <ul className="mt-1 space-y-0.5 text-[11px] text-stone-700 dark:text-[#A2AAA5]">
                    {result.rationale.map((r, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-[#2A8278] shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.missingMetricNote && (
                <p className="text-[11px] text-stone-600 dark:text-[#D5B777] italic">
                  💡 {result.missingMetricNote}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulletImproverModal;
