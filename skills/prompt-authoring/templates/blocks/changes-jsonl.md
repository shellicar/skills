# Block: changes.jsonl

<!-- Handler: Include this block in any mission where the operator needs to add changes.jsonl entries. Put the specific entries to append in the prompt itself. -->

## changes.jsonl

`changes.jsonl` is append-only. Add new entries at the end of the file. Never insert, reorder, or edit existing entries.

The file contains release markers added by tooling. Entries after the last marker are unreleased changes. Your entries must go after everything already in the file.

Format: one JSON object per line.

```jsonl
{"description":"[what changed]","category":"[category]"}
```

Categories: `added`, `changed`, `deprecated`, `removed`, `fixed`, `security`.

For security fixes, include metadata:

```jsonl
{"description":"Fixed GHSA-xxxx-xxxx-xxxx: description","category":"security","metadata":{"ghsa":"GHSA-xxxx-xxxx-xxxx"}}
```

One entry per distinct change.
