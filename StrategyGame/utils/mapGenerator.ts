import { Province } from '../types/game';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface ProvinceTemplate {
  name: string;
  x: number;
  y: number;
  baseResources: {
    gold: number;
    food: number;
    faith: number;
  };
  adjacentNames: string[];
}

const EUROPE_PROVINCES: ProvinceTemplate[] = [
  // British Isles
  { name: 'London', x: 120, y: 150, baseResources: { gold: 8, food: 5, faith: 2 }, adjacentNames: ['York', 'Paris'] },
  { name: 'York', x: 110, y: 120, baseResources: { gold: 6, food: 6, faith: 2 }, adjacentNames: ['London', 'Edinburgh'] },
  { name: 'Edinburgh', x: 105, y: 90, baseResources: { gold: 5, food: 4, faith: 3 }, adjacentNames: ['York'] },
  { name: 'Dublin', x: 80, y: 130, baseResources: { gold: 4, food: 5, faith: 4 }, adjacentNames: ['London'] },

  // France
  { name: 'Paris', x: 150, y: 170, baseResources: { gold: 10, food: 6, faith: 3 }, adjacentNames: ['London', 'Burgundy', 'Toulouse', 'Cologne'] },
  { name: 'Toulouse', x: 140, y: 210, baseResources: { gold: 6, food: 7, faith: 2 }, adjacentNames: ['Paris', 'Barcelona', 'Milan'] },
  { name: 'Burgundy', x: 170, y: 180, baseResources: { gold: 7, food: 6, faith: 2 }, adjacentNames: ['Paris', 'Milan', 'Vienna', 'Cologne'] },

  // Iberia
  { name: 'Barcelona', x: 130, y: 240, baseResources: { gold: 7, food: 5, faith: 3 }, adjacentNames: ['Toulouse', 'Castile', 'Valencia'] },
  { name: 'Castile', x: 100, y: 250, baseResources: { gold: 6, food: 4, faith: 4 }, adjacentNames: ['Barcelona', 'Lisbon', 'Valencia'] },
  { name: 'Lisbon', x: 70, y: 260, baseResources: { gold: 5, food: 4, faith: 3 }, adjacentNames: ['Castile'] },
  { name: 'Valencia', x: 120, y: 270, baseResources: { gold: 5, food: 6, faith: 2 }, adjacentNames: ['Barcelona', 'Castile'] },

  // Italy
  { name: 'Milan', x: 180, y: 220, baseResources: { gold: 8, food: 5, faith: 3 }, adjacentNames: ['Toulouse', 'Burgundy', 'Venice', 'Rome'] },
  { name: 'Venice', x: 200, y: 210, baseResources: { gold: 9, food: 4, faith: 2 }, adjacentNames: ['Milan', 'Vienna', 'Rome'] },
  { name: 'Rome', x: 200, y: 250, baseResources: { gold: 7, food: 5, faith: 8 }, adjacentNames: ['Milan', 'Venice', 'Naples'] },
  { name: 'Naples', x: 210, y: 280, baseResources: { gold: 5, food: 6, faith: 3 }, adjacentNames: ['Rome'] },

  // Germanic Regions
  { name: 'Cologne', x: 180, y: 150, baseResources: { gold: 7, food: 5, faith: 3 }, adjacentNames: ['Paris', 'Burgundy', 'Vienna', 'Prague', 'Hamburg'] },
  { name: 'Hamburg', x: 190, y: 120, baseResources: { gold: 6, food: 4, faith: 2 }, adjacentNames: ['Cologne', 'Prague', 'Stockholm'] },
  { name: 'Vienna', x: 220, y: 180, baseResources: { gold: 8, food: 5, faith: 4 }, adjacentNames: ['Burgundy', 'Venice', 'Cologne', 'Prague', 'Buda'] },
  { name: 'Prague', x: 210, y: 160, baseResources: { gold: 6, food: 5, faith: 3 }, adjacentNames: ['Cologne', 'Hamburg', 'Vienna', 'Krakow'] },

  // Eastern Europe
  { name: 'Krakow', x: 240, y: 170, baseResources: { gold: 5, food: 6, faith: 4 }, adjacentNames: ['Prague', 'Buda', 'Kiev'] },
  { name: 'Buda', x: 240, y: 200, baseResources: { gold: 6, food: 6, faith: 3 }, adjacentNames: ['Vienna', 'Krakow', 'Kiev'] },
  { name: 'Kiev', x: 280, y: 180, baseResources: { gold: 5, food: 7, faith: 5 }, adjacentNames: ['Krakow', 'Buda', 'Moscow', 'Constantinople'] },
  { name: 'Moscow', x: 320, y: 150, baseResources: { gold: 6, food: 6, faith: 6 }, adjacentNames: ['Kiev', 'Novgorod'] },
  { name: 'Novgorod', x: 310, y: 120, baseResources: { gold: 5, food: 5, faith: 4 }, adjacentNames: ['Moscow', 'Stockholm'] },

  // Scandinavia
  { name: 'Stockholm', x: 220, y: 90, baseResources: { gold: 6, food: 4, faith: 3 }, adjacentNames: ['Hamburg', 'Novgorod', 'Copenhagen'] },
  { name: 'Copenhagen', x: 200, y: 100, baseResources: { gold: 5, food: 5, faith: 2 }, adjacentNames: ['Stockholm', 'Hamburg'] },

  // Balkans & Byzantine
  { name: 'Constantinople', x: 290, y: 230, baseResources: { gold: 9, food: 5, faith: 7 }, adjacentNames: ['Kiev', 'Thessalonica'] },
  { name: 'Thessalonica', x: 260, y: 250, baseResources: { gold: 6, food: 5, faith: 5 }, adjacentNames: ['Constantinople', 'Athens'] },
  { name: 'Athens', x: 250, y: 280, baseResources: { gold: 5, food: 4, faith: 4 }, adjacentNames: ['Thessalonica'] },
];

export function generateEuropeMap(): { [id: string]: Province } {
  const provinces: { [id: string]: Province } = {};
  const nameToIdMap: { [name: string]: string } = {};

  // First pass: create all provinces
  EUROPE_PROVINCES.forEach(template => {
    const provinceId = uuidv4() as string;
    nameToIdMap[template.name] = provinceId;
    
    provinces[provinceId] = {
      id: provinceId,
      name: template.name,
      ownerId: null,
      resources: { ...template.baseResources },
      troops: 0,
      x: template.x,
      y: template.y,
      adjacentProvinces: [], // Will be filled in second pass
      terrainBonus: Math.random() > 0.7 ? 1.2 : 1.0, // Some provinces get terrain bonus
    };
  });

  // Second pass: establish adjacencies
  EUROPE_PROVINCES.forEach((template, index) => {
    const provinceId = nameToIdMap[template.name];
    const province = provinces[provinceId];
    
    template.adjacentNames.forEach(adjacentName => {
      const adjacentId = nameToIdMap[adjacentName];
      if (adjacentId) {
        province.adjacentProvinces.push(adjacentId);
        // Also add reverse adjacency if not already present
        const adjacentProvince = provinces[adjacentId];
        if (!adjacentProvince.adjacentProvinces.includes(provinceId)) {
          adjacentProvince.adjacentProvinces.push(provinceId);
        }
      }
    });
  });

  return provinces;
}