/**
 * MDG: Aethelis - Advanced Itemization, Base Types, Tiered Modifiers & Level-Gated Drop Engine (English)
 */

export const RARITY_COLORS = {
  Normal: '#c8c8c8',
  Magic: '#8888ff',
  Rare: '#ffff77',
  Unique: '#af6025',
  Set: '#00e676',
  Currency: '#aa9e82',
  SkillGem: '#1abc9c',
  SupportGem: '#e67e22',
  Map: '#d4af37'
};

export const ITEM_SPRITES = {
  sword_fire: { sx: 820, sy: 5, sw: 95, sh: 95 },
  sword_crystal: { sx: 715, sy: 5, sw: 95, sh: 95 },
  axe_dragon: { sx: 310, sy: 120, sw: 95, sh: 95 },
  dagger_kris: { sx: 410, sy: 270, sw: 95, sh: 95 },
  staff_arcane: { sx: 920, sy: 270, sw: 95, sh: 95 },
  helm_crown: { sx: 515, sy: 400, sw: 95, sh: 95 },
  helm_knight: { sx: 215, sy: 400, sw: 95, sh: 95 },
  shield_dragon: { sx: 925, sy: 515, sw: 95, sh: 95 },
  shield_lion: { sx: 620, sy: 515, sw: 95, sh: 95 },
  armor_plate: { sx: 205, sy: 655, sw: 95, sh: 95 },
  armor_robe: { sx: 820, sy: 655, sw: 95, sh: 95 },
  boots_plate: { sx: 110, sy: 800, sw: 95, sh: 95 },
  ring_sapphire: { sx: 720, sy: 800, sw: 95, sh: 95 },
  ring_ruby: { sx: 925, sy: 800, sw: 95, sh: 95 },
  amulet_heart: { sx: 415, sy: 915, sw: 95, sh: 95 },
  amulet_diamond: { sx: 515, sy: 915, sw: 95, sh: 95 }
};

