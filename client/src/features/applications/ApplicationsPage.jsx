import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Briefcase,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  Loader2,
  CheckCircle2,
  Clock,
  Building,
  ArrowRight,
  Filter,
} from 'lucide-react';

const STAGES = ['Applied', 'Screening', 'Interviewing', 'Offer', 'Rejected'];

const STAGE_COLORS = {
  Applied: 'bg-[#f5efe4] text-stone-900 border-[#ded6c5]',
  Screening: 'bg-[#f5efe4] text-stone-900 border-[#ded6c5]',
  Interviewing: 'bg-[#f5efe4] text-stone-900 border-[#ded6c5]',
  Offer: 'bg-[#f5efe4] text-stone-900 border-[#ded6c5]',
  Rejected: 'bg-[#f5efe4] text-stone-700 border-[#ded6c5]',
};

export const ApplicationsPage = () => {
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: 'Remote',
    status: 'Applied',
    salary: '',
    notes: '',
  });

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/applications', formData);
      if (res.data.success) {
        setApplications((prev) => [res.data.application, ...prev]);
        setModalOpen(false);
        const comp = formData.company;
        const pos = formData.position;
        setFormData({
          company: '',
          position: '',
          location: 'Remote',
          status: 'Applied',
          salary: '',
          notes: '',
        });
        toast.success(`Tracked application for ${pos} at ${comp}!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save application');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.patch(`/applications/${id}`, { status: newStatus });
      if (res.data.success) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? res.data.application : app))
        );
        toast.success(`Application stage moved to "${newStatus}".`);
      }
    } catch (err) {
      toast.error('Failed to update stage');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job application?')) return;
    try {
      await api.delete(`/applications/${id}`);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      toast.info('Job application removed.');
    } catch (err) {
      toast.error('Failed to delete application');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stone-900 dark:text-[#faf7f2]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-[#faf7f2] tracking-tight">Job Application Tracker</h1>
          <p className="text-stone-500 dark:text-zinc-400 text-sm mt-1">
            Track your job hunt progress across all hiring stages from applied to offer.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#F5F4EF]" />
          <span>Track New Job</span>
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STAGES.map((stage) => {
          const stageApps = applications.filter((a) => a.status === stage);
          return (
            <div
              key={stage}
              className="bg-[#f5efe4]/70 dark:bg-[#101312] rounded-xl p-4 flex flex-col min-h-[500px] border border-[#ded6c5] dark:border-[#2A302D]"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-stone-900 dark:text-[#F5F4EF] uppercase tracking-wider">
                  {stage}
                </span>
                <span className="w-5 h-5 rounded-full bg-white dark:bg-[#222825] text-stone-700 dark:text-[#F5F4EF] text-xs font-bold flex items-center justify-center border border-[#ded6c5] dark:border-[#2A302D] shadow-2xs">
                  {stageApps.length}
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto">
                {stageApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-white dark:bg-[#191E1C] rounded-lg border border-[#ded6c5] dark:border-[#2A302D] shadow-2xs hover:border-[#2A8278] dark:hover:border-[#2A8278] transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-[#faf7f2] leading-tight">
                        {app.position}
                      </span>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-stone-900 dark:text-zinc-500 dark:hover:text-[#faf7f2] transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-stone-800 dark:text-stone-300 font-semibold">
                      <Building className="w-3.5 h-3.5" />
                      <span>{app.company}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-zinc-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{app.location}</span>
                      </span>
                      {app.salary && <span>{app.salary}</span>}
                    </div>

                    {app.notes && (
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 italic bg-[#faf7f2] dark:bg-[#161619] p-2 rounded-lg line-clamp-2 border border-[#ded6c5]/50 dark:border-[#2a2a30]">
                        "{app.notes}"
                      </p>
                    )}

                    {/* Move Stage Selector */}
                    <div className="pt-2 border-t border-[#ded6c5]/60 dark:border-[#2a2a30] flex items-center justify-between">
                      <span className="text-[10px] text-stone-500 dark:text-zinc-400 uppercase font-semibold">Move:</span>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="text-[11px] font-semibold text-stone-800 dark:text-[#faf7f2] bg-[#faf7f2] dark:bg-[#161619] rounded px-1.5 py-0.5 border border-[#ded6c5] dark:border-[#2a2a30] focus:outline-none"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s} className="bg-white dark:bg-[#161619] text-stone-900 dark:text-[#faf7f2]">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {stageApps.length === 0 && (
                  <div className="h-24 flex items-center justify-center text-[11px] text-stone-400 dark:text-zinc-500 border border-dashed border-[#ded6c5] dark:border-[#2a2a30] rounded-xl bg-[#faf7f2]/30 dark:bg-[#161619]/20">
                    No applications
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for New Job */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101312] rounded-xl border border-[#ded6c5] dark:border-[#2A302D] max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-stone-900 dark:text-[#F5F4EF]">Track New Job Application</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-900 dark:text-[#F5F4EF] mb-1">Company *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp, Stripe, Early-stage Startup"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#ded6c5] dark:border-[#2A302D] text-sm focus:outline-none bg-[#faf7f2] dark:bg-[#191E1C] text-stone-900 dark:text-[#F5F4EF] placeholder:text-stone-400 dark:placeholder:text-[#A2AAA5]/50 focus:border-[#2A8278]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-900 dark:text-[#faf7f2] mb-1">Position *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineer"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#ded6c5] dark:border-[#2a2a30] text-sm focus:outline-none focus:ring-1 focus:ring-stone-400 bg-[#faf7f2] dark:bg-[#1a1a1e] text-stone-900 dark:text-[#faf7f2] placeholder:text-stone-400 dark:placeholder:text-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-900 dark:text-[#faf7f2] mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#ded6c5] dark:border-[#2a2a30] text-sm bg-[#faf7f2] dark:bg-[#1a1a1e] text-stone-900 dark:text-[#faf7f2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-900 dark:text-[#faf7f2] mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#ded6c5] dark:border-[#2a2a30] text-sm bg-[#faf7f2] dark:bg-[#1a1a1e] text-stone-900 dark:text-[#faf7f2]"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-900 dark:text-[#faf7f2] mb-1">Salary / Compensation (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. $85,000 / yr"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#ded6c5] dark:border-[#2a2a30] text-sm bg-[#faf7f2] dark:bg-[#1a1a1e] text-stone-900 dark:text-[#faf7f2] placeholder:text-stone-400 dark:placeholder:text-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-900 dark:text-[#faf7f2] mb-1">Notes / Follow-up info</label>
                <textarea
                  rows={2}
                  placeholder="Referral contact, key job requirements, next follow-up date..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#ded6c5] dark:border-[#2a2a30] text-sm bg-[#faf7f2] dark:bg-[#1a1a1e] text-stone-900 dark:text-[#faf7f2] placeholder:text-stone-400 dark:placeholder:text-zinc-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-[#faf7f2] dark:hover:bg-[#1a1a1e] text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin text-[#F5F4EF]" />}
                  <span>Save Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
