# Claude Code Prompts

Copy-paste these prompts when working with Claude Code in this repo.

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
