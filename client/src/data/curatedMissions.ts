import { DailyMission } from "../types";
import { normalizeTrackName } from "./curatedRoadmaps";

export const CURATED_MISSIONS: Record<string, DailyMission> = {
  "App Development": {
    _id: "mission-app-dev-day-1",
    dayNumber: 1,
    trackTitle: "App Development",
    dateString: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
    quote: "Mobile development is about crafting tactile experiences. When a touch responds in under 16ms, users fall in love with your app.",
    isAllCompleted: false,
    completedTasksCount: 0,
    tasks: [
      {
        taskId: "app-t1",
        type: "learn",
        title: "Master React Native Architecture & the Hermes Engine",
        durationMinutes: 20,
        durationText: "20 min",
        description: "Study how React Native executes JavaScript on the Hermes VM and communicates asynchronously with the native UI thread over the JSI (JavaScript Interface).",
        isCompleted: false,
        actionUrl: "/learn",
        proofRequired: false,
      },
      {
        taskId: "app-t2",
        type: "practice",
        title: "Scaffold a Cross-Platform Flexbox Screen Layout",
        durationMinutes: 25,
        durationText: "25 min",
        description: "Construct a responsive mobile screen layout handling safe area insets, vertical flexbox flow, and dynamic aspect-ratio image containers.",
        isCompleted: false,
        actionUrl: "/practice",
        proofRequired: false,
      },
      {
        taskId: "app-t3",
        type: "build",
        title: "Build Mobile Auth Card with Tactile Press Feedback",
        durationMinutes: 35,
        durationText: "35 min",
        description: "Implement a reusable mobile card component featuring smooth Pressable scale animations, keyboard avoiding view wrapper, and custom text inputs.",
        isCompleted: false,
        actionUrl: "/projects",
        proofRequired: false,
      },
      {
        taskId: "app-t4",
        type: "ship",
        title: "Ship Git Commit: Initial Mobile App Scaffold & Components",
        durationMinutes: 15,
        durationText: "15 min",
        description: "Commit your clean mobile codebase with ESLint/Prettier configuration and verify it runs cleanly on iOS/Android emulators.",
        isCompleted: false,
        actionUrl: "/missions",
        proofRequired: true,
      },
    ],
  },
  "Web Development": {
    _id: "mission-web-dev-day-1",
    dayNumber: 1,
    trackTitle: "Web Development",
    dateString: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
    quote: "The web is the most accessible platform on Earth. Master the fundamentals and you can deliver software to billions in seconds.",
    isAllCompleted: false,
    completedTasksCount: 0,
    tasks: [
      {
        taskId: "web-t1",
        type: "learn",
        title: "JavaScript Event Loop, Microtasks & React 19 State Models",
        durationMinutes: 20,
        durationText: "20 min",
        description: "Understand the call stack, macrotask queue, microtask queue (Promises), and how React 19 batches state transitions seamlessly.",
        isCompleted: false,
        actionUrl: "/learn",
        proofRequired: false,
      },
      {
        taskId: "web-t2",
        type: "practice",
        title: "Implement Debounced LocalStorage State Synchronization",
        durationMinutes: 25,
        durationText: "25 min",
        description: "Code a custom React hook that synchronizes complex nested application state with browser storage using a debounce timer.",
        isCompleted: false,
        actionUrl: "/practice",
        proofRequired: false,
      },
      {
        taskId: "web-t3",
        type: "build",
        title: "Build Responsive Portfolio Navbar with Accessible Mobile Drawer",
        durationMinutes: 35,
        durationText: "35 min",
        description: "Construct a clean semantic header with dark mode toggle, keyboard navigation traps, and smooth slide-in mobile navigation menu.",
        isCompleted: false,
        actionUrl: "/projects",
        proofRequired: false,
      },
      {
        taskId: "web-t4",
        type: "ship",
        title: "Ship Git Commit: Verified Semantic Navigation & Theme Sync",
        durationMinutes: 15,
        durationText: "15 min",
        description: "Push your responsive navigation component to your GitHub repository and log your verified Proof of Work commit hash.",
        isCompleted: false,
        actionUrl: "/missions",
        proofRequired: true,
      },
    ],
  },
  "AI / ML": {
    _id: "mission-ai-ml-day-1",
    dayNumber: 1,
    trackTitle: "AI / ML",
    dateString: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
    quote: "Deep learning isn't magic; it is calculus applied at massive scale with GPUs. Once you master tensor math, everything unlocks.",
    isAllCompleted: false,
    completedTasksCount: 0,
    tasks: [
      {
        taskId: "ai-t1",
        type: "learn",
        title: "Tensor Operations, Broadcasting & Matrix Vectorization",
        durationMinutes: 20,
        durationText: "20 min",
        description: "Explore n-dimensional tensor representations, broadcasting rules, strides, and memory layouts in NumPy and PyTorch.",
        isCompleted: false,
        actionUrl: "/learn",
        proofRequired: false,
      },
      {
        taskId: "ai-t2",
        type: "practice",
        title: "Implement Gradient Descent & Forward-Pass Linear Regression",
        durationMinutes: 25,
        durationText: "25 min",
        description: "Calculate partial derivatives analytically and write gradient descent weight updates without high-level library abstractions.",
        isCompleted: false,
        actionUrl: "/practice",
        proofRequired: false,
      },
      {
        taskId: "ai-t3",
        type: "build",
        title: "Build Softmax Multi-Class Classifier with Loss Curves",
        durationMinutes: 35,
        durationText: "35 min",
        description: "Code a vectorized Softmax regression classifier in Python, calculate cross-entropy loss, and plot loss convergence across 1,000 iterations.",
        isCompleted: false,
        actionUrl: "/projects",
        proofRequired: false,
      },
      {
        taskId: "ai-t4",
        type: "ship",
        title: "Ship Git Commit: Vectorized Linear Algebra & Optimization Lab",
        durationMinutes: 15,
        durationText: "15 min",
        description: "Commit your clean Jupyter notebook or Python script with test assertions and link the commit to your developer profile.",
        isCompleted: false,
        actionUrl: "/missions",
        proofRequired: true,
      },
    ],
  },
  "Cybersecurity": {
    _id: "mission-cybersecurity-day-1",
    dayNumber: 1,
    trackTitle: "Cybersecurity",
    dateString: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
    quote: "Security is not an afterthought; it is an architectural invariant. Build defensively from line one.",
    isAllCompleted: false,
    completedTasksCount: 0,
    tasks: [
      {
        taskId: "cyber-t1",
        type: "learn",
        title: "TCP 3-Way Handshake, Sequence Numbers & Flag Inspection",
        durationMinutes: 20,
        durationText: "20 min",
        description: "Break down SYN, SYN-ACK, and ACK packets. Analyze TCP sequence synchronization, window sizes, and packet teardown with FIN/RST flags.",
        isCompleted: false,
        actionUrl: "/learn",
        proofRequired: false,
      },
      {
        taskId: "cyber-t2",
        type: "practice",
        title: "Write Multi-Threaded TCP Port Scanner in Python",
        durationMinutes: 25,
        durationText: "25 min",
        description: "Build an asynchronous socket port scanner that probes target endpoints, grabs service banners, and formats open port reports.",
        isCompleted: false,
        actionUrl: "/practice",
        proofRequired: false,
      },
      {
        taskId: "cyber-t3",
        type: "build",
        title: "Build HTTP Security Headers Scanner & OWASP Linter",
        durationMinutes: 35,
        durationText: "35 min",
        description: "Create an automated security utility that audits Content-Security-Policy, HSTS, X-Frame-Options, and CORS configurations of target websites.",
        isCompleted: false,
        actionUrl: "/projects",
        proofRequired: false,
      },
      {
        taskId: "cyber-t4",
        type: "ship",
        title: "Ship Git Commit: Automated Socket Scanner & Network Lab",
        durationMinutes: 15,
        durationText: "15 min",
        description: "Push your documented Python port scanner script with robust error handling and command-line arguments to GitHub.",
        isCompleted: false,
        actionUrl: "/missions",
        proofRequired: true,
      },
    ],
  },
  "Data / Analytics": {
    _id: "mission-data-analytics-day-1",
    dayNumber: 1,
    trackTitle: "Data / Analytics",
    dateString: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
    quote: "Data without structure is noise. Clean pipelines and sharp SQL reveal the hidden truth behind products.",
    isAllCompleted: false,
    completedTasksCount: 0,
    tasks: [
      {
        taskId: "data-t1",
        type: "learn",
        title: "SQL Window Functions: ROW_NUMBER, DENSE_RANK & PARTITION BY",
        durationMinutes: 20,
        durationText: "20 min",
        description: "Understand window execution semantics: difference between aggregations and window framing, LEAD/LAG lookahead, and cumulative running sums.",
        isCompleted: false,
        actionUrl: "/learn",
        proofRequired: false,
      },
      {
        taskId: "data-t2",
        type: "practice",
        title: "Write Multi-Table Rolling Revenue & User Cohort Retention Query",
        durationMinutes: 25,
        durationText: "25 min",
        description: "Write production-grade PostgreSQL queries using Common Table Expressions to calculate rolling 7-day retention curves.",
        isCompleted: false,
        actionUrl: "/practice",
        proofRequired: false,
      },
      {
        taskId: "data-t3",
        type: "build",
        title: "Build Automated CSV Ingestion & Data Quality Validation Script",
        durationMinutes: 35,
        durationText: "35 min",
        description: "Develop a Python Pandas script that validates schema data types, sanitizes invalid dates, and loads clean records into a SQLite database.",
        isCompleted: false,
        actionUrl: "/projects",
        proofRequired: false,
      },
      {
        taskId: "data-t4",
        type: "ship",
        title: "Ship Git Commit: Cohort Analysis SQL & Ingestion Pipeline",
        durationMinutes: 15,
        durationText: "15 min",
        description: "Commit your SQL scripts and data cleaning pipeline with comprehensive inline comments and sample output logs.",
        isCompleted: false,
        actionUrl: "/missions",
        proofRequired: true,
      },
    ],
  },
};

