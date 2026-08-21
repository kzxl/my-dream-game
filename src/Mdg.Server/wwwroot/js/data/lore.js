/**
 * MDG: Aethelis - Comprehensive Branching Lore & Narrative Mythos Engine
 * 5 Deep Narrative Branches: Primordial Genesis, The Great Sundering, Campaign Chronicles, Factions & Endgame Rifts
 */

export const LORE_BRANCHES = [
  // =========================================================================
  // BRANCH 1: THE GENESIS & PRIMORDIAL MYTHOS (Khởi Nguyên & Thần Kỷ Cổ Đại)
  // =========================================================================
  {
    id: 'branch_genesis',
    name: 'The Genesis & Primordial Mythos',
    vietnameseName: 'Khởi Nguyên & Thần Kỷ Cổ Đại',
    icon: '✨',
    color: '#ffd700',
    summary: 'The dawn of Aethelis, the four primordial aetherial currents, and the 8 celestial constellations.',
    chapters: [
      {
        id: 'gen_01',
        title: 'The Primordial Spark & The World Heart',
        era: 'Era of Creation (Epoch 0)',
        excerpt: 'Before stars were hung in the astral tapestry, the Genesis Core pulsed in the infinite dark.',
        content: `Before time and stone took shape, the continent of Aethelis was forged from the beating heart of the cosmos—the Genesis Core. From its molten celestial core flowed four eternal currents of primal energy: Solar Light (Ignis), Abyssal Frost (Glacies), Tempest Lightning (Fulmen), and Astral Void (Umbra). These primordial forces formed the mountains, deep oceans, howling winds, and crystalline ley lines that crisscross the realm to this day.`
      },
      {
        id: 'gen_02',
        title: 'The Eight Celestial Constellations',
        era: 'Age of the Ancients (Epoch I)',
        excerpt: 'Eight celestial guardians took vigil over the sky, weaving their blessings into the mortal spirit.',
        content: `To guide the emerging mortal races, the Great Architects aligned eight celestial constellations in the sky:
1. 🛡️ The Silver Aegis: Guardian of resilience, armor, and unwavering courage.
2. 🔥 The Solar Phoenix: Lord of revitalization, fiery wrath, and resurrection.
3. ⚡ The Tempest Caller: Master of lightning, velocity, and instantaneous strikes.
4. ❄️ The Frost Warden: Stalwart protector, slow freezing control, and glacial armor.
5. 🗡️ The Shadow Viper: Deity of stealth, venom, lethal critical strikes, and evasion.
6. 🔮 The Aether Weaver: Conductor of pure arcane intellect, mana surges, and energy shields.
7. 👑 The Celestial Fortune: Giver of abundance, bountiful spoils, and sacred blessings.
8. ⚔️ The Cataclysmic Titan: Embodiment of overwhelming physical might and colossal cleaves.`
      },
      {
        id: 'gen_03',
        title: 'The Origin of the Shrines',
        era: 'Age of the Ancients (Epoch I)',
        excerpt: 'Sanctified monoliths and divine altars placed at the confluence of elemental ley lines.',
        content: `Throughout the wilderness, ancient peoples built stone altars where the ley lines converged. These became known as the Celestial Shrines. Imbued with the lingering power of the Titans, touching a shrine channels immense temporary blessings—such as Divine Swiftness, Cataclysmic Might, or Solar Inferno—granting mortals the strength to survive against rampaging fiends.`
      }
    ]
  },

  // =========================================================================
  // BRANCH 2: THE HIGH EMPIRE & THE GREAT SUNDERING (Đế Chế & Đại Phân Triệt)
  // =========================================================================
  {
    id: 'branch_sundering',
    name: 'The High Empire & The Great Sundering',
    vietnameseName: 'Đế Chế Hoàng Kim & Thảm Họa Đại Phân Triệt',
    icon: '🏛️',
    color: '#00f2fe',
    summary: 'The rise of magical civilization, the reckless excavation of the Void Heart, and the cataclysmic rupture.',
    chapters: [
      {
        id: 'sun_01',
        title: 'The Golden Age of Magiteck & The Genesis Forge',
        era: 'The Golden Empire (Epoch II)',
        excerpt: 'When mortals mastered the language of runes and forged weapons that rivaled divine relics.',
        content: `Under the rule of the Grand Magisters, civilization flourished across Aethelis. Majestic spire cities made of white marble and brass floated above the clouds. Craftsmen mastered the Genesis Forge—an altar capable of manipulating the very affixes of reality, fusing magical sockets and linking harmonic tethers into mortal arms and armor.`
      },
      {
        id: 'sun_02',
        title: 'The Hubris of the High Synod & The Void Incursion',
        era: 'The Twilight Years (Epoch III)',
        excerpt: 'A thirst for immortality that pierced the veil between reality and the abyss.',
        content: `Craving eternal life and unlimited energy, the Grand Magisters drilled deep beneath the crust, breaking into the forbidden Void Well. The astral barrier shattered. Chaotic void corruption seeped through the ley lines, mutating gentle beasts into ravenous horrors, awakening ancient golems, and poisoning the minds of the High Councils. The Golden Empire collapsed overnight in an event remembered as The Great Sundering.`
      },
      {
        id: 'sun_03',
        title: 'The Rise of Sanctuary Haven',
        era: 'The Dark Age (Epoch IV)',
        excerpt: 'Surviving refugees built a barricaded sanctuary under the protection of Elder Aethel.',
        content: `From the ashes of the ruined world, the survivors gathered around the ancient Sylvan Grove, founding Sanctuary Haven. Warded by runic monoliths and defended by the Iron Vanguards, Haven remains the last uncorrupted bastion of humanity, where new heroes are forged to reclaim the nine lost realms.`
      }
    ]
  },

  // =========================================================================
  // BRANCH 3: THE 9 ACTS CAMPAIGN CHRONICLES (Biên Niên Sử 9 Hồi Chiến Dịch)
  // =========================================================================
  {
    id: 'branch_campaign',
    name: 'The 9 Acts Campaign Chronicles',
    vietnameseName: 'Biên Niên Sử 9 Hồi Chiến Dịch',
    icon: '🗺️',
    color: '#ff7849',
    summary: 'The epic narrative progression across the 9 Acts of Aethelis, from Sylvan Frontier to the Genesis Core.',
    chapters: [
      {
        id: 'act_c01',
        title: 'Act I - Sylvan Frontier: The Shadow Fiend',
        era: 'Lv. 1 - 15 • Wilderness & Crypts',
        excerpt: 'Awaken in Sanctuary Haven and purge the corrupting shadow fiend Malakor.',
        content: `The hero awakens with dormant memories in Sanctuary Haven. Goblin raiders and feral alpha wolves threaten the outer farms of Whispering Plains. Guided by Elder Aethel and armed by Doran the Smith, the hero enters the Verdant Canopy and descends into the Forgotten Crypt to defeat Malakor, cleansing the Sylvan region and unlocking their first Class Ascension.`
      },
      {
        id: 'act_c02',
        title: 'Act II - Frozen Spires: The Glacial Sovereign',
        era: 'Lv. 15 - 30 • Permafrost & Caverns',
        excerpt: 'Establish Glacial Outpost and conquer Cryomancer Vael atop the blizzard peak.',
        content: `A relentless permafrost blizzard descends from the northern mountains. The hero travels to Glacial Outpost and traverses the biting cold of Frostpeak Tundra. Slaying frost yetis and conquering the Howling Ice Caverns, the hero ascends the Frozen Summit to shatter Cryomancer Vael the Frost Sovereign.`
      },
      {
        id: 'act_c03',
        title: 'Act III - Molten Caldera: The Ash Titan',
        era: 'Lv. 30 - 45 • Scorched Earth & Magma',
        excerpt: 'Brave the scorching heat of Ashfall Citadel and extinguish Lord Ignis.',
        content: `Subterranean magma chambers erupt across the southern badlands. Navigating the scorched sulfur wastes, the hero enters Ashfall Citadel. Dodging river flows of molten lava, they defeat fiery salamanders and stone drakes to duel Lord Ignis the Ash Titan inside the Molten Core.`
      },
      {
        id: 'act_c04',
        title: 'Act IV to IX - The Deeper Realms & The Genesis Core',
        era: 'Lv. 45 - 90+ • Endgame Horizons',
        excerpt: 'From Sunken Fens and Stormpeak Citadel to the ultimate duel at the Genesis Core.',
        content: `The quest for total restoration leads the hero across Sunken Fens (Act V - Venom Brood), the electrified Stormpeak Citadel (Act VI - Lightning Lord), the mind-bending Void Abyss (Act VII - Abyssal Archon), the Dragon Caldera (Act VIII - Ancient Magma Wyrms), and culminates at the Genesis Core (Act IX) where the corrupted Genesis Sovereign must be purified to restore the astral balance.`
      }
    ]
  },

  // =========================================================================
  // BRANCH 4: THE FOUR GREAT FACTIONS & ORDERS (Tứ Đại Phe Phái & Nhân Vật)
  // =========================================================================
  {
    id: 'branch_factions',
    name: 'The Four Great Factions & Orders',
    vietnameseName: 'Tứ Đại Phe Phái & Nhân Vật Huyền Thoại',
    icon: '👥',
    color: '#00e676',
    summary: 'The philosophical orders, guilds, and heroic champions fighting for the future of Aethelis.',
    chapters: [
      {
        id: 'fac_01',
        title: 'Order of the Silver Aegis (Iron Vanguards)',
        era: 'Holy Knightly Brotherhood',
        excerpt: 'Sworn protectors of humanity, clad in heavy plate and wielding divine hammers.',
        content: `Founded by the first defenders of Sanctuary Haven, the Silver Aegis represents duty, resilience, and unyielding fortitude. Their knights channel protective barriers and devastating physical cleaves. Led by Master Doran and Captain Valen, they stand as the vanguard against demonic incursions.`
      },
      {
        id: 'fac_02',
        title: 'The Arcane Synod of Aethelis (Grand Arcanists)',
        era: 'Academy of Elemental Mysticism',
        excerpt: 'Scholars seeking to understand and stabilize the elemental currents of the world.',
        content: `Operating from the Grand Archive, the Arcanist Synod studies ancient runes, gem sockets, and planar rifts. They manipulate Fire, Frost, and Lightning spells, protecting their fragile bodies with shimmering Energy Shields. High Scholar Morwen oversees their research into stabilizing the Map Device.`
      },
      {
        id: 'fac_03',
        title: 'The Shadow Weavers & Nightshades (Shadow Rogues)',
        era: 'Guild of Seekers & Assassins',
        excerpt: 'Silent hunters who walk between shadows, dealing lethal strikes and evading all harm.',
        content: `A decentralized collective of scouts, relic hunters, and deadly assassins. They rely on nimble footwork, critical strikes, and poison alchemy. Overseen by Kaelen the Vault Keeper, they explore deep ruins to recover lost technology and secret lore before it falls into void cultist hands.`
      },
      {
        id: 'fac_04',
        title: 'The Ancient Construct Artisans & Beast Tribes',
        era: 'Primal Inhabitants',
        excerpt: 'Sentient stone constructs, Frostpeak clans, and untamed nature guardians.',
        content: `Not all beings outside the towns are hostile. Ancient stone golems preserve the forgotten memories of the High Empire, while Frostpeak shamans maintain equilibrium with primal frost spirits. Learning their customs unlocks unique lore masteries and permanent character bonuses.`
      }
    ]
  },

  // =========================================================================
  // BRANCH 5: THE ASTRAL GATE & ENDGAME RIFTS (Vết Nứt Không Gian & Cổng Vĩnh Hằng)
  // =========================================================================
  {
    id: 'branch_endgame',
    name: 'The Astral Gate & Endgame Rifts',
    vietnameseName: 'Vết Nứt Thời Không & Cổng Vĩnh Hằng',
    icon: '🌌',
    color: '#c678dd',
    summary: 'The infinite dimensional rifts accessible through the Map Device, Timeless Memories, and Astral Bosses.',
    chapters: [
      {
        id: 'end_01',
        title: 'The Map Device: Gate of Eternity',
        era: 'Endgame Dimensional Mechanics',
        excerpt: 'A restored celestial artifact that opens portals into alternate timelines and fractured pocket worlds.',
        content: `Standing in Sanctuary Haven is the Gate of Eternity Map Device. By inserting Memory Relics and Map Tablets, heroes can open portals into unstable pocket dimensions with elevated item rarity (IIR), density of rare elite monsters, and unique affix modifiers (such as Reflect, Monster Turbo, or Nemesis Auras).`
      },
      {
        id: 'end_02',
        title: 'Apex Sovereigns of the Void',
        era: 'Cosmic Pinnacle Challenges',
        excerpt: 'Colossal beings of pure cosmic energy that dwell beyond the boundaries of reality.',
        content: `At the highest Rift tiers (Tier 16+) and Spire Depths, players encounter the Apex Sovereigns. Defeating these titanic bosses rewards Unique items with influence affixes, Fracturing Orbs, and Divine Ascendant Catalysts needed for pinnacle crafting.`
      }
    ]
  }
];
