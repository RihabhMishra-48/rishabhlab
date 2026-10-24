import { Lesson } from "../types";

export const CURATED_LESSONS: Record<string, Lesson[]> = {
  "web-dev": [
    {
      _id: "lesson-web-1",
      title: "JavaScript Event Loop & React 19 State Models",
      slug: "js-event-loop-react-state",
      track: "web-dev",
      moduleTitle: "Module 1: Modern Web Architecture & Frontend Core",
      order: 1,
      readTime: "18 min",
      overview: "Deep dive into the browser event loop, call stack, microtask vs macrotask execution, and how React 19 batches concurrent state updates without blocking the UI thread.",
      keyTakeaways: [
        "Synchronous JavaScript executes on the call stack until empty.",
        "Microtasks (Promises, queueMicrotask) take strict priority over macrotasks (setTimeout, setInterval).",
        "React 19 uses concurrent scheduling to interrupt low-priority renders for critical user inputs.",
        "Proper debouncing and batching prevent redundant render cycles in high-throughput applications."
      ],
      contentSections: [
        {
          heading: "1. The Browser Event Loop Internals",
          bodyMarkdown: "The browser runtime is single-threaded for JavaScript execution, but it achieves high responsiveness through an event loop architecture. When asynchronous operations complete (e.g. HTTP fetches or timers), their callbacks are enqueued into either the **Microtask Queue** or the **Macrotask Queue**.\n\nUnderstanding this order is critical: microtasks drain completely before the browser repaints or picks the next macrotask.",
          codeSnippet: `console.log('1: Sync script start');
setTimeout(() => console.log('2: Macrotask timer'), 0);
Promise.resolve().then(() => console.log('3: Microtask promise'));
console.log('4: Sync script end');
// Output: 1 -> 4 -> 3 -> 2`,
          codeLanguage: "javascript"
        },
        {
          heading: "2. React 19 State Batching & Concurrent Rendering",
          bodyMarkdown: "In older React versions, state updates within asynchronous callbacks weren't always batched. React 19 provides automatic batching across all asynchronous boundaries (Promises, timeouts, native events) and introduces the \`useTransition\` hook to separate immediate UI feedback from non-urgent heavy calculations.",
          codeSnippet: `import { useState, useTransition } from 'react';

function SearchResults() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    setQuery(e.target.value); // Urgent input update
    startTransition(() => {
      // Non-urgent background state recalculation
      performHeavyFilter(e.target.value);
    });
  }
}`,
          codeLanguage: "javascript"
        }
      ],
      interactiveSandbox: {
        instructions: "Write a function `processExecutionQueue(tasks)` that executes an array of synchronous tasks, queues a microtask for 'audit-complete', and returns the execution log array.",
        initialCode: `function processExecutionQueue(tasks) {
  const logs = [];
  tasks.forEach(t => logs.push('Executed: ' + t));
  logs.push('Audit enqueued');
  return logs;
}

const result = processExecutionQueue(['auth', 'db-query', 'cache-sync']);
console.log(result);`,
        solutionCode: `function processExecutionQueue(tasks) {
  const logs = [];
  tasks.forEach(t => logs.push('Executed: ' + t));
  logs.push('Audit enqueued');
  return logs;
}`,
        language: "javascript",
        expectedOutput: "['Executed: auth', 'Executed: db-query', 'Executed: cache-sync', 'Audit enqueued']"
      },
      quiz: [
        {
          question: "Which task queue executes first after the call stack clears?",
          options: ["Macrotask Queue (setTimeout)", "Microtask Queue (Promises)", "Render Pipeline Queue", "RequestAnimationFrame Queue"],
          correctIndex: 1,
          explanation: "The microtask queue always empties completely before the event loop advances to render passes or the next macrotask."
        },
        {
          question: "What is the primary benefit of React 19 automatic batching?",
          options: ["Prevents memory leaks in websockets", "Combines multiple setState calls into a single re-render", "Compiles React code directly to WebAssembly", "Replaces CSS stylesheets"],
          correctIndex: 1,
          explanation: "Automatic batching groups multiple state updates together, minimizing unnecessary DOM re-renders and improving frame rates."
        },
        {
          question: "What does the `useTransition` hook allow developers to do?",
          options: ["Transition CSS opacity automatically", "Mark state updates as non-urgent transitions", "Navigate between pages without URLs", "Enforce strict TypeScript types"],
          correctIndex: 1,
          explanation: "`useTransition` tells React to keep the current UI responsive while preparing the new state in the background."
        }
      ]
    },
    {
      _id: "lesson-web-2",
      title: "Building Production REST APIs with Express & TypeScript",
      slug: "production-rest-apis-express-ts",
      track: "web-dev",
      moduleTitle: "Module 2: Backend Architecture & Database Systems",
      order: 2,
      readTime: "22 min",
      overview: "Architect secure, scalable, and type-safe REST APIs using Node.js, Express, and TypeScript. Covers middleware chains, centralized error handling, and input validation schemas.",
      keyTakeaways: [
        "Centralized error-handling middleware prevents server crashes and unifies API response envelopes.",
        "Schema validation with Zod or Joi sanitizes untrusted input before touching controller business logic.",
        "Status codes (200, 201, 400, 401, 403, 404, 500) must adhere to standard HTTP semantics.",
        "Async handlers must catch rejections to prevent unhandledPromiseRejection crashes."
      ],
      contentSections: [
        {
          heading: "1. Structured Express Middleware Pipeline",
          bodyMarkdown: "A clean Express architecture organizes requests through distinct layers: CORS and security headers (Helmet), JSON parsing, JWT authentication verification, schema validation, controller logic, and finally error logging.",
          codeSnippet: `import express, { Request, Response, NextFunction } from 'express';

const app = express();
app.use(express.json());

// Type-safe async error wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};`,
          codeLanguage: "typescript"
        }
      ],
      interactiveSandbox: {
        instructions: "Implement a payload sanitizer function `sanitizeUserPayload(payload)` that trims whitespace from strings and strips private password fields from public responses.",
        initialCode: `function sanitizeUserPayload(payload) {
  const { password, ...safeData } = payload;
  const sanitized = {};
  for (const [key, val] of Object.entries(safeData)) {
    sanitized[key] = typeof val === 'string' ? val.trim() : val;
  }
  return sanitized;
}

console.log(sanitizeUserPayload({ name: '  Rishabh  ', email: ' r@labs.com ', password: 'secret123' }));`,
        solutionCode: `function sanitizeUserPayload(payload) {
  const { password, ...safeData } = payload;
  const sanitized = {};
  for (const [key, val] of Object.entries(safeData)) {
    sanitized[key] = typeof val === 'string' ? val.trim() : val;
  }
  return sanitized;
}`,
        language: "javascript",
        expectedOutput: "{ name: 'Rishabh', email: 'r@labs.com' }"
      },
      quiz: [
        {
          question: "Which HTTP status code is most appropriate when a resource is successfully created?",
          options: ["200 OK", "201 Created", "204 No Content", "301 Moved Permanently"],
          correctIndex: 1,
          explanation: "HTTP 201 Created explicitly indicates that the request has succeeded and led to the creation of a resource."
        },
        {
          question: "How should unhandled asynchronous errors be forwarded in Express?",
          options: ["Return res.status(500) inside every single helper", "Pass the error to next(err)", "Let the Node process crash and auto-restart", "Use throw inside setTimeout"],
          correctIndex: 1,
          explanation: "Passing errors to next(err) activates Express's centralized error handling middleware."
        },
        {
          question: "What is the primary role of an API validation library like Zod?",
          options: ["Speed up database queries", "Parse CSS stylesheets", "Validate and coerce untrusted runtime inputs against strict TypeScript schemas", "Encrypt database tables"],
          correctIndex: 2,
          explanation: "Zod enforces runtime schema validation, preventing malformed data from reaching downstream databases."
        }
      ]
    }
  ],
  "ai-ml": [
    {
      _id: "lesson-ai-1",
      title: "NumPy Tensor Operations, Broadcasting & Vectorization",
      slug: "numpy-tensor-vectorization",
      track: "ai-ml",
      moduleTitle: "Module 1: Mathematical Foundations & Numerical Python",
      order: 1,
      readTime: "20 min",
      overview: "Understand n-dimensional array memory layouts (strides), vectorized SIMD calculations, and NumPy broadcasting rules that underpin PyTorch, TensorFlow, and deep learning training loops.",
      keyTakeaways: [
        "Vectorized operations execute in compiled C/Fortran, avoiding Python loop overhead by orders of magnitude.",
        "Broadcasting matches trailing dimensions from right to left if they are equal or one of them is 1.",
        "Strided array slices share underlying memory buffer; copies only occur when memory is non-contiguous.",
        "Avoid explicit loops in Python when computing tensor dot products or matrix transforms."
      ],
      contentSections: [
        {
          heading: "1. The Power of Vectorization",
          bodyMarkdown: "Python's dynamic typing and interpreter introduce high overhead in iterative for-loops. NumPy arrays store homogeneous data in contiguous memory blocks, allowing modern CPU SIMD (Single Instruction Multiple Data) registers to execute vector arithmetic in parallel.",
          codeSnippet: `import numpy as np

# Vectorized dot product vs loop
A = np.random.randn(1000, 1000)
B = np.random.randn(1000, 1000)

# 100x faster than nested Python for loops:
C = np.dot(A, B)`,
          codeLanguage: "python"
        },
        {
          heading: "2. The Broadcasting Invariant",
          bodyMarkdown: "Two dimensions are compatible for broadcasting if:\n1. They are equal, or\n2. One of them is 1.\n\nWhen one dimension is 1, NumPy virtually replicates the data along that axis without allocating extra memory.",
          codeSnippet: `# Shape (3, 1) + Shape (1, 4) -> Shape (3, 4)
x = np.array([[1], [2], [3]])
y = np.array([[10, 20, 30, 40]])
z = x + y`,
          codeLanguage: "python"
        }
      ],
      interactiveSandbox: {
        instructions: "Implement a vectorized feature normalizer `min_max_scale(matrix)` that normalizes each column of a 2D matrix to the range [0, 1].",
        initialCode: `def min_max_scale(matrix):
    # Vectorized column normalization
    col_min = [min(col) for col in zip(*matrix)]
    col_max = [max(col) for col in zip(*matrix)]
    normalized = []
    for row in matrix:
        norm_row = [(row[i] - col_min[i]) / (col_max[i] - col_min[i]) for i in range(len(row))]
        normalized.append(norm_row)
    return normalized

data = [[10, 200], [20, 300], [30, 400]]
print(min_max_scale(data))`,
        solutionCode: `def min_max_scale(matrix):
    col_min = [min(col) for col in zip(*matrix)]
    col_max = [max(col) for col in zip(*matrix)]
    return [[(row[i] - col_min[i]) / (col_max[i] - col_min[i]) for i in range(len(row))] for row in matrix]`,
        language: "python",
        expectedOutput: "[[0.0, 0.0], [0.5, 0.5], [1.0, 1.0]]"
      },
      quiz: [
        {
          question: "Why are vectorized NumPy operations significantly faster than Python for loops?",
          options: ["They bypass CPU caches completely", "They execute in compiled C with SIMD vector instructions and contiguous memory", "They use multi-threading by default for all additions", "They convert all numbers to strings"],
          correctIndex: 1,
          explanation: "NumPy arrays are stored contiguously in memory and use compiled BLAS/LAPACK routines that exploit SIMD hardware registers."
        },
        {
          question: "Can an array of shape (5, 1) broadcast with an array of shape (1, 4)?",
          options: ["No, shapes must be identical", "Yes, resulting shape will be (5, 4)", "Yes, resulting shape will be (1, 1)", "Only if both arrays contain zeros"],
          correctIndex: 1,
          explanation: "Both dimensions are compatible because one of each trailing dimension is 1, yielding a resulting shape of (5, 4)."
        },
        {
          question: "What happens when you take a slice like `b = a[1:5]` in NumPy?",
          options: ["A deep copy is created automatically", "A memory view is created sharing the same buffer", "The original array is deleted", "An error is thrown if array is multi-dimensional"],
          correctIndex: 1,
          explanation: "Basic slicing in NumPy creates a view of the original array rather than copying memory, optimizing memory footprint."
        }
      ]
    },
    {
      _id: "lesson-ai-2",
      title: "PyTorch Autograd, Loss Functions & Backpropagation",
      slug: "pytorch-autograd-backprop",
      track: "ai-ml",
      moduleTitle: "Module 2: Deep Learning & Neural Architectures",
      order: 2,
      readTime: "24 min",
      overview: "Understand computational graphs, automatic differentiation with PyTorch autograd, cross-entropy loss gradients, and stochastic gradient descent optimization.",
      keyTakeaways: [
        "PyTorch dynamically constructs Directed Acyclic Graphs (DAGs) on every forward pass.",
        "Tensors with `requires_grad=True` track all operations for automatic reverse-mode autodiff.",
        "Always call `optimizer.zero_grad()` before `loss.backward()` to prevent gradient accumulation.",
        "Cross-Entropy Loss combines LogSoftmax with Negative Log-Likelihood for numerical stability."
      ],
      contentSections: [
        {
          heading: "1. Dynamic Computational Graphs in PyTorch",
          bodyMarkdown: "Unlike static graph frameworks, PyTorch uses eager execution. Every time you compute forward operations, PyTorch records a graph of tensor transformations. Calling `.backward()` traverses this graph backwards from the scalar loss using the multivariable chain rule.",
          codeSnippet: `import torch

x = torch.tensor([2.0, 3.0], requires_grad=True)
y = (x ** 2).sum()
y.backward()
print(x.grad) # dy/dx = 2*x -> [4.0, 6.0]`,
          codeLanguage: "python"
        }
      ],
      interactiveSandbox: {
        instructions: "Implement a linear model forward step and compute mean squared error loss for predicted vs actual target values.",
        initialCode: `def compute_mse_loss(y_true, y_pred):
    n = len(y_true)
    squared_errors = [(y_true[i] - y_pred[i]) ** 2 for i in range(n)]
    return sum(squared_errors) / n

targets = [3.0, 5.0, 7.0]
predictions = [2.5, 5.0, 7.5]
print('MSE Loss:', compute_mse_loss(targets, predictions))`,
        solutionCode: `def compute_mse_loss(y_true, y_pred):
    n = len(y_true)
    return sum((y_true[i] - y_pred[i]) ** 2 for i in range(n)) / n`,
        language: "python",
        expectedOutput: "MSE Loss: 0.16666666666666666"
      },
      quiz: [
        {
          question: "Why is `optimizer.zero_grad()` necessary before computing `loss.backward()`?",
          options: ["It frees GPU VRAM", "PyTorch accumulates gradients by default into .grad buffers", "It initializes model weights randomly", "It stops the Python garbage collector"],
          correctIndex: 1,
          explanation: "In PyTorch, gradients accumulate by default so multiple batches or sub-steps can be aggregated. Calling zero_grad() flushes previous step gradients."
        },
        {
          question: "What algorithm does PyTorch Autograd use to compute derivatives?",
          options: ["Finite difference numerical approximations", "Symbolic differentiation with algebra trees", "Reverse-mode automatic differentiation (Backpropagation)", "Genetic algorithm search"],
          correctIndex: 2,
          explanation: "PyTorch implements reverse-mode automatic differentiation, efficiently propagating gradients backwards from scalar outputs to inputs."
        },
        {
          question: "Which loss function is standard for multi-class classification?",
          options: ["Mean Squared Error", "Cross-Entropy Loss", "Huber Loss", "L1 Absolute Deviation"],
          correctIndex: 1,
          explanation: "Cross-Entropy Loss measures the performance of a classification model whose output is a probability value between 0 and 1."
        }
      ]
    }
  ],
  "app-dev": [
    {
      _id: "lesson-app-1",
      title: "React Native Architecture, Hermes VM & Native Bridge",
      slug: "react-native-hermes-architecture",
      track: "app-dev",
      moduleTitle: "Module 1: Mobile Core & Component Architecture",
      order: 1,
      readTime: "20 min",
      overview: "Understand the React Native runtime: how JavaScript executes on the Hermes bytecode engine and communicates with iOS/Android native views via the JavaScript Interface (JSI).",
      keyTakeaways: [
        "Hermes compiles JavaScript to optimized bytecode at build time for instant startup and low memory.",
        "The New Architecture replaces the asynchronous JSON bridge with the synchronous C++ JSI.",
        "Flexbox in React Native defaults to `flexDirection: column` instead of the web's `row`.",
        "React Native styles use unitless density-independent pixels (dp/pt), adapting to screen scale automatically."
      ],
      contentSections: [
        {
          heading: "1. The Hermes Engine & Bytecode Execution",
          bodyMarkdown: "On mobile devices, JavaScript parsing and compilation (JIT) consume heavy battery and CPU cycles on startup. Hermes pre-compiles JS bundles into compact bytecode on your development machine during packaging. When the app launches, Hermes executes bytecode directly, cutting Time To Interactive (TTI) by up to 50%.",
          codeSnippet: `// android/app/build.gradle
project.ext.react = [
    enableHermes: true, // Enables Hermes runtime
]`,
          codeLanguage: "groovy"
        }
      ],
      interactiveSandbox: {
        instructions: "Implement a utility function `calculateLayoutBounds(screenWidth, numColumns, gap)` that computes the width of each card in a responsive mobile grid.",
        initialCode: `function calculateLayoutBounds(screenWidth, numColumns, gap) {
  const totalGaps = (numColumns - 1) * gap;
  const availableWidth = screenWidth - totalGaps;
  return Math.floor(availableWidth / numColumns);
}

console.log(calculateLayoutBounds(390, 2, 16));`,
        solutionCode: `function calculateLayoutBounds(screenWidth, numColumns, gap) {
  const totalGaps = (numColumns - 1) * gap;
  return Math.floor((screenWidth - totalGaps) / numColumns);
}`,
        language: "javascript",
        expectedOutput: "187"
      },
      quiz: [
        {
          question: "What is the default `flexDirection` in React Native?",
          options: ["row", "column", "row-reverse", "unset"],
          correctIndex: 1,
          explanation: "Because mobile devices are vertical (portrait) by default, React Native sets flexDirection to 'column' by default."
        },
        {
          question: "How does the Hermes JavaScript engine improve mobile app launch time?",
          options: ["It runs code in the cloud", "It compiles JavaScript ahead-of-time into bytecode at build time", "It deletes unused assets automatically", "It disables TypeScript checks"],
          correctIndex: 1,
          explanation: "Ahead-of-time bytecode compilation avoids on-device JIT parsing, resulting in faster startup and lower RAM usage."
        },
        {
          question: "What does JSI (JavaScript Interface) enable in the React Native New Architecture?",
          options: ["Direct, synchronous C++ memory access between JS and native platform layers", "Automatic publishing to the Apple App Store", "Conversion of Swift to Kotlin", "Replacement of CSS with HTML"],
          correctIndex: 0,
          explanation: "JSI replaces the old serialized asynchronous JSON bridge with direct C++ HostObjects, allowing instant zero-copy communication."
        }
      ]
    },
    {
      _id: "lesson-app-2",
      title: "Mobile Navigation, Safe Area Insets & Persistent Storage",
      slug: "react-navigation-safe-area-storage",
      track: "app-dev",
      moduleTitle: "Module 2: Navigation Flows & Offline Persistence",
      order: 2,
      readTime: "22 min",
      overview: "Implement smooth multi-screen navigation using React Navigation Native Stack, handle device notches and dynamic islands with Safe Area context, and persist user state with MMKV.",
      keyTakeaways: [
        "Native Stack uses true iOS UINavigationController and Android Fragment managers for native gestures.",
        "Always wrap mobile layouts in SafeAreaProvider and use SafeAreaView to avoid camera notches.",
        "MMKV is a high-performance key-value storage engine up to 30x faster than traditional AsyncStorage.",
        "Deep linking routes universal URLs directly into nested navigation screens."
      ],
      contentSections: [
        {
          heading: "1. Native Stack vs Standard JS Stack",
          bodyMarkdown: "React Navigation provides two stack navigators. \`createNativeStackNavigator\` delegates transitions to real native platform navigation controllers, giving users hardware-accelerated 60/120 FPS edge-swipe gestures and authentic OS animations.",
          codeSnippet: `import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}`,
          codeLanguage: "typescript"
        }
      ],
      interactiveSandbox: {
        instructions: "Write a storage key sanitizer `sanitizeStorageKey(namespace, key)` that creates namespaced, valid alphanumeric keys.",
        initialCode: `function sanitizeStorageKey(namespace, key) {
  const cleanNamespace = namespace.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return \`@\${cleanNamespace}:\${cleanKey}\`;
}

console.log(sanitizeStorageKey('Auth-Service', 'User Token#1'));`,
        solutionCode: `function sanitizeStorageKey(namespace, key) {
  return \`@\${namespace.toLowerCase().replace(/[^a-z0-9]/g, '_')}:\${key.toLowerCase().replace(/[^a-z0-9]/g, '_')}\`;
}`,
        language: "javascript",
        expectedOutput: "'@auth_service:user_token_1'"
      },
      quiz: [
        {
          question: "Why is handling `SafeAreaInsets` necessary on modern smartphones?",
          options: ["To prevent memory overflows", "To prevent UI content from colliding with camera cutouts, notches, and home indicator bars", "To enforce portrait orientation", "To encrypt user data"],
          correctIndex: 1,
          explanation: "Safe area insets provide the exact pixel padding required so buttons and text are not occluded by physical screen cutouts."
        },
        {
          question: "Why is MMKV preferred over AsyncStorage in production React Native apps?",
          options: ["AsyncStorage is deprecated in Android", "MMKV uses memory-mapped files (mmap) for synchronous, order-of-magnitude faster I/O", "AsyncStorage only stores images", "MMKV connects to MongoDB directly"],
          correctIndex: 1,
          explanation: "MMKV utilizes POSIX mmap to synchronize memory with disk, avoiding thread hopping and JSON serialization bottlenecks."
        },
        {
          question: "What navigation pattern should be used for tabs pinned to the bottom of the screen?",
          options: ["createDrawerNavigator", "createBottomTabNavigator", "createNativeStackNavigator", "createModalNavigator"],
          correctIndex: 1,
          explanation: "Bottom tabs provide persistent multi-hub navigation matching authentic mobile platform design standards."
        }
      ]
    }
  ],
  "cybersecurity": [
    {
      _id: "lesson-sec-1",
      title: "TCP 3-Way Handshake & Network Packet Analysis",
      slug: "tcp-handshake-packet-analysis",
      track: "cybersecurity",
      moduleTitle: "Module 1: Computer Networking & Protocol Security",
      order: 1,
      readTime: "22 min",
      overview: "Deconstruct the TCP/IP suite at the packet layer: SYN, SYN-ACK, ACK handshake sequences, sequence/acknowledgement numbering, and packet teardown mechanics with Wireshark.",
      keyTakeaways: [
        "TCP provides reliable, ordered stream delivery over unreliable IP networks.",
        "The 3-way handshake (SYN -> SYN-ACK -> ACK) synchronizes sequence numbers between hosts.",
        "SYN flood attacks exploit half-open connection queues in the operating system kernel.",
        "SYN cookies mitigate SYN floods by encoding connection state in the initial TCP sequence number."
      ],
      contentSections: [
        {
          heading: "1. The Anatomy of a TCP Handshake",
          bodyMarkdown: "Before any application data (HTTP, SSH, TLS) can transit between client and server, TCP establishes a virtual connection using control flags in the 20-byte TCP header:\n1. **SYN**: Client sends random initial sequence number (ISN_c).\n2. **SYN-ACK**: Server acknowledges (ACK = ISN_c + 1) and sends its own ISN_s.\n3. **ACK**: Client acknowledges (ACK = ISN_s + 1). Connection moves to ESTABLISHED state.",
          codeSnippet: `Client                        Server
  | ----- [SYN, Seq=100] ------> | (Server allocates TCB)
  | <--- [SYN-ACK, Ack=101, --- |
  |       Seq=500]               |
  | ----- [ACK, Ack=501] ------> | (ESTABLISHED state)
`,
          codeLanguage: "text"
        }
      ],
      interactiveSandbox: {
        instructions: "Implement a packet flag checker `verifyTcpHandshakeStep(step, flags)` that verifies whether a packet matches SYN, SYN-ACK, or ACK control flags.",
        initialCode: `function verifyTcpHandshakeStep(step, flags) {
  if (step === 1) return flags.SYN && !flags.ACK;
  if (step === 2) return flags.SYN && flags.ACK;
  if (step === 3) return !flags.SYN && flags.ACK;
  return false;
}

console.log(verifyTcpHandshakeStep(2, { SYN: true, ACK: true, FIN: false }));`,
        solutionCode: `function verifyTcpHandshakeStep(step, flags) {
  if (step === 1) return flags.SYN && !flags.ACK;
  if (step === 2) return flags.SYN && flags.ACK;
  if (step === 3) return !flags.SYN && flags.ACK;
  return false;
}`,
        language: "javascript",
        expectedOutput: "true"
      },
      quiz: [
        {
          question: "What control flag combination does a server send in step 2 of the TCP 3-way handshake?",
          options: ["SYN only", "SYN-ACK", "ACK-FIN", "PSH-URG"],
          correctIndex: 1,
          explanation: "In step 2, the server sends SYN (synchronize its sequence number) and ACK (acknowledge client sequence number)."
        },
        {
          question: "How does a SYN flood attack deplete server resources?",
          options: ["By overloading the hard drive with files", "By sending millions of SYN packets and never completing the handshake, exhausting server backlog queues", "By guessing admin passwords", "By modifying DNS records"],
          correctIndex: 1,
          explanation: "SYN floods leave connections in the SYN_RECEIVED state until kernel connection tables overflow, rejecting legitimate requests."
        },
        {
          question: "Which TCP flag immediately terminates a connection when an unexpected packet arrives?",
          options: ["FIN", "RST (Reset)", "URG", "ECE"],
          correctIndex: 1,
          explanation: "The RST flag aborts an active connection or rejects an incoming packet sent to a closed port."
        }
      ]
    },
    {
      _id: "lesson-sec-2",
      title: "Web Security & OWASP Top 10 Exploitation",
      slug: "web-security-owasp-top-10",
      track: "cybersecurity",
      moduleTitle: "Module 2: Web Application Security & Hardening",
      order: 2,
      readTime: "24 min",
      overview: "Understand common web vulnerabilities: SQL Injection (SQLi), Cross-Site Scripting (XSS), Insecure Direct Object References (IDOR), and how to defend systems with parameterization and CSP.",
      keyTakeaways: [
        "SQL injection occurs when untrusted input concatenates directly into database command strings.",
        "Prepared statements / parameterized queries eliminate SQLi by strictly separating SQL syntax from user data.",
        "Stored XSS executes malicious JavaScript inside victim browsers when persistent content is rendered without escaping.",
        "Content-Security-Policy (CSP) headers restrict executable script sources, mitigating XSS impacts."
      ],
      contentSections: [
        {
          heading: "1. SQL Injection: Vulnerability vs Remediation",
          bodyMarkdown: "When user input is concatenated into a raw SQL query, an attacker can break out of the string literal using quotes and inject SQL commands.",
          codeSnippet: `// VULNERABLE:
const query = "SELECT * FROM users WHERE email = '" + req.body.email + "'";
// Input: admin' OR '1'='1' --
// Becomes: SELECT * FROM users WHERE email = 'admin' OR '1'='1' --'

// SECURE (Parameterized query):
const query = "SELECT * FROM users WHERE email = $1";
db.query(query, [req.body.email]);`,
          codeLanguage: "javascript"
        }
      ],
      interactiveSandbox: {
        instructions: "Implement a basic HTML sanitizer `sanitizeHtmlOutput(rawString)` that escapes `<`, `>`, `&`, and quotes to prevent browser XSS execution.",
        initialCode: `function sanitizeHtmlOutput(rawString) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
  };
  return rawString.replace(/[&<>"']/g, char => map[char]);
}

console.log(sanitizeHtmlOutput('<script>alert("hacked")</script>'));`,
        solutionCode: `function sanitizeHtmlOutput(rawString) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
  return rawString.replace(/[&<>"']/g, char => map[char]);
}`,
        language: "javascript",
        expectedOutput: "'&lt;script&gt;alert(&quot;hacked&quot;)&lt;/script&gt;'"
      },
      quiz: [
        {
          question: "What is the single most effective defense against SQL Injection?",
          options: ["Regular expression string checks", "Parameterized queries (Prepared Statements)", "Hiding database port numbers", "Running the database as root"],
          correctIndex: 1,
          explanation: "Prepared statements pre-compile SQL commands on the database server, treating all user inputs strictly as typed parameters."
        },
        {
          question: "What does the `HttpOnly` cookie flag prevent?",
          options: ["Eavesdropping on public WiFi", "Access to the cookie via clientside JavaScript (`document.cookie`) during XSS attacks", "SQL injection in cookies", "CSRF attacks entirely"],
          correctIndex: 1,
          explanation: "HttpOnly prevents malicious scripts injected via XSS from reading session tokens stored in cookies."
        },
        {
          question: "What is an IDOR (Insecure Direct Object Reference) vulnerability?",
          options: ["A buffer overflow in the Linux kernel", "An access control flaw where users access objects by modifying numerical IDs without authorization checks", "A broken SSL certificate", "A denial-of-service attack"],
          correctIndex: 1,
          explanation: "IDOR occurs when an application exposes a reference to internal objects without verifying that the requesting user owns that object."
        }
      ]
    }
  ],
  "data-analytics": [
    {
      _id: "lesson-data-1",
      title: "Advanced SQL Window Functions: ROW_NUMBER & PARTITION BY",
      slug: "sql-window-functions-partitioning",
      track: "data-analytics",
      moduleTitle: "Module 1: Relational Schema Mastery & Advanced SQL",
      order: 1,
      readTime: "20 min",
      overview: "Master analytical SQL: understand the difference between GROUP BY and window framing, calculate cumulative totals, identify top performers per category, and use LEAD/LAG lookahead functions.",
      keyTakeaways: [
        "Window functions perform calculations across related table rows without collapsing them into a single summary row.",
        "The `PARTITION BY` clause divides rows into distinct groups for independent calculation.",
        "The `ORDER BY` clause inside OVER specifies the logical evaluation sequence.",
        "`DENSE_RANK()` assigns consecutive rank numbers without leaving gaps when values tie."
      ],
      contentSections: [
        {
          heading: "1. Anatomy of the OVER Clause",
          bodyMarkdown: "Traditional aggregations (`SUM`, `AVG`) collapse records into one row per group. Window functions calculate running metrics while preserving every underlying transaction row.",
          codeSnippet: `SELECT 
  employee_id,
  department_id,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) as dept_rank,
  SUM(salary) OVER (PARTITION BY department_id) as total_dept_spend
FROM employees;`,
          codeLanguage: "sql"
        }
      ],
      interactiveSandbox: {
        instructions: "Implement a rank calculator function `assignDenseRanks(scores)` that sorts numerical scores in descending order and assigns 1-indexed dense ranks.",
        initialCode: `function assignDenseRanks(scores) {
  const sorted = [...scores].sort((a, b) => b - a);
  const ranks = {};
  let currentRank = 1;
  sorted.forEach(score => {
    if (ranks[score] === undefined) {
      ranks[score] = currentRank++;
    }
  });
  return scores.map(s => ranks[s]);
}

console.log(assignDenseRanks([100, 90, 90, 80]));`,
        solutionCode: `function assignDenseRanks(scores) {
  const sorted = [...scores].sort((a, b) => b - a);
  const ranks = {};
  let currentRank = 1;
  sorted.forEach(score => {
    if (ranks[score] === undefined) {
      ranks[score] = currentRank++;
    }
  });
  return scores.map(s => ranks[s]);
}`,
        language: "javascript",
        expectedOutput: "[1, 2, 2, 3]"
      },
      quiz: [
        {
          question: "How does a Window Function differ from a `GROUP BY` query?",
          options: ["Window functions cannot compute sums", "Window functions preserve individual rows rather than collapsing them", "GROUP BY only works on integer columns", "Window functions can only run on SQLite"],
          correctIndex: 1,
          explanation: "Window functions calculate running or partition-level statistics while keeping all individual rows intact."
        },
        {
          question: "What is the key difference between `RANK()` and `DENSE_RANK()`?",
          options: ["DENSE_RANK() sorts in ascending order only", "DENSE_RANK() does not leave gaps in numbering after tied values", "RANK() is deprecated in PostgreSQL", "DENSE_RANK() only accepts unique keys"],
          correctIndex: 1,
          explanation: "When two values tie at rank 1, RANK() assigns the next row rank 3, whereas DENSE_RANK() assigns rank 2."
        },
        {
          question: "Which window function allows querying values from subsequent rows without complex self-joins?",
          options: ["LAG()", "LEAD()", "FIRST_VALUE()", "NTH_VALUE()"],
          correctIndex: 1,
          explanation: "LEAD() provides access to a row at a specified physical offset following the current row within the partition."
        }
      ]
    },
    {
      _id: "lesson-data-2",
      title: "Data Wrangling, Imputation & Feature Engineering with Pandas",
      slug: "pandas-data-wrangling-feature-engineering",
      track: "data-analytics",
      moduleTitle: "Module 2: Exploratory Data Analysis & ETL Engineering",
      order: 2,
      readTime: "22 min",
      overview: "Clean messy real-world datasets: missing value imputation strategies (MCAR vs MAR), categorical encoding, DateTime decomposition, and outlier detection with Interquartile Ranges (IQR).",
      keyTakeaways: [
        "Always inspect missingness patterns before blindly dropping null rows.",
        "Median imputation is preferred over mean imputation when distributions contain extreme skew or outliers.",
        "One-hot encoding creates binary dummy columns for nominal categorical variables.",
        "IQR filtering identifies data points located beyond 1.5 times the interquartile range."
      ],
      contentSections: [
        {
          heading: "1. Handling Missing Data with Pandas",
          bodyMarkdown: "Real-world data is rarely clean. Understanding why data is missing (Missing Completely at Random vs Missing at Random) dictates whether forward-fill, mean, median, or predictive imputation is optimal.",
          codeSnippet: `import pandas as pd
import numpy as np

df = pd.DataFrame({'age': [25, np.nan, 30, 45, np.nan]})

# Impute missing values with column median:
median_age = df['age'].median()
df['age_imputed'] = df['age'].fillna(median_age)`,
          codeLanguage: "python"
        }
      ],
      interactiveSandbox: {
        instructions: "Implement an outlier filter `filterOutliersIqr(values)` that removes data points outside 1.5 * IQR.",
        initialCode: `def filterOutliersIqr(values):
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    q1 = sorted_vals[n // 4]
    q3 = sorted_vals[(3 * n) // 4]
    iqr = q3 - q1
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    return [x for x in values if lower_bound <= x <= upper_bound]

sample = [10, 12, 14, 15, 16, 18, 100]
print(filterOutliersIqr(sample))`,
        solutionCode: `def filterOutliersIqr(values):
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    q1 = sorted_vals[n // 4]
    q3 = sorted_vals[(3 * n) // 4]
    iqr = q3 - q1
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    return [x for x in values if lower_bound <= x <= upper_bound]`,
        language: "python",
        expectedOutput: "[10, 12, 14, 15, 16, 18]"
      },
      quiz: [
        {
          question: "When is median imputation preferred over mean imputation?",
          options: ["When the dataset is small", "When the column data contains significant skewness or extreme outliers", "When all values are positive integers", "When the column is text data"],
          correctIndex: 1,
          explanation: "The median is robust against extreme outliers, whereas the mean is heavily pulled by extreme values."
        },
        {
          question: "What is the Interquartile Range (IQR)?",
          options: ["Maximum minus Minimum", "The difference between the 75th percentile (Q3) and 25th percentile (Q1)", "Standard deviation divided by the mean", "The median of the lower half"],
          correctIndex: 1,
          explanation: "IQR = Q3 - Q1, capturing the spread of the middle 50% of the dataset."
        },
        {
          question: "What does One-Hot Encoding do to categorical variables?",
          options: ["Converts them into floating point numbers from 0 to 1", "Converts each distinct category into a binary indicator column (0 or 1)", "Calculates the average of each category", "Deletes redundant text columns"],
          correctIndex: 1,
          explanation: "One-hot encoding creates separate binary columns for each category so algorithms don't assume false ordinal relationships."
        }
      ]
    }
  ]
};

export function normalizeTrackSlug(track?: string): string {
  if (!track) return "web-dev";
  const lower = track.toLowerCase().trim();
  if (lower.includes("app") || lower.includes("mobile") || lower.includes("react-native") || lower.includes("flutter")) {
    return "app-dev";
  }
  if (lower.includes("ai") || lower.includes("ml") || lower.includes("machine") || lower.includes("deep")) {
    return "ai-ml";
  }
  if (lower.includes("cyber") || lower.includes("security") || lower.includes("sec")) {
    return "cybersecurity";
  }
  if (lower.includes("data") || lower.includes("analytics") || lower.includes("sql")) {
    return "data-analytics";
  }
  return "web-dev";
}

export function getCuratedLessons(trackSlug?: string): Lesson[] {
  const normalized = normalizeTrackSlug(trackSlug);
  return CURATED_LESSONS[normalized] || CURATED_LESSONS["web-dev"];
}

export function getCuratedLessonBySlug(slug: string): Lesson | undefined {
  for (const trackLessons of Object.values(CURATED_LESSONS)) {
    const found = trackLessons.find((l) => l.slug === slug);
    if (found) return found;
  }
  return undefined;
}
