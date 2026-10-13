import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  ExternalLink,
  Search,
  Loader2,
  X,
  Plus,
} from 'lucide-react';

export const ResourcesPage = () => {
  const toast = useToast();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Minimal filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  // Simple on-demand skill curation
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [generatingCustom, setGeneratingCustom] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resources');
      if (res.data.success) {
        setResources(res.data.resources || []);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
      toast.error('Could not load learning resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Distinct list of all available skills for the dropdown
  const availableSkills = useMemo(() => {
    const set = new Set();
    resources.forEach((r) => {
      const name = r.skill_name || r.topic;
      if (name) set.add(name);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [resources]);

  // Clean filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      // 1. Skill filter
      if (selectedSkill !== 'All') {
        const lowerSelected = selectedSkill.toLowerCase();
        const matchesSkill =
          (r.skill_name && r.skill_name.toLowerCase() === lowerSelected) ||
          (r.topic && r.topic.toLowerCase() === lowerSelected);
        if (!matchesSkill) return false;
      }

      // 2. Level filter
      if (selectedLevel !== 'All') {
        if (r.difficulty !== selectedLevel) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.topic && r.topic.toLowerCase().includes(q)) ||
          (r.skill_name && r.skill_name.toLowerCase().includes(q)) ||
          (r.description && r.description.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [resources, selectedSkill, selectedLevel, searchQuery]);

  // Handle generating resources for any other skill
  const handleCurateSkill = async (e) => {
    if (e) e.preventDefault();
    const cleanSkill = customSkillInput.trim();
    if (!cleanSkill) return;

    setGeneratingCustom(true);
    try {
      const res = await api.post('/resources/generate', { skill: cleanSkill });
      if (res.data.success) {
        toast.success(`Resources added for "${cleanSkill}"!`);
        await fetchResources();
        setSelectedSkill(cleanSkill);
        setCustomSkillInput('');
        setShowAddSkill(false);
      }
    } catch (err) {
      console.error('Failed to curate skill:', err);
      toast.error('Could not curate resources right now.');
    } finally {
      setGeneratingCustom(false);
    }
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedSkill !== 'All' || selectedLevel !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSkill('All');
    setSelectedLevel('All');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ded6c5] dark:border-[#2a2a30] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-[#f5efe4] tracking-tight">
            Learning Resources
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-0.5">
            Verified official documentation and guides to learn and master any skill.
          </p>
        </div>

        {/* Subtle button to add another skill */}
        <button
          onClick={() => setShowAddSkill(!showAddSkill)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#ded6c5] dark:border-[#2a2a30] text-stone-800 dark:text-[#f5efe4] hover:bg-[#f5efe4] dark:hover:bg-[#1e1e23] text-xs font-semibold transition-colors bg-white dark:bg-[#161619] self-start sm:self-auto cursor-pointer"
        >
          {showAddSkill ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-stone-900 dark:text-[#f5efe4]" />}
          <span>{showAddSkill ? 'Close' : 'Add Any Other Skill'}</span>
        </button>
      </div>

      {/* Optional Clean Add-Skill Bar */}
      {showAddSkill && (
        <form
          onSubmit={handleCurateSkill}
          className="p-4 bg-white dark:bg-[#101312] rounded-xl border border-[#ded6c5] dark:border-[#2A302D] flex flex-col sm:flex-row items-center gap-2.5 shadow-xs"
        >
          <input
            type="text"
            placeholder="Type any skill or technology (e.g. Solidity, Apache Kafka, Rust, WebAssembly)..."
            value={customSkillInput}
            onChange={(e) => setCustomSkillInput(e.target.value)}
            disabled={generatingCustom}
            className="flex-1 w-full px-3.5 py-2 rounded-lg border border-[#ded6c5] dark:border-[#2A302D] bg-[#faf7f2] dark:bg-[#191E1C] text-xs sm:text-sm focus:outline-none text-stone-900 dark:text-[#F5F4EF] placeholder:text-stone-400 dark:placeholder:text-[#A2AAA5]/50 focus:border-[#2A8278]"
          />
          <button
            type="submit"
            disabled={!customSkillInput.trim() || generatingCustom}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            {generatingCustom ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Curating...</span>
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                <span>Curate Resources</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Clean Controls Bar: Search + Available Skills + Levels */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search skills, topics, docs (e.g. React, Python, Docker)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#ded6c5] dark:border-[#2a2a30] bg-white dark:bg-[#161619] text-xs sm:text-sm focus:outline-none text-stone-900 dark:text-[#f5efe4] placeholder:text-stone-400 dark:placeholder:text-stone-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* All Available Skills Dropdown */}
        <div className="sm:col-span-3">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-[#ded6c5] dark:border-[#2a2a30] bg-white dark:bg-[#161619] text-xs sm:text-sm font-medium text-stone-900 dark:text-[#f5efe4] focus:outline-none cursor-pointer"
          >
            <option value="All">All Skills ({availableSkills.length})</option>
            {availableSkills.map((sk) => (
              <option key={sk} value={sk}>
                {sk}
              </option>
            ))}
          </select>
        </div>

        {/* Level / Difficulty Dropdown */}
        <div className="sm:col-span-3">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-[#ded6c5] dark:border-[#2a2a30] bg-white dark:bg-[#161619] text-xs sm:text-sm font-medium text-stone-900 dark:text-[#f5efe4] focus:outline-none cursor-pointer"
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Status & Results Summary Bar */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-1">
        <span>
          Showing {filteredResources.length} of {resources.length} learning resources
        </span>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="font-medium text-stone-900 dark:text-[#f5efe4] underline underline-offset-2 hover:opacity-80 cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-stone-900 dark:text-[#f5efe4]" />
          <p className="text-xs text-stone-500 dark:text-stone-400">Loading resources...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="py-12 px-6 bg-white dark:bg-[#101312] rounded-xl border border-[#ded6c5] dark:border-[#2A302D] text-center space-y-3">
          <BookOpen className="w-8 h-8 text-stone-400 dark:text-[#A2AAA5] mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-[#F5F4EF]">
              No matching resources found
            </h3>
            <p className="text-xs text-stone-500 dark:text-[#A2AAA5] mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No resources currently match "${searchQuery}".`
                : 'Try adjusting your search or level filters.'}
            </p>
          </div>

          {searchQuery && (
            <button
              onClick={() => {
                setCustomSkillInput(searchQuery);
                setShowAddSkill(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] text-xs font-semibold cursor-pointer shadow-xs transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#F5F4EF]" />
              <span>Curate resources for "{searchQuery}"</span>
            </button>
          )}
        </div>
      ) : (
        /* Clean Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => (
            <a
              key={res.id}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 bg-white dark:bg-[#101312] rounded-xl border border-[#ded6c5] dark:border-[#2A302D] hover:border-[#2A8278] dark:hover:border-[#2A8278] hover:shadow-xs transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header: Skill tag + Level */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#f5efe4] dark:bg-[#222825] text-stone-900 dark:text-[#F5F4EF] border border-[#ded6c5] dark:border-[#2A302D] truncate">
                    {res.skill_name || res.topic}
                  </span>

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#f5efe4] dark:bg-[#222825] text-stone-900 dark:text-[#D5B777] border border-[#ded6c5] dark:border-[#2A302D]">
                    {res.difficulty}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-stone-900 dark:text-[#f5efe4] transition-colors line-clamp-2 leading-snug">
                  {res.title}
                </h3>

                {/* Description */}
                {res.description && (
                  <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>
                )}
              </div>

              {/* Footer: Type + Visit Link */}
              <div className="mt-4 pt-3 border-t border-[#ded6c5] dark:border-[#2a2a30] flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="font-medium text-[11px] truncate">
                  {res.resource_type || 'Documentation'}
                </span>

                <span className="text-stone-900 dark:text-[#f5efe4] font-semibold text-xs flex items-center gap-1 group-hover:underline underline-offset-2">
                  <span>Visit Docs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
