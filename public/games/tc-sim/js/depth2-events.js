import { getNextCareerStep } from "./life.js?v=5";
import { getStartingProfileId } from "./state.js?v=5";

export const DEPTH2_EVENTS = [
  {
    id: "career_promotion_window",
    repeat: "cooldown",
    cooldownWeeks: 52,
    title: "Bir üst pozisyon konuşuluyor",
    text: "İş yerinde daha fazla sorumluluk alabileceğin bir pozisyon açıldı. Kararını bu dönem netleştirmen bekleniyor.",
    condition: (state) => Boolean(getNextCareerStep(state)) && state.career.weeksInRole >= 20 && state.career.performance + Math.floor(((state.player.tendencies?.discipline || 50) - 50) / 10) >= (getStartingProfileId(state) === "ambitious" ? 58 : 62) && !state.flags.depth2PromotionPending,
    choices: [
      { id: "accept", label: "Değerlendirmeye gir", effects: { health: { energy: -4, stress: 5 }, memory: "Bir üst pozisyon için değerlendirmeye girdin." } },
      { id: "decline", label: "Şimdilik bekle", effects: { health: { stress: -2 }, memory: "Terfi fırsatını şimdilik beklettin." } },
    ],
  },
  {
    id: "career_promotion_review",
    repeat: "repeatable",
    title: "Terfi değerlendirmesi",
    text: "Üstlendiğin sorumlulukların ardından yöneticin son kararını vermek üzere seni dinliyor.",
    condition: () => false,
    choices: [
      { id: "advance", label: "Yeni tempoyu kabul et", effects: { health: { energy: -5, stress: 6 }, memory: "Terfi değerlendirmesinde yeni tempoyu kabul ettin." } },
      { id: "steady", label: "Mevcut tempoda kal", effects: { health: { stress: -4 }, memory: "Terfi değerlendirmesinde mevcut tempoda kaldın." } },
    ],
  },
  {
    id: "family_expectation_window",
    repeat: "cooldown",
    cooldownWeeks: 44,
    title: "Ailenin senden beklentisi",
    text: "Aile içinde bir süredir ertelenen iş için senden bu ay açık bir söz isteniyor.",
    condition: (state) => state.household.homeId === "family" && state.time.absoluteWeek >= (state.player.background?.family === "demanding" ? 20 : 28) && state.relationships.anne >= 45 && !state.flags.familyExpectationOpen,
    choices: [
      { id: "commit", label: "Bu ay ilgileneceğine söz ver", effects: { health: { stress: 3 }, flags: { familyExpectationOpen: true }, memory: "Ailenin bir işini bu ay üstlenmeye söz verdin." } },
      { id: "decline", label: "Şimdi üstlenemem de", effects: { health: { stress: 4 }, memory: "Ailenin beklentisini bu ay karşılayamayacağını söyledin." } },
    ],
  },
  {
    id: "family_expectation_followup",
    repeat: "repeatable",
    title: "Verdiğin aile sözü",
    text: "Ailene verdiğin sözün zamanı geldi. İş ve ev planını buna göre tamamlayıp tamamlamadığın soruluyor.",
    condition: () => false,
    choices: [
      { id: "kept", label: "Sözünü yerine getir", effects: { health: { energy: -5, stress: -2 }, flags: { familyExpectationOpen: null }, memory: "Ailene verdiğin sözü yerine getirdin." } },
      { id: "broken", label: "Bu kez yetişmedi de", effects: { health: { stress: 6 }, flags: { familyExpectationOpen: null }, memory: "Ailene verdiğin sözü bu kez tutamadın." } },
    ],
  },
  {
    id: "money_relief_choice",
    repeat: "cooldown",
    cooldownWeeks: 60,
    title: "Kısa vadeli para rahatlığı",
    text: "Ay sonu yaklaşırken masrafları kapatmanın bir yolu var; ancak geri ödeme için tarih koyman gerekecek.",
    condition: (state) => state.finances.balance < (state.player.tendencies?.frugality >= 60 ? 1400 : 1800) && state.household.homeId === "family" && !state.flags.moneyReliefOpen,
    choices: [
      { id: "borrow", label: "Geçici borç al", effects: { money: 1000, flags: { moneyReliefOpen: true }, memory: "Ay sonunu geçirmek için geçici borç aldın.", reason: "Geçici aile borcu" } },
      { id: "cut", label: "Harcamayı kıs", effects: { health: { stress: 8 }, memory: "Ay sonunu geçirmek için harcamalarını kıstın." } },
    ],
  },
  {
    id: "money_relief_due",
    repeat: "repeatable",
    title: "Geçici borcun günü",
    text: "Aldığın geçici desteğin geri ödeme tarihi geldi. Bu konuşma daha fazla ertelenemiyor.",
    condition: () => false,
    choices: [
      { id: "repay", label: "₺1.000 geri öde", effects: { health: { stress: 2 }, flags: { moneyReliefOpen: null }, memory: "Geçici borcunu geri ödedin." } },
      { id: "delay", label: "Biraz daha süre iste", effects: { health: { stress: 5 }, flags: { moneyReliefOpen: null }, memory: "Geçici borcun geri ödemesini erteledin." } },
    ],
  },
  {
    id: "secret_confrontation",
    repeat: "cooldown",
    cooldownWeeks: 40,
    title: "Evde konuşulmayan mesele",
    text: "Aile evinde kişisel alanınla ilgili bir konunun üstü kapalı biçimde açıldı. Ne kadarını paylaşacağına karar vermelisin.",
    condition: (state) => state.household.homeId === "family" && state.time.absoluteWeek >= 16 && Boolean(state.secrets.find((secret) => secret.id === "family-home-privacy" && secret.status === "hidden")),
    choices: [
      { id: "open", label: "Açıkça konuş", effects: { health: { stress: -3 }, memory: "Aile evindeki kişisel alan meselesini açıkça konuştun." } },
      { id: "protect", label: "Kendine sakla", effects: { health: { stress: 3 }, memory: "Kişisel alanınla ilgili meseleyi kendine sakladın." } },
    ],
  },
  {
    id: "military_window",
    repeat: "once",
    title: "Askerlik yükümlülüğü",
    text: "Yükümlülük durumun için bir karar penceresi açıldı. Eğitim ya da iş planını buna göre düzenleyebilirsin.",
    condition: (state) => state.military?.applicable && state.military.status === "pending" && state.time.absoluteWeek >= 24 && state.time.absoluteWeek <= (state.military.dueWeek || 96),
    choices: [
      { id: "defer", label: "Eğitim/iş için ertele", effects: { health: { stress: 3 }, flags: { militaryDeferred: true }, memory: "Askerlik yükümlülüğünü eğitim ve iş planın için erteledin." } },
      { id: "plan", label: "Hizmeti planla", effects: { health: { stress: 7 }, flags: { militaryPlanned: true }, memory: "Askerlik hizmetini planına aldın." } },
    ],
  },
  {
    id: "education_path_window",
    repeat: "once",
    title: "Eğitim için son uygun dönem",
    text: "Mevcut koşulların bir eğitim programına başlamak için uygun görünüyor; bu yıl karar vermen gerekiyor.",
    condition: (state) => state.time.absoluteWeek >= 8 && state.time.absoluteWeek <= 40 && state.education.active === null && state.education.level === "lise",
    choices: [
      { id: "consider", label: "Eğitim seçeneklerini incele", effects: { health: { stress: -2 }, flags: { educationWindowSeen: true }, memory: "Eğitim seçeneklerini bu yıl değerlendirmeye aldın." } },
      { id: "work", label: "Şimdilik işe odaklan", effects: { health: { stress: 2 }, flags: { educationWindowDeferred: true }, memory: "Bu yıl eğitim yerine işe odaklanmayı seçtin." } },
    ],
  },
  {
    id: "education_window_followup",
    repeat: "repeatable",
    title: "Eğitim kararının son tarihi",
    text: "İncelediğin eğitim seçeneği için kayıt dönemi kapanmadan karar vermen gerekiyor.",
    condition: () => false,
    choices: [
      { id: "pursue", label: "Kayıt için plan yap", effects: { health: { stress: 2 }, flags: { educationWindowCommitted: true }, memory: "Eğitime kayıt için plan yaptın." } },
      { id: "postpone", label: "Bu dönemi kaçır", effects: { health: { stress: 3 }, flags: { educationWindowExpired: true }, memory: "Eğitim kaydını bu dönem erteledin." } },
    ],
  },
  {
    id: "comparison_circle_update",
    repeat: "cooldown",
    cooldownWeeks: 52,
    title: "Çevrendeki yollar",
    text: "Eski tanıdıklarının hayatından haberler geldi. Kendi yönünü başkalarının temposuyla karıştırmadan düşünmen gerekiyor.",
    condition: (state) => state.comparisonCircle?.milestones?.length > 0 && state.flags.lastComparisonWeek !== state.time.absoluteWeek,
    choices: [
      { id: "reflect", label: "Kendi önceliklerine dön", effects: { health: { stress: -2 }, flags: { lastComparisonWeek: null }, memory: "Başkalarının temposunu kendi önceliklerinle karıştırmamaya karar verdin." } },
      { id: "follow", label: "Onların temposunu yakalamaya çalış", effects: { health: { stress: 4 }, flags: { lastComparisonWeek: null }, memory: "Çevrendekilerin temposuna yetişmeye çalıştın." } },
    ],
  },
  {
    id: "job_security_warning",
    repeat: "cooldown",
    cooldownWeeks: 36,
    title: "İşte güven sarsıldı",
    text: "Son haftalardaki performansın ve yorgunluğun yöneticinin dikkatini çekti. İşini korumak için bir tercih yapmalısın.",
    condition: (state) => state.career.jobId !== null && (state.career.performance <= (state.player.tendencies?.risk >= 60 ? 30 : 35) || state.health.health <= 30),
    choices: [
      { id: "recover", label: "Bir hafta toparlanmaya odaklan", effects: { health: { energy: 8, stress: -10 }, flags: { jobSecurityRecovery: true }, memory: "İşini korumak için toparlanmaya odaklandın." } },
      { id: "push", label: "Tempoyu sürdür", effects: { health: { energy: -8, stress: 8, health: -2 }, flags: { jobSecurityRisk: true }, memory: "İş baskısına rağmen tempoyu sürdürdün." } },
    ],
  },
  {
    id: "job_security_review",
    repeat: "repeatable",
    title: "İş güvenliği değerlendirmesi",
    text: "Önceki uyarının ardından performansın hâlâ düşük. İşini korumak için son bir toparlanma fırsatın var.",
    condition: () => false,
    choices: [
      { id: "recover", label: "Toparlanma planını sürdür", effects: { health: { stress: -3 }, flags: { jobSecurityRecovery: true }, memory: "İşini korumak için toparlanma planını sürdürdün." } },
      { id: "accept_risk", label: "Riski kabul et", effects: { health: { stress: 4 }, flags: { jobSecurityRisk: true }, memory: "İş güvenliği riskini kabul ettin." } },
    ],
  },
  {
    id: "privacy_context_event",
    repeat: "cooldown",
    cooldownWeeks: 48,
    title: "Kişisel alan ihtiyacı",
    text: "İş, aile ve özel hayat aynı haftaya sıkıştı. Bir sınır çizmezsen herkes senden biraz daha isteyecek.",
    condition: (state) => state.household.homeId === "family" && state.health.stress >= 55 && state.time.absoluteWeek >= 20,
    choices: [
      { id: "boundary", label: "Kendine bir akşam ayır", effects: { health: { stress: -8, energy: 4 }, memory: "Yoğun haftada kendine ait bir akşam ayırdın." } },
      { id: "available", label: "Herkese yetişmeye çalış", effects: { health: { energy: -5, stress: 6 }, memory: "Yoğun haftada herkese yetişmeye çalıştın." } },
    ],
  },
];

for (const definition of DEPTH2_EVENTS) definition.depth2 = true;
