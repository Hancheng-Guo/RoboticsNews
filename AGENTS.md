# RoboticsNews agent entry point

When asked to prepare, maintain, or publish a weekly issue, read these files in order:

1. [`docs/WEEKLY_OPERATIONS.md`](docs/WEEKLY_OPERATIONS.md) — executable workflow, commands, quality gates, recovery.
2. [`docs/EDITORIAL_GUIDE.md`](docs/EDITORIAL_GUIDE.md) — source map, selection rules, evidence standards.
3. [`docs/PRESENTATION_SPEC.md`](docs/PRESENTATION_SPEC.md) and [`docs/ISSUE_TEMPLATE.md`](docs/ISSUE_TEMPLATE.md) — website/PDF rules and issue layout.
4. [`README.md`](README.md) and [`data/schema.sql`](data/schema.sql) — current implementation and fields.

Use the current date in **Asia/Shanghai**. The issue date is a Monday; its window is the preceding Monday 00:00 through the issue Monday 00:00, with the preceding Sunday as the last included date. Never present a week still in progress as a complete issue.

The local SQLite database is ignored by Git. Confirm that the intended issue's records exist before generating or publishing. `site/index.html` contains only the current issue or preview; PDFs are archived in the root `diarys/` directory. The Pages workflow only deploys files already committed to `site/`; it does not research or write a new issue.

Published papers require a verifiable date and at least one identifiable author. Use author names as printed, including initials. Show first-author affiliation(s) as "institution, country or region" when verified, otherwise label them "不明确". Show a verbatim abstract and faithful Chinese translation only when republication is permitted; otherwise provide a clearly labeled paraphrase. If no paper primary link can be found after searching, a reprint link is allowed but must be labeled as such. Do not require full-paper access or write a full-paper contribution summary. Preserve the prominent `AI生成` notice. Keep editorial notes and verification logs out of the public webpage and PDF.

Use executable content and structure checks for publication. Visual review is optional and must not block a verified issue when it is unavailable; report checks that were not performed accurately.

If the user asks for a new issue, carry out the research and checks described in the runbook. Work only from weekly-issue records and current sources.

Do not proactively commit or push. If the user's request explicitly authorizes publishing the issue to GitHub Pages, including commit and push, that authorization covers the task: complete the checks, commit, push, and verify the live site. Otherwise show the changes for review and wait for explicit approval before committing or pushing.
