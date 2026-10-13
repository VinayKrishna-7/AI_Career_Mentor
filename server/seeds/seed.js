import { pool } from '../src/config/db.js';

const CAREER_ROLES = [
  {
    title: 'Frontend Developer',
    description: 'Builds modern, responsive, and accessible user interfaces for web applications using HTML, CSS, JavaScript, and modern component frameworks.',
    required_skills: ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Tailwind CSS', 'Git', 'REST APIs'],
    recommended_projects: [
      {
        title: 'Interactive SaaS Dashboard',
        difficulty: 'Intermediate',
        technologies: ['React', 'Tailwind CSS', 'Recharts', 'REST APIs'],
        skills_developed: ['Component Design', 'Data Visualization', 'State Management'],
        main_objectives: 'Create a responsive analytics dashboard with dark mode and filterable charts.',
        suggested_features: ['Real-time metrics widgets', 'Timeframe date picker', 'Responsive sidebar navigation'],
        estimated_effort: '15-20 hours'
      },
      {
        title: 'E-commerce Product Showcase with Cart',
        difficulty: 'Beginner-Intermediate',
        technologies: ['React', 'Tailwind CSS', 'Context API'],
        skills_developed: ['Client-side routing', 'Shopping cart persistence', 'Form handling'],
        main_objectives: 'Build a catalog with search, category filtering, and modal product previews.',
        suggested_features: ['Product search and debounced filter', 'Cart drawer', 'Checkout validation'],
        estimated_effort: '10-15 hours'
      }
    ]
  },
  {
    title: 'Backend Developer',
    description: 'Architects reliable server-side systems, manages databases, builds secure RESTful and GraphQL APIs, and handles authentication and caching.',
    required_skills: ['Node.js', 'Express', 'JavaScript', 'PostgreSQL', 'SQL', 'REST APIs', 'Git', 'Docker', 'Authentication'],
    recommended_projects: [
      {
        title: 'Secure Multi-Tenant REST API with JWT & PostgreSQL',
        difficulty: 'Intermediate',
        technologies: ['Node.js', 'Express', 'PostgreSQL', 'JWT', 'Zod'],
        skills_developed: ['Database Normalization', 'Role-based Access Control', 'SQL Optimization'],
        main_objectives: 'Implement an authenticated API with rate limiting, input validation, and migrations.',
        suggested_features: ['Refresh & access token lifecycle', 'Parameterized query security', 'Paginated API listings'],
        estimated_effort: '20-25 hours'
      },
      {
        title: 'Background Job & Notification Microservice',
        difficulty: 'Advanced',
        technologies: ['Node.js', 'Redis', 'PostgreSQL', 'Docker'],
        skills_developed: ['Message Queues', 'Worker Processes', 'Fault Tolerance'],
        main_objectives: 'Process email digests and data exports asynchronously.',
        suggested_features: ['Job scheduling', 'Exponential backoff retry', 'Worker health reporting'],
        estimated_effort: '25-30 hours'
      }
    ]
  },
  {
    title: 'Full-Stack Developer',
    description: 'Bridging client and server development to deliver end-to-end web applications, from database schemas to polished user experiences.',
    required_skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'Git', 'REST APIs'],
    recommended_projects: [
      {
        title: 'Collaborative Kanban Task Manager',
        difficulty: 'Intermediate-Advanced',
        technologies: ['React', 'Tailwind CSS', 'Node.js', 'Express', 'PostgreSQL'],
        skills_developed: ['Full-stack CRUD', 'Drag and Drop UI', 'Relational Database Schema'],
        main_objectives: 'Build a project management workspace where users organize tasks across columns.',
        suggested_features: ['Drag-and-drop task cards', 'Task labels and priorities', 'User activity audit log'],
        estimated_effort: '25-30 hours'
      }
    ]
  },
  {
    title: 'Data Analyst',
    description: 'Transforms raw data into actionable business intelligence through statistical analysis, SQL querying, and interactive visual dashboards.',
    required_skills: ['SQL', 'Python', 'Pandas', 'Excel', 'Tableau', 'Data Visualization', 'Statistics'],
    recommended_projects: [
      {
        title: 'Customer Churn & Retention Analytics',
        difficulty: 'Intermediate',
        technologies: ['Python', 'Pandas', 'SQL', 'Matplotlib'],
        skills_developed: ['Exploratory Data Analysis', 'Cohort Analysis', 'Feature Aggregation'],
        main_objectives: 'Analyze subscription user behaviors to discover drop-off indicators.',
        suggested_features: ['Churn rate by tenure chart', 'Customer lifetime value analysis', 'Executive summary report'],
        estimated_effort: '15-20 hours'
      }
    ]
  },
  {
    title: 'AI / Machine Learning Engineer',
    description: 'Designs, trains, evaluates, and deploys machine learning models and integrates Large Language Models (LLMs) into production software.',
    required_skills: ['Python', 'Machine Learning', 'PyTorch', 'TensorFlow', 'NLP', 'Git', 'Docker', 'REST APIs'],
    recommended_projects: [
      {
        title: 'Retrieval-Augmented Generation (RAG) Document Q&A Assistant',
        difficulty: 'Advanced',
        technologies: ['Python', 'LangChain', 'FastAPI', 'Vector Database', 'OpenAI API'],
        skills_developed: ['Embeddings', 'Semantic Search', 'Prompt Engineering', 'API Serving'],
        main_objectives: 'Enable users to upload technical PDFs and converse with their contents accurately.',
        suggested_features: ['Chunking and vector indexing', 'Source citation highlights', 'Conversation memory'],
        estimated_effort: '30-35 hours'
      }
    ]
  },
  {
    title: 'DevOps / Cloud Engineer',
    description: 'Automates deployment pipelines, provisions infrastructure as code, monitors system reliability, and manages cloud infrastructure.',
    required_skills: ['Docker', 'Kubernetes', 'Linux', 'AWS', 'CI/CD', 'Git', 'Terraform', 'Bash'],
    recommended_projects: [
      {
        title: 'Automated CI/CD Pipeline & Containerized Deployment',
        difficulty: 'Intermediate',
        technologies: ['Docker', 'GitHub Actions', 'AWS ECS', 'Linux'],
        skills_developed: ['Automated Testing Pipeline', 'Container Optimization', 'Zero-Downtime Deployment'],
        main_objectives: 'Set up an automated workflow that runs tests, builds images, and deploys on pull request merge.',
        suggested_features: ['Lint & test validation steps', 'Multi-stage Docker caching', 'Health check monitoring'],
        estimated_effort: '20-25 hours'
      }
    ]
  },
  {
    title: 'UI/UX Designer',
    description: 'Conducts user research, crafts wireframes and interactive prototypes, and establishes accessible design systems.',
    required_skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Usability Testing'],
    recommended_projects: [
      {
        title: 'Accessible Mobile Health App Design System',
        difficulty: 'Intermediate',
        technologies: ['Figma', 'WCAG Guidelines', 'Interactive Components'],
        skills_developed: ['Design Tokens', 'Accessibility Standards', 'Component Variants'],
        main_objectives: 'Build a comprehensive design library with 30+ components and interactive flow.',
        suggested_features: ['High-contrast color modes', 'Interactive state prototypes', 'Design system specification sheet'],
        estimated_effort: '15-20 hours'
      }
    ]
  }
];

