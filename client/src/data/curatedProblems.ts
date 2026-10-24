import { CodingProblem } from "../types";

export const CURATED_PROBLEMS: CodingProblem[] = [
  // =================== AI / ML (Python First) ===================
  {
    id: "prob-ai-1",
    title: "NumPy Tensor Reshape & Vectorized Normalization",
    slug: "tensor-reshape-normalization",
    difficulty: "Easy",
    category: "AI & Machine Learning",
    descriptionMarkdown: `Given a 2D list of numeric values representing a mini-batch of feature vectors, write a function that performs min-max normalization column-by-column so all values fall within the range [0.0, 1.0].
    
If a column has identical minimum and maximum values, set all normalized values in that column to 0.0 to prevent division by zero.`,
    examples: [
      {
        input: "[[10, 200], [20, 300], [30, 400]]",
        output: "[[0.0, 0.0], [0.5, 0.5], [1.0, 1.0]]",
        explanation: "Column 1 ranges from 10 to 30. Column 2 ranges from 200 to 400."
      }
    ],
    constraints: [
      "1 <= len(matrix) <= 1000",
      "1 <= len(matrix[0]) <= 100",
      "All entries are real numbers"
    ],
    starterCode: {
      python: `def min_max_scale(matrix):
    # Perform min-max normalization column-wise
    if not matrix or not matrix[0]:
        return []
    cols = len(matrix[0])
    col_min = [min(row[c] for row in matrix) for c in range(cols)]
    col_max = [max(row[c] for row in matrix) for c in range(cols)]
    res = []
    for row in matrix:
        norm_row = []
        for c in range(cols):
            diff = col_max[c] - col_min[c]
            norm_row.append(round((row[c] - col_min[c]) / diff, 2) if diff != 0 else 0.0)
        res.append(norm_row)
    return res`,
      javascript: `function minMaxScale(matrix) {
  const cols = matrix[0].length;
  const colMin = Array.from({ length: cols }, (_, c) => Math.min(...matrix.map(r => r[c])));
  const colMax = Array.from({ length: cols }, (_, c) => Math.max(...matrix.map(r => r[c])));
  return matrix.map(row => row.map((val, c) => {
    const diff = colMax[c] - colMin[c];
    return diff !== 0 ? +( (val - colMin[c]) / diff ).toFixed(2) : 0;
  }));
}`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    publicTestCases: [
      {
        testCaseId: "tc-1",
        input: "[[10, 200], [20, 300], [30, 400]]",
        expectedOutput: "[[0.0, 0.0], [0.5, 0.5], [1.0, 1.0]]",
        isHidden: false
      },
      {
        testCaseId: "tc-2",
        input: "[[5], [15]]",
        expectedOutput: "[[0.0], [1.0]]",
        isHidden: false
      }
    ],
    tags: ["NumPy", "Tensors", "Feature Engineering", "Python"],
    acceptanceRate: 88.5
  },
  {
    id: "prob-ai-2",
    title: "Linear Regression Gradient Descent Step",
    slug: "linear-regression-gradient-step",
    difficulty: "Medium",
    category: "AI & Machine Learning",
    descriptionMarkdown: `Implement a single gradient descent update step for univariate linear regression:
\`y_pred = w * x + b\`

Given lists \`x\`, \`y\`, current weights \`w\`, \`b\`, and learning rate \`lr\`, compute the partial derivatives of MSE loss with respect to \`w\` and \`b\`, and return the updated weights \`[new_w, new_b]\` rounded to 4 decimal places.`,
    examples: [
      {
        input: "x=[1, 2, 3], y=[2, 4, 6], w=0.0, b=0.0, lr=0.1",
        output: "[1.8667, 0.8]",
        explanation: "Gradients: dw = -28/3 = -9.333, db = -12/3 = -4.0. Updated: w = 0 - 0.1*(-9.333) = 0.9333."
      }
    ],
    constraints: ["len(x) == len(y) >= 1", "0.0001 <= lr <= 1.0"],
    starterCode: {
      python: `def gradient_descent_step(x, y, w, b, lr):
    n = len(x)
    dw = 0.0
    db = 0.0
    for i in range(n):
        y_pred = w * x[i] + b
        diff = y_pred - y[i]
        dw += (2 / n) * diff * x[i]
        db += (2 / n) * diff
    new_w = round(w - lr * dw, 4)
    new_b = round(b - lr * db, 4)
    return [new_w, new_b]`,
      javascript: `function gradientDescentStep(x, y, w, b, lr) {
  const n = x.length;
  let dw = 0, db = 0;
  for (let i = 0; i < n; i++) {
    const diff = (w * x[i] + b) - y[i];
    dw += (2 / n) * diff * x[i];
    db += (2 / n) * diff;
  }
  return [+(w - lr * dw).toFixed(4), +(b - lr * db).toFixed(4)];
}`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    publicTestCases: [
      {
        testCaseId: "tc-1",
        input: "x=[1, 2], y=[2, 4], w=1.0, b=0.0, lr=0.01",
        expectedOutput: "[1.05, 0.03]",
        isHidden: false
      }
    ],
    tags: ["Machine Learning", "Optimization", "Calculus", "Python"],
    acceptanceRate: 74.2
  },

  // =================== Web Development (JS / React First) ===================
  {
    id: "prob-web-1",
    title: "DOM Event Debounce Utility",
    slug: "dom-event-debounce",
    difficulty: "Easy",
    category: "Web Development",
    descriptionMarkdown: `Write a high-order debounce function \`debounce(fn, delayMs)\` that delays invoking \`fn\` until after \`delayMs\` milliseconds have elapsed since the last time the debounced function was invoked.
    
The debounced function must return a cleanup or cancel method and preserve the context and latest arguments.`,
    examples: [
      {
        input: "Call 3 times rapidly within 50ms (delay 100ms)",
        output: "Only the 3rd invocation executes once after 100ms",
        explanation: "Debouncing collapses burst keystrokes into a single invocation."
      }
    ],
    constraints: ["0 <= delayMs <= 5000", "Arguments must pass to underlying function"],
    starterCode: {
      javascript: `function debounce(fn, delayMs) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delayMs);
  };
}`,
      python: `import time

def debounce(fn, delay_sec):
    last_call = [0]
    def wrapper(*args, **kwargs):
        now = time.time()
        if now - last_call[0] >= delay_sec:
            last_call[0] = now
            return fn(*args, **kwargs)
    return wrapper`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    publicTestCases: [
      {
        testCaseId: "tc-1",
        input: "debounce(fn, 100)",
        expectedOutput: "Executes after delay",
        isHidden: false
      }
    ],
    tags: ["JavaScript", "DOM", "Async", "React"],
    acceptanceRate: 85.0
  },
  {
    id: "prob-web-2",
    title: "Array GroupBy & Aggregator Polyfill",
    slug: "array-groupby-polyfill",
    difficulty: "Medium",
    category: "Web Development",
    descriptionMarkdown: `Implement a function \`groupBy(items, keySelector)\` that groups an array of objects into a dictionary where the keys are the string outputs of \`keySelector(item)\` and values are arrays of matching items.`,
    examples: [
      {
        input: "[{id: 1, role: 'admin'}, {id: 2, role: 'user'}, {id: 3, role: 'admin'}], item => item.role",
        output: "{ admin: [{id: 1, role: 'admin'}, {id: 3, role: 'admin'}], user: [{id: 2, role: 'user'}] }",
        explanation: "Grouped by the role property."
      }
    ],
    constraints: ["0 <= items.length <= 10000", "keySelector returns valid string key"],
    starterCode: {
      javascript: `function groupBy(items, keySelector) {
  return items.reduce((acc, item) => {
    const key = keySelector(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}`,
      python: `def group_by(items, key_selector):
    res = {}
    for item in items:
        k = key_selector(item)
        res.setdefault(k, []).append(item)
    return res`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    publicTestCases: [
      {
        testCaseId: "tc-1",
        input: "[{age: 20}, {age: 30}, {age: 20}], x => x.age",
        expectedOutput: "{'20': [{age: 20}, {age: 20}], '30': [{age: 30}]}",
        isHidden: false
      }
    ],
    tags: ["JavaScript", "Data Structures", "Functional Programming"],
    acceptanceRate: 82.4
  },

  // =================== App Development (Mobile First) ===================
  {
    id: "prob-app-1",
    title: "Mobile Safe Area & Responsive Flex Calculation",
    slug: "mobile-safe-area-calculator",
    difficulty: "Easy",
    category: "App Development",
    descriptionMarkdown: `Given screen dimensions \`screenWidth\` and \`screenHeight\` alongside hardware safe area insets \`{top, bottom, left, right}\`, calculate the net printable viewport area and determine whether the device is in Landscape or Portrait orientation.`,
    examples: [
      {
        input: "width=390, height=844, insets={top: 47, bottom: 34, left: 0, right: 0}",
        output: "{ netWidth: 390, netHeight: 763, orientation: 'portrait' }",
        explanation: "netHeight = 844 - (47 + 34) = 763."
      }
    ],
    constraints: ["width > 0, height > 0", "all insets >= 0"],
    starterCode: {
      javascript: `function calculateViewport(width, height, insets) {
  const netWidth = width - (insets.left + insets.right);
  const netHeight = height - (insets.top + insets.bottom);
  const orientation = width > height ? 'landscape' : 'portrait';
  return { netWidth, netHeight, orientation };
}`,
      python: `def calculate_viewport(width, height, insets):
    net_w = width - (insets.get('left', 0) + insets.get('right', 0))
    net_h = height - (insets.get('top', 0) + insets.get('bottom', 0))
    orientation = 'landscape' if width > height else 'portrait'
    return {'netWidth': net_w, 'netHeight': net_h, 'orientation': orientation}`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    publicTestCases: [
      {
        testCaseId: "tc-1",
        input: "width=390, height=844, insets={top: 47, bottom: 34, left: 0, right: 0}",
        expectedOutput: "{ netWidth: 390, netHeight: 763, orientation: 'portrait' }",
        isHidden: false
      }
    ],
    tags: ["React Native", "Mobile Layout", "Flexbox", "JavaScript"],
    acceptanceRate: 91.0
  },

  // =================== Cybersecurity (Python First) ===================
  {
    id: "prob-sec-1",
    title: "TCP Control Flag Packet Validator",
    slug: "tcp-control-flag-validator",
    difficulty: "Easy",
    category: "Cybersecurity",
    descriptionMarkdown: `In network intrusion detection, validating TCP packet flag integrity is essential to detect invalid or malicious flag states (e.g. Xmas tree scan with FIN+PSH+URG, or Null scan with zero flags).
    
Write a function \`validate_tcp_state(flags)\` that inspects a flag bitmask or dictionary and returns:
- \`"SYN_INIT"\` if only SYN is active.
- \`"SYN_ACK"\` if SYN and ACK are active.
- \`"ESTABLISHED"\` if ACK is active without SYN, FIN, or RST.
- \`"XMAS_SCAN"\` if FIN, PSH, and URG are all active.
- \`"INVALID"\` for suspicious flag combinations.`,
    examples: [
      {
        input: "{ SYN: True, ACK: False, FIN: False, RST: False, PSH: False, URG: False }",
        output: "'SYN_INIT'",
        explanation: "Standard initial SYN packet."
      }
    ],
    constraints: ["All flags are boolean values"],
    starterCode: {
      python: `def validate_tcp_state(flags):
    syn = flags.get('SYN', False)
    ack = flags.get('ACK', False)
    fin = flags.get('FIN', False)
    rst = flags.get('RST', False)
    psh = flags.get('PSH', False)
    urg = flags.get('URG', False)

    if fin and psh and urg:
        return 'XMAS_SCAN'
    if syn and not ack and not fin and not rst:
        return 'SYN_INIT'
    if syn and ack and not fin and not rst:
        return 'SYN_ACK'
    if ack and not syn and not fin and not rst:
        return 'ESTABLISHED'
    return 'INVALID'`,
      javascript: `function validateTcpState(flags) {
  if (flags.FIN && flags.PSH && flags.URG) return 'XMAS_SCAN';
  if (flags.SYN && !flags.ACK && !flags.FIN && !flags.RST) return 'SYN_INIT';
  if (flags.SYN && flags.ACK && !flags.FIN && !flags.RST) return 'SYN_ACK';
  if (flags.ACK && !flags.SYN && !flags.FIN && !flags.RST) return 'ESTABLISHED';
  return 'INVALID';
}`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    publicTestCases: [
      {
        testCaseId: "tc-1",
        input: "{SYN: True, ACK: False, FIN: False, RST: False, PSH: False, URG: False}",
        expectedOutput: "'SYN_INIT'",
        isHidden: false
      }
    ],
    tags: ["Networking", "TCP/IP", "Wireshark", "Python"],
    acceptanceRate: 86.8
  },

  // =================== Data & Analytics (SQL / Python First) ===================
  {
    id: "prob-data-1",
    title: "SQL Window Ranking: Dense Rank Calculation",
    slug: "sql-dense-rank-calculator",
    difficulty: "Easy",
    category: "Data & Analytics",
    descriptionMarkdown: `Implement the analytical logic behind SQL's \`DENSE_RANK() OVER (ORDER BY score DESC)\`.
    
Given an array of integer or floating-point scores, return an array of the same length containing the 1-indexed dense rank for each score in the original order. Ties must share the exact same rank number, and consecutive ranks must have no numbering gaps.`,
    examples: [
      {
        input: "[100, 90, 90, 80]",
        output: "[1, 2, 2, 3]",
        explanation: "100 is rank 1, both 90s are rank 2, and 80 is rank 3 without gaps."
      }
    ],
    constraints: ["0 <= scores.length <= 10000", "All numbers are valid"],
    starterCode: {
      python: `def calculate_dense_rank(scores):
    sorted_unique = sorted(list(set(scores)), reverse=True)
    rank_map = {score: rank + 1 for rank, score in enumerate(sorted_unique)}
    return [rank_map[s] for s in scores]`,
      javascript: `function calculateDenseRank(scores) {
  const sortedUnique = Array.from(new Set(scores)).sort((a, b) => b - a);
  const rankMap = new Map();
  sortedUnique.forEach((score, idx) => rankMap.set(score, idx + 1));
  return scores.map(s => rankMap.get(s));
}`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    publicTestCases: [
      {
        testCaseId: "tc-1",
        input: "[100, 90, 90, 80]",
        expectedOutput: "[1, 2, 2, 3]",
        isHidden: false
      }
    ],
    tags: ["SQL", "Analytics", "Algorithms", "Python"],
    acceptanceRate: 89.2
  }
];

export function getCuratedProblems(category?: string): CodingProblem[] {
  if (!category || category === "All" || category === "All Tracks") {
    return CURATED_PROBLEMS;
  }
  const lower = category.toLowerCase();
  return CURATED_PROBLEMS.filter((p) => {
    const pCat = p.category.toLowerCase();
    if (lower.includes("ai") || lower.includes("ml")) return pCat.includes("ai") || pCat.includes("machine");
    if (lower.includes("web") || lower.includes("front") || lower.includes("full")) return pCat.includes("web");
    if (lower.includes("app") || lower.includes("mobile")) return pCat.includes("app");
    if (lower.includes("cyber") || lower.includes("sec")) return pCat.includes("cyber");
    if (lower.includes("data") || lower.includes("analyt")) return pCat.includes("data");
    return true;
  });
}

export function getCuratedProblemBySlug(slug: string): CodingProblem | undefined {
  return CURATED_PROBLEMS.find((p) => p.slug === slug);
}
