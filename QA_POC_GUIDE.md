# AI-Driven QA Automation — PoC Execution Guide

> **What this document is:** An operational guide for executing a Proof of Concept that validates AI-driven test generation and maintenance using GitNexus, Claude Code, and Playwright Agents.
>
> **How to use it:** Feed this document to Claude Code at the start of each working session. It contains the full context, methodology, and prompt templates needed to execute each phase.

---

## Project Context

We are building an automated QA system that replaces manual test creation and maintenance. The system uses three tools composed together:

- **GitNexus** — Indexes a codebase into a knowledge graph (symbols, call chains, dependencies, execution flows). Exposes 7 MCP tools for querying the graph. The critical capability: `detect_changes` maps a git diff to affected symbols and execution flows with risk levels.
- **Claude Code / Anthropic API** — LLM that generates unit tests informed by GitNexus structural context. In the PoC, used interactively. In production, called via API with standardized prompts.
- **Playwright Agents** (v1.56+) — Three agents: Planner (explores app → produces Markdown test plans), Generator (converts plans → executable .spec.ts files), Healer (auto-repairs failing tests). Uses accessibility tree snapshots, not screenshots.

The PoC has 4 phases executed over ~13 working days. Each phase builds on the previous one's outputs.

---

## Prerequisites Checklist

Before starting any phase, ensure the following are installed and configured:

```bash
# Runtime
node --version  # Must be v18+
git --version

# GitNexus
npm install -g gitnexus
gitnexus --version

# Playwright (install in the target repo)
npm install -D @playwright/test@latest
npx playwright install chromium

# Verify Claude Code has GitNexus MCP configured
claude mcp add gitnexus -- npx -y gitnexus@latest mcp
```

---

## Target Repository Requirements

The PoC needs a real repository. When selecting or creating one, it must meet ALL of these criteria:

- Written in **TypeScript or JavaScript** (GitNexus has strongest parsing support)
- Has a **running web UI** accessible via localhost (required for Playwright Agents)
- Has **at least 20 files and 100+ exported symbols** (enough graph density)
- Has **at least 3 meaningful commits/PRs** on different areas of the codebase
- Has some **existing tests** (even partial) to validate gap analysis
- Uses a **standard test framework** (Jest, Vitest, or Playwright Test)

If creating a repo from scratch for the PoC, build a small but realistic web application. A good candidate would be something like a task management API + React frontend with: user authentication, CRUD operations on a core entity, role-based access, and at least one multi-step workflow (e.g., create → assign → complete → archive).

---

## Phase 1: GitNexus Validation (Day 1–2)

### Goal

Confirm that GitNexus produces an accurate knowledge graph and that its tools return reliable structural data.

### Step 1.1 — Index the Repository

Run from the repository root:

```bash
npx gitnexus analyze
```

After indexing completes, verify:

```bash
gitnexus status
```

Record these metrics:
- Total symbols detected
- Total relationships mapped
- Execution flows (processes) detected
- Wall-clock indexing time
- Languages detected

### Step 1.2 — Inspect the Knowledge Graph via MCP

Use GitNexus MCP tools to explore the indexed graph. Run these queries and evaluate the results:

```
# 1. Get overall codebase context
READ gitnexus://repo/{name}/context

# 2. List all execution flows
READ gitnexus://repo/{name}/processes

# 3. List all functional clusters
READ gitnexus://repo/{name}/clusters

# 4. Inspect a specific cluster
READ gitnexus://repo/{name}/cluster/{clusterName}

# 5. Trace a specific execution flow
READ gitnexus://repo/{name}/process/{processName}
```

**Validation task:** Manually verify at least 5 processes against your understanding of the codebase. For each, answer:
- Does the process name reflect the actual flow?
- Are the steps in the correct order?
- Are any symbols missing from the trace?

### Step 1.3 — Validate detect_changes

Select 3 commits of varying complexity. For each:

```
# Compare against the parent commit
gitnexus_detect_changes({ scope: "compare", base_ref: "<parent-sha>" })
```

