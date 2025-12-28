---
description: Auto-generate tags for a braindump based on its content
argument-hint: [filename]
allowed-tools: Read, Edit, Glob
---

Read the braindump at content/01-braindumps/$ARGUMENTS (add .json if not provided).

Analyze the content and generate 3-7 relevant tags based on:
- Main topics and themes
- Industry/domain references
- Tone (personal, professional, controversial)
- Content type (story, opinion, how-to, reflection)

IMPORTANT: Preserve any existing tags - merge new ones with existing.
Keep tags lowercase, use hyphens for multi-word tags.
Update the file's tags array using Edit tool.