// ==========================================
// 1. TIERED BASE EQUIPMENT TEMPLATES
// ==========================================
export const BASE_EQUIPMENT = [
  // --- WEAPONS (MainHand) ---
  {
    tier: 1, requiredLevel: 1, category: 'weapon', slot: 'MainHand',
    baseName: 'Rusty Iron Blade', icon: '🗡️', sprite: ITEM_SPRITES.sword_fire,
    baseStats: { damage: 15, attackSpeed: 1.20, critChance: 5.0 },
    lore: 'A weathered blade carried by novice explorers.'
  },
  {
    tier: 2, requiredLevel: 15, category: 'weapon', slot: 'MainHand',
    baseName: 'Steel Broadsword', icon: '⚔️', sprite: ITEM_SPRITES.sword_crystal,
    baseStats: { damage: 38, attackSpeed: 1.30, critChance: 6.5 },
    lore: 'Tempered steel forged for standard guard garrisons.'
  },
  {
    tier: 3, requiredLevel: 35, category: 'weapon', slot: 'MainHand',
    baseName: 'Dragonbone Longsword', icon: '🗡️', sprite: ITEM_SPRITES.axe_dragon,
    baseStats: { damage: 72, attackSpeed: 1.35, critChance: 7.5 },
    lore: 'Carved from the dense skeletal remains of elder drakes.'
  },
  {
    tier: 4, requiredLevel: 55, category: 'weapon', slot: 'MainHand',
    baseName: 'Obsidian Executioner', icon: '⚔️', sprite: ITEM_SPRITES.dagger_kris,
    baseStats: { damage: 115, attackSpeed: 1.40, critChance: 8.5 },
    lore: 'Honed from volcanic obsidian, capable of cleaving armor plates.'
  },
  {
    tier: 5, requiredLevel: 72, category: 'weapon', slot: 'MainHand',
    baseName: 'Colossus Greatsword of Ruin', icon: '👑', sprite: ITEM_SPRITES.staff_arcane,
    baseStats: { damage: 175, attackSpeed: 1.45, critChance: 10.0 },
    lore: 'A pinnacle weapon forged in the celestial core of Aethelis.'
  },

  // --- BODY ARMOR ---
  {
    tier: 1, requiredLevel: 1, category: 'armor', slot: 'BodyArmor',
    baseName: 'Padded Tunic', icon: '🛡️', sprite: ITEM_SPRITES.armor_robe,
    baseStats: { armor: 35, es: 15, maxLife: 20 },
    lore: 'Simple quilted cloth providing basic protection.'
  },
  {
    tier: 2, requiredLevel: 15, category: 'armor', slot: 'BodyArmor',
    baseName: 'Chainmail Hauberk', icon: '🛡️', sprite: ITEM_SPRITES.armor_plate,
    baseStats: { armor: 130, es: 45, maxLife: 50 },
    lore: 'Interlinked iron rings deflecting glancing slashes.'
  },
  {
    tier: 3, requiredLevel: 35, category: 'armor', slot: 'BodyArmor',
    baseName: 'Gladiator Plate Mail', icon: '🛡️', sprite: ITEM_SPRITES.armor_plate,
    baseStats: { armor: 320, es: 95, maxLife: 90 },
    lore: 'Heavy steel breastplate tested in arena combat.'
  },
  {
    tier: 4, requiredLevel: 55, category: 'armor', slot: 'BodyArmor',
    baseName: 'Crusader Carapace', icon: '🛡️', sprite: ITEM_SPRITES.armor_plate,
    baseStats: { armor: 620, es: 180, maxLife: 150 },
    lore: 'Imbued with blessed warding to repel demonic assaults.'
  },
  {
    tier: 5, requiredLevel: 72, category: 'armor', slot: 'BodyArmor',
    baseName: 'Astral Celestial Plate', icon: '👑', sprite: ITEM_SPRITES.armor_plate,
    baseStats: { armor: 1100, es: 320, maxLife: 240 },
    lore: 'Pinnacle celestial armor radiating sovereign resilience.'
  },

  // --- HELMS ---
  {
    tier: 1, requiredLevel: 1, category: 'armor', slot: 'Helm',
    baseName: 'Leather Cap', icon: '👑', sprite: ITEM_SPRITES.helm_knight,
    baseStats: { armor: 20, es: 10, maxLife: 10 },
    lore: 'Toughened hide cap.'
  },
  {
    tier: 2, requiredLevel: 15, category: 'armor', slot: 'Helm',
    baseName: 'Iron Bascinet', icon: '👑', sprite: ITEM_SPRITES.helm_knight,
    baseStats: { armor: 75, es: 25, maxLife: 30 },
    lore: 'A sturdy iron helm with nose guard.'
  },
  {
    tier: 3, requiredLevel: 35, category: 'armor', slot: 'Helm',
    baseName: "Knight's Armet", icon: '👑', sprite: ITEM_SPRITES.helm_knight,
    baseStats: { armor: 180, es: 60, maxLife: 60 },
    lore: 'Full visage helmet worn by royal vanguard knights.'
  },
  {
    tier: 4, requiredLevel: 55, category: 'armor', slot: 'Helm',
    baseName: 'Royal Greathelm', icon: '👑', sprite: ITEM_SPRITES.helm_crown,
    baseStats: { armor: 360, es: 120, maxLife: 100 },
    lore: 'Inlaid with runic gold to enhance mental focus.'
  },
  {
    tier: 5, requiredLevel: 72, category: 'armor', slot: 'Helm',
    baseName: 'Crown of the Ascendant', icon: '👑', sprite: ITEM_SPRITES.helm_crown,
    baseStats: { armor: 580, es: 210, maxLife: 160 },
    lore: 'Coronet of the ancient void sovereigns.'
  },

  // --- SHIELDS (OffHand) ---
  {
    tier: 1, requiredLevel: 1, category: 'armor', slot: 'OffHand',
    baseName: 'Splint Buckler', icon: '🛡️', sprite: ITEM_SPRITES.shield_dragon,
    baseStats: { armor: 25, blockChance: 18 },
    lore: 'Small lightweight wooden buckler.'
  },
  {
    tier: 2, requiredLevel: 15, category: 'armor', slot: 'OffHand',
    baseName: 'Reinforced Round Shield', icon: '🛡️', sprite: ITEM_SPRITES.shield_lion,
    baseStats: { armor: 95, blockChance: 22 },
    lore: 'Iron rimmed wooden shield.'
  },
  {
    tier: 3, requiredLevel: 35, category: 'armor', slot: 'OffHand',
    baseName: 'Imperial Tower Shield', icon: '🛡️', sprite: ITEM_SPRITES.shield_lion,
    baseStats: { armor: 240, blockChance: 26 },
    lore: 'Towering shield shielding the entire torso.'
  },
  {
    tier: 4, requiredLevel: 55, category: 'armor', slot: 'OffHand',
    baseName: 'Lionheart Crest Shield', icon: '🛡️', sprite: ITEM_SPRITES.shield_lion,
    baseStats: { armor: 460, blockChance: 28 },
    lore: 'Emblazoned with the roaring crest of Sanctuary.'
  },
  {
    tier: 5, requiredLevel: 72, category: 'armor', slot: 'OffHand',
    baseName: 'Aegis of the Celestial Sovereign', icon: '🛡️', sprite: ITEM_SPRITES.shield_dragon,
    baseStats: { armor: 750, blockChance: 32 },
    lore: 'Channels cosmic barriers to negate catastrophic blows.'
  },

  // --- BOOTS ---
  {
    tier: 1, requiredLevel: 1, category: 'armor', slot: 'Boots',
    baseName: 'Rawhide Boots', icon: '👢', sprite: ITEM_SPRITES.boots_plate,
    baseStats: { armor: 15, speed: 5 },
    lore: 'Flexible leather boots for marching.'
  },
  {
    tier: 2, requiredLevel: 15, category: 'armor', slot: 'Boots',
    baseName: 'Steel Greaves', icon: '👢', sprite: ITEM_SPRITES.boots_plate,
    baseStats: { armor: 70, speed: 10 },
    lore: 'Armored shinguards.'
  },
  {
    tier: 3, requiredLevel: 35, category: 'armor', slot: 'Boots',
    baseName: 'Wyrmscale Treads', icon: '👢', sprite: ITEM_SPRITES.boots_plate,
    baseStats: { armor: 160, speed: 15 },
    lore: 'Reinforced with dragon scales for swift maneuvers.'
  },
  {
    tier: 4, requiredLevel: 55, category: 'armor', slot: 'Boots',
    baseName: 'Voidwalker Sabatons', icon: '👢', sprite: ITEM_SPRITES.boots_plate,
    baseStats: { armor: 290, speed: 20 },
    lore: 'Imbued with phase magic to step across hazards.'
  },
  {
    tier: 5, requiredLevel: 72, category: 'armor', slot: 'Boots',
    baseName: 'Windstrider Titan Stompers', icon: '👢', sprite: ITEM_SPRITES.boots_plate,
    baseStats: { armor: 460, speed: 25 },
    lore: 'Pinnacle boots granting unmatched stride and stability.'
  },

  // --- ACCESSORIES (Amulets & Rings) ---
  {
    tier: 1, requiredLevel: 1, category: 'armor', slot: 'Amulet',
    baseName: 'Copper Medallion', icon: '📿', sprite: ITEM_SPRITES.amulet_heart,
    baseStats: { maxLife: 15, maxMana: 10 },
    lore: 'A modest good-luck pendant.'
  },
  {
    tier: 3, requiredLevel: 35, category: 'armor', slot: 'Amulet',
    baseName: 'Solar Medallion', icon: '📿', sprite: ITEM_SPRITES.amulet_diamond,
    baseStats: { maxLife: 60, critMulti: 15 },
    lore: 'Radiates a soothing celestial warmth.'
  },
  {
    tier: 5, requiredLevel: 70, category: 'armor', slot: 'Amulet',
    baseName: 'Amulet of the Celestial Void', icon: '📿', sprite: ITEM_SPRITES.amulet_diamond,
    baseStats: { maxLife: 120, critMulti: 30, damage: 25 },
    lore: 'Pinnacle amulet resonating with eternal constellations.'
  },
  {
    tier: 1, requiredLevel: 1, category: 'armor', slot: 'Ring',
    baseName: 'Iron Band', icon: '💍', sprite: ITEM_SPRITES.ring_ruby,
    baseStats: { armor: 15, maxLife: 10 },
    lore: 'A simple forged ring.'
  },
  {
    tier: 3, requiredLevel: 35, category: 'armor', slot: 'Ring',
    baseName: 'Glacial Signet Ring', icon: '💍', sprite: ITEM_SPRITES.ring_sapphire,
    baseStats: { coldRes: 25, es: 45 },
    lore: 'Cold to the touch, engraved with frost glyphs.'
  },
  {
    tier: 5, requiredLevel: 70, category: 'armor', slot: 'Ring',
    baseName: 'Opal Genesis Ring', icon: '💍', sprite: ITEM_SPRITES.ring_sapphire,
    baseStats: { damage: 20, allRes: 15, critChance: 5 },
    lore: 'Pinnacle ring forged from primordial Genesis crystal.'
  }
];

