import React from "react";
import { TemplateProps, getFontFamilyClass, getFontSizeClass, getSpacingClass, getMarginsClass } from "./types";

export const Student: React.FC<TemplateProps> = ({ data, isMiniature }) => {
  const { personal, summary, education, experience, projects, skills, certifications, achievements, activities, style } = data;
  const fontClass = getFontFamilyClass(style.font);
  const sizeClass = getFontSizeClass(style.fontSize);
  const spacingClass = getSpacingClass(style.spacing);
  const marginClass = isMiniature ? "p-4 text-[9px]" : getMarginsClass(style.margins);
  const accentColor = style.accentColor || "#4338ca"; // Indigo

  return (
    <div
      className={`w-full bg-white text-zinc-900 ${fontClass} ${sizeClass.base} ${marginClass} shadow-sm print:shadow-none print:p-0 print:m-0`}
      style={{ minHeight: isMiniature ? "460px" : "1100px" }}
    >
      {/* Header */}
      <header className="text-center pb-3 border-b-2 border-indigo-700 mb-3" style={{ borderColor: accentColor }}>
        <h1 className={`${sizeClass.name} font-bold text-zinc-900`}>{personal.fullName || "Your Full Name"}</h1>
        {personal.headline && <p className="text-zinc-600 text-xs font-medium mt-0.5">{personal.headline}</p>}
        <div className="flex flex-wrap justify-center gap-x-2 text-xs text-zinc-500 mt-1">
          {personal.location && <span>{personal.location}</span>}
          {personal.email && (
            <>
              <span>•</span>
              <a href={`mailto:${personal.email}`} className="text-indigo-700 hover:underline">
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
              <a href={personal.linkedin} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline">
                LinkedIn
              </a>
            </>
          )}
          {personal.github && (
            <>
              <span>•</span>
              <a href={personal.github} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline">
                GitHub
              </a>
            </>
          )}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-3 text-xs leading-relaxed text-zinc-700">
          <p>{summary}</p>
        </section>
      )}

      <div className={spacingClass.sectionGap}>
        {/* Education (Top priority for students) */}
        {education && education.length > 0 && (
          <section>
            <h2 className={`${sizeClass.section} font-bold text-indigo-900 border-b pb-0.5 mb-2`} style={{ color: accentColor }}>
              Education
            </h2>
            <div className={spacingClass.itemGap}>
              {education.map((edu) => (
                <div key={edu.id} className="text-xs">
                  <div className="flex justify-between font-bold text-zinc-900">
                    <span>{edu.institution}</span>
                    <span>{edu.startYear} – {edu.endYear}</span>
                  </div>
                  <div className="flex justify-between text-zinc-700 font-medium">
                    <span>{edu.degree}</span>
                    {edu.gpa && <span className="font-semibold text-indigo-900">{edu.gpa}</span>}
                  </div>
                  {edu.coursework && (
                    <p className="text-zinc-600 mt-0.5">
                      <span className="font-semibold text-zinc-800">Relevant Coursework:</span> {edu.coursework}
                    </p>
                  )}
                  {edu.achievements && (
                    <p className="text-zinc-600 mt-0.5">
                      <span className="font-semibold text-zinc-800">Honors:</span> {edu.achievements}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical Projects */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className={`${sizeClass.section} font-bold text-indigo-900 border-b pb-0.5 mb-2`} style={{ color: accentColor }}>
              Technical & Capstone Projects
            </h2>
            <div className={spacingClass.itemGap}>
              {projects.map((proj) => (
                <div key={proj.id} className="text-xs break-inside-avoid">
                  <div className="flex justify-between items-baseline flex-wrap">
                    <span className="font-bold text-zinc-900">
                      {proj.name}
                      {proj.technologies && (
                        <span className="font-normal text-zinc-600 ml-1.5">
                          | {proj.technologies.join(", ")}
                        </span>
                      )}
                    </span>
                    <div className="space-x-2">
                      {proj.liveUrl && (
                        <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline font-medium">
                          Demo
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline font-medium">
                          Code
                        </a>
                      )}
                    </div>
                  </div>
                  {proj.highlights && (
                    <ul className={`list-disc list-outside ml-4 mt-1 text-zinc-700 ${spacingClass.bulletGap}`}>
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

        {/* Experience / Internships */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className={`${sizeClass.section} font-bold text-indigo-900 border-b pb-0.5 mb-2`} style={{ color: accentColor }}>
              Experience & Internships
            </h2>
            <div className={spacingClass.itemGap}>
              {experience.map((exp) => (
                <div key={exp.id} className="text-xs break-inside-avoid">
                  <div className="flex justify-between font-bold text-zinc-900">
                    <span>{exp.role} — {exp.company}</span>
                    <span className="font-normal text-zinc-500">{exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}</span>
                  </div>
                  {exp.highlights && (
                    <ul className={`list-disc list-outside ml-4 mt-1 text-zinc-700 ${spacingClass.bulletGap}`}>
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

        {/* Skills */}
        <section>
          <h2 className={`${sizeClass.section} font-bold text-indigo-900 border-b pb-0.5 mb-2`} style={{ color: accentColor }}>
            Technical & Soft Skills
          </h2>
          <div className="text-xs space-y-1 text-zinc-700">
            {skills.languages?.length > 0 && (
              <p><strong className="text-zinc-900">Languages:</strong> {skills.languages.join(", ")}</p>
            )}
            {skills.frameworks?.length > 0 && (
              <p><strong className="text-zinc-900">Frameworks & Libraries:</strong> {skills.frameworks.join(", ")}</p>
            )}
            {skills.tools?.length > 0 && (
              <p><strong className="text-zinc-900">Tools & Platforms:</strong> {skills.tools.join(", ")}</p>
            )}
            {skills.softSkills?.length > 0 && (
              <p><strong className="text-zinc-900">Soft Skills:</strong> {skills.softSkills.join(", ")}</p>
            )}
          </div>
        </section>

        {/* Honors, Hackathons & Activities */}
        {((achievements && achievements.length > 0) || (activities && activities.length > 0)) && (
          <section>
            <h2 className={`${sizeClass.section} font-bold text-indigo-900 border-b pb-0.5 mb-2`} style={{ color: accentColor }}>
              Hackathons & Extracurricular Leadership
            </h2>
            <div className="text-xs space-y-1 text-zinc-700">
              {achievements?.map((a) => (
                <p key={a.id}>
                  <strong className="text-zinc-900">• {a.title}:</strong> {a.description}
                </p>
              ))}
              {activities?.map((act) => (
                <p key={act.id}>
                  <strong className="text-zinc-900">• {act.role} ({act.organization}):</strong> {act.description}
                </p>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
