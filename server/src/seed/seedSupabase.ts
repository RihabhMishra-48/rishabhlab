import dotenv from 'dotenv';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { getCleanProjects } from './seedData';

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

    // 2. Coding Problems (Full Multi-Track & Algorithmic Practice Suite)
    const { ALL_CODING_PROBLEMS } = await import('./seedCodingProblems');
    for (const prob of ALL_CODING_PROBLEMS) {
      await supabase.from('coding_problems').upsert(prob, { onConflict: 'slug' });
    }
    console.log(`✅ [Supabase Seed] ${ALL_CODING_PROBLEMS.length} coding problems seeded across all tracks.`);

    // 3. Mentors (Strictly authentic RishabhLabs mentors with local avatars)
    const mentors = [
      {
        name: 'Rishabh Mishra',
        title: 'Founder & Full-Stack Lead',
        company: 'RishabhLabs',
        domain: 'Full-Stack Development',
        avatar: '/avatars/rishabh.webp',
        topics: ['Roadmap', 'Project Review', 'Career Direction', 'Web Development', 'System Design'],
        experience_years: 6,
        rating: 5.0,
        bio: 'Founder of RishabhLabs. Full-Stack Architect specialized in high-performance distributed systems, scalable web applications, and technical placement strategy.',
        hourly_rate_inr: 0,
        available_days: ['Monday', 'Wednesday', 'Saturday']
      },
      {
        name: 'Arpit Pandey',
        title: 'AI & Systems Specialist',
        company: 'RishabhLabs',
        domain: 'AI & Machine Learning',
        avatar: '/avatars/arpit.webp',
        topics: ['Roadmap', 'Project Review', 'AI / ML Research', 'Deep Learning', 'Internship Prep'],
        experience_years: 5,
        rating: 4.98,
        bio: 'AI & Machine Learning Specialist focusing on Transformer models, LLM agent workflows, PyTorch neural pipelines, and competitive hackathon architecture.',
        hourly_rate_inr: 0,
        available_days: ['Tuesday', 'Thursday', 'Saturday']
      },
      {
        name: 'Harsh Sharma',
        title: 'Security & Systems Lead',
        company: 'RishabhLabs',
        domain: 'Cybersecurity',
        avatar: '/avatars/harsh.webp',
        topics: ['Roadmap', 'Cybersecurity', 'Network Protocols', 'Pentesting', 'Hackathon Strategy'],
        experience_years: 6,
        rating: 4.97,
        bio: 'Cybersecurity & Systems Lead. Expert in offensive and defensive security, packet analysis, network protocol security, and Linux kernel hardening.',
        hourly_rate_inr: 0,
        available_days: ['Monday', 'Wednesday', 'Friday', 'Saturday']
      }
    ];

    for (const mentor of mentors) {
      const { data: existing } = await supabase.from('mentors').select('id').eq('name', mentor.name).maybeSingle();
      if (existing) {
        await supabase.from('mentors').update(mentor).eq('id', existing.id);
      } else {
        await supabase.from('mentors').insert(mentor);
      }
    }
    console.log('✅ [Supabase Seed] Mentors seeded.');

    // 4. Industry Projects
    const rawProjects = getCleanProjects();
    for (const p of rawProjects) {
      await supabase.from('projects').upsert({
        slug: p.slug,
        title: p.title,
        description: p.description,
        category: p.category,
        difficulty: p.difficulty,
        estimated_hours: p.estimatedHours || 25,
        tech_stack: p.techStack || [],
        requirements: p.requirements || [],
        milestones: p.milestones || [],
      }, { onConflict: 'slug' });
    }
    console.log('✅ [Supabase Seed] Projects seeded.');

    console.log('🎉 [Supabase Seed] All initial records seeded to Supabase successfully!');
  } catch (err: any) {
    console.error('❌ [Supabase Seed] Error seeding:', err.message);
  }
}

// Run if called directly
if (require.main === module) {
  seedSupabase().then(() => process.exit(0));
}
