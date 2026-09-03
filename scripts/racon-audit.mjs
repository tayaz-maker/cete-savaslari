import { loadGame } from "./racon-harness.mjs";
const bulgular = [];
const not = (m) => { bulgular.push(m); };

function deepScan(o, path, out, seen = new Set()) {
  if (o === null || typeof o !== "object") return;
  if (seen.has(o)) return; seen.add(o);
  for (const k of Object.keys(o)) {
    const v = o[k], p = path + "." + k;
    if (typeof v === "number") {
      if (Number.isNaN(v)) out.push("NaN: " + p);
      if (!Number.isFinite(v)) out.push("Infinity: " + p);
    } else if (typeof v === "string") {
      if (/undefined|NaN|\[object Object\]/.test(v)) out.push("bozuk metin: " + p + " = " + v.slice(0, 60));
    } else if (v && typeof v === "object") deepScan(v, p, out, seen);
  }
}

// ---------- 1) UZUN SİMÜLASYON ----------
{
  const g = loadGame();
  const { ev } = g;
  ev('blank("Sim"); enterPlay(); S.seed = 20240101; UI.fastJob = true;');
  let hafta0 = ev("S.week"), gunSay = 0, crash = null;
  const t0 = Date.now();
  try {
    for (let i = 0; i < 700 && ev("S.week") < 101; i++) {
      // mantıklı aksiyon: hazır adam varsa iş planla
      ev(`(function(){
        if (S.flags.oyunSonu) return;
        var hazir = S.men.filter(function(m){return m.durum==="hazir";});
        var acikIs = S.jobs.filter(function(j){return j.phase!=="done";});
        if (hazir.length && acikIs.length < 2) {
          var st = S.streets[ri(0,S.streets.length-1)];
          if (!(st && num(st.muhurLeft,0)>0)) {
            var kinds=["tahsilat","kepenk","tek_arac","esnaf_koruma","tombala"];
            S.jobs.push({id:nid("j"),kind:kinds[ri(0,kinds.length-1)],streetId:(st||S.streets[0]).id,
              prepLeft:0,assigned:[hazir[0].id],tags:[],phase:"idle",tickIndex:0});
          }
        }
        var isler = S.jobs.filter(function(j){return j.phase!=="done" && j.prepLeft<=0;});
        if (isler.length && rng()<0.6) {
          UI.jobId = isler[0].id; UI.jobOrders = [["sessiz","sikistir","ates","cekil"][ri(0,3)]];
          UI.fastJob = true; finishJob();
          S.jobs = S.jobs.filter(function(x){return x.id!==isler[0].id;});
        }
        // rastgele kâğıt eylemleri
        var kag = S.inbox.filter(function(x){return !x.kapali;});
        if (kag.length && rng()<0.5) {
          var it = kag[ri(0,kag.length-1)];
          var m = {komiser:["kom-zarf","kom-sus","kom-tehdit"],tuyo:["kepenk-indir","paper-dosya"],
            aday:["aday-al","paper-dosya"],lakap:["lakap-al","lakap-red"],cay:["cay-dinle","cay-kov"],
            izin:["izin-ver","izin-red"],basin:["basin-kisa","basin-tehdit","basin-yoksay"],
            intikam:["intikam-pesine","intikam-birak"],dilekce:["dilekce-kabul","dilekce-red"],
            zam:["zam-kabul","zam-red"],"lakap-hirsiz":["lakap-hirsiz-izin","lakap-hirsiz-red"]}[it.kind]
            || ["paper-git","paper-ertele","paper-dosya","paper-agiz"];
          try { act(m[ri(0,m.length-1)], {id:it.id}); } catch(e) { return "ACT HATA "+it.kind+": "+e.message; }
        }
        // takvim yükümlülükleri
        var duty = S.calendar.filter(function(c){return c.strip==="yukumluluk" && c.status==="bekler";})[0];
        if (duty && rng()<0.4) { try { act("duty-go",{id:duty.id}); } catch(e){ return "DUTY HATA: "+e.message; } }
        return null;
      })()`);
      const sonuc = ev("UI.__son || null");
      ev("S.busy=false; UI.sahne=false; UI.modal=null; UI.threatOk=true;");
      ev("doAdvance()");
      gunSay++;
      if (gunSay % 40 === 0) {
        const out = []; deepScan(ev("S"), "S", out);
        if (out.length) { not("SİM gün " + gunSay + ": " + out.slice(0, 5).join(" | ")); break; }
      }
    }
  } catch (e) { crash = e.message + "\n" + (e.stack || "").split("\n").slice(1, 4).join("\n"); }
  const sure = Date.now() - t0;
  if (crash) not("SİM ÇÖKTÜ (gün " + gunSay + "): " + crash);
  const out = []; deepScan(ev("S"), "S", out);
  if (out.length) not("SİM sonu bozuk değer: " + out.slice(0, 8).join(" | "));
  console.log(`[1] simülasyon: ${gunSay} gün / hafta ${ev("S.week")} (${sure}ms) · oyunSonu=${JSON.stringify(ev("S.flags.oyunSonu"))} · adam=${ev("S.men.length")} · kasa=${ev("S.kasa")} · dosya=${Math.round(ev("S.dosya"))}`);
}

