import { create } from "zustand";
import {
  ResumeData,
  PersonalInfo,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  SkillCategories,
  CertificationItem,
  AchievementItem,
  ExtracurricularItem,
  TargetJob,
  StyleSettings,
  TemplateId,
  ATSBreakdown,
  JobAnalysisResult,
} from "@/types/resume";
import { sampleResumeData } from "@/lib/sample-data";

interface ResumeStoreState {
  resume: ResumeData;
  activeStep: number;
  isSaving: boolean;
  lastSavedText: string;
  activeEditorTab: "edit" | "preview" | "ai" | "score";
  editorZoom: number; // 0.7 to 1.3

  // Actions
  setActiveStep: (step: number) => void;
  setActiveEditorTab: (tab: "edit" | "preview" | "ai" | "score") => void;
  setEditorZoom: (zoom: number) => void;
  setResume: (resume: ResumeData) => void;
  updatePersonal: (data: Partial<PersonalInfo>) => void;
  updateSummary: (summary: string) => void;
  updateTargetJob: (target: Partial<TargetJob>) => void;
  updateStyle: (style: Partial<StyleSettings>) => void;
  setTemplateId: (templateId: TemplateId) => void;

  // Education
  addEducation: (item?: Partial<EducationItem>) => void;
  updateEducation: (id: string, item: Partial<EducationItem>) => void;
  removeEducation: (id: string) => void;

  // Experience
  addExperience: (item?: Partial<ExperienceItem>) => void;
  updateExperience: (id: string, item: Partial<ExperienceItem>) => void;
  removeExperience: (id: string) => void;

  // Projects
  addProject: (item?: Partial<ProjectItem>) => void;
  updateProject: (id: string, item: Partial<ProjectItem>) => void;
  removeProject: (id: string) => void;

  // Skills
  updateSkillCategory: (category: keyof SkillCategories, skills: string[]) => void;
  addSkillToCategory: (category: keyof SkillCategories, skill: string) => void;
  removeSkillFromCategory: (category: keyof SkillCategories, skill: string) => void;

  // Certifications
  addCertification: (item?: Partial<CertificationItem>) => void;
  updateCertification: (id: string, item: Partial<CertificationItem>) => void;
  removeCertification: (id: string) => void;

  // Achievements
  addAchievement: (item?: Partial<AchievementItem>) => void;
  updateAchievement: (id: string, item: Partial<AchievementItem>) => void;
  removeAchievement: (id: string) => void;

  // Analysis updates
  setATSAnalysis: (analysis: ATSBreakdown) => void;
  setJobAnalysis: (analysis: JobAnalysisResult) => void;

  // Save / Storage
  triggerAutosave: () => void;
  loadSample: () => void;
  loadBlank: () => void;
}

const LOCAL_STORAGE_KEY = "resumeforge_active_draft";

