/**
 * Builds dist/index.html for GitHub Pages from v2/manifest.json + each campaign's catalog.
 *
 * v2/ is JSON only (regenerated wholesale by export-content.mjs, which would delete a
 * committed index.html on every run) so this reads v2/ after export but writes straight to
 * dist/, alongside the copied v2/ contents, in the deploy workflow's "Prepare the Pages
 * artifact" step.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const v2Dir = join(repoRoot, "v2");
const distDir = join(repoRoot, "dist");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const manifest = JSON.parse(await readFile(join(v2Dir, "manifest.json"), "utf8"));

const cards = await Promise.all(
  manifest.campaigns.map(async (entry) => {
    const campaign = JSON.parse(await readFile(join(v2Dir, entry.file), "utf8"));
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
console.log(`Wrote dist/index.html (${manifest.campaigns.length} campaigns)`);
