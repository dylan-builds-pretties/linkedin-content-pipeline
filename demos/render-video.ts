import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import type { DemoTrack } from "../remotion/lib/types";

export interface RenderConfig {
  /** Path to the raw video file */
  videoPath: string;
  /** Path to the events JSON file */
  eventsPath: string;
  /** Output path for the rendered video */
  outputPath: string;
  /** Composition ID to render */
  compositionId?: string;
  /** Show cursor overlay */
  showCursor?: boolean;
  /** Show click ripples */
  showRipples?: boolean;
  /** Show callouts */
  showCallouts?: boolean;
  /** Enable zoom/pan camera */
  enableZoom?: boolean;
}

export interface RenderResult {
  outputPath: string;
  durationInFrames: number;
  durationInSeconds: number;
}

/**
 * Render a demo video with overlays using Remotion
 */
export async function renderDemoVideo(
  config: RenderConfig
): Promise<RenderResult> {
  const {
    videoPath,
    eventsPath,
    outputPath,
    compositionId = "DemoVideo",
    showCursor = true,
    showRipples = true,
    showCallouts = true,
    enableZoom = true,
  } = config;

  // Read the event track
  const eventTrack: DemoTrack = JSON.parse(fs.readFileSync(eventsPath, "utf-8"));

  // Estimate duration from video (we'll need to get this from the video file)
  // For now, use events to estimate
  const lastEvent = eventTrack.events[eventTrack.events.length - 1];
  const estimatedDuration = lastEvent ? lastEvent.t + 3 : 30; // Add 3 seconds buffer
  const durationInFrames = Math.ceil(estimatedDuration * eventTrack.meta.fps);

  // Create output directory
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  // Bundle the Remotion project
  const bundleLocation = await bundle({
    entryPoint: path.join(process.cwd(), "remotion", "index.ts"),
    webpackOverride: (config) => config,
  });

  // Get the composition
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
    inputProps: {
      videoSrc: path.resolve(videoPath),
      eventTrack,
      showCursor,
      showRipples,
      showCallouts,
      enableZoom,
    },
  });

  // Override the duration
  composition.durationInFrames = durationInFrames;

  // Render the video
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: {
      videoSrc: path.resolve(videoPath),
      eventTrack,
      showCursor,
      showRipples,
      showCallouts,
      enableZoom,
    },
  });

  return {
    outputPath,
    durationInFrames,
    durationInSeconds: durationInFrames / eventTrack.meta.fps,
  };
}

/**
 * Quick render without full bundling (for development)
 */
export async function quickRender(
  videoPath: string,
  eventsPath: string,
  outputPath: string
): Promise<RenderResult> {
  return renderDemoVideo({
    videoPath,
    eventsPath,
    outputPath,
    showCursor: true,
    showRipples: true,
    showCallouts: true,
    enableZoom: true,
  });
}
