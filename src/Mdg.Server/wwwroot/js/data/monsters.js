/**
 * MDG: Aethelis - Monster Master Data Dictionary
 * 100% English In-Game Data
 * Includes 5 Monster Families with 3-Branch Talent Trees & Scaled Difficulties
 */

export const MONSTER_FAMILIES = {
  Beast: {
    id: 'Beast',
    name: 'Ancient Beasts',
    icon: '🐺',
    color: '#ff9800',
    desc: 'Savage wildlife mutated by Genesis Aether. Rapid movement and lethal physical lacerations.',
    root: {
      id: 'beast_root',
      name: 'Hunter Instincts',
      desc: '+10% Physical Damage vs Beasts',
      icon: '🎯'
    },
    branches: [
      {
        id: 'harvest',
        title: '🌿 Harvest & Spoils',
        color: '#ffb74d',
        nodes: [
          { id: 'beast_a1', name: 'Trophy Skimmer', desc: '+30% Raw Materials & Catalysts from Beasts', icon: '🎒', parentId: 'beast_root' },
          { id: 'beast_a2', name: 'Alpha Relic Siphon', desc: '+40% Signature Fang Drop Rarity from Alpha Beasts', icon: '💎', parentId: 'beast_a1' },
          { id: 'beast_a_keystone', name: '★ Primal Harvest', desc: 'Beast Bosses drop double loot rolls on defeat', icon: '👑', isKeystone: true, parentId: 'beast_a2' }
        ]
      },
      {
        id: 'combat',
        title: '⚔️ Combat & Lethality',
        color: '#ff5722',
        nodes: [
          { id: 'beast_b1', name: 'Flesh Piercer', desc: '+15% Crit Chance & +30% Crit Multiplier vs Beasts', icon: '🗡️', parentId: 'beast_root' },
          { id: 'beast_b2', name: 'Blood Frenzy', desc: 'Slaying Beasts grants +25% Attack & Move Speed for 5s', icon: '⚡', parentId: 'beast_b1' },
          { id: 'beast_b_keystone', name: '★ Apex Predator', desc: 'Critical Strikes on Beasts instantly execute targets below 20% Life', icon: '🩸', isKeystone: true, parentId: 'beast_b2' }
        ]
      },
      {
        id: 'survival',
        title: '🛡️ Survival & Wards',
        color: '#81c784',
        nodes: [
          { id: 'beast_c1', name: 'Thickened Hide', desc: '-20% Damage taken from all Beast attacks', icon: '🛡️', parentId: 'beast_root' },
          { id: 'beast_c2', name: 'Coagulation Ward', desc: '100% Immunity to Bleeding and Savage Lacerations', icon: '🧪', parentId: 'beast_c1' },
          { id: 'beast_c_keystone', name: '★ Untamed Fortitude', desc: 'Taking a heavy hit from Beasts grants a 300 HP Primal Barrier for 4s', icon: '🏰', isKeystone: true, parentId: 'beast_c1' }
        ]
      }
    ]
  },

  Undead: {
    id: 'Undead',
    name: 'Crypt Undead',
    icon: '💀',
    color: '#00f2fe',
    desc: 'Resurrected sentinels of forgotten dynasties. Clad in rusted iron and lingering soul chill.',
    root: {
      id: 'undead_root',
      name: 'Consecrated Striking',
      desc: '+10% Holy and Fire Damage vs Undead',
      icon: '✨'
    },
    branches: [
      {
        id: 'harvest',
        title: '🌿 Harvest & Spoils',
        color: '#4dd0e1',
        nodes: [
          { id: 'undead_a1', name: 'Crypt Scavenger', desc: '+35% Gem & Socketing Core Drops from Undead', icon: '🔮', parentId: 'undead_root' },
          { id: 'undead_a2', name: 'Soul Gem Extractor', desc: '+40% Rare & Unique Gear Drop Rarity from Undead', icon: '💎', parentId: 'undead_a1' },
          { id: 'undead_a_keystone', name: '★ Tomb Raider', desc: 'Undead Elites have a 50% chance to drop bonus Crafting Catalysts', icon: '👑', isKeystone: true, parentId: 'undead_a2' }
        ]
      },
      {
        id: 'combat',
        title: '⚔️ Combat & Lethality',
        color: '#00bcd4',
        nodes: [
          { id: 'undead_b1', name: 'Bone Breaker', desc: '+20% Pure Physical & Fire Penetration vs Undead', icon: '🔨', parentId: 'undead_root' },
          { id: 'undead_b2', name: 'Soul Shatter', desc: 'Slain Undead explode dealing 40% of their Max HP as Holy AoE', icon: '💥', parentId: 'undead_b1' },
          { id: 'undead_b_keystone', name: '★ Inquisitor’s Wrath', desc: 'Gain +50% Critical Multiplier and +20% Attack Speed in crypts', icon: '🔥', isKeystone: true, parentId: 'undead_b2' }
        ]
      },
      {
        id: 'survival',
        title: '🛡️ Survival & Wards',
        color: '#80deea',
        nodes: [
          { id: 'undead_c1', name: 'Soulward Cloak', desc: '-20% Chaos & Physical Damage taken from Undead', icon: '🛡️', parentId: 'undead_root' },
          { id: 'undead_c2', name: 'Miasma Cleanser', desc: '100% Immunity to Poison and Soul Chill ailments', icon: '🧪', parentId: 'undead_c1' },
          { id: 'undead_c_keystone', name: '★ Undying Aegis', desc: 'Fatal blows from Undead leave you at 1 HP with 3s Divine Invulnerability', icon: '✨', isKeystone: true, parentId: 'undead_c1' }
        ]
      }
    ]
  },

  Fiend: {
    id: 'Fiend',
    name: 'Nether Fiends',
    icon: '🔥',
    color: '#e06c75',
    desc: 'Demonic horrors spawned from abyssal rifts. Command hellfire eruptions and void siphons.',
    root: {
      id: 'fiend_root',
      name: 'Demonbane Knowledge',
      desc: '+10% Chaos & Elemental Damage vs Fiends',
      icon: '📖'
    },
    branches: [
      {
        id: 'harvest',
        title: '🌿 Harvest & Spoils',
        color: '#ef5350',
        nodes: [
          { id: 'fiend_a1', name: 'Hellstone Harvester', desc: '+40% Fracture Core & Ascendant Catalyst Drops from Fiends', icon: '🔮', parentId: 'fiend_root' },
          { id: 'fiend_a2', name: 'Abyssal Siphon', desc: '+50% Signature Artifact Drop Chance from Fiend Elites', icon: '💎', parentId: 'fiend_a1' },
          { id: 'fiend_a_keystone', name: '★ Infernal Wealth', desc: 'Fiend Bosses drop guaranteed 2 Genesis Catalysts upon defeat', icon: '👑', isKeystone: true, parentId: 'fiend_a2' }
        ]
      },
      {
        id: 'combat',
        title: '⚔️ Combat & Lethality',
        color: '#d32f2f',
        nodes: [
          { id: 'fiend_b1', name: 'Hellbreaker Cleave', desc: '+25% Chaos Damage & +15% Crit Chance vs Fiends', icon: '🗡️', parentId: 'fiend_root' },
          { id: 'fiend_b2', name: 'Demon Purge', desc: 'Striking Fiends siphons 4% Mana & 5% Energy Shield per hit', icon: '🩸', parentId: 'fiend_b1' },
          { id: 'fiend_b_keystone', name: '★ Doom Slayer', desc: 'Inflict 50% More Damage against Fiend Bosses and Dreadlords', icon: '🔥', isKeystone: true, parentId: 'fiend_b2' }
        ]
      },
      {
        id: 'survival',
        title: '🛡️ Survival & Wards',
        color: '#ff8a80',
        nodes: [
          { id: 'fiend_c1', name: 'Obsidian Shell', desc: '-20% Fire & Chaos Damage taken from Fiends', icon: '🛡️', parentId: 'fiend_root' },
          { id: 'fiend_c2', name: 'Flameproof Aegis', desc: '100% Immunity to Ignite and Scorched Ground hazards', icon: '🧊', parentId: 'fiend_c1' },
          { id: 'fiend_c_keystone', name: '★ Abyssal Resilience', desc: 'Gain +15% to Maximum Fire & Chaos Resistances (Cap 85%)', icon: '🏰', isKeystone: true, parentId: 'fiend_c1' }
        ]
      }
    ]
  },

  Elemental: {
    id: 'Elemental',
    name: 'Primal Elementals',
    icon: '⚡',
    color: '#ffd700',
    desc: 'Spirits of pure lightning, ice, and fire that discharge deadly AoE shockwaves.',
    root: {
      id: 'elem_root',
      name: 'Arcane Attunement',
      desc: '+10% Elemental Damage vs Elementals',
      icon: '🔮'
    },
    branches: [
      {
        id: 'harvest',
        title: '🌿 Harvest & Spoils',
        color: '#ffe082',
        nodes: [
          { id: 'elem_a1', name: 'Aether Condenser', desc: '+40% Skill Gem & Resonance Orb Drops from Elementals', icon: '🔮', parentId: 'elem_root' },
          { id: 'elem_a2', name: 'Prismatic Harvest', desc: '+45% Rare Ring & Amulet Drop Rate from Elementals', icon: '💎', parentId: 'elem_a1' },
          { id: 'elem_a_keystone', name: '★ Elemental Surge', desc: 'Elementals drop double Genesis Catalysts upon defeat', icon: '👑', isKeystone: true, parentId: 'elem_a2' }
        ]
      },
      {
        id: 'combat',
        title: '⚔️ Combat & Lethality',
        color: '#ffc107',
        nodes: [
          { id: 'elem_b1', name: 'Overcharge Surge', desc: '+20% Attack & Cast Speed when in combat with Elementals', icon: '⚡', parentId: 'elem_root' },
          { id: 'elem_b2', name: 'Prismatic Disruption', desc: 'Attacks strip 50% of Elemental Resistances from targets', icon: '🌩️', parentId: 'elem_b1' },
          { id: 'elem_b_keystone', name: '★ Arcane Cataclysm', desc: 'Killing Elementals releases a Chain Lightning storm across the room', icon: '💥', isKeystone: true, parentId: 'elem_b2' }
        ]
      },
      {
        id: 'survival',
        title: '🛡️ Survival & Wards',
        color: '#fff59d',
        nodes: [
          { id: 'elem_c1', name: 'Prismatic Refraction', desc: '-20% Elemental Damage taken from Elementals', icon: '🛡️', parentId: 'elem_root' },
          { id: 'elem_c2', name: 'Tri-Element Ward', desc: '100% Immunity to Freeze, Shock, and Ignite ailments', icon: '🧪', parentId: 'elem_c1' },
          { id: 'elem_c_keystone', name: '★ Elemental Mirror', desc: 'Reflect 35% of all incoming Elemental Damage back to attacker', icon: '🪞', isKeystone: true, parentId: 'elem_c1' }
        ]
      }
    ]
  },

  Construct: {
    id: 'Construct',
    name: 'Ancient Constructs',
    icon: '🗿',
    color: '#c678dd',
    desc: 'Titan guardians made of obsidian and enchanted bronze. High armor and crushing blows.',
    root: {
      id: 'cons_root',
      name: 'Shatter Theory',
      desc: '+10% Armor Penetration vs Constructs',
      icon: '🔨'
    },
    branches: [
      {
        id: 'harvest',
        title: '🌿 Harvest & Spoils',
        color: '#ce93d8',
        nodes: [
          { id: 'cons_a1', name: 'Ore Extractor', desc: '+50% Socketing Cores & Harmonic Tethers from Constructs', icon: '⚒️', parentId: 'cons_root' },
          { id: 'cons_a2', name: 'Titan Core Siphon', desc: '+50% Crafting Base Item Drop Rarity from Golems', icon: '💎', parentId: 'cons_a1' },
          { id: 'cons_a_keystone', name: '★ Foundry Master', desc: 'Constructs drop guaranteed Tier 1 Crafting Bases on death', icon: '👑', isKeystone: true, parentId: 'cons_a2' }
        ]
      },
      {
        id: 'combat',
        title: '⚔️ Combat & Lethality',
        color: '#ba68c8',
        nodes: [
          { id: 'cons_b1', name: 'Crushing Impact', desc: 'Attacks ignore 70% of Construct Armor & Energy Shield', icon: '💥', parentId: 'cons_root' },
          { id: 'cons_b2', name: 'Titan Breaker', desc: 'Stun duration on Constructs is increased by +100%', icon: '⚡', parentId: 'cons_b1' },
          { id: 'cons_b_keystone', name: '★ Core Overload', desc: 'Crits on Constructs detonate their power core for massive AoE damage', icon: '🌋', isKeystone: true, parentId: 'cons_b2' }
        ]
      },
      {
        id: 'survival',
        title: '🛡️ Survival & Wards',
        color: '#e1bee7',
        nodes: [
          { id: 'cons_c1', name: 'Reinforced Plating', desc: '-20% Physical Damage taken from Constructs', icon: '🛡️', parentId: 'cons_root' },
          { id: 'cons_c2', name: 'Titan Bastion', desc: 'Gain +250 Flat Armor & 100% Knockback Immunity against Golems', icon: '🏰', parentId: 'cons_c1' },
          { id: 'cons_c_keystone', name: '★ Iron Will', desc: 'Immune to Stun and Crushing Ground Tremors from Golems', icon: '🗿', isKeystone: true, parentId: 'cons_c1' }
        ]
      }
    ]
  }
};

