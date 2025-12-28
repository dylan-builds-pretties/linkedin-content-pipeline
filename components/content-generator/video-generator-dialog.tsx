"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Video,
  ArrowLeft,
  Plus,
  Trash2,
  Play,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import type { ContentAsset } from "@/lib/types";
import type {
  WorkflowStep,
  VideoGenerationStatus,
  WORKFLOW_TEMPLATES,
} from "@/lib/video-types";

interface VideoGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (asset: ContentAsset) => void;
  onBack: () => void;
}

const STEP_TYPES = [
  { value: "goto", label: "Navigate to URL" },
  { value: "click", label: "Click Element" },
  { value: "fill", label: "Fill Input" },
  { value: "wait", label: "Wait" },
  { value: "scroll", label: "Scroll" },
  { value: "callout", label: "Add Callout" },
] as const;

const TEMPLATES = [
  { id: "custom", name: "Custom Workflow" },
  { id: "login-flow", name: "Login Flow" },
  { id: "search-flow", name: "Search Flow" },
  { id: "form-flow", name: "Form Submission" },
];

export function VideoGeneratorDialog({
  open,
  onOpenChange,
  onComplete,
  onBack,
}: VideoGeneratorDialogProps) {
  const [workflowName, setWorkflowName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([
    { type: "goto", value: "" },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [status, setStatus] = useState<VideoGenerationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll for status updates
  useEffect(() => {
    if (!generationId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/videos/status/${generationId}`);
        if (res.ok) {
          const data: VideoGenerationStatus = await res.json();
          setStatus(data);

          if (data.status === "completed" || data.status === "failed") {
            setIsGenerating(false);
            clearInterval(interval);

            if (data.status === "completed" && data.outputPath) {
              // Create an asset for the generated video
              const asset: ContentAsset = {
                id: generationId,
                name: workflowName || "Screen Recording",
                description: `Generated from workflow: ${workflowName}`,
                type: "video",
                mimeType: "video/webm",
                fileName: `${generationId}.webm`,
                filePath: data.outputPath,
                fileSize: 0, // Unknown at this point
                tags: ["screen-recording", "generated"],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              onComplete(asset);
            }
          }
        }
      } catch (err) {
        console.error("Error polling status:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [generationId, workflowName, onComplete]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);

    if (templateId === "custom") {
      setSteps([{ type: "goto", value: "" }]);
      return;
    }

    // Load template steps
    const templates: Record<string, WorkflowStep[]> = {
      "login-flow": [
        { type: "goto", value: "" },
        { type: "fill", selector: '[type="email"]', value: "user@example.com", label: "Email" },
        { type: "fill", selector: '[type="password"]', value: "password", label: "Password" },
        { type: "click", selector: 'button[type="submit"]', label: "Login" },
        { type: "wait", duration: 2000, label: "Loading" },
      ],
      "search-flow": [
        { type: "goto", value: "" },
        { type: "fill", selector: '[type="search"]', value: "demo query", label: "Search" },
        { type: "click", selector: 'button[type="submit"]', label: "Submit" },
        { type: "wait", duration: 2000, label: "Results" },
      ],
      "form-flow": [
        { type: "goto", value: "" },
        { type: "fill", selector: 'input[name="name"]', value: "John Doe", label: "Name" },
        { type: "fill", selector: 'input[name="email"]', value: "john@example.com", label: "Email" },
        { type: "click", selector: 'button[type="submit"]', label: "Submit" },
        { type: "wait", duration: 1500, label: "Processing" },
      ],
    };

    if (templates[templateId]) {
      setSteps(templates[templateId]);
    }
  };

  const addStep = () => {
    setSteps([...steps, { type: "wait", duration: 1000 }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, updates: Partial<WorkflowStep>) => {
    setSteps(
      steps.map((step, i) => (i === index ? { ...step, ...updates } : step))
    );
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    setStatus(null);

    // Update the goto step with the target URL
    const updatedSteps = steps.map((step) =>
      step.type === "goto" && !step.value ? { ...step, value: targetUrl } : step
    );

    try {
      const res = await fetch("/api/videos/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow: {
            id: `video-${Date.now()}`,
            name: workflowName || "Screen Recording",
            url: targetUrl,
            steps: updatedSteps,
            width: 1920,
            height: 1080,
            fps: 30,
          },
          renderOptions: {
            showCursor: true,
            showRipples: true,
            showCallouts: true,
            enableZoom: true,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start video generation");
      }

      const data = await res.json();
      setGenerationId(data.generationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setWorkflowName("");
      setTargetUrl("");
      setSteps([{ type: "goto", value: "" }]);
      setSelectedTemplate("custom");
      setGenerationId(null);
      setStatus(null);
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onBack}
              disabled={isGenerating}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle>Create Screen Recording</DialogTitle>
          </div>
          <DialogDescription>
            Record automated browser workflows to create demo videos
          </DialogDescription>
        </DialogHeader>

        {/* Generation Progress */}
        {isGenerating && status && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-3">
              {status.status === "completed" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : status.status === "failed" ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {status.status === "completed"
                    ? "Video Generated!"
                    : status.status === "failed"
                      ? "Generation Failed"
                      : status.message}
                </p>
                {status.status !== "completed" && status.status !== "failed" && (
                  <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {status.status === "completed" && status.outputPath && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => window.open(status.outputPath, "_blank")}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Preview Video
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = status.outputPath!;
                    a.download = `${workflowName || "recording"}.webm`;
                    a.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}

            {status.status === "failed" && status.error && (
              <p className="text-sm text-red-500">{status.error}</p>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && !isGenerating && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Configuration Form */}
        {!isGenerating && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="workflow-name">Recording Name</Label>
                <Input
                  id="workflow-name"
                  placeholder="e.g., Product Demo, Feature Walkthrough"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="target-url">Target URL</Label>
                <Input
                  id="target-url"
                  type="url"
                  placeholder="https://example.com"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Template</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Workflow Steps</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Step
                </Button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 rounded-lg border p-3 bg-muted/20"
                  >
                    <span className="text-xs font-medium text-muted-foreground w-6 pt-2">
                      {index + 1}.
                    </span>

                    <div className="flex-1 grid gap-2">
                      <Select
                        value={step.type}
                        onValueChange={(value) =>
                          updateStep(index, { type: value as WorkflowStep["type"] })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STEP_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Step-specific inputs */}
                      {step.type === "goto" && (
                        <Input
                          placeholder="URL (leave empty to use target URL)"
                          value={step.value || ""}
                          onChange={(e) => updateStep(index, { value: e.target.value })}
                          className="h-8 text-sm"
                        />
                      )}

                      {(step.type === "click" || step.type === "fill" || step.type === "callout") && (
                        <>
                          <Input
                            placeholder="CSS Selector (e.g., button.submit, #email)"
                            value={step.selector || ""}
                            onChange={(e) => updateStep(index, { selector: e.target.value })}
                            className="h-8 text-sm"
                          />
                          {step.type === "fill" && (
                            <Input
                              placeholder="Value to type"
                              value={step.value || ""}
                              onChange={(e) => updateStep(index, { value: e.target.value })}
                              className="h-8 text-sm"
                            />
                          )}
                          <Input
                            placeholder="Label (optional)"
                            value={step.label || ""}
                            onChange={(e) => updateStep(index, { label: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </>
                      )}

                      {(step.type === "wait" || step.type === "scroll") && (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder={step.type === "wait" ? "Duration (ms)" : "Amount (px)"}
                            value={step.duration || ""}
                            onChange={(e) =>
                              updateStep(index, { duration: parseInt(e.target.value) || 0 })
                            }
                            className="h-8 text-sm"
                          />
                          <Input
                            placeholder="Label (optional)"
                            value={step.label || ""}
                            onChange={(e) => updateStep(index, { label: e.target.value })}
                            className="h-8 text-sm flex-1"
                          />
                        </div>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      onClick={() => removeStep(index)}
                      disabled={steps.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!targetUrl || steps.length === 0}
              className="w-full"
            >
              <Video className="h-4 w-4 mr-2" />
              Generate Video
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
