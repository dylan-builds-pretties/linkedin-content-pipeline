import type { Locator, Page } from "playwright";
import type { Box, Point, Tracker } from "./track";

/**
 * Get the bounding box of a Playwright locator
 */
export async function locatorBox(locator: Locator): Promise<Box> {
  const bb = await locator.boundingBox();
  if (!bb) throw new Error("No bounding box (element not visible?)");
  return { x: bb.x, y: bb.y, w: bb.width, h: bb.height };
}

/**
 * Get the center point of a box
 */
export function centerOf(box: Box): Point {
  return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
}

/**
 * Focus on an element and log it to the tracker
 */
export async function focus(
  tr: Tracker,
  locator: Locator,
  label?: string
): Promise<Box> {
  const box = await locatorBox(locator);
  tr.addFocus(box, label);
  return box;
}

/**
 * Click an element and log it to the tracker
 */
export async function click(
  tr: Tracker,
  locator: Locator,
  label?: string
): Promise<void> {
  const box = await locatorBox(locator);
  tr.addClick(centerOf(box), box, label);
  await locator.click();
}

/**
 * Fill an input and log it to the tracker
 */
export async function fill(
  tr: Tracker,
  locator: Locator,
  text: string,
  label?: string
): Promise<void> {
  const box = await locatorBox(locator);
  tr.addFocus(box, label);
  tr.addType(text, box, label);
  await locator.fill(text);
}

/**
 * Type text with visible keystrokes and log it
 */
export async function typeText(
  tr: Tracker,
  locator: Locator,
  text: string,
  label?: string,
  delay: number = 50
): Promise<void> {
  const box = await locatorBox(locator);
  tr.addFocus(box, label);
  tr.addType(text, box, label);
  await locator.pressSequentially(text, { delay });
}

/**
 * Add a callout to highlight an element
 */
export async function callout(
  tr: Tracker,
  locator: Locator,
  label: string
): Promise<void> {
  const box = await locatorBox(locator);
  tr.addCallout(box, label);
}

/**
 * Wait for a duration with optional label
 */
export async function wait(
  tr: Tracker,
  page: Page,
  durationMs: number,
  label?: string
): Promise<void> {
  tr.addWait(durationMs / 1000, label);
  await page.waitForTimeout(durationMs);
}

/**
 * Scroll the page
 */
export async function scroll(
  tr: Tracker,
  page: Page,
  direction: "up" | "down",
  amount: number
): Promise<void> {
  tr.addScroll(direction, amount);
  const delta = direction === "down" ? amount : -amount;
  await page.mouse.wheel(0, delta);
}

/**
 * Human-like cursor movement (easing)
 * Uses multiple intermediate points with easing
 */
export async function moveCursor(
  page: Page,
  from: Point,
  to: Point,
  steps: number = 20,
  durationMs: number = 300
): Promise<void> {
  const delay = durationMs / steps;

  for (let i = 0; i <= steps; i++) {
    // Ease-out-quad function
    const t = i / steps;
    const ease = 1 - (1 - t) * (1 - t);

    const x = from.x + (to.x - from.x) * ease;
    const y = from.y + (to.y - from.y) * ease;

    await page.mouse.move(x, y);
    await page.waitForTimeout(delay);
  }
}
