export default {
  name: "Atio",
  title: "Full-Stack Developer",
  email: "hello@atio.dev",
  location: "Remote / Worldwide",
  github: "https://github.com/atio",
  linkedin: "https://linkedin.com/in/atio",
  twitter: "https://twitter.com/atio",

  about: [
    "Full-stack developer specializing in modern JavaScript ecosystems. I build scalable web applications with clean architecture and great developer experience.",
    "Currently exploring distributed systems, real-time applications, and developer tooling. I write about code, contribute to OSS, and occasionally tweet.",
  ],

  skills: [
    { name: "JavaScript / TypeScript", level: "██████████ 95%" },
    { name: "React / Next.js",         level: "██████████ 90%" },
    { name: "Node.js / Deno",          level: "█████████░ 85%" },
    { name: "Python / FastAPI",        level: "████████░░ 75%" },
    { name: "PostgreSQL / Redis",      level: "███████░░░ 70%" },
    { name: "Docker / Kubernetes",     level: "███████░░░ 68%" },
    { name: "AWS / GCP",               level: "██████░░░░ 60%" },
    { name: "Rust (learning)",         level: "████░░░░░░ 40%" },
  ],

  projects: [
    { name: "CloudBoard", desc: "Real-time collaborative whiteboard with WebSocket sync", tech: "React · Node.js · WebSocket · PostgreSQL", live: "https://cloudboard.demo", github: "https://github.com/atio/cloudboard" },
    { name: "DevMetrics", desc: "Git contribution analytics and sprint tracking dashboard", tech: "Next.js · TypeScript · Prisma · Chart.js", live: "https://devmetrics.demo", github: "https://github.com/atio/devmetrics" },
    { name: "SnapFlow",   desc: "Image optimization service with CDN and auto-format detection", tech: "Python · FastAPI · Redis · Docker", live: "https://snapflow.demo", github: "https://github.com/atio/snapflow" },
  ],

  experience: [
    { role: "Senior Full-Stack Developer", company: "TechCorp", period: "Jan 2024 – Present", desc: "Leading a 5-dev team. Architected microservices migration, improved deploy frequency by 60%." },
    { role: "Full-Stack Developer", company: "StartupXYZ", period: "Mar 2022 – Dec 2023", desc: "Built MVP to 10k users. REST APIs, real-time features, CI/CD pipelines." },
    { role: "Junior Developer", company: "WebAgency", period: "Jun 2020 – Feb 2022", desc: "15+ client projects. Modernized legacy codebases, introduced CI/CD." },
  ],

  clients: 3,

  services: [
    { icon: "\u2328", title: "Web Development", desc: "Full-stack applications with modern frameworks, clean APIs, and responsive UIs that perform at scale.", color: "#00ff6a" },
    { icon: "\u2728", title: "UI/UX Design", desc: "Intuitive interfaces with thoughtful interactions, micro-animations, and design systems that delight users.", color: "#00d4ff" },
    { icon: "\u2699\uFE0F", title: "DevOps & Infra", desc: "CI/CD pipelines, cloud deployment, containerization, and infrastructure as code for reliable releases.", color: "#ff00ff" },
    { icon: "\uD83D\uDD11", title: "Technical Consulting", desc: "Architecture reviews, performance optimization, and technical strategy to help teams ship faster.", color: "#ffd700" },
  ],

  achievements: [
    { icon: "\uD83C\uDFC6", label: "Top Rated", detail: "Upwork Top Rated Freelancer" },
    { icon: "\uD83D\uDCA1", label: "Innovation Award", detail: "Best Tech Solution 2024" },
    { icon: "\uD83D\uDCC8", label: "500K+ Users", detail: "Built apps serving 500K+ users" },
    { icon: "\uD83C\uDF93", label: "CS Degree", detail: "B.S. Computer Science" },
  ],

  marquee: [
    "React", "Node.js", "TypeScript", "Python", "Go", "Rust",
    "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "Terraform",
    "GraphQL", "Redis", "Next.js", "Tailwind",
  ],

  commands: {
    help:     "Available commands: about, skills, projects, experience, contact, whoami, ls, banner, date, theme, clear, sudo, neofetch",
    about:    "{name} — {title}\n──────────────\n{about}",
    whoami:   "{name} — {title}\n{location} · {email}",
  },
};