// ==========================================
// 2. TIERED AFFIX MODIFIER DEFINITIONS
// ==========================================
export const TIERED_MODIFIERS = [
  // --- LIFE (Prefix) ---
  { key: 'flat_life', type: 'prefix', tier: 5, minIlvl: 1,  minVal: 10, maxVal: 25,  label: 'to Maximum Life' },
  { key: 'flat_life', type: 'prefix', tier: 4, minIlvl: 20, minVal: 26, maxVal: 45,  label: 'to Maximum Life' },
  { key: 'flat_life', type: 'prefix', tier: 3, minIlvl: 40, minVal: 46, maxVal: 70,  label: 'to Maximum Life' },
  { key: 'flat_life', type: 'prefix', tier: 2, minIlvl: 60, minVal: 71, maxVal: 95,  label: 'to Maximum Life' },
  { key: 'flat_life', type: 'prefix', tier: 1, minIlvl: 75, minVal: 96, maxVal: 130, label: 'to Maximum Life' },

  // --- PHYSICAL DAMAGE (Prefix - Weapons) ---
  { key: 'flat_phys', type: 'prefix', tier: 5, minIlvl: 1,  minVal: 5,  maxVal: 12,  label: 'Physical Damage to Attacks' },
  { key: 'flat_phys', type: 'prefix', tier: 4, minIlvl: 20, minVal: 13, maxVal: 22,  label: 'Physical Damage to Attacks' },
  { key: 'flat_phys', type: 'prefix', tier: 3, minIlvl: 40, minVal: 23, maxVal: 38,  label: 'Physical Damage to Attacks' },
  { key: 'flat_phys', type: 'prefix', tier: 2, minIlvl: 60, minVal: 39, maxVal: 55,  label: 'Physical Damage to Attacks' },
  { key: 'flat_phys', type: 'prefix', tier: 1, minIlvl: 75, minVal: 56, maxVal: 80,  label: 'Physical Damage to Attacks' },

  // --- ENERGY SHIELD (Prefix - Armor) ---
  { key: 'flat_es', type: 'prefix', tier: 5, minIlvl: 1,  minVal: 15, maxVal: 30,  label: 'to Maximum Energy Shield' },
  { key: 'flat_es', type: 'prefix', tier: 4, minIlvl: 20, minVal: 31, maxVal: 55,  label: 'to Maximum Energy Shield' },
  { key: 'flat_es', type: 'prefix', tier: 3, minIlvl: 40, minVal: 56, maxVal: 85,  label: 'to Maximum Energy Shield' },
  { key: 'flat_es', type: 'prefix', tier: 2, minIlvl: 60, minVal: 86, maxVal: 120, label: 'to Maximum Energy Shield' },
  { key: 'flat_es', type: 'prefix', tier: 1, minIlvl: 75, minVal: 121, maxVal: 170, label: 'to Maximum Energy Shield' },

  // --- FIRE RESISTANCE (Suffix) ---
  { key: 'fire_res', type: 'suffix', tier: 5, minIlvl: 1,  minVal: 6,  maxVal: 12, label: 'to Fire Resistance' },
  { key: 'fire_res', type: 'suffix', tier: 4, minIlvl: 20, minVal: 13, maxVal: 19, label: 'to Fire Resistance' },
  { key: 'fire_res', type: 'suffix', tier: 3, minIlvl: 40, minVal: 20, maxVal: 27, label: 'to Fire Resistance' },
  { key: 'fire_res', type: 'suffix', tier: 2, minIlvl: 60, minVal: 28, maxVal: 35, label: 'to Fire Resistance' },
  { key: 'fire_res', type: 'suffix', tier: 1, minIlvl: 75, minVal: 36, maxVal: 45, label: 'to Fire Resistance' },

  // --- COLD RESISTANCE (Suffix) ---
  { key: 'cold_res', type: 'suffix', tier: 5, minIlvl: 1,  minVal: 6,  maxVal: 12, label: 'to Cold Resistance' },
  { key: 'cold_res', type: 'suffix', tier: 4, minIlvl: 20, minVal: 13, maxVal: 19, label: 'to Cold Resistance' },
  { key: 'cold_res', type: 'suffix', tier: 3, minIlvl: 40, minVal: 20, maxVal: 27, label: 'to Cold Resistance' },
  { key: 'cold_res', type: 'suffix', tier: 2, minIlvl: 60, minVal: 28, maxVal: 35, label: 'to Cold Resistance' },
  { key: 'cold_res', type: 'suffix', tier: 1, minIlvl: 75, minVal: 36, maxVal: 45, label: 'to Cold Resistance' },

  // --- LIGHTNING RESISTANCE (Suffix) ---
  { key: 'light_res', type: 'suffix', tier: 5, minIlvl: 1,  minVal: 6,  maxVal: 12, label: 'to Lightning Resistance' },
  { key: 'light_res', type: 'suffix', tier: 4, minIlvl: 20, minVal: 13, maxVal: 19, label: 'to Lightning Resistance' },
  { key: 'light_res', type: 'suffix', tier: 3, minIlvl: 40, minVal: 20, maxVal: 27, label: 'to Lightning Resistance' },
  { key: 'light_res', type: 'suffix', tier: 2, minIlvl: 60, minVal: 28, maxVal: 35, label: 'to Lightning Resistance' },
  { key: 'light_res', type: 'suffix', tier: 1, minIlvl: 75, minVal: 36, maxVal: 45, label: 'to Lightning Resistance' },

  // --- ATTACK SPEED (Suffix) ---
  { key: 'attack_speed', type: 'suffix', tier: 4, minIlvl: 15, minVal: 5,  maxVal: 8,  label: 'Increased Attack Speed' },
  { key: 'attack_speed', type: 'suffix', tier: 3, minIlvl: 35, minVal: 9,  maxVal: 12, label: 'Increased Attack Speed' },
  { key: 'attack_speed', type: 'suffix', tier: 2, minIlvl: 55, minVal: 13, maxVal: 16, label: 'Increased Attack Speed' },
  { key: 'attack_speed', type: 'suffix', tier: 1, minIlvl: 75, minVal: 17, maxVal: 22, label: 'Increased Attack Speed' },

  // --- CRITICAL MULTIPLIER (Suffix) ---
  { key: 'crit_multi', type: 'suffix', tier: 4, minIlvl: 15, minVal: 15, maxVal: 22, label: 'to Critical Strike Multiplier' },
  { key: 'crit_multi', type: 'suffix', tier: 3, minIlvl: 35, minVal: 23, maxVal: 32, label: 'to Critical Strike Multiplier' },
  { key: 'crit_multi', type: 'suffix', tier: 2, minIlvl: 55, minVal: 33, maxVal: 42, label: 'to Critical Strike Multiplier' },
  { key: 'crit_multi', type: 'suffix', tier: 1, minIlvl: 75, minVal: 43, maxVal: 55, label: 'to Critical Strike Multiplier' }
];

