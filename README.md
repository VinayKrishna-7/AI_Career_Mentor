# CareerMentor

A modern career intelligence and study acceleration platform for tracking engineering roadmaps, analyzing skill gaps against industry taxonomies, and structuring daily focus sessions.

---

## Core Capabilities

- **Career Roadmaps & Milestones**: Structured career progression paths with phase-by-phase checklists and task completion metrics.
- **Skill-Gap Analysis**: Deterministic taxonomy matching comparing personal skills against role requirements and raw job descriptions.
- **Resume Suite**: PDF resume parsing with keyword density analysis and STAR-format accomplishment bullet refinement.
- **Study Planner & Focus Timer**: Daily time allocation engine with sequential timetables and integrated countdown timer.
- **Job Application Pipeline**: Kanban tracking board managing applications across screening, technical interviews, and offers.
- **Career Mentor**: Contextual advisory interface for tailored curriculum guidance and interview preparation.

---

## Architecture & Stack

- **Client**: React 19, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Server**: Node.js, Express, PostgreSQL (`pg`), JWT authentication, Zod validation
- **Analysis Engine**: Heuristic skill matching with optional Gemini / OpenAI enrichment

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL (local instance or cloud database such as Neon / Supabase)

### Setup

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Configure environment**:
   ```bash
   cp server/.env.example server/.env
   ```

3. **Initialize database schema**:
   ```bash
   npm run migrate
   npm run seed
   ```

4. **Launch development environment**:
   ```bash
   npm run dev
   ```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)
