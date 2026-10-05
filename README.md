# M.O.E. Armory

The Intelligence Archive (every doctrine, playbook, tool and crucible, linked to each other) and SYS-D028, the Plain Language Mandate. All data is plain JSON in `data/`.

```
npm run dev        # http://localhost:3000  (Archive)  ·  /mandate.html  (SYS-D028)
npm run validate   # check the data. Must pass before every commit
npm run gaps -- "how do I take someone from a post to a paid program"
npm run gate -- "text a customer will see"
```

Node 18+. Nothing to install.

- **Brief and next steps:** [HANDOVER.md](HANDOVER.md)
- **Rules for AI agents:** [AGENTS.md](AGENTS.md)
- **Classification rules:** [data/schema.json](data/schema.json)
- **Worked example:** `SYS-D028` in [data/archive/protocols.json](data/archive/protocols.json)

```
data/
  archive/protocols.json   doctrines and playbooks
  archive/tools.json       tools
  archive/crucibles.json   crucibles
  schema.json              fields, link types, gap-finder logic
  lexicon.json             SYS-D028 swap and ban list
  proposals.json           lexicon changes waiting for the founder
  audits.json              weekly after-action log
index.html                 Archive viewer
mandate.html               SYS-D028 page
scripts/                   validate, gaps, gate
```
