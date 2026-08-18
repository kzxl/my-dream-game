/**
 * World Zones & Fast Travel Waypoints (English)
 */

export const ZONES = {
  SanctuaryHaven: {
    id: 'SanctuaryHaven',
    name: 'Sanctuary Haven',
    subtitle: '🌿 Starting Town - Safe Haven (4000x4000)',
    levelRange: 'Lv. 1-5',
    portals: [{ x: 3200, y: 2000, targetZone: 'WhisperingPlains', targetX: 600, targetY: 2000, name: '🌀 To Whispering Plains' }],
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
      { x: 2300, y: 2050, type: 'oak_tree' },
      { x: 1920, y: 1830, type: 'flowers_gold' },
      { x: 2080, y: 1830, type: 'flowers_blue' },
      { x: 1780, y: 1960, type: 'lush_bush' },
      { x: 2220, y: 1960, type: 'lush_bush' },
      { x: 1950, y: 2100, type: 'mossy_rock' },
      { x: 2050, y: 2100, type: 'mossy_rock' }
    ],
    dummies: [
      { x: 1900, y: 2150, name: 'Training Dummy (Alpha)' },
      { x: 2100, y: 2150, name: 'Training Dummy (Beta)' }
    ]
  },
  WhisperingPlains: {
    id: 'WhisperingPlains',
    name: 'Whispering Plains',
    subtitle: '🌾 Whispering Plains - Wild Hunting Grounds (4000x4000)',
    levelRange: 'Lv. 5-15',
    portals: [
      { x: 500, y: 2000, targetZone: 'SanctuaryHaven', targetX: 3000, targetY: 2000, name: '🌀 Return to Haven' },
      { x: 3500, y: 2000, targetZone: 'ForgottenCrypt', targetX: 600, targetY: 2000, name: '🌀 Enter Forgotten Crypt' }
    ],
    npcs: [
      { x: 650, y: 2050, name: 'Valen (Scout)', title: 'Outpost Scout', color: '#e06c75' }
    ],
    props: [
      { x: 600, y: 1950, type: 'pine_tree' },
      { x: 750, y: 2000, type: 'autumn_tree' },
      { x: 1200, y: 1800, type: 'tall_grass' },
      { x: 1400, y: 1900, type: 'flowers_red' },
      { x: 1600, y: 2100, type: 'mossy_rock' },
      { x: 2000, y: 1900, type: 'pine_tree' },
      { x: 2200, y: 2200, type: 'autumn_tree' },
      { x: 2500, y: 1800, type: 'mushroom_glow' },
      { x: 2800, y: 2000, type: 'tall_grass' },
      { x: 3100, y: 1950, type: 'flowers_red' }
    ],
    dummies: []
  },
  ForgottenCrypt: {
    id: 'ForgottenCrypt',
    name: 'Forgotten Crypt',
    subtitle: '🏰 Forgotten Crypt - Shadow Fiend Lair (4000x4000)',
    levelRange: 'Lv. 15-25',
    portals: [{ x: 500, y: 2000, targetZone: 'WhisperingPlains', targetX: 3300, targetY: 2000, name: '🌀 Escape Dungeon' }],
    props: [
      { x: 800, y: 1900, type: 'mushroom_glow' },
      { x: 1200, y: 2100, type: 'crystal_spire' },
      { x: 1600, y: 1800, type: 'mossy_rock' },
      { x: 2000, y: 2000, type: 'crystal_spire' },
      { x: 2400, y: 2200, type: 'mushroom_glow' }
    ],
    dummies: []
  }
};
