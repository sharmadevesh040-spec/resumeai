"use client";

import React, { useEffect } from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import EditorPage from "../page";

interface EditorIdPageProps {
  params: {
    id: string;
  };
}

export default function EditorIdPage({ params }: EditorIdPageProps) {
  const { resume, setResume } = useResumeStore();

  useEffect(() => {
    if (params.id && params.id !== resume.id) {
      fetch(`/api/resume/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.resume) {
            setResume(data.resume);
          }
        })
        .catch(() => {});
    }
  }, [params.id, resume.id, setResume]);

  return <EditorPage />;
}