export const MONSTERS = {
  // === ACT 1: Sylvan Frontier ===
  goblin_scout: {
    id: 'goblin_scout',
    name: 'Goblin Scout',
    icon: '👺',
    family: 'Beast',
    act: 1,
    biome: 'Plains',
    isBoss: false,
    baseHp: 180,
    baseDmg: 28,
    speed: 3.8,
    element: 'Physical',
    weakness: 'Fire',
    skills: 'Poison Dart (DoT), Rapid Ambush Dash',
    desc: 'Nimble green raiders who ambush travelers in Whispering Plains using poisoned darts and pack flanking.',
    drops: 'Normal/Magic Equipment, Gold, Aether Spark',
    signatureDrop: {
      id: 'sig_goblin_pouch',
      name: "Scout's Poisoned Pouch",
      icon: '🎒',
      rarity: 'unique',
      desc: '+25% Movement Speed after Dash & Attacks inflict +40 Poison Damage over 3s'
    }
  },
  direwolf: {
    id: 'direwolf',
    name: 'Feral Direwolf',
    icon: '🐺',
    family: 'Beast',
    act: 1,
    biome: 'Plains',
    isBoss: false,
    baseHp: 320,
    baseDmg: 45,
    speed: 4.2,
    element: 'Physical',
    weakness: 'Cold',
    skills: 'Lacerating Bite, Pack Howl (+30% Speed)',
    desc: 'Fierce apex predators hunting in packs. Their savage bites induce heavy bleeding and armor shred.',
    drops: 'Wolf Pelts, Rare Boots, Genesis Prism',
    signatureDrop: {
      id: 'sig_alpha_fang',
      name: 'Fang of the Alpha Wolf',
      icon: '🐺',
      rarity: 'unique',
      desc: '+35% Critical Strike Multiplier & Bleed damage dealt to enemies is tripled'
    }
  },
  skeleton_warrior: {
    id: 'skeleton_warrior',
    name: 'Skeleton Warrior',
    icon: '💀',
    family: 'Undead',
    act: 1,
    biome: 'Dungeon',
    isBoss: false,
    baseHp: 420,
    baseDmg: 52,
    speed: 3.4,
    element: 'Chaos / Physical',
    weakness: 'Holy / Lightning',
    skills: 'Shield Slam (Stun 1s), Bone Cleave',
    desc: 'Ancient resurrected crypt sentinels clad in rusted iron armor and wielding razor bone greatswords.',
    drops: 'Bone Greatsword, Armor Scraps, Fracture Core',
    signatureDrop: {
      id: 'sig_crypt_shield',
      name: 'Aegis of the Forgotten Crypt',
      icon: '🛡️',
      rarity: 'unique',
      desc: '+25% Block Chance (Cap 75%) & Blocking grants +120 Temporary Energy Shield'
    }
  },
  malakor: {
    id: 'malakor',
    name: 'Malakor the Shadow Fiend',
    icon: '🔥',
    family: 'Fiend',
    act: 1,
    biome: 'Dungeon',
    isBoss: true,
    baseHp: 4800,
    baseDmg: 120,
    speed: 4.5,
    element: 'Fire / Chaos',
    weakness: 'Cold / Holy',
    skills: 'Hellfire Eruption, Shadow Shockwave, Void Teleport',
    desc: 'The ancient dreadlord of the Forgotten Crypt. Commands soul flames, sweeping shadow pillars, and teleports behind heroes.',
    drops: 'Ascendant Catalyst, Set Cuirass, Origin Matrix',
    signatureDrop: {
      id: 'sig_malakor_blade',
      name: 'Malakor’s Dreadfire Cleaver',
      icon: '🗡️',
      rarity: 'unique',
      desc: 'Converts 50% Physical Damage to Chaos & Calls down a blazing Hellfire Pillar on Critical Hit'
    }
  },

  // === ACT 2: Frozen Spires ===
  frost_elemental: {
    id: 'frost_elemental',
    name: 'Frost Elemental',
    icon: '❄️',
    family: 'Elemental',
    act: 2,
    biome: 'Tundra',
    isBoss: false,
    baseHp: 650,
    baseDmg: 75,
    speed: 3.6,
    element: 'Cold',
    weakness: 'Fire',
    skills: 'Glacial Cone (Freeze 2s), Frost Nova Discharge',
    desc: 'Living crystal spirits of absolute zero who shatter upon death into piercing ice shards.',
    drops: 'Glacial Shards, Cold Resistance Rings, Sockets',
    signatureDrop: {
      id: 'sig_glacial_core',
      name: 'Core of Absolute Zero',
      icon: '💎',
      rarity: 'unique',
      desc: '+40% Cold Damage & Shatters frozen enemies into explosive ice shrapnel'
    }
  },
  yeti: {
    id: 'yeti',
    name: 'Yeti Frost Goliath',
    icon: '🦣',
    family: 'Beast',
    act: 2,
    biome: 'Tundra',
    isBoss: false,
    baseHp: 1250,
    baseDmg: 110,
    speed: 3.2,
    element: 'Cold / Physical',
    weakness: 'Fire',
    skills: 'Earthquake Slam (Stun), Ice Avalanche Roar',
    desc: 'Colossal mountain beasts capable of ground-slam tremors that stun all nearby prey.',
    drops: 'Goliath Plate, Harmonic Tether, Rare Rings',
    signatureDrop: {
      id: 'sig_yeti_hide',
      name: 'Yeti Warmaster Hide',
      icon: '🥋',
      rarity: 'unique',
      desc: '+350 Armor & Grants complete immunity to Stun and Freeze effects'
    }
  },
  vael_frost: {
    id: 'vael_frost',
    name: 'Cryomancer Vael the Frost Sovereign',
    icon: '👑',
    family: 'Elemental',
    act: 2,
    biome: 'Tundra',
    isBoss: true,
    baseHp: 9500,
    baseDmg: 180,
    speed: 4.6,
    element: 'Cold / Arcane',
    weakness: 'Fire / Lightning',
    skills: 'Blizzard Vortex, Glacial Prison, Frost Storm Beam',
    desc: 'Ruler of the Permafrost Peaks who casts blizzards, summons ice prisons, and discharges absolute zero beams.',
    drops: 'Frozen Core, Unique Frost Robe, Origin Matrix',
    signatureDrop: {
      id: 'sig_vael_staff',
      name: 'Vael’s Glacial Spire Staff',
      icon: '🪄',
      rarity: 'unique',
      desc: '+3 to All Cold Skill Gems & Frost Nova releases a second expanding vortex ring'
    }
  },

  // === ACT 3: Volcanic Core ===
  magma_golem: {
    id: 'magma_golem',
    name: 'Magma Golem',
    icon: '🗿',
    family: 'Construct',
    act: 3,
    biome: 'Volcano',
    isBoss: false,
    baseHp: 1600,
    baseDmg: 135,
    speed: 3.0,
    element: 'Fire / Physical',
    weakness: 'Cold',
    skills: 'Molten Smash, Scorched Earth Aura',
    desc: 'Forged within subterranean lava cauldrons. Leaves burning trails that incinerate boots.',
    drops: 'Molten Ore, Heavy Armor, Fracture Core',
    signatureDrop: {
      id: 'sig_magma_heart',
      name: 'Heart of the Molten Colossus',
      icon: '❤️‍🔥',
      rarity: 'unique',
      desc: '+20% Maximum Life & Taking Fire damage grants 40% Increased Attack & Cast Speed'
    }
  },
  ignis_dragon: {
    id: 'ignis_dragon',
    name: 'Ignis the Scourge Wyrm',
    icon: '🐉',
    family: 'Fiend',
    act: 3,
    biome: 'Volcano',
    isBoss: true,
    baseHp: 16000,
    baseDmg: 260,
    speed: 5.0,
    element: 'Fire',
    weakness: 'Cold / Lightning',
    skills: 'Infernal Breath, Fireball Barrage, Cataclysm Flight',
    desc: 'Ancient draconic calamity. Soars across the battlefield raining meteors and scorching the entire arena.',
    drops: 'Dragon Core, Ascendant Catalyst, Unique Dragon Scale Plate',
    signatureDrop: {
      id: 'sig_dragon_crown',
      name: 'Crown of the Scourge Wyrm',
      icon: '👑',
      rarity: 'unique',
      desc: 'Fireball transforms into Draconic Flame (Fires 3 piercing fire dragons with 100% Ignite chance)'
    }
  },

  // === ACT 4: Sunken Depths ===
  abyssal_stalker: {
    id: 'abyssal_stalker',
    name: 'Abyssal Void Stalker',
    icon: '🐙',
    family: 'Fiend',
    act: 4,
    biome: 'Abyss',
    isBoss: false,
    baseHp: 2200,
    baseDmg: 170,
    speed: 4.8,
    element: 'Chaos',
    weakness: 'Lightning / Fire',
    skills: 'Shadow Blink, Chaos Siphon, Miasma Cloud',
    desc: 'Eldritch predators from beneath the oceanic depths. Siphons player energy shield on contact.',
    drops: 'Abyssal Pearls, Chaos Amulets, Genesis Prism',
    signatureDrop: {
      id: 'sig_abyssal_eye',
      name: 'Eye of the Deep Trench',
      icon: '👁️',
      rarity: 'unique',
      desc: '+30% Chaos Damage & Crits inflict Void Siphon, restoring 10% Energy Shield'
    }
  },
  leviathan: {
    id: 'leviathan',
    name: 'Tenebris the Leviathan Sovereign',
    icon: '🦑',
    family: 'Fiend',
    act: 4,
    biome: 'Abyss',
    isBoss: true,
    baseHp: 28000,
    baseDmg: 340,
    speed: 4.5,
    element: 'Chaos / Cold',
    weakness: 'Lightning',
    skills: 'Abyssal Whirlpool, Tentacle Slam, Void Blackout',
    desc: 'Titan of the sunless trenches. Commands crushing tidal whirlpools and dark miasma surges.',
    drops: 'Tenebris Heart, Unique Abyssal Trident, Origin Matrix',
    signatureDrop: {
      id: 'sig_leviathan_trident',
      name: 'Tenebris Abyssal Trident',
      icon: '🔱',
      rarity: 'unique',
      desc: 'All attacks discharge expanding tidal waves that pull enemies inward and deal 250 Chaos Damage'
    }
  },

  // === ACTS 5-9 & EXPANSION MONSTERS ===
  void_spectre: {
    id: 'void_spectre',
    name: 'Abyssal Shadow Spectre',
    icon: '👻',
    family: 'Fiend',
    act: 5,
    biome: 'Abyss',
    isBoss: false,
    baseHp: 1950,
    baseDmg: 155,
    speed: 4.6,
    element: 'Chaos',
    weakness: 'Holy / Fire',
    skills: 'Soul Drain, Phantom Shift',
    desc: 'Incorporeal shade born from cosmic fractures. Phantasms phase through defenses.',
    drops: 'Spectral Residue, Chaos Rings, Genesis Prism'
  },
  chaos_eye: {
    id: 'chaos_eye',
    name: 'Void Eye of Chaos',
    icon: '👁️',
    family: 'Fiend',
    act: 7,
    biome: 'Void',
    isBoss: false,
    baseHp: 1750,
    baseDmg: 185,
    speed: 3.8,
    element: 'Chaos / Lightning',
    weakness: 'Physical',
    skills: 'Gaze of Madness, Void Rays',
    desc: 'Floating eldritch eye discharging high-voltage chaos laser beams.',
    drops: 'Ocular Focus, Awakened Catalyst, Primordial Essence'
  },
  tentacle_fiend: {
    id: 'tentacle_fiend',
    name: 'Dark Tentacle Fiend',
    icon: '🐙',
    family: 'Fiend',
    act: 7,
    biome: 'Void',
    isBoss: false,
    baseHp: 2600,
    baseDmg: 160,
    speed: 3.2,
    element: 'Chaos',
    weakness: 'Fire',
    skills: 'Tentacle Constrict, Toxic Sludge',
    desc: 'Writhing mass of void appendages dragging prey into the dark.',
    drops: 'Void Tendrils, Heavy Plate, Chaos Core'
  },
  horror_stalker: {
    id: 'horror_stalker',
    name: 'Cosmic Horror Stalker',
    icon: '👹',
    family: 'Fiend',
    act: 9,
    biome: 'Genesis',
    isBoss: false,
    baseHp: 3800,
    baseDmg: 230,
    speed: 5.2,
    element: 'Chaos / Physical',
    weakness: 'Elemental',
    skills: 'Frenzy Pounce, Dread Roar',
    desc: 'Nightmarish apex mutant patrolling the Genesis Core perimeter.',
    drops: 'Apex Horror Claws, Mythic Relics, Origin Matrix'
  },
  storm_drake: {
    id: 'storm_drake',
    name: 'Storm Drake Dragon',
    icon: '🐉',
    family: 'Dragon',
    act: 6,
    biome: 'Mountain',
    isBoss: false,
    baseHp: 3100,
    baseDmg: 195,
    speed: 4.8,
    element: 'Lightning',
    weakness: 'Cold',
    skills: 'Thunder Breath, Storm Swoop',
    desc: 'Winged dragon soaring above Stormpeak Ridge, blasting charged lightning.',
    drops: 'Drake Scale, Storm Core, Thunder Amulet'
  },
  fire_salamander: {
    id: 'fire_salamander',
    name: 'Molten Fire Salamander',
    icon: '🦎',
    family: 'Beast',
    act: 8,
    biome: 'Volcano',
    isBoss: false,
    baseHp: 2400,
    baseDmg: 175,
    speed: 4.4,
    element: 'Fire',
    weakness: 'Cold',
    skills: 'Flame Spit, Lava Trail',
    desc: 'Armored subterranean reptile bathing in boiling caldera magma.',
    drops: 'Salamander Hide, Fire Catalyst, Molten Ore'
  },
  crystal_serpent: {
    id: 'crystal_serpent',
    name: 'Frost Crystal Serpent',
    icon: '🐍',
    family: 'Beast',
    act: 6,
    biome: 'Mountain',
    isBoss: false,
    baseHp: 2850,
    baseDmg: 180,
    speed: 4.2,
    element: 'Cold',
    weakness: 'Fire',
    skills: 'Glacial Constriction, Ice Shard Spray',
    desc: 'Giant crystalline serpent sliding silently across glacier peaks.',
    drops: 'Glacial Fangs, Frost Ring, Frozen Core'
  },
  thunder_roc: {
    id: 'thunder_roc',
    name: 'Thunder Roc Beast',
    icon: '🦅',
    family: 'Beast',
    act: 6,
    biome: 'Mountain',
    isBoss: false,
    baseHp: 2900,
    baseDmg: 190,
    speed: 5.0,
    element: 'Lightning',
    weakness: 'Earth',
    skills: 'Shockwave Dive, Gale Burst',
    desc: 'Majestic predatory bird infused with cosmic thunder currents.',
    drops: 'Roc Feathers, Lightning Talisman, Genesis Prism'
  },
  stone_colossus: {
    id: 'stone_colossus',
    name: 'Runic Stone Colossus',
    icon: '🗿',
    family: 'Construct',
    act: 8,
    biome: 'Volcano',
    isBoss: false,
    baseHp: 4600,
    baseDmg: 210,
    speed: 2.6,
    element: 'Physical / Earth',
    weakness: 'Chaos',
    skills: 'Ground Quake, Seismic Slam',
    desc: 'Massive stone titan inscribed with ancient protective runes.',
    drops: 'Titan Slab, Heavy Fortress Shield, Harmonic Core'
  },
  clockwork_spider: {
    id: 'clockwork_spider',
    name: 'Clockwork Automaton Spider',
    icon: '🕷️',
    family: 'Construct',
    act: 5,
    biome: 'Dungeon',
    isBoss: false,
    baseHp: 2100,
    baseDmg: 145,
    speed: 4.5,
    element: 'Physical / Fire',
    weakness: 'Lightning',
    skills: 'Sawblade Scythe, Steam Vent Blast',
    desc: 'Precision brass construct crafted by the ancient Genesis artificers.',
    drops: 'Clockwork Gears, Artificer Wrench, Sockets Prism'
  },
  bone_archon: {
    id: 'bone_archon',
    name: 'Cursed Bone Archon Lich',
    icon: '🧙‍♂️',
    family: 'Undead',
    act: 7,
    biome: 'Void',
    isBoss: false,
    baseHp: 3200,
    baseDmg: 220,
    speed: 3.6,
    element: 'Cold / Chaos',
    weakness: 'Fire / Holy',
    skills: 'Necrotic Orb, Bone Wall, Frost Ray',
    desc: 'High necromantic sovereign levitating above the bone wastes.',
    drops: 'Lich Robes, Bone Scepter, Soul Matrix'
  },
  doom_knight: {
    id: 'doom_knight',
    name: 'Armored Doom Knight',
    icon: '🛡️',
    family: 'Undead',
    act: 8,
    biome: 'Volcano',
    isBoss: false,
    baseHp: 3900,
    baseDmg: 235,
    speed: 3.4,
    element: 'Physical / Chaos',
    weakness: 'Lightning',
    skills: 'Abyssal Cleave, Unyielding Juggernaut',
    desc: 'Cursed champion clad in spiked obsidian armor carrying a colossal greatsword.',
    drops: 'Doom Greatsword, Obsidian Cuirass, Ascendant Catalyst'
  }
};

