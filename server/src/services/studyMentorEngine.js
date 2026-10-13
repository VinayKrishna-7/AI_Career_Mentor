/**
 * AI Study Mentor Knowledge Engine
 * Provides comprehensive, well-researched, academic-grade study guidance,
 * conceptual breakdowns, and structured roadmaps modeled after Claude and Gemini.
 */

// Study Topics Knowledge Base
export const STUDY_TOPICS = {
  // 1. Preparation Timeline & Months Breakdown
  TIMELINE_MONTHS: {
    matches: [
      'month', 'months', 'months only', 'about months', 'tell me about months',
      'how many months', 'how long', 'timeline', 'duration', 'weeks', 'how much time',
      'how many weeks', 'preparation time', 'study time', 'time needed', 'how long to prepare',
      'can i prepare in', '3 months', '6 months', 'preparation timeline', 'months breakdown',
      'study duration', 'just tell me about months', 'just tell me about months only'
    ],
    generate: (userMessage, profile) => `### ⏳ Preparation Timeline in Months: SDE Internship & Software Engineering

When preparing for an **SDE (Software Development Engineer) Internship** or entry-level software role, standard preparation spans **3 to 6 months** depending on your starting baseline and weekly commitment.

Here is the realistic, industry-tested breakdown across **3 distinct preparation tracks**:

---

### 1. Preparation Track Comparison

| Track | Target Audience | Weekly Commitment | Total Study Hours | Outcome Probability |
| :--- | :--- | :--- | :--- | :--- |
| **🚀 3-Month Sprint** | Prior coding knowledge (knows basic syntax & loops) | **20–25 hrs/week** | ~250–300 hrs | High for internship OAs & coding rounds |
| **⭐ 6-Month Gold Standard** | College students balancing classes & exams | **12–15 hrs/week** | ~300–350 hrs | **Recommended**: Deep mastery of DSA + 2 Projects + CS Theory |
| **🌱 9–12 Month Foundation** | Non-CS or absolute beginners starting from scratch | **6–8 hrs/week** | ~350–400 hrs | High long-term retention & strong fundamentals |

---

### 2. Month-by-Month Breakdown (The Recommended 6-Month Plan)

#### 🗓️ **Month 1: Language Fluency & Core Linear Data Structures**
* **Primary Objective:** Zero hesitation writing code in your primary language (**Java / C++ / Python**).
* **Topics Covered:** Arrays, Strings, HashMaps, HashSets, Two Pointers, Sliding Window.
* **Target:** 40 problems (30 Easy, 10 Medium on LeetCode / NeetCode 150).
* **Key Milestone:** Able to implement Two Pointers and Sliding Window patterns in $O(N)$ time without looking up syntax.

#### 🗓️ **Month 2: Non-Linear Structures & Algorithmic Search**
* **Primary Objective:** Master hierarchical data structures and $O(\\log N)$ search paradigms.
* **Topics Covered:** Linked Lists, Stacks (Monotonic Stack), Queues, Binary Trees, Binary Search Trees (BST), Binary Search on Answer Space.
* **Target:** 45 problems (15 Easy, 30 Medium).
* **Key Milestone:** Write clean tree traversals (In-order, Pre-order, Post-order, Level-order BFS) iteratively and recursively.

#### 🗓️ **Month 3: Graph Traversal & First Production Portfolio Project**
* **Primary Objective:** Tackle connectivity problems and initiate your primary portfolio asset.
* **DSA Topics:** Graph representations (Adjacency List), BFS, DFS, Topological Sort (Kahn's Algorithm), Heaps / Priority Queues.
* **Project Sprint (Weeks 3–4):** Build **Project 1** (Full-stack web application with authentication, database indexing, REST APIs, and automated tests). Deploy on Render / Vercel with GitHub documentation.
* **Target:** 35 problems (Graphs & Heaps).

#### 🗓️ **Month 4: Dynamic Programming (DP) & Core CS: Operating Systems**
* **Primary Objective:** Master optimal substructure and university OS theory.
* **DSA Topics:** 1D & 2D Dynamic Programming (Climbing Stairs, 0/1 Knapsack, Coin Change, Longest Common Subsequence).
* **Core CS Theory:** Operating Systems — Processes vs Threads, CPU Scheduling, Deadlocks, Mutex vs Semaphore, Virtual Memory & Paging.
* **Target:** 25 curated DP problems (focus on state transitions, not memorizing code).

#### 🗓️ **Month 5: Core CS: DBMS & Networks + Second High-Impact Project**
* **Primary Objective:** Nail the academic theory tested in technical interview rounds.
* **Core CS Theory:**
  * **DBMS:** ACID properties, SQL Joins & Subqueries, B+ Tree Indexing, Normalization (1NF to BCNF).
  * **Computer Networks:** TCP 3-way handshake vs UDP, HTTP/1.1 vs HTTP/2 vs HTTP/3, DNS resolution, REST vs WebSockets.
* **Project Sprint:** Polish or build **Project 2** (focusing on system performance, caching with Redis, or asynchronous message handling).

#### 🗓️ **Month 6: Online Assessment (OA) Sprints, Resume Engineering & Mock Interviews**
* **Primary Objective:** Transition from learning mode to competitive interview execution.
* **Timed OA Practice:** Solve 2 problems in 60 minutes under timed conditions (simulating HackerRank / Codility).
* **Resume Engineering:** 1-page single-column format using the Google XYZ formula: *"Accomplished [X] as measured by [Y] by doing [Z]"*.
* **Behavioral Prep:** Prepare 4 STAR stories (Leadership, Technical Conflict, Overcoming a Complex Bug, Tight Deadline).
* **Application Phase:** Cold outreach to recruiters and alumni referrals on LinkedIn.

---

### 3. What If You Only Have 3 Months? (The Intensive Sprint)

If your internship hiring season starts in **90 days**, compress the roadmap by focusing strictly on high-yield patterns:
* **Month 1:** NeetCode Blind 75 Arrays, Strings, HashMaps, Two Pointers, and Binary Search (60 problems).
* **Month 2:** Trees, Graphs (BFS/DFS), and complete 1 production full-stack project for your resume.
* **Month 3:** Top 15 Dynamic Programming patterns + Core CS summaries (OS & DBMS cheat sheets) + 10 timed mock tests.

---

### 💡 Suggested Action
Tell me:
1. **How many hours per week** can you realistically study?
2. **What is your target hiring month / year** (e.g., Summer or Fall)?

We can lock down your exact weekly study schedule right now!`
  },

  // 2. SDE Internship Roadmap & Overview
  SDE_INTERN: {
    matches: [
      'sde intern', 'sde internship', 'software engineering intern', 'swe intern',
      'software developer intern', 'become sde intern', 'get sde intern', 'cracking sde intern'
    ],
    generate: (userMessage, profile) => `### 🎓 Complete Roadmap to Crack an SDE (Software Development Engineer) Internship

Becoming a Software Development Engineer (SDE) intern requires structured preparation across **four core technical pillars**: Data Structures & Algorithms (DSA), Core Computer Science Fundamentals, Demonstrable Projects, and Technical Interview Communication.

---

### 1. The Four Foundational Pillars

#### **Pillar 1: One Primary Programming Language (Deep Mastery)**
* **Recommended Language:** **Java**, **C++**, or **Python**.
* **Depth Required:** Do not just learn basic syntax. Master:
  * Memory model (Stack vs. Heap, Garbage Collection or Pointer mechanics).
  * Standard Template Library (STL in C++) or Collections Framework (Java) or Python built-ins.
  * Object-Oriented Design principles (Encapsulation, Inheritance, Polymorphism, Abstraction).
  * Time and space complexity characteristics of built-in methods.

#### **Pillar 2: Data Structures & Algorithms (DSA)**
Top tech companies and high-growth startups test problem-solving through algorithmic rounds:
* **Weeks 1–3: Linear Data Structures:** Arrays, Strings, Hash Maps, Linked Lists, Two Pointers, Sliding Window.
* **Weeks 4–6: Non-Linear Structures:** Stacks & Queues, Binary Trees, Binary Search Trees (BST), Heaps / Priority Queues.
* **Weeks 7–9: Advanced Traversal & Graphs:** Recursion & Backtracking, Breadth-First Search (BFS), Depth-First Search (DFS), Topological Sort.
* **Weeks 10–12: Optimization Patterns:** Binary Search variants, Dynamic Programming (1D & 2D Memoization/Tabulation), Greedy Algorithms.
* **Target:** Master the **Blind 75** or **NeetCode 150** patterns. Strive for understanding the *pattern*, not memorizing the code.

#### **Pillar 3: Core Computer Science Fundamentals**
Interviewers for SDE internships heavily test university CS theory:
1. **Operating Systems:** Process vs. Thread, CPU Scheduling, Deadlocks & Synchronization (Semaphores, Mutexes), Virtual Memory & Paging.
2. **Database Management Systems (DBMS):** ACID properties, SQL Joins & Subqueries, Indexing (B+ Trees), Normalization (1NF to BCNF), NoSQL vs. Relational trade-offs.
3. **Computer Networks:** TCP/IP vs. UDP, HTTP/HTTPS lifecycle, DNS resolution, WebSockets, REST architecture.
4. **Object-Oriented Programming (OOP) & SOLID:** Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.

#### **Pillar 4: Production-Grade Portfolio Projects (Quality > Quantity)**
* Build **1 to 2 comprehensive full-stack or systems projects** rather than 5 generic tutorial clones (like basic todo apps).
* **What Interviewers Look For:**
  * Complex business logic (e.g., authentication, database indexing, rate limiting, asynchronous workers).
  * Clean architectural separation (Separation of Concerns, MVC, modular services).
  * Live deployment URL (Vercel, Render, Railway, AWS) + clear GitHub README with architectural diagrams.

---

### 2. 12-Week SDE Intern Study Sprint

| Timeframe | Primary Study Focus | Milestone / Deliverable |
| :--- | :--- | :--- |
| **Weeks 1–4** | Arrays, Strings, HashMaps, Sliding Window + Language Deep Dive | Solve 50 easy/medium problems; Implement STL/Collections from scratch |
| **Weeks 5–8** | Trees, Graphs, BFS/DFS, Recursion + Core CS Theory (OS & DBMS) | Complete 1 full-stack capstone project with database persistence & tests |
| **Weeks 9–10** | Dynamic Programming, Heaps + Computer Networks & OOP Revision | Polish resume (1-page, XYZ impact formula); Deploy portfolio |
| **Weeks 11–12** | Mock Technical Interviews + Online Assessment (OA) timed speed runs | Complete 5 timed mock coding rounds on LeetCode/Pramp |

---

### 3. Online Assessment (OA) & Interview Strategy
1. **Online Assessment (OA):** 70–90 minutes with 2–3 algorithmic problems. Focus on writing clean code with edge-case handling ($O(N)$ vs $O(N^2)$ constraints).
2. **Technical Rounds:** Always vocalize your thought process before typing. State the brute-force approach first, compute its Big-$O$, then discuss how to optimize using appropriate data structures.
3. **Behavioral (STAR Method):** Prepare 4 stories (Leadership, Overcoming a Bug, Conflict in Team, Tight Deadline) structured as **Situation, Task, Action, Result**.

---

### 💡 High-Leverage Action Item for Today
Start by choosing your primary language and implementing **Two Pointers and Sliding Window patterns** on 5 curated problems. Would you like me to walk through a specific DSA topic, explain a CS fundamental concept, or review your study schedule?`
  },

  // 3. Projects Guide
  PROJECTS_GUIDE: {
    matches: [
      'project', 'projects', 'portfolio', 'portfolio project', 'resume project',
      'what project to build', 'project ideas', 'capstone', 'github project'
    ],
    generate: () => `### 🛠️ Portfolio Projects That Actually Get You SDE Interviews

Recruiters and senior engineers review hundreds of resumes. What sets candidates apart is NOT building 10 generic tutorial apps (Todo lists, weather widgets, Netflix clones), but building **1 or 2 architecturally sound, production-grade applications**.

---

### 1. What Tech Hiring Managers Look For
* **Real Architectural Depth:** Did you implement user authentication (JWT/Cookies), database indexes, caching, or asynchronous jobs?
* **Clean Engineering Practices:** Modular file structure, environment variables (\`.env\`), parameterized SQL queries, error handling middleware, and unit tests.
* **Live Deployment & Polish:** A live URL (Vercel, Render, Railway, AWS) with an interactive demo and a GitHub README featuring an architecture diagram.

---

### 2. High-Impact Project Ideas for SDE Interns

#### **Idea 1: Real-Time Collaborative Workspace (Full-Stack + WebSockets)**
* **Core Tech:** React/TypeScript, Node.js, WebSockets (Socket.io), PostgreSQL, Redis.
* **Key Technical Challenge:** Conflict resolution for concurrent document updates, user presence indicators, and rate limiting chat streams.
* **Resume Impact:** *"Engineered a real-time collaborative workspace supporting concurrent user edits with WebSocket event channels and Redis caching, cutting message propagation latency to <50ms."*

#### **Idea 2: Distributed Job Scheduler / Background Task Worker (Systems / Backend)**
* **Core Tech:** Node.js / Go, PostgreSQL, Redis BullMQ, Docker.
* **Key Technical Challenge:** Scheduled cron tasks, retry policies with exponential backoff, dead-letter queues, and concurrency limits.
* **Resume Impact:** *"Architected a background job processing queue with Redis BullMQ and PostgreSQL, handling scheduled asynchronous tasks with automatic retry resilience."*

#### **Idea 3: AI-Augmented Workflow Platform (AI + Production Engineering)**
* **Core Tech:** React, Node.js / FastAPI, PostgreSQL with JSONB, LLM API integration with streaming responses.
* **Key Technical Challenge:** Structured JSON output validation (Zod / Pydantic), prompt token budgeting, rate-limiting API calls.

---

### 3. The 5-Point Portfolio Checklist
1. ✅ **GitHub README:** Includes Problem Statement, Tech Stack Badges, Architecture Diagram, and Local Setup Steps.
2. ✅ **Live Demo Link:** Verified working with sample test credentials provided.
3. ✅ **Database Persistence:** Real relational schema with primary/foreign keys and migrations.
4. ✅ **Security:** Passwords hashed with bcrypt; no plaintext secrets committed to Git.
5. ✅ **Edge-Case Handling:** Graceful 404/500 API responses and responsive mobile/desktop UI.

Would you like to design the schema or architecture for one of these projects together?`
  },

  // 4. Resume Guide
  RESUME_GUIDE: {
    matches: [
      'resume', 'cv', 'bullet point', 'bullet points', 'ats', 'resume format',
      'how to write resume', 'resume template', 'resume score'
    ],
    generate: () => `### 📄 SDE Resume Engineering: The High-Conversion Standard

A technical resume has one job: **get you the Online Assessment (OA) or initial interview**. Tech screeners spend an average of **6 to 8 seconds** reviewing a resume.

---

### 1. Structural Rules
* **Strictly 1 Page:** Never exceed one page for internship or entry-level roles.
* **Single-Column Layout:** Multi-column and fancy graphic resumes get mangled by Applicant Tracking Systems (ATS).
* **Section Order for Students:**
  1. Header (Name, Email, Phone, GitHub, LinkedIn, Portfolio)
  2. Education (Degree, University, Graduation Year, GPA if $\ge 3.5$)
  3. Technical Skills (Languages, Frameworks, Databases, Tools)
  4. Projects (2–3 impactful projects with live links & GitHub links)
  5. Experience / Open Source / Hackathons (if applicable)
  6. Achievements & Certifications (Competitive coding ratings, hackathon wins)

---

### 2. The Google XYZ Bullet Formula
Every bullet point under your projects and experience must follow Google's standard:
$$\\text{"Accomplished [X], as measured by [Y], by doing [Z]"}$$

* ❌ **Weak (Passive):** "Worked on backend and created APIs using Node.js and Express."
* ✅ **Strong (XYZ Formula):** *"Engineered 14 RESTful API endpoints using Node.js and Express, implementing JWT auth and bcrypt hashing to secure 500+ simulated user sessions."*
* ❌ **Weak (Passive):** "Used PostgreSQL for storing data."
* ✅ **Strong (XYZ Formula):** *"Designed normalized PostgreSQL relational schema with B+ tree indexes, optimizing query response times by 35% across 5 interconnected tables."*

---

### 3. High-Impact Action Verbs to Lead Every Bullet
* **Architected**, **Engineered**, **Implemented**, **Optimized**, **Spearheaded**, **Refactored**, **Streamlined**, **Automated**, **Deployed**.

Would you like me to review and rewrite any of your existing resume bullet points using the XYZ formula?`
  },

  // 5. Interview Rounds Guide
  INTERVIEW_ROUNDS: {
    matches: [
      'round', 'rounds', 'interview rounds', 'interview process', 'oa',
      'online assessment', 'hiring process', 'technical round', 'behavioral round'
    ],
    generate: () => `### 🎯 SDE Internship Interview Process: The 4 Critical Stages

Top tech companies (FAANG/MAMAA, unicorns, and high-growth startups) follow a structured 4-stage hiring funnel for SDE interns:

---

### Stage 1: Resume Screening & ATS Filter (Pass Rate: ~10–15%)
* Automated screening by ATS checking for keywords (Java, C++, React, SQL, DSA, Git).
* Recruiter glance checking graduation date, degree, project links, and GitHub activity.
* **Key Tip:** Use a clean 1-page single-column layout and include direct GitHub repository links.

---

### Stage 2: Online Assessment / OA (Pass Rate: ~20–30%)
* **Format:** 70–90 minutes on platforms like HackerRank, CodeSignal, or LeetCode.
* **Content:** 2–3 algorithmic problems (typically 1 Easy, 1–2 Medium).
* **Testing Criteria:** All test cases must pass (including hidden large-input constraints testing $O(N)$ vs $O(N^2)$).
* **Key Tip:** Always run edge cases manually (empty arrays, negative numbers, single-element inputs).

---

### Stage 3: Technical Coding Rounds (1 to 2 Rounds | 45–60 mins each)
* **Format:** 1-on-1 live coding session with a Senior Software Engineer via CoderPad or Google Docs.
* **Evaluation Matrix:**
  1. **Problem Solving:** Did you recognize the underlying pattern?
  2. **Code Quality:** Clean variable naming, modular functions, proper error checks.
  3. **Communication:** Did you vocalize your thought process before writing code?
  4. **Complexity Analysis:** Accurately stating Big-$O$ Time and Space complexity.
* **Protocol:** Always propose the brute-force approach first, compute its Big-$O$, then discuss optimization using HashMaps, Two Pointers, or Trees before typing code.

---

### Stage 4: Behavioral & Hiring Manager Round (30–45 mins)
* Evaluates culture fit, intellectual curiosity, teamwork, and how you respond to failure.
* **Framework:** Use the **STAR Method** (Situation, Task, Action, Result).
* **Must-Have Prepared Stories:**
  * A time you encountered an elusive bug and how you methodically debugged it.
  * A time you had a technical disagreement with a teammate and resolved it.
  * A project you built from scratch that you are proud of.

Would you like to simulate a mock technical question or practice a behavioral STAR scenario?`
  },

  // 6. DSA Guide
  DSA_GUIDE: {
    matches: [
      'dsa', 'data structures', 'algorithms', 'binary search', 'dynamic programming',
      'graphs', 'trees', 'leetcode', 'neetcode', 'time complexity', 'big o'
    ],
    generate: (userMessage) => `### 🧠 Master Data Structures & Algorithms (DSA): Analytical Study Guide

Data Structures & Algorithms form the mathematical and computational foundation of efficient software engineering. To study DSA effectively without burning out, you must focus on **algorithmic patterns** rather than memorizing individual problem solutions.

---

### 1. Essential Core Patterns Hierarchy

\`\`\`
Algorithmic Competency
├── 1. Array & String Transformations (Two Pointers, Sliding Window, Prefix Sum)
├── 2. Associative Mappings (HashMaps, Frequency Sets, Anagram Groups)
├── 3. Hierarchical Traversal (Trees: In-order, Pre-order, Level-order BFS)
├── 4. Connectivity & Flow (Graphs: Disjoint Set Union, Dijkstra, Topological Sort)
└── 5. Optimal Substructure (Recursion → Memoization → Bottom-Up DP)
\`\`\`

---

### 2. Deep Dive: Key Patterns to Master

#### **1. Two Pointers & Sliding Window**
* **When to use:** Linear sequences (Arrays/Strings) where you need to search for contiguous subsegments, pairs, or palindromes.
* **Why it matters:** Reduces quadratic $O(N^2)$ brute-force solutions to linear $O(N)$ by keeping track of boundary pointers.
* **Classic Problem Types:** *Trapping Rain Water*, *Longest Substring Without Repeating Characters*, *Container With Most Water*.

#### **2. Fast & Slow Pointers (Floyd's Cycle-Finding)**
* **When to use:** Linked lists or cyclic array sequences to detect loops or find the middle element in a single pass.
* **Complexity:** $O(N)$ Time, $O(1)$ Auxiliary Space.

#### **3. Binary Search on Answer Space**
* **Beyond simple array lookup:** When the search space is monotonic (sorted or strictly increasing/decreasing condition), formulate the problem as \`isFeasible(mid)\`.
* **Classic Problem Types:** *Koko Eating Bananas*, *Capacity To Ship Packages Within D Days*.

#### **4. Graph Search: BFS vs. DFS**
* **Breadth-First Search (BFS):** Uses a **Queue**. Guaranteed to find the *shortest path* in unweighted graphs.
* **Depth-First Search (DFS):** Uses a **Stack / Recursion**. Ideal for cycle detection, topological sorting, and exhaustive path enumeration.

#### **5. Dynamic Programming (DP) 4-Step Framework**
1. **Define State:** What subproblem variables represent a unique configuration? (e.g., \`dp[i][w]\` = maximum value using first $i$ items with capacity $w$).
2. **State Transition Relation:** Express \`dp[i]\` in terms of smaller subproblems (e.g., \`dp[i] = min(dp[i-1], dp[i-2]) + cost[i]\`).
3. **Base Cases:** Smallest trivial inputs (e.g., \`dp[0] = 0\`).
4. **Order of Computation:** Ensure required states are computed before accessing them (Bottom-up iteration).

---

### 3. The 3-Step Study Protocol (The Active Recall Method)
1. **20-Minute Independent Struggle:** Spend 20 minutes analyzing the problem, drawing diagrams on paper, and drafting pseudo-code.
2. **Pattern Identification (If Stuck):** Look only at the *pattern name* or hint (e.g., "Use Monotonic Stack"). Attempt again for 10 minutes.
3. **Synthesis & Spaced Repetition:** After solving or studying the optimal solution, write a 2-line summary of *why* this data structure was chosen. Revisit the problem 4 days later without looking at prior code.

Tell me which specific algorithm or pattern you are currently studying, and we will analyze a problem together step-by-step!`
  },

  // 7. Binary Search Deep Dive
  BINARY_SEARCH: {
    matches: ['binary search', 'search in sorted', 'bisect'],
    generate: () => `### 🔍 Deep Dive: Master Binary Search ($O(\\log N)$)

Binary Search is one of the most fundamental yet tricky algorithmic paradigms in computer science. It works by exploiting **monotonicity** (the property that a condition remains false up to a point, and true thereafter).

---

### 1. Mathematical Intuition & Time Complexity
* Each iteration divides the search space in half: $N \\to \\frac{N}{2} \\to \\frac{N}{4} \\to \\dots \\to 1$.
* Total iterations $k$: $\\frac{N}{2^k} = 1 \\implies 2^k = N \\implies k = \\log_2 N$.
* **Time Complexity:** $O(\\log N)$ worst and average case.
* **Space Complexity:** $O(1)$ iterative, $O(\\log N)$ recursive (due to call stack).

---

### 2. The Universal Production Template (Clean & Bug-Free)

\`\`\`javascript
function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  // Use <= so that the 1-element window [left, right] is checked
  while (left <= right) {
    // Avoid integer overflow: left + Math.floor((right - left) / 2)
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) {
      return mid; // Target found
    } else if (nums[mid] < target) {
      left = mid + 1; // Target is in the right half
    } else {
      right = mid - 1; // Target is in the left half
    }
  }

  return -1; // Not found
}
\`\`\`

---

### 3. The 3 Common Bugs to Guard Against
1. **Integer Overflow:** Writing \`(left + right) / 2\` can overflow 32-bit signed integers when $left + right > 2^{31}-1$. Always use \`left + (right - left) / 2\`.
2. **Infinite Loops:** If you update \`left = mid\` without $+1$, a 2-element array will loop infinitely.
3. **Off-by-One on Search Bounds:** Be clear whether your interval is closed \`[left, right]\` or half-open \`[left, right)\`.

---

### 4. Advanced Pattern: Binary Search on Answer Space
You can use Binary Search even if the array itself is not sorted, provided the predicate function $P(x)$ is monotonic (e.g., \`[false, false, true, true, true]\`):
* **Classic Problem:** *Koko Eating Bananas* (LeetCode 875)
* **Classic Problem:** *Capacity To Ship Packages Within D Days* (LeetCode 1011)

Try solving **LeetCode 704 (Binary Search)** and **LeetCode 33 (Search in Rotated Sorted Array)** using this template!`
  },

  // 8. Dynamic Programming Deep Dive
  DYNAMIC_PROGRAMMING: {
    matches: ['dynamic programming', 'memoization', 'tabulation', 'dp problem', 'knapsack'],
    generate: () => `### 🧩 Master Dynamic Programming (DP): The Systematic 4-Step Method

Dynamic Programming solves optimization problems by breaking them down into overlapping subproblems and remembering previous answers so we never solve the same problem twice.

---

### 1. When Does DP Apply? (The Two Prerequisites)
1. **Overlapping Subproblems:** The same subproblems are computed repeatedly (e.g., in naive recursive Fibonacci, $fib(3)$ is called multiple times).
2. **Optimal Substructure:** The optimal solution to the overall problem can be constructed from optimal solutions of its subproblems.

---

### 2. Top-Down (Memoization) vs. Bottom-Up (Tabulation)

| Dimension | Top-Down (Memoization) | Bottom-Up (Tabulation) |
| :--- | :--- | :--- |
| **Strategy** | Recursive with a cache / HashMap | Iterative table filling |
| **Call Stack** | Uses $O(N)$ recursive stack memory | $O(1)$ recursion overhead |
| **Mental Model** | Natural translation of recurrence relation | Requires determining optimal evaluation order |
| **Space Optimization** | Harder to optimize auxiliary space | Easy to reduce $O(N) \\to O(1)$ by keeping only previous states |

---

### 3. Concrete Example: 0/1 Knapsack Framework

\`\`\`javascript
// Bottom-Up Tabulation for 0/1 Knapsack
function knapsack(weights, values, capacity) {
  const n = weights.length;
  // dp[w] stores max value achievable with capacity w
  const dp = new Array(capacity + 1).fill(0);

  for (let i = 0; i < n; i++) {
    // Traverse backwards to ensure each item is used at most once
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }

  return dp[capacity];
}
\`\`\`

---

### 4. High-Yield DP Study Progression
1. **1D DP:** Climbing Stairs, House Robber, Coin Change.
2. **2D Grid DP:** Unique Paths, Minimum Path Sum.
3. **Strings DP:** Longest Common Subsequence (LCS), Edit Distance.
4. **Subsets & Knapsack:** Partition Equal Subset Sum, Target Sum.

Pick one problem from the 1D DP list (e.g., *Coin Change* or *House Robber*), and let's construct the recurrence relation step-by-step together!`
  },

  // 9. Core Computer Science Fundamentals
  CS_FUNDAMENTALS: {
    matches: [
      'os', 'operating systems', 'dbms', 'database management', 'computer networks',
      'networking', 'oop', 'object oriented', 'system design', 'solid principles'
    ],
    generate: (userMessage) => `### 🏛️ Core Computer Science Fundamentals: Rigorous Academic Breakdown

Technical interviews and high-performance software engineering require deep theoretical comprehension of the underlying execution environment, networking layers, and data durability engines.

---

### 1. Operating Systems (OS) Essentials
* **Process vs. Thread:**
  * **Process:** Isolated unit of execution with its own virtual address space (Text, Data, Heap, Stack). Context switching is expensive.
  * **Thread:** Lightweight execution unit sharing the address space of its parent process. Faster context switching; requires thread synchronization to prevent race conditions.
* **Concurrency Primitives:**
  * **Mutex (Mutual Exclusion):** Locking mechanism owned by a single thread at a time.
  * **Semaphore:** Signaling mechanism with an integer counter (Counting Semaphore / Binary Semaphore).
* **Virtual Memory & Paging:**
  * Translates virtual addresses to physical RAM via Page Tables and the TLB (Translation Lookaside Buffer).
  * **Page Fault:** Triggered when referenced memory is not currently resident in physical RAM.

---

### 2. Database Management Systems (DBMS) & Storage Engines
* **ACID Guarantees:**
  * **Atomicity:** All operations in a transaction succeed or all roll back.
  * **Consistency:** The database transitions from one valid state to another, respecting all constraints.
  * **Isolation:** Concurrent transactions execute without cross-contamination (Read Uncommitted, Read Committed, Repeatable Read, Serializable).
  * **Durability:** Committed transactions persist through system crashes (Write-Ahead Logging / WAL).
* **Indexing Mechanics:**
  * **B+ Trees:** Balanced search tree used by PostgreSQL and MySQL InnoDB. Leaf nodes form a doubly linked list, enabling lightning-fast range queries ($O(\\log N)$ lookup, sequential range scan).
  * **Hash Indexes:** $O(1)$ point lookups, but completely unsuitable for range filtering (\`WHERE age BETWEEN 20 AND 30\`).

---

### 3. Computer Networks: Protocol Architecture
* **TCP vs. UDP:**
  * **TCP (Transmission Control Protocol):** Connection-oriented, guarantees ordered packet delivery, performs congestion control and flow control via 3-way handshake (\`SYN\` -> \`SYN-ACK\` -> \`ACK\`).
  * **UDP (User Datagram Protocol):** Connectionless, zero delivery guarantee, minimal latency overhead. Used in real-time gaming, DNS lookups, and video streaming.
* **HTTP/1.1 vs. HTTP/2 vs. HTTP/3:**
  * **HTTP/1.1:** Head-of-line blocking at the application level; multiple persistent connections needed.
  * **HTTP/2:** Single TCP connection with binary framing, multiplexed concurrent streams, and header compression (HPACK).
  * **HTTP/3:** Replaces TCP with **QUIC** over UDP to eliminate transport-layer head-of-line blocking when packets drop.

---

### 4. SOLID Design Principles for Clean Engineering
1. **Single Responsibility (SRP):** A class or module should have only one reason to change.
2. **Open/Closed (OCP):** Open for extension, closed for modification (via interfaces/abstract contracts).
3. **Liskov Substitution (LSP):** Subtypes must be substitutable for their base types without altering correctness.
4. **Interface Segregation (ISP):** Clients should not be forced to depend upon methods they do not use.
5. **Dependency Inversion (DIP):** High-level modules should depend on abstractions, not concrete implementations.

Which of these domains are you currently studying for your exams or interviews?`
  },

  // 10. Study Habits & Routine
  STUDY_HABITS: {
    matches: [
      'how to study', 'study schedule', 'study plan', 'study routine', 'consistency',
      'focus', 'pomodoro', 'tutorial hell', 'how should i learn', 'learning strategy'
    ],
    generate: (userMessage, profile) => `### ⏱️ High-Efficiency Technical Study Framework (Cognitive Science-Backed)

Learning complex computer science topics and software development requires moving beyond passive video watching ("tutorial hell") to active neural synthesis and deliberate practice.

---

### 1. The 3 Science-Backed Learning Strategies

#### **1. Active Recall Over Passive Review**
* **The Problem:** Re-reading notes or following a tutorial makes your brain feel fluent, but creates an "illusion of competence."
* **The Protocol:** Close the documentation or video. Write down the concept, architecture, or code from memory. Explain it out loud as if teaching a freshman student (The **Feynman Technique**).

#### **2. Spaced Repetition (The Ebbinghaus Forgetting Curve)**
* Rather than cramming 8 hours in one day, study 1.5–2 hours consistently every day.
* Review solved DSA problems or technical concepts at increasing intervals: **Day 1, Day 3, Day 7, Day 21**.

#### **3. The "Build-Measure-Learn" Sandbox (Escaping Tutorial Hell)**
Whenever you finish a learning module:
* Change 3 major features in the example project without looking at the tutorial.
* Break the code on purpose, observe the terminal error stack trace, and debug it independently.
* Integrate an external library or custom database table.

---

### 2. Recommended Daily Study Architecture (for ${profile.weekly_study_hours || 10} hrs/week)

| Time Block | Focus | Cognitive Load |
| :--- | :--- | :--- |
| **First 45 Mins** | Algorithmic Problem Solving (1–2 problems) | Peak mental focus; no phone / distractions |
| **10 Min Break** | Physical movement / Hydration | Diffuse mode thinking |
| **Next 45 Mins** | Core Concept or Project Implementation | Active coding / Schema design / API building |
| **Final 15 Mins** | Synthesis & Documentation | Write 3 bullet points summarizing what you learned |

Tell me what specific subject or language you want to schedule this week, and we will construct a personalized daily study calendar!`
  },

  // 11. Off Topic Guardrail
  OFF_TOPIC: {
    matches: [
      'weather', 'recipe', 'movie', 'joke', 'celebrity', 'sports', 'football',
      'cricket', 'game', 'dating', 'fashion', 'music', 'politics', 'song', 'cook', 'cake', 'pasta'
    ],
    generate: () => `I can only answer questions related to your studies, coding, and projects.`
  }
};

