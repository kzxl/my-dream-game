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
  minZoom: 0.5,
  maxZoom: 2.0
};

export const player = {
  x: 672,
  y: 672,
  vx: 0,
  vy: 0,
  speed: 185,
  facing: 'down',
  isMoving: false,
  isAttacking: false,
  isDead: false,
  invulnerableTimer: 0,
  zoneResurrectionsUsed: 0,
  portalCooldown: 0,
  animFrame: 0,
  animTimer: 0,
  freezeTimer: 0,
  attackTimer: 0,

  id: 'hero_default',
  name: 'The Unbound',
  gender: 'Male',
  classSpec: 'Novice',
  level: 1,
  currentExp: 0,
  expToNext: 100,
  skillPoints: 3,

  devotionPoints: 8,
  allocatedDevotionNodes: ['ph_1', 'fw_1'],

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
    Helm: POSSIBLE_LOOT[1],
    Amulet: POSSIBLE_LOOT[6],
    MainHand: POSSIBLE_LOOT[0],
    BodyArmor: POSSIBLE_LOOT[4],
    OffHand: POSSIBLE_LOOT[3],
    Ring: POSSIBLE_LOOT[7],
    Boots: POSSIBLE_LOOT[5]
  },
  bag: [
    POSSIBLE_LOOT[2],
    POSSIBLE_LOOT[8],
    POSSIBLE_LOOT[9],
    POSSIBLE_LOOT[8],
    { ...RESURRECTION_SCROLL, stack: 3 }
  ],
  bagFilter: 'all',
  monsterKills: {},
  activeBuffs: [],
  skillProficiencies: {
    slash: { exp: 450, rank: 'D', rankName: 'Hardened Combatant (D)' },
    fireball: { exp: 1200, rank: 'C', rankName: 'Skilled Specialist (C)' },
    frost: { exp: 150, rank: 'E', rankName: 'Adept Adept (E)' },
    meteor: { exp: 0, rank: 'F', rankName: 'Novice Practitioner (F)' },
    dash: { exp: 600, rank: 'D', rankName: 'Hardened Combatant (D)' }
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
  }
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
