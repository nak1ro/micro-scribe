---
description: Comprehensive feature refactor workflow - restructure, audit, and cleanup
---

# Feature Refactor Workflow

This workflow guides the systematic refactoring of a Next.js feature module following modern React patterns, SOLID principles, and DRY methodology.

## Prerequisites

- Feature follows the standard structure:
  ```
  src/features/[feature-name]/
  ├── api/
  ├── components/
  ├── forms/
  ├── hooks/
  ├── schemas/
  ├── types.ts
  └── index.ts
  ```
- to see what are the files that should be inside the folders - just check auth feature for reference
- User has provided the target feature path
- Any deviations from standard structure must be discussed with user

---

## Phase 1: Discovery & Inventory

**Goal**: Understand the current state of the feature.

### Steps:
1. List the feature directory structure recursively
2. Count files in each subdirectory
3. Read the feature's `index.ts` barrel export
4. Read `types.ts` to understand DTOs
5. Identify any files that don't follow naming conventions

### Output:
- Summary of current structure
- List of files per subdirectory
- Identified issues or anomalies
- Ask user to confirm before proceeding

---

## Phase 2: Component Audit (Batch Processing, not all component at a time)

**Goal**: Audit components against rules for violations.

### Rules to Check:
- [ ] One Component Per File (OCPF)
- [ ] Thin components (<200 lines)
- [ ] Logic extracted to hooks
- [ ] Atomic UI composition (uses `@/components/ui`)
- [ ] Design tokens (no hardcoded colors/spacing)
- [ ] Props interface defined
- [ ] Accessibility (aria-*, roles, semantic HTML)
- [ ] Import organization (consolidated barrel imports)

### Steps:
1. **Batch Size**: Audit 4 components at a time
2. For each component:
   - Read the file
   - Check against rules
   - Document violations in a table
3. After each batch, create an implementation plan for fixes
4. Get user approval before implementing fixes
5. Implement fixes for current batch
6. Repeat until all components audited

### Batch Template:
```markdown
| File | Rule Violated | Issue | Fix |
|------|---------------|-------|-----|
| ComponentA.tsx | OCPF | Exports 2 components | Split into separate files |
```

---

## Phase 3: Component Restructuring

**Goal**: Organize components into domain-specific subdirectories.

### Criteria for Grouping:
- Components used together in a flow (e.g., form + header + footer)
- Components sharing same data/state
- Components representing a single user journey

### Steps:
1. Analyze component relationships
2. Propose grouping structure to user (e.g.):
   ```
   components/
   ├── [flow-a]/
   │   ├── ComponentA.tsx
   │   ├── ComponentB.tsx
   │   └── index.ts
   ├── [flow-b]/
   │   └── ...
   └── SharedComponent.tsx  # stays at root
   ```
3. Get user approval
4. Create subdirectories
5. Move files (one group at a time)
6. Create `index.ts` barrel exports for each subdirectory
7. Update all internal relative imports
8. Update external imports (pages, other features)
9. Update feature's main `index.ts`

---

## Phase 4: Hooks Audit & Refactor

**Goal**: Ensure hooks follow best practices.

### Rules to Check:
- [ ] Single responsibility (one purpose per hook)
- [ ] No duplicate logic across hooks (DRY)
- [ ] Proper TypeScript types (no `any`, use defined types)
- [ ] `useCallback`/`useMemo` for expensive operations
- [ ] Cleanup functions in `useEffect` (timers, subscriptions)
- [ ] Shared helpers extracted (e.g., `getOrigin()`)

### Steps:
1. Read all hooks in the feature
2. Document issues in a table
3. Identify opportunities for:
   - Extracting shared helpers
   - Splitting large hooks
   - Using existing types (e.g., `AuthError`)
4. Propose refactors to user
5. Implement changes

---

## Phase 5: API & Types Cleanup

**Goal**: Ensure API layer and types are well-organized.

### Steps:
1. Check if `api/index.ts` barrel exists → create if missing
2. Check if `types.ts` has error types → add `[Feature]Error` if missing
3. Verify all API functions use proper types
4. Ensure DTOs are source of truth for schemas

---

## Phase 6: Schemas Audit

**Goal**: Ensure schemas are organized and reference DTOs.

### Steps:
1. Check if `schemas/index.ts` barrel exists → create if missing
2. If single `schemas/[feature].ts` exists with multiple schemas:
   - Split into separate files (e.g., `login.ts`, `register.ts`)
   - Each schema should reference its DTO via `satisfies z.ZodType<DTO>`
3. Update barrel exports
4. Update form imports to use barrel

---

## Phase 7: Final Barrel Exports & Verification

**Goal**: Ensure clean public API and verify build.

### Steps:
1. Review feature's main `index.ts`:
   - Exports use subdirectory barrels where applicable
   - No direct file exports for grouped components
2. Create/update `hooks/index.ts` barrel
3. Run `npx tsc --noEmit` for final verification
4. Report any remaining errors to user

---

## Phase Sizing Guidelines

| Phase | Typical Tool Calls | When to Split |
|-------|-------------------|---------------|
| Phase 1 | 5-8 | If >20 files, split inventory |
| Phase 2 | 8-12 per batch | Always split into batches of 4 components |
| Phase 3 | 10-15 | If >3 groups, split into multiple restructure rounds |
| Phase 4 | 8-12 | If >6 hooks, split into batches |
| Phase 5 | 3-5 | Usually single pass |
| Phase 6 | 5-8 | If >4 schemas, split |
| Phase 7 | 3-5 | Single pass |

---

## User Checkpoints

Stop and ask user for approval at these points:
1. After Phase 1 (confirm understanding)
2. After each batch implementation plan in Phase 2
3. Before creating subdirectories in Phase 3
4. Before implementing hook refactors in Phase 4
5. After final verification in Phase 7

---

## Error Handling

- If `tsc` fails after any phase, fix errors before proceeding
- If import paths break, trace the broken import and update
- If a component exceeds 200 lines after refactor, split further
- If unsure about grouping/naming, ask user

---

## Invocation

To start this workflow, user provides:
```
/feature-refactor @[src/features/FEATURE_NAME]
```

Agent should begin with Phase 1: Discovery & Inventory.