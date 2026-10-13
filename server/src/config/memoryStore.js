import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.resolve(__dirname, '../../data/career_mentor_db.json');

const SEED_ROLES = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    title: 'Frontend Developer',
    description: 'Builds modern, responsive, and accessible user interfaces for web applications using HTML, CSS, JavaScript, and modern component frameworks.',
    required_skills: ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Tailwind CSS', 'Git', 'REST APIs'],
    recommended_projects: []
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    title: 'Backend Developer',
    description: 'Architects reliable server-side systems, manages databases, builds secure RESTful and GraphQL APIs, and handles authentication and caching.',
    required_skills: ['Node.js', 'Express', 'JavaScript', 'PostgreSQL', 'SQL', 'REST APIs', 'Git', 'Docker', 'Authentication'],
    recommended_projects: []
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    title: 'Full-Stack Developer',
    description: 'Bridging client and server development to deliver end-to-end web applications, from database schemas to polished user experiences.',
    required_skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'Git', 'REST APIs'],
    recommended_projects: []
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    title: 'Data Analyst',
    description: 'Transforms raw data into actionable business intelligence through statistical analysis, SQL querying, and interactive visual dashboards.',
    required_skills: ['SQL', 'Python', 'Pandas', 'Excel', 'Tableau', 'Data Visualization', 'Statistics'],
    recommended_projects: []
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    title: 'AI / Machine Learning Engineer',
    description: 'Designs, trains, evaluates, and deploys machine learning models and integrates Large Language Models (LLMs) into production software.',
    required_skills: ['Python', 'Machine Learning', 'PyTorch', 'TensorFlow', 'NLP', 'Git', 'Docker', 'REST APIs'],
    recommended_projects: []
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    title: 'DevOps / Cloud Engineer',
    description: 'Automates deployment pipelines, provisions infrastructure as code, monitors system reliability, and manages cloud infrastructure.',
    required_skills: ['Docker', 'Kubernetes', 'Linux', 'AWS', 'CI/CD', 'Git', 'Terraform', 'Bash'],
    recommended_projects: []
  },
  {
    id: '77777777-7777-4777-8777-777777777777',
    title: 'UI/UX Designer',
    description: 'Conducts user research, crafts wireframes and interactive prototypes, and establishes accessible design systems.',
    required_skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Usability Testing'],
    recommended_projects: []
  }
];

