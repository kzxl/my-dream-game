/**
 * MDG: Aethelis - Crafting Materials, Smelting Kiln, Alchemy & Base Forging Recipes Data
 */

export const MATERIALS_CATALOG = {
  // A. Ores, Minerals & Glass Bases
  mat_silica_sand: {
    id: 'mat_silica_sand',
    name: 'Silica Sand',
    nameVi: 'Cát Thạch Anh',
    category: 'Ore',
    icon: '📦',
    color: '#e2e8f0',
    rarity: 'Common',
    desc: 'Fine quartz silica harvested from riverbanks and cave veins. Smelted into glass vials.'
  },
  mat_iron_ore: {
    id: 'mat_iron_ore',
    name: 'Iron Ore',
    nameVi: 'Quặng Sắt Thô',
    category: 'Ore',
    icon: '⛏️',
    color: '#a0a8b7',
    rarity: 'Common',
    desc: 'Dense iron ore extracted from shallow veins. Smelted into iron ingots.'
  },
  mat_mithril_chunk: {
    id: 'mat_mithril_chunk',
    name: 'Mithril Chunk',
    nameVi: 'Quặng Mithril',
    category: 'Ore',
    icon: '💎',
    color: '#00f2fe',
    rarity: 'Uncommon',
    desc: 'Lightweight enchanted metal mined from subterranean glacial caverns.'
  },
  mat_adamantite_ingot: {
    id: 'mat_adamantite_ingot',
    name: 'Adamantite Ingot',
    nameVi: 'Thỏi Adamantite',
    category: 'Ore',
    icon: '🪨',
    color: '#ffd700',
    rarity: 'Rare',
    desc: 'Indestructible primordial metal smelted at the core of volcanoes.'
  },
  mat_aether_crystal: {
    id: 'mat_aether_crystal',
    name: 'Aether Crystal',
    nameVi: 'Tinh Thể Aether',
    category: 'Ore',
    icon: '🔮',
    color: '#c678dd',
    rarity: 'Uncommon',
    desc: 'Luminescent arcane crystalline node that stores pure leyline magic.'
  },

  // B. Refined Ingots, Glass Vials & Processed Parts
  item_empty_vial: {
    id: 'item_empty_vial',
    name: 'Empty Glass Vial',
    nameVi: 'Bình Thủy Tinh Rỗng',
    category: 'Vessel',
    icon: '🧪',
    color: '#38bdf8',
    rarity: 'Common',
    desc: 'Heat-resistant blown glass vial. Essential vessel for brewing potions and flasks.'
  },
  item_crystal_flask: {
    id: 'item_crystal_flask',
    name: 'Reinforced Crystal Flask',
    nameVi: 'Bình Thạch Anh Cường Hóa',
    category: 'Vessel',
    icon: '⚗️',
    color: '#c084fc',
    rarity: 'Rare',
    desc: 'Crystal-infused sacred vessel capable of containing superheated celestial elixirs.'
  },
  mat_iron_ingot: {
    id: 'mat_iron_ingot',
    name: 'Iron Ingot',
    nameVi: 'Thỏi Sắt Tinh Luyện',
    category: 'Refined',
    icon: '🧱',
    color: '#cbd5e1',
    rarity: 'Common',
    desc: 'Smelted iron bar purified of slag. Used for forging basic weapons and armor.'
  },
  mat_mithril_ingot: {
    id: 'mat_mithril_ingot',
    name: 'Mithril Ingot',
    nameVi: 'Thỏi Mithril Băng Ngân',
    category: 'Refined',
    icon: '💎',
    color: '#38bdf8',
    rarity: 'Uncommon',
    desc: 'Enchanted mithril bar for forging high-tier arcane blades and light armor.'
  },
  mat_tanned_leather: {
    id: 'mat_tanned_leather',
    name: 'Tanned Leather',
    nameVi: 'Da Thuộc Bền Bỉ',
    category: 'Refined',
    icon: '📜',
    color: '#f59e0b',
    rarity: 'Common',
    desc: 'Cured and tanned beast leather with high tensile strength and weather resistance.'
  },
  mat_heartwood: {
    id: 'mat_heartwood',
    name: 'Ancient Heartwood',
    nameVi: 'Gỗ Lõi Cổ Thụ',
    category: 'Wood',
    icon: '🪵',
    color: '#a16207',
    rarity: 'Uncommon',
    desc: 'Dense timber from ancient elder trees. Conducts arcane currents for staves and hilts.'
  },

  // C. Solvents & Herbs
  mat_aether_water: {
    id: 'mat_aether_water',
    name: 'Pure Aether Dew',
    nameVi: 'Nước Suối Aether',
    category: 'Solvent',
    icon: '💧',
    color: '#67e8f9',
    rarity: 'Common',
    desc: 'Pristine spring water gathered from mystical pools. Perfect solvent for alchemy.'
  },
  mat_blood_herb: {
    id: 'mat_blood_herb',
    name: 'Bloodroot Herb',
    nameVi: 'Rễ Huyết Thảo',
    category: 'Herb',
    icon: '🌿',
    color: '#ff4d4f',
    rarity: 'Common',
    desc: 'Crimson root brimming with vital essence. Brews potent healing tonics.'
  },
  mat_mana_bloom: {
    id: 'mat_mana_bloom',
    name: 'Mana Bloom',
    nameVi: 'Hoa Ma Lực',
    category: 'Herb',
    icon: '🌸',
    color: '#1890ff',
    rarity: 'Common',
    desc: 'Petals that glow with mystic dew. Restores and fortifies mana flow.'
  },
  mat_wind_leaf: {
    id: 'mat_wind_leaf',
    name: 'Windstrider Leaf',
    nameVi: 'Lá Phong Lôi',
    category: 'Herb',
    icon: '🍃',
    color: '#52c41a',
    rarity: 'Uncommon',
    desc: 'Featherlight leaves from mountaintop flora. Brews speed elixirs.'
  },

  // D. Beast Trophies
  mat_beast_leather: {
    id: 'mat_beast_leather',
    name: 'Raw Beast Hide',
    nameVi: 'Da Thú Tươi',
    category: 'Beast',
    icon: '🐺',
    color: '#d48806',
    rarity: 'Common',
    desc: 'Raw untanned hide harvested from predatory wild beasts.'
  },
  mat_fiend_horn: {
    id: 'mat_fiend_horn',
    name: 'Fiend Demon Horn',
    nameVi: 'Sừng Quỷ Dị Giới',
    category: 'Beast',
    icon: '👹',
    color: '#eb2f96',
    rarity: 'Rare',
    desc: 'Curved demonic horn infused with void malice. Enhances critical strikes.'
  },
  mat_dragon_scale: {
    id: 'mat_dragon_scale',
    name: 'Dragon Scale',
    nameVi: 'Vảy Rồng Lửa',
    category: 'Beast',
    icon: '🐉',
    color: '#fa541c',
    rarity: 'Mythic',
    desc: 'Volcanic wyrm scale impenetrable to flame and physical strikes.'
  },

  // E. Expanded Specialized Biome Materials
  mat_pure_silver: {
    id: 'mat_pure_silver',
    name: 'Ancient Pure Silver',
    nameVi: 'Bạc Cổ Tinh Khiết',
    category: 'Ore',
    icon: '🪙',
    color: '#e2e8f0',
    rarity: 'Uncommon',
    desc: 'High-purity silver harvested from subterranean crypt veins. Enhances undead slaying gear.'
  },
  mat_titan_ore: {
    id: 'mat_titan_ore',
    name: 'Titan Heavy Ore',
    nameVi: 'Quặng Titan Khổng Lồ',
    category: 'Ore',
    icon: '🪨',
    color: '#94a3b8',
    rarity: 'Rare',
    desc: 'Dense titan ore mined from the highest peaks. Forges heavy armor and colossus blades.'
  },
  mat_astral_crystal: {
    id: 'mat_astral_crystal',
    name: 'Genesis Astral Crystal',
    nameVi: 'Pha Lê Khởi Nguyên',
    category: 'Ore',
    icon: '💠',
    color: '#00f2fe',
    rarity: 'Mythic',
    desc: 'Purest crystalline essence forged at the celestial core of Aethelis.'
  },
  mat_moon_spore: {
    id: 'mat_moon_spore',
    name: 'Moonlight Mushroom Spore',
    nameVi: 'Bào Tử Nấm Nguyệt Dạ',
    category: 'Herb',
    icon: '🍄',
    color: '#c084fc',
    rarity: 'Uncommon',
    desc: 'Bioluminescent fungal spores harvested under dense forest canopies. Brews stealth and mana draughts.'
  },
  mat_dragon_lily: {
    id: 'mat_dragon_lily',
    name: 'Dragonflame Lily',
    nameVi: 'Hỏa Long Hoa',
    category: 'Herb',
    icon: '🌺',
    color: '#f97316',
    rarity: 'Rare',
    desc: 'A fiery bloom flourishing on scorched basalt fields. Brews destructive fire elixirs.'
  },
  mat_starflower: {
    id: 'mat_starflower',
    name: 'Astral Starflower',
    nameVi: 'Tinh Tú Chi Hoa',
    category: 'Herb',
    icon: '✨',
    color: '#ffd700',
    rarity: 'Mythic',
    desc: 'Cosmic flora that blossoms only under pure celestial astral light.'
  },
  mat_divine_elixir: {
    id: 'mat_divine_elixir',
    name: 'Divine Catalyst Dew',
    nameVi: 'Giọt Nước Thánh Linh',
    category: 'Solvent',
    icon: '💧',
    color: '#ffd700',
    rarity: 'Mythic',
    desc: 'Concentrated essence of life and ascension.'
  },

  // F. Elemental & Genesis Shards
  mat_fire_core: {
    id: 'mat_fire_core',
    name: 'Molten Core',
    nameVi: 'Lõi Lửa Núi Lửa',
    category: 'Elemental',
    icon: '🔥',
    color: '#ff7849',
    rarity: 'Rare',
    desc: 'Pulsing core of living flame. Infuses weapons and potions with fire fury.'
  },
  mat_frost_core: {
    id: 'mat_frost_core',
    name: 'Glacial Core',
    nameVi: 'Lõi Băng Vĩnh Cửu',
    category: 'Elemental',
    icon: '❄️',
    color: '#00f2fe',
    rarity: 'Rare',
    desc: 'Sub-zero crystal that emanates perpetual permafrost.'
  },
  mat_shard_genesis: {
    id: 'mat_shard_genesis',
    name: 'Genesis Shard',
    nameVi: 'Mảnh Vỡ Khởi Nguyên',
    category: 'Genesis',
    icon: '✨',
    color: '#ffd700',
    rarity: 'Mythic',
    desc: 'Concentrated shard of the Primordial Core. Used to forge God-tier relics.'
  }
};