Record for each commit:
- changed_count, affected_count, changed_files, risk_level
- List of changed_symbols
- List of affected_processes
- Manual accuracy assessment: what did GitNexus miss? What did it falsely flag?

### Step 1.4 — Validate impact and context

Pick 3 high-connectivity symbols (a core service, a widely-used utility, a central middleware):

```
# Blast radius analysis
gitnexus_impact({ target: "SymbolName", direction: "upstream", minConfidence: 0.7 })

# 360-degree view
gitnexus_context({ name: "SymbolName" })
```

For each, verify:
- Depth 1 callers: are they correct?
- Confidence scores: do they feel reasonable?
- Process participation: does the symbol appear in the expected flows?

### Phase 1 Output

Write a short validation report (can be a markdown file in the repo) documenting:
- Index stats
- detect_changes accuracy per commit (as a percentage)
- impact/context accuracy per symbol
- Any gaps, false positives, or concerns
- Go/No-Go decision for proceeding to Phase 2

---

## Phase 2: Unit Test Generation (Day 3–5)

### Goal

Generate unit tests using Claude Code, informed by GitNexus structural context, and measure their quality.

### Step 2.1 — Baseline Measurement

Run the existing test suite and record:
- Total tests, pass rate, code coverage percentage
- Test framework in use (Jest, Vitest, etc.)
- Test file conventions (location patterns, naming patterns)
- Mock/stub strategies used in existing tests

### Step 2.2 — PR-Driven Test Generation

For each of the 3 commits used in Phase 1, follow this exact workflow:

#### a) Gather GitNexus Context

```
# 1. What changed?
gitnexus_detect_changes({ scope: "compare", base_ref: "<parent-sha>" })

# 2. For each changed symbol with risk >= medium:
gitnexus_impact({ target: "symbolName", direction: "upstream", minConfidence: 0.7 })

# 3. For the highest-risk symbols:
gitnexus_context({ name: "symbolName" })
```

#### b) Generate Tests — Prompt Template

Use this prompt template, filling in the placeholders with real data from the steps above:

```
I need you to generate unit tests for code changes in this repository.

## Changed Code
Here is the diff for this change:
<paste the git diff or describe the changes>

## Structural Context from GitNexus

### Changed Symbols
<paste detect_changes output: list of changed symbols with their files and types>

### Blast Radius
<paste impact output for each changed symbol: depth-grouped callers with confidence>

### Execution Flow Context
<paste context output: processes each symbol participates in, callers, callees>

## Existing Test Conventions
- Framework: <Jest/Vitest/etc.>
- Test location: <e.g., __tests__/ next to source, or tests/ at root>
- Naming: <e.g., *.test.ts, *.spec.ts>
- Mocking: <e.g., jest.mock, vi.mock, manual stubs>

## What I Need

Generate unit tests organized by risk tier:

**P0 (must test — directly changed code):**
- Test each changed function/method directly
- Cover the happy path and at least one error/edge case per function
- If the function has branching logic visible in the diff, test each branch

**P1 (should test — direct callers at depth 1):**
- For each depth-1 caller from the blast radius:
  - Test that it still works correctly with the changed behavior
  - Focus on the integration point (how the caller uses the changed function)

**P2 (nice to have — edge cases from process context):**
- For each execution flow that includes the changed symbol:
  - Generate one test that exercises the flow end-to-end at the unit level
  - Focus on data transformations along the flow

## Constraints
- Do NOT duplicate any existing tests (check the existing test files first)
- Follow the project's existing test conventions exactly
- Use the same mocking patterns already in use
- Each test must have a descriptive name that explains WHAT it tests and WHY
- Add a comment at the top of each generated test file: "Generated for commit <sha> — targets <symbol name>"
```

#### c) Evaluate Generated Tests

For each generated test file, record:

| Metric | Count |
|--------|-------|
| Total tests generated | |
| Tests that compile/lint cleanly | |
| Tests that run (even if failing) | |
| Tests that pass | |
| Tests that are meaningfully correct (manual judgment) | |
| Tests that would have caught the actual change | |
| Tests that duplicate existing coverage | |

### Step 2.3 — Refine the Prompt

