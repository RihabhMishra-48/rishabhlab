import { Mentor } from "../types";

export const CURATED_MENTORS: Mentor[] = [
  {
    _id: "mentor-rishabh",
    name: "Rishabh Mishra",
    title: "Founder & Full-Stack Lead",
    company: "RishabhLabs",
    avatar: "/avatars/rishabh.webp",
    rating: 5.0,
    reviewsCount: 142,
    bio: "Founder of RishabhLabs. Full-Stack Architect specialized in high-performance distributed systems, scalable web applications, and technical placement strategy.",
    hourlyRate: "Free for Students",
    topics: ["Roadmap", "Project Review", "Career Direction", "Web Development", "System Design"],
    availability: ["Today, 7:00 PM IST", "Tomorrow, 6:00 PM IST", "Saturday, 11:00 AM IST"],
    isAvailableToday: true,
    domain: "Full-Stack Development"
  },
  {
    _id: "mentor-arpit",
    name: "Arpit Pandey",
    title: "AI & Systems Specialist",
    company: "RishabhLabs",
    avatar: "/avatars/arpit.webp",
    rating: 4.98,
    reviewsCount: 96,
    bio: "AI & Machine Learning Specialist focusing on Transformer models, LLM agent workflows, PyTorch neural pipelines, and competitive hackathon architecture.",
    hourlyRate: "Free for Students",
    topics: ["Roadmap", "Project Review", "AI / ML Research", "Deep Learning", "Internship Prep"],
    availability: ["Today, 8:30 PM IST", "Tomorrow, 7:30 PM IST", "Sunday, 4:00 PM IST"],
    isAvailableToday: true,
    domain: "AI & Machine Learning"
  },
  {
    _id: "mentor-harsh",
    name: "Harsh Sharma",
    title: "Security & Systems Lead",
    company: "RishabhLabs",
    avatar: "/avatars/harsh.webp",
    rating: 4.97,
    reviewsCount: 89,
    bio: "Cybersecurity & Systems Lead. Expert in offensive and defensive security, packet analysis, network protocol security, and Linux kernel hardening.",
    hourlyRate: "Free for Students",
    topics: ["Roadmap", "Cybersecurity", "Network Protocols", "Pentesting", "Hackathon Strategy"],
    availability: ["Today, 9:00 PM IST", "Tomorrow, 8:00 PM IST", "Saturday, 5:00 PM IST"],
    isAvailableToday: true,
    domain: "Cybersecurity"
  }
];

export function getCuratedMentors(domain?: string): Mentor[] {
  if (!domain || domain === "All" || domain === "All Domains") {
    return CURATED_MENTORS;
  }
  const lower = domain.toLowerCase();
  return CURATED_MENTORS.filter((m) => {
    const d = (m.domain || "").toLowerCase();
    if (lower.includes("ai") || lower.includes("ml")) return d.includes("ai") || d.includes("machine");
    if (lower.includes("web") || lower.includes("full") || lower.includes("stack")) return d.includes("web") || d.includes("full-stack");
    if (lower.includes("cyber") || lower.includes("sec")) return d.includes("cyber") || d.includes("sec");
    return d.includes(lower);
  });
}
