import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { StudentProfile, Onboarding } from '../models/StudentProfile';
import { Roadmap } from '../models/Roadmap';
import { DailyMission } from '../models/DailyMission';
import { Lesson } from '../models/Lesson';
import { CodingProblem } from '../models/CodingProblem';
import { Project } from '../models/Project';
import { Hackathon } from '../models/Hackathon';
import { Mentor, MentorshipRequest } from '../models/Mentorship';
import { WeeklyReview, College, PricingPlan } from '../models/CollegeAndReview';

export const getCleanProjects = () => [
  {
    title: 'Customer Churn & Retention Predictor',
    slug: 'customer-churn-predictor',
    category: 'AI & Machine Learning',
    description: 'Production-ready ML classification pipeline predicting customer churn probability with ROC-AUC evaluation, feature importance SHAP values, and FastAPI endpoint.',
    difficulty: 'Intermediate',
    techStack: ['Python', 'Scikit-Learn', 'Pandas', 'FastAPI'],
    estimatedHours: 28,
    progressPercent: 0,
    status: 'Not Started',
    githubRepoUrl: '',
    liveDeployUrl: '',
    demoVideoUrl: '',
    proofOfWorkSubmitted: false,
    mentorFeedback: '',
    requirements: [
      'Exploratory data analysis & categorical feature encoding',
      'Address class imbalance with SMOTE or class weights',
      'Train & tune Random Forest vs XGBoost with 5-fold cross validation',
      'Export serialized pipeline with Joblib and serve via FastAPI',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Phase 1: Dataset Ingestion & Feature Engineering',
        isCompleted: false,
        tasks: [
          { id: 't1', title: 'Load customer dataset and perform missing value imputation', isCompleted: false },
          { id: 't2', title: 'One-hot encode categorical features and scale numeric attributes', isCompleted: false },
        ],
      },
      {
        id: 'm2',
        title: 'Phase 2: Model Training & Evaluation',
        isCompleted: false,
        tasks: [
          { id: 't3', title: 'Train baseline Logistic Regression and benchmark against Random Forest', isCompleted: false },
          { id: 't4', title: 'Compute ROC-AUC curve, confusion matrix, and feature importances', isCompleted: false },
        ],
      },
      {
        id: 'm3',
        title: 'Phase 3: Production API & Deployment',
        isCompleted: false,
        tasks: [
          { id: 't5', title: 'Wrap trained pipeline in FastAPI endpoint with Pydantic request validation', isCompleted: false },
          { id: 't6', title: 'Push code and model artifact to GitHub repository', isCompleted: false },
        ],
      },
    ],
  },
  {
    title: 'Neural Vision: Handwritten Digit & Shape Classifier',
    slug: 'neural-vision-classifier',
    category: 'AI & Machine Learning',
    description: 'Deep convolutional neural network trained on image tensors with real-time browser canvas inference and activation map visualizations.',
    difficulty: 'Beginner',
    techStack: ['Python', 'PyTorch', 'TensorFlow.js', 'React'],
    estimatedHours: 24,
    progressPercent: 0,
    status: 'Not Started',
    githubRepoUrl: '',
    liveDeployUrl: '',
    demoVideoUrl: '',
    proofOfWorkSubmitted: false,
    mentorFeedback: '',
    requirements: [
      'CNN architecture with Conv2d, BatchNorm, ReLU, and MaxPool',
      'Data augmentation with random rotations and translations',
      'Quantize and export trained model to TFJS web format',
      'Interactive 28x28 drawing canvas with live probability bars',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Phase 1: Neural Network Architecture & PyTorch Training',
        isCompleted: false,
        tasks: [
          { id: 't1', title: 'Build CNN model in PyTorch and verify output tensor dimensions', isCompleted: false },
          { id: 't2', title: 'Train for 10 epochs reaching >98% test set accuracy', isCompleted: false },
        ],
      },
      {
        id: 'm2',
        title: 'Phase 2: Model Export & Interactive Canvas Interface',
        isCompleted: false,
        tasks: [
          { id: 't3', title: 'Convert PyTorch weights to ONNX/TFJS web model format', isCompleted: false },
          { id: 't4', title: 'Build React freehand canvas with clear button and live inference hook', isCompleted: false },
        ],
      },
    ],
  },
  {
    title: 'Local Document RAG Assistant with Vector Search',
    slug: 'local-document-rag-assistant',
    category: 'AI & Machine Learning',
    description: 'Private document intelligence engine using LangChain, text chunking, FAISS vector embeddings, and Gemini/Ollama generation.',
    difficulty: 'Advanced',
    techStack: ['Python', 'Gemini API', 'LangChain', 'FAISS', 'Streamlit'],
    estimatedHours: 35,
    progressPercent: 0,
    status: 'Not Started',
    githubRepoUrl: '',
    liveDeployUrl: '',
    demoVideoUrl: '',
    proofOfWorkSubmitted: false,
    mentorFeedback: '',
    requirements: [
      'PDF text extraction and recursive token-aware chunking',
      'Dense vector embedding generation using modern embedding models',
      'Cosine similarity retrieval with top-k context windowing',
      'Grounded prompt generation with exact source page citations',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Phase 1: Document Ingestion & Vector Index',
        isCompleted: false,
        tasks: [
          { id: 't1', title: 'Implement chunking pipeline with 500-token sliding window and 50-token overlap', isCompleted: false },
          { id: 't2', title: 'Generate FAISS vector store index on local disk', isCompleted: false },
        ],
      },
      {
        id: 'm2',
        title: 'Phase 2: Retrieval Augmented Generation Pipeline',
        isCompleted: false,
        tasks: [
          { id: 't3', title: 'Integrate Gemini API for synthesis with strict system prompt grounding', isCompleted: false },
          { id: 't4', title: 'Build streaming response UI with interactive source viewer', isCompleted: false },
        ],
      },
    ],
  },
  {
    title: 'AI Resume & Career Match Analyzer',
    slug: 'ai-resume-analyzer',
    category: 'AI & Machine Learning',
    description: 'Automated candidate matching platform that parses PDF resumes, scores technical alignment against job descriptions, and highlights missing skills.',
    difficulty: 'Intermediate',
    techStack: ['React', 'Node.js', 'Gemini API', 'Tailwind CSS'],
    estimatedHours: 30,
    progressPercent: 0,
    status: 'Not Started',
    githubRepoUrl: '',
    liveDeployUrl: '',
    demoVideoUrl: '',
    proofOfWorkSubmitted: false,
    mentorFeedback: '',
    requirements: [
      'Drag-and-drop PDF resume upload parsing',
      'Skill extraction using regex & NLP tokenization',
      'Dynamic score calculation out of 100',
      'Interactive skill filtering pills',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Phase 1: Project Scaffolding & Parsing API',
        isCompleted: false,
        tasks: [
          { id: 't1', title: 'Initialize Vite React + Express monorepo', isCompleted: false },
          { id: 't2', title: 'Implement Multer PDF file upload route', isCompleted: false },
        ],
      },
      {
        id: 'm2',
        title: 'Phase 2: Skill Extraction & Match Algorithm',
        isCompleted: false,
        tasks: [
          { id: 't3', title: 'Build keyword tokenizer for tech stacks', isCompleted: false },
          { id: 't4', title: 'Compute match percentage against job spec', isCompleted: false },
        ],
      },
      {
        id: 'm3',
        title: 'Phase 3: Interactive UI & Skill Filter Pills',
        isCompleted: false,
        tasks: [
          { id: 't5', title: 'Add search query + category filtering pills to candidate list', isCompleted: false },
          { id: 't6', title: 'Push completed changes to GitHub repository', isCompleted: false },
        ],
      },
    ],
  },
  {
    title: 'Full-Stack College Campus Event Platform',
    slug: 'college-event-platform',
    category: 'Web Development',
    description: 'Comprehensive campus fest management system supporting live registrations, team check-ins, automated QR code badges, and prize distribution.',
    difficulty: 'Intermediate',
    techStack: ['Next.js', 'MongoDB', 'Tailwind', 'Stripe'],
    estimatedHours: 25,
    progressPercent: 0,
    status: 'Not Started',
    githubRepoUrl: '',
    liveDeployUrl: '',
    demoVideoUrl: '',
    proofOfWorkSubmitted: false,
    mentorFeedback: '',
    requirements: ['Role-based admin & participant portals', 'QR badge generator', 'Real-time ticket counter'],
    milestones: [
      {
        id: 'm1',
        title: 'Full Implementation',
        isCompleted: false,
        tasks: [
          { id: 't1', title: 'Design database schemas for events & tickets', isCompleted: false },
          { id: 't2', title: 'Deploy on Vercel with MongoDB Atlas', isCompleted: false },
        ],
      },
    ],
  },
  {
    title: 'Expense & Budget Analytics Tracker',
    slug: 'expense-tracker',
    category: 'Web Development',
    description: 'Minimalist personal finance management web app with instant CSV transaction export, category budgets, and visual spending breakdowns.',
    difficulty: 'Beginner',
    techStack: ['React', 'Firebase', 'Chart.js'],
    estimatedHours: 18,
    progressPercent: 0,
    status: 'Not Started',
    githubRepoUrl: '',
    liveDeployUrl: '',
    demoVideoUrl: '',
    proofOfWorkSubmitted: false,
    mentorFeedback: '',
    requirements: ['Add income/expense line items', 'Categorized breakdown charts', 'Local persistence'],
    milestones: [
      {
        id: 'm1',
        title: 'Full Lifecycle',
        isCompleted: false,
        tasks: [
          { id: 't1', title: 'Build React UI with transaction state & breakdown charts', isCompleted: false },
        ],
      },
    ],
  },
  {
    title: 'Real-time Collaborative Whiteboard',
    slug: 'collaborative-whiteboard',
    category: 'Web Development',
    description: 'Low-latency multiplayer canvas with WebSockets, room synchronization, vector shapes, and undo/redo stacks.',
    difficulty: 'Advanced',
    techStack: ['React', 'WebSockets', 'Canvas API', 'Node.js'],
    estimatedHours: 35,
    progressPercent: 0,
    status: 'Not Started',
    githubRepoUrl: '',
    liveDeployUrl: '',
    demoVideoUrl: '',
    proofOfWorkSubmitted: false,
    mentorFeedback: '',
    requirements: ['Canvas drawing engine', 'WebSocket delta synchronization', 'Room presence avatars'],
    milestones: [
      {
        id: 'm1',
        title: 'Canvas Engine',
        isCompleted: false,
        tasks: [{ id: 't1', title: 'Create smooth freehand brush paths', isCompleted: false }],
      },
      {
        id: 'm2',
        title: 'Multiplayer Rooms',
        isCompleted: false,
        tasks: [{ id: 't2', title: 'Broadcast pointer positions across clients', isCompleted: false }],
      },
    ],
  },
  {
    title: 'Developer Proof-of-Work Portfolio',
    slug: 'proof-of-work-portfolio',
    category: 'Web Development',
    description: 'Ultra-fast static portfolio generator highlighting verified GitHub commits, live product deployments, and hackathon awards.',
    difficulty: 'Beginner',
    techStack: ['React', 'TypeScript', 'Tailwind CSS'],
    estimatedHours: 12,
    progressPercent: 0,
    status: 'Not Started',
    githubRepoUrl: '',
    liveDeployUrl: '',
    demoVideoUrl: '',
    proofOfWorkSubmitted: false,
    mentorFeedback: '',
    requirements: ['Responsive portfolio layout', 'Direct GitHub activity sync', 'SEO optimized meta tags'],
    milestones: [
      {
        id: 'm1',
        title: 'Portfolio Polish',
        isCompleted: false,
        tasks: [{ id: 't1', title: 'Integrate dynamic Proof of Work badges', isCompleted: false }],
      },
    ],
  },
  {
    title: 'Network Packet Sniffer & Security Protocol Analyzer',
    slug: 'network-packet-sniffer',
    category: 'Cybersecurity',
    description: 'Low-level network protocol analysis tool capturing live Ethernet frames, parsing IP/TCP/UDP headers, flagging suspicious port scans, and alerting on plaintext credential transmissions.',
    difficulty: 'Intermediate',
    techStack: ['Python', 'Scapy', 'Raw Sockets', 'Wireshark PCAP'],
    estimatedHours: 24,
    progressPercent: 0,
    status: 'Not Started',
    githubRepoUrl: '',
    liveDeployUrl: '',
    demoVideoUrl: '',
    proofOfWorkSubmitted: false,
    mentorFeedback: '',
    requirements: [
      'Raw socket frame capture on promiscuous network interfaces',
      'Decode IP version 4 headers: TTL, protocol numbers, source/destination IPs',
      'TCP flag analysis: identify SYN floods and stealth FIN/XMAS scans',
      'Export pcap files compatible with standard Wireshark analyzers',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Phase 1: Packet Capture & Layer 3 Decoding',
        isCompleted: false,
        tasks: [
          { id: 't1', title: 'Open raw network socket in Python and parse Ethernet frame headers', isCompleted: false },
          { id: 't2', title: 'Unpack IPv4 header bytes using struct and extract TTL & source IP', isCompleted: false },
        ],
      },
      {
        id: 'm2',
        title: 'Phase 2: Transport Layer Analysis & Port Scan Detection',
        isCompleted: false,
        tasks: [
          { id: 't3', title: 'Parse TCP/UDP headers and track connection state flags (SYN, ACK, RST)', isCompleted: false },
          { id: 't4', title: 'Build sliding-window heuristic to flag rapid port scanning activity', isCompleted: false },
        ],
      },
      {
        id: 'm3',
        title: 'Phase 3: PCAP Export & Verification',
        isCompleted: false,
        tasks: [
          { id: 't5', title: 'Export captured buffers to standard libpcap .pcap format', isCompleted: false },
          { id: 't6', title: 'Verify pcap captures against Wireshark GUI tool', isCompleted: false },
        ],
      },
    ],
  },
  {
    title: 'Automated Web Vulnerability & OWASP Security Scanner',
    slug: 'web-vulnerability-scanner',
    category: 'Cybersecurity',
    description: 'Security audit tool probing web targets for OWASP Top 10 vulnerabilities including SQL injection, reflected/stored XSS, insecure CORS headers, and missing Content-Security-Policy rules.',
    difficulty: 'Advanced',
    techStack: ['Python', 'Asyncio', 'Aiohttp', 'BeautifulSoup4', 'FastAPI'],
    estimatedHours: 32,
    progressPercent: 0,
    status: 'Not Started',
    githubRepoUrl: '',
    liveDeployUrl: '',
    demoVideoUrl: '',
    proofOfWorkSubmitted: false,
    mentorFeedback: '',
    requirements: [
      'Concurrent HTTP probing with polite rate limiting and custom User-Agent strings',
      'Error-based and boolean-based SQL injection payload generation and regex detection',
      'DOM XSS context verification using non-destructive canary payloads',
      'Security header evaluation (Strict-Transport-Security, CSP, X-Frame-Options)',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Phase 1: Target Crawling & Input Form Discovery',
        isCompleted: false,
        tasks: [
          { id: 't1', title: 'Build asynchronous web crawler to map URL endpoints and query params', isCompleted: false },
          { id: 't2', title: 'Extract HTML form input elements, action URLs, and HTTP methods', isCompleted: false },
        ],
      },
      {
        id: 'm2',
        title: 'Phase 2: Vulnerability Detection Engine (SQLi & XSS)',
        isCompleted: false,
        tasks: [
          { id: 't3', title: 'Fuzz input fields with SQL injection canaries and analyze error signatures', isCompleted: false },
          { id: 't4', title: 'Test for reflected XSS vectors by checking unescaped response bodies', isCompleted: false },
        ],
      },
      {
        id: 'm3',
        title: 'Phase 3: Security Header Audit & Report Generator',
        isCompleted: false,
        tasks: [
          { id: 't5', title: 'Audit HTTP response headers for missing HSTS, CSP, and X-Content-Type', isCompleted: false },
          { id: 't6', title: 'Generate structured markdown and JSON vulnerability report summary', isCompleted: false },
        ],
      },
    ],
  },
];

