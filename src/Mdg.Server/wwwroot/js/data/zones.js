/**
 * World Zones & Fast Travel Waypoints
 */

export const ZONES = {
  SanctuaryHaven: {
    id: 'SanctuaryHaven',
    name: 'Sanctuary Haven',
    subtitle: '🌿 Starting Town - Safe Haven (4000x4000)',
    levelRange: 'Lv. 1-5',
    portals: [{ x: 3200, y: 2000, targetZone: 'WhisperingPlains', targetX: 600, targetY: 2000, name: '🌀 To Whispering Plains' }],
    npcs: [
      { x: 1900, y: 1900, name: 'Doran (Blacksmith)', title: 'Blacksmith', color: '#e5c07b' },
      { x: 2100, y: 1900, name: 'Elder Aethel (Sage)', title: 'Quest Master', color: '#61afef' }
    ],
    props: [
      { x: 2000, y: 2000, type: 'campfire' },
      { x: 1850, y: 1880, type: 'chest' },
      { x: 1880, y: 1940, type: 'barrel' },
      { x: 2120, y: 1940, type: 'barrel' }
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
    props: [],
    dummies: []
  },
  ForgottenCrypt: {
    id: 'ForgottenCrypt',
    name: 'Forgotten Crypt',
    subtitle: '🏰 Forgotten Crypt - Shadow Fiend Lair (4000x4000)',
    levelRange: 'Lv. 15-25',
    portals: [{ x: 500, y: 2000, targetZone: 'WhisperingPlains', targetX: 3300, targetY: 2000, name: '🌀 Escape Dungeon' }],
    props: [],
    dummies: []
  }
};
