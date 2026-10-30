# TeacherCopilot AI — Matematika ustozining ish maydoni

React 19, Vite, strict TypeScript, TSX and Tailwind CSS. Existing teacher tools are retained in a mathematics-only, Uzbek Latin workspace.

```bash
npm ci
npm run dev
npm run check
npm run build
```

## Five sections

- **Bosh sahifa**: quick creation, recent materials, upcoming lessons and compact actual resource counts.
- **Dars tayyorlash**: lesson plans, structured conspects, explanations and worked examples.
- **Topshiriqlar**: tests, assessment papers, exercises and homework, including answer keys.
- **Materiallarim**: search, categories, folders, favorites and links to editable saved resources.
- **Sinflarim**: class names, current topic, weekly hours and the lesson calendar. No student accounts or rosters.

Profile and settings are in the top profile menu. No paid plans, subscription gates, quick demo login, notifications, standalone statistics, standalone AI chat or PDF analyzer menus.

## Prepare a topic once

`usePreparation` stores per-teacher class, mathematics direction, topic, difficulty, task/variant counts, answer format and duration. Mathematics is automatic; directions are Mathematics, Algebra and Geometry. The settings pass between the dashboard, lesson and assignment hubs. Switching material tabs retains draft output while the hub remains mounted. Changing shared settings starts fresh drafts; saving/navigating away can unmount other unsaved outputs.

The shared form offers Oson, O‘rta, Murakkab and Aralash difficulty, 1–30 tasks, 1–4 variants, answer-only or step-by-step teacher keys, and an optional teacher note/textbook page. Notes are explicitly included as teacher notes, not interpreted as free-form AI instructions. Conspects contain one worked example plus the selected number of practice tasks; variant count applies to assignments, not conspects or lesson plans.

## Mathematics generation

`src/features/mathematics/curriculum.ts` contains 17 deterministic topic banks. Tasks are concrete problems with computed answers and solution steps. Difficulty changes linear-equation structure (one side, both sides, brackets) and fraction denominators; it also changes numeric parameters. Mixed difficulty cycles the levels. Questions are unique within a generated variant. Unknown topics are rejected with a visible message, rather than silently returning unrelated content.

The seven editable question types, question/option editing, correct-answer selection, ordering, regeneration, previews, multiple variants and saving remain supported. Assessment papers use open numerical answers by default. Teacher solutions can be edited after changing a question; teachers should check their correspondence after manual edits.

Material-local **Tushuntir**, **Osonlashtir**, and **O‘xshash misol yarat** actions create topic-based template examples and allow appending them to the material. They do not analyze arbitrary edited problems. Generated student content and teacher answers are stored separately; the export buttons always produce a separate student sheet and teacher key. Showing teacher keys in the editor does not add them to the student export.

These are mathematical templates, not live AI or a general symbolic solver. `AIService` and `BackendAIService` retain the future secure same-origin Groq/Qwen provider boundary. No provider credentials are in frontend code.

## Sources and exports

**Manba yuklash** inside preparation reads a selected page of a text-based PDF with a bundled PDF.js worker, or reads TXT, up to 10 MB. It previews text and offers recognized mathematics topics for explicit selection. Files remain in component memory, are not uploaded or persisted, and are released when leaving the view. Scanned-image OCR and general AI document analysis are not implemented; PDF formulas should be checked against the original page.

Word exports are genuine editable OOXML `.docx` files. Formulas use Unicode/plain-text notation (√, ², π, α, fractions and exponent notation), not native Word equation objects. Separate variants have explicit page breaks. PDF uses the browser print dialog's Save as PDF. Escaped printable markup excludes app navigation and private profile data.

## Data and authentication

The v7 migration preserves unsupported-subject resources in `legacyArchive`, archives their class assignments, and limits active profiles to Mathematics. Existing mathematical resources, classes and schedules remain usable. Previous English preparation state and registration drafts are reset. No student data is introduced.

This remains a browser-local prototype. Registration creates a local profile; sign-in locates that profile. Passwords are never stored or checked at login, and the UI discloses this limitation. Secure backend authentication, durable multi-user data, account recovery and authorization are still required before real production use. Optional salary is excluded from persistence and exports. Uploaded material metadata is not a substitute for cloud file storage.

## Verification

For the mathematics-only revision, checks cover 8,160 independently calculated answers (17 banks × 4 difficulty modes × 4 variants × 30 tasks), all seven question types for every bank, separate exports, two variants of five exercises, answer-only/steps behavior, exact lesson durations, and preservation during migration. React DOM integration verifies navigation, shared topic, generation, tab retention, assessment saving and the simplify/append action. Word and print-template PDF output are rendered and checked for mathematical symbols and answer separation.

The local managed preview service was unavailable during this revision. Browser visual/responsive checks and a real classroom trial with the mathematics teacher remain to be completed; DOM tests do not establish browser layout quality.
