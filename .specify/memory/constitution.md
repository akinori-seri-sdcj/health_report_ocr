<!--
Sync Impact Report
- Version change: unversioned → 1.0.0
- Modified principles:
  - [PRINCIPLE_1_NAME] → Specification-First, Testable Outcomes
  - [PRINCIPLE_2_NAME] → Simplicity and User Value
  - [PRINCIPLE_3_NAME] → Data Privacy and Auditability
  - [PRINCIPLE_4_NAME] → Incremental Delivery with Independent Slices
  - [PRINCIPLE_5_NAME] → Change Control and Versioning
- Added sections:
  - Security, Privacy, and Quality Standards
  - Development Workflow, Reviews, and Checks
- Removed sections:
  - None
- Templates requiring updates:
  - .specify/templates/plan-template.md → ✅ Aligned (no changes required)
  - .specify/templates/spec-template.md → ✅ Aligned (no changes required)
  - .specify/templates/tasks-template.md → ✅ Aligned (no changes required)
  - .specify/scripts/powershell/create-new-feature.ps1 → ⚠ Pending: enforce no automatic branch creation for `specify` flows; commit specs to current branch by default
  - README.md → ⚠ Pending: add link to Constitution and summarize governance rules
- Deferred items:
  - TODO(RATIFICATION_DATE): Original adoption date unknown; set once known
-->

# Health Report OCR Constitution

## Core Principles

### Specification-First, Testable Outcomes
MUST begin every change with a user-focused Feature Specification using the
repository template. Specifications MUST define independently testable user
stories, clear acceptance scenarios, and measurable success criteria. No
implementation work starts until the specification is reviewed and accepted.

Rationale: Testable, user-centered specs reduce rework and align teams on
outcomes over implementation details.

### Simplicity and User Value
Deliver the smallest change that provides visible user value. Defer optional
complexity (YAGNI). Each increment MUST stand on its own and avoid introducing
new abstractions without a concrete, demonstrated need.

Rationale: Simplicity speeds delivery, reduces defects, and improves usability.

### Data Privacy and Auditability
Treat all health-related data as sensitive. Logs, screenshots, and diagnostics
MUST exclude personally identifiable information. Data exposure MUST be
minimized to only what is necessary for the task. Exports MUST clearly indicate
their content and origin with traceability back to inputs.

Rationale: Protecting sensitive data ensures compliance and user trust.

### Incremental Delivery with Independent Slices
User stories MUST be independently implementable, testable, and demonstrable.
Acceptance scenarios MUST verify end-to-end behavior for each story. Integration
points are added only when a story requires them and without breaking existing
stories.

Rationale: Independent slices reduce coupling and allow fast, continuous value
delivery.

### Change Control and Versioning
Specification artifacts (specs, plans, tasks, this constitution) MUST be
versioned. Governance changes follow semantic versioning: MAJOR for incompatible
governance changes, MINOR for added/expanded guidance, PATCH for clarifications.
For `specify` flows, automatic branch creation is DISABLED; specifications are
committed to the current working branch unless a major feature/fix explicitly
requires a dedicated branch.

Rationale: Predictable change management preserves velocity and traceability.

## Security, Privacy, and Quality Standards

- Sensitive Data: Collect the minimum necessary; mask or omit sensitive values
  in UI previews, logs, and diagnostics. Error messages MUST avoid sensitive
  content.
- Access and Consent: Only authorized users access sensitive features; obtain
  appropriate user consent where required.
- Traceability: For OCR and exports, maintain clear provenance from inputs to
  outputs so results can be reviewed and reproduced.
- Reliability and Performance: Interactions that render or filter OCR results
  should feel instantaneous for typical use; long-running exports MUST provide
  clear progress and completion feedback.
- Accessibility and Clarity: Interfaces presenting OCR data MUST be readable
  and accessible, enabling users to verify and correct results efficiently.

## Development Workflow, Reviews, and Checks

- Speckit Flow: Use `/speckit.specify` → `/speckit.clarify` → `/speckit.plan`
  → `/speckit.tasks`. Each stage MUST pass the Constitution Check gates.
- Checklists: Specifications MUST include a quality checklist with measurable
  success criteria and unambiguous requirements. All blockers are resolved or
  explicitly tracked.
- Branch Policy: All `specify` operations commit to the current working branch.
  New branches are created only for major features or fixes and by explicit team
  decision.
- Reviews: Pull requests MUST demonstrate compliance with principles, include
  acceptance scenarios, and link to the relevant spec and plan.

## Governance

- Precedence: This Constitution guides specifications, plans, and tasks. Where
  conflicts exist, this document takes precedence.
- Amendments: Proposals include a summary of changes, version bump rationale,
  and a migration plan for any affected workflows/templates. Approval by a
  maintainer is required.
- Versioning Policy: Semantic versioning is used for the Constitution (MAJOR,
  MINOR, PATCH). Breaking governance changes require a MAJOR bump with migration
  notes.
- Compliance Reviews: Every PR verifies adherence to the Core Principles and
  Checklist. Deviations MUST be justified in the plan’s “Complexity Tracking”.
- Branch Creation Policy: Automatic branch creation for `specify` commands is
  DISABLED. Contributors commit specification artifacts directly to the current
  working branch unless a major feature/fix explicitly requires a branch.
- Editing documents: do not overwrite documents (because I can not refer to old documents) but append (add) new contents.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Original adoption date unknown | **Last Amended**: 2025-11-06