// ==========================================
// 3. LEVEL-GATED & TIER-SCALED ITEM GENERATION ENGINE
// ==========================================
export function generateLootItem(monsterLevel = 1, isBoss = false, monsterRarity = 'normal') {
  const iLvl = Math.max(1, monsterLevel) + (isBoss ? 3 : (monsterRarity === 'rare' ? 2 : (monsterRarity === 'champion' ? 1 : 0)));
  const isChampion = monsterRarity === 'champion' || monsterRarity === 'magic';
  const isRareMonster = monsterRarity === 'rare';

  // 1. Roll Skill Gem & Support Gem Drop
  const gemChance = isBoss ? 0.35 : (isRareMonster ? 0.18 : (isChampion ? 0.10 : 0.04));
  const gemDropRoll = Math.random();
  if (gemDropRoll < gemChance) {
    const eligibleGems = SKILL_GEMS_DATABASE.filter(g => g.minIlvl <= iLvl);
    if (eligibleGems.length > 0) {
      const g = eligibleGems[Math.floor(Math.random() * eligibleGems.length)];
      return {
        id: 'gem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        gemId: g.id,
        name: g.name,
        baseType: g.baseType,
        category: 'gem',
        gemType: g.gemType,
        skillKey: g.skillKey,
        slot: 'Gem',
        rarity: g.rarity,
        color: g.color,
        icon: g.icon,
        iLvl: iLvl,
        requiredLevel: g.requiredLevel,
        description: g.description,
        tags: g.tags
      };
    }
  }

  // 2. Currency, Consumable & Waystone Drops
  const currencyChance = isBoss ? 0.35 : (isRareMonster ? 0.22 : (isChampion ? 0.16 : 0.10));
  const specialRoll = Math.random();
  if (specialRoll < currencyChance) {
    return generateCurrencyDrop(iLvl);
  }
  if (specialRoll < currencyChance + 0.06 && iLvl >= 50) {
    return generateMapKeystoneDrop(iLvl);
  }

  // 3. Filter Base Templates eligible for this iLvl (requiredLevel <= iLvl)
  const eligibleBases = BASE_EQUIPMENT.filter(b => b.requiredLevel <= iLvl);
  const base = eligibleBases.length > 0 
    ? eligibleBases[Math.floor(Math.random() * eligibleBases.length)]
    : BASE_EQUIPMENT[0];

  // 4. Roll Rarity based on Monster Tier Matrix
  let rarity = 'Normal';
  const roll = Math.random() * 100;

  if (isBoss) {
    if (roll < 12) rarity = 'Unique';
    else if (roll < 30) rarity = 'Set';
    else if (roll < 85) rarity = 'Rare';
    else rarity = 'Magic';
  } else if (isRareMonster) {
    if (roll < 5) rarity = 'Unique';
    else if (roll < 13) rarity = 'Set';
    else if (roll < 65) rarity = 'Rare';
    else if (roll < 95) rarity = 'Magic';
    else rarity = 'Normal';
  } else if (isChampion) {
    if (roll < 2) rarity = 'Unique';
    else if (roll < 6) rarity = 'Set';
    else if (roll < 30) rarity = 'Rare';
    else if (roll < 75) rarity = 'Magic';
    else rarity = 'Normal';
  } else {
    if (roll < 1.0) rarity = 'Unique';
    else if (roll < 3.0) rarity = 'Set';
    else if (roll < 13.0) rarity = 'Rare';
    else if (roll < 45.0) rarity = 'Magic';
    else rarity = 'Normal';
  }

  // Handle Unique
  if (rarity === 'Unique') {
    const unq = UNIQUE_LOOT.find(u => u.requiredLevel <= iLvl) || UNIQUE_LOOT[0];
    return {
      ...unq,
      id: 'it_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      iLvl: iLvl
    };
  }

  // Handle Set Items
  if (rarity === 'Set') {
    const eligibleSets = SET_ITEMS_DATABASE.filter(s => (s.requiredLevel || 1) <= iLvl);
    const setTemplate = eligibleSets.length > 0 
      ? eligibleSets[Math.floor(Math.random() * eligibleSets.length)]
      : SET_ITEMS_DATABASE[0];
    return {
      ...setTemplate,
      id: 'set_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      iLvl: iLvl,
      sockets: Math.min(4, Math.max(1, Math.floor(Math.random() * (iLvl >= 50 ? 4 : (iLvl >= 25 ? 3 : 2))) + 1)),
      links: 1
    };
  }

  // 5. Calculate Socket Counts based on iLvl
  let maxSockets = 2;
  if (iLvl >= 50) maxSockets = 4;
  else if (iLvl >= 25) maxSockets = 3;
  const sockets = Math.floor(Math.random() * maxSockets) + 1;
  const links = Math.min(sockets, Math.floor(Math.random() * sockets) + 1);

  // 6. Determine Number of Modifiers by Rarity & iLvl
  let maxMods = 0;
  if (rarity === 'Magic') maxMods = Math.random() < 0.5 ? 1 : 2;
  else if (rarity === 'Rare') {
    if (iLvl < 20) maxMods = Math.floor(Math.random() * 2) + 2; // 2-3 mods
    else if (iLvl < 50) maxMods = Math.floor(Math.random() * 2) + 3; // 3-4 mods
    else if (iLvl < 70) maxMods = Math.floor(Math.random() * 2) + 4; // 4-5 mods
    else maxMods = Math.floor(Math.random() * 3) + 4; // 4-6 mods (Endgame)
  }

  // 7. Roll Affix Modifiers from Eligible Tiers (minIlvl <= iLvl)
  const eligibleMods = TIERED_MODIFIERS.filter(m => m.minIlvl <= iLvl);
  const chosenMods = [];
  const itemStats = { ...base.baseStats };
  const usedKeys = new Set();

  for (let i = 0; i < maxMods && eligibleMods.length > 0; i++) {
    const availablePool = eligibleMods.filter(m => !usedKeys.has(m.key));
    if (availablePool.length === 0) break;

    const mod = availablePool[Math.floor(Math.random() * availablePool.length)];
    usedKeys.add(mod.key);

    const rollVal = Math.floor(Math.random() * (mod.maxVal - mod.minVal + 1)) + mod.minVal;
    chosenMods.push(`+${rollVal}${mod.key.includes('res') || mod.key.includes('speed') || mod.key.includes('multi') ? '%' : ''} ${mod.label} (T${mod.tier})`);

    if (mod.key === 'flat_life') itemStats.life = (itemStats.life || 0) + rollVal;
    if (mod.key === 'flat_phys') itemStats.damage = (itemStats.damage || 0) + rollVal;
    if (mod.key === 'flat_es') itemStats.es = (itemStats.es || 0) + rollVal;
    if (mod.key === 'fire_res') itemStats.fireRes = (itemStats.fireRes || 0) + rollVal;
    if (mod.key === 'cold_res') itemStats.coldRes = (itemStats.coldRes || 0) + rollVal;
    if (mod.key === 'light_res') itemStats.lightRes = (itemStats.lightRes || 0) + rollVal;
    if (mod.key === 'attack_speed') itemStats.attackSpeedBonus = (itemStats.attackSpeedBonus || 0) + rollVal;
    if (mod.key === 'crit_multi') itemStats.critMulti = (itemStats.critMulti || 0) + rollVal;
  }

  let itemName = base.baseName;
  if (rarity === 'Magic') {
    itemName = `${chosenMods.length > 0 ? 'Enchanted ' : ''}${base.baseName}`;
  } else if (rarity === 'Rare') {
    const rarePrefixes = ['Apocalypse', 'Vengeance', 'Soul', 'Cataclysm', 'Grim', 'Dread', 'Immortal'];
    const rareSuffixes = ['Bane', 'Grip', 'Edge', 'Ward', 'Hollow', 'Weave', 'Carapace'];
    const rPre = rarePrefixes[Math.floor(Math.random() * rarePrefixes.length)];
    const rSuf = rareSuffixes[Math.floor(Math.random() * rareSuffixes.length)];
    itemName = `${rPre} ${rSuf} (${base.baseName})`;
  }

  return {
    id: 'it_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: itemName,
    baseType: base.baseName,
    category: base.category,
    slot: base.slot,
    rarity: rarity,
    color: RARITY_COLORS[rarity] || '#fff',
    iLvl: iLvl,
    requiredLevel: base.requiredLevel,
    icon: base.icon,
    sprite: base.sprite,
    sockets: sockets,
    links: links,
    stats: itemStats,
    mods: chosenMods,
    lore: base.lore
  };
}

