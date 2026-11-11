import React from "react";
import { TemplateProps, getFontFamilyClass, getFontSizeClass, getSpacingClass, getMarginsClass } from "./types";

export const Executive: React.FC<TemplateProps> = ({ data, isMiniature }) => {
  const { personal, summary, education, experience, projects, skills, certifications, achievements, style } = data;
  const fontClass = getFontFamilyClass(style.font || "merriweather");
  const sizeClass = getFontSizeClass(style.fontSize);
  const spacingClass = getSpacingClass(style.spacing);
  const marginClass = isMiniature ? "p-4 text-[9px]" : getMarginsClass(style.margins);
  const accentColor = style.accentColor || "#1e293b"; // Slate-900 / Navy

  return (
    <div
      className={`w-full bg-white text-zinc-900 ${fontClass} ${sizeClass.base} ${marginClass} shadow-sm print:shadow-none print:p-0 print:m-0`}
      style={{ minHeight: isMiniature ? "460px" : "1100px" }}
    >
      {/* Header */}
      <header className="border-b-2 pb-4 mb-4" style={{ borderColor: accentColor }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <h1 className={`${sizeClass.name} font-serif tracking-tight text-zinc-950 uppercase`}>
              {personal.fullName || "Your Full Name"}
            </h1>
            <p className="text-xs uppercase tracking-widest font-semibold text-zinc-600 mt-1">
              {personal.headline || "Executive Leadership & Technology Strategist"}
            </p>
          </div>
          <div className="text-xs text-zinc-600 mt-2 md:mt-0 text-left md:text-right space-y-0.5">
            <p>
              {personal.location} {personal.phone && `• ${personal.phone}`}
            </p>
            <p>
              <a href={`mailto:${personal.email}`} className="hover:underline">
                {personal.email}
              </a>
              {personal.linkedin && (
                <>
                  {" "}
                  •{" "}
                  <a href={personal.linkedin} target="_blank" rel="noreferrer" className="hover:underline">
                    LinkedIn
                  </a>
                </>
              )}
            </p>
          </div>
        </div>
      </header>

      {/* Executive Summary */}
      {summary && (
        <section className="mb-4">
          <h2 className={`${sizeClass.section} font-serif font-bold text-zinc-900 mb-1 border-b border-zinc-200 pb-0.5`}>
            Executive Summary
          </h2>
          <p className="text-xs text-zinc-800 leading-relaxed text-justify font-serif">{summary}</p>
        </section>
      )}

      {/* Core Leadership & Technical Competencies */}
      <section className="mb-4 bg-zinc-50 border-t border-b border-zinc-200 py-2">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-800 mb-1">
          Core Competencies & Executive Capabilities
        </h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-700">
          {[
            ...(skills.other || []),
            ...(skills.softSkills || []),
            ...(skills.frameworks || []),
            ...(skills.languages || []),
          ]
            .slice(0, 10)
            .map((comp, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                {comp}
              </span>
            ))}
        </div>
      </section>

      <div className={spacingClass.sectionGap}>
        {/* Executive Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className={`${sizeClass.section} font-serif font-bold text-zinc-900 mb-2 border-b border-zinc-200 pb-0.5`}>
              Executive & Professional Experience
            </h2>
            <div className={spacingClass.itemGap}>
              {experience.map((exp) => (
                <div key={exp.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-zinc-900 text-xs">
                      {exp.role.toUpperCase()} — <span className="font-medium text-zinc-700">{exp.company}</span>
                    </span>
                    <span className="text-xs text-zinc-500 font-serif">
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

        {/* Strategic Initiatives & Projects */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className={`${sizeClass.section} font-serif font-bold text-zinc-900 mb-2 border-b border-zinc-200 pb-0.5`}>
              Strategic Initiatives & Projects
            </h2>
            <div className={spacingClass.itemGap}>
              {projects.map((proj) => (
                <div key={proj.id} className="text-xs break-inside-avoid">
                  <div className="flex justify-between font-bold text-zinc-900">
                    <span>{proj.name}</span>
                    {proj.technologies && (
                      <span className="font-normal text-zinc-500">{proj.technologies.join(", ")}</span>
                    )}
                  </div>
                  {proj.description && <p className="text-zinc-700 mt-0.5">{proj.description}</p>}
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

        {/* Education & Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {education && education.length > 0 && (
            <section>
              <h2 className={`${sizeClass.section} font-serif font-bold text-zinc-900 mb-2 border-b border-zinc-200 pb-0.5`}>
                Education
              </h2>
              {education.map((edu) => (
                <div key={edu.id} className="text-xs">
                  <p className="font-bold text-zinc-900">{edu.degree}</p>
                  <p className="text-zinc-700">{edu.institution}</p>
                  <p className="text-zinc-500 font-serif">
                    {edu.startYear} – {edu.endYear} {edu.gpa ? `| ${edu.gpa}` : ""}
                  </p>
                </div>
              ))}
            </section>
          )}

          {((certifications && certifications.length > 0) || (achievements && achievements.length > 0)) && (
            <section>
              <h2 className={`${sizeClass.section} font-serif font-bold text-zinc-900 mb-2 border-b border-zinc-200 pb-0.5`}>
                Credentials & Honors
              </h2>
              <div className="text-xs space-y-1 text-zinc-700">
                {certifications?.map((c) => (
                  <p key={c.id}>
                    <strong>• {c.name}:</strong> {c.issuer}
                  </p>
                ))}
                {achievements?.map((a) => (
                  <p key={a.id}>
                    <strong>• {a.title}</strong>
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