const SEED_RESOURCES = [
  // --- FRONTEND ---
  {
    id: 'res-fe-01',
    title: 'MDN Web Docs — Modern JavaScript Guide',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    topic: 'JavaScript',
    skill_name: 'JavaScript',
    category: 'Frontend',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'The authoritative reference for ECMAScript syntax, scope, closures, promises, and async/await.',
  },
  {
    id: 'res-fe-02',
    title: 'JavaScript.info — The Modern JavaScript Tutorial',
    url: 'https://javascript.info/',
    topic: 'JavaScript',
    skill_name: 'JavaScript',
    category: 'Frontend',
    resource_type: 'Interactive Tutorial',
    difficulty: 'Intermediate',
    description: 'In-depth guide from basics to advanced topics including event loops, prototypes, and memory management.',
  },
  {
    id: 'res-fe-03',
    title: 'Official TypeScript Handbook',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    topic: 'TypeScript',
    skill_name: 'TypeScript',
    category: 'Frontend',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'Master static typing, generics, utility types, and strict mode compiler configurations.',
  },
  {
    id: 'res-fe-04',
    title: 'Total TypeScript Interactive Tutorials',
    url: 'https://www.totaltypescript.com/tutorials',
    topic: 'TypeScript',
    skill_name: 'TypeScript',
    category: 'Frontend',
    resource_type: 'Interactive Tutorial',
    difficulty: 'Advanced',
    description: 'Hands-on interactive exercises solving real-world TypeScript type transformation challenges.',
  },
  {
    id: 'res-fe-05',
    title: 'React Official Documentation (react.dev)',
    url: 'https://react.dev/learn',
    topic: 'React',
    skill_name: 'React',
    category: 'Frontend',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Modern component-driven development, state hooks, effect lifecycles, and interactive examples.',
  },
  {
    id: 'res-fe-06',
    title: 'React Hooks & Built-in APIs Reference',
    url: 'https://react.dev/reference/react',
    topic: 'React',
    skill_name: 'React',
    category: 'Frontend',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'Comprehensive API specifications for useState, useEffect, useMemo, useCallback, and context.',
  },
  {
    id: 'res-fe-07',
    title: 'Next.js App Router Documentation',
    url: 'https://nextjs.org/docs',
    topic: 'Next.js',
    skill_name: 'Next.js',
    category: 'Frontend',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'Full-stack React framework with server components, streaming SSR, API routes, and asset optimization.',
  },
  {
    id: 'res-fe-08',
    title: 'Next.js Interactive Learn Course',
    url: 'https://nextjs.org/learn',
    topic: 'Next.js',
    skill_name: 'Next.js',
    category: 'Frontend',
    resource_type: 'Interactive Tutorial',
    difficulty: 'Beginner',
    description: 'Build a production-grade financial dashboard step-by-step from database to authentication.',
  },
  {
    id: 'res-fe-09',
    title: 'MDN HTML & CSS Fundamentals',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web',
    topic: 'HTML & CSS',
    skill_name: 'HTML',
    category: 'Frontend',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Semantic HTML markup, CSS box model, responsive layouts, Flexbox, and CSS Grid essentials.',
  },
  {
    id: 'res-fe-10',
    title: 'Tailwind CSS Documentation & Utility Reference',
    url: 'https://tailwindcss.com/docs',
    topic: 'Tailwind CSS',
    skill_name: 'Tailwind CSS',
    category: 'Frontend',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Utility-first CSS framework for rapid responsive design, dark mode, and design system integration.',
  },
  {
    id: 'res-fe-11',
    title: 'Vue.js 3 Official Guide',
    url: 'https://vuejs.org/guide/introduction.html',
    topic: 'Vue.js',
    skill_name: 'Vue.js',
    category: 'Frontend',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Progressive JavaScript framework featuring the Composition API, single-file components, and reactivity.',
  },
  {
    id: 'res-fe-12',
    title: 'Redux Toolkit Official Quick Start',
    url: 'https://redux-toolkit.js.org/introduction/getting-started',
    topic: 'Redux',
    skill_name: 'Redux',
    category: 'Frontend',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'Standard, opinionated way to write predictable state logic with RTK Query and slices.',
  },
  {
    id: 'res-fe-13',
    title: 'Vite Next-Generation Frontend Tooling',
    url: 'https://vitejs.dev/guide/',
    topic: 'Vite',
    skill_name: 'Vite',
    category: 'Frontend',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Ultra-fast native ESM dev server, lightning Hot Module Replacement (HMR), and Rollup production builds.',
  },

  // --- BACKEND ---
  {
    id: 'res-be-01',
    title: 'Node.js API & Architecture Guides',
    url: 'https://nodejs.org/docs/latest/api/',
    topic: 'Node.js',
    skill_name: 'Node.js',
    category: 'Backend',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'Official API reference for streams, buffers, file system, HTTP servers, and cluster clustering.',
  },
  {
    id: 'res-be-02',
    title: 'Production Node.js Best Practices Repository',
    url: 'https://github.com/goldbergyoni/nodebestpractices',
    topic: 'Node.js',
    skill_name: 'Node.js',
    category: 'Backend',
    resource_type: 'Curated Guide',
    difficulty: 'Advanced',
    description: 'Over 80 actionable industry best practices for robust architecture, error handling, and security.',
  },
  {
    id: 'res-be-03',
    title: 'Express.js Getting Started & Routing Guide',
    url: 'https://expressjs.com/en/starter/installing.html',
    topic: 'Express',
    skill_name: 'Express',
    category: 'Backend',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Fast, unopinionated, minimalist web framework for Node.js API development and middleware handling.',
  },
  {
    id: 'res-be-04',
    title: 'Python 3 Official Tutorial',
    url: 'https://docs.python.org/3/tutorial/index.html',
    topic: 'Python',
    skill_name: 'Python',
    category: 'Backend',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Python core concepts, standard library modules, object-oriented programming, and file operations.',
  },
  {
    id: 'res-be-05',
    title: 'Real Python In-Depth Tutorials & Learning Paths',
    url: 'https://realpython.com/',
    topic: 'Python',
    skill_name: 'Python',
    category: 'Backend',
    resource_type: 'Interactive Tutorial',
    difficulty: 'Intermediate',
    description: 'Practical, project-centric tutorials on virtual environments, decorators, generators, and testing.',
  },
  {
    id: 'res-be-06',
    title: 'FastAPI Interactive Tutorial & OpenAPI Docs',
    url: 'https://fastapi.tiangolo.com/tutorial/',
    topic: 'FastAPI',
    skill_name: 'FastAPI',
    category: 'Backend',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'Modern, high-performance web framework for Python 3.8+ APIs based on standard type hints and Pydantic.',
  },
  {
    id: 'res-be-07',
    title: 'Django Official Web Framework Tutorial',
    url: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/',
    topic: 'Django',
    skill_name: 'Django',
    category: 'Backend',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'The batteries-included Python framework for rapid development, ORM models, migrations, and admin portals.',
  },
  {
    id: 'res-be-08',
    title: 'Spring Boot Building a RESTful Web Service',
    url: 'https://spring.io/guides/gs/rest-service/',
    topic: 'Java',
    skill_name: 'Java',
    category: 'Backend',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'Build enterprise-grade Java web microservices with dependency injection and embedded servers.',
  },
  {
    id: 'res-be-09',
    title: 'A Tour of Go (Golang) Interactive Playground',
    url: 'https://go.dev/tour/welcome/1',
    topic: 'Go',
    skill_name: 'Go',
    category: 'Backend',
    resource_type: 'Interactive Tutorial',
    difficulty: 'Beginner',
    description: 'Interactive introduction to Go syntax, concurrency primitives (goroutines and channels), and interfaces.',
  },
  {
    id: 'res-be-10',
    title: 'Go by Example — Hands-on Code Patterns',
    url: 'https://gobyexample.com/',
    topic: 'Go',
    skill_name: 'Go',
    category: 'Backend',
    resource_type: 'Curated Guide',
    difficulty: 'Intermediate',
    description: 'Concise, annotated code examples covering web servers, JSON serialization, contexts, and mutexes.',
  },
  {
    id: 'res-be-11',
    title: 'GraphQL Official Introduction & Schema Guide',
    url: 'https://graphql.org/learn/',
    topic: 'GraphQL',
    skill_name: 'GraphQL',
    category: 'Backend',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'Query language for APIs providing exact data requirements, schema type definitions, and resolvers.',
  },
  {
    id: 'res-be-12',
    title: 'Apollo GraphQL Full-Stack Tutorials',
    url: 'https://www.apollographql.com/docs/',
    topic: 'GraphQL',
    skill_name: 'GraphQL',
    category: 'Backend',
    resource_type: 'Interactive Tutorial',
    difficulty: 'Intermediate',
    description: 'End-to-end guide on building GraphQL schemas with Apollo Server and integrating Apollo Client.',
  },
  {
    id: 'res-be-13',
    title: 'RESTful API Architectural Guidelines',
    url: 'https://restfulapi.net/',
    topic: 'REST APIs',
    skill_name: 'REST APIs',
    category: 'Backend',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Principles of REST: HTTP status codes, idempotency, versioning, pagination, and HATEOAS.',
  },

  // --- DATABASES & CACHING ---
  {
    id: 'res-db-01',
    title: 'PostgreSQL Official Tutorial & Reference',
    url: 'https://www.postgresql.org/docs/current/tutorial.html',
    topic: 'PostgreSQL',
    skill_name: 'PostgreSQL',
    category: 'Database',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Enterprise relational database tutorial: ACID transactions, foreign keys, window functions, and JSONB.',
  },
  {
    id: 'res-db-02',
    title: 'Use The Index, Luke! — SQL Indexing & Tuning',
    url: 'https://use-the-index-luke.com/',
    topic: 'SQL',
    skill_name: 'SQL',
    category: 'Database',
    resource_type: 'Curated Guide',
    difficulty: 'Advanced',
    description: 'A developer-focused guide explaining B-tree indexes, execution plans, join algorithms, and slow queries.',
  },
  {
    id: 'res-db-03',
    title: 'MongoDB University & Developer Manual',
    url: 'https://www.mongodb.com/docs/manual/',
    topic: 'MongoDB',
    skill_name: 'MongoDB',
    category: 'Database',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Document-oriented database concepts: BSON schemas, aggregation pipelines, and sharding strategies.',
  },
  {
    id: 'res-db-04',
    title: 'Redis Official Documentation & Data Structures',
    url: 'https://redis.io/docs/latest/',
    topic: 'Redis',
    skill_name: 'Redis',
    category: 'Database',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'High-speed in-memory store for distributed caching, session tracking, pub/sub messaging, and rate limiting.',
  },
  {
    id: 'res-db-05',
    title: 'SQLZoo Interactive SQL Practice Playground',
    url: 'https://sqlzoo.net/',
    topic: 'SQL',
    skill_name: 'SQL',
    category: 'Database',
    resource_type: 'Interactive Tutorial',
    difficulty: 'Beginner',
    description: 'Hands-on live SQL quizzes testing SELECT queries, JOINs, GROUP BY, aggregations, and subqueries.',
  },
  {
    id: 'res-db-06',
    title: 'Prisma ORM Getting Started Guide',
    url: 'https://www.prisma.io/docs/getting-started',
    topic: 'Prisma',
    skill_name: 'Prisma',
    category: 'Database',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Next-generation TypeScript ORM featuring type-safe client generation, migrations, and schema studio.',
  },

  // --- CLOUD, DEVOPS & INFRASTRUCTURE ---
  {
    id: 'res-ops-01',
    title: 'Docker Official Getting Started Guide',
    url: 'https://docs.docker.com/get-started/',
    topic: 'Docker',
    skill_name: 'Docker',
    category: 'DevOps & Cloud',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Container fundamentals: writing Dockerfiles, managing multi-stage builds, volumes, and port binding.',
  },
  {
    id: 'res-ops-02',
    title: 'Kubernetes Basics & Interactive Tutorials',
    url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
    topic: 'Kubernetes',
    skill_name: 'Kubernetes',
    category: 'DevOps & Cloud',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'Production container orchestration: pods, deployments, services, ingress controllers, and auto-scaling.',
  },
  {
    id: 'res-ops-03',
    title: 'AWS Skill Builder Cloud Practitioner Foundations',
    url: 'https://explore.skillbuilder.aws/',
    topic: 'AWS',
    skill_name: 'AWS',
    category: 'DevOps & Cloud',
    resource_type: 'Interactive Tutorial',
    difficulty: 'Beginner',
    description: 'Free official learning path covering EC2 instances, S3 storage buckets, Lambda serverless, and IAM roles.',
  },
  {
    id: 'res-ops-04',
    title: 'AWS Well-Architected Framework & Whitepapers',
    url: 'https://aws.amazon.com/architecture/',
    topic: 'AWS',
    skill_name: 'AWS',
    category: 'DevOps & Cloud',
    resource_type: 'Curated Guide',
    difficulty: 'Advanced',
    description: 'Architectural blueprints covering cloud reliability, cost optimization, operational excellence, and security.',
  },
  {
    id: 'res-ops-05',
    title: 'GitHub Actions Workflow Automation Docs',
    url: 'https://docs.github.com/en/actions',
    topic: 'CI/CD',
    skill_name: 'CI/CD',
    category: 'DevOps & Cloud',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Automate build, test, and deployment CI/CD pipelines with custom GitHub Action workflow triggers.',
  },
  {
    id: 'res-ops-06',
    title: 'Linux Journey — Free Interactive Linux Guide',
    url: 'https://linuxjourney.com/',
    topic: 'Linux',
    skill_name: 'Linux',
    category: 'DevOps & Cloud',
    resource_type: 'Interactive Tutorial',
    difficulty: 'Beginner',
    description: 'Master the bash shell, file permissions, processes, networking, systemd, and disk management.',
  },
  {
    id: 'res-ops-07',
    title: 'HashiCorp Terraform Infrastructure as Code Tutorials',
    url: 'https://developer.hashicorp.com/terraform/tutorials',
    topic: 'Terraform',
    skill_name: 'Terraform',
    category: 'DevOps & Cloud',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'Declare and automate cloud infrastructure across providers using HCL configuration modules.',
  },
  {
    id: 'res-ops-08',
    title: 'Pro Git Book (Complete Official Guide)',
    url: 'https://git-scm.com/book/en/v2',
    topic: 'Git',
    skill_name: 'Git',
    category: 'DevOps & Cloud',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Comprehensive guide to version control: branching strategies, merge conflicts, interactive rebasing, and internals.',
  },

  // --- AI, MACHINE LEARNING & DATA SCIENCE ---
  {
    id: 'res-ai-01',
    title: 'Google Machine Learning Crash Course',
    url: 'https://developers.google.com/machine-learning/crash-course',
    topic: 'Machine Learning',
    skill_name: 'Machine Learning',
    category: 'AI & Data',
    resource_type: 'Interactive Tutorial',
    difficulty: 'Beginner',
    description: 'Google self-study guide with video lectures, case studies, and hands-on TensorFlow practice exercises.',
  },
  {
    id: 'res-ai-02',
    title: 'Scikit-Learn Machine Learning in Python Guide',
    url: 'https://scikit-learn.org/stable/user_guide.html',
    topic: 'Machine Learning',
    skill_name: 'Machine Learning',
    category: 'AI & Data',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'Practical guide to classification, regression, clustering, dimensionality reduction, and model evaluation.',
  },
  {
    id: 'res-ai-03',
    title: 'PyTorch Official Deep Learning Tutorials',
    url: 'https://pytorch.org/tutorials/',
    topic: 'PyTorch',
    skill_name: 'PyTorch',
    category: 'AI & Data',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'Build neural networks with tensors, autograd differentiation, convolutional layers, and GPU acceleration.',
  },
  {
    id: 'res-ai-04',
    title: 'TensorFlow Core Step-by-Step Tutorials',
    url: 'https://www.tensorflow.org/tutorials',
    topic: 'TensorFlow',
    skill_name: 'TensorFlow',
    category: 'AI & Data',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'End-to-end machine learning platform guides covering Keras APIs, dataset pipelines, and model export.',
  },
  {
    id: 'res-ai-05',
    title: 'Pandas Official 10-Minute User Guide',
    url: 'https://pandas.pydata.org/docs/user_guide/10min.html',
    topic: 'Pandas',
    skill_name: 'Pandas',
    category: 'AI & Data',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Fast data manipulation and analysis with Series, DataFrames, indexing, filtering, and grouping.',
  },
  {
    id: 'res-ai-06',
    title: 'LangChain Python Documentation for LLM Apps',
    url: 'https://python.langchain.com/docs/get_started/introduction',
    topic: 'LangChain',
    skill_name: 'LangChain',
    category: 'AI & Data',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'Framework for developing applications powered by language models, agents, memory, and vector stores.',
  },
  {
    id: 'res-ai-07',
    title: 'Hugging Face NLP & Transformers Course',
    url: 'https://huggingface.co/learn/nlp-course',
    topic: 'NLP',
    skill_name: 'NLP',
    category: 'AI & Data',
    resource_type: 'Interactive Tutorial',
    difficulty: 'Intermediate',
    description: 'Free comprehensive course on fine-tuning open-source LLMs, tokenization, embeddings, and pipeline inference.',
  },

  // --- CORE CS, SYSTEM DESIGN & QUALITY ---
  {
    id: 'res-cs-01',
    title: 'NeetCode Curated DSA Roadmap & Blind 75',
    url: 'https://neetcode.io/roadmap',
    topic: 'Data Structures & Algorithms',
    skill_name: 'Data Structures',
    category: 'Core CS & System Design',
    resource_type: 'Interactive Tutorial',
    difficulty: 'Intermediate',
    description: 'Visual roadmap for coding interview problem patterns: two pointers, binary search, sliding window, and graphs.',
  },
  {
    id: 'res-cs-02',
    title: 'Visualgo — Visualising Data Structures and Algorithms',
    url: 'https://visualgo.net/en',
    topic: 'Data Structures & Algorithms',
    skill_name: 'Algorithms',
    category: 'Core CS & System Design',
    resource_type: 'Interactive Tutorial',
    difficulty: 'Beginner',
    description: 'Animated step-by-step visualizations of sorting algorithms, binary search trees, hash tables, and graph traversals.',
  },
  {
    id: 'res-cs-03',
    title: 'System Design Primer (GitHub — Donne Martin)',
    url: 'https://github.com/donnemartin/system-design-primer',
    topic: 'System Design',
    skill_name: 'System Design',
    category: 'Core CS & System Design',
    resource_type: 'Curated Guide',
    difficulty: 'Advanced',
    description: 'An open-source primer covering scalability, load balancing, caching tiers, message queues, and CAP theorem.',
  },
  {
    id: 'res-cs-04',
    title: 'ByteByteGo System Design Architecture Blog',
    url: 'https://bytebytego.com/',
    topic: 'System Design',
    skill_name: 'System Design',
    category: 'Core CS & System Design',
    resource_type: 'Curated Guide',
    difficulty: 'Intermediate',
    description: 'Clear visual breakdowns of large-scale systems: YouTube, URL shorteners, distributed rate limiters, and payment APIs.',
  },
  {
    id: 'res-cs-05',
    title: 'Refactoring.Guru Software Design Patterns',
    url: 'https://refactoring.guru/design-patterns',
    topic: 'Design Patterns',
    skill_name: 'Design Patterns',
    category: 'Core CS & System Design',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'Visual explanations of Creational, Structural, and Behavioral design patterns with code examples in multiple languages.',
  },

  // --- TESTING, QUALITY & SECURITY ---
  {
    id: 'res-qa-01',
    title: 'Jest JavaScript Testing Framework Docs',
    url: 'https://jestjs.io/docs/getting-started',
    topic: 'Jest',
    skill_name: 'Testing',
    category: 'Testing & Tools',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Delightful testing with zero config, mocking functions, snapshot tests, and coverage reporting.',
  },
  {
    id: 'res-qa-02',
    title: 'Cypress End-to-End Modern Web Testing',
    url: 'https://docs.cypress.io/guides/overview/why-cypress',
    topic: 'Cypress',
    skill_name: 'Testing',
    category: 'Testing & Tools',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'Next-generation browser testing for frontends with time travel debugging, real-time reloads, and network interception.',
  },
  {
    id: 'res-sec-01',
    title: 'OWASP Top 10 Web Application Vulnerabilities',
    url: 'https://owasp.org/www-project-top-ten/',
    topic: 'Cybersecurity',
    skill_name: 'Security',
    category: 'Testing & Tools',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'Standard security awareness document for developers: Broken Access Control, Injection, and Cryptographic Failures.',
  },
  {
    id: 'res-sec-02',
    title: 'PortSwigger Web Security Academy',
    url: 'https://portswigger.net/web-security',
    topic: 'Cybersecurity',
    skill_name: 'Security',
    category: 'Testing & Tools',
    resource_type: 'Interactive Tutorial',
    difficulty: 'Intermediate',
    description: 'Free, interactive online training on web security and ethical hacking with interactive lab environments.',
  },

  // --- MOBILE & UI/UX ---
  {
    id: 'res-mob-01',
    title: 'React Native Official Documentation',
    url: 'https://reactnative.dev/docs/getting-started',
    topic: 'React Native',
    skill_name: 'React Native',
    category: 'Mobile & UI',
    resource_type: 'Documentation',
    difficulty: 'Intermediate',
    description: 'Create truly native mobile applications for iOS and Android using React and JavaScript.',
  },
  {
    id: 'res-mob-02',
    title: 'Flutter Official Documentation & Codelabs',
    url: 'https://docs.flutter.dev/',
    topic: 'Flutter',
    skill_name: 'Flutter',
    category: 'Mobile & UI',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Multi-platform UI toolkit by Google for crafting natively compiled apps from a single Dart codebase.',
  },
  {
    id: 'res-mob-03',
    title: 'Figma Official Learn Design & UI Systems',
    url: 'https://help.figma.com/hc/en-us/categories/360002051613-Learn-design',
    topic: 'Figma',
    skill_name: 'Figma',
    category: 'Mobile & UI',
    resource_type: 'Documentation',
    difficulty: 'Beginner',
    description: 'Collaborative interface design tool tutorials: auto-layout, component variants, and design token systems.',
  }
];