// ---------- 2) SINIR DURUMLARI ----------
{
  const g = loadGame(); const { ev } = g;
  const senaryo = (ad, kur) => {
    ev('blank("S"); enterPlay(); S.seed = 555; UI.fastJob = true; S.busy=false;');
    try { ev(kur); } catch (e) { not("SINIR[" + ad + "] kurulum: " + e.message); return; }
    try {
      for (let i = 0; i < 30; i++) { ev("S.busy=false;UI.threatOk=true;UI.sahne=false;UI.modal=null;"); ev("doAdvance()"); }
      const out = []; deepScan(ev("S"), "S", out);
      if (out.length) not("SINIR[" + ad + "] bozuk değer: " + out.slice(0, 5).join(" | "));
      // ekranlar çizilebiliyor mu
      for (const s of ["olaylar","takvim","adamlar","harita","isler","emniyet","husumet","kasa"]) {
        const h = ev(`(function(){S.screen=${JSON.stringify(s)};try{return screenHtml();}catch(e){return "HATA:"+e.message;}})()`);
        if (/^HATA:/.test(h)) not("SINIR[" + ad + "] " + s + " çizilemedi: " + h);
        else if (/undefined|NaN|\[object Object\]/.test(String(h).replace(/<[^>]*>/g, " "))) {
          const mm = String(h).replace(/<[^>]*>/g, " ").match(/.{0,40}(undefined|NaN|\[object Object\]).{0,25}/);
          not("SINIR[" + ad + "] " + s + " bozuk metin: " + (mm ? mm[0].trim() : ""));
        }
      }
    } catch (e) { not("SINIR[" + ad + "] ÇÖKTÜ: " + e.message); }
  };
  senaryo("kadro tamamen ölü", 'S.men.forEach(function(m){m.durum="olu";});');
  senaryo("terör 100 sadakat 0", 'S.streets.forEach(function(s){s.terorMahalle=100;s.sadakatMahalle=0;s.heat=100;});');
  senaryo("kasa 0 borç yüksek", 'S.kasa=0;S.dirtyKasa=0;S.cleanKasa=0;S.debt=90000;');
  senaryo("dosya 100", 'S.dosya=100;S.evidence.push({id:"ev_x",kind:"tanik",streetId:S.streetHome,week:S.week,weight:9});');
  senaryo("boş taht", 'oyuncuDustu();');
  senaryo("kan davası + boş taht", 'oyuncuDustu(); S.blood.push({id:"b1",rivalOrFamily:"x",weekDue:S.week,status:"acik",evre:0});');
  senaryo("tek adam kaldı", 'S.men = S.men.slice(0,1);');
  senaryo("hiç sokak sende değil", 'S.streets.forEach(function(s){s.sahip="rakip";});');
  console.log("[2] sınır durumları: 8 senaryo x 30 gün koştu");
}

