import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { z } from 'zod';
import { generateOfflineStudyResponse } from './studyMentorEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

// Helper to persist keys directly into server/.env on disk
function persistEnvVars(updates = {}) {
  try {
    let content = '';
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, 'utf8');
    }
    for (const [key, val] of Object.entries(updates)) {
      process.env[key] = val;
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(content)) {
        content = content.replace(regex, `${key}=${val}`);
      } else {
        content += `\n${key}=${val}`;
      }
    }
    fs.writeFileSync(envPath, content, 'utf8');
  } catch (err) {
    console.warn('[AI Service] Note: Could not persist to .env file:', err.message);
  }
}

// Helper to extract JSON from markdown code blocks
const extractJson = (text) => {
  if (!text) return null;
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```/, '').replace(/```$/, '').trim();
  }
  try {
    return JSON.parse(clean);
  } catch {
    const jsonMatch = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
};

// Detect simple greetings where the user is just saying hello
function isSimpleGreeting(text) {
  if (!text) return false;
  const clean = text.trim().toLowerCase().replace(/[!.,?]+$/, '').trim();

  // Single or short greeting phrases
  const greetings = [
    'hi', 'hello', 'hey', 'heyy', 'heyyy', 'hiya', 'howdy', 'sup', 'yo', 'hola',
    'just hi', 'just hello', 'just hey',
    'good morning', 'good afternoon', 'good evening', 'good day',
    'hi there', 'hello there', 'hey there',
    'hi mentor', 'hello mentor', 'hey mentor',
    'hi ai', 'hello ai', 'hey ai',
    'greetings', 'namaste'
  ];
  if (greetings.includes(clean)) return true;

  if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening))\s*,?\s*(how are you|how are you doing|how r u|how is it going|how's it going|how are things)[\s?.]*$/i.test(clean)) {
    return true;
  }

  const words = clean.split(/\s+/);
  if (words.length <= 3 && words.every((w) => ['hi', 'hello', 'hey', 'there', 'mentor', 'ai', 'just', 'good', 'morning', 'afternoon', 'evening', 'howdy', 'yo'].includes(w))) {
    return true;
  }

  return false;
}

// Strictly detect off-topic topics unrelated to computer science, programming, projects, or study
function isDefinitelyOffTopic(text) {
  if (!text) return false;
  const lower = text.toLowerCase().trim();

  // If query contains any tech, computer science, project, or learning keywords, it is in scope
  const inScopeKeywords = [
    'code', 'coding', 'program', 'programming', 'software', 'developer', 'engineer',
    'computer', 'algorithm', 'data structure', 'dsa', 'react', 'node', 'python', 'java',
    'c++', 'javascript', 'typescript', 'sql', 'database', 'dbms', 'api', 'backend',
    'frontend', 'fullstack', 'full-stack', 'system design', 'operating system', 'network',
    'project', 'portfolio', 'resume', 'intern', 'internship', 'interview', 'study',
    'learn', 'homework', 'exam', 'career', 'roadmap', 'framework', 'git', 'docker',
    'cloud', 'aws', 'linux', 'oop', 'web', 'app', 'html', 'css', 'bug', 'debug',
    'test', 'testing', 'class', 'method', 'variable', 'function', 'syntax', 'cs',
    'devops', 'machine learning', 'ai', 'deep learning', 'data science', 'math',
    'calculus', 'discrete', 'linear algebra', 'syllabus', 'college', 'semester', 'degree'
  ];

  if (inScopeKeywords.some((kw) => lower.includes(kw))) {
    return false;
  }

  // Clear off-topic patterns when no study keywords are present:
  const offTopicPatterns = [
    /\b(recipe|recipes|cook|cooking|bake|baking|pasta|pizza|cake|burger|biryani|chicken curry|curry|food recipe)\b/i,
    /\b(movie|movies|cinema|film|actor|actress|hollywood|bollywood|taylor swift|singer|song|lyrics|celebrity gossip)\b/i,
    /\b(cricket|football|soccer|nba|ipl|messi|ronaldo|tennis|badminton|sports score|match score)\b/i,
    /\b(dating|girlfriend|boyfriend|crush|flirt|tinder|love advice|romance)\b/i,
    /\b(weather|temperature today|forecast|rain today|sunny today)\b/i,
    /\b(tell me a joke|tell a joke|make me laugh|funny joke|memes)\b/i,
    /\b(politics|election|political party|prime minister|president of india|president of usa|bjp|congress|democrat|republican)\b/i,
    /\b(price of dollar|dollar rate|currency rate|currency exchange|stock price|gold rate|gold price|bitcoin price)\b/i,
    /\b(horoscope|astrology|zodiac)\b/i
  ];

  return offTopicPatterns.some((p) => p.test(lower));
}

// Convert HTML tables or lists from LLMs into clean Markdown
function sanitizeResponse(text) {
  if (!text) return '';
  let clean = text;

  // Convert <ul><li>item</li>...</ul> to clean markdown bullet list
  clean = clean.replace(/<ul>([\s\S]*?)<\/ul>/gi, (match, inner) => {
    return '\n' + inner
      .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .trim() + '\n';
  });

  clean = clean.replace(/<li>(.*?)<\/li>/gi, '- $1\n');
  clean = clean.replace(/<br\s*\/?>/gi, '\n');
  clean = clean.replace(/<\/?(ul|ol|li|p|div|span|b|strong|i|em)>/gi, '');

  return clean.trim();
}