function generateCurrencyDrop(iLvl) {
  const scrollChance = Math.random();
  if (scrollChance < 0.16) {
    return {
      ...RESURRECTION_SCROLL,
      id: 'scroll_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      stack: 1,
      iLvl: iLvl
    };
  }

  const currencies = [
    { key: 'Aether Spark', desc: 'Normal ➔ Magic', icon: '🔵', color: '#8888ff' },
    { key: 'Flux Catalyst', desc: 'Reroll Magic Mods', icon: '🔷', color: '#00f2fe' },
    { key: 'Genesis Prism', desc: 'Normal ➔ Rare (4-6 Mods)', icon: '💎', color: '#ffd700' },
    { key: 'Fracture Core', desc: 'Reroll Rare Mods (Chaos)', icon: '🔮', color: '#ff7700' },
    { key: 'Socketing Core', desc: 'Reforge Sockets', icon: '⚪', color: '#98c379' },
    { key: 'Harmonic Tether', desc: 'Reforge Links', icon: '🔗', color: '#c678dd' }
  ];

  if (iLvl >= 60) {
    currencies.push({ key: 'Ascendant Catalyst', desc: 'Exalt Slam (Add Mod)', icon: '✨', color: '#ffd700' });
    currencies.push({ key: 'Origin Matrix', desc: 'Divine Reroll Min-Max', icon: '👑', color: '#e5c07b' });
  }

  const c = currencies[Math.floor(Math.random() * currencies.length)];
  return {
    id: 'curr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: c.key,
    baseType: 'Genesis Catalyst',
    category: 'currency',
    slot: 'Currency',
    rarity: 'Currency',
    color: c.color,
    icon: c.icon,
    iLvl: iLvl,
    requiredLevel: 1,
    description: c.desc,
    stack: 1
  };
}

function generateMapKeystoneDrop(iLvl) {
  let tier = 1;
  let name = '🌿 Verdant Hollow Map (Tier 1)';
  let targetZone = 'WhisperingPlains';
  let color = '#8888ff';

  if (iLvl >= 80) {
    tier = 16;
    name = '🌌 Pinnacle Void Sanctum Map (Tier 16)';
    targetZone = 'ArenaVoid';
    color = '#c678dd';
  } else if (iLvl >= 75) {
    tier = 14;
    name = '🌋 Pinnacle Caldera Map (Tier 14)';
    targetZone = 'ArenaCaldera';
    color = '#ff416c';
  } else if (iLvl >= 65) {
    tier = 5;
    name = '💀 Forgotten Crypt Map (Tier 5)';
    targetZone = 'ForgottenCrypt';
    color = '#ffd700';
  }

  return {
    id: 'map_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
    name: name,
    baseType: 'Endgame Map Key',
    category: 'map',
    slot: 'Map',
    tier: tier,
    targetZone: targetZone,
    rarity: 'Unique',
    color: color,
    icon: '🗺️',
    iLvl: iLvl,
    requiredLevel: 68,
    mods: [`+${tier * 10}% Increased Item Quantity (IIQ)`, `+${tier * 12}% Item Rarity (IIR)`]
  };
}

// ==========================================
// 4. ICONIC UNIQUE ITEMS POOL
// ==========================================
export const UNIQUE_LOOT = [
  {
    id: 'bloodseeker_blade',
    name: 'Bloodseeker Hellblade',
    baseType: 'Colossus Greatsword of Ruin',
    category: 'weapon',
    slot: 'MainHand',
    rarity: 'Unique',
    color: '#af6025',
    requiredLevel: 68,
    icon: '🗡️',
    sprite: ITEM_SPRITES.sword_fire,
    stats: { damage: 185, attackSpeed: 1.45, critChance: 8.5 },
    mods: ['+65 Fire Damage to Attacks (T1)', 'Instant 4% Life Leech on Critical Hit (T1)', 'Hits have 100% Chance to Ignite (T1)'],
    lore: 'Forged in the underworld pyres, it thirsts for demonic essence.'
  },
  {
    id: 'crown_of_void',
    name: 'Crown of the Void',
    baseType: 'Crown of the Ascendant',
    category: 'armor',
    slot: 'Helm',
    rarity: 'Unique',
    color: '#af6025',
    requiredLevel: 70,
    icon: '👑',
    sprite: ITEM_SPRITES.helm_crown,
    stats: { es: 240, armor: 120, life: 90 },
    mods: ['+35% to Chaos Resistance (T1)', 'Chaos Damage cannot bypass Energy Shield (T1)', '+50 to Maximum Mana (T1)'],
    lore: 'The gaze of the void shields the worthy and devours the weak.'
  }
];

