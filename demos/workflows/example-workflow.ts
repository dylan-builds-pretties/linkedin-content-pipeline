import type { Page } from "playwright";
import type { Tracker } from "../track";
import { click, fill, focus, callout, wait, typeText } from "../util";

/**
 * Example workflow demonstrating how to create a demo video
 * This workflow navigates a hypothetical app and records events
 */
export async function run(page: Page, tr: Tracker): Promise<void> {
  // Navigate to the target page
  await page.goto("https://example.com");

  // Example: Focus on a search input
  const searchInput = page.getByRole("searchbox");
  if (await searchInput.isVisible()) {
    await focus(tr, searchInput, "Search");
    await typeText(tr, searchInput, "demo query", "Typing search query", 75);
  }

  // Example: Click a button
  const submitBtn = page.getByRole("button", { name: "Search" });
  if (await submitBtn.isVisible()) {
    await click(tr, submitBtn, "Submit search");
  }

  // Wait for results
  await wait(tr, page, 1000, "Loading results");

  // Example: Highlight a result
  const firstResult = page.locator(".result-item").first();
  if (await firstResult.isVisible()) {
    await callout(tr, firstResult, "First search result");
  }
}

/**
 * Workflow metadata for UI display
 */
export const metadata = {
  id: "example-workflow",
  name: "Example Search Flow",
  description: "Demonstrates searching and viewing results",
  estimatedDuration: 10, // seconds
  targetUrl: "https://example.com",
};
