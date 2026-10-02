export interface IOnboardingProfileInput {
  goal: string;
  currentLevel: string;
  availableTime: string;
  desiredOutcome: string;
  targetDate: string;
  existingSkills?: string[];
}

export interface INotSureAssessmentInput {
  interests: string[];
  currentSkills: string[];
  comfortLevel: string;
  preferredWork: string;
  timeAvailability: string;
}

class AIService {
  private getApiKey(): string | null {
    const key = process.env.GEMINI_API_KEY;
    if (key && key.trim() !== '') return key.trim();
    return null;
  }

  public isGeminiActive(): boolean {
    return this.getApiKey() !== null;
  }

  public async callGemini(prompt: string): Promise<string | null> {
    const key = this.getApiKey();
    if (!key) return null;

    // Supported modern models: flash-lite-latest, flash-latest, gemini-3.8-flash
    const models = ['gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-3.8-flash'];

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': key,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && typeof text === 'string') {
            return text;
          }
        } else {
          const errData = await res.text();
          console.warn(`Gemini model ${model} returned ${res.status}:`, errData.slice(0, 150));
        }
      } catch (err) {
        console.warn(`Gemini call error for ${model}:`, err);
      }
    }
    return null;
  }

  public async generateRoadmap(input: IOnboardingProfileInput) {
    const isWeb = input.goal.toLowerCase().includes('web');
    const isAI = input.goal.toLowerCase().includes('ai') || input.goal.toLowerCase().includes('ml') || input.goal.toLowerCase().includes('machine');
    const isData = input.goal.toLowerCase().includes('data') || input.goal.toLowerCase().includes('analytics');
    const isCyber = input.goal.toLowerCase().includes('cyber') || input.goal.toLowerCase().includes('security');

    let category = 'Web Development';
    if (isAI) category = 'AI / Machine Learning';
    else if (isData) category = 'Data / Analytics';
    else if (isCyber) category = 'Cybersecurity';

    // If Gemini API Key is configured, use Gemini for dynamic roadmap generation
    if (this.isGeminiActive()) {
      try {
        const prompt = `You are the lead curriculum architect at Rishabh Labs, a personalized execution platform for college students.
Generate a structured 6-stage roadmap for a student with the following profile:
- Target Goal Track: ${input.goal}
- Current Level: ${input.currentLevel}
- Available Time: ${input.availableTime}
- Desired Outcome: ${input.desiredOutcome}
- Target Timeline: ${input.targetDate}

Return ONLY valid JSON matching this schema:
{
  "category": "${category}",
  "nodes": [
    {
      "nodeId": "node-1",
      "stepNumber": 1,
      "title": "Stage Title (short, 2-3 words)",
      "subtitle": "Clear focus subtitle",
      "description": "Comprehensive explanation of what the student will master and build.",
      "estimatedHours": 20,
      "skillsCovered": ["Skill1", "Skill2", "Skill3"],
      "lessonsCount": 8,
      "projectsCount": 1,
      "iconName": "Terminal"
    }
  ]
}
IMPORTANT:
- Output exactly 6 sequential stages.
- Node 1 will be started by the student (0% completed).
- Return valid JSON only, no markdown backticks, no markdown fence.`;

        const text = await this.callGemini(prompt);
        if (text) {
          const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);

          if (parsed.nodes && Array.isArray(parsed.nodes) && parsed.nodes.length >= 4) {
            const formattedNodes = parsed.nodes.map((n: any, idx: number) => ({
              ...n,
              nodeId: `node-${idx + 1}`,
              stepNumber: idx + 1,
              status: idx === 0 ? ('in_progress' as const) : ('locked' as const),
              skillsCovered: n.skillsCovered || ['Foundations', 'Syntax'],
              lessonsCount: n.lessonsCount || 8,
              projectsCount: n.projectsCount || 1,
              iconName: n.iconName || (idx === 0 ? 'Terminal' : idx === 5 ? 'Award' : 'Code'),
            }));

            return {
              title: `${parsed.category || category} Execution Track`,
              slug: (parsed.category || category).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              category: parsed.category || category,
              targetLevel: input.currentLevel || 'Beginner',
              estimatedDailyTime: input.availableTime || '2 hr/day',
              totalDurationDays: 90,
              totalNodes: formattedNodes.length,
              completedNodes: 0,
              nodes: formattedNodes,
              isCustomGenerated: true,
            };
          }
        }
      } catch (err) {
        console.warn('Gemini roadmap generation fallback:', err);
      }
    }

    // Curated high-precision fallback tracks with STRICT ZERO COMPLETION for new users
    let nodes = [];

    if (isAI) {
      nodes = [
        {
          nodeId: 'node-1',
          stepNumber: 1,
          title: 'Python Foundations',
          subtitle: 'OOP, Typing & Algorithmic Thinking',
          description: 'Python 3.11+, virtual environments, data structures, and algorithmic problem-solving foundations.',
          status: 'in_progress' as const,
          estimatedHours: 20,
          skillsCovered: ['Python 3', 'OOP', 'Data Structures', 'Git'],
          lessonsCount: 8,
          projectsCount: 1,
          iconName: 'Terminal',
        },
        {
          nodeId: 'node-2',
          stepNumber: 2,
          title: 'NumPy & Pandas',
          subtitle: 'Vectorized Computing & Data Wrangling',
          description: 'Multidimensional tensors, matrix multiplications, dataframe cleaning, EDA, and aggregations.',
          status: 'locked' as const,
          estimatedHours: 30,
          skillsCovered: ['NumPy', 'Pandas', 'EDA', 'Matplotlib'],
          lessonsCount: 10,
          projectsCount: 2,
          iconName: 'Code',
        },
        {
          nodeId: 'node-3',
          stepNumber: 3,
          title: 'ML Algorithms',
          subtitle: 'Supervised & Unsupervised Learning',
          description: 'Linear/logistic regression, decision trees, random forests, clustering, and cross-validation with Scikit-Learn.',
          status: 'locked' as const,
          estimatedHours: 40,
          skillsCovered: ['Scikit-Learn', 'Feature Engineering', 'Evaluation Metrics'],
          lessonsCount: 12,
          projectsCount: 2,
          iconName: 'Layers',
        },
        {
          nodeId: 'node-4',
          stepNumber: 4,
          title: 'Deep Learning',
          subtitle: 'Neural Networks & PyTorch',
          description: 'Backpropagation, PyTorch tensors, CNNs for computer vision, and Transformer basics.',
          status: 'locked' as const,
          estimatedHours: 45,
          skillsCovered: ['PyTorch', 'Neural Networks', 'GPU Acceleration'],
          lessonsCount: 14,
          projectsCount: 2,
          iconName: 'Cpu',
        },
        {
          nodeId: 'node-5',
          stepNumber: 5,
          title: 'LLMs & RAG',
          subtitle: 'Generative AI & Vector Search',
          description: 'Prompt engineering, vector embeddings, Gemini API integration, and retrieval augmented generation.',
          status: 'locked' as const,
          estimatedHours: 35,
          skillsCovered: ['Gemini API', 'Vector Embeddings', 'RAG Pipelines'],
          lessonsCount: 10,
          projectsCount: 2,
          iconName: 'Bot',
        },
        {
          nodeId: 'node-6',
          stepNumber: 6,
          title: 'AI Product Shipping',
          subtitle: 'Deploying Scalable AI Microservices',
          description: 'FastAPI model serving, Docker containers, HuggingFace spaces, and proof-of-work portfolio deployment.',
          status: 'locked' as const,
          estimatedHours: 25,
          skillsCovered: ['FastAPI', 'Docker', 'MLOps', 'Portfolio'],
          lessonsCount: 6,
          projectsCount: 1,
          iconName: 'Award',
        },
      ];
    } else if (isData) {
      nodes = [
        {
          nodeId: 'node-1',
          stepNumber: 1,
          title: 'SQL Foundations',
          subtitle: 'Relational Queries & Filtering',
          description: 'SELECT queries, joins, aggregates, group by, and relational database schema design.',
          status: 'in_progress' as const,
          estimatedHours: 18,
          skillsCovered: ['SQL', 'PostgreSQL', 'Database Design'],
          lessonsCount: 8,
          projectsCount: 1,
          iconName: 'Terminal',
        },
        {
          nodeId: 'node-2',
          stepNumber: 2,
          title: 'Advanced Analytics',
          subtitle: 'Window Functions & CTEs',
          description: 'Master ROW_NUMBER(), RANK(), DENSE_RANK(), and cohort retention queries.',
          status: 'locked' as const,
          estimatedHours: 25,
          skillsCovered: ['Window Functions', 'CTEs', 'Query Optimization'],
          lessonsCount: 10,
          projectsCount: 2,
          iconName: 'Code',
        },
        {
          nodeId: 'node-3',
          stepNumber: 3,
          title: 'Python for Data',
          subtitle: 'Pandas, NumPy & Seaborn',
          description: 'Dataframe transformations, handling missing values, and exploratory visual dashboards.',
          status: 'locked' as const,
          estimatedHours: 35,
          skillsCovered: ['Pandas', 'NumPy', 'Seaborn', 'Matplotlib'],
          lessonsCount: 12,
          projectsCount: 2,
          iconName: 'Layers',
        },
        {
          nodeId: 'node-4',
          stepNumber: 4,
          title: 'ETL Pipelines',
          subtitle: 'Data Warehousing & Cleaning',
          description: 'Automated data ingestion, schema validation, BigQuery / Supabase pipelines.',
          status: 'locked' as const,
          estimatedHours: 30,
          skillsCovered: ['ETL', 'Pipelines', 'Data Cleaning'],
          lessonsCount: 10,
          projectsCount: 1,
          iconName: 'Server',
        },
        {
          nodeId: 'node-5',
          stepNumber: 5,
          title: 'BI Dashboards',
          subtitle: 'Interactive Metrics & Reporting',
          description: 'Building executive KPI dashboards, trend forecasting, and reporting.',
          status: 'locked' as const,
          estimatedHours: 25,
          skillsCovered: ['Dashboarding', 'KPI Tracking', 'Analytics'],
          lessonsCount: 8,
          projectsCount: 2,
          iconName: 'BarChart3',
        },
        {
          nodeId: 'node-6',
          stepNumber: 6,
          title: 'Proof of Work',
          subtitle: 'Portfolio & Data Case Studies',
          description: 'Publish documented GitHub repositories, interactive Streamlit/React dashboards, and data articles.',
          status: 'locked' as const,
          estimatedHours: 20,
          skillsCovered: ['Case Studies', 'GitHub', 'Documentation'],
          lessonsCount: 6,
          projectsCount: 1,
          iconName: 'Award',
        },
      ];
    } else {
      // Default: Web Development
      nodes = [
        {
          nodeId: 'node-1',
          stepNumber: 1,
          title: 'Foundations',
          subtitle: 'Internet, Terminal, Git & Architecture',
          description: 'Master how the web works, command line fluency, Git branch workflows and modern dev tooling.',
          status: 'in_progress' as const,
          estimatedHours: 15,
          skillsCovered: ['Git', 'GitHub', 'CLI', 'HTTP Basics'],
          lessonsCount: 6,
          projectsCount: 1,
          iconName: 'Terminal',
        },
        {
          nodeId: 'node-2',
          stepNumber: 2,
          title: 'HTML CSS JS',
          subtitle: 'Modern ES6+, DOM & Responsive Systems',
          description: 'Semantic HTML5, CSS Grid/Flexbox design tokens, closures, promises, and modern Array Methods.',
          status: 'locked' as const,
          estimatedHours: 35,
          skillsCovered: ['HTML5', 'Modern CSS', 'ES6+ JavaScript', 'Array Methods', 'DOM'],
          lessonsCount: 12,
          projectsCount: 2,
          iconName: 'Code',
        },
        {
          nodeId: 'node-3',
          stepNumber: 3,
          title: 'React',
          subtitle: 'Components, Hooks & State Management',
          description: 'Build reactive user interfaces, custom hooks, context, routing, and component lifecycles.',
          status: 'locked' as const,
          estimatedHours: 40,
          skillsCovered: ['React', 'TypeScript', 'Tailwind', 'State Management'],
          lessonsCount: 14,
          projectsCount: 2,
          iconName: 'Layers',
        },
        {
          nodeId: 'node-4',
          stepNumber: 4,
          title: 'Backend',
          subtitle: 'Node, Express, REST APIs & Auth',
          description: 'Build resilient server architectures, JWT authentication, rate limiting, and middleware.',
          status: 'locked' as const,
          estimatedHours: 30,
          skillsCovered: ['Node.js', 'Express', 'JWT Auth', 'REST APIs'],
          lessonsCount: 10,
          projectsCount: 1,
          iconName: 'Server',
        },
        {
          nodeId: 'node-5',
          stepNumber: 5,
          title: 'Projects',
          subtitle: 'Full-Stack Integration & Production Deployment',
          description: 'Connect React frontend with Express/Supabase backend, automated CI/CD, and monitoring.',
          status: 'locked' as const,
          estimatedHours: 45,
          skillsCovered: ['Full-Stack', 'Supabase', 'PostgreSQL', 'CI/CD'],
          lessonsCount: 8,
          projectsCount: 3,
          iconName: 'FolderGit2',
        },
        {
          nodeId: 'node-6',
          stepNumber: 6,
          title: 'Internship Ready',
          subtitle: 'Proof of Work, Mock Reviews & Placement',
          description: 'Refine live projects, optimize GitHub profile, complete technical interviews, and publish proof of work.',
          status: 'locked' as const,
          estimatedHours: 20,
          skillsCovered: ['Proof of Work', 'System Design Basics', 'Resume & Interview Prep'],
          lessonsCount: 5,
          projectsCount: 1,
          iconName: 'Award',
        },
      ];
    }

    return {
      title: `${category} Execution Track`,
      slug: category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      targetLevel: input.currentLevel || 'Beginner',
      estimatedDailyTime: input.availableTime || '2 hr/day',
      totalDurationDays: 90,
      totalNodes: nodes.length,
      completedNodes: 0,
      nodes,
      isCustomGenerated: true,
    };
  }

  public async generateDailyMission(dayNumber: number, track: string) {
    const isAI = track.toLowerCase().includes('ai') || track.toLowerCase().includes('ml') || track.toLowerCase().includes('machine');
    const isData = track.toLowerCase().includes('data') || track.toLowerCase().includes('analytics');
    const isCyber = track.toLowerCase().includes('cyber') || track.toLowerCase().includes('security');

    // If Gemini is active, generate real-time AI daily mission
    if (this.isGeminiActive()) {
      try {
        const prompt = `You are the lead daily coach at Rishabh Labs. Generate a focused Day ${dayNumber} Mission for the track: "${track}".
A mission MUST contain 4 sequential actions:
1. 'learn' (Interactive theory & architecture reading, 20-25 min)
2. 'practice' (Algorithmic / coding problem solving, 20-30 min)
3. 'build' (Real feature building in a project codebase, 35-45 min)
4. 'ship' (Git commit, deploy, or submit proof of work, 10-15 min)

Return ONLY valid JSON matching this schema:
{
  "quote": "Inspirational technical quote",
  "tasks": [
    {
      "taskId": "task-${dayNumber}-learn",
      "type": "learn",
      "title": "Learn - Title (XX min)",
      "durationMinutes": 25,
      "durationText": "25 min",
      "description": "Specific focus explanation",
      "actionUrl": "/learn",
      "proofRequired": false
    },
    {
      "taskId": "task-${dayNumber}-practice",
      "type": "practice",
      "title": "Practice - Title (XX min)",
      "durationMinutes": 20,
      "durationText": "20 min",
      "description": "Specific coding challenge to solve",
      "actionUrl": "/practice",
      "proofRequired": false
    },
    {
      "taskId": "task-${dayNumber}-build",
      "type": "build",
      "title": "Build - Title (XX min)",
      "durationMinutes": 40,
      "durationText": "40 min",
      "description": "Concrete feature implementation",
      "actionUrl": "/projects",
      "proofRequired": false
    },
    {
      "taskId": "task-${dayNumber}-ship",
      "type": "ship",
      "title": "Ship - Title (XX min)",
      "durationMinutes": 10,
      "durationText": "10 min",
      "description": "Commit or deployment action",
      "actionUrl": "/projects",
      "proofRequired": true
    }
  ]
}
IMPORTANT:
- All action URLs must be INTERNAL to Rishabh Labs (/learn, /practice, /projects).
- Return valid JSON only, no markdown fence.`;

        const text = await this.callGemini(prompt);
        if (text) {
          const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);

          if (parsed.tasks && Array.isArray(parsed.tasks) && parsed.tasks.length === 4) {
            const freshTasks = parsed.tasks.map((t: any) => ({
              ...t,
              isCompleted: false, // Clean initial state for new day
            }));

            return {
              dayNumber,
              trackTitle: track,
              dateString: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
              quote: parsed.quote || 'Small steps every day lead to big results.',
              tasks: freshTasks,
            };
          }
        }
      } catch (err) {
        console.warn('Gemini daily mission generation fallback:', err);
      }
    }

    // Curated high-precision fallback missions with 100% UNCOMPLETED status for Day 1
    let tasks = [];

    if (isAI) {
      tasks = [
        {
          taskId: `task-${dayNumber}-learn`,
          type: 'learn' as const,
          title: 'Learn - Python 3 Data Structures & Vectorization (25 min)',
          durationMinutes: 25,
          durationText: '25 min',
          description: 'Master list comprehensions, generator expressions, and avoiding nested loops in numerical computing.',
          isCompleted: false,
          actionUrl: '/learn',
          proofRequired: false,
        },
        {
          taskId: `task-${dayNumber}-practice`,
          type: 'practice' as const,
          title: 'Practice - Solve 2 Algorithmic Array Challenges (20 min)',
          durationMinutes: 20,
          durationText: '20 min',
          description: 'Implement twoSum and matrix rotation in the sandboxed Python execution editor.',
          isCompleted: false,
          actionUrl: '/practice/filter-active-users',
          proofRequired: false,
        },
        {
          taskId: `task-${dayNumber}-build`,
          type: 'build' as const,
          title: 'Build - Clean and Parse Raw CSV Dataset (40 min)',
          durationMinutes: 40,
          durationText: '40 min',
          description: 'Write a Python data preprocessing script handling nulls and type conversions for your project.',
          isCompleted: false,
          actionUrl: '/projects',
          proofRequired: false,
        },
        {
          taskId: `task-${dayNumber}-ship`,
          type: 'ship' as const,
          title: "Ship - Commit pipeline module to GitHub (10 min)",
          durationMinutes: 10,
          durationText: '10 min',
          description: 'Push your tested Python module with a clear commit message and docstrings.',
          isCompleted: false,
          actionUrl: '/projects',
          proofRequired: true,
        },
      ];
    } else if (isData) {
      tasks = [
        {
          taskId: `task-${dayNumber}-learn`,
          type: 'learn' as const,
          title: 'Learn - SQL Relational Schema & Indexing (25 min)',
          durationMinutes: 25,
          durationText: '25 min',
          description: 'Understand B-tree indexes, primary vs foreign keys, and query execution plans in PostgreSQL.',
          isCompleted: false,
          actionUrl: '/learn',
          proofRequired: false,
        },
        {
          taskId: `task-${dayNumber}-practice`,
          type: 'practice' as const,
          title: 'Practice - Solve Aggregation & Join Queries (20 min)',
          durationMinutes: 20,
          durationText: '20 min',
          description: 'Write complex multi-table joins and groupings in the coding workspace.',
          isCompleted: false,
          actionUrl: '/practice',
          proofRequired: false,
        },
        {
          taskId: `task-${dayNumber}-build`,
          type: 'build' as const,
          title: 'Build - Design Analytical Schema for Metrics (40 min)',
          durationMinutes: 40,
          durationText: '40 min',
          description: 'Draft the data tables and write migration scripts for your analytics project.',
          isCompleted: false,
          actionUrl: '/projects',
          proofRequired: false,
        },
        {
          taskId: `task-${dayNumber}-ship`,
          type: 'ship' as const,
          title: "Ship - Push schema migrations to GitHub (10 min)",
          durationMinutes: 10,
          durationText: '10 min',
          description: 'Commit your clean SQL schema files with documentation.',
          isCompleted: false,
          actionUrl: '/projects',
          proofRequired: true,
        },
      ];
    } else if (isCyber) {
      tasks = [
        {
          taskId: `task-${dayNumber}-learn`,
          type: 'learn' as const,
          title: 'Learn - TCP/IP Protocol Suite & Wireshark Packet Analysis (25 min)',
          durationMinutes: 25,
          durationText: '25 min',
          description: 'Analyze TCP three-way handshake, SYN floods, IP headers, and packet capture payloads.',
          isCompleted: false,
          actionUrl: '/learn/cybersecurity/tcp-ip-network-protocols',
          proofRequired: false,
        },
        {
          taskId: `task-${dayNumber}-practice`,
          type: 'practice' as const,
          title: 'Practice - Solve Input Sanitization & String Defense (20 min)',
          durationMinutes: 20,
          durationText: '20 min',
          description: 'Write input sanitation filters to block SQL injection and cross-site scripting vectors.',
          isCompleted: false,
          actionUrl: '/practice/filter-active-users',
          proofRequired: false,
        },
        {
          taskId: `task-${dayNumber}-build`,
          type: 'build' as const,
          title: 'Build - Implement Network Packet Sniffer & Port Scanner (40 min)',
          durationMinutes: 40,
          durationText: '40 min',
          description: 'Write asynchronous socket port probe script with timeout handling and service banner grabbing.',
          isCompleted: false,
          actionUrl: '/projects/network-packet-sniffer',
          proofRequired: false,
        },
        {
          taskId: `task-${dayNumber}-ship`,
          type: 'ship' as const,
          title: 'Ship - Commit Network Sniffer to GitHub with README (10 min)',
          durationMinutes: 10,
          durationText: '10 min',
          description: 'Push your tested security tool to your GitHub profile repository with usage instructions.',
          isCompleted: false,
          actionUrl: '/projects/network-packet-sniffer',
          proofRequired: true,
        },
      ];
    } else {
      // Default: Web Development
      tasks = [
        {
          taskId: `task-${dayNumber}-learn`,
          type: 'learn' as const,
          title: 'Learn - Modern JavaScript ES6+ & Array Methods (25 min)',
          durationMinutes: 25,
          durationText: '25 min',
          description: 'Deep-dive into map, filter, reduce, find, and slice. Understand immutability in modern web apps.',
          isCompleted: false,
          actionUrl: '/learn',
          proofRequired: false,
        },
        {
          taskId: `task-${dayNumber}-practice`,
          type: 'practice' as const,
          title: 'Practice - Solve 2 Coding Challenges (20 min)',
          durationMinutes: 20,
          durationText: '20 min',
          description: 'Solve "Filter Active Users" and "Two Sum" in the LeetCode-style code sandbox.',
          isCompleted: false,
          actionUrl: '/practice/filter-active-users',
          proofRequired: false,
        },
        {
          taskId: `task-${dayNumber}-build`,
          type: 'build' as const,
          title: 'Build - Add Dynamic Filtering to Project (40 min)',
          durationMinutes: 40,
          durationText: '40 min',
          description: 'Open your project codebase and add search query + category filtering pills.',
          isCompleted: false,
          actionUrl: '/projects',
          proofRequired: false,
        },
        {
          taskId: `task-${dayNumber}-ship`,
          type: 'ship' as const,
          title: "Ship - Push today's code to GitHub (10 min)",
          durationMinutes: 10,
          durationText: '10 min',
          description: 'Commit your clean code with a descriptive commit message and push to GitHub.',
          isCompleted: false,
          actionUrl: '/projects',
          proofRequired: true,
        },
      ];
    }

    return {
      dayNumber,
      trackTitle: track,
      dateString: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      quote: isAI
        ? 'Data is the foundation, but architecture is the engine.'
        : 'Small steps every day lead to big results.',
      tasks,
    };
  }

  public async generateProgressiveHint(
    level: 1 | 2 | 3 | 4,
    problemTitle: string,
    studentCode: string
  ) {
    if (this.isGeminiActive()) {
      try {
        const prompt = `You are a LeetCode problem solving coach at Rishabh Labs.
Problem: "${problemTitle}"
Current Student Code:
\`\`\`
${studentCode || '// no code written yet'}
\`\`\`
Target Hint Level: ${level} of 4.
Level 1: Core Concept without spoiling syntax or algorithms.
Level 2: Strategic Hint (data structure or invariant to consider).
Level 3: Algorithmic Approach (high level step-by-step logic, no direct code solution).
Level 4: Mentor Recommendation (suggest booking a 1:1 live mentor session to debug mental models).

Return ONLY valid JSON:
{
  "level": ${level},
  "title": "Level ${level}: Title",
  "hint": "Constructive pedagogical guidance."
}`;

        const text = await this.callGemini(prompt);
        if (text) {
          const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (parsed.hint) {
            return {
              level,
              title: parsed.title || `Level ${level}: Guidance`,
              hint: parsed.hint,
              recommendBooking: level === 4,
            };
          }
        }
      } catch (err) {
        console.warn('Gemini hint generation fallback:', err);
      }
    }

    // Default pedagogical hints
    if (level === 1) {
      return {
        level: 1,
        title: 'Level 1: Core Concept',
        hint: 'Examine the problem invariants. Are elements ordered? Can we solve this by identifying duplicates or pairs without scanning the entire collection multiple times?',
      };
    }
    if (level === 2) {
      return {
        level: 2,
        title: 'Level 2: Strategic Hint',
        hint: 'Consider using a Hash Map / Dictionary to store items you have already inspected. A lookup in a Hash Map is O(1) time complexity.',
      };
    }
    if (level === 3) {
      return {
        level: 3,
        title: 'Level 3: Algorithmic Approach',
        hint: 'Iterate through the collection once. For each element, calculate the required target complement. If the complement exists in your Hash Map, return the match. Otherwise, insert the current element.',
      };
    }
    return {
      level: 4,
      title: 'Level 4: Mentor Review',
      hint: 'You have worked through multiple attempts. Discussing this with a senior mentor will help solidify your mental model for algorithmic trade-offs.',
      recommendBooking: true,
    };
  }

  public async evaluateNotSurePath(answers: INotSureAssessmentInput) {
    const interestsStr = (answers.interests || []).join(' ').toLowerCase();
    const pref = (answers.preferredWork || '').toLowerCase();

    let recommended = 'Web Development';
    let matchScore = 92;
    let reasoning = 'Based on your interest in building visually engaging products and seeing instant feedback in the browser, Web Development is your fastest path to high-impact projects, hackathons, and software engineering internships.';

    if (pref.includes('data') || interestsStr.includes('math') || interestsStr.includes('analytics')) {
      recommended = 'Data / Analytics';
      matchScore = 89;
      reasoning = 'Your preference for analytical problem-solving, discovering trends, and working with real-world datasets makes Data Science & Analytics the ideal foundation for your career.';
    } else if (interestsStr.includes('ai') || interestsStr.includes('machine learning') || pref.includes('logic')) {
      recommended = 'AI / Machine Learning';
      matchScore = 94;
      reasoning = 'With your aptitude for algorithmic reasoning and passion for artificial intelligence, starting with the Python & Applied AI path gives you direct access to the fastest growing sector.';
    } else if (pref.includes('security') || interestsStr.includes('security') || interestsStr.includes('networks')) {
      recommended = 'Cybersecurity';
      matchScore = 88;
      reasoning = 'Your focus on systems architecture, defensive hardening, and network protocols aligns directly with our dedicated Security & Penetration Testing curriculum.';
    }

    return {
      recommendedPath: recommended,
      confidenceScore: matchScore,
      reasoning,
      startingMilestone: 'Phase 1: Foundations & Core Tooling',
      estimatedTimeToFirstProject: '14 days',
    };
  }

  public async analyzeHackathonProblem(problemStatement: string) {
    return {
      problemStatement,
      coreThemes: ['Automation', 'User Friction Reduction', 'Scalability'],
      recommendedAngle: 'Build a lightweight, highly observable solution that solves the painful middle 80% rather than an overly complex monolithic system.',
      suggestedTechStack: ['React', 'TypeScript', 'Node.js', 'Supabase', 'Tailwind CSS'],
      mvpScopeIn48Hours: [
        'User onboarding and role-based workspace',
        'Core algorithmic processing or AI workflow',
        'Interactive analytics dashboard',
        'Clean exportable report or shareable link',
      ],
      pitchHighlights: [
        'Quantify the pain point: Show time or capital wasted today.',
        'Live 60-second interactive demo with real data.',
        'Clear next-step monetization / adoption roadmap.',
      ],
      judgeQuestions: [
        {
          question: 'How do you handle edge cases and data validation at scale?',
          goodAnswerStrategy: 'Highlight server-side schema validation, async queue processing, and fallback recovery.',
        },
        {
          question: 'What is your competitive moat against existing open-source tools?',
          goodAnswerStrategy: 'Focus on frictionless UX, opinionated workflows, and student execution loops.',
        },
      ],
    };
  }
}

export const aiService = new AIService();