// ==========================================
// 5. ICONIC SET ITEMS & HIDDEN ATTRIBUTE SYNERGIES
// ==========================================
export const SET_DEFINITIONS = {
  set_vanguard: {
    id: 'set_vanguard',
    name: 'Vanguard of the Sacred Sanctuary',
    color: '#00e676',
    pieces: [
      { id: 'vanguard_crown', name: "Vanguard's Iron Crown", slot: 'Helm', icon: '👑', sprite: ITEM_SPRITES.helm_knight, reqLv: 25, iLvl: 30, baseStats: { armor: 95, maxLife: 45, es: 30 }, mods: ['+30 Maximum Life (T4)', '+15% Fire Resistance (T4)'] },
      { id: 'vanguard_cuirass', name: "Vanguard's Aegis Cuirass", slot: 'BodyArmor', icon: '🛡️', sprite: ITEM_SPRITES.armor_plate, reqLv: 25, iLvl: 30, baseStats: { armor: 220, maxLife: 80, es: 60 }, mods: ['+55 Maximum Life (T3)', '+18% Cold Resistance (T4)', '+20% Total Armor (T3)'] },
      { id: 'vanguard_crest', name: "Vanguard's Lion Crest", slot: 'OffHand', icon: '🛡️', sprite: ITEM_SPRITES.shield_lion, reqLv: 25, iLvl: 30, baseStats: { armor: 160, blockChance: 25, maxLife: 50 }, mods: ['+12% Chance to Block (T3)', '+20% Lightning Resistance (T3)'] },
      { id: 'vanguard_greaves', name: "Vanguard's War Greaves", slot: 'Boots', icon: '👢', sprite: ITEM_SPRITES.boots_plate, reqLv: 25, iLvl: 30, baseStats: { armor: 90, speed: 12, maxLife: 35 }, mods: ['+15% Movement Speed (T3)', '+40 Maximum Life (T4)'] }
    ],
    bonuses: [
      { count: 2, desc: '+180 to Maximum Life & +20% Total Armor', stats: { life: 180, armorPct: 20 } },
      { count: 3, desc: '+25% to All Elemental Resistances & +12% Block Chance', stats: { allRes: 25, blockChance: 12 } },
      { count: 4, desc: '★ [Hidden Synergy - Sacred Bastion]: Heavy Slash releases Triple Holy Blade Waves and absorbs 500 fatal damage.', hiddenSynergy: 'holy_blade_waves' }
    ]
  },

  set_ignis: {
    id: 'set_ignis',
    name: "Ignis's Molten Juggernaut",
    color: '#ff5722',
    pieces: [
      { id: 'ignis_cleaver', name: "Ignis's Magma Cleaver", slot: 'MainHand', icon: '🪓', sprite: ITEM_SPRITES.axe_dragon, reqLv: 45, iLvl: 55, baseStats: { damage: 110, attackSpeed: 1.35, critChance: 8.0 }, mods: ['+40 Fire Damage (T2)', '+25% Critical Strike Multiplier (T3)'] },
      { id: 'ignis_carapace', name: "Ignis's Smoldering Carapace", slot: 'BodyArmor', icon: '🛡️', sprite: ITEM_SPRITES.armor_plate, reqLv: 45, iLvl: 55, baseStats: { armor: 480, maxLife: 120, es: 90 }, mods: ['+75 Maximum Life (T2)', '+30% Fire Resistance (T2)'] },
      { id: 'ignis_treads', name: "Ignis's Lava Treads", slot: 'Boots', icon: '👢', sprite: ITEM_SPRITES.boots_plate, reqLv: 45, iLvl: 55, baseStats: { armor: 220, speed: 18 }, mods: ['+20% Movement Speed (T2)', '+25% Fire Resistance (T3)'] },
      { id: 'ignis_signet', name: "Ignis's Blazing Signet", slot: 'Ring', icon: '💍', sprite: ITEM_SPRITES.ring_ruby, reqLv: 45, iLvl: 55, baseStats: { damage: 25, critMulti: 20 }, mods: ['+35 Fire Damage (T2)', '+30% Critical Multiplier (T2)'] }
    ],
    bonuses: [
      { count: 2, desc: '+45 Fire Damage to Attacks & +35% Fire Resistance', stats: { damage: 45, fireRes: 35 } },
      { count: 3, desc: '+22% Attack Speed & +40% Critical Strike Multiplier', stats: { attackSpeedBonus: 22, critMulti: 40 } },
      { count: 4, desc: '★ [Hidden Synergy - Infernal Conflagration]: All Attacks have 35% chance to call down Raining Mini-Meteors & grants Ignite Immunity.', hiddenSynergy: 'raining_mini_meteors' }
    ]
  },

  set_vael: {
    id: 'set_vael',
    name: 'Glacial Sovereign of Vael',
    color: '#00f2fe',
    pieces: [
      { id: 'vael_spire', name: "Vael's Permafrost Spire", slot: 'MainHand', icon: '🪄', sprite: ITEM_SPRITES.staff_arcane, reqLv: 40, iLvl: 50, baseStats: { damage: 95, critChance: 9.0 }, mods: ['+45 Cold Damage to Spells (T2)', '+20% Cast Speed (T3)'] },
      { id: 'vael_circlet', name: "Vael's Crystalline Circlet", slot: 'Helm', icon: '👑', sprite: ITEM_SPRITES.helm_crown, reqLv: 40, iLvl: 50, baseStats: { es: 140, armor: 60, maxMana: 50 }, mods: ['+60 Maximum Energy Shield (T3)', '+25% Cold Resistance (T3)'] },
      { id: 'vael_vestment', name: "Vael's Frostweave Vestment", slot: 'BodyArmor', icon: '🛡️', sprite: ITEM_SPRITES.armor_robe, reqLv: 40, iLvl: 50, baseStats: { es: 260, armor: 140, maxLife: 70 }, mods: ['+95 Maximum Energy Shield (T2)', '+30% Cold Resistance (T2)'] },
      { id: 'vael_tear', name: "Vael's Glacial Tear", slot: 'Amulet', icon: '📿', sprite: ITEM_SPRITES.amulet_diamond, reqLv: 40, iLvl: 50, baseStats: { maxMana: 60, coldRes: 30 }, mods: ['+25% Cold Spell Damage (T2)', '+20% Global Critical Chance (T3)'] }
    ],
    bonuses: [
      { count: 2, desc: '+50 Cold Damage to Spells & +35% Cold Resistance', stats: { damage: 50, coldRes: 35 } },
      { count: 3, desc: '+30% Frost Nova Area of Effect & +40% Freeze Duration', stats: { coldRes: 15 } },
      { count: 4, desc: '★ [Hidden Synergy - Permafrost Shatter]: Frozen monsters shatter on death, detonating into 8 Piercing Ice Shards.', hiddenSynergy: 'ice_shards_shatter' }
    ]
  },

  set_malakor: {
    id: 'set_malakor',
    name: "Malakor's Void Weaver",
    color: '#c678dd',
    pieces: [
      { id: 'malakor_harvester', name: "Malakor's Void Harvester", slot: 'MainHand', icon: '🪄', sprite: ITEM_SPRITES.staff_arcane, reqLv: 68, iLvl: 80, baseStats: { damage: 165, critChance: 10.5 }, mods: ['+70 Chaos Damage to Spells (T1)', '+30% Cast Speed (T1)'] },
      { id: 'malakor_oblivion', name: "Malakor's Crown of Oblivion", slot: 'Helm', icon: '👑', sprite: ITEM_SPRITES.helm_crown, reqLv: 68, iLvl: 80, baseStats: { es: 220, armor: 110, maxMana: 80 }, mods: ['+110 Maximum Energy Shield (T1)', '+35% Chaos Resistance (T1)'] },
      { id: 'malakor_regalia', name: "Malakor's Astral Regalia", slot: 'BodyArmor', icon: '🛡️', sprite: ITEM_SPRITES.armor_robe, reqLv: 68, iLvl: 80, baseStats: { es: 420, armor: 260, maxLife: 110 }, mods: ['+150 Maximum Energy Shield (T1)', '+40% Chaos Resistance (T1)'] },
      { id: 'malakor_walkers', name: "Malakor's Dimensional Walkers", slot: 'Boots', icon: '👢', sprite: ITEM_SPRITES.boots_plate, reqLv: 68, iLvl: 80, baseStats: { es: 160, armor: 100, speed: 22 }, mods: ['+22% Movement Speed (T1)', '+85 Maximum Energy Shield (T2)'] },
      { id: 'malakor_eye', name: "Malakor's Void Eye Ring", slot: 'Ring', icon: '💍', sprite: ITEM_SPRITES.ring_ruby, reqLv: 68, iLvl: 80, baseStats: { damage: 35, allRes: 20 }, mods: ['+45 Chaos Damage (T1)', '+30% Critical Multiplier (T1)'] }
    ],
    bonuses: [
      { count: 2, desc: '+200 Maximum Energy Shield & +25% Cast Speed', stats: { es: 200 } },
      { count: 3, desc: '+50% Chaos Resistance & -20% Mana Cost of all Skills', stats: { allRes: 20 } },
      { count: 5, desc: '★ [Hidden Synergy - Cosmic Singularity]: Fireball & Meteor trigger Gravitational Void Rifts pulling enemies in for 250 Chaos Dmg/s.', hiddenSynergy: 'cosmic_singularity' }
    ]
  }
};

