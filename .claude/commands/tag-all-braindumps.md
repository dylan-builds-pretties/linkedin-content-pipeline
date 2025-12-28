---
description: Tag all braindumps that have empty or missing tags
allowed-tools: Read, Edit, Glob
---

1. List all files in content/01-braindumps/ (excluding _example files)
2. For each file, read it and check if tags array is empty
3. For files with empty tags, analyze content and generate 3-7 tags
4. Update each file with the new tags
5. Report which files were updated

Keep tags lowercase, use hyphens for multi-word tags.
