#!/usr/bin/env python3
"""Generate DARBE-H! source-cards.json, designs.js and decks.json.

Targeted repair: sibling-legal ID layout (core 80/44/26 + expansion 90/35/25),
level/ATK curve that respects L1–4 free / L5–6 one paraf / L7+ two paraf,
GETT-style expansion triggers, mixed free/paid desks. Not a VETO/GETT noun swap.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "public" / "games" / "darbe-h"
ROOT.mkdir(parents=True, exist_ok=True)

FAMILIES = [
    ("Dosya", "File", "Dosya", "File"),
    ("Paraf", "Paraf", "Paraf", "Paraf"),
    ("Heyet", "Panel", "Heyet", "Panel"),
    ("Karargah", "Command", "Karargâh", "Command"),
    ("Telex", "Telex", "Telex", "Telex"),
    ("Muhtira", "Memo", "Muhtıra", "Memo"),
    ("Zeyil", "Annex", "Zeyil", "Annex"),
    ("Brifing", "Brief", "Brifing", "Brief"),
    ("Kabine", "Cabinet", "Kabine", "Cabinet"),
    ("Arsiv", "Archive", "Arşiv", "Archive"),
    ("Tebligat", "Dispatch", "Tebligat", "Dispatch"),
    ("Mesruiyet", "Charter", "Meşruiyet", "Charter"),
]

ROLES_TR = ["Kâtibi", "Raportörü", "Müsteşarı", "Müşaviri", "Kuryesi", "Arşivcisi", "Dizgicisi"]
ROLES_EN = ["Clerk", "Reporter", "Deputy", "Adviser", "Courier", "Archivist", "Setter"]

# Expansion family members: 12 × 7 unique titles (not "{Office} {Role}").
EXP_UNITS = [
    [
        ("Fihristçi", "Indexer"),
        ("Klasörcü", "Folder Hand"),
        ("Zımba Eri", "Punch Hand"),
        ("Evrakçı", "Papers Hand"),
        ("Ciltçi", "Binder"),
        ("Cetvelci", "Ruler Hand"),
        ("Dosya Başkanı", "File Chief"),
    ],
    [
        ("Kaşe Çırağı", "Stamp Junior"),
        ("Vize Eri", "Visa Hand"),
        ("Suretçi", "Copyist"),
        ("Paraf Sırası", "Paraf Queue"),
        ("Paraf Eri", "Paraf Hand"),
        ("Kaşe Ustası", "Stamp Master"),
        ("Paraf Başkanı", "Paraf Chief"),
    ],
    [
        ("Tutanakçı", "Minutes Hand"),
        ("Oturum Eri", "Session Hand"),
        ("Yoklamacı", "Roll Hand"),
        ("Heyet Çırağı", "Panel Junior"),
        ("Karar Yazmanı", "Ruling Hand"),
        ("Söz Tutucu", "Voice Keeper"),
        ("Heyet Başkanı", "Panel Chief"),
    ],
    [
        ("Nöbetçi", "Duty Hand"),
        ("Harita Eri", "Map Hand"),
        ("Masa Eri", "Desk Hand"),
        ("Sevk Eri", "Routing Hand"),
        ("Plan Yazmanı", "Plan Hand"),
        ("Karargâh Çırağı", "Desk Junior"),
        ("Karargâh Başkanı", "Command Chief"),
    ],
    [
        ("Telex Çırağı", "Telex Junior"),
        ("Şeritçi", "Ribbon Hand"),
        ("Hat Eri", "Line Hand"),
        ("Pencere Eri", "Window Hand"),
        ("Tel Yazmanı", "Wire Hand"),
        ("Telex Ustası", "Telex Master"),
        ("Telex Başkanı", "Telex Chief"),
    ],
    [
        ("Not Çırağı", "Note Junior"),
        ("Müzekkere Eri", "Slip Hand"),
        ("Taslakçı", "Draft Hand"),
        ("Cümle Ustası", "Line Master"),
        ("Muhtıra Eri", "Memo Hand"),
        ("Gerekçe Yazmanı", "Reason Hand"),
        ("Muhtıra Başkanı", "Memo Chief"),
    ],
    [
        ("Ek Çırağı", "Annex Junior"),
        ("Dipnotçu", "Note Hand"),
        ("Zeyil Eri", "Annex Hand"),
        ("Madde Yazmanı", "Clause Hand"),
        ("Ek Cetvelci", "Annex Tally"),
        ("Zeyil Ustası", "Annex Master"),
        ("Zeyil Başkanı", "Annex Chief"),
    ],
    [
        ("Gündem Çırağı", "Agenda Junior"),
        ("Sunum Eri", "Brief Hand"),
        ("Not Tutucu", "Note Keeper"),
        ("Soru Yazmanı", "Query Hand"),
        ("Brifing Ustası", "Brief Master"),
        ("Oturum Sözcüsü", "Session Voice"),
        ("Brifing Başkanı", "Brief Chief"),
    ],
    [
        ("Kabine Çırağı", "Cabinet Junior"),
        ("Karar Eri", "Decree Hand"),
        ("Protokolcü", "Protocol Hand"),
        ("Masa Sözcüsü", "Table Voice"),
        ("Gündem Eri", "Agenda Hand"),
        ("Kabine Ustası", "Cabinet Master"),
        ("Kabine Başkanı", "Cabinet Chief"),
    ],
    [
        ("Fiş Çırağı", "Slip Junior"),
        ("Raf Eri", "Shelf Hand"),
        ("Kayıt Eri", "Record Hand"),
        ("Arşiv Çırağı", "Archive Junior"),
        ("Klasör Ustası", "Folder Master"),
        ("Raf Ustası", "Shelf Master"),
        ("Arşiv Başkanı", "Archive Chief"),
    ],
    [
        ("Tevzi Çırağı", "Dist Junior"),
        ("Suret Eri", "Copy Hand"),
        ("Tebliğ Yazmanı", "Writ Hand"),
        ("Kurye Eri", "Runner Hand"),
        ("İade Eri", "Return Hand"),
        ("Tebligat Ustası", "Dispatch Master"),
        ("Tebligat Başkanı", "Dispatch Chief"),
    ],
    [
        ("Şerh Çırağı", "Gloss Junior"),
        ("Usul Eri", "Form Hand"),
        ("Gerekçe Eri", "Grounds Hand"),
        ("Meşruiyet Çırağı", "Charter Junior"),
        ("Karar Şerhçisi", "Gloss Hand"),
        ("Usul Ustası", "Form Master"),
        ("Meşruiyet Başkanı", "Charter Chief"),
    ],
]

BOSSES = [
    ("Ortak Paraf", "Joint Paraf", 0, 1),
    ("Çift Heyet", "Twin Panel", 2, 3),
    ("Telex Kurulu", "Telex Board", 4, 5),
    ("Zeyil Masası", "Annex Board", 6, 7),
    ("Arşiv Kurulu", "Archive Board", 8, 9),
    ("Yazı Heyeti", "Writ Panel", 10, 11),
]

CORE_AUX = [
    (68, 0, 1, 6, 2200, 2000, "Yedek Dosya", "File Reserve"),
    (69, 2, 3, 6, 2300, 1900, "Yedek Heyet", "Panel Reserve"),
    (70, 4, 5, 7, 2500, 2100, "Yedek Telex", "Telex Reserve"),
    (71, 6, 7, 6, 2100, 2200, "Yedek Zeyil", "Annex Reserve"),
    (72, 8, 9, 7, 2600, 2000, "Yedek Kabine", "Cabinet Reserve"),
    (73, 10, 11, 7, 2700, 2200, "Yedek Yazı", "Writ Reserve"),
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
    "Panel Sitting", "Cabinet Note", "Telex Flow", "Redaction Line", "Charter Clause",
    "File Transfer", "Consult Round", "Stamp Drop", "Memo Slip", "Dist List",
    "Cover Letter", "Annex Table", "Agenda Item", "Short Ruling", "Long Rationale",
    "Sign Queue", "Referral Note", "Dispatch Copy", "Reply Letter", "Inner Circular",
    "Outer Letter", "Record Fix", "Page Number", "Footnote Order", "Header Line",
    "Footer Line", "Dist Chart", "Visa Gloss", "Initialled Copy", "Draft Text",
    "Final Text", "Side Protocol", "Interim Line", "Closing Line", "Withdraw Note",
    "Rewrite Pass", "Two Columns", "One Column", "Red Band", "Yellow Band",
    "Closed Copy", "Open Copy", "Internal Note", "External Note", "Crisis Chart",
    "Tempo Note", "Field Note", "Desk Order", "Paper Queue", "Desk Chart",
    "Brief Ledger", "Archive Slip", "Paraf Chart", "Telex Chart", "File Ribbon",
    "Missing Sign", "Extra Paraf", "Early Telex", "Late Dispatch", "Empty Agenda",
    "Full Agenda", "Short Briefing", "Long Briefing", "Quiet Panel", "Noisy Cabinet",
    "Archive Door", "File Spine", "Annex Extra", "Notice Text", "Redaction Trace",
    "Charter Gloss", "Command Note", "Telex Ribbon", "Dist Paper",
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
    "Notice: Early Sign", "Notice: Empty Paraf", "Notice: Wrong Copy", "Notice: Missed Dist",
    "Notice: Closed Archive", "Notice: Open Band", "Notice: Double Agenda", "Notice: Single Sign",
    "Notice: Late Briefing", "Notice: Quiet Panel", "Notice: Loud Desk", "Notice: Red Gloss",
    "Notice: Yellow Gloss", "Notice: No Annex", "Notice: Extra Annex", "Notice: Broken Telex",
    "Notice: Dispatch Back", "Notice: Charter Doubt", "Notice: File Drift", "Notice: Queue Drift",
    "Notice: Visa Refused", "Notice: Referral Back", "Notice: Footnote Fails", "Notice: Cover Fails",
    "Notice: Dist Error", "Notice: Record Fails", "Notice: Copy Mismatch", "Notice: Stamp Mismatch",
    "Notice: Off Agenda", "Notice: Interim Line", "Notice: Not Final", "Notice: Draft Remains",
    "Notice: Taken Final", "Notice: Inner Circular", "Notice: No Outer Leak", "Notice: Brief Cancel",
    "Notice: Cabinet Delay", "Notice: Command Quiet", "Notice: Archive Locked", "Notice: Hard Redact",
    "Notice: Paraf Chain", "Notice: Sign Chain", "Notice: Late Dist", "Notice: Annex Table",
    "Notice: Two Columns", "Notice: One Column", "Notice: Closed Copy", "Notice: Open Copy",
    "Notice: Crisis Chart", "Notice: Broken Tempo", "Notice: Desk Emptied",
]

BAN = (
    "silah", "suikast", "tank", "tutukla", "işkence", "sabotaj", "dinleme",
    "ele geçir", "infaz", "cinayet", "darbe plan", "radyo", "ordu birlik",
    "gözaltı", "bomba", "mermi", "tevkif",
)

ATK_BAND = {
    1: (0, 300),
    2: (300, 800),
    3: (700, 1200),
    4: (1100, 1600),
    5: (1600, 2100),
    6: (1900, 2400),
    7: (2200, 2800),
    8: (2500, 3000),
}
DEF_BAND = {
    1: (200, 800),
    2: (400, 1200),
    3: (600, 1400),
    4: (800, 1600),
    5: (1400, 2200),
    6: (1600, 2400),
    7: (1800, 2600),
    8: (2000, 2800),
}


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


def modifier(value, permanent=False, self=False):
    row = {"op": "modifier", "value": value, "permanent": permanent}
    if self:
        row["self"] = True
    return row


def wrap_discard(effects):
    out = []
    for op in effects:
        if isinstance(op, dict) and op.get("op") == "discard" and not op.get("random"):
            own_hand = op.get("opponent") is not True
            if own_hand:
                out.append(select("discard", own("hand", excludeSource=True), op.get("count") or 1))
        out.append(op)
    return out


def finalize_traits(effects, traits, triggers=None):
    traits = dict(traits or {})
    ops = []

    def walk(x):
        if isinstance(x, dict):
            if x.get("op"):
                ops.append(x["op"])
            for v in x.values():
                walk(v)
        elif isinstance(x, list):
            for v in x:
                walk(v)

    walk(effects)
    walk(triggers or [])
    if any(o in ("summon", "control", "token") for o in ops) and "requiresFreeZone" not in traits:
        traits["requiresFreeZone"] = "units"
    if "set" in ops and "requiresFreeZone" not in traits:
        traits["requiresFreeZone"] = "support"
    return traits


def design(name, text, effects=None, traits=None, triggers=None, series=None, hint=None):
    effects = wrap_discard(effects or [])
    traits = finalize_traits(effects, traits, triggers)
    row = {
        "name": name,
        "text": text,
        "effects": effects,
        "traits": traits,
        "triggers": triggers or [],
    }
    if series:
        row["series"] = series
    if hint:
        row["hint"] = hint
    return row


def band_stat(n, lo, hi):
    steps = max(1, (hi - lo) // 100)
    return lo + ((n * 37 + 13) % (steps + 1)) * 100


def stats_for(level, n):
    alo, ahi = ATK_BAND[level]
    dlo, dhi = DEF_BAND[level]
    atk = band_stat(n, alo, ahi)
    defense = band_stat(n * 3 + 5, dlo, dhi)
    if atk > ahi:
        atk = ahi
    if defense > dhi:
        defense = dhi
    return atk, defense


def hint_for(series_tr, series_en):
    return {
        "tr": f"{series_tr} hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
        "en": f"Protect your {series_en} line; pair this card with a follow-up.",
    }


def pack(n, name_tr, name_en, kind, subtype, series_key, series_list, level, atk, defense,
         loc, text_tr, text_en, effects=None, traits=None, triggers=None, hint=None):
    raw_series = {
        "unit": f"Görevli — {series_key}",
        "spell": f"Emirname — {series_key}",
        "trap": "İhtar",
    }[kind]
    return {
        "raw": {
            "id": f"DRB-{n:03d}",
            "name": name_tr,
            "kind": kind,
            "subtype": subtype,
            "series": raw_series,
            "level": level,
            "attack": atk,
            "defense": defense,
            "deckLocation": loc,
            "text": text_tr,
            "nameEn": name_en,
            "textEn": text_en,
        },
        "design": design(name_en, text_en, effects, traits, triggers, series_list, hint),
        "family": series_key,
        "n": n,
    }


def core_unit_body(n, level, series, t):
    """42 distinct jobs. Stats come from the level band, not the template."""
    name_office = series
    p = 100 + level * 50
    p2 = 200 + level * 50
    atk_mod = 100 + level * 50 + (n % 3) * 50
    text_tr, text_en = "Bu görevli masada durur.", "This officer holds the desk."
    effects, traits, triggers = [], {}, []
    subtype = "effect"

    if t == 0:
        triggers = [on("destroy", [draw()])]
        text_tr, text_en = "Yok olunca 1 kart çek.", "When destroyed, draw 1 card."
    elif t == 1:
        triggers = [on("summon", [draw()])]
        text_tr, text_en = "Çağrılınca 1 kart çek.", "When summoned, draw 1 card."
    elif t == 2:
        triggers = [on("summon", search({"series": series, "kind": "unit"}), normal=True)]
        text_tr = f"Normal çağrıda desteden 1 {name_office} görevlisi eline al."
        text_en = f"When Normal Summoned, add 1 {name_office} officer from deck to hand."
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
        traits = {"aura": {"series": series, "attack": atk_mod, "defense": atk_mod}}
        text_tr = f"{name_office} görevlilerin {atk_mod} ATK/DEF kazanır."
        text_en = f"Your {name_office} officers gain {atk_mod} ATK and DEF."
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
        text_tr, text_en = "Savaşta yok olmaz. Her Hazırlık’ta 200 KP kaybedersin.", "Cannot be destroyed in battle. Lose 200 KP during every Standby."
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
        effects = [{"op": "selfMove", "to": "grave", "reason": "tribute"}, *summon_from("deck", {"series": series, "maxLevel": 3})]
        text_tr, text_en = "Bu kartı parafla gönder; desteden kademe 3 veya altı 1 görevli özel çağır.", "Tribute this card to Special Summon 1 Level 3 or lower officer from deck."
    elif t == 19:
        effects = [select("unit", own()), modifier({"attack": atk_mod})]
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
        effects = [select("trap", enemy("support", kind="trap")), modifier({"negated": True})]
        text_tr, text_en = "Turda bir kez: bir ihtarın etkisini bu tur iptal et.", "Once per turn: negate 1 notice for this turn."
    elif t == 24:
        triggers = [on("summon", summon_from(["hand", "deck"], {"series": series, "maxLevel": 3}))]
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
        text_tr, text_en = "Hazırlık’ta 1 kart çek (sürekli).", "During Standby, draw 1 (continuous)."
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
        amt = 100 + (n % 4) * 50
        text_tr, text_en = f"Çağrılınca {amt} KP kazan.", f"When summoned, gain {amt} KP."

    return subtype, text_tr, text_en, effects, traits, triggers


def core_spell_body(n, series, t):
    subtype = "normal"
    effects, traits, triggers = [], {}, []
    text_tr, text_en = "Emirname masaya iner.", "An order lands on the desk."
    fee = 400 + (n % 5) * 100
    if t == 0:
        effects = [draw(2)]
        text_tr, text_en = "2 kart çek.", "Draw 2 cards."
    elif t == 1:
        effects = [points(600 + (n % 6) * 100, True)]
        text_tr, text_en = f"Rakip {600 + (n % 6) * 100} KP kaybeder.", f"The opponent loses {600 + (n % 6) * 100} KP."
        subtype = "quick"
    elif t == 2:
        effects = search({"kind": "unit", "series": series})
        text_tr, text_en = f"Desteden 1 {series} görevlisi eline al.", f"Add 1 {series} officer from deck to hand."
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
        effects = [select("unit", own()), modifier({"attack": 800})]
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
        effects = []
        traits = {"equip": {"attack": 500}}
        text_tr, text_en = "Kuşanan görevli 500 ATK kazanır.", "The equipped officer gains 500 ATK."
    elif t == 16:
        subtype = "continuous"
        traits = {"aura": {"kind": "unit", "attack": 200}}
        text_tr, text_en = "Görevlilerin 200 ATK kazanır.", "Your officers gain 200 ATK."
    elif t == 17:
        subtype = "field"
        traits = {"aura": {"series": series, "attack": 300, "defense": 300}}
        text_tr, text_en = f"Alan: {series} görevliler 300/300 kazanır.", f"Field: {series} officers gain 300/300."
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
    return subtype, text_tr, text_en, effects, traits, triggers


def core_trap_body(n, t):
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
        effects = [select("unit", own()), modifier({"protectBattleOnce": True})]
        text_tr, text_en = "Bir görevlin bu savaşta bir kez yok olmaz.", "One of your officers cannot be destroyed in this battle once."
    elif t == 16:
        effects = [{"op": "cancelSummonToGrave"}]
        subtype = "counter"
        text_tr, text_en = "Çağrıyı iptal et, kart arşive gider.", "Cancel the summon; the card goes to the archive."
    else:
        effects = [points(500), draw()]
        text_tr, text_en = "500 KP kazan ve 1 kart çek.", "Gain 500 KP and draw 1."
    traits.setdefault("responseTypes", ["attack", "activate", "summon"][t % 3] and ["attack", "activate", "summon"][t % 3:t % 3 + 1] or ["attack"])
    # Keep a real list:
    traits.setdefault("responseTypes", ["attack", "activate", "summon"][t % 3] and ["attack", "activate", "summon"][t % 3:t % 3 + 1] or ["attack"])
    # Keep a real list:
    traits["responseTypes"] = [["attack"], ["activate"], ["summon"], ["destroy"], ["battle-start"]][t % 5]
    return subtype, text_tr, text_en, effects, traits, triggers


def expansion_unit(n, f, r):
    series, se, series_tr, se_en = FAMILIES[f]
    name_tr, name_en = EXP_UNITS[f][r]
    fee = 300 + f * 50
    atk = [600, 900, 800, 1200, 700, 1100, 1900][r] + (f % 3) * 100
    defense = [900, 700, 1600, 1200, 800, 1000, 1800][r]
    level = 5 if r == 6 else 2 if r == 4 else 3
    effects, traits, triggers = [], {}, []
    if r == 0:
        amt = 250 + f * 25
        tr = f"Normal çağrıldığında arşivinden kademe 2 veya altı 1 {series_tr} görevlisini eline al, ardından {amt} KP kazan."
        en = f"When Normal Summoned, return 1 Level 2 or lower {se_en} officer from your archive to your hand, then gain {amt} KP."
        triggers = [on("summon", [
            select("return", own("grave", kind="unit", series=series, maxLevel=2)),
            move("hand"),
            points(amt),
        ], normal=True)]
    elif r == 1:
        if f % 3 == 1:
            tr = f"Turda bir: {fee} KP öde; oyun dışındaki kademe 4 veya altı 1 {series_tr} görevlisini eline al."
            en = f"Once per turn: pay {fee} KP; return 1 banished Level 4 or lower {se_en} officer to your hand."
            effects = [points(-fee), select("rescue", own("banished", series=series, kind="unit", maxLevel=4)), move("hand")]
        elif f % 3 == 2:
            tr = f"Turda bir: {fee} KP öde; rakibin kapalı 1 kartına bak, ardından 1 {series_tr} görevlisine bu tur 400 DEF ver."
            en = f"Once per turn: pay {fee} KP; look at 1 opposing face-down card, then give 1 {se_en} officer 400 DEF this turn."
            effects = [
                points(-fee),
                select("peek", enemy(["units", "support"], face="down")),
                {"op": "reveal"},
                select("guard", own("units", series=series)),
                modifier({"defense": 400}),
            ]
        else:
            tr = f"Turda bir: {fee} KP öde; arşivinden 1 {series_tr} görevlisini eline al. Bu tur kriz aşamasını atla."
            en = f"Once per turn: pay {fee} KP; return 1 {se_en} officer from your archive to your hand. Skip Crisis this turn."
            effects = [points(-fee), select("recover", own("grave", series=series, kind="unit")), move("hand"), {"op": "skipBattle"}]
    elif r == 2:
        if f % 3 == 1:
            tr = f"Puanın {3000 + f * 100} altındayken 600 DEF kazanır. Açıldığında 1 {series_tr} görevlisini savunmaya geçir."
            en = f"Gains 600 DEF while your points are below {3000 + f * 100}. When flipped, change 1 {se_en} officer to defense."
            traits = {"conditionalStats": {"condition": "pointsBelow", "threshold": 3000 + f * 100, "defense": 600}}
            triggers = [on("flip", [select("shelter", own("units", series=series)), {"op": "position", "position": "defense"}])]
        elif f % 3 == 2:
            amt = 400 + f * 50
            tr = f"Başka bir {series_tr} görevlin varken 500 ATK kazanır. Parafla gönderilince {amt} KP kazan."
            en = f"Gains 500 ATK while you control another {se_en} officer. When tributed, gain {amt} KP."
            traits = {"conditionalStats": {"condition": "otherSeries", "series": series, "attack": 500}}
            triggers = [on("tribute", [points(amt)])]
        else:
            tr = f"Başka bir {series_tr} görevlin varken {400 + (f % 3) * 100} DEF kazanır. Setten açılınca rakibin kapalı 1 destek kartına bak."
            en = f"Gains {400 + (f % 3) * 100} DEF while you control another {se_en} officer. When flipped, look at 1 opposing face-down support card."
            traits = {"conditionalStats": {"condition": "otherSeries", "series": series, "defense": 400 + (f % 3) * 100}}
            triggers = [on("flip", [select("look", enemy("support", face="down")), {"op": "reveal"}])]
    elif r == 3:
        drain = 200 + f * 25
        if f % 3 == 1:
            tr = f"Sahadaki kademe 3 veya altı {series_tr} görevliler 400 DEF kazanır. Kendi Hazırlık aşamanda {drain} KP kaybet."
            en = f"Level 3 or lower {se_en} officers on the field gain 400 DEF. During your Standby Phase, lose {drain} KP."
            traits = {"aura": {"series": series, "maxLevel": 3, "defense": 400}}
            triggers = [on("standby", [points(-drain)], **{"global": True, "own": True})]
        elif f % 3 == 2:
            tr = f"Kapalı ihtarın varken 400 ATK kazanır. Turda bir: {fee} KP öde; 1 {series_tr} görevlisine bu tur 500 DEF ver."
            en = f"Gains 400 ATK while you control a Set notice. Once per turn: pay {fee} KP; give 1 {se_en} officer 500 DEF this turn."
            traits = {"conditionalStats": {"condition": "ownSetTrap", "attack": 400}}
            effects = [points(-fee), select("cover", own("units", series=series)), modifier({"defense": 500})]
            triggers = []
        else:
            aura = 150 + (f % 3) * 50
            tr = f"Sahadaki {series_tr} görevliler {aura} ATK kazanır. Kendi Hazırlık aşamanda {drain} KP kaybet."
            en = f"{se_en} officers on the field gain {aura} ATK. During your Standby Phase, lose {drain} KP."
            traits = {"aura": {"series": series, "attack": aura}}
            triggers = [on("standby", [points(-drain)], **{"global": True, "own": True})]
    elif r == 4:
        if f % 3 == 1:
            tr = f"Bu kartı parafla gönder: arşivinden kademe 3 veya altı 1 {series_tr} görevlisini özel çağır; bu tur kriz aşamasını atla."
            en = f"Tribute this card: Special Summon 1 Level 3 or lower {se_en} officer from your archive; skip Crisis this turn."
            effects = [{"op": "selfMove", "to": "grave", "reason": "tribute"}, *summon_from("grave", {"series": series, "maxLevel": 3}), {"op": "skipBattle"}]
        elif f % 3 == 2:
            tr = f"Bu kartı parafla gönder: oyun dışındaki 1 {series_tr} görevlisini eline al, sonra 300 KP kazan."
            en = f"Tribute this card: return 1 banished {se_en} officer to your hand, then gain 300 KP."
            effects = [{"op": "selfMove", "to": "grave", "reason": "tribute"}, select("rescue", own("banished", series=series, kind="unit")), move("hand"), points(300)]
        else:
            buff = 400 + f * 25
            tr = f"Turda bir: {fee} KP öde; başka bir {series_tr} görevlisine bu tur {buff} ATK ver; bu kart bu tur 200 DEF kazanır."
            en = f"Once per turn: pay {fee} KP; give another {se_en} officer {buff} ATK this turn; this card gains 200 DEF this turn."
            effects = [
                points(-fee),
                select("partner", own("units", series=series, excludeSource=True)),
                modifier({"attack": buff}),
                {"op": "modifier", "self": True, "value": {"defense": 200}},
            ]
    elif r == 5:
        if f % 3 == 1:
            tr = f"Turda bir: {fee + 250} KP öde; rakibin açık 1 destek kartını eline gönder. Bir {series_tr} görevlin bulunmalı."
            en = f"Once per turn: pay {fee + 250} KP; return 1 opposing face-up support card to its owner's hand. You must control a {se_en} officer."
            effects = [points(-fee - 250), select("support", enemy("support", face="up")), move("hand")]
            traits = {"requiresSeries": series}
        elif f % 3 == 2:
            tr = f"Turda bir: {fee + 250} KP öde; rakibin arşivindeki kademe 4 veya altı 1 görevliyi oyun dışına gönder, ardından 1 {series_tr} görevlisine bu tur 200 ATK ver."
            en = f"Once per turn: pay {fee + 250} KP; banish 1 Level 4 or lower officer from the opposing archive, then give 1 {se_en} officer 200 ATK this turn."
            effects = [
                points(-fee - 250),
                select("deny", enemy("grave", kind="unit", maxLevel=4)),
                move("banished"),
                select("ally", own("units", series=series)),
                modifier({"attack": 200}),
            ]
        else:
            loss = 350 + f * 25
            cap = 2 + (f % 3)
            tr = f"Bu kartı parafla gönder: rakibin arşivindeki kademe {cap} veya altı 1 görevliyi oyun dışına gönder, sonra rakip {loss} KP kaybeder."
            en = f"Tribute this card: banish 1 Level {cap} or lower officer from the opposing archive, then the opponent loses {loss} KP."
            effects = [
                {"op": "selfMove", "to": "grave", "reason": "tribute"},
                select("deny", enemy("grave", kind="unit")),
                move("banished"),
                points(-loss, True),
            ]
    else:
        tr = f"Çağırmak için 1 paraf gerekir. Her çağrı parafı için 200 ATK kazanır. Savaşta yok olduğunda arşivinden kademe 3 veya altı 1 {series_tr} görevlisini eline al."
        en = f"Requires 1 countersignature to summon. Gains 200 ATK for each summon tribute. When destroyed in battle, return 1 Level 3 or lower {se_en} officer from your archive to your hand."
        traits = {"tributeAttack": 200}
        triggers = [on("destroy", [
            select("successor", own("grave", series=series, kind="unit", maxLevel=3)),
            move("hand"),
        ], reason="battle")]

    return pack(
        n, name_tr, name_en, "unit", "effect", series, [series],
        level, atk, defense, "main", tr, en, effects, traits, triggers,
        hint_for(series_tr, se_en),
    )


def expansion_spell(n, i):
    f = i % 12
    tier = i // 12
    series, se, series_tr, se_en = FAMILIES[f]
    name_tr, name_en = SPELL_TR[44 + i], SPELL_EN[44 + i]
    fee = 400 + f * 50
    effects, traits, triggers = [], {}, []
    subtype = "normal"
    if tier == 0:
        if f % 4 == 1:
            tr = f"{fee} KP öde; destenin üst {2 + f // 4} kartına bak, aralarından en fazla 1 görevliyi eline al; kalanları aynı sırayla üste bırak. Bir {series_tr} görevlin bulunmalı."
            en = f"Pay {fee} KP; look at the top {2 + f // 4} cards of your deck, take up to 1 officer and leave the rest on top in order. You must control a {se_en} officer."
            effects = [points(-fee), {"op": "look", "count": 2 + f // 4, "take": 1, "kind": "unit"}]
            traits = {"requiresSeries": series}
        elif f % 4 == 2:
            tr = f"{fee} KP öde; arşivindeki 1 {series_tr} görevlisini eline al, ardından rakip arşivindeki 1 görevliyi oyun dışına gönder."
            en = f"Pay {fee} KP; return 1 {se_en} officer from your archive to your hand, then banish 1 officer from the opposing archive."
            effects = [
                points(-fee),
                select("recover", own("grave", series=series, kind="unit")),
                move("hand"),
                select("deny", enemy("grave", kind="unit")),
                move("banished"),
            ]
        elif f % 4 == 3:
            tr = f"{fee} KP öde; rakibin açık 1 destek kartını eline gönder, ardından 1 {series_tr} görevlisine bu tur 300 DEF ver."
            en = f"Pay {fee} KP; return 1 opposing face-up support card to its owner's hand, then give 1 {se_en} officer 300 DEF this turn."
            effects = [
                points(-fee),
                select("evict", enemy("support", face="up")),
                move("hand"),
                select("guard", own("units", series=series)),
                modifier({"defense": 300}),
            ]
        else:
            tr = f"{fee} KP öde; desteden kademe 4 veya altı 1 {series_tr} görevlisini eline al, desteni karıştır, sonra elinden 1 kart bırak."
            en = f"Pay {fee} KP; add 1 Level 4 or lower {se_en} officer from your deck to your hand, shuffle, then discard 1 card."
            effects = [points(-fee), *search({"series": series, "kind": "unit", "maxLevel": 4}), discard(1)]
    elif tier == 1:
        if f % 4 == 1:
            tr = f"{fee + 200} KP öde; arşivindeki 1 ihtarı destek bölgesine set et. Bir {series_tr} görevlin bulunmalı."
            en = f"Pay {fee + 200} KP; Set 1 notice from your archive into a support zone. You must control a {se_en} officer."
            effects = [points(-fee - 200), select("reset", own("grave", kind="trap")), {"op": "set"}]
            traits = {"requiresSeries": series}
        elif f % 4 == 2:
            tr = f"{fee + 200} KP öde; rakibin arşivindeki 1 görevliyi oyun dışına gönder ve 1 kart çek. Bir {series_tr} görevlin bulunmalı."
            en = f"Pay {fee + 200} KP; banish 1 officer from the opposing archive and draw 1 card. You must control a {se_en} officer."
            effects = [points(-fee - 200), select("deny", enemy("grave", kind="unit")), move("banished"), draw()]
            traits = {"requiresSeries": series}
        elif f % 4 == 3:
            cap = 2 + f // 4
            tr = f"{fee + 600} KP öde; rakibin açık kademe {cap} veya altı 1 görevlisinin kontrolünü bu tur al. Bir {series_tr} görevlin ve boş birim bölgen bulunmalı."
            en = f"Pay {fee + 600} KP; take control of 1 opposing face-up Level {cap} or lower officer for this turn. You need a {se_en} officer and an empty unit zone."
            effects = [points(-fee - 600), select("borrow", enemy("units", face="up", maxLevel=cap)), {"op": "control"}]
            traits = {"requiresSeries": series}
        else:
            tr = f"{fee + 200} KP öde; arşivinden kademe 3 veya altı 1 {series_tr} görevlisini özel çağır. Bu tur kriz aşamasını atla."
            en = f"Pay {fee + 200} KP; Special Summon 1 Level 3 or lower {se_en} officer from your archive. Skip Crisis this turn."
            effects = [points(-fee - 200), *summon_from("grave", {"series": series, "maxLevel": 3}), {"op": "skipBattle"}]
    elif tier == 2:
        subtype = "equip"
        if f % 3 == 1:
            tr = f"Donatılan görevli {350 + f * 25} ATK kazanır ama 200 DEF kaybeder. Sahadaki {series_tr} görevliler 100 DEF kazanır."
            en = f"The equipped officer gains {350 + f * 25} ATK but loses 200 DEF. {se_en} officers on the field gain 100 DEF."
            traits = {"equip": {"attack": 350 + f * 25, "defense": -200}, "aura": {"series": series, "defense": 100}}
        elif f % 3 == 2:
            tr = f"Donatılan görevli 300 DEF kazanır. Sahadaki kademe 3 veya altı {series_tr} görevliler {150 + f * 25} ATK kazanır."
            en = f"The equipped officer gains 300 DEF. Level 3 or lower {se_en} officers on the field gain {150 + f * 25} ATK."
            traits = {"equip": {"defense": 300}, "aura": {"series": series, "maxLevel": 3, "attack": 150 + f * 25}}
        else:
            tr = f"Donatılan görevli {300 + f * 25} DEF kazanır. Sahadaki {series_tr} görevliler 150 ATK kazanır."
            en = f"The equipped officer gains {300 + f * 25} DEF. {se_en} officers on the field gain 150 ATK."
            traits = {"equip": {"defense": 300 + f * 25}, "aura": {"series": series, "attack": 150}}
        effects = []
    else:
        tr = "1200 KP öde; 2 kart çek, ardından elinden 2 kart bırak ve bu tur kriz aşamasını atla."
        en = "Pay 1200 KP; draw 2 cards, then discard 2 cards and skip Crisis this turn."
        effects = [points(-1200), draw(2), discard(2), {"op": "skipBattle"}]
    return pack(
        n, name_tr, name_en, "spell", subtype, series, [series],
        0, 0, 0, "main", tr, en, effects, traits, triggers,
        hint_for(series_tr, se_en),
    )


def expansion_trap(n, i):
    f = i % 12
    series, se, series_tr, se_en = FAMILIES[f]
    name_tr, name_en = TRAP_TR[26 + i], TRAP_EN[26 + i]
    fee = 350 + f * 50
    if i < 12:
        tr = f"Rakip saldırı ilan ettiğinde: {fee} KP öde; saldırıyı iptal et, ardından arşivinden kademe 2 veya altı 1 {series_tr} görevlisini eline al."
        en = f"When the opponent declares an attack: pay {fee} KP; cancel the attack, then return 1 Level 2 or lower {se_en} officer from your archive to your hand."
        effects = [
            points(-fee),
            {"op": "cancelAttack"},
            select("recover", own("grave", series=series, kind="unit", maxLevel=2)),
            move("hand"),
        ]
        traits = {"responseTypes": ["attack"]}
    elif i < 24:
        tr = f"Rakip bir destek kartı etkinleştirdiğinde: {fee + 400} KP öde; etkinleştirmeyi etkisizleştir, ardından 1 {series_tr} görevlisine bu tur 300 DEF ver."
        en = f"When the opponent activates a support card: pay {fee + 400} KP; negate the activation, then give 1 {se_en} officer 300 DEF this turn."
        effects = [
            points(-fee - 400),
            {"op": "negate"},
            select("cover", own("units", series=series)),
            modifier({"defense": 300}),
        ]
        traits = {"responseTypes": ["activate"], "responseKinds": ["spell", "trap"]}
    else:
        tr = "Düelloda bir: rakip doğrudan saldırı ilan ettiğinde 1000 KP öde; saldırıyı iptal et ve 1 kart çek."
        en = "Once per duel: when the opponent declares a direct attack, pay 1000 KP; cancel the attack and draw 1 card."
        effects = [points(-1000), {"op": "cancelAttack"}, draw()]
        traits = {"responseTypes": ["attack"], "directOnly": True, "oncePerDuel": True}
    return pack(
        n, name_tr, name_en, "trap", "normal", series, [series, "İhtar"],
        0, 0, 0, "main", tr, en, effects, traits, [],
        hint_for(series_tr, se_en),
    )


def build_core_units():
    aux_by_n = {row[0]: row for row in CORE_AUX}
    main_levels = [2] * 12 + [1] * 4 + [3] * 16 + [4] * 22 + [5] * 10 + [6] * 3 + [7] * 3 + [8] * 4
    assert len(main_levels) == 74
    main_i = 0
    out = []
    for i in range(80):
        n = i + 1
        if n in aux_by_n:
            _, fa, fb, level, atk, defense, name_tr, name_en = aux_by_n[n]
            sa, sea, satr, saen = FAMILIES[fa]
            sb, seb, sbtr, sben = FAMILIES[fb]
            fee = 700 + (n % 5) * 100
            tr = f"Yedek heyet: 1 {satr} ve 1 {sbtr} görevlisi malzeme. Turda bir: {fee} KP öde; rakibin 1 açık destek kartını eline gönder."
            en = f"Reserve panel: 1 {saen} and 1 {sben} officer as materials. Once per turn: pay {fee} KP; return 1 opposing face-up support card to its owner's hand."
            effects = [points(-fee), select("support", enemy("support", face="up")), move("hand")]
            traits = {"materials": {"series": [sa, sb]}}
            out.append(pack(
                n, name_tr, name_en, "unit", "fusion", sa, [sa, sb],
                level, atk, defense, "auxiliary", tr, en, effects, traits, [],
            ))
            continue
        fam_i = main_i % 12
        level = main_levels[main_i]
        main_i += 1
        series, se, series_tr, se_en = FAMILIES[fam_i]
        role_i = (n // 12) % len(ROLES_TR)
        name_tr = f"{series_tr} {ROLES_TR[role_i]}"
        name_en = f"{se_en} {ROLES_EN[role_i]}"
        # Disambiguate if the same office+role repeats.
        if n > 12 * len(ROLES_TR):
            name_tr = f"{name_tr} {n}"
            name_en = f"{name_en} {n}"
        t = (n * 5 + 13) % 42
        atk, defense = stats_for(level, n)
        subtype, text_tr, text_en, effects, traits, triggers = core_unit_body(n, level, series, t)
        out.append(pack(
            n, name_tr, name_en, "unit", subtype, series, [series],
            level, atk, defense, "main", text_tr, text_en, effects, traits, triggers,
        ))
    assert main_i == 74
    return out


def build():
    cards = []
    cards.extend(build_core_units())
    assert len(cards) == 80

    for i in range(44):
        n = 81 + i
        series, se, series_tr, se_en = FAMILIES[i % 12]
        t = (n * 11 + 5) % 24
        subtype, text_tr, text_en, effects, traits, triggers = core_spell_body(n, series, t)
        cards.append(pack(
            n, SPELL_TR[i], SPELL_EN[i], "spell", subtype, series, [series],
            0, 0, 0, "main", text_tr, text_en, effects, traits, triggers,
        ))
    for i in range(26):
        n = 125 + i
        series, se, series_tr, se_en = FAMILIES[i % 12]
        t = (n * 13 + 3) % 18
        subtype, text_tr, text_en, effects, traits, triggers = core_trap_body(n, t)
        cards.append(pack(
            n, TRAP_TR[i], TRAP_EN[i], "trap", subtype, series, ["İhtar"],
            0, 0, 0, "main", text_tr, text_en, effects, traits, triggers,
        ))
    assert len(cards) == 150

    for f in range(12):
        for r in range(7):
            n = 151 + f * 7 + r
            cards.append(expansion_unit(n, f, r))
    for i, (name_tr, name_en, fa, fb) in enumerate(BOSSES):
        n = 235 + i
        sa, sea, satr, saen = FAMILIES[fa]
        sb, seb, sbtr, sben = FAMILIES[fb]
        fee = 700 + i * 100
        atk = 2300 + i * 100
        defense = 2000 + i * 100
        # Repair II: this expansion boss family is the ONLY fusion family
        # whose materials must already be standing on the field. The default
        # (core DRB-068..073, untouched) draws materials from hand+units,
        # which let an opener special-summon straight out of the opening
        # hand for a paraf fee alone -- a same-turn 2300-2800 ATK body with
        # zero board investment and zero tempo cost. Restricting these six
        # bosses to on-field materials keeps them a payoff for units already
        # committed to the board instead of a hand-fusion opening bomb.
        tr = f"Yedek heyet: sahadaki 1 {satr} ve 1 {sbtr} görevlisi malzeme. Turda bir: {fee} KP öde; rakibin 1 açık destek kartını eline gönder."
        en = f"Reserve panel: 1 {saen} and 1 {sben} officer on the field as materials. Once per turn: pay {fee} KP; return 1 opposing face-up support card to its owner's hand."
        effects = [points(-fee), select("support", enemy("support", face="up")), move("hand")]
        traits = {"materials": {"series": [sa, sb], "zones": ["units"]}}
        cards.append(pack(
            n, name_tr, name_en, "unit", "fusion", sa, [sa, sb],
            7, atk, defense, "auxiliary", tr, en, effects, traits, [],
            hint_for(satr, saen),
        ))
    for i in range(35):
        n = 241 + i
        cards.append(expansion_spell(n, i))
    for i in range(25):
        n = 276 + i
        cards.append(expansion_trap(n, i))

    assert len(cards) == 300, len(cards)
    ids = [c["raw"]["id"] for c in cards]
    assert ids == [f"DRB-{i:03d}" for i in range(1, 301)]
    tr_names = [c["raw"]["name"] for c in cards]
    en_names = [c["raw"]["nameEn"] for c in cards]
    assert len(set(tr_names)) == 300, f"dup TR {len(set(tr_names))}"
    assert len(set(en_names)) == 300, f"dup EN {len(set(en_names))}"
    for c in cards:
        raw = c["raw"]
        assert len(raw["name"]) <= 24, f"{raw['id']} TR {raw['name']!r} {len(raw['name'])}"
        assert len(raw["nameEn"]) <= 24, f"{raw['id']} EN {raw['nameEn']!r} {len(raw['nameEn'])}"
        assert "'" not in raw["text"], f"{raw['id']} ASCII apostrophe in TR text"
        if raw["kind"] == "unit" and raw["id"].endswith(tuple(f"{k:03d}" for k in range(151, 241))):
            assert c["design"].get("hint"), raw["id"]
        if int(raw["id"][4:]) > 150:
            assert c["design"].get("hint"), raw["id"]
            if raw["kind"] == "trap":
                assert "İhtar" in c["design"]["series"], raw["id"]
                assert c["design"]["traits"].get("responseTypes"), raw["id"]
        for trig in c["design"].get("triggers") or []:
            if int(raw["id"][4:]) > 150:
                assert trig["event"] in ("summon", "flip", "standby", "tribute", "destroy"), (raw["id"], trig["event"])
                if trig["event"] == "summon":
                    assert raw["level"] <= 4, raw["id"]
                if trig["event"] in ("standby", "tribute"):
                    assert trig["effects"] and trig["effects"][0]["op"] == "points", raw["id"]

    blob = json.dumps(cards, ensure_ascii=False).lower()
    for bad in BAN:
        if bad in blob:
            raise SystemExit(f"safety hit: {bad}")

    kinds = {}
    for c in cards:
        kinds[c["raw"]["kind"]] = kinds.get(c["raw"]["kind"], 0) + 1
    first = cards[:150]
    exp = cards[150:]
    def ck(rows):
        d = {"unit": 0, "spell": 0, "trap": 0}
        for c in rows:
            d[c["raw"]["kind"]] += 1
        return d
    assert ck(first) == {"unit": 80, "spell": 44, "trap": 26}, ck(first)
    assert ck(exp) == {"unit": 90, "spell": 35, "trap": 25}, ck(exp)
    assert kinds == {"unit": 170, "spell": 79, "trap": 51}, kinds
    aux_n = sum(1 for c in cards if c["raw"]["deckLocation"] == "auxiliary")
    assert aux_n == 12, aux_n

    source = [c["raw"] for c in cards]
    designs = {int(c["raw"]["id"][4:]): c["design"] for c in cards}
    (ROOT / "source-cards.json").write_text(
        json.dumps(source, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (ROOT / "designs.js").write_text(
        "export const designs = " + json.dumps(designs, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )

    write_decks(cards)

    from collections import defaultdict
    from statistics import mean, median
    lv = defaultdict(list)
    for c in source:
        if c["kind"] == "unit":
            lv[c["level"]].append((c["attack"], c["defense"]))
    curve = {}
    for L in sorted(lv):
        a = [x[0] for x in lv[L]]
        d = [x[1] for x in lv[L]]
        curve[L] = {
            "n": len(a),
            "atk": {"min": min(a), "med": int(median(a)), "mean": round(mean(a)), "max": max(a)},
            "def": {"min": min(d), "med": int(median(d)), "mean": round(mean(d)), "max": max(d)},
            "body_mean": round(mean(x + y for x, y in lv[L])),
        }
    print(json.dumps({"n": 300, "kinds": kinds, "aux": aux_n, "first": ck(first), "exp": ck(exp), "curve": curve}, ensure_ascii=False, indent=2))


def write_decks(cards):
    main_units = [c for c in cards if c["raw"]["kind"] == "unit" and c["raw"]["deckLocation"] == "main"]
    spells = [c for c in cards if c["raw"]["kind"] == "spell"]
    traps = [c for c in cards if c["raw"]["kind"] == "trap"]
    aux = [c for c in cards if c["raw"]["deckLocation"] == "auxiliary"]

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
    # Authored 40-card desks. Mixed free/paid on every list. Engines that won
    # the inverted-curve era (standby draw, extra Normal, free L8 direct) are
    # split across identities instead of stacked on Muhtıra.
    authored = {
        "muhtira": {
            "units": [
                ("DRB-006", 2), ("DRB-190", 2),
                ("DRB-018", 2), ("DRB-186", 2), ("DRB-187", 2), ("DRB-188", 1),
                ("DRB-038", 2), ("DRB-050", 2), ("DRB-036", 2),
                ("DRB-192", 1), ("DRB-206", 1), ("DRB-056", 1), ("DRB-164", 1), ("DRB-060", 1),
                ("DRB-074", 1),
            ],
            "spells": [
                ("DRB-088", 2), ("DRB-094", 2), ("DRB-246", 2), ("DRB-258", 2),
                ("DRB-270", 1), ("DRB-122", 2),
            ],
            "traps": [("DRB-130", 2), ("DRB-131", 2), ("DRB-138", 2)],
            "aux": "DRB-237",
        },
        "tebligat": {
            "units": [
                ("DRB-001", 2),
                ("DRB-023", 2), ("DRB-221", 2), ("DRB-222", 1),
                ("DRB-035", 2), ("DRB-047", 2), ("DRB-041", 2), ("DRB-053", 2), ("DRB-037", 2),
                ("DRB-059", 1), ("DRB-157", 1), ("DRB-185", 1), ("DRB-061", 1), ("DRB-227", 1),
                ("DRB-077", 1),
            ],
            "spells": [
                ("DRB-081", 2), ("DRB-109", 2), ("DRB-115", 2), ("DRB-245", 2),
                ("DRB-097", 2), ("DRB-257", 1),
            ],
            "traps": [("DRB-147", 2), ("DRB-141", 2), ("DRB-286", 2)],
            "aux": "DRB-240",
        },
        "karargah": {
            "units": [
                ("DRB-004", 2), ("DRB-169", 1),
                ("DRB-027", 2), ("DRB-028", 2), ("DRB-175", 2), ("DRB-210", 1), ("DRB-172", 1),
                ("DRB-033", 1), ("DRB-045", 2), ("DRB-051", 1), ("DRB-040", 2),
                ("DRB-064", 1), ("DRB-063", 1), ("DRB-178", 1), ("DRB-057", 1),
                ("DRB-065", 1),
                ("DRB-074", 1),
            ],
            "spells": [
                ("DRB-115", 2), ("DRB-116", 2), ("DRB-118", 2), ("DRB-087", 2),
                ("DRB-244", 2), ("DRB-261", 1),
            ],
            "traps": [("DRB-127", 2), ("DRB-136", 2), ("DRB-278", 2)],
            "aux": "DRB-236",
        },
        "istisare": {
            "units": [
                ("DRB-012", 2), ("DRB-002", 2),
                ("DRB-200", 2), ("DRB-231", 2), ("DRB-024", 2), ("DRB-018", 2),
                ("DRB-042", 2), ("DRB-054", 2), ("DRB-048", 1),
                ("DRB-206", 1), ("DRB-164", 1), ("DRB-234", 1), ("DRB-056", 1), ("DRB-060", 1),
                ("DRB-078", 1),
            ],
            "spells": [
                ("DRB-092", 2), ("DRB-113", 2), ("DRB-089", 2), ("DRB-088", 2),
                ("DRB-104", 2), ("DRB-264", 1),
            ],
            "traps": [("DRB-133", 2), ("DRB-134", 2), ("DRB-289", 2)],
            "aux": "DRB-239",
        },
        "zeyilname": {
            "units": [
                ("DRB-007", 2), ("DRB-010", 1),
                ("DRB-214", 2), ("DRB-031", 2), ("DRB-198", 2), ("DRB-022", 1),
                ("DRB-034", 2), ("DRB-043", 2), ("DRB-046", 2), ("DRB-037", 1),
                ("DRB-055", 1), ("DRB-058", 1), ("DRB-220", 1), ("DRB-199", 1), ("DRB-061", 1),
                ("DRB-079", 1),
            ],
            "spells": [
                ("DRB-247", 2), ("DRB-109", 2), ("DRB-123", 2), ("DRB-111", 2),
                ("DRB-262", 2), ("DRB-081", 1),
            ],
            "traps": [("DRB-139", 2), ("DRB-132", 2), ("DRB-148", 2)],
            "aux": "DRB-238",
        },
    }

    by_id = {c["raw"]["id"]: c for c in cards}
    decks = []
    for deck_id, plan in authored.items():
        entries = []
        kinds = {"unit": 0, "spell": 0, "trap": 0}
        middle = 0
        bosses = set()
        copies = {}
        for group in ("units", "spells", "traps"):
            for cid, count in plan[group]:
                card = by_id[cid]["raw"]
                assert card["deckLocation"] == "main", cid
                kinds[card["kind"]] += count
                copies[card["name"]] = copies.get(card["name"], 0) + count
                assert copies[card["name"]] <= 3, (deck_id, cid)
                if 5 <= card["level"] <= 6:
                    middle += count
                if card["level"] >= 7:
                    bosses.add(card["name"])
                entries.append({"id": cid, "count": count})
        total = sum(kinds.values())
        assert total == 40, (deck_id, total, kinds)
        assert 22 <= kinds["unit"] <= 24, (deck_id, kinds)
        assert 10 <= kinds["spell"] <= 12, (deck_id, kinds)
        assert 6 <= kinds["trap"] <= 8, (deck_id, kinds)
        assert middle <= 6, (deck_id, middle)
        assert len(bosses) <= 2, (deck_id, bosses)
        aux_id = plan["aux"]
        assert by_id[aux_id]["raw"]["deckLocation"] == "auxiliary", aux_id
        decks.append({
            "id": deck_id,
            "name": names[deck_id],
            "blurb": blurbs[deck_id],
            "cards": entries,
            "auxiliary": [{"id": aux_id, "count": 1}],
        })

    (ROOT / "decks.json").write_text(
        json.dumps({"schemaVersion": 1, "theme": "darbe-h", "decks": decks}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    build()
