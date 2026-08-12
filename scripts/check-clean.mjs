/**
 * Fails if `npm run export:content` produced anything `git diff --exit-code` alone would
 * miss: a *new* campaign file `git status` sees but a diff against the tracked tree does
 * not, since an untracked file has nothing to diff against. Scoped to the root-level JSON
 * documents the exporter writes — never package.json/package-lock.json, which change for
 * unrelated reasons.
 */

import { execFileSync } from "node:child_process";

const pathspec = [
  ":(glob)*.json",
  ":(exclude)package.json",
  ":(exclude)package-lock.json",
];

const output = execFileSync(
  "git",
  ["status", "--porcelain", "--", ...pathspec],
  { encoding: "utf8" },
);

if (output.trim().length > 0) {
  console.error(
    "export:content produced a change git status was not expecting:\n",
  );
  console.error(output);
  console.error(
    'Run "npm run export:content" and commit the result, or investigate why a campaign source changed without a matching published document.',
  );
  process.exit(1);
}

console.log("Published JSON matches the campaign sources — nothing to commit.");
