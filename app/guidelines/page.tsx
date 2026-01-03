"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const sections = [
  { id: "brand-voice", title: "Brand Voice", file: "01-brand-voice.md" },
  { id: "content-pillars", title: "Content Pillars", file: "02-content-pillars.md" },
  { id: "decision-rules", title: "Decision Rules", file: "03-decision-rules.md" },
  { id: "cadence-system", title: "Cadence System", file: "04-cadence-system.md" },
  { id: "execution-engine", title: "Execution Engine", file: "05-execution-engine.md" },
  { id: "post-formats", title: "Post Formats", file: "06-post-formats.md" },
];

export default function GuidelinesPage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchAllSections() {
      const newContent: Record<string, string> = {};

      await Promise.all(
        sections.map(async (section) => {
          try {
            const res = await fetch(`/api/guidelines/${section.id}`);
            if (res.ok) {
              const data = await res.json();
              newContent[section.id] = data.content;
            }
          } catch (error) {
            console.error(`Error fetching ${section.id}:`, error);
          }
        })
      );

      setContent(newContent);
      setLoading(false);
    }

    fetchAllSections();
  }, []);

  const handleEdit = (sectionId: string) => {
    setEditingSection(sectionId);
    setEditBuffer(content[sectionId] || "");
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditBuffer("");
  };

  const handleSave = async () => {
    if (!editingSection) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/guidelines/${editingSection}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editBuffer }),
      });

      if (res.ok) {
        setContent((prev) => ({
          ...prev,
          [editingSection]: editBuffer,
        }));
        setEditingSection(null);
        setEditBuffer("");
      } else {
        console.error("Failed to save");
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading guidelines...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 gap-8">
      {/* Sticky sidebar navigation */}
      <nav className="w-48 shrink-0 sticky top-0 h-fit pt-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Guidelines
        </div>
        <ul className="space-y-1">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="block py-2 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto pb-16">
        <article className="max-w-4xl">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className={index > 0 ? "pt-8 mt-8 border-t border-border" : ""}
            >
              {editingSection === section.id ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Editing: {section.title}</h2>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={editBuffer}
                    onChange={(e) => setEditBuffer(e.target.value)}
                    className="min-h-[500px] font-mono text-sm"
                    placeholder="Enter markdown content..."
                  />
                </div>
              ) : (
                <div className="group relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleEdit(section.id)}
                  >
                    Edit
                  </Button>
                  <div className="prose prose-slate dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content[section.id] || ""}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