// Multi-Day Curriculum Mapping for Tracks (Cybersecurity, Web Dev, AI/ML, App Dev, Data)
export const MULTI_DAY_MISSIONS: Record<string, Record<number, Partial<DailyMission>>> = {
  "Cybersecurity": {
    1: {
      quote: "Security is not an afterthought; it is an architectural invariant. Build defensively from line one.",
      tasks: [
        {
          taskId: "cyber-day1-t1",
          type: "learn",
          title: "TCP 3-Way Handshake, Sequence Numbers & Flag Inspection",
          durationMinutes: 20,
          durationText: "20 min",
          description: "Break down SYN, SYN-ACK, and ACK packets. Analyze TCP sequence synchronization, window sizes, and packet teardown with FIN/RST flags.",
          isCompleted: false,
          actionUrl: "/learn",
          proofRequired: false,
        },
        {
          taskId: "cyber-day1-t2",
          type: "practice",
          title: "Write Multi-Threaded TCP Port Scanner in Python",
          durationMinutes: 25,
          durationText: "25 min",
          description: "Build an asynchronous socket port scanner that probes target endpoints, grabs service banners, and formats open port reports.",
          isCompleted: false,
          actionUrl: "/practice",
          proofRequired: false,
        },
        {
          taskId: "cyber-day1-t3",
          type: "build",
          title: "Build HTTP Security Headers Scanner & OWASP Linter",
          durationMinutes: 35,
          durationText: "35 min",
          description: "Create an automated security utility that audits Content-Security-Policy, HSTS, X-Frame-Options, and CORS configurations of target websites.",
          isCompleted: false,
          actionUrl: "/projects",
          proofRequired: false,
        },
        {
          taskId: "cyber-day1-t4",
          type: "ship",
          title: "Ship Git Commit: Automated Socket Scanner & Network Lab",
          durationMinutes: 15,
          durationText: "15 min",
          description: "Push your documented Python port scanner script with robust error handling and command-line arguments to GitHub.",
          isCompleted: false,
          actionUrl: "/missions",
          proofRequired: true,
        },
      ],
    },
    2: {
      quote: "Every input is hostile until proven sanitized. Master injection mechanics to build bulletproof web defenses.",
      tasks: [
        {
          taskId: "cyber-day2-t1",
          type: "learn",
          title: "SQL Injection Mechanics, Blind Exfiltration & Prepared Statements",
          durationMinutes: 20,
          durationText: "20 min",
          description: "Analyze classic 1=1 boolean escapes, UNION query extraction, blind time-based attacks, and parameterized query compiler barriers.",
          isCompleted: false,
          actionUrl: "/learn",
          proofRequired: false,
        },
        {
          taskId: "cyber-day2-t2",
          type: "practice",
          title: "Write Input Sanitization & String Defense Challenge",
          durationMinutes: 25,
          durationText: "25 min",
          description: "Code an HTML entity encoder and regex sanitization pipeline that neutralizes stored XSS and DOM-based injection vectors.",
          isCompleted: false,
          actionUrl: "/practice",
          proofRequired: false,
        },
        {
          taskId: "cyber-day2-t3",
          type: "build",
          title: "Build Web Vulnerability Fuzzer & Payload Injection Auditor",
          durationMinutes: 40,
          durationText: "40 min",
          description: "Implement a Python security fuzzer that sends fuzzing wordlists to URL query parameters and parses server response status codes and diffs.",
          isCompleted: false,
          actionUrl: "/projects",
          proofRequired: false,
        },
        {
          taskId: "cyber-day2-t4",
          type: "ship",
          title: "Ship Git Commit: Vulnerability Fuzzing Harness with HTML Report",
          durationMinutes: 15,
          durationText: "15 min",
          description: "Commit your working web security fuzzer with automated JSON report generation and markdown audit guidelines.",
          isCompleted: false,
          actionUrl: "/missions",
          proofRequired: true,
        },
      ],
    },
    3: {
      quote: "Cryptography transforms sensitive secrets into mathematical noise that withstands adversaries with supercomputers.",
      tasks: [
        {
          taskId: "cyber-day3-t1",
          type: "learn",
          title: "Asymmetric RSA Key Exchange, Elliptic Curves & Diffie-Hellman",
          durationMinutes: 20,
          durationText: "20 min",
          description: "Study how TLS 1.3 establishes forward secrecy using ephemeral Diffie-Hellman (ECDHE) and how public-key certificates are verified.",
          isCompleted: false,
          actionUrl: "/learn",
          proofRequired: false,
        },
        {
          taskId: "cyber-day3-t2",
          type: "practice",
          title: "Implement AES-256 GCM File Encryption & Decryption Utility",
          durationMinutes: 25,
          durationText: "25 min",
          description: "Write authenticated encryption routines using AES-GCM with unique 12-byte initialization vectors and 16-byte authentication tags.",
          isCompleted: false,
          actionUrl: "/practice",
          proofRequired: false,
        },
        {
          taskId: "cyber-day3-t3",
          type: "build",
          title: "Build End-to-End Encrypted CLI Chat Channel with HMAC Integrity",
          durationMinutes: 40,
          durationText: "40 min",
          description: "Construct a socket-based peer-to-peer secure messaging client that encrypts payloads with session keys and rejects tampered ciphertext.",
          isCompleted: false,
          actionUrl: "/projects",
          proofRequired: false,
        },
        {
          taskId: "cyber-day3-t4",
          type: "ship",
          title: "Ship Git Commit: Cryptographic Engine & Secure Messaging Channel",
          durationMinutes: 15,
          durationText: "15 min",
          description: "Publish your tested cryptographic suite with sample encrypt/decrypt test vectors and verification scripts.",
          isCompleted: false,
          actionUrl: "/missions",
          proofRequired: true,
        },
      ],
    },
    4: {
      quote: "Flawed authentication is the master key for attackers. Build zero-trust token lifecycles with relentless revocation.",
      tasks: [
        {
          taskId: "cyber-day4-t1",
          type: "learn",
          title: "JWT Architecture, Algorithm Confusion Attacks & Token Invalidation",
          durationMinutes: 20,
          durationText: "20 min",
          description: "Learn how the 'none' algorithm bypass works, public key signature verification vulnerabilities, and distributed token blacklisting.",
          isCompleted: false,
          actionUrl: "/learn",
          proofRequired: false,
        },
        {
          taskId: "cyber-day4-t2",
          type: "practice",
          title: "Implement Token Expiration, Refresh Rotation & CSRF Guards",
          durationMinutes: 25,
          durationText: "25 min",
          description: "Code dual-token authentication middleware with HTTP-only cookies, SameSite restrictions, and automated refresh token rotation.",
          isCompleted: false,
          actionUrl: "/practice",
          proofRequired: false,
        },
        {
          taskId: "cyber-day4-t3",
          type: "build",
          title: "Build Multi-Factor Authentication (TOTP) Authenticator Service",
          durationMinutes: 40,
          durationText: "40 min",
          description: "Implement a RFC 6238 Time-based One-Time Password engine with QR code generation and time-step drift tolerance.",
          isCompleted: false,
          actionUrl: "/projects",
          proofRequired: false,
        },
        {
          taskId: "cyber-day4-t4",
          type: "ship",
          title: "Ship Git Commit: Hardened Identity & Access Management Module",
          durationMinutes: 15,
          durationText: "15 min",
          description: "Commit your production-grade TOTP and JWT authentication service with comprehensive integration tests.",
          isCompleted: false,
          actionUrl: "/missions",
          proofRequired: true,
        },
      ],
    },
    5: {
      quote: "Visibility is defense. If you cannot observe anomalous behavior in real-time, you cannot stop intrusion.",
      tasks: [
        {
          taskId: "cyber-day5-t1",
          type: "learn",
          title: "SIEM Architecture, Linux Auth Logs & Anomaly Detection Signatures",
          durationMinutes: 20,
          durationText: "20 min",
          description: "Inspect /var/log/auth.log patterns, failed SSH attempts, privilege escalation via sudo, and baseline user behavioral anomalies.",
          isCompleted: false,
          actionUrl: "/learn",
          proofRequired: false,
        },
        {
          taskId: "cyber-day5-t2",
          type: "practice",
          title: "Write Automated Syslog Parser & Real-Time Brute-Force Detector",
          durationMinutes: 25,
          durationText: "25 min",
          description: "Build an active log monitoring worker that extracts IP addresses exceeding failure thresholds within rolling 60-second windows.",
          isCompleted: false,
          actionUrl: "/practice",
          proofRequired: false,
        },
        {
          taskId: "cyber-day5-t3",
          type: "build",
          title: "Build Incident Response Automated Firewall IP Banning Daemon",
          durationMinutes: 40,
          durationText: "40 min",
          description: "Develop a lightweight security daemon that interacts with iptables / nftables to dynamically drop malicious CIDRs and notify webhooks.",
          isCompleted: false,
          actionUrl: "/projects",
          proofRequired: false,
        },
        {
          taskId: "cyber-day5-t4",
          type: "ship",
          title: "Ship Git Commit: Security Operations Center (SOC) Defense Tooling",
          durationMinutes: 15,
          durationText: "15 min",
          description: "Push your complete automated firewall daemon with systemd service definition and live log replay simulator.",
          isCompleted: false,
          actionUrl: "/missions",
          proofRequired: true,
        },
      ],
    },
  },
  "Web Development": {
    1: {
      quote: "The web is the most accessible platform on Earth. Master the fundamentals and you can deliver software to billions in seconds.",
      tasks: [
        {
          taskId: "web-day1-t1",
          type: "learn",
          title: "JavaScript Event Loop, Microtasks & React 19 State Models",
          durationMinutes: 20,
          durationText: "20 min",
          description: "Understand call stack, macrotask queue, microtask queue (Promises), and how React 19 batches state transitions seamlessly.",
          isCompleted: false,
          actionUrl: "/learn",
          proofRequired: false,
        },
        {
          taskId: "web-day1-t2",
          type: "practice",
          title: "Implement Debounced LocalStorage State Synchronization",
          durationMinutes: 25,
          durationText: "25 min",
          description: "Code a custom React hook that synchronizes complex nested application state with browser storage using a debounce timer.",
          isCompleted: false,
          actionUrl: "/practice",
          proofRequired: false,
        },
        {
          taskId: "web-day1-t3",
          type: "build",
          title: "Build Responsive Portfolio Navbar with Accessible Mobile Drawer",
          durationMinutes: 35,
          durationText: "35 min",
          description: "Construct a clean semantic header with dark mode toggle, keyboard navigation traps, and smooth slide-in mobile navigation menu.",
          isCompleted: false,
          actionUrl: "/projects",
          proofRequired: false,
        },
        {
          taskId: "web-day1-t4",
          type: "ship",
          title: "Ship Git Commit: Initial Web App Layout, Theme & Navigation",
          durationMinutes: 15,
          durationText: "15 min",
          description: "Commit your accessible web navigation component with TypeScript definitions and clean CSS modules or Tailwind classes.",
          isCompleted: false,
          actionUrl: "/missions",
          proofRequired: true,
        },
      ],
    },
    2: {
      quote: "Fast rendering is not an accident; it is the result of intentional state architecture and zero unneeded re-renders.",
      tasks: [
        {
          taskId: "web-day2-t1",
          type: "learn",
          title: "React Fiber Architecture, Reconciliation & Profiler Analysis",
          durationMinutes: 20,
          durationText: "20 min",
          description: "Study how React diffs the virtual DOM tree, scheduling priorities, useMemo / useCallback trade-offs, and flame graph profiling.",
          isCompleted: false,
          actionUrl: "/learn",
          proofRequired: false,
        },
        {
          taskId: "web-day2-t2",
          type: "practice",
          title: "Build Virtualized List Component for 10,000 DOM Elements",
          durationMinutes: 25,
          durationText: "25 min",
          description: "Create a windowed list renderer calculating visible item ranges dynamically based on scroll offset to maintain 60 FPS.",
          isCompleted: false,
          actionUrl: "/practice",
          proofRequired: false,
        },
        {
          taskId: "web-day2-t3",
          type: "build",
          title: "Build Real-Time Search & Fuzzy Filter Dashboard Widget",
          durationMinutes: 35,
          durationText: "35 min",
          description: "Implement high-speed keyboard-navigable search input with instant tag filters, highlighting, and empty state fallbacks.",
          isCompleted: false,
          actionUrl: "/projects",
          proofRequired: false,
        },
        {
          taskId: "web-day2-t4",
          type: "ship",
          title: "Ship Git Commit: High-Performance Virtualized Table & Filter Widget",
          durationMinutes: 15,
          durationText: "15 min",
          description: "Commit your virtualized list and search module with benchmark documentation showing sub-10ms render latency.",
          isCompleted: false,
          actionUrl: "/missions",
          proofRequired: true,
        },
      ],
    },
  },
};

