export interface PlayerState {
  cash: number;
  bank: number;
  heat: number;
  inventoryCapacity: number;
  stashCapacity: number;
  currentCountryId: string;
  inventory: InventoryItem[];
  stash: InventoryItem[];
  totalTrips: number;
  totalProfit: number;
  totalBusts: number;
  runActive: boolean;
  reputation: number;
  notoriety: number;
  credit: number;
  credibility: number;
  peakNetWorth: number;
  ownedAssets: string[];
  unlockedContacts: string[];
}

export type AssetClass = 'cosmetic' | 'functional' | 'operational';

export interface OperationalBenefits {
  inspectionReduction: number;
  bustReduction: number;
  heatDecayBonus: number;
  fineReduction: number;
}

export interface InventoryItem {
  goodId: string;
  quantity: number;
}

export interface Country {
  id: string;
  name: string;
  city: string;
  region: Region;
  policeIntensity: number;
  demandModifiers: Record<string, number>;
  basePriceRange: [number, number];
  riskModifier: number;
}

export type Region = 'South America' | 'North America' | 'Europe' | 'North Africa' | 'Asia' | 'Middle East';

export interface Good {
  id: string;
  name: string;
  unitOfMeasure: string;
  standardDealSize: number;
  baseValuePerUnit: number;
  weight: number;
  risk: number;
  maxBulkUnits: number;
}

export interface MarketPrice {
  goodId: string;
  goodName: string;
  buyPrice: number;
  sellPrice: number;
  demand: number;
  spreadPct?: number;
}

export interface TravelResult {
  success: boolean;
  cost: number;
  delay: number;
  message: string;
  securitySniffTriggered: boolean;
  isReturnLeg?: boolean;
}

export interface DirectorState {
  tension: number;
  boredom: number;
  timeSinceLastEvent: number;
  playerWealthTier: number;
  recentRiskScore: number;
  enforcementAttention: number;
  eventCooldown: number;
}

export interface ChoiceEvent {
  id: string;
  title: string;
  context: string;
  choices: EventChoice[];
}

export interface EventChoice {
  id: string;
  text: string;
  odds: number;
  successEffects: EventEffects;
  failEffects: EventEffects;
}

export interface EventEffects {
  cashDelta: number;
  heatDelta: number;
  reputationDelta: number;
  credibilityDelta?: number;
  inventoryLost?: boolean;
  message: string;
}

export interface RandomEvent {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  apply: (player: PlayerState) => { player: PlayerState; message: string };
}

export interface MarketMemory {
  countryId: string;
  recentTradeVolume: number;
  lastVisitedTurn: number;
}

export interface TravelSniffContext {
  toCountryId: string;
  cost: number;
}

export interface PendingSellContext {
  goodId: string;
  quantity: number;
  baseSellPrice: number;
  countryId: string;
}

export interface KingpinProfile {
  id: string;
  name: string;
  description: string;
  location: string;
  minStashValue: number;
  sellPriceMod: number; // 1.3 = 30% above market rate
  encounterWeights: { clean: number; mugging: number; raid: number };
}

export interface PendingBuyContext {
  goodId: string;
  quantity: number;
  totalCost: number;
}

export interface PendingFlightContext {
  toCountryId: string;
  travelClass: TravelClass;
}

export type GamePhase =
  | 'home'
  | 'flying_out'
  | 'arrived'
  | 'selecting_dealer'
  | 'buying'
  | 'flying_back'
  | 'selling'
  | 'returned';

export interface DealerProfile {
  countryId: string;
  dealerId: string;
  name: string;
  gender: 'male' | 'female';
  description: string;
  location: string;
  priceModifier: number; // 0.8 = 20% discount, 1.2 = 20% premium
  riskBonus: number; // added to robbery chance
  rapport: number; // 0+ starts at 0 for each player
}

export interface PronounSet {
  he: string;
  him: string;
  his: string;
  He: string;
  His: string;
}

export interface GameState {
  player: PlayerState;
  world: Country[];
  goods: Good[];
  director: DirectorState;
  turn: number;
  currentMarketPrices: MarketPrice[];
  lastEventMessage: string;
  gameLog: string[];
  pendingEvent: ChoiceEvent | null;
  travelSniff: TravelSniffContext | null;
  pendingSell: PendingSellContext | null;
  pendingBuy: PendingBuyContext | null;
  pendingFlight: PendingFlightContext | null;
  headingToAirport: boolean;
  gamePhase: GamePhase;
  selectedProductId: string | null;
  selectedDealer: DealerProfile | null;
  selectedKingpin: KingpinProfile | null;
  dealerRapport: Record<string, number>; // dealerId → rapport count
  marketMemory: Record<string, MarketMemory>;
  journalEntries: JournalRunEntry[];
  securitySniffsPassed: number;
  buyDealsCompleted: number;
  sellDealsCompleted: number;
  firstRunTutorialShown: boolean;
  safehouseTier: number;
}

export interface JournalRunEntry {
  turn: number;
  type: 'milestone' | 'event' | 'purchase' | 'bust' | 'travel' | 'run_end';
  title: string;
  description: string;
  cash: number;
  netWorth: number;
  heat: number;
  reputation: number;
}

export type TravelClass = 'economy' | 'first_class';

export type GameAction =
  | { type: 'TRAVEL'; toCountryId: string; travelClass: TravelClass }
  | { type: 'BUY'; goodId: string; quantity: number }
  | { type: 'SELL'; goodId: string; quantity: number }
  | { type: 'VIEW_MARKET' }
  | { type: 'VIEW_INVENTORY' }
  | { type: 'WAIT' }
  | { type: 'END_RUN' }
  | { type: 'SAVE' }
  | { type: 'LOAD' }
  | { type: 'SAFEHOUSE_TIER_CHANGE' }
  | { type: 'RESPOND_EVENT'; choiceId: string }
  | { type: 'BUY_ASSET'; assetId: string }
  | { type: 'SELL_ASSET'; assetId: string }
  | { type: 'START_TRIP'; amount: number }
  | { type: 'END_TRIP' }
  | { type: 'TRANSFER_FROM_BANK'; amount: number }
  | { type: 'TRANSFER_TO_BANK'; amount: number }
  | { type: 'CANCEL_AIRPORT' }
  | { type: 'AFTER_CUSTOMS' }
  | { type: 'SELECT_DEALER'; dealerId: string }
  | { type: 'MEET_KINGPIN' }
  | { type: 'CONTACT_KINGPIN'; kingpinId: string }
  | { type: 'STASH_GOODS' }
  | { type: 'RETRIEVE_GOODS'; goodId: string; quantity: number }
  | { type: 'FLY_HOME' }
  | { type: 'CONFIRM_FLIGHT'; toCountryId: string; travelClass: TravelClass }
  | { type: 'SELECT_PRODUCT'; goodId: string | null };
