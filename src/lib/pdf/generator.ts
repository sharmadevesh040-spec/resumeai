import { jsPDF } from "jspdf";
import { ResumeData } from "@/types/resume";

/**
 * Generates an ATS-compliant, 100% vector selectable-text PDF document.
 * Does NOT rasterize screenshots, ensuring exact machine readability by ATS parsers.
 */
export async function generateResumePdf(resume: ResumeData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter", // 612 x 792 pt
  });

  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin + 10;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin + 10;
    }
  };

  // 1. Header: Full Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(17, 24, 39);
  const fullName = (resume.personal.fullName || "Resume").toUpperCase();
  doc.text(fullName, pageWidth / 2, y, { align: "center" });
  y += 18;

  // Headline
  if (resume.personal.headline) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text(resume.personal.headline, pageWidth / 2, y, { align: "center" });
    y += 14;
  }

  // Contact line
  const contacts: string[] = [];
  if (resume.personal.location) contacts.push(resume.personal.location);
  if (resume.personal.email) contacts.push(resume.personal.email);
  if (resume.personal.phone) contacts.push(resume.personal.phone);
  if (resume.personal.linkedin) contacts.push("LinkedIn");
  if (resume.personal.github) contacts.push("GitHub");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  doc.text(contacts.join("   •   "), pageWidth / 2, y, { align: "center" });
  y += 14;

  // Header separator line
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.75);
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;

  // Section Header Helper
  const renderSectionHeader = (title: string) => {
    checkPageBreak(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138); // Deep professional navy
    doc.text(title.toUpperCase(), margin, y);
    y += 4;
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;
  };

  const defaultOrder = ["summary", "experience", "projects", "education", "skills", "certifications", "achievements"];
  const activeOrder = resume.style?.sectionOrder?.length ? resume.style.sectionOrder : defaultOrder;

  const sectionRenderers: Record<string, () => void> = {
    summary: () => {
      if (resume.summary) {
        renderSectionHeader("Professional Summary");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(31, 41, 55);
        const summaryLines = doc.splitTextToSize(resume.summary, contentWidth);
        checkPageBreak(summaryLines.length * 12 + 8);
        doc.text(summaryLines, margin, y);
        y += summaryLines.length * 12 + 10;
      }
    },

    experience: () => {
      if (resume.experience && resume.experience.length > 0) {
        renderSectionHeader("Work Experience");
        resume.experience.forEach((exp) => {
          checkPageBreak(40);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(17, 24, 39);
          doc.text(`${exp.role} — ${exp.company}`, margin, y);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(75, 85, 99);
          const dates = `${exp.startDate} – ${exp.isCurrent ? "Present" : exp.endDate}${
            exp.location ? ` | ${exp.location}` : ""
          }`;
          doc.text(dates, pageWidth - margin, y, { align: "right" });
          y += 12;

          if (exp.highlights && exp.highlights.length > 0) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(31, 41, 55);
            exp.highlights.forEach((h) => {
              const bulletLines = doc.splitTextToSize(h, contentWidth - 14);
              checkPageBreak(bulletLines.length * 11 + 4);
              doc.text("•", margin + 4, y);
              doc.text(bulletLines, margin + 14, y);
              y += bulletLines.length * 11 + 3;
            });
          }
          y += 6;
        });
      }
    },

    projects: () => {
      if (resume.projects && resume.projects.length > 0) {
        renderSectionHeader("Key Technical Projects");
        resume.projects.forEach((proj) => {
          checkPageBreak(40);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(17, 24, 39);
          const title = proj.technologies?.length
            ? `${proj.name} (${proj.technologies.join(", ")})`
            : proj.name;
          doc.text(title, margin, y);

          const links: string[] = [];
          if (proj.liveUrl) links.push("Demo");
          if (proj.githubUrl) links.push("Code");
          if (links.length > 0) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(37, 99, 235);
            doc.text(links.join(" | "), pageWidth - margin, y, { align: "right" });
          }
          y += 12;

          if (proj.description) {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8.5);
            doc.setTextColor(75, 85, 99);
            const descLines = doc.splitTextToSize(proj.description, contentWidth);
            checkPageBreak(descLines.length * 10 + 2);
            doc.text(descLines, margin, y);
            y += descLines.length * 10 + 3;
          }

          if (proj.highlights && proj.highlights.length > 0) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(31, 41, 55);
            proj.highlights.forEach((h) => {
              const bulletLines = doc.splitTextToSize(h, contentWidth - 14);
              checkPageBreak(bulletLines.length * 11 + 4);
              doc.text("•", margin + 4, y);
              doc.text(bulletLines, margin + 14, y);
              y += bulletLines.length * 11 + 3;
            });
          }
          y += 6;
        });
      }
    },

    education: () => {
      if (resume.education && resume.education.length > 0) {
        renderSectionHeader("Education");
        resume.education.forEach((edu) => {
          checkPageBreak(30);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(17, 24, 39);
          doc.text(edu.institution, margin, y);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(75, 85, 99);
          doc.text(`${edu.startYear} – ${edu.endYear}`, pageWidth - margin, y, { align: "right" });
          y += 11;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(55, 65, 81);
          doc.text(`${edu.degree}${edu.gpa ? ` | ${edu.gpa}` : ""}`, margin, y);
          y += 11;

          if (edu.coursework) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(107, 114, 128);
            const cwLines = doc.splitTextToSize(`Coursework: ${edu.coursework}`, contentWidth);
            doc.text(cwLines, margin, y);
            y += cwLines.length * 10 + 3;
          }
          y += 4;
        });
      }
    },

    skills: () => {
      const skillCategories = [
        resume.skills.languages?.length && `Languages: ${resume.skills.languages.join(", ")}`,
        resume.skills.frameworks?.length && `Frameworks: ${resume.skills.frameworks.join(", ")}`,
        resume.skills.databases?.length && `Databases: ${resume.skills.databases.join(", ")}`,
        resume.skills.tools?.length && `Developer Tools: ${resume.skills.tools.join(", ")}`,
        resume.skills.cloud?.length && `Cloud & DevOps: ${resume.skills.cloud.join(", ")}`,
        resume.skills.aiml?.length && `AI / ML: ${resume.skills.aiml.join(", ")}`,
      ].filter(Boolean) as string[];

      if (skillCategories.length > 0) {
        renderSectionHeader("Technical Skills");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(31, 41, 55);
        skillCategories.forEach((sc) => {
          const scLines = doc.splitTextToSize(sc, contentWidth);
          checkPageBreak(scLines.length * 11 + 2);
          doc.text(scLines, margin, y);
          y += scLines.length * 11 + 2;
        });
        y += 4;
      }
    },

    certifications: () => {
      if (resume.certifications && resume.certifications.length > 0) {
        renderSectionHeader("Certifications");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(31, 41, 55);

        resume.certifications.forEach((c) => {
          checkPageBreak(14);
          doc.text(`• ${c.name} — ${c.issuer} (${c.issueDate})`, margin + 4, y);
          y += 12;
        });
        y += 4;
      }
    },

    achievements: () => {
      if (resume.achievements && resume.achievements.length > 0) {
        renderSectionHeader("Honors & Achievements");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(31, 41, 55);

        resume.achievements.forEach((a) => {
          checkPageBreak(14);
          doc.text(`• ${a.title}${a.organization ? ` — ${a.organization}` : ""}`, margin + 4, y);
          y += 12;
        });
        y += 4;
      }
    },
  };

  activeOrder.forEach((key) => {
    if (sectionRenderers[key]) {
      sectionRenderers[key]();
    }
  });

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