/**
 * Generate Flattened Set Items Pool for Drops
 */
export const SET_ITEMS_DATABASE = [];
for (let sKey in SET_DEFINITIONS) {
  const setDef = SET_DEFINITIONS[sKey];
  setDef.pieces.forEach(p => {
    SET_ITEMS_DATABASE.push({
      id: 'set_' + p.id,
      setId: setDef.id,
      setName: setDef.name,
      name: p.name,
      baseType: p.name,
      category: p.slot === 'MainHand' ? 'weapon' : 'armor',
      slot: p.slot,
      rarity: 'Set',
      color: setDef.color,
      requiredLevel: p.reqLv,
      iLvl: p.iLvl,
      icon: p.icon,
      sprite: p.sprite,
      sockets: 3,
      links: 3,
      stats: { ...p.baseStats },
      mods: [...p.mods],
      lore: `A consecrated relic belonging to the ${setDef.name} set.`
    });
  });
}

/**
 * Calculate all active Set Bonuses & Hidden Synergies for a player
 */
export function getActiveSetBonuses(player) {
  if (!player || !player.equipped) return { activeSets: [], totalBonusStats: {}, hiddenSynergies: [] };

  const setPieceCounts = {};
  const equippedItemNames = new Set();

  for (let slot in player.equipped) {
    const item = player.equipped[slot];
    if (item && item.setId) {
      setPieceCounts[item.setId] = (setPieceCounts[item.setId] || 0) + 1;
      equippedItemNames.add(item.name);
    }
  }

  const activeSets = [];
  const totalBonusStats = {};
  const hiddenSynergies = [];

  for (let setId in setPieceCounts) {
    const count = setPieceCounts[setId];
    const setDef = SET_DEFINITIONS[setId];
    if (!setDef) continue;

    const activatedBonuses = [];
    setDef.bonuses.forEach(b => {
      if (count >= b.count) {
        activatedBonuses.push(b);
        if (b.stats) {
          for (let st in b.stats) {
            totalBonusStats[st] = (totalBonusStats[st] || 0) + b.stats[st];
          }
        }
        if (b.hiddenSynergy) {
          hiddenSynergies.push(b.hiddenSynergy);
        }
      }
    });

    activeSets.push({
      setId: setId,
      name: setDef.name,
      color: setDef.color,
      equippedCount: count,
      totalCount: setDef.pieces.length,
      activatedBonuses: activatedBonuses,
      allBonuses: setDef.bonuses,
      pieces: setDef.pieces
    });
  }

  return { activeSets, totalBonusStats, hiddenSynergies };
}

