import { interpolate, Easing } from "remotion";
import type { Box, DemoEvent, DemoMeta, CameraTarget } from "./types";

/**
 * Calculate zoom level to fit a box nicely in the viewport
 * with some padding around it
 */
function calculateZoom(
  box: Box,
  viewportWidth: number,
  viewportHeight: number,
  padding: number = 0.2
): number {
  const targetWidth = box.w * (1 + padding * 2);
  const targetHeight = box.h * (1 + padding * 2);

  const zoomX = viewportWidth / targetWidth;
  const zoomY = viewportHeight / targetHeight;

  // Use the smaller zoom to ensure the box fits
  // but cap at reasonable bounds
  const zoom = Math.min(zoomX, zoomY);
  return Math.max(1.0, Math.min(2.5, zoom));
}

/**
 * Build camera targets from events
 */
export function buildCameraTargets(
  events: DemoEvent[],
  meta: DemoMeta,
  transitionFrames: number = 15
): CameraTarget[] {
  const targets: CameraTarget[] = [];
  const fps = meta.fps;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const box = "box" in event ? event.box : undefined;

    if (!box) continue;

    const startFrame = Math.floor(event.t * fps);
    const nextEvent = events[i + 1];
    const endFrame = nextEvent
      ? Math.floor(nextEvent.t * fps) - 1
      : startFrame + fps * 2; // Default 2 seconds

    const zoom = calculateZoom(box, meta.width, meta.height);

    targets.push({
      startFrame,
      endFrame,
      box,
      zoom,
    });
  }

  return targets;
}

/**
 * Get the camera transform at a given frame
 */
export function getCameraTransform(
  frame: number,
  targets: CameraTarget[],
  meta: DemoMeta,
  transitionFrames: number = 15
): { zoom: number; translateX: number; translateY: number } {
  // Default: no zoom, no translation
  const defaultTransform = { zoom: 1, translateX: 0, translateY: 0 };

  if (targets.length === 0) return defaultTransform;

  // Find active target
  let activeTarget: CameraTarget | null = null;
  let prevTarget: CameraTarget | null = null;

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    if (frame >= target.startFrame && frame <= target.endFrame) {
      activeTarget = target;
      prevTarget = i > 0 ? targets[i - 1] : null;
      break;
    }
    if (frame < target.startFrame) {
      // We're between targets
      prevTarget = i > 0 ? targets[i - 1] : null;
      activeTarget = target;
      break;
    }
    prevTarget = target;
  }

  if (!activeTarget) {
    // Past all targets, use the last one
    if (targets.length > 0) {
      const lastTarget = targets[targets.length - 1];
      return getTransformForTarget(lastTarget, meta);
    }
    return defaultTransform;
  }

  // Calculate transition
  const transitionStart = activeTarget.startFrame - transitionFrames;
  const transitionEnd = activeTarget.startFrame;

  if (frame >= transitionStart && frame < transitionEnd && prevTarget) {
    // We're in a transition
    const progress = interpolate(
      frame,
      [transitionStart, transitionEnd],
      [0, 1],
      {
        easing: Easing.out(Easing.cubic),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );

    const fromTransform = getTransformForTarget(prevTarget, meta);
    const toTransform = getTransformForTarget(activeTarget, meta);

    return {
      zoom: fromTransform.zoom + (toTransform.zoom - fromTransform.zoom) * progress,
      translateX:
        fromTransform.translateX +
        (toTransform.translateX - fromTransform.translateX) * progress,
      translateY:
        fromTransform.translateY +
        (toTransform.translateY - fromTransform.translateY) * progress,
    };
  }

  // At or past active target start frame
  if (frame >= activeTarget.startFrame) {
    return getTransformForTarget(activeTarget, meta);
  }

  // Before first target
  return defaultTransform;
}

function getTransformForTarget(
  target: CameraTarget,
  meta: DemoMeta
): { zoom: number; translateX: number; translateY: number } {
  const centerX = target.box.x + target.box.w / 2;
  const centerY = target.box.y + target.box.h / 2;

  // Calculate translation to center the target box
  const translateX = meta.width / 2 - centerX;
  const translateY = meta.height / 2 - centerY;

  return {
    zoom: target.zoom,
    translateX,
    translateY,
  };
}