// Fallback skill mappings for custom roles when offline
function getFallbackCustomRoleSkills(targetCareer = '') {
  const lower = (targetCareer || '').toLowerCase();

  if (lower.includes('mlops') || lower.includes('machine learning ops')) {
    return {
      title: targetCareer,
      description: 'MLOps engineers bridge machine learning algorithms with reliable cloud production infrastructure, automating training, registry, and drift monitoring.',
      required_skills: ['Python', 'Docker', 'Kubernetes', 'MLflow', 'PyTorch', 'FastAPI', 'CI/CD', 'AWS', 'SQL', 'Data Version Control (DVC)'],
      recommended_projects: ['End-to-End Automated ML Pipeline with Model Registry', 'Real-Time Model Inference API with Drift Monitoring'],
      learning_advice: 'Prioritize containerization (Docker) and MLflow experiment tracking before tackling cluster orchestration with Kubernetes.',
    };
  }

  if (lower.includes('blockchain') || lower.includes('web3') || lower.includes('smart contract') || lower.includes('crypto') || lower.includes('solidity')) {
    return {
      title: targetCareer,
      description: 'Blockchain developers engineer decentralized applications (dApps), cryptographic smart contracts, and Web3 consensus protocols.',
      required_skills: ['Solidity', 'Ethereum', 'Smart Contracts', 'Web3.js', 'Ethers.js', 'Rust', 'Hardhat', 'Cryptography', 'Node.js', 'Security Auditing'],
      recommended_projects: ['Decentralized Escrow & Staking Protocol', 'NFT Marketplace Smart Contract with Full Test Suite'],
      learning_advice: 'Master Solidity fundamentals and smart contract security vulnerabilities (reentrancy, gas optimization) first.',
    };
  }

  if (lower.includes('cloud') || lower.includes('sre') || lower.includes('reliability') || lower.includes('infrastructure')) {
    return {
      title: targetCareer,
      description: 'Cloud architects and SREs design resilient, scalable multi-region cloud infrastructures with automated disaster recovery and telemetry.',
      required_skills: ['AWS', 'Terraform', 'Kubernetes', 'Docker', 'Linux', 'CI/CD', 'Prometheus', 'Grafana', 'Python', 'Networking (VPC/DNS)'],
      recommended_projects: ['Multi-Tier Cloud Infrastructure Provisioned via Terraform', 'Automated Microservices Monitoring Stack with Alerting'],
      learning_advice: 'Gain deep proficiency with Linux systems administration and Infrastructure as Code (Terraform).',
    };
  }

  if (lower.includes('game') || lower.includes('unity') || lower.includes('unreal')) {
    return {
      title: targetCareer,
      description: 'Game developers craft interactive virtual worlds, gameplay mechanics, graphics rendering pipelines, and physics simulation systems.',
      required_skills: ['C++', 'C#', 'Unity', 'Unreal Engine', '3D Linear Algebra', 'Data Structures & Algorithms', 'OpenGL / DirectX', 'Shaders (HLSL/GLSL)', 'Git', 'Memory Management'],
      recommended_projects: ['Custom 3D Action RPG Mechanics Prototype in Unreal/Unity', 'Custom 2D Physics & Collision Engine in C++'],
      learning_advice: 'Solidify your C++ fundamentals and 3D linear algebra (vectors, matrices, quaternions).',
    };
  }

  if (lower.includes('embed') || lower.includes('iot') || lower.includes('hardware') || lower.includes('firmware') || lower.includes('robot')) {
    return {
      title: targetCareer,
      description: 'Embedded systems engineers develop low-level firmware and real-time operating system applications running on microcontrollers and IoT devices.',
      required_skills: ['C', 'C++', 'Microcontrollers (ARM/ESP32)', 'RTOS (FreeRTOS)', 'I2C / SPI / UART', 'Linux Kernel', 'Memory Management', 'Debugging (GDB/JTAG)', 'Git'],
      recommended_projects: ['Real-Time Sensor Telemetry Hub using FreeRTOS on ESP32', 'Custom SPI Peripheral Driver and Oscilloscope Analyzer'],
      learning_advice: 'Focus on pointers, bitwise manipulation, and interrupt service routines in bare-metal C.',
    };
  }

  if (lower.includes('security') || lower.includes('cyber') || lower.includes('penetration') || lower.includes('infosec')) {
    return {
      title: targetCareer,
      description: 'Cybersecurity specialists identify architectural vulnerabilities, conduct penetration testing, and protect cloud infrastructure from adversarial breaches.',
      required_skills: ['Linux', 'Networking (TCP/IP)', 'Python', 'Penetration Testing', 'OWASP Top 10', 'Cryptography', 'Wireshark', 'Docker', 'SIEM Tools', 'Bash Scripting'],
      recommended_projects: ['Automated Web Vulnerability Scanner with Report Generator', 'Simulated Intrusion Detection Lab with Snort & Wireshark'],
      learning_advice: 'Understand network protocol handshakes and OWASP Top 10 web vulnerabilities inside out.',
    };
  }

  if (lower.includes('data engineer') || lower.includes('big data') || lower.includes('etl') || lower.includes('pipeline')) {
    return {
      title: targetCareer,
      description: 'Data engineers architect high-throughput ingestion pipelines, distributed processing clusters, and enterprise data warehouses.',
      required_skills: ['Python', 'SQL', 'Apache Spark', 'Kafka', 'Airflow', 'PostgreSQL', 'Snowflake', 'Docker', 'AWS / GCP', 'Data Warehousing'],
      recommended_projects: ['Streaming Analytics Pipeline with Kafka, Spark, and Postgres', 'Automated Daily Financial ETL Pipeline Orchestrated by Airflow'],
      learning_advice: 'Master complex SQL joins, window functions, and distributed partition strategies in Spark.',
    };
  }

  if (lower.includes('ai') || lower.includes('deep learning') || lower.includes('nlp') || lower.includes('computer vision')) {
    return {
      title: targetCareer,
      description: 'AI & Deep Learning Engineers architect neural network architectures, train vision/language models, and optimize inference latency.',
      required_skills: ['Python', 'PyTorch', 'TensorFlow', 'NumPy / Pandas', 'HuggingFace Transformers', 'FastAPI', 'Docker', 'SQL', 'Mathematics (Linear Algebra/Calculus)', 'Git'],
      recommended_projects: ['Fine-Tuned LLM Domain Specialist with RAG Integration', 'Computer Vision Real-Time Object Detection API'],
      learning_advice: 'Understand transformer attention mechanisms and practice vector indexing for RAG systems.',
    };
  }

  if (lower.includes('data scien')) {
    return {
      title: targetCareer,
      description: 'Data scientists uncover strategic patterns from complex datasets using statistical inference, predictive modeling, and machine learning.',
      required_skills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Scikit-Learn', 'Machine Learning', 'Data Visualization', 'Statistics', 'Jupyter', 'Git'],
      recommended_projects: ['End-to-End Customer Retention Predictive Modeling Pipeline', 'Exploratory Analytics & Statistical Inference Dashboard'],
      learning_advice: 'Solidify your core statistics, data manipulation in Pandas, and Scikit-Learn workflows before venturing into deep learning.',
    };
  }

  if (lower.includes('rust') || lower.includes('distributed')) {
    return {
      title: targetCareer,
      description: 'Distributed systems engineers craft ultra-high performance, fault-tolerant network services, consensus algorithms, and concurrent architectures.',
      required_skills: ['Rust', 'Distributed Systems', 'Concurrency & Tokio', 'Linux', 'Docker', 'gRPC / Protocol Buffers', 'PostgreSQL', 'Git', 'System Design', 'CI/CD'],
      recommended_projects: ['High-Throughput Distributed Raft Consensus Engine in Rust', 'Asynchronous Microservices Task Queue with gRPC & Tokio'],
      learning_advice: 'Master Rust memory safety, ownership semantics, and asynchronous concurrency patterns with Tokio.',
    };
  }

  if (lower.includes('devops')) {
    return {
      title: targetCareer,
      description: 'DevOps engineers bridge software development and IT infrastructure, automating CI/CD pipelines, container orchestration, and telemetry.',
      required_skills: ['Docker', 'Kubernetes', 'Linux', 'AWS', 'CI/CD', 'Terraform', 'Git', 'Bash Scripting', 'Prometheus', 'Networking'],
      recommended_projects: ['Zero-Downtime Automated Microservices CI/CD Pipeline', 'Production Kubernetes Cluster with Observability Stack'],
      learning_advice: 'Prioritize mastering Linux command-line tooling, containerization with Docker, and automated CI/CD workflows.',
    };
  }

  if (lower.includes('mobile') || lower.includes('android') || lower.includes('ios') || lower.includes('flutter') || lower.includes('react native')) {
    return {
      title: targetCareer,
      description: 'Mobile application engineers develop fluid, responsive smartphone applications with hardware integration, offline caching, and native performance.',
      required_skills: ['React Native', 'Flutter', 'JavaScript', 'TypeScript', 'Mobile UI/UX', 'REST APIs', 'Git', 'State Management', 'Firebase', 'iOS / Android Tooling'],
      recommended_projects: ['Cross-Platform Mobile Productivity Suite with Offline Persistence', 'Real-Time Geofencing & Messaging Native Mobile App'],
      learning_advice: 'Master mobile UI lifecycle, client state management, and offline cache synchronization patterns.',
    };
  }

  if (lower.includes('frontend')) {
    return {
      title: targetCareer,
      description: 'Frontend engineers design high-performance, accessible, and responsive user interfaces using modern client component architectures.',
      required_skills: ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Tailwind CSS', 'Next.js', 'Redux', 'REST APIs', 'Git'],
      recommended_projects: ['Enterprise Interactive Analytics Dashboard with Dark Mode', 'E-Commerce Storefront with Real-Time Cart State Management'],
      learning_advice: 'Focus on DOM rendering cycles, responsive layout systems with CSS Grid/Flexbox, and state management.',
    };
  }

  if (lower.includes('backend')) {
    return {
      title: targetCareer,
      description: 'Backend engineers architect high-throughput server backends, database layers, message queues, and secure API gateways.',
      required_skills: ['Node.js', 'Express', 'Python', 'PostgreSQL', 'SQL', 'REST APIs', 'Redis', 'Docker', 'Git', 'System Design'],
      recommended_projects: ['Scalable Event-Driven Microservices Hub with Redis Caching', 'Secure Authentication & RBAC API Service with PostgreSQL'],
      learning_advice: 'Master database indexing, normalization, connection pooling, and RESTful architectural principles.',
    };
  }

  if (lower.includes('full') || lower.includes('web dev')) {
    return {
      title: targetCareer,
      description: 'Full-stack engineers architect complete end-to-end applications, connecting scalable server backends with responsive client experiences.',
      required_skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 'SQL', 'Tailwind CSS', 'Docker', 'Git'],
      recommended_projects: ['Full-Stack Collaborative Workspace Application', 'Modern SaaS Subscription Platform with Payment Integration'],
      learning_advice: 'Master the bridge between client state management and relational database modeling.',
    };
  }

  return {
    title: targetCareer,
    description: `Specialized engineering and technological role dedicated to ${targetCareer}.`,
    required_skills: [
      `${targetCareer} Core Concepts`,
      'Data Structures & Algorithms',
      'System Design & Architecture',
      'Git & Version Control',
      'REST APIs / Microservices',
      'Database Modeling & SQL',
      'Automated Testing & CI/CD',
      'Docker & Containerization',
    ],
    recommended_projects: [
      `Production Capstone Project for ${targetCareer}`,
      `High-Performance API & Microservice Hub for ${targetCareer}`,
    ],
    learning_advice: `Start by mastering the core foundational tools and building a portfolio project specifically showcasing ${targetCareer} capabilities.`,
  };
}