class MemoryStore {
  constructor() {
    this.users = [];
    this.profiles = [];
    this.career_roles = SEED_ROLES.map((r) => ({ ...r }));
    this.roadmaps = [];
    this.roadmap_tasks = [];
    this.chat_conversations = [];
    this.chat_messages = [];
    this.resume_analyses = [];
    this.mock_interviews = [];
    this.learning_resources = SEED_RESOURCES.map((res) => ({ ...res }));
    this.job_applications = [];
    this.study_sessions = [];
    this.user_projects = [];

    this.storageFilePath = DB_FILE_PATH;
    this.loadFromDisk();
  }

  saveToDisk() {
    try {
      const data = {
        users: this.users,
        profiles: this.profiles,
        roadmaps: this.roadmaps,
        roadmap_tasks: this.roadmap_tasks,
        chat_conversations: this.chat_conversations,
        chat_messages: this.chat_messages,
        resume_analyses: this.resume_analyses,
        mock_interviews: this.mock_interviews,
        learning_resources: this.learning_resources,
        job_applications: this.job_applications,
        study_sessions: this.study_sessions,
        user_projects: this.user_projects,
      };
      const dir = path.dirname(this.storageFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.storageFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.warn('[MemoryStore] Could not persist to disk:', err.message);
    }
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(this.storageFilePath)) {
        const raw = fs.readFileSync(this.storageFilePath, 'utf8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.users)) this.users = data.users;
        if (Array.isArray(data.profiles)) this.profiles = data.profiles;
        if (Array.isArray(data.roadmaps)) this.roadmaps = data.roadmaps;
        if (Array.isArray(data.roadmap_tasks)) this.roadmap_tasks = data.roadmap_tasks;
        if (Array.isArray(data.chat_conversations)) this.chat_conversations = data.chat_conversations;
        if (Array.isArray(data.chat_messages)) this.chat_messages = data.chat_messages;
        if (Array.isArray(data.resume_analyses)) this.resume_analyses = data.resume_analyses;
        if (Array.isArray(data.mock_interviews)) this.mock_interviews = data.mock_interviews;
        if (Array.isArray(data.learning_resources) && data.learning_resources.length > 0) {
          const seedIds = new Set(SEED_RESOURCES.map((s) => s.id));
          const customResources = data.learning_resources.filter((r) => !seedIds.has(r.id));
          this.learning_resources = [...SEED_RESOURCES.map((r) => ({ ...r })), ...customResources];
        } else {
          this.learning_resources = SEED_RESOURCES.map((r) => ({ ...r }));
        }
        if (Array.isArray(data.job_applications)) this.job_applications = data.job_applications;
        if (Array.isArray(data.study_sessions)) this.study_sessions = data.study_sessions;
        if (Array.isArray(data.user_projects)) this.user_projects = data.user_projects;
        const adminUser = this.users.find((u) => u.email === 'admin@example.com');
        if (adminUser && adminUser.password_hash === '$2a$10$r8v0wF/z3bF7s2kI3mK0vG2aP1vR0rF8bM2UqN7eP9qO1vR0rF8bM') {
          adminUser.password_hash = '$2a$10$VmXSYj2.G.nZ10.LKQouj.h/mD43ArVq.vu9TAzL7Ie9HAdAuyJEa';
          this.saveToDisk();
        }
        console.log(`[Storage] Persistent database loaded from disk (${this.users.length} users, ${this.roadmaps.length} roadmaps).`);
      } else {
        // Initial setup with a pre-configured demo admin account ($2a$10$w... bcrypt for Password123!)
        this.users = [
          {
            id: '00000000-0000-4000-8000-000000000001',
            name: 'Admin',
            email: 'admin@example.com',
            password_hash: '$2a$10$VmXSYj2.G.nZ10.LKQouj.h/mD43ArVq.vu9TAzL7Ie9HAdAuyJEa',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ];
        this.profiles = [
          {
            id: '00000000-0000-4000-8000-000000000002',
            user_id: '00000000-0000-4000-8000-000000000001',
            education: 'Computer Science',
            degree: 'Bachelor of Technology',
            skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
            interests: ['Full-Stack Development', 'AI Systems'],
            experience_level: 'Beginner',
            target_career: 'Full-Stack Developer',
            career_goals: 'Master Full-Stack Engineering & AI Systems',
            learning_preferences: 'Hands-on projects',
            weekly_study_hours: 15,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ];
        this.saveToDisk();
      }
    } catch (err) {
      console.warn('[MemoryStore] Could not load from disk:', err.message);
    }
  }

  async execute(sql, params = []) {
    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    const lower = cleanSql.toLowerCase();
    const isMutation = lower.startsWith('insert ') || lower.startsWith('update ') || lower.startsWith('delete ');

    const result = await this._handleQuery(cleanSql, lower, params);

    if (isMutation) {
      this.saveToDisk();
    }

    return result;
  }

  async _handleQuery(cleanSql, lower, params = []) {

    // Health / Time check
    if (lower.includes('select now()')) {
      return { rows: [{ current_time: new Date().toISOString() }], rowCount: 1 };
    }

    // 1. USERS
    if (lower.startsWith('select id from users where email = $1')) {
      const email = (params[0] || '').toLowerCase();
      const user = this.users.find((u) => u.email.toLowerCase() === email);
      return { rows: user ? [{ id: user.id }] : [], rowCount: user ? 1 : 0 };
    }

    if (lower.startsWith('select id, name, email, password_hash, created_at from users where email = $1')) {
      const email = (params[0] || '').toLowerCase();
      const user = this.users.find((u) => u.email.toLowerCase() === email);
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }

    if (lower.startsWith('insert into users')) {
      const [name, email, password_hash] = params;
      const newUser = {
        id: crypto.randomUUID(),
        name,
        email: email.toLowerCase(),
        password_hash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.users.push(newUser);
      return {
        rows: [{ id: newUser.id, name: newUser.name, email: newUser.email, created_at: newUser.created_at }],
        rowCount: 1,
      };
    }

    if (lower.includes('from users u left join profiles p on u.id = p.user_id where u.id = $1')) {
      const userId = params[0];
      const user = this.users.find((u) => u.id === userId);
      if (!user) return { rows: [], rowCount: 0 };
      const profile = this.profiles.find((p) => p.user_id === userId) || {};
      return {
        rows: [
          {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at,
            education: profile.education || '',
            degree: profile.degree || '',
            skills: profile.skills || [],
            interests: profile.interests || [],
            experience_level: profile.experience_level || 'Beginner',
            target_career: profile.target_career || '',
            career_goals: profile.career_goals || '',
            learning_preferences: profile.learning_preferences || 'Hands-on projects',
            weekly_study_hours: profile.weekly_study_hours || 10,
          },
        ],
        rowCount: 1,
      };
    }

    // 2. PROFILES
    if (lower.startsWith('insert into profiles (user_id) values ($1)')) {
      const userId = params[0];
      let profile = this.profiles.find((p) => p.user_id === userId);
      if (!profile) {
        profile = {
          id: crypto.randomUUID(),
          user_id: userId,
          education: '',
          degree: '',
          skills: [],
          interests: [],
          experience_level: 'Beginner',
          target_career: 'Full-Stack Developer',
          career_goals: '',
          learning_preferences: 'Hands-on projects',
          weekly_study_hours: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        this.profiles.push(profile);
      }
      return { rows: [profile], rowCount: 1 };
    }

    if (lower.startsWith('select id, user_id, education') && lower.includes('from profiles where user_id = $1')) {
      const profile = this.profiles.find((p) => p.user_id === params[0]);
      return { rows: profile ? [profile] : [], rowCount: profile ? 1 : 0 };
    }

    if (lower.startsWith('select * from profiles where user_id = $1') || lower.startsWith('select skills from profiles where user_id = $1') || lower.startsWith('select target_career, skills from profiles where user_id = $1') || lower.startsWith('select weekly_study_hours from profiles where user_id = $1')) {
      const profile = this.profiles.find((p) => p.user_id === params[0]) || {
        education: '',
        degree: '',
        skills: [],
        interests: [],
        experience_level: 'Beginner',
        target_career: 'Full-Stack Developer',
        weekly_study_hours: 10,
      };
      return { rows: [profile], rowCount: 1 };
    }

    if (lower.includes('insert into profiles') && lower.includes('on conflict (user_id) do update')) {
      const [
        user_id, education, degree, skills, interests,
        experience_level, target_career, career_goals,
        learning_preferences, weekly_study_hours
      ] = params;

      let profile = this.profiles.find((p) => p.user_id === user_id);
      if (profile) {
        Object.assign(profile, {
          education, degree, skills, interests,
          experience_level, target_career, career_goals,
          learning_preferences, weekly_study_hours,
          updated_at: new Date().toISOString(),
        });
      } else {
        profile = {
          id: crypto.randomUUID(),
          user_id, education, degree, skills, interests,
          experience_level, target_career, career_goals,
          learning_preferences, weekly_study_hours,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        this.profiles.push(profile);
      }
      return { rows: [profile], rowCount: 1 };
    }

    // 3. CAREER ROLES
    if (lower.includes('from career_roles where lower(title) = lower($1)')) {
      const title = (params[0] || '').trim().toLowerCase();
      const role = this.career_roles.find((r) => r.title.trim().toLowerCase() === title);
      return { rows: role ? [role] : [], rowCount: role ? 1 : 0 };
    }

    if (lower.includes('from career_roles where id = $1') || lower.startsWith('select * from career_roles where id = $1')) {
      const role = this.career_roles.find((r) => r.id === params[0]);
      return { rows: role ? [role] : [], rowCount: role ? 1 : 0 };
    }

    if (lower.startsWith('select * from career_roles')) {
      return { rows: this.career_roles, rowCount: this.career_roles.length };
    }

    // 4. ROADMAPS & TASKS
    if (lower.startsWith('insert into roadmaps')) {
      const [user_id, career_role_id, career_title, roadmap_data_str] = params;
      const roadmap_data = typeof roadmap_data_str === 'string' ? JSON.parse(roadmap_data_str) : roadmap_data_str;
      const newRoadmap = {
        id: crypto.randomUUID(),
        user_id,
        career_role_id,
        career_title,
        roadmap_data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.roadmaps.push(newRoadmap);
      return { rows: [newRoadmap], rowCount: 1 };
    }

    if (lower.startsWith('insert into roadmap_tasks')) {
      const [roadmap_id, title, description, phase_name, phase_order, estimated_hours] = params;
      const newTask = {
        id: crypto.randomUUID(),
        roadmap_id,
        title,
        description,
        phase_name,
        phase_order,
        status: 'Not Started',
        estimated_hours: estimated_hours || 5,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.roadmap_tasks.push(newTask);
      return { rows: [newTask], rowCount: 1 };
    }

    if (lower.includes('from roadmap_tasks') && lower.includes("status != 'completed'")) {
      const pending = this.roadmap_tasks
        .filter((t) => t.roadmap_id === params[0] && t.status !== 'Completed')
        .sort((a, b) => a.phase_order - b.phase_order);
      return { rows: pending.slice(0, 1), rowCount: Math.min(pending.length, 1) };
    }

    if (lower.includes('from roadmap_tasks where roadmap_id = $1')) {
      const tasks = this.roadmap_tasks
        .filter((t) => t.roadmap_id === params[0])
        .sort((a, b) => a.phase_order - b.phase_order);
      return { rows: tasks, rowCount: tasks.length };
    }

    if (lower.includes('count(t.id) as total_tasks') && lower.includes('from roadmaps r')) {
      const userId = params[0];
      const userRoadmaps = this.roadmaps
        .filter((r) => r.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const rows = userRoadmaps.map((r) => {
        const tasks = this.roadmap_tasks.filter((t) => t.roadmap_id === r.id);
        const completed = tasks.filter((t) => t.status === 'Completed').length;
        return {
          id: r.id,
          career_title: r.career_title,
          roadmap_data: r.roadmap_data,
          created_at: r.created_at,
          updated_at: r.updated_at,
          total_tasks: tasks.length,
          completed_tasks: completed,
        };
      });
      return { rows, rowCount: rows.length };
    }

    if (lower.startsWith('select * from roadmaps where id = $1 and user_id = $2')) {
      const rm = this.roadmaps.find((r) => r.id === params[0] && r.user_id === params[1]);
      return { rows: rm ? [rm] : [], rowCount: rm ? 1 : 0 };
    }

    if (lower.startsWith('select id from roadmaps where id = $1 and user_id = $2')) {
      const rm = this.roadmaps.find((r) => r.id === params[0] && r.user_id === params[1]);
      return { rows: rm ? [{ id: rm.id }] : [], rowCount: rm ? 1 : 0 };
    }

    if (lower.startsWith('update roadmap_tasks')) {
      const [status, completed_at, taskId, roadmapId] = params;
      const task = this.roadmap_tasks.find((t) => t.id === taskId && t.roadmap_id === roadmapId);
      if (task) {
        task.status = status;
        task.completed_at = completed_at;
        task.updated_at = new Date().toISOString();
        return { rows: [task], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    if (lower.includes('count(id) as total') && lower.includes('from roadmap_tasks where roadmap_id = $1')) {
      const tasks = this.roadmap_tasks.filter((t) => t.roadmap_id === params[0]);
      const completed = tasks.filter((t) => t.status === 'Completed').length;
      return { rows: [{ total: tasks.length, completed }], rowCount: 1 };
    }

    if (lower.startsWith('delete from roadmaps where id = $1 and user_id = $2')) {
      const idx = this.roadmaps.findIndex((r) => r.id === params[0] && r.user_id === params[1]);
      if (idx !== -1) {
        this.roadmaps.splice(idx, 1);
        this.roadmap_tasks = this.roadmap_tasks.filter((t) => t.roadmap_id !== params[0]);
        return { rows: [{ id: params[0] }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // 5. CHAT CONVERSATIONS & MESSAGES
    if (lower.includes('from chat_conversations') && (lower.includes('user_id = $1') || lower.includes('c.user_id = $1'))) {
      const convs = this.chat_conversations
        .filter((c) => c.user_id === params[0])
        .map((c) => {
          const msgs = this.chat_messages.filter((m) => m.conversation_id === c.id);
          const lastMsg = msgs[msgs.length - 1]?.content || null;
          return { ...c, last_message: lastMsg };
        });
      if (lower.includes('limit 3')) {
        return { rows: convs.slice(0, 3), rowCount: Math.min(convs.length, 3) };
      }
      return { rows: convs, rowCount: convs.length };
    }

    if (lower.startsWith('insert into chat_conversations')) {
      const [user_id, title] = params;
      const newConv = {
        id: crypto.randomUUID(),
        user_id,
        title: title || 'New Career Mentorship',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.chat_conversations.unshift(newConv);
      return { rows: [newConv], rowCount: 1 };
    }

    if (lower.startsWith('select id, title from chat_conversations where id = $1 and user_id = $2')) {
      const conv = this.chat_conversations.find((c) => c.id === params[0] && c.user_id === params[1]);
      return { rows: conv ? [{ id: conv.id, title: conv.title }] : [], rowCount: conv ? 1 : 0 };
    }

    if (lower.includes('from chat_messages where conversation_id = $1')) {
      const msgs = this.chat_messages.filter((m) => m.conversation_id === params[0]);
      return { rows: msgs, rowCount: msgs.length };
    }

    if (lower.startsWith('insert into chat_messages')) {
      let conversation_id, role, content;
      if (params.length === 3) {
        [conversation_id, role, content] = params;
      } else {
        [conversation_id, content] = params;
        role = lower.includes("'assistant'") ? 'assistant' : 'user';
      }
      const newMsg = {
        id: crypto.randomUUID(),
        conversation_id,
        role: role || 'user',
        content: content || '',
        created_at: new Date().toISOString(),
      };
      this.chat_messages.push(newMsg);
      return { rows: [newMsg], rowCount: 1 };
    }

    if (lower.startsWith('update chat_conversations')) {
      const [content, id] = params;
      const conv = this.chat_conversations.find((c) => c.id === id);
      if (conv) {
        conv.updated_at = new Date().toISOString();
        if (conv.title === 'New Career Mentorship') {
          conv.title = content.slice(0, 40);
        }
      }
      return { rows: [], rowCount: 1 };
    }

    if (lower.startsWith('delete from chat_conversations where id = $1 and user_id = $2')) {
      const idx = this.chat_conversations.findIndex((c) => c.id === params[0] && c.user_id === params[1]);
      if (idx !== -1) {
        this.chat_conversations.splice(idx, 1);
        this.chat_messages = this.chat_messages.filter((m) => m.conversation_id !== params[0]);
        return { rows: [{ id: params[0] }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // 6. RESUME ANALYSES
    if (lower.startsWith('insert into resume_analyses')) {
      const [user_id, target_role, analysis_result_str] = params;
      const analysis_result = typeof analysis_result_str === 'string' ? JSON.parse(analysis_result_str) : analysis_result_str;
      const newAna = {
        id: crypto.randomUUID(),
        user_id,
        target_role,
        analysis_result,
        created_at: new Date().toISOString(),
      };
      this.resume_analyses.unshift(newAna);
      return {
        rows: [{ id: newAna.id, target_role: newAna.target_role, analysis_result: newAna.analysis_result, created_at: newAna.created_at }],
        rowCount: 1,
      };
    }

    if (lower.includes('from resume_analyses where user_id = $1')) {
      const list = this.resume_analyses.filter((a) => a.user_id === params[0]).map((a) => ({
        id: a.id,
        target_role: a.target_role,
        overall_score: a.analysis_result?.overallScore || 75,
        created_at: a.created_at,
      }));
      return { rows: list, rowCount: list.length };
    }

    if (lower.startsWith('select * from resume_analyses where id = $1 and user_id = $2')) {
      const item = this.resume_analyses.find((a) => a.id === params[0] && a.user_id === params[1]);
      return { rows: item ? [item] : [], rowCount: item ? 1 : 0 };
    }

    if (lower.startsWith('delete from resume_analyses where id = $1 and user_id = $2')) {
      const idx = this.resume_analyses.findIndex((a) => a.id === params[0] && a.user_id === params[1]);
      if (idx !== -1) {
        this.resume_analyses.splice(idx, 1);
        return { rows: [{ id: params[0] }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // 7. MOCK INTERVIEWS
    if (lower.startsWith('insert into mock_interviews')) {
      const [user_id, target_role, difficulty, interview_data_str] = params;
      const interview_data = typeof interview_data_str === 'string' ? JSON.parse(interview_data_str) : interview_data_str;
      const newInt = {
        id: crypto.randomUUID(),
        user_id,
        target_role,
        difficulty,
        interview_data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.mock_interviews.unshift(newInt);
      return { rows: [newInt], rowCount: 1 };
    }

    if (lower.includes('from mock_interviews where user_id = $1')) {
      const list = this.mock_interviews.filter((i) => i.user_id === params[0]).map((i) => ({
        id: i.id,
        target_role: i.target_role,
        difficulty: i.difficulty,
        status: i.interview_data?.status || 'In Progress',
        created_at: i.created_at,
        updated_at: i.updated_at,
      }));
      return { rows: list, rowCount: list.length };
    }

    if (lower.startsWith('select * from mock_interviews where id = $1 and user_id = $2')) {
      const item = this.mock_interviews.find((i) => i.id === params[0] && i.user_id === params[1]);
      return { rows: item ? [item] : [], rowCount: item ? 1 : 0 };
    }

    if (lower.startsWith('update mock_interviews set interview_data = $1')) {
      const [interview_data_str, id, user_id] = params;
      const interview_data = typeof interview_data_str === 'string' ? JSON.parse(interview_data_str) : interview_data_str;
      const item = this.mock_interviews.find((i) => i.id === id && i.user_id === user_id);
      if (item) {
        item.interview_data = interview_data;
        item.updated_at = new Date().toISOString();
        return { rows: [item], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // 8. LEARNING RESOURCES
    if (lower.startsWith('select * from learning_resources')) {
      let list = [...this.learning_resources];
      if (params.length > 0 && params[0]) {
        const filter = params[0].replace(/%/g, '').toLowerCase();
        list = list.filter((r) =>
          r.skill_name?.toLowerCase().includes(filter) ||
          r.topic?.toLowerCase().includes(filter) ||
          r.title?.toLowerCase().includes(filter) ||
          r.category?.toLowerCase().includes(filter) ||
          r.description?.toLowerCase().includes(filter)
        );
      }
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      return { rows: list, rowCount: list.length };
    }

    if (lower.startsWith('insert into learning_resources')) {
      const [title, url, topic, skill_name, category, resource_type, difficulty, description] = params;
      const newRes = {
        id: crypto.randomUUID(),
        title: title || 'Resource',
        url: url || '#',
        topic: topic || skill_name || 'General',
        skill_name: skill_name || topic || 'General',
        category: category || 'General',
        resource_type: resource_type || 'Documentation',
        difficulty: difficulty || 'Beginner',
        description: description || '',
        created_at: new Date().toISOString(),
      };
      this.learning_resources.unshift(newRes);
      this.saveToDisk();
      return { rows: [newRes], rowCount: 1 };
    }

    // 9. JOB APPLICATIONS
    if (lower.startsWith('select * from job_applications where user_id = $1')) {
      const list = this.job_applications.filter((a) => a.user_id === params[0]);
      return { rows: list, rowCount: list.length };
    }

    if (lower.startsWith('insert into job_applications')) {
      const [user_id, company, position, location, status, salary, applied_date, notes] = params;
      const newApp = {
        id: crypto.randomUUID(),
        user_id,
        company,
        position,
        location: location || 'Remote',
        status: status || 'Applied',
        salary: salary || '',
        applied_date: applied_date || new Date().toISOString().split('T')[0],
        notes: notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.job_applications.unshift(newApp);
      return { rows: [newApp], rowCount: 1 };
    }

    if (lower.startsWith('select id from job_applications where id = $1 and user_id = $2')) {
      const app = this.job_applications.find((a) => a.id === params[0] && a.user_id === params[1]);
      return { rows: app ? [{ id: app.id }] : [], rowCount: app ? 1 : 0 };
    }

    if (lower.startsWith('update job_applications')) {
      const [company, position, location, status, salary, applied_date, notes, id, user_id] = params;
      const app = this.job_applications.find((a) => a.id === id && a.user_id === user_id);
      if (app) {
        if (company) app.company = company;
        if (position) app.position = position;
        if (location) app.location = location;
        if (status) app.status = status;
        if (salary !== undefined) app.salary = salary;
        if (applied_date) app.applied_date = applied_date;
        if (notes !== undefined) app.notes = notes;
        app.updated_at = new Date().toISOString();
        return { rows: [app], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    if (lower.startsWith('delete from job_applications where id = $1 and user_id = $2')) {
      const idx = this.job_applications.findIndex((a) => a.id === params[0] && a.user_id === params[1]);
      if (idx !== -1) {
        this.job_applications.splice(idx, 1);
        return { rows: [{ id: params[0] }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // 10. STUDY SESSIONS
    if (lower.startsWith('select * from study_sessions where user_id = $1')) {
      const list = this.study_sessions.filter((s) => s.user_id === params[0]);
      return { rows: list, rowCount: list.length };
    }

    if (lower.startsWith('insert into study_sessions')) {
      const [user_id, subject, duration_minutes, completed] = params;
      const newSession = {
        id: crypto.randomUUID(),
        user_id,
        subject,
        duration_minutes: duration_minutes || 60,
        completed: completed ?? true,
        session_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };
      this.study_sessions.unshift(newSession);
      this.saveToDisk();
      return { rows: [newSession], rowCount: 1 };
    }

    // 11. USER PROJECTS
    if (lower.startsWith('select * from user_projects where user_id = $1')) {
      const list = this.user_projects.filter((p) => p.user_id === params[0]);
      return { rows: list, rowCount: list.length };
    }

    if (lower.startsWith('insert into user_projects')) {
      const [user_id, title, difficulty, technologies, skills_developed, main_objectives, suggested_features, estimated_effort] = params;
      const newProj = {
        id: crypto.randomUUID(),
        user_id,
        title,
        difficulty: difficulty || 'Intermediate',
        technologies: Array.isArray(technologies) ? technologies : [],
        skills_developed: Array.isArray(skills_developed) ? skills_developed : [],
        main_objectives: main_objectives || '',
        suggested_features: Array.isArray(suggested_features) ? suggested_features : [],
        estimated_effort: estimated_effort || '15-20 hours',
        created_at: new Date().toISOString(),
      };
      this.user_projects.unshift(newProj);
      this.saveToDisk();
      return { rows: [newProj], rowCount: 1 };
    }

    if (lower.startsWith('delete from user_projects where id = $1 and user_id = $2')) {
      const idx = this.user_projects.findIndex((p) => p.id === params[0] && p.user_id === params[1]);
      if (idx !== -1) {
        this.user_projects.splice(idx, 1);
        this.saveToDisk();
        return { rows: [{ id: params[0] }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // Fallback default
    return { rows: [], rowCount: 0 };
  }
}

export const memoryStore = new MemoryStore();
export default memoryStore;
