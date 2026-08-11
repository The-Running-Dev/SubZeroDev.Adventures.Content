/**
 * Regenerates the published campaign JSON at this repo's root from the pinned engine submodule.
 *
 * The engine's exporter (engine/src/engine/scripts/export-campaigns.ts) writes to a path
 * hardcoded relative to itself: engine/site/public/campaigns/ -- that repo's *own* site/,
 * which ships inside the submodule alongside the package. Rather than patching that path,
 * this script runs the exporter as-is and copies its output here.
 *
 * Publishing at the root means this must never blank its target the way a directory-scoped
 * export could: it deletes only the files the *current* manifest says this pipeline last
 * published, so a campaign dropped from the exporter still disappears, while everything else
 * at the root (scripts/, site/, README.md, package.json, the submodules) is left alone.
 *
 * Run after bumping the engine submodule to a new commit, then diff the result: an unreviewed
 * change here is a silent content change shipping to every consumer that fetches this repo's
 * published URL.
 */

import { execFileSync } from "node:child_process";
import { copyFile, readdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { publishedFiles } from "./published.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const enginePackagePath = join(repoRoot, "engine", "src", "engine");
const engineExportedCampaigns = join(repoRoot, "engine", "site", "public", "campaigns");

const npmCli = process.env["npm_execpath"];
if (!npmCli) {
  throw new Error("npm_execpath is unset -- run this through `npm run export:content`, not `node` directly");
}

const previouslyPublished = await publishedFiles(repoRoot);

console.log("Exporting campaigns from the pinned engine submodule...");
execFileSync(process.execPath, [npmCli, "run", "export:campaigns"], {
  cwd: enginePackagePath,
  stdio: "inherit",
});

const exported = await readdir(engineExportedCampaigns);

for (const file of previouslyPublished.filter((f) => !exported.includes(f))) {
  await rm(join(repoRoot, file), { force: true });
  console.log(`Removed ${file} -- no longer exported`);
}

for (const file of exported) {
  await copyFile(join(engineExportedCampaigns, file), join(repoRoot, file));
}

console.log(`Synced ${exported.length} file(s) into the repository root.`);
