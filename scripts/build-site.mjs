/**
 * Assembles dist/ -- what GitHub Pages serves at this repo's root -- from the published
 * manifest, plus a generated index.html so the root renders instead of 404ing.
 *
 * The artifact is built from the manifest's own file list rather than by copying the
 * repository root, which now holds the content *and* everything else (scripts/, site/, the
 * submodules, package.json). Copying the root wholesale is exactly the leak that scoping the
 * artifact was meant to fix; an explicit list cannot regress into it.
 */

import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { MANIFEST_FILE, publishedFiles } from "./published.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const distDir = join(repoRoot, "dist");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

for (const file of await publishedFiles(repoRoot)) {
  await copyFile(join(repoRoot, file), join(distDir, file));
}

const manifest = JSON.parse(await readFile(join(repoRoot, MANIFEST_FILE), "utf8"));

const cards = await Promise.all(
  manifest.campaigns.map(async (entry) => {
    const campaign = JSON.parse(await readFile(join(repoRoot, entry.file), "utf8"));
    const { title, description, duration, contentNotice } = campaign.catalog;
    return `
    <li class="campaign">
      <h2>${escapeHtml(title)}</h2>
      <p class="description">${escapeHtml(description)}</p>
      <p class="meta">${escapeHtml(duration)}</p>
      <p class="notice">${escapeHtml(contentNotice)}</p>
      <a class="file" href="./${escapeHtml(entry.file)}">${escapeHtml(entry.file)}</a>
    </li>`;
  }),
);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>SubZeroDev Adventures — Published Content</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 3rem auto; padding: 0 1.5rem; line-height: 1.5; }
  h1 { font-size: 1.5rem; }
  .lede { opacity: 0.8; }
  ul.campaigns { list-style: none; padding: 0; display: grid; gap: 1.25rem; }
  .campaign { border: 1px solid color-mix(in srgb, currentColor 20%, transparent); border-radius: 0.5rem; padding: 1rem 1.25rem; }
  .campaign h2 { margin: 0 0 0.25rem; font-size: 1.1rem; }
  .description { margin: 0 0 0.5rem; }
  .meta, .notice { font-size: 0.85rem; opacity: 0.75; margin: 0.15rem 0; }
  .file { font-family: ui-monospace, monospace; font-size: 0.85rem; }
</style>
</head>
<body>
<h1>SubZeroDev Adventures — Published Content</h1>
<p class="lede">
  This is a content feed, not a playable site — each campaign below is published as
  portable JSON. See <a href="./manifest.json">manifest.json</a> for the machine-readable
  index.
</p>
<ul class="campaigns">${cards.join("")}
</ul>
</body>
</html>
`;

await writeFile(join(distDir, "index.html"), html);
console.log(`Built dist/ -- ${manifest.campaigns.length} campaigns + manifest.json + index.html`);
