// Client Log bar, injected by /ops/armory/[protocolId] into every SYS-D022 V2 arc page.
// It reads the page's own PROTOCOL_DB, stationSelections and EQUIP_LABELS (top-level
// declarations in the arc's script), so arc files never need editing. Data is saved
// through /ops/api/arc-log, which requires the SYS.OP cookie.
(function () {
  'use strict';
  var PID = window.__MOE_PROTOCOL_ID;
  var DB, SEL, LABELS;
  try {
    DB = PROTOCOL_DB; // eslint-disable-line no-undef
    SEL = stationSelections; // eslint-disable-line no-undef
    LABELS = typeof EQUIP_LABELS !== 'undefined' ? EQUIP_LABELS : {}; // eslint-disable-line no-undef
  } catch (e) {
    return; // Not a SYS-D022 V2 arc: no bar.
  }
  if (!PID || !DB || !SEL) return;

  var PHASES = Object.keys(DB);
  var KEYS = [];
  PHASES.forEach(function (ph) {
    Object.keys(DB[ph].stations || {}).forEach(function (st) { KEYS.push(ph + '.' + st); });
  });

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  var S = { date: today(), sessionId: null, sessions: [], clients: [], selected: [], log: {}, audit: {}, dirty: false, open: false };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function clientName(id) {
    var c = S.clients.filter(function (x) { return x.id === id; })[0];
    return c ? c.full_name : 'Unknown client';
  }
  function current(key) {
    var parts = key.split('.');
    var eq = (SEL[parts[0]] || {})[parts[1]];
    var st = DB[parts[0]].stations[parts[1]];
    var opt = st && st.options[eq];
    return { apparatus: eq || '', label: LABELS[eq] || eq || '', movement: opt ? opt.name : '', role: st ? st.role : '' };
  }
  function entryFor(cid, key) {
    S.log[cid] = S.log[cid] || {};
    if (!S.log[cid][key]) S.log[cid][key] = { done: true, note: '' };
    return S.log[cid][key];
  }
  function markDirty() { S.dirty = true; setStatus('Unsaved changes', '#f59e0b'); }

  // ---------- Shell ----------
  // Full-width dock along the bottom: client names are visible as soon as the page opens.
  var DOCK_H = 56;
  var pad = el('style', '');
  pad.textContent = 'body{padding-bottom:' + DOCK_H + 'px;box-sizing:border-box}';
  document.head.appendChild(pad);
  var toggle = el('div', 'font-mono');
  toggle.setAttribute('style', "position:fixed;left:0;right:0;bottom:0;height:" + DOCK_H + "px;z-index:60;display:flex;align-items:center;gap:10px;padding:0 12px;background:#05101a;border-top:1px solid #00e5ff;font-family:'JetBrains Mono',monospace;box-sizing:border-box");
  var dockLabel = el('span', '', "WHO'S IN:");
  dockLabel.setAttribute('style', 'font-size:9px;letter-spacing:.15em;color:#00e5ff;font-weight:700;white-space:nowrap;flex-shrink:0');
  var dockChips = el('div', '');
  dockChips.setAttribute('style', 'flex:1;display:flex;gap:6px;overflow-x:auto;white-space:nowrap;scrollbar-width:none');
  var dockOpen = el('button', '', 'OPEN LOG ›');
  dockOpen.setAttribute('style', 'flex-shrink:0;font:700 10px JetBrains Mono,monospace;letter-spacing:.15em;color:#000;background:#00e5ff;border:1px solid #00e5ff;padding:9px 12px;cursor:pointer');
  // OPEN LOG first: some arc cards are wider than a phone screen, so the right edge can be off-screen.
  toggle.appendChild(dockOpen); toggle.appendChild(dockLabel); toggle.appendChild(dockChips);
  var panel = el('aside', '');
  panel.setAttribute('style', "position:fixed;top:0;right:0;height:100%;width:100%;max-width:460px;z-index:70;background:#0a0a0a;border-left:1px solid #333;display:none;flex-direction:column;font-family:Inter,sans-serif;color:#fff");
  document.body.appendChild(toggle);
  document.body.appendChild(panel);

  var head = el('div', '');
  head.setAttribute('style', 'padding:16px 20px;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center');
  var title = el('div', 'font-mono');
  title.setAttribute('style', 'font-size:10px;letter-spacing:.2em;color:#00e5ff;font-weight:700');
  title.textContent = 'CLIENT LOG // ' + PID;
  var closeBtn = el('button', 'font-mono', 'CLOSE');
  closeBtn.setAttribute('style', 'font-size:10px;letter-spacing:.15em;color:#888;border:1px solid #333;padding:4px 8px;background:#050505;cursor:pointer');
  head.appendChild(title); head.appendChild(closeBtn);

  var body = el('div', '');
  body.setAttribute('style', 'flex:1;overflow-y:auto;padding:16px 20px');
  var foot = el('div', '');
  foot.setAttribute('style', 'padding:12px 20px;border-top:1px solid #222;display:flex;gap:12px;align-items:center;background:#050505');
  var saveBtn = el('button', 'font-mono', 'SAVE SESSION');
  saveBtn.setAttribute('style', 'font-size:11px;font-weight:700;letter-spacing:.15em;color:#000;background:#00e5ff;border:1px solid #00e5ff;padding:8px 14px;cursor:pointer');
  var status = el('span', 'font-mono', '');
  status.setAttribute('style', 'font-size:10px;letter-spacing:.1em;color:#888');
  foot.appendChild(saveBtn); foot.appendChild(status);
  panel.appendChild(head); panel.appendChild(body); panel.appendChild(foot);

  function setStatus(text, color) { status.textContent = text; status.style.color = color || '#888'; }

  function renderDock(message) {
    dockChips.textContent = '';
    if (message) {
      var m = el('span', '', message);
      m.setAttribute('style', 'font-size:11px;color:#f59e0b');
      dockChips.appendChild(m);
      return;
    }
    if (!S.clients.length) {
      var none = el('span', '', 'No clients yet. Add them on the CLIENTS page.');
      none.setAttribute('style', 'font-size:11px;color:#888');
      dockChips.appendChild(none);
    }
    S.clients.forEach(function (c) {
      var on = S.selected.indexOf(c.id) !== -1;
      var b = el('button', '', c.full_name);
      b.setAttribute('style', 'flex-shrink:0;font:600 11px JetBrains Mono,monospace;padding:8px 12px;cursor:pointer;border:1px solid ' + (on ? '#00e5ff' : '#333') + ';color:' + (on ? '#000' : '#ccc') + ';background:' + (on ? '#00e5ff' : '#050505'));
      b.onclick = function () {
        if (on) S.selected = S.selected.filter(function (x) { return x !== c.id; });
        else S.selected.push(c.id);
        markDirty(); renderDock(); if (S.open) render();
      };
      dockChips.appendChild(b);
    });
    dockOpen.textContent = S.selected.length ? 'OPEN LOG (' + S.selected.length + ') ›' : 'OPEN LOG ›';
  }

  function label(text) {
    var l = el('div', 'font-mono', text);
    l.setAttribute('style', 'font-size:9px;letter-spacing:.2em;color:#666;text-transform:uppercase;margin:18px 0 8px');
    return l;
  }
  function inputStyle(n) {
    n.setAttribute('style', "background:#050505;border:1px solid #333;color:#fff;font:12px 'JetBrains Mono',monospace;padding:6px 8px;outline:none;border-radius:0");
    return n;
  }

  // ---------- Render ----------
  function render() {
    renderDock();
    body.textContent = '';

    // Date + session picker
    body.appendChild(label('Date & session'));
    var row = el('div', '');
    row.setAttribute('style', 'display:flex;gap:8px;flex-wrap:wrap');
    var date = inputStyle(el('input'));
    date.type = 'date'; date.value = S.date;
    date.onchange = function () { S.date = date.value; S.sessionId = null; loadSessions(); };
    var sessionSel = inputStyle(el('select'));
    sessionSel.style.flex = '1';
    var optNew = el('option', '', 'New session'); optNew.value = '';
    sessionSel.appendChild(optNew);
    S.sessions.forEach(function (s, i) {
      var names = (s.arc_session_entries || []).map(function (e) { return clientName(e.client_id); }).join(', ');
      var o = el('option', '', 'Session ' + (i + 1) + ' · ' + (names || 'no clients'));
      o.value = s.id;
      if (s.id === S.sessionId) o.selected = true;
      sessionSel.appendChild(o);
    });
    sessionSel.onchange = function () { openSession(sessionSel.value || null); };
    row.appendChild(date); row.appendChild(sessionSel);
    body.appendChild(row);

    // Clients
    body.appendChild(label("Who's in today"));
    var chips = el('div', '');
    chips.setAttribute('style', 'display:flex;gap:6px;flex-wrap:wrap');
    if (!S.clients.length) {
      var none = el('div', '', 'No clients yet. Add them on the CLIENTS page.');
      none.setAttribute('style', 'font-size:12px;color:#888');
      chips.appendChild(none);
    }
    S.clients.forEach(function (c) {
      var on = S.selected.indexOf(c.id) !== -1;
      var b = el('button', 'font-mono', c.full_name);
      b.setAttribute('style', 'font-size:11px;padding:6px 10px;cursor:pointer;border:1px solid ' + (on ? '#00e5ff' : '#333') + ';color:' + (on ? '#00e5ff' : '#aaa') + ';background:' + (on ? '#05101a' : '#050505'));
      b.onclick = function () {
        if (on) S.selected = S.selected.filter(function (x) { return x !== c.id; });
        else S.selected.push(c.id);
        markDirty(); render();
      };
      chips.appendChild(b);
    });
    body.appendChild(chips);

    if (!S.selected.length) return;

    // Client-specific overrides live in the client profile, never in the card (SYS-D022 V2.1).
    var flagged = S.clients.filter(function (c) {
      return S.selected.indexOf(c.id) !== -1 && ((c.conditions || '').trim() || (c.avoid || '').trim());
    });
    if (flagged.length) {
      var box = el('div', '');
      box.setAttribute('style', 'margin-top:10px;border:1px solid #1e3a8a;border-left:3px solid #3b82f6;background:#0a0f1c;padding:10px');
      // The card's own override toggles name their pathology (SYS-D022 V2.2 override library):
      // "RA OVERRIDE", "NERVE / KNEE SHEAR", "ACUTE CLAVICLE / PEC FLUSH" ... Offer each one when a
      // selected client's conditions mention one of its words.
      var overrides = cardOverrides();
      var wanted = {};
      flagged.forEach(function (c) {
        var line = el('div', '');
        line.setAttribute('style', 'font-size:12px;color:#ddd;line-height:1.5;margin-bottom:4px');
        line.appendChild(el('strong', 'font-mono', c.full_name));
        if ((c.conditions || '').trim()) line.appendChild(document.createTextNode(' · ' + c.conditions.trim()));
        if ((c.avoid || '').trim()) line.appendChild(document.createTextNode(' · Avoid: ' + c.avoid.trim()));
        box.appendChild(line);
        overrides.forEach(function (o) {
          if (o.re.test(c.conditions || '') || (o.key === 'ra' && /rheumat/i.test(c.conditions || ''))) wanted[o.key] = o;
        });
      });
      Object.keys(wanted).forEach(function (k) {
        var o = wanted[k];
        if (o.active()) return;
        var b = el('button', 'font-mono', 'TURN ON ' + o.name.toUpperCase());
        b.setAttribute('style', 'margin:6px 6px 0 0;font-size:10px;letter-spacing:.1em;padding:6px 10px;cursor:pointer;border:1px solid #3b82f6;color:#fff;background:#1e3a8a');
        b.onclick = function () { o.turnOn(); render(); };
        box.appendChild(b);
      });
      body.appendChild(box);
    }

    // Stations, per phase
    PHASES.forEach(function (ph) {
      var phase = DB[ph];
      body.appendChild(label(phase.title || ph));
      Object.keys(phase.stations).forEach(function (st) {
        var key = ph + '.' + st;
        var cur = current(key);
        var box = el('div', '');
        box.setAttribute('style', 'border:1px solid #222;background:#050505;padding:10px;margin-bottom:8px');
        var h = el('div', '');
        h.setAttribute('style', 'font-size:12px;color:#fff;margin-bottom:2px');
        h.textContent = st + ' · ' + cur.movement;
        var sub = el('div', 'font-mono', cur.label);
        sub.setAttribute('style', 'font-size:9px;letter-spacing:.1em;color:#00e5ff;margin-bottom:8px;text-transform:uppercase');
        box.appendChild(h); box.appendChild(sub);
        S.selected.forEach(function (cid) {
          var e = entryFor(cid, key);
          var line = el('div', '');
          line.setAttribute('style', 'display:flex;gap:8px;align-items:center;margin-top:6px');
          var cb = el('input');
          cb.type = 'checkbox'; cb.checked = e.done;
          cb.onchange = function () { e.done = cb.checked; markDirty(); };
          var nm = el('span', 'font-mono', clientName(cid).split(' ')[0]);
          nm.setAttribute('style', 'font-size:11px;color:#ccc;width:56px;flex-shrink:0');
          var note = inputStyle(el('input'));
          note.style.flex = '1'; note.style.fontSize = '11px';
          note.placeholder = 'Layering / regression';
          note.value = e.note;
          note.oninput = function () { e.note = note.value; markDirty(); };
          line.appendChild(cb); line.appendChild(nm); line.appendChild(note);
          box.appendChild(line);
        });
        body.appendChild(box);
      });
    });

    // Phase 5
    body.appendChild(label('Phase 5 · gate audit per client'));
    var hint = el('div', '', 'Set the Phase 5 tab for one client, then capture it here. Repeat for each client.');
    hint.setAttribute('style', 'font-size:11px;color:#888;margin-bottom:8px');
    body.appendChild(hint);
    S.selected.forEach(function (cid) {
      var a = S.audit[cid];
      var line = el('div', '');
      line.setAttribute('style', 'display:flex;gap:8px;align-items:center;justify-content:space-between;border:1px solid #222;padding:8px 10px;margin-bottom:6px;background:#050505');
      var info = el('div', '');
      var n = el('div', '', clientName(cid));
      n.setAttribute('style', 'font-size:12px');
      var s = el('div', 'font-mono', a ? 'Captured · ' + summarize(a) : 'Not captured');
      s.setAttribute('style', 'font-size:9px;letter-spacing:.08em;color:' + (a ? '#00e5ff' : '#666'));
      info.appendChild(n); info.appendChild(s);
      var b = el('button', 'font-mono', a ? 'RE-CAPTURE' : 'CAPTURE');
      b.setAttribute('style', 'font-size:10px;letter-spacing:.12em;color:#00e5ff;border:1px solid #00e5ff;background:#050505;padding:5px 8px;cursor:pointer');
      b.onclick = function () { S.audit[cid] = captureAudit(); markDirty(); render(); };
      line.appendChild(info); line.appendChild(b);
      body.appendChild(line);
    });
  }

  function summarize(a) {
    var gates = (a.gates || []).map(function (g) { return g.value; }).join(' / ');
    var flags = (a.somatic || []).filter(function (x) { return x.checked; }).length;
    return gates + (flags ? ' · ' + flags + ' body check' + (flags > 1 ? 's' : '') : '');
  }

  // Reads the arc's own Phase 5 form: gate selects, body-check boxes, notes and verdict.
  // Every override toggle on the card: <button id="<key>ToggleBtn">. V2.1 cards have only raToggleBtn + toggleRA().
  var OVERRIDE_STOP = /^(override|acute|flush|fix|tension|shear|active|protocol)$/i;
  function cardOverrides() {
    var list = [];
    document.querySelectorAll('[id$="ToggleBtn"]').forEach(function (btn) {
      var key = btn.id.replace(/ToggleBtn$/, '');
      if (!/^[a-z]+$/.test(key)) return;
      var name = btn.textContent.replace(/\[.?\]/g, '').replace(/\bACTIVE\b/gi, '').replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
      var words = name.split(/[^A-Za-z]+/).filter(function (w) { return w.length >= 2 && !OVERRIDE_STOP.test(w); });
      list.push({
        key: key,
        name: name || key,
        re: words.length ? new RegExp('\\b(' + words.join('|') + ')\\b', 'i') : /^$/,
        active: function () { return document.body.classList.contains(key + '-active'); },
        turnOn: function () {
          if (typeof window.toggleOverride === 'function') window.toggleOverride(key);
          else if (key === 'ra' && typeof window.toggleRA === 'function') window.toggleRA();
        },
      });
    });
    return list;
  }

  function captureAudit() {
    var gates = [];
    document.querySelectorAll('select[id^="gate"]').forEach(function (sel) {
      var box = sel.closest('div.p-4') || sel.parentElement;
      var nameEl = box && box.querySelector('span');
      var opt = sel.options[sel.selectedIndex];
      gates.push({ id: sel.id, name: nameEl ? nameEl.textContent.trim() : sel.id, value: sel.value, label: opt ? opt.textContent.trim() : sel.value });
    });
    var somatic = [];
    document.querySelectorAll('input[type="checkbox"][id^="som-"]').forEach(function (cb) {
      var lab = cb.closest('label');
      var t = lab && lab.querySelector('span');
      somatic.push({ id: cb.id, label: t ? t.textContent.trim() : cb.id, checked: cb.checked });
    });
    var notes = document.getElementById('auditNotes');
    var verdict = document.getElementById('auditVerdictBox');
    return {
      gates: gates,
      somatic: somatic,
      notes: notes ? notes.value : '',
      verdict: verdict ? verdict.innerText.trim().slice(0, 4000) : '',
      overrides: cardOverrides().filter(function (o) { return o.active(); }).map(function (o) { return o.name; }),
      captured_at: new Date().toISOString(),
    };
  }

  // ---------- Data ----------
  function api(url, opts) {
    return fetch(url, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) {
        if (!r.ok) throw new Error(b.error || ('Request failed (' + r.status + ')'));
        return b;
      });
    });
  }

  function loadClients() {
    return api('/ops/api/clients').then(function (b) {
      S.clients = (b.clients || []).filter(function (c) { return c.status === 'active'; });
    });
  }

  function loadSessions() {
    setStatus('Loading…');
    return api('/ops/api/arc-log?protocol=' + encodeURIComponent(PID) + '&date=' + S.date)
      .then(function (b) {
        S.sessions = b.sessions || [];
        if (!S.sessionId) { S.selected = []; S.log = {}; S.audit = {}; }
        S.dirty = false;
        setStatus(S.sessions.length ? S.sessions.length + ' session(s) logged on this date' : 'No sessions on this date yet');
        render();
      })
      .catch(function (e) { setStatus(e.message, '#ef4444'); render(); });
  }

  function openSession(id) {
    if (S.dirty && !window.confirm('Discard unsaved changes?')) { render(); return; }
    S.sessionId = id; S.selected = []; S.log = {}; S.audit = {}; S.dirty = false;
    var s = S.sessions.filter(function (x) { return x.id === id; })[0];
    if (s) {
      (s.arc_session_entries || []).forEach(function (e) {
        S.selected.push(e.client_id);
        S.log[e.client_id] = {};
        Object.keys(e.stations || {}).forEach(function (k) {
          S.log[e.client_id][k] = { done: e.stations[k].done !== false, note: e.stations[k].note || '' };
        });
        if (e.audit) S.audit[e.client_id] = e.audit;
      });
      setStatus('Resumed session');
    } else {
      setStatus('New session');
    }
    render();
  }

  function save() {
    if (!S.selected.length) { setStatus('Pick at least one client', '#ef4444'); return; }
    var flow = document.getElementById('flowFormat');
    var entries = S.selected.map(function (cid) {
      var stations = {};
      KEYS.forEach(function (key) {
        var e = entryFor(cid, key);
        var cur = current(key);
        stations[key] = { done: e.done, note: e.note, apparatus: cur.apparatus, movement: cur.movement };
      });
      return { client_id: cid, stations: stations, audit: S.audit[cid] || null };
    });
    saveBtn.disabled = true;
    setStatus('Saving…');
    api('/ops/api/arc-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: S.sessionId, protocol_id: PID, session_date: S.date, flow_format: flow ? flow.value : null, entries: entries }),
    })
      .then(function (b) {
        S.sessionId = b.session_id; S.dirty = false;
        return api('/ops/api/arc-log?protocol=' + encodeURIComponent(PID) + '&date=' + S.date).then(function (r) {
          S.sessions = r.sessions || [];
          render();
          setStatus('Saved ' + new Date(b.saved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), '#22c55e');
        });
      })
      .catch(function (e) { setStatus(e.message, '#ef4444'); })
      .then(function () { saveBtn.disabled = false; });
  }

  // ---------- Wire up ----------
  // Load clients and today's sessions straight away so names show in the dock.
  renderDock('Loading clients…');
  loadClients().then(loadSessions).catch(function (e) { setStatus(e.message, '#ef4444'); renderDock(e.message); });
  dockOpen.onclick = function () {
    S.open = true; panel.style.display = 'flex'; toggle.style.display = 'none';
    render(); // the apparatus may have changed on the page
  };
  closeBtn.onclick = function () { S.open = false; panel.style.display = 'none'; toggle.style.display = 'flex'; renderDock(); };
  saveBtn.onclick = save;
  window.addEventListener('beforeunload', function (e) {
    if (S.dirty) { e.preventDefault(); e.returnValue = ''; }
  });
})();