After all 3 rounds, identify patterns:
- What categories of tests did Claude Code generate well?
- What categories did it struggle with? (Complex mocks? Database fixtures? External stubs?)
- Did GitNexus context improve test quality vs. generating from diff alone?
- What prompt modifications improved results across rounds?

Document the **final refined prompt template** — this becomes the production prompt for the automated pipeline.

### Phase 2 Output

- Test generation report per commit (metrics table above)
- Final refined prompt template
- Gap analysis: what the LLM can't generate well and will need human review
- Go/No-Go for Phase 3

---

## Phase 3: Playwright Agents — Initial Coverage (Day 6–9)

### Goal

Build a baseline E2E test suite using Playwright Agents, scoped by GitNexus execution flows.

### Step 3.1 — Application Setup

```bash
# Ensure the app is running locally
npm run dev  # or whatever starts the application

# Verify it's accessible
curl http://localhost:3000  # or the appropriate port
```

If the app requires authentication:

```bash
# Create a storage state file with valid session
# Option 1: Use Playwright codegen to capture auth
npx playwright codegen --save-storage=auth.json http://localhost:3000/login

# Option 2: Create programmatically in a setup script
```

### Step 3.2 — Initialize Playwright Agents

```bash
# Initialize agent definitions (creates .github/ agent configs + seed file)
npx playwright init-agents --loop vscode
```

Edit the generated `tests/seed.spec.ts` to include your app's base setup:

```typescript
import { test, expect } from './fixtures';

test('seed', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:3000');
  
  // If auth is needed, load storage state here
  // await page.context().addCookies(...)
});
```

### Step 3.3 — Process-Driven Exploration with Planner

This is the key methodological step: we scope the Planner using GitNexus processes instead of random exploration.

#### a) Export and classify processes

```
# Get all execution flows
READ gitnexus://repo/{name}/processes
```

Classify each process:
- **UI-facing:** The process includes symbols that render UI or handle HTTP requests (controllers, route handlers, React components)
- **Backend-only:** The process is purely server-side (database migrations, background jobs, internal services)

Only UI-facing processes are candidates for E2E tests.

#### b) Prioritize

From the UI-facing processes, select the top 5–10 based on:
- Risk level (processes touching auth, payments, core workflows = higher priority)
- Complexity (multi-step flows with branching = more value from automation)
- User impact (flows that real users execute frequently)

#### c) Run the Planner for each prioritized process

Open VS Code Agent Mode, select the **Playwright Planner** agent, and use this prompt template:

```
Explore the following user flow on http://localhost:3000:

Flow: <process name from GitNexus>
Description: <brief description of what this flow does>
Entry point: <starting URL or action>

Specific areas to cover:
- Happy path: <describe the main success scenario>
- Error states: <describe expected error conditions>
- Edge cases: <any boundary conditions from the GitNexus process trace>

The application uses <React/Vue/etc> with <relevant UI framework details>.
Use seed.spec.ts as the base test.
Save the test plan to specs/<flow-name>.md
```

#### d) Review generated test plans

For each `specs/*.md` file the Planner produces:
- Are the scenarios accurate?
- Are the steps in the correct order?
- Are the expected results reasonable?
- Did the Planner discover any flows or edge cases you didn't anticipate?

### Step 3.4 — Generate Tests with Generator

For each approved test plan, switch to the **Playwright Generator** agent:

```
Use the test plan in specs/<flow-name>.md to generate Playwright tests.
Save them in tests/<flow-name>/
Use seed.spec.ts as the seed test.
```

The Generator will:
1. Open the live app in a browser
2. Navigate through each scenario in the plan
3. Verify selectors against the real DOM
4. Produce .spec.ts files with assertions

### Step 3.5 — Run and Validate

```bash
# Run all generated tests
npx playwright test

# If using headed mode for debugging:
npx playwright test --headed

# View the HTML report
npx playwright show-report
```

Record: total tests, pass/fail/error, execution time.

### Step 3.6 — Healer Validation

If any tests fail:

1. Switch to the **Playwright Healer** agent
2. Prompt: `Run the failing tests in tests/<flow-name>/ and fix them.`
3. The Healer will analyze failure traces, update selectors, and re-run
4. Record: tests fixed automatically vs. tests requiring manual intervention

