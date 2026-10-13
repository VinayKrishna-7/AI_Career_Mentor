import { parsePdf } from './resume/pdfParser.js';
import { extractSkillsFromText, normalizeSkill } from '../utils/skillDictionary.js';
import { normalizeText } from '../utils/textNormalizer.js';
import { AIService } from './ai.service.js';

export class ResumeService {
  /**
   * Extract text from PDF buffer using resilient multi-tier parser
   * @param {Buffer} buffer
   */
  static async extractPdfText(buffer) {
    try {
      const parsed = await parsePdf(buffer);
      return normalizeText(parsed.text || parsed.normalizedText || '');
    } catch (err) {
      throw new Error(`Failed to extract text from PDF: ${err.message}`);
    }
  }

  /**
   * Analyze extracted resume text against a target job role and optional job description
   * @param {string} resumeText
   * @param {string} targetRole
   * @param {string} jobDescription
   * @param {string[]} requiredSkills
   */
  static async analyzeResume(resumeText, targetRole = 'Full-Stack Developer', jobDescription = '', requiredSkills = []) {
    // 1. Deterministic skill extraction
    const detectedSkills = extractSkillsFromText(resumeText);

    // 2. Identify target skills
    let targetSkillList = requiredSkills;
    if (jobDescription && jobDescription.trim()) {
      const jdSkills = extractSkillsFromText(jobDescription);
      if (jdSkills.length > 0) {
        targetSkillList = Array.from(new Set([...targetSkillList, ...jdSkills]));
      }
    }

    if (targetSkillList.length === 0) {
      targetSkillList = ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Git', 'REST APIs'];
    }

    // 3. Calculate matches and gaps
    const normalizedDetected = new Set(detectedSkills.map((s) => normalizeSkill(s)));
    const matchedSkills = [];
    const missingSkills = [];

    targetSkillList.forEach((skill) => {
      const canon = normalizeSkill(skill) || skill;
      if (normalizedDetected.has(canon)) {
        matchedSkills.push(canon);
      } else {
        missingSkills.push(canon);
      }
    });

    const skillScore = targetSkillList.length > 0
      ? Math.round((matchedSkills.length / targetSkillList.length) * 100)
      : 70;

    // Word count & basic formatting checks
    const words = resumeText.split(/\s+/).filter(Boolean);
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
    const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
    const hasEducationSection = /education|university|college|bachelor|degree/i.test(resumeText);
    const hasExperienceSection = /experience|employment|work history|projects/i.test(resumeText);

    let formattingScore = 70;
    if (hasEmail) formattingScore += 10;
    if (hasPhone) formattingScore += 5;
    if (hasEducationSection) formattingScore += 8;
    if (hasExperienceSection) formattingScore += 7;
    formattingScore = Math.min(100, formattingScore);

    // Deterministic composite score and default recommendations
    const overallScore = Math.round(skillScore * 0.7 + formattingScore * 0.3);

    const defaultStrengths = [
      hasExperienceSection ? 'Clear professional project and experience section hierarchy' : 'Solid technical foundation and educational credentials',
      matchedSkills.length > 0 ? `Demonstrated competency in key core technologies: ${matchedSkills.slice(0, 4).join(', ')}` : 'Clean and parseable document structure suitable for applicant tracking systems',
      hasEmail && hasPhone ? 'Complete candidate contact coordinates for rapid recruiter outreach' : 'Focused technical summary and role-aligned narrative',
    ];

    const defaultImprovements = [
      missingSkills.length > 0 ? `Incorporate target role competencies into project descriptions: ${missingSkills.slice(0, 4).join(', ')}` : 'Tailor keyword density to match specific job posting requirements',
      'Adopt the Google XYZ formula for bullet points (Accomplished [X] as measured by [Y], by doing [Z])',
      'Quantify technical accomplishments with hard metrics (e.g., latency reduction, throughput, user scale)',
    ];

    // 4. Run Live AI Resume Analysis (Groq/Gemini/Claude)
    let aiAnalysis = null;
    try {
      aiAnalysis = await AIService.analyzeResumeWithAI(resumeText, targetRole, jobDescription);
    } catch (aiErr) {
      console.warn('[ResumeService] Live AI analysis error, using deterministic analyzer:', aiErr.message);
    }

    if (aiAnalysis && typeof aiAnalysis.overallScore === 'number') {
      return {
        targetRole,
        overallScore: Math.min(100, Math.max(20, Math.round(aiAnalysis.overallScore))),
        skillScore: Math.min(100, Math.max(20, Math.round(aiAnalysis.skillScore ?? skillScore))),
        formattingScore: Math.min(100, Math.max(20, Math.round(aiAnalysis.formattingScore ?? formattingScore))),
        executiveSummary: aiAnalysis.executiveSummary || `Resume evaluated for ${targetRole} with verified skill alignment.`,
        detectedSkills: Array.from(new Set([...detectedSkills, ...(aiAnalysis.matchedSkills || [])])),
        matchedSkills: Array.isArray(aiAnalysis.matchedSkills) && aiAnalysis.matchedSkills.length ? aiAnalysis.matchedSkills : matchedSkills,
        missingSkills: Array.isArray(aiAnalysis.missingSkills) && aiAnalysis.missingSkills.length ? aiAnalysis.missingSkills : missingSkills,
        strengths: Array.isArray(aiAnalysis.strengths) && aiAnalysis.strengths.length ? aiAnalysis.strengths : defaultStrengths,
        improvements: Array.isArray(aiAnalysis.improvements) && aiAnalysis.improvements.length ? aiAnalysis.improvements : defaultImprovements,
        bulletRevisions: Array.isArray(aiAnalysis.bulletRevisions) && aiAnalysis.bulletRevisions.length ? aiAnalysis.bulletRevisions : [
          {
            original: 'Responsible for developing features and fixing bugs across services',
            revised: `Engineered core full-stack features for ${targetRole} pipeline, reducing bug resolution time by 35% through automated unit testing`,
            reason: 'Replaces passive job duty with active verb, measurable outcome, and automated testing standard',
          },
        ],
        wordCount: words.length,
        formattingChecks: {
          hasEmail,
          hasPhone,
          hasEducationSection,
          hasExperienceSection,
        },
      };
    }

    // High quality deterministic fallback
    return {
      targetRole,
      overallScore,
      skillScore,
      formattingScore,
      executiveSummary: `Resume evaluated for ${targetRole}. Detected ${detectedSkills.length} verified technical skills with ${skillScore}% target stack alignment.`,
      detectedSkills,
      matchedSkills,
      missingSkills,
      strengths: defaultStrengths,
      improvements: defaultImprovements,
      bulletRevisions: [
        {
          original: 'Responsible for developing features and fixing bugs across services',
          revised: `Engineered core full-stack features for ${targetRole} pipeline, reducing bug resolution time by 35% through automated unit testing`,
          reason: 'Replaces passive job duty with active verb, measurable outcome, and automated testing standard',
        },
      ],
      wordCount: words.length,
      formattingChecks: {
        hasEmail,
        hasPhone,
        hasEducationSection,
        hasExperienceSection,
      },
    };
  }
}

export default ResumeService;
