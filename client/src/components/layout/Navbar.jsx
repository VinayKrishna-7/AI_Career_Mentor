import React, { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, User, Sun, Moon, Settings, Route, ChevronDown, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTimer } from '../../context/TimerContext';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const { activeSession, timeLeftSeconds, timerRunning } = useTimer();

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="h-16 bg-[#0B0F0E] border-b border-[#2A302D] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-[#A2AAA5] hover:text-[#F5F4EF] hover:bg-[#222825] md:hidden transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2.5 md:hidden">
          <img
            src="/emblem.svg"
            alt="AI Career Mentor"
            className="w-7 h-7 object-contain"
          />
          <span className="font-bold text-sm text-[#F5F4EF]">
            AI Career Mentor
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Active Focus Timer Status Indicator */}
        {activeSession && (
          <Link
            to="/planner"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2A302D] bg-[#222825] text-[#F5F4EF] text-xs font-medium hover:border-[#2A8278] transition-colors"
            title={`Focus Session: ${activeSession.name} (${formatTimer(timeLeftSeconds)}) - Click to open Study Planner`}
          >
            <span className="relative flex h-2 w-2">
              {timerRunning && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D5B777] opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  timerRunning ? 'bg-[#2A8278]' : 'bg-[#A2AAA5]'
                }`}
              ></span>
            </span>
            <span className="font-mono">{formatTimer(timeLeftSeconds)}</span>
            <span className="hidden sm:inline text-[#A2AAA5]">•</span>
            <span className="hidden sm:inline truncate max-w-[130px]">{activeSession.name}</span>
          </Link>
        )}

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[#A2AAA5] hover:text-[#F5F4EF] hover:bg-[#222825] transition-colors border border-[#2A302D] flex items-center justify-center cursor-pointer"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-[#D5B777] animate-in fade-in" />
          ) : (
            <Moon className="w-4 h-4 text-[#D5B777] animate-in fade-in" />
          )}
        </button>

        {/* Profile Avatar Logo Only with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label="User Profile and Settings menu"
            className="w-9 h-9 rounded-full bg-[#2A8278] text-[#F5F4EF] font-bold text-sm flex items-center justify-center border border-[#2A8278] shadow-xs hover:scale-105 transition-all focus:outline-none select-none cursor-pointer"
            title={user?.name ? `${user.name} - Profile & Settings` : 'Profile & Settings'}
          >
            {user?.name ? userInitial : <User className="w-4 h-4" />}
          </button>

          {/* Floating Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-[#191E1C] border border-[#2A302D] shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* User Header */}
              <div className="px-4 py-3 border-b border-[#2A302D]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#2A8278] text-[#F5F4EF] font-bold text-sm flex items-center justify-center shrink-0">
                    {userInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#F5F4EF] truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-[#A2AAA5] truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>

                {user?.profile?.targetCareer && (
                  <div className="mt-2.5 pt-2 border-t border-[#2A302D] flex items-center gap-1.5 text-[11px] font-medium text-[#D5B777]">
                    <Compass className="w-3 h-3 shrink-0" />
                    <span className="truncate">{user.profile.targetCareer}</span>
                  </div>
                )}
              </div>

              {/* Menu Actions */}
              <div className="p-1.5 space-y-0.5">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#A2AAA5] hover:bg-[#222825] hover:text-[#F5F4EF] transition-colors"
                >
                  <User className="w-4 h-4 text-[#D5B777]" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#A2AAA5] hover:bg-[#222825] hover:text-[#F5F4EF] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#D5B777]" />
                  <span>Settings</span>
                </Link>

                <Link
                  to="/roadmaps"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#A2AAA5] hover:bg-[#222825] hover:text-[#F5F4EF] transition-colors"
                >
                  <Route className="w-4 h-4 text-[#D5B777]" />
                  <span>My Roadmaps</span>
                </Link>
              </div>

              {/* Divider */}
              <div className="border-t border-[#2A302D] my-1" />

              {/* Sign Out Option */}
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#A2AAA5] hover:bg-[#222825] hover:text-[#F5F4EF] transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
