# Hub rule (paste into every product's CLAUDE.md)

Everything between the markers below goes into a product's CLAUDE.md, unchanged. To update it later, edit it here, then replace the block in each product.

<!-- HUB:START -->
## The Operator's Playbook hub · read first

This product is one of several under The Operator's Playbook. The cross-project source of truth is the hub at `~/moe-master-gate/hub`.

- **Before starting work:** read `~/moe-master-gate/hub/REGISTRY.md` and `~/moe-master-gate/hub/DECISIONS.md`, plus the last ~30 lines of `~/moe-master-gate/hub/LEDGER.md`. Where they disagree with older notes or memory, the hub wins.
- **After every push, deploy, DNS change, migration, or decision the founder settles:** append one line to the bottom of `~/moe-master-gate/hub/LEDGER.md`:
  `- YYYY-MM-DD · <Product> · <what changed, in plain words> · <commit or link>`
  Then, in the hub: `git -C ~/moe-master-gate add hub/LEDGER.md && git -C ~/moe-master-gate commit -m "Ledger: <product>" && git -C ~/moe-master-gate push`.
- **If you change a fact REGISTRY lists** (folder, repo, live link, database, subdomain), update REGISTRY.md in the same commit.
- **Only the founder settles DECISIONS.** Add an entry only when they've said it in plain words, with the date.
<!-- HUB:END -->
