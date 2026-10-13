# AI Career Mentor — System Architecture

## Architecture Overview

```
                      +-----------------------------+
                      |     Client (React + Vite)    |
                      | Tailwind CSS + Lucide Icons |
                      |    Recharts Visualizations  |
                      +--------------+--------------+
                                     |
                          HTTPS / REST / Cookies
                                     |
                      +--------------v--------------+
                      |     Backend (Express ES)    |
                      |   JWT HttpOnly Auth, Zod    |
                      |  Helmet, Rate-limit, CORS   |
                      +------+---------------+------+
                             |               |
               SQL Queries   |               |   LLM Prompts
               (node-postgres)|               |   (Zod Validated)
                             v               v
                +--------------------+   +-----------------------+
                |     PostgreSQL     |   |   Google Gemini /     |
                | Normalized Tables  |   |       OpenAI          |
                |  UUIDs & JSONB     |   | (Fallback Heuristics) |
                +--------------------+   +-----------------------+
```

## Security & Privacy Protections
1. **HttpOnly Cookie Architecture:** Tokens are stored in HTTP-only cookies protected against JavaScript XSS retrieval.
2. **Deterministic Fallbacks:** AI provider outages or missing API keys never break user flows; comprehensive heuristic algorithms provide seamless fallback behavior.
3. **In-Memory Resume Processing:** Resumes uploaded in PDF format are processed directly in memory buffer and discarded; only structured parsed metadata and scores are stored in PostgreSQL.
4. **Parameterized SQL:** All database interactions use parameter markers (`$1`, `$2`), completely preventing SQL injection.
5. **Ownership Isolation:** All queries modifying or fetching user-specific records enforce strict `WHERE user_id = $1` checks using the authenticated JWT token identity.
