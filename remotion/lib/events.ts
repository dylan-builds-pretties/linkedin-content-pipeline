import type { DemoEvent, Box } from "./types";

/**
 * Get the active callout at a given time
 */
export function getActiveCallout(
  events: DemoEvent[],
  t: number,
  calloutDuration: number = 2
): { box: Box; label: string } | null {
  for (const event of events) {
    if (event.type === "callout") {
      if (t >= event.t && t <= event.t + calloutDuration) {
        return { box: event.box, label: event.label };
      }
    }
  }
  return null;
}

/**
 * Get all events active at a given time
 */
export function getActiveEvents(events: DemoEvent[], t: number): DemoEvent[] {
  return events.filter((event) => {
    // Events are considered "active" for their display duration
    const displayDuration = getEventDisplayDuration(event);
    return t >= event.t && t <= event.t + displayDuration;
  });
}

/**
 * Get the display duration for an event type
 */
function getEventDisplayDuration(event: DemoEvent): number {
  switch (event.type) {
    case "click":
      return 0.5; // Click ripple lasts 0.5s
    case "callout":
      return 2; // Callouts last 2s
    case "focus":
      return 1; // Focus highlight lasts 1s
    case "type":
      return 1.5; // Typing indicator lasts 1.5s
    default:
      return 0;
  }
}

/**
 * Check if a click event is active at a given time
 */
export function isClickActive(
  events: DemoEvent[],
  t: number,
  clickDuration: number = 0.3
): { point: { x: number; y: number }; progress: number } | null {
  for (const event of events) {
    if (event.type === "click") {
      if (t >= event.t && t <= event.t + clickDuration) {
        const progress = (t - event.t) / clickDuration;
        return { point: event.point, progress };
      }
    }
  }
  return null;
}
