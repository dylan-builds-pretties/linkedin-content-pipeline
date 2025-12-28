---
description: Analyze braindumps and create theme files from common patterns
allowed-tools: Read, Write, Glob
---

1. Read all braindumps in content/01-braindumps/ (excluding _example files)
2. Identify 2-4 common themes that connect multiple braindumps
3. For each theme, create a new file in content/02-themes/ with:
   - id: kebab-case theme name
   - title: Theme title
   - description: 2-3 sentence summary
   - keyPoints: Array of 3-5 bullet points
   - sourceBraindumps: Array of braindump IDs that contributed
   - postAngles: Array of 2-3 potential post angles
   - tags: Relevant tags
   - createdAt/updatedAt timestamps

Use the existing theme file format (see content/02-themes/_example.json).
Skip themes that already exist unless they need updating.
