import { Mentor } from "../types";

export const CURATED_MENTORS: Mentor[] = [
  {
    _id: "mentor-1",
    name: "Aarav Sharma",
    title: "Senior Full-Stack Architect",
    company: "Razorpay (Ex-Microsoft)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop",
    rating: 4.9,
    reviewsCount: 38,
    bio: "Full-stack engineer with 7+ years shipping high-scale distributed systems and React applications. Specialized in API performance, system design, and placement prep.",
    hourlyRate: "Free for Students",
    topics: ["Roadmap", "Project Review", "Career Direction", "Web Development"],
    availability: ["Today, 7:00 PM IST", "Tomorrow, 6:00 PM IST", "Saturday, 11:00 AM IST"],
    isAvailableToday: true,
    domain: "Web Development"
  },
  {
    _id: "mentor-2",
    name: "Dr. Priya Venkat",
    title: "AI Research Scientist",
    company: "Google DeepMind Alumnus",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop",
    rating: 5.0,
    reviewsCount: 42,
    bio: "Deep learning specialist focusing on Transformer architectures, PyTorch pipelines, and LLM applications. Mentored 100+ students into top ML engineering roles.",
    hourlyRate: "Free for Students",
    topics: ["Roadmap", "Project Review", "AI / ML Research", "Internship Prep"],
    availability: ["Today, 8:30 PM IST", "Tomorrow, 7:30 PM IST", "Sunday, 4:00 PM IST"],
    isAvailableToday: true,
    domain: "AI & Machine Learning"
  },
  {
    _id: "mentor-3",
    name: "Rohan Kulkarni",
    title: "Lead Mobile Architect",
    company: "Swiggy",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop",
    rating: 4.8,
    reviewsCount: 29,
    bio: "React Native & Flutter specialist with 6+ years building consumer mobile apps with 10M+ downloads. Expert in 60fps animations, native bridges, and offline architecture.",
    hourlyRate: "Free for Students",
    topics: ["Project Review", "App Development", "Code Quality", "App Store Launch"],
    availability: ["Tomorrow, 5:00 PM IST", "Friday, 6:30 PM IST"],
    isAvailableToday: false,
    domain: "App Development"
  },
  {
    _id: "mentor-4",
    name: "Vikramaditya Rathore",
    title: "Security Engineering Lead",
    company: "CrowdStrike",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop",
    rating: 4.9,
    reviewsCount: 31,
    bio: "Defensive systems engineer and pentester. OSCP and CISSP certified. Guides students on network protocols, penetration testing labs, and cybersecurity placements.",
    hourlyRate: "Free for Students",
    topics: ["Roadmap", "Cybersecurity", "Hackathon Strategy", "Portfolio Building"],
    availability: ["Today, 9:00 PM IST", "Tomorrow, 8:00 PM IST"],
    isAvailableToday: true,
    domain: "Cybersecurity"
  },
  {
    _id: "mentor-5",
    name: "Sneha Nair",
    title: "Staff Data Engineer",
    company: "Databricks",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop",
    rating: 4.9,
    reviewsCount: 35,
    bio: "Big data pipeline engineer specializing in SQL optimization, PySpark ETL pipelines, and analytical data modeling. Passionate about empowering aspiring data engineers.",
    hourlyRate: "Free for Students",
    topics: ["Roadmap", "Data & Analytics", "Project Review", "Career Direction"],
    availability: ["Tomorrow, 6:30 PM IST", "Saturday, 2:00 PM IST"],
    isAvailableToday: false,
    domain: "Data & Analytics"
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
    if (lower.includes("web")) return d.includes("web");
    if (lower.includes("app") || lower.includes("mobile")) return d.includes("app") || d.includes("mobile");
    if (lower.includes("cyber") || lower.includes("sec")) return d.includes("cyber") || d.includes("sec");
    if (lower.includes("data")) return d.includes("data");
    return true;
  });
}