// ==========================================
// 6. SKILL & SUPPORT GEMS DATABASE (Pure Grinding Drops)
// ==========================================
export const SKILL_GEMS_DATABASE = [
  {
    id: 'gem_fireball',
    name: 'Pyro Fireball Skill Gem',
    baseType: 'Active Skill Gem',
    category: 'gem',
    gemType: 'active',
    skillKey: 'fireball',
    slot: 'Gem',
    rarity: 'SkillGem',
    color: '#1abc9c',
    icon: '🔥',
    minIlvl: 4,
    requiredLevel: 3,
    description: 'Socket in Q binding to unleash explosive Pyro Fireballs.',
    tags: ['fire', 'spell', 'projectile', 'aoe']
  },
  {
    id: 'gem_frost',
    name: 'Frost Nova Skill Gem',
    baseType: 'Active Skill Gem',
    category: 'gem',
    gemType: 'active',
    skillKey: 'frost',
    slot: 'Gem',
    rarity: 'SkillGem',
    color: '#1abc9c',
    icon: '❄️',
    minIlvl: 12,
    requiredLevel: 10,
    description: 'Socket in W binding to blast freezing 360° Frost Novas.',
    tags: ['cold', 'spell', 'aoe']
  },
  {
    id: 'gem_meteor',
    name: 'Cataclysm Meteor Skill Gem',
    baseType: 'Active Skill Gem',
    category: 'gem',
    gemType: 'active',
    skillKey: 'meteor',
    slot: 'Gem',
    rarity: 'SkillGem',
    color: '#ffd700',
    minIlvl: 28,
    requiredLevel: 25,
    description: 'Socket in E binding to call down devastating Cataclysm Meteors.',
    tags: ['fire', 'chaos', 'spell', 'aoe']
  },
  {
    id: 'support_gmp',
    name: 'Greater Multiple Projectiles Support',
    baseType: 'Support Gem',
    category: 'gem',
    gemType: 'support',
    slot: 'Gem',
    rarity: 'SupportGem',
    color: '#e67e22',
    icon: '✨',
    minIlvl: 18,
    requiredLevel: 15,
    description: 'Supported skills fire 3 additional projectiles with spread.',
    tags: ['support', 'projectile']
  },
  {
    id: 'support_fire',
    name: 'Added Fire Damage Support',
    baseType: 'Support Gem',
    category: 'gem',
    gemType: 'support',
    slot: 'Gem',
    rarity: 'SupportGem',
    color: '#e67e22',
    icon: '🔥',
    minIlvl: 8,
    requiredLevel: 6,
    description: 'Grants +35% Added Fire Damage to supported skills.',
    tags: ['support', 'fire']
  },
  {
    id: 'support_echo',
    name: 'Spell Echo Support',
    baseType: 'Support Gem',
    category: 'gem',
    gemType: 'support',
    slot: 'Gem',
    rarity: 'SupportGem',
    color: '#e67e22',
    icon: '⚡',
    minIlvl: 32,
    requiredLevel: 28,
    description: 'Supported spells repeat an additional time with +25% Cast Speed.',
    tags: ['support', 'spell']
  }
];

export const AWAKENING_ESSENCES = [
  {
    id: 'essence_blade',
    name: 'Essence of the Blade Sovereign',
    nameVi: 'Tinh Hoa Kiếm Thần',
    baseType: 'Awakening Catalyst',
    category: 'currency',
    slot: 'Currency',
    rarity: 'Unique',
    color: '#9b59b6',
    icon: '🌌',
    skillKey: 'slash',
    lore: 'Primordial essence harvested from ancient elite beasts and abyss lords.',
    description: 'Requires Rank A Slash. Unlocks Awakened Form: Void Dimension Cleave!',
    sprite: { sheet: 'essences', sx: 35, sy: 280, sw: 175, sh: 360 }
  },
  {
    id: 'essence_pyro',
    name: 'Essence of the Solar Archon',
    nameVi: 'Tinh Hoa Thái Dương',
    baseType: 'Awakening Catalyst',
    category: 'currency',
    slot: 'Currency',
    rarity: 'Unique',
    color: '#ff7675',
    icon: '☀️',
    skillKey: 'fireball',
    lore: 'Superheated celestial core salvaged from infernal boss behemoths.',
    description: 'Requires Rank A Fireball. Unlocks Awakened Form: Supernova Celestial Orb!',
    sprite: { sheet: 'essences', sx: 225, sy: 280, sw: 175, sh: 360 }
  },
  {
    id: 'essence_frost',
    name: 'Essence of Absolute Zero',
    nameVi: 'Tinh Hoa Băng Tuyệt Đối',
    baseType: 'Awakening Catalyst',
    category: 'currency',
    slot: 'Currency',
    rarity: 'Unique',
    color: '#00f2fe',
    icon: '❄️',
    skillKey: 'frost',
    lore: 'Glacial heart forged at the subterranean summit of permafrost glaciers.',
    description: 'Requires Rank A Frost Nova. Unlocks Awakened Form: Glacial Domain of Oblivion!',
    sprite: { sheet: 'essences', sx: 415, sy: 280, sw: 175, sh: 360 }
  },
  {
    id: 'essence_meteor',
    name: 'Essence of the Cosmic Void',
    nameVi: 'Tinh Hoa Tinh Cầu Hư Vô',
    baseType: 'Awakening Catalyst',
    category: 'currency',
    slot: 'Currency',
    rarity: 'Unique',
    color: '#e17055',
    icon: '☄️',
    skillKey: 'meteor',
    lore: 'Fractured astral fragment from the Void Sovereign Prime.',
    description: 'Requires Rank A Meteor. Unlocks Awakened Form: Starfall Cataclysm!',
    sprite: { sheet: 'essences', sx: 605, sy: 280, sw: 175, sh: 360 }
  },
  {
    id: 'essence_dash',
    name: 'Essence of the Phantom Mirage',
    nameVi: 'Tinh Hoa Tàn Ảnh',
    baseType: 'Awakening Catalyst',
    category: 'currency',
    slot: 'Currency',
    rarity: 'Unique',
    color: '#ffd700',
    icon: '⚡',
    skillKey: 'dash',
    lore: 'Temporal phantom residue extracted from apex storm stalkers.',
    description: 'Requires Rank A Dash. Unlocks Awakened Form: Flash Phantasm Mirage!',
    sprite: { sheet: 'essences', sx: 785, sy: 280, sw: 175, sh: 360 }
  }
];

export const POSSIBLE_LOOT = [
  ...BASE_EQUIPMENT,
  ...UNIQUE_LOOT,
  ...SET_ITEMS_DATABASE,
  ...SKILL_GEMS_DATABASE,
  ...AWAKENING_ESSENCES,
  RESURRECTION_SCROLL
];

export async function fetchMasterItemsFromServer() {
  try {
    const res = await fetch('/api/v1/data/items');
    if (!res.ok) return;
    const serverItems = await res.json();
    if (Array.isArray(serverItems) && serverItems.length > 0) {
      console.log(`[MasterData] Hydrated ${serverItems.length} item templates from SQLite database.`);
    }
  } catch (e) {
    console.warn('[MasterData] Using bundled offline item templates fallback:', e.message);
  }
}

