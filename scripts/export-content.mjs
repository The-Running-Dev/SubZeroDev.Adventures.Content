/**
 * Regenerates v2/ from the pinned engine submodule.
 *
 * The engine's exporter (engine/src/engine/scripts/export-campaigns.ts) writes to a path
 * hardcoded relative to itself: engine/site/public/campaigns/ -- that repo's *own* site/,
 * which ships inside the submodule alongside the package. Rather than patching that path,
 * this script runs the exporter as-is and copies its output here, into the version-pathed
 * directory this repo actually publishes -- the same reasoning
 * SubZeroDev.Adventures/scripts/sync-campaigns.mjs already documents for the identical
 * shape of problem there.
 *
 * Run after bumping the engine submodule to a new commit, then diff the result: a change in
 * v2/ that was not reviewed is a silent content change shipping to every consumer that
 * fetches this repo's published URL.
 */

import { execFileSync } from "node:child_process";
import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const enginePackagePath = join(repoRoot, "engine", "src", "engine");
const engineExportedCampaigns = join(repoRoot, "engine", "site", "public", "campaigns");
const targetVersion = join(repoRoot, "v2");

const npmCli = process.env["npm_execpath"];
if (!npmCli) {
  throw new Error("npm_execpath is unset -- run this through `npm run export:content`, not `node` directly");
}

console.log("Exporting campaigns from the pinned engine submodule...");
execFileSync(process.execPath, [npmCli, "run", "export:campaigns"], {
  cwd: enginePackagePath,
  stdio: "inherit",
});

console.log(`Copying exported campaigns into ${targetVersion}...`);
await rm(targetVersion, { recursive: true, force: true });
await mkdir(targetVersion, { recursive: true });
await cp(engineExportedCampaigns, targetVersion, { recursive: true });

const files = await readdir(targetVersion);
console.log(`Synced ${files.length} file(s) into v2/.`);
