/**
 * AI Prompt templates for copy-paste into Claude Code
 */

export const prompts = {
  /**
   * Generate tags for a single braindump
   */
  tagBraindump: (id: string) => `Read content/01-braindumps/${id}.json, analyze the content, and generate 3-7 relevant tags based on:
- Main topics and themes
- Industry/domain references
- Tone (personal, professional, controversial)
- Content type (story, opinion, how-to, reflection)

IMPORTANT: Preserve any existing tags - merge new ones with existing.
Keep tags lowercase, use hyphens for multi-word tags.
Update the file's tags array.`,

  /**
   * Tag all braindumps that have empty tags
   */
  tagAllBraindumps: () => `1. List all files in content/01-braindumps/ (excluding _example files)
2. For each file, read it and check if tags array is empty
3. For files with empty tags, analyze content and generate 3-7 tags
4. Update each file with the new tags
5. Report which files were updated

Keep tags lowercase, use hyphens for multi-word tags.`,

  /**
   * Extract themes from braindumps
   */
  extractThemes: () => `1. Read all braindumps in content/01-braindumps/ (excluding _example files)
2. Identify 2-4 common themes that connect multiple braindumps
3. For each theme, create a new file in content/02-themes/ with:
   - id: kebab-case theme name
   - title: Theme title
   - themes: Rich text content in Markdown format (the main theme description)
   - sourceBraindumps: Array of braindump IDs that contributed
   - tags: Relevant tags
   - createdAt/updatedAt timestamps (ISO format)

Use the existing theme file format (see content/02-themes/_example.json if it exists).
Skip themes that already exist unless they need updating.`,

  /**
   * Generate LinkedIn drafts from a theme
   */
  generateDrafts: (themeId: string) => `Read the theme file at content/02-themes/${themeId}.json.

Create 2-3 LinkedIn post draft files in content/03-drafts/ following these guidelines:
- Under 1300 characters (LinkedIn limit for full display)
- Short paragraphs (1-2 sentences max)
- Strong hook that stops the scroll
- End with a question or call to action
- Conversational, not corporate
- Include line breaks for readability

Name files: YYYY-MM-DD-topic-v1.json, v2.json, etc.
Use the existing draft format (see content/03-drafts/_example.json if it exists).

Each draft should have:
- id: unique identifier
- title: descriptive title
- content: the LinkedIn post content
- themeId: reference to the source theme
- version: draft version number
- characterCount: length of content
- tags: relevant tags
- author: "ai-generated"
- notes: any internal notes
- createdAt/updatedAt: ISO timestamps`,
};