/**
 * Intelligent Fallback Generator when external LLM is not connected.
 * Analyzes the user's message, detects domain and intent, and generates
 * high-definition, structured, research-backed study responses.
 */
export function generateOfflineStudyResponse(message = '', conversationHistory = [], profile = {}) {
  const cleanInput = (message || '').toLowerCase().trim();

  // 1. Timeline / Duration / Months intent (Check this FIRST to catch "months only", "how many months", etc.)
  const isTimelineQuery =
    cleanInput.includes('month') ||
    cleanInput.includes('timeline') ||
    cleanInput.includes('how long') ||
    cleanInput.includes('duration') ||
    cleanInput.includes('how much time') ||
    cleanInput.includes('how many weeks') ||
    cleanInput.includes('weeks') ||
    cleanInput.includes('time needed') ||
    cleanInput.includes('preparation time');

  if (isTimelineQuery) {
    return STUDY_TOPICS.TIMELINE_MONTHS.generate(message, profile);
  }

  // 2. Projects & Portfolio Intent
  if (STUDY_TOPICS.PROJECTS_GUIDE.matches.some((m) => cleanInput.includes(m))) {
    return STUDY_TOPICS.PROJECTS_GUIDE.generate();
  }

  // 3. Resume & CV Intent
  if (STUDY_TOPICS.RESUME_GUIDE.matches.some((m) => cleanInput.includes(m))) {
    return STUDY_TOPICS.RESUME_GUIDE.generate();
  }

  // 4. Interview Rounds & OA Intent
  if (STUDY_TOPICS.INTERVIEW_ROUNDS.matches.some((m) => cleanInput.includes(m))) {
    return STUDY_TOPICS.INTERVIEW_ROUNDS.generate();
  }

  // 5. Check for SDE Intern / Internship intent
  if (STUDY_TOPICS.SDE_INTERN.matches.some((m) => cleanInput.includes(m))) {
    return STUDY_TOPICS.SDE_INTERN.generate(message, profile);
  }

  // 6. Specialized Algorithmic Topics
  if (STUDY_TOPICS.BINARY_SEARCH.matches.some((m) => cleanInput.includes(m))) {
    return STUDY_TOPICS.BINARY_SEARCH.generate();
  }

  if (STUDY_TOPICS.DYNAMIC_PROGRAMMING.matches.some((m) => cleanInput.includes(m))) {
    return STUDY_TOPICS.DYNAMIC_PROGRAMMING.generate();
  }

  // 7. General DSA / LeetCode intent
  if (STUDY_TOPICS.DSA_GUIDE.matches.some((m) => cleanInput.includes(m))) {
    return STUDY_TOPICS.DSA_GUIDE.generate(message);
  }

  // 8. Check for CS Fundamentals intent
  if (STUDY_TOPICS.CS_FUNDAMENTALS.matches.some((m) => cleanInput.includes(m))) {
    return STUDY_TOPICS.CS_FUNDAMENTALS.generate(message);
  }

  // 9. Check for Study Strategy / Routine intent
  if (STUDY_TOPICS.STUDY_HABITS.matches.some((m) => cleanInput.includes(m))) {
    return STUDY_TOPICS.STUDY_HABITS.generate(message, profile);
  }

  // 10. Check for off-topic query
  if (STUDY_TOPICS.OFF_TOPIC.matches.some((m) => cleanInput.includes(m))) {
    return STUDY_TOPICS.OFF_TOPIC.generate();
  }

  // 11. Generic Greeting (Hi / Hello / Hey)
  if (/^(hi|hello|hey|greetings|hola|good morning|good evening|good afternoon|just hi|just hello)/i.test(cleanInput)) {
    return `Hello! 👋 How can I help you with your studies, coding, or projects today?`;
  }

  // 12. Dynamic Query Resolution
  return generateDynamicTopicResponse(message, conversationHistory, profile);
}

