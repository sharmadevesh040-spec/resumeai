import React from "react";
import { TemplateProps, getFontFamilyClass, getFontSizeClass, getSpacingClass, getMarginsClass } from "./types";

export const Creative: React.FC<TemplateProps> = ({ data, isMiniature }) => {
  const { personal, summary, education, experience, projects, skills, certifications, achievements, style } = data;
  const fontClass = getFontFamilyClass(style.font);
  const sizeClass = getFontSizeClass(style.fontSize);
  const spacingClass = getSpacingClass(style.spacing);
  const marginClass = isMiniature ? "p-4 text-[9px]" : getMarginsClass(style.margins);
  const accentColor = style.accentColor || "#7c3aed"; // Vibrant violet / purple

  return (
    <div
      className={`w-full bg-white text-zinc-900 ${fontClass} ${sizeClass.base} ${marginClass} shadow-sm print:shadow-none print:p-0 print:m-0`}
      style={{ minHeight: isMiniature ? "460px" : "1100px" }}
    >
      {/* Dynamic Header */}
      <header className="border-b-4 pb-4 mb-4" style={{ borderColor: accentColor }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <span
              className="text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded text-white inline-block mb-1"
              style={{ backgroundColor: accentColor }}
            >
              Portfolio & Profile
            </span>
            <h1 className={`${sizeClass.name} font-extrabold text-zinc-950 tracking-tight`}>
              {personal.fullName || "Your Full Name"}
            </h1>
            <p className="text-zinc-600 text-xs font-semibold mt-0.5">
              {personal.headline || "Creative Technologist & Product Designer"}
            </p>
          </div>
          <div className="text-xs text-zinc-600 mt-2 md:mt-0 text-left md:text-right space-y-0.5">
            <p>{personal.location} {personal.phone && `• ${personal.phone}`}</p>
            <p>
              <a href={`mailto:${personal.email}`} className="hover:underline">
                {personal.email}
              </a>
            </p>
            <div className="space-x-2 font-medium" style={{ color: accentColor }}>
              {personal.portfolio && (
                <a href={personal.portfolio} target="_blank" rel="noreferrer" className="hover:underline">
                  Portfolio ↗
                </a>
              )}
              {personal.linkedin && (
                <a href={personal.linkedin} target="_blank" rel="noreferrer" className="hover:underline">
                  LinkedIn ↗
                </a>
              )}
              {personal.github && (
                <a href={personal.github} target="_blank" rel="noreferrer" className="hover:underline">
                  GitHub ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Summary with stylistic callout border */}
      {summary && (
        <section className="mb-4 pl-3 border-l-4 rounded-r" style={{ borderColor: accentColor }}>
          <p className="text-zinc-800 text-xs leading-relaxed italic">{summary}</p>
        </section>
      )}

      {/* Two Column Layout for Creative */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Column (2 spans) */}
        <div className={`md:col-span-2 ${spacingClass.sectionGap}`}>
          {/* Experience */}
          {experience && experience.length > 0 && (
            <section>
              <h2 className={`${sizeClass.section} font-extrabold text-zinc-900 mb-2 pb-0.5 border-b-2`} style={{ borderColor: accentColor }}>
                Experience & Impact
              </h2>
              <div className={spacingClass.itemGap}>
                {experience.map((exp) => (
                  <div key={exp.id} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-zinc-950 text-xs">
                        {exp.role} <span className="font-normal text-zinc-600">at {exp.company}</span>
                      </span>
                      <span className="text-xs text-zinc-500">
                        {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                      </span>
                    </div>
                    {exp.highlights && (
                      <ul className={`list-disc list-outside ml-4 mt-1 text-zinc-800 text-xs ${spacingClass.bulletGap}`}>
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

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section>
              <h2 className={`${sizeClass.section} font-extrabold text-zinc-900 mb-2 pb-0.5 border-b-2`} style={{ borderColor: accentColor }}>
                Key Initiatives & Case Studies
              </h2>
              <div className={spacingClass.itemGap}>
                {projects.map((proj) => (
                  <div key={proj.id} className="text-xs break-inside-avoid">
                    <div className="flex justify-between items-baseline font-bold text-zinc-900">
                      <span>{proj.name}</span>
                      {proj.liveUrl && (
                        <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold hover:underline" style={{ color: accentColor }}>
                          View Case Study ↗
                        </a>
                      )}
                    </div>
                    {proj.technologies && (
                      <p className="text-zinc-500 text-[11px] mb-0.5">{proj.technologies.join(" • ")}</p>
                    )}
                    {proj.description && <p className="text-zinc-700">{proj.description}</p>}
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
        </div>

        {/* Sidebar Column (1 span) */}
        <div className={`md:col-span-1 space-y-4`}>
          {/* Skills */}
          <section className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2 pb-1 border-b border-zinc-200" style={{ color: accentColor }}>
              Expertise & Tools
            </h2>
            <div className="space-y-2 text-xs">
              {skills.languages?.length > 0 && (
                <div>
                  <p className="font-semibold text-zinc-800 text-[11px]">Languages</p>
                  <p className="text-zinc-600">{skills.languages.join(", ")}</p>
                </div>
              )}
              {skills.frameworks?.length > 0 && (
                <div>
                  <p className="font-semibold text-zinc-800 text-[11px]">Design & Frameworks</p>
                  <p className="text-zinc-600">{skills.frameworks.join(", ")}</p>
                </div>
              )}
              {skills.tools?.length > 0 && (
                <div>
                  <p className="font-semibold text-zinc-800 text-[11px]">Tools & Workflow</p>
                  <p className="text-zinc-600">{skills.tools.join(", ")}</p>
                </div>
              )}
              {skills.softSkills?.length > 0 && (
                <div>
                  <p className="font-semibold text-zinc-800 text-[11px]">Strengths</p>
                  <p className="text-zinc-600">{skills.softSkills.join(", ")}</p>
                </div>
              )}
            </div>
          </section>

          {/* Education */}
          {education && education.length > 0 && (
            <section className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2 pb-1 border-b border-zinc-200" style={{ color: accentColor }}>
                Education
              </h2>
              {education.map((edu) => (
                <div key={edu.id} className="text-xs mb-2 last:mb-0">
                  <p className="font-bold text-zinc-900">{edu.degree}</p>
                  <p className="text-zinc-600">{edu.institution}</p>
                  <p className="text-zinc-500 text-[11px]">
                    {edu.startYear} – {edu.endYear} {edu.gpa ? `(${edu.gpa})` : ""}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <section className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2 pb-1 border-b border-zinc-200" style={{ color: accentColor }}>
                Credentials
              </h2>
              <div className="text-xs space-y-1">
                {certifications.map((c) => (
                  <p key={c.id}>
                    <span className="font-semibold text-zinc-900">{c.name}</span>
                    <br />
                    <span className="text-zinc-500 text-[11px]">{c.issuer}</span>
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
