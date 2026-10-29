# TeacherCopilot AI — Mathematics workspace

Existing React 19 + Vite + strict TypeScript + TSX + Tailwind application, adapted exclusively to mathematics teachers. Uzbek Latin interface, white/soft blue design, responsive layouts and dark theme.

```bash
npm ci
npm run dev
npm run check
npm run build
```

## Current scope

- Registration and local registered-profile sign-in. The one-click demo login, its store action and seeded login accounts have been removed. Earlier sessions are invalidated once during this migration.
- No paid plans, subscription routes, checkout, upgrade advertising or pricing badges. Tools and exports have no subscription gates.
- Only Mathematics, Algebra and Geometry in registration, class assignments, profile, settings and AI generation forms. Language settings remain available.
- Dashboard, classes with weekly hours, calendar, materials with folders/favorites, profile, settings and personal activity statistics.
- Lesson plans with objectives, explanation, worked examples, practice, assessment, homework and conclusion.
- Seven editable test question types, answer selection, matching pairs, reordering, regeneration, multiple variants, answer keys, saving, genuine DOCX export and print/PDF.
- Mathematics conspects with rules, formulas, a worked example, mistakes to avoid and practice. Homework documents with matching step-by-step answer keys.
- Mathematics chat gives clearly labeled worked examples from topic templates. PDF analyzer remains a file/request interface; it does not extract or analyze documents yet.

## Mathematics templates

`src/features/mathematics/curriculum.ts` provides 17 deterministic topic banks: natural-number operations, multiplication, fractions (addition/subtraction/multiplication), percentages, ratio/proportion, linear and quadratic equations, powers, rectangles, triangle angles, Pythagoras, linear functions, trigonometry, probability and derivatives. Recommendations use the selected grade and mathematical subject. Difficulty and variant change task parameters. Generated answer keys come from the same task objects as the questions. Symbols such as √, π, ² and fractions are Unicode/plain text for reliable editing and export.

These are local mathematical templates, not a general symbolic algebra solver or live AI. Unsupported free-text topics use an explicitly labeled fallback template. Mock output is Uzbek; other language selections are metadata for future providers. Content must be reviewed for suitability for the actual class.

`AIService` remains the provider interface. `MockAIService` is active. `BackendAIService` prepares future secure same-origin `/api/ai` requests for Groq/Qwen; no API secrets or live provider integration are in the browser.

## Migration and data

The v5 migration retains mathematics resources and archives previous other-subject lessons, tests, documents and materials under `db.legacyArchive`, without deleting them. Non-mathematics class assignments are archived and excluded from the active teacher workspace. Teacher profiles are restricted to mathematical subjects. Earlier v1–v3 student data remains excluded by the teacher-only migration. Previous registration drafts are reset to mathematics defaults; passwords and salary are never persisted.

## Current limitations

This is a frontend prototype, not secure production authentication. Local sign-in only locates a previously registered profile. Passwords are validated transiently at registration, but never stored, transmitted or verified at sign-in. A secure backend is still needed for identity, account recovery, authorization and durable multi-user data. Optional salary stays only in form/component memory and is excluded from storage, AI input and exports.

Uploads retain metadata only. PDF export uses the browser print dialog's Save as PDF option. Browser-local records are not a secure multi-tenant database. No real payments, subscriptions or student accounts exist.
