import { addNpcMemory, addMemory, adjustHealth } from "./state.js?v=5";
import { applyRelationshipDelta } from "./social.js?v=5";
import { createSecret, transferSecret, isSecretKnownTo } from "./depth2-systems.js?v=5";
import { HEALTH_CHAIN_REGISTRY, acknowledgeBodyWarning, getBodyCareContext, getKnownBodyConditions, reassessBodyCondition, scheduleHealthChain } from "./body-systems.js?v=5";

const choice = (id, label, stress = 0) => ({ id, label, effects: { health: { stress } } });
const delayed = (id, chainId, title, text) => ({ id, chainId, title, text, condition: () => false, choices: [choice("review", "Durumu değerlendir")] });
export const BODY_EVENTS = [
  { id: "health_overload_review", chainId: "CHN-H01", title: "Bedenin yükü", text: "Son haftalardaki çalışma temposu bedeninde birikiyor. Birkaç hafta sonra gidişata yeniden bakacaksın.", condition: () => false, repeat: "cooldown", cooldownWeeks: 16, choices: [choice("slow", "Temponu düşür ve takip planla", -3), choice("continue", "Aynı tempoda devam et", 3)] },
  { id: "health_recovery_review", chainId: "CHN-H02", title: "Toparlanma eksikliği", text: "Ek mesai yapmasan da günlük yüklerden toparlanmaya zaman kalmayabilir. Önündeki haftaları düşün.", condition: () => false, repeat: "cooldown", cooldownWeeks: 16, choices: [choice("care", "Toparlanma için zaman ve takip planla", -4), choice("ignore", "Şimdilik önemseme", 4)] },
  { id: "health_inactivity_review", chainId: "CHN-H03", title: "Hareketsizlik sinyali", text: "Uzun süredir hareket için alan açmadın. Önündeki haftalarda bu döngüyü değiştirebilirsin.", condition: () => false, repeat: "cooldown", cooldownWeeks: 16, choices: [choice("move", "Hareket için zaman ve takip planla", -3), choice("ignore", "Böyle devam et", 2)] },
  { id: "health_support_disclosure", chainId: "CHN-H04", title: "Yakınından destek", text: "Bilinen beden durumunu Anne'ne anlatabilir veya kendine saklayabilirsin.", repeat: "cooldown", cooldownWeeks: 24, condition: (state) => getKnownBodyConditions(state).some((item) => ["active", "chronic"].includes(item.status)) && !state.openCases.some((item) => item.chainId === "CHN-H04" && item.status !== "resolved"), choices: [choice("tell", "Anne'ne anlat", -3), choice("hide", "Kendine sakla", 2)] },
  delayed("health_overload_outcome", "CHN-H01", "Çalışma temposunun ardından", "Geçen haftalardaki çalışma ve toparlanma düzeninin sonucuna bakıyorsun."),
  delayed("health_recovery_outcome", "CHN-H02", "Toparlanma takibi", "Günlük yükler arasında toparlanmaya ayırdığın zamanı değerlendiriyorsun."),
  delayed("health_inactivity_outcome", "CHN-H03", "Hareket düzeninin ardından", "Hareket için açtığın alanın yeterli olup olmadığına bakıyorsun."),
  delayed("health_support_callback", "CHN-H04", "Destek kararının ardından", "Beden durumunla ilgili paylaşım kararına yeniden bakıyorsun."),
];

export function getBodyEventContext(state, definition) {
  return ["health_overload_review", "health_recovery_review"].includes(definition?.id) ? getBodyCareContext(state) : "";
}

export function applyBodyResolution(state, definition, choiceId, sourceCase = null) {
  const chain = Object.values(HEALTH_CHAIN_REGISTRY).find((item) => item.id === definition?.chainId);
  if (!chain) return;
  if (sourceCase) sourceCase.status = "resolved";
  if (definition.id === chain.warning) {
    if (chain.id === "CHN-H04") {
      const secret = createSecret(state, { id: "body-support", type: "health", summary: "Günlük temposunu etkileyen bilinen beden durumu", knownBy: ["player"], hiddenFrom: ["anne"], sourceEvent: definition.id });
      if (choiceId === "tell") {
        transferSecret(state, secret.id, "anne");
        const supportive = state.player.background?.family === "supportive";
        applyRelationshipDelta(state, "anne", { trust: supportive ? 4 : 2, tension: supportive ? -3 : -1 });
        addNpcMemory(state, "anne", supportive ? "Bedenindeki yükü anlattı; dinlenmesine alan açmayı konuştuk." : "Bedenindeki yükü anlattı; evdeki sorumluluklarla birlikte nasıl toparlanacağını konuştuk.", "health_support");
      }
      scheduleHealthChain(state, chain.id, chain.followup, 3, { playerKnown: choiceId === "tell", disclosed: choiceId === "tell", personId: "anne", secretId: secret.id });
    } else {
      // Her seçim uyarının alındığını gösterir; önemsememek bağışıklık vermez.
      acknowledgeBodyWarning(state);
      scheduleHealthChain(state, chain.id, chain.followup, 4, { playerKnown: ["slow", "care", "move"].includes(choiceId) });
    }
    return;
  }
  if (chain.id === "CHN-H04") {
    if (sourceCase?.payload?.disclosed && isSecretKnownTo(state, sourceCase.payload.secretId, "anne")) {
      const recovering = !getKnownBodyConditions(state).some((item) => ["active", "chronic"].includes(item.status));
      applyRelationshipDelta(state, "anne", recovering ? { trust: 2, tension: -2 } : { closeness: 2 });
      addNpcMemory(state, "anne", recovering ? "Konuşmamızın ardından toparlanmaya alan açtığını anlattı." : "Bedenindeki yük sürerken nasıl destek olabileceğimi yeniden konuştuk.", "health_callback");
      addMemory(state, recovering ? "Anne'yle konuştuğun toparlanma planında ilerleme oldu." : "Anne'nin desteği sürüyor; bedenindeki yük için hâlâ zaman ayırman gerekiyor.", "important");
    } else addMemory(state, "Beden durumunu paylaşmamayı seçtin; toparlanma planını kendin değerlendiriyorsun.");
  } else {
    const formed = reassessBodyCondition(state, chain.id);
    adjustHealth(state, formed ? { energy: -3 } : {});
    addMemory(state, formed ? "Gecikmeli beden değerlendirmesinde süren yük günlük tempona yansıdı." : "Beden takibinde yeni bir durum oluşmadı; mevcut toparlanma düzenini sürdürmen önemli.");
  }
}
