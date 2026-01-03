Hi
# Social Media Content Workflow

A file-based system for collaborative LinkedIn content creation. JSON files for easy scripting and scheduler integration.

## Structure

```
content/
├── 01-braindumps/    → Raw ideas, voice transcripts, notes
├── 02-themes/        → Summarized themes (AI-generated)
├── 03-drafts/        → LinkedIn post drafts (AI-generated)
├── 04-scheduled/     → Approved, ready to publish
└── 05-published/     → Archive of posted content
```

## JSON Schema

Each stage has a specific schema. See `_example.json` in each folder.

### Common Fields (all stages)
```json
{
  "id": "unique-identifier",
  "created": "2024-12-27T10:30:00Z",
  "modified": "2024-12-27T14:00:00Z",
  "author": "dylan",
  "type": "braindump|theme|draft|scheduled|published",
  "content": "The actual text content...",
  "tags": ["topic1", "topic2"]
}
```

### Scheduled Posts (for scheduler API)
```json
{
  "id": "post-id",
  "type": "scheduled",
  "platform": "linkedin",
  "scheduled_date": "2025-01-15T09:00:00Z",
  "timezone": "America/New_York",
  "status": "pending",
  "content": "Post content here...",
  "reviewed_by": "lauren",
  "approved_at": "2024-12-28T09:00:00Z"
}
```

## Workflow

### 1. Capture Ideas
Create a JSON file in `content/01-braindumps/`:
```json
{
  "id": "2024-12-27-morning",
  "created": "2024-12-27T10:30:00Z",
  "modified": "2024-12-27T10:30:00Z",
  "author": "dylan",
  "type": "braindump",
  "content": "Raw thoughts here...",
  "tags": [],
  "source": "voice-note"
}
```

### 2. Generate Themes (Claude Code)
```
Read the braindumps in content/01-braindumps/ and create
theme JSON files in content/02-themes/. Group related ideas.
Output valid JSON matching the theme schema.
```

### 3. Generate Drafts (Claude Code)
```
Based on the theme in content/02-themes/authenticity.json,
write 2-3 LinkedIn post drafts as JSON files in content/03-drafts/.
```

### 4. Review & Approve
- Pull latest changes
- Edit draft JSON files (update `content`, `modified` timestamp)
- When approved, move to `04-scheduled/` and add:
  - `scheduled_date`
  - `reviewed_by`
  - `approved_at`
  - `status: "pending"`

### 5. Publish (via scheduler script)
- Script reads `04-scheduled/*.json` where `status: "pending"`
- Posts to LinkedIn via scheduler API
- Moves file to `05-published/` with:
  - `status: "posted"`
  - `published_at`
  - `post_url`
  - `api_response`

## File Naming

Use descriptive names: `topic-name.json` or `YYYY-MM-DD-topic.json`

The `id` field inside the JSON is the canonical identifier.

## Collaboration

- Both users work in the same repo
- Pull before starting work
- Commit and push your changes
- Use descriptive commit messages

## See Also

- `CLAUDE.md` - Prompts for common Claude Code tasks
- `plan.md` - Original implementation plan