// ---------- 3) ÖLÜM ZİNCİRİ ÇAKIŞMASI ----------
{
  const g = loadGame(); const { ev } = g;
  ev('blank("S"); enterPlay(); S.seed=31337;');
  // aynı adam iki kez ölürse zincir iki kez mi işliyor?
  const r = ev(`(function(){
    var m = S.men[0];
    S.calendar=[]; S.blood=[];
    m.durum="olu"; bagOlumTepki(m); lakapHirsizligiKontrol(m);
    var cal1=S.calendar.length, blood1=S.blood.length;
    bagOlumTepki(m); lakapHirsizligiKontrol(m);
    return {cal1:cal1, cal2:S.calendar.length, blood1:blood1, blood2:S.blood.length};
  })()`);
  // oyuncu ölümü iki kez
  const r2 = ev(`(function(){
    S.throne={dead:false,weeksEmpty:0}; S.calendar=[]; S.blood=[];
    oyuncuDustu(); var a={cal:S.calendar.length,blood:S.blood.length,dead:S.throne.dead};
    oyuncuDustu(); var b={cal:S.calendar.length,blood:S.blood.length};
    return {a:a,b:b};
  })()`);
  if (r2.a.cal !== r2.b.cal || r2.a.blood !== r2.b.blood) not("ÇAKIŞMA: oyuncuDustu() iki kez çağrılınca zincir tekrarlıyor");
  // taziye kaçırma + oyuncu ölümü aynı anda iki kan davası açıyor mu (beklenen: ayrı ayrı, sorun değil)
  console.log("[3] ölüm zinciri: adam-ölüm tekrar=" + JSON.stringify(r) + " oyuncu-ölüm koruma=" + (r2.a.cal === r2.b.cal ? "OK" : "BOZUK"));
}

