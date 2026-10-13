import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  Route,
  Layers,
  FileText,
  Mic,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  Lock,
  MessageSquare,
  Loader2,
  FolderGit2,
} from 'lucide-react';

const ProgressBar = ({ progress = 0 }) => (
  <div className="w-full bg-[#222825] h-1.5 rounded-full overflow-hidden border border-[#2A302D]">
    <div
      className="bg-[#2A8278] h-1.5 rounded-full transition-all duration-700"
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  </div>
);

export const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setData(res.data.dashboard);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#2A8278]" />
        <p className="text-xs text-[#A2AAA5]">Loading career metrics...</p>
      </div>
    );
  }

  const { activeRoadmap, nextPendingTask, skillGap } = data || {};
  const targetCareer = user?.profile?.targetCareer || 'Full-Stack Developer';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Human Executive Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A302D]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F4EF]">
            Career Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#A2AAA5] mt-0.5">
            Target Role:{' '}
            <span className="font-semibold text-[#F5F4EF] ml-1">
              {targetCareer}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/chat"
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] transition-colors flex items-center gap-2 shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#F5F4EF]" />
            <span>Ask Mentor</span>
          </Link>
          <Link
            to="/roadmaps"
            className="px-3.5 py-2 rounded-lg text-xs font-medium bg-[#191E1C] hover:bg-[#222825] border border-[#2A302D] text-[#F5F4EF] transition-colors flex items-center gap-2"
          >
            <Route className="w-3.5 h-3.5 text-[#D5B777]" />
            <span>Roadmap</span>
          </Link>
        </div>
      </div>

      {/* 2. Structured Architectural Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#2A302D] rounded-xl overflow-hidden border border-[#2A302D]">
        
        {/* Metric 1: Skill Alignment */}
        <div className="bg-[#191E1C] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#A2AAA5] block uppercase tracking-wider">
              Skill Alignment
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#F5F4EF]">
                {skillGap?.matchPercentage ?? 78}%
              </span>
              <span className="text-xs text-[#2A8278] font-medium">
                {skillGap ? `${skillGap.matchedSkills?.length || 0} skills matched` : 'Benchmark target'}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar progress={skillGap?.matchPercentage ?? 78} />
          </div>
        </div>

        {/* Metric 2: Roadmap Velocity */}
        <div className="bg-[#191E1C] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#A2AAA5] block uppercase tracking-wider">
              Roadmap Velocity
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#D5B777]">
                {activeRoadmap ? `${activeRoadmap.progressPercentage}%` : 'Not Started'}
              </span>
              <span className="text-xs text-[#A2AAA5]">
                {activeRoadmap ? `${activeRoadmap.completedTasks}/${activeRoadmap.totalTasks} tasks` : 'Ready to generate'}
              </span>
            </div>
          </div>
          <p className="text-xs text-[#A2AAA5] mt-3 truncate">
            {nextPendingTask ? `Next: ${nextPendingTask.title}` : 'Select a track to start learning'}
          </p>
        </div>

        {/* Metric 3: Resume Review */}
        <div className="bg-[#191E1C] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#A2AAA5] block uppercase tracking-wider">
              Resume Readiness
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#F5F4EF]">
                84<span className="text-xs font-normal text-[#A2AAA5]">/100</span>
              </span>
              <span className="text-xs text-[#2A8278] font-medium">
                ATS Optimized
              </span>
            </div>
          </div>
          <Link to="/resume-analyzer" className="text-xs text-[#D5B777] hover:underline mt-3 flex items-center gap-1 font-medium">
            <span>Review bullet rewrites</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

      </div>

      {/* 3. Deep Dive Grid: Roadmap Status & Skill Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card: Active Roadmap Progress */}
        <div className="bg-[#191E1C] border border-[#2A302D] rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2A302D]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#222825] border border-[#2A302D] text-[#D5B777] flex items-center justify-center">
                  <Route className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#F5F4EF]">Current Learning Track</h2>
                  <span className="text-xs text-[#A2AAA5]">{activeRoadmap?.careerTitle || targetCareer}</span>
                </div>
              </div>
              <Link
                to="/roadmaps"
                className="text-xs font-medium text-[#D5B777] hover:underline flex items-center gap-1"
              >
                <span>Full Track</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {activeRoadmap ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-[#222825] rounded-lg border border-[#2A302D]">
                    <span className="block text-base font-bold text-[#F5F4EF]">{activeRoadmap.totalTasks}</span>
                    <span className="text-[11px] text-[#A2AAA5]">Total Tasks</span>
                  </div>
                  <div className="p-3 bg-[#222825] rounded-lg border border-[#2A302D]">
                    <span className="block text-base font-bold text-[#2A8278]">{activeRoadmap.completedTasks}</span>
                    <span className="text-[11px] text-[#A2AAA5]">Completed</span>
                  </div>
                  <div className="p-3 bg-[#222825] rounded-lg border border-[#2A302D]">
                    <span className="block text-base font-bold text-[#D5B777]">{activeRoadmap.pendingTasks}</span>
                    <span className="text-[11px] text-[#A2AAA5]">Pending</span>
                  </div>
                </div>

                {nextPendingTask && (
                  <div className="p-3.5 rounded-lg bg-[#222825] border border-[#2A302D]">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D5B777] mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Next Milestone: {nextPendingTask.phase_name}</span>
                    </div>
                    <p className="text-xs text-[#F5F4EF] font-medium">{nextPendingTask.title}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <p className="text-xs text-[#A2AAA5]">No active roadmap selected for this profile.</p>
                <Link
                  to="/roadmaps"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] rounded-lg text-xs font-semibold transition-colors"
                >
                  <Route className="w-3.5 h-3.5 text-[#F5F4EF]" />
                  <span>Generate Roadmap</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Card: Skill Readiness Evaluation */}
        <div className="bg-[#191E1C] border border-[#2A302D] rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2A302D]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#222825] border border-[#2A302D] text-[#2A8278] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#F5F4EF]">Skill Competencies</h2>
                  <span className="text-xs text-[#A2AAA5]">Role benchmark validation</span>
                </div>
              </div>
              <Link
                to="/skill-gap"
                className="text-xs font-medium text-[#D5B777] hover:underline flex items-center gap-1"
              >
                <span>Evaluate Roles</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {skillGap ? (
              <div className="space-y-3">
                <div className="divide-y divide-[#2A302D]">
                  {skillGap.missingSkills?.slice(0, 4).map((skill) => (
                    <div key={skill} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D5B777]"></span>
                        <span className="text-[#F5F4EF] font-medium">{skill}</span>
                      </div>
                      <span className="text-[#D5B777] text-[11px] font-medium">Priority Gap</span>
                    </div>
                  ))}
                  {skillGap.missingSkills?.length === 0 && (
                    <div className="py-4 text-center text-xs text-[#2A8278] font-medium flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>All core competencies verified!</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <p className="text-xs text-[#A2AAA5]">Run an analysis to benchmark required skills for your target role.</p>
                <Link
                  to="/skill-gap"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] rounded-lg text-xs font-semibold transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-[#F5F4EF]" />
                  <span>Start Skill Gap Analysis</span>
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. Core Accelerators (Minimal Human-Designed 4-Column Grid) */}
      <div>
        <h2 className="text-sm font-bold text-[#F5F4EF] mb-3 uppercase tracking-wider text-[#A2AAA5]">
          Career Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            {
              title: 'Resume Review',
              desc: 'ATS score, keyword density, and bullet rewrites.',
              icon: FileText,
              link: '/resume-analyzer',
            },
            {
              title: 'Projects',
              desc: 'Hands-on architectural portfolio projects.',
              icon: FolderGit2,
              link: '/projects',
            },
            {
              title: 'Verified Resources',
              desc: 'Curated technical links and official documentation.',
              icon: BookOpen,
              link: '/resources',
            },
            {
              title: 'Interview Simulator',
              desc: 'Voice and technical evaluation scenarios.',
              icon: Mic,
              link: '/mock-interview',
              isLocked: true,
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <Link
                key={i}
                to={card.link}
                className="group p-4 bg-[#191E1C] hover:bg-[#222825] rounded-xl border border-[#2A302D] hover:border-[#3A423E] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#222825] border border-[#2A302D] text-[#D5B777] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    {card.isLocked && (
                      <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-[#222825] text-[#A2AAA5] border border-[#2A302D]">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Soon</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-[#F5F4EF]">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-[#A2AAA5] mt-1 leading-normal line-clamp-2">
                    {card.desc}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-[#2A302D] flex items-center justify-between text-[11px] font-medium text-[#A2AAA5] group-hover:text-[#F5F4EF] transition-colors">
                  <span>{card.isLocked ? 'Notice' : 'Open'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
