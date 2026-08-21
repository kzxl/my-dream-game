/**
 * MDG: Aethelis - Crafting Materials & Base Forging Recipes Data
 */

export const MATERIALS_CATALOG = {
  // A. Ores & Metals
  mat_iron_ore: {
    id: 'mat_iron_ore',
    name: 'Iron Ore',
    category: 'Ore',
    icon: '⛏️',
    color: '#a0a8b7',
    rarity: 'Common',
    desc: 'Dense iron ore extracted from shallow veins. Used for basic blacksmithing.'
  },
  mat_mithril_chunk: {
    id: 'mat_mithril_chunk',
    name: 'Mithril Chunk',
    category: 'Ore',
    icon: '💎',
    color: '#00f2fe',
    rarity: 'Uncommon',
    desc: 'Lightweight enchanted metal mined from subterranean glacial caverns.'
  },
  mat_adamantite_ingot: {
    id: 'mat_adamantite_ingot',
    name: 'Adamantite Ingot',
    category: 'Ore',
    icon: '🪨',
    color: '#ffd700',
    rarity: 'Rare',
    desc: 'Indestructible primordial metal smelted at the core of volcanoes.'
  },
  mat_aether_crystal: {
    id: 'mat_aether_crystal',
    name: 'Aether Crystal',
    category: 'Ore',
    icon: '🔮',
    color: '#c678dd',
    rarity: 'Uncommon',
    desc: 'Luminescent arcane crystalline node that stores pure leyline magic.'
  },

  // B. Herbs & Extracts
  mat_blood_herb: {
    id: 'mat_blood_herb',
    name: 'Bloodroot Herb',
    category: 'Herb',
    icon: '🌿',
    color: '#ff4d4f',
    rarity: 'Common',
    desc: 'Crimson root brimming with vital essence. Brews potent healing tonics.'
  },
  mat_mana_bloom: {
    id: 'mat_mana_bloom',
    name: 'Mana Bloom',
    category: 'Herb',
    icon: '🌸',
    color: '#1890ff',
    rarity: 'Common',
    desc: 'Petals that glow with mystic dew. Restores and fortifies mana flow.'
  },
  mat_wind_leaf: {
    id: 'mat_wind_leaf',
    name: 'Windstrider Leaf',
    category: 'Herb',
    icon: '🍃',
    color: '#52c41a',
    rarity: 'Uncommon',
    desc: 'Featherlight leaves from mountaintop flora. Brews speed elixirs.'
  },

  // C. Beast Trophies
  mat_beast_leather: {
    id: 'mat_beast_leather',
    name: 'Beast Leather',
    category: 'Beast',
    icon: '🐺',
    color: '#d48806',
    rarity: 'Common',
    desc: 'Tough hide harvested from predatory wild beasts.'
  },
  mat_fiend_horn: {
    id: 'mat_fiend_horn',
    name: 'Fiend Demon Horn',
    category: 'Beast',
    icon: '👹',
    color: '#eb2f96',
    rarity: 'Rare',
    desc: 'Curved demonic horn infused with void malice. Enhances critical strikes.'
  },
  mat_dragon_scale: {
    id: 'mat_dragon_scale',
    name: 'Dragon Scale',
    category: 'Beast',
    icon: '🐉',
    color: '#fa541c',
    rarity: 'Mythic',
    desc: 'Volcanic wyrm scale impenetrable to flame and physical strikes.'
  },

  // D. Elemental & Genesis Shards
  mat_fire_core: {
    id: 'mat_fire_core',
    name: 'Molten Core',
    category: 'Elemental',
    icon: '🔥',
    color: '#ff7849',
    rarity: 'Rare',
    desc: 'Pulsing core of living flame. Infuses weapons with fire fury.'
  },
  mat_frost_core: {
    id: 'mat_frost_core',
    name: 'Glacial Core',
    category: 'Elemental',
    icon: '❄️',
    color: '#00f2fe',
    rarity: 'Rare',
    desc: 'Sub-zero crystal that emanates perpetual permafrost.'
  },
  mat_shard_genesis: {
    id: 'mat_shard_genesis',
    name: 'Genesis Shard',
    category: 'Genesis',
    icon: '✨',
    color: '#ffd700',
    rarity: 'Mythic',
    desc: 'Concentrated shard of the Primordial Core. Used to forge God-tier relics.'
  }
};

