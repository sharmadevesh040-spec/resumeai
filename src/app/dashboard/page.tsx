"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TEMPLATE_REGISTRY } from "@/templates/registry";
import { TemplateId } from "@/types/resume";
import { downloadPdf, downloadDocx } from "@/lib/pdf/client-download";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { EmptyState } from "@/components/ui/empty-state";
import { AutoGenerateForm } from "@/components/import/AutoGenerateForm";
import {
  Plus,
  Edit,
  Copy,
  Trash2,
  Download,
  FileText,
  Clock,
  Layers,
  Search,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

interface ResumeListItem {
  id: string;
  title: string;
  targetRole?: string;
  templateId: string;
  atsScore?: number;
  updatedAt: string;
  contentJson: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const setResume = useResumeStore((state) => state.setResume);
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAutoImportModal, setShowAutoImportModal] = useState(false);

  // Rename modal state
  const [renameItem, setRenameItem] = useState<{ id: string; title: string } | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const loadData = () => {
    setLoading(true);
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});

    fetch("/api/resume")
      .then((res) => res.json())
      .then((data) => {
        if (data?.resumes) {
          setResumes(data.resumes);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/resume/${id}/duplicate`, { method: "POST" });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      const res = await fetch(`/api/resume/${id}`, { method: "DELETE" });
      if (res.ok) {
        setResumes(resumes.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameSubmit = async () => {
    if (!renameItem || !newTitle.trim()) return;
    try {
      const item = resumes.find((r) => r.id === renameItem.id);
      if (!item) return;
      const parsed = JSON.parse(item.contentJson);
      parsed.title = newTitle.trim();

      await fetch(`/api/resume/${renameItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: parsed }),
      });

      setResumes(
        resumes.map((r) =>
          r.id === renameItem.id
            ? { ...r, title: newTitle.trim(), contentJson: JSON.stringify(parsed) }
            : r
        )
      );
      setRenameItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadItemPdf = async (item: ResumeListItem) => {
    try {
      const parsed = JSON.parse(item.contentJson);
      await downloadPdf(parsed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadItemDocx = async (item: ResumeListItem) => {
    try {
      const parsed = JSON.parse(item.contentJson);
      await downloadDocx(parsed);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredResumes = resumes.filter((r) =>
    (r.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.targetRole || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Welcome Banner & Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back{currentUser?.name ? `, ${currentUser.name}` : ""}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your resumes, track ATS compatibility scores, and download updated versions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowAutoImportModal(true)}
              className="gap-2 font-semibold text-sm border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Auto-Generate from Profile
            </Button>

            <Link href="/create">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-2 font-bold text-sm">
                <Plus className="w-4 h-4" /> Create New Resume
              </Button>
            </Link>
          </div>
        </div>

        {/* Dialog for Auto-Generate inside Dashboard */}
        <Dialog open={showAutoImportModal} onOpenChange={setShowAutoImportModal}>
          <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto bg-transparent border-none p-0 shadow-none">
            <AutoGenerateForm
              onSuccess={() => {
                setShowAutoImportModal(false);
                loadData();
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resumes by title or role..."
              className="pl-9 text-xs"
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {filteredResumes.length} {filteredResumes.length === 1 ? "Resume" : "Resumes"}
          </span>
        </div>

        {/* Resumes Grid / Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : filteredResumes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={searchQuery ? "No matching resumes found" : "No resumes created yet"}
            description={
              searchQuery
                ? `No resumes match "${searchQuery}". Try a different keyword.`
                : "You haven't created any resumes yet. Start building an ATS-optimized, recruiter-ready resume in minutes."
            }
            actionLabel={searchQuery ? undefined : "+ Create Your First Resume"}
            actionHref="/create"
            className="py-16"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResumes.map((item) => {
              const template = TEMPLATE_REGISTRY[item.templateId as TemplateId] || TEMPLATE_REGISTRY["ats-professional"];
              const dateStr = new Date(item.updatedAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-5 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg transition-all border border-slate-200/90 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 group h-full">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.targetRole || "Software Developer"}
                          </p>
                        </div>

                        {/* ATS Score Badge */}
                        <Badge className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs py-0.5 px-2 flex-shrink-0">
                          ★ {item.atsScore || 94} ATS
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          {template.name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {dateStr}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1 font-semibold"
                          onClick={() => {
                            try {
                              const parsed = JSON.parse(item.contentJson);
                              setResume(parsed);
                              router.push(`/editor?id=${item.id}`);
                            } catch {
                              router.push(`/editor?id=${item.id}`);
                            }
                          }}
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1"
                          onClick={() => handleDownloadItemPdf(item)}
                          title="Download Vector PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" /> PDF
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1"
                          onClick={() => handleDownloadItemDocx(item)}
                          title="Download Word DOCX"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> DOCX
                        </Button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicate(item.id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="Duplicate Resume"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRenameItem({ id: item.id, title: item.title });
                            setNewTitle(item.title);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors text-[11px] font-semibold"
                          title="Rename"
                        >
                          Rename
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* Rename Dialog */}
      {renameItem && (
        <Dialog open={!!renameItem} onOpenChange={() => setRenameItem(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Rename Resume</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                New Resume Title
              </label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Software Developer - Google Version"
                className="text-xs"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setRenameItem(null)}>
                Cancel
              </Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleRenameSubmit}>
                Save Title
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