/**
 * Calculates current active day for a track based on user registration or track start date.
 * Automatically advances from Day 1 to Day 2, Day 3, etc. day-to-day.
 */
export function calculateTrackDay(trackName?: string): number {
  if (typeof window === 'undefined') return 1;
  const normalized = normalizeTrackName(trackName);

  // Check manual day override first (if user clicked 'Advance to Next Day')
  const overrideKey = `rishabhlabs_track_day_override_${normalized}`;
  const overrideVal = localStorage.getItem(overrideKey);
  if (overrideVal) {
    const parsed = parseInt(overrideVal, 10);
    if (!isNaN(parsed) && parsed >= 1) return parsed;
  }

  const startKey = `rishabhlabs_track_start_${normalized}`;
  let startTimestamp = localStorage.getItem(startKey);

  if (!startTimestamp) {
    startTimestamp = localStorage.getItem('rishabhlabs_onboarding_date') || new Date().toISOString();
    localStorage.setItem(startKey, startTimestamp);
  }

  const startDate = new Date(startTimestamp);
  const now = new Date();

  // Calendar day diff based on midnight boundary (00:00 local time)
  const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
  const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.max(0, Math.floor((todayDay - startDay) / (1000 * 60 * 60 * 24)));

  return diffDays + 1;
}

