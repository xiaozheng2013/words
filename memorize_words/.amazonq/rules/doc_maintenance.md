# Doc Maintenance Rule

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

### General rules:
- Never skip these updates, even for small or cosmetic fixes.
- If a change is both a feature update and a bug fix, do both.
- Always use today's date for new `BUGFIX_LOG.md` entries.
- Do not modify `SPEC.md` for bug fixes unless the fix also changes documented behavior.
