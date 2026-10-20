# Builds the public RECUP.STN pages in English, Mandarin, Bahasa Malaysia and French.
#   python3 scripts/build-recup-i18n.py
# Sources (English):  sales/recup-guide/guide.html, sales/recup-deck (slides)
# Translations:       sales/i18n/<lang>.json  (English text → translation; names are left out on purpose)
# Output:             public/recup/guide[-zh|-ms|-fr].html, public/recup/deck[-zh|-ms|-fr].html
# Served at /recup/guide?lang=zh etc. (next.config.mjs rewrites). Rebuild after any copy change.
import importlib.util, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location('lib', os.path.join(ROOT, 'scripts/recup-i18n-lib.py'))
lib = importlib.util.module_from_spec(spec); spec.loader.exec_module(lib)

LANGS = [('en', 'EN'), ('zh', '中文'), ('ms', 'BM'), ('fr', 'FR')]
HTML_LANG = {'en': 'en', 'zh': 'zh-Hans', 'ms': 'ms', 'fr': 'fr'}
suffix = lambda l: '' if l == 'en' else f'-{l}'
q = lambda l: '' if l == 'en' else f'?lang={l}'

def switcher(base, current):
    links = ' · '.join(
        f'<b>{label}</b>' if code == current else f'<a href="{base}{q(code)}" hreflang="{HTML_LANG[code]}">{label}</a>'
        for code, label in LANGS)
    return f'<nav class="langs" aria-label="Language">{links}</nav>'

LANG_CSS = '.langs { font-size: 14px; display: flex; gap: 6px; flex-wrap: wrap; } .langs a { color: inherit; opacity: .75; } .langs b { font-weight: 600; }'

def build_guide():
    src = open(os.path.join(ROOT, 'sales/recup-guide/guide.html')).read()
    for code, _ in LANGS:
        table = {} if code == 'en' else json.load(open(os.path.join(ROOT, f'sales/i18n/{code}.json')))
        page = src.replace('<html lang="en">', f'<html lang="{HTML_LANG[code]}">', 1)
        page = page.replace('</style>', f'  {LANG_CSS}\n</style>', 1)
        page = page.replace('<p class="eyebrow">RECUP.STN · by The M.O.E. Group</p>',
                            '<p class="eyebrow">RECUP.STN · by The M.O.E. Group</p>\n    ' + switcher('/recup/guide', code), 1)
        page = lib.translate(page, table)
        open(os.path.join(ROOT, f'public/recup/guide{suffix(code)}.html'), 'w').write(page)

def build_deck():
    for code, _ in LANGS:
        out = os.path.join(ROOT, f'public/recup/deck{suffix(code)}.html')
        subprocess.run([sys.executable, os.path.join(ROOT, 'scripts/build-recup-deck.py'), os.path.join(ROOT, 'sales/recup-deck'), out], check=True, stdout=subprocess.DEVNULL)
        table = {} if code == 'en' else json.load(open(os.path.join(ROOT, f'sales/i18n/{code}.json')))
        page = open(out).read()
        page = page.replace('<html lang="en">', f'<html lang="{HTML_LANG[code]}">', 1)
        page = page.replace('</style>', f'  {LANG_CSS}\n</style>', 1)
        page = page.replace('<a href="/recup/guide">', f'{switcher("/recup/deck", code)}<a href="/recup/guide{q(code)}">', 1)
        page = page.replace('https://studio.theoperatorplaybook.com/recup/guide"', f'https://studio.theoperatorplaybook.com/recup/guide{q(code)}"')
        page = lib.translate(page, table)
        open(out, 'w').write(page)

build_guide(); build_deck()
print('built:', ', '.join(f for f in sorted(os.listdir(os.path.join(ROOT, 'public/recup')))))
