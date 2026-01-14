---
trigger: manual
---

Rules for Good React UI Components
1. Thin Components
Components should be rendering-focused; avoid embedding business logic, API calls, or state management directly inside them.
If a component exceeds ~100-150 lines, consider splitting it.
Each component file should export only one component (One Component Per File).
2. Logic Extraction
All side effects (data fetching, mutations, timers) belong in custom hooks, not inside the component body.
Event handlers that do more than simple prop callbacks should call hook functions.
State transformations and derived values should live in hooks or utility functions.
3. Atomic UI Composition
Use reusable primitives from a shared components/ui directory (e.g., 
Button
, Input, 
Card
, Spinner, 
Alert
).
Avoid reimplementing common patterns; if you need a styled container, check if an atom exists first.
Create new atoms when a pattern repeats across 2+ features.
4. Design Tokens Over Hardcoded Values
Never use raw hex colors, pixel values, or magic numbers directly in JSX.
Reference CSS variables or Tailwind theme tokens (e.g., text-muted-foreground, bg-primary/10, rounded-lg).
Spacing, shadows, border-radius, and colors should all come from the design system (e.g., 
globals.css
).
5. Props and Interfaces
Define explicit interface or type for all component props.
Use descriptive prop names; avoid single-letter or ambiguous names.
Prefer composition (passing children or render props) over deeply nested configuration objects.
Default values should be declared in prop destructuring, not scattered in the function body.
6. Accessibility
All interactive elements need proper aria-* attributes where applicable.
Use semantic HTML (button, nav, section) instead of generic div wrappers.
Ensure keyboard navigability and focus management.
7. Styling Consistency
Group Tailwind classes logically: layout → spacing → sizing → colors → effects.
Extract repeated class combinations into component-level constants or shared utility classes.
Use CSS variables (var(--transition-fast)) for animations and timings.
8. Type Safety
Avoid any; use unknown with type guards if the type is truly dynamic.
Import shared types from a central types/ directory or from the feature's types.ts.
Component props should extend standard HTML attributes where applicable (e.g., React.ButtonHTMLAttributes).
9. Naming Conventions
Component names: PascalCase, descriptive (e.g., 
AuthHeader
, 
ConfirmEmailError
).
Files: Match the component name exactly (e.g., 
AuthHeader.tsx
).
Hooks: 
use
 prefix (e.g., useAuth, 
useOAuth
).
10. Separation of Concerns
UI components render; hooks manage state and side effects; utilities transform data.
A component should not know how to fetch data, only what data it receives via props.
Keep feature-specific components in features/<feature>/components, reusable atoms in components/ui.