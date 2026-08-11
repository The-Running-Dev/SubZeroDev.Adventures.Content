# SubZeroDev.Adventures.Content

The published home of the campaign JSON [`SubZeroDev.Adventures`](https://github.com/The-Running-Dev/SubZeroDev.Adventures)
fetches at runtime.

Today, Adventures gets campaign content by submoduling the entire
[`SubZeroDev.GameEngine`](https://github.com/The-Running-Dev/SubZeroDev.GameEngine) repo and
running its exporter at build time — content only ships when the player repo ships. This repo
exists to break that coupling: it submodules the engine itself, runs the same exporter, and
**publishes** the result at this repo's Pages root, so Adventures can fetch fresh content
without a redeploy.

## Status

In progress. Concretely real:

- The wire format this repo publishes to (`formatVersion` 2 — a `kindId`-discriminated
  `content` field, manifest entries carrying `id`/`version`/`digest` rather than bare
  filenames) is graduated, real engine surface — no longer the "SPIKE: not a contract"
  disclaimer `SubZeroDev.GameEngine`'s `index.ts` used to carry.
- The shape is governed by a real, generated contract in
  [`SubZeroDev.ServiceContract`](https://github.com/The-Running-Dev/SubZeroDev.ServiceContract)
  (the content-document contract there), not hand-authored — end-to-end verified with `ajv`
  against real campaign JSON, including that a document with the wrong kind's content shape is
  correctly rejected. That validation is what caught a real, pre-existing engine defect
  (`ComparisonCondition.value` required but not always present on the wire) before it ever
  reached this stage — see `SubZeroDev.GameEngine`'s `0.6.1`.
- Both land on real `main` branches:
  [`SubZeroDev.GameEngine`#294](https://github.com/The-Running-Dev/SubZeroDev.GameEngine/pull/294)
  (rebase-merged) for the graduation, and `SubZeroDev.ServiceContract`'s `main` for the content
  contract (this org's branch protection allows a direct push there; GameEngine's does not,
  hence the PR).
- Published via an `actions/deploy-pages` workflow that copies `v2/`'s *contents* to the Pages
  root (so e.g. `v2/manifest.json` is served at `/manifest.json`, not `/v2/manifest.json`),
  mirroring `SubZeroDev.Adventures`'s own `.github/workflows/deploy.yml`.

Not yet real, so not claimed as working:

- **Nothing outside `v2/`'s exported files is served at the Pages root** — no landing page, no
  human-readable index. Fetching the manifest and campaign JSON directly is the supported path;
  browsing the root in a browser will 404.

## `site/`

Not part of the publish pipeline. See [`site/README.md`](site/README.md) — it is a parked,
unadapted copy of the engine's own landing page, kept as the starting point for a future
community-facing UI, not for anything this repo currently ships.
