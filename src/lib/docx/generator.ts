import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  ExternalHyperlink,
} from "docx";
import { ResumeData } from "@/types/resume";

export async function generateResumeDocx(resume: ResumeData): Promise<Buffer> {
  const { personal, summary, education, experience, projects, skills, certifications, achievements } = resume;

  const children: Paragraph[] = [];

  // Header: Full Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: (personal.fullName || "Resume").toUpperCase(),
          bold: true,
          size: 32, // 16pt
          font: "Arial",
          color: "111827",
        }),
      ],
    })
  );

  // Headline
  if (personal.headline) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: personal.headline,
            italics: true,
            size: 20, // 10pt
            font: "Arial",
            color: "4B5563",
          }),
        ],
      })
    );
  }

  // Contact line
  const contactParts: string[] = [];
  if (personal.location) contactParts.push(personal.location);
  if (personal.email) contactParts.push(personal.email);
  if (personal.phone) contactParts.push(personal.phone);
  if (personal.linkedin) contactParts.push("LinkedIn");
  if (personal.github) contactParts.push("GitHub");
  if (personal.portfolio) contactParts.push("Portfolio");

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      border: {
        bottom: {
          color: "D1D5DB",
          space: 8,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [
        new TextRun({
          text: contactParts.join("  |  "),
          size: 18, // 9pt
          font: "Arial",
          color: "374151",
        }),
      ],
    })
  );

  // Helper for section headings
  const addSectionHeader = (title: string) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: "1F2937",
            space: 4,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 22, // 11pt
            font: "Arial",
            color: "1F2937",
          }),
        ],
      })
    );
  };

  const defaultOrder = ["summary", "experience", "projects", "education", "skills", "certifications", "achievements"];
  const activeOrder = resume.style?.sectionOrder?.length ? resume.style.sectionOrder : defaultOrder;

  const sectionAppenders: Record<string, () => void> = {
    summary: () => {
      if (summary) {
        addSectionHeader("Professional Summary");
        children.push(
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: summary,
                size: 20,
                font: "Arial",
                color: "1F2937",
              }),
            ],
          })
        );
      }
    },

    experience: () => {
      if (experience && experience.length > 0) {
        addSectionHeader("Work Experience");
        experience.forEach((exp) => {
          children.push(
            new Paragraph({
              spacing: { before: 100, after: 40 },
              children: [
                new TextRun({
                  text: `${exp.role} — ${exp.company}`,
                  bold: true,
                  size: 20,
                  font: "Arial",
                }),
                new TextRun({
                  text: `   (${exp.startDate} – ${exp.isCurrent ? "Present" : exp.endDate}${
                    exp.location ? ` | ${exp.location}` : ""
                  })`,
                  italics: true,
                  size: 18,
                  font: "Arial",
                  color: "4B5563",
                }),
              ],
            })
          );

          if (exp.highlights && exp.highlights.length > 0) {
            exp.highlights.forEach((h) => {
              children.push(
                new Paragraph({
                  bullet: { level: 0 },
                  spacing: { after: 40 },
                  children: [
                    new TextRun({
                      text: h,
                      size: 20,
                      font: "Arial",
                    }),
                  ],
                })
              );
            });
          }
        });
      }
    },

    projects: () => {
      if (projects && projects.length > 0) {
        addSectionHeader("Technical Projects");
        projects.forEach((proj) => {
          const techStr = proj.technologies?.length ? ` (${proj.technologies.join(", ")})` : "";
          children.push(
            new Paragraph({
              spacing: { before: 100, after: 40 },
              children: [
                new TextRun({
                  text: proj.name + techStr,
                  bold: true,
                  size: 20,
                  font: "Arial",
                }),
              ],
            })
          );

          if (proj.description) {
            children.push(
              new Paragraph({
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: proj.description,
                    italics: true,
                    size: 18,
                    font: "Arial",
                    color: "374151",
                  }),
                ],
              })
            );
          }

          if (proj.highlights && proj.highlights.length > 0) {
            proj.highlights.forEach((h) => {
              children.push(
                new Paragraph({
                  bullet: { level: 0 },
                  spacing: { after: 40 },
                  children: [
                    new TextRun({
                      text: h,
                      size: 20,
                      font: "Arial",
                    }),
                  ],
                })
              );
            });
          }
        });
      }
    },

    education: () => {
      if (education && education.length > 0) {
        addSectionHeader("Education");
        education.forEach((edu) => {
          children.push(
            new Paragraph({
              spacing: { before: 80, after: 40 },
              children: [
                new TextRun({
                  text: `${edu.institution}`,
                  bold: true,
                  size: 20,
                  font: "Arial",
                }),
                new TextRun({
                  text: `   (${edu.startYear} – ${edu.endYear})`,
                  size: 18,
                  font: "Arial",
                  color: "4B5563",
                }),
              ],
            })
          );

          children.push(
            new Paragraph({
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: `${edu.degree}${edu.gpa ? ` — GPA: ${edu.gpa}` : ""}`,
                  size: 19,
                  font: "Arial",
                }),
              ],
            })
          );

          if (edu.coursework) {
            children.push(
              new Paragraph({
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: `Relevant Coursework: ${edu.coursework}`,
                    italics: true,
                    size: 18,
                    font: "Arial",
                    color: "4B5563",
                  }),
                ],
              })
            );
          }
        });
      }
    },

    skills: () => {
      const skillCategories = [
        skills.languages?.length && `Languages: ${skills.languages.join(", ")}`,
        skills.frameworks?.length && `Frameworks: ${skills.frameworks.join(", ")}`,
        skills.databases?.length && `Databases: ${skills.databases.join(", ")}`,
        skills.tools?.length && `Developer Tools: ${skills.tools.join(", ")}`,
        skills.cloud?.length && `Cloud & DevOps: ${skills.cloud.join(", ")}`,
        skills.aiml?.length && `AI / ML: ${skills.aiml.join(", ")}`,
      ].filter(Boolean) as string[];

      if (skillCategories.length > 0) {
        addSectionHeader("Technical Skills");
        skillCategories.forEach((sc) => {
          children.push(
            new Paragraph({
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: sc,
                  size: 20,
                  font: "Arial",
                }),
              ],
            })
          );
        });
      }
    },

    certifications: () => {
      if (certifications && certifications.length > 0) {
        addSectionHeader("Certifications");
        certifications.forEach((c) => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: `${c.name} — ${c.issuer} (${c.issueDate})`,
                  size: 20,
                  font: "Arial",
                }),
              ],
            })
          );
        });
      }
    },

    achievements: () => {
      if (achievements && achievements.length > 0) {
        addSectionHeader("Honors & Achievements");
        achievements.forEach((a) => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: `${a.title}${a.organization ? ` — ${a.organization}` : ""}`,
                  size: 20,
                  font: "Arial",
                }),
              ],
            })
          );
        });
      }
    },
  };

  activeOrder.forEach((key) => {
    if (sectionAppenders[key]) {
      sectionAppenders[key]();
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.6),
              bottom: convertInchesToTwip(0.6),
              left: convertInchesToTwip(0.6),
              right: convertInchesToTwip(0.6),
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
