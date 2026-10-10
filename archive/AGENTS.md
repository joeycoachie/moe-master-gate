# Rules for AI agents in this repo

Read `HANDOVER.md` first. It is the brief. This file is the short version.

- `data/` is the single source of truth. Pages and scripts only read it.
- Run `npm run validate` after any data change. Never hand back work that fails it.
- Classify entries in the same shape as `SYS-D028` in `data/archive/protocols.json`. Field and link rules: `data/schema.json`.
- Store each link once, on the entry that knows about it. Never add the reverse link by hand.
- A part of an asset goes in `components`. Do not create a new ID for it.
- Never edit `data/lexicon.json`. Add a proposal to `data/proposals.json` with `status: "pending"` and `by: "agent"`.
- Never resolve an `overlaps` or `conflicts` link yourself. The founder decides.
- Any text a customer will see must pass `npm run gate -- "<text>"` and the rules in `mandate.html` (R1 to R8).
- No new dependencies without the founder's say-so. Plain HTML, CSS and JS. Node 18+ for scripts.

## Linked Claude artifacts (being retired)

| Artifact | URL | Repo copy |
|---|---|---|
| Intelligence Archive | https://claude.ai/artifact/4WWfjCqRHPbCbpqM4c6n1c | `index.html`, `data/archive/`, `data/schema.json` |
| Plain Language Mandate (SYS-D028) | https://claude.ai/artifact/QQsoLdJFPAVo6usBZE8Z9v | `mandate.html`, `data/lexicon.json` |

- `data/` wins. Never write to the artifact databases. Never republish the artifacts unless the founder asks.
- Drift check (Claude Code): pull every collection of one artifact with ArtifactData `list` and `out_dir` set to one folder per artifact, then run `npm run drift -- <that folder>`. Archive collections: `protocols`, `tools`, `crucibles`, `meta`. Mandate collections: `lexicon`, `proposals`, `audits`, `meta`. If it reports drift, show the founder before changing `data/`.
- Last check: 6 Oct 2026. No drift in either. Archive DB: 52 protocols and `meta/schema` (tools and crucibles exist only as seeds in its page code). Mandate DB: 36 lexicon entries (v1), no proposals, no audits.
