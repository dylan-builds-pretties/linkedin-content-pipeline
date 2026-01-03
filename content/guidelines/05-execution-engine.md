# Execution Engine

**How Elite Teams Make This Scalable**

This is where most teams fail. Elite teams document everything so output does not depend on one person.

---

## The Core Docs You Need (Minimum)

### 1. Brand Logic Doc (5–7 pages)

Includes:
- Worldview (the 5 core beliefs)
- Voice polarity (IS vs IS NOT)
- Sentence rules (Do/Avoid)
- Examples of "on-brand" vs "off-brand"

**Location:** [01-brand-voice.md](./01-brand-voice.md)

### 2. Content Pillar Matrix

A table like this:

| Pillar | Core Belief | Allowed Formats | Hard No's |
|--------|-------------|-----------------|-----------|
| Systems Thinking | Structure beats hustle | Text posts, diagrams | Motivation quotes |
| Data Literacy | Data ≠ insight | Explanations, warnings | Buzzwords |
| Behind-the-Scenes | We build what we wish existed | Engineering insights | Marketing speak |
| Market Reality Checks | Deals fail for boring reasons | Post-mortems, patterns | Hype |
| Quiet Wins | Results > launches | Adoption patterns | Bragging |

**Location:** [02-content-pillars.md](./02-content-pillars.md)

### 3. Post Review Checklist (Non-negotiable)

Before posting, someone must answer:

| Question | Answer Required |
|----------|-----------------|
| Which pillar is this? | [One of 5] |
| Which belief does it reinforce? | [One of 5 worldview beliefs] |
| What specific insight is delivered? | [One sentence] |
| What sentence would I cut if forced? | [Identify weakest line] |

**Location:** [03-decision-rules.md](./03-decision-rules.md)

### 4. Content Backlog (Living Document)

Elite teams don't "come up with ideas." They collect observations continuously.

Your backlog should include:
- Customer quotes
- Internal debates
- Bugs that revealed insights
- Sales objections
- Mistakes you made

Each item becomes future content.

**Location:** `content/ideas/` folder

---

## Weekly Rhythm

### Monday
- Post short observation
- Capture notes for weekly post

### Tuesday–Thursday
- Daily posts from backlog
- Light editing

### Friday
- Publish weekly post
- Outline next week's theme

### End of Month
- Assemble monthly article from best weekly ideas

### End of Quarter
- Choose strongest monthly theme
- Expand into white paper

---

## The Content Pipeline

```
Braindump → Idea → Draft → Review → Scheduled → Published
```

### Stage 1: Braindump
Raw thoughts captured in `content/ideas/[id].json`

### Stage 2: Idea Refinement
Notes added with:
- Working title options
- Refined core idea
- Content angles
- Suggested weekly breakdown

### Stage 3: Draft
Posts created in `content/posts/[id].json` with:
- status: "draft"
- sourceIdea linking to parent

### Stage 4: Review
Apply the 5-question content gate:
1. Useful without Pillar?
2. Teaches thinking?
3. Respectable disagreement possible?
4. Specific enough?
5. Would post with comments off?

### Stage 5: Scheduled
- status: "scheduled"
- scheduledDate and scheduledTime set

### Stage 6: Published
- status: "published"
- publishedAt timestamp recorded

---

## Quality Assurance

### Before Every Post

1. Run through 5-question gate
2. Check voice polarity (IS vs IS NOT)
3. Verify pillar alignment
4. Review sentence-level rules
5. Get second pair of eyes if possible

### Weekly Review

- Which posts performed best?
- What patterns are emerging?
- What should we do more of?
- What should we stop doing?

### Monthly Audit

- Are we balanced across pillars?
- Are we hitting our cadence targets?
- Is the voice consistent?
- What ideas are we sitting on too long?

---

## How This Mirrors Pillar's Product Philosophy

This system reflects how Pillar itself is built:

| Product Principle | Content Equivalent |
|-------------------|-------------------|
| Judgment → documented logic | Voice rules, decision gates |
| Manual → systematized | Weekly rhythm, pipeline stages |
| One-off → scalable | Content pillars, templates |
| Speed from structure | Backlog-driven, not brainstorm-driven |

Your social presence should feel like: **A public version of how Pillar itself is built.**

---

## Final Instruction

> "We are not here to post content.
> We are here to document how we think, and let the right people recognize themselves in it."
