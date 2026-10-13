/**
 * Job Description Skill Extraction Engine
 * Adapted from JobDescription_Skill_Extractor with strict regex boundary matching.
 */

export const SKILLS_DATABASE = [
  // Programming Languages
  { name: "JavaScript", category: "Language", regex: /\b(?:JavaScript|Vanilla\s+JS)\b/i },
  { name: "TypeScript", category: "Language", regex: /\bTypeScript\b/i },
  { name: "Python", category: "Language", regex: /\bPython\b/i },
  { name: "Java", category: "Language", regex: /\bJava\b(?!\s*Script)/i },
  { name: "C++", category: "Language", regex: /(?<![a-zA-Z0-9])C\+\+(?![+])/i },
  { name: "C#", category: "Language", regex: /(?<![a-zA-Z0-9])C#(?![#])/i },
  { name: "C", category: "Language", regex: /(?<![\(a-zA-Z0-9_#+])C(?![)a-zA-Z0-9_#+])/i },
  { name: "Go", category: "Language", regex: /(?:\bGolang\b|\bGo\b(?!\s+(?:to|ahead|for|on|through|with|out|in|up|down|away|into|over|under|back|from|beyond)))/i },
  { name: "Rust", category: "Language", regex: /\bRust\b/i },
  { name: "PHP", category: "Language", regex: /\bPHP\b/i },
  { name: "Ruby", category: "Language", regex: /\bRuby(?:\s+on\s+Rails)?\b/i },
  { name: "Kotlin", category: "Language", regex: /\bKotlin\b/i },
  { name: "Swift", category: "Language", regex: /\bSwift\b/i },
  { name: "SQL", category: "Language", regex: /\bSQL\b/i },

  // Frontend
  { name: "HTML", category: "Frontend", regex: /\bHTML(?:5)?\b/i },
  { name: "CSS", category: "Frontend", regex: /\bCSS(?:3)?\b/i },
  { name: "React", category: "Frontend", regex: /\bReact(?:\.js|js)?\b/i },
  { name: "Angular", category: "Frontend", regex: /\bAngular(?:\.js|js)?\b/i },
  { name: "Vue", category: "Frontend", regex: /\bVue(?:\.js|js)?\b/i },
  { name: "Next.js", category: "Frontend", regex: /\bNext(?:\.js|js|\s+js)\b/i },
  { name: "Tailwind CSS", category: "Frontend", regex: /\b(?:Tailwind\s+CSS|TailwindCSS|Tailwind)\b/i },
  { name: "Redux", category: "Frontend", regex: /\bRedux\b/i },
  { name: "Webpack", category: "Frontend", regex: /\bWebpack\b/i },
  { name: "Vite", category: "Frontend", regex: /\bVite\b/i },

  // Backend
  { name: "Node.js", category: "Backend", regex: /\bNode(?:\.js|js|\s+js)\b/i },
  { name: "Express", category: "Backend", regex: /\bExpress(?:\.js|js)?\b/i },
  { name: "NestJS", category: "Backend", regex: /\bNest(?:\.js|js|\s+js)\b/i },
  { name: "Spring Boot", category: "Backend", regex: /\bSpring\s+Boot\b/i },
  { name: "Django", category: "Backend", regex: /\bDjango\b/i },
  { name: "Flask", category: "Backend", regex: /\bFlask\b/i },
  { name: "FastAPI", category: "Backend", regex: /\bFastAPI\b/i },
  { name: "REST API", category: "Backend", regex: /\b(?:REST(?:ful)?\s+APIs?|RESTful)\b/i },
  { name: "GraphQL", category: "Backend", regex: /\bGraphQL\b/i },

  // Databases
  { name: "MongoDB", category: "Database", regex: /\bMongo(?:DB)?\b/i },
  { name: "PostgreSQL", category: "Database", regex: /\b(?:PostgreSQL|Postgres)\b/i },
  { name: "MySQL", category: "Database", regex: /\bMySQL\b/i },
  { name: "SQLite", category: "Database", regex: /\bSQLite(?:3)?\b/i },
  { name: "Redis", category: "Database", regex: /\bRedis\b/i },
  { name: "Firebase", category: "Database", regex: /\bFirebase\b/i },
  { name: "Supabase", category: "Database", regex: /\bSupabase\b/i },

  // Cloud & DevOps
  { name: "AWS", category: "Cloud", regex: /\b(?:AWS|Amazon\s+Web\s+Services)\b/i },
  { name: "Azure", category: "Cloud", regex: /\b(?:Azure|Microsoft\s+Azure)\b/i },
  { name: "Google Cloud", category: "Cloud", regex: /\b(?:Google\s+Cloud(?:\s+Platform)?|GCP)\b/i },
  { name: "Docker", category: "DevOps", regex: /\bDocker\b/i },
  { name: "Kubernetes", category: "DevOps", regex: /\b(?:Kubernetes|K8s)\b/i },
  { name: "CI/CD", category: "DevOps", regex: /\b(?:CI\/CD|Continuous\s+Integration)\b/i },
  { name: "Git", category: "Tools", regex: /\bGit\b(?!\s*Hub|\s*Lab)/i },
  { name: "Linux", category: "Tools", regex: /\bLinux\b/i },

  // Testing & AI
  { name: "Jest", category: "Testing", regex: /\bJest\b/i },
  { name: "PyTest", category: "Testing", regex: /\bPyTest\b/i },
  { name: "Cypress", category: "Testing", regex: /\bCypress\b/i },
  { name: "Playwright", category: "Testing", regex: /\bPlaywright\b/i },
  { name: "Machine Learning", category: "AI/Data", regex: /\b(?:Machine\s+Learning|ML)\b/i },
  { name: "PyTorch", category: "AI/Data", regex: /\bPyTorch\b/i },
  { name: "TensorFlow", category: "AI/Data", regex: /\bTensorFlow\b/i },
  { name: "Pandas", category: "AI/Data", regex: /\bPandas\b/i },
];

/**
 * Extracts and categorizes all matching skills from raw job description text.
 * @param {string} text
 */
export const extractSkillsFromJobDescription = (text) => {
  if (!text || typeof text !== 'string') return { all: [], byCategory: {} };

  const matchedSkills = [];
  const byCategory = {};

  for (const entry of SKILLS_DATABASE) {
    if (entry.regex.test(text)) {
      matchedSkills.push(entry.name);
      if (!byCategory[entry.category]) {
        byCategory[entry.category] = [];
      }
      byCategory[entry.category].push(entry.name);
    }
  }

  return {
    all: matchedSkills,
    totalCount: matchedSkills.length,
    byCategory,
  };
};

export default {
  SKILLS_DATABASE,
  extractSkillsFromJobDescription,
};
