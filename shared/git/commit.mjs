// Commit a set of files onto the current branch without disturbing the caller's
// real git index. A mission is scaffolded and then filled by separate scripts in
// separate skills (scaffold-mission in mission-artefacts, create-mission in
// prompt-authoring); both commit their write so the SC's review surface is the
// *next* role's diff against committed boilerplate, not the boilerplate itself.
// Sharing the mechanism keeps that commit identical wherever it happens — which
// is why it lives in shared/ rather than in one skill: it is used across skills.
//
// Mechanism: a temporary index file seeded from HEAD (GIT_INDEX_FILE). Files are
// staged into that temp index and committed against it, so .git/index — where the
// caller may have staged their own work — is never opened. After the commit the
// real index is refreshed for the committed paths so the caller sees them as
// committed rather than still-staged.
//
// `git commit` inherits stdio so an interactive signing prompt (pinentry /
// Keychain) reaches the terminal. read-tree and update-index are non-interactive;
// their output is captured for error reporting. Throws on any git failure; the
// caller decides how to report it.

import { spawnSync } from "node:child_process";
import { unlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

export function commitFiles(repoRoot, relFiles, message) {
  const tmpIndex = join(
    tmpdir(),
    `commit-files-index-${process.pid}-${Date.now()}`,
  );
  const env = { ...process.env, GIT_INDEX_FILE: tmpIndex };
  const runCaptured = (args) =>
    spawnSync("git", args, { cwd: repoRoot, env, encoding: "utf-8" });
  const fail = (msg) => {
    throw new Error(msg);
  };

  try {
    let res = runCaptured(["read-tree", "HEAD"]);
    if (res.status !== 0) {
      fail(
        `Failed to seed temp index from HEAD: ` +
          `${(res.stderr || res.stdout || "").trim()}`,
      );
    }

    res = runCaptured(["update-index", "--add", "--", ...relFiles]);
    if (res.status !== 0) {
      fail(
        `Failed to stage files in temp index: ` +
          `${(res.stderr || res.stdout || "").trim()}`,
      );
    }

    const commitRes = spawnSync("git", ["commit", "-m", message], {
      cwd: repoRoot,
      env,
      stdio: "inherit",
    });
    if (commitRes.status !== 0) {
      fail(`git commit failed (status ${commitRes.status}).`);
    }

    const addRes = spawnSync("git", ["add", "--", ...relFiles], {
      cwd: repoRoot,
      encoding: "utf-8",
    });
    if (addRes.status !== 0) {
      fail(
        `Failed to refresh real index after commit: ` +
          `${(addRes.stderr || addRes.stdout || "").trim()}`,
      );
    }
  } finally {
    try {
      unlinkSync(tmpIndex);
    } catch {
      // Temp index may not have been created if read-tree failed before git
      // wrote it; nothing to clean up.
    }
  }
}
