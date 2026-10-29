# TeacherCopilot AI — Teacher preparation workspace

An existing React 19 + Vite + strict TypeScript + TSX + Tailwind application, organized around a teacher preparing one topic. Uzbek Latin interface, white/soft blue styling, responsive layout and dark theme.

```bash
npm ci
npm run dev
npm run check
npm run build
```

## Five main sections

1. **Bosh sahifa** — one shared topic, four quick creation actions, compact actual activity counts, recent materials and upcoming lessons.
2. **Dars tayyorlash** — lesson plan and conspect tabs.
3. **Topshiriqlar** — tests, exercises and homework, including editable answer keys.
4. **Materiallarim** — saved and uploaded material cards, search, filters, folders, favorites, editing and exports.
5. **Sinflar va jadval** — class/subject/weekly-hours management and month/week/day calendar tabs.

Profile and settings are in the top profile menu. There is no subscription UI, demo login bypass, notifications entry, separate statistics page, general AI chat entry or PDF analysis entry. The PDF analyzer was only an interface, so it is deferred. Old links to deferred tools redirect to an appropriate main section. Existing saved-material URLs continue to work.

## Shared topic

`src/stores/usePreparation.ts` stores subject, class/grade, topic and instruction-language metadata per teacher profile. The same context is used on the home page and both preparation hubs. Teachers can choose a topic once and create a plan, conspect, test, exercise or homework from it. Editing context resets unsaved generated output for the previous context. Switching material tabs keeps the current generated outputs while the hub stays mounted. Saved documents reopen in their existing editors and seed the shared topic for the next creation action.

## Subjects and generators

Only **Matematika** and **Ingliz tili** appear as top-level subject choices. Algebra and geometry are covered by the mathematics topic templates.

- Mathematics: 17 deterministic topic banks for operations, fractions, percentages, ratio, equations, powers, geometry, functions, trigonometry, probability and derivatives, with worked examples and matching answer keys.
- English: 10 topic banks for Present Simple, to be, Present Continuous, Past Simple, Future Simple, articles, prepositions, comparatives, can/cannot and daily-routine vocabulary. English examples include Uzbek explanations and separate answer keys.
- Tests retain seven editable question types, option selection, matching pairs, add/delete/reorder/regenerate, multiple variants, preview, answer keys, real DOCX export and print/PDF.
- Exercises are saved as a distinct document kind, alongside homework and conspects.

These are clearly labeled local templates, not live generative AI. Free-text topics without a matching template use a labeled fallback. The actual class and learning objectives still need teacher review. Instruction-language selectors are metadata for future providers; current instructions are Uzbek with English examples where relevant.

`AIService` remains the provider boundary. `MockAIService` is active. `BackendAIService` prepares secure same-origin `/api/ai` integration for a future Groq/Qwen backend. No provider secrets are in the client.

## Data and migration

The v6 migration restores English materials from the earlier other-subject archive, normalizes algebra/geometry under Mathematics, combines equivalent active class-subject assignments and preserves other-subject materials in `db.legacyArchive`. Existing mathematics documents remain intact. Student accounts, rosters, submissions, grades and attendance are absent. Old registration drafts reset to the two-subject configuration. Shared context stores no password or salary data.

## Current limits

This is a frontend prototype. Registered-profile sign-in is local; passwords are validated transiently at registration but are not stored, transmitted or verified at sign-in. Secure identity, recovery, access control and multi-user persistence require a backend. Optional salary stays in component/form memory only and is excluded from saved data, AI input and exports.

Uploads retain metadata, not original files. PDF export uses the browser print dialog's Save as PDF option. Clearing the workspace preserves the teacher profile and archived materials. There are no paid plans, real payments or student-facing features.
