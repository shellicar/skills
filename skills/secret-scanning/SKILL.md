---
name: secret-scanning
description: "Secret and PII awareness for code generation, committing, and pushing.\nTRIGGER when: writing code/config/tests/examples, committing changes, pushing code, or scanning for hardcoded credentials and real PII.\nDO NOT TRIGGER when: reading files, exploring code, or non-code-generation tasks."
---

# Secret & PII Scanning Awareness

**Scope:** Pattern tables for detecting secrets and PII, safe placeholder values, and the mandatory disposition process for evaluating matches.

Never generate code, config, tests, or examples containing real or realistic-looking secrets, credentials, or PII. Use obviously fake values instead.

This skill MUST be loaded for:
- **Writing** code, config, tests, examples, or documentation
- **Committing** code (scan staged files before commit)
- **Pushing** code (scan changed files before push)

## Secrets: Known Prefixes and Signatures

When generating code, NEVER produce strings that match these patterns. Use placeholder values like `<YOUR_API_KEY>` or clearly fake tokens instead.

For the full pattern tables (AWS, GCP, Azure, GitHub, Stripe, Slack, AI/ML, infrastructure, private keys, generic patterns, database connections, etc.), see [references/secret-patterns.md](references/secret-patterns.md).

## PII: Never Use Real Values

When generating test data, examples, or mock content, NEVER use realistic PII. Use obviously fake values.

For the full PII placeholder table (email, phone, TFN, Medicare, SSN, credit card, IP addresses, hostnames, etc.), see [references/pii-placeholders.md](references/pii-placeholders.md).

## When Writing Code

1. **Never generate** strings matching known secret prefixes — even in examples, comments, or documentation
2. **Never use** realistic PII in test data, fixtures, mocks, or examples
3. **Always use** obviously fake placeholder values from the tables above
4. **Config values**: Use `<PLACEHOLDER>` style (e.g. `<YOUR_API_KEY>`, `<DATABASE_URL>`)
5. **Environment variables**: Show the variable name, never a realistic value (e.g. `export API_KEY="<your-key-here>"`)
6. **Connection strings**: Use `localhost` or `example.com` with placeholder credentials

## When Checking / Verifying Code

When reviewing, auditing, or reading existing code — whether asked explicitly or as part of normal work:

1. **ONLY flag** strings that match a specific pattern defined in the tables in this skill
2. **Every finding MUST cite the Rule ID** from the table it matched (e.g. `db:sqlserver_connection`, `pii:email`). If you cannot cite a Rule ID, the finding is invalid and must not be reported
3. **Do NOT invent patterns** — if something looks suspicious but does not match a defined pattern, do not flag it as a finding. If you believe a new pattern should be added, suggest it as a skill improvement instead
4. **Report findings clearly**: state the file, the Rule ID, and the specific value (redacted if it looks real)
5. **Suggest remediation**: environment variable, secret manager, config file excluded from source control, or placeholder replacement

### Finding Disposition Process (MANDATORY)

Every finding MUST be explicitly resolved. No finding may be silently skipped, dismissed, or assumed safe.

**Step 1: Present ALL findings in a table**

| # | Rule ID | Severity | File:Line | Value (redacted if real) | Suggested Disposition | Remediation Action |
|---|---------|----------|-----------|--------------------------|----------------------|--------------------|

The **File:Line** column must include the file path and line number (e.g. `src/config.ts:42`). This allows the Supreme Commander to locate the finding immediately.

The **Remediation Action** column is REQUIRED for any finding with a "Remediate" disposition. It must specify the exact action from this table:

| Remediation Action | What Happens |
|--------------------|--------------|
| **Remove from file** | Delete the matched content from the file using edit tools |
| **Replace with placeholder** | Swap the real value for a safe placeholder from the PII/placeholder tables in this skill |
| **Move to env var** | Remove the hardcoded value and reference an environment variable instead |
| **Exclude from source control** | Add the file/path to `.gitignore` so it is no longer tracked |

When multiple findings are in the same block (e.g. multiple PII values in one JSON object), group them and specify a single remediation action for the block (e.g. "Remove entire `mssql.connections` block from file").

**Step 2: For each finding, suggest ONE disposition:**

| Disposition | Meaning | Who Decides |
|-------------|---------|-------------|
| **Remediate** | Apply the specified remediation action to fix the finding | Assistant suggests action, Supreme Commander confirms |
| **False Positive** | Matches a pattern but is not a real secret/PII (e.g. public cert, pattern definition file, test fixture) | Supreme Commander decides — assistant must explain WHY it appears to be a false positive |
| **Not In Scope** | File is not tracked in source control, or is a binary/generated file | Assistant must verify (e.g. `git ls-files`) before suggesting this disposition |

