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
    name: 'Rishabh Mishra',
    title: 'Founder & Full-Stack Lead',
    company: 'RishabhLabs',
    domain: 'Full-Stack Development',
    avatar: '/avatars/rishabh.webp',
    rating: 5.0,
    reviewsCount: 142,
    bio: 'Founder of RishabhLabs. Full-Stack Architect specialized in high-performance distributed systems, scalable web applications, and technical placement strategy.',
    hourlyRate: 'Free for Pro',
    topics: ['Roadmap', 'Project Review', 'Career Direction', 'Web Development', 'System Design'],
    availability: ['Today, 7:00 PM IST', 'Tomorrow, 6:00 PM IST', 'Saturday, 11:00 AM IST'],
    isAvailableToday: true,
  },
  {
    name: 'Arpit Pandey',
    title: 'AI & Systems Specialist',
    company: 'RishabhLabs',
    domain: 'AI & Machine Learning',
    avatar: '/avatars/arpit.webp',
    rating: 4.98,
    reviewsCount: 96,
    bio: 'AI & Machine Learning Specialist focusing on Transformer models, LLM agent workflows, PyTorch neural pipelines, and competitive hackathon architecture.',
    hourlyRate: 'Free for Pro',
    topics: ['Roadmap', 'Project Review', 'AI / ML Research', 'Deep Learning', 'Internship Prep'],
    availability: ['Today, 8:30 PM IST', 'Tomorrow, 7:30 PM IST', 'Sunday, 4:00 PM IST'],
    isAvailableToday: true,
  },
  {
    name: 'Harsh Sharma',
    title: 'Security & Systems Lead',
    company: 'RishabhLabs',
    domain: 'Cybersecurity',
    avatar: '/avatars/harsh.webp',
    rating: 4.97,
    reviewsCount: 89,
    bio: 'Cybersecurity & Systems Lead. Expert in offensive and defensive security, packet analysis, network protocol security, and Linux kernel hardening.',
    hourlyRate: 'Free for Pro',
    topics: ['Roadmap', 'Cybersecurity', 'Network Protocols', 'Pentesting', 'Hackathon Strategy'],
    availability: ['Today, 9:00 PM IST', 'Tomorrow, 8:00 PM IST', 'Saturday, 5:00 PM IST'],
    isAvailableToday: true,
  },
];

export const seedDatabase = async () => {
  try {
    // Non-destructive seeding for educational content: only insert if collections are currently empty
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      await Project.create(getCleanProjects());
      console.log('✅ [Seed] Seeded baseline industry projects.');
    }

    const lessonCount = await Lesson.countDocuments();
    if (lessonCount === 0) {
      await Lesson.create(getCleanLessons());
      console.log('✅ [Seed] Seeded baseline lessons.');
    }

    const mentorCount = await Mentor.countDocuments();
    if (mentorCount === 0) {
      await Mentor.create(getCleanMentors());
      console.log('✅ [Seed] Seeded verified mentors.');
    }

    const sprintProb = await CodingProblem.findOne({ slug: 'high-throughput-in-memory-cache' });
    if (!sprintProb) {
      await CodingProblem.create({
        title: 'Weekly Code Sprint #18: High-Throughput In-Memory Cache',
        slug: 'high-throughput-in-memory-cache',
        difficulty: 'Medium',
        category: 'Algorithm Sprint',
        descriptionMarkdown: `## Weekly Code Sprint #18: High-Throughput In-Memory Cache\n\nDesign and implement a high-performance in-memory key-value cache engine supporting **TTL expiration**, thread-safe **LRU eviction**, and sub-millisecond lookups.`,
        examples: [{ input: '["CacheEngine", 2], ["set", "token", "xyz", 5000], ["get", "token"]', output: '[null, null, "xyz"]', explanation: 'Cache stores and retrieves token with TTL.' }],
        constraints: ['1 <= capacity <= 10,000'],
        hints: {
          level1Concept: 'Maintain an ordered collection where accessing an element updates its position to the most recently used slot.',
          level2Stronger: 'In JavaScript Map preserves insertion order. In Python collections.OrderedDict provides move_to_end().',
          level3Approach: 'Store { val, expireAt } in each entry. On get(), check if Date.now() > expireAt.',
          level4Mentor: 'Book a 1:1 code review session with a RishabhLabs mentor.',
        },
        starterCode: {
          javascript: `class CacheEngine {\n  constructor(capacity = 1000) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  set(key, value, ttlMs) {}\n  get(key) {}\n  purge() {}\n  size() {}\n}`,
          python: `class CacheEngine:\n    def __init__(self, capacity=1000):\n        self.capacity = capacity\n    def set(self, key, value, ttl_ms=None):\n        pass\n    def get(self, key):\n        pass\n    def purge(self):\n        pass\n    def size(self):\n        pass`,
        },
        testCases: [{ testCaseId: 'tc-1', input: 'set("token", "xyz", 5000) -> get("token")', expectedOutput: '"xyz"', isHidden: false }],
        tags: ['Data Structures', 'LRU Cache', 'System Design', 'Sprint #18'],
        acceptanceRate: 64.8,
      });
    }

    console.log('✅ [Seed] Database synchronization verified non-destructively.');
    return;
  } catch (err: any) {
    console.error('❌ [Seed] Error during database synchronization:', err.message);
  }
};
