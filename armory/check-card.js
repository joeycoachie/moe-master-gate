// SYS-D022 V2.2 contract check for a Battle Card. Run before adding a card to the Armory:
//   node armory/check-card.js <card.html> armory/apparatus-registry.json
// FAIL lines must be fixed by KA-Alex; WARN lines are flagged to the founder.
const fs=require('fs');
const [file,regFile]=process.argv.slice(2);
const h=fs.readFileSync(file,'utf8'); const reg=JSON.parse(fs.readFileSync(regFile,'utf8'));
const keys=Object.keys(reg.apparatus);
const out=[]; const bad=(m)=>out.push('FAIL  '+m); const ok=(m)=>out.push('ok    '+m); const warn=(m)=>out.push('WARN  '+m);
const scripts=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
const el={classList:{add(){},remove(){},replace(){},contains(){return false}},style:{},value:'',innerText:'',innerHTML:'',checked:false,appendChild(){},removeChild(){},select(){}};
const document={getElementById:()=>el,querySelectorAll:()=>[],body:el,createElement:()=>el,execCommand(){}};
let r;
try{ r=(new Function('document','window','setInterval','clearInterval','setTimeout',scripts+';return {DB:typeof PROTOCOL_DB!=="undefined"?PROTOCOL_DB:null,SEL:typeof stationSelections!=="undefined"?stationSelections:null,EQ:typeof EQUIP_LABELS!=="undefined"?EQUIP_LABELS:null,RA:typeof toggleRA==="function",OV:typeof toggleOverride==="function"}'))(document,{},()=>0,()=>0,()=>0); ok('script runs'); }
catch(e){ bad('script error: '+e.message); console.log(out.join('\n')); process.exit(); }
for (const [n,v] of [['PROTOCOL_DB',r.DB],['stationSelections',r.SEL],['EQUIP_LABELS',r.EQ]]) v?ok(n+' is top-level'):bad(n+' missing or not top-level');
if(!r.DB||!r.SEL||!r.EQ){ console.log(out.join('\n')); process.exit(1); }
if(/<script[^>]*type=["']module/.test(h)) bad('uses a module script');
r.RA?ok('toggleRA() exists'):bad('toggleRA() missing');
// V2.2 override library: a card may declare named overrides as <button id="<key>ToggleBtn" onclick="toggleOverride('<key>')">.
// 'ra' is always the first; each declared key may add one field of the same name to every option.
const OVR=[...new Set([...h.matchAll(/id="([a-z]+)ToggleBtn"/g)].map(m=>m[1]))].filter(k=>k!=='ra');
if(OVR.length){
 r.OV?ok('V2.2 overrides declared: ra, '+OVR.join(', ')):bad('overrides '+OVR.join(', ')+' declared but toggleOverride() missing');
 for(const k of OVR){ h.includes("toggleOverride('"+k+"')")?0:bad('#'+k+'ToggleBtn does not call toggleOverride(\''+k+'\')'); h.includes(k+'-module')?0:bad('override "'+k+'" has no .'+k+'-module to show its cue'); }
}
const PH=['primer','anchor','crucible','unwind'];
JSON.stringify(Object.keys(r.DB))===JSON.stringify(PH)?ok('phase keys in order'):bad('phase keys: '+Object.keys(r.DB));
for(const ph of PH){const p=r.DB[ph]; if(!p) continue;
 for(const f of ['title','subtitle','clockHint','wolfCue','shepherdCue','safetyGate','stations']) if(!(f in p)) bad(`${ph}.${f} missing`);
 const st=Object.keys(p.stations||{}); JSON.stringify(st)!==JSON.stringify(['M1','M2','M3'])&&bad(`${ph} stations = ${st}`);
 for(const s of st){const o=p.stations[s]; if(!o.role) bad(`${ph}.${s}.role missing`);
  for(const [k,v] of Object.entries(o.options||{})){
   if(!keys.includes(k)) bad(`${ph}.${s} uses apparatus "${k}" not in the registry`);
   if(reg.apparatus[k]&&reg.apparatus[k].same_actions===false&&Object.keys(o.options).length>1) bad(`${ph}.${s}: "${k}" is same_actions=no but sits beside other options`);
   const fk=Object.keys(v); const miss=['exec','name','ra','reps','setup'].filter(x=>!fk.includes(x)); const extra=fk.filter(x=>!['exec','name','ra','reps','setup',...OVR].includes(x));
   if(miss.length||extra.length) bad(`${ph}.${s}.${k} fields = ${fk.sort().join(',')}`);
   if(!r.EQ||!r.EQ[k]) bad(`EQUIP_LABELS has no label for "${k}"`);
  }
  const sel=r.SEL&&r.SEL[ph]&&r.SEL[ph][s]; if(!sel||!(o.options||{})[sel]) bad(`stationSelections.${ph}.${s} = "${sel}" is not one of its options`);
 }}
for(const id of ['gate1-status','gate2-status','gate3-status','auditNotes','auditVerdictBox','paxCount','flowFormat']) h.includes(`id="${id}"`)?ok('#'+id):bad('#'+id+' missing');
const som=[...h.matchAll(/id="(som-[a-z0-9-]+)"/g)].map(m=>m[1]); som.length?ok('body checks: '+som.join(', ')):bad('no som-* checkboxes');
const names=(h.match(/\b(Mae|Eleine|Pei|Zi Suen|daughters?|Joey's)\b/gi)||[]); names.length?bad('client names in card: '+[...new Set(names)].join(', ')):ok('no client names');
/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(h)?bad('contains emojis'):ok('no emojis');
for (const f of ['inv-reformer','autoOptimizeEquipment','setGlobalPreset']) h.includes(f)?ok('V2.0 hardware matrix: '+f):warn('V2.0 hardware matrix missing: '+f);
// Working engines, not just their names (KA-Alex sometimes ships stubs: 16 Oct, P016 W4/W5).
const body=(fn)=>{const i=scripts.search(new RegExp('function\\s+'+fn+'\\s*\\('));if(i<0)return null;const rest=scripts.slice(i+8);const j=rest.search(/\n\s*(async\s+)?function\s|\n\s*window\.onload/);return (j<0?rest:rest.slice(0,j)).replace(/\s+/g,'');};
const ul=body('updateLogistics'); ul&&ul.length>200&&ul.includes('logisticsBanner')?ok('hardware matrix engine: updateLogistics() works'):bad('hardware matrix engine stubbed: updateLogistics() is empty or missing');
const ao=body('autoOptimizeEquipment'); ao&&ao.includes('getInventory')?ok('AUTO-FIT reads the inventory'):bad('AUTO-FIT stubbed: autoOptimizeEquipment() ignores the inventory');
const ev=body('evaluateAuditLoop'); ev&&ev.includes('auditVerdictBox')?ok('Phase 5 verdict logic: evaluateAuditLoop()'):bad('Phase 5 verdict logic missing: no evaluateAuditLoop() writing #auditVerdictBox');
console.log(out.join('\n'));
process.exitCode=out.some(l=>l.startsWith('FAIL'))?1:0;
