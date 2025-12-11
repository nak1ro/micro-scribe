---
trigger: always_on
---

# ScribeAPI Frontend - Rules

## Project Philosophy
Next.js App Router frontend connecting to .NET 8 backend. Focus on **clear separation of concerns**, **feature-based organization**, and **server-first architecture** with progressive enhancement through client components.

**Core Stack**: Next.js (App Router) + TypeScript + Tailwind CSS + TanStack Query + React Context + React Hook Form + Axios

---

## Architecture Principles

### Server-First Mental Model
- **Default to Server Components** - Fetch data close to the source, reduce client bundle
- **Client Components for Interactivity** - Only add "use client" when you need hooks, event handlers, or browser APIs
- **Data flows down** - Server Components fetch and pass props to Client Components
- **Keep Server Components thin** - They coordinate data fetching, Client Components handle complexity

### When to Use Each
**Server Component** (app/ folder):
- Pages that fetch data from API
- Layouts that provide user context
- Static content, SEO-critical pages
- No event handlers or React hooks needed

**Client Component** (features/ folder):
- Forms with validation and submission
- Interactive UI (tabs, modals, dropdowns)
- Real-time updates (polling, WebSocket)
- Browser APIs (localStorage alternatives, file upload)

### Feature-Based Organization
- Group by **business capability**, not technical layer
- Each feature owns its: components, hooks, API calls, types
- Features are **self-contained** - easy to move, delete, or refactor
- Shared UI primitives live in `components/`, business logic stays in `features/`

### Import Strategy
- Absolute imports (`@/`) prevent brittle relative paths
- Group imports: external libraries → internal modules → local files
- This makes dependencies explicit and refactoring safer

---

## Authentication Architecture

### Cookie-Based JWT Flow
- Backend sets httpOnly, secure cookies - frontend never touches tokens
- **Never use localStorage for auth** - XSS vulnerability
- Middleware checks cookie presence for route protection
- Heavy auth logic (user fetching, role checks) happens server-side in layouts

### Middleware Design
- **Keep it thin** - Only check if token exists
- Redirect unauthorized users if he tries to access app/(protected) to `/auth`
- Avoid heavy logic (no API calls, no user object inspection here)
- Rationale: Middleware runs on every request; expensive operations belong in layouts

### Auth Context Pattern
- Passes user object to Client Component context provider
- Client Components access user via `useAuth()` hook
- This avoids prop drilling and keeps auth centralized

### Why This Approach?
- Server-side user fetching = no loading flicker
- httpOnly cookies = better security
- Thin middleware = fast routing
- Context = no prop drilling through component tree

---

## Data Fetching Strategy

### TanStack Query Philosophy
- Manages **server state** - data that lives on backend
- Automaticrefetching, deduplication
- Built-in loading/error states
- **Use for**: API calls, background sync, polling


### API Layer Centralization
- Each feature has its own `api.ts` file in services/featurename
- All HTTP calls go through shared Axios instance
- Benefits: consistent error handling, auth headers, base URL config
- Makes API changes easy to track (one file per feature)

### React Context for Client State
- Use for: theme preference, UI state, derived user state
- **Don't use for server data** - that's TanStack Query's job
- Keep context values small and focused
- Avoid "god context" with everything - split by concern

---

## File Upload Architecture

### Chunked Upload Pattern
- Backend owns session logic and chunk assembly
- Frontend orchestrates: create session → upload chunks → track progress
- Custom hook encapsulates complexity
- **Why chunks?** - Resumable uploads, better UX for large files, works around request size limits

### Progress Tracking
- Local state (`useState`) for upload progress
- Update on each chunk completion
- Surface via props to parent component
- Keep upload logic separate from UI rendering

### Error Recovery
- Failed chunks can be retried
- Session expiration handled gracefully
- User gets clear feedback on failure points
- Don't let partial uploads pollute storage

---

## Form Architecture

### React Hook Form 
- React Hook Form handles form state and performance
- Zod defines validation schema (type-safe, composable)
- Validation runs on both client and server
- **Why?** - Less re-renders, better UX, type safety from schema

### Form Component Pattern
- Colocate schema with form component
- Extract reusable schemas 
- Handle submission errors explicitly
- Show field-level errors immediately

---

## Styling & Theming

### Tailwind Philosophy
- Utility-first keeps styles colocated with markup
- No CSS file hunting during refactoring
- Flat 2.0 design: minimal shadows, bold colors, clear hierarchy
- Dark/light theme via CSS variables + next-themes

### Theme Implementation
- CSS variables for colors (swap on theme toggle)
- `next-themes` handles system preference, persistence
- Class-based theme switching (`dark:` prefix)
- Define theme in Tailwind config, consume in components

