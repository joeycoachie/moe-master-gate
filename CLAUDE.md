@AGENTS.md

<!-- HUB:START -->
## The Operator's Playbook hub · read first

This product is one of several under The Operator's Playbook. The cross-project source of truth is the hub at `~/theoperatorplaybook`.

- **Before starting work:** read `~/theoperatorplaybook/REGISTRY.md` and `~/theoperatorplaybook/DECISIONS.md`, plus the last ~30 lines of `~/theoperatorplaybook/LEDGER.md`. Where they disagree with older notes or memory, the hub wins.
- **After every push, deploy, DNS change, migration, or decision the founder settles:** append one line to the bottom of `~/theoperatorplaybook/LEDGER.md`:
  `- YYYY-MM-DD · <Product> · <what changed, in plain words> · <commit or link>`
  Then, in the hub: `git add LEDGER.md && git commit -m "Ledger: <product>" && git push` (skip the push if the hub has no remote yet).
- **If you change a fact REGISTRY lists** (folder, repo, live link, database, subdomain), update REGISTRY.md in the same commit.
- **Only the founder settles DECISIONS.** Add an entry only when they've said it in plain words, with the date.
<!-- HUB:END -->
