# Campaign sources

TypeScript source for the campaigns exported as JSON under `site/public/campaigns/`.
Ported here from `SubZeroDev.GameEngine`'s `src/engine/src/campaigns/` (that repo remains
the build/CI source of truth; this is a content reference copy).

These files import from the game engine's internal modules (`core/registry`,
`kinds/story-graph`, `spike/portable`, etc.) and are not standalone-compilable in this
repo — same relationship `site/` has to the engine package.
