/**
 * Item Database, Rarities & Sprite Coordinates (Including Skill Gems & Support Gems)
 */

export const RARITY_COLORS = {
  Normal: '#c8c8c8',
  Magic: '#8888ff',
  Rare: '#ffff77',
  Unique: '#af6025',
  Currency: '#aa9e82',
  SkillGem: '#1abc9c',
  SupportGem: '#e67e22'
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

export const POSSIBLE_LOOT = [
  // --- ACTIVE SKILL GEMS ---
  {
    id: 'gem_fireball',
    name: 'Pyro Fireball Gem',
    baseType: 'Active Skill Gem',
    category: 'skill_gem',
    skillKey: 'fireball',
    rarity: 'SkillGem',
    icon: '🔥',
    tags: ['fire', 'spell', 'projectile', 'aoe'],
    primaryStats: { 'Mana Cost': '10 MP', 'Cast Time': 'Instant', 'Base Radius': '12px' },
    mods: ['Socket into Skill Board (Q) to unlock Pyro Fireball', 'Unlocks Fireball Mastery Tree as it levels up'],
    lore: 'An orb of crystallized elemental magma.'
  },
  {
    id: 'gem_slash',
    name: 'Heavy Slash Gem',
    baseType: 'Active Skill Gem',
    category: 'skill_gem',
    skillKey: 'slash',
    rarity: 'SkillGem',
    icon: '⚔️',
    tags: ['physical', 'melee', 'attack'],
    primaryStats: { 'Attack Speed': '0.35s CD', 'Base Reach': '75px' },
    mods: ['Socket into Skill Board (LMB) to unlock Heavy Slash', 'Unlocks Slash Mastery Tree & Blade Waves'],
    lore: 'Imbued with the martial vigor of Sanctuary warriors.'
  },
  {
    id: 'gem_frost',
    name: 'Frost Nova Gem',
    baseType: 'Active Skill Gem',
    category: 'skill_gem',
    skillKey: 'frost',
    rarity: 'SkillGem',
    icon: '❄️',
    tags: ['cold', 'spell', 'aoe'],
    primaryStats: { 'Mana Cost': '15 MP', 'Radius': '150px' },
    mods: ['Socket into Skill Board (W) to unlock Frost Nova', 'Unlocks Freeze & Ice Vortex Morphs'],
    lore: 'Radiates a permafrost chill.'
  },
  {
    id: 'gem_meteor',
    name: 'Cataclysm Meteor Gem',
    baseType: 'Active Skill Gem',
    category: 'skill_gem',
    skillKey: 'meteor',
    rarity: 'SkillGem',
    icon: '☄️',
    tags: ['fire', 'chaos', 'spell', 'aoe'],
    primaryStats: { 'Mana Cost': '30 MP', 'Damage': '180 Fire + 30 Chaos' },
    mods: ['Socket into Skill Board (E) to unlock Cataclysm Meteor', 'Unlocks Armageddon & Lava Pool Morphs'],
    lore: 'A fragment of a fallen celestial star.'
  },
  {
    id: 'gem_dash',
    name: 'Shadow Dash Gem',
    baseType: 'Active Skill Gem',
    category: 'skill_gem',
    skillKey: 'dash',
    rarity: 'SkillGem',
    icon: '💨',
    tags: ['movement', 'chaos'],
    primaryStats: { 'Distance': '190px', 'Cooldown': '1.2s' },
    mods: ['Socket into Skill Board (SPACE) to unlock Shadow Dash', 'Unlocks Double Dash & Phase Shift'],
    lore: 'Allows the bearer to slip between dimensional seams.'
  },

  // --- SUPPORT GEMS ---
  {
    id: 'support_gmp',
    name: 'Greater Multiple Projectiles Support',
    baseType: 'Support Gem',
    category: 'support_gem',
    supportKey: 'gmp',
    rarity: 'SupportGem',
    icon: '🔮',
    allowedTags: ['projectile'],
    primaryStats: { 'Mana Multiplier': '130%', 'Supported': 'Projectile Skills' },
    mods: ['Supported Skills fire +2 additional Projectiles', '15% Less Damage per Projectile'],
    lore: 'Splits arcane projectiles into a lethal volley.'
  },
  {
    id: 'support_fire',
    name: 'Infernal Combustion Support',
    baseType: 'Support Gem',
    category: 'support_gem',
    supportKey: 'infernal',
    rarity: 'SupportGem',
    icon: '💥',
    allowedTags: ['fire', 'spell', 'attack'],
    primaryStats: { 'Mana Multiplier': '120%', 'Supported': 'Fire / Attack / Spell' },
    mods: ['Supported Skills gain +40% Fire Damage', '+50% Chance to Ignite target for 3s'],
    lore: 'Infuses hits with unquenchable infernal fuel.'
  },
  {
    id: 'support_echo',
    name: 'Spell Echo & Rapid Cast Support',
    baseType: 'Support Gem',
    category: 'support_gem',
    supportKey: 'echo',
    rarity: 'SupportGem',
    icon: '⚡',
    allowedTags: ['spell', 'attack', 'melee'],
    primaryStats: { 'Mana Multiplier': '115%', 'Supported': 'All Active Skills' },
    mods: ['+35% Increased Cast & Attack Speed', '10% Reduced Skill Cooldown'],
    lore: 'Echoes the caster’s incantation in rapid succession.'
  },

  // --- EQUIPMENT & WEAPONS ---
  {
    id: 'bloodseeker_blade',
    name: 'Bloodseeker Hellblade',
    baseType: 'Exquisite Hellblade',
    category: 'weapon',
    slot: 'MainHand',
    rarity: 'Unique',
    icon: '🗡️',
    sprite: ITEM_SPRITES.sword_fire,
    primaryStats: { 'Physical Damage': '82 - 145', 'Attack Speed': '1.45/s', 'Critical Chance': '8.5%' },
    mods: ['+50 Fire Damage to Attacks', 'Instant 4% Life Leech on Critical Hit', 'Hits have 100% Chance to Ignite'],
    lore: 'Forged in the underworld pyres, it thirsts for demonic essence.'
  },
  {
    id: 'crown_of_void',
    name: 'Crown of the Void',
    baseType: 'Hubris Circlet',
    category: 'armor',
    slot: 'Helm',
    rarity: 'Unique',
    icon: '👑',
    sprite: ITEM_SPRITES.helm_crown,
    primaryStats: { 'Energy Shield': '+120', 'Armor': '+45' },
    mods: ['+30% to Chaos Resistance', 'Chaos Damage cannot bypass Energy Shield', '+25 to Maximum Mana'],
    lore: 'The gaze of the void shields the worthy and devours the weak.'
  },
  {
    id: 'dragonbone_axe',
    name: 'Dragonbone Greataxe',
    baseType: 'Two Hand War Axe',
    category: 'weapon',
    slot: 'MainHand',
    rarity: 'Rare',
    icon: '🪓',
    sprite: ITEM_SPRITES.axe_dragon,
    primaryStats: { 'Physical Damage': '95 - 180', 'Critical Chance': '7.0%' },
    mods: ['+45 Physical Damage', '+35% Increased Attack Speed', '+25% Critical Strike Multiplier'],
    lore: 'Carved from the spine of an ancient wyrm.'
  },
  {
    id: 'aegis_lion',
    name: 'Lionheart Crest Shield',
    baseType: 'Imperial Kite Shield',
    category: 'armor',
    slot: 'OffHand',
    rarity: 'Rare',
    icon: '🛡️',
    sprite: ITEM_SPRITES.shield_lion,
    primaryStats: { 'Armor': '+320', 'Block Chance': '28%' },
    mods: ['+25% to Fire Resistance', '+25% to Cold Resistance', '+80 Maximum Life'],
    lore: 'Emblazoned with the proud sigil of Sanctuary.'
  },
  {
    id: 'juggernaut_plate',
    name: 'Refined Juggernaut Plate',
    baseType: 'Full Plate Mail',
    category: 'armor',
    slot: 'BodyArmor',
    rarity: 'Rare',
    icon: '🛡️',
    sprite: ITEM_SPRITES.armor_plate,
    primaryStats: { 'Armor': '+450', 'Movement Penalty': '-3%' },
    mods: ['+120 Maximum Life', '+15% to All Elemental Resistances', '5% Additional Physical Damage Reduction'],
    lore: 'Heavy steel tempered in dragon flame.'
  },
  {
    id: 'voidwalker_sabatons',
    name: 'Voidwalker Sabatons',
    baseType: 'Armored Greaves',
    category: 'armor',
    slot: 'Boots',
    rarity: 'Rare',
    icon: '👢',
    sprite: ITEM_SPRITES.boots_plate,
    primaryStats: { 'Armor': '+120', 'Evasion': '+85' },
    mods: ['+30% Increased Movement Speed', '+65 Maximum Life', '+35% to Fire Resistance'],
    lore: 'Steps as light as shadow, as steadfast as iron.'
  },
  {
    id: 'solar_amulet',
    name: 'Solar Medallion',
    baseType: 'Gold Amulet',
    category: 'armor',
    slot: 'Amulet',
    rarity: 'Rare',
    icon: '📿',
    sprite: ITEM_SPRITES.amulet_diamond,
    primaryStats: { 'All Attributes': '+15' },
    mods: ['+22% Global Critical Strike Multiplier', '+30 Maximum Mana', '+20% Fire Damage'],
    lore: 'Radiates a gentle, soothing warmth.'
  },
  {
    id: 'sapphire_ring',
    name: 'Glacial Signet Ring',
    baseType: 'Sapphire Ring',
    category: 'armor',
    slot: 'Ring',
    rarity: 'Magic',
    icon: '💍',
    sprite: ITEM_SPRITES.ring_sapphire,
    primaryStats: { 'Cold Resistance': '+30%' },
    mods: ['+45 Maximum Energy Shield', '+15% Cast Speed'],
    lore: 'Cold to the touch.'
  },
  {
    id: 'chaos_orb',
    name: 'Chaos Orb',
    baseType: 'Currency',
    category: 'currency',
    rarity: 'Currency',
    icon: '🔮',
    primaryStats: { 'Stack Size': '1 / 20' },
    mods: ['Reforges a rare item with new random modifiers'],
    lore: 'The fundamental currency of the exiled realms.'
  },
  {
    id: 'exalted_orb',
    name: 'Exalted Orb',
    baseType: 'Currency',
    category: 'currency',
    rarity: 'Currency',
    icon: '🌟',
    primaryStats: { 'Stack Size': '1 / 10' },
    mods: ['Augments a rare item with a new high-tier modifier'],
    lore: 'Precious gold imbued with ancestral virtue.'
  }
];