// ==========================================
// 1. SMELTING KILN RECIPES (Lò Nung & Luyện Kim)
// ==========================================
export const SMELTING_RECIPES = [
  {
    id: 'smelt_glass_vial',
    name: 'Empty Glass Vial',
    nameVi: 'Bình Thủy Tinh Rỗng',
    outputMatId: 'item_empty_vial',
    outputCount: 1,
    level: 1,
    icon: '🧪',
    desc: 'Nung 3 Cát Thạch Anh thành Vỏ Bình Thủy Tinh chứa dược phẩm.',
    costs: { mat_silica_sand: 3 }
  },
  {
    id: 'smelt_crystal_flask',
    name: 'Reinforced Crystal Flask',
    nameVi: 'Bình Thạch Anh Cường Hóa',
    outputMatId: 'item_crystal_flask',
    outputCount: 1,
    level: 25,
    icon: '⚗️',
    desc: 'Gia cố bình thủy tinh với 2 Tinh Thể Aether để chứa thần dược cấp cao.',
    costs: { item_empty_vial: 1, mat_aether_crystal: 2 }
  },
  {
    id: 'smelt_iron_ingot',
    name: 'Iron Ingot',
    nameVi: 'Thỏi Sắt Tinh Luyện',
    outputMatId: 'mat_iron_ingot',
    outputCount: 1,
    level: 1,
    icon: '🧱',
    desc: 'Nung 2 Quặng Sắt thô thành 1 Thỏi Sắt rèn vũ khí và giáp trụ.',
    costs: { mat_iron_ore: 2 }
  },
  {
    id: 'smelt_mithril_ingot',
    name: 'Mithril Ingot',
    nameVi: 'Thỏi Mithril Băng Ngân',
    outputMatId: 'mat_mithril_ingot',
    outputCount: 1,
    level: 15,
    icon: '💎',
    desc: 'Nung 2 Quặng Mithril thành Thỏi Mithril ma pháp nhẹ và bền.',
    costs: { mat_mithril_chunk: 2 }
  },
  {
    id: 'smelt_tanned_leather',
    name: 'Tanned Leather',
    nameVi: 'Da Thuộc Bền Bỉ',
    outputMatId: 'mat_tanned_leather',
    outputCount: 1,
    level: 1,
    icon: '📜',
    desc: 'Thuộc 2 Da Thú tươi thành Da Thuộc dẻo dai chịu lực.',
    costs: { mat_beast_leather: 2 }
  }
];