### Why No Component Library?
- Full design control
- Smaller bundle (no unused components)
- Easier to implement Flat 2.0 aesthetic
- Build reusable primitives in `components/ui/`

---

## Anti-Patterns & Refactoring Rules

### Component Size Limits
- **Max 200 lines per component** - split when approaching this
- **Refactoring trigger**: When component does >2 things, extract logic
- Extract: custom hooks (logic), child components (UI sections)
- Keep components **focused on one responsibility**

### Prop Drilling Threshold
- **Max 2 levels** of prop passing before using Context
- If drilling theme, user, or global state → use Context
- For feature-specific data → consider composition over drilling

### API Call Organization
- **Never inline API calls** in components
- Always go through centralized `features/[feature]/api.ts`
- This makes mocking, testing, and swapping implementations trivial
- When refactoring, move API logic first

### State Colocation
- Keep state as **close to usage** as possible
- If only one component needs it → local state
- If siblings need it → lift to parent
- If many components need it → Context or URL state
- Don't prematurely globalize state

### Code Splitting Triggers
- Heavy libraries (charts, editors) → dynamic import
- Route-level splitting handled automatically by Next.js
- Don't optimize bundle until measurement shows problem
- Use `next/bundle-analyzer` to identify bloat

---

## Error Handling Philosophy

### API Error Pattern
- Axios interceptor catches all errors
- 401 → immediate redirect to `/auth`
- Other errors → extract RFC 7807 `detail` field
- Show user-friendly messages, log technical details
- **Never expose raw error objects to users**

### Error Boundaries
- Catch rendering errors in subtrees
- Provide reset mechanism (retry)
- Keep error UIs simple and actionable
- Use Next.js `error.tsx` convention

### Form Error Display
- Show field errors inline (React Hook Form)
- Show submission errors at form level
- Clear errors on retry
- Don't let error state persist incorrectly

---

## TypeScript Strategy

### Type Organization
- Mirror backend DTOs in `types/` or per-feature `types.ts`
- Use `interface` for extendable shapes
- Use `type` for unions, intersections, utilities
- **Keep types close to usage** - global only for shared entities

### Strict Mode Enforcement
- Enable all strict flags in `tsconfig.json`
- Avoid `any` - use `unknown` and type guards
- Make impossible states unrepresentable
- Let TypeScript catch bugs before runtime

### Refactoring with Types
- When changing API, update types first
- Let TypeScript errors guide refactoring
- Use discriminated unions for state machines
- Leverage inference - don't over-annotate

---

## Performance Guidelines

### Server Component Benefits
- Smaller client bundles (logic runs on server)
- Faster initial page load
- Better SEO (fully rendered HTML)
- Direct database access (when needed)

### Client Component Optimization
- Use `dynamic()` for heavy imports
- Lazy load features behind user actions
- Keep client JavaScript minimal
- Measure before optimizing

### Image Handling
- Always use `next/image` for optimization
- Let Next.js handle responsive images, formats
- Prevent layout shift with dimensions or `fill`

---

## Development Workflow

### Refactoring Approach
1. **Identify smell**: Long component, repeated logic, prop drilling
2. **Extract**: Create hook, child component, or context
3. **Verify types**: Let TypeScript guide changes
4. **Test manually**: Server/Client components, auth flows
5. **Commit small**: Incremental changes are safer

### When to Abstract
- **Rule of Three**: Abstract after third usage, not first
- Early abstraction = premature complexity
- Wait for pattern to emerge naturally
- Refactor when duplication becomes painful

### Code Review Focus
- Is this Server or Client Component? (Correct choice?)
- Are API calls centralized?
- Is auth handled securely (cookies, not localStorage)?
- Are types accurate and helpful?
- Is error handling user-friendly?

---

## Environment & Configuration

### Environment Variables
- Prefix public vars: `NEXT_PUBLIC_*`
- Private vars stay server-side only
- Never commit secrets to repo
- Use `.env.local` for development overrides

### Why This Matters
- Leaked API keys = security breach
- Public vars increase client bundle
- Separate concerns = easier deployment

---

## Summary Principles

✅ **Server-first, client when needed** - Reduce JavaScript shipped to browser
✅ **Feature-based organization** - Group by capability, not layer
✅ **Centralized API calls** - One place to change, easy to mock
✅ **Context for shared state** - Avoid prop drilling hell
✅ **httpOnly cookies for auth** - Security over convenience
✅ **TanStack Query for server data** - Let library handle complexity
✅ **Small components (<200 lines)** - Split early, split often
✅ **Types mirror backend** - Single source of truth for data shapes
✅ **Refactor when it hurts** - Not before, not after
✅ **Measure before optimizing** - Don't guess at performance

**Guiding Question**: "Will this make the codebase easier to understand and change in 6 months?"