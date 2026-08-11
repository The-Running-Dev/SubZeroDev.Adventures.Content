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
const contractPath = join(repoRoot, "contracts", "dist", "content-contract.json");
const publishDir = repoRoot;

const contract = JSON.parse(await readFile(contractPath, "utf8"));
if (contract.contractKind !== "content-document") {
  throw new Error(`${contractPath}: expected contractKind "content-document", got "${contract.contractKind}"`);
}

const manifestSchema = contract.schemas.find((s) => s.$id.endsWith("/manifest.json"));
const campaignSchema = contract.schemas.find((s) => s.$id.endsWith("/campaign.json"));
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

for (const entry of manifest.campaigns) {
  if (!publishedFiles.has(entry.file)) {
    console.error(`FAIL manifest lists "${entry.file}", but it was not published`);
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
  console.log(`OK  ${entry.file}`);
}

if (failures > 0) {
  console.error(`\n${failures} file(s) failed content-contract validation.`);
  process.exit(1);
}
console.log(`\nAll published documents validate against the content contract (formatVersion ${contract.formatVersion}).`);
