# CareerMentor

An AI-powered career intelligence and study acceleration platform. CareerMentor combines role recommendations, skill-gap analysis, interactive roadmaps, and daily study planning to help developers and students navigate their professional growth.

---

## Features

- **Career Roadmaps & Fit Analysis**: Personalized role exploration with structured learning milestones, phase checklists, and readiness scores.
- **Deterministic Skill-Gap Mapping**: Compares current skills against industry role taxonomies and job postings to pinpoint missing competencies.
- **Resume Suite**: Upload PDF resumes to evaluate ATS keyword compatibility and transform bullet points using the Google XYZ / STAR framework.
- **Study Planner & Focus Timer**: Generate structured daily timetables and execute focus blocks with an integrated Pomodoro timer and audio chimes.
- **Job Tracker**: Kanban-style pipeline to monitor job applications through screening, interviewing, and offers.
- **AI Career Mentor Chat**: Context-aware guidance powered by Gemini / OpenAI with built-in heuristic fallbacks for offline development.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Node.js, Express.js, PostgreSQL (`pg`), JWT, Zod |
| **AI Integration** | Google Gemini, OpenAI, or local deterministic heuristic engine |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local instance or cloud database such as Neon / Supabase)

### Installation

1. **Install dependencies** for root, client, and server:
   ```bash
   npm run install:all
   ```

2. **Configure environment variables**:
   ```bash
   cp server/.env.example server/.env
   ```
   *(Update `server/.env` with your PostgreSQL `DATABASE_URL` and optional AI API keys).*

3. **Initialize the database** (optional for persistent DB):
   ```bash
   npm run migrate
   npm run seed
   ```

4. **Start the application**:
   ```bash
   npm run dev
   ```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)

