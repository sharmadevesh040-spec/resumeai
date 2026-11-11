import React from "react";
import { ResumeData } from "@/types/resume";
import { TEMPLATE_REGISTRY } from "./registry";
import { ATSProfessional } from "./ATSProfessional";

interface TemplateRendererProps {
  data: ResumeData;
  isMiniature?: boolean;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({ data, isMiniature }) => {
  const templateId = data.style?.templateId || "ats-professional";
  const definition = TEMPLATE_REGISTRY[templateId];
  const Component = definition?.component || ATSProfessional;

  return (
    <div className="resume-print-container w-full h-full">
      <Component data={data} isMiniature={isMiniature} />
    </div>
  );
};
