# Where to paste what

One rule: **everything enters through one door, gets checked once, and lives in one place.** Nothing is kept twice.

## One home for each kind of thing (single source of truth)

Everything else only *reads* from the home. If two places disagree, the home wins.

| Kind of thing | Its one home | Who writes it | Who reads it |
|---|---|---|---|
| Studios, hotels, partners: stage, next step, every send and reply | **Outreach Console** (Terminal) | Joey taps LOG / REPLIED | Google Calendar feed "M.O.E. Outreach", Aria |
| Clients: sessions, check-ins, portal, health notes | **Client files** (Terminal) | Joey, instructors, clients | The client's portal |
| Arc cards (how a session runs) | **Armory** (Terminal) | KA-Alex drafts, the card check gates | Instructors, Client Log |
| Doctrines, protocols, tools, IDs, templates | **Intelligence Archive** (Terminal) → Brain Pack | This Claude Code window, on Joey's `file:` | Every agent, via the Brain Pack |
| Settled decisions | **hub/DECISIONS.md** (Terminal, Founder Command) | Only on Joey's `decide:` | Brain Pack, every agent |
| Daily loops, content briefs, posts, research, lessons | **Protocol Atlas** (claude.ai) | Joey and Aria | Aria's brief |
| Time | **Google Calendar** | Generated: the outreach feed, plus blocks Joey asks for | Joey, Aria |

A decision made in the Atlas or with Aria is a draft until Joey says `decide:` here. Then it is settled and every agent sees it.

## The doors

| You have | Paste it into | Start the message with | Where it ends up |
|---|---|---|---|
| A new arc card from KA-Alex (HTML) | **This Claude Code window** (Terminal) | `card:` + save the file in Downloads | Armory, after the card check passes |
| A protocol, doctrine or tool (PDF, doc) | **This window** | `file:` + its ID if you know it | Intelligence Archive: full text + skeleton if useful |
| What happened with a client, studio or deal (messy notes) | **This window** | `crucible:` | Crucible Investigator → Protocol Atlas lesson |
| A studio reply, call or visit result | **Outreach Console** card → LOG / REPLIED | (tap, no paste) | Console → your calendar → Aria |
| A client session | **Armory card** → OPEN LOG → SAVE SESSION | (tap, no paste) | Client file and their portal |
| A decision you have made | **This window** | `decide:` | hub/DECISIONS.md, Brain Pack rebuilt |
| A question for your day or week | **Aria** (claude.ai) | anything | Calendar, Gmail, Atlas |
| Something for KA-Alex to build | **This window** first | `brief Alex:` | A transmission file you copy into Gemini |

## The gates (what every paste passes through)

1. **Is it already in the Archive?** Then it updates that entry. No new IDs (Rule B).
2. **Has it been used in paid work?** Only then does it count as a protocol (Rule A).
3. **Will a client, studio or follower read it?** Then it passes the plain-language check (SYS-D028).
4. **Does it touch client health data?** Then it stays behind SYS.OP and never goes to public pages.

## The weekly rhythm

| When | Where | What |
|---|---|---|
| Every weekday morning | Aria | Your brief: calendar, overdue studio steps, replies, posts due |
| After every send, call or visit | Outreach Console | Tap LOG on the card |
| After every session | Armory → OPEN LOG | Save the session |
| Friday | This window: `plan next week` | Console dates set; calendar fills itself |
| When something goes wrong | This window: `crucible:` | One lesson filed, one post drafted |