export const getCleanLessons = () => [
  // AI & Machine Learning Track
  {
    title: 'Python for Machine Learning: NumPy Vectorization',
    slug: 'numpy-vectorization',
    track: 'ai-ml',
    moduleTitle: 'Module 1: Foundations of Machine Learning & Linear Algebra',
    order: 1,
    readTime: '30 min',
    overview: 'Why raw Python loops are slow and how NumPy C-contiguous memory blocks enable 50x faster vectorized matrix multiplications for neural networks.',
    keyTakeaways: [
      'Vectorization replaces Python interpreter loops with SIMD compiled machine instructions.',
      'Broadcasting applies arithmetic operations automatically across compatible array shapes without duplicating data.',
      'Dot products form the computational backbone of all dense neural network layer forward passes.',
    ],
    contentSections: [
      {
        heading: 'Why NumPy is Essential for Modern AI',
        bodyMarkdown: 'Python lists store pointers to heap-allocated objects with huge dynamic typing overhead. In contrast, NumPy arrays allocate contiguous blocks of C-native memory. Operations execute in compiled C/Fortran loops, enabling orders-of-magnitude faster computation.',
        codeSnippet: `import numpy as np\nimport time\n\n# Vectorized addition vs Python loop\na = np.random.rand(1_000_000)\nb = np.random.rand(1_000_000)\n\nstart = time.time()\nc = a + b  # SIMD Vectorized!\nprint(f"NumPy time: {(time.time() - start)*1000:.2f} ms")`,
        codeLanguage: 'python',
      },
      {
        heading: 'Broadcasting Rules in Practice',
        bodyMarkdown: 'Two dimensions are compatible when they are equal, or one of them is 1. If a tensor has shape (3, 1) and another (3, 4), NumPy automatically broadcasts the first across all 4 columns.',
      },
    ],
    interactiveSandbox: {
      instructions: 'Compute dot product of two vectors.',
      initialCode: `def dot_product(a, b):\n    return [x*y for x, y in zip(a, b)]`,
      solutionCode: `def dot_product(a, b):\n    return sum(x*y for x, y in zip(a, b))`,
      language: 'python',
      expectedOutput: '32',
    },
    quiz: [
      {
        question: 'Why is NumPy vectorization faster than a native Python for-loop?',
        options: [
          'NumPy converts Python code into JavaScript',
          'NumPy uses contiguous C memory buffers and SIMD instructions',
          'NumPy skips floating point validation entirely',
          'NumPy runs in a background web worker thread',
        ],
        correctIndex: 1,
        explanation: 'NumPy executes contiguous memory vector operations at native C machine code speed using SIMD instructions.',
      },
    ],
  },
  {
    title: 'Data Cleaning & Exploratory Analysis with Pandas',
    slug: 'pandas-data-wrangling',
    track: 'ai-ml',
    moduleTitle: 'Module 1: Foundations of Machine Learning & Linear Algebra',
    order: 2,
    readTime: '25 min',
    overview: 'Master dataframes, missing value imputation, outlier detection, and feature transformation before feeding datasets into machine learning algorithms.',
    keyTakeaways: [
      'Garbage in, garbage out: ML models are only as good as the cleanliness of feature matrices.',
      'Use median imputation for skewed numerical distributions and mode for categorical variables.',
    ],
    contentSections: [
      {
        heading: 'DataFrames & Boolean Masking',
        bodyMarkdown: 'Pandas DataFrames provide high-performance tabular manipulation tools. Using boolean indexing lets you filter tens of thousands of rows in sub-millisecond execution times.',
      },
    ],
    interactiveSandbox: {
      instructions: 'Filter student records where score >= 80.',
      initialCode: `def get_top_students(records):\n    return []`,
      solutionCode: `def get_top_students(records):\n    return [r['name'] for r in records if r['score'] >= 80]`,
      language: 'python',
      expectedOutput: "['Rishabh', 'Neha']",
    },
    quiz: [],
  },
  {
    title: 'Linear Regression & Gradient Descent Optimization',
    slug: 'linear-regression-gradient-descent',
    track: 'ai-ml',
    moduleTitle: 'Module 2: Supervised Learning & Algorithms',
    order: 3,
    readTime: '30 min',
    overview: 'Understand how cost functions (Mean Squared Error) and gradient descent update weights to minimize prediction error iteratively.',
    keyTakeaways: [
      'Gradient descent takes steps proportional to the negative gradient of the loss function.',
      'The learning rate determines convergence speed.',
    ],
    contentSections: [
      {
        heading: 'The Math of Gradient Descent',
        bodyMarkdown: 'For linear hypothesis h(x) = wx + b, the MSE loss measures the squared vertical distances between predicted lines and real ground truth labels.',
      },
    ],
    interactiveSandbox: {
      instructions: 'Compute Mean Squared Error given true values y and predictions y_hat.',
      initialCode: `def compute_mse(y, y_hat):\n    return 0`,
      solutionCode: `def compute_mse(y, y_hat):\n    return sum((a - b)**2 for a, b in zip(y, y_hat)) / len(y)`,
      language: 'python',
      expectedOutput: '1.25',
    },
    quiz: [],
  },
  {
    title: 'Neural Network Architecture & Backpropagation',
    slug: 'neural-network-foundations',
    track: 'ai-ml',
    moduleTitle: 'Module 3: Deep Learning & Neural Networks',
    order: 4,
    readTime: '35 min',
    overview: 'Deconstruct multi-layer perceptrons, forward propagation, activation functions (ReLU, Sigmoid, Softmax), and chain-rule backpropagation.',
    keyTakeaways: [
      'Activation functions introduce non-linearity, allowing neural networks to approximate arbitrary complex functions.',
      'Backpropagation applies the calculus chain rule backwards from loss to input weights.',
    ],
    contentSections: [
      {
        heading: 'Why Non-Linearity Matters',
        bodyMarkdown: 'Without activation functions, stacking 100 linear matrix multiplications collapses mathematically into a single linear equation.',
      },
    ],
    interactiveSandbox: {
      instructions: 'Implement the ReLU activation function.',
      initialCode: `def relu(x):\n    return x`,
      solutionCode: `def relu(x):\n    return max(0, x)`,
      language: 'python',
      expectedOutput: '5',
    },
    quiz: [],
  },

  // Web Development Track
  {
    title: 'Semantic HTML5 & Document Structure',
    slug: 'modern-html5-semantic-structure',
    track: 'web-dev',
    moduleTitle: 'Module 1: HTML5, CSS Architecture & Layout Systems',
    order: 1,
    readTime: '20 min',
    overview: 'Design accessible, SEO-optimized web documents using modern HTML5 tags like main, section, nav, article, and figure.',
    keyTakeaways: [
      'Semantic tags communicate document hierarchy to screen readers and search engine crawlers.',
      'Always use a single h1 tag per page followed by logical h2-h6 nesting.',
    ],
    contentSections: [
      {
        heading: 'Why Semantic Structure Outperforms Generic Divs',
        bodyMarkdown: 'Replacing div soup with descriptive elements gives browsers built-in keyboard navigation roles, landmark jumps, and superior search indexing.',
      },
    ],
    interactiveSandbox: {
      instructions: 'Return a semantic article string wrapping heading and body.',
      initialCode: `function formatArticle(title, body) { return title + body; }`,
      solutionCode: `function formatArticle(title, body) { return '<article><h1>' + title + '</h1><p>' + body + '</p></article>'; }`,
      language: 'javascript',
      expectedOutput: '<article><h1>AI</h1><p>Rules</p></article>',
    },
    quiz: [],
  },
  {
    title: 'JavaScript Array Methods: map(), filter(), reduce()',
    slug: 'javascript-array-methods',
    track: 'web-dev',
    moduleTitle: 'Module 2: Modern JavaScript & Functional Programming',
    order: 2,
    readTime: '25 min',
    overview: 'Master functional programming in JavaScript: map, filter, reduce, find, and slice without mutating state.',
    keyTakeaways: [
      'Array methods like map and filter return a new array rather than mutating the original array.',
      'reduce is a versatile aggregator capable of calculating sums, flattening lists, or building lookup tables in O(n).',
    ],
    contentSections: [
      {
        heading: 'Higher-Order Array Methods',
        bodyMarkdown: 'Modern JavaScript avoids imperative for loops whenever possible in favor of declarative higher-order array methods.',
      },
    ],
    interactiveSandbox: {
      instructions: 'Filter items where price < 1000 and return their names in uppercase.',
      initialCode: `function filterCheap(items) { return items; }`,
      solutionCode: `function filterCheap(items) { return items.filter(i => i.price < 1000).map(i => i.name.toUpperCase()); }`,
      language: 'javascript',
      expectedOutput: '["BOOK"]',
    },
    quiz: [],
  },
  {
    title: 'DOM Manipulation & Event Architecture',
    slug: 'dom-manipulation-events',
    track: 'web-dev',
    moduleTitle: 'Module 2: Modern JavaScript & Functional Programming',
    order: 3,
    readTime: '20 min',
    overview: 'Understand event bubbling, event delegation, and efficient DOM batch updates.',
    keyTakeaways: [
      'Event delegation utilizes event bubbling to handle events at a parent container, saving memory.',
    ],
    contentSections: [
      {
        heading: 'Event Bubbling and Delegation',
        bodyMarkdown: 'Events bubble upwards through ancestors. Attaching a single listener to a common wrapper handles events for dynamic elements.',
      },
    ],
    interactiveSandbox: {
      instructions: 'Return greeting text.',
      initialCode: `function greet(n) { return n; }`,
      solutionCode: `function greet(n) { return 'Hello ' + n; }`,
      language: 'javascript',
      expectedOutput: 'Hello Rishabh',
    },
    quiz: [],
  },

  // Data & Analytics Track
  {
    title: 'SQL Joins, Aggregations & Group By Mastery',
    slug: 'sql-joins-subqueries',
    track: 'data-analytics',
    moduleTitle: 'Module 1: Relational Databases & SQL Mastery',
    order: 1,
    readTime: '25 min',
    overview: 'Write high-efficiency analytical queries using INNER, LEFT, FULL OUTER joins, HAVING clauses, and aggregate functions.',
    keyTakeaways: [
      'INNER JOIN returns matching rows only; LEFT JOIN preserves all left-table rows with NULLs for unmatched right-table attributes.',
    ],
    contentSections: [
      {
        heading: 'The Power of SQL Relational Algebra',
        bodyMarkdown: 'Relational databases execute declarative set operations. Understanding query plan indexes avoids costly full-table scans.',
      },
    ],
    interactiveSandbox: {
      instructions: 'Format an SQL query string to select active users.',
      initialCode: `function getQuery() { return ''; }`,
      solutionCode: `function getQuery() { return 'SELECT * FROM users WHERE is_active = true;'; }`,
      language: 'javascript',
      expectedOutput: 'SELECT * FROM users WHERE is_active = true;',
    },
    quiz: [],
  },
  {
    title: 'Exploratory Data Analysis & Statistical Outlier Detection',
    slug: 'exploratory-data-analysis',
    track: 'data-analytics',
    moduleTitle: 'Module 2: Business Analytics & Dashboards',
    order: 2,
    readTime: '30 min',
    overview: 'Discover distribution patterns, calculate interquartile ranges (IQR), handle skewed metrics, and prepare executive summary visual charts.',
    keyTakeaways: [
      'Always plot histograms and boxplots before running regression models.',
    ],
    contentSections: [
      {
        heading: 'Statistical Distribution & Outliers',
        bodyMarkdown: 'Outliers can distort ordinary least squares regression slopes. Detecting and understanding their origins is crucial for data accuracy.',
      },
    ],
    interactiveSandbox: {
      instructions: 'Compute IQR given Q1 and Q3.',
      initialCode: `function computeIQR(q1, q3) { return 0; }`,
      solutionCode: `function computeIQR(q1, q3) { return q3 - q1; }`,
      language: 'javascript',
      expectedOutput: '15',
    },
    quiz: [],
  },
  // Cybersecurity Track
  {
    title: 'TCP/IP Architecture & Network Packet Fundamentals',
    slug: 'tcp-ip-network-protocols',
    track: 'cybersecurity',
    moduleTitle: 'Module 1: Network Security & Traffic Analysis',
    order: 1,
    readTime: '25 min',
    overview: 'Understand how data packets traverse the OSI stack from physical bitstreams to application payloads. Master the TCP 3-way handshake and packet header structures.',
    keyTakeaways: [
      'TCP guarantees ordered delivery using sequence numbers and acknowledgements (SYN -> SYN-ACK -> ACK).',
      'UDP trades reliability for low latency and zero connection overhead.',
      'IP header time-to-live (TTL) decrements at each router hop to prevent routing loops.',
    ],
        contentSections: [
      {
        heading: '1. The Network Mental Model: OSI vs. The TCP/IP Protocol Stack',
        bodyMarkdown: `Every digital communication over the internet relies on modular protocol layering. While academic computer science teaches the theoretical 7-Layer OSI Model, the modern internet runs entirely on the pragmatic 4-Layer TCP/IP Model:

• Application Layer (L7/L5-7): HTTP/3, WebSockets, TLS, DNS, SSH, gRPC.
• Transport Layer (L4): TCP (connection-oriented, guaranteed, ordered) & UDP (stateless, zero-overhead, datagram-based).
• Network / Internet Layer (L3): IPv4 & IPv6 routing, ICMP error reporting, BGP routing tables.
• Network Access / Link Layer (L2/L1): Ethernet, Wi-Fi 802.11, ARP resolution, and optical bitstreams.

Data traversing the stack undergoes Encapsulation: application data is placed inside a TCP segment with sequence headers, wrapped inside an IP packet with source/destination addresses, framed inside an Ethernet frame with hardware MAC addresses, and converted into electrical/optical pulses. When received, the reverse process—Decapsulation—strips off headers at each layer until only raw application payload reaches your web server.`,
      },
      {
        heading: '2. Deconstructing the IPv4 Header: Packet Traversal & The TTL Mechanism',
        bodyMarkdown: `An IPv4 packet begins with a standard 20-byte base header containing crucial metadata that intermediate routers inspect at wire speed:

+---------------------------------------------------------------+
| Version (4b) | IHL (4b) | Type of Service / DSCP (8b) | Total Length (16b) |
+---------------------------------------------------------------+
| Identification (16b) | Flags: [DF, MF] (3b) | Fragment Offset (13b)      |
+---------------------------------------------------------------+
| Time to Live (TTL) (8b) | Protocol ID (8b) | Header Checksum (16b)      |
+---------------------------------------------------------------+
| Source IP Address (32 bits)                                   |
+---------------------------------------------------------------+
| Destination IP Address (32 bits)                              |
+---------------------------------------------------------------+

Crucial Fields for Security Engineers:
• Time-To-Live (TTL): An 8-bit integer initialized by the operating system (e.g. 64 on Linux, 128 on Windows). Every single router hop decrements TTL by exactly 1. When TTL hits 0, the router discards the packet and transmits an ICMP Time Exceeded (Type 11) message back to the source. This prevents packets from circulating indefinitely during routing loops and forms the exact foundation of network discovery tools like Traceroute.
• Protocol Number: Identifies the transport protocol inside the payload (0x06 for TCP, 0x11 for UDP, 0x01 for ICMP).
• Don't Fragment (DF) Flag: Tells routers not to split packets exceeding Maximum Transmission Unit (MTU = 1500 bytes). If a packet exceeds Path MTU with DF=1, routers drop it and send ICMP Destination Unreachable (Fragmentation Needed), enabling Path MTU Discovery.`,
      },
      {
        heading: '3. Anatomy of a TCP Segment & The 6 Critical Control Flags',
        bodyMarkdown: `Unlike IP which provides best-effort, unreliable delivery, Transmission Control Protocol (TCP) guarantees that every single byte transmitted is delivered in order without duplication or corruption.

The TCP header includes 6 fundamental 1-bit control flags that drive the TCP state machine:

1. SYN (Synchronize): Negotiates connection setup and establishes the Initial Sequence Number (ISN).
2. ACK (Acknowledgment): Confirms receipt of transmitted bytes up to the indicated acknowledgment number.
3. FIN (Finish): Gracefully terminates connection in one direction (the sender has no more data to transmit).
4. RST (Reset): Forcefully aborts a connection. Sent when a packet arrives for an inactive port or when an active firewall rule rejects a packet.
5. PSH (Push): Bypasses TCP receiver buffer delays, compelling the operating system to deliver the data directly to the listening application process immediately.
6. URG (Urgent): Signals that the segment contains high-priority out-of-band data indicated by the Urgent Pointer field.`,
      },
      {
        heading: '4. The TCP Three-Way Handshake Under the Hood',
        bodyMarkdown: `Establishing a reliable TCP socket requires a synchronized 3-step handshake between Client and Server:

Step 1: Client -> Server [SYN, SEQ = ISN_C]
• The client generates a pseudo-random Initial Sequence Number (ISN_C) and transmits a SYN packet.
• Client socket transitions from CLOSED -> SYN_SENT.

Step 2: Server -> Client [SYN-ACK, SEQ = ISN_S, ACK = ISN_C + 1]
• The server allocates kernel memory for a Transmission Control Block (TCB), stores the client's state in its half-open connection queue, generates its own Initial Sequence Number (ISN_S), and sets ACK = ISN_C + 1.
• Server socket transitions from LISTEN -> SYN_RCVD.

Step 3: Client -> Server [ACK, SEQ = ISN_C + 1, ACK = ISN_S + 1]
• The client confirms the server's sequence number by acknowledging ISN_S + 1.
• Both client and server sockets transition into the ESTABLISHED state, and bidirectional data transmission begins.

Security Insight — Why Random ISN Matters:
If sequence numbers were predictable (e.g. incrementing by 1 per connection), an off-path attacker could spoof a trusted IP address, predict the server's ACK number, and inject malicious commands without ever receiving the server's replies (known as TCP Sequence Prediction or Blind Connection Hijacking).`,
        codeSnippet: `# Python Scapy: Simulating and dissecting the TCP 3-Way Handshake
from scapy.all import IP, TCP, sr1, send
import sys

TARGET_HOST = "127.0.0.1"
TARGET_PORT = 5000

# Step 1: Craft and send SYN packet with custom Initial Sequence Number
ip_layer = IP(dst=TARGET_HOST)
syn_segment = TCP(dport=TARGET_PORT, flags="S", seq=100000, options=[('MSS', 1460)])
print("[+] Transmitting SYN packet to", TARGET_HOST)
syn_ack_packet = sr1(ip_layer / syn_segment, timeout=3, verbose=0)

if syn_ack_packet and syn_ack_packet.haslayer(TCP):
    server_seq = syn_ack_packet[TCP].seq
    server_ack = syn_ack_packet[TCP].ack
    flags = syn_ack_packet[TCP].flags
    print(f"[+] Received SYN-ACK! Server ISN={server_seq}, ACK={server_ack}, Flags={flags}")

    # Step 3: Complete handshake by sending final ACK
    ack_segment = TCP(dport=TARGET_PORT, flags="A", seq=server_ack, ack=server_seq + 1)
    send(ip_layer / ack_segment, verbose=0)
    print("[+] Final ACK dispatched. Connection state: ESTABLISHED!")
else:
    print("[-] No response or connection refused.")`,
        codeLanguage: 'python',
      },
      {
        heading: '5. Offensive Vector: SYN Flood Denial of Service (DoS)',
        bodyMarkdown: `A classic and persistent volumetric attack is the SYN Flood. In a standard handshake, the server allocates a kernel data structure (TCB) in its SYN-Backlog queue upon receiving a SYN packet.

How Attackers Exploit This:
1. Attacker sends tens of thousands of SYN packets per second using randomly forged source IP addresses (IP Spoofing via raw sockets).
2. The server replies with SYN-ACK to the spoofed IPs and keeps the sockets in the SYN_RCVD state waiting for the 3rd ACK.
3. Because the spoofed IPs either do not exist or drop the unexpected SYN-ACK, the final ACK is never received.
4. The server's kernel listen backlog queue becomes 100% full.
5. Result: Legitimate incoming connections from real users are dropped immediately with connection timeouts or ECONNREFUSED.`,
        codeSnippet: `# Educational Proof of Concept: Synthetic SYN Packet Generation
from scapy.all import IP, TCP, RandIP, RandShort

def generate_syn_probe(target_ip, target_port):
    # Generates a packet with a randomized spoofed source IP
    packet = IP(src=RandIP(), dst=target_ip) / TCP(sport=RandShort(), dport=target_port, flags="S", seq=42)
    return packet

print("[i] Notice how raw sockets allow forging any arbitrary source IP.")`,
        codeLanguage: 'python',
      },
      {
        heading: '6. Defensive Engineering: SYN Cookies & Linux Kernel Hardening',
        bodyMarkdown: `To survive high-volume SYN floods, modern Linux operating systems implement an ingenious defense: Cryptographic SYN Cookies (RFC 4987).

How SYN Cookies Work (Zero Memory Allocation):
When the kernel's SYN backlog queue overflows, the server stops allocating memory for half-open connections altogether. Instead, it generates a special 32-bit Initial Sequence Number (ISN) containing a cryptographic hash of:
• The client IP & port
• The server IP & port
• A 5-bit slow-moving timestamp counter
• The Maximum Segment Size (MSS) choice
• A secret cryptographic server key

When the client returns the final ACK, the server calculates the hash again from the ACK number. If the hash matches, the server initializes the connection retroactively! The server remains 100% immune to socket table memory exhaustion.

Production Linux Kernel sysctl Configuration:
Add these settings to /etc/sysctl.conf to harden servers against network denial of service:

# Enable cryptographic SYN Cookies
net.ipv4.tcp_syncookies = 1

# Increase half-open connection backlog table from 128 to 8192
net.ipv4.tcp_max_syn_backlog = 8192

# Lower SYN-ACK retry attempts to expire stale half-open sockets faster
net.ipv4.tcp_synack_retries = 2

# Reduce TCP connection timeout duration
net.ipv4.tcp_fin_timeout = 15

# Drop invalid packets using iptables
# sudo iptables -A INPUT -p tcp --tcp-flags ALL NONE -j DROP
# sudo iptables -A INPUT -p tcp ! --syn -m state --state NEW -j DROP`,
      },
      {
        heading: '7. Production Security Engineer Checklist',
        bodyMarkdown: `When auditing production network infrastructure, apply these non-negotiable rules:

1. Always enable net.ipv4.tcp_syncookies = 1 across production web and database servers.
2. Place edge reverse proxies (Cloudflare, AWS ALB, NGINX) in front of origin servers to absorb volumetric TCP floods before they reach backend application containers.
3. Configure TCP connection rate limiting per IP in iptables / nftables to prevent single-source connection flooding.
4. Enforce TLS 1.3 to ensure end-to-end encryption of all application payloads traversing the transport layer.
5. Monitor TCP socket states using 'ss -s' and 'netstat -nat | grep SYN_RECV | wc -l' to catch connection starvation early.`,
      },
    ],
    interactiveSandbox: {
      instructions: 'Simulate parsing a packet header to determine protocol type (6 for TCP, 17 for UDP).',
      initialCode: `function getProtocolName(protoNum) {\n  // 6 = TCP, 17 = UDP\n  return protoNum === 6 ? "TCP" : protoNum === 17 ? "UDP" : "OTHER";\n}`,
      solutionCode: `function getProtocolName(protoNum) {\n  return protoNum === 6 ? "TCP" : protoNum === 17 ? "UDP" : "OTHER";\n}`,
      language: 'javascript',
      expectedOutput: 'TCP',
    },
    quiz: [
      {
        question: 'Which TCP flag sequence marks a normal connection establishment?',
        options: ['SYN -> ACK -> RST', 'SYN -> SYN-ACK -> ACK', 'FIN -> ACK -> FIN-ACK', 'PUSH -> ACK -> URG'],
        correctIndex: 1,
        explanation: 'The TCP 3-way handshake consists of SYN, SYN-ACK, and ACK.',
      },
    ],
  },
  {
    title: 'Packet Analysis with Wireshark & Raw Sockets',
    slug: 'packet-analysis-wireshark',
    track: 'cybersecurity',
    moduleTitle: 'Module 1: Network Security & Traffic Analysis',
    order: 2,
    readTime: '30 min',
    overview: 'Master packet filtering expressions, stream following, and anomaly hunting in raw network traffic captures.',
    keyTakeaways: [
      'Wireshark display filters (e.g. tcp.port == 443, http.request.method == "POST") isolate suspicious network streams.',
      'Plaintext protocols (HTTP, FTP, Telnet) expose session tokens and passwords to any attacker on the local collision domain.',
    ],
    contentSections: [
      {
        heading: 'Capturing Raw Packets with Python Sockets',
        bodyMarkdown: 'Raw sockets allow user-space applications to bypass the standard transport layer and capture raw IP frames as they hit the network interface card.',
        codeSnippet: `import socket\n\n# Create raw socket (requires root/admin permissions)\ns = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_TCP)\nwhile True:\n    packet = s.recvfrom(65565)\n    print("Captured packet byte length:", len(packet[0]))`,
        codeLanguage: 'python',
      },
    ],
    interactiveSandbox: {
      instructions: 'Validate whether a port is a reserved well-known port (< 1024).',
      initialCode: `function isWellKnownPort(port) {\n  return port < 1024;\n}`,
      solutionCode: `function isWellKnownPort(port) {\n  return port < 1024;\n}`,
      language: 'javascript',
      expectedOutput: 'true',
    },
    quiz: [
      {
        question: 'Which display filter isolates all unencrypted HTTP traffic to port 80?',
        options: ['ip.addr == 80', 'tcp.port == 80', 'http.port == 443', 'udp.port == 80'],
        correctIndex: 1,
        explanation: 'tcp.port == 80 isolates all TCP traffic traveling to or from port 80.',
      },
    ],
  },
  {
    title: 'SQL Injection: Exploitation & Parameterized Defense',
    slug: 'sql-injection-defense',
    track: 'cybersecurity',
    moduleTitle: 'Module 2: Application Security & OWASP Top 10',
    order: 3,
    readTime: '30 min',
    overview: 'Understand how unescaped user input alters SQL AST parsing, leading to unauthorized data exfiltration. Learn how prepared statements eliminate SQLi entirely.',
    keyTakeaways: [
      'String concatenation in database queries allows attackers to break out of data literals into SQL instruction context.',
      'Prepared statements pre-compile the SQL execution plan before binding parameters, rendering injection attacks harmless.',
    ],
    contentSections: [
      {
        heading: 'Vulnerable vs Prepared SQL Queries',
        bodyMarkdown: 'When input is concatenated directly, an input like `admin\' --` comments out password checks. Parameterized queries send data separately over the protocol wire.',
        codeSnippet: `// ❌ VULNERABLE: Direct string interpolation\nconst sql = \`SELECT * FROM users WHERE email = '\${inputEmail}'\`;\n\n// ✅ SECURE: Parameterized Prepared Statement\nconst sql = 'SELECT * FROM users WHERE email = $1';\nawait pool.query(sql, [inputEmail]);`,
        codeLanguage: 'javascript',
      },
    ],
    interactiveSandbox: {
      instructions: 'Sanitize input by checking for single quotes and SQL comments.',
      initialCode: `function containsSqlInjectionChars(input) {\n  return input.includes("'") || input.includes("--");\n}`,
      solutionCode: `function containsSqlInjectionChars(input) {\n  return input.includes("'") || input.includes("--");\n}`,
      language: 'javascript',
      expectedOutput: 'true',
    },
    quiz: [
      {
        question: 'What is the absolute most reliable defense against SQL Injection?',
        options: ['Blacklisting words like "SELECT" and "UNION"', 'URL encoding all incoming query parameters', 'Using parameterized queries / prepared statements', 'Running queries as database superuser'],
        correctIndex: 2,
        explanation: 'Parameterized queries separate code from data at the database parser level.',
      },
    ],
  },
  {
    title: 'Cross-Site Scripting (XSS) & Content Security Policy',
    slug: 'cross-site-scripting-csp',
    track: 'cybersecurity',
    moduleTitle: 'Module 2: Application Security & OWASP Top 10',
    order: 4,
    readTime: '25 min',
    overview: 'Explore stored, reflected, and DOM-based XSS vectors. Learn how Content Security Policy (CSP) headers mitigate rogue script execution in modern browsers.',
    keyTakeaways: [
      'Stored XSS executes whenever victim users load corrupted records stored in a database.',
      'Modern frontend frameworks like React escape text nodes by default to block simple innerHTML injections.',
      'HTTP response header Content-Security-Policy restricts scripts to trusted origins and nonces.',
    ],
    contentSections: [
      {
        heading: 'How CSP Restricts Script Execution',
        bodyMarkdown: 'Setting `Content-Security-Policy: default-src \'self\'; script-src \'self\' https://trustedcdn.com` stops inline `<script>evil()</script>` from running even if an attacker manages to inject HTML.',
      },
    ],
    interactiveSandbox: {
      instructions: 'Escape HTML special characters to prevent reflected XSS.',
      initialCode: `function escapeHTML(str) {\n  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");\n}`,
      solutionCode: `function escapeHTML(str) {\n  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");\n}`,
      language: 'javascript',
      expectedOutput: '&lt;script&gt;',
    },
    quiz: [
      {
        question: 'Which HTTP header prevents a site from being embedded inside an attacker iframe (Clickjacking)?',
        options: ['X-Frame-Options', 'Access-Control-Allow-Origin', 'Cache-Control', 'Accept-Encoding'],
        correctIndex: 0,
        explanation: 'X-Frame-Options: DENY or SAMEORIGIN prevents clickjacking attacks via iframes.',
      },
    ],
  },
  {
    title: 'Applied Cryptography: TLS, AES-GCM & RSA Key Exchange',
    slug: 'cryptography-tls-rsa',
    track: 'cybersecurity',
    moduleTitle: 'Module 3: Cryptography & Infrastructure Defense',
    order: 5,
    readTime: '30 min',
    overview: 'Differentiate symmetric and asymmetric cryptography. Master authenticated encryption with AES-256-GCM, Diffie-Hellman ephemeral key exchanges, and TLS 1.3.',
    keyTakeaways: [
      'Symmetric encryption (AES) is fast and encrypts bulk payload data.',
      'Asymmetric encryption (RSA/ECC) securely exchanges symmetric session keys over untrusted networks.',
      'Hashing (SHA-256, bcrypt, Argon2) is one-way and cannot be reversed; bcrypt uses salt and work factors for password storage.',
    ],
    contentSections: [
      {
        heading: 'Symmetric vs Asymmetric Encryption',
        bodyMarkdown: 'In TLS 1.3, an asymmetric Diffie-Hellman key exchange generates a shared secret without ever transmitting the secret across the wire. That secret derives AES-256-GCM symmetric session keys to encrypt high-throughput application streams.',
      },
    ],
    interactiveSandbox: {
      instructions: 'Demonstrate XOR encryption with a single-byte key.',
      initialCode: `function xorCipher(text, key) {\n  return text.split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ key)).join('');\n}`,
      solutionCode: `function xorCipher(text, key) {\n  return text.split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ key)).join('');\n}`,
      language: 'javascript',
      expectedOutput: 'C',
    },
    quiz: [
      {
        question: 'Why should passwords be stored with algorithms like bcrypt or Argon2 instead of SHA-256?',
        options: ['SHA-256 is deprecated and broken', 'bcrypt has a configurable computational work factor to resist GPU brute-force attacks', 'SHA-256 outputs plain text', 'Argon2 requires no CPU cycles'],
        correctIndex: 1,
        explanation: 'Password hashing functions like bcrypt and Argon2 are intentionally slow and memory-hard to prevent fast parallel GPU cracker attacks.',
      },
    ],
  },
  {
    title: 'Linux Hardening, SSH Security & Firewall Configuration',
    slug: 'linux-hardening-firewalls',
    track: 'cybersecurity',
    moduleTitle: 'Module 3: Cryptography & Infrastructure Defense',
    order: 6,
    readTime: '25 min',
    overview: 'Configure UFW and iptables firewalls, disable root password logins over SSH, implement Fail2ban, and audit system logs for intrusion attempts.',
    keyTakeaways: [
      'Disable root login (`PermitRootLogin no`) and password authentication in `/etc/ssh/sshd_config`.',
      'Enforce least-privilege Unix file permissions (chmod 600 for private keys).',
      'Configure default DENY inbound firewall rules with explicit whitelisting for required service ports.',
    ],
    contentSections: [
      {
        heading: 'Essential SSH Server Hardening Steps',
        bodyMarkdown: '1. Change default SSH port\n2. Enforce Ed25519 public key authentication\n3. Disable password authentication (`PasswordAuthentication no`)\n4. Enable fail2ban to automatically jail IPs attempting repeated failed logins.',
      },
    ],
    interactiveSandbox: {
      instructions: 'Validate an IP address string format.',
      initialCode: `function isValidIPv4(ip) {\n  const parts = ip.split('.');\n  if (parts.length !== 4) return false;\n  return parts.every(p => { const n = Number(p); return !isNaN(n) && n >= 0 && n <= 255; });\n}`,
      solutionCode: `function isValidIPv4(ip) {\n  const parts = ip.split('.');\n  if (parts.length !== 4) return false;\n  return parts.every(p => { const n = Number(p); return !isNaN(n) && n >= 0 && n <= 255; });\n}`,
      language: 'javascript',
      expectedOutput: 'true',
    },
    quiz: [
      {
        question: 'What is the recommended permission mask for an SSH private key (`~/.ssh/id_rsa`) on Linux?',
        options: ['chmod 777', 'chmod 600', 'chmod 644', 'chmod 755'],
        correctIndex: 1,
        explanation: 'chmod 600 grants read/write permissions exclusively to the owner and blocks all group and other user access.',
      },
    ],
  },
];

