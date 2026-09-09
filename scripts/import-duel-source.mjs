// Build-time source import only. Gameplay never parses effect prose.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const source = readFileSync(process.argv[2], 'utf8');
const pools = { SND: [], RCN: [] };
let series = '', subtype = 'effect';
for (const line of source.split('\n')) {
  if (/^### [56]\./.test(line)) series = line.replace(/^### [56]\.\d+ /, '').replace(/ \(.*$/, '');
  if (/^\*\*(Normal|Hızlı|Saha|Ekipman|Counter)/.test(line)) subtype = ({Normal:'normal',Hızlı:'quick',Saha:'field',Ekipman:'equip',Counter:'counter'})[line.match(/^\*\*(\S+)/)[1]];
  if (!/^\| (SND|RCN)-\d{3} /.test(line)) continue;
  const fields = line.replace(/\\\|/g, '∣').split('|').slice(1, -1).map(s => s.trim());
  const [id, name] = fields, prefix = id.slice(0, 3), n = Number(id.slice(4));
  let level = 0, attack = 0, defense = 0, location = 'main', kind = 'unit', sub = 'effect';
  if (fields.length === 6) [level, attack, defense] = fields.slice(2, 5).map(v => Number(v) || 0);
  else if (fields.length === 7) {
    location = fields[2] === 'Extra' ? 'auxiliary' : 'main';
    sub = fields[2].includes('Ritüel') ? 'ritual' : location === 'auxiliary' ? 'fusion' : 'effect';
    [level, attack, defense] = fields.slice(3, 6).map(v => Number(v) || 0);
  } else if (fields.length === 5 && fields[2] === 'Kadro') [level, attack, defense] = fields[3].split('/').map(Number);
  else {
    kind = prefix === 'SND' && n >= 120 && n <= 144 || fields[2]?.startsWith('Tuzak') ? 'trap' : 'spell';
    sub = fields[2]?.includes('sürekli') ? 'continuous' : fields[2] === 'Saha' ? 'field' : subtype;
    if (n === 149) sub = 'normal';
  }
  pools[prefix].push({ id, name, kind, subtype: sub, series, level, attack, defense, deckLocation: location, text: fields.at(-1).replaceAll('∣', '|') });
}
// RCN support cards are written as compact prose lists rather than table rows.
const rcn = source.slice(source.indexOf('### 6.8 Racon'));
const groups = [
  [91, 'spell', 'normal', rcn.match(/Haraç Topla .*\n/)[0]],
  [115, 'spell', 'quick', rcn.match(/Kaçış Arabası .*\n/)[0]],
  [120, 'spell', 'field', rcn.match(/Aşağı Mahalle .*\n/)[0]],
  [124, 'spell', 'equip', rcn.match(/El Telsizi .*\n/)[0]],
  [127, 'trap', 'normal', rcn.match(/Pusu \(.*\n/)[0]],
  [145, 'trap', 'counter', rcn.match(/Yalan İhbar .*\n/)[0]],
];
for (const [start, kind, subtype, row] of groups) {
  row.trim().split(' · ').forEach((entry, i) => {
    const first = entry.indexOf(' (');
    pools.RCN.push({ id: `RCN-${String(start + i).padStart(3, '0')}`, name: entry.slice(0, first), kind, subtype,
      series: kind === 'trap' ? 'İhbar' : 'Racon', level: 0, attack: 0, defense: 0, deckLocation: 'main', text: entry.slice(first + 2, -1) });
  });
}
for (const [copy, original] of [[66,65],[80,79]]) {
  const id = `SND-${String(copy).padStart(3,'0')}`;
  const card = pools.SND.find(c => c.id === `SND-${String(original).padStart(3,'0')}`);
  pools.SND[pools.SND.findIndex(c => c.id === id)] = { ...card, id };
}
// Preserve both contradictory counter intents as alternative timing modes on
// one explicitly documented record; keep the mandated final card at RCN-150.
const protect = pools.RCN.find(c => c.id === 'RCN-150');
const targeting = pools.RCN.find(c => c.id === 'RCN-149');
targeting.aliases = [protect.name];
targeting.text += `; ${protect.name}: ${protect.text}`;
pools.RCN = pools.RCN.filter(c => c.id !== 'RCN-150');
pools.RCN.find(c => c.id === 'RCN-151').id = 'RCN-150';
for (const [prefix, cards] of Object.entries(pools)) {
  if (cards.length !== 150 || new Set(cards.map(c => c.id)).size !== 150) throw Error(`${prefix}: invalid count ${cards.length}`);
  const folder = `public/games/${prefix === 'SND' ? 'veto-h' : 'gett-oh'}`;
  mkdirSync(folder, { recursive: true });
  writeFileSync(`${folder}/source-cards.json`, JSON.stringify(cards, null, 2) + '\n');
  console.log(prefix, cards.length, Object.fromEntries(['unit','spell','trap'].map(kind => [kind, cards.filter(c => c.kind === kind).length])));
}
