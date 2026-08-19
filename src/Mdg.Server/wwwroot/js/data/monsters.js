/**
 * Monster Master Data Dictionary for Bestiary Codex & Lore Mastery
 */

export const MONSTERS = {
  // === ACT 1: Sylvan Frontier ===
  goblin_scout: {
    id: 'goblin_scout',
    name: 'Goblin Scout',
    icon: '👺',
    act: 1,
    biome: 'Plains',
    isBoss: false,
    baseHp: 60,
    element: 'Physical',
    weakness: 'Fire',
    desc: 'Nimble green raiders who ambush travelers in Whispering Plains using poisoned darts.',
    drops: 'Normal/Magic Equipment, Gold, Aether Spark'
  },
  direwolf: {
    id: 'direwolf',
    name: 'Feral Direwolf',
    icon: '🐺',
    act: 1,
    biome: 'Plains',
    isBoss: false,
    baseHp: 110,
    element: 'Physical',
    weakness: 'Cold',
    desc: 'Fierce apex predators hunting in packs. Their savage bites induce heavy bleeding.',
    drops: 'Wolf Pelts, Rare Boots, Genesis Prism'
  },
  skeleton_warrior: {
    id: 'skeleton_warrior',
    name: 'Skeleton Warrior',
    icon: '💀',
    act: 1,
    biome: 'Dungeon',
    isBoss: false,
    baseHp: 140,
    element: 'Chaos',
    weakness: 'Lightning',
    desc: 'Ancient resurrected crypt sentinels clad in rusted iron armor and wielding bone blades.',
    drops: 'Bone Greatsword, Armor Scraps, Fracture Core'
  },
  malakor: {
    id: 'malakor',
    name: 'Malakor the Shadow Fiend',
    icon: '🔥',
    act: 1,
    biome: 'Dungeon',
    isBoss: true,
    baseHp: 1800,
    element: 'Fire / Chaos',
    weakness: 'Cold / Holy',
    desc: 'The ancient lord of the Forgotten Crypt. Commands soul flames and shadow shockwaves.',
    drops: 'Ascendant Catalyst, Set Cuirass, Unique Fiend Blade'
  },

  // === ACT 2: Frozen Spires ===
  frost_elemental: {
    id: 'frost_elemental',
    name: 'Frost Elemental',
    icon: '❄️',
    act: 2,
    biome: 'Tundra',
    isBoss: false,
    baseHp: 240,
    element: 'Cold',
    weakness: 'Fire',
    desc: 'Living crystal spirits of absolute zero who shatter upon death into ice fragments.',
    drops: 'Glacial Shards, Cold Resistance Rings, Sockets'
  },
  yeti: {
    id: 'yeti',
    name: 'Yeti Frost Goliath',
    icon: '🦣',
    act: 2,
    biome: 'Tundra',
    isBoss: false,
    baseHp: 480,
    element: 'Cold / Physical',
    weakness: 'Fire',
    desc: 'Colossal mountain beasts capable of ground-slam tremors that stun nearby prey.',
    drops: 'Goliath Plate, Harmonic Tether, Rare Rings'
  },
  vael_frost: {
    id: 'vael_frost',
    name: 'Cryomancer Vael the Frost Sovereign',
    icon: '👑',
    act: 2,
    biome: 'Tundra',
    isBoss: true,
    baseHp: 4200,
    element: 'Cold',
    weakness: 'Fire / Lightning',
    desc: 'Ruler of the Permafrost Peaks who casts absolute zero blizzards and glacial vortexes.',
    drops: 'Frozen Core, Unique Frost Robe, Origin Matrix'
  },

  // === ACT 3: Infernal Caldera ===
  fire_imp: {
    id: 'fire_imp',
    name: 'Infernal Fire Imp',
    icon: '👿',
    act: 3,
    biome: 'Volcanic',
    isBoss: false,
    baseHp: 380,
    element: 'Fire',
    weakness: 'Cold',
    desc: 'Agile demonic imps that hurl explosive magma orbs and leave scorched earth.',
    drops: 'Cinder Shards, Genesis Prism, Rare Wand'
  },
  magma_hound: {
    id: 'magma_hound',
    name: 'Magma Hound',
    icon: '🐕‍🦺',
    act: 3,
    biome: 'Volcanic',
    isBoss: false,
    baseHp: 650,
    element: 'Fire / Physical',
    weakness: 'Cold',
    desc: 'Hounds forged of living molten rock. Their fiery breath melts steel armor.',
    drops: 'Molten Core, Fracture Core, Flame Ward Belt'
  },
  ignis_archon: {
    id: 'ignis_archon',
    name: 'Ignis the Undying Archon',
    icon: '🌋',
    act: 3,
    biome: 'Volcanic',
    isBoss: true,
    baseHp: 8500,
    element: 'Fire',
    weakness: 'Cold / Chaos',
    desc: 'Primordial titan slumbering in Mount Caelum. Commands cataclysmic volcano eruptions.',
    drops: 'Cinderforged Cuirass, Ascendant Catalyst, Unique Axe'
  },

  // === ACT 4: Sunken Necropolis ===
  mummy_warrior: {
    id: 'mummy_warrior',
    name: 'Mummy Pharaoh Guard',
    icon: '🧟',
    act: 4,
    biome: 'Dungeon',
    isBoss: false,
    baseHp: 880,
    element: 'Chaos / Physical',
    weakness: 'Fire / Holy',
    desc: 'Embalmed royal defenders preserved in ancient crypts, inflicting decay miasma on contact.',
    drops: 'Ancient Linen, Rare Amulet, Ascendant Catalyst'
  },
  morvath_lich: {
    id: 'morvath_lich',
    name: 'High Inquisitor Morvath',
    icon: '💀',
    act: 4,
    biome: 'Dungeon',
    isBoss: true,
    baseHp: 16000,
    element: 'Chaos / Cold',
    weakness: 'Fire / Holy',
    desc: 'Master of the Necropolis who reaps mortal souls and summons legions of wraiths.',
    drops: 'Soul Reaver Scythe, Set Armor, Origin Matrix'
  },

  // === ACT 5: Celestial Void ===
  void_walker: {
    id: 'void_walker',
    name: 'Void Stalker Aberration',
    icon: '👾',
    act: 5,
    biome: 'Void',
    isBoss: false,
    baseHp: 1400,
    element: 'Chaos / Void',
    weakness: 'All Elemental',
    desc: 'Cosmic fiends that phase through reality and distort gravitational pull.',
    drops: 'Void Shards, Divine Orb, Endgame Tier Maps'
  },
  void_sovereign: {
    id: 'void_sovereign',
    name: 'The Void Sovereign Prime',
    icon: '👑',
    act: 5,
    biome: 'Void',
    isBoss: true,
    baseHp: 38000,
    element: 'Void / Chaos / All Elemental',
    weakness: 'None',
    desc: 'The ultimate primordial progenitor of the cosmos. Commands reality-tearing oblivion beams.',
    drops: 'Sovereign Crown, Origin Matrix x3, Pinnacle Map Device Keys'
  }
};
