import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResumeForge AI — Build an ATS-Friendly Resume with AI",
  description:
    "Create professional ATS-friendly resumes with AI, customize your design, analyze job descriptions, and download your resume as PDF or DOCX.",
  keywords: [
    "AI Resume Builder",
    "ATS Resume",
    "Job Match Analysis",
    "Resume Maker",
    "Professional Resume Templates",
    "PDF Resume Download",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased transition-colors duration-200`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