**Step 3: Ask the Supreme Commander to resolve each finding**

After presenting the table, use the `ask_questions` tool to collect a decision for each finding. Present one question per finding (batch up to 4 at a time). Each question must:

- State the finding (file, Rule ID, value)
- State the suggested disposition and remediation action (if Remediate)
- Offer these options:
  1. **Accept recommended** — confirm the suggested disposition (mark as `recommended`)
  2. **Needs discussion** — flag for further review before proceeding
  3. (Other is shown automatically — allows the Supreme Commander to type a custom disposition)
- Enable `allowFreeformInput: true` so the Supreme Commander can override with any disposition

Do NOT proceed with commit/push until every finding has an explicit decision. If any findings have "Needs discussion", the operation is blocked until resolved.

**Step 4: Execute remediation**

For each confirmed "Remediate" finding, execute the specified remediation action. Group related findings (e.g. same file/block) into a single edit operation.

**Step 4a: Commit remediated changes**

After remediation edits are applied, commit the changes. The working tree MUST be clean before history scrubbing can proceed (`git filter-branch` requires a clean working tree). Use the `git-commit` skill to commit.

**Step 5: Post-remediation — gidetermine whether the remediated values exist in git history and whether they've been pushed.

##### 5a: Determine current context

```sh
# What branch are we on?
git rev-parse --abbrev-ref HEAD

# What is the main branch?
git symbolic-ref refs/remotes/origin/HEAD | sed 's|refs/remotes/origin/||'

# Are we on a feature branch or main?
```

##### 5b: Check if values exist in history

For each remediated value, check if it appears in any commit on the current branch:

```sh
git log --all -p -- "<file>" | grep -c "<value>"
```

If count is 0 for all values, no history scrub is needed — proceed to step 6.

##### 5c: Determine the scenario

If values are found in history, determine which commits contain them and whether those commits have been pushed:

```sh
# List unpushed commits on current branch
git log origin/<branch>..<branch> --oneline

# Check if the secret appears only in unpushed commits
git log origin/<branch>..<branch> -p -- "<file>" | grep -c "<value>"
```

Use this decision tree:

| Question | Yes | No |
|----------|-----|-----|
| Are we on main? | Check main history (→ Scenario A or D) | We're on a feature branch (→ next question) |
| Is the secret only in unpushed commits? | **Scenario B** — squash before pushing | Secret was already pushed (→ next question) |
| Is the secret also in main's history? | **Scenario D** — scrub both | **Scenario C** — scrub feature branch only |

##### 5d: Hand off to remediation

Present the scenario determination to the Supreme Commander and invoke the `secret-remediation` skill with:
- The identified scenario (A, B, C, or D)
- Which branches need scrubbing
- The list of values and their replacements

**Scenario B only**: no history scrub is needed — advise the Supreme Commander to squash-merge the feature branch before pushing. The secret never reaches remote.

**Scenarios A, C, D**: the secret has been pushed to a remote and must be considered **compromised**. Inform the Supreme Commander that credential rotation (revoke + replace) is mandatory in addition to history scrubbing. History scrubbing alone does not undo the exposure — platform PR diffs, cached clones, and CI logs may retain the value permanently.
2. If the count is > 0, the value exists in git history and must be scrubbed
3. If any values are found in history, inform the Supreme Commander and invoke the `secret-remediation` skill to handle the scrub

**Step 6: Record the outcome**

After all findings are resolved, summarise:
- How many findings were remediated (and which remediation action was taken)
- How many were confirmed as false positives
- How many were not in scope
- Whether git history was scrubbed (and which values)
- Whether any remain unresolved (blocks commit/push)

Then proceed with the operation (commit/push/scan complete).

### When Scanning (explicit review)

Present all findings using the disposition process above. The goal is awareness — the Supreme Commander decides every disposition.

### When Committing (via `git-commit` skill)

The `git-commit` skill scans staged files before committing. Present findings using the disposition process above. Do not commit until every finding has an explicit disposition.

**Commit-context adjustments**: When scanning is triggered during a commit (not a standalone review), skip steps 4a and 5 of the disposition process. Remediation is applied directly to staged files before committing — there is no need to commit remediation separately or check git history, because the secret has not entered history yet.

### When Pushing (via `git-push` skill)

The `git-push` skill loads this skill and scans all commits being pushed. Present findings using the disposition process above. Do not push until every finding has an explicit disposition.

