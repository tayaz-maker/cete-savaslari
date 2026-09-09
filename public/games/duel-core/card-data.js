const sndSeries = n => n <= 12 ? ['Sandık'] : n <= 26 ? ['Kulis'] : n <= 42 ? ['Kürsü'] : n <= 52 ? ['Genel Merkez'] : n <= 64 ? ['Anket'] : n <= 80 ? ['Kurultay','Koalisyon'] : ['Kampanya'];
const rcnSeries = n => n <= 14 ? ['Çayhane'] : n <= 26 ? ['Taksi'] : n <= 40 ? ['Çarşı'] : n <= 54 ? ['Liman','Gece'] : n <= 70 ? ['Aile'] : n <= 80 ? ['Baba','Aile'] : n <= 90 ? ['Yemin','Aile'] : ['Racon'];
export function buildCards(source, designs, theme) {
  return source.map(raw => {
    const n = Number(raw.id.slice(4)), design = designs[n];
    if (!design?.name || !design.text) throw Error(`Missing bilingual design: ${raw.id}`);
    const series = theme === 'veto-h' ? sndSeries(n) : rcnSeries(n);
    if (design.traits.extraSeries) series.push(design.traits.extraSeries);
    if (raw.kind === 'trap') series.splice(0,series.length,theme === 'veto-h' ? 'Skandal':'İhbar');
    const responseOnly=Object.keys(design.traits).some(key => key.startsWith('response'));
    const response = design.traits.responseTypes || (responseOnly||raw.kind==='trap'||raw.subtype==='quick' ? ['activate','attack','summon','special','draw','destroy','battle-start'] : null);
    return { ...raw, name:{tr:raw.name,en:design.name}, text:{tr:raw.text,en:design.text}, series,
      hint:{tr:raw.kind === 'unit' ? 'Kademe, çağrı maliyetini belirler. Ayrıntıda yasal işlemleri kontrol et.' : 'Zamanlama ve hedef koşullarını kontrol et; set kartları beklemek zorundadır.',
        en:raw.kind === 'unit' ? 'Level determines the summon cost. Check legal actions in the inspector.' : 'Check timing and target requirements; Set cards must wait.'},
      effects:design.effects,traits:design.traits,triggers:design.triggers,response,responseOnly,
      targets:raw.subtype === 'equip' ? [{owner:'own',zones:'units',count:1}] : [] };
  });
}
