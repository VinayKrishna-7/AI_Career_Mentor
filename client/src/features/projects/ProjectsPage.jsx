import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  BookmarkPlus,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const TECH_OPTIONS = ['React', 'MERN Stack', 'Node.js', 'Python', 'Next.js', 'PostgreSQL', 'Flutter', 'TypeScript', 'Docker', 'Go'];
const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const TYPE_OPTIONS = ['Web Application', 'Developer Tool', 'Productivity Tool', 'AI Assistant', 'E-commerce', 'Social Application'];

export const ProjectsPage = () => {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [targetCareer, setTargetCareer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Project Blueprint Generator state
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [genTech, setGenTech] = useState('React');
  const [genDifficulty, setGenDifficulty] = useState('Intermediate');
  const [genType, setGenType] = useState('Web Application');
  const [generating, setGenerating] = useState(false);
  const [customIdeas, setCustomIdeas] = useState([]);
  const [savingTitle, setSavingTitle] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects/recommend');
        if (res.data.success) {
          const projs = res.data.projects || [];
          setProjects(projs);
          setTargetCareer(res.data.targetCareer || '');
          if (projs.length === 0) {
            setGeneratorOpen(true);
          }
        }
      } catch (err) {
        setError('Failed to load projects.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleGenerateIdeas = async (e, customTechOverride) => {
    if (e) e.preventDefault();
    const techToUse = customTechOverride || genTech;
    setGenerating(true);
    setError('');

    try {
      const res = await api.post('/projects/generate-ideas', {
        technology: techToUse,
        difficulty: genDifficulty,
        projectType: genType,
      });

      if (res.data.success) {
        setCustomIdeas(res.data.ideas || []);
        setGeneratorOpen(true);
        toast.success(`Generated 3 project blueprints for ${techToUse}!`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate blueprints.';
      setError(msg);
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveIdea = async (idea) => {
    try {
      setSavingTitle(idea.title);
      const res = await api.post('/projects/save', {
        title: idea.title,
        difficulty: genDifficulty,
        technologies: idea.stack || [genTech],
        skills_developed: [`${genTech} Architecture`, 'Portfolio Engineering', 'System Design'],
        main_objectives: idea.description,
        suggested_features: idea.features || [],
        estimated_effort: genDifficulty === 'Advanced' ? '4-6 Weeks' : genDifficulty === 'Intermediate' ? '2-3 Weeks' : '1-2 Weeks',
      });

      if (res.data.success) {
        toast.success(`"${idea.title}" saved to your portfolio!`);
        const refRes = await api.get('/projects/recommend');
        if (refRes.data.success) {
          setProjects(refRes.data.projects || []);
        }
      }
    } catch (err) {
      toast.error('Failed to save project');
    } finally {
      setSavingTitle(null);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Remove this project from your portfolio list?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.info('Project removed from portfolio.');
    } catch (err) {
      toast.error('Failed to remove project');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2.5">
        <Loader2 className="w-6 h-6 animate-spin text-[#2A8278]" />
        <p className="text-xs text-[#A2AAA5]">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Executive Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A302D]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F5F4EF] tracking-tight">
            Projects Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-[#A2AAA5] mt-0.5">
            Architectural projects tailored to {targetCareer || 'your target career goals'}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setGeneratorOpen(!generatorOpen)}
          className="px-3.5 py-2 rounded-lg bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{generatorOpen ? 'Close Generator' : 'New Project Blueprint'}</span>
          {generatorOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-[#222825] border border-[#2A302D] text-[#F5F4EF] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#D5B777] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Project Blueprint Generator Box */}
      {generatorOpen && (
        <div className="p-5 sm:p-6 rounded-xl bg-[#191E1C] text-[#F5F4EF] space-y-4 border border-[#2A302D]">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2 text-[#F5F4EF]">
              <Layers className="w-4 h-4 text-[#D5B777]" />
              <span>Project Blueprint Generator</span>
            </h2>
            <p className="text-xs text-[#A2AAA5] mt-0.5">
              Select tech stack and difficulty level to formulate portfolio-grade project designs.
            </p>
          </div>

          <form onSubmit={(e) => handleGenerateIdeas(e)} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#D5B777] uppercase tracking-wider mb-1">
                Technology / Framework
              </label>
              <input
                type="text"
                required
                placeholder="e.g. React, Rust, Go, Python, Next.js, PostgreSQL..."
                value={genTech}
                onChange={(e) => setGenTech(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#222825] border border-[#2A302D] text-[#F5F4EF] text-xs focus:outline-none focus:border-[#2A8278] placeholder:text-[#A2AAA5]/60 mb-2 transition-colors"
              />
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-[#A2AAA5] mr-1">Quick Picks:</span>
                {TECH_OPTIONS.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setGenTech(t)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                      genTech.toLowerCase() === t.toLowerCase()
                        ? 'bg-[#2A8278] text-[#F5F4EF] border-[#2A8278]'
                        : 'bg-[#222825] text-[#A2AAA5] hover:text-[#F5F4EF] border-[#2A302D]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#A2AAA5] uppercase tracking-wider mb-1">Difficulty Level</label>
              <select
                value={genDifficulty}
                onChange={(e) => setGenDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#222825] border border-[#2A302D] text-[#F5F4EF] text-xs focus:outline-none focus:border-[#2A8278] transition-colors"
              >
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d} value={d} className="bg-[#191E1C] text-[#F5F4EF]">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#A2AAA5] uppercase tracking-wider mb-1">Project Category</label>
              <select
                value={genType}
                onChange={(e) => setGenType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#222825] border border-[#2A302D] text-[#F5F4EF] text-xs focus:outline-none focus:border-[#2A8278] transition-colors"
              >
                {TYPE_OPTIONS.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#191E1C] text-[#F5F4EF]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 pt-1">
              <button
                type="submit"
                disabled={generating}
                className="w-full py-2.5 rounded-lg bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F5F4EF]" /> : <FolderGit2 className="w-3.5 h-3.5 text-[#F5F4EF]" />}
                <span>{generating ? 'Formulating Blueprints...' : `Generate 3 Blueprints for ${genTech}`}</span>
              </button>
            </div>
          </form>

          {/* Generated Ideas Result */}
          {customIdeas.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[#2A302D]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#F5F4EF] uppercase tracking-wider">Generated Suggestions</h3>
                <span className="text-[11px] text-[#A2AAA5]">Click 'Save' to add to your portfolio</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {customIdeas.map((idea, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-[#222825] border border-[#2A302D] space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-bold text-[#F5F4EF] text-sm">{idea.title}</h4>
                      <button
                        type="button"
                        onClick={() => handleSaveIdea(idea)}
                        disabled={savingTitle === idea.title}
                        className="self-start sm:self-auto px-2.5 py-1.5 rounded-md bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        {savingTitle === idea.title ? (
                          <Loader2 className="w-3 h-3 animate-spin text-[#F5F4EF]" />
                        ) : (
                          <BookmarkPlus className="w-3 h-3 text-[#F5F4EF]" />
                        )}
                        <span>Save to Projects</span>
                      </button>
                    </div>

                    <p className="text-xs text-[#A2AAA5] leading-relaxed">{idea.description}</p>

                    <div className="space-y-1">
                      {idea.features?.map((f, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-[#F5F4EF]">
                          <CheckCircle2 className="w-3 h-3 text-[#2A8278] mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {idea.stack?.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-[#191E1C] border border-[#2A302D] text-[11px] font-medium text-[#A2AAA5]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#A2AAA5] uppercase tracking-wider">
            Active Projects ({projects.length})
          </h2>
          {projects.length > 0 && !generatorOpen && (
            <button
              type="button"
              onClick={() => setGeneratorOpen(true)}
              className="text-xs font-semibold text-[#D5B777] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Blueprint</span>
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-xl border border-dashed border-[#2A302D] bg-[#191E1C] text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-lg bg-[#222825] border border-[#2A302D] flex items-center justify-center text-[#D5B777]">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-bold text-[#F5F4EF]">No Projects Saved Yet</h3>
              <p className="text-xs text-[#A2AAA5] leading-relaxed">
                Generate project blueprints tailored to your career milestones.
              </p>
            </div>
            {!generatorOpen && (
              <button
                type="button"
                onClick={() => setGeneratorOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Open Project Generator</span>
              </button>
            )}
          </div>
        ) : (
          projects.map((proj, idx) => (
            <div
              key={proj.id || idx}
              className="bg-[#191E1C] p-5 sm:p-6 rounded-xl border border-[#2A302D] space-y-4 hover:border-[#3A423E] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A302D] pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#F5F4EF]">{proj.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#222825] text-[#D5B777] border border-[#2A302D]">
                      {proj.difficulty}
                    </span>
                    <span className="text-xs text-[#A2AAA5]">•</span>
                    <span className="text-xs text-[#A2AAA5] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{proj.estimated_effort}</span>
                    </span>
                  </div>
                </div>

                {proj.id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(proj.id)}
                    className="self-start sm:self-auto p-1.5 text-[#A2AAA5] hover:text-red-400 hover:bg-[#222825] rounded-md transition-colors cursor-pointer"
                    title="Remove project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-xs text-[#A2AAA5] leading-relaxed">
                {proj.main_objectives}
              </p>

              {/* Technologies */}
              {proj.technologies?.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-[#A2AAA5] uppercase tracking-wider block mb-1.5">
                    Stack & Tools:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded bg-[#222825] border border-[#2A302D] text-[#F5F4EF] text-[11px] font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Developed */}
              {proj.skills_developed?.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-[#A2AAA5] uppercase tracking-wider block mb-1.5">
                    Competencies Developed:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.skills_developed.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded bg-[#222825] border border-[#2A302D] text-[#2A8278] text-[11px] font-medium"
                      >
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Features */}
              {proj.suggested_features?.length > 0 && (
                <div className="p-3.5 bg-[#222825] rounded-lg border border-[#2A302D] space-y-1.5">
                  <span className="text-xs font-bold text-[#F5F4EF] block">
                    Core Architectural Deliverables:
                  </span>
                  <div className="space-y-1">
                    {proj.suggested_features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-[#A2AAA5]">
                        <CheckCircle2 className="w-3 h-3 text-[#2A8278] mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
