# AI-Powered Demo Video Generation

## Overview

A system that lets you describe workflows in natural language and automatically generates Screen Studio-style demo videos. Instead of manually specifying CSS selectors and button clicks, you describe what you want to record and Claude Code figures out the details by analyzing your codebase.

**Example Input:**
> "Show logging in, filtering by vacant parcels, and exporting leads"

**Output:** Polished demo video with cursor animations, click effects, and zoom/pan.

---

## Architecture

```
Natural Language Input
        ↓
┌─────────────────────┐
│ Fetch & Parse       │ ← GitHub API
│ Target Codebase     │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ UI Structure Map    │  Routes, components, selectors
│ (Cached JSON)       │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ Claude Workflow     │ ← Prompt with UI context
│ Generator           │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ Preview & Edit      │  Confidence scores, alternatives
│ Generated Steps     │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ Playwright Capture  │  Record browser + events
└─────────────────────┘
        ↓
┌─────────────────────┐
│ Remotion Render     │  Cursor, click effects, zoom
└─────────────────────┘
```

---

## Current State (Already Implemented)

### Video Generation System
- `components/content-generator/video-generator-dialog.tsx` - Manual step builder UI
- `app/api/videos/generate/route.ts` - Playwright execution engine
- `lib/video-types.ts` - WorkflowStep type definitions
- `demos/track.ts` - Event tracking for overlays
- `remotion/` - Video composition with cursor, ripples, callouts

### What's Missing
The current system requires manual step definition:
```typescript
{ type: "click", selector: "button[type='submit']", label: "Login" }
```

We need AI-powered step generation from natural language.

---

## Files to Create

### Core Library (`/lib/workflow-generation/`)

| File | Purpose |
|------|---------|
| `types.ts` | UIElement, UIRoute, UIStructureMap, GeneratedWorkflowStep |
| `github-fetcher.ts` | Fetch files from GitHub repos via API |
| `codebase-analyzer.ts` | Parse React/Next.js components, extract UI elements |
| `selector-generator.ts` | Generate CSS selectors from JSX analysis |
| `workflow-generator.ts` | Claude integration: NL → workflow steps |
| `selector-validator.ts` | Optional live validation with Playwright |

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/workflow/analyze-codebase` | Analyze GitHub repo, return UI structure |
| `POST /api/workflow/generate` | Convert natural language to workflow steps |
| `POST /api/workflow/validate-selectors` | Test selectors against live site |

### UI Components

| Component | Purpose |
|-----------|---------|
| `ai-workflow-dialog.tsx` | Natural language input + GitHub URL |
| `workflow-step-preview.tsx` | Show generated step with confidence |

---

## Files to Modify

| File | Changes |
|------|---------|
| `video-generator-dialog.tsx` | Add "AI Generate" mode toggle |
| `lib/video-types.ts` | Add `confidence`, `alternativeSelectors`, `aiGenerated` fields |
| `api/videos/generate/route.ts` | Add retry logic with alternative selectors |

---

## Key Implementation Details

### 1. Codebase Analysis

Use GitHub Contents API to fetch and parse React/Next.js apps:

```typescript
// Fetch these directories
const directories = ['app/', 'pages/', 'components/', 'src/'];

// Extract from each component
interface UIElement {
  type: "button" | "input" | "link" | "select" | "form";
  label?: string;           // Button text, aria-label
  selector: string;         // Primary CSS selector
  alternativeSelectors: string[];
  componentPath: string;    // Source file
  parentRoute?: string;     // Which page it appears on
}
```

### 2. Selector Generation Priority

Generate selectors in order of reliability:

1. `[data-testid="login-button"]` - Most stable
2. `[aria-label="Log in"]` - Semantic
3. `#login-button` - Unique ID
4. `input[name="email"]` - Form fields
5. `button:contains("Log in")` - Text-based fallback

### 3. Prompt Engineering