// Fallback curated resource mappings when offline or generating resources for niche skills
function getFallbackResourcesForSkill(skill = '') {
  const clean = (skill || '').trim();
  const lower = clean.toLowerCase();

  if (lower.includes('rust')) {
    return [
      {
        title: 'The Rust Programming Language Book',
        url: 'https://doc.rust-lang.org/book/',
        topic: 'Rust',
        skill_name: 'Rust',
        category: 'Backend',
        resource_type: 'Official Documentation',
        difficulty: 'Beginner',
        description: 'The official book covering Rust syntax, ownership, borrowing, lifetimes, and fearless concurrency.',
      },
      {
        title: 'Rust by Example',
        url: 'https://doc.rust-lang.org/rust-by-example/',
        topic: 'Rust',
        skill_name: 'Rust',
        category: 'Backend',
        resource_type: 'Interactive Tutorial',
        difficulty: 'Intermediate',
        description: 'A collection of runnable interactive examples illustrating standard Rust idioms and error handling.',
      },
      {
        title: 'Rustlings Exercises & Practice',
        url: 'https://github.com/rust-lang/rustlings',
        topic: 'Rust',
        skill_name: 'Rust',
        category: 'Backend',
        resource_type: 'Curated Guide',
        difficulty: 'Beginner',
        description: 'Small hands-on coding exercises to get you used to writing idiomatic Rust code and solving compiler errors.',
      },
    ];
  }

  if (lower.includes('kafka')) {
    return [
      {
        title: 'Apache Kafka Official Documentation & Quickstart',
        url: 'https://kafka.apache.org/documentation/',
        topic: 'Apache Kafka',
        skill_name: 'Apache Kafka',
        category: 'Backend',
        resource_type: 'Official Documentation',
        difficulty: 'Intermediate',
        description: 'The official architecture reference for event streaming, topics, partitions, producers, and consumer groups.',
      },
      {
        title: 'Confluent Kafka Foundations & Architecture',
        url: 'https://developer.confluent.io/learn/kafka-foundations/',
        topic: 'Apache Kafka',
        skill_name: 'Apache Kafka',
        category: 'Backend',
        resource_type: 'Interactive Tutorial',
        difficulty: 'Beginner',
        description: 'Structured tutorials and architectural guides explaining real-time stream processing at scale.',
      },
    ];
  }

  if (lower.includes('solidity') || lower.includes('smart contract') || lower.includes('web3') || lower.includes('blockchain')) {
    return [
      {
        title: 'Solidity Official Language Documentation',
        url: 'https://docs.soliditylang.org/',
        topic: 'Solidity',
        skill_name: 'Solidity',
        category: 'Backend',
        resource_type: 'Official Documentation',
        difficulty: 'Intermediate',
        description: 'Official compiler reference, contract design patterns, security auditing rules, and EVM mechanics.',
      },
      {
        title: 'CryptoZombies Interactive Solidity Academy',
        url: 'https://cryptozombies.io/',
        topic: 'Solidity',
        skill_name: 'Solidity',
        category: 'Backend',
        resource_type: 'Interactive Tutorial',
        difficulty: 'Beginner',
        description: 'Gamified interactive coding school that teaches you to build decentralized applications and smart contracts from scratch.',
      },
    ];
  }

  if (lower.includes('c++') || lower.includes('cpp')) {
    return [
      {
        title: 'cppreference.com — C++ Standard Reference',
        url: 'https://en.cppreference.com/w/',
        topic: 'C++',
        skill_name: 'C++',
        category: 'Core CS & System Design',
        resource_type: 'Official Documentation',
        difficulty: 'Intermediate',
        description: 'Complete reference for modern C++ standards (C++17/C++20/C++23), STL containers, and algorithms.',
      },
      {
        title: 'Learn C++ In-Depth Tutorials',
        url: 'https://www.learncpp.com/',
        topic: 'C++',
        skill_name: 'C++',
        category: 'Core CS & System Design',
        resource_type: 'Interactive Tutorial',
        difficulty: 'Beginner',
        description: 'Free comprehensive tutorial website for learning modern C++ programming from fundamentals to memory management.',
      },
    ];
  }

  if (lower.includes('swift') || lower.includes('ios')) {
    return [
      {
        title: 'Apple Swift Official Documentation & Language Guide',
        url: 'https://www.swift.org/documentation/',
        topic: 'Swift',
        skill_name: 'Swift',
        category: 'Mobile & UI',
        resource_type: 'Official Documentation',
        difficulty: 'Beginner',
        description: 'Official language guide for Swift syntax, protocols, optionals, and memory safety.',
      },
      {
        title: '100 Days of SwiftUI by Paul Hudson',
        url: 'https://www.hackingwithswift.com/100/swiftui',
        topic: 'SwiftUI',
        skill_name: 'Swift',
        category: 'Mobile & UI',
        resource_type: 'Interactive Tutorial',
        difficulty: 'Beginner',
        description: 'Hands-on curriculum for building native iOS applications with declarative SwiftUI and modern architectures.',
      },
    ];
  }

  if (lower.includes('kotlin') || lower.includes('android')) {
    return [
      {
        title: 'Kotlin Official Language Documentation',
        url: 'https://kotlinlang.org/docs/home.html',
        topic: 'Kotlin',
        skill_name: 'Kotlin',
        category: 'Mobile & UI',
        resource_type: 'Official Documentation',
        difficulty: 'Beginner',
        description: 'Official guide to modern Kotlin: coroutines, null safety, extension functions, and multiplatform programming.',
      },
      {
        title: 'Android Developers Jetpack Compose Tutorials',
        url: 'https://developer.android.com/courses/pathways/compose',
        topic: 'Android',
        skill_name: 'Kotlin',
        category: 'Mobile & UI',
        resource_type: 'Interactive Tutorial',
        difficulty: 'Intermediate',
        description: 'Official Google pathway for building modern Android user interfaces with Jetpack Compose.',
      },
    ];
  }

  // Universal high-quality fallback for any other skill
  return [
    {
      title: `${clean} Official Reference & Documentation`,
      url: `https://devdocs.io/#q=${encodeURIComponent(clean)}`,
      topic: clean,
      skill_name: clean,
      category: 'General',
      resource_type: 'Official Documentation',
      difficulty: 'Beginner',
      description: `Fast, searchable official API reference, tutorials, and syntax specs for ${clean}.`,
    },
    {
      title: `Awesome ${clean} — Curated Ecosystem Resources`,
      url: `https://github.com/search?q=awesome+${encodeURIComponent(clean)}&type=repositories`,
      topic: clean,
      skill_name: clean,
      category: 'General',
      resource_type: 'Curated Guide',
      difficulty: 'Intermediate',
      description: `Community-maintained repository of top libraries, frameworks, starter templates, and video courses for ${clean}.`,
    },
  ];
}