const CURATED_RESOURCES = [
  {
    title: 'MDN Web Docs — JavaScript Guide',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    topic: 'JavaScript',
    skill_name: 'JavaScript',
    resource_type: 'Documentation',
    difficulty: 'Beginner'
  },
  {
    title: 'React Official Documentation',
    url: 'https://react.dev/learn',
    topic: 'React',
    skill_name: 'React',
    resource_type: 'Documentation',
    difficulty: 'Beginner'
  },
  {
    title: 'Node.js Documentation and Guides',
    url: 'https://nodejs.org/docs/latest/api/',
    topic: 'Node.js',
    skill_name: 'Node.js',
    resource_type: 'Documentation',
    difficulty: 'Intermediate'
  },
  {
    title: 'PostgreSQL Official Documentation',
    url: 'https://www.postgresql.org/docs/current/tutorial.html',
    topic: 'PostgreSQL',
    skill_name: 'PostgreSQL',
    resource_type: 'Documentation',
    difficulty: 'Beginner'
  },
  {
    title: 'Express.js Getting Started Guide',
    url: 'https://expressjs.com/en/starter/installing.html',
    topic: 'Express',
    skill_name: 'Express',
    resource_type: 'Documentation',
    difficulty: 'Beginner'
  },
  {
    title: 'Tailwind CSS Documentation',
    url: 'https://tailwindcss.com/docs',
    topic: 'Tailwind CSS',
    skill_name: 'Tailwind CSS',
    resource_type: 'Documentation',
    difficulty: 'Beginner'
  },
  {
    title: 'Git Official Book & Documentation',
    url: 'https://git-scm.com/book/en/v2',
    topic: 'Git',
    skill_name: 'Git',
    resource_type: 'Documentation',
    difficulty: 'Beginner'
  },
  {
    title: 'Docker Getting Started Guide',
    url: 'https://docs.docker.com/get-started/',
    topic: 'Docker',
    skill_name: 'Docker',
    resource_type: 'Documentation',
    difficulty: 'Intermediate'
  },
  {
    title: 'TypeScript Official Handbook',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    topic: 'TypeScript',
    skill_name: 'TypeScript',
    resource_type: 'Documentation',
    difficulty: 'Intermediate'
  },
  {
    title: 'Python Official Tutorial',
    url: 'https://docs.python.org/3/tutorial/',
    topic: 'Python',
    skill_name: 'Python',
    resource_type: 'Documentation',
    difficulty: 'Beginner'
  }
];