### Phase 3 Output

- Baseline E2E test suite (committed to the repo)
- Coverage map: which GitNexus processes have E2E coverage, which don't
- Healer effectiveness metrics
- Go/No-Go for Phase 4

---

## Phase 4: Progressive Coverage — PR-Triggered Loop (Day 10–12)

### Goal

Simulate the production workflow: a code change lands, the system detects impact, generates/updates tests, and reports results.

### Step 4.1 — Make a Real Code Change

Create a meaningful change to the codebase. Good candidates:
- Add a new field to a core entity (ripples through validation, API, UI)
- Modify a business rule in a service function (affects callers)
- Refactor a shared utility (wide blast radius)

Commit the change to a branch.

### Step 4.2 — Re-index and Detect Changes

```bash
# Update the GitNexus index
npx gitnexus analyze

# Detect what changed
gitnexus_detect_changes({ scope: "compare", base_ref: "main" })
```

### Step 4.3 — Unit Test Update (Pillar 1)

Using the refined prompt template from Phase 2:
1. Gather GitNexus context for the changes
2. Generate unit tests for the changed and affected symbols
3. Run the new tests alongside the existing suite
4. Record: new tests generated, existing tests still passing, regressions detected

### Step 4.4 — E2E Test Update (Pillar 2)

Cross-reference affected processes from detect_changes against Phase 3's coverage map:

**For affected flows WITH existing tests:**
1. Run the existing E2E tests
2. If failures occur, run the Healer
3. Record: did the Healer auto-repair? Or is this a real bug the change introduced?

**For affected flows WITHOUT existing tests:**
1. Run the Planner for these new flows
2. Run the Generator to produce tests
3. Run and validate the new tests

### Step 4.5 — End-to-End Timing

Time the full sequence from start to finish:

| Step | Time |
|------|------|
| gitnexus analyze (re-index) | |
| detect_changes + impact + context | |
| Unit test generation (Claude Code) | |
| Unit test execution | |
| E2E test update/generation (Planner + Generator) | |
| E2E test execution | |
| Healer (if needed) | |
| **Total** | |

Target: < 20 minutes total.

### Phase 4 Output

- Pipeline timing breakdown
- Test delta: new tests added, tests modified, total pass rate
- Comparison against PRD targets
- Final Go/No-Go assessment

---

## Go/No-Go Decision Matrix

| Signal | Go | Conditional Go | No-Go |
|--------|----|----|--------|
| GitNexus accuracy (detect_changes) | 90%+ correct | 70–89% correct | < 70% |
| Unit test quality | 80%+ meaningful | 60–79% meaningful | < 60% |
| E2E generation (Planner + Generator) | 80%+ pass first run | 60–79% pass | < 60% |
| Healer effectiveness | Fixes 70%+ failures | Fixes 50–69% | < 50% |
| Pipeline timing | < 20 min | 20–30 min | > 30 min |
| Re-indexing time | < 2 min | 2–5 min | > 5 min |

---

## Important Notes

### GitNexus License

GitNexus uses the PolyForm Noncommercial License 1.0.0. This PoC validates the technical approach. If successful and we want to productize, we must either obtain a commercial license from the maintainer or build equivalent code intelligence in-house.

### What This PoC Does NOT Cover

- Reporting/defect tooling (Jira, Slack integration) — deferred to post-PoC
- CI/CD automation (GitHub Actions orchestration) — the PoC is manual; automation comes after Go decision
- Multi-repo support — single repo only for the PoC
- Multi-language support — TypeScript/JavaScript only for the PoC

### Session Management for Claude Code

When starting a new Claude Code session, provide this context at the beginning:

```
I'm executing Phase <N> of the AI-driven QA PoC. 

The target repo is: <repo path>
GitNexus is indexed and configured via MCP.
The test framework is: <Jest/Vitest/Playwright Test>

I'm currently on Step <X.Y>. Here's where I left off:
<brief description of current state>

The full PoC guide is at: <path to this file>
```

This ensures continuity across sessions.
