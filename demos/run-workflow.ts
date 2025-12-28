import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import path from "node:path";
import fs from "node:fs";
import { Tracker } from "./track";

export interface WorkflowConfig {
  /** Unique workflow identifier */
  id: string;
  /** Display name */
  name: string;
  /** Target URL to navigate to */
  url: string;
  /** Viewport dimensions */
  width?: number;
  height?: number;
  /** Frames per second for the recording */
  fps?: number;
  /** Output directory */
  outputDir?: string;
}

export interface WorkflowStep {
  type: "goto" | "click" | "fill" | "wait" | "scroll" | "callout";
  selector?: string;
  value?: string;
  duration?: number;
  label?: string;
}

export interface WorkflowResult {
  videoPath: string;
  eventsPath: string;
  duration: number;
}

/**
 * Run a workflow defined by a list of steps
 */
export async function runWorkflow(
  config: WorkflowConfig,
  steps: WorkflowStep[]
): Promise<WorkflowResult> {
  const width = config.width ?? 1920;
  const height = config.height ?? 1080;
  const fps = config.fps ?? 30;
  const outputDir = config.outputDir ?? path.join("demos", "artifacts", "raw");

  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width, height },
    recordVideo: { dir: outputDir, size: { width, height } },
  });

  const page = await context.newPage();
  const tr = new Tracker({ width, height, fps });

  const startTime = Date.now();

  try {
    for (const step of steps) {
      await executeStep(page, tr, step);
    }
  } finally {
    await context.close();
    await browser.close();
  }

  const duration = (Date.now() - startTime) / 1000;

  // Save event track
  const eventsPath = path.join(outputDir, `${config.id}.events.json`);
  tr.save(eventsPath);

  // Find the recorded video file
  const videoFiles = fs
    .readdirSync(outputDir)
    .filter((f) => f.endsWith(".webm"));
  const latestVideo = videoFiles.sort().pop();

  if (!latestVideo) {
    throw new Error("No video file was created");
  }

  const videoPath = path.join(outputDir, latestVideo);

  // Rename to match workflow id
  const finalVideoPath = path.join(outputDir, `${config.id}.webm`);
  fs.renameSync(videoPath, finalVideoPath);

  return {
    videoPath: finalVideoPath,
    eventsPath,
    duration,
  };
}

async function executeStep(
  page: Page,
  tr: Tracker,
  step: WorkflowStep
): Promise<void> {
  switch (step.type) {
    case "goto":
      await page.goto(step.value ?? "");
      break;

    case "click":
      if (step.selector) {
        const element = page.locator(step.selector);
        const box = await element.boundingBox();
        if (box) {
          tr.addClick(
            { x: box.x + box.width / 2, y: box.y + box.height / 2 },
            { x: box.x, y: box.y, w: box.width, h: box.height },
            step.label
          );
        }
        await element.click();
      }
      break;

    case "fill":
      if (step.selector && step.value) {
        const element = page.locator(step.selector);
        const box = await element.boundingBox();
        if (box) {
          tr.addFocus(
            { x: box.x, y: box.y, w: box.width, h: box.height },
            step.label
          );
          tr.addType(
            step.value,
            { x: box.x, y: box.y, w: box.width, h: box.height },
            step.label
          );
        }
        await element.fill(step.value);
      }
      break;

    case "wait":
      tr.addWait((step.duration ?? 1000) / 1000, step.label);
      await page.waitForTimeout(step.duration ?? 1000);
      break;

    case "scroll":
      tr.addScroll("down", step.duration ?? 300);
      await page.mouse.wheel(0, step.duration ?? 300);
      break;

    case "callout":
      if (step.selector && step.label) {
        const element = page.locator(step.selector);
        const box = await element.boundingBox();
        if (box) {
          tr.addCallout(
            { x: box.x, y: box.y, w: box.width, h: box.height },
            step.label
          );
        }
      }
      break;
  }
}

/**
 * Run a workflow from a module file
 */
export async function runWorkflowModule(
  modulePath: string,
  config: Partial<WorkflowConfig> = {}
): Promise<WorkflowResult> {
  const width = config.width ?? 1920;
  const height = config.height ?? 1080;
  const fps = config.fps ?? 30;
  const outputDir = config.outputDir ?? path.join("demos", "artifacts", "raw");

  fs.mkdirSync(outputDir, { recursive: true });

  // Dynamic import of the workflow module
  const workflowModule = await import(modulePath);
  const { run, metadata } = workflowModule;

  const workflowId = config.id ?? metadata?.id ?? "workflow";

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width, height },
    recordVideo: { dir: outputDir, size: { width, height } },
  });

  const page = await context.newPage();
  const tr = new Tracker({ width, height, fps });

  const startTime = Date.now();

  try {
    await run(page, tr);
  } finally {
    await context.close();
    await browser.close();
  }

  const duration = (Date.now() - startTime) / 1000;

  // Save event track
  const eventsPath = path.join(outputDir, `${workflowId}.events.json`);
  tr.save(eventsPath);

  // Find the recorded video file
  const videoFiles = fs
    .readdirSync(outputDir)
    .filter((f) => f.endsWith(".webm"));
  const latestVideo = videoFiles.sort().pop();

  if (!latestVideo) {
    throw new Error("No video file was created");
  }

  const videoPath = path.join(outputDir, latestVideo);

  // Rename to match workflow id
  const finalVideoPath = path.join(outputDir, `${workflowId}.webm`);
  if (videoPath !== finalVideoPath) {
    fs.renameSync(videoPath, finalVideoPath);
  }

  return {
    videoPath: finalVideoPath,
    eventsPath,
    duration,
  };
}
