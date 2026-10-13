import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Route,
  Layers,
  FileText,
  Mic,
  FolderGit2,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const LandingPage = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#101312] text-[#F5F4EF] transition-colors duration-200">
      {/* Top Navigation */}
      <header className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between border-b border-[#2A302D]">
        <div className="flex items-center gap-3">
          <img
            src="/emblem.svg"
            alt="AI Career Mentor Emblem"
            className="w-8 h-8 object-contain"
          />
          <span className="font-bold text-base tracking-tight text-[#F5F4EF]">AI Career Mentor</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[#A2AAA5] hover:text-[#F5F4EF] hover:bg-[#222825] transition-colors border border-[#2A302D]"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#D5B777]" />
            ) : (
              <Moon className="w-4 h-4 text-[#D5B777]" />
            )}
          </button>

          {user ? (
            <Link
              to="/dashboard"
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] rounded-lg transition-colors shadow-xs"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-semibold text-[#A2AAA5] hover:text-[#F5F4EF] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] rounded-lg transition-colors shadow-xs"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F5F4EF] mb-5 leading-tight">
          Deliberate career progression, engineered with precision.
        </h1>

        <p className="text-base sm:text-lg text-[#A2AAA5] max-w-2xl mx-auto mb-9 leading-relaxed font-normal">
          Benchmark competencies against real industry roles, uncover deterministic skill gaps, build structured learning roadmaps, and review your resume.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold bg-[#191E1C] hover:bg-[#222825] text-[#F5F4EF] text-xs sm:text-sm border border-[#2A302D] transition-colors shadow-xs"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Core Capabilities Grid (Human Architectural Cards) */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-[#2A302D]">
        <div className="mb-10">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#F5F4EF]">
            Core Modules
          </h2>
          <p className="text-[#A2AAA5] text-xs mt-1">
            Practical instruments for technical career planning and execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Compass,
              title: 'Role Benchmarking',
              desc: 'Personalized matching against vetted tech roles based on your verified skills, experience, and interests.',
            },
            {
              icon: Route,
              title: 'Structured Roadmaps',
              desc: 'Phased, sequential learning paths with hour estimates, milestones, and progress tracking.',
            },
            {
              icon: Layers,
              title: 'Skill Gap Evaluation',
              desc: 'Taxonomy-driven skill comparison highlighting acquired competencies and priority learning gaps.',
            },
            {
              icon: FileText,
              title: 'Resume Review',
              desc: 'ATS score evaluation, keyword density analysis, and bullet point rewrites following the Google XYZ formula.',
            },
            {
              icon: FolderGit2,
              title: 'Projects Portfolio',
              desc: 'Production-grade project blueprints with architectural designs and milestone checklists.',
            },
            {
              icon: Mic,
              title: 'Interview Simulator',
              desc: 'Targeted behavioral and technical interview scenarios designed for rigorous practice.',
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-xl bg-[#191E1C] border border-[#2A302D] hover:border-[#3A423E] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#222825] border border-[#2A302D] flex items-center justify-center text-[#D5B777] mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#F5F4EF] mb-1.5">{f.title}</h3>
                <p className="text-[#A2AAA5] text-xs leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A302D] py-8 text-center text-xs text-[#A2AAA5]">
        <p>© 2026 AI Career Mentor. Professional Career Engineering.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