// ==========================================
// 2. ALCHEMY LAB RECIPES (Bàn Giả Kim Chế Thuốc)
// ==========================================
export const ALCHEMY_RECIPES = [
  {
    id: 'alch_life_lesser',
    name: 'Lesser Life Flask',
    nameVi: 'Bình Hồi Máu Cơ Bản (T1)',
    outputFlaskId: 'flask_life_divine', // creates life flask
    flaskType: 'Life',
    level: 1,
    icon: '🧪',
    color: '#ff4d4f',
    desc: 'Chiết xuất từ Huyết Thảo + Nước Suối trong Vỏ Bình Thủy Tinh.',
    baseStats: 'Hồi 500 Máu trong 4.0s (60 Max Charges, 20/lần)',
    costs: { item_empty_vial: 1, mat_aether_water: 1, mat_blood_herb: 3 }
  },
  {
    id: 'alch_mana_lesser',
    name: 'Lesser Mana Flask',
    nameVi: 'Bình Hồi Năng Lượng Cơ Bản (T1)',
    outputFlaskId: 'flask_mana_arcane',
    flaskType: 'Mana',
    level: 1,
    icon: '💧',
    color: '#00f2fe',
    desc: 'Chưng cất từ Hoa Ma Lực + Nước Suối trong Vỏ Bình Thủy Tinh.',
    baseStats: 'Hồi 300 Mana & 180 ES trong 4.0s (60 Max Charges, 20/lần)',
    costs: { item_empty_vial: 1, mat_aether_water: 1, mat_mana_bloom: 3 }
  },
  {
    id: 'alch_quicksilver',
    name: 'Quicksilver Speed Flask',
    nameVi: 'Bình Phong Tốc Quicksilver (T2)',
    outputFlaskId: 'flask_quicksilver',
    flaskType: 'Quicksilver',
    level: 15,
    icon: '⚡',
    color: '#52c41a',
    desc: 'Dược dịch tinh phong tăng tốc độ di chuyển và tấn công.',
    baseStats: '+45% Tốc độ chạy & +25% Tốc độ đánh trong 5.0s',
    costs: { item_empty_vial: 1, mat_aether_water: 2, mat_wind_leaf: 5 }
  },
  {
    id: 'alch_granite',
    name: 'Granite Fortitude Flask',
    nameVi: 'Bình Hộ Thể Granite (T2)',
    outputFlaskId: 'flask_granite',
    flaskType: 'Granite',
    level: 20,
    icon: '🛡️',
    color: '#ffd700',
    desc: 'Dịch khoáng thạch tăng lượng lớn giáp và kháng nguyên tố.',
    baseStats: '+1200 Giáp & +25% Kháng Toàn Phần trong 5.0s',
    costs: { item_empty_vial: 1, mat_iron_ingot: 2, mat_tanned_leather: 2 }
  },
  {
    id: 'alch_life_divine',
    name: 'Divine Life Flask of Staunching',
    nameVi: 'Thần Dược Hồi Máu Thần Thánh (T3)',
    outputFlaskId: 'flask_life_divine',
    flaskType: 'Life',
    level: 40,
    icon: '🧪',
    color: '#ff4d4f',
    desc: 'Thần dược hồi phục tối thượng đóng trong Bình Thạch Anh Cường Hóa.',
    baseStats: 'Hồi 1200 Máu + Xóa Chảy Máu trong 4.0s',
    costs: { item_crystal_flask: 1, mat_aether_water: 3, mat_blood_herb: 8, mat_frost_core: 1 }
  },
  {
    id: 'alch_mana_arcane',
    name: 'Arcane Mana Flask of Warding',
    nameVi: 'Thần Dược Năng Lượng Thần Thánh (T3)',
    outputFlaskId: 'flask_mana_arcane',
    flaskType: 'Mana',
    level: 40,
    icon: '💧',
    color: '#00f2fe',
    desc: 'Thần dược năng lượng tối thượng đóng trong Bình Thạch Anh Cường Hóa.',
    baseStats: 'Hồi 800 Mana & 450 ES + Miễn Nhiễm Nguyền Rủa',
    costs: { item_crystal_flask: 1, mat_aether_water: 3, mat_mana_bloom: 8, mat_aether_crystal: 1 }
  }
];