export const FORGING_RECIPES = [
  {
    id: 'forge_iron_sword',
    name: 'Iron Longsword',
    baseType: 'sword_1h',
    slot: 'MainHand',
    level: 1,
    icon: '🗡️',
    desc: 'Reliable iron broadsword for novice combatants.',
    baseStats: '+18 Physical Damage, 1.25 Atk Spd',
    costs: { mat_iron_ore: 5, mat_beast_leather: 2 },
    isDefaultUnlocked: true,
    dropSource: null
  },
  {
    id: 'forge_iron_armor',
    name: 'Reinforced Iron Cuirass',
    baseType: 'body_armor',
    slot: 'BodyArmor',
    level: 1,
    icon: '🛡️',
    desc: 'Sturdy iron breastplate providing basic armor.',
    baseStats: '+65 Armor, +40 Max Life',
    costs: { mat_iron_ore: 6, mat_beast_leather: 4 },
    isDefaultUnlocked: true,
    dropSource: null
  },
  {
    id: 'forge_aether_ring',
    name: 'Aetherium Band of Resilience',
    baseType: 'ring',
    slot: 'Ring',
    level: 20,
    icon: '💍',
    desc: 'Intricately carved ring channeling ambient mana.',
    baseStats: '+35 Max Mana, +18% Elemental Res',
    costs: { mat_mithril_chunk: 4, mat_aether_crystal: 4 },
    isDefaultUnlocked: false,
    dropSource: {
      monsterId: 'malakor',
      monsterName: 'Malakor the Shadow Fiend',
      altMonsterId: 'skeleton_warrior',
      altMonsterName: 'Crypt Undead Warrior',
      biome: 'Dungeon / Crypts (Act 1)',
      bossChance: 0.85,
      minionChance: 0.12
    }
  },
  {
    id: 'forge_mithril_blade',
    name: 'Mithril Arcane Blade',
    baseType: 'sword_1h',
    slot: 'MainHand',
    level: 25,
    icon: '⚔️',
    desc: 'Keen mithril rapier attuned to elemental spells.',
    baseStats: '+42 Physical Damage, +20 Elemental Dmg',
    costs: { mat_mithril_chunk: 8, mat_aether_crystal: 3 },
    isDefaultUnlocked: false,
    dropSource: {
      monsterId: 'vael_frost',
      monsterName: 'Cryomancer Vael the Frost Sovereign',
      altMonsterId: 'frost_elemental',
      altMonsterName: 'Frost Elemental',
      biome: 'Frozen Spires / Tundra (Act 2)',
      bossChance: 1.0,
      minionChance: 0.15
    }
  },
  {
    id: 'forge_mithril_hauberk',
    name: 'Mithril Ward Hauberk',
    baseType: 'body_armor',
    slot: 'BodyArmor',
    level: 25,
    icon: '🛡️',
    desc: 'Woven mithril rings reinforced with beast hide.',
    baseStats: '+140 Armor, +60 Energy Shield',
    costs: { mat_mithril_chunk: 10, mat_beast_leather: 6 },
    isDefaultUnlocked: false,
    dropSource: {
      monsterId: 'yeti',
      monsterName: 'Yeti Frost Goliath',
      altMonsterId: 'vael_frost',
      altMonsterName: 'Cryomancer Vael',
      biome: 'Frozen Spires / Tundra (Act 2)',
      bossChance: 1.0,
      minionChance: 0.25
    }
  },
  {
    id: 'forge_prismatic_amulet',
    name: 'Prismatic Star Amulet',
    baseType: 'amulet',
    slot: 'Amulet',
    level: 40,
    icon: '📿',
    desc: 'Rare star relic adorned with a glowing Genesis Shard.',
    baseStats: '+24 All Attributes, +15% Global Damage',
    costs: { mat_adamantite_ingot: 6, mat_aether_crystal: 8, mat_shard_genesis: 2 },
    isDefaultUnlocked: false,
    dropSource: {
      monsterId: 'ignis_dragon',
      monsterName: 'Ignis the Scourge Wyrm',
      altMonsterId: 'magma_golem',
      altMonsterName: 'Magma Colossus Golem',
      biome: 'Volcanic Core (Act 3)',
      bossChance: 0.85,
      minionChance: 0.18
    }
  },
  {
    id: 'forge_adamantite_greatsword',
    name: 'Adamantite Colossus Greatsword',
    baseType: 'sword_2h',
    slot: 'MainHand',
    level: 50,
    icon: '🗡️',
    desc: 'Devastating two-handed colossus greatsword.',
    baseStats: '+115 Physical Damage, +25% Crit Multi',
    costs: { mat_adamantite_ingot: 12, mat_aether_crystal: 4 },
    isDefaultUnlocked: false,
    dropSource: {
      monsterId: 'ignis_dragon',
      monsterName: 'Ignis the Scourge Wyrm',
      biome: 'Volcanic Core (Act 3 Boss)',
      bossChance: 1.0,
      minionChance: 0.05
    }
  },
  {
    id: 'forge_adamantite_plate',
    name: 'Adamantite Titan Warplate',
    baseType: 'body_armor',
    slot: 'BodyArmor',
    level: 50,
    icon: '🛡️',
    desc: 'Heavy titan battleplate forged for frontline vanguards.',
    baseStats: '+320 Armor, +120 Max Life, +15% All Res',
    costs: { mat_adamantite_ingot: 15, mat_aether_crystal: 6 },
    isDefaultUnlocked: false,
    dropSource: {
      monsterId: 'ignis_dragon',
      monsterName: 'Ignis the Scourge Wyrm',
      biome: 'Volcanic Core (Act 3 Boss)',
      bossChance: 1.0,
      minionChance: 0.05
    }
  }
];

