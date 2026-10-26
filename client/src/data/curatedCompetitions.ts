export interface Competition {
  id: string;
  title: string;
  slug: string;
  category: 'Hackathon' | 'Algorithm Sprint' | 'Bug Bounty' | 'Full-Stack Speed Run';
  status: 'live' | 'upcoming' | 'completed';
  startsAt: string;
  endsAt: string;
  remainingTime: string;
  participantsCount: number;
  prizePool: string;
  difficulty: 'All Levels' | 'Intermediate' | 'Advanced';
  tags: string[];
  description: string;
  problemStatementBrief: string;
  sponsors: string[];
  isRegistered?: boolean;
}

export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatarUrl?: string;
  college: string;
  track: string;
  points: number;
  streakDays: number;
  problemsSolved: number;
  isCurrentUser?: boolean;
  badge?: string;
}

export const CURATED_COMPETITIONS: Competition[] = [
  {
    id: 'comp-1',
    title: 'Weekly Code Sprint #18: High-Throughput In-Memory Cache',
    slug: 'weekly-sprint-18',
    category: 'Algorithm Sprint',
    status: 'live',
    startsAt: '2026-10-25T10:00:00Z',
    endsAt: '2026-10-25T18:00:00Z',
    remainingTime: '3h 42m',
    participantsCount: 428,
    prizePool: '₹20,000 + Top Placement Referrals',
    difficulty: 'Intermediate',
    tags: ['Data Structures', 'LRU Cache', 'Concurrency', 'TypeScript / Python'],
    description: 'Design and implement an in-memory key-value cache engine supporting TTL expiration, thread-safe LRU eviction, and sub-millisecond lookups under high concurrent simulated workload.',
    problemStatementBrief: 'Implement CacheEngine with get(k), set(k, v, ttl), and purge() handling 10,000 ops/sec.',
    sponsors: ['RishabhLabs Campus Guild', 'TechNext Mentors'],
    isRegistered: true,
  },
  {
    id: 'comp-2',
    title: 'Smart India Hackathon (SIH) 2026 Internal Qualifier',
    slug: 'sih-2026-qualifier',
    category: 'Hackathon',
    status: 'upcoming',
    startsAt: '2026-10-29T09:00:00Z',
    endsAt: '2026-10-31T18:00:00Z',
    remainingTime: 'Starts in 4 days',
    participantsCount: 1250,
    prizePool: '₹1,50,000 + Direct Grand Finale Nomination',
    difficulty: 'All Levels',
    tags: ['Full-Stack', 'AI / ML', 'Mobile', 'Government Tech'],
    description: '48-Hour National Hackathon Qualifier. Build software solutions addressing smart agriculture, student career readiness, and decentralized verification systems.',
    problemStatementBrief: 'Choose from 12 Ministry problem statements and submit working prototype with GitHub repository.',
    sponsors: ['Ministry of Education Innovation Cell', 'AICTE'],
    isRegistered: true,
  },
  {
    id: 'comp-3',
    title: 'Speed Run #09: React 19 Server Components & Auth',
    slug: 'speed-run-09',
    category: 'Full-Stack Speed Run',
    status: 'upcoming',
    startsAt: '2026-10-31T14:00:00Z',
    endsAt: '2026-10-31T16:00:00Z',
    remainingTime: 'Starts Saturday 2:00 PM',
    participantsCount: 310,
    prizePool: '₹10,000 + Pro Lifetime Badges',
    difficulty: 'Intermediate',
    tags: ['React 19', 'Next.js App Router', 'Tailwind', 'Authentication'],
    description: '2-Hour Blitz: Scaffold an authenticated real-time dashboard from Figma spec using React 19 Server Actions, optimistic state, and Supabase / JWT.',
    problemStatementBrief: 'Speed benchmark: Fastest clean deployment with zero layout shift and 100% Lighthouse score wins.',
    sponsors: ['Vercel Community', 'RishabhLabs'],
    isRegistered: false,
  },
  {
    id: 'comp-4',
    title: 'Bug Bounty Arena #04: Secure JWT & IDOR Challenge',
    slug: 'bug-bounty-04',
    category: 'Bug Bounty',
    status: 'upcoming',
    startsAt: '2026-11-03T11:00:00Z',
    endsAt: '2026-11-04T11:00:00Z',
    remainingTime: 'Starts in 9 days',
    participantsCount: 220,
    prizePool: '₹25,000 Security Bounty Pool',
    difficulty: 'Advanced',
    tags: ['Cybersecurity', 'OWASP Top 10', 'JWT None Exploit', 'IDOR'],
    description: 'Penetrate an intentionally vulnerable banking microservice running in an isolated Docker sandbox. Find the 4 hidden secret flags by exploiting broken object-level authorization.',
    problemStatementBrief: 'Capture all 4 CTF flags and submit vulnerability report with reproduction steps.',
    sponsors: ['CyberDefend Guild'],
    isRegistered: false,
  },
  {
    id: 'comp-5',
    title: 'AI / ML Innovation Sprint: Multimodal Agentic Document Triage',
    slug: 'ai-ml-sprint-05',
    category: 'Hackathon',
    status: 'upcoming',
    startsAt: '2026-11-06T10:00:00Z',
    endsAt: '2026-11-08T18:00:00Z',
    remainingTime: 'Starts in 11 days',
    participantsCount: 380,
    prizePool: '₹35,000 + AI Compute Credits',
    difficulty: 'Intermediate',
    tags: ['AI / Machine Learning', 'RAG', 'Vector Embeddings', 'FastAPI / Python'],
    description: 'Build an autonomous agentic pipeline that parses untidy multimodal PDFs, generates high-density vector embeddings, and answers complex queries with zero hallucination.',
    problemStatementBrief: 'Deploy an API endpoint with <1.2s p99 latency that extracts tabular data from scanned receipts and performs audited verification.',
    sponsors: ['RishabhLabs AI Lab', 'HuggingFace Guild'],
    isRegistered: false,
  },
  {
    id: 'comp-6',
    title: 'Cloud & DevOps Blitz: Multi-Region Kubernetes Failover',
    slug: 'cloud-devops-blitz-06',
    category: 'Full-Stack Speed Run',
    status: 'upcoming',
    startsAt: '2026-11-10T14:00:00Z',
    endsAt: '2026-11-10T17:00:00Z',
    remainingTime: 'Starts in 15 days',
    participantsCount: 195,
    prizePool: '₹25,000 + Cloud Cert Vouchers',
    difficulty: 'Advanced',
    tags: ['Cloud & DevOps', 'Kubernetes', 'Terraform', 'Prometheus', 'Docker'],
    description: 'Automate a resilient infrastructure-as-code pipeline with zero-downtime failover across two cloud regions under simulated node outages.',
    problemStatementBrief: 'Simulate disaster recovery with sub-30 second RTO and zero data corruption.',
    sponsors: ['CloudNative Alliance', 'RishabhLabs'],
    isRegistered: false,
  },
];

