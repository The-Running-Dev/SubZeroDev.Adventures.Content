# SubZeroDev Game Engine Landing Page — parked, not building

**This is a verbatim copy of `SubZeroDev.GameEngine`'s own `site/` directory, dropped into
this repo as a starting point.** It is not adapted for `SubZeroDev.Adventures.Content`: its
`package.json` is still named `subzerodev-game-engine-landing`, its metadata still describes
the Game Engine's own landing page (`game-engine.subzerodev.com`), and it depends on
`@the-running-dev/game-engine": "file:../src/engine"`, a path this repo does not have — so it
does not build here as-is.

**It is being kept, not deleted**, as the starting basis for a future community-facing UI for
this repo — a real rework, not a wiring task. Until that happens it is excluded from this
repo's CI and from what gets published to Pages (`v2/` — see the repo root `README.md` for
what this repo actually publishes today: campaign JSON, projected against
`SubZeroDev.ServiceContract`'s content-document contract).

The rest of this file is the original README from the engine repo, kept for reference against
that future rework.

---

# SubZeroDev Game Engine Landing Page

The standalone React landing page. It is intentionally separate from the Docusaurus
documentation site and does not configure hosting.

Route builds and the protected documentation merge are owned by the published
[`subzerodev-platform-ui-landing-page`](https://www.npmjs.com/package/subzerodev-platform-ui-landing-page)
package (pinned at `0.2.0`), consumed through its custom-adapter seam: `landing.config.ts`
declares this site's two routes (`/`, `/roadmap/`) — each an existing Engine-owned entry
module and its own static metadata — and the package's CLI builds, serves, and merges them.
No Vite config lives in this package any more; the site owns pages, styles, and tests only.

The playable demo imports the engine's published public entry point as a local package. Build
the engine before installing or checking this site from a clean checkout:

```powershell
npm --prefix ../src/engine ci
npm --prefix ../src/engine run build
npm ci
npm run check
```

## Development

```powershell
npm install
npm run dev
npm run check
```

`npm run check` verifies formatting, linting, TypeScript, component tests, the real-browser
suite, the production build, and the static social metadata in the built HTML.

## Real-browser testing (W65)

`src/**/*.browser.test.{ts,tsx}` specs run in an actual Chromium tab (Playwright, via
`vitest.browser.config.ts`), not jsdom — jsdom performs no layout, so it cannot back a
computed-style, hit-area, or visual-snapshot assertion. Everything else keeps running under
`vitest.config.ts`'s jsdom project.

```powershell
npm run test:browser
```

Visual snapshots (`toMatchScreenshot()`) live under each spec's `__screenshots__/` and are
committed. A run against a missing or changed reference fails on purpose, so a human reviews
the rendering before it becomes the new baseline:

```powershell
npm run test:browser:update
```

Review the written/changed `.png` files (a diff viewer or `git diff --stat` on the
`__screenshots__/` directories is enough) before committing them.

## Boundaries

- Keep all landing-page work inside `site/`.
- Documentation destinations are absolute `game-engine.subzerodev.com` URLs.
- Do not add a host, canonical URL, or Open Graph image until hosting is decided.
