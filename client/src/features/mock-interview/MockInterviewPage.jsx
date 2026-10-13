import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import {
  Lock,
  Mic,
  Clock,
  ArrowRight,
  MessageSquare,
  Route,
  FileText,
  Bell,
  CheckCircle2,
  Code2,
  Cpu,
  Award,
  Layers,
} from 'lucide-react';

export const MockInterviewPage = () => {
  const toast = useToast();
  const [isNotified, setIsNotified] = useState(false);

  const handleNotifyMe = () => {
    setIsNotified(true);
    toast.success("Priority unlocked: You're on the early access notification list.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb & Lock Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#222825] border border-[#2A302D] text-[#F5F4EF] text-xs font-medium">
          <Lock className="w-3.5 h-3.5 text-[#D5B777]" />
          <span>Feature In Development • Phase 2 Release</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#A2AAA5]">
          <Clock className="w-3.5 h-3.5 text-[#2A8278]" />
          <span>Engineering Roadmap</span>
        </div>
      </div>

      {/* Main Notice Hero Card */}
      <div className="relative overflow-hidden rounded-xl bg-[#101312] border border-[#2A302D] p-8 sm:p-10 text-center shadow-xs">
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          {/* Lock & Mic Icon Badge */}
          <div className="mx-auto w-16 h-16 rounded-xl bg-[#222825] border border-[#2A302D] flex items-center justify-center relative shadow-xs">
            <Mic className="w-8 h-8 text-[#D5B777]" />
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-[#2A8278] text-[#F5F4EF] flex items-center justify-center shadow-md">
              <Lock className="w-3.5 h-3.5 text-[#F5F4EF]" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F4EF] tracking-tight">
              Mock Interview Simulator In Development
            </h1>
            <p className="text-sm sm:text-base text-[#A2AAA5] mt-3 leading-relaxed">
              We are actively engineering an interactive, real-time interview simulator.
              This module provides rubric-aligned STAR evaluations, voice pacing analysis, and live coding whiteboards.
            </p>
          </div>

          {/* Early Access / Notify Me Button */}
          <div className="pt-2">
            {!isNotified ? (
              <button
                onClick={handleNotifyMe}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] font-semibold text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
              >
                <Bell className="w-4 h-4 text-[#F5F4EF]" />
                <span>Notify Me When This Feature Unlocks</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#222825] border border-[#2A8278] text-[#F5F4EF] text-xs font-semibold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-[#2A8278] shrink-0" />
                <span>You're registered on the priority release queue. We'll alert you the moment it deploys.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Preview: What's Coming */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#D5B777]" />
          <h2 className="text-sm font-bold text-[#F5F4EF] uppercase tracking-wider">
            Upcoming Modules Under Development
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: Mic,
              title: 'Real-Time Voice Interviewer',
              desc: 'Engage in natural voice conversations with an automated hiring manager. Evaluates pacing, clarity, and communication tone.',
            },
            {
              icon: Code2,
              title: 'Interactive Live Coding Sandbox',
              desc: 'Solve algorithmic DSA questions and write system architectures directly in an integrated whiteboard with automated test cases.',
            },
            {
              icon: Award,
              title: 'STAR Method Behavioral Scoring',
              desc: 'Receive immediate rubric evaluations for behavioral responses (Situation, Task, Action, Result) with sample answer comparisons.',
            },
            {
              icon: Cpu,
              title: 'Role-Specific Simulators',
              desc: 'Practice customized rounds tailored specifically to SDE, Full-Stack, Data Science, and DevOps roles with varying difficulty levels.',
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[#191E1C] border border-[#2A302D] shadow-xs flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-[#222825] text-[#D5B777] border border-[#2A302D] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#D5B777]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#F5F4EF]">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-[#A2AAA5] mt-1 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alternative Actions: What Users Can Use Right Now */}
      <div className="bg-[#101312] rounded-xl border border-[#2A302D] p-6 sm:p-8 space-y-4">
        <div>
          <span className="text-[11px] font-bold text-[#2A8278] uppercase tracking-wider">
            Available Right Now
          </span>
          <h2 className="text-base sm:text-lg font-bold text-[#F5F4EF] mt-1">
            Prepare for Interviews Today with Active Tools
          </h2>
          <p className="text-xs sm:text-sm text-[#A2AAA5] mt-1">
            While the dedicated voice simulator is in development, you can practice interview questions and review preparation roadmaps right now:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Card 1: AI Chat */}
          <Link
            to="/chat"
            className="p-4 rounded-xl bg-[#191E1C] border border-[#2A302D] hover:border-[#2A8278] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#222825] text-[#D5B777] border border-[#2A302D] flex items-center justify-center mb-2">
                <MessageSquare className="w-4 h-4 text-[#D5B777]" />
              </div>
              <h3 className="text-xs font-bold text-[#F5F4EF] transition-colors">
                Practice in Career Chat
              </h3>
              <p className="text-[11px] text-[#A2AAA5] mt-1 leading-relaxed">
                Ask the Mentor to conduct a mock interview or quiz you on DSA and CS fundamentals right now.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#2A8278] mt-3">
              <span>Start in Chat</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Roadmaps */}
          <Link
            to="/roadmaps"
            className="p-4 rounded-xl bg-[#191E1C] border border-[#2A302D] hover:border-[#2A8278] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#222825] text-[#2A8278] border border-[#2A302D] flex items-center justify-center mb-2">
                <Route className="w-4 h-4 text-[#2A8278]" />
              </div>
              <h3 className="text-xs font-bold text-[#F5F4EF] transition-colors">
                Career Roadmaps
              </h3>
              <p className="text-[11px] text-[#A2AAA5] mt-1 leading-relaxed">
                Follow your structured phase-by-phase learning timeline and tick off preparation milestones.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#2A8278] mt-3">
              <span>View Roadmaps</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Resume Analyzer */}
          <Link
            to="/resume-analyzer"
            className="p-4 rounded-xl bg-[#191E1C] border border-[#2A302D] hover:border-[#2A8278] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#222825] text-[#D5B777] border border-[#2A302D] flex items-center justify-center mb-2">
                <FileText className="w-4 h-4 text-[#D5B777]" />
              </div>
              <h3 className="text-xs font-bold text-[#F5F4EF] transition-colors">
                Resume Suite
              </h3>
              <p className="text-[11px] text-[#A2AAA5] mt-1 leading-relaxed">
                Evaluate your resume against job descriptions with ATS keyword optimizations.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#2A8278] mt-3">
              <span>Analyze Resume</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewPage;