export function createRecipeScrollItem(recipe) {
  if (!recipe) return null;
  const isMythic = recipe.level >= 50;
  const isRare = recipe.level >= 25;
  const rarity = isMythic ? 'Unique' : (isRare ? 'Rare' : 'Magic');
  const color = isMythic ? '#ffd700' : (isRare ? '#e5c07b' : '#61afef');

  return {
    id: `recipe_${recipe.id}_${Math.random().toString(36).substring(2, 7)}`,
    recipeId: recipe.id,
    name: `📜 Bí Kíp: ${recipe.name}`,
    category: 'recipe',
    slot: 'Recipe',
    rarity: rarity,
    color: color,
    icon: '📜',
    level: recipe.level,
    desc: `Cuộn da dê cổ phong ấn bí quyết đúc [${recipe.name}]. Chuột phải hoặc bấm vào để học vĩnh viễn cho Bàn Rèn Genesis.`,
    beamHeight: isMythic ? 400 : 260
  };
}

export function getRecipeDropForMonster(monsterId, isBoss) {
  if (!monsterId) return null;
  const mId = monsterId.toLowerCase();

  const candidates = FORGING_RECIPES.filter(r => {
    if (r.isDefaultUnlocked || !r.dropSource) return false;
    const s = r.dropSource;
    return (s.monsterId && s.monsterId.toLowerCase() === mId) ||
           (s.altMonsterId && s.altMonsterId.toLowerCase() === mId);
  });

  if (candidates.length === 0) return null;

  for (const recipe of candidates) {
    const s = recipe.dropSource;
    const isPrimaryBoss = s.monsterId && s.monsterId.toLowerCase() === mId;
    const chance = isBoss && isPrimaryBoss ? (s.bossChance || 0.8) : (s.minionChance || 0.1);
    if (Math.random() < chance) {
      return createRecipeScrollItem(recipe);
    }
  }

  return null;
}

export function getMaterialInfo(matId) {
  return MATERIALS_CATALOG[matId] || {
    id: matId,
    name: matId,
    category: 'Material',
    icon: '📦',
    color: '#a0a8b7',
    rarity: 'Common',
    desc: 'Crafting material.'
  };
}

export function previewSalvageItem(item) {
  if (!item) return [];
  const rarity = (item.rarity || 'Normal').toLowerCase();
  
  if (rarity === 'unique') {
    return [
      { id: 'mat_adamantite_ingot', count: 12 },
      { id: 'mat_shard_genesis', count: 3 },
      { id: 'fracture_core', count: 1, isCurrency: true }
    ];
  }
  if (rarity === 'rare') {
    return [
      { id: 'mat_adamantite_ingot', count: 6 },
      { id: 'mat_aether_crystal', count: 3 },
      { id: 'mat_shard_genesis', count: 1 }
    ];
  }
  if (rarity === 'magic') {
    return [
      { id: 'mat_mithril_chunk', count: 4 },
      { id: 'mat_aether_crystal', count: 2 }
    ];
  }
  return [
    { id: 'mat_iron_ore', count: 3 },
    { id: 'mat_beast_leather', count: 1 }
  ];
}
