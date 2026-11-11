import React from "react";
import {
  TemplateProps,
  getFontFamilyClass,
  getFontSizeClass,
  getSpacingClass,
  getMarginsClass,
  getEffectiveSectionOrder,
} from "./types";

export const ModernMinimal: React.FC<TemplateProps> = ({ data, isMiniature }) => {
  const { personal, summary, education, experience, projects, skills, certifications, achievements, style } = data;
  const fontClass = getFontFamilyClass(style.font);
  const sizeClass = getFontSizeClass(style.fontSize);
  const spacingClass = getSpacingClass(style.spacing);
  const marginClass = isMiniature ? "p-4 text-[9px]" : getMarginsClass(style.margins);
  const accentColor = style.accentColor || "#2563eb";

  const allSkills = [
    ...(skills.languages || []),
    ...(skills.frameworks || []),
    ...(skills.databases || []),
    ...(skills.tools || []),
    ...(skills.cloud || []),
    ...(skills.aiml || []),
  ];

  const activeOrder = getEffectiveSectionOrder(style.sectionOrder);

  const sectionMap: Record<string, React.ReactNode> = {
    summary: summary ? (
      <section key="summary" className="mb-2">
        <p className="text-slate-700 leading-relaxed font-light">{summary}</p>
      </section>
    ) : null,

    experience: experience && experience.length > 0 ? (
      <section key="experience">
        <h2 className={`${sizeClass.section} font-bold text-slate-900 mb-2 flex items-center gap-2`}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }}></span>
          Experience
        </h2>
        <div className={spacingClass.itemGap}>
          {experience.map((exp) => (
            <div key={exp.id} className="border-l-2 pl-3 border-slate-200">
              <div className="flex justify-between items-baseline flex-wrap">
                <span className="font-semibold text-slate-900">
                  {exp.role} <span className="font-normal text-slate-600">• {exp.company}</span>
                </span>
                <span className="text-xs text-slate-500">
                  {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                </span>
              </div>
              {exp.highlights && (
                <ul className={`list-disc list-outside ml-4 mt-1 text-slate-700 ${spacingClass.bulletGap}`}>
                  {exp.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,

    projects: projects && projects.length > 0 ? (
      <section key="projects">
        <h2 className={`${sizeClass.section} font-bold text-slate-900 mb-2 flex items-center gap-2`}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }}></span>
          Featured Projects
        </h2>
        <div className={spacingClass.itemGap}>
          {projects.map((proj) => (
            <div key={proj.id} className="border-l-2 pl-3 border-slate-200">
              <div className="flex justify-between items-baseline flex-wrap">
                <span className="font-semibold text-slate-900">
                  {proj.name}
                  {proj.technologies && (
                    <span className="font-normal text-xs text-slate-500 ml-2">
                      [{proj.technologies.join(" · ")}]
                    </span>
                  )}
                </span>
                {proj.githubUrl && (
                  <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-xs hover:underline font-medium" style={{ color: accentColor }}>
                    Source ↗
                  </a>
                )}
              </div>
              {proj.description && <p className="text-xs text-slate-600 mt-0.5">{proj.description}</p>}
              {proj.highlights && (
                <ul className={`list-disc list-outside ml-4 mt-1 text-slate-700 ${spacingClass.bulletGap}`}>
                  {proj.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,

    skills: allSkills.length > 0 ? (
      <section key="skills">
        <h2 className={`${sizeClass.section} font-bold text-slate-900 mb-2 flex items-center gap-2`}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }}></span>
          Core Competencies
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {allSkills.map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
    ) : null,

    education: education && education.length > 0 ? (
      <section key="education">
        <h2 className={`${sizeClass.section} font-bold text-slate-900 mb-2 flex items-center gap-2`}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }}></span>
          Education
        </h2>
        <div className="space-y-2">
          {education.map((edu) => (
            <div key={edu.id}>
              <p className="font-semibold text-slate-900 text-xs">{edu.institution}</p>
              <p className="text-xs text-slate-600">{edu.degree}</p>
              <p className="text-xs text-slate-500">
                {edu.startYear} – {edu.endYear} {edu.gpa ? `| ${edu.gpa}` : ""}
              </p>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    certifications: certifications && certifications.length > 0 ? (
      <section key="certifications">
        <h2 className={`${sizeClass.section} font-bold text-slate-900 mb-2 flex items-center gap-2`}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }}></span>
          Certifications
        </h2>
        <div className="space-y-1.5 text-xs text-slate-700">
          {certifications.map((c) => (
            <div key={c.id}>
              <span className="font-semibold text-slate-900">• {c.name}</span>
              <span className="text-slate-500"> — {c.issuer} ({c.issueDate})</span>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    achievements: achievements && achievements.length > 0 ? (
      <section key="achievements">
        <h2 className={`${sizeClass.section} font-bold text-slate-900 mb-2 flex items-center gap-2`}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }}></span>
          Honors & Awards
        </h2>
        <div className="space-y-1.5 text-xs text-slate-700">
          {achievements.map((a) => (
            <div key={a.id}>
              <span className="font-semibold text-slate-900">• {a.title}</span>
              {a.organization && <span className="text-slate-500"> — {a.organization}</span>}
            </div>
          ))}
        </div>
      </section>
    ) : null,
  };

  return (
    <div
      className={`w-full bg-white text-slate-800 ${fontClass} ${sizeClass.base} ${marginClass} shadow-sm print:shadow-none print:p-0 print:m-0`}
      style={{ minHeight: isMiniature ? "460px" : "1100px" }}
    >
      {/* Sleek Minimalist Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b-2 pb-4 mb-4" style={{ borderColor: accentColor }}>
        <div>
          <h1 className={`${sizeClass.name} text-slate-900 font-extrabold tracking-tight`}>
            {personal.fullName || "Your Full Name"}
          </h1>
          {personal.headline && (
            <p className="text-slate-600 font-medium text-xs mt-0.5 tracking-normal">
              {personal.headline}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-500 text-xs mt-2 md:mt-0 text-left md:text-right">
          {personal.email && (
            <a href={`mailto:${personal.email}`} className="hover:text-slate-900 transition-colors">
              {personal.email}
            </a>
          )}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && (
            <a href={personal.linkedin} target="_blank" rel="noreferrer" className="hover:underline font-medium" style={{ color: accentColor }}>
              LinkedIn
            </a>
          )}
          {personal.github && (
            <a href={personal.github} target="_blank" rel="noreferrer" className="hover:underline font-medium" style={{ color: accentColor }}>
              GitHub
            </a>
          )}
        </div>
      </header>

      {/* Main Content Sections (Dynamic Order) */}
      <div className={spacingClass.sectionGap}>
        {activeOrder.map((sectionKey) => (
          <React.Fragment key={sectionKey}>
            {sectionMap[sectionKey]}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
