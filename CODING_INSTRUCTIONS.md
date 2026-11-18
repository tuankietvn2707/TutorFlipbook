# Project Coding Instructions & Modularity Standards

## 1. Strict File Size Limit (No Monolithic Files)
- **Maximum Lines Per File**: Every source file (`.ts`, `.tsx`, `.css`) MUST NOT exceed **200 lines** (ideal target: **50–180 lines**).
- **Automatic Feature Decomposition**: Whenever a file approaches or exceeds 200 lines, automatically split it into smaller, cohesive sub-modules grouped inside a dedicated feature folder (e.g., `src/components/<feature>/`, `src/services/<feature>/`, `src/utils/<feature>/`).
- **Recursive Splitting**: If any extracted sub-feature or helper still exceeds 200 lines (for example, a large HTML template, event listener suite, or service pipeline), split it further into finer-grained sub-modules (e.g., `headerTemplate.ts`, `bodyTemplate.ts`, `state.ts`, `handlers.ts`).

## 2. Clean Separation of Concerns
Organize each feature folder by responsibility:
- `*State.ts` — Local state, getters/setters, and state transitions.
- `*Template.ts` / `*Html.ts` — Pure UI markup/HTML renderers.
- `*Listeners.ts` / `*Handlers.ts` — DOM event binding and user interaction callbacks.
- `*Service.ts` / `*Api.ts` / `*Helpers.ts` — Business logic, storage, or external API calls.
- Facade / Barrel (`<Feature>.ts`) — Thin entry point (< 60 lines) re-exporting the public API so imports remain clean and stable.

## 3. Zero-Regression Verification
- Preserve all public function signatures, DOM element IDs, CSS selectors, and type contracts during refactoring.
- Always run TypeScript type-checking (`npm run lint`) and production build (`npm run build`) after splitting or creating modules.
