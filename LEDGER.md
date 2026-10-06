# LEDGER · The Operator's Playbook

One line per change, from every agent and window, **appended at the bottom**. This is how the windows know what the others did.

Format: `- YYYY-MM-DD · <Product> · <what changed, in plain words> · <commit or link>`

Add a line after every push or deploy, any DNS or domain change, any database migration, and any decision the founder settles. Commit and push the hub straight after. (`.gitattributes` uses union merge on this file, so two windows appending at once won't conflict.)

---

- 2026-09-29 · RECUP.STN · GitHub Pages site on Supabase made canonical; React app retired · joeycoachie/recup-station-
- 2026-10-01 · M.O.E. Terminal · Armory built at /ops/armory, KIN-P016_W1 pilot, SYS.OP unlock on /terminal · 742d79d, d0e7313
- 2026-10-02 · M.O.E. Terminal · KIN-P016_W2 (4s Eccentric Load) added to the Armory · 9a4a176
- 2026-10-03 · RECUP.STN · Open day
- 2026-10-05 · Intelligence Archive · v0.1.0 imported from the claude.ai artifacts into ~/Downloads/moe-armory
- 2026-10-05 · RECUP.STN · Customer naming: RECUP.STN HQ, RECUP 90, measured meal
- 2026-10-06 · Domain · terminal.theoperatorplaybook.com live (Squarespace A record → Vercel); Gumroad on www untouched
- 2026-10-06 · Hub · ~/theoperatorplaybook created (REGISTRY, DECISIONS, LEDGER); hub rule added to every product's instruction file