/**
 * Manually advance track day (e.g. after finishing daily mission tasks).
 */
export function advanceTrackDay(trackName?: string): number {
  if (typeof window === 'undefined') return 1;
  const normalized = normalizeTrackName(trackName);
  const current = calculateTrackDay(normalized);
  const next = current + 1;
  localStorage.setItem(`rishabhlabs_track_day_override_${normalized}`, String(next));
  return next;
}

/**
 * Builds or retrieves the specific daily mission for any given track and day number.
 */
export function getTrackMissionForDay(trackName: string, dayNumber: number): DailyMission {
  const normalized = normalizeTrackName(trackName);
  const todayDateStr = new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  // 1. Check multi-day predefined mission dictionary
  const trackMultiDays = MULTI_DAY_MISSIONS[normalized];
  if (trackMultiDays && trackMultiDays[dayNumber]) {
    const dayData = trackMultiDays[dayNumber];
    return {
      _id: `mission-${normalized.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-day-${dayNumber}`,
      dayNumber,
      trackTitle: normalized,
      dateString: todayDateStr,
      quote: dayData.quote || "Small consistent steps every day lead to engineering excellence.",
      isAllCompleted: false,
      completedTasksCount: 0,
      tasks: (dayData.tasks || []).map((t) => ({ ...t, isCompleted: false })),
    };
  }

  // 2. Fall back to base Day 1 or dynamic algorithmic progression for Day N
  const base = CURATED_MISSIONS[normalized] || CURATED_MISSIONS["App Development"];
  if (dayNumber === 1) {
    return {
      ...base,
      dayNumber: 1,
      dateString: todayDateStr,
      tasks: base.tasks.map((t) => ({ ...t, isCompleted: false })),
    };
  }

  // Dynamic Day N mission template
  return {
    _id: `mission-${normalized.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-day-${dayNumber}`,
    dayNumber,
    trackTitle: normalized,
    dateString: todayDateStr,
    quote: `Day ${dayNumber} of your journey in ${normalized}. Consistency builds elite engineering mastery.`,
    isAllCompleted: false,
    completedTasksCount: 0,
    tasks: [
      {
        taskId: `${normalized.slice(0, 3).toLowerCase()}-day${dayNumber}-learn`,
        type: "learn",
        title: `Learn - Advanced ${normalized} Architecture (Day ${dayNumber})`,
        durationMinutes: 20,
        durationText: "20 min",
        description: `Explore Day ${dayNumber} core design patterns, performance optimizations, and industry case studies.`,
        isCompleted: false,
        actionUrl: "/learn",
        proofRequired: false,
      },
      {
        taskId: `${normalized.slice(0, 3).toLowerCase()}-day${dayNumber}-practice`,
        type: "practice",
        title: `Practice - Algorithmic Problem Solving (Day ${dayNumber})`,
        durationMinutes: 25,
        durationText: "25 min",
        description: `Solve Day ${dayNumber} targeted coding challenges to reinforce core algorithmic intuition and data manipulation.`,
        isCompleted: false,
        actionUrl: "/practice",
        proofRequired: false,
      },
      {
        taskId: `${normalized.slice(0, 3).toLowerCase()}-day${dayNumber}-build`,
        type: "build",
        title: `Build - Production Feature Implementation (Day ${dayNumber})`,
        durationMinutes: 35,
        durationText: "35 min",
        description: `Construct and test an end-to-end component or service in your hands-on project workspace.`,
        isCompleted: false,
        actionUrl: "/projects",
        proofRequired: false,
      },
      {
        taskId: `${normalized.slice(0, 3).toLowerCase()}-day${dayNumber}-ship`,
        type: "ship",
        title: `Ship - Push Day ${dayNumber} Work to GitHub`,
        durationMinutes: 15,
        durationText: "15 min",
        description: `Commit your code changes with clear documentation and push them to your public repository.`,
        isCompleted: false,
        actionUrl: "/missions",
        proofRequired: true,
      },
    ],
  };
}

/**
 * Returns the active curated mission for a track, calculating real Day number
 * and preserving task completion state per day.
 */
export function getCuratedMission(trackName?: string, dayOverride?: number): DailyMission {
  const normalized = normalizeTrackName(trackName);
  const currentDay = dayOverride || calculateTrackDay(normalized);
  const base = getTrackMissionForDay(normalized, currentDay);

  try {
    // Check per-day completion state first, then fallback to general
    const dayKey = `rishabhlabs_mission_completed_${normalized}_day_${currentDay}`;
    const legacyKey = `rishabhlabs_mission_completed_${normalized}`;
    const saved = localStorage.getItem(dayKey) || localStorage.getItem(legacyKey);

    if (saved) {
      const completedIds: string[] = JSON.parse(saved);
      const updatedTasks = base.tasks.map((t) => ({
        ...t,
        isCompleted: completedIds.includes(t.taskId),
      }));
      const doneCount = updatedTasks.filter((t) => t.isCompleted).length;
      return {
        ...base,
        tasks: updatedTasks,
        completedTasksCount: doneCount,
        isAllCompleted: doneCount === updatedTasks.length,
      };
    }
  } catch (e) {
    // Ignore localStorage parse errors
  }

  return base;
}

