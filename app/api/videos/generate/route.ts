import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";
import { Tracker } from "@/demos/track";
import type { VideoGenerationRequest, VideoGenerationStatus } from "@/lib/video-types";
import { setStatus, updateStatus } from "@/lib/video-status-store";

export async function POST(request: NextRequest) {
  try {
    const body: VideoGenerationRequest = await request.json();
    const { workflow, renderOptions = {} } = body;

    // Validate workflow
    if (!workflow.id || !workflow.url || !workflow.steps?.length) {
      return NextResponse.json(
        { error: "Invalid workflow: id, url, and steps are required" },
        { status: 400 }
      );
    }

    const generationId = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const width = workflow.width ?? 1920;
    const height = workflow.height ?? 1080;
    const fps = workflow.fps ?? 30;

    // Initialize status
    const status: VideoGenerationStatus = {
      id: generationId,
      status: "pending",
      progress: 0,
      message: "Initializing...",
      startedAt: new Date().toISOString(),
    };
    setStatus(generationId, status);

    // Start generation in background
    generateVideo(generationId, workflow, width, height, fps, renderOptions).catch(
      (error) => {
        updateStatus(generationId, {
          status: "failed",
          error: error.message,
          completedAt: new Date().toISOString(),
        });
      }
    );

    return NextResponse.json({ generationId, status: "pending" });
  } catch (error) {
    console.error("Error starting video generation:", error);
    return NextResponse.json(
      { error: "Failed to start video generation" },
      { status: 500 }
    );
  }
}

async function generateVideo(
  generationId: string,
  workflow: VideoGenerationRequest["workflow"],
  width: number,
  height: number,
  fps: number,
  renderOptions: VideoGenerationRequest["renderOptions"] = {}
) {
  const outputDir = path.join(process.cwd(), "public", "uploads", "videos");
  const rawDir = path.join(process.cwd(), "demos", "artifacts", "raw");

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(rawDir, { recursive: true });

  try {
    // Phase 1: Capture
    updateStatus(generationId, {
      status: "capturing",
      progress: 10,
      message: "Launching browser...",
    });

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width, height },
      recordVideo: { dir: rawDir, size: { width, height } },
    });

    const page = await context.newPage();
    const tr = new Tracker({ width, height, fps });

    updateStatus(generationId, {
      progress: 20,
      message: "Executing workflow steps...",
    });

    // Execute each step
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      updateStatus(generationId, {
        progress: 20 + (i / workflow.steps.length) * 30,
        message: `Step ${i + 1}/${workflow.steps.length}: ${step.type}${step.label ? ` (${step.label})` : ""}`,
      });

      await executeStep(page, tr, step);
    }

    updateStatus(generationId, {
      progress: 50,
      message: "Finishing capture...",
    });

    // Close context to save video
    await context.close();
    await browser.close();

    // Find the recorded video
    const videoFiles = fs.readdirSync(rawDir).filter((f) => f.endsWith(".webm"));
    const latestVideo = videoFiles.sort().pop();

    if (!latestVideo) {
      throw new Error("No video file was created");
    }

    const rawVideoPath = path.join(rawDir, latestVideo);
    const finalRawPath = path.join(rawDir, `${workflow.id}.webm`);

    // Rename the video file
    fs.renameSync(rawVideoPath, finalRawPath);

    // Save event track
    const eventsPath = path.join(rawDir, `${workflow.id}.events.json`);
    tr.save(eventsPath);

    updateStatus(generationId, {
      rawVideoPath: finalRawPath,
      eventsPath,
    });

    // Phase 2: For now, just copy the raw video
    // In a full implementation, we would render with Remotion here
    updateStatus(generationId, {
      status: "rendering",
      progress: 60,
      message: "Processing video...",
    });

    // Copy raw video to output (simplified - in production, render with Remotion)
    const outputPath = path.join(outputDir, `${workflow.id}-${generationId}.webm`);
    fs.copyFileSync(finalRawPath, outputPath);

    updateStatus(generationId, {
      progress: 100,
      status: "completed",
      message: "Video generation complete",
      outputPath: `/uploads/videos/${path.basename(outputPath)}`,
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    updateStatus(generationId, {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
      completedAt: new Date().toISOString(),
    });
    throw error;
  }
}

async function executeStep(
  page: Awaited<ReturnType<Awaited<ReturnType<typeof chromium.launch>>["newContext"]>>["newPage"] extends () => Promise<infer P> ? P : never,
  tr: Tracker,
  step: VideoGenerationRequest["workflow"]["steps"][0]
) {
  const getBox = async (selector: string) => {
    const element = page.locator(selector);
    const box = await element.boundingBox();
    return box
      ? { x: box.x, y: box.y, w: box.width, h: box.height }
      : null;
  };

  switch (step.type) {
    case "goto":
      if (step.value) {
        await page.goto(step.value, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(500);
      }
      break;

    case "click":
      if (step.selector) {
        const element = page.locator(step.selector).first();
        await element.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
        const box = await getBox(step.selector);
        if (box) {
          tr.addFocus(box, step.label);
          tr.addClick(
            { x: box.x + box.w / 2, y: box.y + box.h / 2 },
            box,
            step.label
          );
        }
        await element.click().catch(() => {});
        await page.waitForTimeout(300);
      }
      break;

    case "fill":
      if (step.selector && step.value !== undefined) {
        const element = page.locator(step.selector).first();
        await element.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
        const box = await getBox(step.selector);
        if (box) {
          tr.addFocus(box, step.label);
          tr.addType(step.value, box, step.label);
        }
        await element.fill(step.value).catch(() => {});
        await page.waitForTimeout(200);
      }
      break;

    case "wait":
      tr.addWait((step.duration ?? 1000) / 1000, step.label);
      await page.waitForTimeout(step.duration ?? 1000);
      break;

    case "scroll":
      tr.addScroll("down", step.duration ?? 300);
      await page.mouse.wheel(0, step.duration ?? 300);
      await page.waitForTimeout(300);
      break;

    case "callout":
      if (step.selector && step.label) {
        const element = page.locator(step.selector).first();
        await element.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
        const box = await getBox(step.selector);
        if (box) {
          tr.addCallout(box, step.label);
        }
        await page.waitForTimeout(1000);
      }
      break;
  }
}
