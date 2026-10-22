# Checks every slide of the built RECUP.STN decks in headless Chrome: does any text spill off the
# 1920×1080 slide, or into the footer band? Run after scripts/build-recup-i18n.py.
#   python3 scripts/qa-recup-deck.py            → one line per language, "all fit" or the slides to fix
import html, os, re, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

PROBE = '''<script>
document.fonts.ready.then(() => setTimeout(() => {
  const rows = [];
  document.querySelectorAll('section').forEach(sec => {
    const s = sec.getBoundingClientRect(); const bad = [];
    sec.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect(); if (!r.width && !r.height) return;
      const pinned = el.closest('[style*="position:absolute"]');
      const label = el.tagName + ' ' + (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 50);
      if (r.right > s.right + 1 || r.bottom > s.bottom + 1) bad.push('OUT ' + label);
      else if (!pinned && r.bottom > s.top + 930) bad.push('FOOTER ' + label);
    });
    rows.push(sec.id + ': ' + (bad.length ? [...new Set(bad)].slice(0, 3).join(' | ') : 'ok'));
  });
  document.getElementById('out').textContent = rows.join('\\n');
}, 300));
</script>'''

def check(deck_file):
    page = open(deck_file).read()
    head = re.sub(r'<script.*?</script>', '', re.search(r'<head>(.*?)</head>', page, re.S).group(1), flags=re.S)
    sections = re.findall(r'<section\b.*?</section>', page, re.S)
    wrapped = ''.join('<div class="canvas" style="position:relative;transform:none;margin-bottom:20px">' + s + '</div>' for s in sections)
    with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False) as f:
        f.write('<!doctype html><html><head>' + head + '</head><body style="margin:0;padding:0;width:1920px"><pre id="out">PENDING</pre>' + wrapped + PROBE + '</body></html>')
    dom = subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--window-size=1920,1080', '--virtual-time-budget=8000', '--dump-dom', 'file://' + f.name],
                         capture_output=True, text=True).stdout
    os.unlink(f.name)
    m = re.search(r'<pre id="out">(.*?)</pre>', dom, re.S)
    rows = html.unescape(m.group(1)).splitlines() if m else ['no result']
    bad = [r for r in rows if not r.endswith(': ok')]
    return len(rows), bad

failed = False
for suffix in ['', '-zh', '-ms', '-fr']:
    n, bad = check(os.path.join(ROOT, f'public/recup/deck{suffix}.html'))
    failed |= bool(bad)
    print(f'deck{suffix or " (en)"}: {n} slides, ' + ('all fit' if not bad else ' | '.join(bad)))
sys.exit(1 if failed else 0)