export class AIService {
  static getProvider() {
    return process.env.AI_PROVIDER || (process.env.GROQ_API_KEY ? 'groq' : 'gemini');
  }

  static getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) return null;
    return new GoogleGenerativeAI(apiKey.trim());
  }

  static getOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || !apiKey.trim()) return null;
    return new OpenAI({ apiKey: apiKey.trim() });
  }

  /**
   * Helper to execute a prompt across the configured AI provider.
   * Prioritizes Groq (powered by user API key) with full support for Claude, Gemini, and OpenAI.
   */
  static async executePrompt(prompt, systemInstruction = '') {
    const provider = this.getProvider();
    const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim());
    const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
    const hasGroq = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim());
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());

    // 1. Groq (Primary & Ultra-Fast - Powers all features with user's provided API key)
    if (provider === 'groq' || hasGroq) {
      const apiKey = process.env.GROQ_API_KEY;
      if (apiKey && apiKey.trim()) {
        const groqCandidates = [
          process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
          'openai/gpt-oss-120b',
          'qwen/qwen3.8-27b',
          'openai/gpt-oss-20b',
        ];
        const uniqueModels = [...new Set(groqCandidates.filter(Boolean))];
        const isJsonPrompt = (systemInstruction + ' ' + prompt).toLowerCase().includes('json');

        for (const modelName of uniqueModels) {
          try {
            const bodyPayload = {
              model: modelName,
              messages: [
                ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
                { role: 'user', content: prompt },
              ],
              temperature: 0.7,
              max_tokens: isJsonPrompt ? 1500 : 2048,
            };

            if (isJsonPrompt) {
              bodyPayload.response_format = { type: 'json_object' };
            }

            let response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey.trim()}`,
              },
              body: JSON.stringify(bodyPayload),
            });

            // If response_format error occurs, retry without response_format
            if (!response.ok && isJsonPrompt) {
              delete bodyPayload.response_format;
              response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${apiKey.trim()}`,
                },
                body: JSON.stringify(bodyPayload),
              });
            }

            if (response.ok) {
              const data = await response.json();
              const text = data?.choices?.[0]?.message?.content;
              if (text && text.trim()) return text.trim();
            } else {
              const errText = await response.text();
              console.warn(`[AI Service] Groq model ${modelName} returned status ${response.status}:`, errText);
            }
          } catch (err) {
            console.warn(`[AI Service] Groq model ${modelName} error:`, err.message);
          }
        }
      }
    }

    // 2. Anthropic Claude (Fallback / Secondary)
    if (provider === 'anthropic' || provider === 'claude' || hasAnthropic) {
      const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
      if (apiKey && apiKey.trim()) {
        try {
          const modelName = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey.trim(),
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: modelName,
              max_tokens: 2048,
              ...(systemInstruction ? { system: systemInstruction } : {}),
              messages: [{ role: 'user', content: prompt }],
            }),
          });
          if (response.ok) {
            const data = await response.json();
            const text = data?.content?.[0]?.text;
            if (text && text.trim()) return text.trim();
          } else {
            const errText = await response.text();
            console.warn('[AI Service] Anthropic Claude returned error:', response.status, errText);
          }
        } catch (err) {
          console.warn('[AI Service] Anthropic Claude invocation error:', err.message);
        }
      }
    }

    // 3. Google Gemini (Fallback / Secondary)
    if (provider === 'gemini' || hasGemini) {
      const gemini = this.getGeminiClient();
      if (gemini) {
        const candidateModels = [
          process.env.GEMINI_MODEL || 'gemini-1.5-flash',
          'gemini-1.5-pro',
          'gemini-2.0-flash',
          'gemini-1.0-pro',
        ];
        for (const modelName of candidateModels) {
          try {
            let model;
            try {
              model = gemini.getGenerativeModel({
                model: modelName,
                ...(systemInstruction ? { systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] } } : {}),
              });
            } catch {
              model = gemini.getGenerativeModel({ model: modelName });
            }
            const fullPromptText = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
            const result = await model.generateContent(fullPromptText);
            const text = result?.response?.text();
            if (text && text.trim()) return text.trim();
          } catch (modelErr) {
            console.warn(`[AI Service] Gemini model ${modelName} call failed, trying next:`, modelErr.message);
          }
        }
      }
    }

    // 4. OpenAI (Fallback / Secondary)
    if (provider === 'openai' || hasOpenAI) {
      const openai = this.getOpenAIClient();
      if (openai) {
        try {
          const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
          const response = await openai.chat.completions.create({
            model: modelName,
            messages: [
              ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          });
          const text = response.choices[0]?.message?.content;
          if (text && text.trim()) return text.trim();
        } catch (err) {
          console.warn('[AI Service] OpenAI call failed:', err.message);
        }
      }
    }

    return null;
  }

  /**
   * Chatbot mentoring responses — operates like real Gemini, Claude, and ChatGPT:
   * 1. Simple greetings get a warm, concise greeting without dumping processes or tables.
   * 2. Strictly answers questions related to study, programming, and technical projects.
   * 3. Off-topic questions are firmly declined with an educational warning message.
   * 4. Cleans any raw HTML tags to standard Markdown.
   */
  static async generateChatResponse(message, conversationHistory = [], profile = {}) {
    const rawMessage = (message || '').trim();
    const cleanLower = rawMessage.toLowerCase().replace(/[!.,?]+$/, '').trim();

    // 1. Simple standalone greeting check (e.g. "hi", "hello", "hey", "just hi", "hi mentor")
    const isGreeting = isSimpleGreeting(rawMessage);
    if (isGreeting) {
      if (/how (are you|r u|is it going|are things)/i.test(cleanLower)) {
        return "Hello! 👋 I'm doing well, thank you. How can I help you with your studies, coding, or projects today?";
      }
      return "Hello! 👋 How can I help you with your studies, coding, or projects today?";
    }

    // 2. Strict off-topic study guardrail (detecting questions clearly outside studies / coding / projects)
    const OFF_TOPIC_WARNING = "I can only answer questions related to your studies, coding, and projects.";
    if (isDefinitelyOffTopic(rawMessage)) {
      return OFF_TOPIC_WARNING;
    }

    // 3. Live LLM Generation (Groq / Gemini / Claude / OpenAI)
    const systemPrompt = `You are an expert AI Study, Coding & Technical Project Mentor, acting with the conversational intelligence, clarity, and directness of Gemini, Claude, and ChatGPT.

CORE INSTRUCTIONS & STRICT BOUNDARIES:
1. STRICT DOMAIN SCOPE (STUDY, CODING & PROJECTS ONLY):
   - You ONLY answer questions related to Computer Science, software engineering, programming/coding in any language, data structures & algorithms (DSA), computer systems (OS, DBMS, Computer Networks, System Design), academic study subjects, student tech projects, technical interview preparation, resumes/portfolios, and software career roadmaps.
   - If the user asks about ANYTHING outside of studies, coding, tech projects, or technical education (such as currency prices, exchange rates, movies, celebrities, recipes, cooking, sports, games, entertainment, jokes, dating, gossip, politics, general casual chit-chat):
     You MUST STRICTLY REFUSE and reply ONLY with:
     "${OFF_TOPIC_WARNING}"
     Do NOT answer the off-topic question, DO NOT provide tips or currency rates, and DO NOT entertain the off-topic prompt.

2. CONVERSATIONAL & DIRECT (LIKE REAL CHATGPT / CLAUDE / GEMINI):
   - Answer directly and adaptively according to what the user asks.
   - DO NOT output canned templates, unrequested 4-week tables, or robotic milestone dumps unless the user explicitly asks for a roadmap or schedule.
   - If the user asks a simple question, give a clear, direct, and concise answer.
   - If the user asks for code, provide clean, idiomatic, commented code with syntax highlighting.
   - Format cleanly using standard Markdown (### headings, bold text, bullet points). NEVER use raw HTML tags (e.g., <ul>, <li>, <br>).

3. STUDENT CONTEXT (Use naturally if relevant, never force it):
   - Target Career: ${profile.target_career || 'Software Engineering'}
   - Skills: ${(profile.skills || []).join(', ') || 'Programming fundamentals'}
   - Weekly Study Target: ${profile.weekly_study_hours || 10} hours/week`;

    const formattedHistory = conversationHistory
      .slice(-6)
      .map((msg) => `${msg.role === 'user' ? 'Student' : 'Study Mentor'}: ${msg.content}`)
      .join('\n\n');

    const prompt = `${formattedHistory ? '### Conversation History:\n' + formattedHistory + '\n\n' : ''}Student: ${rawMessage}\n\nStudy Mentor:`;

    const aiResponse = await this.executePrompt(prompt, systemPrompt);

    if (aiResponse && aiResponse.trim().length > 5) {
      return sanitizeResponse(aiResponse.trim());
    }

    // High-definition offline technical study knowledge engine fallback
    return sanitizeResponse(generateOfflineStudyResponse(rawMessage, conversationHistory, profile));
  }

  static getAiStatus() {
    const provider = this.getProvider();
    const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
    const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim());
    const hasGroq = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim());
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());

    let active = false;
    let activeModel = 'openai/gpt-oss-120b';
    if (provider === 'groq') {
      active = hasGroq;
      activeModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    } else if (provider === 'anthropic' || provider === 'claude') {
      active = hasAnthropic;
      activeModel = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
    } else if (provider === 'gemini') {
      active = hasGemini;
      activeModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    } else if (provider === 'openai') {
      active = hasOpenAI;
      activeModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    } else {
      active = hasGroq || hasGemini || hasAnthropic || hasOpenAI;
      if (hasGroq) activeModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    }

    const effectiveProvider = (hasGroq && (provider === 'groq' || !hasAnthropic && !hasGemini && !hasOpenAI)) ? 'groq' : provider;

    return {
      provider: effectiveProvider,
      hasKey: active,
      hasGemini,
      hasAnthropic,
      hasGroq,
      hasOpenAI,
      model: active ? activeModel : 'Academic Study Engine',
      mode: active ? 'Live LLM Active' : 'Academic Study Engine Active',
    };
  }

  static setApiKey(provider, apiKey, model) {
    const cleanKey = (apiKey || '').trim();
    let detectedProvider = provider || 'gemini';

    // Auto-detect provider by API key prefix
    if (cleanKey.startsWith('sk-ant-')) {
      detectedProvider = 'anthropic';
    } else if (cleanKey.startsWith('AIza')) {
      detectedProvider = 'gemini';
    } else if (cleanKey.startsWith('gsk_')) {
      detectedProvider = 'groq';
    } else if (cleanKey.startsWith('sk-') && !cleanKey.startsWith('sk-ant-')) {
      detectedProvider = 'openai';
    }

    const updates = { AI_PROVIDER: detectedProvider };

    if (detectedProvider === 'anthropic' || detectedProvider === 'claude') {
      updates.AI_PROVIDER = 'anthropic';
      updates.ANTHROPIC_API_KEY = cleanKey;
      updates.ANTHROPIC_MODEL = model || 'claude-3-5-sonnet-20241022';
    } else if (detectedProvider === 'gemini') {
      updates.AI_PROVIDER = 'gemini';
      updates.GEMINI_API_KEY = cleanKey;
      updates.GEMINI_MODEL = model || 'gemini-1.5-flash';
    } else if (detectedProvider === 'groq') {
      updates.AI_PROVIDER = 'groq';
      updates.GROQ_API_KEY = cleanKey;
      updates.GROQ_MODEL = model || 'openai/gpt-oss-120b';
    } else if (detectedProvider === 'openai') {
      updates.AI_PROVIDER = 'openai';
      updates.OPENAI_API_KEY = cleanKey;
      updates.OPENAI_MODEL = model || 'gpt-4o-mini';
    }

    persistEnvVars(updates);
  }

  /**
   * Personalized Career Recommendations
   */
  static async enrichCareerRecommendations(rankedRoles = [], profile = {}) {
    // If AI is configured, ask for personalized justification
    const rolesSnippet = rankedRoles.slice(0, 4).map((r) => ({
      title: r.title,
      matchedCount: r.skillAnalysis.matchedCount,
      missingCount: r.skillAnalysis.missingCount,
    }));

    const prompt = `Given the user profile:
Skills: ${(profile.skills || []).join(', ')}
Interests: ${(profile.interests || []).join(', ')}
Experience Level: ${profile.experience_level || 'Beginner'}
Target: ${profile.target_career || 'Exploring'}

And these top matched roles:
${JSON.stringify(rolesSnippet, null, 2)}

Provide a JSON array of objects with keys:
"title" (matching the role title exactly),
"whyFit" (a 2-3 sentence personalized explanation of why this role suits the user's specific background and interests),
"nextSteps" (array of 2 concrete immediate action items).
Return ONLY the JSON array.`;

    const rawAI = await this.executePrompt(prompt, 'You are a career counseling AI. Return strict JSON only.');
    const parsed = extractJson(rawAI);

    const enrichmentMap = new Map();
    if (Array.isArray(parsed)) {
      parsed.forEach((item) => {
        if (item?.title) enrichmentMap.set(item.title.toLowerCase(), item);
      });
    }

    return rankedRoles.map((role) => {
      const aiData = enrichmentMap.get(role.title.toLowerCase());
      return {
        ...role,
        whyFit:
          aiData?.whyFit ||
          `This role matches ${role.skillAnalysis.matchPercentage}% of your current skill profile. Your familiarity with ${role.skillAnalysis.matchedSkills.slice(0, 3).join(', ') || 'core principles'} gives you a strong foundation to build on.`,
        nextSteps:
          aiData?.nextSteps || [
            `Focus on learning foundational skills: ${role.skillAnalysis.missingSkills.slice(0, 2).join(', ') || 'advanced patterns'}.`,
            `Build a starter project demonstrating these skills for your portfolio.`,
          ],
      };
    });
  }

  /**
   * Extract & analyze skills for any custom user career choice
   */
  static async extractSkillsForCustomRole(targetCareer) {
    try {
      const prompt = `You are a Principal Technical Recruiter and Curriculum Architect.
The candidate chose a custom career path: "${targetCareer}".

Provide an industry-standard skill requirement profile for this exact role.
Return strict JSON adhering to this schema:
{
  "title": "${targetCareer}",
  "description": "2-sentence executive summary of the role's responsibilities and industry significance.",
  "required_skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8"],
  "recommended_projects": ["Standout Portfolio Project Title 1", "Standout Portfolio Project Title 2"],
  "learning_advice": "A 1-2 sentence recommendation on what to focus on first to bridge the gap."
}

REQUIREMENTS:
1. "required_skills" MUST contain 8 to 12 realistic, industry-standard technical skills (languages, frameworks, libraries, databases, DevOps/tools) specifically needed for "${targetCareer}".
2. Return ONLY the JSON object. No Markdown code fences.`;

      const raw = await this.executePrompt(prompt, 'You are an elite tech curriculum architect. Return strict JSON only.');
      const parsed = extractJson(raw);

      if (parsed && Array.isArray(parsed.required_skills) && parsed.required_skills.length >= 4) {
        return {
          title: parsed.title || targetCareer,
          description: parsed.description || `Specialized engineering and technical domain focusing on ${targetCareer}.`,
          required_skills: parsed.required_skills.map((s) => String(s).trim()).filter(Boolean),
          recommended_projects: Array.isArray(parsed.recommended_projects) ? parsed.recommended_projects : [],
          learning_advice: parsed.learning_advice || `Focus on mastering the core tools and frameworks for ${targetCareer}.`,
        };
      }
    } catch (err) {
      console.warn(`[AI Service] Note: Network AI unavailable for custom role "${targetCareer}", using curated fallback:`, err.message);
    }

    return getFallbackCustomRoleSkills(targetCareer);
  }

  /**
   * Generate Personalized Career Roadmap
   */
  static async generateRoadmap(targetCareer, profile = {}) {
    const focusStr = profile.focus_areas ? `Specific Candidate Focus Areas / Tech Preferences: "${profile.focus_areas}"` : '';
    const goalsStr = profile.custom_goals ? `Target Timeline & Aspirations: "${profile.custom_goals}"` : '';

    const prompt = `You are a Principal Tech Curriculum Architect and Lead Engineering Mentor.
Design an expert, bespoke 5-phase career mastery roadmap tailored specifically to this custom user career path:

Target Career Role: "${targetCareer}"
${focusStr ? `${focusStr}\n` : ''}${goalsStr ? `${goalsStr}\n` : ''}User Experience Level: "${profile.experience_level || 'Beginner'}"
User Current Baseline Skills: "${(profile.skills || []).join(', ') || 'General Programming Basics'}"
Weekly Study Hours: ${profile.weekly_study_hours || 10} hours/week

ANALYSIS & CURRICULUM INSTRUCTIONS:
1. Deeply analyze the target role "${targetCareer}" and any specialized focus areas or timeline goals requested by the candidate.
2. Even if this is an emerging, niche, or specialized technical discipline (e.g., MLOps Engineer, Rust Distributed Systems Architect, Quantitative Trading Developer, Blockchain Security Auditor, Embedded IoT Systems), formulate an authoritative 5-phase syllabus with real industry tools, frameworks, algorithms, and design patterns.
3. Compare the candidate's current baseline skills with industry benchmarks for this specific role, deriving true skill gaps.
4. For each of the 5 phases:
   - Provide 2-3 precise learning objectives.
   - Provide 2-4 comprehensive, high-value tasks with actionable learning descriptions and realistic estimated study hours.
   - Design a standout portfolio capstone project that proves hiring-ready competency for "${targetCareer}".
   - Define clear completion/mastery criteria.

Return strict JSON adhering to this schema:
{
  "careerTitle": "${targetCareer}",
  "overview": "2-3 sentences providing an executive summary of this learning journey for ${targetCareer}",
  "currentAssessment": "Analysis of candidate baseline skills and how they map to this target role",
  "skillGaps": ["Critical Gap 1", "Critical Gap 2", "Critical Gap 3", "Critical Gap 4"],
  "estimatedTotalWeeks": 16,
  "phases": [
    {
      "name": "Phase 1: Foundations & Core Architecture",
      "durationWeeks": 3,
      "objectives": ["Objective 1", "Objective 2"],
      "tasks": [
        { "title": "Task title", "description": "Specific hands-on implementation details and concepts to master", "estimatedHours": 8 }
      ],
      "projectSuggestion": { "title": "Project name", "description": "Detailed portfolio project specification" },
      "completionCriteria": "Concrete milestone demonstrating mastery"
    }
  ]
}
Return ONLY valid JSON.`;

    const raw = await this.executePrompt(prompt, 'You are an expert technical curriculum designer. Output strict JSON only.');
    const parsed = extractJson(raw);

    // Zod validation for generated roadmap
    const RoadmapSchema = z.object({
      careerTitle: z.string(),
      overview: z.string(),
      currentAssessment: z.string().optional(),
      skillGaps: z.array(z.string()).optional(),
      estimatedTotalWeeks: z.number().int().positive(),
      phases: z.array(
        z.object({
          name: z.string(),
          durationWeeks: z.number().int().positive(),
          objectives: z.array(z.string()),
          tasks: z.array(
            z.object({
              title: z.string(),
              description: z.string(),
              estimatedHours: z.number().int().positive(),
            })
          ),
          projectSuggestion: z.object({
            title: z.string(),
            description: z.string(),
          }),
          completionCriteria: z.string(),
        })
      ),
    });

    if (parsed) {
      const validation = RoadmapSchema.safeParse(parsed);
      if (validation.success) {
        return validation.data;
      }
    }

    // Deterministic Fallback Roadmap
    return {
      careerTitle: targetCareer,
      overview: `A structured step-by-step pathway to becoming a proficient ${targetCareer}, tailored for ${profile.experience_level || 'Beginner'} learners.`,
      currentAssessment: `Building upon your current strengths (${(profile.skills || []).slice(0, 3).join(', ') || 'foundations'}) to address core industry requirements.`,
      skillGaps: ['Core Architecture', 'Testing & CI/CD', 'Production Deployment'],
      estimatedTotalWeeks: 14,
      phases: [
        {
          name: 'Phase 1: Core Fundamentals & Language Mastery',
          durationWeeks: 3,
          objectives: ['Master programming paradigms', 'Build algorithmic problem-solving confidence'],
          tasks: [
            { title: 'Modern Language Features & Syntax', description: 'Review modern ECMAScript / Python language features, data types, and closures.', estimatedHours: 8 },
            { title: 'Data Structures in Practice', description: 'Implement arrays, maps, sets, and basic tree lookups in real-world scenarios.', estimatedHours: 8 }
          ],
          projectSuggestion: {
            title: 'CLI Data Processing Tool',
            description: 'Build a command-line utility that parses JSON/CSV data and generates statistical summaries.'
          },
          completionCriteria: 'Pass basic technical coding challenges and build a working CLI tool.'
        },
        {
          name: 'Phase 2: Framework & Architecture Fundamentals',
          durationWeeks: 3,
          objectives: ['Learn industry-standard frameworks', 'Implement state and data flow architectures'],
          tasks: [
            { title: 'Component Hierarchy & State Management', description: 'Design maintainable modular components with unidirectional data flow.', estimatedHours: 10 },
            { title: 'API Integration & Asynchronous Workflows', description: 'Handle REST API data fetching, loading spinners, and error boundaries.', estimatedHours: 8 }
          ],
          projectSuggestion: {
            title: 'Interactive Dashboard Application',
            description: 'Build an interactive web application with filtering, search, and dynamic visual indicators.'
          },
          completionCriteria: 'Deliver a responsive user interface integrated with live API endpoints.'
        },
        {
          name: 'Phase 3: Backend Services & Database Design',
          durationWeeks: 3,
          objectives: ['Design relational schemas', 'Build secure RESTful endpoints'],
          tasks: [
            { title: 'Relational Database Schema Design', description: 'Design normalized tables with primary/foreign keys and index optimizations.', estimatedHours: 8 },
            { title: 'Authentication & Session Handling', description: 'Implement JWT tokens, bcrypt password hashing, and role checks.', estimatedHours: 8 }
          ],
          projectSuggestion: {
            title: 'Authenticated REST API Service',
            description: 'Build a secure API service with PostgreSQL persistence and input validation.'
          },
          completionCriteria: 'All endpoints pass automated tests and enforce proper authentication.'
        },
        {
          name: 'Phase 4: Full-Stack Integration & Testing',
          durationWeeks: 3,
          objectives: ['Connect frontend with backend services', 'Add unit and integration tests'],
          tasks: [
            { title: 'End-to-End System Integration', description: 'Connect client components to database APIs with optimistic updates.', estimatedHours: 10 },
            { title: 'Testing & Error Handling', description: 'Write unit tests and verify edge-case error behaviors.', estimatedHours: 6 }
          ],
          projectSuggestion: {
            title: 'Production Portfolio Capstone Project',
            description: 'Build a full-fledged application solving a specific industry problem.'
          },
          completionCriteria: 'Deploy a tested web application with live demo and source code on GitHub.'
        },
        {
          name: 'Phase 5: Career Prep & Mock Interviews',
          durationWeeks: 2,
          objectives: ['Polish resume with measurable impact', 'Practice technical & behavioral questions'],
          tasks: [
            { title: 'Resume & Portfolio Enhancement', description: 'Highlight technical stack and quantifiable outcomes on your resume.', estimatedHours: 6 },
            { title: 'Technical Interview Simulation', description: 'Practice system design and behavioral STAR interview responses.', estimatedHours: 6 }
          ],
          projectSuggestion: {
            title: 'Developer Portfolio Website',
            description: 'Deploy a personal portfolio displaying live project links and GitHub repositories.'
          },
          completionCriteria: 'Complete 3 mock interview simulations and finalize portfolio links.'
        }
      ]
    };
  }

  /**
   * Mock Interview Feedback
   */
  static async evaluateMockInterviewAnswer(role, difficulty, question, answer) {
    const prompt = `Evaluate this mock interview response:
Target Role: ${role}
Difficulty Level: ${difficulty}
Question: "${question}"
Candidate Answer: "${answer}"

Provide feedback in JSON with keys:
"score" (number from 1 to 100),
"strengths" (array of 2 strings highlighting what the candidate did well),
"improvements" (array of 2 strings detailing constructive suggestions),
"sampleBetterAnswer" (a concise model response illustrating how to frame the answer professionally),
"verdict" (string: "Strong", "Adequate", or "Needs Practice").

Return ONLY valid JSON.`;

    const raw = await this.executePrompt(prompt, 'You are a senior tech hiring manager conducting a mock interview. Return strict JSON only.');
    const parsed = extractJson(raw);

    if (parsed && typeof parsed.score === 'number' && Array.isArray(parsed.strengths)) {
      return parsed;
    }

    // Deterministic Feedback Fallback
    const length = answer.trim().split(/\s+/).length;
    const score = Math.min(90, Math.max(50, 40 + length * 2));

    return {
      score,
      verdict: score >= 75 ? 'Strong' : score >= 60 ? 'Adequate' : 'Needs Practice',
      strengths: [
        'Addressed the core intent of the question directly.',
        'Demonstrated foundational familiarity with the topic.',
      ],
      improvements: [
        'Include concrete real-world examples or measurable project metrics to substantiate your claims.',
        'Structure your answer using the STAR method (Situation, Task, Action, Result) for clarity.',
      ],
      sampleBetterAnswer: `A strong answer directly identifies the core architectural trade-offs, gives a tangible example from a past project, and highlights how you tested and verified the solution.`,
    };
  }

  /**
   * AI Project Idea Generator (adapted from AI_Project_Idea_Generator)
   */
  static async generateProjectIdeas(technology = 'React', difficulty = 'Intermediate', projectType = 'Web Application') {
    const prompt = `Generate exactly 3 unique, impressive, and practical project ideas for a developer portfolio.
Technology Stack: ${technology}
Target Difficulty: ${difficulty}
Project Type: ${projectType}

Requirements for each idea:
- Relevant to modern hiring standards and portfolio showcases.
- Include a creative, catchy title.
- Clear description of the problem solved.
- Exactly 3-4 key technical features.
- A list of technologies/libraries in the stack.

Return ONLY valid JSON adhering to this schema:
{
  "ideas": [
    {
      "title": "Project Title",
      "description": "2-3 sentences explaining the project",
      "features": ["Feature 1", "Feature 2", "Feature 3"],
      "stack": ["React", "Node.js", "PostgreSQL"]
    }
  ]
}`;

    const raw = await this.executePrompt(prompt, 'You are an expert tech career coach and architect. Return strict JSON only.');
    const parsed = extractJson(raw);

    if (parsed && Array.isArray(parsed.ideas) && parsed.ideas.length > 0) {
      return parsed.ideas;
    }

    // High quality deterministic fallback ideas based on inputs
    return [
      {
        title: `${technology} Real-Time Collaboration Workspace`,
        description: `A collaborative workspace allowing multiple users to edit documents and organize Kanban boards in real time with optimistic UI updates.`,
        features: [
          'Live synchronizations and conflict resolution',
          'Role-based permissions and team workspace invitations',
          'Activity history logs and instant notifications',
        ],
        stack: [technology, 'WebSockets', 'PostgreSQL', 'Tailwind CSS'],
      },
      {
        title: `Automated ${projectType} with Analytics Dashboard`,
        description: `An end-to-end ${projectType.toLowerCase()} solving workflow bottlenecks with comprehensive telemetry and visual trend charts.`,
        features: [
          'Filterable interactive data charts and KPI summary widgets',
          'CSV / PDF export pipeline and scheduled reports',
          'Secure authentication with HttpOnly cookies and rate limits',
        ],
        stack: [technology, 'Recharts', 'Express', 'JWT'],
      },
      {
        title: `AI-Powered Smart Content & Workflow Assistant`,
        description: `An intelligent platform that parses user documents and provides contextual suggestions, summaries, and action items.`,
        features: [
          'Document parsing and automated keyword extraction',
          'Semantic search with instant query results',
          'Responsive dark/light UI with keyboard shortcuts',
        ],
        stack: [technology, 'REST APIs', 'Zod', 'PostgreSQL'],
      },
    ];
  }

  /**
   * AI Learning Resource Generator for any requested skill or technology
   */
  static async generateResourcesForSkill(skillName = 'Technology') {
    const cleanSkill = (skillName || '').trim();
    if (!cleanSkill) return [];

    const prompt = `You are a Principal Technical Educator and Curriculum Architect.
The student requested curated, verified learning resources for the technology/skill: "${cleanSkill}".

Provide 3 to 4 top-tier, authoritative, and verified learning resources (e.g. Official Documentation, Renowned Interactive Tutorials, Gold-standard Architecture Guides, or Open Source Repositories).

Return strict JSON adhering to this schema:
{
  "resources": [
    {
      "title": "Clear, informative title (e.g., The Rust Programming Language Book)",
      "url": "https://... (MUST be a real, working official URL)",
      "topic": "${cleanSkill}",
      "skill_name": "${cleanSkill}",
      "category": "Frontend | Backend | Database | DevOps & Cloud | AI & Data | Core CS & System Design | Testing & Tools | Mobile & UI",
      "resource_type": "Official Documentation | Interactive Tutorial | Architecture Reference | Curated Guide",
      "difficulty": "Beginner | Intermediate | Advanced",
      "description": "1-2 sentence description explaining what concepts this covers and why it is essential."
    }
  ]
}

IMPORTANT:
1. Provide REAL, working, official URLs (e.g. official docs, MDN, DevDocs, GitHub official, etc.).
2. Categorize accurately into one of the specified categories.
3. Return ONLY valid JSON. No markdown backticks.`;

    try {
      const raw = await this.executePrompt(prompt, 'You are an expert technical curriculum designer. Output strict JSON only.');
      const parsed = extractJson(raw);

      if (parsed && Array.isArray(parsed.resources) && parsed.resources.length > 0) {
        return parsed.resources.map((r) => ({
          title: String(r.title || `${cleanSkill} Official Guide`).trim(),
          url: String(r.url || `https://devdocs.io/#q=${encodeURIComponent(cleanSkill)}`).trim(),
          topic: String(r.topic || cleanSkill).trim(),
          skill_name: String(r.skill_name || cleanSkill).trim(),
          category: String(r.category || 'General').trim(),
          resource_type: String(r.resource_type || 'Documentation').trim(),
          difficulty: String(r.difficulty || 'Intermediate').trim(),
          description: String(r.description || `Comprehensive guide and documentation covering ${cleanSkill} fundamentals and best practices.`).trim(),
        }));
      }
    } catch (err) {
      console.warn(`[AIService] generateResourcesForSkill fallback for ${cleanSkill}:`, err.message);
    }

    return getFallbackResourcesForSkill(cleanSkill);
  }

  /**
   * AI Resume Bullet Improver (adapted from AI_Resume_Bullet_Improver)
   * Supports decomposing large matter into N distinct, high-impact Google XYZ bullet points.
   */
  static async improveResumeBullet(bullet, jobRole = '', count = 3) {
    const requestedCount = Math.min(10, Math.max(1, parseInt(count) || 3));
    const prompt = `You are an elite Tech Executive Resume Writer and ATS Optimization Specialist (Google, Meta, Apple, Amazon standard).
The candidate provided the following draft experience, responsibilities, or background matter:
"""
${bullet}
"""
${jobRole ? `Target Job Role: ${jobRole}` : ''}
Required Bullet Count: Exactly ${requestedCount} distinct, high-impact bullet points.

INSTRUCTIONS:
1. Thoroughly parse the provided matter. Break down all distinct accomplishments, architectures, frameworks, APIs, and responsibilities into EXACTLY ${requestedCount} unique, professional resume bullet points.
2. Every bullet point MUST strictly adhere to Google's XYZ formula:
   "Accomplished [X], as measured by [Y], by doing [Z]"
3. Every bullet MUST start with a strong, diverse past-tense action verb (e.g., Engineered, Architected, Optimized, Spearheaded, Automated, Reduced, Scaled, Streamlined, Orchestrated).
4. Embed realistic, impressive quantitative metrics (e.g., "cutting API latency by 42%", "boosting throughput by 2.5x", "supporting 100k+ active sessions", "reducing deployment cycle from 4 hours to 15 minutes", "saving $18,000 in monthly cloud infrastructure costs").
5. Format for direct copy-pasting onto a competitive software engineering / tech resume.

Return strict JSON adhering to this schema:
{
  "bullets": [
    {
      "bullet": "Refined bullet point text starting with an action verb and containing measurable impact...",
      "actionVerb": "Engineered",
      "metric": "42% latency reduction",
      "rationale": "Transformed passive description into a measurable achievement using Google XYZ formula"
    }
  ],
  "summaryOverview": "Professional summary note regarding these achievements"
}`;

    const raw = await this.executePrompt(prompt, 'You are an elite tech resume writer and ATS specialist. Return strict JSON only.');
    const parsed = extractJson(raw);

    if (parsed && Array.isArray(parsed.bullets) && parsed.bullets.length > 0) {
      return {
        bullets: parsed.bullets.slice(0, requestedCount),
        improvedBullet: parsed.bullets[0].bullet,
        actionVerbUsed: parsed.bullets[0].actionVerb || 'Engineered',
        rationale: parsed.bullets[0].rationale || 'Enhanced using Google XYZ metrics formula',
        summaryOverview: parsed.summaryOverview || '',
      };
    }

    // High-quality multi-bullet heuristic fallback
    const actionVerbs = [
      'Architected', 'Engineered', 'Optimized', 'Spearheaded', 'Automated',
      'Implemented', 'Scaled', 'Refactored', 'Deployed', 'Designed'
    ];
    const metricsList = [
      'slashing latency by 35% and elevating system throughput by 2.2x',
      'reducing infrastructure costs by 28% while boosting uptime to 99.95%',
      'accelerating feature delivery cycles by 40% across cross-functional sprints',
      'cutting database query execution times by 55% across 2M+ records',
      'improving user engagement by 24% and decreasing client bounce rates by 18%'
    ];

    // Split candidate text into sentences or clauses to extract distinct subjects
    const segments = bullet
      .split(/[.\n;]+/)
      .map((s) => s.replace(/^(I |worked on |helped to |responsible for |skilled in |capable of )/i, '').trim())
      .filter((s) => s.length > 10);

    const generatedBullets = [];
    for (let i = 0; i < requestedCount; i++) {
      const verb = actionVerbs[i % actionVerbs.length];
      const metric = metricsList[i % metricsList.length];
      const sourceTopic = segments[i % (segments.length || 1)] || `${jobRole || 'software'} system architecture and data pipelines`;
      
      generatedBullets.push({
        bullet: `${verb} ${sourceTopic}, ${metric} utilizing industry-standard engineering best practices.`,
        actionVerb: verb,
        metric: metric.slice(0, 30),
        rationale: `Applied active technical verb "${verb}" and quantified business impact using STAR principles.`,
      });
    }

    return {
      bullets: generatedBullets,
      improvedBullet: generatedBullets[0].bullet,
      actionVerbUsed: generatedBullets[0].actionVerb,
      rationale: generatedBullets[0].rationale,
      summaryOverview: `Generated ${requestedCount} structured bullet points formatted for tech recruiter ATS screening.`,
    };
  }

  /**
   * Deep AI Resume Analysis for ATS compatibility and recruiter evaluation
   */
  static async analyzeResumeWithAI(resumeText, targetRole = 'Full-Stack Developer', jobDescription = '') {
    const prompt = `You are a Principal Technical Recruiter and ATS Resume Optimization Director.
Perform a thorough, expert ATS analysis of the following candidate resume for the target role: "${targetRole}".
${jobDescription ? `Target Job Description:\n"""${jobDescription.slice(0, 2500)}"""\n` : ''}

Candidate Resume Text:
"""
${resumeText.slice(0, 6000)}
"""

Provide an exacting, objective evaluation:
1. "overallScore": Integer from 0 to 100 representing realistic ATS compatibility and recruiter appeal.
2. "skillScore": Integer from 0 to 100 for core technical competence and tech stack alignment.
3. "formattingScore": Integer from 0 to 100 for section clarity, contact info, structure, and readability.
4. "executiveSummary": 2-3 sentence candid executive summary of the resume's strengths and competitive standing.
5. "matchedSkills": Array of technical skills, languages, tools, and methodologies clearly verified in the resume (up to 12).
6. "missingSkills": Array of top critical skills required for ${targetRole} that are absent or under-emphasized in the resume (up to 8).
7. "strengths": Array of 3-4 specific strengths that make this candidate stand out.
8. "improvements": Array of 3-4 prioritized, actionable improvements.
9. "bulletRevisions": Array of 2-3 specific before-and-after bullet rewrites:
   [
     {
       "original": "Weak bullet found in or inferred from the candidate resume",
       "revised": "High-impact Google XYZ formula rewrite starting with action verb and metric",
       "reason": "Why the rewrite is significantly more compelling to engineering hiring managers"
     }
   ]

Return strict JSON adhering to this schema only:
{
  "overallScore": 82,
  "skillScore": 85,
  "formattingScore": 78,
  "executiveSummary": "Candidate demonstrates solid foundational full-stack capabilities...",
  "matchedSkills": ["JavaScript", "React", "Node.js"],
  "missingSkills": ["Docker", "Kubernetes", "CI/CD"],
  "strengths": ["Clear project descriptions with technical stack mentions"],
  "improvements": ["Add quantifiable metrics to work experience bullet points"],
  "bulletRevisions": [
    {
      "original": "Worked on the API and database",
      "revised": "Architected resilient RESTful APIs in Node.js and optimized PostgreSQL queries, reducing endpoint response times by 38%",
      "reason": "Replaces passive duty statement with measurable performance improvement"
    }
  ]
}`;

    try {
      const raw = await this.executePrompt(prompt, 'You are an elite ATS resume analyzer and engineering hiring director. Return strict JSON only.');
      const parsed = extractJson(raw);

      if (parsed && typeof parsed.overallScore === 'number' && Array.isArray(parsed.matchedSkills)) {
        return parsed;
      }
    } catch (err) {
      console.warn('[AI Service] Note: Network AI unavailable for resume analysis:', err.message);
    }

    return null;
  }
}

export default AIService;

