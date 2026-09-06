/**
 * Validates the published campaign JSON at this repo's root against
 * SubZeroDev.ServiceContract's content-document contract.
 *
 * The contract has never been published to a real npm registry (SubZeroDev.ServiceContract's
 * own README: "No real npm publish" -- the @subzerodev npm org reservation is still open),
 * so there is no `npm install @subzerodev/service-contract` for this repo to depend on yet.
 * The `contracts` submodule plus a local build (`npm run setup`) is the real substitute:
 * `contracts/dist/content-contract.json` is the same artifact `loadPublishedContentContract`
 * would read from an installed package, just read from a built submodule checkout instead.
 * Swap this for a real dependency once the registry publish lands -- tracked here, not
 * invented as a TODO nobody owns.
 *
 * A file that fails does not deploy -- this script exits non-zero and CI's deploy job never
 * runs, so a schema violation is a build failure, not a silent bad publish.
 */

import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const contractPath = join(
  repoRoot,
  "contracts",
  "dist",
  "content-contract.json",
);
const publishDir = repoRoot;

const contract = JSON.parse(await readFile(contractPath, "utf8"));
if (contract.contractKind !== "content-document") {
  throw new Error(
    `${contractPath}: expected contractKind "content-document", got "${contract.contractKind}"`,
  );
}

const manifestSchema = contract.schemas.find((s) =>
  s.$id.endsWith("/manifest.json"),
);
const campaignSchema = contract.schemas.find((s) =>
  s.$id.endsWith("/campaign.json"),
);
if (!manifestSchema || !campaignSchema) {
  throw new Error(`${contractPath}: missing manifest or campaign schema`);
}

const ajv = new Ajv2020.default({ strict: false });
const validateManifest = ajv.compile(manifestSchema);
const validateCampaign = ajv.compile(campaignSchema);

const manifestPath = join(publishDir, "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (!validateManifest(manifest)) {
  console.error(`${manifestPath} failed validation:`);
  console.error(JSON.stringify(validateManifest.errors, null, 2));
  process.exit(1);
}
console.log(`OK  manifest.json (${manifest.campaigns.length} campaigns)`);

const publishedFiles = new Set(await readdir(publishDir));
let failures = 0;

/**
 * Cross-file gate: two published campaigns may not define the same string key with
 * different text.
 *
 * The per-file schema check above cannot see this -- each document is individually legal.
 * A consumer, though, builds ONE string registry over every campaign it serves (the
 * engine's `getStrings` has no per-campaign partition), so a divergent duplicate key is a
 * `string_conflict` that fails the whole catalog build, not just the campaign that
 * introduced it. In the trusted tier that is a fail-closed abort: it took the deployed
 * Adventures API down at boot when `bulgarian-adventures-maximum-absurdity` shipped
 * reusing `bulgarian-adventures`'s `bgadv.` prefix with rewritten text. Publishing is the
 * last place the collision is cheap to catch, so it is caught here.
 *
 * Identical text under a shared key stays legal -- that merges cleanly, and it is how a
 * genuinely shared string is meant to be expressed.
 */
const stringOwners = new Map();

function collectStrings(file, campaign) {
  const strings = campaign.strings;
  if (!strings || typeof strings !== "object") return;
  for (const [key, text] of Object.entries(strings)) {
    const seen = stringOwners.get(key);
    if (!seen) {
      stringOwners.set(key, { file, text, conflicts: [] });
      continue;
    }
    if (seen.text !== text) seen.conflicts.push(file);
  }
}

function reportStringConflicts() {
  let conflicted = 0;
  for (const [key, seen] of stringOwners) {
    if (seen.conflicts.length === 0) continue;
    conflicted += 1;
    console.error(
      `FAIL string key "${key}" is defined with different text in ${seen.file} and ${seen.conflicts.join(", ")}`,
    );
  }
  if (conflicted > 0) {
    console.error(
      `
${conflicted} string key(s) collide across campaigns. Give each campaign its own key prefix.`,
    );
    return 1;
  }
  console.log(
    `OK  no cross-campaign string-key conflicts (${stringOwners.size} keys)`,
  );
  return 0;
}

for (const entry of manifest.campaigns) {
  if (!publishedFiles.has(entry.file)) {
    console.error(
      `FAIL manifest lists "${entry.file}", but it was not published`,
    );
    failures += 1;
    continue;
  }
  const campaignPath = join(publishDir, entry.file);
  const campaign = JSON.parse(await readFile(campaignPath, "utf8"));
  if (!validateCampaign(campaign)) {
    console.error(`FAIL ${entry.file}:`);
    console.error(JSON.stringify(validateCampaign.errors, null, 2));
    failures += 1;
    continue;
  }
  collectStrings(entry.file, campaign);
  console.log(`OK  ${entry.file}`);
}

failures += reportStringConflicts();

if (failures > 0) {
  console.error(`\n${failures} file(s) failed content-contract validation.`);
  process.exit(1);
}
console.log(
  `\nAll published documents validate against the content contract (formatVersion ${contract.formatVersion}).`,
);
