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
    bgImage: '/assets/acts/act1_sylvan.jpg',
    zones: [
      {
        id: 'SanctuaryHaven',
        name: 'Sanctuary Haven',
        type: 'Town Safe-Haven',
        level: 'Lv. 1-5',
        isTown: true,
        coords: { x: 15, y: 75 },
        desc: 'The fortified starting safe haven. Home to Doran the Blacksmith, Elder Aethel, and Vault Keeper Kaelen.'
      },
      {
        id: 'WhisperingPlains',
        name: 'Whispering Plains',
        type: 'Wilderness',
        level: 'Lv. 5-9',
        isTown: false,
        coords: { x: 38, y: 62 },
        desc: 'Vast rolling grasslands overrun by goblin raiding parties and feral direwolf packs.'
      },
      {
        id: 'VerdantCanopy',
        name: 'Verdant Canopy',
        type: 'Enchanted Forest',
        level: 'Lv. 9-12',
        isTown: false,
        coords: { x: 62, y: 48 },
        desc: 'Ancient bioluminescent deep forest guarded by primal treants, spiders, and venomous beasts.'
      },
      {
        id: 'ForgottenCrypt',
        name: 'Forgotten Crypt',
        type: 'Dungeon (Boss Lair)',
        level: 'Lv. 12-15',
        isTown: false,
        coords: { x: 85, y: 30 },
        desc: 'Ancient catacombs infested with undead fiends. Malakor awaits in the deep ceremonial vault.'
      }
    ],
    quests: [
      { id: 'q1_1', title: 'Awakening in Haven', desc: 'Consult Elder Aethel and forge your first weapon with Doran.', reward: '100 EXP + Bronze Ring' },
      { id: 'q1_2', title: 'Securing the Plains', desc: 'Hunt down goblin scouts and alpha wolves in Whispering Plains.', reward: '350 EXP + Rare Boots' },
      { id: 'q1_3', title: 'The Deep Forest', desc: 'Cleanse the venom brood lurking within Verdant Canopy.', reward: '600 EXP + Emerald Gem' },
      { id: 'q1_4', title: 'Malakor\'s Demise', desc: 'Descend into the Forgotten Crypt and slay Malakor.', reward: '1200 EXP + Class Ascension' }
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
    bgImage: '/assets/acts/act2_frozen.jpg',
    zones: [
      {
        id: 'GlacialOutpost',
        name: 'Glacial Outpost',
        type: 'Town Safe-Haven',
        level: 'Lv. 15-18',
        isTown: true,
        coords: { x: 15, y: 75 },
        desc: 'Permafrost frontier garrison protected by ancient thermal ward runes. Refuge against blizzards.'
      },
      {
        id: 'FrostpeakTundra',
        name: 'Frostpeak Tundra',
        type: 'Glacial Plateau',
        level: 'Lv. 18-22',
        isTown: false,
        coords: { x: 38, y: 60 },
        desc: 'Biting ice plateaus with howling gales (-20% move speed without cold resistance).'
      },
      {
        id: 'HowlingIceCaverns',
        name: 'Howling Ice Caverns',
        type: 'Glacial Dungeon',
        level: 'Lv. 22-26',
        isTown: false,
        coords: { x: 62, y: 45 },
        desc: 'Deep subterranean ice caverns echoing with frost shrieks and crystalline ice golem clusters.'
      },
      {
        id: 'StormpeakRidge',
        name: 'Stormpeak Ridge',
        type: 'Glacial Spire (Boss Lair)',
        level: 'Lv. 26-30',
        isTown: false,
        coords: { x: 85, y: 28 },
        desc: 'The frozen mountain crest where Cryomancer Vael channels absolute zero storm vortexes.'
      }
    ],
    quests: [
      { id: 'q2_1', title: 'The Frost Garrison', desc: 'Reach Glacial Outpost and kindle the protective Thermal Pyre.', reward: '800 EXP + Warm Flask' },
      { id: 'q2_2', title: 'Goliaths of the Tundra', desc: 'Defeat 10 Frost Yetis in Frostpeak Tundra.', reward: '1500 EXP + Cold Resist Ring' },
      { id: 'q2_3', title: 'The Crystal Caves', desc: 'Navigate Howling Ice Caverns and retrieve the Glacial Core.', reward: '2200 EXP + Frostforged Gauntlets' },
      { id: 'q2_4', title: 'Sovereign of Absolute Zero', desc: 'Ascend Stormpeak Ridge and defeat Cryomancer Vael.', reward: '3500 EXP + Glacial Catalyst' }
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
    bgImage: '/assets/acts/act3_infernal.jpg',
    zones: [
      {
        id: 'AshenRedoubt',
        name: 'Ashen Redoubt',
        type: 'Town Safe-Haven',
        level: 'Lv. 30-34',
        isTown: true,
        coords: { x: 15, y: 75 },
        desc: 'Subterranean obsidian fortress built around an ancient heat-sink core by dwarven artificers.'
      },
      {
        id: 'ObsidianWastes',
        name: 'Obsidian Wastes',
        type: 'Scorched Wilds',
        level: 'Lv. 34-38',
        isTown: false,
        coords: { x: 38, y: 58 },
        desc: 'Desolate volcanic basalt plains covered in ash storms and patrolling fire hounds.'
      },
      {
        id: 'MoltenCaldera',
        name: 'Molten Caldera',
        type: 'Volcanic Core',
        level: 'Lv. 38-42',
        isTown: false,
        coords: { x: 62, y: 45 },
        desc: 'Superheated volcanic rivers and bubbling magma pools. Extreme fire hazards.'
      },
      {
        id: 'InfernalHeart',
        name: 'Infernal Heart',
        type: 'Core Chamber (Boss Lair)',
        level: 'Lv. 42-45',
        isTown: false,
        coords: { x: 85, y: 28 },
        desc: 'The primordial heart of Mount Caelum where Ignis the Undying Archon reigns supreme.'
      }
    ],
    quests: [
      { id: 'q3_1', title: 'The Obsidian Fortress', desc: 'Reactivate the heat dissipation vents in Ashen Redoubt.', reward: '2000 EXP + Flame Ward Belt' },
      { id: 'q3_2', title: 'Ashfall Scouring', desc: 'Defeat 12 Magma Hounds in Obsidian Wastes.', reward: '2800 EXP + Ruby Ring' },
      { id: 'q3_3', title: 'Magma Incursion', desc: 'Clear the fire drakes and lava golems roaming Molten Caldera.', reward: '4000 EXP + Genesis Prism' },
      { id: 'q3_4', title: 'Extinguishing the Archon', desc: 'Confront and defeat Ignis in the Infernal Heart.', reward: '7000 EXP + Cinderforged Cuirass' }
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
    bgImage: '/assets/acts/act4_necropolis.jpg',
    zones: [
      {
        id: 'OasisSanctum',
        name: 'Oasis Sanctum',
        type: 'Town Safe-Haven',
        level: 'Lv. 45-48',
        isTown: true,
        coords: { x: 15, y: 75 },
        desc: 'A hidden twilight oasis sanctuary sheltered by ancient celestial obelisks.'
      },
      {
        id: 'ShiftingDunes',
        name: 'Shifting Dunes',
        type: 'Desert Wilderness',
        level: 'Lv. 48-52',
        isTown: false,
        coords: { x: 38, y: 60 },
        desc: 'Vast shifting golden sand dunes with sandstorm vortexes and ancient tomb scarabs.'
      },
      {
        id: 'DreadTombs',
        name: 'Dread Tombs of the Ancients',
        type: 'Sunken Catacombs',
        level: 'Lv. 52-56',
        isTown: false,
        coords: { x: 62, y: 45 },
        desc: 'Crumbling desert crypts haunted by plague spectres and mummy guardians.'
      },
      {
        id: 'NecropolisOfSouls',
        name: 'Necropolis of Souls',
        type: 'Cathedral of Souls (Boss Lair)',
        level: 'Lv. 56-60',
        isTown: false,
        coords: { x: 85, y: 28 },
        desc: 'The sunken grand cathedral where High Inquisitor Morvath harvests restless souls.'
      }
    ],
    quests: [
      { id: 'q4_1', title: 'The Oasis of Light', desc: 'Meet the Nomad Seer at Oasis Sanctum and unlock soul wards.', reward: '5000 EXP + Chaos Charm' },
      { id: 'q4_2', title: 'Dune Stalkers', desc: 'Hunt the Sand Wyrms in Shifting Dunes.', reward: '7500 EXP + Sandstride Boots' },
      { id: 'q4_3', title: 'Tomb of the Phantoms', desc: 'Destroy 12 Soul Totems inside Dread Tombs.', reward: '10000 EXP + Ascendant Catalyst' },
      { id: 'q4_4', title: 'Judgment of Souls', desc: 'Vanquish High Inquisitor Morvath in the Necropolis of Souls.', reward: '15000 EXP + Soul Reaver Scythe' }
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
    bgImage: '/assets/acts/act5_celestial.jpg',
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
      { id: 'q5_3', title: 'End of Eternity', desc: 'Defeat The Void Sovereign Prime to unlock the Endgame Atlas Device.', reward: '5000 EXP + Sovereign Crown' }
    ]
  }
];

/**
 * Returns the Safe-Haven Town zone ID corresponding to an Act or Zone
 */
export function getTownForAct(zoneIdOrAct) {
  if (typeof zoneIdOrAct === 'number') {
    const act = CAMPAIGN_ACTS.find(a => a.id === `act${zoneIdOrAct}`) || CAMPAIGN_ACTS[0];
    return act?.townZoneId || 'SanctuaryHaven';
  }
  if (typeof zoneIdOrAct === 'string') {
    const actDirect = CAMPAIGN_ACTS.find(a => a.id === zoneIdOrAct || a.townZoneId === zoneIdOrAct);
    if (actDirect) return actDirect.townZoneId;

    for (const act of CAMPAIGN_ACTS) {
      if (act.zones && act.zones.some(z => z.id === zoneIdOrAct)) {
        return act.townZoneId;
      }
    }
  }
  return 'SanctuaryHaven';
}

export async function fetchMasterCampaignFromServer() {
  try {
    const res = await fetch('/api/v1/data/campaign');
    if (!res.ok) return;
    const serverActs = await res.json();
    if (Array.isArray(serverActs) && serverActs.length > 0) {
      serverActs.forEach(sAct => {
        const localAct = CAMPAIGN_ACTS.find(a => a.actNumber === `ACT ${sAct.actNumber}` || a.id === `act${sAct.actNumber}`);
        if (localAct) {
          localAct.name = sAct.name || localAct.name;
          localAct.subtitle = sAct.subtitle || localAct.subtitle;
          localAct.levelRange = sAct.levelRange || localAct.levelRange;
          localAct.boss = sAct.boss || localAct.boss;
        }
      });
      console.log(`[MasterData] Hydrated ${serverActs.length} Campaign Acts from SQLite database.`);
    }
  } catch (e) {
    console.warn('[MasterData] Using bundled offline campaign fallback:', e.message);
  }
}

export async function fetchMasterQuestsFromServer() {
  try {
    const res = await fetch('/api/v1/data/quests');
    if (!res.ok) return;
    const serverQuests = await res.json();
    if (Array.isArray(serverQuests) && serverQuests.length > 0) {
      serverQuests.forEach(sq => {
        const act = CAMPAIGN_ACTS.find(a => a.id === `act${sq.actNumber}`);
        if (act && Array.isArray(act.quests)) {
          const existingQuest = act.quests.find(q => q.id === sq.id);
          if (existingQuest) {
            existingQuest.title = sq.title;
            existingQuest.desc = sq.description;
          } else {
            act.quests.push({
              id: sq.id,
              title: sq.title,
              desc: sq.description,
              reward: sq.rewardsJson || ''
            });
          }
        }
      });
      console.log(`[MasterData] Hydrated ${serverQuests.length} Quests from SQLite database.`);
    }
  } catch (e) {
    console.warn('[MasterData] Using bundled offline quests fallback:', e.message);
  }
}

