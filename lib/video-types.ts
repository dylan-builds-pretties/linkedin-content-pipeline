/**
 * Types for the demo video generation system
 */

export interface WorkflowStep {
  type: "goto" | "click" | "fill" | "wait" | "scroll" | "callout";
  selector?: string;
  value?: string;
  duration?: number;
  label?: string;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  url: string;
  steps: WorkflowStep[];
  width?: number;
  height?: number;
  fps?: number;
}

export interface VideoGenerationRequest {
  workflow: WorkflowConfig;
  renderOptions?: {
    showCursor?: boolean;
    showRipples?: boolean;
    showCallouts?: boolean;
    enableZoom?: boolean;
  };
}

export interface VideoGenerationStatus {
  id: string;
  status: "pending" | "capturing" | "rendering" | "completed" | "failed";
  progress: number;
  message?: string;
  rawVideoPath?: string;
  eventsPath?: string;
  outputPath?: string;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

// Predefined workflow templates
export const WORKFLOW_TEMPLATES: Record<string, Partial<WorkflowConfig>> = {
  "login-flow": {
    name: "Login Flow",
    steps: [
      { type: "goto", value: "" },
      { type: "fill", selector: '[type="email"]', value: "user@example.com", label: "Email" },
      { type: "fill", selector: '[type="password"]', value: "password", label: "Password" },
      { type: "click", selector: 'button[type="submit"]', label: "Login" },
      { type: "wait", duration: 2000, label: "Loading" },
    ],
  },
  "search-flow": {
    name: "Search Flow",
    steps: [
      { type: "goto", value: "" },
      { type: "fill", selector: '[type="search"], [role="searchbox"]', value: "demo query", label: "Search" },
      { type: "click", selector: 'button[type="submit"], [aria-label="Search"]', label: "Search" },
      { type: "wait", duration: 2000, label: "Results" },
    ],
  },
  "form-flow": {
    name: "Form Submission",
    steps: [
      { type: "goto", value: "" },
      { type: "fill", selector: 'input[name="name"]', value: "John Doe", label: "Name" },
      { type: "fill", selector: 'input[name="email"]', value: "john@example.com", label: "Email" },
      { type: "click", selector: 'button[type="submit"]', label: "Submit" },
      { type: "wait", duration: 1500, label: "Processing" },
    ],
  },
};
