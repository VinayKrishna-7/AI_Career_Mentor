import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Route,
  Layers,
  MessageSquare,
  FileText,
  Mic,
  FolderGit2,
  BookOpen,
  User,
  Briefcase,
  Clock,
  Lock,
  Wand2,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Recommendations', path: '/recommendations', icon: Compass },
  { name: 'Career Roadmaps', path: '/roadmaps', icon: Route },
  { name: 'Skill Gap Analysis', path: '/skill-gap', icon: Layers },
  { name: 'AI Mentor Chat', path: '/chat', icon: MessageSquare },
  { name: 'Resume Suite', path: '/resume-analyzer', icon: FileText },
  { name: 'Application Tailor', path: '/application-tailor', icon: Wand2 },
  { name: 'Mock Interview', path: '/mock-interview', icon: Mic, isLocked: true },
  { name: 'Study Planner', path: '/planner', icon: Clock },
  { name: 'Job Tracker', path: '/applications', icon: Briefcase },
  { name: 'Projects', path: '/projects', icon: FolderGit2 },
  { name: 'Learning Resources', path: '/resources', icon: BookOpen },
  { name: 'Career Profile', path: '/profile', icon: User },
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-950/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B0F0E] border-r border-[#2A302D] flex flex-col transition-all duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-[#2A302D]">
          <img
            src="/emblem.svg"
            alt="AI Career Mentor Emblem"
            className="w-8 h-8 object-contain shrink-0"
          />
          <div className="overflow-hidden">
            <span className="font-bold text-[#F5F4EF] tracking-tight text-sm truncate block">
              AI Career Mentor
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#2A8278] text-[#F5F4EF] font-semibold border border-[#2A8278]'
                      : 'text-[#A2AAA5] hover:text-[#F5F4EF] hover:bg-[#222825]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.isLocked && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#222825] text-[#D5B777] border border-[#2A302D]">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Soon</span>
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
