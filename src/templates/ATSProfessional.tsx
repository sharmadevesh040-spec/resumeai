import React from "react";
import {
  TemplateProps,
  getFontFamilyClass,
  getFontSizeClass,
  getSpacingClass,
  getMarginsClass,
  getEffectiveSectionOrder,
} from "./types";

export const ATSProfessional: React.FC<TemplateProps> = ({ data, isMiniature }) => {
  const { personal, summary, education, experience, projects, skills, certifications, achievements, activities, style } = data;
  const fontClass = getFontFamilyClass(style.font);
  const sizeClass = getFontSizeClass(style.fontSize);
  const spacingClass = getSpacingClass(style.spacing);
  const marginClass = isMiniature ? "p-4 text-[9px]" : getMarginsClass(style.margins);
  const accentColor = style.accentColor || "#1e3a8a";

  const allSkills = [
    skills.languages?.length && `Languages: ${skills.languages.join(", ")}`,
    skills.frameworks?.length && `Frameworks: ${skills.frameworks.join(", ")}`,
    skills.databases?.length && `Databases: ${skills.databases.join(", ")}`,
    skills.tools?.length && `Developer Tools: ${skills.tools.join(", ")}`,
    skills.cloud?.length && `Cloud & DevOps: ${skills.cloud.join(", ")}`,
    skills.aiml?.length && `AI / ML: ${skills.aiml.join(", ")}`,
    skills.other?.length && `Core Competencies: ${skills.other.join(", ")}`,
  ].filter(Boolean);

  const activeOrder = getEffectiveSectionOrder(style.sectionOrder);

  const sectionMap: Record<string, React.ReactNode> = {
    summary: summary ? (
      <section key="summary">
        <h2
          className={`${sizeClass.section} pb-1 border-b mb-2 font-bold`}
          style={{ color: accentColor, borderColor: accentColor }}
        >
          Professional Summary
        </h2>
        <p className="text-zinc-800 leading-relaxed text-justify">{summary}</p>
      </section>
    ) : null,

    experience: experience && experience.length > 0 ? (
      <section key="experience">
        <h2
          className={`${sizeClass.section} pb-1 border-b mb-2 font-bold`}
          style={{ color: accentColor, borderColor: accentColor }}
        >
          Professional Experience
        </h2>
        <div className={spacingClass.itemGap}>
          {experience.map((exp) => (
            <div key={exp.id} className="break-inside-avoid">
              <div className="flex justify-between items-baseline flex-wrap">
                <span className="font-bold text-zinc-950">
                  {exp.role} <span className="font-normal text-zinc-700">| {exp.company}</span>
                </span>
                <span className="text-xs text-zinc-600 font-medium">
                  {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate} {exp.location ? `| ${exp.location}` : ""}
                </span>
              </div>
              {exp.highlights && exp.highlights.length > 0 && (
                <ul className={`list-disc list-outside ml-4 mt-1 text-zinc-800 ${spacingClass.bulletGap}`}>
                  {exp.highlights.map((bullet, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {bullet}
                    </li>
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
        <h2
          className={`${sizeClass.section} pb-1 border-b mb-2 font-bold`}
          style={{ color: accentColor, borderColor: accentColor }}
        >
          Key Projects
        </h2>
        <div className={spacingClass.itemGap}>
          {projects.map((proj) => (
            <div key={proj.id} className="break-inside-avoid">
              <div className="flex justify-between items-baseline flex-wrap">
                <span className="font-bold text-zinc-950">
                  {proj.name}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <span className="font-normal text-xs text-zinc-700 ml-2">
                      ({proj.technologies.join(", ")})
                    </span>
                  )}
                </span>
                {(proj.githubUrl || proj.liveUrl) && (
                  <span className="text-xs text-blue-700 space-x-2">
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="hover:underline">
                        Demo
                      </a>
                    )}
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="hover:underline">
                        Code
                      </a>
                    )}
                  </span>
                )}
              </div>
              {proj.description && (
                <p className="text-zinc-800 text-xs mt-0.5 leading-relaxed">{proj.description}</p>
              )}
              {proj.highlights && proj.highlights.length > 0 && (
                <ul className={`list-disc list-outside ml-4 mt-1 text-zinc-800 ${spacingClass.bulletGap}`}>
                  {proj.highlights.map((bullet, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,

    education: education && education.length > 0 ? (
      <section key="education">
        <h2
          className={`${sizeClass.section} pb-1 border-b mb-2 font-bold`}
          style={{ color: accentColor, borderColor: accentColor }}
        >
          Education
        </h2>
        <div className={spacingClass.itemGap}>
          {education.map((edu) => (
            <div key={edu.id} className="break-inside-avoid">
              <div className="flex justify-between items-baseline flex-wrap">
                <span className="font-bold text-zinc-950">{edu.institution}</span>
                <span className="text-xs text-zinc-600 font-medium">
                  {edu.startYear} – {edu.endYear} {edu.location ? `| ${edu.location}` : ""}
                </span>
              </div>
              <div className="text-zinc-800 flex justify-between text-xs flex-wrap">
                <span>{edu.degree}</span>
                {edu.gpa && <span className="font-semibold text-zinc-700">{edu.gpa}</span>}
              </div>
              {edu.coursework && (
                <p className="text-xs text-zinc-600 mt-0.5">
                  <span className="font-semibold text-zinc-700">Coursework:</span> {edu.coursework}
                </p>
              )}
              {edu.achievements && (
                <p className="text-xs text-zinc-600 mt-0.5">
                  <span className="font-semibold text-zinc-700">Honors:</span> {edu.achievements}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,

    skills: allSkills.length > 0 ? (
      <section key="skills" className="break-inside-avoid">
        <h2
          className={`${sizeClass.section} pb-1 border-b mb-2 font-bold`}
          style={{ color: accentColor, borderColor: accentColor }}
        >
          Technical Skills
        </h2>
        <div className="space-y-1 text-xs text-zinc-800">
          {allSkills.map((line, idx) => (
            <p key={idx} className="leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      </section>
    ) : null,

    certifications: certifications && certifications.length > 0 ? (
      <section key="certifications" className="break-inside-avoid">
        <h2
          className={`${sizeClass.section} pb-1 border-b mb-2 font-bold`}
          style={{ color: accentColor, borderColor: accentColor }}
        >
          Certifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {certifications.map((c) => (
            <div key={c.id}>
              <span className="font-bold text-zinc-900">• {c.name}</span>
              <span className="text-zinc-600"> — {c.issuer} ({c.issueDate})</span>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    achievements: achievements && achievements.length > 0 ? (
      <section key="achievements" className="break-inside-avoid">
        <h2
          className={`${sizeClass.section} pb-1 border-b mb-2 font-bold`}
          style={{ color: accentColor, borderColor: accentColor }}
        >
          Honors & Achievements
        </h2>
        <div className="space-y-1.5 text-xs">
          {achievements.map((a) => (
            <div key={a.id}>
              <span className="font-bold text-zinc-900">• {a.title}</span>
              {a.organization && <span className="text-zinc-600"> — {a.organization}</span>}
              {a.description && <p className="text-zinc-700 text-xs mt-0.5 ml-3">{a.description}</p>}
            </div>
          ))}
        </div>
      </section>
    ) : null,
  };

  return (
    <div
      className={`w-full bg-white text-zinc-900 ${fontClass} ${sizeClass.base} ${marginClass} shadow-sm print:shadow-none print:p-0 print:m-0`}
      style={{ minHeight: isMiniature ? "460px" : "1100px" }}
    >
      {/* Header */}
      <header className="border-b pb-4 text-center border-zinc-300">
        <h1 className={`${sizeClass.name} text-zinc-950 uppercase tracking-wide font-bold`}>
          {personal.fullName || "Your Full Name"}
        </h1>
        {personal.headline && (
          <p className="text-zinc-700 font-medium text-xs mt-0.5 tracking-wide">
            {personal.headline}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-zinc-600 text-xs mt-1.5">
          {personal.location && <span>{personal.location}</span>}
          {personal.email && (
            <>
              <span>•</span>
              <a href={`mailto:${personal.email}`} className="hover:underline">
                {personal.email}
              </a>
            </>
          )}
          {personal.phone && (
            <>
              <span>•</span>
              <span>{personal.phone}</span>
            </>
          )}
          {personal.linkedin && (
            <>
              <span>•</span>
              <a href={personal.linkedin} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                LinkedIn
              </a>
            </>
          )}
          {personal.github && (
            <>
              <span>•</span>
              <a href={personal.github} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                GitHub
              </a>
            </>
          )}
          {personal.portfolio && (
            <>
              <span>•</span>
              <a href={personal.portfolio} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                Portfolio
              </a>
            </>
          )}
        </div>
      </header>

      {/* Main Content Sections (Dynamic Order) */}
      <div className={`mt-4 ${spacingClass.sectionGap}`}>
        {activeOrder.map((sectionKey) => (
          <React.Fragment key={sectionKey}>
            {sectionMap[sectionKey]}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
