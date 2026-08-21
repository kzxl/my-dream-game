/**
 * MDG: Aethelis - Flasks Data Catalog & Affix Pool
 * PoE-style Charge-based potion flasks with affix mod crafting
 */

export const STARTER_FLASKS = [
  {
    id: 'flask_life_divine',
    name: 'Divine Life Flask of Staunching',
    type: 'Life',
    icon: '🧪',
    color: '#ff4d4f',
    currentCharges: 60,
    maxCharges: 60,
    chargesPerUse: 20,
    duration: 4.0,
    rarity: 'Magic',
    healLifePerSec: 125,
    mods: ['• Recovers 500 Life over 4.00 Seconds', '• Grants Immunity to Bleed during Effect']
  },
  {
    id: 'flask_mana_arcane',
    name: 'Arcane Mana Flask of Warding',
    type: 'Mana',
    icon: '💧',
    color: '#00f2fe',
    currentCharges: 60,
    maxCharges: 60,
    chargesPerUse: 20,
    duration: 4.0,
    rarity: 'Magic',
    healManaPerSec: 75,
    healEsPerSec: 45,
    mods: ['• Recovers 300 Mana & 180 ES over 4.00 Seconds', '• Grants Immunity to Curse and Shock']
  },
  {
    id: 'flask_quicksilver',
    name: 'Quicksilver Flask of the Cheetah',
    type: 'Quicksilver',
    icon: '⚡',
    color: '#52c41a',
    currentCharges: 50,
    maxCharges: 50,
    chargesPerUse: 25,
    duration: 5.0,
    rarity: 'Magic',
    speedBonusPct: 45,
    attackSpeedBonusPct: 25,
    mods: ['• +45% Increased Movement Speed', '• +25% Increased Attack & Cast Speed']
  },
  {
    id: 'flask_granite',
    name: 'Granite Flask of the Iron Titan',
    type: 'Granite',
    icon: '🛡️',
    color: '#ffd700',
    currentCharges: 60,
    maxCharges: 60,
    chargesPerUse: 30,
    duration: 5.0,
    rarity: 'Rare',
    armorFlat: 1200,
    allResPct: 25,
    mods: ['• +1200 to Total Armor Rating', '• +25% to All Elemental Resistances', '• Immune to Freeze & Chill']
  }
];