export const CAMPUS_LEADERBOARDS: Record<string, LeaderboardUser[]> = {
  'GLA University': [
    {
      rank: 1,
      id: 'usr-gla-1',
      name: 'Aditya Sharma',
      college: 'GLA University',
      track: 'Web Development',
      points: 2940,
      streakDays: 34,
      problemsSolved: 74,
      badge: 'Campus Coding Champion',
    },
    {
      rank: 2,
      id: 'usr-gla-2',
      name: 'Priya Verma',
      college: 'GLA University',
      track: 'AI / Machine Learning',
      points: 2710,
      streakDays: 29,
      problemsSolved: 68,
      badge: 'GenAI Prodigy',
    },
    {
      rank: 3,
      id: 'usr-gla-3',
      name: 'Rohan Gupta',
      college: 'GLA University',
      track: 'Web Development',
      points: 2520,
      streakDays: 25,
      problemsSolved: 61,
      badge: 'Full-Stack Veteran',
    },
    {
      rank: 4,
      id: 'usr-gla-4',
      name: 'Ananya Dixit',
      college: 'GLA University',
      track: 'Mobile App Dev',
      points: 2310,
      streakDays: 22,
      problemsSolved: 55,
    },
    {
      rank: 5,
      id: 'usr-gla-5',
      name: 'Kartik Mathur',
      college: 'GLA University',
      track: 'Cyber Security',
      points: 2180,
      streakDays: 20,
      problemsSolved: 51,
    },
    {
      rank: 6,
      id: 'usr-gla-6',
      name: 'Simran Kaur',
      college: 'GLA University',
      track: 'Web Development',
      points: 2050,
      streakDays: 19,
      problemsSolved: 48,
    },
    {
      rank: 7,
      id: 'usr-gla-7',
      name: 'Deepak Chaudhary',
      college: 'GLA University',
      track: 'Data & Analytics',
      points: 1980,
      streakDays: 18,
      problemsSolved: 45,
    },
    {
      rank: 14,
      id: 'usr-current',
      name: 'Sakhi (You)',
      college: 'GLA University',
      track: 'Web Development',
      points: 1450,
      streakDays: 17,
      problemsSolved: 38,
      isCurrentUser: true,
      badge: 'Top 4% in Cohort',
    },
  ],
  'Global': [
    {
      rank: 1,
      id: 'usr-glob-1',
      name: 'Devanshu Patel',
      college: 'IIT Delhi',
      track: 'AI / Machine Learning',
      points: 3420,
      streakDays: 52,
      problemsSolved: 96,
      badge: 'Global Grandmaster',
    },
    {
      rank: 2,
      id: 'usr-glob-2',
      name: 'Sneha Mukherjee',
      college: 'NIT Trichy',
      track: 'Web Development',
      points: 3180,
      streakDays: 45,
      problemsSolved: 88,
      badge: 'Full-Stack Pioneer',
    },
    {
      rank: 3,
      id: 'usr-gla-1',
      name: 'Aditya Sharma',
      college: 'GLA University',
      track: 'Web Development',
      points: 2940,
      streakDays: 34,
      problemsSolved: 74,
      badge: 'Campus Legend',
    },
    {
      rank: 4,
      id: 'usr-glob-4',
      name: 'Arjun Nambiar',
      college: 'BITS Pilani',
      track: 'Cyber Security',
      points: 2890,
      streakDays: 31,
      problemsSolved: 72,
    },
    {
      rank: 5,
      id: 'usr-gla-2',
      name: 'Priya Verma',
      college: 'GLA University',
      track: 'AI / Machine Learning',
      points: 2710,
      streakDays: 29,
      problemsSolved: 68,
    },
    {
      rank: 28,
      id: 'usr-current',
      name: 'Sakhi (You)',
      college: 'GLA University',
      track: 'Web Development',
      points: 1450,
      streakDays: 17,
      problemsSolved: 38,
      isCurrentUser: true,
      badge: 'Top 8% Globally',
    },
  ],
};
