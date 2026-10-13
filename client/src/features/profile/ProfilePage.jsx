import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  User,
  GraduationCap,
  Briefcase,
  Target,
  Clock,
  Compass,
  Save,
  Check,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react';

const COMMON_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Express',
  'PostgreSQL',
  'SQL',
  'Python',
  'HTML',
  'CSS',
  'Tailwind CSS',
  'Git',
  'Docker',
  'REST APIs',
  'MongoDB',
  'AWS',
];

const CAREER_SUGGESTIONS = [
  'Full-Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'AI / Machine Learning Engineer',
  'Data Analyst',
  'Data Scientist',
  'DevOps / Cloud Engineer',
  'UI/UX Designer',
  'Mobile Developer',
  'Cybersecurity Specialist',
];

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    education: '',
    degree: '',
    skills: [],
    interests: [],
    experience_level: 'Beginner',
    target_career: 'Full-Stack Developer',
    career_goals: '',
    learning_preferences: 'Hands-on projects',
    weekly_study_hours: 10,
  });

  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        education: user.profile.education || '',
        degree: user.profile.degree || '',
        skills: user.profile.skills || [],
        interests: user.profile.interests || [],
        experience_level: user.profile.experienceLevel || 'Beginner',
        target_career: user.profile.targetCareer || 'Full-Stack Developer',
        career_goals: user.profile.careerGoals || '',
        learning_preferences: user.profile.learningPreferences || 'Hands-on projects',
        weekly_study_hours: user.profile.weeklyStudyHours || 10,
      });
    }
  }, [user]);

  const handleAddSkill = (skillToAdd) => {
    const s = (skillToAdd || skillInput).trim();
    if (s && !formData.skills.includes(s)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, s] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleAddInterest = () => {
    const i = interestInput.trim();
    if (i && !formData.interests.includes(i)) {
      setFormData((prev) => ({ ...prev, interests: [...prev.interests, i] }));
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interestToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        education: formData.education,
        degree: formData.degree,
        skills: formData.skills,
        interests: formData.interests,
        experience_level: formData.experience_level,
        target_career: formData.target_career,
        career_goals: formData.career_goals,
        learning_preferences: formData.learning_preferences,
        weekly_study_hours: formData.weekly_study_hours,
      });

      toast.success('Profile updated successfully! AI features will now personalize to your goals.');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-[#faf7f2] tracking-tight">Your Career Profile</h1>
        <p className="text-stone-500 dark:text-zinc-400 text-sm mt-1">
          Keep your skills, target goals, and study commitments up to date for precise personalization.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Info Readonly Card */}
        <div className="bg-white dark:bg-[#101312] p-6 rounded-xl border border-[#ded6c5] dark:border-[#2A302D] shadow-xs">
          <h2 className="text-base font-semibold text-stone-900 dark:text-[#F5F4EF] mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-[#2A8278]" />
            <span>Account Details</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-[#A2AAA5] mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#ded6c5] dark:border-[#2A302D] bg-[#faf7f2]/50 dark:bg-[#191E1C] text-stone-600 dark:text-[#A2AAA5] text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-[#A2AAA5] mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#ded6c5] dark:border-[#2A302D] bg-[#faf7f2]/50 dark:bg-[#191E1C] text-stone-600 dark:text-[#A2AAA5] text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Education & Experience */}
        <div className="bg-white dark:bg-[#101312] p-6 rounded-xl border border-[#ded6c5] dark:border-[#2A302D] shadow-xs space-y-4">
          <h2 className="text-base font-semibold text-stone-900 dark:text-[#F5F4EF] flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#2A8278]" />
            <span>Education & Experience</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-900 dark:text-[#F5F4EF] mb-1">Education</label>
              <input
                type="text"
                placeholder="e.g. Stanford / Self-taught"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#ded6c5] dark:border-[#2A302D] text-sm focus:outline-none bg-[#faf7f2] dark:bg-[#191E1C] text-stone-900 dark:text-[#F5F4EF] placeholder:text-stone-400 dark:placeholder:text-[#A2AAA5]/50 focus:border-[#2A8278]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-900 dark:text-[#F5F4EF] mb-1">Degree / Major</label>
              <input
                type="text"
                placeholder="e.g. B.S. Computer Science"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#ded6c5] dark:border-[#2A302D] text-sm focus:outline-none bg-[#faf7f2] dark:bg-[#191E1C] text-stone-900 dark:text-[#F5F4EF] placeholder:text-stone-400 dark:placeholder:text-[#A2AAA5]/50 focus:border-[#2A8278]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-900 dark:text-[#F5F4EF] mb-1">Experience Level</label>
              <select
                value={formData.experience_level}
                onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#ded6c5] dark:border-[#2A302D] text-sm focus:outline-none bg-[#faf7f2] dark:bg-[#191E1C] text-stone-900 dark:text-[#F5F4EF] focus:border-[#2A8278]"
              >
                <option value="Student">Student</option>
                <option value="Beginner">Beginner (0-1 yrs)</option>
                <option value="Intermediate">Intermediate (1-3 yrs)</option>
                <option value="Advanced">Advanced (3+ yrs)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Career Target & Goals */}
        <div className="bg-white dark:bg-[#101312] p-6 rounded-xl border border-[#ded6c5] dark:border-[#2A302D] shadow-xs space-y-4">
          <h2 className="text-base font-semibold text-stone-900 dark:text-[#F5F4EF] flex items-center gap-2">
            <Target className="w-4 h-4 text-[#2A8278]" />
            <span>Target Career & Study Commitment</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-stone-900 dark:text-[#F5F4EF] mb-1">
                Target Career Role (Your Choice)
              </label>
              <input
                type="text"
                placeholder="e.g. Full-Stack Developer, AI Engineer, MLOps..."
                value={formData.target_career}
                onChange={(e) => setFormData({ ...formData, target_career: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#ded6c5] dark:border-[#2A302D] text-sm focus:outline-none bg-[#faf7f2] dark:bg-[#191E1C] text-stone-900 dark:text-[#F5F4EF] placeholder:text-stone-400 dark:placeholder:text-[#A2AAA5]/50 focus:border-[#2A8278] mb-2"
              />
              <div className="flex flex-wrap gap-1">
                {CAREER_SUGGESTIONS.slice(0, 5).map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setFormData({ ...formData, target_career: c })}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      formData.target_career === c
                        ? 'bg-[#2A8278] text-[#F5F4EF] font-semibold shadow-xs'
                        : 'bg-[#f5efe4] dark:bg-[#222825] text-stone-700 dark:text-[#A2AAA5] border border-[#ded6c5] dark:border-[#2A302D] hover:bg-[#ded6c5]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 dark:text-[#F5F4EF] mb-1">Weekly Study Hours</label>
              <input
                type="number"
                min={1}
                max={60}
                value={formData.weekly_study_hours}
                onChange={(e) => setFormData({ ...formData, weekly_study_hours: parseInt(e.target.value, 10) || 5 })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#ded6c5] dark:border-[#2A302D] text-sm focus:outline-none bg-[#faf7f2] dark:bg-[#191E1C] text-stone-900 dark:text-[#F5F4EF] focus:border-[#2A8278]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 dark:text-[#F5F4EF] mb-1">Learning Preference</label>
              <select
                value={formData.learning_preferences}
                onChange={(e) => setFormData({ ...formData, learning_preferences: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#ded6c5] dark:border-[#2A302D] text-sm focus:outline-none bg-[#faf7f2] dark:bg-[#191E1C] text-stone-900 dark:text-[#F5F4EF] focus:border-[#2A8278]"
              >
                <option value="Hands-on projects">Hands-on projects</option>
                <option value="Video tutorials & walkthroughs">Video tutorials & walkthroughs</option>
                <option value="Official documentation & books">Official documentation & books</option>
                <option value="Structured challenges">Structured challenges</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-900 dark:text-[#F5F4EF] mb-1">Career Goals & Aspirations</label>
            <textarea
              rows={3}
              placeholder="e.g. Looking to transition from customer support into backend engineering within 6 months..."
              value={formData.career_goals}
              onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#ded6c5] dark:border-[#2A302D] text-sm focus:outline-none bg-[#faf7f2] dark:bg-[#191E1C] text-stone-900 dark:text-[#F5F4EF] placeholder:text-stone-400 dark:placeholder:text-[#A2AAA5]/50 focus:border-[#2A8278]"
            />
          </div>
        </div>

        {/* Current Skills Selector */}
        <div className="bg-white dark:bg-[#101312] p-6 rounded-xl border border-[#ded6c5] dark:border-[#2A302D] shadow-xs space-y-4">
          <h2 className="text-base font-semibold text-stone-900 dark:text-[#F5F4EF] flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#2A8278]" />
            <span>Current Skills ({formData.skills.length})</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-[#A2AAA5]">
            Select or enter the tools and technologies you currently know.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a skill (e.g. Docker, Python, Rust)..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#ded6c5] dark:border-[#2A302D] text-sm focus:outline-none bg-[#faf7f2] dark:bg-[#191E1C] text-stone-900 dark:text-[#F5F4EF] placeholder:text-stone-400 dark:placeholder:text-[#A2AAA5]/50 focus:border-[#2A8278]"
            />
            <button
              type="button"
              onClick={() => handleAddSkill()}
              className="px-5 py-2.5 bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#F5F4EF]" />
              <span>Add</span>
            </button>
          </div>

          {/* Active Skill Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {formData.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f5efe4] dark:bg-[#222825] text-stone-900 dark:text-[#F5F4EF] border border-[#ded6c5] dark:border-[#2A302D] rounded-md text-xs font-medium"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-stone-500 dark:hover:text-[#D5B777] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Quick Add Suggestions */}
          <div className="pt-2">
            <span className="text-xs font-medium text-stone-500 dark:text-[#A2AAA5] block mb-2">Suggested skills to add:</span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SKILLS.filter((s) => !formData.skills.includes(s)).slice(0, 10).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => handleAddSkill(s)}
                  className="text-xs px-2.5 py-1 rounded-md bg-[#f5efe4] dark:bg-[#222825] text-stone-800 dark:text-[#F5F4EF] border border-[#ded6c5] dark:border-[#2A302D] hover:bg-[#ded6c5] transition-colors cursor-pointer"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="bg-white dark:bg-[#101312] p-6 rounded-xl border border-[#ded6c5] dark:border-[#2A302D] shadow-xs space-y-4">
          <h2 className="text-base font-semibold text-stone-900 dark:text-[#F5F4EF] flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#D5B777]" />
            <span>Interests & Domains ({formData.interests.length})</span>
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. AI, Cloud, Cybersecurity, FinTech..."
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddInterest();
                }
              }}
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#ded6c5] dark:border-[#2A302D] text-sm focus:outline-none bg-[#faf7f2] dark:bg-[#191E1C] text-stone-900 dark:text-[#F5F4EF] placeholder:text-stone-400 dark:placeholder:text-[#A2AAA5]/50 focus:border-[#2A8278]"
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="px-5 py-2.5 bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#F5F4EF]" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f5efe4] dark:bg-[#222825] text-stone-900 dark:text-[#F5F4EF] border border-[#ded6c5] dark:border-[#2A302D] rounded-md text-xs font-medium"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  className="hover:text-stone-500 dark:hover:text-[#D5B777] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
          >
            <Save className="w-4 h-4 text-[#F5F4EF]" />
            <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