```
## UI Structure
Routes found:
- /login → LoginPage
  - email-input: input[name="email"]
  - password-input: input[name="password"]
  - submit-button: button[type="submit"]
- /dashboard → DashboardPage
  - filter-dropdown: [data-testid="parcel-filter"]
  - export-button: button:contains("Export")

## User Request
"Show logging in, filtering by vacant parcels, and exporting leads"

## Generate
JSON array of WorkflowStep with confidence scores (0-1)
```

### 4. Confidence Scoring

| Score | Meaning | Selector Type |
|-------|---------|---------------|
| 0.9-1.0 | High | data-testid, unique ID |
| 0.7-0.9 | Medium | aria-label, name attribute |
| 0.5-0.7 | Low | Structural/text-based |

### 5. Generated Step Format

```typescript
interface GeneratedWorkflowStep extends WorkflowStep {
  confidence: number;
  alternativeSelectors?: string[];
  reasoning?: string;
  aiGenerated: true;
}
```

---

## User Flow

1. **Enter workflow description**
   > "Show logging in, filtering by vacant parcels, and exporting"

2. **Provide GitHub URL**
   > `https://github.com/company/webapp`

3. **System analyzes codebase** (cached for future use)
   - Fetches React components via GitHub API
   - Extracts routes, buttons, forms, inputs
   - Builds UI structure map

4. **Claude generates steps**
   - Maps natural language to UI elements
   - Generates selectors with confidence scores
   - Adds appropriate waits between actions

5. **Preview generated steps**
   - See each step with confidence indicator
   - Edit selectors or switch to alternatives
   - Add/remove steps as needed

6. **Optional: Validate live**
   - Test selectors against running site
   - Suggest alternatives for failures

7. **Execute and generate video**
   - Runs through existing Playwright pipeline
   - Applies Remotion overlays
   - Outputs polished MP4

---

## Implementation Order

### Phase 1: Foundation
1. Create type definitions (`lib/workflow-generation/types.ts`)
2. Implement GitHub fetcher (`github-fetcher.ts`)
3. Build React component parser (`codebase-analyzer.ts`)

### Phase 2: AI Integration
4. Create selector generator (`selector-generator.ts`)
5. Build workflow generator with Claude (`workflow-generator.ts`)
6. Create API endpoints

### Phase 3: UI
7. Create AI workflow dialog component
8. Add mode toggle to existing video generator
9. Build step preview with confidence display

### Phase 4: Validation
10. Add live selector validation
11. Implement retry with alternatives
12. Polish error handling

---

## API Examples

### Analyze Codebase

```bash
POST /api/workflow/analyze-codebase
{
  "source": "github",
  "url": "https://github.com/company/webapp",
  "branch": "main"
}

# Response
{
  "structureId": "struct-abc123",
  "routes": [
    {
      "path": "/login",
      "elements": [
        { "type": "input", "selector": "input[name='email']", "label": "Email" },
        { "type": "button", "selector": "button[type='submit']", "label": "Log in" }
      ]
    }
  ]
}
```

### Generate Workflow

```bash
POST /api/workflow/generate
{
  "description": "Show logging in and exporting data",
  "structureId": "struct-abc123",
  "targetUrl": "https://app.example.com"
}

# Response
{
  "steps": [
    {
      "type": "goto",
      "value": "https://app.example.com/login",
      "confidence": 1.0
    },
    {
      "type": "fill",
      "selector": "input[name='email']",
      "alternativeSelectors": ["#email", "[data-testid='email']"],
      "value": "demo@example.com",
      "confidence": 0.95,
      "aiGenerated": true
    }
  ]
}
```

---

## Configuration

### Environment Variables

```env
# Required for Claude workflow generation
ANTHROPIC_API_KEY=sk-ant-xxx

# Optional for private repos
GITHUB_TOKEN=ghp_xxx
```

### Target Site Setup

For best results, the target site should have:
- `data-testid` attributes on interactive elements
- Semantic HTML (buttons, inputs with names/labels)
- Accessible markup (aria-labels)

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| Selector not found | Try alternative selectors, log for improvement |
| Element not visible | Add wait, retry up to 3 times |
| Navigation timeout | Increase timeout, warn user |
| Auth failure | Skip to main workflow, warn user |
| Ambiguous intent | Return multiple workflow variations |
