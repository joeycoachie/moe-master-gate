# REGISTRY · The Operator's Playbook

Every product, where it lives, and what it runs on. **If you change any of these facts, update this file in the same session.**

Last verified: 2026-10-06 (Founder Command window, from disk and the Vercel account)

---

## Products

| Product | ID | Local folder (this Mac) | GitHub repo | Live at | Data | Claude window opened on |
|---|---|---|---|---|---|---|
| **M.O.E. Terminal** (instructor stations, Ops, Armory arcs) | — | `~/moe-master-gate` | joeycoachie/moe-master-gate | https://terminal.theoperatorplaybook.com (also instructor-callibration-terminal.vercel.app) | Supabase `wpdidthdbfoualvnklwq` | `~/moe-master-gate` |
| **RECUP.STN** (site, God Terminal, booth flow) | — | **missing from this Mac since 2026-10-10** (was `~/Downloads/recupstn-workspace/recup-station`); re-clone from GitHub | joeycoachie/recup-station- | https://joeycoachie.github.io/recup-station-/ (GitHub Pages) | Supabase `bjpekyumhgyssvmhwiyz` (table `runners`, staff in `recup_staff`) | `~/Downloads/recupstn-workspace` |
| **M.O.E. Intelligence Archive** (+ SYS-D028 Plain Language Mandate) | — | `~/moe-master-gate/archive` | joeycoachie/moe-master-gate (folder `archive/`, history kept) | not hosted yet | JSON in repo: `data/archive/*.json`, `data/lexicon.json` | `~/moe-master-gate/archive` |
| **Hyrox Engine** (Hybrid Race Engine) | SYS-HRX-001 | `~/Desktop/KIN-/-SYS-HRX-001_MASTER-NODE` | joeycoachie/-SYS-HRX-001_MASTER-NODE | https://sys-hrx-001-master-node.vercel.app | Browser only (localStorage), no shared DB | `~/Desktop/KIN - SYS-HRX-001 MASTER NODE` (old path, folder since renamed) |
| **Protocol Atlas** (GRAHAM content-strategy library) | — | `~/Desktop/GRAHAM Intel Library of Protocols ` (trailing space in name) | none (not a git repo) | Claude artifact https://claude.ai/artifact/V9U3iJpq5iPBpZEh19h3dH | `.md`/`.pdf` protocol files in the folder | same folder |
| **Product Academy** (Sovereign Fuel OS & Clinical Directory) | MET | `~/Desktop/MET-PRODUCT-DIRECTORY/moe_product_academy` | joeycoachie/moe_product_academy | https://moe-product-academy.vercel.app | `fuel_protocol_v2.json` in repo | same folder |
| **Kinetic Gate console** | — | `~/Desktop/kineticgatesource` | joeycoachie/kinetic-gate-console | https://kinetic-gate-console.vercel.app | static | same folder |
| **MOE CRM Terminal** | SYS-MOE-008 | `~/Desktop/moe-crm-deploy` | none | https://moe-operator-terminal.web.app | Firebase `moe-operator-terminal` | — |
| **Gumroad store** | — | — | — | https://www.theoperatorplaybook.com | Gumroad | — |

## Domain: theoperatorplaybook.com

- Registrar: **Squarespace Domains** (expires 2027-07-14). DNS is edited by the founder in Squarespace → Domains → DNS → Custom records. Agents can't edit it.
- `www` and root → **Gumroad store. Never repoint.** Never switch the nameservers to Vercel (that kills the store).
- `terminal` → A `76.76.21.21` → Vercel project `instructor-callibration-terminal`. Live 2026-10-06.
- **Adding a product subdomain:** an agent runs `vercel domains add <name>.theoperatorplaybook.com <vercel-project>`, then the founder adds a Custom record (Type `A`, Name `<name>`, IP `76.76.21.21`). HTTPS takes about 3 minutes.

## Founder-only access

| What | Where | How |
|---|---|---|
| Architect / SYS.OP | terminal.theoperatorplaybook.com → [SYS.OP] button | Architect code (env `OPS_ARCHITECT_PASSCODE`, default in code) |
| Ops (Danny) | terminal.theoperatorplaybook.com/ops/login | Ops passcode |

## Claude artifacts (claude.ai)

| Artifact | Link | Status |
|---|---|---|
| Protocol Atlas (current) | https://claude.ai/artifact/V9U3iJpq5iPBpZEh19h3dH | live, updated 2026-10-05 |
| Protocol Atlas (older) | https://claude.ai/artifact/W18q8pQ4recvpJptEvzUKh | duplicate, 2026-09-25. Retire? |
| Protocol Atlas — System Check & Scaling Playbook | https://claude.ai/artifact/FsM63Z6RdPnufwGQjxu8Rt | reference |
| Recup Founder Command | https://claude.ai/artifact/8uKpPyAphr7jCHRf6kyHyk | live, 2026-10-06. Input to the Founder Command build |
| Intelligence Archive | https://claude.ai/artifact/4WWfjCqRHPbCbpqM4c6n1c | **retiring.** `moe-master-gate/archive/data/` wins; never write to it |
| Plain Language Mandate (SYS-D028) | https://claude.ai/artifact/QQsoLdJFPAVo6usBZE8Z9v | **retiring.** `moe-armory/data/lexicon.json` wins |
| Operator's Playbook | https://claude.ai/artifact/JUE3rUvGEay21JvNQ6RJt6 | 2026-09-23 |
| Cadence Matrix / GRAHAM Cadence Matrix (Copy) | BkBPzEyXXi3ijGJ7BzTt1k / 67AGTcXrt8ESKrbdAKmvVK | duplicate pair |
| GRAHAM Protocol Truths | https://claude.ai/artifact/G8Tt2zcDnSNTgekp3RVtE2 | |
| GRAHAM Feature Spec (Carousel / AI Self-Imagery) | https://claude.ai/artifact/9SeYXy3in19AsvUDJuutj1 | |
| Kinetic Gate — Product Flow | https://claude.ai/artifact/PCpyVuTB7YfMHfqyNHpWc7 | |
| Launch Readiness Template | https://claude.ai/artifact/T657RM78p3eX2LiPNPfwF4 | |
| Guild Console Audit | https://claude.ai/artifact/PePECi2m52mtSCaW8Ud62U | |
| Joey Coachie — Link in Bio | https://claude.ai/artifact/EpjxA6Da3J32fEqVKfUJTJ | |

## Known drift risks (fix or retire)

1. **Second copy of RECUP.STN** at `~/VS/recup-station`: no git remote, older. The canonical copy is `~/Downloads/recupstn-workspace/recup-station`. Don't edit `~/VS`.
2. **Kinetic Diagnostic quiz in two codebases:** `moe-master-gate/KIN-Kinetic_Diagnostic_Tool-` (live QR page, kin-kinetic-diagnostic-tool-rcuk.vercel.app) and `moe-master-gate/app/diagnostic`. Change both until consolidated.
3. **Hyrox Engine folder was renamed** (`KIN - SYS-HRX-001 MASTER NODE` → `KIN-/-SYS-HRX-001_MASTER-NODE`), so its old Claude window's memory is orphaned. Open new HRX windows on the new path.
4. **The Vercel account has 100+ projects**, many duplicates (e.g. about 10 copies of `kin-014-p3-w1-metabolic-duet`). Protocol sites move into the Terminal's Armory over time, then the copies get retired.
5. **Archive and hub now live inside `moe-master-gate`** (2026-10-10), backed up by its GitHub repo once pushed. The old folders `~/Downloads/moe-armory` and `~/theoperatorplaybook` are retired copies.
