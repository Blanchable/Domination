export interface Resources {
  gold: number;
  food: number;
  faith: number;
}

export interface Province {
  id: string;
  name: string;
  ownerId: string | null;
  resources: Resources;
  troops: number;
  x: number;
  y: number;
  adjacentProvinces: string[];
  terrainBonus?: number;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  resources: Resources;
  provinces: string[];
  totalTroops: number;
  isPope: boolean;
  alliances: string[];
  wars: string[];
  tradeDeals: string[];
}

export interface Alliance {
  id: string;
  members: string[];
  name: string;
  createdAt: number;
}

export interface War {
  id: string;
  attackerId: string;
  defenderId: string;
  targetProvinceId: string;
  troops: number;
  status: 'ongoing' | 'resolved';
  result?: 'attacker_wins' | 'defender_wins';
}

export interface TradeDeal {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  resources: Partial<Resources>;
  duration: number;
  isActive: boolean;
}

export interface PapalAction {
  type: 'ceasefire' | 'double_resources' | 'excommunicate' | 'bless_army';
  targetPlayerIds: string[];
  targetProvinceId?: string;
  description: string;
}

export interface GameState {
  players: { [id: string]: Player };
  provinces: { [id: string]: Province };
  alliances: { [id: string]: Alliance };
  wars: { [id: string]: War };
  tradeDeals: { [id: string]: TradeDeal };
  currentPopeTurn: string | null;
  papalActionsUsed: number;
  gameDay: number;
  lastUpdate: number;
  gameStarted: boolean;
}

export interface GameAction {
  type: string;
  payload: any;
  playerId: string;
  timestamp: number;
}