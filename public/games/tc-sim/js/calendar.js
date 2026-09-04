/**
 * TAKVİM ekranının salt veri katmanı. Yalnız oyuncunun zaten bildiği,
 * kendi kararıyla oluşturdığı yükümlülükleri döner.
 *
 * "social-followup" case türü, mevcut motorun gecikmeli sosyal sonuç
 * mekanizmasıdır (bkz. social.js scheduleSocialFollowup) ve tanım gereği
 * oyuncuya önceden haber verilmemesi gereken bir sürprizi temsil eder.
 * Bu yüzden KNOWN_CASE_TYPES listesine hiçbir zaman eklenmez.
 */
export const KNOWN_CASE_TYPES = ["social-obligation", "friend-loan"];

export function getKnownOpenCases(state) {
  return state.openCases.filter(
    (item) => item.status !== "resolved" && KNOWN_CASE_TYPES.includes(item.type),
  );
}