// ---------- 4) MIGRATE / ESKİ KAYIT ----------
{
  const g = loadGame(); const { ev } = g;
  const kayitlar = {
    "rev15 (lig yok, people yok)": { kind:"racon_v1", week:9, day:5, kasa:41000, dosya:33, stage:"delikanli", lakap:"Kısa",
      streetHome:"st_fevzi", rep:{korku:22,saygi:31,nam:18,racon:64},
      men:[{id:"m_a",ad:"Ali",rol:"ayakci",gonul:55,yevmiye:400,durum:"hazir"}],
      streets:[{id:"st_fevzi",ad:"Fevzi Paşa",sahip:"sen",heat:25}], jobs:[], evidence:[], inbox:[], calendar:[], defter:[] },
    "rev20 (scout/people var, throne yok)": { kind:"racon_v1", week:22, day:2, kasa:88000, dosya:51, stage:"kabadayi", lakap:"Uzun",
      streetHome:"st_fevzi", rep:{korku:55,saygi:48,nam:44,racon:52}, dirtyKasa:60000, cleanKasa:28000, aklamaKapasite:2000,
      men:[{id:"m_b",ad:"Veli",rol:"kirici",gonul:40,yevmiye:600,durum:"yorgun",yorgunluk:70,hidden:{sinir:5}}],
      streets:[{id:"st_fevzi",ad:"Fevzi Paşa",sahip:"sen",heat:60},{id:"st_carsamba",ad:"Çarşamba",sahip:"rakip",heat:30}],
      people:[{id:"p_berber",ad:"Necati",kind:"berber",rel:5,mods:[],favor:1,kilitli:false}],
      scout:[{subjectKind:"rival",subjectId:"rival_kartallar",band:2,week:20}],
      rivals:[{id:"rival_kartallar",ad:"Kartallar",husumet:62,band:"surtusme",agresiflik:50,streetsClaimed:["st_carsamba"]}],
      jobs:[], evidence:[], inbox:[], calendar:[], defter:[], blood:[] },
    "rev25 (blood/amcaHedef var, kefil/plaka yok)": { kind:"racon_v1", week:40, day:7, kasa:150000, dosya:70, stage:"kabadayi", lakap:"Baba",
      streetHome:"st_fevzi", rep:{korku:71,saygi:40,nam:66,racon:38}, dirtyKasa:90000, cleanKasa:60000,
      blood:[{id:"bl_1",rivalOrFamily:"aile",weekDue:38,status:"acik"}],
      amcaHedef:{text:"eski hedef",weekDue:44,ok:undefined},
      throne:{dead:false,weeksEmpty:0},
      men:[{id:"m_c",ad:"Kadir",rol:"gozcu",gonul:30,yevmiye:500,durum:"hapis",hapisLeft:4,hizip:"genc"}],
      streets:[{id:"st_fevzi",ad:"Fevzi Paşa",sahip:"sen",heat:80,terorMahalle:55,sadakatMahalle:40}],
      jobs:[], evidence:[], inbox:[], calendar:[], defter:[], senet:[] },
    "bozuk (yanlış tipler)": { kind:"racon_v1", week:"beş", day:null, kasa:"çok", dosya:{}, men:"yok", streets:null,
      rep:"iyi", inbox:undefined, calendar:0, blood:"x", throne:"x", people:5, scout:"y" }
  };
  for (const [ad, k] of Object.entries(kayitlar)) {
    let m;
    try { m = ev("migrate(" + JSON.stringify(k) + ")"); }
    catch (e) { not("MIGRATE[" + ad + "] PATLADI: " + e.message); continue; }
    const out = []; deepScan(m, "S", out);
    if (out.length) not("MIGRATE[" + ad + "] bozuk değer: " + out.slice(0, 5).join(" | "));
    // migrate sonrası oynatılabiliyor mu
    try {
      ev(`S = migrate(${JSON.stringify(k)}); enterPlay(); S.seed=777; UI.fastJob=true;`);
      for (let i = 0; i < 14; i++) { ev("S.busy=false;UI.threatOk=true;UI.sahne=false;UI.modal=null;"); ev("doAdvance()"); }
      const out2 = []; deepScan(ev("S"), "S", out2);
      if (out2.length) not("MIGRATE[" + ad + "] 14 gün sonra bozuk: " + out2.slice(0, 4).join(" | "));
      for (const s of ["olaylar","adamlar","harita","kasa","husumet","emniyet"]) {
        const h = ev(`(function(){S.screen=${JSON.stringify(s)};try{return screenHtml();}catch(e){return "HATA:"+e.message;}})()`);
        if (/^HATA:/.test(h)) not("MIGRATE[" + ad + "] " + s + " çizilemedi: " + h);
      }
    } catch (e) { not("MIGRATE[" + ad + "] oynatma ÇÖKTÜ: " + e.message); }
  }
  console.log("[4] migrate: 4 eski kayıt senaryosu (rev15/20/25/bozuk) x 14 gün");
}

