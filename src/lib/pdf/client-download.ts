import { ResumeData } from "@/types/resume";

export function getCleanFileName(fullName: string, ext: "pdf" | "docx"): string {
  const clean = (fullName || "Resume").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${clean}_Resume.${ext}`;
}

export async function downloadDocx(resume: ResumeData): Promise<void> {
  const res = await fetch("/api/resume/export/docx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate DOCX file");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = getCleanFileName(resume.personal.fullName, "docx");
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function downloadPdf(resume: ResumeData): Promise<void> {
  const res = await fetch("/api/resume/export/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate PDF file");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = getCleanFileName(resume.personal.fullName, "pdf");
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export function triggerPrintResume(): void {
  window.print();
}