### File Selection for Scanning

When scanning a set of changed files (from staged changes or commits), skip files that are unlikely to contain secrets and would waste context. Scan everything else.

**General skip list** — no meaningful secret risk:
- Generated source code (GraphQL codegen, OpenAPI/Swagger clients, etc.)
- Large data files (mock data JSON, seed data, test fixture data)
- Lock files (already covered by Skip Extensions below)

**Power BI (`.pbip` projects)**:
- Skip: layout and metadata files (`.pbir`, `.pbism`, `.platform`, `diagramLayout.json`, `editorSettings.json`, `LocalDateTable_*.tmdl`, `DateTableTemplate_*.tmdl`)
- Scan: `expressions.tmdl` — contains Power Query M expressions that may embed connection strings or credentials
- Scan: table `.tmdl` files — mostly column metadata (safe to skim past), but contain `partition ... = m` blocks with M queries that can reference storage accounts, databases, or credentials (e.g. `AzureStorage.Blobs(...)`, `Sql.Database(...)`)

100% coverage is not the goal — meaningful coverage of files where secrets actually appear is.

### Binary Files

If git shows a file as binary in the diff, you cannot scan its content. However, do not silently ignore it — a text file containing secrets could be committed with binary attributes to bypass scanning.

To verify, check the file type and size:

```bash
file <path>
wc -c < <path>
```

If `file` reports it as text despite git treating it as binary, check the size. If it's small enough to scan without flooding context, scan it. If it's large, flag it to the Supreme Commander with the file type and size — let them decide.

### Scan Reporting

After scanning, you **MUST** output a summary listing:
- All files scanned and their findings (if any)
- All files skipped and the reason for skipping each one (e.g. "generated codegen", "binary file", "lock file", "Power BI layout metadata")

This ensures no file is silently ignored. The Supreme Commander can then challenge any skip decision.

### Skip Paths

These paths produce frequent false positives and should be treated with lower severity when scanning. Still flag findings, but note the path is in the skip list:

- `test/`, `tests/`, `spec/`, `__tests__/`, `fixtures/`
- `vendor/`, `node_modules/`, `.git/`
- `CHANGELOG`, `CHANGELOG.md`, `HISTORY.md`
- `*.example`, `*.sample`, `*.template`, `*.tmpl`
- `docs/`, `documentation/`

### Skip Extensions

Do not scan binary or generated files:

- Images: `.png`, `.jpg`, `.jpeg`, `.gif`, `.bmp`, `.ico`, `.svg`, `.webp`, `.tiff`
- Media: `.mp3`, `.mp4`, `.wav`, `.ogg`, `.flac`, `.avi`, `.mov`, `.mkv`
- Archives: `.zip`, `.tar`, `.gz`, `.bz2`, `.xz`, `.7z`, `.rar`, `.jar`, `.war`
- Documents: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`
- Binaries: `.exe`, `.dll`, `.so`, `.dylib`, `.a`, `.o`
- Fonts: `.woff`, `.woff2`, `.ttf`, `.eot`, `.otf`
- Compiled: `.pyc`, `.pyo`, `.class`, `.cache`
- Minified: `.min.js`, `.min.css`
- Lock files: `.lock`, `.sum`

## False Positives

Some matches are intentional and safe. When flagging a finding, consider whether it falls into a known false-positive category before reporting:

### Legitimate Checkins

| Category | Example | Why It's OK |
|----------|---------|-------------|
| Public certificates | CA certs, root certs, TLS chain certs | Certificates are public by design — only private keys are secrets |
| Public API keys / client IDs | API keys that act as identifiers, not secrets (e.g. Google Maps client-side key, Firebase `apiKey`, Stripe publishable keys `pk_test_`/`pk_live_`) | These are designed to be embedded in client code; the matching API secret is the actual credential |
| Domain-restricted API keys | Google Maps API key, reCAPTCHA site key, other keys secured by domain/referrer restrictions | These are public by design — security is enforced server-side via domain allowlists, not by keeping the key secret |
| Pattern definition files | Regex patterns listing secret formats (e.g. this skill itself, git hook configs) | Defining what to scan for is not a secret |

### Handling False Positives

False positives are handled through the Finding Disposition Process above. When a finding looks like a false positive:

1. **Still present it** in the findings table — never silently skip
2. **Suggest "False Positive" disposition** with a clear explanation of WHY (e.g. "public certificate, not a private key")
3. **Wait for the Supreme Commander to confirm** — do not assume it is safe
4. If the category is in the "Legitimate Checkins" table above, note that in your explanation
