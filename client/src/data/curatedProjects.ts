import { Project } from "../types";

export const CURATED_PROJECTS: Project[] = [
  // =================== AI & Machine Learning ===================
  {
    _id: "proj-ai-1",
    title: "Customer Churn & Retention Predictor",
    slug: "customer-churn-predictor",
    category: "AI & Machine Learning",
    description: "Production-ready ML classification pipeline predicting customer churn probability with ROC-AUC evaluation, feature importance SHAP values, and FastAPI endpoint.",
    difficulty: "Intermediate",
    techStack: ["Python", "Scikit-Learn", "Pandas", "FastAPI", "Docker"],
    estimatedHours: 28,
    progressPercent: 0,
    status: "Not Started",
    githubRepoUrl: "",
    liveDeployUrl: "",
    demoVideoUrl: "",
    screenshots: ["/avatars/project_preview.png"],
    proofOfWorkSubmitted: false,
    mentorFeedback: "",
    requirements: [
      "Exploratory data analysis & categorical feature encoding with Pandas",
      "Address class imbalance with SMOTE or class weighting",
      "Train & tune Random Forest vs XGBoost with 5-fold cross validation",
      "Export serialized pipeline with Joblib and serve via FastAPI endpoint"
    ],
    milestones: [
      {
        id: "m1",
        title: "Phase 1: Dataset Ingestion & Feature Engineering",
        isCompleted: false,
        tasks: [
          { id: "t1", title: "Load customer dataset and perform missing value imputation", isCompleted: false },
          { id: "t2", title: "One-hot encode categorical features and scale numeric attributes", isCompleted: false }
        ]
      },
      {
        id: "m2",
        title: "Phase 2: Model Training & Evaluation",
        isCompleted: false,
        tasks: [
          { id: "t3", title: "Train baseline Logistic Regression and benchmark against Random Forest", isCompleted: false },
          { id: "t4", title: "Compute ROC-AUC curve, confusion matrix, and feature importances", isCompleted: false }
        ]
      },
      {
        id: "m3",
        title: "Phase 3: Production API & Deployment",
        isCompleted: false,
        tasks: [
          { id: "t5", title: "Wrap trained pipeline in FastAPI endpoint with Pydantic validation", isCompleted: false },
          { id: "t6", title: "Push code and model artifact to GitHub repository", isCompleted: false }
        ]
      }
    ]
  },
  {
    _id: "proj-ai-2",
    title: "Neural Vision: Handwritten Digit & Shape Classifier",
    slug: "neural-vision-classifier",
    category: "AI & Machine Learning",
    description: "Deep convolutional neural network trained on image tensors with real-time browser canvas inference and activation map visualizations.",
    difficulty: "Beginner",
    techStack: ["Python", "PyTorch", "TensorFlow.js", "React"],
    estimatedHours: 24,
    progressPercent: 0,
    status: "Not Started",
    githubRepoUrl: "",
    liveDeployUrl: "",
    demoVideoUrl: "",
    screenshots: ["/avatars/project_preview.png"],
    proofOfWorkSubmitted: false,
    mentorFeedback: "",
    requirements: [
      "CNN architecture with Conv2d, BatchNorm, ReLU, and MaxPool",
      "Data augmentation with random rotations and translations",
      "Quantize and export trained model to TFJS web format",
      "Interactive 28x28 drawing canvas with live probability bars"
    ],
    milestones: [
      {
        id: "m1",
        title: "Phase 1: Neural Network Architecture & PyTorch Training",
        isCompleted: false,
        tasks: [
          { id: "t1", title: "Build CNN model in PyTorch and verify output tensor dimensions", isCompleted: false },
          { id: "t2", title: "Train for 10 epochs reaching >98% test set accuracy", isCompleted: false }
        ]
      },
      {
        id: "m2",
        title: "Phase 2: Model Export & Interactive Canvas Interface",
        isCompleted: false,
        tasks: [
          { id: "t3", title: "Export model weights to ONNX/TFJS format", isCompleted: false },
          { id: "t4", title: "Build React drawing canvas with client-side inference hook", isCompleted: false }
        ]
      }
    ]
  },

  // =================== Web Development ===================
  {
    _id: "proj-web-1",
    title: "Full-Stack College Campus Event Platform",
    slug: "college-event-platform",
    category: "Web Development",
    description: "Production event management application with QR ticket check-in, real-time RSVP attendance, role-based admin controls, and email notification webhooks.",
    difficulty: "Intermediate",
    techStack: ["React 19", "Node.js", "Express", "PostgreSQL", "Tailwind CSS"],
    estimatedHours: 32,
    progressPercent: 0,
    status: "Not Started",
    githubRepoUrl: "",
    liveDeployUrl: "",
    demoVideoUrl: "",
    screenshots: ["/avatars/project_preview.png"],
    proofOfWorkSubmitted: false,
    mentorFeedback: "",
    requirements: [
      "Relational schema for Users, Events, Registrations, and Venues",
      "JWT authentication with refresh token cookie rotation",
      "Dynamic QR code generator for student tickets",
      "Admin scanner view to mark attendance in real time"
    ],
    milestones: [
      {
        id: "m1",
        title: "Phase 1: Relational Schema & Auth API",
        isCompleted: false,
        tasks: [
          { id: "t1", title: "Design PostgreSQL schema with Prisma ORM migrations", isCompleted: false },
          { id: "t2", title: "Implement register/login endpoints with bcrypt & JWT", isCompleted: false }
        ]
      },
      {
        id: "m2",
        title: "Phase 2: Event Discovery & Registration Flow",
        isCompleted: false,
        tasks: [
          { id: "t3", title: "Build responsive event listing cards with search filters", isCompleted: false },
          { id: "t4", title: "Create one-click RSVP with QR ticket modal generation", isCompleted: false }
        ]
      },
      {
        id: "m3",
        title: "Phase 3: QR Scanner & Live Attendance",
        isCompleted: false,
        tasks: [
          { id: "t5", title: "Integrate camera QR scanner for college event organizers", isCompleted: false },
          { id: "t6", title: "Deploy backend to Render/Vercel and record demo walkthrough", isCompleted: false }
        ]
      }
    ]
  },

  // =================== App Development ===================
  {
    _id: "proj-app-1",
    title: "Cross-Platform Mobile Fitness Tracker",
    slug: "mobile-fitness-tracker",
    category: "App Development",
    description: "High-performance React Native mobile application with offline workout logging, persistent MMKV storage, and fluid Reanimated 3 progress rings.",
    difficulty: "Intermediate",
    techStack: ["React Native", "TypeScript", "MMKV", "Reanimated 3", "Expo"],
    estimatedHours: 26,
    progressPercent: 0,
    status: "Not Started",
    githubRepoUrl: "",
    liveDeployUrl: "",
    demoVideoUrl: "",
    screenshots: ["/avatars/project_preview.png"],
    proofOfWorkSubmitted: false,
    mentorFeedback: "",
    requirements: [
      "Cross-platform responsive layout handling iOS Dynamic Island & Android safe areas",
      "Offline-first local workout database with MMKV key-value caching",
      "Gesture-driven workout completion card with haptic feedback",
      "Interactive SVG ring chart animating daily exercise progress"
    ],
    milestones: [
      {
        id: "m1",
        title: "Phase 1: App Shell & Safe Area Navigation",
        isCompleted: false,
        tasks: [
          { id: "t1", title: "Configure React Navigation Native Stack and bottom tab bar", isCompleted: false },
          { id: "t2", title: "Scaffold Daily Workout screen with Safe Area Context insets", isCompleted: false }
        ]
      },
      {
        id: "m2",
        title: "Phase 2: MMKV Local Cache & Offline Logging",
        isCompleted: false,
        tasks: [
          { id: "t3", title: "Implement typed MMKV storage hooks for workout records", isCompleted: false },
          { id: "t4", title: "Add swipe-to-delete gesture and haptic feedback triggers", isCompleted: false }
        ]
      }
    ]
  },

  // =================== Cybersecurity ===================
  {
    _id: "proj-sec-1",
    title: "Network Packet Sniffer & Security Protocol Analyzer",
    slug: "network-packet-sniffer",
    category: "Cybersecurity",
    description: "Python-based raw socket network packet capture tool that decodes Ethernet, IP, and TCP/UDP headers, flags SYN flood anomalies, and exports PCAP files.",
    difficulty: "Intermediate",
    techStack: ["Python", "Raw Sockets", "Wireshark / Scapy", "Terminal UI"],
    estimatedHours: 28,
    progressPercent: 0,
    status: "Not Started",
    githubRepoUrl: "",
    liveDeployUrl: "",
    demoVideoUrl: "",
    screenshots: ["/avatars/project_preview.png"],
    proofOfWorkSubmitted: false,
    mentorFeedback: "",
    requirements: [
      "Low-level raw socket packet capture with promiscuous mode support",
      "Unpack 14-byte Ethernet frame, 20-byte IP header, and 20-byte TCP header with struct module",
      "Detect anomalous TCP flag combinations (Xmas scans, Null scans)",
      "Terminal dashboard displaying real-time bandwidth and protocol distribution"
    ],
    milestones: [
      {
        id: "m1",
        title: "Phase 1: Raw Socket Ingestion & Frame Unpacking",
        isCompleted: false,
        tasks: [
          { id: "t1", title: "Initialize raw socket and extract MAC addresses from Ethernet frames", isCompleted: false },
          { id: "t2", title: "Decode IPv4 header (TTL, protocol number, source/dest IP)", isCompleted: false }
        ]
      },
      {
        id: "m2",
        title: "Phase 2: TCP/UDP Inspection & Anomaly Detection",
        isCompleted: false,
        tasks: [
          { id: "t3", title: "Extract TCP port numbers, sequence numbers, and bitwise flags", isCompleted: false },
          { id: "t4", title: "Implement port scan alert engine for rapid multi-port SYN packets", isCompleted: false }
        ]
      }
    ]
  },

  // =================== Data & Analytics ===================
  {
    _id: "proj-data-1",
    title: "Automated E-Commerce ETL Pipeline & BI Dashboard",
    slug: "automated-etl-pipeline",
    category: "Data & Analytics",
    description: "Automated analytics pipeline extracting orders from REST APIs, running transformation jobs with Pandas and dbt, and visualizing cohort retention in Streamlit.",
    difficulty: "Intermediate",
    techStack: ["Python", "Pandas", "PostgreSQL", "Streamlit", "SQL"],
    estimatedHours: 26,
    progressPercent: 0,
    status: "Not Started",
    githubRepoUrl: "",
    liveDeployUrl: "",
    demoVideoUrl: "",
    screenshots: ["/avatars/project_preview.png"],
    proofOfWorkSubmitted: false,
    mentorFeedback: "",
    requirements: [
      "Extract order and user event logs from REST endpoint",
      "Cleanse data: deduplication, timestamp formatting, and null imputation",
      "Load cleansed records into dimensional star schema in PostgreSQL",
      "Build interactive Streamlit dashboard tracking cohort retention & LTV"
    ],
    milestones: [
      {
        id: "m1",
        title: "Phase 1: Data Extraction & Cleaning Pipeline",
        isCompleted: false,
        tasks: [
          { id: "t1", title: "Write Python ingestion script with retry logic and error logging", isCompleted: false },
          { id: "t2", title: "Perform vector-based imputation and data type coercions with Pandas", isCompleted: false }
        ]
      },
      {
        id: "m2",
        title: "Phase 2: Star Schema Modeling & Streamlit UI",
        isCompleted: false,
        tasks: [
          { id: "t3", title: "Create fact_orders and dim_users tables in PostgreSQL", isCompleted: false },
          { id: "t4", title: "Deploy Streamlit dashboard visualizing monthly cohort heatmaps", isCompleted: false }
        ]
      }
    ]
  }
];

export function getCuratedProjects(category?: string): Project[] {
  if (!category || category === "All" || category === "All Tracks") {
    return CURATED_PROJECTS;
  }
  const lower = category.toLowerCase();
  return CURATED_PROJECTS.filter((p) => {
    const pCat = p.category.toLowerCase();
    if (lower.includes("ai") || lower.includes("ml")) return pCat.includes("ai") || pCat.includes("machine");
    if (lower.includes("web") || lower.includes("front") || lower.includes("full")) return pCat.includes("web");
    if (lower.includes("app") || lower.includes("mobile")) return pCat.includes("app");
    if (lower.includes("cyber") || lower.includes("sec")) return pCat.includes("cyber");
    if (lower.includes("data") || lower.includes("analyt")) return pCat.includes("data");
    return true;
  });
}

export function getCuratedProjectBySlug(slug: string): Project | undefined {
  return CURATED_PROJECTS.find((p) => p.slug === slug);
}
