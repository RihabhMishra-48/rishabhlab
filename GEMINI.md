# Project Guidelines

- **Autonomous Syntax Integrity**: Detect and fix all syntax, JSX, TypeScript, and compilation errors autonomously during editing.
- **Mandatory Pre-Completion Verification**: Always execute `npm run build --prefix client && npm run build --prefix server` to verify 0 errors before concluding any task.
- **No Mock Poisoning**: Do not inject mock data or starter workspaces into user profiles/storage when API returns 404 or empty. Render clean empty states with direct actions.
- **No TranslateY on Hover**: Avoid generic hover lifts (`translateY`, `scale`) unless explicitly asked.

