import { query } from '../config/db.js';
import { normalizeSkill } from '../utils/skillDictionary.js';

/**
 * Deterministic Skill Matching & Gap Analysis Engine
 */
export class CareerService {
  /**
   * Compares a list of user skills against a target career's required skills.
   * @param {string[]} userSkills
   * @param {string[]} targetRequiredSkills
   */
  static analyzeSkillGap(userSkills = [], targetRequiredSkills = []) {
    // Build set of normalized user skills in lowercase
    const normalizedUserSkills = new Set(
      userSkills
        .map((s) => (normalizeSkill(s) || s).trim().toLowerCase())
        .filter(Boolean)
    );

    // Also include raw user skills in lowercase
    userSkills.forEach((s) => {
      if (typeof s === 'string' && s.trim()) {
        normalizedUserSkills.add(s.trim().toLowerCase());
      }
    });

    const matched = [];
    const missing = [];

    // Deduplicate targetRequiredSkills while preserving order
    const seenReq = new Set();
    const uniqueRequired = (targetRequiredSkills || []).filter((req) => {
      const clean = (req || '').trim();
      if (!clean) return false;
      const lower = clean.toLowerCase();
      if (seenReq.has(lower)) return false;
      seenReq.add(lower);
      return true;
    });

    uniqueRequired.forEach((reqSkill) => {
      const canonicalReq = normalizeSkill(reqSkill) || reqSkill;
      const lowerCanonical = canonicalReq.trim().toLowerCase();
      const lowerRaw = reqSkill.trim().toLowerCase();

      const isMatch =
        normalizedUserSkills.has(lowerCanonical) ||
        normalizedUserSkills.has(lowerRaw) ||
        Array.from(normalizedUserSkills).some((u) => {
          if (u === lowerCanonical || u === lowerRaw) return true;
          if (u.length > 3 && (lowerCanonical.includes(u) || lowerRaw.includes(u))) return true;
          if (lowerCanonical.length > 3 && (u.includes(lowerCanonical) || u.includes(lowerRaw))) return true;
          return false;
        });

      if (isMatch) {
        matched.push(reqSkill);
      } else {
        missing.push(reqSkill);
      }
    });

    const totalRequired = uniqueRequired.length;
    const matchPercentage = totalRequired > 0
      ? Math.round((matched.length / totalRequired) * 100)
      : 0;

    let readinessStatus = 'Exploring';
    if (matchPercentage >= 80) readinessStatus = 'Ready to Apply / Advanced';
    else if (matchPercentage >= 50) readinessStatus = 'Developing Candidate';
    else if (matchPercentage >= 25) readinessStatus = 'Foundational Learner';

    return {
      matchPercentage,
      readinessStatus,
      calculationBasis: `Calculated deterministically as (${matched.length} matched skills / ${totalRequired} required skills) * 100%`,
      totalRequired,
      matchedCount: matched.length,
      missingCount: missing.length,
      matchedSkills: matched,
      missingSkills: missing,
    };
  }

  /**
   * Match user profile against all curated career roles in the database.
   * @param {object} profile
   */
  static async getRoleMatchesForProfile(profile) {
    const rolesRes = await query('SELECT * FROM career_roles ORDER BY title ASC');
    const userSkills = profile?.skills || [];
    const userInterests = (profile?.interests || []).map((i) => i.toLowerCase());

    const scoredRoles = rolesRes.rows.map((role) => {
      const gap = this.analyzeSkillGap(userSkills, role.required_skills);
      
      // Bonus score for matching user interests
      let interestBonus = 0;
      userInterests.forEach((interest) => {
        if (
          role.title.toLowerCase().includes(interest) ||
          role.description.toLowerCase().includes(interest)
        ) {
          interestBonus += 5;
        }
      });

      const totalScore = Math.min(100, gap.matchPercentage + interestBonus);

      return {
        id: role.id,
        title: role.title,
        description: role.description,
        requiredSkills: role.required_skills,
        recommendedProjects: role.recommended_projects,
        skillAnalysis: gap,
        overallFitScore: totalScore,
      };
    });

    // Sort by best fit
    scoredRoles.sort((a, b) => b.overallFitScore - a.overallFitScore);
    return scoredRoles;
  }
}

export default CareerService;
