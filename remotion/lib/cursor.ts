import { interpolate, Easing } from "remotion";
import type { Point, DemoEvent, CursorKeyframe } from "./types";

/**
 * Build cursor keyframes from events
 */
export function buildCursorKeyframes(
  events: DemoEvent[],
  fps: number
): CursorKeyframe[] {
  const keyframes: CursorKeyframe[] = [];

  // Start at center of screen
  keyframes.push({
    frame: 0,
    point: { x: 960, y: 540 }, // Assuming 1920x1080
    isClick: false,
  });

  for (const event of events) {
    const frame = Math.floor(event.t * fps);
    let point: Point | null = null;
    let isClick = false;

    if (event.type === "click") {
      point = event.point;
      isClick = true;
    } else if (event.type === "focus" && event.box) {
      point = {
        x: event.box.x + event.box.w / 2,
        y: event.box.y + event.box.h / 2,
      };
    } else if (event.type === "type" && event.box) {
      point = {
        x: event.box.x + event.box.w / 2,
        y: event.box.y + event.box.h / 2,
      };
    } else if (event.type === "callout" && event.box) {
      point = {
        x: event.box.x + event.box.w / 2,
        y: event.box.y + event.box.h / 2,
      };
    }

    if (point) {
      keyframes.push({ frame, point, isClick });
    }
  }

  return keyframes;
}

/**
 * Get cursor position at a given frame with smooth interpolation
 */
export function getCursorPosition(
  frame: number,
  keyframes: CursorKeyframe[],
  moveDurationFrames: number = 12
): { point: Point; isClicking: boolean } {
  if (keyframes.length === 0) {
    return { point: { x: 960, y: 540 }, isClicking: false };
  }

  // Find the relevant keyframes
  let prevKeyframe = keyframes[0];
  let nextKeyframe: CursorKeyframe | null = null;

  for (let i = 0; i < keyframes.length; i++) {
    if (keyframes[i].frame > frame) {
      nextKeyframe = keyframes[i];
      break;
    }
    prevKeyframe = keyframes[i];
  }

  // Check if we're currently clicking (near a click keyframe)
  const isClicking = keyframes.some(
    (kf) => kf.isClick && Math.abs(frame - kf.frame) < 6
  );

  // If no next keyframe, stay at previous position
  if (!nextKeyframe) {
    return { point: prevKeyframe.point, isClicking };
  }

  // Calculate movement window
  const moveStart = Math.max(prevKeyframe.frame, nextKeyframe.frame - moveDurationFrames);
  const moveEnd = nextKeyframe.frame;

  if (frame < moveStart) {
    return { point: prevKeyframe.point, isClicking };
  }

  if (frame >= moveEnd) {
    return { point: nextKeyframe.point, isClicking };
  }

  // Interpolate position with easing
  const progress = interpolate(frame, [moveStart, moveEnd], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return {
    point: {
      x: prevKeyframe.point.x + (nextKeyframe.point.x - prevKeyframe.point.x) * progress,
      y: prevKeyframe.point.y + (nextKeyframe.point.y - prevKeyframe.point.y) * progress,
    },
    isClicking,
  };
}
