import { WorkspaceFile, FolderDetail, FileTreeNode } from '../types/pycode';

export interface StarterWorkspaceData {
  total_files: number;
  folders: string[];
  folder_details: FolderDetail[];
  files: WorkspaceFile[];
  file_tree: FileTreeNode[];
}

export const STARTER_PYTHON_WORKSPACE: StarterWorkspaceData = {
  total_files: 16,
  folders: ['DSA', 'visualisations', 'algorithms'],
  folder_details: [
    {
      name: 'DSA',
      files_count: 6,
      open_editor_url: 'https://pycode-student.vercel.app/editor?folder=DSA',
      share_url: 'https://pycode-student.vercel.app/editor?folder=DSA',
    },
    {
      name: 'visualisations',
      files_count: 6,
      open_editor_url: 'https://pycode-student.vercel.app/editor?folder=visualisations',
      share_url: 'https://pycode-student.vercel.app/editor?folder=visualisations',
    },
    {
      name: 'algorithms',
      files_count: 4,
      open_editor_url: 'https://pycode-student.vercel.app/editor?folder=algorithms',
      share_url: 'https://pycode-student.vercel.app/editor?folder=algorithms',
    },
  ],
  files: [
    // --- DSA ---
    {
      name: 'DSA/linkedList.py',
      filename: 'linkedList.py',
      folder: 'DSA',
      code: `"""
Singly Linked List Implementation in Python
Demonstrates Node linking, head insertion, tail insertion, and traversal.
"""

class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def insert_at_first(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node

    def insert_at_last(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        curr = self.head
        while curr.next:
            curr = curr.next
        curr.next = new_node

    def print_list(self):
        nodes = []
        curr = self.head
        while curr:
            nodes.append(str(curr.data))
            curr = curr.next
        print(" -> ".join(nodes) + " -> None")

if __name__ == "__main__":
    ll = LinkedList()
    ll.insert_at_first(20)
    ll.insert_at_first(10)
    ll.insert_at_last(30)
    ll.insert_at_last(40)
    print("Linked List Traversal:")
    ll.print_list()
`,
      last_modified: '2026-10-26T04:46:08.195Z',
      open_editor_url: 'https://pycode-student.vercel.app/editor?file=DSA%2FlinkedList.py',
      share_url: 'https://pycode-student.vercel.app/editor?file=DSA%2FlinkedList.py',
    },
    {
      name: 'DSA/LinkedList-1.py',
      filename: 'LinkedList-1.py',
      folder: 'DSA',
      code: `"""
Doubly Linked List Implementation with Position Insertion & Deletion
"""

class DoublyNode:
    def __init__(self, data):
        self.data = data
        self.prev = None
        self.next = None

class DoublyLinkedList:
    def __init__(self):
        self.head = None

    def insert_at_end(self, data):
        new_node = DoublyNode(data)
        if not self.head:
            self.head = new_node
            return
        curr = self.head
        while curr.next:
            curr = curr.next
        curr.next = new_node
        new_node.prev = curr

    def display_forward(self):
        elements = []
        curr = self.head
        while curr:
            elements.append(str(curr.data))
            curr = curr.next
        print(" <-> ".join(elements) + " <-> None")

if __name__ == "__main__":
    dll = DoublyLinkedList()
    for val in [100, 200, 300, 400]:
        dll.insert_at_end(val)
    dll.display_forward()
`,
      last_modified: '2026-10-26T04:46:02.837Z',
      open_editor_url: 'https://pycode-student.vercel.app/editor?file=DSA%2FLinkedList-1.py',
      share_url: 'https://pycode-student.vercel.app/editor?file=DSA%2FLinkedList-1.py',
    },
    {
      name: 'DSA/BubbleSort.py',
      filename: 'BubbleSort.py',
      folder: 'DSA',
      code: `"""
Optimized Bubble Sort Algorithm with Early Termination Flag
Time Complexity: O(n) Best Case, O(n^2) Worst Case
"""

def bubble_sort(arr):
    n = len(arr)
    comparisons = 0
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            comparisons += 1
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr, comparisons

if __name__ == "__main__":
    sample_array = [64, 34, 25, 12, 22, 11, 90]
    print(f"Original array: {sample_array}")
    sorted_arr, steps = bubble_sort(sample_array.copy())
    print(f"Sorted array:   {sorted_arr}")
    print(f"Total comparisons executed: {steps}")
`,
      last_modified: '2026-09-16T06:46:03.577Z',
      open_editor_url: 'https://pycode-student.vercel.app/editor?file=DSA%2FBubbleSort.py',
      share_url: 'https://pycode-student.vercel.app/editor?file=DSA%2FBubbleSort.py',
    },
    {
      name: 'DSA/BinarySearch.py',
      filename: 'BinarySearch.py',
      folder: 'DSA',
      code: `"""
Binary Search Algorithm (Iterative & Recursive)
Time Complexity: O(log n) | Space Complexity: O(1)
"""

def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

if __name__ == "__main__":
    sorted_data = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
    target = 23
    idx = binary_search(sorted_data, target)
    print(f"Target {target} found at index: {idx}")
`,
      last_modified: '2026-09-15T08:20:00.000Z',
      open_editor_url: 'https://pycode-student.vercel.app/editor?file=DSA%2FBinarySearch.py',
      share_url: 'https://pycode-student.vercel.app/editor?file=DSA%2FBinarySearch.py',
    },
    {
      name: 'DSA/Queue.py',
      filename: 'Queue.py',
      folder: 'DSA',
      code: `"""
FIFO Queue Implementation in Python using List & Deque
"""
from collections import deque

class SimpleQueue:
    def __init__(self):
        self._items = deque()

    def enqueue(self, item):
        self._items.append(item)
        print(f"[Enqueue] -> {item}")

    def dequeue(self):
        if not self._items:
            print("Queue is empty!")
            return None
        item = self._items.popleft()
        print(f"[Dequeue] <- {item}")
        return item

    def peek(self):
        return self._items[0] if self._items else None

    def __repr__(self):
        return f"Queue({list(self._items)})"

if __name__ == "__main__":
    q = SimpleQueue()
    q.enqueue("Task 1: Setup Supabase")
    q.enqueue("Task 2: Build Workspace")
    q.enqueue("Task 3: Run Tests")
    print(q)
    q.dequeue()
    print(f"Front item remaining: {q.peek()}")
`,
      last_modified: '2026-09-14T05:26:14.574Z',
      open_editor_url: 'https://pycode-student.vercel.app/editor?file=DSA%2FQueue.py',
      share_url: 'https://pycode-student.vercel.app/editor?file=DSA%2FQueue.py',
    },
    {
      name: 'DSA/stack.py',
      filename: 'stack.py',
      folder: 'DSA',
      code: `"""
LIFO Stack Implementation in Python with Bracket Balancer
"""

class Stack:
    def __init__(self):
        self._elements = []

    def push(self, item):
        self._elements.append(item)

    def pop(self):
        if not self._elements:
            raise IndexError("pop from empty stack")
        return self._elements.pop()

    def peek(self):
        return self._elements[-1] if self._elements else None

    def is_empty(self):
        return len(self._elements) == 0

def is_balanced(brackets: str) -> bool:
    pairs = {')': '(', '}': '{', ']': '['}
    s = Stack()
    for ch in brackets:
        if ch in pairs.values():
            s.push(ch)
        elif ch in pairs.keys():
            if s.is_empty() or s.pop() != pairs[ch]:
                return False
    return s.is_empty()

if __name__ == "__main__":
    tests = ["{([])}", "({[)]}", "((()))"]
    for test in tests:
        print(f"{test} is balanced: {is_balanced(test)}")
`,
      last_modified: '2026-09-14T04:51:52.748Z',
      open_editor_url: 'https://pycode-student.vercel.app/editor?file=DSA%2Fstack.py',
      share_url: 'https://pycode-student.vercel.app/editor?file=DSA%2Fstack.py',
    },

    // --- VISUALISATIONS ---
    {
      name: 'visualisations/Plotly.py',
      filename: 'Plotly.py',
      folder: 'visualisations',
      code: `"""
Interactive Multivariable Data Visualization using Plotly Express
Analyzes Study Hours vs Exam Score with Attendance and Demographics
"""
import pandas as pd
import plotly.express as px

# Sample dataset
data = {
    "StudyHours": [2.5, 5.1, 3.2, 8.5, 3.5, 6.1, 7.4, 8.3, 2.9, 4.5, 7.8, 9.2],
    "ExamScore": [52, 78, 61, 95, 64, 82, 88, 93, 58, 71, 90, 98],
    "ParentEducation": ["High School", "Bachelor", "Master", "PhD", "Bachelor", "Master", "PhD", "PhD", "High School", "Bachelor", "Master", "PhD"],
    "AttendanceRate": [75, 88, 80, 98, 82, 91, 94, 96, 70, 85, 95, 99],
}

df = pd.DataFrame(data)

fig = px.scatter(
    df,
    x="StudyHours",
    y="ExamScore",
    color="ParentEducation",
    size="AttendanceRate",
    hover_data=["StudyHours", "ExamScore", "AttendanceRate"],
    title="Study Hours vs Exam Score (Colored by Parent Education)",
    template="plotly_dark"
)

fig.update_layout(height=520)
fig.show()
`,
      last_modified: '2026-09-14T04:44:26.412Z',
      open_editor_url: 'https://pycode-student.vercel.app/editor?file=visualisations%2FPlotly.py',
      share_url: 'https://pycode-student.vercel.app/editor?file=visualisations%2FPlotly.py',
    },
    {
      name: 'visualisations/HistPlot.py',
      filename: 'HistPlot.py',
      folder: 'visualisations',
      code: `"""
Distribution & Histogram Plotting with Seaborn and Matplotlib
"""
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

data = {
    "Category": ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Automotive'],
    "Units_Sold": [300, 420, 250, 180, 210, 310, 290, 120],
    "Revenue_USD": [15000, 8500, 12000, 4500, 9500, 6200, 5800, 11000],
    "Profit_USD": [4500, 2100, 3600, 1350, 2850, 2400, 1740, 3300]
}

df = pd.DataFrame(data)
plt.figure(figsize=(8, 5))

sns.histplot(data=df, x="Units_Sold", hue="Category", kde=True)
plt.title("Revenue vs Units Sold by Category")
plt.xlabel("Units Sold")
plt.ylabel("Frequency")
plt.grid(True)
plt.show()
`,
      last_modified: '2026-08-20T08:37:50.262Z',
      open_editor_url: 'https://pycode-student.vercel.app/editor?file=visualisations%2FHistPlot.py',
      share_url: 'https://pycode-student.vercel.app/editor?file=visualisations%2FHistPlot.py',
    },
    {
      name: 'visualisations/BoxPlot.py',
      filename: 'BoxPlot.py',
      folder: 'visualisations',
      code: `"""
Box Plot Analysis for Quartile Distribution & Outliers
"""
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

np.random.seed(42)
days = np.random.choice(["Thur", "Fri", "Sat", "Sun"], size=100)
total_bill = np.random.uniform(10, 50, size=100)

df = pd.DataFrame({"day": days, "total_bill": total_bill})
plt.figure(figsize=(7, 4.5))
sns.boxplot(x="day", y="total_bill", data=df, palette="Set2")
plt.title("Total Bill Distribution by Day")
plt.grid(True, linestyle="--", alpha=0.5)
plt.show()
`,
      last_modified: '2026-08-20T08:37:41.230Z',
      open_editor_url: 'https://pycode-student.vercel.app/editor?file=visualisations%2FBoxPlot.py',
      share_url: 'https://pycode-student.vercel.app/editor?file=visualisations%2FBoxPlot.py',
    },
    {
      name: 'visualisations/LineChart.py',
      filename: 'LineChart.py',
      folder: 'visualisations',
      code: `"""
Monthly Trend Line Chart with Sales Moving Trajectory
"""
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

data_line = {
    "Month": ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    "Sale": [120, 150, 180, 200, 220, 240, 230, 260, 280, 300, 330, 350]
}

df = pd.DataFrame(data_line)
plt.figure(figsize=(10, 5))
sns.lineplot(data=df, x='Month', y='Sale', marker='o', color='#10b981', linewidth=2.5)
plt.title('Monthly Sales Trajectory (2026)')
plt.grid(True, linestyle="--", alpha=0.4)
plt.show()
`,
      last_modified: '2026-08-10T11:02:08.347Z',
      open_editor_url: 'https://pycode-student.vercel.app/editor?file=visualisations%2FLineChart.py',
      share_url: 'https://pycode-student.vercel.app/editor?file=visualisations%2FLineChart.py',
    },
    {
      name: 'visualisations/BarPlot.py',
      filename: 'BarPlot.py',
      folder: 'visualisations',
      code: `"""
Categorical Bar Plot with Revenue Comparison
"""
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

data_bar = {
    "Category": ['Electronics', 'Clothing', 'Home & Kitchen', 'Books'],
    "Revenue_USD": [15000, 8500, 12000, 4500]
}

df = pd.DataFrame(data_bar)
plt.figure(figsize=(7, 4.5))
sns.barplot(x="Category", y="Revenue_USD", data=df, palette="crest")
plt.title("Revenue by Category")
plt.ylabel("Revenue ($)")
plt.show()
`,
      last_modified: '2026-08-10T11:23:10.441Z',
      open_editor_url: 'https://pycode-student.vercel.app/editor?file=visualisations%2FBarPlot.py',
      share_url: 'https://pycode-student.vercel.app/editor?file=visualisations%2FBarPlot.py',
    },
    {
      name: 'visualisations/ScatterPlot.py',
      filename: 'ScatterPlot.py',
      folder: 'visualisations',
      code: `"""
Multivariate Bubble & Scatter Plot with Profit Sizing
"""
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

data = {
    "Category": ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Automotive'],
    "Units_Sold": [300, 420, 250, 180, 210, 310, 290, 120],
    "Revenue_USD": [15000, 8500, 12000, 4500, 9500, 6200, 5800, 11000],
    "Profit_USD": [4500, 2100, 3600, 1350, 2850, 2400, 1740, 3300]
}

df = pd.DataFrame(data)
plt.figure(figsize=(8, 5))
sns.scatterplot(x="Units_Sold", y="Revenue_USD", hue="Category", size="Profit_USD", sizes=(60, 250), data=df)
plt.title("Revenue vs Units Sold with Profit-Weighted Sizing")
plt.grid(True)
plt.show()
`,
      last_modified: '2026-08-10T11:41:19.180Z',
      open_editor_url: 'https://pycode-student.vercel.app/editor?file=visualisations%2FScatterPlot.py',
      share_url: 'https://pycode-student.vercel.app/editor?file=visualisations%2FScatterPlot.py',
    },

    // --- ALGORITHMS & CORE PYTHON ---
    {
      name: 'algorithms/Armstrong.py',
      filename: 'Armstrong.py',
      folder: 'algorithms',
      code: `"""
Armstrong Number Verifier
A number is Armstrong if the sum of its digits raised to the power of number of digits equals the number itself.
"""

def is_armstrong(n: int) -> bool:
    digits = str(n)
    power = len(digits)
    return n == sum(int(d) ** power for d in digits)

if __name__ == "__main__":
    test_cases = [153, 370, 371, 407, 9474, 123]
    for num in test_cases:
        print(f"{num:5d} -> Armstrong: {is_armstrong(num)}")
`,
      last_modified: '2026-09-08T07:00:38.685Z',
      open_editor_url: 'https://pycode-student.vercel.app/editor?file=algorithms%2FArmstrong.py',
      share_url: 'https://pycode-student.vercel.app/editor?file=algorithms%2FArmstrong.py',
    },
    {
      name: 'algorithms/Primes.py',
      filename: 'Primes.py',
      folder: 'algorithms',
      code: `"""
Sieve of Eratosthenes - Efficient Prime Number Generator
Generates all prime numbers up to N with O(n log log n) complexity.
"""

def sieve_of_eratosthenes(limit: int):
    primes = [True] * (limit + 1)
    primes[0] = primes[1] = False
    for p in range(2, int(limit**0.5) + 1):
        if primes[p]:
            for i in range(p * p, limit + 1, p):
                primes[i] = False
    return [i for i, is_p in enumerate(primes) if is_p]

if __name__ == "__main__":
    n = 100
    prime_list = sieve_of_eratosthenes(n)
    print(f"Primes up to {n} ({len(prime_list)} found):")
    print(prime_list)
`,
      last_modified: '2026-08-11T06:54:19.955Z',
      open_editor_url: 'https://pycode-student.vercel.app/editor?file=algorithms%2FPrimes.py',
      share_url: 'https://pycode-student.vercel.app/editor?file=algorithms%2FPrimes.py',
    },
    {
      name: 'algorithms/Palindrome.py',
      filename: 'Palindrome.py',
      folder: 'algorithms',
      code: `"""
Two-Pointer Palindrome Verification (Ignoring Case & Alphanumerics)
"""

def is_palindrome(s: str) -> bool:
    clean = "".join(ch.lower() for ch in s if ch.isalnum())
    left, right = 0, len(clean) - 1
    while left < right:
        if clean[left] != clean[right]:
            return False
        left += 1
        right -= 1
    return True

if __name__ == "__main__":
    phrases = [
        "A man, a plan, a canal: Panama",
        "race a car",
        "Was it a car or a cat I saw?"
    ]
    for p in phrases:
        print(f"\\"{p}\\" -> {is_palindrome(p)}")
`,
      last_modified: '2026-08-10T11:45:00.000Z',
      open_editor_url: 'https://pycode-student.vercel.app/editor?file=algorithms%2FPalindrome.py',
      share_url: 'https://pycode-student.vercel.app/editor?file=algorithms%2FPalindrome.py',
    },
    {
      name: 'algorithms/Fibonacci.py',
      filename: 'Fibonacci.py',
      folder: 'algorithms',
      code: `"""
Fibonacci Numbers via Dynamic Programming (Memoization vs Tabulation)
"""

def fib_memo(n: int, memo=None) -> int:
    if memo is None:
        memo = {}
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

if __name__ == "__main__":
    print("First 15 Fibonacci Numbers:")
    seq = [fib_memo(i) for i in range(15)]
    print(seq)
`,
      last_modified: '2026-08-04T06:46:26.833Z',
      open_editor_url: 'https://pycode-student.vercel.app/editor?file=algorithms%2FFibonacci.py',
      share_url: 'https://pycode-student.vercel.app/editor?file=algorithms%2FFibonacci.py',
    },
  ],
  file_tree: [
    {
      type: 'folder',
      name: 'DSA',
      children: [
        { type: 'file', name: 'linkedList.py', path: 'DSA/linkedList.py' },
        { type: 'file', name: 'LinkedList-1.py', path: 'DSA/LinkedList-1.py' },
        { type: 'file', name: 'BubbleSort.py', path: 'DSA/BubbleSort.py' },
        { type: 'file', name: 'BinarySearch.py', path: 'DSA/BinarySearch.py' },
        { type: 'file', name: 'Queue.py', path: 'DSA/Queue.py' },
        { type: 'file', name: 'stack.py', path: 'DSA/stack.py' },
      ],
    },
    {
      type: 'folder',
      name: 'visualisations',
      children: [
        { type: 'file', name: 'Plotly.py', path: 'visualisations/Plotly.py' },
        { type: 'file', name: 'HistPlot.py', path: 'visualisations/HistPlot.py' },
        { type: 'file', name: 'BoxPlot.py', path: 'visualisations/BoxPlot.py' },
        { type: 'file', name: 'LineChart.py', path: 'visualisations/LineChart.py' },
        { type: 'file', name: 'BarPlot.py', path: 'visualisations/BarPlot.py' },
        { type: 'file', name: 'ScatterPlot.py', path: 'visualisations/ScatterPlot.py' },
      ],
    },
    {
      type: 'folder',
      name: 'algorithms',
      children: [
        { type: 'file', name: 'Armstrong.py', path: 'algorithms/Armstrong.py' },
        { type: 'file', name: 'Primes.py', path: 'algorithms/Primes.py' },
        { type: 'file', name: 'Palindrome.py', path: 'algorithms/Palindrome.py' },
        { type: 'file', name: 'Fibonacci.py', path: 'algorithms/Fibonacci.py' },
      ],
    },
  ],
};
