# RoboticsNews agent entry point

When asked to prepare, maintain, or publish a weekly issue, read these files in order:

1. [`docs/WEEKLY_OPERATIONS.md`](docs/WEEKLY_OPERATIONS.md) — executable workflow, commands, quality gates, recovery.
2. [`docs/EDITORIAL_GUIDE.md`](docs/EDITORIAL_GUIDE.md) — source map, selection rules, evidence standards.
3. [`docs/PRESENTATION_SPEC.md`](docs/PRESENTATION_SPEC.md) and [`docs/ISSUE_TEMPLATE.md`](docs/ISSUE_TEMPLATE.md) — website/PDF rules and issue layout.
4. [`README.md`](README.md) and [`data/schema.sql`](data/schema.sql) — current implementation and fields.

Use the current date in **Asia/Shanghai**. The issue date is a Monday; its window is the preceding Monday 00:00 through the issue Monday 00:00, with the preceding Sunday as the last included date. Never present a week still in progress as a complete issue.

The local SQLite database is ignored by Git. Confirm that the intended issue's records exist before generating or publishing. `site/index.html` contains only the current issue or preview; PDFs are archived in the root `diarys/` directory. The Pages workflow only deploys files already committed to `site/`; it does not research or write a new issue.

Published paper entries must include the first author's affiliation(s), the cited version's verbatim abstract, and a bilingual contribution summary based on the full paper. Preserve the prominent `AI生成` notice. Keep editorial notes and verification logs out of the public webpage and PDF.

If the user asks for a new issue, carry out the research and checks described in the runbook. Do not reuse or relabel the old 2026-11-01 three-day issue as a complete weekly issue.

After editing files, show the user the changes for review. Do not commit or push unless the user explicitly approves that step after reviewing the result.