export const getCleanMentors = () => [
  {
    name: 'Tushar Chaurasia',
    title: 'Senior Information Security Engineer',
    company: 'CrowdStrike',
    domain: 'Cybersecurity',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
    rating: 4.96,
    reviewsCount: 58,
    bio: 'Specializes in Network Security, Threat Hunting, Packet Inspection, SOC operations, and incident response.',
    hourlyRate: 'Free for Pro',
    topics: ['Network Security', 'Vulnerability Assessment', 'Career Direction', 'Project Review'],
    availability: ['Today, 6:00 PM IST', 'Tomorrow, 5:30 PM IST', 'Saturday, 11:00 AM IST'],
    isAvailableToday: true,
  },
  {
    name: 'Megha Sundaram',
    title: 'Lead Application Security Architect',
    company: 'Palo Alto Networks',
    domain: 'Cybersecurity',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop',
    rating: 4.98,
    reviewsCount: 72,
    bio: 'OWASP speaker & penetration tester. Guides students in Web Pentesting, Bug Bounty methodologies, and DevSecOps pipelines.',
    hourlyRate: 'Free for Pro',
    topics: ['Web Pentesting', 'OWASP Top 10', 'Hackathon Strategy', 'Project Review'],
    availability: ['Tomorrow, 7:00 PM IST', 'Sunday, 3:00 PM IST'],
    isAvailableToday: true,
  },
  {
    name: 'Aditya Verma',
    title: 'Security Operations & Linux Hardening Specialist',
    company: 'Qualys',
    domain: 'Cybersecurity',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop',
    rating: 4.93,
    reviewsCount: 44,
    bio: 'Helped 80+ collegiate engineers break into offensive & defensive security roles. Passionate about Linux kernels and ethical hacking.',
    hourlyRate: 'Free for Pro',
    topics: ['Linux Hardening', 'Internship Prep', 'Certifications (CEH/OSCP)', 'Roadmap'],
    availability: ['Friday, 6:00 PM IST'],
    isAvailableToday: false,
  },
  {
    name: 'Priyanka Sen',
    title: 'Staff AI Engineer',
    company: 'Microsoft',
    domain: 'AI & Machine Learning',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop',
    rating: 4.98,
    reviewsCount: 84,
    bio: 'SIH Mentor & Judge. Specializes in LLM agents, Python architectures, and winning hackathon strategies.',
    hourlyRate: 'Free for Pro',
    topics: ['Hackathon Strategy', 'Project Review', 'Portfolio Building'],
    availability: ['Tomorrow, 4:00 PM IST', 'Sunday, 2:00 PM IST'],
    isAvailableToday: true,
  },
  {
    name: 'Aayush Saxena',
    title: 'Senior Software Engineer',
    company: 'Razorpay',
    domain: 'Full-Stack Development',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop',
    rating: 4.95,
    reviewsCount: 62,
    bio: 'Passionate about fintech architectures, distributed Node.js backends, and mentoring collegiate developers.',
    hourlyRate: 'Free for Pro',
    topics: ['Career Direction', 'Roadmap', 'Project Review', 'Internship Prep'],
    availability: ['Today, 5:00 PM IST', 'Tomorrow, 6:30 PM IST', 'Saturday, 11:00 AM IST'],
    isAvailableToday: true,
  },
  {
    name: 'Rohan Deshmukh',
    title: 'Full-Stack Architect',
    company: 'Atlassian',
    domain: 'Full-Stack Development',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop',
    rating: 4.92,
    reviewsCount: 51,
    bio: 'Helped 150+ students secure Tier-1 tech internships. Expert in frontend performance & system design.',
    hourlyRate: 'Free for Pro',
    topics: ['Portfolio Building', 'Internship Prep', 'Career Direction'],
    availability: ['Friday, 7:00 PM IST'],
    isAvailableToday: false,
  },
];

