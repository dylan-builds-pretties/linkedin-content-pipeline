# Claude Code Prompts

Copy-paste these prompts when working with Claude Code in this repo.

## Guidelines Reference

Before creating content, review the Social Media Operating System in `content/guidelines/`:

| Doc | Purpose |
|-----|---------|
| [index.md](content/guidelines/index.md) | Quick reference tables + navigation |
| [01-brand-voice.md](content/guidelines/01-brand-voice.md) | Voice, worldview, polarity, sentence rules |
| [02-content-pillars.md](content/guidelines/02-content-pillars.md) | 5 content pillars with formats |
| [03-decision-rules.md](content/guidelines/03-decision-rules.md) | 5-question content gate |
| [04-cadence-system.md](content/guidelines/04-cadence-system.md) | Time horizons + flywheel |
| [05-execution-engine.md](content/guidelines/05-execution-engine.md) | Workflows, checklists, pipeline |
| [06-post-formats.md](content/guidelines/06-post-formats.md) | Format menu for content |

**Key rule:** Every post must pass the 5-question content gate and align with at least one core worldview belief.

---

## Create a New Idea from a Braindump

```
Create a new idea with this as the braindump:

[PASTE YOUR BRAINDUMP HERE]
```

This will:
- Generate a unique ID for the idea
- Create a new file at content/ideas/[ID].json
- Use the schema from content/ideas/_example.json
- Set createdAt and updatedAt to current timestamp
- **Generate refined notes** that distill the braindump into content angles for social media manager review

### Notes Format

When generating notes, follow this structure to transform CEO/Founder braindumps into actionable content strategy:

```markdown
## Working Title Options
Primary: [Main title option]
Alternatives:
- [2-4 alternative titles with different tones]

## Refined Core Idea (Clean Thesis)
[Tightened, publishable articulation of the core insight - 2-3 paragraphs]

## The Foundational Shift (Plain Language)
[What's actually changing, explained simply - what the bottleneck used to be vs now]

## Core Framework
[If applicable, break down the main concept into 2-4 layers/categories with:]
- Best for: [use cases]
- Examples: [concrete examples]
- Characteristics: [key traits]

## Simple Summary
One-paragraph: [Single paragraph distillation]

Bullet Summary:
- [5-8 key takeaways]

## Content Angles (1-4 Weeks of Material)
### Angle 1: [Theme]
- [Post idea 1]
- [Post idea 2]
- [Post idea 3]
Formats: [text posts, carousels, videos, etc.]

### Angle 2: [Theme]
[Repeat structure]

## Suggested Weekly Breakdown (LinkedIn-First)
Week 1 - [Theme]
- Mon: [content type]
- Tue: [content type]
- Thu: [content type]
- Fri: [content type]

[Repeat for 2-4 weeks]

## Next Steps
- [Option 1: e.g., Turn into flagship article]
- [Option 2: e.g., Design signature carousel]
- [Option 3: e.g., Write opening post for series]
```

The goal is to distill raw braindumps into refined notes that pitch potential content angles, marketing themes, and campaigns for social media manager review.

---

## Generate LinkedIn Posts from an Idea

```
Read the idea file at content/ideas/[IDEA-ID].json and write
2-3 LinkedIn post drafts in content/posts/.

Guidelines:
- Keep posts under 1300 characters (LinkedIn limit for full display)
- Use short paragraphs (1-2 sentences max)
- Start with a hook that stops the scroll
- End with a question or call to action
- Be conversational, not corporate
- Include line breaks for readability

Use the Post schema from content/posts/_example.json.
Set status to "draft" and sourceIdea to the idea ID.
```

---

## Show Pipeline Status

```
Give me a quick summary of the content pipeline:
- How many ideas in content/ideas/?
- How many posts in content/posts/ (by status: draft, ready_for_review, scheduled, published)?

List the files in each folder with their status and dates.
```

---

## Review a Post

```
Read the post at content/posts/[POST-ID].json and give me feedback:
- Is the hook strong enough?
- Is it too long or too short?
- Does it sound authentic or corporate?
- Any suggested edits?
```

---

## Combine Multiple Ideas

```
Read all ideas in content/ideas/ and identify common themes.
Create a summary of the key themes and suggest which ideas
could be combined into a single compelling post.
```

---

## Generate Variations

```
Read the post at content/posts/[POST-ID].json and create
2 alternative versions with different:
- Opening hooks
- Tones (more personal, more professional, more provocative)
- Lengths (shorter punchy version, longer story version)

Save as new posts with incremented version numbers.
```

---

## Mark Post Ready for Review

```
Update the post at content/posts/[POST-ID].json:
- Set status to "ready_for_review"
- Update the updatedAt timestamp
```

---

## Schedule a Post

```
Update the post at content/posts/[POST-ID].json:
- Set status to "scheduled"
- Set scheduledDate to [DATE] (format: YYYY-MM-DD)
- Set scheduledTime to [TIME] (format: HH:MM)
- Set timezone to "America/New_York" (or specify)
- Update the updatedAt timestamp
```
