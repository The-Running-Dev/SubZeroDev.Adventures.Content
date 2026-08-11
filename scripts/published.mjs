/**
 * The set of files this repo publishes, read from the manifest that names them.
 *
 * Now that content sits at the repository root rather than in a directory of its own, "what
 * did we publish" is no longer answerable by listing a directory — the root also holds
 * package.json, scripts/, site/, and the submodules. The manifest is the only authority.
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

export const MANIFEST_FILE = "manifest.json";

/** The manifest plus every campaign file it lists. Empty when no manifest exists yet. */
export async function publishedFiles(dir) {
  const manifestPath = join(dir, MANIFEST_FILE);
  if (!existsSync(manifestPath)) return [];
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  return [MANIFEST_FILE, ...manifest.campaigns.map((entry) => entry.file)];
}
