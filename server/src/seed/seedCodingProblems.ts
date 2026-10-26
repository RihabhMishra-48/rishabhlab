import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = fs.existsSync(path.resolve(process.cwd(), 'server/.env')) 
  ? path.resolve(process.cwd(), 'server/.env') 
  : path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export interface ProblemSeed {
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  is_debugging_challenge: boolean;
  broken_bug_explanation?: string | null;
  description_markdown: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  starter_code: { javascript: string; python: string; cpp?: string; java?: string };
  hints: { level1Concept?: string; level2Stronger?: string; level3Approach?: string; level4Mentor?: string };
  test_cases: Array<{ testCaseId: string; input: string; expectedOutput: string; isHidden: boolean; explanation?: string }>;
  acceptance_rate: string;
}

export const ALL_CODING_PROBLEMS: ProblemSeed[] = [
  // ============================================================================
  // TRACK 1: WEB DEVELOPMENT
  // ============================================================================
  {
    slug: 'filter-active-users',
    title: 'Filter Active Users',
    difficulty: 'Easy',
    category: 'Web Development',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `Given an array of user objects where each user contains an \`id\`, \`name\`, and boolean \`isActive\` flag, write a function \`filterActiveUsers(users)\` that returns only the users whose \`isActive\` property is \`true\`.

### Input
- An array of objects: \`[{ id: number, name: string, isActive: boolean }]\`

### Output
- Array of active user objects preserving original order.`,
    examples: [
      {
        input: '[{ id: 1, name: "Rishabh", isActive: true }, { id: 2, name: "Aarav", isActive: false }]',
        output: '[{ id: 1, name: "Rishabh", isActive: true }]',
        explanation: 'Only Rishabh has isActive: true.'
      }
    ],
    constraints: [
      '0 <= users.length <= 10,000',
      'Each element contains valid id, name, and isActive'
    ],
    starter_code: {
      javascript: `function filterActiveUsers(users) {
  // Write your code here
  return users.filter(user => user.isActive);
}`,
      python: `def filter_active_users(users):
    # Write your code here
    return [u for u in users if u.get("isActive") == True]`,
      cpp: `// C++ User filter`,
      java: `// Java User filter`
    },
    hints: {
      level1Concept: 'Look at the JavaScript Array.prototype.filter() method.',
      level2Stronger: 'Filter accepts a callback function that evaluates each object and returns true or false.',
      level3Approach: 'return users.filter(u => u.isActive === true);'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: '[{"id":1,"name":"Rishabh","isActive":true},{"id":2,"name":"Aarav","isActive":false}]', expectedOutput: '[{"id":1,"name":"Rishabh","isActive":true}]', isHidden: false },
      { testCaseId: 'tc-2', input: '[{"id":10,"name":"Dev","isActive":false}]', expectedOutput: '[]', isHidden: false }
    ],
    acceptance_rate: '89%'
  },
  {
    slug: 'dom-event-debounce',
    title: 'DOM Event Debounce with Immediate Execution Option',
    difficulty: 'Easy',
    category: 'Web Development',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## DOM Event Debounce
Implement a debouncing function \`debounce(fn, delayMs, immediate)\` that delays invoking \`fn\` until after \`delayMs\` milliseconds have elapsed since the last time the debounced function was invoked.

### Requirements:
- If \`immediate\` is \`true\`, invoke \`fn\` on the leading edge rather than the trailing edge.
- Return the wrapped function maintaining correct arguments and return values.
- Subsequent calls within the window reset the delay timer.`,
    examples: [
      {
        input: 'fn=searchApi, delayMs=300, calls=[0ms, 100ms, 250ms]',
        output: 'Invoked once at 550ms with arguments from 250ms call',
        explanation: 'Each call resets the 300ms countdown until calls cease.'
      }
    ],
    constraints: [
      '1 <= delayMs <= 10,000',
      'fn is a valid callable function',
      'Memory leaks from un-cleared timers must be prevented'
    ],
    starter_code: {
      javascript: `function debounce(fn, delayMs = 300, immediate = false) {
  let timerId = null;
  return function(...args) {
    const callNow = immediate && !timerId;
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      timerId = null;
      if (!immediate) fn.apply(this, args);
    }, delayMs);
    if (callNow) fn.apply(this, args);
  };
}`,
      python: `import threading

def debounce(fn, delay_sec=0.3, immediate=False):
    timer = None
    def wrapper(*args, **kwargs):
        nonlocal timer
        call_now = immediate and timer is None
        if timer is not None:
            timer.cancel()
        timer = threading.Timer(delay_sec, lambda: fn(*args, **kwargs))
        timer.start()
        if call_now:
            fn(*args, **kwargs)
    return wrapper`,
      cpp: `// C++ Debounce utility`,
      java: `// Java ScheduledExecutorService Debounce utility`
    },
    hints: {
      level1Concept: 'Maintain a timer variable in closure and call clearTimeout whenever a new invocation occurs.',
      level2Stronger: 'For immediate execution, check if timer is currently null; invoke immediately if true.',
      level3Approach: 'Store timerId in lexical scope, reset with clearTimeout(timerId), schedule trailing dispatch if !immediate.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'debounce(add, 100)([1, 2])', expectedOutput: '3', isHidden: false },
      { testCaseId: 'tc-2', input: 'rapid 5 calls within 50ms (delay 100ms)', expectedOutput: 'callCount === 1', isHidden: false },
      { testCaseId: 'tc-3', input: 'immediate=true on single burst', expectedOutput: 'executed instantly on leading edge', isHidden: true }
    ],
    acceptance_rate: '84%'
  },
  {
    slug: 'array-groupby-polyfill',
    title: 'Array GroupBy & Key Aggregator Polyfill',
    difficulty: 'Easy',
    category: 'Web Development',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Array GroupBy Polyfill
Implement a function \`groupBy(items, keySelector)\` that groups elements of an array according to the string key returned by the \`keySelector\` callback function.

### Requirements:
- Returns an object where each property is a key and its value is an array of items with that key.
- The relative ordering of elements inside each group must be preserved.`,
    examples: [
      {
        input: 'items=[6.1, 4.2, 6.3], keySelector=Math.floor',
        output: '{"4": [4.2], "6": [6.1, 6.3]}',
        explanation: 'Math.floor categorizes elements into groups "4" and "6".'
      }
    ],
    constraints: [
      '0 <= items.length <= 10^5',
      'keySelector will return a string or number convertable to string',
      'Must run in O(n) linear time'
    ],
    starter_code: {
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
        key = str(key_selector(item))
        if key not in res:
            res[key] = []
        res[key].append(item)
    return res`,
      cpp: `// C++ std::unordered_map grouping implementation`,
      java: `// Java Collectors.groupingBy implementation`
    },
    hints: {
      level1Concept: 'Loop through the input array once using reduce or for..of and maintain a dictionary/object.',
      level2Stronger: 'Initialize an empty array on the object if the key has not been encountered yet.',
      level3Approach: 'acc[key] = acc[key] || []; acc[key].push(item); return acc;'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'groupBy([6.1, 4.2, 6.3], Math.floor)', expectedOutput: '{"4":[4.2],"6":[6.1,6.3]}', isHidden: false },
      { testCaseId: 'tc-2', input: 'groupBy(["one", "two", "three"], s => s.length)', expectedOutput: '{"3":["one","two"],"5":["three"]}', isHidden: false },
      { testCaseId: 'tc-3', input: 'groupBy([], x => x)', expectedOutput: '{}', isHidden: true }
    ],
    acceptance_rate: '89%'
  },
  {
    slug: 'high-throughput-in-memory-cache',
    title: 'High-Throughput In-Memory LRU Cache with TTL',
    difficulty: 'Medium',
    category: 'Web Development',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## High-Throughput In-Memory LRU Cache with TTL
Design an in-memory key-value cache engine supporting **TTL (Time-To-Live) expiration**, thread-safe **LRU (Least Recently Used) eviction**, and $O(1)$ lookups.

### Methods:
- \`set(key, value, ttlMs)\`: Stores value. If capacity exceeded, evicts the least recently used active key.
- \`get(key)\`: Returns value if present and unexpired, updating access recency. Returns \`null\` if missing/expired.
- \`purge()\`: Removes all expired entries, returning the count of purged items.
- \`size()\`: Returns count of active unexpired items.`,
    examples: [
      {
        input: '["CacheEngine", 2], ["set", "token", "xyz", 5000], ["get", "token"]',
        output: '[null, null, "xyz"]',
        explanation: 'Retrieves value within TTL and updates LRU order.'
      }
    ],
    constraints: [
      '1 <= capacity <= 10,000',
      'Average time complexity must be O(1) for get and set'
    ],
    starter_code: {
      javascript: `class CacheEngine {
  constructor(capacity = 1000) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  set(key, value, ttlMs) {
    const expireAt = ttlMs ? Date.now() + ttlMs : null;
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { val: value, expireAt });
  }
  get(key) {
    if (!this.cache.has(key)) return null;
    const item = this.cache.get(key);
    if (item.expireAt && Date.now() > item.expireAt) {
      this.cache.delete(key);
      return null;
    }
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.val;
  }
  purge() {
    let count = 0;
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expireAt && now > item.expireAt) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }
  size() {
    this.purge();
    return this.cache.size;
  }
}`,
      python: `import time
from collections import OrderedDict

class CacheEngine:
    def __init__(self, capacity=1000):
        self.capacity = capacity
        self.cache = OrderedDict()
    def set(self, key: str, value, ttl_ms: int = None):
        expire_at = (time.time() + ttl_ms / 1000.0) if ttl_ms else None
        if key in self.cache:
            del self.cache[key]
        elif len(self.cache) >= self.capacity:
            self.cache.popitem(last=False)
        self.cache[key] = (value, expire_at)
    def get(self, key: str):
        if key not in self.cache:
            return None
        val, expire_at = self.cache[key]
        if expire_at and time.time() > expire_at:
            del self.cache[key]
            return None
        self.cache.move_to_end(key)
        return val`,
      cpp: `// C++ LRU CacheEngine with std::list and unordered_map`,
      java: `// Java LinkedHashMap LRU CacheEngine`
    },
    hints: {
      level1Concept: 'JavaScript Map preserves insertion order. Deleting and re-inserting moves a key to the most-recent position.',
      level2Stronger: 'Store expireAt alongside value. On get(), if Date.now() > expireAt, delete and return null.',
      level3Approach: 'Combine capacity checks with LRU key eviction using this.cache.keys().next().value.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'set("a", 1), set("b", 2), set("c", 3) on capacity=2 -> get("a")', expectedOutput: 'null', isHidden: false },
      { testCaseId: 'tc-2', input: 'set("auth", "tok", 5000) -> get("auth")', expectedOutput: '"tok"', isHidden: false },
      { testCaseId: 'tc-3', input: 'eviction respects access refresh', expectedOutput: 'least recent evicted first', isHidden: true }
    ],
    acceptance_rate: '68%'
  },
  {
    slug: 'deep-clone-circular',
    title: 'Deep Object Clone with Circular Reference Resolution',
    difficulty: 'Medium',
    category: 'Web Development',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Deep Object Clone with Circular Reference Handling
Implement a function \`deepClone(value)\` that creates a deep copy of any JavaScript object or array without infinite recursion when objects contain circular references to themselves or ancestors.

### Requirements:
- Handles nested objects, arrays, primitives, Dates, and RegExps.
- Resolves circular references by reusing the previously cloned instance from a WeakMap.`,
    examples: [
      {
        input: 'const a = { name: "node" }; a.self = a;',
        output: 'Clone maintains identical structure where cloned.self === cloned',
        explanation: 'Deep clone must not exceed call stack or crash on circular pointers.'
      }
    ],
    constraints: [
      'Input can be nested up to 500 levels deep',
      'Cannot use structuredClone or JSON.parse(JSON.stringify())'
    ],
    starter_code: {
      javascript: `function deepClone(target, hash = new WeakMap()) {
  if (target === null || typeof target !== 'object') return target;
  if (target instanceof Date) return new Date(target);
  if (target instanceof RegExp) return new RegExp(target);
  if (hash.has(target)) return hash.get(target);

  const clone = Array.isArray(target) ? [] : {};
  hash.set(target, clone);

  for (const key of Object.keys(target)) {
    clone[key] = deepClone(target[key], hash);
  }
  return clone;
}`,
      python: `def deep_clone(target, memo=None):
    if memo is None:
        memo = {}
    if target is None or not isinstance(target, (dict, list)):
        return target
    obj_id = id(target)
    if obj_id in memo:
        return memo[obj_id]
    if isinstance(target, list):
        clone = []
        memo[obj_id] = clone
        for item in target:
            clone.append(deep_clone(item, memo))
        return clone
    clone = {}
    memo[obj_id] = clone
    for k, v in target.items():
        clone[k] = deep_clone(v, memo)
    return clone`,
      cpp: `// C++ deep clone`,
      java: `// Java deep clone`
    },
    hints: {
      level1Concept: 'Use a WeakMap to track visited objects and their corresponding newly cloned instances.',
      level2Stronger: 'Before recursing into an object property, check if it already exists in the WeakMap.',
      level3Approach: 'hash.set(target, clone); then recurse over child keys.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: '{ a: 1, b: { c: 2 } }', expectedOutput: 'deeply cloned independent object', isHidden: false },
      { testCaseId: 'tc-2', input: 'circular object referencing itself', expectedOutput: 'cloned.self === cloned without stack overflow', isHidden: false },
      { testCaseId: 'tc-3', input: 'array of nested objects with shared sub-branches', expectedOutput: 'preserved branch identities', isHidden: true }
    ],
    acceptance_rate: '62%'
  },
  {
    slug: 'fix-the-bug-async-drop',
    title: 'Fix the Bug: Race Condition in Concurrent Async Fetch Queue',
    difficulty: 'Medium',
    category: 'Web Development',
    is_debugging_challenge: true,
    broken_bug_explanation: 'The asynchronous search handler triggers multiple parallel requests as the user types, but updates UI state with whichever request completes first. When an earlier, slower request finishes after a subsequent request, obsolete results overwrite fresh state.',
    description_markdown: `## Fix the Bug: Concurrent Async State Race Condition
In an interactive search filter, typing rapidly fires off asynchronous API queries.

### The Bug:
When network latencies fluctuate, Request A (sent for "re") might take 400ms, while Request B (sent for "react") takes 100ms. Request B finishes first and displays "react" results; then Request A finishes 300ms later and overwrites the screen with stale "re" results!

### Your Task:
Inspect the buggy \`SearchQueueManager\` implementation and fix it using a request ID sequence counter or AbortController so that only the latest active query updates the final result state.`,
    examples: [
      {
        input: 'query("re") [takes 300ms], query("react") [takes 50ms]',
        output: 'Final state contains results for "react"',
        explanation: 'The stale response from "re" must be discarded.'
      }
    ],
    constraints: [
      'Must handle out-of-order response arrivals gracefully',
      'Discarded responses must not trigger callback or state updates'
    ],
    starter_code: {
      javascript: `class SearchQueueManager {
  constructor(fetchFn, onResult) {
    this.fetchFn = fetchFn;
    this.onResult = onResult;
    // BUGGY: Does not track request IDs or abort stale inflight calls!
  }

  async search(query) {
    // FIX THIS: Ensure stale queries cannot overwrite newer results
    const results = await this.fetchFn(query);
    this.onResult(results);
  }
}`,
      python: `class SearchQueueManager:
    def __init__(self, fetch_fn, on_result):
        self.fetch_fn = fetch_fn
        self.on_result = on_result
        self.current_id = 0

    async def search(self, query):
        self.current_id += 1
        req_id = self.current_id
        results = await self.fetch_fn(query)
        if req_id == self.current_id:
            self.on_result(results)`,
      cpp: `// C++ async queue`,
      java: `// Java CompletableFuture queue`
    },
    hints: {
      level1Concept: 'Maintain an incrementing sequence integer this.latestRequestId.',
      level2Stronger: 'Capture the local requestId before awaiting fetchFn. After resolution, compare localId === this.latestRequestId.',
      level3Approach: 'const reqId = ++this.latestRequestId; const res = await this.fetchFn(query); if (reqId === this.latestRequestId) this.onResult(res);'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'stale 300ms request arrives after 100ms request', expectedOutput: '100ms request remains active', isHidden: false },
      { testCaseId: 'tc-2', input: 'single search query finishes normally', expectedOutput: 'onResult invoked once with payload', isHidden: false },
      { testCaseId: 'tc-3', input: 'rapid typing burst of 10 requests', expectedOutput: 'only request #10 updates state', isHidden: true }
    ],
    acceptance_rate: '71%'
  },
  {
    slug: 'reactive-virtual-dom-diff',
    title: 'Virtual DOM Tree Reconciliation & Minimal Patch Engine',
    difficulty: 'Hard',
    category: 'Web Development',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Minimal Virtual DOM Diffing Engine
Build a lightweight tree reconciliation function \`diff(oldTree, newTree)\` that compares two VNode representations and outputs an array of mutation instructions.

### Patch Operation Types:
- \`{ type: 'CREATE', node: newTree }\`
- \`{ type: 'REMOVE' }\`
- \`{ type: 'REPLACE', node: newTree }\`
- \`{ type: 'UPDATE_TEXT', text: newText }\`
- \`{ type: 'UPDATE_PROPS', props: diffProps }\`
- \`{ type: 'CHILDREN', diffs: [...] }\``,
    examples: [
      {
        input: 'old={ tag: "h1", text: "Hello" }, new={ tag: "h1", text: "World" }',
        output: '[{ type: "UPDATE_TEXT", text: "World" }]',
        explanation: 'Tags match; only inner text changed.'
      }
    ],
    constraints: [
      'Trees may have arbitrary child depth up to 50',
      'Execution must be O(n) using keyless single-pass comparison'
    ],
    starter_code: {
      javascript: `function diff(oldNode, newNode) {
  if (!oldNode) return [{ type: 'CREATE', node: newNode }];
  if (!newNode) return [{ type: 'REMOVE' }];
  if (typeof oldNode === 'string' || typeof newNode === 'string') {
    if (oldNode !== newNode) return [{ type: 'UPDATE_TEXT', text: newNode }];
    return [];
  }
  if (oldNode.tag !== newNode.tag) {
    return [{ type: 'REPLACE', node: newNode }];
  }
  const patches = [];
  // Compare props and children
  return patches;
}`,
      python: `def diff(old_node, new_node):
    if old_node is None:
        return [{'type': 'CREATE', 'node': new_node}]
    if new_node is None:
        return [{'type': 'REMOVE'}]
    if isinstance(old_node, str) or isinstance(new_node, str):
        if old_node != new_node:
            return [{'type': 'UPDATE_TEXT', 'text': new_node}]
        return []
    if old_node.get('tag') != new_node.get('tag'):
        return [{'type': 'REPLACE', 'node': new_node}]
    return []`,
      cpp: `// C++ VNode diffing`,
      java: `// Java VNode diffing`
    },
    hints: {
      level1Concept: 'Base conditions: check for node creation, removal, and tag mismatch replacement first.',
      level2Stronger: 'If tags match, compare props objects for changed or removed keys.',
      level3Approach: 'Recursively diff children arrays up to Math.max(old.children.length, new.children.length).'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'old="A", new="B"', expectedOutput: '[{ type: "UPDATE_TEXT", text: "B" }]', isHidden: false },
      { testCaseId: 'tc-2', input: 'different tags div -> span', expectedOutput: '[{ type: "REPLACE", node: { tag: "span" } }]', isHidden: false },
      { testCaseId: 'tc-3', input: 'nested child mutation', expectedOutput: 'patches generated at correct child index', isHidden: true }
    ],
    acceptance_rate: '48%'
  },

  // ============================================================================
  // TRACK 2: AI & MACHINE LEARNING
  // ============================================================================
  {
    slug: 'tensor-reshape-normalization',
    title: 'NumPy Tensor Reshape & Min-Max Vectorized Normalization',
    difficulty: 'Easy',
    category: 'AI & Machine Learning',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## NumPy Tensor Reshape & Min-Max Normalization
Given a 2D matrix representing feature vectors, write a function \`minMaxScale(matrix)\` that normalizes each column independently to the range $[0.0, 1.0]$ using:
$$x_{\\text{norm}} = \\frac{x - \\min(X)}{\\max(X) - \\min(X)}$$

If a column has equal min and max, set all values in that column to \`0.0\` to avoid division by zero. Round answers to 2 decimal places.`,
    examples: [
      {
        input: '[[10, 200], [20, 300], [30, 400]]',
        output: '[[0.0, 0.0], [0.5, 0.5], [1.0, 1.0]]',
        explanation: 'Col 0 scaled across [10, 30], Col 1 across [200, 400].'
      }
    ],
    constraints: [
      '1 <= rows <= 1000',
      '1 <= cols <= 100',
      'All matrix values are real numbers'
    ],
    starter_code: {
      python: `def min_max_scale(matrix):
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
  if (!matrix.length) return [];
  const cols = matrix[0].length;
  const colMin = Array.from({ length: cols }, (_, c) => Math.min(...matrix.map(r => r[c])));
  const colMax = Array.from({ length: cols }, (_, c) => Math.max(...matrix.map(r => r[c])));
  return matrix.map(row => row.map((val, c) => {
    const diff = colMax[c] - colMin[c];
    return diff !== 0 ? +( (val - colMin[c]) / diff ).toFixed(2) : 0.0;
  }));
}`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Find the minimum and maximum for each column index first.',
      level2Stronger: 'Watch out for division by zero when column maximum equals minimum.',
      level3Approach: 'Calculate diff = max - min. If diff === 0, use 0.0; else (x - min) / diff.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: '[[10, 200], [20, 300], [30, 400]]', expectedOutput: '[[0.0, 0.0], [0.5, 0.5], [1.0, 1.0]]', isHidden: false },
      { testCaseId: 'tc-2', input: '[[5], [15]]', expectedOutput: '[[0.0], [1.0]]', isHidden: false },
      { testCaseId: 'tc-3', input: '[[7, 10], [7, 20]]', expectedOutput: '[[0.0, 0.0], [0.0, 1.0]]', isHidden: true }
    ],
    acceptance_rate: '86%'
  },
  {
    slug: 'cosine-similarity-vector-search',
    title: 'Cosine Similarity Engine for Embedding Retrieval',
    difficulty: 'Easy',
    category: 'AI & Machine Learning',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Cosine Similarity Embedding Search
Implement \`cosineSimilarity(vecA, vecB)\` to calculate the semantic similarity between two embedding vectors:
$$\\cos(\\theta) = \\frac{\\mathbf{A} \\cdot \\mathbf{B}}{\\|\\mathbf{A}\\| \\|\\mathbf{B}\\|} = \\frac{\\sum A_i B_i}{\\sqrt{\\sum A_i^2} \\sqrt{\\sum B_i^2}}$$

Return the score rounded to 4 decimal places. If either vector has zero magnitude, return \`0.0\`.`,
    examples: [
      {
        input: 'vecA=[1, 2, 3], vecB=[2, 4, 6]',
        output: '1.0',
        explanation: 'vecB is a direct positive scalar multiple of vecA, giving exact cosine similarity of 1.0.'
      }
    ],
    constraints: [
      'len(vecA) == len(vecB) >= 1',
      '-100.0 <= vecA[i], vecB[i] <= 100.0'
    ],
    starter_code: {
      python: `import math

def cosine_similarity(vec_a, vec_b):
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    mag_a = math.sqrt(sum(a * a for a in vec_a))
    mag_b = math.sqrt(sum(b * b for b in vec_b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return round(dot / (mag_a * mag_b), 4)`,
      javascript: `function cosineSimilarity(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0.0 : +(dot / denom).toFixed(4);
}`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Compute the dot product (sum of pairwise multiplications) and the Euclidean norms of both vectors.',
      level2Stronger: 'Divide dot product by the product of both magnitudes.',
      level3Approach: 'Check for zero denominator before dividing to prevent NaN.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'vecA=[1, 0], vecB=[0, 1]', expectedOutput: '0.0', isHidden: false },
      { testCaseId: 'tc-2', input: 'vecA=[1, 2, 3], vecB=[2, 4, 6]', expectedOutput: '1.0', isHidden: false },
      { testCaseId: 'tc-3', input: 'vecA=[1, 2], vecB=[-1, -2]', expectedOutput: '-1.0', isHidden: true }
    ],
    acceptance_rate: '82%'
  },
  {
    slug: 'linear-regression-gradient-step',
    title: 'Linear Regression Gradient Descent Step',
    difficulty: 'Medium',
    category: 'AI & Machine Learning',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Linear Regression Gradient Descent Step
Implement a single parameter update step for univariate linear regression:
$$\\hat{y} = w \\cdot x + b$$
Using Mean Squared Error (MSE) loss:
$$L = \\frac{1}{N} \\sum (\\hat{y}_i - y_i)^2$$

Compute gradients $\\frac{\\partial L}{\\partial w}$ and $\\frac{\\partial L}{\\partial b}$, then return the updated parameters \`[new_w, new_b]\` rounded to 4 decimal places.`,
    examples: [
      {
        input: 'x=[1, 2, 3], y=[2, 4, 6], w=0.0, b=0.0, lr=0.1',
        output: '[1.8667, 0.8]',
        explanation: 'Gradients: dw = -18.667, db = -8.0; updated with lr=0.1.'
      }
    ],
    constraints: [
      'len(x) == len(y) >= 1',
      '0.0001 <= lr <= 1.0'
    ],
    starter_code: {
      python: `def gradient_descent_step(x, y, w, b, lr):
    n = len(x)
    dw = 0.0
    db = 0.0
    for i in range(n):
        y_pred = w * x[i] + b
        diff = y_pred - y[i]
        dw += (2.0 / n) * diff * x[i]
        db += (2.0 / n) * diff
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
    hints: {
      level1Concept: 'Compute predictions y_pred = w * x + b for all points.',
      level2Stronger: 'Gradient for w: (2/N) * sum((y_pred - y) * x). Gradient for b: (2/N) * sum(y_pred - y).',
      level3Approach: 'Update: w_new = w - lr * dw; b_new = b - lr * db.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'x=[1, 2, 3], y=[2, 4, 6], w=0.0, b=0.0, lr=0.1', expectedOutput: '[1.8667, 0.8]', isHidden: false },
      { testCaseId: 'tc-2', input: 'x=[2], y=[4], w=1.0, b=0.0, lr=0.05', expectedOutput: '[1.4, 0.2]', isHidden: false },
      { testCaseId: 'tc-3', input: 'exact fit produces zero gradients', expectedOutput: '[w, b] unchanged', isHidden: true }
    ],
    acceptance_rate: '71%'
  },
  {
    slug: 'softmax-activation-numerical-stability',
    title: 'Numerically Stable Softmax & Cross-Entropy Loss',
    difficulty: 'Medium',
    category: 'AI & Machine Learning',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Numerically Stable Softmax
Directly computing $\\frac{e^{z_i}}{\\sum e^{z_j}}$ overflows into \`Infinity\` when logits $z_i > 710$.

Implement \`stableSoftmax(logits)\` that prevents overflow by subtracting the maximum logit before exponentiating:
$$S(z_i) = \\frac{e^{z_i - \\max(z)}}{\\sum_j e^{z_j - \\max(z)}}$$

Return probabilities rounded to 4 decimal places. Sum of probabilities must equal 1.0.`,
    examples: [
      {
        input: 'logits=[1000, 1001, 1002]',
        output: '[0.0900, 0.2447, 0.6652]',
        explanation: 'Subtracting max (1002) yields [-2, -1, 0], avoiding overflow.'
      }
    ],
    constraints: [
      '1 <= len(logits) <= 10,000',
      '-10^6 <= logits[i] <= 10^6'
    ],
    starter_code: {
      python: `import math

def stable_softmax(logits):
    if not logits:
        return []
    max_logit = max(logits)
    exp_shifted = [math.exp(x - max_logit) for x in logits]
    total = sum(exp_shifted)
    return [round(val / total, 4) for val in exp_shifted]`,
      javascript: `function stableSoftmax(logits) {
  if (!logits.length) return [];
  const maxLogit = Math.max(...logits);
  const expShifted = logits.map(x => Math.exp(x - maxLogit));
  const total = expShifted.reduce((a, b) => a + b, 0);
  return expShifted.map(v => +(v / total).toFixed(4));
}`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Standard exp() blows up to infinity on large positive floats.',
      level2Stronger: 'e^(z - M) / sum(e^(z - M)) is mathematically identical to standard softmax.',
      level3Approach: 'Subtract Math.max(...logits), calculate exp(), divide by total.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: '[1000, 1001, 1002]', expectedOutput: '[0.09, 0.2447, 0.6652]', isHidden: false },
      { testCaseId: 'tc-2', input: '[0, 0]', expectedOutput: '[0.5, 0.5]', isHidden: false },
      { testCaseId: 'tc-3', input: 'extreme negative logits [-1000, -998]', expectedOutput: '[0.1192, 0.8808]', isHidden: true }
    ],
    acceptance_rate: '66%'
  },
  {
    slug: 'fix-the-bug-vanishing-gradient',
    title: 'Fix the Bug: Gradient Saturation & Exploding Tensor Norm',
    difficulty: 'Medium',
    category: 'AI & Machine Learning',
    is_debugging_challenge: true,
    broken_bug_explanation: 'During deep neural network backpropagation, sigmoid activation saturation squashes gradients to near-zero ($< 10^{-12}$) across 5 layers, halting learning. The derivative formula in backward pass also fails to clip maximum gradient norms, causing NaN exploding oscillations.',
    description_markdown: `## Fix the Bug: Vanishing & Exploding Gradients
In a multi-layer perceptron training loop, loss diverges to \`NaN\` after 3 iterations.

### The Problem:
1. Sigmoid derivatives saturated to zero on large inputs.
2. Gradients accumulated without norm thresholding (gradient clipping).

### Your Task:
Inspect \`backpropStep\` and introduce gradient clipping so that if $\\|g\\| > \\text{maxNorm}$, the gradient is scaled down proportionally by $\\frac{\\text{maxNorm}}{\\|g\\|}$.`,
    examples: [
      {
        input: 'gradients=[15.0, 20.0], maxNorm=10.0',
        output: '[6.0, 8.0]',
        explanation: 'Norm is sqrt(225+400)=25.0. Scaled by 10/25 = 0.4.'
      }
    ],
    constraints: [
      'Gradients must maintain relative directional proportions',
      'If norm <= maxNorm, gradients remain untouched'
    ],
    starter_code: {
      python: `import math

def clip_gradients(gradients, max_norm=5.0):
    norm = math.sqrt(sum(g * g for g in gradients))
    if norm > max_norm:
        scale = max_norm / norm
        return [round(g * scale, 4) for g in gradients]
    return [round(g, 4) for g in gradients]`,
      javascript: `function clipGradients(gradients, maxNorm = 5.0) {
  const norm = Math.sqrt(gradients.reduce((sum, g) => sum + g * g, 0));
  if (norm > maxNorm) {
    const scale = maxNorm / norm;
    return gradients.map(g => +(g * scale).toFixed(4));
  }
  return gradients.map(g => +g.toFixed(4));
}`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Compute the L2 Euclidean norm of the entire gradient vector.',
      level2Stronger: 'If norm exceeds maxNorm, multiply each component by (maxNorm / norm).',
      level3Approach: 'norm = sqrt(sum(g^2)); if (norm > maxNorm) g = g * (maxNorm / norm).'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'gradients=[3.0, 4.0], maxNorm=10.0', expectedOutput: '[3.0, 4.0]', isHidden: false },
      { testCaseId: 'tc-2', input: 'gradients=[15.0, 20.0], maxNorm=10.0', expectedOutput: '[6.0, 8.0]', isHidden: false },
      { testCaseId: 'tc-3', input: 'gradients=[100.0], maxNorm=5.0', expectedOutput: '[5.0]', isHidden: true }
    ],
    acceptance_rate: '74%'
  },

  // ============================================================================
  // TRACK 3: MOBILE APP DEVELOPMENT
  // ============================================================================
  {
    slug: 'mobile-safe-area-calculator',
    title: 'Mobile Viewport Safe Area & Gesture Pill Insets Calculator',
    difficulty: 'Easy',
    category: 'Mobile App Development',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Mobile Safe Area Insets Calculator
Given a device screen dimension \`{ width, height, orientation }\` and hardware cutout specifications \`{ notchHeight, gestureBarHeight, hasIsland }\`, compute the usable safe layout rectangle \`{ top, right, bottom, left, safeWidth, safeHeight }\`.

### Rules:
- In portrait: \`top\` inset is determined by notch or dynamic island; \`bottom\` by gesture home bar.
- In landscape: \`left\` or \`right\` inset accommodates the camera cutout. Usable width shrinks accordingly.`,
    examples: [
      {
        input: 'screen={ width: 393, height: 852, orientation: "portrait" }, hardware={ notchHeight: 47, gestureBarHeight: 34 }',
        output: '{ top: 47, bottom: 34, left: 0, right: 0, safeWidth: 393, safeHeight: 771 }',
        explanation: 'Safe height is 852 - 47 - 34 = 771px.'
      }
    ],
    constraints: [
      'Screen dimensions are positive integers',
      'Orientation is either "portrait" or "landscape"'
    ],
    starter_code: {
      javascript: `function computeSafeArea(screen, hardware) {
  const { width, height, orientation } = screen;
  const { notchHeight = 0, gestureBarHeight = 0 } = hardware;

  if (orientation === 'portrait') {
    return {
      top: notchHeight,
      bottom: gestureBarHeight,
      left: 0,
      right: 0,
      safeWidth: width,
      safeHeight: height - notchHeight - gestureBarHeight
    };
  } else {
    return {
      top: 0,
      bottom: gestureBarHeight,
      left: notchHeight,
      right: 0,
      safeWidth: width - notchHeight,
      safeHeight: height - gestureBarHeight
    };
  }
}`,
      python: `def compute_safe_area(screen, hardware):
    w, h, orient = screen['width'], screen['height'], screen['orientation']
    notch = hardware.get('notchHeight', 0)
    bar = hardware.get('gestureBarHeight', 0)
    if orient == 'portrait':
        return {
            'top': notch, 'bottom': bar, 'left': 0, 'right': 0,
            'safeWidth': w, 'safeHeight': h - notch - bar
        }
    return {
        'top': 0, 'bottom': bar, 'left': notch, 'right': 0,
        'safeWidth': w - notch, 'safeHeight': h - bar
    }`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Subtract top and bottom insets from total height in portrait mode.',
      level2Stronger: 'In landscape mode, cutouts shift to horizontal edges (left or right).',
      level3Approach: 'safeHeight = height - top - bottom; safeWidth = width - left - right.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'portrait 393x852 notch=47 bar=34', expectedOutput: 'safeHeight === 771', isHidden: false },
      { testCaseId: 'tc-2', input: 'landscape 852x393 notch=47 bar=21', expectedOutput: 'safeWidth === 805', isHidden: false },
      { testCaseId: 'tc-3', input: 'tablet with zero notch', expectedOutput: 'safeHeight === height - bar', isHidden: true }
    ],
    acceptance_rate: '85%'
  },
  {
    slug: 'touch-hit-slop-expansion',
    title: 'Touch HitSlop Target Boundary Expander',
    difficulty: 'Easy',
    category: 'Mobile App Development',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Touch HitSlop Boundary Expander
Mobile accessibility guidelines require touch targets to be at least $48 \\times 48\\text{ dp}$. Small icon buttons (e.g. $24 \\times 24$) must use \`hitSlop\` to artificially expand their clickable surface without altering visual layout.

Write \`isTouchInside(touchPoint, elementBounds, hitSlop)\` that returns \`true\` if \`touchPoint {x, y}\` falls inside the expanded touch boundary.`,
    examples: [
      {
        input: 'touch={ x: 15, y: 15 }, bounds={ x: 20, y: 20, width: 24, height: 24 }, hitSlop={ top: 10, left: 10, bottom: 10, right: 10 }',
        output: 'true',
        explanation: 'Expanded bounds are [10, 10] to [54, 54]. (15, 15) is inside!'
      }
    ],
    constraints: [
      'hitSlop values default to 0 if not provided',
      'Element coordinates and widths are non-negative'
    ],
    starter_code: {
      javascript: `function isTouchInside(touch, bounds, hitSlop = {}) {
  const top = bounds.y - (hitSlop.top || 0);
  const bottom = bounds.y + bounds.height + (hitSlop.bottom || 0);
  const left = bounds.x - (hitSlop.left || 0);
  const right = bounds.x + bounds.width + (hitSlop.right || 0);

  return touch.x >= left && touch.x <= right && touch.y >= top && touch.y <= bottom;
}`,
      python: `def is_touch_inside(touch, bounds, hit_slop=None):
    if hit_slop is None:
        hit_slop = {}
    top = bounds['y'] - hit_slop.get('top', 0)
    bottom = bounds['y'] + bounds['height'] + hit_slop.get('bottom', 0)
    left = bounds['x'] - hit_slop.get('left', 0)
    right = bounds['x'] + bounds['width'] + hit_slop.get('right', 0)
    return left <= touch['x'] <= right and top <= touch['y'] <= bottom`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Expand boundary rect outward by subtracting top/left and adding bottom/right.',
      level2Stronger: 'Check if touch.x is within [left, right] and touch.y is within [top, bottom].',
      level3Approach: 'Expanded: minX = x - slop.left, maxX = x + width + slop.right.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'touch at 15,15 with slop=10 on 20,20 target', expectedOutput: 'true', isHidden: false },
      { testCaseId: 'tc-2', input: 'touch outside expanded boundary at 5,5', expectedOutput: 'false', isHidden: false },
      { testCaseId: 'tc-3', input: 'touch precisely on border edge', expectedOutput: 'true', isHidden: true }
    ],
    acceptance_rate: '88%'
  },
  {
    slug: 'infinite-scroll-window-recycler',
    title: 'Virtualized List Window Recycler & Memory Buffer',
    difficulty: 'Medium',
    category: 'Mobile App Development',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Virtualized Mobile List Window Recycler
Rendering 10,000 DOM nodes on mobile causes memory crashes. Virtualized lists only render items currently visible in the viewport plus an overscan buffer.

Given \`scrollTop\`, \`viewportHeight\`, \`itemHeight\`, and \`totalItems\`, implement \`computeVirtualWindow(scrollTop, viewportHeight, itemHeight, totalItems, overscan=2)\` returning:
\`{ startIndex, endIndex, offsetY, totalHeight }\``,
    examples: [
      {
        input: 'scrollTop=500, viewportHeight=800, itemHeight=50, totalItems=1000, overscan=2',
        output: '{ startIndex: 8, endIndex: 28, offsetY: 400, totalHeight: 50000 }',
        explanation: 'Visible items: 500/50 = 10 to (500+800)/50 = 26. With overscan 2: index 8 to 28.'
      }
    ],
    constraints: [
      'startIndex >= 0',
      'endIndex <= totalItems - 1',
      'offsetY = startIndex * itemHeight'
    ],
    starter_code: {
      javascript: `function computeVirtualWindow(scrollTop, viewportHeight, itemHeight, totalItems, overscan = 2) {
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.floor((scrollTop + viewportHeight) / itemHeight);

  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(totalItems - 1, visibleEnd + overscan);
  const offsetY = startIndex * itemHeight;
  const totalHeight = totalItems * itemHeight;

  return { startIndex, endIndex, offsetY, totalHeight };
}`,
      python: `import math

def compute_virtual_window(scroll_top, viewport_height, item_height, total_items, overscan=2):
    visible_start = math.floor(scroll_top / item_height)
    visible_end = math.floor((scroll_top + viewport_height) / item_height)
    start_index = max(0, visible_start - overscan)
    end_index = min(total_items - 1, visible_end + overscan)
    return {
        'startIndex': start_index,
        'endIndex': end_index,
        'offsetY': start_index * item_height,
        'totalHeight': total_items * item_height
    }`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Divide scrollTop by itemHeight to find the first visible index.',
      level2Stronger: 'Apply overscan before clamp to 0 and totalItems - 1.',
      level3Approach: 'offsetY = startIndex * itemHeight preserves correct scroll container spacer height.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'scrollTop=0, viewport=300, itemHeight=50, total=100', expectedOutput: 'startIndex === 0, offsetY === 0', isHidden: false },
      { testCaseId: 'tc-2', input: 'scrollTop=500, viewport=800, itemHeight=50, total=1000', expectedOutput: 'startIndex === 8, endIndex === 28', isHidden: false },
      { testCaseId: 'tc-3', input: 'scroll at bottom boundary', expectedOutput: 'endIndex clamped to totalItems - 1', isHidden: true }
    ],
    acceptance_rate: '63%'
  },
  {
    slug: 'fix-the-bug-layout-flicker',
    title: 'Fix the Bug: Cumulative Layout Shift in Dynamic List Rendering',
    difficulty: 'Medium',
    category: 'Mobile App Development',
    is_debugging_challenge: true,
    broken_bug_explanation: 'Mobile list cells are rendered with dynamic auto-height before remote image assets finish decoding. When the images finally load, the cell heights jump from 40px to 220px, triggering jarring layout jumps and breaking touch scroll momentum.',
    description_markdown: `## Fix the Bug: Mobile Layout Shift
When rendering product cards with remote thumbnail images, the layout flickers as images load.

### The Problem:
Cards omit fixed aspect-ratio placeholders, causing cumulative layout shifts (CLS > 0.4).

### Your Task:
Fix \`calculateCardLayout\` to reserve aspect-ratio bounding box dimensions \`{ reservedWidth, reservedHeight }\` upfront so the layout never jumps when the image finishes loading.`,
    examples: [
      {
        input: 'cardWidth=360, aspectRatio="16:9", padding=16',
        output: '{ contentWidth: 328, reservedHeight: 184.5 }',
        explanation: 'contentWidth = 360 - 32 = 328; 328 * (9/16) = 184.5px.'
      }
    ],
    constraints: [
      'Calculations must be deterministic before network images arrive',
      'Supports "16:9", "4:3", and "1:1" aspect ratio formats'
    ],
    starter_code: {
      javascript: `function calculateCardLayout(cardWidth, aspectRatio = '16:9', padding = 16) {
  const contentWidth = cardWidth - (padding * 2);
  const [wRatio, hRatio] = aspectRatio.split(':').map(Number);
  const reservedHeight = +(contentWidth * (hRatio / wRatio)).toFixed(1);
  return { contentWidth, reservedHeight };
}`,
      python: `def calculate_card_layout(card_width, aspect_ratio='16:9', padding=16):
    content_width = card_width - (padding * 2)
    w_ratio, h_ratio = map(float, aspect_ratio.split(':'))
    reserved_height = round(content_width * (h_ratio / w_ratio), 1)
    return {'contentWidth': content_width, 'reservedHeight': reserved_height}`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Subtract total horizontal padding from total cardWidth first.',
      level2Stronger: 'Multiply contentWidth by (hRatio / wRatio) to obtain reserved image height.',
      level3Approach: 'Always reserve the exact dimension space in CSS/Style before image loads.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'cardWidth=360, aspect="16:9", padding=16', expectedOutput: 'contentWidth: 328, reservedHeight: 184.5', isHidden: false },
      { testCaseId: 'tc-2', input: 'cardWidth=200, aspect="1:1", padding=10', expectedOutput: 'contentWidth: 180, reservedHeight: 180.0', isHidden: false },
      { testCaseId: 'tc-3', input: 'zero padding square card', expectedOutput: 'reservedHeight === cardWidth', isHidden: true }
    ],
    acceptance_rate: '79%'
  },

  // ============================================================================
  // TRACK 4: CYBERSECURITY
  // ============================================================================
  {
    slug: 'tcp-control-flag-validator',
    title: 'TCP Control Flag Bitmask Validator',
    difficulty: 'Easy',
    category: 'Cybersecurity',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## TCP Packet Control Flag Validator
In network packet inspection and firewall analysis, TCP flags are encoded in an 8-bit mask:
- \`FIN = 0x01\` (bit 0)
- \`SYN = 0x02\` (bit 1)
- \`RST = 0x04\` (bit 2)
- \`PSH = 0x08\` (bit 3)
- \`ACK = 0x10\` (bit 4)
- \`URG = 0x20\` (bit 5)

Implement \`parseTcpFlags(byteVal)\` that extracts an array of active flag strings and flags invalid/malicious combinations (such as **SYN+FIN** or **NULL scan**).`,
    examples: [
      {
        input: '0x12 (18 decimal)',
        output: '{ flags: ["SYN", "ACK"], isScan: false }',
        explanation: '0x10 (ACK) + 0x02 (SYN) = 0x12. Normal handshake response.'
      },
      {
        input: '0x03 (3 decimal)',
        output: '{ flags: ["FIN", "SYN"], isScan: true }',
        explanation: 'SYN+FIN is an RFC 793 violation commonly used in port scanning.'
      }
    ],
    constraints: [
      '0 <= byteVal <= 255',
      'Must identify NULL (0x00), XMAS (FIN+PSH+URG), and SYN+FIN scans'
    ],
    starter_code: {
      javascript: `function parseTcpFlags(byteVal) {
  const flags = [];
  if (byteVal & 0x01) flags.push('FIN');
  if (byteVal & 0x02) flags.push('SYN');
  if (byteVal & 0x04) flags.push('RST');
  if (byteVal & 0x08) flags.push('PSH');
  if (byteVal & 0x10) flags.push('ACK');
  if (byteVal & 0x20) flags.push('URG');

  const hasSyn = (byteVal & 0x02) !== 0;
  const hasFin = (byteVal & 0x01) !== 0;
  const isNullScan = byteVal === 0;
  const isXmasScan = (byteVal & 0x29) === 0x29; // FIN + PSH + URG
  const isSynFin = hasSyn && hasFin;

  return {
    flags,
    isScan: isNullScan || isXmasScan || isSynFin
  };
}`,
      python: `def parse_tcp_flags(byte_val):
    flag_defs = [('FIN', 0x01), ('SYN', 0x02), ('RST', 0x04), ('PSH', 0x08), ('ACK', 0x10), ('URG', 0x20)]
    active = [name for name, mask in flag_defs if byte_val & mask]
    is_null = (byte_val == 0)
    is_xmas = (byte_val & 0x29) == 0x29
    is_syn_fin = (byte_val & 0x03) == 0x03
    return {'flags': active, 'isScan': is_null or is_xmas or is_syn_fin}`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Use bitwise AND (&) with flag masks to test if each specific bit is set.',
      level2Stronger: 'SYN+FIN is illegal because a connection cannot simultaneously initiate and terminate.',
      level3Approach: 'Flag XMAS scan when FIN (0x01), PSH (0x08), and URG (0x20) are simultaneously active.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: '0x12', expectedOutput: 'flags: ["SYN", "ACK"], isScan: false', isHidden: false },
      { testCaseId: 'tc-2', input: '0x03', expectedOutput: 'flags: ["FIN", "SYN"], isScan: true', isHidden: false },
      { testCaseId: 'tc-3', input: '0x00 (NULL scan)', expectedOutput: 'flags: [], isScan: true', isHidden: true }
    ],
    acceptance_rate: '87%'
  },
  {
    slug: 'base64url-jwt-decoder',
    title: 'RFC 7519 Base64URL JWT Header & Payload Parser',
    difficulty: 'Easy',
    category: 'Cybersecurity',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Base64URL JWT Parser
JSON Web Tokens (RFC 7519) encode header and payload segments using Base64URL formatting where \`+\` is replaced with \`-\`, \`/\` is replaced with \`_\`, and trailing \`=\` padding is omitted.

Implement \`parseJwtPayload(tokenString)\` that:
1. Validates that the token contains 3 period-separated sections (\`header.payload.signature\`).
2. Restores missing padding characters.
3. Decodes the payload into a parsed JSON object.`,
    examples: [
      {
        input: '"eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMDgiLCJyb2xlIjoiYWRtaW4ifQ.signature"',
        output: '{ userId: "108", role: "admin" }',
        explanation: 'Decodes middle segment into valid parsed object.'
      }
    ],
    constraints: [
      'Input must be a valid 3-part JWT string or throw error',
      'Base64URL padding calculation must be correct'
    ],
    starter_code: {
      javascript: `function parseJwtPayload(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');

  let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const decoded = atob(base64);
  return JSON.parse(decoded);
}`,
      python: `import base64
import json

def parse_jwt_payload(token):
    parts = token.split('.')
    if len(parts) != 3:
        raise ValueError("Invalid JWT format")
    payload_b64 = parts[1].replace('-', '+').replace('_', '/')
    payload_b64 += '=' * ((4 - len(payload_b64) % 4) % 4)
    decoded = base64.b64decode(payload_b64).decode('utf-8')
    return json.loads(decoded)`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Split the token by dot (.) to isolate header, payload, and signature.',
      level2Stronger: 'Replace "-" with "+" and "_" with "/". Pad with "=" until length is divisible by 4.',
      level3Approach: 'Decode with base64 decoder and pass to JSON.parse.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: '"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.sig"', expectedOutput: '{"sub":"1234567890"}', isHidden: false },
      { testCaseId: 'tc-2', input: 'invalid format with only 2 segments', expectedOutput: 'throws Invalid JWT format', isHidden: false },
      { testCaseId: 'tc-3', input: 'payload requiring 2 padding characters', expectedOutput: 'correctly padded and decoded', isHidden: true }
    ],
    acceptance_rate: '81%'
  },
  {
    slug: 'rate-limiter-token-bucket',
    title: 'Token Bucket Rate Limiter for API Flood Protection',
    difficulty: 'Medium',
    category: 'Cybersecurity',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Token Bucket Rate Limiter
To defend APIs against brute-force attacks and volumetric DDoS, implement a \`TokenBucketRateLimiter\`:

### Algorithm:
- Bucket starts with \`capacity\` tokens.
- Tokens refill continuously at \`refillRatePerSec\` tokens/second.
- \`allowRequest(tokensRequired=1)\`: Returns \`true\` if enough tokens are available (and consumes them). Returns \`false\` if rate limited.`,
    examples: [
      {
        input: 'capacity=5, refillRate=1.0 -> 5 consecutive requests allowed, 6th rejected',
        output: '[true, true, true, true, true, false]',
        explanation: 'Initial capacity allows burst of 5 requests.'
      }
    ],
    constraints: [
      'Refill calculation must be lazy (calculated on-demand based on elapsed time)',
      'Tokens cannot exceed capacity'
    ],
    starter_code: {
      javascript: `class TokenBucketRateLimiter {
  constructor(capacity = 10, refillRatePerSec = 2) {
    this.capacity = capacity;
    this.refillRate = refillRatePerSec;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  refill() {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillRate);
    this.lastRefill = now;
  }

  allowRequest(tokensRequired = 1) {
    this.refill();
    if (this.tokens >= tokensRequired) {
      this.tokens -= tokensRequired;
      return true;
    }
    return false;
  }
}`,
      python: `import time

class TokenBucketRateLimiter:
    def __init__(self, capacity=10, refill_rate_per_sec=2.0):
        self.capacity = capacity
        self.refill_rate = refill_rate_per_sec
        self.tokens = float(capacity)
        self.last_refill = time.time()

    def refill(self):
        now = time.time()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_refill = now

    def allow_request(self, tokens=1):
        self.refill()
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Do not use a background timer interval; calculate newly accumulated tokens whenever allowRequest() is invoked.',
      level2Stronger: 'tokens = min(capacity, tokens + elapsedSec * refillRate).',
      level3Approach: 'Subtract tokens only when available >= tokensRequired.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'burst of 3 with capacity 3', expectedOutput: '[true, true, true]', isHidden: false },
      { testCaseId: 'tc-2', input: 'immediate 4th request on empty bucket', expectedOutput: 'false', isHidden: false },
      { testCaseId: 'tc-3', input: 'tokens replenish after simulated time delay', expectedOutput: 'true', isHidden: true }
    ],
    acceptance_rate: '65%'
  },
  {
    slug: 'fix-the-bug-idor-access',
    title: 'Fix the Bug: Insecure Direct Object Reference (IDOR) Bypass',
    difficulty: 'Medium',
    category: 'Cybersecurity',
    is_debugging_challenge: true,
    broken_bug_explanation: 'The resource controller verifies that the incoming request has a valid session token, but reads the target resourceId directly from URL parameters without checking if the resource.ownerId matches the authenticated req.user.id. Any user can view or delete another user records simply by changing the ID number.',
    description_markdown: `## Fix the Bug: Insecure Direct Object Reference (IDOR)
In an API endpoint \`GET /api/documents/:documentId\`, users can view other students' private assignments.

### The Bug:
The endpoint checks \`req.user.isAuthenticated\`, but does not enforce ownership or role checks before returning the database entity.

### Your Task:
Inspect \`authorizeDocumentAccess(user, document)\` and ensure access is only granted if:
1. \`document.ownerId === user.id\`, OR
2. \`user.role === 'admin'\`, OR
3. \`document.isPublic === true\`.
Otherwise, throw an unauthorized 403 Forbidden error!`,
    examples: [
      {
        input: 'user={ id: "u1", role: "student" }, document={ id: "d9", ownerId: "u2", isPublic: false }',
        output: 'false (Access Denied / 403)',
        explanation: 'User u1 cannot read private document owned by u2.'
      }
    ],
    constraints: [
      'Admins have universal read access regardless of ownerId',
      'Public documents are accessible by any authenticated user'
    ],
    starter_code: {
      javascript: `function authorizeDocumentAccess(user, document) {
  if (!user || !user.isAuthenticated) {
    throw new Error('401 Unauthorized');
  }

  // BUGGY: Lacks ownership verification!
  // FIX THIS: Check ownerId, admin role, or isPublic flag
  const isOwner = document.ownerId === user.id;
  const isAdmin = user.role === 'admin';
  const isPublic = Boolean(document.isPublic);

  if (isOwner || isAdmin || isPublic) {
    return true;
  }

  throw new Error('403 Forbidden: IDOR violation prevented');
}`,
      python: `def authorize_document_access(user, document):
    if not user or not user.get('isAuthenticated'):
        raise PermissionError("401 Unauthorized")
    is_owner = (document.get('ownerId') == user.get('id'))
    is_admin = (user.get('role') == 'admin')
    is_public = bool(document.get('isPublic'))
    if is_owner or is_admin or is_public:
        return True
    raise PermissionError("403 Forbidden")`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Authentication (who you are) is distinct from Authorization (what you are allowed to access).',
      level2Stronger: 'Compare document.ownerId strictly against the verified token identity user.id.',
      level3Approach: 'if (!(isOwner || isAdmin || isPublic)) throw new Error("403 Forbidden");'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'owner accessing own document', expectedOutput: 'true', isHidden: false },
      { testCaseId: 'tc-2', input: 'stranger accessing private document', expectedOutput: 'throws 403 Forbidden', isHidden: false },
      { testCaseId: 'tc-3', input: 'admin accessing any document', expectedOutput: 'true', isHidden: true }
    ],
    acceptance_rate: '76%'
  },

  // ============================================================================
  // TRACK 5: DATA & ANALYTICS
  // ============================================================================
  {
    slug: 'sql-dense-rank-calculator',
    title: 'SQL Dense Rank Window Function Calculator',
    difficulty: 'Easy',
    category: 'Data & Analytics',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## SQL DENSE_RANK() Calculator
In SQL analytics, \`DENSE_RANK() OVER (ORDER BY score DESC)\` assigns sequential integer ranks to rows without gaps:
- Equal scores receive the exact same rank.
- The next distinct score receives the immediately following consecutive integer (e.g. 1, 2, 2, 3 instead of 1, 2, 2, 4).

Implement \`calculateDenseRank(scores)\` returning an array of objects \`[{ score, denseRank }]\` sorted in descending score order.`,
    examples: [
      {
        input: '[100, 90, 90, 80]',
        output: '[{ score: 100, denseRank: 1 }, { score: 90, denseRank: 2 }, { score: 90, denseRank: 2 }, { score: 80, denseRank: 3 }]',
        explanation: 'Rank does not skip 3 because of the tie at rank 2.'
      }
    ],
    constraints: [
      '0 <= scores.length <= 10^5',
      'Scores can be negative or decimal values'
    ],
    starter_code: {
      javascript: `function calculateDenseRank(scores) {
  const sorted = [...scores].sort((a, b) => b - a);
  let currentRank = 1;
  return sorted.map((score, i) => {
    if (i > 0 && score < sorted[i - 1]) {
      currentRank++;
    }
    return { score, denseRank: currentRank };
  });
}`,
      python: `def calculate_dense_rank(scores):
    sorted_scores = sorted(scores, reverse=True)
    res = []
    current_rank = 1
    for i, s in enumerate(sorted_scores):
        if i > 0 and s < sorted_scores[i - 1]:
            current_rank += 1
        res.append({'score': s, 'denseRank': current_rank})
    return res`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Sort scores descending first.',
      level2Stronger: 'Maintain currentRank = 1. Only increment currentRank when score < previousScore.',
      level3Approach: 'Return sorted.map((score, i) => { if (score !== prev) rank++; return { score, rank }; })'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: '[100, 90, 90, 80]', expectedOutput: 'dense ranks 1, 2, 2, 3', isHidden: false },
      { testCaseId: 'tc-2', input: '[50, 50, 50]', expectedOutput: 'all receive rank 1', isHidden: false },
      { testCaseId: 'tc-3', input: 'empty array', expectedOutput: '[]', isHidden: true }
    ],
    acceptance_rate: '84%'
  },
  {
    slug: 'pivot-sales-matrix',
    title: 'Relational Transactions to Multi-Dimensional Pivot Matrix',
    difficulty: 'Easy',
    category: 'Data & Analytics',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Relational Data Pivot Matrix
Transform an array of relational transaction rows \`[{ date, region, amount }]\` into a pivoted summary table where rows are distinct dates and columns are distinct regions.

### Requirements:
- If a date had no sales for a given region, fill with \`0\`.
- Total amounts for matching \`(date, region)\` pairs must be summed.`,
    examples: [
      {
        input: '[{ date: "2026-03-01", region: "North", amount: 100 }, { date: "2026-03-01", region: "South", amount: 150 }]',
        output: '{"2026-03-01": { "North": 100, "South": 150 }}',
        explanation: 'Pivots normalized records into wide dictionary layout.'
      }
    ],
    constraints: [
      'Amount is a positive number',
      'Dates and regions are non-empty strings'
    ],
    starter_code: {
      javascript: `function pivotTransactions(transactions) {
  const result = {};
  for (const { date, region, amount } of transactions) {
    if (!result[date]) result[date] = {};
    result[date][region] = (result[date][region] || 0) + amount;
  }
  return result;
}`,
      python: `def pivot_transactions(transactions):
    res = {}
    for tx in transactions:
        d, r, a = tx['date'], tx['region'], tx['amount']
        if d not in res:
            res[d] = {}
        res[d][r] = res[d].get(r, 0) + a
    return res`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Group by date as top-level keys and region as nested sub-keys.',
      level2Stronger: 'Accumulate amount into result[date][region].',
      level3Approach: 'result[date][region] = (result[date][region] || 0) + amount;'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'single day across North and South', expectedOutput: 'nested object with summed numbers', isHidden: false },
      { testCaseId: 'tc-2', input: 'multiple transactions on same region', expectedOutput: 'amounts summed correctly', isHidden: false },
      { testCaseId: 'tc-3', input: 'empty transactions', expectedOutput: '{}', isHidden: true }
    ],
    acceptance_rate: '80%'
  },
  {
    slug: 'moving-window-rolling-average',
    title: 'Time-Series Rolling Window Average with Imputation',
    difficulty: 'Medium',
    category: 'Data & Analytics',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Time-Series Rolling Window Average
Implement \`rollingAverage(values, windowSize)\` that computes the moving average over a sliding window of size \`k\`.

### Requirements:
- For the first $k - 1$ entries where fewer than $k$ data points are available, compute the average of all available points up to that index.
- Output values must be rounded to 2 decimal places.
- Must run in $O(n)$ time using a sliding window sum rather than re-summing inside a nested loop.`,
    examples: [
      {
        input: 'values=[10, 20, 30, 40, 50], windowSize=3',
        output: '[10.0, 15.0, 20.0, 30.0, 40.0]',
        explanation: 'Index 0: avg(10)=10; Index 1: avg(10,20)=15; Index 2: avg(10,20,30)=20; Index 3: avg(20,30,40)=30; Index 4: avg(30,40,50)=40.'
      }
    ],
    constraints: [
      '1 <= windowSize <= values.length',
      'Time complexity must be O(n)'
    ],
    starter_code: {
      javascript: `function rollingAverage(values, windowSize) {
  const result = [];
  let windowSum = 0;

  for (let i = 0; i < values.length; i++) {
    windowSum += values[i];
    if (i >= windowSize) {
      windowSum -= values[i - windowSize];
      result.push(+(windowSum / windowSize).toFixed(2));
    } else {
      result.push(+(windowSum / (i + 1)).toFixed(2));
    }
  }
  return result;
}`,
      python: `def rolling_average(values, window_size):
    res = []
    window_sum = 0.0
    for i, val in enumerate(values):
        window_sum += val
        if i >= window_size:
            window_sum -= values[i - window_size]
            res.append(round(window_sum / window_size, 2))
        else:
            res.append(round(window_sum / (i + 1), 2))
    return res`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Add the incoming element and subtract the outgoing element values[i - windowSize].',
      level2Stronger: 'Before i reaches windowSize, divide by (i + 1) to handle initial warmup points.',
      level3Approach: 'Maintain running windowSum; subtract values[i - windowSize] once full window size is reached.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'values=[10, 20, 30, 40, 50], k=3', expectedOutput: '[10.0, 15.0, 20.0, 30.0, 40.0]', isHidden: false },
      { testCaseId: 'tc-2', input: 'windowSize=1', expectedOutput: 'identical to input values', isHidden: false },
      { testCaseId: 'tc-3', input: 'constant values [5, 5, 5, 5]', expectedOutput: '[5.0, 5.0, 5.0, 5.0]', isHidden: true }
    ],
    acceptance_rate: '67%'
  },
  {
    slug: 'fix-the-bug-off-by-one-window',
    title: 'Fix the Bug: Cumulative Window Aggregation Boundary Leak',
    difficulty: 'Medium',
    category: 'Data & Analytics',
    is_debugging_challenge: true,
    broken_bug_explanation: 'In sliding window feature generation, the slice boundary used index + windowSize instead of inclusive horizon index + windowSize - 1, causing tomorrow data point to leak into today training features (data leakage).',
    description_markdown: `## Fix the Bug: Sliding Window Data Leakage
In machine learning time-series feature engineering, calculating moving statistics must never look ahead into future timesteps.

### The Bug:
A bug in \`extractWindowFeatures\` includes $T+1$ in $T$ calculations, causing catastrophic target leakage.

### Your Task:
Inspect \`extractWindowFeatures(series, currentIndex, windowSize)\` and ensure that only past and current values $\\{ i - \\text{windowSize} + 1, \\dots, i \\}$ are included in the statistics window.`,
    examples: [
      {
        input: 'series=[10, 20, 30, 40], currentIndex=2, windowSize=2',
        output: 'window=[20, 30]',
        explanation: 'At index 2 (value 30), a window of size 2 must contain [20, 30] and NEVER include index 3 (40).'
      }
    ],
    constraints: [
      'Must strictly satisfy upper index <= currentIndex',
      'Lower index clamped to 0'
    ],
    starter_code: {
      javascript: `function extractWindowFeatures(series, currentIndex, windowSize) {
  // FIX THIS: Slice must only contain elements up to currentIndex
  const start = Math.max(0, currentIndex - windowSize + 1);
  const end = currentIndex + 1; // Array.prototype.slice is exclusive on end
  return series.slice(start, end);
}`,
      python: `def extract_window_features(series, current_index, window_size):
    start = max(0, current_index - window_size + 1)
    end = current_index + 1
    return series[start:end]`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Array.prototype.slice(start, end) stops before end.',
      level2Stronger: 'To include currentIndex, pass end = currentIndex + 1.',
      level3Approach: 'start = Math.max(0, currentIndex - windowSize + 1); return series.slice(start, currentIndex + 1);'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'series=[10, 20, 30, 40], currentIndex=2, windowSize=2', expectedOutput: '[20, 30]', isHidden: false },
      { testCaseId: 'tc-2', input: 'currentIndex=0 with windowSize=5', expectedOutput: '[10]', isHidden: false },
      { testCaseId: 'tc-3', input: 'full window at final element', expectedOutput: 'no overflow beyond series.length', isHidden: true }
    ],
    acceptance_rate: '78%'
  },

  // ============================================================================
  // UNIVERSAL ALGORITHMIC CLASSICS
  // ============================================================================
  {
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Web Development',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Two Sum
Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      'Only one valid answer exists'
    ],
    starter_code: {
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      cpp: `// C++ unordered_map solution`,
      java: `// Java HashMap solution`
    },
    hints: {
      level1Concept: 'A brute force checks every pair in O(n²). Can you use a hash map for O(n)?',
      level2Stronger: 'For each number x, calculate complement = target - x.',
      level3Approach: 'Store map[nums[i]] = i and check if target - nums[i] was already seen.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: 'nums=[2, 7, 11, 15], target=9', expectedOutput: '[0, 1]', isHidden: false },
      { testCaseId: 'tc-2', input: 'nums=[3, 2, 4], target=6', expectedOutput: '[1, 2]', isHidden: false },
      { testCaseId: 'tc-3', input: 'nums=[3, 3], target=6', expectedOutput: '[0, 1]', isHidden: true }
    ],
    acceptance_rate: '79%'
  },
  {
    slug: 'valid-palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    category: 'Web Development',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Valid Palindrome
A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Alphanumeric characters include letters and numbers. Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
    examples: [
      {
        input: '"A man, a plan, a canal: Panama"',
        output: 'true',
        explanation: '"amanaplanacanalpanama" reads identically backwards.'
      }
    ],
    constraints: [
      '1 <= s.length <= 2 * 10^5',
      's consists only of printable ASCII characters'
    ],
    starter_code: {
      javascript: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0, right = clean.length - 1;
  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++;
    right--;
  }
  return true;
}`,
      python: `def is_palindrome(s: str) -> bool:
    clean = [c.lower() for c in s if c.isalnum()]
    return clean == clean[::-1]`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Filter out non-alphanumeric characters and convert everything to lowercase.',
      level2Stronger: 'Use two pointers from left and right moving towards center.',
      level3Approach: 'Compare clean[left] === clean[right]. If mismatch, return false immediately.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true', isHidden: false },
      { testCaseId: 'tc-2', input: '"race a car"', expectedOutput: 'false', isHidden: false },
      { testCaseId: 'tc-3', input: '" "', expectedOutput: 'true', isHidden: true }
    ],
    acceptance_rate: '88%'
  },
  {
    slug: 'longest-substring-without-repeating',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Web Development',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Longest Substring Without Repeating Characters
Given a string \`s\`, find the length of the longest substring without duplicate characters.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with length 3.'
      }
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces'
    ],
    starter_code: {
      javascript: `function lengthOfLongestSubstring(s) {
  const map = new Map();
  let maxLen = 0;
  let left = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (map.has(char) && map.get(char) >= left) {
      left = map.get(char) + 1;
    }
    map.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
      python: `def length_of_longest_substring(s: str) -> int:
    seen = {}
    max_len = 0
    left = 0
    for right, char in enumerate(s):
        if char in seen and seen[char] >= left:
            left = seen[char] + 1
        seen[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Use sliding window with two pointers left and right.',
      level2Stronger: 'Store last seen index of each character in a map.',
      level3Approach: 'When duplicate encountered at or after left, advance left = lastSeen + 1.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: '"abcabcbb"', expectedOutput: '3', isHidden: false },
      { testCaseId: 'tc-2', input: '"bbbbb"', expectedOutput: '1', isHidden: false },
      { testCaseId: 'tc-3', input: '"pwwkew"', expectedOutput: '3', isHidden: true }
    ],
    acceptance_rate: '55%'
  },
  {
    slug: 'merge-intervals',
    title: 'Merge Overlapping Intervals',
    difficulty: 'Medium',
    category: 'Web Development',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Merge Overlapping Intervals
Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return an array of non-overlapping intervals that cover all intervals in the input.`,
    examples: [
      {
        input: '[[1, 3], [2, 6], [8, 10], [15, 18]]',
        output: '[[1, 6], [8, 10], [15, 18]]',
        explanation: 'Intervals [1, 3] and [2, 6] overlap; merged into [1, 6].'
      }
    ],
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= start_i <= end_i <= 10^4'
    ],
    starter_code: {
      javascript: `function merge(intervals) {
  if (intervals.length <= 1) return intervals;
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const last = merged[merged.length - 1];
    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }
  return merged;
}`,
      python: `def merge(intervals):
    if len(intervals) <= 1:
        return intervals
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for current in intervals[1:]:
        last = merged[-1]
        if current[0] <= last[1]:
            last[1] = max(last[1], current[1])
        else:
            merged.append(current)
    return merged`,
      cpp: `// C++ implementation`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Sort intervals by starting coordinate intervals.sort((a, b) => a[0] - b[0]).',
      level2Stronger: 'Compare current interval start against last merged interval end.',
      level3Approach: 'If current[0] <= last[1], update last[1] = max(last[1], current[1]). Else push current.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: '[[1, 3], [2, 6], [8, 10], [15, 18]]', expectedOutput: '[[1, 6], [8, 10], [15, 18]]', isHidden: false },
      { testCaseId: 'tc-2', input: '[[1, 4], [4, 5]]', expectedOutput: '[[1, 5]]', isHidden: false },
      { testCaseId: 'tc-3', input: '[[1, 4], [2, 3]]', expectedOutput: '[[1, 4]]', isHidden: true }
    ],
    acceptance_rate: '64%'
  },
  {
    slug: 'trapping-rain-water',
    title: 'Trapping Rain Water Elevation Geometry',
    difficulty: 'Hard',
    category: 'Web Development',
    is_debugging_challenge: false,
    broken_bug_explanation: null,
    description_markdown: `## Trapping Rain Water
Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    examples: [
      {
        input: '[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]',
        output: '6',
        explanation: '6 total units of rain water trapped between the elevation walls.'
      }
    ],
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ],
    starter_code: {
      javascript: `function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0;
  let water = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        water += leftMax - height[left];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        water += rightMax - height[right];
      }
      right--;
    }
  }
  return water;
}`,
      python: `def trap(height):
    left, right = 0, len(height) - 1
    left_max, right_max = 0, 0
    water = 0
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1
    return water`,
      cpp: `// C++ two-pointer O(1) space`,
      java: `// Java implementation`
    },
    hints: {
      level1Concept: 'Water trapped at index i is determined by min(max_left, max_right) - height[i].',
      level2Stronger: 'Two pointers from both ends achieve O(1) auxiliary space without storing prefix arrays.',
      level3Approach: 'Advance the pointer on the side with the smaller barrier height.'
    },
    test_cases: [
      { testCaseId: 'tc-1', input: '[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]', expectedOutput: '6', isHidden: false },
      { testCaseId: 'tc-2', input: '[4, 2, 0, 3, 2, 5]', expectedOutput: '9', isHidden: false },
      { testCaseId: 'tc-3', input: '[1, 2, 3, 4]', expectedOutput: '0', isHidden: true }
    ],
    acceptance_rate: '42%'
  },
  {
    "slug": "kmeans-centroid-update",
    "title": "K-Means Centroid Position Update",
    "difficulty": "Medium",
    "category": "AI & Machine Learning",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "Given an array of 2D coordinates `points` and an integer cluster assignment array `assignments` (where `0 <= assignments[i] < k`), compute the new $(x, y)$ centroids for each of the $k$ clusters.\n\n### Requirements:\n- The centroid of a cluster is the arithmetic mean of all points assigned to that cluster: $\\left(\\frac{\\sum x_i}{N}, \\frac{\\sum y_i}{N}\\right)$.\n- If a cluster has 0 points assigned to it, keep its centroid at `[0.0, 0.0]`.\n- Return an array of $k$ centroids `[[x0, y0], [x1, y1], ...]` with each coordinate rounded to 2 decimal places.",
    "examples": [
      {
        "input": "points = [[1, 2], [3, 4], [5, 6], [7, 8]], assignments = [0, 0, 1, 1], k = 2",
        "output": "[[2.0, 3.0], [6.0, 7.0]]",
        "explanation": "Cluster 0 centroid is ((1+3)/2, (2+4)/2) = [2.0, 3.0]. Cluster 1 centroid is ((5+7)/2, (6+8)/2) = [6.0, 7.0]."
      }
    ],
    "constraints": [
      "1 <= points.length <= 1,000",
      "assignments.length === points.length",
      "1 <= k <= 50"
    ],
    "starter_code": {
      "javascript": "function updateCentroids(points, assignments, k) {\n  const sums = Array.from({ length: k }, () => [0, 0]);\n  const counts = Array(k).fill(0);\n  for (let i = 0; i < points.length; i++) {\n    const c = assignments[i];\n    sums[c][0] += points[i][0];\n    sums[c][1] += points[i][1];\n    counts[c]++;\n  }\n  return sums.map((sum, c) => {\n    if (counts[c] === 0) return [0.0, 0.0];\n    return [\n      Number((sum[0] / counts[c]).toFixed(2)),\n      Number((sum[1] / counts[c]).toFixed(2))\n    ];\n  });\n}",
      "python": "def update_centroids(points, assignments, k):\n    sums = [[0.0, 0.0] for _ in range(k)]\n    counts = [0] * k\n    for pt, c in zip(points, assignments):\n        sums[c][0] += pt[0]\n        sums[c][1] += pt[1]\n        counts[c] += 1\n    centroids = []\n    for c in range(k):\n        if counts[c] == 0:\n            centroids.append([0.0, 0.0])\n        else:\n            centroids.append([\n                round(sums[c][0] / counts[c], 2),\n                round(sums[c][1] / counts[c], 2)\n            ])\n    return centroids",
      "cpp": "// C++ K-Means Centroid Update",
      "java": "// Java K-Means Centroid Update"
    },
    "hints": {
      "level1Concept": "Sum coordinates for each cluster index separately while counting occurrences.",
      "level2Stronger": "Check for count == 0 to avoid zero division, returning [0.0, 0.0].",
      "level3Approach": "Round each float coordinate to 2 decimal places."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "points = [[1, 2], [3, 4], [5, 6], [7, 8]], assignments = [0, 0, 1, 1], k = 2",
        "expectedOutput": "[[2.0, 3.0], [6.0, 7.0]]",
        "isHidden": false
      },
      {
        "testCaseId": "tc-2",
        "input": "points = [[0, 0]], assignments = [0], k = 2",
        "expectedOutput": "[[0.0, 0.0], [0.0, 0.0]]",
        "isHidden": false
      }
    ],
    "acceptance_rate": "64%"
  },
  {
    "slug": "binary-cross-entropy-stable",
    "title": "Numerically Stable Binary Cross-Entropy Loss",
    "difficulty": "Medium",
    "category": "AI & Machine Learning",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "Directly computing binary cross-entropy with $-y \\log(\\sigma(z)) - (1 - y) \\log(1 - \\sigma(z))$ using raw sigmoid probabilities causes floating-point overflow or catastrophic underflow ($\\log(0) = -\\infty$) when logits $|z| > 50$.\n\n### Requirements:\n- Implement `binaryCrossEntropy(y_true, logits)` using the numerically stable log-sum-exp formula per sample:\n$$L_i = \\max(z_i, 0) - z_i \\cdot y_i + \\log(1 + e^{-|z_i|})$$\n- Return the mean loss across all samples rounded to 4 decimal places.",
    "examples": [
      {
        "input": "y_true = [1, 0, 1], logits = [2.5, -3.0, 0.0]",
        "output": "0.2307",
        "explanation": "Calculates stable BCE on extreme logits without overflow."
      }
    ],
    "constraints": [
      "1 <= y_true.length <= 10,000",
      "y_true[i] in {0, 1}",
      "logits.length === y_true.length"
    ],
    "starter_code": {
      "javascript": "function binaryCrossEntropy(y_true, logits) {\n  let total = 0;\n  for (let i = 0; i < y_true.length; i++) {\n    const z = logits[i];\n    const y = y_true[i];\n    const maxZ = Math.max(z, 0);\n    const loss = maxZ - z * y + Math.log(1 + Math.exp(-Math.abs(z)));\n    total += loss;\n  }\n  return Number((total / y_true.length).toFixed(4));\n}",
      "python": "import math\n\ndef binary_cross_entropy(y_true, logits):\n    total = 0.0\n    for y, z in zip(y_true, logits):\n        max_z = max(z, 0.0)\n        loss = max_z - z * y + math.log(1.0 + math.exp(-abs(z)))\n        total += loss\n    return round(total / len(y_true), 4)",
      "cpp": "// C++ Numerically Stable BCE",
      "java": "// Java Numerically Stable BCE"
    },
    "hints": {
      "level1Concept": "Rewrite BCE in terms of logits z instead of computing sigma(z) first.",
      "level2Stronger": "Use max(z, 0) - z*y + log(1 + exp(-abs(z))) to prevent exp() from overflowing on large positive or negative logits."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "y_true = [1, 0, 1], logits = [2.5, -3.0, 0.0]",
        "expectedOutput": "0.2307",
        "isHidden": false
      },
      {
        "testCaseId": "tc-2",
        "input": "y_true = [1, 0], logits = [100.0, -100.0]",
        "expectedOutput": "0.0",
        "isHidden": false
      }
    ],
    "acceptance_rate": "58%"
  },
  {
    "slug": "multi-head-scaled-dot-product",
    "title": "Scaled Dot-Product Transformer Attention",
    "difficulty": "Hard",
    "category": "AI & Machine Learning",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "Implement the core scaled dot-product attention mechanism used in modern LLMs (Vaswani et al.):\n$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V$$\n\n### Requirements:\n- Given query matrix $Q$ ($N \\times d_k$), key matrix $K$ ($M \\times d_k$), and value matrix $V$ ($M \\times d_v$).\n- Compute score matrix $S = \\frac{Q K^T}{\\sqrt{d_k}}$.\n- Apply numerically stable softmax along the row axis of $S$.\n- Multiply the resulting attention weights by $V$.\n- Return the resulting matrix rounded to 4 decimal places.",
    "examples": [
      {
        "input": "Q = [[1, 0], [0, 1]], K = [[1, 0], [0, 1]], V = [[1, 2], [3, 4]]",
        "output": "[[1.5379, 2.5379], [2.4621, 3.4621]]",
        "explanation": "Calculates scaled dot-product attention matrix with dk=2."
      }
    ],
    "constraints": [
      "1 <= N, M <= 100",
      "1 <= d_k, d_v <= 64"
    ],
    "starter_code": {
      "javascript": "function scaledDotProductAttention(Q, K, V) {\n  const N = Q.length;\n  const dk = Q[0].length;\n  const M = K.length;\n  const dv = V[0].length;\n  const scale = Math.sqrt(dk);\n  const output = [];\n  for (let i = 0; i < N; i++) {\n    const scores = [];\n    let maxScore = -Infinity;\n    for (let j = 0; j < M; j++) {\n      let dot = 0;\n      for (let k = 0; k < dk; k++) dot += Q[i][k] * K[j][k];\n      const s = dot / scale;\n      scores.push(s);\n      if (s > maxScore) maxScore = s;\n    }\n    const expScores = scores.map(s => Math.exp(s - maxScore));\n    const sumExp = expScores.reduce((a, b) => a + b, 0);\n    const weights = expScores.map(e => e / sumExp);\n    const row = [];\n    for (let c = 0; c < dv; c++) {\n      let val = 0;\n      for (let j = 0; j < M; j++) val += weights[j] * V[j][c];\n      row.push(Number(val.toFixed(4)));\n    }\n    output.push(row);\n  }\n  return output;\n}",
      "python": "import math\n\ndef scaled_dot_product_attention(Q, K, V):\n    N = len(Q)\n    dk = len(Q[0])\n    M = len(K)\n    dv = len(V[0])\n    scale = math.sqrt(dk)\n    output = []\n    for i in range(N):\n        scores = []\n        for j in range(M):\n            dot = sum(Q[i][k] * K[j][k] for k in range(dk))\n            scores.append(dot / scale)\n        max_s = max(scores)\n        exp_s = [math.exp(s - max_s) for s in scores]\n        sum_exp = sum(exp_s)\n        weights = [e / sum_exp for e in exp_s]\n        row = []\n        for c in range(dv):\n            val = sum(weights[j] * V[j][c] for j in range(M))\n            row.append(round(val, 4))\n        output.append(row)\n    return output",
      "cpp": "// C++ Scaled Dot Product Attention",
      "java": "// Java Scaled Dot Product Attention"
    },
    "hints": {
      "level1Concept": "Attention takes the dot product of queries and keys divided by sqrt(dk).",
      "level2Stronger": "Apply softmax on each row of the attention score matrix by subtracting the row maximum before exponentiating.",
      "level3Approach": "Multiply normalized attention weights by values V to get the final context vectors."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "Q = [[1, 0], [0, 1]], K = [[1, 0], [0, 1]], V = [[1, 2], [3, 4]]",
        "expectedOutput": "[[1.5379, 2.5379], [2.4621, 3.4621]]",
        "isHidden": false
      }
    ],
    "acceptance_rate": "45%"
  },
  {
    "slug": "tfidf-vectorizer",
    "title": "TF-IDF Vocabulary Importance Vectorizer",
    "difficulty": "Medium",
    "category": "AI & Machine Learning",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "Given an array of document strings `documents` and a target query word `term`, calculate the TF-IDF weight for `term` in each document.\n\n### Formula:\n$$\\text{TF}(t, d) = \\frac{\\text{count}(t, d)}{\\text{total words in } d}$$\n$$\\text{IDF}(t) = \\log\\left(\\frac{N}{\\text{DF}(t)}\\right)$$\n$$\\text{TF-IDF}(t, d) = \\text{TF}(t, d) \\times \\text{IDF}(t)$$\nwhere $N$ is total documents and $\\text{DF}(t)$ is number of documents containing term $t$. Use natural logarithm ($\\ln$). Return an array of scores rounded to 4 decimal places. If term appears in 0 documents, return all `0.0`.",
    "examples": [
      {
        "input": "documents = [\"deep learning neural network\", \"deep reinforcement learning\", \"computer vision deep\"], term = \"learning\"",
        "output": "[0.1014, 0.1352, 0.0]",
        "explanation": "Calculates TF-IDF score for each document."
      }
    ],
    "constraints": [
      "1 <= documents.length <= 1,000",
      "Words are lowercase alphanumeric separated by single spaces"
    ],
    "starter_code": {
      "javascript": "function computeTfIdf(documents, term) {\n  const N = documents.length;\n  const docWords = documents.map(doc => doc.toLowerCase().split(/\\s+/).filter(Boolean));\n  let docCountWithTerm = 0;\n  for (const words of docWords) {\n    if (words.includes(term.toLowerCase())) docCountWithTerm++;\n  }\n  if (docCountWithTerm === 0) return Array(N).fill(0.0);\n  const idf = Math.log(N / docCountWithTerm);\n  return docWords.map(words => {\n    if (words.length === 0) return 0.0;\n    const termCount = words.filter(w => w === term.toLowerCase()).length;\n    const tf = termCount / words.length;\n    return Number((tf * idf).toFixed(4));\n  });\n}",
      "python": "import math\n\ndef compute_tf_idf(documents, term):\n    term = term.lower()\n    doc_words = [d.lower().split() for d in documents]\n    N = len(documents)\n    doc_freq = sum(1 for words in doc_words if term in words)\n    if doc_freq == 0:\n        return [0.0] * N\n    idf = math.log(N / doc_freq)\n    scores = []\n    for words in doc_words:\n        if not words:\n            scores.append(0.0)\n            continue\n        tf = words.count(term) / len(words)\n        scores.append(round(tf * idf, 4))\n    return scores",
      "cpp": "// C++ TF-IDF",
      "java": "// Java TF-IDF"
    },
    "hints": {
      "level1Concept": "TF is term frequency divided by total document word length. IDF is log(total documents / doc frequency).",
      "level2Stronger": "Compute IDF once across the entire corpus, then multiply by each document's local TF."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "documents = [\"deep learning neural network\", \"deep reinforcement learning\", \"computer vision deep\"], term = \"learning\"",
        "expectedOutput": "[0.1014, 0.1352, 0.0]",
        "isHidden": false
      }
    ],
    "acceptance_rate": "61%"
  },
  {
    "slug": "fix-the-bug-val-leakage",
    "title": "Fix the Bug: Data Leakage in Feature Scaling",
    "difficulty": "Medium",
    "category": "AI & Machine Learning",
    "is_debugging_challenge": true,
    "broken_bug_explanation": "The scaling function fits mean and standard deviation over train and test sets combined before splitting, causing catastrophic benchmark test leakage.",
    "description_markdown": "In machine learning evaluation, test and validation data must NEVER influence feature scaling statistics.\n\n### The Bug:\nThe preprocessing function `fitAndScaleData(trainSet, testSet)` calculates mean $\\mu$ and standard deviation $\\sigma$ over the merged pool `[...trainSet, ...testSet]`.\n\n### Your Task:\nFix `fitAndScaleData` so that $\\mu$ and $\\sigma$ are computed STRICTLY using `trainSet` alone, then used to standardize both `trainSet` and `testSet`: $x_{\\text{scaled}} = \\frac{x - \\mu_{\\text{train}}}{\\sigma_{\\text{train}}}$. If $\\sigma_{\\text{train}} = 0$, set scaled values to `0.0`. Round all scaled values to 2 decimal places.",
    "examples": [
      {
        "input": "trainSet = [10, 20, 30], testSet = [40, 50]",
        "output": "{\"trainScaled\":[-1.22,0,1.22],\"testScaled\":[2.45,3.67]}",
        "explanation": "Calculates mean=20 and std=8.16 solely on trainSet."
      }
    ],
    "constraints": [
      "1 <= trainSet.length <= 5,000",
      "1 <= testSet.length <= 5,000"
    ],
    "starter_code": {
      "javascript": "function fitAndScaleData(trainSet, testSet) {\n  // BUG: Leaking testSet into mean/std calculation!\n  const allData = [...trainSet, ...testSet];\n  const mean = allData.reduce((a, b) => a + b, 0) / allData.length;\n  const variance = allData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / allData.length;\n  const std = Math.sqrt(variance) || 1;\n  return {\n    trainScaled: trainSet.map(x => Number(((x - mean) / std).toFixed(2))),\n    testScaled: testSet.map(x => Number(((x - mean) / std).toFixed(2)))\n  };\n}",
      "python": "import math\n\ndef fit_and_scale_data(train_set, test_set):\n    mean = sum(train_set) / len(train_set)\n    var = sum((x - mean) ** 2 for x in train_set) / len(train_set)\n    std = math.sqrt(var)\n    if std == 0:\n        return {\n            \"trainScaled\": [0.0] * len(train_set),\n            \"testScaled\": [0.0] * len(test_set)\n        }\n    return {\n        \"trainScaled\": [round((x - mean) / std, 2) for x in train_set],\n        \"testScaled\": [round((x - mean) / std, 2) for x in test_set]\n    }",
      "cpp": "// C++ Feature Scaling Leakage Fix",
      "java": "// Java Feature Scaling Leakage Fix"
    },
    "hints": {
      "level1Concept": "Remove the combined pool `[...trainSet, ...testSet]`.",
      "level2Stronger": "Calculate mean and variance strictly on `trainSet`."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "trainSet = [10, 20, 30], testSet = [40, 50]",
        "expectedOutput": "{\"trainScaled\":[-1.22,0,1.22],\"testScaled\":[2.45,3.67]}",
        "isHidden": false
      }
    ],
    "acceptance_rate": "72%"
  },
  {
    "slug": "gesture-inertia-deceleration",
    "title": "Gesture Flick Velocity & Inertial Scroll Projection",
    "difficulty": "Medium",
    "category": "Mobile App Development",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "When a mobile user releases their finger during a drag, the platform physics engine calculates the final rest position based on terminal velocity and friction.\n\n### Formula:\n$$v_0 = \\frac{y_n - y_0}{t_n - t_0} \\quad (\\text{px/ms})$$\n$$y_{\\text{final}} = y_n + \\frac{v_0 \\times 1000}{1 - d}$$\nwhere $d$ is friction factor (default $0.992$).\n\nWrite `computeInertialRest(samples, friction = 0.992)` where `samples = [{ timeMs, y }]` (at least 2 samples). Return projected integer `yFinal` rounded to nearest whole integer.",
    "examples": [
      {
        "input": "samples = [{ timeMs: 0, y: 100 }, { timeMs: 16, y: 132 }], friction = 0.992",
        "output": "250132",
        "explanation": "Calculates release velocity = 2.0 px/ms and projects rest position."
      }
    ],
    "constraints": [
      "2 <= samples.length <= 100",
      "0.900 <= friction <= 0.999"
    ],
    "starter_code": {
      "javascript": "function computeInertialRest(samples, friction = 0.992) {\n  const first = samples[0];\n  const last = samples[samples.length - 1];\n  const dt = last.timeMs - first.timeMs;\n  if (dt <= 0) return last.y;\n  const v0 = (last.y - first.y) / dt;\n  const finalY = last.y + (v0 * 1000) / (1 - friction);\n  return Math.round(finalY);\n}",
      "python": "def compute_inertial_rest(samples, friction=0.992):\n    first = samples[0]\n    last = samples[-1]\n    dt = last['timeMs'] - first['timeMs']\n    if dt <= 0:\n        return last['y']\n    v0 = (last['y'] - first['y']) / dt\n    final_y = last['y'] + (v0 * 1000.0) / (1.0 - friction)\n    return round(final_y)",
      "cpp": "// C++ Inertial Scroll",
      "java": "// Java Inertial Scroll"
    },
    "hints": {
      "level1Concept": "Calculate release velocity using delta y divided by delta time between first and last sample.",
      "level2Stronger": "Project resting distance with v0 * 1000 / (1 - friction) and add to last y position."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "samples = [{ timeMs: 0, y: 100 }, { timeMs: 16, y: 132 }], friction = 0.992",
        "expectedOutput": "250132",
        "isHidden": false
      }
    ],
    "acceptance_rate": "67%"
  },
  {
    "slug": "deep-link-route-matcher",
    "title": "Universal Deep Link URI & Query Param Matcher",
    "difficulty": "Easy",
    "category": "Mobile App Development",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "Mobile apps register custom URI scheme routes like `/store/:category/:productId`.\n\nWrite `matchDeepLink(pattern, urlString)` that parses the URL path and returns:\n- If matched: `{ matched: true, params: { ... }, query: { ... } }`\n- If no match: `{ matched: false }`\n\n### Rules:\n- Supports URI schemes like `myapp://store/electronics/macbook-pro?tab=spec&ref=ad`.\n- Dynamic segment `:param` extracts the string value into `params`.\n- Query parameters after `?` are extracted into key-value `query` object.",
    "examples": [
      {
        "input": "pattern = \"/store/:category/:productId\", urlString = \"myapp://app/store/electronics/macbook?tab=specs\"",
        "output": "{\"matched\":true,\"params\":{\"category\":\"electronics\",\"productId\":\"macbook\"},\"query\":{\"tab\":\"specs\"}}",
        "explanation": "Extracts route parameters category and productId alongside query tab."
      }
    ],
    "constraints": [
      "Pattern starts with /",
      "URL is valid URI string"
    ],
    "starter_code": {
      "javascript": "function matchDeepLink(pattern, urlString) {\n  try {\n    const url = new URL(urlString);\n    const pathParts = url.pathname.replace(/^\\/+/, '').split('/').filter(Boolean);\n    const patternParts = pattern.replace(/^\\/+/, '').split('/').filter(Boolean);\n    if (pathParts.length !== patternParts.length) return { matched: false };\n    const params = {};\n    for (let i = 0; i < patternParts.length; i++) {\n      if (patternParts[i].startsWith(':')) {\n        params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);\n      } else if (patternParts[i] !== pathParts[i]) {\n        return { matched: false };\n      }\n    }\n    const query = {};\n    url.searchParams.forEach((val, key) => { query[key] = val; });\n    return { matched: true, params, query };\n  } catch (e) {\n    return { matched: false };\n  }\n}",
      "python": "from urllib.parse import urlparse, parse_qs\n\ndef match_deep_link(pattern, url_string):\n    try:\n        parsed = urlparse(url_string)\n        path_parts = [p for p in parsed.path.strip('/').split('/') if p]\n        pat_parts = [p for p in pattern.strip('/').split('/') if p]\n        if len(path_parts) != len(pat_parts):\n            return {\"matched\": False}\n        params = {}\n        for pat, val in zip(pat_parts, path_parts):\n            if pat.startswith(':'):\n                params[pat[1:]] = val\n            elif pat != val:\n                return {\"matched\": False}\n        qs = parse_qs(parsed.query)\n        query = {k: v[0] for k, v in qs.items()}\n        return {\"matched\": True, \"params\": params, \"query\": query}\n    except Exception:\n        return {\"matched\": False}",
      "cpp": "// C++ Deep Link Matcher",
      "java": "// Java Deep Link Matcher"
    },
    "hints": {
      "level1Concept": "Split both pattern and pathname by '/' after trimming leading slashes.",
      "level2Stronger": "Check length equality first; segment starting with ':' captures variable into params object."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "pattern = \"/store/:category/:productId\", urlString = \"myapp://app/store/electronics/macbook?tab=specs\"",
        "expectedOutput": "{\"matched\":true,\"params\":{\"category\":\"electronics\",\"productId\":\"macbook\"},\"query\":{\"tab\":\"specs\"}}",
        "isHidden": false
      }
    ],
    "acceptance_rate": "78%"
  },
  {
    "slug": "battery-aware-sync-scheduler",
    "title": "Battery & Network Constrained Background Job Scheduler",
    "difficulty": "Medium",
    "category": "Mobile App Development",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "Mobile operating systems (Android WorkManager & iOS BackgroundTasks) defer background work when battery is low or metered cellular network is active.\n\nWrite `scheduleEligibleJobs(jobs, deviceState)` where:\n- `deviceState = { batteryPct: number, isCharging: boolean, isWifi: boolean }`\n- Each job in `jobs` has: `{ id, minBattery, requiresWifi, requiresCharging, priority }`\n\n### Eligibility Rules:\n1. `deviceState.isCharging` satisfies battery constraint regardless of `batteryPct`. Otherwise, `batteryPct >= job.minBattery`.\n2. If `job.requiresWifi === true`, `deviceState.isWifi` must be `true`.\n3. If `job.requiresCharging === true`, `deviceState.isCharging` must be `true`.\n\nReturn array of eligible job IDs sorted by `priority` descending (highest priority first). If priorities match, maintain original input order.",
    "examples": [
      {
        "input": "jobs = [{ id: 'analytics', minBattery: 15, requiresWifi: false, requiresCharging: false, priority: 1 }, { id: 'backup', minBattery: 50, requiresWifi: true, requiresCharging: true, priority: 10 }], deviceState = { batteryPct: 20, isCharging: false, isWifi: true }",
        "output": "[\"analytics\"]",
        "explanation": "Backup requires charging so it is rejected; analytics meets minBattery 15% and runs."
      }
    ],
    "constraints": [
      "0 <= jobs.length <= 1,000",
      "0 <= batteryPct <= 100"
    ],
    "starter_code": {
      "javascript": "function scheduleEligibleJobs(jobs, deviceState) {\n  const eligible = jobs.filter(job => {\n    if (job.requiresCharging && !deviceState.isCharging) return false;\n    if (job.requiresWifi && !deviceState.isWifi) return false;\n    if (!deviceState.isCharging && deviceState.batteryPct < job.minBattery) return false;\n    return true;\n  });\n  return eligible.sort((a, b) => b.priority - a.priority).map(j => j.id);\n}",
      "python": "def schedule_eligible_jobs(jobs, device_state):\n    eligible = []\n    for job in jobs:\n        if job.get('requiresCharging') and not device_state.get('isCharging'):\n            continue\n        if job.get('requiresWifi') and not device_state.get('isWifi'):\n            continue\n        if not device_state.get('isCharging') and device_state.get('batteryPct', 0) < job.get('minBattery', 0):\n            continue\n        eligible.append(job)\n    eligible.sort(key=lambda j: j.get('priority', 0), reverse=True)\n    return [j['id'] for j in eligible]",
      "cpp": "// C++ Battery Aware Scheduler",
      "java": "// Java Battery Aware Scheduler"
    },
    "hints": {
      "level1Concept": "Filter jobs meeting network, charging, and minimum battery percentage constraints.",
      "level2Stronger": "Sort matching candidates by descending priority."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "jobs = [{ id: 'analytics', minBattery: 15, requiresWifi: false, requiresCharging: false, priority: 1 }], deviceState = { batteryPct: 20, isCharging: false, isWifi: true }",
        "expectedOutput": "[\"analytics\"]",
        "isHidden": false
      }
    ],
    "acceptance_rate": "71%"
  },
  {
    "slug": "fix-the-bug-event-listener-leak",
    "title": "Fix the Bug: Native Event Listener Unsubscribe Leak",
    "difficulty": "Medium",
    "category": "Mobile App Development",
    "is_debugging_challenge": true,
    "broken_bug_explanation": "Native keyboard event listener is registered in useEffect without returning a cleanup function, leaking memory and multiplying callbacks on each screen transition.",
    "description_markdown": "In React Native and mobile hybrid runtimes, subscribing to native event emitters without teardown causes memory leaks.\n\n### The Bug:\nA developer writes a custom keyboard hook:\n```javascript\nfunction useKeyboardHeight(emitter, handler) {\n  // BUG: Listener registered but never removed!\n  const subscription = emitter.addListener('keyboardShow', handler);\n}\n```\n\n### Your Task:\nFix `registerManagedListener(emitter, eventName, handler)` so that it returns a disposable cleanup object `{ dispose: () => void, isDisposed: () => boolean }`. Calling `dispose()` must invoke `subscription.remove()` and mark state as disposed. Calling `dispose()` multiple times must be safe (idempotent).",
    "examples": [
      {
        "input": "subscribe and then dispose",
        "output": "Subscription is cleanly detached and isDisposed() returns true",
        "explanation": "Prevents dangling references on screen unmount."
      }
    ],
    "constraints": [
      "dispose() must be idempotent",
      "Calls subscription.remove() exactly once"
    ],
    "starter_code": {
      "javascript": "function registerManagedListener(emitter, eventName, handler) {\n  const subscription = emitter.addListener(eventName, handler);\n  let disposed = false;\n  return {\n    dispose: () => {\n      if (!disposed) {\n        if (typeof subscription.remove === 'function') subscription.remove();\n        disposed = true;\n      }\n    },\n    isDisposed: () => disposed\n  };\n}",
      "python": "class ManagedListener:\n    def __init__(self, emitter, event_name, handler):\n        self.subscription = emitter.add_listener(event_name, handler)\n        self.disposed = False\n    def dispose(self):\n        if not self.disposed:\n            if hasattr(self.subscription, 'remove'):\n                self.subscription.remove()\n            self.disposed = True\n    def is_disposed(self):\n        return self.disposed",
      "cpp": "// C++ Event Listener Leak Fix",
      "java": "// Java Event Listener Leak Fix"
    },
    "hints": {
      "level1Concept": "Track disposed boolean flag to ensure idempotency.",
      "level2Stronger": "Invoke subscription.remove() when dispose is called."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "register and dispose check",
        "expectedOutput": "true",
        "isHidden": false
      }
    ],
    "acceptance_rate": "83%"
  },
  {
    "slug": "offline-sync-conflict-resolver",
    "title": "Offline Document Mutation Conflict Resolver (Vector Clocks)",
    "difficulty": "Hard",
    "category": "Mobile App Development",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "Mobile apps frequently edit documents offline across multiple devices (phones, tablets, web).\n\nEach record contains:\n`{ docId, data, vectorClock: { [deviceId]: counter }, updatedAtMs }`\n\nWrite `resolveSyncConflict(clientDoc, serverDoc)` to determine the winning state:\n1. **Dominance**: If `clientDoc` vector clock strictly dominates `serverDoc` (every counter $\\ge$ and at least one $>$), return `{ winner: 'client', doc: clientDoc }`.\n2. If `serverDoc` strictly dominates `clientDoc`, return `{ winner: 'server', doc: serverDoc }`.\n3. **Concurrent Conflict**: If neither dominates (concurrent split), resolve using **Last-Write-Wins (LWW)** with `updatedAtMs`. In tie, prefer `server`. Merge vector clocks taking the maximum counter for every device key.",
    "examples": [
      {
        "input": "client: { clock: { A: 2, B: 1 }, updatedAt: 500 }, server: { clock: { A: 1, B: 1 }, updatedAt: 400 }",
        "output": "{\"winner\":\"client\",\"mergedClock\":{\"A\":2,\"B\":1}}",
        "explanation": "Client strictly dominates server clock on device A."
      }
    ],
    "constraints": [
      "Device keys are non-empty strings",
      "Counter integers >= 0"
    ],
    "starter_code": {
      "javascript": "function resolveSyncConflict(clientDoc, serverDoc) {\n  const allDevices = Array.from(new Set([...Object.keys(clientDoc.vectorClock || {}), ...Object.keys(serverDoc.vectorClock || {})]));\n  let clientGreater = false;\n  let serverGreater = false;\n  const mergedClock = {};\n  for (const d of allDevices) {\n    const cVal = (clientDoc.vectorClock && clientDoc.vectorClock[d]) || 0;\n    const sVal = (serverDoc.vectorClock && serverDoc.vectorClock[d]) || 0;\n    if (cVal > sVal) clientGreater = true;\n    if (sVal > cVal) serverGreater = true;\n    mergedClock[d] = Math.max(cVal, sVal);\n  }\n  if (clientGreater && !serverGreater) {\n    return { winner: 'client', doc: { ...clientDoc, vectorClock: mergedClock } };\n  }\n  if (serverGreater && !clientGreater) {\n    return { winner: 'server', doc: { ...serverDoc, vectorClock: mergedClock } };\n  }\n  const winner = clientDoc.updatedAtMs > serverDoc.updatedAtMs ? 'client' : 'server';\n  const baseDoc = winner === 'client' ? clientDoc : serverDoc;\n  return { winner, doc: { ...baseDoc, vectorClock: mergedClock } };\n}",
      "python": "def resolve_sync_conflict(client_doc, server_doc):\n    c_clock = client_doc.get('vectorClock', {})\n    s_clock = server_doc.get('vectorClock', {})\n    all_devs = set(c_clock.keys()) | set(s_clock.keys())\n    c_greater = False\n    s_greater = False\n    merged_clock = {}\n    for d in all_devs:\n        c_val = c_clock.get(d, 0)\n        s_val = s_clock.get(d, 0)\n        if c_val > s_val: c_greater = True\n        if s_val > c_val: s_greater = True\n        merged_clock[d] = max(c_val, s_val)\n    if c_greater and not s_greater:\n        doc = dict(client_doc); doc['vectorClock'] = merged_clock\n        return {'winner': 'client', 'doc': doc}\n    if s_greater and not c_greater:\n        doc = dict(server_doc); doc['vectorClock'] = merged_clock\n        return {'winner': 'server', 'doc': doc}\n    winner = 'client' if client_doc.get('updatedAtMs', 0) > server_doc.get('updatedAtMs', 0) else 'server'\n    base = dict(client_doc if winner == 'client' else server_doc)\n    base['vectorClock'] = merged_clock\n    return {'winner': winner, 'doc': base}",
      "cpp": "// C++ Vector Clock Resolver",
      "java": "// Java Vector Clock Resolver"
    },
    "hints": {
      "level1Concept": "Vector clocks determine causality without global wall clocks.",
      "level2Stronger": "Check if one clock has all keys >= and at least one >. If concurrent, fall back to updatedAtMs."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "client: { clock: { A: 2, B: 1 }, updatedAt: 500 }, server: { clock: { A: 1, B: 1 }, updatedAt: 400 }",
        "expectedOutput": "{\"winner\":\"client\"}",
        "isHidden": false
      }
    ],
    "acceptance_rate": "49%"
  },
  {
    "slug": "constant-time-comparison",
    "title": "Timing Attack Resistant Constant-Time Equality",
    "difficulty": "Easy",
    "category": "Cybersecurity",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "Standard string comparison operators (`a === b`) terminate on the first mismatched character. Attackers measure request response times down to nanoseconds to deduce password hashes or HMAC tokens one character at a time (side-channel timing attack).\n\n### Requirements:\nImplement `timingSafeEqual(strA, strB)` that:\n- Returns `false` if strings have different lengths.\n- If lengths match, iterates through all character codes using bitwise XOR (`^`) and accumulates differences with bitwise OR (`|`).\n- Executes in $O(N)$ constant time regardless of where mismatches occur.\n- Returns `true` if and only if accumulated diff is `0`.",
    "examples": [
      {
        "input": "strA = \"secret_token_108\", strB = \"secret_token_108\"",
        "output": "true",
        "explanation": "Accumulated XOR difference across all characters equals 0."
      },
      {
        "input": "strA = \"admin\", strB = \"adm1n\"",
        "output": "false",
        "explanation": "Character mismatch at index 3 yields non-zero accumulator."
      }
    ],
    "constraints": [
      "0 <= strA.length, strB.length <= 100,000",
      "Zero early-exit short-circuiting on character mismatch"
    ],
    "starter_code": {
      "javascript": "function timingSafeEqual(strA, strB) {\n  if (typeof strA !== 'string' || typeof strB !== 'string') return false;\n  if (strA.length !== strB.length) return false;\n  let diff = 0;\n  for (let i = 0; i < strA.length; i++) {\n    diff |= strA.charCodeAt(i) ^ strB.charCodeAt(i);\n  }\n  return diff === 0;\n}",
      "python": "def timing_safe_equal(str_a, str_b):\n    if len(str_a) != len(str_b):\n        return False\n    diff = 0\n    for a, b in zip(str_a, str_b):\n        diff |= ord(a) ^ ord(b)\n    return diff == 0",
      "cpp": "// C++ Constant Time Equality",
      "java": "// Java Constant Time Equality"
    },
    "hints": {
      "level1Concept": "Avoid early return in loop when a character doesn't match.",
      "level2Stronger": "Use bitwise XOR (^) to find diffs and bitwise OR (|) to accumulate them."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "strA = \"secret_token_108\", strB = \"secret_token_108\"",
        "expectedOutput": "true",
        "isHidden": false
      },
      {
        "testCaseId": "tc-2",
        "input": "strA = \"admin\", strB = \"adm1n\"",
        "expectedOutput": "false",
        "isHidden": false
      }
    ],
    "acceptance_rate": "85%"
  },
  {
    "slug": "cidr-subnet-calculator",
    "title": "CIDR Subnet Mask & Usable IP Host Range",
    "difficulty": "Medium",
    "category": "Cybersecurity",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "In network security, cloud VPCs, and firewall ingress rules, IP ranges are declared in CIDR notation (e.g. `192.168.1.0/24`).\n\nWrite `parseCidr(cidrString)` returning:\n`{ networkAddress, broadcastAddress, subnetMask, usableHosts }`\n\n### Rules:\n- CIDR prefix $P$ is an integer $0 \\le P \\le 32$.\n- Subnet mask has $P$ leading 1-bits and $32 - P$ trailing 0-bits.\n- Usable hosts is $2^{32 - P} - 2$ (if $P \\ge 31$, usable hosts is 0).\n- Format all addresses in standard dot-decimal notation (`X.X.X.X`).",
    "examples": [
      {
        "input": "\"192.168.1.0/24\"",
        "output": "{\"networkAddress\":\"192.168.1.0\",\"broadcastAddress\":\"192.168.1.255\",\"subnetMask\":\"255.255.255.0\",\"usableHosts\":254}",
        "explanation": "/24 mask provides 254 usable host IP addresses."
      }
    ],
    "constraints": [
      "Valid IPv4 address string",
      "0 <= prefix <= 32"
    ],
    "starter_code": {
      "javascript": "function parseCidr(cidrString) {\n  const [ipStr, prefixStr] = cidrString.split('/');\n  const prefix = parseInt(prefixStr, 10);\n  const octets = ipStr.split('.').map(Number);\n  const ipInt = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];\n  const maskInt = prefix === 0 ? 0 : (~0 << (32 - prefix));\n  const netInt = ipInt & maskInt;\n  const bcastInt = netInt | (~maskInt);\n  const toIp = num => [(num >>> 24) & 255, (num >>> 16) & 255, (num >>> 8) & 255, num & 255].join('.');\n  const usable = prefix >= 31 ? 0 : Math.pow(2, 32 - prefix) - 2;\n  return {\n    networkAddress: toIp(netInt),\n    broadcastAddress: toIp(bcastInt),\n    subnetMask: toIp(maskInt),\n    usableHosts: usable\n  };\n}",
      "python": "def parse_cidr(cidr_string):\n    ip_str, prefix_str = cidr_string.split('/')\n    prefix = int(prefix_str)\n    octets = [int(x) for x in ip_str.split('.')]\n    ip_int = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]\n    mask_int = 0 if prefix == 0 else ((0xFFFFFFFF << (32 - prefix)) & 0xFFFFFFFF)\n    net_int = ip_int & mask_int\n    bcast_int = net_int | (~mask_int & 0xFFFFFFFF)\n    def to_ip(num):\n        return f\"{(num >> 24) & 255}.{(num >> 16) & 255}.{(num >> 8) & 255}.{num & 255}\"\n    usable = 0 if prefix >= 31 else (2 ** (32 - prefix)) - 2\n    return {\n        \"networkAddress\": to_ip(net_int),\n        \"broadcastAddress\": to_ip(bcast_int),\n        \"subnetMask\": to_ip(mask_int),\n        \"usableHosts\": usable\n    }",
      "cpp": "// C++ CIDR Parser",
      "java": "// Java CIDR Parser"
    },
    "hints": {
      "level1Concept": "Convert 4 dot-decimal octets into a 32-bit integer.",
      "level2Stronger": "Bitwise AND with mask yields network address; bitwise OR with inverted mask yields broadcast."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "\"192.168.1.0/24\"",
        "expectedOutput": "{\"networkAddress\":\"192.168.1.0\",\"broadcastAddress\":\"192.168.1.255\",\"subnetMask\":\"255.255.255.0\",\"usableHosts\":254}",
        "isHidden": false
      }
    ],
    "acceptance_rate": "63%"
  },
  {
    "slug": "xss-context-sanitizer",
    "title": "Context-Aware HTML Sanitizer for XSS Prevention",
    "difficulty": "Medium",
    "category": "Cybersecurity",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "Untrusted user input injected into web pages triggers Cross-Site Scripting (XSS) attacks.\n\nWrite `sanitizeInput(rawString)` that:\n1. Replaces dangerous HTML special characters with their standard HTML entity codes:\n   - `&` $\\rightarrow$ `&amp;`\n   - `<` $\\rightarrow$ `&lt;`\n   - `>` $\\rightarrow$ `&gt;`\n   - `\"` $\\rightarrow$ `&quot;`\n   - `'` $\\rightarrow$ `&#x27;`\n   - `/` $\\rightarrow$ `&#x2F;`\n2. Disarms protocol pseudo-schemes in URIs:\n   - Replaces any case-insensitive occurrences of `javascript:` with `blocked:`\n   - Replaces any case-insensitive occurrences of `data:text/html` with `blocked:`",
    "examples": [
      {
        "input": "\"<script>alert('XSS')</script>\"",
        "output": "\"&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;&#x2F;script&gt;\"",
        "explanation": "Escapes all HTML tags and quote characters."
      }
    ],
    "constraints": [
      "0 <= rawString.length <= 50,000",
      "Preserves innocent alphanumeric text"
    ],
    "starter_code": {
      "javascript": "function sanitizeInput(rawString) {\n  if (!rawString) return '';\n  let sanitized = rawString\n    .replace(/&/g, '&amp;')\n    .replace(/</g, '&lt;')\n    .replace(/>/g, '&gt;')\n    .replace(/\"/g, '&quot;')\n    .replace(/'/g, '&#x27;')\n    .replace(/\\//g, '&#x2F;');\n  sanitized = sanitized.replace(/javascript:/gi, 'blocked:');\n  sanitized = sanitized.replace(/data:text\\/html/gi, 'blocked:');\n  return sanitized;\n}",
      "python": "import re\n\ndef sanitize_input(raw_string):\n    if not raw_string:\n        return ''\n    s = raw_string\n    s = s.replace('&', '&amp;')\n    s = s.replace('<', '&lt;')\n    s = s.replace('>', '&gt;')\n    s = s.replace('\"', '&quot;')\n    s = s.replace(\"'\", '&#x27;')\n    s = s.replace('/', '&#x2F;')\n    s = re.sub(r'(?i)javascript:', 'blocked:', s)\n    s = re.sub(r'(?i)data:text/html', 'blocked:', s)\n    return s",
      "cpp": "// C++ HTML Sanitizer",
      "java": "// Java HTML Sanitizer"
    },
    "hints": {
      "level1Concept": "Always escape '&' first to avoid double-escaping downstream entities.",
      "level2Stronger": "Use case-insensitive regex for protocol filters like javascript:."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "\"<script>alert('XSS')</script>\"",
        "expectedOutput": "\"&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;&#x2F;script&gt;\"",
        "isHidden": false
      }
    ],
    "acceptance_rate": "77%"
  },
  {
    "slug": "fix-the-bug-sql-injection",
    "title": "Fix the Bug: SQL Injection in Search Filter",
    "difficulty": "Medium",
    "category": "Cybersecurity",
    "is_debugging_challenge": true,
    "broken_bug_explanation": "User query string is directly concatenated into SQL query string without parametrization, allowing SQL injection authentication and filter bypass.",
    "description_markdown": "A backend search endpoint builds dynamic SQL statements using string interpolation.\n\n### The Bug:\n```javascript\nfunction searchUsers(username, role) {\n  // Vulnerable concatenation!\n  return \"SELECT * FROM users WHERE username = '\" + username + \"' AND role = '\" + role + \"';\";\n}\n```\nPassing `username = \"admin' --\"` bypasses password checks!\n\n### Your Task:\nFix `buildSafeSearchQuery(filters)` where `filters = { username?, role?, minAge? }` so that it returns a parameterized query object:\n`{ text: \"SELECT * FROM users WHERE username = $1 AND role = $2;\", values: [\"admin\", \"student\"] }`\nPlaceholders must be numbered consecutively (`$1`, `$2`, etc.) matching the extracted parameter values in deterministic key order: `['username', 'role', 'minAge']`. If no filters provided, query returns `\"SELECT * FROM users;\"` with empty `values: []`.",
    "examples": [
      {
        "input": "filters = { username: \"alice\", role: \"admin\" }",
        "output": "{\"text\":\"SELECT * FROM users WHERE username = $1 AND role = $2;\",\"values\":[\"alice\",\"admin\"]}",
        "explanation": "Parameterized SQL separates code execution from untrusted parameters."
      }
    ],
    "constraints": [
      "Filters keys: username, role, minAge",
      "Placeholders $1, $2, etc."
    ],
    "starter_code": {
      "javascript": "function buildSafeSearchQuery(filters = {}) {\n  const allowedKeys = ['username', 'role', 'minAge'];\n  const clauses = [];\n  const values = [];\n  for (const key of allowedKeys) {\n    if (filters[key] !== undefined && filters[key] !== null) {\n      values.push(filters[key]);\n      clauses.push(`${key} = $${values.length}`);\n    }\n  }\n  if (clauses.length === 0) {\n    return { text: \"SELECT * FROM users;\", values: [] };\n  }\n  return {\n    text: `SELECT * FROM users WHERE ${clauses.join(' AND ')};`,\n    values\n  };\n}",
      "python": "def build_safe_search_query(filters=None):\n    if not filters:\n        return {\"text\": \"SELECT * FROM users;\", \"values\": []}\n    allowed = ['username', 'role', 'minAge']\n    clauses = []\n    values = []\n    for k in allowed:\n        if k in filters and filters[k] is not None:\n            values.append(filters[k])\n            clauses.append(f\"{k} = ${len(values)}\")\n    if not clauses:\n        return {\"text\": \"SELECT * FROM users;\", \"values\": []}\n    return {\n        \"text\": f\"SELECT * FROM users WHERE {' AND '.join(clauses)};\",\n        \"values\": values\n    }",
      "cpp": "// C++ Safe Query Builder",
      "java": "// Java Safe Query Builder"
    },
    "hints": {
      "level1Concept": "Separate SQL code structure from user parameters.",
      "level2Stronger": "Iterate over allowed keys in deterministic order and assign consecutive placeholders $1, $2."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "filters = { username: \"alice\", role: \"admin\" }",
        "expectedOutput": "{\"text\":\"SELECT * FROM users WHERE username = $1 AND role = $2;\",\"values\":[\"alice\",\"admin\"]}",
        "isHidden": false
      }
    ],
    "acceptance_rate": "80%"
  },
  {
    "slug": "hmac-webhook-replay-defense",
    "title": "HMAC-SHA256 Webhook Replay Attack Defender",
    "difficulty": "Hard",
    "category": "Cybersecurity",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "Payment providers (Stripe, GitHub) send cryptographic webhook payloads signed with HMAC-SHA256. Attackers intercept valid packets and replay them to re-trigger duplicate payments.\n\nWrite `verifyWebhookPayload(payload, signatureHeader, secret, currentTimeMs, maxToleranceSec = 300, seenNonces = new Set())`.\n\nThe header format is: `t=1600000000,v1=hex_hash,nonce=uuid`\n\n### Verification Steps:\n1. Parse timestamp $t$, signature $v_1$, and nonce.\n2. Check timestamp freshness: $|\\text{currentTimeMs} - t \\times 1000| \\le \\text{maxToleranceSec} \\times 1000$. If expired, return `{ valid: false, reason: 'EXPIRED' }`.\n3. Check nonce cache: if `seenNonces` has `nonce`, return `{ valid: false, reason: 'REPLAYED' }`. Otherwise add `nonce` to `seenNonces`.\n4. Verify signature matches expected computed hash of `${t}.${payload}` using the secret key.\nReturn `{ valid: true }` on success.",
    "examples": [
      {
        "input": "fresh valid webhook with matching signature",
        "output": "{\"valid\":true}",
        "explanation": "Signature matches and timestamp is within 300s tolerance."
      }
    ],
    "constraints": [
      "Tolerance: 300 seconds",
      "Seen nonces cached in memory"
    ],
    "starter_code": {
      "javascript": "function verifyWebhookPayload(payload, signatureHeader, secret, currentTimeMs, maxToleranceSec = 300, seenNonces = new Set()) {\n  const parts = signatureHeader.split(',');\n  const parsed = {};\n  for (const part of parts) {\n    const [k, v] = part.split('=');\n    if (k && v) parsed[k.trim()] = v.trim();\n  }\n  if (!parsed.t || !parsed.v1 || !parsed.nonce) {\n    return { valid: false, reason: 'MALFORMED_HEADER' };\n  }\n  const timestampMs = parseInt(parsed.t, 10) * 1000;\n  if (Math.abs(currentTimeMs - timestampMs) > maxToleranceSec * 1000) {\n    return { valid: false, reason: 'EXPIRED' };\n  }\n  if (seenNonces.has(parsed.nonce)) {\n    return { valid: false, reason: 'REPLAYED' };\n  }\n  seenNonces.add(parsed.nonce);\n  return { valid: true };\n}",
      "python": "def verify_webhook_payload(payload, signature_header, secret, current_time_ms, max_tolerance_sec=300, seen_nonces=None):\n    if seen_nonces is None:\n        seen_nonces = set()\n    parsed = {}\n    for part in signature_header.split(','):\n        if '=' in part:\n            k, v = part.split('=', 1)\n            parsed[k.strip()] = v.strip()\n    if 't' not in parsed or 'v1' not in parsed or 'nonce' not in parsed:\n        return {'valid': False, 'reason': 'MALFORMED_HEADER'}\n    ts_ms = int(parsed['t']) * 1000\n    if abs(current_time_ms - ts_ms) > max_tolerance_sec * 1000:\n        return {'valid': False, 'reason': 'EXPIRED'}\n    if parsed['nonce'] in seen_nonces:\n        return {'valid': False, 'reason': 'REPLAYED'}\n    seen_nonces.add(parsed['nonce'])\n    return {'valid': True}",
      "cpp": "// C++ Webhook Replay Defender",
      "java": "// Java Webhook Replay Defender"
    },
    "hints": {
      "level1Concept": "Webhooks combine signed timestamps and nonces to prevent replay attacks.",
      "level2Stronger": "Check freshness before verifying cryptographic signature to reject stale packets early."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "fresh valid header",
        "expectedOutput": "{\"valid\":true}",
        "isHidden": false
      }
    ],
    "acceptance_rate": "52%"
  },
  {
    "slug": "run-length-compression",
    "title": "Run-Length Columnar Encoding & Compression",
    "difficulty": "Easy",
    "category": "Data & Analytics",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "Parquet, ORC, and ClickHouse columnar storage engines compress repeated sequential column values using Run-Length Encoding (RLE).\n\nImplement two functions:\n1. `runLengthEncode(values)`: Given an array of primitives, compresses repeating adjacent values into an array of tuples `[[value, count], ...]`.\n2. `runLengthDecode(encoded)`: Reconstructs the original uncompressed array.",
    "examples": [
      {
        "input": "runLengthEncode([\"A\", \"A\", \"A\", \"B\", \"B\", \"C\", \"A\"])",
        "output": "[[\"A\", 3], [\"B\", 2], [\"C\", 1], [\"A\", 1]]",
        "explanation": "Groups consecutive identical values with their occurrence count."
      }
    ],
    "constraints": [
      "0 <= values.length <= 100,000",
      "Zero lossy transformation (decode(encode(x)) === x)"
    ],
    "starter_code": {
      "javascript": "function runLengthEncode(values) {\n  if (!values || values.length === 0) return [];\n  const result = [];\n  let curr = values[0];\n  let count = 1;\n  for (let i = 1; i < values.length; i++) {\n    if (values[i] === curr) {\n      count++;\n    } else {\n      result.push([curr, count]);\n      curr = values[i];\n      count = 1;\n    }\n  }\n  result.push([curr, count]);\n  return result;\n}\n\nfunction runLengthDecode(encoded) {\n  const result = [];\n  for (const [val, count] of encoded) {\n    for (let i = 0; i < count; i++) result.push(val);\n  }\n  return result;\n}",
      "python": "def run_length_encode(values):\n    if not values:\n        return []\n    res = []\n    curr = values[0]\n    count = 1\n    for v in values[1:]:\n        if v == curr:\n            count += 1\n        else:\n            res.append([curr, count])\n            curr = v\n            count = 1\n    res.append([curr, count])\n    return res\n\ndef run_length_decode(encoded):\n    res = []\n    for val, count in encoded:\n        res.extend([val] * count)\n    return res",
      "cpp": "// C++ Run Length Compression",
      "java": "// Java Run Length Compression"
    },
    "hints": {
      "level1Concept": "Track the current value and count consecutive duplicates until a new value is encountered.",
      "level2Stronger": "Don't forget to push the final accumulated run after the loop completes."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "runLengthEncode([\"A\", \"A\", \"A\", \"B\", \"B\", \"C\", \"A\"])",
        "expectedOutput": "[[\"A\",3],[\"B\",2],[\"C\",1],[\"A\",1]]",
        "isHidden": false
      }
    ],
    "acceptance_rate": "88%"
  },
  {
    "slug": "user-session-segmenter",
    "title": "Sessionization Inactivity Window Segmenter",
    "difficulty": "Medium",
    "category": "Data & Analytics",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "In web analytics and event streaming, raw user clickstream events must be partitioned into sessions based on inactivity windows.\n\nWrite `sessionizeEvents(events, timeoutMs = 1800000)` (default 30 mins):\n- `events = [{ userId: string, timestampMs: number, event: string }]`\n\n### Rules:\n1. Sort events chronologically by `timestampMs`.\n2. Group by `userId`.\n3. If the time gap between a user's current event and their preceding event exceeds `timeoutMs`, a new session begins.\n4. Add `sessionId: \"${userId}_s${sessionIndex}\"` to each event object (where `sessionIndex` starts at 1 for each user).\n5. Return events in original sorted order.",
    "examples": [
      {
        "input": "events = [{ userId: 'u1', timestampMs: 1000 }, { userId: 'u1', timestampMs: 2000 }, { userId: 'u1', timestampMs: 2000000 }]",
        "output": "[{ ..., sessionId: 'u1_s1' }, { ..., sessionId: 'u1_s1' }, { ..., sessionId: 'u1_s2' }]",
        "explanation": "Gap between 2,000 and 2,000,000 exceeds 30m, starting session 2."
      }
    ],
    "constraints": [
      "1 <= events.length <= 10,000",
      "timeoutMs >= 1000"
    ],
    "starter_code": {
      "javascript": "function sessionizeEvents(events, timeoutMs = 1800000) {\n  const sorted = [...events].sort((a, b) => a.timestampMs - b.timestampMs);\n  const userLastTime = new Map();\n  const userSessionIndex = new Map();\n  return sorted.map(ev => {\n    const lastTime = userLastTime.get(ev.userId);\n    let sessionIdx = userSessionIndex.get(ev.userId) || 1;\n    if (lastTime !== undefined && ev.timestampMs - lastTime > timeoutMs) {\n      sessionIdx++;\n    }\n    userLastTime.set(ev.userId, ev.timestampMs);\n    userSessionIndex.set(ev.userId, sessionIdx);\n    return { ...ev, sessionId: `${ev.userId}_s${sessionIdx}` };\n  });\n}",
      "python": "def sessionize_events(events, timeout_ms=1800000):\n    sorted_ev = sorted(events, key=lambda x: x['timestampMs'])\n    user_last = {}\n    user_sess = {}\n    result = []\n    for ev in sorted_ev:\n        uid = ev['userId']\n        last_t = user_last.get(uid)\n        s_idx = user_sess.get(uid, 1)\n        if last_t is not None and ev['timestampMs'] - last_t > timeout_ms:\n            s_idx += 1\n        user_last[uid] = ev['timestampMs']\n        user_sess[uid] = s_idx\n        item = dict(ev)\n        item['sessionId'] = f\"{uid}_s{s_idx}\"\n        result.append(item)\n    return result",
      "cpp": "// C++ Sessionizer",
      "java": "// Java Sessionizer"
    },
    "hints": {
      "level1Concept": "Sort by timestampMs first.",
      "level2Stronger": "Track the last seen timestamp and session counter per userId using a Map."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "events = [{ userId: 'u1', timestampMs: 1000 }, { userId: 'u1', timestampMs: 2000 }]",
        "expectedOutput": "[{\"userId\":\"u1\",\"timestampMs\":1000,\"sessionId\":\"u1_s1\"},{\"userId\":\"u1\",\"timestampMs\":2000,\"sessionId\":\"u1_s1\"}]",
        "isHidden": false
      }
    ],
    "acceptance_rate": "74%"
  },
  {
    "slug": "bloom-filter-membership",
    "title": "Bloom Filter Probabilistic Set Membership",
    "difficulty": "Medium",
    "category": "Data & Analytics",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "A Bloom filter is a space-efficient probabilistic data structure used in databases (Cassandra, Bigtable) to test whether an element is definitely NOT in a set or POSSIBLY in a set.\n\nImplement the `BloomFilter` class:\n- `constructor(sizeBits = 1000)`: Initializes bit array of length `sizeBits` to all 0s.\n- `add(key: string): void`: Hashes key with 3 distinct hash functions ($h_1, h_2, h_3$) and sets those bit positions to 1.\n- `mightContain(key: string): boolean`: Hashes key with the same 3 functions; if any bit is 0, returns `false` (definitely not in set). If all 3 bits are 1, returns `true` (probably in set).\n\n### Hash Functions:\nUse polynomial rolling hashes:\n$$h_i(s) = \\left(\\sum_{j=0}^{L-1} s[j] \\cdot p_i^j\\right) \\pmod{\\text{sizeBits}}$$\nwhere $p_1 = 31, p_2 = 37, p_3 = 41$.",
    "examples": [
      {
        "input": "filter.add('user_108'); filter.mightContain('user_108'); filter.mightContain('random_user')",
        "output": "[true, false]",
        "explanation": "Never produces false negatives for added items."
      }
    ],
    "constraints": [
      "100 <= sizeBits <= 50,000",
      "No false negatives: if added, mightContain must return true"
    ],
    "starter_code": {
      "javascript": "class BloomFilter {\n  constructor(sizeBits = 1000) {\n    this.size = sizeBits;\n    this.bits = new Uint8Array(sizeBits);\n  }\n  _hash(key, p) {\n    let h = 0;\n    for (let i = 0; i < key.length; i++) {\n      h = (h * p + key.charCodeAt(i)) % this.size;\n    }\n    return Math.abs(h);\n  }\n  add(key) {\n    const primes = [31, 37, 41];\n    for (const p of primes) {\n      this.bits[this._hash(key, p)] = 1;\n    }\n  }\n  mightContain(key) {\n    const primes = [31, 37, 41];\n    for (const p of primes) {\n      if (this.bits[this._hash(key, p)] === 0) return false;\n    }\n    return true;\n  }\n}",
      "python": "class BloomFilter:\n    def __init__(self, size_bits=1000):\n        self.size = size_bits\n        self.bits = [0] * size_bits\n    def _hash(self, key, p):\n        h = 0\n        for ch in key:\n            h = (h * p + ord(ch)) % self.size\n        return abs(h)\n    def add(self, key):\n        for p in [31, 37, 41]:\n            self.bits[self._hash(key, p)] = 1\n    def might_contain(self, key):\n        for p in [31, 37, 41]:\n            if self.bits[self._hash(key, p)] == 0:\n                return False\n        return True",
      "cpp": "// C++ Bloom Filter",
      "java": "// Java Bloom Filter"
    },
    "hints": {
      "level1Concept": "If any hash position is 0, the item was definitely never added.",
      "level2Stronger": "Set all k hash positions on add, and check all k positions on mightContain."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "add('alpha'), mightContain('alpha'), mightContain('beta')",
        "expectedOutput": "[true, false]",
        "isHidden": false
      }
    ],
    "acceptance_rate": "69%"
  },
  {
    "slug": "fix-the-bug-cartesian-join",
    "title": "Fix the Bug: Cartesian Fan-Out in Multi-Table Aggregation",
    "difficulty": "Medium",
    "category": "Data & Analytics",
    "is_debugging_challenge": true,
    "broken_bug_explanation": "Joining customer with multiple orders and multiple support tickets causes a Cartesian product that artificially multiplies SUM(orders.amount) by the number of tickets.",
    "description_markdown": "In SQL data warehousing, joining multiple 1-to-many child tables causes a Cartesian fan-out explosion.\n\n### The Bug:\nA reporting script computes total order volume and ticket count:\n```javascript\nfunction calculateMetrics(orders, tickets) {\n  // BUG: Cross-multiplying arrays multiplies amounts!\n  let totalAmount = 0;\n  for (const o of orders) {\n    for (const t of tickets) {\n      totalAmount += o.amount; // Multiplied tickets.length times!\n    }\n  }\n  return { totalAmount, ticketCount: tickets.length };\n}\n```\n\n### Your Task:\nFix `calculateCustomerMetrics(orders, tickets)` to calculate true metrics independently:\n- `totalOrderAmount`: Sum of `order.amount` across unique orders (or `0` if empty).\n- `completedOrdersCount`: Count of orders where `status === 'completed'`.\n- `openTicketsCount`: Count of tickets where `status === 'open'`.\n- Return `{ totalOrderAmount, completedOrdersCount, openTicketsCount }`.",
    "examples": [
      {
        "input": "orders = [{ id: 1, amount: 100, status: 'completed' }, { id: 2, amount: 50, status: 'pending' }], tickets = [{ id: 1, status: 'open' }, { id: 2, status: 'open' }]",
        "output": "{\"totalOrderAmount\":150,\"completedOrdersCount\":1,\"openTicketsCount\":2}",
        "explanation": "Correctly sums 150 without multiplying by 2 tickets."
      }
    ],
    "constraints": [
      "0 <= orders.length <= 10,000",
      "0 <= tickets.length <= 10,000"
    ],
    "starter_code": {
      "javascript": "function calculateCustomerMetrics(orders = [], tickets = []) {\n  let totalOrderAmount = 0;\n  let completedOrdersCount = 0;\n  for (const o of orders) {\n    totalOrderAmount += o.amount || 0;\n    if (o.status === 'completed') completedOrdersCount++;\n  }\n  let openTicketsCount = 0;\n  for (const t of tickets) {\n    if (t.status === 'open') openTicketsCount++;\n  }\n  return { totalOrderAmount, completedOrdersCount, openTicketsCount };\n}",
      "python": "def calculate_customer_metrics(orders=None, tickets=None):\n    orders = orders or []\n    tickets = tickets or []\n    total_amount = sum(o.get('amount', 0) for o in orders)\n    completed_orders = sum(1 for o in orders if o.get('status') == 'completed')\n    open_tickets = sum(1 for t in tickets if t.get('status') == 'open')\n    return {\n        \"totalOrderAmount\": total_amount,\n        \"completedOrdersCount\": completed_orders,\n        \"openTicketsCount\": open_tickets\n    }",
      "cpp": "// C++ Metrics Fix",
      "java": "// Java Metrics Fix"
    },
    "hints": {
      "level1Concept": "Never nest loops over distinct one-to-many child dimensions.",
      "level2Stronger": "Iterate over orders and tickets independently in separate loops."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "orders = [{ id: 1, amount: 100, status: 'completed' }], tickets = [{ id: 1, status: 'open' }, { id: 2, status: 'open' }]",
        "expectedOutput": "{\"totalOrderAmount\":100,\"completedOrdersCount\":1,\"openTicketsCount\":2}",
        "isHidden": false
      }
    ],
    "acceptance_rate": "86%"
  },
  {
    "slug": "reservoir-sampling-stream",
    "title": "Reservoir Sampling from Unbounded Streaming Data",
    "difficulty": "Hard",
    "category": "Data & Analytics",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "Given an unbounded stream of items arriving sequentially where total count $N$ is unknown, select a uniform random sample of size $k$ in $O(k)$ auxiliary space.\n\nImplement `ReservoirSampler` class:\n- `constructor(k: number, rng = Math.random)`: Initializes reservoir of size $k$.\n- `feed(item: any): void`: Processes the next streaming item:\n  - If reservoir has $< k$ items, append item directly.\n  - If reservoir has $k$ items, item index is $i$ (0-indexed). Pick random integer $j$ in $[0, i]$. If $j < k$, replace `reservoir[j]` with `item`.\n- `sample(): any[]`: Returns current sample array of length $\\le k$.",
    "examples": [
      {
        "input": "stream = [1, 2, 3, 4, 5], k = 3",
        "output": "Array of 3 elements sampled with equal probability 3/5",
        "explanation": "Each item has uniform probability k/N of being in final sample."
      }
    ],
    "constraints": [
      "1 <= k <= 1,000",
      "Total stream items up to 1,000,000",
      "O(k) auxiliary memory"
    ],
    "starter_code": {
      "javascript": "class ReservoirSampler {\n  constructor(k, rng = Math.random) {\n    this.k = k;\n    this.rng = rng;\n    this.reservoir = [];\n    this.count = 0;\n  }\n  feed(item) {\n    if (this.reservoir.length < this.k) {\n      this.reservoir.push(item);\n    } else {\n      const j = Math.floor(this.rng() * (this.count + 1));\n      if (j < this.k) {\n        this.reservoir[j] = item;\n      }\n    }\n    this.count++;\n  }\n  sample() {\n    return [...this.reservoir];\n  }\n}",
      "python": "import random\n\nclass ReservoirSampler:\n    def __init__(self, k, rng=None):\n        self.k = k\n        self.rng = rng or random.random\n        self.reservoir = []\n        self.count = 0\n    def feed(self, item):\n        if len(self.reservoir) < self.k:\n            self.reservoir.append(item)\n        else:\n            j = int(self.rng() * (self.count + 1))\n            if j < self.k:\n                self.reservoir[j] = item\n        self.count += 1\n    def sample(self):\n        return list(self.reservoir)",
      "cpp": "// C++ Reservoir Sampling",
      "java": "// Java Reservoir Sampling"
    },
    "hints": {
      "level1Concept": "Fill the first k items immediately.",
      "level2Stronger": "For each subsequent item at index i, replace a random slot in the reservoir with probability k / (i + 1)."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "feed 5 items to k=3",
        "expectedOutput": "sample length is 3",
        "isHidden": false
      }
    ],
    "acceptance_rate": "51%"
  },
  {
    "slug": "promisify-polyfill",
    "title": "Node.js Callback to Promise Polyfill",
    "difficulty": "Easy",
    "category": "Web Development",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "In Node.js asynchronous libraries, legacy functions follow the error-first callback pattern: `fn(...args, (err, result) => void)`.\n\nImplement a polyfill `promisify(originalFn)` that converts any callback-based function into one that returns a standard ES6 `Promise`:\n- If callback is invoked with `err`, reject the promise with `err`.\n- If callback is invoked with `(null, result)`, resolve the promise with `result`.\n- Properly binds `this` context when invoked.",
    "examples": [
      {
        "input": "const readFileAsync = promisify(fs.readFile); await readFileAsync('file.txt');",
        "output": "Promise resolves with file content or rejects with error",
        "explanation": "Adapts callback API to modern async/await."
      }
    ],
    "constraints": [
      "Callback is always the last argument passed to originalFn",
      "Must preserve 'this' execution context"
    ],
    "starter_code": {
      "javascript": "function promisify(originalFn) {\n  return function(...args) {\n    return new Promise((resolve, reject) => {\n      originalFn.call(this, ...args, (err, result) => {\n        if (err) return reject(err);\n        resolve(result);\n      });\n    });\n  };\n}",
      "python": "import inspect\nimport asyncio\n\ndef promisify(fn):\n    # Python equivalent async wrapper\n    async def wrapper(*args, **kwargs):\n        return fn(*args, **kwargs)\n    return wrapper",
      "cpp": "// C++ Promisify",
      "java": "// Java Promisify"
    },
    "hints": {
      "level1Concept": "Return a new function returning a Promise.",
      "level2Stronger": "Append the error-first callback (err, result) to the arguments and pass to originalFn.call(this, ...)."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "promisified successful callback",
        "expectedOutput": "resolved value",
        "isHidden": false
      }
    ],
    "acceptance_rate": "84%"
  },
  {
    "slug": "minimal-query-selector",
    "title": "Virtual DOM Query Selector Engine",
    "difficulty": "Medium",
    "category": "Web Development",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "Implement a lightweight query selector `querySelectorAll(rootNode, selector)` for a virtual DOM tree structure.\n\nEach VNode has:\n`{ tag: string, id?: string, classList: string[], children: VNode[] }`\n\n### Supported Selector Syntaxes:\n1. Tag name: `\"div\"`, `\"button\"`\n2. ID selector: `\"#submit-btn\"`\n3. Class selector: `\".active\"`\n4. Compound selector: `\"button.primary\"` (matches tag button AND class primary)\n\nReturn an array of all matching VNodes in preorder depth-first traversal order. Include rootNode in search if it matches.",
    "examples": [
      {
        "input": "tree = { tag: 'div', classList: ['container'], children: [{ tag: 'button', id: 'save', classList: ['btn', 'primary'] }] }, selector = 'button.primary'",
        "output": "[{ tag: 'button', id: 'save', ... }]",
        "explanation": "Matches button tag having class primary."
      }
    ],
    "constraints": [
      "Selectors do not include child combinators (> or space)",
      "VNode tree depth <= 50"
    ],
    "starter_code": {
      "javascript": "function querySelectorAll(rootNode, selector) {\n  const matches = (node, sel) => {\n    if (!node || !sel) return false;\n    let expectedTag = null;\n    let expectedId = null;\n    const expectedClasses = [];\n    let remainder = sel;\n    if (remainder.includes('#')) {\n      const [before, after] = remainder.split('#');\n      if (before) expectedTag = before;\n      const idAndClasses = after.split('.');\n      expectedId = idAndClasses[0];\n      for (let i = 1; i < idAndClasses.length; i++) expectedClasses.push(idAndClasses[i]);\n    } else if (remainder.includes('.')) {\n      const parts = remainder.split('.');\n      if (parts[0]) expectedTag = parts[0];\n      for (let i = 1; i < parts.length; i++) expectedClasses.push(parts[i]);\n    } else {\n      expectedTag = remainder;\n    }\n    if (expectedTag && node.tag.toLowerCase() !== expectedTag.toLowerCase()) return false;\n    if (expectedId && node.id !== expectedId) return false;\n    const nodeClasses = new Set(node.classList || []);\n    for (const c of expectedClasses) {\n      if (!nodeClasses.has(c)) return false;\n    }\n    return true;\n  };\n  const results = [];\n  const traverse = (node) => {\n    if (!node) return;\n    if (matches(node, selector)) results.push(node);\n    for (const child of (node.children || [])) traverse(child);\n  };\n  traverse(rootNode);\n  return results;\n}",
      "python": "def query_selector_all(root_node, selector):\n    def matches(node, sel):\n        tag, eid, classes = None, None, []\n        if '#' in sel:\n            before, after = sel.split('#', 1)\n            if before: tag = before\n            parts = after.split('.')\n            eid = parts[0]\n            classes.extend(parts[1:])\n        elif '.' in sel:\n            parts = sel.split('.')\n            if parts[0]: tag = parts[0]\n            classes.extend(parts[1:])\n        else:\n            tag = sel\n        if tag and node.get('tag', '').lower() != tag.lower(): return False\n        if eid and node.get('id') != eid: return False\n        node_cls = set(node.get('classList', []))\n        for c in classes:\n            if c not in node_cls: return False\n        return True\n    res = []\n    def traverse(node):\n        if not node: return\n        if matches(node, selector): res.append(node)\n        for child in node.get('children', []): traverse(child)\n    traverse(root_node)\n    return res",
      "cpp": "// C++ Query Selector",
      "java": "// Java Query Selector"
    },
    "hints": {
      "level1Concept": "Parse the selector into tag, id, and class requirements.",
      "level2Stronger": "Perform depth-first preorder traversal on the tree, pushing matching nodes."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "tree with button.primary",
        "expectedOutput": "1 matching node",
        "isHidden": false
      }
    ],
    "acceptance_rate": "66%"
  },
  {
    "slug": "fix-the-bug-stale-closure-hook",
    "title": "Fix the Bug: Stale Closure in React Custom Hook",
    "difficulty": "Medium",
    "category": "Web Development",
    "is_debugging_challenge": true,
    "broken_bug_explanation": "Timer interval closes over initial state value count=0, causing setCount(count + 1) to repeatedly set state to 1 instead of continuing to increment.",
    "description_markdown": "In React hooks, passing a callback to `setInterval` closes over variables from the render in which it was created.\n\n### The Bug:\n```javascript\nfunction useIntervalCounter(step = 1) {\n  let count = 0;\n  // BUG: Handler closes over initial count!\n  const tick = () => {\n    count = count + step;\n  };\n}\n```\nWhen the component re-renders, asynchronous timers referencing lexical variables miss subsequent updates.\n\n### Your Task:\nFix `createSafeIntervalController(onTick, intervalMs)` so that:\n1. It supports dynamic updating of `onTick` callback without resetting the running interval timer.\n2. It returns `{ start: () => void, stop: () => void, isRunning: () => boolean }`.\n3. Calling `start()` begins ticking; calling `stop()` terminates the interval cleanly.",
    "examples": [
      {
        "input": "controller.start(), dynamically change onTick, verify timer doesn't drop",
        "output": "Timer executes latest callback seamlessly without stale closure",
        "explanation": "Uses ref-like mutable wrapper for current callback."
      }
    ],
    "constraints": [
      "Timer must not reset when callback changes",
      "Calling stop() terminates interval"
    ],
    "starter_code": {
      "javascript": "function createSafeIntervalController(initialOnTick, intervalMs) {\n  let currentCallback = initialOnTick;\n  let timerId = null;\n  return {\n    updateCallback: (newTick) => {\n      currentCallback = newTick;\n    },\n    start: () => {\n      if (timerId !== null) return;\n      timerId = setInterval(() => {\n        if (typeof currentCallback === 'function') currentCallback();\n      }, intervalMs);\n    },\n    stop: () => {\n      if (timerId !== null) {\n        clearInterval(timerId);\n        timerId = null;\n      }\n    },\n    isRunning: () => timerId !== null\n  };\n}",
      "python": "class SafeIntervalController:\n    def __init__(self, initial_on_tick, interval_ms):\n        self.callback = initial_on_tick\n        self.running = False\n    def update_callback(self, new_tick):\n        self.callback = new_tick\n    def start(self):\n        self.running = True\n    def stop(self):\n        self.running = False\n    def is_running(self):\n        return self.running",
      "cpp": "// C++ Interval Controller",
      "java": "// Java Interval Controller"
    },
    "hints": {
      "level1Concept": "Store the callback in a mutable reference so the interval closure always calls the latest function.",
      "level2Stronger": "Don't recreate setInterval when the callback updates; just reassign currentCallback."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "controller lifecycle check",
        "expectedOutput": "true",
        "isHidden": false
      }
    ],
    "acceptance_rate": "79%"
  },
  {
    "slug": "cursor-pagination-encoder",
    "title": "Keyset Cursor Pagination Token Encoder & Decoder",
    "difficulty": "Medium",
    "category": "Web Development",
    "is_debugging_challenge": false,
    "broken_bug_explanation": null,
    "description_markdown": "In high-scale database query APIs, SQL `OFFSET 100000` causes table scans. Modern APIs use keyset pagination with opaque Base64URL cursor tokens.\n\nImplement:\n1. `encodeCursor(timestampMs, entityId)`: Combines `${timestampMs}_${entityId}` into an opaque Base64URL string (where `+` $\\rightarrow$ `-`, `/` $\\rightarrow$ `_`, and trailing `=` is removed).\n2. `decodeCursor(cursorString)`: Decodes cursor back into `{ timestampMs: number, entityId: string }`. If malformed or invalid, returns `null`.",
    "examples": [
      {
        "input": "encodeCursor(1700000000000, 'usr_abc123')",
        "output": "\"MTcwMDAwMDAwMDAwMF91c3JfYWJjMTIz\"",
        "explanation": "Encodes compound keyset cursor into URL-safe opaque token."
      }
    ],
    "constraints": [
      "timestampMs is positive integer",
      "entityId is alphanumeric string",
      "Reversible without data loss"
    ],
    "starter_code": {
      "javascript": "function encodeCursor(timestampMs, entityId) {\n  const raw = `${timestampMs}_${entityId}`;\n  const base64 = typeof btoa === 'function' ? btoa(raw) : Buffer.from(raw).toString('base64');\n  return base64.replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');\n}\n\nfunction decodeCursor(cursorString) {\n  if (!cursorString || typeof cursorString !== 'string') return null;\n  try {\n    let base64 = cursorString.replace(/-/g, '+').replace(/_/g, '/');\n    while (base64.length % 4) base64 += '=';\n    const raw = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('utf8');\n    const parts = raw.split('_');\n    if (parts.length < 2) return null;\n    const timestampMs = parseInt(parts[0], 10);\n    const entityId = parts.slice(1).join('_');\n    if (isNaN(timestampMs) || !entityId) return null;\n    return { timestampMs, entityId };\n  } catch (e) {\n    return null;\n  }\n}",
      "python": "import base64\n\ndef encode_cursor(timestamp_ms, entity_id):\n    raw = f\"{timestamp_ms}_{entity_id}\".encode('utf-8')\n    b64 = base64.urlsafe_b64encode(raw).decode('utf-8').rstrip('=')\n    return b64\n\ndef decode_cursor(cursor_string):\n    try:\n        b64 = cursor_string + '=' * ((4 - len(cursor_string) % 4) % 4)\n        raw = base64.urlsafe_b64decode(b64.encode('utf-8')).decode('utf-8')\n        parts = raw.split('_', 1)\n        if len(parts) < 2: return None\n        return {\"timestampMs\": int(parts[0]), \"entityId\": parts[1]}\n    except Exception:\n        return None",
      "cpp": "// C++ Keyset Cursor",
      "java": "// Java Keyset Cursor"
    },
    "hints": {
      "level1Concept": "Combine timestamp and entityId with delimiter '_'.",
      "level2Stronger": "Convert to Base64, replace '+' with '-' and '/' with '_', and strip '=' padding."
    },
    "test_cases": [
      {
        "testCaseId": "tc-1",
        "input": "encodeCursor(1700000000000, 'usr_abc123')",
        "expectedOutput": "\"MTcwMDAwMDAwMDAwMF91c3JfYWJjMTIz\"",
        "isHidden": false
      }
    ],
    "acceptance_rate": "81%"
  }
];

export async function runSeed() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials.');
    return;
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Seeding', ALL_CODING_PROBLEMS.length, 'problems to Supabase...');

  for (const prob of ALL_CODING_PROBLEMS) {
    const { error } = await supabase.from('coding_problems').upsert(prob, { onConflict: 'slug' });
    if (error) {
      console.error('Failed to upsert', prob.slug, error.message);
    } else {
      console.log('✅ Upserted:', prob.slug, `[${prob.category}] - ${prob.difficulty}`);
    }
  }
  console.log('Finished seeding all problems!');
}

export default ALL_CODING_PROBLEMS;
