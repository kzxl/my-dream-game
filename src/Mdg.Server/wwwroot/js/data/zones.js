/**
 * World Zones Master Data - 5 Acts with 5 Dedicated Towns, Story Maps & Boss Arenas
 */

export const ZONES = {
  // =========================================================================
  // ACT 1: SYLVAN FRONTIER
  // =========================================================================
  SanctuaryHaven: {
    id: 'SanctuaryHaven',
    name: 'Sanctuary Haven',
    subtitle: '🌿 Starting Town - Safe Haven',
    act: 1,
    isTown: true,
    levelRange: 'Lv. 1-5',
    minLevel: 1,
    biome: 'Town',
    themeColor: '#4ade80',
    icon: '🏰',
    recommendedRes: 'None (Safe Zone)',
    hazards: ['None (Protected by Divine Ward)'],
    boss: 'None (Safe Haven)',
    coords: { x: 20, y: 70 },
    portals: [
      { x: 3200, y: 2000, targetZone: 'WhisperingPlains', targetX: 600, targetY: 2000, name: '🌀 To Whispering Plains' },
      { x: 2000, y: 3200, targetZone: 'GlacialOutpost', targetX: 2000, targetY: 800, name: '🌀 Journey to Glacial Outpost (Act II)' }
    ],
    npcs: [
      { x: 1800, y: 1900, name: 'Doran (Blacksmith)', title: 'Master Blacksmith', color: '#e5c07b' },
      { x: 2000, y: 1850, name: 'Elder Aethel', title: 'High Elder Sage', color: '#61afef' },
      { x: 1860, y: 1860, name: 'Kaelen (Vault Keeper)', title: 'Keeper of the Vault', color: '#98c379' },
      { x: 2150, y: 1880, name: 'Lyra (Astromancer)', title: 'Astromancer of the Void', color: '#c678dd' },
      { x: 2200, y: 1980, name: 'Mira (Beastmaster)', title: 'Companion Beastmaster', color: '#00f2fe' }
    ],
    props: [
      { x: 2000, y: 2000, type: 'campfire' },
      { x: 1850, y: 1880, type: 'chest' },
      { x: 2150, y: 1950, type: 'map_device', name: 'Map Device' },
      { x: 1880, y: 1940, type: 'barrel' },
      { x: 2120, y: 1940, type: 'barrel' },
      { x: 1750, y: 1820, type: 'oak_tree' },
      { x: 2250, y: 1820, type: 'cherry_tree' },
      { x: 1700, y: 2050, type: 'cherry_tree' },
      { x: 2300, y: 2050, type: 'oak_tree' }
    ],
    dummies: [
      { x: 1900, y: 2150, name: 'Training Dummy (Alpha)' },
      { x: 2100, y: 2150, name: 'Training Dummy (Beta)' }
    ]
  },

  WhisperingPlains: {
    id: 'WhisperingPlains',
    name: 'Whispering Plains',
    subtitle: '🌾 Whispering Plains - Wild Hunting Grounds',
    act: 1,
    isTown: false,
    levelRange: 'Lv. 5-9',
    minLevel: 5,
    biome: 'Plains',
    themeColor: '#86efac',
    icon: '🌾',
    recommendedRes: 'Poison Res 20%',
    hazards: ['Goblin Ambush Traps', 'Wolf Dens'],
    boss: 'Direwolf Matriarch',
    coords: { x: 38, y: 62 },
    portals: [
      { x: 500, y: 2000, targetZone: 'SanctuaryHaven', targetX: 3000, targetY: 2000, name: '🌀 Return to Haven' },
      { x: 3500, y: 2000, targetZone: 'VerdantCanopy', targetX: 600, targetY: 2000, name: '🌲 Enter Verdant Canopy' }
    ],
    npcs: [{ x: 650, y: 2050, name: 'Valen (Scout)', title: 'Outpost Scout', color: '#e06c75' }],
    props: [{ x: 600, y: 1950, type: 'pine_tree' }, { x: 750, y: 2000, type: 'autumn_tree' }],
    dummies: []
  },

  VerdantCanopy: {
    id: 'VerdantCanopy',
    name: 'Verdant Canopy',
    subtitle: '🌲 Ancient Bioluminescent Forest & Spider Brood',
    act: 1,
    isTown: false,
    levelRange: 'Lv. 9-12',
    minLevel: 8,
    biome: 'Plains',
    themeColor: '#4ade80',
    icon: '🌲',
    recommendedRes: 'Poison Res 30%',
    hazards: ['Poison Thorn Spores', 'Web Traps (-30% Move Speed)'],
    boss: 'Broodmother Sylva',
    coords: { x: 62, y: 48 },
    portals: [
      { x: 500, y: 2000, targetZone: 'WhisperingPlains', targetX: 3300, targetY: 2000, name: '🌾 Return to Plains' },
      { x: 3500, y: 2000, targetZone: 'ForgottenCrypt', targetX: 600, targetY: 2000, name: '🏰 Enter Forgotten Crypt' }
    ],
    props: [{ x: 800, y: 1900, type: 'oak_tree' }, { x: 2200, y: 2000, type: 'cherry_tree' }],
    dummies: []
  },

  ForgottenCrypt: {
    id: 'ForgottenCrypt',
    name: 'Forgotten Crypt',
    subtitle: '🏰 Ancient Catacombs of Malakor',
    act: 1,
    isTown: false,
    levelRange: 'Lv. 12-15',
    minLevel: 11,
    biome: 'Dungeon',
    themeColor: '#c084fc',
    icon: '💀',
    recommendedRes: 'Chaos Res 25%',
    hazards: ['Dark Miasma', 'Spike Traps', 'Undead Ambush'],
    boss: '🔥 Malakor the Shadow Fiend',
    coords: { x: 85, y: 30 },
    portals: [
      { x: 500, y: 2000, targetZone: 'VerdantCanopy', targetX: 3300, targetY: 2000, name: '🌲 Return to Canopy' },
      { x: 3500, y: 2000, targetZone: 'GlacialOutpost', targetX: 600, targetY: 2000, name: '🌀 Advance to Glacial Outpost (Act II)' }
    ],
    props: [{ x: 800, y: 1900, type: 'mushroom_glow' }, { x: 2000, y: 2000, type: 'crystal_spire' }],
    dummies: []
  },

  // =========================================================================
  // ACT 2: FROZEN SPIRES
  // =========================================================================
  GlacialOutpost: {
    id: 'GlacialOutpost',
    name: 'Glacial Outpost',
    subtitle: '❄️ Permafrost Frontier Garrison (Act 2 Town)',
    act: 2,
    isTown: true,
    levelRange: 'Lv. 15-18',
    minLevel: 15,
    biome: 'Town',
    themeColor: '#38bdf8',
    icon: '🏰',
    recommendedRes: 'Cold Res 30%',
    hazards: ['None (Thermal Ward Active)'],
    boss: 'None (Safe Haven)',
    coords: { x: 15, y: 75 },
    portals: [
      { x: 500, y: 2000, targetZone: 'SanctuaryHaven', targetX: 2000, targetY: 2000, name: '🌀 Return to Sanctuary Haven' },
      { x: 3500, y: 2000, targetZone: 'FrostpeakTundra', targetX: 600, targetY: 2000, name: '🌀 Enter Frostpeak Tundra' }
    ],
    npcs: [
      { x: 1850, y: 1900, name: 'Warmaster Brand', title: 'Glacial Quartermaster', color: '#38bdf8' },
      { x: 2050, y: 1850, name: 'Commander Valerius', title: 'High Vanguard Commander', color: '#ffd700' },
      { x: 2180, y: 1900, name: 'Kaelen (Vault)', title: 'Keeper of the Vault', color: '#98c379' }
    ],
    props: [
      { x: 2000, y: 2000, type: 'campfire' },
      { x: 1850, y: 1880, type: 'chest' },
      { x: 2150, y: 1950, type: 'map_device' }
    ],
    dummies: [{ x: 1900, y: 2150, name: 'Frozen Training Dummy' }]
  },

  FrostpeakTundra: {
    id: 'FrostpeakTundra',
    name: 'Frostpeak Tundra',
    subtitle: '❄️ Frozen Glaciers & Howling Blizzards',
    act: 2,
    isTown: false,
    levelRange: 'Lv. 18-22',
    minLevel: 17,
    biome: 'Tundra',
    themeColor: '#38bdf8',
    icon: '❄️',
    recommendedRes: 'Cold Res 45%',
    hazards: ['Blizzard Chill (-20% Move Speed)', 'Slippery Ice Fields'],
    boss: 'Yeti Frost Goliath',
    coords: { x: 38, y: 60 },
    portals: [
      { x: 500, y: 2000, targetZone: 'GlacialOutpost', targetX: 3300, targetY: 2000, name: '🌀 Return to Outpost' },
      { x: 3500, y: 2000, targetZone: 'HowlingIceCaverns', targetX: 600, targetY: 2000, name: '🧊 Descend into Ice Caverns' }
    ],
    props: [{ x: 800, y: 1900, type: 'crystal_spire' }, { x: 2000, y: 2000, type: 'crystal_spire' }],
    dummies: []
  },

  HowlingIceCaverns: {
    id: 'HowlingIceCaverns',
    name: 'Howling Ice Caverns',
    subtitle: '🧊 Subterranean Ice Grotto & Crystal Guardians',
    act: 2,
    isTown: false,
    levelRange: 'Lv. 22-26',
    minLevel: 21,
    biome: 'Tundra',
    themeColor: '#00f2fe',
    icon: '🧊',
    recommendedRes: 'Cold Res 55%',
    hazards: ['Falling Stalactites', 'Deep Glacial Frost'],
    boss: 'Glacial Behemoth Frosthorn',
    coords: { x: 62, y: 45 },
    portals: [
      { x: 500, y: 2000, targetZone: 'FrostpeakTundra', targetX: 3300, targetY: 2000, name: '❄️ Return to Tundra' },
      { x: 3500, y: 2000, targetZone: 'StormpeakRidge', targetX: 600, targetY: 2000, name: '⚡ Climb Stormpeak Ridge' }
    ],
    props: [{ x: 1000, y: 1900, type: 'crystal_spire' }, { x: 2200, y: 2000, type: 'crystal_spire' }],
    dummies: []
  },

  StormpeakRidge: {
    id: 'StormpeakRidge',
    name: 'Stormpeak Ridge',
    subtitle: '🏔️ Glacial Spire of Sovereign Vael',
    act: 2,
    isTown: false,
    levelRange: 'Lv. 26-30',
    minLevel: 25,
    biome: 'Tundra',
    themeColor: '#67e8f9',
    icon: '👑',
    recommendedRes: 'Cold Res 65% + Lightning Res 40%',
    hazards: ['Cryo Vortexes', 'Glacial Shatter Bombs'],
    boss: '❄️ Cryomancer Vael the Frost Sovereign',
    coords: { x: 85, y: 28 },
    portals: [
      { x: 500, y: 2000, targetZone: 'HowlingIceCaverns', targetX: 3300, targetY: 2000, name: '🧊 Return to Caverns' },
      { x: 3500, y: 2000, targetZone: 'AshenRedoubt', targetX: 600, targetY: 2000, name: '🌀 Descend into Ashen Redoubt (Act III)' }
    ],
    props: [{ x: 1000, y: 1900, type: 'crystal_spire' }, { x: 2000, y: 2000, type: 'crystal_spire' }],
    dummies: []
  },

  // =========================================================================
  // ACT 3: INFERNAL CALDERA
  // =========================================================================
  AshenRedoubt: {
    id: 'AshenRedoubt',
    name: 'Ashen Redoubt',
    subtitle: '🌋 Subterranean Obsidian Bastion (Act 3 Town)',
    act: 3,
    isTown: true,
    levelRange: 'Lv. 30-34',
    minLevel: 30,
    biome: 'Town',
    themeColor: '#fb923c',
    icon: '🏰',
    recommendedRes: 'Fire Res 40%',
    hazards: ['None (Obsidian Heat-Sink Shield)'],
    boss: 'None (Safe Haven)',
    coords: { x: 15, y: 75 },
    portals: [
      { x: 500, y: 2000, targetZone: 'GlacialOutpost', targetX: 2000, targetY: 2000, name: '🌀 Return to Glacial Outpost' },
      { x: 3500, y: 2000, targetZone: 'ObsidianWastes', targetX: 600, targetY: 2000, name: '🌋 Enter Obsidian Wastes' }
    ],
    npcs: [
      { x: 1850, y: 1900, name: 'Artificer Hestia', title: 'Forge Artificer', color: '#f97316' },
      { x: 2050, y: 1850, name: 'Inquisitor Thorne', title: 'Order of Cinders', color: '#ffd700' },
      { x: 2180, y: 1900, name: 'Kaelen (Vault)', title: 'Keeper of the Vault', color: '#98c379' }
    ],
    props: [
      { x: 2000, y: 2000, type: 'campfire' },
      { x: 1850, y: 1880, type: 'chest' },
      { x: 2150, y: 1950, type: 'map_device' }
    ],
    dummies: [{ x: 1900, y: 2150, name: 'Obsidian Training Dummy' }]
  },

  ObsidianWastes: {
    id: 'ObsidianWastes',
    name: 'Obsidian Wastes',
    subtitle: '🌋 Basalt Wilderness & Ash Storms',
    act: 3,
    isTown: false,
    levelRange: 'Lv. 34-38',
    minLevel: 33,
    biome: 'Volcanic',
    themeColor: '#f97316',
    icon: '🌋',
    recommendedRes: 'Fire Res 50%',
    hazards: ['Ash Storm Blindness', 'Basalt Fissures'],
    boss: 'Cinder Drake Pyroth',
    coords: { x: 38, y: 58 },
    portals: [
      { x: 500, y: 2000, targetZone: 'AshenRedoubt', targetX: 3300, targetY: 2000, name: '🏰 Return to Redoubt' },
      { x: 3500, y: 2000, targetZone: 'MoltenCaldera', targetX: 600, targetY: 2000, name: '🔥 Enter Molten Caldera' }
    ],
    props: [{ x: 900, y: 1900, type: 'campfire' }, { x: 2100, y: 2000, type: 'mossy_rock' }],
    dummies: []
  },

  MoltenCaldera: {
    id: 'MoltenCaldera',
    name: 'Molten Caldera',
    subtitle: '🌋 Infernal Core of Mount Caelum',
    act: 3,
    isTown: false,
    levelRange: 'Lv. 38-42',
    minLevel: 37,
    biome: 'Volcanic',
    themeColor: '#f97316',
    icon: '🌋',
    recommendedRes: 'Fire Res 65%',
    hazards: ['Molten Lava Rivers', 'Fire Geysers (Burn Dmg)'],
    boss: 'Magma Hound Alpha',
    coords: { x: 62, y: 45 },
    portals: [
      { x: 500, y: 2000, targetZone: 'ObsidianWastes', targetX: 3300, targetY: 2000, name: '🌋 Return to Wastes' },
      { x: 3500, y: 2000, targetZone: 'InfernalHeart', targetX: 600, targetY: 2000, name: '👑 Enter Infernal Heart' }
    ],
    props: [{ x: 1000, y: 2000, type: 'campfire' }, { x: 2000, y: 1900, type: 'mossy_rock' }],
    dummies: []
  },

  InfernalHeart: {
    id: 'InfernalHeart',
    name: 'Infernal Heart',
    subtitle: '🔥 Throne of the Molten Archon',
    act: 3,
    isTown: false,
    levelRange: 'Lv. 42-45',
    minLevel: 41,
    biome: 'Volcanic',
    themeColor: '#ef4444',
    icon: '👑',
    recommendedRes: 'Fire Res 75%',
    hazards: ['Superheated Magma Pools', 'Cataclysmic Firestorm'],
    boss: '🌋 Ignis the Undying Archon',
    coords: { x: 85, y: 28 },
    portals: [
      { x: 500, y: 2000, targetZone: 'MoltenCaldera', targetX: 3300, targetY: 2000, name: '🔥 Return to Caldera' },
      { x: 3500, y: 2000, targetZone: 'OasisSanctum', targetX: 600, targetY: 2000, name: '🌀 Emerge into Oasis Sanctum (Act IV)' }
    ],
    props: [{ x: 1500, y: 2000, type: 'campfire' }, { x: 2500, y: 2000, type: 'campfire' }],
    dummies: []
  },

  // =========================================================================
  // ACT 4: SUNKEN NECROPOLIS
  // =========================================================================
  OasisSanctum: {
    id: 'OasisSanctum',
    name: 'Oasis Sanctum',
    subtitle: '🌴 Twilight Oasis Sanctuary (Act 4 Town)',
    act: 4,
    isTown: true,
    levelRange: 'Lv. 45-48',
    minLevel: 45,
    biome: 'Town',
    themeColor: '#10b981',
    icon: '🏰',
    recommendedRes: 'Chaos Res 35%',
    hazards: ['None (Sheltered by Celestial Obelisks)'],
    boss: 'None (Safe Haven)',
    coords: { x: 15, y: 75 },
    portals: [
      { x: 500, y: 2000, targetZone: 'AshenRedoubt', targetX: 2000, targetY: 2000, name: '🌀 Return to Ashen Redoubt' },
      { x: 3500, y: 2000, targetZone: 'ShiftingDunes', targetX: 600, targetY: 2000, name: '🏜️ Venture into Shifting Dunes' }
    ],
    npcs: [
      { x: 1850, y: 1900, name: 'Priestess Selene', title: 'Keeper of Twilight Wards', color: '#34d399' },
      { x: 2050, y: 1850, name: 'Nomad Seer Tariq', title: 'Elder Desert Prophet', color: '#ffd700' },
      { x: 2180, y: 1900, name: 'Kaelen (Vault)', title: 'Keeper of the Vault', color: '#98c379' }
    ],
    props: [
      { x: 2000, y: 2000, type: 'campfire' },
      { x: 1850, y: 1880, type: 'chest' },
      { x: 2150, y: 1950, type: 'map_device' }
    ],
    dummies: [{ x: 1900, y: 2150, name: 'Ancient Stone Dummy' }]
  },

  ShiftingDunes: {
    id: 'ShiftingDunes',
    name: 'Shifting Dunes',
    subtitle: '🏜️ Endless Desert Canyon & Sand Wyrms',
    act: 4,
    isTown: false,
    levelRange: 'Lv. 48-52',
    minLevel: 47,
    biome: 'Dungeon',
    themeColor: '#fbbf24',
    icon: '🏜️',
    recommendedRes: 'Chaos Res 40%',
    hazards: ['Sandstorm Vortex', 'Quicksand Pits (-40% Move Speed)'],
    boss: 'Great Sand Wyrm Ouroboros',
    coords: { x: 38, y: 60 },
    portals: [
      { x: 500, y: 2000, targetZone: 'OasisSanctum', targetX: 3300, targetY: 2000, name: '🌴 Return to Oasis' },
      { x: 3500, y: 2000, targetZone: 'DreadTombs', targetX: 600, targetY: 2000, name: '💀 Enter Dread Tombs' }
    ],
    props: [{ x: 900, y: 1900, type: 'mossy_rock' }, { x: 2200, y: 2000, type: 'crystal_spire' }],
    dummies: []
  },

  DreadTombs: {
    id: 'DreadTombs',
    name: 'Dread Tombs of the Ancients',
    subtitle: '💀 Sunken Catacombs of Forgotten Kings',
    act: 4,
    isTown: false,
    levelRange: 'Lv. 52-56',
    minLevel: 51,
    biome: 'Dungeon',
    themeColor: '#a78bfa',
    icon: '💀',
    recommendedRes: 'Chaos Res 50%',
    hazards: ['Decay Miasma Pools', 'Soul Drain Totems'],
    boss: 'Anubis Shade Guardian',
    coords: { x: 62, y: 45 },
    portals: [
      { x: 500, y: 2000, targetZone: 'ShiftingDunes', targetX: 3300, targetY: 2000, name: '🏜️ Return to Dunes' },
      { x: 3500, y: 2000, targetZone: 'NecropolisOfSouls', targetX: 600, targetY: 2000, name: '⛪ Enter Necropolis' }
    ],
    props: [{ x: 1000, y: 2000, type: 'crystal_spire' }, { x: 2000, y: 2000, type: 'crystal_spire' }],
    dummies: []
  },

  NecropolisOfSouls: {
    id: 'NecropolisOfSouls',
    name: 'Necropolis of Souls',
    subtitle: '⛪ Cathedral of the Undying Lich',
    act: 4,
    isTown: false,
    levelRange: 'Lv. 56-60',
    minLevel: 55,
    biome: 'Dungeon',
    themeColor: '#c084fc',
    icon: '👑',
    recommendedRes: 'Chaos Res 65% + All Elemental 50%',
    hazards: ['Soul Harvest Circles', 'Void Collapse'],
    boss: '💀 High Inquisitor Morvath',
    coords: { x: 85, y: 28 },
    portals: [
      { x: 500, y: 2000, targetZone: 'DreadTombs', targetX: 3300, targetY: 2000, name: '💀 Return to Tombs' },
      { x: 3500, y: 2000, targetZone: 'AethelisCitadel', targetX: 600, targetY: 2000, name: '🌀 Ascend to Aethelis Citadel (Act V)' }
    ],
    props: [{ x: 1500, y: 2000, type: 'crystal_spire' }, { x: 2500, y: 2000, type: 'crystal_spire' }],
    dummies: []
  },

  // =========================================================================
  // ACT 5: CELESTIAL VOID & PINNACLE
  // =========================================================================
  AethelisCitadel: {
    id: 'AethelisCitadel',
    name: 'Aethelis Citadel',
    subtitle: '🌌 Celestial Floating Sky Enclave (Act 5 Town)',
    act: 5,
    isTown: true,
    levelRange: 'Lv. 60-65',
    minLevel: 60,
    biome: 'Town',
    themeColor: '#d946ef',
    icon: '🏰',
    recommendedRes: 'All Res 60%',
    hazards: ['None (Protected by Starfall Barrier)'],
    boss: 'None (Safe Haven)',
    coords: { x: 18, y: 65 },
    portals: [
      { x: 500, y: 2000, targetZone: 'OasisSanctum', targetX: 2000, targetY: 2000, name: '🌀 Return to Oasis Sanctum' },
      { x: 3500, y: 2000, targetZone: 'VoidAbyss', targetX: 600, targetY: 2000, name: '🌀 Pierce into Void Abyss' }
    ],
    npcs: [
      { x: 1850, y: 1900, name: 'Archon Aurelius', title: 'High Master of the Stars', color: '#d946ef' },
      { x: 2050, y: 1850, name: 'Lyra the Ascended', title: 'Prime Astromancer', color: '#c084fc' },
      { x: 2180, y: 1900, name: 'Kaelen (Vault)', title: 'Keeper of the Vault', color: '#98c379' }
    ],
    props: [
      { x: 2000, y: 2000, type: 'campfire' },
      { x: 1850, y: 1880, type: 'chest' },
      { x: 2150, y: 1950, type: 'map_device', name: 'Master Celestial Map Device' }
    ],
    dummies: [{ x: 1900, y: 2150, name: 'Celestial Training Core' }]
  },

  VoidAbyss: {
    id: 'VoidAbyss',
    name: 'Void Abyss',
    subtitle: '🌌 Citadel of Primordial Chaos',
    act: 5,
    isTown: false,
    levelRange: 'Lv. 65-72',
    minLevel: 62,
    biome: 'Void',
    themeColor: '#a855f7',
    icon: '🌌',
    recommendedRes: 'Chaos Res 65% + Elemental Cap',
    hazards: ['Chaos Decay', 'Event Horizon Gravity Wells'],
    boss: 'Void Fiend Behemoth',
    coords: { x: 45, y: 45 },
    portals: [
      { x: 500, y: 2000, targetZone: 'AethelisCitadel', targetX: 3300, targetY: 2000, name: '🌀 Return to Citadel' },
      { x: 3500, y: 2000, targetZone: 'CitadelOfTheVoid', targetX: 600, targetY: 2000, name: '🌀 Enter Throne of Eternity' }
    ],
    props: [{ x: 1500, y: 2000, type: 'crystal_spire' }, { x: 2500, y: 2000, type: 'crystal_spire' }],
    dummies: []
  },

  CitadelOfTheVoid: {
    id: 'CitadelOfTheVoid',
    name: 'Citadel of the Void',
    subtitle: '👑 Throne of Eternity (Final Campaign Boss)',
    act: 5,
    isTown: false,
    levelRange: 'Lv. 72-78',
    minLevel: 68,
    biome: 'Void',
    themeColor: '#ec4899',
    icon: '👑',
    recommendedRes: 'All Res 75% + Chaos Res 65%',
    hazards: ['Oblivion Beams', 'Reality Tears'],
    boss: '👑 The Void Sovereign Prime',
    coords: { x: 75, y: 30 },
    portals: [
      { x: 500, y: 2000, targetZone: 'VoidAbyss', targetX: 3300, targetY: 2000, name: '🌀 Return to Abyss' },
      { x: 3500, y: 2000, targetZone: 'AethelisCitadel', targetX: 2150, targetY: 1950, name: '🌀 Triumph: Return to Map Device' }
    ],
    props: [{ x: 1500, y: 2000, type: 'crystal_spire' }, { x: 2500, y: 2000, type: 'crystal_spire' }],
    dummies: []
  },

  // =========================================================================
  // ENDGAME PINNACLE ARENAS (Accessed via Map Device)
  // =========================================================================
  ArenaCaldera: {
    id: 'ArenaCaldera',
    name: 'Pinnacle Arena: Caldera',
    subtitle: '🔥 Tier 10 Volcanic Endgame Arena (Lv. 78)',
    act: 5,
    isTown: false,
    levelRange: 'Lv. 78+',
    minLevel: 75,
    biome: 'Volcanic',
    themeColor: '#ef4444',
    icon: '🔥',
    recommendedRes: 'Fire Res 75%',
    hazards: ['Superheated Magma Pools'],
    boss: 'Ignis Prime',
    coords: { x: 30, y: 82 },
    portals: [{ x: 500, y: 2000, targetZone: 'AethelisCitadel', targetX: 2150, targetY: 1950, name: '🌀 Return to Map Device' }],
    props: [],
    dummies: []
  },

  ArenaGlacial: {
    id: 'ArenaGlacial',
    name: 'Pinnacle Arena: Glacial',
    subtitle: '❄️ Tier 12 Glacial Endgame Arena (Lv. 80)',
    act: 5,
    isTown: false,
    levelRange: 'Lv. 80+',
    minLevel: 78,
    biome: 'Tundra',
    themeColor: '#06b6d4',
    icon: '❄️',
    recommendedRes: 'Cold Res 75%',
    hazards: ['Absolute Zero Ice Shards'],
    boss: 'Vael Archon',
    coords: { x: 55, y: 82 },
    portals: [{ x: 500, y: 2000, targetZone: 'AethelisCitadel', targetX: 2150, targetY: 1950, name: '🌀 Return to Map Device' }],
    props: [],
    dummies: []
  },

  ArenaVoid: {
    id: 'ArenaVoid',
    name: 'Pinnacle Arena: Void Rift',
    subtitle: '🌌 Tier 16 Pinnacle Ultimate Arena (Lv. 84)',
    act: 5,
    isTown: false,
    levelRange: 'Lv. 84+',
    minLevel: 82,
    biome: 'Void',
    themeColor: '#d946ef',
    icon: '👑',
    recommendedRes: 'Chaos Res 75% + All Elemental Cap',
    hazards: ['Event Horizon Gravity Wells'],
    boss: 'Ultimate Void Sovereign',
    coords: { x: 80, y: 82 },
    portals: [{ x: 500, y: 2000, targetZone: 'AethelisCitadel', targetX: 2150, targetY: 1950, name: '🌀 Return to Map Device' }],
    props: [],
    dummies: []
  }
};

export async function fetchMasterZonesFromServer() {
  try {
    const res = await fetch('/api/v1/data/zones');
    if (!res.ok) return;
    const serverZones = await res.json();
    if (Array.isArray(serverZones) && serverZones.length > 0) {
      serverZones.forEach(sz => {
        if (ZONES[sz.id]) {
          ZONES[sz.id].name = sz.name || ZONES[sz.id].name;
          ZONES[sz.id].subtitle = sz.subtitle || ZONES[sz.id].subtitle;
          ZONES[sz.id].act = sz.actNumber || ZONES[sz.id].act;
          ZONES[sz.id].boss = sz.bossName || ZONES[sz.id].boss;
          ZONES[sz.id].biome = sz.biomeType || ZONES[sz.id].biome;
        }
      });
      console.log(`[MasterData] Hydrated ${serverZones.length} Zones from SQLite database.`);
    }
  } catch (e) {
    console.warn('[MasterData] Using bundled offline zones fallback:', e.message);
  }
}