// ---------- 5) BLOK 0 SERT YASALAR ----------
{
  const g = loadGame(); const { ev } = g;
  const src = (await import("node:fs")).readFileSync("public/games/racon/index.html", "utf8");
  const scriptSrc = src.match(/<script>([\s\S]*)<\/script>/)[1];
  const kodsuzYorum = scriptSrc.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
  if (/Math\.random\s*\(/.test(kodsuzYorum)) not("YASA 10: Math.random() kullanılıyor");
  // korku/saygı cap
  ev('blank("S"); enterPlay(); S.seed=11;');
  const cap = ev(`(function(){
    S.rep.korku=69;S.rep.saygi=95;addRep("korku",10);
    var a={k:S.rep.korku,s:S.rep.saygi};
    S.rep.korku=95;S.rep.saygi=69;addRep("saygi",10);
    var b={k:S.rep.korku,s:S.rep.saygi};
    return {a:a,b:b};
  })()`);
  if (cap.a.s !== 94) not("YASA 5: korku artınca saygıdan 1 düşmedi (saygı=" + cap.a.s + ")");
  if (cap.b.k !== 94) not("YASA 5: saygı artınca korkudan 1 düşmedi (korku=" + cap.b.k + ")");
  // dört itibar ayrı mı
  const rep = ev("Object.keys(S.rep).sort().join(',')");
  if (rep !== "korku,nam,racon,saygi") not("YASA 4: dört itibar barı beklenen şekilde değil: " + rep);
  // yasak kelime — tüm ekranlar birkaç durumda
  const yasak = /(\blig\b|fikstür|fikstur|\bmaç\b|puan tablosu|sıradaki maç|\bXP\b|\bseviye\b|\blevel\b|beklenen gol|konfeti)/i;
  for (const durum of ['', 'oyuncuDustu();', 'S.dosya=100;S.rep.korku=90;', 'S.blood.push({id:"b",rivalOrFamily:"x",weekDue:S.week,status:"acik",evre:0});']) {
    ev('blank("S"); enterPlay(); S.seed=12;' + durum);
    for (const s of ["olaylar","takvim","adamlar","harita","isler","pazar","emlak","hayat","emniyet","husumet","kasa","siralama"]) {
      const h = ev(`(function(){S.screen=${JSON.stringify(s)};try{return screenHtml();}catch(e){return "HATA:"+e.message;}})()`);
      if (/^HATA:/.test(h)) { not("YASA[render] " + s + " (" + durum.slice(0,20) + "): " + h); continue; }
      const t = String(h).replace(/<[^>]*>/g, " ");
      const mm = t.match(yasak);
      if (mm) not("YASA 'yasak kelime': '" + mm[0] + "' → " + s + " (" + (durum || "yeni oyun") + ")");
    }
  }
  console.log("[5] Blok 0 yasaları: Math.random / korku-saygı cap / 4 itibar / yasak kelime x 4 durum x 12 ekran");
}

console.log("\n=== BULGULAR (" + bulgular.length + ") ===");
bulgular.forEach((b, i) => console.log((i + 1) + ") " + b));

// ---------- 6) DERİN ÇAKIŞMA / AKIŞ TESTLERİ ----------
{
  const g = loadGame(); const { ev } = g;
  // A) aynı anda çoklu ölüm
  ev('blank("S"); enterPlay(); S.seed=9001; S.calendar=[]; S.blood=[];');
  const coklu = ev(`(function(){
    var canli = S.men.filter(function(m){return m.durum!=="olu";});
    canli.forEach(function(m){ m.durum="olu"; bagOlumTepki(m); lakapHirsizligiKontrol(m); });
    return {olen:canli.length, cal:S.calendar.length, canliKalan:S.men.filter(function(m){return m.durum!=="olu";}).length};
  })()`);
  // B) kadro boşken halef
  const bosHalef = ev(`(function(){
    S.throne={dead:true,weeksEmpty:2,heirId:undefined}; S.flags.oyunSonu="";
    S.men.forEach(function(m){m.durum="olu";});
    throneTick();
    return {oyunSonu:S.flags.oyunSonu, dead:S.throne.dead, heir:S.throne.heirId||null};
  })()`);
  if (bosHalef.oyunSonu !== "hanedan") not("ÇAKIŞMA: kadro boşken halef ataması oyun sonu vermedi (" + JSON.stringify(bosHalef) + ")");
  // C) boş taht → 3 hafta advance → halef, sonra normal devam
  ev('blank("S"); enterPlay(); S.seed=4242; UI.fastJob=true;');
  const tahtAkis = ev(`(function(){
    oyuncuDustu();
    var log=[];
    for (var i=0;i<28;i++){ S.busy=false;UI.threatOk=true;UI.sahne=false;UI.modal=null; doAdvance(); }
    return {dead:S.throne.dead, heir:!!S.throne.heirId, lakap:S.lakap, oyunSonu:S.flags.oyunSonu,
      kadro:S.men.length, hafta:S.week};
  })()`);
  if (tahtAkis.dead) not("ÇAKIŞMA: 4 hafta advance sonrası taht hâlâ boş");
  if (!tahtAkis.heir && !tahtAkis.oyunSonu) not("ÇAKIŞMA: boş taht bitti ama halef yok, oyun sonu da yok");
  // D) kasa negatife düşüyor mu (uzun sim)
  ev('blank("S"); enterPlay(); S.seed=777; UI.fastJob=true;');
  const kasaMin = ev(`(function(){
    var min=S.kasa;
    for (var i=0;i<420;i++){
      S.busy=false;UI.threatOk=true;UI.sahne=false;UI.modal=null;
      if (rng()<0.3) S.kasa = Math.max(0, S.kasa - ri(1000,9000));
      doAdvance();
      if (S.kasa<min) min=S.kasa;
    }
    return min;
  })()`);
  if (kasaMin < 0) not("EKONOMİ: kasa negatife düştü (" + kasaMin + ")");
  // E) aynı iş iki kez finishJob
  ev('blank("S"); enterPlay(); S.seed=13; UI.fastJob=true;');
  const ciftBitir = ev(`(function(){
    var m=S.men[0]; var j={id:nid("j"),kind:"tahsilat",streetId:S.streetHome,prepLeft:0,assigned:[m.id],tags:[],phase:"running",tickIndex:0};
    S.jobs.push(j); UI.jobId=j.id; UI.jobOrders=["sessiz"];
    var k1=S.kasa; finishJob(); var k2=S.kasa; finishJob(); var k3=S.kasa;
    return {ilk:k2-k1, ikinci:k3-k2, phase:j.phase};
  })()`);
  if (ciftBitir.ikinci !== 0) not("ÇAKIŞMA: aynı iş iki kez bitirilince para tekrar veriyor (+" + ciftBitir.ikinci + ")");
  // F) advance süresi (sonsuz döngü kontrolü)
  ev('blank("S"); enterPlay(); S.seed=5; UI.fastJob=true;');
  const t0 = Date.now();
  ev('for (var i=0;i<200;i++){S.busy=false;UI.threatOk=true;UI.sahne=false;UI.modal=null;doAdvance();}');
  const ms = Date.now() - t0;
  if (ms > 8000) not("PERFORMANS: 200 gün " + ms + "ms sürdü (sonsuz döngü şüphesi)");
  // G) ekran matrisi: 8 NAV x 5 durum
  const durumlar = {
    "yeni oyun": '',
    "ölüm sonrası": 'S.men.forEach(function(m){m.durum="olu";});',
    "boş taht": 'oyuncuDustu();',
    "kan davası açık": 'S.blood.push({id:"bx",rivalOrFamily:"aile",weekDue:S.week,status:"acik",evre:1});',
    "dosya kritik": 'S.dosya=99;S.rep.korku=88;S.streets.forEach(function(s){s.terorMahalle=90;s.muhurLeft=1;});'
  };
  let ekranSay = 0;
  for (const [ad, kur] of Object.entries(durumlar)) {
    ev('blank("S"); enterPlay(); S.seed=99;' + kur);
    for (const s of ["olaylar","takvim","adamlar","harita","isler","emniyet","husumet","kasa"]) {
      const h = ev(`(function(){S.screen=${JSON.stringify(s)};try{return screenHtml();}catch(e){return "HATA:"+e.message;}})()`);
      ekranSay++;
      if (/^HATA:/.test(h)) { not("RENDER[" + ad + "] " + s + ": " + h); continue; }
      const t = String(h).replace(/<[^>]*>/g, " ");
      if (/undefined|NaN|\[object Object\]/.test(t)) {
        const mm = t.match(/.{0,45}(undefined|NaN|\[object Object\]).{0,25}/);
        not("RENDER[" + ad + "] " + s + " bozuk metin: " + (mm ? mm[0].trim() : ""));
      }
    }
  }
  console.log(`[6] derin akış: çoklu ölüm=${JSON.stringify(coklu)} · boşTaht→halef=${JSON.stringify(tahtAkis)} · kasaMin=${kasaMin} · 200gün=${ms}ms · ${ekranSay} ekran render`);
}

console.log("\n=== TOPLAM BULGU: " + bulgular.length + " ===");
bulgular.slice(0).forEach((b, i) => console.log((i + 1) + ") " + b));
