import { managementDesk, managementDeck } from "../../shared/management-desk.js";

// Display translations for labels exposed by the new compact desk. Canonical
// event/catalog text and persisted records remain unchanged.
const labels = {
  "Ürün, hizmet ve deneyim": "Products, services and experiences",
  "Tüketim burada. Finans yalnız kasa, borç ve yatırımdır. Riskli alışveriş yasal market gibi durmaz.": "Consumption belongs here. Finance contains cash, debt and investments. Risky purchases are distinct from legal shopping.",
  "Kategori": "Category", "Günlük yaşam": "Daily life", "Kişisel bakım": "Personal care",
  "Ev kolaylığı": "Home convenience", "Hediye": "Gift", "Eğlence": "Entertainment",
  "Ev eğlencesi": "Home entertainment", "Hobi": "Hobbies", "18+ sosyal yaşam": "18+ social life",
  "Seyahat": "Travel", "Günlük": "Daily", "Giyim / Statü": "Clothing / Status",
  "Teknoloji": "Technology", "Ev": "Home", "Ulaşım": "Commute", "Sağlık / Spor": "Health / Sport",
  "Yetişkin / Gece": "Adult / Nightlife", "Riskli / Yasadışı": "Risky / Illegal", "Hediyeler": "Gifts",
  "Çalışma hayatı": "Working life", "Çalışma durumu": "Employment status", "Aylık maaş": "Monthly salary",
  "Maaş": "Salary", "İş yükü": "Workload", "Güvence": "Security", "Emeklilik": "Retirement",
  "Henüz uygun değil": "Not yet eligible", "Emeklilik değerlendirmesi 60 yaşından sonra açılır.": "Retirement assessment becomes available after age 60.",
  "Ev ve iş yakın; haftalık ek ulaşım yükü yok.": "Home and work are close; no extra weekly commute burden.",
  "Aktif iş": "Current job", "İş alanı": "Career field", "Alan": "Field", "Hizmet": "Service",
  "Haftalık etki": "Weekly effect", "Deneme süresi": "Probation", "Gereksinim": "Requirements",
  "Gereksinim yok": "No requirements", "Teklifi kabul et": "Accept offer", "İş fırsatları": "Job opportunities",
  "Deneyim": "Experience", "Performans": "Performance", "Eğitim düzeyi": "Education level",
  "Birikmiş deneyim": "Accumulated experience", "Kariyer bandı": "Career band", "Mevcut işten ayrıl": "Leave current job",
  "Çevre": "Social circle", "Önemli kişiler": "Key people", "Kişi dosyası": "Person file",
  "Son önemli anılar": "Recent meaningful memories", "Gerilim": "Tension", "Arkadaş": "Friend",
  "Yakınlık bağın gücünü, güven sana duyulan inancı, gerilim ise aranızdaki sürtüşmeyi gösterir.": "Closeness measures the bond, trust measures confidence in you, and tension measures friction between you.",
  "Bir sosyal etkileşim haftalık karar hakkı kullanır.": "A social interaction uses a weekly decision.",
  "Aile evi sosyal planlar için daha fazla koordinasyon istiyor.": "Living with family requires more coordination for social plans.",
  "Eğitim hayatı": "Education", "Eğitim programları": "Education programs", "Programlar": "Programs",
  "Kayıt ücreti": "Enrollment fee", "Aylık ücret": "Monthly tuition", "Süre": "Duration",
  "Tam zamanlı": "Full-time", "Yarı zamanlı": "Part-time", "Seviye": "Level",
  "Fiziksel ve zihinsel durum": "Physical and mental condition", "Genel durum": "Overall condition",
  "Bilinen durumlar": "Known conditions", "Ulaşım yükü": "Commute burden", "Eğitim yükü": "Study burden",
  "Bilinen kalıcı bir durum yok.": "No known lasting condition.", "Yok": "None",
  "Hayat merkezi": "Life desk", "Bu hafta": "This week", "Haftanın öncelikleri": "Weekly priorities",
  "Hayat kayıtları": "Life records", "Tamamlanan yıllar": "Completed years", "Yıl özetleri": "Annual summaries",
  "İlk yıl tamamlandığında burada bir dosya oluşacak.": "A file will appear here when the first year ends.",
};
const english = new Map(Object.entries(labels).map(([tr, en]) => [tr.toLocaleLowerCase("tr"), en]));
export function deskEnglish(value) {
  const trimmed = value.trim();
  const exact = english.get(trimmed.toLocaleLowerCase("tr"));
  if (exact) return value.replace(trimmed, exact);
  return value.replace(/Otomatik kaydedildi\./g, "Autosaved.")
    .replace(/Elle kaydedildi\./g, "Saved manually.")
    .replace(/(\d+)\. ay \/ H(\d+)/g, "month $1 / W$2")
    .replace(/Son anlamlı temas (\d+) hafta önce/g, "Last meaningful contact $1 weeks ago")
    .replace(/(\d+) hafta · Düzenli vardiya/g, "$1 weeks · Regular shifts")
    .replace(/Aile Yanında ulaşımı/g, "Commute from family home")
    .replace(/\bEnerji /g, "Energy ").replace(/\bStres /g, "Stress ")
    .replace(/yakınlık ([+−\-]?\d+)/g, "closeness $1").replace(/güven ([+−\-]?\d+)/g, "trust $1");
}
function translateDesk(root) {
  const walker = root.ownerDocument.createTreeWalker(root, 4);
  while (walker.nextNode()) walker.currentNode.nodeValue = deskEnglish(walker.currentNode.nodeValue);
}

// Only public rendered nodes cross this boundary: no hidden people data,
// simulation state, action dispatch or save function is passed to the desk.
export function arrangeLifeDesk(view, text) {
  const layout = document.querySelector(".game-body");
  const workspace = layout?.querySelector(".workspace");
  if (!workspace) return;
  if (document.documentElement.lang === "en" || window.tlabI18n?.getLang?.() === "en") translateDesk(document.querySelector(".game-frame"));
  const operations = document.querySelector(".game-topbar");
  const week = workspace.querySelector(".week-control");
  if (week && operations) operations.append(week);
  const selectors = {
    career: ".option-card",
    education: ".option-card",
    home: ".option-card",
    market: ".wealth-grid > button",
    finance: ".wealth-grid > *, .open-case",
    people: ".person-detail",
    relationships: ".panel",
    dashboard: ".overview-grid > .panel, .agenda-panel, .people-panel, .cases-panel",
    body: ".panel",
    calendar: ".panel",
    character: ".panel",
    history: ".memory",
    yearbook: ".open-case",
  };
  const history = [...workspace.querySelectorAll(".history-panel, .career-history")];
  if (view === "finance") {
    const panels = [...workspace.querySelectorAll(".panel")];
    // Existing transaction and investment reports keep their full entries,
    // amounts and cost basis. No fictitious running balance is reconstructed.
    history.push(...panels.filter(panel => panel.querySelector(".history")));
  }
  managementDeck(layout, history, text("KAYIT / HESAP DÖKÜMÜ", "RECORD / ACCOUNT LEDGER"));
  managementDesk({ workspace, layout, key: `life:${view}`, selector: selectors[view] || ".panel", text, searchSelector: view === "people" ? ".person-select" : undefined });
}
