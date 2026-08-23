export type Risk = "Düşük" | "Orta" | "Yüksek" | "Çok Yüksek" | "Kritik";

export type ItemKind = "weapon" | "armor" | "vehicle" | "luxury";

export type NeighborhoodId = "eyup" | "tarlabasi" | "kadikoy" | "sultangazi";

export type TabId =
  | "ben"
  | "icraat"
  | "tezgah"
  | "emlak"
  | "sokak"
  | "hayat"
  | "klinik";

export type PlayerStatus = "serbest" | "nezaret" | "klinik";

export type CrewId = "gozcu" | "sofor" | "tahsil" | "tetik" | "avukat";

export type RelAct =
  | "flort"
  | "hediye"
  | "randevu"
  | "sevgili"
  | "baslat"
  | "gece"
  | "evlen"
  | "bitir";

export type FamilyChoice = "evlen" | "ustlen" | "reddet";

export interface PendingFamily {
  partnerId: string;
  name: string;
}

export type GambleKind = "rulet" | "blackjack" | "slot" | "kazi";

export type InvestId = "altin" | "usd" | "usdt";

export interface Market {
  altin: number;
  usd: number;
  usdt: number;
}

export type LifeId =
  | "bira"
  | "raki"
  | "esrar"
  | "pavyon"
  | "okey"
  | "evlen"
  | "bosan"
  | "cocuk";

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  attackBonus: number;
  defenseBonus: number;
  desc: string;
  kind: ItemKind;
  itibarBonus?: number;
}

export interface Mission {
  id: string;
  name: string;
  energyCost: number;
  rewardCashMin: number;
  rewardCashMax: number;
  xpGain: number;
  risk: Risk;
  requiredItems?: string[];
  desc: string;
}

export interface JobTier {
  tier: number;
  title: string;
  missions: Mission[];
}

export interface Estate {
  id: string;
  name: string;
  cost: number;
  hourlyIncome: number;
  desc: string;
  kind?: "is" | "konut";
  prestige?: number;
}

export interface Rival {
  id: string;
  name: string;
  title: string;
  level: number;
  cash: number;
  health: number;
  attack: number;
  defense: number;
  alive: boolean;
  bounty: number;
  hospitalTicks: number;
  hood: NeighborhoodId;
}

export interface Senet {
  kind: "alacak" | "borc";
  name: string;
  amount: number;
  dueGun: number;
  rivalId?: string;
}

export interface CrewDef {
  id: CrewId;
  name: string;
  role: string;
  wage: number;
  hire: number;
  itibar: number;
  perk: string;
}

export interface Partner {
  id: string;
  name: string;
  title: string;
  desc: string;
  gift: number;
  date: number;
}

export interface Horse {
  name: string;
  speed: number;
  form: number;
}

export interface RaceEntry {
  name: string;
  odds: number;
}

export interface ContractDef {
  id: string;
  npc: string;
  missionId: string;
  bonus: number;
  text: string;
}

export interface LogEntry {
  id: string;
  at: number;
  kind:
    | "job"
    | "pvp"
    | "shop"
    | "estate"
    | "system"
    | "jail"
    | "clinic"
    | "bounty"
    | "crew"
    | "bank"
    | "turf"
    | "contract"
    | "life"
    | "invest";
  text: string;
  moneyDelta?: number;
}

export interface Player {
  name: string;
  neighborhood: NeighborhoodId;
  level: number;
  xp: number;
  energy: number;
  stamina: number;
  health: number;
  cash: number;
  rusvet: number;
  itibar: number;
  inventory: string[];
  equippedWeapon: string | null;
  equippedArmor: string | null;
  equippedVehicle: string | null;
  properties: string[];
  gun: number;
  saat: number;
  dakika: number;
  durum: PlayerStatus;
  durumTick: number;
  incomeMult: number;
  eventCooldown: number;
  isi: number;
  crew: CrewId[];
  turf: Record<NeighborhoodId, number>;
  bank: number;
  bankAcc: number;
  senet: Senet | null;
  contractId: string | null;
  contractGun: number;
  seasonScore: number;
  seasonGun: number;
  upgrades: Record<string, number>;
  jobsDone: number;
  married: boolean;
  spouse: string | null;
  kids: number;
  buzz: number;
  high: number;
  horse: Horse | null;
  relations: Record<string, number>;
  girlfriend: string | null;
  pendingFamily: PendingFamily | null;
  altin: number;
  usd: number;
  usdt: number;
  kose: number;
  koseGun: number;
}

export interface Neighborhood {
  id: NeighborhoodId;
  name: string;
  blurb: string;
  perk: string;
}
