# Shared by the RECUP.STN translation scripts: find every visible text piece in an HTML page,
# and swap each one for its translation. Text pieces are what sits between tags, trimmed.
import html, re

SKIP = re.compile(r'<(script|style|aside)\b[^>]*>.*?</\1>', re.S)
TEXT = re.compile(r'>([^<>]+)<')

def segments(page):
    body = SKIP.sub('', page)
    out = []
    for m in TEXT.finditer(body):
        t = html.unescape(m.group(1)).strip()
        if t and re.search(r'[A-Za-z]', t) and not t.startswith(('http', '+60', 'TEAM-', '@')):
            out.append(t)
    return out

def translate(page, table):
    parts = re.split(r'(<(?:script|style|aside)\b[^>]*>.*?</(?:script|style|aside)>)', page, flags=re.S)
    def swap(m):
        raw = m.group(1)
        t = html.unescape(raw).strip()
        if t in table and table[t]:
            lead = raw[:len(raw) - len(raw.lstrip())]
            tail = raw[len(raw.rstrip()):]
            return '>' + lead + html.escape(table[t], quote=False) + tail + '<'
        return m.group(0)
    return ''.join(p if i % 2 else TEXT.sub(swap, p) for i, p in enumerate(parts))
