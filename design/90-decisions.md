# Decision log

Append-only. Newest at the top. The rejected alternatives are the point — without them, every future session relitigates the same choice.

## Open
<A staging area, not a home. Things noticed mid-slice that were deliberately not acted on. `/track` turns each into a GitHub issue and removes it from here. An item that is a *decision* rather than a *todo* belongs below as an entry, not in an issue.>

---

### 2026-08-12 — AGENTS.md/CLAUDE.md direction and design/ placement, on first kit install
Context: neither AGENTS.md nor CLAUDE.md existed yet, so INSTALL.md's "neither exists" case applied — the kit's AGENTS.md needed a project-identity section, sourced from README.md rather than invented, and design/ needed a placement check.
Chosen: kit's AGENTS.md holds the contract plus a project-identity section (this repo publishes campaign JSON that SubZeroDev.Adventures fetches at runtime, via the engine/ and contracts/ submodules); CLAUDE.md is the pointer. design/ installed at the repository root — no docs/, plans/, adr/, rfc/, or decisions/ directory existed to compete with it.
Rejected: inverting the AGENTS.md/CLAUDE.md direction (no reason to — nothing existed yet to prefer either arrangement); relocating design/ (nothing occupied the path).
Reversibility: cheap — both are uncommitted at time of writing, and the direction/placement can still be changed before the first commit.
