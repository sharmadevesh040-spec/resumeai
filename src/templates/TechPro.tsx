import React from "react";
import { TemplateProps, getFontFamilyClass, getFontSizeClass, getSpacingClass, getMarginsClass } from "./types";

export const TechPro: React.FC<TemplateProps> = ({ data, isMiniature }) => {
  const { personal, summary, education, experience, projects, skills, certifications, achievements, style } = data;
  const fontClass = getFontFamilyClass(style.font);
  const sizeClass = getFontSizeClass(style.fontSize);
  const spacingClass = getSpacingClass(style.spacing);
  const marginClass = isMiniature ? "p-4 text-[9px]" : getMarginsClass(style.margins);
  const accentColor = style.accentColor || "#0f766e"; // Deep teal/cyan tech accent

  return (
    <div
      className={`w-full bg-white text-zinc-900 ${fontClass} ${sizeClass.base} ${marginClass} shadow-sm print:shadow-none print:p-0 print:m-0`}
      style={{ minHeight: isMiniature ? "460px" : "1100px" }}
    >
      {/* Header */}
      <header className="border-b-2 pb-3 mb-4 flex flex-col md:flex-row md:items-center justify-between" style={{ borderColor: accentColor }}>
        <div>
          <h1 className={`${sizeClass.name} font-black text-zinc-950 uppercase tracking-tight`}>
            {personal.fullName || "Your Full Name"}
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800" style={{ color: accentColor }}>
            {personal.headline || "Software Engineer / Technical Specialist"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-zinc-600 mt-2 md:mt-0 font-mono">
          {personal.email && (
            <a href={`mailto:${personal.email}`} className="hover:text-zinc-900">
              {personal.email}
            </a>
          )}
          {personal.phone && <span>• {personal.phone}</span>}
          {personal.github && (
            <span>
              •{" "}
              <a href={personal.github} target="_blank" rel="noreferrer" className="text-teal-700 font-semibold hover:underline">
                git/github
              </a>
            </span>
          )}
          {personal.portfolio && (
            <span>
              •{" "}
              <a href={personal.portfolio} target="_blank" rel="noreferrer" className="text-teal-700 font-semibold hover:underline">
                portfolio
              </a>
            </span>
          )}
        </div>
      </header>

      {/* Technical Skills Header Spotlight */}
      <section className="mb-4 bg-zinc-50 border border-zinc-200 p-2.5 rounded text-xs">
        <h2 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] mb-1.5 font-mono" style={{ color: accentColor }}>
          &gt; Technical Expertise
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-zinc-800">
          {skills.languages?.length > 0 && (
            <p>
              <span className="font-semibold text-zinc-950 font-mono">Languages:</span> {skills.languages.join(", ")}
            </p>
          )}
          {skills.frameworks?.length > 0 && (
            <p>
              <span className="font-semibold text-zinc-950 font-mono">Frameworks:</span> {skills.frameworks.join(", ")}
            </p>
          )}
          {skills.databases?.length > 0 && (
            <p>
              <span className="font-semibold text-zinc-950 font-mono">Databases:</span> {skills.databases.join(", ")}
            </p>
          )}
          {skills.cloud?.length > 0 && (
            <p>
              <span className="font-semibold text-zinc-950 font-mono">Cloud / Infra:</span> {skills.cloud.join(", ")}
            </p>
          )}
          {skills.tools?.length > 0 && (
            <p>
              <span className="font-semibold text-zinc-950 font-mono">Developer Tools:</span> {skills.tools.join(", ")}
            </p>
          )}
          {skills.aiml?.length > 0 && (
            <p>
              <span className="font-semibold text-zinc-950 font-mono">AI / Machine Learning:</span> {skills.aiml.join(", ")}
            </p>
          )}
        </div>
      </section>

      {/* Summary */}
      {summary && (
        <section className="mb-4">
          <p className="text-zinc-800 text-xs leading-relaxed">{summary}</p>
        </section>
      )}

      <div className={spacingClass.sectionGap}>
        {/* Projects Priority for Tech */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className={`${sizeClass.section} font-bold text-zinc-900 border-b border-zinc-200 pb-1 mb-2 font-mono flex items-center justify-between`}>
              <span>// Software Engineering Projects</span>
            </h2>
            <div className={spacingClass.itemGap}>
              {projects.map((proj) => (
                <div key={proj.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline flex-wrap">
                    <span className="font-bold text-zinc-950">
                      {proj.name}
                      {proj.technologies && (
                        <span className="font-mono text-xs font-normal text-teal-800 ml-2" style={{ color: accentColor }}>
                          [{proj.technologies.join(" | ")}]
                        </span>
                      )}
                    </span>
                    <div className="text-xs space-x-2 font-mono">
                      {proj.githubUrl && (
                        <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">
                          [GitHub]
                        </a>
                      )}
                      {proj.liveUrl && (
                        <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">
                          [Live Demo]
                        </a>
                      )}
                    </div>
                  </div>
                  {proj.description && <p className="text-xs text-zinc-700 mt-0.5">{proj.description}</p>}
                  {proj.highlights && (
                    <ul className={`list-disc list-outside ml-4 mt-1 text-zinc-800 ${spacingClass.bulletGap}`}>
                      {proj.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className={`${sizeClass.section} font-bold text-zinc-900 border-b border-zinc-200 pb-1 mb-2 font-mono`}>
              // Professional Experience
            </h2>
            <div className={spacingClass.itemGap}>
              {experience.map((exp) => (
                <div key={exp.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline flex-wrap">
                    <span className="font-bold text-zinc-950">
                      {exp.role} <span className="font-normal text-zinc-600">@ {exp.company}</span>
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                    </span>
                  </div>
                  {exp.highlights && (
                    <ul className={`list-disc list-outside ml-4 mt-1 text-zinc-800 ${spacingClass.bulletGap}`}>
                      {exp.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Certs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {education && education.length > 0 && (
            <section>
              <h2 className={`${sizeClass.section} font-bold text-zinc-900 border-b border-zinc-200 pb-1 mb-2 font-mono`}>
                // Education
              </h2>
              {education.map((edu) => (
                <div key={edu.id} className="text-xs">
                  <p className="font-bold text-zinc-900">{edu.institution}</p>
                  <p className="text-zinc-700">{edu.degree}</p>
                  <p className="text-zinc-500 font-mono">
                    {edu.startYear} – {edu.endYear} {edu.gpa ? `| CGPA: ${edu.gpa}` : ""}
                  </p>
                </div>
              ))}
            </section>
          )}

          {((certifications && certifications.length > 0) || (achievements && achievements.length > 0)) && (
            <section>
              <h2 className={`${sizeClass.section} font-bold text-zinc-900 border-b border-zinc-200 pb-1 mb-2 font-mono`}>
                // Certifications & Awards
              </h2>
              <div className="text-xs space-y-1">
                {certifications?.map((c) => (
                  <p key={c.id}>
                    <span className="font-semibold text-zinc-900">• {c.name}</span>
                    <span className="text-zinc-500"> ({c.issuer})</span>
                  </p>
                ))}
                {achievements?.map((a) => (
                  <p key={a.id}>
                    <span className="font-semibold text-zinc-900">• {a.title}</span>
                  </p>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
