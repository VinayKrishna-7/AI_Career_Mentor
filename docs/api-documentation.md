# AI Career Mentor — REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. System Health
* `GET /api/health`
  * Returns backend status, uptime, and PostgreSQL connectivity.

---

## 2. Authentication (`/api/auth`)
* `POST /api/auth/register`
  * Body: `{ "name": "Jane Doe", "email": "jane@example.com", "password": "password123" }`
  * Response: Sets `token` HttpOnly cookie and returns user object.
* `POST /api/auth/login`
  * Body: `{ "email": "jane@example.com", "password": "password123" }`
  * Response: Sets `token` HttpOnly cookie and returns user object.
* `POST /api/auth/logout`
  * Clears authentication cookie.
* `GET /api/auth/me`
  * Protected. Returns current user details and career profile.

---

## 3. Career Profile (`/api/profile`)
* `GET /api/profile`
  * Protected. Returns profile for authenticated user.
* `PUT /api/profile`
  * Protected. Updates profile (education, degree, skills, interests, target_career, weekly_study_hours, etc.).

---

## 4. Career Matching & Skill Extraction (`/api/careers`)
* `GET /api/careers`
  * Returns all curated industry career roles.
* `GET /api/careers/:id`
  * Returns specific career role.
* `POST /api/careers/recommend`
  * Protected. Deterministically compares user's profile skills with career roles and enriches results with AI fit statements.
* `POST /api/careers/extract-skills`
  * Protected. Body: `{ "text": "Raw job description text from LinkedIn/Indeed..." }`. Extracts categorized skills using high-precision regex matching and compares against user's skills.

---

## 5. Roadmaps & Task Tracking (`/api/roadmaps`)
* `POST /api/roadmaps/generate`
  * Protected. Generates personalized 5-phase career roadmap using AI/deterministic engine and stores tasks in PostgreSQL.
* `GET /api/roadmaps`
  * Protected. Lists user's saved roadmaps with completion percentages.
* `GET /api/roadmaps/:id`
  * Protected. Fetches specific roadmap and associated tasks.
* `PATCH /api/roadmaps/:id/tasks/:taskId`
  * Protected. Updates task status (`Not Started`, `Learning`, `Completed`) and recalculates roadmap completion.
* `DELETE /api/roadmaps/:id`
  * Protected. Deletes roadmap and cascades delete to tasks.

---

## 6. AI Mentor Chat (`/api/chat`)
* `GET /api/chat/conversations`
  * Protected. Lists user conversation sessions.
* `POST /api/chat/conversations`
  * Protected. Starts a new conversation session.
* `GET /api/chat/conversations/:id/messages`
  * Protected. Returns message history.
* `POST /api/chat/conversations/:id/messages`
  * Protected. Body: `{ "content": "How do I transition to backend engineering?" }`. Stores user message and returns AI response.
* `DELETE /api/chat/conversations/:id`
  * Protected. Deletes conversation.

---

## 7. Resume Suite & Bullet Improver (`/api/resume`)
* `POST /api/resume/analyze`
  * Protected. Multipart form data (`resume`: PDF file, `target_role`, `job_description`).
  * In-memory text extraction, ATS score computation, missing keyword detection, and formatting validation.
* `POST /api/resume/improve-bullet`
  * Protected. Body: `{ "bullet": "original bullet", "jobRole": "Backend Developer" }`. Rewrites bullet point using the STAR / XYZ formula with action verbs and metrics.
* `GET /api/resume/analyses`
  * Protected. Returns past resume analysis summaries.
* `GET /api/resume/analyses/:id`
  * Protected. Returns full report.
* `DELETE /api/resume/analyses/:id`
  * Protected. Deletes analysis report.

---

## 8. Mock Interviews (`/api/interviews`)
* `POST /api/interviews`
  * Protected. Starts session with role-specific questions.
* `GET /api/interviews`
  * Protected. Lists interview sessions.
* `GET /api/interviews/:id`
  * Protected. Fetches session and question progress.
* `POST /api/interviews/:id/answers`
  * Protected. Body: `{ "questionId": 1, "answer": "..." }`. Evaluates answer with score and feedback.

---

## 9. Job Application Tracker (`/api/applications`)
* `GET /api/applications`
  * Protected. Lists user's tracked job applications.
* `POST /api/applications`
  * Protected. Body: `{ "company": "...", "position": "...", "location": "Remote", "status": "Applied", "salary": "...", "notes": "..." }`.
* `PATCH /api/applications/:id`
  * Protected. Updates application status (Applied, Screening, Interviewing, Offer, Rejected) or details.
* `DELETE /api/applications/:id`
  * Protected. Removes job application record.

---

## 10. Study Time Planner (`/api/planner`)
* `GET /api/planner/sessions`
  * Protected. Returns logged study sessions and weekly study hour targets.
* `POST /api/planner/sessions`
  * Protected. Body: `{ "subject": "React Hooks", "duration_minutes": 90, "completed": true }`. Logs study session.

---

## 11. Projects & Learning Resources (`/api`)
* `GET /api/projects/recommend`
  * Protected. Portfolio project recommendations based on target career.
* `POST /api/projects/generate-ideas`
  * Protected. Body: `{ "technology": "MERN Stack", "difficulty": "Intermediate", "projectType": "Web Application" }`. Generates 3 custom portfolio project ideas.
* `GET /api/resources`
  * Public. Verified official documentation links. Query filters: `?skill=react` or `?topic=backend`.
