# Builds the public web version of the RECUP.STN studio deck from the slide files.
# Usage: python3 scripts/build-recup-deck.py sales/recup-deck public/recup/deck.html
# Source of truth for the slides: sales/recup-deck (same files as the claude.ai deck KL27kTxrpPkLfCt9yazx6F).
# Speaker notes (<aside>) are internal and are stripped. Slide-only <x-icon> tags become small SVGs.
import json, re, sys

src, out = sys.argv[1], sys.argv[2]
order = json.load(open(f'{src}/deck.json'))['order']

ICONS = {
    'Lock': '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    'CheckCircle': '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    'Warning': '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
    'Users': '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 5.5 5.5"/>',
}

def icon(m):
    name, style = m.group(1), m.group(2)
    return (f'<svg viewBox="0 0 24 24" aria-hidden="true" style="{style};flex:none;fill:none;stroke:currentColor;'
            f'stroke-width:2;stroke-linecap:round;stroke-linejoin:round">{ICONS.get(name, "")}</svg>')

slides = []
for sid in order:
    s = open(f'{src}/slides/{sid}.html').read()
    s = re.sub(r'<aside>.*?</aside>\s*', '', s, flags=re.S)
    s = re.sub(r'<x-icon name="(\w+)" style="([^"]*)"></x-icon>', icon, s)
    s = re.sub(r'\sdata-(section|transition)="[^"]*"', '', s)
    slides.append(f'<div class="frame"><div class="canvas">{s}</div></div>')

html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>RECUP.STN · Studio Deck</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@400..700&family=Rubik:wght@400;500;700&display=swap">
<style>
  :root {{ --bg:#14100E; --fg:#F3EBE1; --muted:#C9BBAB; --accent:#E07A55; }}
  body {{ margin:0; background:var(--bg); color:var(--fg); font:400 15px/1.5 'Rubik', Arial, sans-serif;
    padding-left:max(12px, env(safe-area-inset-left, 0px)); padding-right:max(12px, env(safe-area-inset-right, 0px)); }}
  .top {{ max-width:1100px; margin:0 auto; padding-block:20px 8px; display:flex; flex-wrap:wrap; gap:8px 16px; align-items:center; justify-content:space-between; }}
  .top b {{ font-family:'Oswald', Arial, sans-serif; letter-spacing:.12em; text-transform:uppercase; }}
  .top a {{ color:var(--accent); text-decoration:none; font-weight:500; }}
  .deck {{ max-width:1100px; margin:0 auto; padding-block:8px 40px; display:flex; flex-direction:column; gap:14px; }}
  .frame {{ width:100%; aspect-ratio:16/9; position:relative; overflow:hidden; border-radius:10px; box-shadow:0 6px 24px rgba(0,0,0,.35); }}
  .canvas {{ position:absolute; top:0; left:0; width:1920px; height:1080px; transform-origin:0 0; }}
  .canvas section {{ position:relative; width:1920px; height:1080px; box-sizing:border-box; overflow:hidden; }}
  .canvas section * {{ margin:0; box-sizing:border-box; }}
  .canvas section ul {{ padding-left:1.1em; }}
  .canvas section table {{ border-collapse:collapse; }}
  .canvas section th, .canvas section td {{ padding:.35em .6em; text-align:left; border-bottom:1px solid rgba(0,0,0,.08); }}
  .canvas section a {{ text-decoration:underline; }}
  .end {{ text-align:center; color:var(--muted); font-size:13px; padding-bottom:32px; }}
</style>
</head>
<body>
<div class="top"><b>RECUP.STN · Studio Deck</b><a href="/recup/guide">The plan on one page →</a></div>
<main class="deck">
{chr(10).join(slides)}
</main>
<p class="end">RECUP.STN · by The M.O.E. Group · WhatsApp +60 10-231 9893</p>
<script>
  // Scale each 1920×1080 slide to the width of the screen.
  function fit() {{ document.querySelectorAll('.frame').forEach(f => {{ f.firstElementChild.style.transform = 'scale(' + (f.clientWidth / 1920) + ')'; }}); }}
  addEventListener('resize', fit); fit();
</script>
</body>
</html>
'''
open(out, 'w').write(html)
print(f'{len(slides)} slides → {out}')
