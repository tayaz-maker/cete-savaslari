#!/usr/bin/env python3
"""Generate DARBE-H! source-cards.json, designs.js and decks.json.

Original institutional-crisis catalog. Not a VETO/GETT noun swap.
Effects use existing duel-core primitives only.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "public" / "games" / "darbe-h"
ROOT.mkdir(parents=True, exist_ok=True)

# 15 roles × 14 offices = 210 unit name stems; take 170.
ROLES_TR = [
    "Kâtibi", "Raportörü", "Müsteşarı", "Müşaviri", "Kuryesi",
    "Arşivcisi", "Dizgicisi", "Parafçısı", "Üyesi", "Görevlisi",
    "Mümeyyizi", "Operatörü", "Redaktörü", "Murakıbı", "Zabıtı",
]
ROLES_EN = [
    "Clerk", "Rapporteur", "Undersecretary", "Adviser", "Courier",
    "Archivist", "Compositor", "Initialer", "Member", "Officer",
    "Examiner", "Operator", "Redactor", "Overseer", "Recorder",
]
OFFICES_TR = [
    "Dosya", "Paraf", "Heyet", "Karargâh", "Telex", "Muhtıra", "Zeyil",
    "İhtar", "Redaksiyon", "Brifing", "Kabine", "Arşiv", "Tebligat", "Meşruiyet",
]
OFFICES_EN = [
    "File", "Initial", "Panel", "Command", "Telex", "Memorandum", "Addendum",
    "Notice", "Redaction", "Briefing", "Cabinet", "Archive", "Dispatch", "Legitimacy",
]

SPELL_TR = [
    "Açık Tebligat", "Gece Brifingi", "Paraflı Emir", "Zeyil Cümlesi", "Arşiv Çağrısı",
    "Heyet Toplantısı", "Kabine Notu", "Telex Akışı", "Redaksiyon Çizgisi", "Meşruiyet Cümlesi",
    "Dosya Devri", "İstişare Turu", "Kaşe Düşümü", "Müzekkere", "Tevzi Listesi",
    "Üst Yazı", "Ek Cetvel", "Gündem Maddesi", "Kısa Karar", "Uzun Gerekçe",
    "İmza Sırası", "Havale Yazısı", "Tebliğ Sureti", "Cevabi Yazı", "İç Genelge",
    "Dış Yazışma", "Kayıt Düzeltmesi", "Sayfa Numarası", "Dipnot Emri", "Üst Bilgi",
    "Alt Bilgi", "Dağıtım Çizelgesi", "Vize Şerhi", "Paraflı Suret", "Taslak Metin",
    "Kesin Metin", "Ek Protokol", "Ara Karar", "Nihai Cümle", "Geri Çekme Yazısı",
    "Yeniden Yazım", "Çift Sütun", "Tek Sütun", "Kırmızı Bant", "Sarı Bant",
    "Gizli Suret", "Açık Suret", "Dahili Not", "Harici Not", "Kriz Cetveli",
    "Tempo Yazısı", "Saha Notu", "Masa Emri", "Kağıt Sırası", "Masa Cetveli",
    "Brifing Defteri", "Arşiv Fişi", "Paraflı Cetvel", "Telex Cetveli", "Dosya Şeridi",
    "Eksik İmza", "Fazla Paraf", "Erken Telex", "Geç Tebligat", "Boş Gündem",
    "Dolu Gündem", "Kısa Brifing", "Uzun Brifing", "Sessiz Heyet", "Gürültülü Kabine",
    "Arşiv Kapısı", "Dosya Sırtı", "Zeyil Eki", "İhtar Metni", "Redaksiyon İzi",
    "Meşruiyet Şerhi", "Karargâh Notu", "Telex Şeridi", "Tevzi Kağıdı",
]
SPELL_EN = [
    "Open Dispatch", "Night Briefing", "Signed Order", "Addendum Sentence", "Archive Call",
    "Panel Sitting", "Cabinet Note", "Telex Flow", "Redaction Line", "Legitimacy Clause",
    "File Transfer", "Consultation Round", "Stamp Drop", "Memorandum Slip", "Distribution List",
    "Cover Letter", "Annex Table", "Agenda Item", "Short Ruling Line", "Long Rationale",
    "Signature Queue", "Referral Note", "Dispatch Copy", "Reply Letter", "Internal Circular",
    "External Correspondence", "Record Correction", "Page Number", "Footnote Order", "Header Line",
    "Footer Line", "Distribution Chart", "Visa Gloss", "Initialled Copy", "Draft Text",
    "Final Text", "Side Protocol", "Interim Line", "Closing Sentence", "Withdrawal Note",
    "Rewrite Pass", "Two Columns", "One Column", "Red Band", "Yellow Band",
    "Closed Copy", "Open Copy", "Internal Note", "External Note", "Crisis Chart",
    "Tempo Note", "Field Note", "Desk Order", "Paper Queue", "Desk Chart",
    "Briefing Ledger", "Archive Slip", "Initialled Chart", "Telex Chart", "File Ribbon",
    "Missing Signature", "Extra Initial", "Early Telex", "Late Dispatch", "Empty Agenda",
    "Full Agenda", "Short Briefing", "Long Briefing", "Quiet Panel", "Noisy Cabinet",
    "Archive Door", "File Spine", "Addendum Annex", "Notice Text", "Redaction Trace",
    "Legitimacy Gloss", "Command Note", "Telex Ribbon", "Distribution Paper",
]

TRAP_TR = [
    "İhtar: Erken İmza", "İhtar: Boş Paraf", "İhtar: Yanlış Suret", "İhtar: Eksik Tevzi",
    "İhtar: Kapalı Arşiv", "İhtar: Açık Bant", "İhtar: Çift Gündem", "İhtar: Tek İmza",
    "İhtar: Geç Brifing", "İhtar: Sessiz Heyet", "İhtar: Gürültülü Masa", "İhtar: Kırmızı Şerh",
    "İhtar: Sarı Şerh", "İhtar: Zeyil Yok", "İhtar: Zeyil Fazla", "İhtar: Telex Kopuk",
    "İhtar: Tebligat İade", "İhtar: Meşruiyet Şüphesi", "İhtar: Dosya Kayması", "İhtar: Sıra Kayması",
    "İhtar: Vize Reddi", "İhtar: Havale İadesi", "İhtar: Dipnot Tutmaz", "İhtar: Üst Yazı Tutmaz",
    "İhtar: Dağıtım Hatası", "İhtar: Kayıt Tutmaz", "İhtar: Suret Uyuşmaz", "İhtar: Kaşe Uyuşmaz",
    "İhtar: Gündem Dışı", "İhtar: Ara Karar", "İhtar: Nihai Değil", "İhtar: Taslak Kaldı",
    "İhtar: Kesin Sanıldı", "İhtar: İç Genelge", "İhtar: Dış Sızıntı Yok", "İhtar: Brifing İptal",
    "İhtar: Kabine Erteleme", "İhtar: Karargâh Sessiz", "İhtar: Arşiv Kilitli", "İhtar: Redaksiyon Sert",
    "İhtar: Paraf Zinciri", "İhtar: İmza Zinciri", "İhtar: Tevzi Gecikmesi", "İhtar: Ek Cetvel",
    "İhtar: Çift Sütun", "İhtar: Tek Sütun", "İhtar: Gizli Suret", "İhtar: Açık Suret",
    "İhtar: Kriz Cetveli", "İhtar: Tempo Kırığı", "İhtar: Masa Boşaldı",
]
TRAP_EN = [
    "Notice: Early Signature", "Notice: Empty Initial", "Notice: Wrong Copy", "Notice: Missed Distribution",
    "Notice: Closed Archive", "Notice: Open Band", "Notice: Double Agenda", "Notice: Single Signature",
    "Notice: Late Briefing", "Notice: Quiet Panel", "Notice: Loud Desk", "Notice: Red Gloss",
    "Notice: Yellow Gloss", "Notice: No Addendum", "Notice: Extra Addendum", "Notice: Broken Telex",
    "Notice: Dispatch Returned", "Notice: Legitimacy Doubt", "Notice: File Drift", "Notice: Queue Drift",
    "Notice: Visa Refused", "Notice: Referral Returned", "Notice: Footnote Fails", "Notice: Cover Fails",
    "Notice: Distribution Error", "Notice: Record Fails", "Notice: Copy Mismatch", "Notice: Stamp Mismatch",
    "Notice: Off Agenda", "Notice: Interim Line", "Notice: Not Final", "Notice: Draft Remains",
    "Notice: Taken as Final", "Notice: Internal Circular", "Notice: No External Leak", "Notice: Briefing Cancelled",
    "Notice: Cabinet Postponed", "Notice: Command Silent", "Notice: Archive Locked", "Notice: Hard Redaction",
    "Notice: Initial Chain", "Notice: Signature Chain", "Notice: Late Distribution", "Notice: Annex Table",
    "Notice: Two Columns", "Notice: One Column", "Notice: Closed Copy", "Notice: Open Copy",
    "Notice: Crisis Chart", "Notice: Broken Tempo", "Notice: Desk Emptied",
]

BAN = (
    "silah", "suikast", "tank", "tutukla", "işkence", "sabotaj", "dinleme",
    "ele geçir", "infaz", "cinayet", "darbe plan", "radyo", "ordu birlik",
    "gözaltı", "işkence", "bomba", "mermi", "tevkif",
)


def draw(n=1, opp=False):
    return {"op": "draw", "count": n, "opponent": opp}


def points(n, opp=False):
    return {"op": "points", "amount": n, "opponent": opp}


def select(key, selector, count=1):
    chooser = "opponent" if key == "discard" and selector.get("owner") == "opponent" else "own"
    return {"op": "select", "key": key, "selector": selector, "count": count, "chooser": chooser}


def own(zones="units", **flt):
    return {"owner": "own", "zones": zones, **flt}


def enemy(zones="units", **flt):
    return {"owner": "opponent", "zones": zones, **flt}


def move(to, count=1, reason="effect"):
    return {"op": "move", "to": to, "count": count, "reason": reason}


def discard(n=1, opp=False, random=False):
    return {"op": "discard", "count": n, "opponent": opp, "random": random}


def on(event, effects, **opt):
    return {"event": event, "effects": effects, **opt}


def search(flt, count=1):
    return [select("card", own("deck", **flt), count), move("hand", count), {"op": "shuffle"}]


def summon_from(zones, flt, count=1):
    if isinstance(zones, str):
        zones = [zones]
    return [select("unit", own(zones, kind="unit", **flt), count), {"op": "summon", "count": count}]


def design(name, text, effects=None, traits=None, triggers=None, series=None, hint=None):
    row = {
        "name": name,
        "text": text,
        "effects": effects or [],
        "traits": traits or {},
        "triggers": triggers or [],
    }
    if series:
        row["series"] = series
    if hint:
        row["hint"] = hint
    return row


def unit_names(i):
    role, office = i % 15, (i // 15) % 14
    tr = f"{OFFICES_TR[office]} {ROLES_TR[role]}"
    en = f"{OFFICES_EN[office]} {ROLES_EN[role]}"
    # disambiguate repeats beyond 210
    if i >= 210:
        tr = f"{tr} {i - 209}"
        en = f"{en} {i - 209}"
    return tr, en


def unit_stats(i, template_i):
    # Deterministic ATK/DEF bands by template, not a copy of VETO row i.
    base = 200 + ((i * 37 + template_i * 19) % 18) * 100
    defense = 200 + ((i * 23 + template_i * 11) % 16) * 100
    level = 1 + ((i * 5 + template_i) % 8)
    if level > 8:
        level = 8
    if template_i % 11 == 0:
        level = min(8, max(5, level))
    if template_i % 17 == 0:
        level = min(8, 7 + (i % 2))
    return level, base, defense


def unit_template(i, n, series):
    """n is 1-based card number. Offset templates so index i != VETO i."""
    t = (n * 5 + 13) % 42
    name_tr, name_en = unit_names(i)
    level, atk, defense = unit_stats(i, t)
    kind = "unit"
    subtype = "effect"
    loc = "main"
    text_tr, text_en = "Bu görevli masada durur.", "This officer holds the desk."
    effects, traits, triggers = [], {}, []
    p = 200 + (n % 7) * 100
    p2 = 300 + (n % 5) * 100
    atk_mod = 200 + (n % 6) * 100

    if t == 0:
        triggers = [on("destroy", [draw()])]
        text_tr, text_en = "Yok olunca 1 kart çek.", "When destroyed, draw 1 card."
    elif t == 1:
        triggers = [on("summon", [draw()])]
        text_tr, text_en = "Çağrılınca 1 kart çek.", "When summoned, draw 1 card."
    elif t == 2:
        triggers = [on("summon", search({"series": series[0], "kind": "unit"}), normal=True)]
        text_tr, text_en = f"Normal çağrıda desteden 1 {series[0]} görevlisi eline al.", f"When Normal Summoned, add 1 {series[0]} officer from deck to hand."
    elif t == 3:
        triggers = [on("summon", [{"op": "look", "count": 1, "take": 1, "kind": "unit"}])]
        text_tr, text_en = "Çağrılınca destenin üstüne bak; birimse eline al.", "When summoned, look at the top card; take it if it is a unit."
    elif t == 4:
        triggers = [on("summon", [select("discard", enemy("hand")), discard(1, True)])]
        text_tr, text_en = "Çağrılınca rakip 1 kart bırakır.", "When summoned, the opponent discards 1 card."
    elif t == 5:
        triggers = [on("flip", [select("set", enemy(["units", "support"], face="down")), {"op": "reveal"}])]
        text_tr, text_en = "Setten açılınca rakibin 1 set kartına bak.", "When flipped from Set, look at 1 opposing Set card."
    elif t == 6:
        triggers = [on("tribute", [points(p)])]
        text_tr, text_en = f"Parafla gönderilince {p} KP kazan.", f"When tributed, gain {p} KP."
    elif t == 7:
        triggers = [on("grave", [select("trap", own("deck", kind="trap")), {"op": "set"}])]
        text_tr, text_en = "Mezara gidince desteden 1 ihtarı set et.", "When sent to the grave, Set 1 notice from your deck."
    elif t == 8:
        traits = {"aura": {"series": series[0], "attack": atk_mod, "defense": atk_mod}}
        text_tr, text_en = f"{series[0]} görevlilerin {atk_mod} ATK/DEF kazanır.", f"Your {series[0]} officers gain {atk_mod} ATK and DEF."
    elif t == 9:
        traits = {"countStats": {"count": "enemySet", "attack": 200}}
        text_tr, text_en = "Rakibin her set kartı için 200 ATK kazanır.", "Gains 200 ATK for each opposing Set card."
    elif t == 10:
        traits = {"direct": True, "directMultiplier": 0.5}
        text_tr, text_en = "Doğrudan saldırabilir; bu savaşta hasar yarıya iner.", "May attack directly, dealing half damage."
    elif t == 11:
        traits = {"untargetableDefense": True, "allowDirectWhenOnlyDefenders": True}
        text_tr, text_en = "Savunmadayken bu karta saldıramazlar; başka hedef yoksa doğrudan serbest.", "While defending, cannot be attacked; if no other target, direct is allowed."
    elif t == 12:
        traits = {"battleProtection": "always"}
        triggers = [on("standby", [points(-200)], **{"global": True})]
        text_tr, text_en = "Savaşta yok olmaz. Her Hazırlık'ta 200 KP kaybedersin.", "Cannot be destroyed in battle. Lose 200 KP during every Standby."
    elif t == 13:
        traits = {"extraNormalMaxLevel": 3}
        text_tr, text_en = "Her tur ek 1 Normal Çağrı verir, yalnız kademe 3 veya altı.", "Grants 1 extra Normal Summon each turn, only for Level 3 or lower."
    elif t == 14:
        traits = {"fieldProtection": True}
        text_tr, text_en = "Alan emirnamesi varken yok olmaz.", "Cannot be destroyed while a field order is active."
    elif t == 15:
        traits = {"protectOwnSetUnits": True}
        text_tr, text_en = "Yüzükoyun görevlilerin açılana kadar etkiden yok olmaz.", "Your face-down officers cannot be destroyed by effects until revealed."
    elif t == 16:
        traits = {"sameLevelDamage": 300}
        text_tr, text_en = "Aynı kademedeki rakibe saldırınca 300 ek hasar.", "When attacking an equal-level officer, deal 300 extra damage."
    elif t == 17:
        triggers = [on("spell", [points(300)], **{"global": True, "opponent": True})]
        text_tr, text_en = "Rakip emirname açınca 300 KP kazan.", "Whenever the opponent activates an order, gain 300 KP."
    elif t == 18:
        effects = [{"op": "selfMove", "to": "grave", "reason": "tribute"}, *summon_from("deck", {"series": series[0], "maxLevel": 3})]
        text_tr, text_en = "Bu kartı parafla gönder; desteden kademe 3 veya altı 1 görevli özel çağır.", "Tribute this card to Special Summon 1 Level 3 or lower officer from deck."
    elif t == 19:
        effects = [select("unit", own()), {"op": "modifier", "value": {"attack": atk_mod}, "permanent": False}]
        text_tr, text_en = f"Turda bir kez: bir görevlin {atk_mod} ATK kazanır.", f"Once per turn: one of your officers gains {atk_mod} ATK."
    elif t == 20:
        effects = [{"op": "selfMove", "to": "banished"}, {"op": "negate"}]
        traits = {"responseFrom": "grave", "oncePerDuel": True, "responseKinds": ["trap"]}
        text_tr, text_en = "Düelloda bir kez: mezardan bu kartı oyun dışı bırakıp set ihtarı iptal et.", "Once per duel: banish this from grave to negate a Set notice."
    elif t == 21:
        triggers = [on("summon", [{"op": "look", "count": 3, "take": 1}])]
        text_tr, text_en = "Çağrılınca üst 3 karta bak, 1 al, diğerlerini sırayla bırak.", "When summoned, look at the top 3; take 1 and return the rest in order."
    elif t == 22:
        traits = {"quickDamage": 400}
        text_tr, text_en = "Hızlı emirnamelerin 400 ek KP hasarı verir.", "Your Quick-Play orders deal 400 additional KP damage."
    elif t == 23:
        effects = [select("trap", enemy("support", kind="trap")), {"op": "modifier", "value": {"negated": True}, "permanent": False}]
        text_tr, text_en = "Turda bir kez: bir ihtarın etkisini bu tur iptal et.", "Once per turn: negate 1 notice for this turn."
    elif t == 24:
        triggers = [on("summon", summon_from(["hand", "deck"], {"series": series[0], "maxLevel": 3}))]
        text_tr, text_en = "Çağrılınca el veya desteden kademe 3 veya altı 1 görevli özel çağır.", "When summoned, Special Summon 1 Level 3 or lower officer from hand or deck."
    elif t == 25:
        traits = {"conditionalStats": {"condition": "ownSetTrap", "attack": 400}}
        text_tr, text_en = "Set ihtarın varken 400 ATK kazanır.", "Gains 400 ATK while you control a Set notice."
    elif t == 26:
        effects = [{"op": "token", "count": 1, "attack": 0, "defense": 1000, "tr": "Kağıt Mühür", "en": "Paper Seal"}]
        text_tr, text_en = "0/1000 Kağıt Mühür jetonu oluştur.", "Create a 0/1000 Paper Seal token."
        traits = {"requiresFreeZone": "units"}
    elif t == 27:
        triggers = [on("destroy", [points(p2)])]
        text_tr, text_en = f"Yok olunca {p2} KP kazan.", f"When destroyed, gain {p2} KP."
    elif t == 28:
        triggers = [on("summon", [select("mill", own("deck")), move("grave")])]
        text_tr, text_en = "Çağrılınca destenden 1 kartı arşive gönder.", "When summoned, send 1 card from your deck to the archive."
    elif t == 29:
        effects = [select("unit", enemy()), move("hand", 1, "bounce")]
        text_tr, text_en = "Rakip görevliyi eline döndür.", "Return an opposing officer to hand."
    elif t == 30:
        traits = {"direct": True}
        text_tr, text_en = "Doğrudan saldırabilir.", "May attack directly."
    elif t == 31:
        triggers = [on("standby", [draw()], **{"global": True})]
        text_tr, text_en = "Hazırlık'ta 1 kart çek (sürekli).", "During Standby, draw 1 (continuous)."
    elif t == 32:
        effects = [select("spell", own("grave", kind="spell")), move("hand")]
        text_tr, text_en = "Arşivden 1 emirnameyi eline al.", "Add 1 order from the archive to your hand."
    elif t == 33:
        triggers = [on("summon", [points(-p, True)])]
        text_tr, text_en = f"Çağrılınca rakip {p} KP kaybeder.", f"When summoned, the opponent loses {p} KP."
    elif t == 34:
        effects = [{"op": "selfMove", "to": "grave", "reason": "cost"}, points(p2 + 400)]
        text_tr, text_en = f"Bu kartı arşive gönder, {p2 + 400} KP kazan.", f"Send this to the archive; gain {p2 + 400} KP."
    elif t == 35:
        traits = {"aura": {"kind": "unit", "defense": 300}}
        text_tr, text_en = "Görevlilerin 300 DEF kazanır.", "Your officers gain 300 DEF."
    elif t == 36:
        triggers = [on("flip", [draw(2)])]
        text_tr, text_en = "Setten açılınca 2 kart çek.", "When flipped from Set, draw 2 cards."
    elif t == 37:
        effects = [select("unit", own("grave", kind="unit", maxLevel=4)), {"op": "summon", "count": 1}]
        traits = {"requiresFreeZone": "units"}
        text_tr, text_en = "Arşivden kademe 4 veya altı 1 görevli özel çağır.", "Special Summon 1 Level 4 or lower officer from the archive."
    elif t == 38:
        triggers = [on("destroy", [select("banish", enemy("grave")), move("banished")])]
        text_tr, text_en = "Yok olunca rakip arşivinden 1 kartı oyun dışı bırak.", "When destroyed, banish 1 card from the opposing archive."
    elif t == 39:
        effects = [{"op": "shuffle"}]
        triggers = [on("summon", [points(200)])]
        text_tr, text_en = "Çağrılınca 200 KP; desteyi karıştırabilirsin.", "When summoned, gain 200 KP; you may shuffle."
    elif t == 40:
        traits = {"countStats": {"count": "ownUnits", "attack": 100}}
        text_tr, text_en = "Kontrol ettiğin her görevli için 100 ATK.", "Gains 100 ATK for each officer you control."
    else:
        triggers = [on("summon", [points(100 + (n % 4) * 50)])]
        text_tr, text_en = f"Çağrılınca {100 + (n % 4) * 50} KP kazan.", f"When summoned, gain {100 + (n % 4) * 50} KP."

    # 12 auxiliary fusions among later units
    if 68 <= n <= 73 or 158 <= n <= 163:
        loc = "auxiliary"
        subtype = "fusion" if n <= 73 else "effect"
        level = 5 + (n % 3)
        atk, defense = 1800 + (n % 5) * 200, 1400 + (n % 4) * 200
        a, b = series[0], OFFICES_EN[(n + 3) % 14] if False else ["Dosya", "Paraf", "Heyet", "Karargah", "Brifing", "Kabine"][n % 6]
        other = ["Paraf", "Heyet", "Dosya", "Telex", "Arsiv", "Kabine"][n % 6]
        traits = {"materials": {"series": [series[0], other]}}
        text_tr, text_en = f"Malzeme: {series[0]} ve {other} görevlisi. Yedek heyet.", f"Materials: {series[0]} and {other} officers. Reserve panel."
        name_tr = f"Yedek Heyet {n}"
        name_en = f"Reserve Panel {n}"

    return {
        "raw": {
            "id": f"DRB-{n:03d}",
            "name": name_tr,
            "kind": kind,
            "subtype": subtype,
            "series": f"Görevli — {series[0]}",
            "level": level,
            "attack": atk,
            "defense": defense,
            "deckLocation": loc,
            "text": text_tr,
            "nameEn": name_en,
            "textEn": text_en,
        },
        "design": design(name_en, text_en, effects, traits, triggers, series),
    }


def spell_template(i, n, series):
    t = (n * 11 + 5) % 24
    name_tr, name_en = SPELL_TR[i % len(SPELL_TR)], SPELL_EN[i % len(SPELL_EN)]
    if i >= len(SPELL_TR):
        name_tr = f"{name_tr} {i}"
        name_en = f"{name_en} {i}"
    subtype = "normal"
    effects, traits, triggers = [], {}, []
    text_tr, text_en = "Emirname masaya iner.", "An order lands on the desk."
    if t == 0:
        effects = [draw(2)]
        text_tr, text_en = "2 kart çek.", "Draw 2 cards."
    elif t == 1:
        effects = [points(600 + (n % 6) * 100, True)]
        text_tr, text_en = f"Rakip {600 + (n % 6) * 100} KP kaybeder.", f"The opponent loses {600 + (n % 6) * 100} KP."
        subtype = "quick"
    elif t == 2:
        effects = search({"kind": "unit", "series": series[0]})
        text_tr, text_en = f"Desteden 1 {series[0]} görevlisi eline al.", f"Add 1 {series[0]} officer from deck to hand."
    elif t == 3:
        effects = [select("unit", enemy()), {"op": "destroy"}]
        text_tr, text_en = "Rakip görevliyi yok et.", "Destroy an opposing officer."
    elif t == 4:
        effects = [select("unit", own("grave", kind="unit")), move("hand")]
        text_tr, text_en = "Arşivden 1 görevliyi eline al.", "Add 1 officer from the archive to your hand."
    elif t == 5:
        effects = [{"op": "look", "count": 3, "take": 2}]
        text_tr, text_en = "Üst 3 karta bak, 2 al.", "Look at the top 3; take 2."
    elif t == 6:
        effects = [discard(1, True, True)]
        text_tr, text_en = "Rakip rastgele 1 kart bırakır.", "The opponent discards 1 card at random."
        subtype = "quick"
    elif t == 7:
        effects = [select("spell", enemy("support", kind="spell")), {"op": "destroy"}]
        text_tr, text_en = "Rakip emirnameyi yok et.", "Destroy an opposing order."
    elif t == 8:
        effects = [points(800 + (n % 5) * 100)]
        text_tr, text_en = f"{800 + (n % 5) * 100} KP kazan.", f"Gain {800 + (n % 5) * 100} KP."
    elif t == 9:
        effects = [select("unit", own()), {"op": "modifier", "value": {"attack": 800}, "permanent": False}]
        text_tr, text_en = "Bir görevlin bu tur 800 ATK kazanır.", "One of your officers gains 800 ATK this turn."
        subtype = "quick"
    elif t == 10:
        effects = [{"op": "skipBattle"}]
        text_tr, text_en = "Bu tur kriz aşaması olmaz.", "There is no Crisis phase this turn."
        subtype = "quick"
    elif t == 11:
        effects = summon_from("deck", {"maxLevel": 4})
        traits = {"requiresFreeZone": "units"}
        text_tr, text_en = "Desteden kademe 4 veya altı 1 görevli özel çağır.", "Special Summon 1 Level 4 or lower officer from deck."
    elif t == 12:
        effects = [select("trap", own("deck", kind="trap")), {"op": "set"}]
        text_tr, text_en = "Desteden 1 ihtarı set et.", "Set 1 notice from your deck."
    elif t == 13:
        effects = [{"op": "drawSetTrap"}]
        text_tr, text_en = "1 kart çek; ihtarsa set et.", "Draw 1; if it is a notice, Set it."
    elif t == 14:
        effects = [select("unit", enemy()), move("grave")]
        text_tr, text_en = "Rakip görevliyi arşive gönder.", "Send an opposing officer to the archive."
    elif t == 15:
        subtype = "equip"
        effects = [{"op": "modifier", "value": {"attack": 500}, "permanent": True, "self": False}]
        text_tr, text_en = "Kuşanan görevli 500 ATK kazanır.", "The equipped officer gains 500 ATK."
    elif t == 16:
        subtype = "continuous"
        traits = {"aura": {"kind": "unit", "attack": 200}}
        text_tr, text_en = "Görevlilerin 200 ATK kazanır.", "Your officers gain 200 ATK."
    elif t == 17:
        subtype = "field"
        traits = {"aura": {"series": series[0], "attack": 300, "defense": 300}}
        text_tr, text_en = f"Alan: {series[0]} görevliler 300/300 kazanır.", f"Field: {series[0]} officers gain 300/300."
    elif t == 18:
        effects = [points(-600), draw(2)]
        text_tr, text_en = "600 KP öde, 2 kart çek.", "Pay 600 KP; draw 2."
    elif t == 19:
        effects = [{"op": "negate"}]
        subtype = "quick"
        text_tr, text_en = "İlan edilen işlemi iptal et.", "Negate the declared action."
    elif t == 20:
        effects = [select("unit", own("banished", kind="unit")), move("grave")]
        text_tr, text_en = "Oyun dışındaki 1 görevliyi arşive al.", "Move 1 banished officer to the archive."
    elif t == 21:
        effects = [{"op": "flag", "name": "cannotDirect", "value": True, "opponent": True}]
        text_tr, text_en = "Rakip bu tur doğrudan saldırı yapamaz.", "The opponent cannot attack directly this turn."
        subtype = "quick"
    elif t == 22:
        effects = [select("card", own("deck")), move("grave"), draw()]
        text_tr, text_en = "Desteden 1 kartı arşive gönder, 1 çek.", "Send 1 from deck to archive; draw 1."
    else:
        effects = [draw(), points(300)]
        text_tr, text_en = "1 kart çek, 300 KP kazan.", "Draw 1; gain 300 KP."

    return {
        "raw": {
            "id": f"DRB-{n:03d}",
            "name": name_tr,
            "kind": "spell",
            "subtype": subtype,
            "series": f"Emirname — {series[0]}",
            "level": 0,
            "attack": 0,
            "defense": 0,
            "deckLocation": "main",
            "text": text_tr,
            "nameEn": name_en,
            "textEn": text_en,
        },
        "design": design(name_en, text_en, effects, traits, triggers, series),
    }


def trap_template(i, n, series):
    t = (n * 13 + 3) % 18
    name_tr, name_en = TRAP_TR[i], TRAP_EN[i]
    subtype = "normal"
    effects, traits, triggers = [], {}, []
    text_tr, text_en = "İhtar masada bekler.", "A notice waits on the desk."
    if t == 0:
        effects = [{"op": "negate"}]
        subtype = "counter"
        text_tr, text_en = "İlan edilen etkiyi iptal et.", "Negate the declared effect."
    elif t == 1:
        effects = [{"op": "cancelAttack"}]
        text_tr, text_en = "Saldırıyı iptal et.", "Cancel the attack."
    elif t == 2:
        effects = [{"op": "targetOrBattleNegate"}]
        subtype = "counter"
        text_tr, text_en = "Hedefli etkiyi iptal et veya bir yok oluşu bir kez koru.", "Negate a targeted effect, or protect one destruction."
    elif t == 3:
        effects = [select("unit", enemy()), {"op": "destroy"}]
        text_tr, text_en = "Saldıran veya hedef görevliyi yok et.", "Destroy the attacking or targeted officer."
    elif t == 4:
        effects = [draw(2)]
        text_tr, text_en = "2 kart çek.", "Draw 2 cards."
    elif t == 5:
        effects = [points(700 + (n % 5) * 100, True)]
        text_tr, text_en = f"Rakip {700 + (n % 5) * 100} KP kaybeder.", f"The opponent loses {700 + (n % 5) * 100} KP."
    elif t == 6:
        effects = [select("unit", enemy()), move("hand", 1, "bounce")]
        text_tr, text_en = "Rakip görevliyi eline döndür.", "Return an opposing officer to hand."
    elif t == 7:
        effects = [{"op": "negateResponse"}]
        subtype = "counter"
        text_tr, text_en = "Rakibin tepkisini iptal et.", "Negate the opponent's response."
    elif t == 8:
        effects = [select("spell", enemy("support")), {"op": "destroy"}]
        text_tr, text_en = "Rakip desteği yok et.", "Destroy an opposing support card."
    elif t == 9:
        effects = [{"op": "skipBattle"}]
        text_tr, text_en = "Kriz aşamasını atla.", "Skip the Crisis phase."
    elif t == 10:
        effects = [select("unit", own("grave", kind="unit", maxLevel=4)), {"op": "summon", "count": 1}]
        traits = {"requiresFreeZone": "units"}
        text_tr, text_en = "Arşivden kademe 4 veya altı 1 görevli özel çağır.", "Special Summon 1 Level 4 or lower officer from the archive."
    elif t == 11:
        effects = [{"op": "flag", "name": "noSpells", "value": True, "opponent": True}]
        text_tr, text_en = "Rakip bu tur emirname açamaz.", "The opponent cannot activate orders this turn."
    elif t == 12:
        effects = [discard(1, True)]
        text_tr, text_en = "Rakip 1 kart bırakır.", "The opponent discards 1 card."
    elif t == 13:
        subtype = "continuous"
        traits = {"aura": {"kind": "trap"}}
        triggers = [on("summon", [points(200)], opponent=True, **{"global": True})]
        text_tr, text_en = "Rakip görevli çağırınca 200 KP kazan.", "When the opponent summons an officer, gain 200 KP."
    elif t == 14:
        effects = [{"op": "pendingTarget"}, {"op": "destroy"}]
        text_tr, text_en = "Bekleyen işlemin kaynağını yok et.", "Destroy the source of the pending action."
    elif t == 15:
        effects = [select("unit", own()), {"op": "modifier", "value": {"protectBattleOnce": True}, "permanent": False}]
        text_tr, text_en = "Bir görevlin bu savaşta bir kez yok olmaz.", "One of your officers cannot be destroyed in this battle once."
    elif t == 16:
        effects = [{"op": "cancelSummonToGrave"}]
        subtype = "counter"
        text_tr, text_en = "Çağrıyı iptal et, kart arşive gider.", "Cancel the summon; the card goes to the archive."
    else:
        effects = [points(500), draw()]
        text_tr, text_en = "500 KP kazan ve 1 kart çek.", "Gain 500 KP and draw 1."

    return {
        "raw": {
            "id": f"DRB-{n:03d}",
            "name": name_tr,
            "kind": "trap",
            "subtype": subtype,
            "series": "İhtar",
            "level": 0,
            "attack": 0,
            "defense": 0,
            "deckLocation": "main",
            "text": text_tr,
            "nameEn": name_en,
            "textEn": text_en,
        },
        "design": design(name_en, text_en, effects, traits, triggers, ["Ihtar"]),
    }


def series_for(n):
    bands = [
        (22, "Dosya"),
        (44, "Paraf"),
        (66, "Heyet"),
        (88, "Karargah"),
        (110, "Brifing"),
        (132, "Kabine"),
        (154, "Arsiv"),
        (170, "Mesruiyet"),
        (210, "Telex"),
        (250, "Tebligat"),
        (275, "Muhtira"),
        (300, "Ihtar"),
    ]
    for hi, s in bands:
        if n <= hi:
            return [s]
    return ["Dosya"]


def build():
    cards = []
    # 170 units, 79 spells, 51 traps — sibling parity
    for i in range(170):
        n = i + 1
        cards.append(unit_template(i, n, series_for(n)))
    for i in range(79):
        n = 171 + i
        cards.append(spell_template(i, n, series_for(n)))
    for i in range(51):
        n = 250 + i
        cards.append(trap_template(i, n, series_for(n)))

    assert len(cards) == 300, len(cards)
    ids = [c["raw"]["id"] for c in cards]
    assert ids == [f"DRB-{i:03d}" for i in range(1, 301)]
    tr_names = [c["raw"]["name"] for c in cards]
    en_names = [c["raw"]["nameEn"] for c in cards]
    assert len(set(tr_names)) == 300, f"dup TR {len(set(tr_names))}"
    assert len(set(en_names)) == 300, f"dup EN {len(set(en_names))}"
    blob = json.dumps(cards, ensure_ascii=False).lower()
    for bad in BAN:
        if bad in blob:
            raise SystemExit(f"safety hit: {bad}")

    source = [c["raw"] for c in cards]
    designs = {int(c["raw"]["id"][4:]): c["design"] for c in cards}

    (ROOT / "source-cards.json").write_text(json.dumps(source, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    designs_js = "export const designs = " + json.dumps(designs, ensure_ascii=False, indent=2) + ";\n"
    (ROOT / "designs.js").write_text(designs_js, encoding="utf-8")

    by_id = {c["raw"]["id"]: c["raw"] for c in cards}

    def pick_deck(deck_id, focus, seed):
        units = [c["raw"] for c in cards if c["raw"]["kind"] == "unit" and c["raw"]["deckLocation"] == "main"]
        spells = [c["raw"] for c in cards if c["raw"]["kind"] == "spell"]
        traps = [c["raw"] for c in cards if c["raw"]["kind"] == "trap"]

        def score(card, want_kind):
            s = 1
            series = card.get("series") or ""
            if any(f in series for f in focus):
                s += 8
            if want_kind == "unit" and 1 <= card["level"] <= 4:
                s += 4
            if want_kind == "unit" and card["level"] >= 7:
                s -= 3
            return s

        def take(pool, count, kind):
            ranked = sorted(pool, key=lambda c: (-score(c, kind), (hash(c["id"]) ^ seed) & 0xFFFFFFFF))
            chosen, copies, middle, bosses = [], {}, 0, set()
            for card in ranked:
                if len(chosen) >= count:
                    break
                ncopy = copies.get(card["name"], 0)
                if ncopy >= 3:
                    continue
                if kind == "unit" and 5 <= card["level"] <= 6 and middle >= 5:
                    continue
                if kind == "unit" and card["level"] >= 7 and card["name"] not in bosses and len(bosses) >= 2:
                    continue
                copies[card["name"]] = ncopy + 1
                if 5 <= card["level"] <= 6:
                    middle += 1
                if card["level"] >= 7:
                    bosses.add(card["name"])
                chosen.append(card["id"])
            if len(chosen) < count:
                for card in pool:
                    if len(chosen) >= count:
                        break
                    if chosen.count(card["id"]) >= 3:
                        continue
                    if card["id"] not in chosen or chosen.count(card["id"]) < 3:
                        chosen.append(card["id"])
            return chosen[:count]

        u, s, t = take(units, 23, "unit"), take(spells, 11, "spell"), take(traps, 6, "trap")
        ids = u + s + t
        # collapse to {id,count}
        counts = {}
        for i in ids:
            counts[i] = counts.get(i, 0) + 1
        entries = [{"id": k, "count": v} for k, v in counts.items()]
        aux = [c["raw"]["id"] for c in cards if c["raw"]["deckLocation"] == "auxiliary"]
        aux_entries = [{"id": aux[seed % len(aux)], "count": 1}] if aux else []
        names = {
            "muhtira": {"tr": "Muhtıra", "en": "Memorandum"},
            "tebligat": {"tr": "Tebligat", "en": "Dispatch"},
            "karargah": {"tr": "Karargâh", "en": "Command Post"},
            "istisare": {"tr": "İstişare", "en": "Consultation"},
            "zeyilname": {"tr": "Zeyilname", "en": "Addendum"},
        }
        blurbs = {
            "muhtira": {
                "tr": "İhtarları setle, acele eden masayı boz. Yavaş başlar, geç kilitlersin.",
                "en": "Set notices and spoil the hurried desk. Slow to start, late to lock.",
            },
            "tebligat": {
                "tr": "Telex erken düşer. Doğrudan baskı ve tempo; boş saha seni geç yener.",
                "en": "The telex lands early. Direct pressure and tempo; an empty field beats you late.",
            },
            "karargah": {
                "tr": "Heyeti kalabalık tut. Orta saha ve paraflı çağrı.",
                "en": "Keep the panel crowded. Mid-board presence and signed summons.",
            },
            "istisare": {
                "tr": "Brifing uzar, kart akar. Uzun krize oyna.",
                "en": "The briefing runs long and cards flow. Play the long crisis.",
            },
            "zeyilname": {
                "tr": "Arşiv konuşur. Mezarlıktan dönüş ve son zeyil.",
                "en": "The archive speaks. Grave returns and a last addendum.",
            },
        }
        return {
            "id": deck_id,
            "name": names[deck_id],
            "blurb": blurbs[deck_id],
            "cards": entries,
            "auxiliary": aux_entries,
        }

    decks = [
        pick_deck("muhtira", ["Muhtira", "Ihtar", "Redaksiyon"], 11),
        pick_deck("tebligat", ["Tebligat", "Telex", "Dosya"], 23),
        pick_deck("karargah", ["Karargah", "Kabine", "Heyet"], 37),
        pick_deck("istisare", ["Brifing", "Paraf", "Arsiv"], 53),
        pick_deck("zeyilname", ["Zeyil", "Arsiv", "Mesruiyet"], 71),
    ]
    (ROOT / "decks.json").write_text(
        json.dumps({"schemaVersion": 1, "theme": "darbe-h", "decks": decks}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    kinds = {}
    for c in source:
        kinds[c["kind"]] = kinds.get(c["kind"], 0) + 1
    print({"n": len(source), "kinds": kinds, "aux": sum(1 for c in source if c["deckLocation"] == "auxiliary")})


if __name__ == "__main__":
    build()