async function seed() {
  console.log('🌱 Seeding career roles and curated resources...');

  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is not set.');
    process.exit(1);
  }

  let client;
  try {
    client = await pool.connect();
  } catch (connErr) {
    console.error(`\n❌ Could not connect to PostgreSQL server:`);
    console.error(`   ${connErr.message}`);
    console.error(`👉 Please ensure your PostgreSQL server is running or provide your cloud database URL in server/.env\n`);
    process.exit(1);
  }

  try {
    await client.query('BEGIN');

    // 1. Seed Career Roles
    for (const role of CAREER_ROLES) {
      await client.query(
        `
        INSERT INTO career_roles (title, description, required_skills, recommended_projects)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (title) DO UPDATE
        SET description = EXCLUDED.description,
            required_skills = EXCLUDED.required_skills,
            recommended_projects = EXCLUDED.recommended_projects;
        `,
        [role.title, role.description, role.required_skills, JSON.stringify(role.recommended_projects)]
      );
    }
    console.log(`✅ Seeded ${CAREER_ROLES.length} career roles.`);

    // 2. Seed Learning Resources
    for (const res of CURATED_RESOURCES) {
      await client.query(
        `
        INSERT INTO learning_resources (title, url, topic, skill_name, resource_type, difficulty)
        SELECT $1, $2, $3, $4, $5, $6
        WHERE NOT EXISTS (
          SELECT 1 FROM learning_resources WHERE url = $2
        );
        `,
        [res.title, res.url, res.topic, res.skill_name, res.resource_type, res.difficulty]
      );
    }
    console.log(`✅ Seeded ${CURATED_RESOURCES.length} learning resources.`);

    await client.query('COMMIT');
    console.log('🎉 Seeding completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

seed();
