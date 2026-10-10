// Minimal Markdown → HTML for the hub's own files (ROADMAP, LEDGER). Covers what those
// files use: headings, paragraphs, bullet and numbered lists, tables, bold, code, links.
// Everything is escaped first, so the output is safe to inject.

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function inline(s: string): string {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code class="text-[#00e5ff] bg-[#111] px-1">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" class="text-[#00e5ff] underline">$1</a>');
}

const cells = (row: string) => row.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

export function markdownToHtml(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim() || /^---+$/.test(line.trim())) {
      i++;
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const cls = [
        '',
        'text-2xl md:text-3xl font-bold text-white mt-2 mb-4',
        'text-lg font-bold text-white mt-10 mb-3 border-b border-[#222] pb-2',
        'text-sm font-bold text-[#00e5ff] uppercase tracking-widest mt-6 mb-2',
      ][level];
      out.push(`<h${level} class="${cls}">${inline(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    if (line.trim().startsWith('|')) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(lines[i++]);
      const [head, , ...body] = rows;
      out.push('<div class="overflow-x-auto my-4"><table class="w-full text-xs border-collapse">');
      out.push(`<thead><tr>${cells(head).map((c) => `<th class="text-left text-[#888] uppercase tracking-wider font-normal border-b border-[#333] py-2 pr-4 align-bottom">${inline(c)}</th>`).join('')}</tr></thead><tbody>`);
      for (const r of body) {
        out.push(`<tr>${cells(r).map((c) => `<td class="border-b border-[#1a1a1a] py-2 pr-4 align-top text-[#ccc]">${inline(c)}</td>`).join('')}</tr>`);
      }
      out.push('</tbody></table></div>');
      continue;
    }

    const list = /^(\s*)(-|\d+\.)\s+/.exec(line);
    if (list) {
      const ordered = list[2] !== '-';
      const items: string[] = [];
      while (i < lines.length && /^\s*(-|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*(-|\d+\.)\s+/, ''));
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag} class="${ordered ? 'list-decimal' : 'list-disc'} pl-5 my-3 space-y-1.5 text-sm text-[#ccc]">${items.map((it) => `<li>${inline(it)}</li>`).join('')}</${tag}>`);
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|\||\s*(-|\d+\.)\s)/.test(lines[i])) para.push(lines[i++]);
    out.push(`<p class="text-sm text-[#ccc] leading-relaxed my-3">${inline(para.join(' '))}</p>`);
  }

  return out.join('\n');
}