export const useResumeStore = create<ResumeStoreState>((set, get) => ({
  resume: sampleResumeData,
  activeStep: 0,
  isSaving: false,
  lastSavedText: "Saved just now",
  activeEditorTab: "edit",
  editorZoom: 1.0,

  setActiveStep: (step) => set({ activeStep: step }),
  setActiveEditorTab: (tab) => set({ activeEditorTab: tab }),
  setEditorZoom: (zoom) => set({ editorZoom: Math.max(0.6, Math.min(1.4, zoom)) }),

  setResume: (resume) => {
    set({ resume });
    get().triggerAutosave();
  },

  updatePersonal: (data) => {
    set((state) => ({
      resume: {
        ...state.resume,
        personal: { ...state.resume.personal, ...data },
      },
    }));
    get().triggerAutosave();
  },

  updateSummary: (summary) => {
    set((state) => ({
      resume: { ...state.resume, summary },
    }));
    get().triggerAutosave();
  },

  updateTargetJob: (target) => {
    set((state) => ({
      resume: {
        ...state.resume,
        targetJob: { ...state.resume.targetJob, ...target },
      },
    }));
    get().triggerAutosave();
  },

  updateStyle: (style) => {
    set((state) => ({
      resume: {
        ...state.resume,
        style: { ...state.resume.style, ...style },
      },
    }));
    get().triggerAutosave();
  },

  setTemplateId: (templateId) => {
    set((state) => ({
      resume: {
        ...state.resume,
        style: { ...state.resume.style, templateId },
      },
    }));
    get().triggerAutosave();
  },

  // Education CRUD
  addEducation: (item) => {
    const newItem: EducationItem = {
      id: "edu-" + Date.now(),
      degree: "B.Tech in Computer Science",
      institution: "State University",
      location: "New Delhi, India",
      startYear: "2021",
      endYear: "2025",
      gpa: "8.5 CGPA",
      coursework: "Data Structures, Database Management, Algorithms",
      ...item,
    };
    set((state) => ({
      resume: { ...state.resume, education: [...state.resume.education, newItem] },
    }));
    get().triggerAutosave();
  },

  updateEducation: (id, item) => {
    set((state) => ({
      resume: {
        ...state.resume,
        education: state.resume.education.map((e) => (e.id === id ? { ...e, ...item } : e)),
      },
    }));
    get().triggerAutosave();
  },

  removeEducation: (id) => {
    set((state) => ({
      resume: {
        ...state.resume,
        education: state.resume.education.filter((e) => e.id !== id),
      },
    }));
    get().triggerAutosave();
  },

  // Experience CRUD
  addExperience: (item) => {
    const newItem: ExperienceItem = {
      id: "exp-" + Date.now(),
      company: "Tech Corp",
      role: "Software Engineering Intern",
      location: "Remote",
      employmentType: "Internship",
      startDate: "May 2024",
      endDate: "August 2024",
      isCurrent: false,
      description: "Contributed to front-end development and API integration.",
      highlights: [
        "Constructed responsive UI components using React, improving application speed by 25%.",
        "Assisted with backend endpoints in Python and collaborated with the engineering team.",
      ],
      ...item,
    };
    set((state) => ({
      resume: { ...state.resume, experience: [...state.resume.experience, newItem] },
    }));
    get().triggerAutosave();
  },

  updateExperience: (id, item) => {
    set((state) => ({
      resume: {
        ...state.resume,
        experience: state.resume.experience.map((e) => (e.id === id ? { ...e, ...item } : e)),
      },
    }));
    get().triggerAutosave();
  },

  removeExperience: (id) => {
    set((state) => ({
      resume: {
        ...state.resume,
        experience: state.resume.experience.filter((e) => e.id !== id),
      },
    }));
    get().triggerAutosave();
  },

  // Project CRUD
  addProject: (item) => {
    const newItem: ProjectItem = {
      id: "proj-" + Date.now(),
      name: "New Software Project",
      description: "A full-stack web application built to streamline productivity.",
      technologies: ["React", "TypeScript", "Node.js", "PostgreSQL"],
      githubUrl: "https://github.com",
      liveUrl: "",
      projectType: "Personal",
      highlights: [
        "Architected modular microservices and automated end-to-end user workflows.",
        "Engineered scalable database models and optimized API response latencies.",
      ],
      ...item,
    };
    set((state) => ({
      resume: { ...state.resume, projects: [...state.resume.projects, newItem] },
    }));
    get().triggerAutosave();
  },

  updateProject: (id, item) => {
    set((state) => ({
      resume: {
        ...state.resume,
        projects: state.resume.projects.map((p) => (p.id === id ? { ...p, ...item } : p)),
      },
    }));
    get().triggerAutosave();
  },

  removeProject: (id) => {
    set((state) => ({
      resume: {
        ...state.resume,
        projects: state.resume.projects.filter((p) => p.id !== id),
      },
    }));
    get().triggerAutosave();
  },

  // Skills
  updateSkillCategory: (category, skills) => {
    set((state) => ({
      resume: {
        ...state.resume,
        skills: { ...state.resume.skills, [category]: skills },
      },
    }));
    get().triggerAutosave();
  },

  addSkillToCategory: (category, skill) => {
    const clean = skill.trim();
    if (!clean) return;
    set((state) => {
      const current = state.resume.skills[category] || [];
      if (current.includes(clean)) return state;
      return {
        resume: {
          ...state.resume,
          skills: { ...state.resume.skills, [category]: [...current, clean] },
        },
      };
    });
    get().triggerAutosave();
  },

  removeSkillFromCategory: (category, skill) => {
    set((state) => ({
      resume: {
        ...state.resume,
        skills: {
          ...state.resume.skills,
          [category]: (state.resume.skills[category] || []).filter((s) => s !== skill),
        },
      },
    }));
    get().triggerAutosave();
  },

  // Certifications
  addCertification: (item) => {
    const newItem: CertificationItem = {
      id: "cert-" + Date.now(),
      name: "Professional Cloud Certificate",
      issuer: "AWS / Google",
      issueDate: "2024",
      ...item,
    };
    set((state) => ({
      resume: { ...state.resume, certifications: [...state.resume.certifications, newItem] },
    }));
    get().triggerAutosave();
  },

  updateCertification: (id, item) => {
    set((state) => ({
      resume: {
        ...state.resume,
        certifications: state.resume.certifications.map((c) => (c.id === id ? { ...c, ...item } : c)),
      },
    }));
    get().triggerAutosave();
  },

  removeCertification: (id) => {
    set((state) => ({
      resume: {
        ...state.resume,
        certifications: state.resume.certifications.filter((c) => c.id !== id),
      },
    }));
    get().triggerAutosave();
  },

  // Achievements
  addAchievement: (item) => {
    const newItem: AchievementItem = {
      id: "ach-" + Date.now(),
      title: "Hackathon Finalist / Competition Winner",
      description: "Recognized among top teams for technical innovation.",
      date: "2024",
      ...item,
    };
    set((state) => ({
      resume: { ...state.resume, achievements: [...state.resume.achievements, newItem] },
    }));
    get().triggerAutosave();
  },

  updateAchievement: (id, item) => {
    set((state) => ({
      resume: {
        ...state.resume,
        achievements: state.resume.achievements.map((a) => (a.id === id ? { ...a, ...item } : a)),
      },
    }));
    get().triggerAutosave();
  },

  removeAchievement: (id) => {
    set((state) => ({
      resume: {
        ...state.resume,
        achievements: state.resume.achievements.filter((a) => a.id !== id),
      },
    }));
    get().triggerAutosave();
  },

  setATSAnalysis: (analysis) => {
    set((state) => ({
      resume: { ...state.resume, atsAnalysis: analysis },
    }));
  },

  setJobAnalysis: (analysis) => {
    set((state) => ({
      resume: { ...state.resume, jobAnalysis: analysis },
    }));
  },

  triggerAutosave: () => {
    set({ isSaving: true });
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(get().resume));
      }
      setTimeout(() => {
        set({ isSaving: false, lastSavedText: "Draft saved " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) });
      }, 400);
    } catch {
      set({ isSaving: false });
    }
  },

  loadSample: () => {
    set({ resume: sampleResumeData, activeStep: 0 });
    get().triggerAutosave();
  },

  loadBlank: () => {
    const blank: ResumeData = {
      id: "blank-" + Date.now(),
      title: "Untitled Resume",
      targetJob: {
        targetRole: "Software Engineer",
        experienceLevel: "Fresher",
        jobDescription: "",
      },
      personal: {
        fullName: "",
        headline: "",
        email: "",
        phone: "",
        location: "",
      },
      summary: "",
      education: [],
      experience: [],
      projects: [],
      skills: {
        languages: [],
        frameworks: [],
        databases: [],
        tools: [],
        cloud: [],
        aiml: [],
        softSkills: [],
        other: [],
      },
      certifications: [],
      achievements: [],
      activities: [],
      style: {
        templateId: "ats-professional",
        font: "inter",
        fontSize: "base",
        accentColor: "#1e3a8a",
        spacing: "normal",
        margins: "normal",
        sectionOrder: ["summary", "experience", "projects", "education", "skills"],
        showPhoto: false,
        layout: "single",
      },
    };
    set({ resume: blank, activeStep: 0 });
    get().triggerAutosave();
  },
}));
