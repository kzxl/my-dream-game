/**
 * Campaign Storyline, Acts, Map Progression & Quests Master Data
 */

export const CAMPAIGN_ACTS = [
  {
    id: 'act1',
    actNumber: 'ACT I',
    name: 'The Sylvan Awakening',
    subtitle: 'The shadow stirs within the ancient ruins of Sylvan Sanctuary.',
    coverArt: '/assets/act1_cover.jpg',
    levelRange: 'Lv. 1 - 20',
    boss: '🔥 Malakor the Shadow Fiend',
    zones: [
      {
        id: 'SanctuaryHaven',
        name: 'Sanctuary Haven',
        type: 'Town Plaza',
        level: 'Lv. 1-5',
        isTown: true,
        coords: { x: 22, y: 68 },
        desc: 'The only fortified haven remaining in the western frontier. Home to Doran and Elder Aethel.'
      },
      {
        id: 'WhisperingPlains',
        name: 'Whispering Plains',
        type: 'Wilderness',
        level: 'Lv. 5-15',
        isTown: false,
        coords: { x: 38, y: 52 },
        desc: 'Vast grassy plains divided by the Silver River. Overrun by toxic slimes and goblin scout camps.'
      },
      {
        id: 'ForgottenCrypt',
        name: 'Forgotten Crypt',
        type: 'Dungeon (Boss Lair)',
        level: 'Lv. 15-20',
        isTown: false,
        coords: { x: 28, y: 34 },
        desc: 'A subterranean labyrinth choked by miasma. Malakor the Shadow Fiend guards the ancient ascension sigil.'
      }
    ],
    quests: [
      { id: 'q1', title: 'Awakening in Haven', desc: 'Speak to Elder Aethel and master basic combat skills.', reward: '100 EXP + Bronze Ring' },
      { id: 'q2', title: 'Cleansing the Plains', desc: 'Defeat 15 Goblins in Whispering Plains.', reward: '350 EXP + Rare Boots' },
      { id: 'q3', title: 'The Shadow Fiend', desc: 'Venture into the Forgotten Crypt and slay Malakor.', reward: '1000 EXP + Class Ascension' }
    ]
  },
  {
    id: 'act2',
    actNumber: 'ACT II',
    name: 'The Frozen Spires',
    subtitle: 'Ascend the Permafrost Peaks where winter never yields.',
    coverArt: '/assets/act2_cover.jpg',
    levelRange: 'Lv. 20 - 35',
    boss: '❄️ Cryomancer Vael the Frost Lord',
    zones: [
      {
        id: 'FrostpeakTundra',
        name: 'Frostpeak Tundra',
        type: 'Glacial Plateau',
        level: 'Lv. 20-30',
        isTown: false,
        coords: { x: 55, y: 22 },
        desc: 'Treacherous ice plateaus battered by howling blizzards. Low Cold Res causes freeze on hit.'
      },
      {
        id: 'FrostfallSpire',
        name: 'Frostfall Spire',
        type: 'Glacial Citadel',
        level: 'Lv. 30-35',
        isTown: false,
        coords: { x: 68, y: 18 },
        desc: 'An ancient citadel carved of living permafrost. The throne of Cryomancer Vael.'
      }
    ],
    quests: [
      { id: 'q4', title: 'The Glacial Pass', desc: 'Survive the Permafrost Blizzard and locate Frostfall Spire.', reward: '1500 EXP + Cold Gem' },
      { id: 'q5', title: 'Heart of Winter', desc: 'Defeat Cryomancer Vael to claim the Frozen Core.', reward: '3000 EXP + Unique Frost Robe' }
    ]
  },
  {
    id: 'act3',
    actNumber: 'ACT III',
    name: 'The Infernal Caldera',
    subtitle: 'Delve into the volcanic abyss where magma rivers carve obsidian earth.',
    coverArt: '/assets/act3_cover.jpg',
    levelRange: 'Lv. 35 - 50',
    boss: '🌋 Ignis the Undying Tyrant',
    zones: [
      {
        id: 'MoltenCaldera',
        name: 'Molten Caldera',
        type: 'Volcanic Crater',
        level: 'Lv. 35-45',
        isTown: false,
        coords: { x: 78, y: 64 },
        desc: 'A fiery hellscape of flowing magma rivers and obsidian ruins. High Fire Resistance is essential.'
      },
      {
        id: 'StormpeakRidge',
        name: 'Stormpeak Ridge',
        type: 'Thunder Mountain Peaks',
        level: 'Lv. 40-45',
        isTown: false,
        coords: { x: 84, y: 52 },
        desc: 'High mountain crags battered by relentless static lightning storms and apex storm drakes.'
      },
      {
        id: 'VoidAbyss',
        name: 'The Void Abyss',
        type: 'Cosmic Pinnacle Arena',
        level: 'Lv. 45-50',
        isTown: false,
        coords: { x: 88, y: 78 },
        desc: 'The fractured cosmic arena of Malakor and the gateway into the infinite Endgame Rift Atlas.'
      }
    ],
    quests: [
      { id: 'q6', title: 'Trial of Fire', desc: 'Traverse the Molten Caldera with at least 75% Fire Resistance.', reward: '4500 EXP + Magma Relic' },
      { id: 'q7', title: 'Extinguish the Tyrant', desc: 'Vanquish Ignis in the Infernal Abyss to unlock the Endgame Atlas.', reward: '8000 EXP + Unique Greataxe' }
    ]
  },
  {
    id: 'endgame',
    actNumber: 'ENDGAME',
    name: 'Atlas of the Fractured Void',
    subtitle: 'Traverse infinite dimensional rift maps for mythical tier loot.',
    coverArt: '/assets/aethelis_atlas_map.jpg',
    levelRange: 'Lv. 50 - 100',
    boss: '🌌 The Abyssal Void Sovereign',
    zones: [
      {
        id: 'VoidAtlasDevice',
        name: 'The Map Device',
        type: 'Interdimensional Nexus',
        level: 'Tier 1 - 16',
        isTown: true,
        coords: { x: 50, y: 48 },
        desc: 'Insert crafted Waystones & Orbs to open portals into infinitely scalable dimensional pocket realms.'
      }
    ],
    quests: [
      { id: 'q8', title: 'The Void Beckons', desc: 'Craft your first Rare Tier 5 Map and defeat the Map Boss.', reward: '15000 EXP + Exalted Orb' }
    ]
  }
];
