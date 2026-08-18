/**
 * Campaign Storyline, 5 Acts, Town Hubs, Story Zones & Narrative Quests
 */

export const CAMPAIGN_ACTS = [
  // =========================================================================
  // ACT I: SYLVAN FRONTIER (Lv. 1 - 15)
  // =========================================================================
  {
    id: 'act1',
    actNumber: 'ACT I',
    name: 'Sylvan Frontier',
    subtitle: 'Awaken in Sanctuary Haven and purge the shadow fiend Malakor.',
    levelRange: 'Lv. 1 - 15',
    boss: '🔥 Malakor the Shadow Fiend',
    townZoneId: 'SanctuaryHaven',
    zones: [
      {
        id: 'SanctuaryHaven',
        name: 'Sanctuary Haven',
        type: 'Town Safe-Haven',
        level: 'Lv. 1-5',
        isTown: true,
        coords: { x: 20, y: 70 },
        desc: 'The fortified starting safe haven. Home to Doran the Blacksmith, Elder Aethel, and Vault Keeper Kaelen.'
      },
      {
        id: 'WhisperingPlains',
        name: 'Whispering Plains',
        type: 'Wilderness',
        level: 'Lv. 5-10',
        isTown: false,
        coords: { x: 45, y: 55 },
        desc: 'Vast rolling grasslands overrun by goblin raiding parties and feral direwolf packs.'
      },
      {
        id: 'ForgottenCrypt',
        name: 'Forgotten Crypt',
        type: 'Dungeon (Boss Lair)',
        level: 'Lv. 10-15',
        isTown: false,
        coords: { x: 75, y: 35 },
        desc: 'Ancient catacombs infested with undead fiends. Malakor awaits in the deep ceremonial vault.'
      }
    ],
    quests: [
      { id: 'q1_1', title: 'Awakening in Haven', desc: 'Consult Elder Aethel and forge your first weapon with Doran.', reward: '100 EXP + Bronze Ring' },
      { id: 'q1_2', title: 'Securing the Plains', desc: 'Hunt down goblin scouts and alpha wolves in Whispering Plains.', reward: '350 EXP + Rare Boots' },
      { id: 'q1_3', title: 'Malakor\'s Demise', desc: 'Descend into the Forgotten Crypt and slay Malakor.', reward: '1000 EXP + Class Ascension' }
    ]
  },

  // =========================================================================
  // ACT II: FROZEN SPIRES (Lv. 15 - 30)
  // =========================================================================
  {
    id: 'act2',
    actNumber: 'ACT II',
    name: 'Frozen Spires',
    subtitle: 'Establish Glacial Outpost and conquer Sovereign Vael atop the summit.',
    levelRange: 'Lv. 15 - 30',
    boss: '❄️ Cryomancer Vael the Frost Sovereign',
    townZoneId: 'GlacialOutpost',
    zones: [
      {
        id: 'GlacialOutpost',
        name: 'Glacial Outpost',
        type: 'Town Safe-Haven',
        level: 'Lv. 15-20',
        isTown: true,
        coords: { x: 20, y: 70 },
        desc: 'Permafrost frontier garrison protected by ancient thermal ward runes. Refuge against blizzards.'
      },
      {
        id: 'FrostpeakTundra',
        name: 'Frostpeak Tundra',
        type: 'Glacial Plateau',
        level: 'Lv. 20-25',
        isTown: false,
        coords: { x: 50, y: 50 },
        desc: 'Biting ice plateaus with howling gales (-20% move speed without cold resistance).'
      },
      {
        id: 'StormpeakRidge',
        name: 'Stormpeak Ridge',
        type: 'Glacial Spire (Boss Lair)',
        level: 'Lv. 25-30',
        isTown: false,
        coords: { x: 80, y: 30 },
        desc: 'The frozen mountain crest where Cryomancer Vael channels absolute zero storm vortexes.'
      }
    ],
    quests: [
      { id: 'q2_1', title: 'The Frost Garrison', desc: 'Reach Glacial Outpost and kindle the protective Thermal Pyre.', reward: '800 EXP + Warm Flask' },
      { id: 'q2_2', title: 'Goliaths of the Tundra', desc: 'Defeat 10 Frost Yetis in Frostpeak Tundra.', reward: '1500 EXP + Cold Resist Ring' },
      { id: 'q2_3', title: 'Sovereign of Absolute Zero', desc: 'Ascend Stormpeak Ridge and defeat Cryomancer Vael.', reward: '3000 EXP + Glacial Catalyst' }
    ]
  },

  // =========================================================================
  // ACT III: INFERNAL CALDERA (Lv. 30 - 45)
  // =========================================================================
  {
    id: 'act3',
    actNumber: 'ACT III',
    name: 'Infernal Caldera',
    subtitle: 'Rally at Ashen Redoubt and pierce Mount Caelum to defeat Ignis.',
    levelRange: 'Lv. 30 - 45',
    boss: '🌋 Ignis the Undying Archon',
    townZoneId: 'AshenRedoubt',
    zones: [
      {
        id: 'AshenRedoubt',
        name: 'Ashen Redoubt',
        type: 'Town Safe-Haven',
        level: 'Lv. 30-35',
        isTown: true,
        coords: { x: 20, y: 70 },
        desc: 'Subterranean obsidian fortress built around an ancient heat-sink core by dwarven artificers.'
      },
      {
        id: 'MoltenCaldera',
        name: 'Molten Caldera',
        type: 'Volcanic Core',
        level: 'Lv. 35-40',
        isTown: false,
        coords: { x: 50, y: 55 },
        desc: 'Superheated volcanic rivers and bubbling magma pools. Extreme fire hazards.'
      },
      {
        id: 'InfernalHeart',
        name: 'Infernal Heart',
        type: 'Core Chamber (Boss Lair)',
        level: 'Lv. 40-45',
        isTown: false,
        coords: { x: 80, y: 35 },
        desc: 'The primordial heart of Mount Caelum where Ignis the Undying Archon reigns supreme.'
      }
    ],
    quests: [
      { id: 'q3_1', title: 'The Obsidian Fortress', desc: 'Reactivate the heat dissipation vents in Ashen Redoubt.', reward: '2000 EXP + Flame Ward Belt' },
      { id: 'q3_2', title: 'Magma Incursion', desc: 'Clear the fire drakes and lava hounds roaming Molten Caldera.', reward: '3500 EXP + Genesis Prism' },
      { id: 'q3_3', title: 'Extinguishing the Archon', desc: 'Confront and defeat Ignis in the Infernal Heart.', reward: '6000 EXP + Cinderforged Cuirass' }
    ]
  },

  // =========================================================================
  // ACT IV: SUNKEN NECROPOLIS (Lv. 45 - 60)
  // =========================================================================
  {
    id: 'act4',
    actNumber: 'ACT IV',
    name: 'Sunken Necropolis',
    subtitle: 'Rendezvous at Oasis Sanctum and cleanse the ancient undead cathedral.',
    levelRange: 'Lv. 45 - 60',
    boss: '💀 High Inquisitor Morvath',
    townZoneId: 'OasisSanctum',
    zones: [
      {
        id: 'OasisSanctum',
        name: 'Oasis Sanctum',
        type: 'Town Safe-Haven',
        level: 'Lv. 45-50',
        isTown: true,
        coords: { x: 20, y: 70 },
        desc: 'A hidden twilight oasis sanctuary sheltered by ancient celestial obelisks.'
      },
      {
        id: 'DreadTombs',
        name: 'Dread Tombs of the Ancients',
        type: 'Sunken Catacombs',
        level: 'Lv. 50-55',
        isTown: false,
        coords: { x: 50, y: 50 },
        desc: 'Crumbling desert crypts haunted by plague spectres and mummy guardians.'
      },
      {
        id: 'NecropolisOfSouls',
        name: 'Necropolis of Souls',
        type: 'Cathedral of Souls (Boss Lair)',
        level: 'Lv. 55-60',
        isTown: false,
        coords: { x: 80, y: 30 },
        desc: 'The sunken grand cathedral where High Inquisitor Morvath harvests restless souls.'
      }
    ],
    quests: [
      { id: 'q4_1', title: 'The Oasis of Light', desc: 'Meet the Nomad Seer at Oasis Sanctum and unlock soul wards.', reward: '5000 EXP + Chaos Charm' },
      { id: 'q4_2', title: 'Tomb of the Phantoms', desc: 'Destroy 12 Soul Totems inside Dread Tombs.', reward: '8000 EXP + Ascendant Catalyst' },
      { id: 'q4_3', title: 'Judgment of Souls', desc: 'Vanquish High Inquisitor Morvath in the Necropolis of Souls.', reward: '12000 EXP + Soul Reaver Scythe' }
    ]
  },

  // =========================================================================
  // ACT V: CELESTIAL VOID & PINNACLE (Lv. 60 - 85+)
  // =========================================================================
  {
    id: 'act5',
    actNumber: 'ACT V',
    name: 'Celestial Void & Pinnacle',
    subtitle: 'Ascend to Aethelis Citadel, slay the Void Sovereign, and master the Map Device.',
    levelRange: 'Lv. 60 - 85+',
    boss: '👑 The Void Sovereign Prime',
    townZoneId: 'AethelisCitadel',
    zones: [
      {
        id: 'AethelisCitadel',
        name: 'Aethelis Citadel',
        type: 'Town Safe-Haven',
        level: 'Lv. 60-65',
        isTown: true,
        coords: { x: 18, y: 65 },
        desc: 'The celestial sky city of the ancient gods. Features the Master Atlas Map Device.'
      },
      {
        id: 'VoidAbyss',
        name: 'Void Abyss',
        type: 'Cosmic Rift',
        level: 'Lv. 65-72',
        isTown: false,
        coords: { x: 45, y: 45 },
        desc: 'A rift in reality where time and space collapse. Filled with cosmic aberrations.'
      },
      {
        id: 'CitadelOfTheVoid',
        name: 'Citadel of the Void',
        type: 'Throne of Eternity (Final Campaign Boss)',
        level: 'Lv. 72-78',
        isTown: false,
        coords: { x: 75, y: 30 },
        desc: 'The epicenter of primordial oblivion where The Void Sovereign Prime awaits.'
      },
      {
        id: 'ArenaCaldera',
        name: 'Pinnacle Arena: Caldera',
        type: 'Endgame Arena (Tier 10)',
        level: 'Lv. 78+',
        isTown: false,
        coords: { x: 30, y: 82 },
        desc: 'Tier 10 Endgame Boss Arena accessed via the Celestial Map Device.'
      },
      {
        id: 'ArenaGlacial',
        name: 'Pinnacle Arena: Glacial',
        type: 'Endgame Arena (Tier 12)',
        level: 'Lv. 80+',
        isTown: false,
        coords: { x: 55, y: 82 },
        desc: 'Tier 12 Endgame Boss Arena accessed via the Celestial Map Device.'
      },
      {
        id: 'ArenaVoid',
        name: 'Pinnacle Arena: Void Rift',
        type: 'Endgame Arena (Tier 16)',
        level: 'Lv. 84+',
        isTown: false,
        coords: { x: 80, y: 82 },
        desc: 'Tier 16 Pinnacle Ultimate Boss Arena.'
      }
    ],
    quests: [
      { id: 'q5_1', title: 'Ascendance to Heaven', desc: 'Activate the Celestial Beacon at Aethelis Citadel.', reward: '15000 EXP + Divine Orb' },
      { id: 'q5_2', title: 'The Event Horizon', desc: 'Survive the chaos storms inside the Void Abyss.', reward: '25000 EXP + Unique Void Amulet' },
      { id: 'q5_3', title: 'End of Eternity', desc: 'Defeat The Void Sovereign Prime to unlock the Endgame Atlas Device.', reward: '50000 EXP + Sovereign Crown' }
    ]
  }
];
