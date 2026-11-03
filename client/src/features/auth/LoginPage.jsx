import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Loader2, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('career_mentor_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanEmail = email.trim();
      if (rememberMe) {
        localStorage.setItem('career_mentor_remembered_email', cleanEmail);
      } else {
        localStorage.removeItem('career_mentor_remembered_email');
      }
      await login(cleanEmail, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101312] relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="absolute top-6 right-6">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[#A2AAA5] hover:text-[#F5F4EF] hover:bg-[#222825] transition-colors border border-[#2A302D] shadow-xs cursor-pointer"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-[#D5B777]" /> : <Moon className="w-4 h-4 text-[#D5B777]" />}
        </button>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img
          src="/emblem.svg"
          alt="AI Career Mentor Logo"
          className="w-12 h-12 mx-auto object-contain mb-4"
        />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F4EF] tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#A2AAA5]">
          Or{' '}
          <Link to="/register" className="font-semibold text-[#D5B777] underline underline-offset-2">
            create a new account for free
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#191E1C] py-7 px-6 sm:px-8 border border-[#2A302D] rounded-xl shadow-md">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-[#222825] border border-[#2A302D] flex items-start gap-2.5 text-[#F5F4EF] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D5B777]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[11px] font-semibold uppercase tracking-wider text-[#A2AAA5] mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-lg border border-[#2A302D] text-xs bg-[#222825] text-[#F5F4EF] placeholder:text-[#A2AAA5]/60 focus:outline-none focus:border-[#2A8278] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-semibold uppercase tracking-wider text-[#A2AAA5] mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border border-[#2A302D] text-xs bg-[#222825] text-[#F5F4EF] placeholder:text-[#A2AAA5]/60 focus:outline-none focus:border-[#2A8278] transition-colors"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-[#A2AAA5] hover:text-[#F5F4EF] select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[#2A302D] bg-[#222825] text-[#2A8278] focus:ring-0 cursor-pointer accent-[#2A8278]"
                />
                <span>Remember my email</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
