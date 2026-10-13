import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Loader2, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
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
          Create your mentor account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#A2AAA5]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#D5B777] underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#191E1C] py-7 px-6 sm:px-8 border border-[#2A302D] rounded-xl shadow-md">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-[#222825] border border-[#2A302D] flex items-start gap-2.5 text-[#F5F4EF] text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#D5B777]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A2AAA5] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 rounded-lg border border-[#2A302D] text-xs bg-[#222825] text-[#F5F4EF] placeholder:text-[#A2AAA5]/60 focus:outline-none focus:border-[#2A8278] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A2AAA5] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-lg border border-[#2A302D] text-xs bg-[#222825] text-[#F5F4EF] placeholder:text-[#A2AAA5]/60 focus:outline-none focus:border-[#2A8278] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A2AAA5] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3 py-2 rounded-lg border border-[#2A302D] text-xs bg-[#222825] text-[#F5F4EF] placeholder:text-[#A2AAA5]/60 focus:outline-none focus:border-[#2A8278] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
