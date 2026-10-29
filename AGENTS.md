# Project Coding Standards & Guidelines

## 1. Autonomous Syntax & Compilation Verification
- The agent must autonomously inspect, catch, and resolve all syntax errors, JSX tag mismatches, unclosed braces, and typing issues while editing code.
- Never require or wait for the user to report syntax mistakes or compiler issues.
- Always run `npm run build --prefix client` and `npm run build --prefix server` before finishing any task to guarantee 100% error-free builds.

## 2. Zero Unnecessary Hover Animations
- Never use generic AI hover transforms such as `translateY(-1px/-2px)` or `scale(...)` on buttons, cards, or chips. Use clean standard color/border transitions only.

## 3. Strict Real Data Invariant
- Never inject fake mock datasets or starter templates into user-keyed storage/cache when an API account or resource returns empty. Display clean, modern empty states with self-driven action buttons (e.g. "Create File", "Upload").

