import { ResumeData } from "@/types/resume";

export const sampleResumeData: ResumeData = {
  id: "sample-resume-devesh",
  title: "Devesh Sharma — Software Developer",
  targetJob: {
    targetRole: "Software Developer Intern",
    targetIndustry: "Technology / Software",
    experienceLevel: "Student",
    jobDescription: `We are looking for a Software Developer Intern with strong fundamentals in Python, Java, React, and SQL. 
Key Responsibilities:
- Design, build, and deploy full-stack web features and microservices.
- Write clean, maintainable code and integrate modern RESTful APIs.
- Collaborate with agile cross-functional teams to troubleshoot and optimize performance.
- Utilize Git for version control and adhere to CI/CD workflows.
Requirements:
- Pursuing or completed B.Tech / B.S. in Computer Science or related degree.
- Hands-on experience with frontend frameworks (React, Next.js) and relational databases (PostgreSQL/SQL).
- Passion for building AI/ML applications and modern SaaS tools.`,
  },
  personal: {
    fullName: "Devesh Sharma",
    headline: "B.Tech CSE (AI/ML) Student & Full-Stack Developer",
    email: "devesh.sharma@example.com",
    phone: "+91 98765 43210",
    location: "Greater Noida, India",
    linkedin: "https://linkedin.com/in/devesh-sharma-dev",
    github: "https://github.com/devesh-sharma",
    portfolio: "https://deveshsharma.dev",
  },
  summary:
    "Proactive and detail-oriented B.Tech Computer Science student specializing in AI/ML with a proven track record of architecting scalable web applications and AI-driven solutions. Experienced in developing responsive interfaces with React, robust backend APIs, and integrating machine learning pipelines. Passionate about writing clean, efficient code and contributing to high-impact software engineering teams.",
  education: [
    {
      id: "edu-1",
      degree: "B.Tech in Computer Science and Engineering (Specialization in AI & ML)",
      institution: "Galgotias University",
      location: "Greater Noida, Uttar Pradesh",
      startYear: "2021",
      endYear: "2025",
      gpa: "8.7 / 10.0 CGPA",
      coursework: "Data Structures & Algorithms, Database Systems, Artificial Intelligence, Deep Learning, Cloud Computing, Object-Oriented Software Design",
      achievements: "Dean's Merit List; Technical Lead for University AI & Innovation Student Club.",
    },
  ],
  experience: [
    {
      id: "exp-1",
      company: "Nexus Technologies",
      role: "Software Engineering Intern",
      location: "Noida, India",
      employmentType: "Internship",
      startDate: "June 2024",
      endDate: "August 2024",
      isCurrent: false,
      description: "Contributed to core frontend and backend microservices for enterprise client portals.",
      highlights: [
        "Architected and deployed responsive React dashboard modules, reducing page load latency by 28%.",
        "Constructed and documented RESTful API endpoints utilizing Python and Node.js for automated reporting.",
        "Integrated SQL query optimizations and indexing strategies that accelerated transaction lookups by 35%.",
        "Participated in daily Agile standups, code reviews, and Git version control workflows across team repositories.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "AI Farming Advisory Platform",
      description: "An intelligent precision-agriculture web platform providing localized crop recommendations, disease diagnosis, and real-time climate telemetry.",
      technologies: ["Python", "React", "TensorFlow", "FastAPI", "PostgreSQL"],
      githubUrl: "https://github.com/devesh-sharma/ai-farming-platform",
      liveUrl: "https://ai-farming-advisory.demo.app",
      startDate: "January 2024",
      endDate: "April 2024",
      projectType: "Academic",
      highlights: [
        "Engineered an automated CNN image classifier with 93% accuracy to diagnose leaf blight and soil nutrient deficiencies.",
        "Designed an intuitive multilingual dashboard with React and Tailwind CSS, facilitating seamless usage for rural farmers.",
        "Implemented secure REST endpoints in FastAPI handling asynchronous inference requests with sub-300ms response times.",
      ],
    },
    {
      id: "proj-2",
      name: "ResumeForge AI — SaaS Builder",
      description: "A production-grade AI-powered resume authoring application featuring real-time ATS scoring, keyword matching, and dynamic multi-template export.",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL"],
      githubUrl: "https://github.com/devesh-sharma/resumeforge-ai",
      liveUrl: "https://resumeforge.demo.app",
      startDate: "August 2024",
      endDate: "Present",
      projectType: "Personal",
      highlights: [
        "Constructed a multi-template rendering engine supporting 6 distinct layouts with instant JSON-driven state syncing.",
        "Devised an algorithmic ATS scoring system auditing keyword frequency, structural hierarchy, and typographical density.",
        "Built automated vector-text PDF and editable DOCX generation pipelines preserving high-fidelity layout formatting.",
      ],
    },
    {
      id: "proj-3",
      name: "Automated Vehicle Crash Detection System",
      description: "IoT and computer vision system detecting vehicular collisions and transmitting instant geolocated distress alerts to emergency services.",
      technologies: ["Python", "OpenCV", "Raspberry Pi", "Twilio API", "Flask"],
      githubUrl: "https://github.com/devesh-sharma/crash-detection-system",
      startDate: "September 2023",
      endDate: "December 2023",
      projectType: "Academic",
      highlights: [
        "Trained motion optical flow algorithms and accelerometer threshold triggers to reliably detect impact dynamics.",
        "Integrated Twilio SMS and location webhooks to dispatch automated coordinates within 5 seconds of incident trigger.",
      ],
    },
  ],
  skills: {
    languages: ["Python", "Java", "TypeScript", "JavaScript", "C++", "SQL"],
    frameworks: ["React", "Next.js", "Node.js", "FastAPI", "Express", "Tailwind CSS"],
    databases: ["PostgreSQL", "MySQL", "MongoDB", "SQLite"],
    tools: ["Git", "GitHub", "Docker", "Postman", "VS Code", "Linux / Bash"],
    cloud: ["AWS (S3, EC2)", "Vercel", "Supabase"],
    aiml: ["TensorFlow", "Scikit-Learn", "OpenCV", "Pandas", "NumPy", "Prompt Engineering"],
    softSkills: ["Analytical Problem Solving", "Cross-Functional Collaboration", "Agile Methodology", "Technical Documentation"],
    other: ["RESTful API Architecture", "CI/CD Pipelines", "Object-Oriented Design"],
  },
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services (AWS)",
      issueDate: "2024",
      credentialUrl: "https://aws.amazon.com/verification",
      credentialId: "AWS-CCP-98124",
    },
    {
      id: "cert-2",
      name: "Machine Learning Specialization",
      issuer: "DeepLearning.AI / Coursera",
      issueDate: "2023",
      credentialUrl: "https://coursera.org/verify/ML-SPECIALIZATION",
    },
  ],
  achievements: [
    {
      id: "ach-1",
      title: "1st Place Winner — University Annual Hackathon 2024",
      description: "Built an emergency response telemedicine portal within 36 hours among 80+ participating collegiate teams.",
      date: "March 2024",
      organization: "Galgotias University Tech Fest",
    },
    {
      id: "ach-2",
      title: "Solved 350+ Problems on LeetCode & GeeksforGeeks",
      description: "Consistently ranked in the top 15% in algorithmic contests covering Dynamic Programming, Trees, and Graph theory.",
      date: "2023 - 2024",
    },
  ],
  activities: [
    {
      id: "act-1",
      role: "Lead Coordinator",
      organization: "Google Developer Student Club (GDSC) — AI Wing",
      startDate: "2023",
      endDate: "2024",
      description: "Organized technical workshops on Python, Computer Vision, and Web Development for over 400 attendees.",
    },
  ],
  style: {
    templateId: "ats-professional",
    font: "inter",
    fontSize: "base",
    accentColor: "#1e3a8a",
    spacing: "normal",
    margins: "normal",
    sectionOrder: [
      "summary",
      "experience",
      "projects",
      "education",
      "skills",
      "certifications",
      "achievements",
    ],
    showPhoto: false,
    layout: "single",
  },
  atsAnalysis: {
    overallScore: 94,
    keywordMatch: 92,
    structure: 97,
    skills: 95,
    experience: 90,
    readability: 96,
    formatting: 98,
    matchedKeywords: ["Python", "Java", "React", "SQL", "Git", "REST APIs", "Full-stack", "PostgreSQL", "Next.js"],
    missingKeywords: ["CI/CD pipelines", "Microservices architecture"],
    strengths: [
      "Excellent quantifiable impact bullet points using strong action verbs.",
      "Clear standard ATS section headings with consistent chronology.",
      "100% text-selectable structure without tables or graphical obstruction.",
      "Strong alignment between projects and target Software Developer role.",
    ],
    recommendations: [
      "Consider emphasizing experience with automated CI/CD pipelines in the project descriptions.",
      "Specify testing frameworks (e.g. Jest, PyTest) if you have hands-on experience.",
    ],
    warnings: [],
  },
  jobAnalysis: {
    jobMatchScore: 92,
    skillsMatch: 95,
    keywordMatch: 89,
    experienceMatch: 90,
    educationMatch: 100,
    requiredSkills: ["Python", "Java", "React", "SQL", "Git"],
    preferredSkills: ["FastAPI", "Docker", "PostgreSQL", "REST APIs"],
    missingCrucialSkills: ["CI/CD workflows"],
    identifiedKeywords: ["Software Developer Intern", "RESTful APIs", "Full-Stack", "Agile", "Version Control"],
    jobSummary: "Looking for an energetic Software Developer Intern proficient in core programming languages (Python, Java), React frontend, and SQL databases to join an agile engineering team.",
    recommendations: [
      "Highlight your Agile and code review experience from your Nexus Technologies internship.",
      "Make sure Git and version control are front and center in the skills section.",
    ],
  },
};
