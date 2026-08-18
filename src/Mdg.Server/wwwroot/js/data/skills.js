/**
 * Skill Database, Attribute Tags & Level Progression Formulas
 */

export const SKILLS = {
  slash: {
    id: 'slash',
    name: 'Heavy Slash',
    icon: '⚔️',
    key: 'LMB',
    tags: ['physical', 'melee', 'attack'],
    level: 1,
    maxLevel: 20,
    exp: 0,
    expToNext: 120,
    baseDmg: 50,
    dmgPerLvl: 10,
    baseCooldown: 0.35,
    cdReductionPerLvl: 0.008,
    baseReach: 75,
    reachPerLvl: 3,
    desc: 'Cleaves enemies in front with physical force.'
  },
  fireball: {
    id: 'fireball',
    name: 'Pyro Fireball',
    icon: '🔥',
    key: 'Q',
    tags: ['fire', 'spell', 'aoe'],
    level: 1,
    maxLevel: 20,
    exp: 0,
    expToNext: 150,
    baseDmg: 85,
    dmgPerLvl: 15,
    baseCooldown: 1.0,
    cdReductionPerLvl: 0.02,
    baseRadius: 12,
    radiusPerLvl: 0.6,
    manaCost: 10,
    desc: 'Hurls an explosive projectile of concentrated fire.'
  },
  frost: {
    id: 'frost',
    name: 'Frost Nova',
    icon: '❄️',
    key: 'W',
    tags: ['cold', 'spell', 'aoe'],
    level: 1,
    maxLevel: 20,
    exp: 0,
    expToNext: 180,
    baseDmg: 90,
    dmgPerLvl: 16,
    baseCooldown: 2.5,
    cdReductionPerLvl: 0.05,
    baseRadius: 150,
    radiusPerLvl: 6,
    manaCost: 15,
    desc: 'Blasts freezing frost in a 360-degree ring.'
  },
  meteor: {
    id: 'meteor',
    name: 'Cataclysm Meteor',
    icon: '☄️',
    key: 'E',
    tags: ['fire', 'chaos', 'spell', 'aoe'],
    level: 1,
    maxLevel: 20,
    exp: 0,
    expToNext: 250,
    baseDmg: 180,
    dmgPerLvl: 30,
    baseCooldown: 4.5,
    cdReductionPerLvl: 0.08,
    baseRadius: 135,
    radiusPerLvl: 6,
    manaCost: 30,
    desc: 'Calls down a devastating celestial meteor.'
  },
  dash: {
    id: 'dash',
    name: 'Shadow Dash',
    icon: '💨',
    key: 'Space',
    tags: ['movement', 'chaos'],
    level: 1,
    maxLevel: 20,
    exp: 0,
    expToNext: 100,
    baseDistance: 190,
    distancePerLvl: 7,
    baseCooldown: 1.2,
    cdReductionPerLvl: 0.035,
    desc: 'Dashes with temporary invulnerability.'
  }
};

export function getSkillExpMultiplier(skillKey, player) {
  const s = SKILLS[skillKey];
  if (!s) return 1.0;

  let multiplier = 1.0;
  const tags = s.tags || [];

  if (player.classSpec === 'Vanguard') {
    if (tags.includes('physical') || tags.includes('melee') || tags.includes('attack')) multiplier += 0.5;
  } else if (player.classSpec === 'Arcanist') {
    if (tags.includes('fire') || tags.includes('cold') || tags.includes('spell') || tags.includes('aoe')) multiplier += 0.6;
  } else if (player.classSpec === 'ShadowRogue') {
    if (tags.includes('chaos') || tags.includes('movement') || tags.includes('attack')) multiplier += 0.5;
  }

  for (let slotKey in player.equipped) {
    const gear = player.equipped[slotKey];
    if (gear && gear.mods) {
      if (tags.includes('fire') && gear.mods.some(m => m.includes('Fire Damage'))) multiplier += 0.25;
      if (tags.includes('chaos') && gear.mods.some(m => m.includes('Chaos'))) multiplier += 0.25;
      if (tags.includes('cold') && gear.mods.some(m => m.includes('Cold'))) multiplier += 0.2;
    }
  }

  return Math.max(0.5, multiplier);
}
