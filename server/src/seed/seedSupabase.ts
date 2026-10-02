import dotenv from 'dotenv';
import { supabase, isSupabaseConfigured } from '../config/supabase';

dotenv.config();

export async function seedSupabase() {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('⚠️ [Supabase Seed] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in .env to seed remote Supabase.');
    return;
  }

  console.log('🌱 [Supabase Seed] Seeding Supabase database with production data...');

  try {
    // 1. Lessons
    const lessons = [
      {
        slug: 'javascript-array-methods',
        title: 'JavaScript Array Methods: map(), filter(), reduce()',
        category: 'Web Development',
        difficulty: 'Beginner',
        order_index: 1,
        duration_minutes: 25,
        markdown_content: `# JavaScript Array Methods: map(), filter(), reduce()\n\nModern JavaScript applications rely heavily on functional immutability. Rather than writing traditional \`for\` loops that mutate state in place, high-velocity frontend engineers use declarative array methods.\n\n### Core Principles:\n1. **map()**: Transforms every element in an array into a new shape, returning a new array of the exact same length.\n2. **filter()**: Evaluates a predicate boolean condition for each item, returning a subset array without modifying the source.\n3. **reduce()**: Accumulates values across an array into a single resulting scalar, object, or grouped dictionary.`,
        key_takeaways: ['Always treat state as immutable in React and Node.js', 'filter() produces a subset without mutations', 'reduce() requires a defensive initial accumulator value'],
        code_example: `const users = [\n  { id: 1, name: 'Rishabh', isActive: true, score: 92 },\n  { id: 2, name: 'Ananya', isActive: false, score: 84 },\n  { id: 3, name: 'Vikram', isActive: true, score: 98 },\n];\n\n// 1. Filter active users\nconst activeUsers = users.filter(u => u.isActive);\n\n// 2. Map to display names\nconst activeNames = activeUsers.map(u => u.name);\n\n// 3. Calculate total score\nconst totalScore = activeUsers.reduce((sum, u) => sum + u.score, 0);`,
        quiz: [
          {
            question: 'Does the Array.prototype.filter() method mutate the original source array in JavaScript?',
            options: ['Yes, it deletes non-matching indices in-place', 'No, it returns a brand-new array containing matching elements', 'Only if the array contains primitive numbers', 'Only in strict mode'],
            correctIndex: 1,
            explanation: 'filter() is a pure non-mutating method that creates a shallow copy containing only the passing items.'
          }
        ]
      },
      {
        slug: 'understanding-the-dom',
        title: 'Understanding the DOM & Event Delegation',
        category: 'Web Development',
        difficulty: 'Beginner',
        order_index: 2,
        duration_minutes: 20,
        markdown_content: `# Understanding the DOM & Event Delegation\n\nThe Document Object Model (DOM) is an in-memory tree representation of the HTML document rendered by the browser engine. Every HTML element becomes a node in the tree.`,
        key_takeaways: ['The DOM is an API representation of the HTML document', 'Event bubbling moves from target up to the document root', 'Event delegation reduces listener memory overhead from O(N) to O(1)'],
        code_example: `const list = document.querySelector('#mission-list');\nlist.addEventListener('click', (event) => {\n  const target = event.target;\n  if (target.matches('.complete-btn')) {\n    const taskId = target.dataset.taskId;\n    markTaskComplete(taskId);\n  }\n});`,
        quiz: [
          {
            question: 'Why is event delegation beneficial when handling dynamic lists of items?',
            options: ['It runs faster than web workers', 'It attaches a single listener to a common ancestor instead of N individual elements', 'It prevents CSS styles from being overwritten', 'It eliminates the need for JavaScript'],
            correctIndex: 1,
            explanation: 'Event delegation leverages event bubbling to handle events at a parent container, saving memory.'
          }
        ]
      },
      {
        slug: 'tcp-ip-network-protocols',
        title: 'TCP/IP Architecture & Network Packet Fundamentals',
        category: 'Cybersecurity',
        difficulty: 'Beginner',
        order_index: 3,
        duration_minutes: 25,
        markdown_content: `# TCP/IP Architecture & Network Packet Fundamentals\n\nUnderstand how data packets traverse the OSI stack from physical bitstreams to application payloads. Master the TCP 3-way handshake and packet header structures.\n\n### The TCP Three-Way Handshake Under the Hood\nEvery reliable connection across the internet starts with a 3-way handshake. A client transmits a SYN packet with an Initial Sequence Number (ISN). The server responds with SYN-ACK, acknowledging ISN+1, and the client completes the handshake with an ACK packet.`,
        key_takeaways: ['TCP guarantees ordered delivery using sequence numbers and acknowledgements', 'UDP trades reliability for low latency', 'IP header TTL decrements at each router hop'],
        code_example: `# Scapy TCP Handshake Simulation\nfrom scapy.all import IP, TCP, sr1\n\nip = IP(dst="192.168.1.1")\nsyn = TCP(dport=80, flags="S", seq=1000)\nsyn_ack = sr1(ip/syn)\nack = TCP(dport=80, flags="A", seq=1001, ack=syn_ack.seq + 1)\nprint("Connection Established!")`,
        quiz: [
          {
            question: 'Which TCP flag sequence marks a normal connection establishment?',
            options: ['SYN -> ACK -> RST', 'SYN -> SYN-ACK -> ACK', 'FIN -> ACK -> FIN-ACK', 'PUSH -> ACK -> URG'],
            correctIndex: 1,
            explanation: 'The TCP 3-way handshake consists of SYN, SYN-ACK, and ACK.'
          }
        ]
      },
      {
        slug: 'packet-analysis-wireshark',
        title: 'Packet Analysis with Wireshark & Raw Sockets',
        category: 'Cybersecurity',
        difficulty: 'Beginner',
        order_index: 4,
        duration_minutes: 30,
        markdown_content: `# Packet Analysis with Wireshark & Raw Sockets\n\nMaster packet filtering expressions, stream following, and anomaly hunting in raw network traffic captures.\n\n### Capturing Raw Packets with Python Sockets\nRaw sockets allow user-space applications to bypass the standard transport layer and capture raw IP frames.`,
        key_takeaways: ['Wireshark display filters isolate suspicious streams', 'Plaintext protocols expose session tokens and passwords'],
        code_example: `import socket\ns = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_TCP)\npacket = s.recvfrom(65565)\nprint("Captured packet byte length:", len(packet[0]))`,
        quiz: [
          {
            question: 'Which display filter isolates all unencrypted HTTP traffic to port 80?',
            options: ['ip.addr == 80', 'tcp.port == 80', 'http.port == 443', 'udp.port == 80'],
            correctIndex: 1,
            explanation: 'tcp.port == 80 isolates all TCP traffic traveling to or from port 80.'
          }
        ]
      }
    ];

    for (const lesson of lessons) {
      await supabase.from('lessons').upsert(lesson, { onConflict: 'slug' });
    }
    console.log('✅ [Supabase Seed] Lessons seeded.');

    // 2. Coding Problems
    const problems = [
      {
        slug: 'filter-active-users',
        title: 'Filter Active Users',
        difficulty: 'Easy',
        category: 'Arrays & Functional Programming',
        is_debugging_challenge: false,
        description_markdown: `Given an array of user objects where each user contains an \`id\`, \`name\`, and boolean \`isActive\` flag, write a function \`filterActiveUsers(users)\` that returns only the users whose \`isActive\` property is \`true\`.\n\n### Input\n- An array of objects: \`[{ id: number, name: string, isActive: boolean }]\`\n\n### Output\n- Array of active user objects preserving original order.`,
        examples: [
          {
            input: `[{ id: 1, name: "Rishabh", isActive: true }, { id: 2, name: "Aarav", isActive: false }]`,
            output: `[{ id: 1, name: "Rishabh", isActive: true }]`,
            explanation: 'Only Rishabh has isActive: true.'
          }
        ],
        constraints: ['0 <= users.length <= 10,000', 'Each element contains valid id, name, and isActive'],
        starter_code: {
          javascript: `function filterActiveUsers(users) {\n  // Write your code here\n  return users.filter(user => user.isActive);\n}`,
          python: `def filter_active_users(users):\n    # Write your code here\n    return [u for u in users if u.get("isActive") == True]`,
          cpp: `#include <vector>\n// Struct User { int id; string name; bool isActive; };`,
          java: `public class Solution {\n    // Implementation\n}`
        },
        hints: {
          level1Concept: 'Look at the JavaScript Array.prototype.filter() method.',
          level2Stronger: 'Filter accepts a callback function that evaluates each object and returns true or false.',
          level3Approach: 'return users.filter(u => u.isActive === true);'
        },
        test_cases: [
          {
            testCaseId: 'tc-1',
            input: `[{"id":1,"name":"Rishabh","isActive":true},{"id":2,"name":"Aarav","isActive":false}]`,
            expectedOutput: `[{"id":1,"name":"Rishabh","isActive":true}]`,
            isHidden: false
          },
          {
            testCaseId: 'tc-2',
            input: `[{"id":10,"name":"Dev","isActive":false}]`,
            expectedOutput: `[]`,
            isHidden: false
          },
          {
            testCaseId: 'tc-3',
            input: `[{"id":1,"name":"A","isActive":true},{"id":2,"name":"B","isActive":true}]`,
            expectedOutput: `[{"id":1,"name":"A","isActive":true},{"id":2,"name":"B","isActive":true}]`,
            isHidden: true
          }
        ],
        acceptance_rate: '89%'
      },
      {
        slug: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        category: 'Hash Tables & Arrays',
        is_debugging_challenge: false,
        description_markdown: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.`,
        examples: [
          {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
          }
        ],
        constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Exactly one valid answer exists.'],
        starter_code: {
          javascript: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
          python: `def two_sum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in lookup:\n            return [lookup[comp], i]\n        lookup[num] = i\n    return []`,
          cpp: `#include <vector>\n#include <unordered_map>`,
          java: `import java.util.HashMap;`
        },
        hints: {
          level1Concept: 'A brute force solution checks every pair with two nested loops O(n²). Can you do it in one pass with a Hash Map?',
          level2Stronger: 'For each number x, calculate the required complement = target - x. Check if complement already exists in your map.',
          level3Approach: 'Create an object/map. Loop through nums: if target - nums[i] in map, return [map[target - nums[i]], i]. Else map[nums[i]] = i.'
        },
        test_cases: [
          {
            testCaseId: 'tc-1',
            input: `{"nums":[2,7,11,15],"target":9}`,
            expectedOutput: `[0,1]`,
            isHidden: false
          },
          {
            testCaseId: 'tc-2',
            input: `{"nums":[3,2,4],"target":6}`,
            expectedOutput: `[1,2]`,
            isHidden: false
          }
        ],
        acceptance_rate: '76%'
      }
    ];

    for (const prob of problems) {
      await supabase.from('coding_problems').upsert(prob, { onConflict: 'slug' });
    }
    console.log('✅ [Supabase Seed] Coding problems seeded.');

    // 3. Mentors
    const mentors = [
      {
        name: 'Dr. Arpit Khare',
        title: 'Staff Software Engineer',
        company: 'Stripe',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
        topics: ['System Design', 'Hackathon Strategy', 'Full-Stack Architecture'],
        experience_years: 9,
        rating: 4.9,
        bio: 'Staff Engineer at Stripe. Former Smart India Hackathon Winner. Passionate about helping engineering students build robust architectures and high-impact products.',
        hourly_rate_inr: 0,
        available_days: ['Tuesday', 'Thursday', 'Saturday']
      },
      {
        name: 'Priya Sharma',
        title: 'Senior Engineering Lead',
        company: 'Microsoft',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop',
        topics: ['React & Frontend Architecture', 'Portfolio Review', 'FAANG Placement Prep'],
        experience_years: 7,
        rating: 5.0,
        bio: 'Tech lead at Microsoft Azure Core. Conducted 100+ university campus interviews. Helping developers stand out through verifiable proof of work.',
        hourly_rate_inr: 0,
        available_days: ['Monday', 'Wednesday', 'Friday']
      },
      {
        name: 'Vikram Malhotra',
        title: 'Founding Engineer',
        company: 'Zomato / Blinkit',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop',
        topics: ['Distributed Systems', 'Backend Microservices', 'High-Scale NodeJS'],
        experience_years: 6,
        rating: 4.8,
        bio: 'Core infrastructure builder handling millions of orders daily. Expert in Redis caching, message queues, and high-performance databases.',
        hourly_rate_inr: 0,
        available_days: ['Saturday', 'Sunday']
      }
    ];

    for (const mentor of mentors) {
      await supabase.from('mentors').upsert(mentor, { onConflict: 'name' });
    }
    console.log('✅ [Supabase Seed] Mentors seeded.');

    console.log('🎉 [Supabase Seed] All initial records seeded to Supabase successfully!');
  } catch (err: any) {
    console.error('❌ [Supabase Seed] Error seeding:', err.message);
  }
}

// Run if called directly
if (require.main === module) {
  seedSupabase().then(() => process.exit(0));
}
