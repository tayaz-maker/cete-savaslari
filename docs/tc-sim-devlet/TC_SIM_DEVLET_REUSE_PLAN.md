# TC SIM: DEVLET — TC SIM Reuse Planı

| Sınıf                           | TC SIM alanı                                                                             | DEVLET yönü                                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Doğrudan yeniden kullanılabilir | Save doğrulama, migration akışı, backup/recovery, invariant ve simülasyon test disiplini | Ayrı DEVLET state/save key'i ile kullanılır.                                                          |
| Uyarlamayla kullanılabilir      | Zaman, koşullu event, flag, event single-fire, dashboard/inbox, yıl geçmişi              | Aylık tur, briefing ve kurum bağlamına uyarlanır.                                                     |
| Kavram olarak                   | openCase, delayed consequence, memory/history, era ID, NPC yaklaşımı                     | Dosya dolabı, uyuyan dosya, politika borcu, arşiv, kurumsal hafıza ve stable dönem ID'lerine dönüşür. |
| TC SIM'e özgü                   | Oyuncu beden/ilişki, iş/konut/commute, aile NPC içerikleri                               | DEVLET'e taşınmaz.                                                                                    |

## Event akışı

TC SIM: `state → condition → event → decision → result → flag/memory/openCase`.

DEVLET hedefi: `devlet state → condition → briefing/event → decision → implementation → immediate result → delayed consequence/archive`.

DEVLET'te kararın sahadaki uygulaması ayrı ve belirsiz bir katman olacaktır. Bu belge implementation yetkisi vermez.
