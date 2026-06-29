This folder contains per-university program override files generated from `en.json`.

Files:
- `1.json`, `2.json`, ... : Each file contains program override entries for that university. Keys are the program-level+slug (e.g. `bachelor:automation-information-and-control-computer-systems-aiccs`).

Workflow:
1. Edit the relevant `*.json` file for a university.
2. From the project root, run:

```bash
node scripts/split-and-merge-program-overrides.js merge
```

This will merge all per-university files back into `app/locales/en.json` (a backup `en.json.bak` is created).

If you need to regenerate the per-university files from `en.json`, run:

```bash
node scripts/split-and-merge-program-overrides.js split
```