/**
 * Calculates progressive discovery level and stats without spoiling unreached milestones
 */
export function getMonsterDiscoveryProfile(monsterId, kills, isBoss) {
  const t1 = isBoss ? 10 : 100;
  const t2 = isBoss ? 40 : 500;
  const t3 = isBoss ? 100 : 2000;
  const t4 = isBoss ? 250 : 5000;

  if (kills >= t4) {
    return {
      rank: 4,
      title: '👑 APEX NEMESIS (Mastered)',
      color: '#ffd700',
      revealName: true,
      revealStats: true,
      revealWeakness: true,
      revealSkills: true,
      revealDrops: true,
      revealSignature: true,
      revealLore: true,
      bonusIir: 30,
      bonusIiq: 15,
      bonusDmg: 25,
      bonusCrit: 15,
      dmgReduction: 15,
      isMax: true
    };
  }
  if (kills >= t3) {
    return {
      rank: 3,
      title: '🥇 MASTER SLAYER',
      color: '#00f2fe',
      revealName: true,
      revealStats: true,
      revealWeakness: true,
      revealSkills: true,
      revealDrops: true,
      revealSignature: true,
      revealLore: false,
      bonusIir: 20,
      bonusIiq: 10,
      bonusDmg: 18,
      bonusCrit: 10,
      dmgReduction: 10,
      isMax: false
    };
  }
  if (kills >= t2) {
    return {
      rank: 2,
      title: '🥈 ADEPT TRACKER',
      color: '#c678dd',
      revealName: true,
      revealStats: true,
      revealWeakness: true,
      revealSkills: false,
      revealDrops: true,
      revealSignature: false,
      revealLore: false,
      bonusIir: 15,
      bonusIiq: 0,
      bonusDmg: 10,
      bonusCrit: 5,
      dmgReduction: 5,
      isMax: false
    };
  }
  if (kills >= t1) {
    return {
      rank: 1,
      title: '🥉 NOVICE HUNTER',
      color: '#98c379',
      revealName: true,
      revealStats: true,
      revealWeakness: false,
      revealSkills: false,
      revealDrops: false,
      revealSignature: false,
      revealLore: false,
      bonusIir: 5,
      bonusIiq: 0,
      bonusDmg: 5,
      bonusCrit: 0,
      dmgReduction: 0,
      isMax: false
    };
  }

  // Rank 0: Completely Locked & Fogged
  return {
    rank: 0,
    title: '🔒 UNCHARTED SPECIMEN',
    color: '#7f848e',
    revealName: false,
    revealStats: false,
    revealWeakness: false,
    revealSkills: false,
    revealDrops: false,
    revealSignature: false,
    revealLore: false,
    bonusIir: 0,
    bonusIiq: 0,
    bonusDmg: 0,
    bonusCrit: 0,
    dmgReduction: 0,
    isMax: false
  };
}

/**
 * Synchronizes monster templates and family talent trees with server database
 */
export async function fetchMasterMonstersFromServer() {
  try {
    const res = await fetch('/api/v1/data/monsters');
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        list.forEach(m => {
          if (MONSTERS[m.id]) {
            MONSTERS[m.id].name = m.name;
            MONSTERS[m.id].baseHp = m.baseHp;
            MONSTERS[m.id].baseDmg = m.baseDmg;
            MONSTERS[m.id].speed = m.speed;
            MONSTERS[m.id].element = m.element;
            MONSTERS[m.id].weakness = m.primaryWeakness;
            MONSTERS[m.id].skills = m.skills;
            MONSTERS[m.id].desc = m.description;
          }
        });
      }
    }
  } catch (err) {
    console.warn('[Monsters] Server master sync fallback to local dictionary:', err);
  }
}

export async function fetchMasterFamilyMasteryFromServer() {
  try {
    const res = await fetch('/api/v1/data/family-mastery');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        Object.assign(MONSTER_FAMILIES, data);
      }
    }
  } catch (err) {
    console.warn('[FamilyMastery] Server master sync fallback to local dictionary:', err);
  }
}