// ==========================================
// 3. BASE FORGING RECIPES (Bàn Rèn Vũ Khí & Giáp Trụ)
// ==========================================
export const FORGING_RECIPES = [
  {
    id: 'forge_iron_sword',
    name: 'Iron Longsword',
    nameVi: 'Trường Kiếm Sắt Tinh Luyện',
    baseType: 'sword_1h',
    slot: 'MainHand',
    level: 1,
    icon: '🗡️',
    desc: 'Thanh kiếm sắt bền bỉ rèn từ Thỏi Sắt, Da Thuộc và Cán Gỗ Lõi.',
    baseStats: '+18 Physical Damage, 1.25 Atk Spd',
    costs: { mat_iron_ingot: 4, mat_tanned_leather: 2, mat_heartwood: 1 },
    isDefaultUnlocked: true,
    dropSource: null
  },
  {
    id: 'forge_iron_armor',
    name: 'Reinforced Iron Cuirass',
    nameVi: 'Giáp Sắt Rèn Gia Cố',
    baseType: 'body_armor',
    slot: 'BodyArmor',
    level: 1,
    icon: '🛡️',
    desc: 'Áo giáp sắt liên kết với lớp da thuộc dẻo dai bên trong.',
    baseStats: '+65 Armor, +40 Max Life',
    costs: { mat_iron_ingot: 6, mat_tanned_leather: 4 },
    isDefaultUnlocked: true,
    dropSource: null
  },
  {
    id: 'forge_aether_ring',
    name: 'Aetherium Band of Resilience',
    nameVi: 'Nhẫn Aether Kháng Ma Pháp',
    baseType: 'ring',
    slot: 'Ring',
    level: 20,
    icon: '💍',
    desc: 'Nhẫn đúc từ Thỏi Mithril nạm Tinh Thể Aether tỏa sáng.',
    baseStats: '+35 Max Mana, +18% Elemental Res',
    costs: { mat_mithril_ingot: 4, mat_aether_crystal: 4 },
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
    nameVi: 'Ma Kiếm Mithril Băng Tuyết',
    baseType: 'sword_1h',
    slot: 'MainHand',
    level: 25,
    icon: '⚔️',
    desc: 'Thanh kiếm mithril sắc bén gắn tinh thể ma pháp và cán gỗ cổ thụ.',
    baseStats: '+42 Physical Damage, +20 Elemental Dmg',
    costs: { mat_mithril_ingot: 6, mat_aether_crystal: 2, mat_heartwood: 1 },
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
    nameVi: 'Giáp Xích Mithril Hộ Thể',
    baseType: 'body_armor',
    slot: 'BodyArmor',
    level: 25,
    icon: '🛡️',
    desc: 'Giáp xích dệt từ thỏi mithril và lót da thuộc dẻo dai.',
    baseStats: '+140 Armor, +60 Energy Shield',
    costs: { mat_mithril_ingot: 8, mat_tanned_leather: 4 },
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
    nameVi: 'Dây Chuyền Tinh Cầu Lăng Kính',
    baseType: 'amulet',
    slot: 'Amulet',
    level: 40,
    icon: '📿',
    desc: 'Dây chuyền vàng rực rỡ nạm Tinh Thể và Mảnh Vỡ Khởi Nguyên.',
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
    nameVi: 'Đại Kiếm Khổng Lồ Adamantite',
    baseType: 'sword_2h',
    slot: 'MainHand',
    level: 50,
    icon: '🗡️',
    desc: 'Đại kiếm hai tay uy lực rèn từ thỏi kim loại núi lửa và gỗ cổ thụ.',
    baseStats: '+115 Physical Damage, +25% Crit Multi',
    costs: { mat_adamantite_ingot: 10, mat_aether_crystal: 4, mat_heartwood: 2 },
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
    nameVi: 'Chiến Giáp Titan Adamantite',
    baseType: 'body_armor',
    slot: 'BodyArmor',
    level: 50,
    icon: '🛡️',
    desc: 'Chiến giáp tối thượng của các chiến binh tiên phong.',
    baseStats: '+320 Armor, +120 Max Life, +15% All Res',
    costs: { mat_adamantite_ingot: 12, mat_aether_crystal: 4, mat_tanned_leather: 4 },
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

/**
 * Material-Accurate Salvaging logic based on equipment item type and components
 */
export function previewSalvageItem(item) {
  if (!item) return [];
  const rarity = (item.rarity || 'Normal').toLowerCase();
  const slot = (item.slot || '').toLowerCase();
  const name = (item.name || '').toLowerCase();
  const results = [];

  const isWeapon = slot === 'mainhand' || item.category === 'weapon';
  const isArmor = slot === 'bodyarmor' || slot === 'helm' || slot === 'boots' || item.category === 'armor';
  const isJewelry = slot === 'ring' || slot === 'amulet' || item.category === 'accessory';

  if (rarity === 'unique') {
    if (isWeapon) {
      results.push({ id: 'mat_adamantite_ingot', count: 8 });
      results.push({ id: 'mat_heartwood', count: 2 });
      results.push({ id: 'mat_shard_genesis', count: 2 });
    } else if (isArmor) {
      results.push({ id: 'mat_adamantite_ingot', count: 10 });
      results.push({ id: 'mat_tanned_leather', count: 4 });
      results.push({ id: 'mat_shard_genesis', count: 2 });
    } else {
      results.push({ id: 'mat_shard_genesis', count: 3 });
      results.push({ id: 'mat_aether_crystal', count: 6 });
    }
  } else if (rarity === 'rare') {
    if (isWeapon) {
      results.push({ id: 'mat_mithril_ingot', count: 4 });
      results.push({ id: 'mat_heartwood', count: 1 });
      results.push({ id: 'mat_aether_crystal', count: 2 });
    } else if (isArmor) {
      results.push({ id: 'mat_mithril_ingot', count: 5 });
      results.push({ id: 'mat_tanned_leather', count: 3 });
    } else {
      results.push({ id: 'mat_aether_crystal', count: 4 });
      results.push({ id: 'mat_mithril_ingot', count: 2 });
    }
  } else if (rarity === 'magic') {
    if (isWeapon) {
      results.push({ id: 'mat_iron_ingot', count: 3 });
      results.push({ id: 'mat_heartwood', count: 1 });
    } else if (isArmor) {
      results.push({ id: 'mat_iron_ingot', count: 4 });
      results.push({ id: 'mat_tanned_leather', count: 2 });
    } else {
      results.push({ id: 'mat_aether_crystal', count: 2 });
    }
  } else {
    // Normal / Base
    if (isWeapon) {
      results.push({ id: 'mat_iron_ingot', count: 2 });
    } else if (isArmor) {
      results.push({ id: 'mat_iron_ingot', count: 2 });
      results.push({ id: 'mat_tanned_leather', count: 1 });
    } else {
      results.push({ id: 'mat_silica_sand', count: 2 });
    }
  }

  return results;
}

export const MATERIAL_INSIGHT_TIERS = [
  { tier: 1, exp: 0, title: { vi: 'Tập Sự (Novice)', en: 'Novice (Tier 1)' }, bonus: { vi: 'Mở khóa nguồn gốc & công thức', en: 'Unlocked drop sources & recipes' } },
  { tier: 2, exp: 15, title: { vi: 'Tinh Thông (Adept)', en: 'Adept (Tier 2)' }, bonus: { vi: '+10% Cơ hội nhận thêm sản phẩm phụ', en: '+10% Extra harvest bonus chance' } },
  { tier: 3, exp: 50, title: { vi: 'Chuyên Gia (Expert)', en: 'Expert (Tier 3)' }, bonus: { vi: '+15% Sản lượng khai thác tự nhiên', en: '+15% Gathering node yield' } },
  { tier: 4, exp: 120, title: { vi: 'Bậc Thầy (Master)', en: 'Master (Tier 4)' }, bonus: { vi: '-10% Hao phí khi rèn đúc tại Forge', en: '-10% Forge crafting costs' } },
  { tier: 5, exp: 300, title: { vi: 'Thánh Truyền (Grandmaster)', en: 'Grandmaster (Tier 5)' }, bonus: { vi: '+5% Tỷ lệ đúc trang bị Rare/Unique', en: '+5% High-tier affix roll chance' } }
];

export function getMaterialInsightProfile(matId, exp = 0) {
  let cur = MATERIAL_INSIGHT_TIERS[0];
  let next = MATERIAL_INSIGHT_TIERS[1];

  for (let i = MATERIAL_INSIGHT_TIERS.length - 1; i >= 0; i--) {
    if (exp >= MATERIAL_INSIGHT_TIERS[i].exp) {
      cur = MATERIAL_INSIGHT_TIERS[i];
      next = MATERIAL_INSIGHT_TIERS[i + 1] || null;
      break;
    }
  }

  const currentTierExp = cur.exp;
  const nextTierExp = next ? next.exp : cur.exp;
  const progressPct = next ? Math.min(100, Math.round(((exp - currentTierExp) / (nextTierExp - currentTierExp)) * 100)) : 100;

  return {
    tier: cur.tier,
    title: cur.title,
    bonus: cur.bonus,
    exp: exp,
    nextExp: next ? next.exp : null,
    progressPct: progressPct
  };
}

export function recordMaterialInsight(player, matId, gain = 1) {
  if (!player) return;
  if (!player.materialMastery) player.materialMastery = {};
  const oldExp = player.materialMastery[matId] || 0;
  const oldTier = getMaterialInsightProfile(matId, oldExp).tier;

  player.materialMastery[matId] = oldExp + gain;
  const newProfile = getMaterialInsightProfile(matId, player.materialMastery[matId]);

  if (newProfile.tier > oldTier && window.spawnDamageNumber) {
    const matInfo = getMaterialInfo(matId);
    window.spawnDamageNumber(player.x, player.y - 75, `💎 MATERIAL MASTERY UP: [${matInfo.nameVi || matInfo.name}] -> TIER ${newProfile.tier}!`, true, '#ffd700');
  }
}

