/**
 * Global Game State & Collections
 */

import { POSSIBLE_LOOT, RESURRECTION_SCROLL } from './data/items.js';

export const WORLD_SIZE = 1920;
export const TILE_SIZE = 48;

export const camera = {
  x: 672,
  y: 672,
  zoom: 1.0,
  targetZoom: 1.0,
  minZoom: 0.85,
  maxZoom: 1.35
};

function getInitialCharacterId() {
  try {
    let cid = localStorage.getItem('mdg_active_char_id');
    if (!cid || cid === 'hero_default') {
      cid = 'hero_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('mdg_active_char_id', cid);
    }
    return cid;
  } catch (e) {
    return 'hero_' + Math.random().toString(36).substring(2, 9);
  }
}

const initialCharId = getInitialCharacterId();

export const player = {
  x: 2000,
  y: 2000,
  vx: 0,
  vy: 0,
  speed: 210,
  radius: 16,
  facing: 'down',
  isMoving: false,
  isDead: false,
  zoneResurrectionsUsed: 0,
  portalCooldown: 0,
  animFrame: 0,
  animTimer: 0,
  freezeTimer: 0,
  attackTimer: 0,

  id: initialCharId,
  name: 'Hero ' + initialCharId.substring(5, 9).toUpperCase(),
  gender: 'Male',
  classSpec: 'Novice',
  level: 1,
  currentExp: 0,
  expToNext: 100,
  skillPoints: 3,

  devotionPoints: 8,
  allocatedDevotionNodes: ['nexus_root'],
  devotionAllocated: ['nexus_root'],
  devotionProcs: [],
  awakenedSkills: { slash: false, fireball: false, frost: false, meteor: false, dash: false },
  activeHiddenSynergies: [],
  currencies: { gold: 200, fracture_core: 5 },

  speedBonusPct: 0,
  armorBonusPct: 0,
  resBonusFlat: 0,

  life: 250,
  maxLife: 250,
  mana: 120,
  maxMana: 120,
  es: 100,
  maxEs: 100,

  armor: 250,
  evasion: 250,
  fireRes: 75,
  coldRes: 75,
  lightRes: 75,
  chaosRes: 40,
  critChance: 25,
  critMulti: 200,

  cooldowns: { slash: 0, fireball: 0, frost: 0, meteor: 0, dash: 0 },

  equipped: {
    MainHand: {
      id: 'starter_blade_1',
      name: 'Rusty Iron Blade',
      category: 'weapon',
      slot: 'MainHand',
      rarity: 'Normal',
      tier: 1,
      requiredLevel: 1,
      itemLevel: 1,
      damage: 15,
      attackSpeed: 1.20,
      critChance: 5.0,
      icon: '🗡️',
      color: '#c8c8c8',
      description: 'A weathered starter blade carried by novice warriors.',
      affixes: []
    }
  },
  bag: [],
  bagFilter: 'all',
  monsterKills: {},
  activeBuffs: [],
  skillProficiencies: {
    slash: { exp: 0, rank: 'F', rankName: 'Novice Practitioner (F)', bonusDmg: 0 },
    fireball: { exp: 0, rank: 'F', rankName: 'Novice Practitioner (F)', bonusDmg: 0 },
    frost: { exp: 0, rank: 'F', rankName: 'Novice Practitioner (F)', bonusDmg: 0 },
    meteor: { exp: 0, rank: 'F', rankName: 'Novice Practitioner (F)', bonusDmg: 0 },
    dash: { exp: 0, rank: 'F', rankName: 'Novice Practitioner (F)', bonusDmg: 0 }
  },
  highestClearedSpireFloor: 0,
  statPoints: { str: 15, dex: 15, int: 15, vit: 15, unallocated: 5 },
  unlockedTitles: ['The Unbound', 'Pioneer of Aethelis'],
  activeTitle: 'The Unbound',
  materials: {
    mat_iron_ore: 18,
    mat_beast_leather: 10,
    mat_mithril_chunk: 12,
    mat_aether_crystal: 8,
    mat_adamantite_ingot: 6,
    mat_shard_genesis: 2,
    mat_blood_herb: 5,
    mat_mana_bloom: 5
  },
  craftingMastery: {
    level: 1,
    exp: 0,
    rank: 'Apprentice',
    rankTitle: '🛠️ Novice Apprentice'
  },
  unlockedRecipes: ['forge_iron_sword', 'forge_iron_armor']
};

export const monsters = [];
export const trainingDummies = [];
export const npcs = [];
export const portals = [];
export const props = [];
export const pois = [];
export const projectiles = [];
export const particles = [];
export const floatingTexts = [];
export const groundLoot = [];
export const mapIncursions = [];
export const otherPlayers = new Map();
export const zoneChatMessages = [];
export const zoneExploration = {};

export const keys = {};
export const mouse = { x: 0, y: 0, worldX: 0, worldY: 0, down: false };