export const seedDatabase = async () => {
  try {
    const existingUser = await User.findOne({ email: 'rishabh@rishabhlabs.com' });
    if (existingUser) {
      console.log('ℹ️ [Seed] Synchronizing clean baseline, zero-progress state, and AI/ML project suite...');
      await User.updateOne({ email: 'rishabh@rishabhlabs.com' }, { college: '' });
      await StudentProfile.updateMany({}, {
        streakDays: 0,
        totalPoints: 0,
        progressPercent: 0,
        skillsCompleted: 0,
        projectsCompleted: 0,
        totalProjects: 0,
        githubStats: { connected: false, username: '', totalCommits: 0, reposCount: 0, recentActivities: [] }
      });
      await DailyMission.updateMany({}, {
        completedTasksCount: 0,
        isAllCompleted: false,
        'tasks.$[].isCompleted': false
      });
      await Project.deleteMany({});
      await Project.create(getCleanProjects());
      await Lesson.deleteMany({});
      await Lesson.create(getCleanLessons());
      await Mentor.deleteMany({});
      await Mentor.create(getCleanMentors());
      console.log('✅ [Seed] Project suite, curriculum, and mentors synchronized.');
      return;
    }

    console.log('🌱 [Seed] Seeding Rishabh Labs database with realistic production-quality data...');

    // 1. Create Users (Student, Mentor, College Admin, Super Admin)
    const passwordHash = await bcrypt.hash('password123', 10);

    const studentUser = await User.create({
      name: 'Rishabh Mishra',
      email: 'rishabh@rishabhlabs.com',
      password: passwordHash,
      role: 'student',
      college: '',
      degree: 'BCA - Data Science',
      year: '3rd Year',
      avatar: '/avatars/rishabh.png',
      bio: 'Building full-stack software, refining algorithmic intuition, and shipping real-world products.',
      githubUsername: 'rishabh-labs',
      isOnboarded: true,
    });

    const mentorUser = await User.create({
      name: 'Dr. Arpit Khare',
      email: 'mentor@rishabhlabs.com',
      password: passwordHash,
      role: 'mentor',
      college: 'IIT Kanpur Alumni',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
      bio: 'Staff Engineer at Stripe. Former SIH Winner. Guiding students in system design & scalable MVPs.',
      isOnboarded: true,
    });

    const collegeAdmin = await User.create({
      name: 'Prof. S. K. Singh',
      email: 'admin@gla.ac.in',
      password: passwordHash,
      role: 'college_admin',
      college: 'GLA University',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop',
      bio: 'Dean of Student Placements & Academic Projects at GLA University.',
      isOnboarded: true,
    });

    const superAdmin = await User.create({
      name: 'Rishabh Labs Admin',
      email: 'superadmin@rishabhlabs.com',
      password: passwordHash,
      role: 'super_admin',
      avatar: '/avatars/rishabh.png',
      isOnboarded: true,
    });

    // 2. Onboarding record
    await Onboarding.create({
      userId: studentUser._id,
      goal: 'Web Development',
      currentLevel: 'Beginner',
      availableTime: '2 hours/day',
      desiredOutcome: 'Build projects',
      targetDate: '90 days',
      existingSkills: ['HTML', 'CSS', 'JavaScript basics'],
      preferredLearningStyle: 'Hands-on Building',
      status: 'completed',
    });

    // 3. Roadmap (6 Stepped 3D Nodes matching UI reference Screen 4)
    const roadmap = await Roadmap.create({
      title: 'Web Development Execution Track',
      slug: 'web-development',
      category: 'Web Development',
      targetLevel: 'Beginner',
      estimatedDailyTime: '2 hr/day',
      totalDurationDays: 90,
      totalNodes: 6,
      completedNodes: 1,
      userId: studentUser._id,
      nodes: [
        {
          nodeId: 'node-1',
          stepNumber: 1,
          title: 'Foundations',
          subtitle: 'Terminal, Git, Modern Web Architecture',
          description: 'Build terminal fluency, configure Git remote workflows, understand DNS, client-server models, and HTTP headers.',
          category: 'Core',
          status: 'completed',
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
          description: 'Master semantic HTML5, CSS Grid/Flexbox layouts, array methods, asynchronous promises, and real-time DOM updates.',
          category: 'Frontend Core',
          status: 'in_progress',
          estimatedHours: 35,
          skillsCovered: ['HTML5', 'CSS Grid', 'ES6+ JavaScript', 'Array Methods', 'DOM APIs'],
          lessonsCount: 12,
          projectsCount: 2,
          iconName: 'Code',
        },
        {
          nodeId: 'node-3',
          stepNumber: 3,
          title: 'React',
          subtitle: 'Component Architecture, Hooks & State',
          description: 'Learn component composability, useState, useEffect, custom hooks, context API, and high-performance rendering.',
          category: 'Frontend Framework',
          status: 'locked',
          estimatedHours: 40,
          skillsCovered: ['React 18', 'TypeScript', 'Tailwind CSS', 'State Management'],
          lessonsCount: 14,
          projectsCount: 2,
          iconName: 'Layers',
        },
        {
          nodeId: 'node-4',
          stepNumber: 4,
          title: 'Backend',
          subtitle: 'Node.js, Express, REST APIs & Auth',
          description: 'Design RESTful APIs, JWT token cycles, password hashing, Express middleware pipelines, and MongoDB schemas.',
          category: 'Backend Core',
          status: 'locked',
          estimatedHours: 35,
          skillsCovered: ['Node.js', 'Express', 'JWT Authentication', 'REST Architecture', 'Mongoose'],
          lessonsCount: 12,
          projectsCount: 2,
          iconName: 'Server',
        },
        {
          nodeId: 'node-5',
          stepNumber: 5,
          title: 'Projects',
          subtitle: 'Full-Stack Integration & Production Deployment',
          description: 'Build end-to-end applications, configure CORS, environment secrets, cloud databases, and automated Vercel/Render deployments.',
          category: 'Full Stack',
          status: 'locked',
          estimatedHours: 45,
          skillsCovered: ['Full-Stack Integration', 'MongoDB Atlas', 'Cloud Hosting', 'CI/CD Pipelines'],
          lessonsCount: 8,
          projectsCount: 3,
          iconName: 'FolderGit2',
        },
        {
          nodeId: 'node-6',
          stepNumber: 6,
          title: 'Internship Ready',
          subtitle: 'Proof of Work, Technical Interview & Portfolio',
          description: 'Polish live portfolio, publish verified Proof of Work, master data structures algorithms, and clear mock interviews.',
          category: 'Career Execution',
          status: 'locked',
          estimatedHours: 25,
          skillsCovered: ['Public Portfolio', 'System Design', 'Algorithmic Problem Solving', 'Placement Ready'],
          lessonsCount: 6,
          projectsCount: 1,
          iconName: 'Award',
        },
      ],
    });

    // 4. Student Profile
    await StudentProfile.create({
      userId: studentUser._id,
      targetGoal: 'AI & Machine Learning',
      streakDays: 0,
      totalPoints: 0,
      activeRoadmapId: roadmap._id,
      progressPercent: 0,
      skillsCompleted: 0,
      totalSkills: 18,
      projectsCompleted: 0,
      totalProjects: 0,
      githubStats: {
        connected: false,
        username: '',
        totalCommits: 0,
        reposCount: 0,
        recentActivities: [],
      },
    });

    // 5. Daily Mission (Day 1 • AI & Machine Learning)
    await DailyMission.create({
      userId: studentUser._id,
      dayNumber: 1,
      trackTitle: 'AI & Machine Learning',
      dateString: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      quote: 'Small steps every day lead to exponential results.',
      tasks: [
        {
          taskId: 'task-1-learn',
          type: 'learn',
          title: 'Learn - NumPy Vectorization & Array Operations (30 min)',
          durationMinutes: 30,
          durationText: '30 min',
          description: 'Master fast SIMD array operations, broadcasting rules, and memory layout in NumPy.',
          isCompleted: false,
          actionUrl: '/learn/ai-ml/numpy-vectorization',
          proofRequired: false,
        },
        {
          taskId: 'task-1-practice',
          type: 'practice',
          title: 'Practice - Solve 2 algorithmic problems (20 min)',
          durationMinutes: 20,
          durationText: '20 min',
          description: 'Solve "Filter Active Users" and "Two Sum" in the interactive coding sandbox.',
          isCompleted: false,
          actionUrl: '/practice/filter-active-users',
          proofRequired: false,
        },
        {
          taskId: 'task-1-build',
          type: 'build',
          title: 'Build - Initialize ML classification pipeline (45 min)',
          durationMinutes: 45,
          durationText: '45 min',
          description: 'Scaffold project repository and build data preprocessing pipeline.',
          isCompleted: false,
          actionUrl: '/projects/customer-churn-predictor',
          proofRequired: false,
        },
        {
          taskId: 'task-1-ship',
          type: 'ship',
          title: "Ship - Push Day 1 code to GitHub (10 min)",
          durationMinutes: 10,
          durationText: '10 min',
          description: 'Commit your clean code with git commit -m "feat: init data ingestion pipeline" and push to remote repository.',
          isCompleted: false,
          actionUrl: '/projects/customer-churn-predictor',
          proofRequired: true,
        },
      ],
      completedTasksCount: 0,
      isAllCompleted: false,
    });

    // 6. Lessons (Curated across AI/ML, Web Dev, Data Science)
    await Lesson.create(getCleanLessons());

    // 7. Coding Problems (At least 10 realistic algorithmic + Debugging "Fix the Bug" challenges)
    await CodingProblem.create([
      {
        title: 'Filter Active Users',
        slug: 'filter-active-users',
        difficulty: 'Easy',
        category: 'Array Methods',
        descriptionMarkdown: `Given an array of user objects where each user has \`id\`, \`name\`, and \`isActive\` boolean flags, return a new array containing only the users where \`isActive\` is \`true\`.
        
The returned array must preserve the original relative ordering of the active users.`,
        examples: [
          {
            input: '[{"id":1,"name":"Rishabh","isActive":true},{"id":2,"name":"Aarav","isActive":false},{"id":3,"name":"Pooja","isActive":true}]',
            output: '[{"id":1,"name":"Rishabh","isActive":true},{"id":3,"name":"Pooja","isActive":true}]',
            explanation: 'Users with id 1 and 3 have isActive set to true.',
          },
        ],
        constraints: [
          '1 <= users.length <= 10^4',
          'Each object will contain valid id, name, and isActive properties',
        ],
        hints: {
          level1Concept: 'Look into the built-in JavaScript Array method that filters elements based on a predicate condition.',
          level2Stronger: 'Array.prototype.filter() accepts a callback function and keeps elements where the callback evaluates to truthy.',
          level3Approach: 'return users.filter(user => user.isActive === true);',
          level4Mentor: 'Book a 15-minute 1:1 session with a mentor to review optimal array transformations and space complexity.',
        },
        starterCode: {
          javascript: `function filterActiveUsers(users) {
  // Write your code here
  return users.filter(u => u.isActive);
}`,
          python: `def filter_active_users(users):
    return [u for u in users if u.get('isActive') is True]`,
          cpp: `// C++ implementation`,
          java: `// Java implementation`,
        },
        testCases: [
          {
            testCaseId: 'tc-1',
            input: '[{"id":1,"name":"Rishabh","isActive":true},{"id":2,"name":"Aarav","isActive":false}]',
            expectedOutput: '[{"id":1,"name":"Rishabh","isActive":true}]',
            isHidden: false,
          },
          {
            testCaseId: 'tc-2',
            input: '[{"id":10,"name":"Dev","isActive":false}]',
            expectedOutput: '[]',
            isHidden: false,
          },
          {
            testCaseId: 'tc-3',
            input: '[{"id":1,"name":"Alpha","isActive":true},{"id":2,"name":"Beta","isActive":true}]',
            expectedOutput: '[{"id":1,"name":"Alpha","isActive":true},{"id":2,"name":"Beta","isActive":true}]',
            isHidden: true,
          },
        ],
        tags: ['Arrays', 'Functional Programming', 'JavaScript'],
        acceptanceRate: 91.2,
      },
      {
        title: 'Two Sum',
        slug: 'two-sum',
        difficulty: 'Easy',
        category: 'Hash Map & Arrays',
        descriptionMarkdown: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
        examples: [
          {
            input: '{"nums":[2,7,11,15],"target":9}',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
          },
        ],
        constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
        hints: {
          level1Concept: 'A brute force solution checks every pair with two nested loops O(n²). Can you do it in one pass with a Hash Map?',
          level2Stronger: 'For each number x, calculate the required complement = target - x. Check if complement already exists in your map.',
          level3Approach: 'Create an object/map. Loop through nums: if target - nums[i] in map, return [map[target - nums[i]], i]. Else map[nums[i]] = i.',
          level4Mentor: 'Let a mentor walk you through time-space trade-offs in technical placement rounds.',
        },
        starterCode: {
          javascript: `function twoSum(nums, target) {
  const map = {};
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map[complement] !== undefined) {
      return [map[complement], i];
    }
    map[nums[i]] = i;
  }
  return [];
}`,
          python: `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i
    return []`,
          cpp: '',
          java: '',
        },
        testCases: [
          {
            testCaseId: 'ts-1',
            input: '{"nums":[2,7,11,15],"target":9}',
            expectedOutput: '[0,1]',
            isHidden: false,
          },
          {
            testCaseId: 'ts-2',
            input: '{"nums":[3,2,4],"target":6}',
            expectedOutput: '[1,2]',
            isHidden: false,
          },
          {
            testCaseId: 'ts-3',
            input: '{"nums":[3,3],"target":6}',
            expectedOutput: '[0,1]',
            isHidden: true,
          },
        ],
        tags: ['Arrays', 'Hash Map', 'LeetCode Classic'],
        acceptanceRate: 84.5,
      },
      {
        title: 'Fix the Bug: Off-by-One Array Accumulator',
        slug: 'fix-the-bug-off-by-one',
        difficulty: 'Easy',
        category: 'Debugging Lab',
        isDebuggingChallenge: true,
        brokenBugExplanation: 'This function contains a subtle off-by-one boundary bug causing it to skip the final item or access undefined.',
        descriptionMarkdown: `### Debugging Challenge: Fix the Bug
A junior engineer wrote the following helper function to calculate the running total of invoice amounts, but the test suite is failing with incorrect totals or NaN.
        
**Your Mission:** Locate the bug, correct the logic, and pass all test cases!`,
        examples: [
          { input: '[10,20,30]', output: '60', explanation: '10 + 20 + 30 = 60' },
        ],
        constraints: ['Array contains positive numbers'],
        hints: {
          level1Concept: 'Check the loop condition. Does it evaluate index <= array.length or index < array.length?',
          level2Stronger: 'Remember arrays are 0-indexed. Accessing array[array.length] yields undefined.',
          level3Approach: 'Change loop from i <= items.length to i < items.length, or simply use items.reduce((a,b)=>a+b, 0).',
          level4Mentor: 'Discuss defensive programming practices with a mentor.',
        },
        starterCode: {
          javascript: `function solution(items) {
  // BUGGY CODE:
  let total = 0;
  for (let i = 0; i <= items.length; i++) { // Find and fix the bug!
    if (items[i] !== undefined) total += items[i];
  }
  return total;
}`,
          python: `def solution(items):
    return sum(items)`,
          cpp: '',
          java: '',
        },
        testCases: [
          { testCaseId: 'dbg-1', input: '[10,20,30]', expectedOutput: '60', isHidden: false },
          { testCaseId: 'dbg-2', input: '[5,15,25,35]', expectedOutput: '80', isHidden: false },
          { testCaseId: 'dbg-3', input: '[100]', expectedOutput: '100', isHidden: true },
        ],
        tags: ['Debugging Lab', 'Fix the Bug', 'JavaScript'],
        acceptanceRate: 96.0,
      },
      {
        title: 'Valid Palindrome',
        slug: 'valid-palindrome',
        difficulty: 'Easy',
        category: 'Strings & Pointers',
        descriptionMarkdown: 'Determine if a given string is a palindrome, considering only alphanumeric characters and ignoring cases.',
        examples: [{ input: '"A man, a plan, a canal: Panama"', output: 'true' }],
        constraints: ['1 <= s.length <= 2 * 10^5'],
        hints: {
          level1Concept: 'Clean the string with a regular expression [^a-z0-9] and lowercase it.',
          level2Stronger: 'Compare the clean string with its reverse.',
          level3Approach: 'const clean = s.toLowerCase().replace(/[^a-z0-9]/g, ""); return clean === clean.split("").reverse().join("");',
          level4Mentor: 'Ask a mentor about two-pointer memory optimizations in interviews.',
        },
        starterCode: {
          javascript: `function solution(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}`,
          python: `def solution(s):
    clean = [c.lower() for c in s if c.isalnum()]
    return clean == clean[::-1]`,
          cpp: '',
          java: '',
        },
        testCases: [
          { testCaseId: 'vp-1', input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true', isHidden: false },
          { testCaseId: 'vp-2', input: '"race a car"', expectedOutput: 'false', isHidden: false },
          { testCaseId: 'vp-3', input: '" "', expectedOutput: 'true', isHidden: true },
        ],
        tags: ['Strings', 'Two Pointers'],
        acceptanceRate: 88.0,
      },
      {
        title: 'Group Anagrams',
        slug: 'group-anagrams',
        difficulty: 'Medium',
        category: 'Hash Map & Sorting',
        descriptionMarkdown: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.',
        examples: [{ input: '["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }],
        constraints: ['1 <= strs.length <= 10^4'],
        hints: {
          level1Concept: 'Two words are anagrams if their sorted characters are identical.',
          level2Stronger: 'Use the sorted word as a key in a hash table.',
          level3Approach: 'Map key = word.split("").sort().join(""); push original words to corresponding key.',
          level4Mentor: 'Review frequency array vs sorting complexities with a mentor.',
        },
        starterCode: {
          javascript: `function solution(strs) {
  const map = {};
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!map[key]) map[key] = [];
    map[key].push(s);
  }
  return Object.values(map);
}`,
          python: `def solution(strs):
    from collections import defaultdict
    ans = defaultdict(list)
    for s in strs:
        ans[tuple(sorted(s))].append(s)
    return list(ans.values())`,
          cpp: '',
          java: '',
        },
        testCases: [
          { testCaseId: 'ga-1', input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]', isHidden: false },
        ],
        tags: ['Hash Map', 'Medium', 'Strings'],
        acceptanceRate: 74.2,
      },
      {
        title: 'Fix the Bug: Async Promise Chain Drop',
        slug: 'fix-the-bug-async-drop',
        difficulty: 'Medium',
        category: 'Debugging Lab',
        isDebuggingChallenge: true,
        brokenBugExplanation: 'A missing return or un-awaited promise causes undefined to be resolved early.',
        descriptionMarkdown: 'Identify why the async function resolves before the nested calculation completes.',
        examples: [{ input: '5', output: '25' }],
        constraints: ['Async/await usage'],
        hints: {
          level1Concept: 'Check if all async calls have await or proper promise returns.',
          level2Stronger: 'Make sure the outer function awaits the promise resolution.',
          level3Approach: 'return await calculateSquare(val);',
          level4Mentor: 'Learn microtask queue and event loop mechanisms with a mentor.',
        },
        starterCode: {
          javascript: `function solution(val) {
  return val * val;
}`,
          python: `def solution(val): return val * val`,
          cpp: '',
          java: '',
        },
        testCases: [
          { testCaseId: 'adb-1', input: '5', expectedOutput: '25', isHidden: false },
          { testCaseId: 'adb-2', input: '12', expectedOutput: '144', isHidden: true },
        ],
        tags: ['Debugging Lab', 'Async JavaScript'],
        acceptanceRate: 92.0,
      },
      {
        title: 'Merge Intervals',
        slug: 'merge-intervals',
        difficulty: 'Medium',
        category: 'Arrays & Sorting',
        descriptionMarkdown: 'Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals.',
        examples: [{ input: '[[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' }],
        constraints: ['1 <= intervals.length <= 10^4'],
        hints: {
          level1Concept: 'Sort intervals by their starting points first.',
          level2Stronger: 'Compare the start of current interval with the end of previous interval.',
          level3Approach: 'if curr[0] <= prev[1], merge: prev[1] = Math.max(prev[1], curr[1]).',
          level4Mentor: 'Prepare interval greedy algorithms with a mentor.',
        },
        starterCode: {
          javascript: `function solution(intervals) {
  if (!intervals.length) return [];
  intervals.sort((a,b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = intervals[i];
    if (curr[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }
  return merged;
}`,
          python: '',
          cpp: '',
          java: '',
        },
        testCases: [
          { testCaseId: 'mi-1', input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]', isHidden: false },
        ],
        tags: ['Intervals', 'Medium'],
        acceptanceRate: 69.8,
      },
      {
        title: 'Longest Substring Without Repeating Characters',
        slug: 'longest-substring-without-repeating',
        difficulty: 'Medium',
        category: 'Sliding Window',
        descriptionMarkdown: 'Given a string s, find the length of the longest substring without duplicate characters.',
        examples: [{ input: '"abcabcbb"', output: '3' }],
        constraints: ['0 <= s.length <= 5 * 10^4'],
        hints: {
          level1Concept: 'Use a sliding window with two pointers (left and right).',
          level2Stronger: 'Keep track of character last seen positions in a set or map.',
          level3Approach: 'Slide right pointer. When duplicate occurs, advance left pointer past the previous occurrence.',
          level4Mentor: 'Master sliding window interview patterns with a mentor.',
        },
        starterCode: {
          javascript: `function solution(s) {
  let set = new Set();
  let left = 0;
  let maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }
    set.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
          python: '',
          cpp: '',
          java: '',
        },
        testCases: [
          { testCaseId: 'lsw-1', input: '"abcabcbb"', expectedOutput: '3', isHidden: false },
          { testCaseId: 'lsw-2', input: '"bbbbb"', expectedOutput: '1', isHidden: false },
        ],
        tags: ['Sliding Window', 'Medium'],
        acceptanceRate: 65.4,
      },
      {
        title: 'Binary Search',
        slug: 'binary-search',
        difficulty: 'Easy',
        category: 'Algorithms',
        descriptionMarkdown: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums in O(log n) runtime.',
        examples: [{ input: '{"nums":[-1,0,3,5,9,12],"target":9}', output: '4' }],
        constraints: ['1 <= nums.length <= 10^4'],
        hints: {
          level1Concept: 'Divide the search range in half each step.',
          level2Stronger: 'Calculate mid = Math.floor((left + right) / 2).',
          level3Approach: 'if nums[mid] === target return mid; else adjust left = mid + 1 or right = mid - 1.',
          level4Mentor: 'Discuss binary search boundary nuances with a mentor.',
        },
        starterCode: {
          javascript: `function solution(input) {
  const { nums, target } = typeof input === 'string' ? JSON.parse(input) : input;
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
          python: '',
          cpp: '',
          java: '',
        },
        testCases: [
          { testCaseId: 'bs-1', input: '{"nums":[-1,0,3,5,9,12],"target":9}', expectedOutput: '4', isHidden: false },
        ],
        tags: ['Binary Search', 'Algorithms'],
        acceptanceRate: 89.1,
      },
      {
        title: 'Trapping Rain Water',
        slug: 'trapping-rain-water',
        difficulty: 'Hard',
        category: 'Two Pointers & Dynamic Programming',
        descriptionMarkdown: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
        examples: [{ input: '[0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' }],
        constraints: ['n == height.length', '1 <= n <= 2 * 10^4'],
        hints: {
          level1Concept: 'The water above any bar is determined by min(maxLeft, maxRight) - currentHeight.',
          level2Stronger: 'Use two pointers from left and right moving inwards based on which max is smaller.',
          level3Approach: 'Keep leftMax and rightMax; accumulate water = leftMax - height[left] whenever leftMax < rightMax.',
          level4Mentor: 'Hard problems require structural proof. Review with a senior engineer.',
        },
        starterCode: {
          javascript: `function solution(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) leftMax = height[left];
      else water += leftMax - height[left];
      left++;
    } else {
      if (height[right] >= rightMax) rightMax = height[right];
      else water += rightMax - height[right];
      right--;
    }
  }
  return water;
}`,
          python: '',
          cpp: '',
          java: '',
        },
        testCases: [
          { testCaseId: 'trw-1', input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', isHidden: false },
        ],
        tags: ['Two Pointers', 'Hard', 'Classic'],
        acceptanceRate: 59.3,
      },
    ]);

    // 8. Projects (Curated across AI/ML & Web Development)
    await Project.create(getCleanProjects());

    // 9. Mentors (Curated across Cybersecurity, AI/ML, Full-Stack)
    await Mentor.create(getCleanMentors());

    // 10. Weekly Review (Clean baseline 0% review for current week)
    await WeeklyReview.create({
      userId: studentUser._id,
      weekLabel: 'Week 1',
      dateRange: 'Current Week',
      plannedHours: 10,
      completedHours: 0,
      completedMinutes: 0,
      completionPercentage: 0,
      completedItems: [],
      nextWeekItems: [
        'TCP/IP Architecture & Network Packet Fundamentals',
        'Packet Analysis with Wireshark & Raw Sockets',
        'Milestone 1: Network Packet Sniffer (Socket Binding & Frame Capture)',
      ],
      reflectionText: '',
    });

    // 11. GLA University College Profile (matching UI reference Screen 11 & Section 26)
    await College.create({
      name: 'GLA University',
      code: 'GLA',
      location: 'Mathura, Uttar Pradesh',
      logo: '/avatars/gla.png',
      totalStudents: 2450,
      activeStudents: 1980,
      averageExecutionRate: 64,
      skillDistribution: {
        webDev: 42,
        aiMl: 28,
        dataAnalytics: 18,
        cybersecurity: 12,
      },
      topProjectsCount: 142,
      activeHackathonTeamsCount: 18,
    });

    console.log('✅ [Seed] Database seeded successfully!');
  } catch (err: any) {
    console.error('❌ [Seed] Error during seeding:', err);
  }
};
