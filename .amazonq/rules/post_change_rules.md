# Post Change Rules

This rule applies to the `memorize_words` project only.

## After every code change in this project, you MUST:

### For feature additions or updates:
- Update `SPEC.md` in this project folder to reflect the new or changed behavior.
- Only modify the sections relevant to the change. Do not rewrite unrelated sections.

### For bug fixes:
- Append an entry to `BUGFIX_LOG.md` in this project folder. Create the file if it does not exist.
- Each entry must follow this format:

```
## [YYYY-MM-DD] <short title>

**File(s) affected:** <relative file path(s)>
**Description:** <what the bug was>
**Fix:** <what was changed to fix it>
```

### For all changes (features and bug fixes):
- Add a test covering the new or fixed behavior.
- Run the full test suite (`node run_tests.mjs`).
- If any tests fail, identify the cause, fix the code, and re-run the suite.
- Repeat until all tests pass before considering the change done.
- Never skip this, even for small or cosmetic fixes.

### General rules:
- Never skip these updates, even for small or cosmetic fixes.
- If a change is both a feature update and a bug fix, do both.
- Always use today's date for new `BUGFIX_LOG.md` entries.
- Do not modify `SPEC.md` for bug fixes unless the fix also changes documented behavior.
