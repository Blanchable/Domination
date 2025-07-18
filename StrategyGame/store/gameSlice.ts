import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, Player, Province, War, Alliance, TradeDeal, PapalAction, Resources } from '../types/game';
import { generateEuropeMap } from '../utils/mapGenerator';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const initialState: GameState = {
  players: {},
  provinces: {},
  alliances: {},
  wars: {},
  tradeDeals: {},
  currentPopeTurn: null,
  papalActionsUsed: 0,
  gameDay: 1,
  lastUpdate: Date.now(),
  gameStarted: false,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initializeGame: (state, action: PayloadAction<{ playerNames: string[] }>) => {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
      const provinces = generateEuropeMap();
      
      // Create players
      action.payload.playerNames.forEach((name, index) => {
        const playerId = uuidv4() as string;
        state.players[playerId] = {
          id: playerId,
          name,
          color: colors[index % colors.length],
          resources: { gold: 100, food: 50, faith: 10 },
          provinces: [],
          totalTroops: 0,
          isPope: false,
          alliances: [],
          wars: [],
          tradeDeals: [],
        };
      });

      // Distribute initial provinces randomly
      const playerIds = Object.keys(state.players);
      const provinceIds = Object.keys(provinces);
      const provincesPerPlayer = Math.floor(provinceIds.length / playerIds.length);
      
      playerIds.forEach((playerId, index) => {
        const startIndex = index * provincesPerPlayer;
        const playerProvinces = provinceIds.slice(startIndex, startIndex + provincesPerPlayer);
        
        playerProvinces.forEach(provinceId => {
          provinces[provinceId].ownerId = playerId;
          provinces[provinceId].troops = 10;
          state.players[playerId].provinces.push(provinceId);
          state.players[playerId].totalTroops += 10;
        });
      });

      state.provinces = provinces;
      state.gameStarted = true;
      
      // Elect initial Pope (player with most faith)
      gameSlice.caseReducers.electPope(state);
    },

    electPope: (state) => {
      let maxFaith = -1;
      let newPope = null;
      
      Object.values(state.players).forEach(player => {
        player.isPope = false;
        if (player.resources.faith > maxFaith) {
          maxFaith = player.resources.faith;
          newPope = player.id;
        }
      });
      
      if (newPope) {
        state.players[newPope].isPope = true;
        state.currentPopeTurn = newPope;
        state.papalActionsUsed = 0;
      }
    },

    advanceDay: (state) => {
      // Generate resources for each province
      Object.entries(state.provinces).forEach(([provinceId, province]) => {
        if (province.ownerId) {
          const player = state.players[province.ownerId];
          player.resources.gold += province.resources.gold;
          player.resources.food += province.resources.food;
          player.resources.faith += province.resources.faith;
        }
      });

      // Resolve wars
      Object.entries(state.wars).forEach(([warId, war]) => {
        if (war.status === 'ongoing') {
          gameSlice.caseReducers.resolveWar(state, { payload: { warId }, type: 'resolveWar' });
        }
      });

      state.gameDay += 1;
      state.lastUpdate = Date.now();
      
      // Elect new Pope
      gameSlice.caseReducers.electPope(state);
    },

    claimProvince: (state, action: PayloadAction<{ playerId: string; provinceId: string }>) => {
      const { playerId, provinceId } = action.payload;
      const province = state.provinces[provinceId];
      const player = state.players[playerId];

      if (!province.ownerId && player.resources.gold >= 20) {
        province.ownerId = playerId;
        province.troops = 5;
        player.provinces.push(provinceId);
        player.totalTroops += 5;
        player.resources.gold -= 20;
      }
    },

    declareWar: (state, action: PayloadAction<{ attackerId: string; defenderId: string; targetProvinceId: string; troops: number }>) => {
      const { attackerId, defenderId, targetProvinceId, troops } = action.payload;
      const attacker = state.players[attackerId];
      const targetProvince = state.provinces[targetProvinceId];

      if (attacker.totalTroops >= troops && targetProvince.ownerId === defenderId) {
        const warId = uuidv4() as string;
        state.wars[warId] = {
          id: warId,
          attackerId,
          defenderId,
          targetProvinceId,
          troops,
          status: 'ongoing',
        };

        attacker.wars.push(warId);
        state.players[defenderId].wars.push(warId);
        attacker.totalTroops -= troops;
      }
    },

    resolveWar: (state, action: PayloadAction<{ warId: string }>) => {
      const war = state.wars[action.payload.warId];
      if (!war || war.status !== 'ongoing') return;

      const targetProvince = state.provinces[war.targetProvinceId];
      const defendingTroops = targetProvince.troops;
      const attackingTroops = war.troops;

      // Simple combat resolution
      const attackerAdvantage = attackingTroops > defendingTroops ? 1.2 : 1;
      const defenderAdvantage = targetProvince.terrainBonus || 1;

      const attackerStrength = attackingTroops * attackerAdvantage;
      const defenderStrength = defendingTroops * defenderAdvantage;

      if (attackerStrength > defenderStrength) {
        // Attacker wins
        const oldOwnerId = targetProvince.ownerId!;
        const newOwnerId = war.attackerId;

        // Transfer province
        targetProvince.ownerId = newOwnerId;
        targetProvince.troops = Math.max(1, attackingTroops - defendingTroops);

        // Update player province lists
        state.players[oldOwnerId].provinces = state.players[oldOwnerId].provinces.filter(id => id !== war.targetProvinceId);
        state.players[newOwnerId].provinces.push(war.targetProvinceId);
        state.players[newOwnerId].totalTroops += targetProvince.troops;

        war.result = 'attacker_wins';
      } else {
        // Defender wins
        targetProvince.troops = Math.max(1, defendingTroops - Math.floor(attackingTroops / 2));
        war.result = 'defender_wins';
      }

      war.status = 'resolved';
    },

    formAlliance: (state, action: PayloadAction<{ playerId: string; targetPlayerId: string; allianceName: string }>) => {
      const { playerId, targetPlayerId, allianceName } = action.payload;
      const allianceId = uuidv4() as string;

      state.alliances[allianceId] = {
        id: allianceId,
        members: [playerId, targetPlayerId],
        name: allianceName,
        createdAt: Date.now(),
      };

      state.players[playerId].alliances.push(allianceId);
      state.players[targetPlayerId].alliances.push(allianceId);
    },

    breakAlliance: (state, action: PayloadAction<{ playerId: string; allianceId: string }>) => {
      const alliance = state.alliances[action.payload.allianceId];
      if (!alliance) return;

      // Remove alliance from all members
      alliance.members.forEach(memberId => {
        state.players[memberId].alliances = state.players[memberId].alliances.filter(id => id !== action.payload.allianceId);
      });

      delete state.alliances[action.payload.allianceId];
    },

    createTradeDeal: (state, action: PayloadAction<{ fromPlayerId: string; toPlayerId: string; resources: Partial<Resources>; duration: number }>) => {
      const { fromPlayerId, toPlayerId, resources, duration } = action.payload;
      const fromPlayer = state.players[fromPlayerId];

      // Check if player has enough resources
      const canAfford = Object.entries(resources).every(([resource, amount]) => {
        return fromPlayer.resources[resource as keyof Resources] >= (amount || 0);
      });

      if (canAfford) {
        const tradeId = uuidv4() as string;
        state.tradeDeals[tradeId] = {
          id: tradeId,
          fromPlayerId,
          toPlayerId,
          resources,
          duration,
          isActive: true,
        };

        // Deduct resources from sender
        Object.entries(resources).forEach(([resource, amount]) => {
          fromPlayer.resources[resource as keyof Resources] -= amount || 0;
        });

        // Add resources to receiver
        const toPlayer = state.players[toPlayerId];
        Object.entries(resources).forEach(([resource, amount]) => {
          toPlayer.resources[resource as keyof Resources] += amount || 0;
        });

        fromPlayer.tradeDeals.push(tradeId);
        toPlayer.tradeDeals.push(tradeId);
      }
    },

    usePapalAction: (state, action: PayloadAction<{ action: PapalAction }>) => {
      const pope = Object.values(state.players).find(p => p.isPope);
      if (!pope || state.papalActionsUsed >= 1) return;

      const { action: papalAction } = action.payload;

      switch (papalAction.type) {
        case 'ceasefire':
          // Force ceasefire between two players
          papalAction.targetPlayerIds.forEach(playerId => {
            const player = state.players[playerId];
            player.wars.forEach(warId => {
              const war = state.wars[warId];
              if (war.status === 'ongoing' && 
                  (papalAction.targetPlayerIds.includes(war.attackerId) || 
                   papalAction.targetPlayerIds.includes(war.defenderId))) {
                war.status = 'resolved';
                war.result = 'defender_wins'; // Ceasefire favors defender
              }
            });
          });
          break;

        case 'double_resources':
          if (papalAction.targetProvinceId) {
            const province = state.provinces[papalAction.targetProvinceId];
            if (province.ownerId) {
              const owner = state.players[province.ownerId];
              owner.resources.gold += province.resources.gold;
              owner.resources.food += province.resources.food;
              owner.resources.faith += province.resources.faith;
            }
          }
          break;

        case 'excommunicate':
          papalAction.targetPlayerIds.forEach(playerId => {
            const player = state.players[playerId];
            // Remove from all alliances
            player.alliances.forEach(allianceId => {
              const alliance = state.alliances[allianceId];
              alliance.members = alliance.members.filter(id => id !== playerId);
              if (alliance.members.length < 2) {
                delete state.alliances[allianceId];
              }
            });
            player.alliances = [];
          });
          break;

        case 'bless_army':
          if (papalAction.targetProvinceId) {
            const province = state.provinces[papalAction.targetProvinceId];
            province.terrainBonus = (province.terrainBonus || 1) * 1.5;
          }
          break;
      }

      state.papalActionsUsed += 1;
    },

    recruitTroops: (state, action: PayloadAction<{ playerId: string; provinceId: string; amount: number }>) => {
      const { playerId, provinceId, amount } = action.payload;
      const player = state.players[playerId];
      const province = state.provinces[provinceId];

      const cost = amount * 10; // 10 gold per troop
      const foodCost = amount * 2; // 2 food per troop

      if (province.ownerId === playerId && 
          player.resources.gold >= cost && 
          player.resources.food >= foodCost) {
        player.resources.gold -= cost;
        player.resources.food -= foodCost;
        province.troops += amount;
        player.totalTroops += amount;
      }
    },
  },
});

export const {
  initializeGame,
  advanceDay,
  claimProvince,
  declareWar,
  formAlliance,
  breakAlliance,
  createTradeDeal,
  usePapalAction,
  recruitTroops,
  electPope,
} = gameSlice.actions;

export default gameSlice.reducer;