/**
 * Intelligent pedagogical responder for arbitrary questions or concepts.
 * Never outputs robotic template text like "Core Definition: Just tell me...".
 */
function generateDynamicTopicResponse(message, conversationHistory = [], profile = {}) {
  const raw = (message || '').trim();
  const lower = raw.toLowerCase();

  // If the query is an interrogative / conversational query
  const isQuestion =
    /^(can|how|what|why|is|should|where|which|when|do|does|tell|explain|give)\b/i.test(lower) ||
    lower.includes('?') ||
    lower.startsWith('i want') ||
    lower.startsWith('i need');

  if (isQuestion) {
    // Check if previous history was about SDE or internships
    const wasDiscussingSDE = conversationHistory.some(
      (m) =>
        (m.content || '').toLowerCase().includes('sde') ||
        (m.content || '').toLowerCase().includes('intern')
    );

    return `### 💡 Mentor Guidance: Analyzing Your Question

Regarding your question:
> **"${raw}"**

---

### Key Recommendations from a Senior Engineering Mentor:

1. **Focus on High-Leverage Milestones First:**
   Whether you are studying Data Structures & Algorithms, designing system architecture, or building full-stack applications, prioritize understanding the **underlying engineering trade-offs** over surface-level memorization.
   
2. **Daily Deliberate Practice:**
   - Dedicate **60–90 minutes daily** to active problem solving or active coding rather than passive tutorial consumption.
   - For algorithmic problems, always analyze the **Time Complexity ($O(N)$)** and **Space Complexity** before implementing your final solution.

3. **Production Portfolio Over Tutorial Clones:**
   - Build projects with real database persistence (PostgreSQL/SQL), secure authentication (JWT/bcrypt), and live deployment.
   - Document your architecture cleanly on GitHub with clear system design diagrams.

---

### 🎯 Next Practical Step
Would you like me to:
* Break down a **specific algorithm or data structure** (e.g., Binary Search, Graph BFS/DFS, Dynamic Programming)?
* Walk through an **SDE interview preparation roadmap**?
* Review your **study schedule and weekly hour allocation**?`;
  }

  // If user typed a clean concept name (e.g. "Recursion", "Trie", "Kafka", "Docker", "PostgreSQL")
  const cleanConcept = raw
    .replace(/^(what is|explain|tell me about|how to learn|how does|teach me|study guide for)\s+/i, '')
    .replace(/[?.!]+$/, '')
    .trim();

  const displayConcept = cleanConcept.length > 0
    ? cleanConcept.charAt(0).toUpperCase() + cleanConcept.slice(1)
    : 'Software Engineering Concepts';

  return `### 📖 Academic Study Guide: **${displayConcept}**

To help you master **${displayConcept}** systematically, here is a structured pedagogical breakdown covering theoretical concepts, implementation mechanics, common pitfalls, and study milestones.

---

### 1. Conceptual Definition & Core Purpose
* **Core Principle:** In modern software architecture and computer science, **${displayConcept}** serves as a vital component for scalable, high-performance system execution.
* **Why It Matters:** Understanding the core mechanics and trade-offs of this topic distinguishes surface-level coders from engineers who can evaluate performance bottlenecks and write reliable, production-ready software.

---

### 2. Theoretical Mechanics & How It Works
When analyzing **${displayConcept}**, focus on these analytical layers:
1. **Execution Flow & State Management:** How state transitions occur, how memory is allocated, and what the concurrency guarantees are.
2. **Complexity Characteristics:**
   * **Time Complexity:** Average and worst-case bounds ($O(1)$, $O(\\log N)$, $O(N)$).
   * **Space Complexity:** Auxiliary heap allocation vs. recursive stack overhead.
3. **Architectural Trade-offs:** When to choose this approach versus alternative paradigms.

---

### 3. Practical Implementation & Best Practices
* **Enforce Clean Interfaces:** Maintain modular design, single responsibility (SRP), and clear contracts between components.
* **Defensive Boundary Handling:** Test edge cases, empty states, and abnormal error conditions.
* **Testing:** Write automated unit tests verifying nominal and failure paths.

---

### 4. Common Pitfalls & Interview Traps
* **Trap 1:** Neglecting edge-case bounds (empty inputs, integer overflow, race conditions).
* **Trap 2:** Confusing average-case with worst-case performance under adversarial inputs.
* **Trap 3:** Applying premature optimization before measuring actual system bottlenecks.

---

### 🎯 Recommended Practice
* Would you like to see a **concrete code example** implementing ${displayConcept}?
* Or would you like to review **real interview questions** testing this concept?`;
}

export default {
  STUDY_TOPICS,
  generateOfflineStudyResponse,
};
