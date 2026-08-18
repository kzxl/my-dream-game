/**
 * Skill Database, Attribute Tags, Support Gems & Per-Skill Mastery Trees (Last Epoch style)
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
    manaCost: 0,
    desc: 'Cleaves enemies in front with heavy martial physical force.'
  },
  fireball: {
    id: 'fireball',
    name: 'Pyro Fireball',
    icon: '🔥',
    key: 'Q',
    tags: ['fire', 'spell', 'projectile', 'aoe'],
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
    desc: 'Hurls an explosive projectile of concentrated elemental fire.'
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
    desc: 'Blasts freezing permafrost in a 360-degree radial ring.'
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
    desc: 'Calls down a devastating celestial meteor upon the target area.'
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
    manaCost: 0,
    desc: 'Dashes forward with temporary invulnerability frames.'
  }
};

/**
 * Mastery Trees for Each Individual Skill (Branching Morphs & Augments)
 */
export const SKILL_MASTERY_TREES = {
  fireball: {
    skillKey: 'fireball',
    title: 'PYRO FIREBALL MASTERY TREE',
    nodes: [
      { id: 'fb_dmg_1', name: 'Pyromancy', type: 'minor', cost: 1, x: 120, y: 150, desc: '+20% Fire Damage', req: [] },
      { id: 'fb_spd_1', name: 'Velocity', type: 'minor', cost: 1, x: 120, y: 270, desc: '+30% Projectile Speed', req: [] },
      { id: 'fb_aoe_1', name: 'Blazing Radius', type: 'major', cost: 1, x: 260, y: 150, desc: '+35% Explosion AoE', req: ['fb_dmg_1'] },
      { id: 'fb_ignite', name: 'Ignition Pulse', type: 'major', cost: 1, x: 260, y: 270, desc: '100% Chance to Ignite target', req: ['fb_spd_1'] },
      { id: 'fb_morph_nova', name: '★ NOVA CATACLYSM', type: 'keystone', cost: 2, x: 420, y: 150, desc: 'Fires 8 Fireballs in a 360° Nova ring!', req: ['fb_aoe_1'] },
      { id: 'fb_morph_chaos', name: '★ HELLFIRE CHAOS', type: 'keystone', cost: 2, x: 420, y: 270, desc: 'Converts 50% Fire to Chaos & leaves Magma Pool', req: ['fb_ignite'] }
    ]
  },
  slash: {
    skillKey: 'slash',
    title: 'HEAVY SLASH MASTERY TREE',
    nodes: [
      { id: 'sl_reach', name: 'Extended Edge', type: 'minor', cost: 1, x: 120, y: 150, desc: '+25px Cleave Range', req: [] },
      { id: 'sl_bleed', name: 'Rend & Bleed', type: 'minor', cost: 1, x: 120, y: 270, desc: '+40% Chance to Bleed', req: [] },
      { id: 'sl_crit', name: 'Deadly Precision', type: 'major', cost: 1, x: 260, y: 150, desc: '+15% Critical Chance', req: ['sl_reach'] },
      { id: 'sl_leech', name: 'Blood Feast', type: 'major', cost: 1, x: 260, y: 270, desc: 'Leech 5% Damage as Life', req: ['sl_bleed'] },
      { id: 'sl_morph_wave', name: '★ WIND BLADE WAVE', type: 'keystone', cost: 2, x: 420, y: 150, desc: 'Slash unleashes a crescent wind projectile (350px)!', req: ['sl_crit'] },
      { id: 'sl_morph_crush', name: '★ TITAN CLEAVE', type: 'keystone', cost: 2, x: 420, y: 270, desc: 'Deals 2.5x damage & Stuns all enemies for 1s', req: ['sl_leech'] }
    ]
  },
  frost: {
    skillKey: 'frost',
    title: 'FROST NOVA MASTERY TREE',
    nodes: [
      { id: 'fr_aoe', name: 'Expansive Chill', type: 'minor', cost: 1, x: 120, y: 150, desc: '+30% Radial Area', req: [] },
      { id: 'fr_freeze', name: 'Glacial Stun', type: 'minor', cost: 1, x: 120, y: 270, desc: '+25% Freeze Duration', req: [] },
      { id: 'fr_shield', name: 'Frost Barrier', type: 'major', cost: 1, x: 260, y: 150, desc: 'Restores +35 Energy Shield per enemy hit', req: ['fr_aoe'] },
      { id: 'fr_shatter', name: 'Ice Shatter', type: 'major', cost: 1, x: 260, y: 270, desc: 'Frozen enemies explode on defeat for 120 cold dmg', req: ['fr_freeze'] },
      { id: 'fr_morph_vortex', name: '★ GLACIAL VORTEX', type: 'keystone', cost: 2, x: 420, y: 210, desc: 'Creates a magnetic vortex pulling all enemies to center!', req: ['fr_shield', 'fr_shatter'] }
    ]
  },
  meteor: {
    skillKey: 'meteor',
    title: 'CATACLYSM METEOR MASTERY TREE',
    nodes: [
      { id: 'met_dmg', name: 'Starlight Fury', type: 'minor', cost: 1, x: 120, y: 150, desc: '+30% Impact Damage', req: [] },
      { id: 'met_cd', name: 'Cosmic Alignment', type: 'minor', cost: 1, x: 120, y: 270, desc: '-1.0s Cooldown', req: [] },
      { id: 'met_magma', name: 'Molten Earth', type: 'major', cost: 1, x: 260, y: 150, desc: 'Leaves a burning magma lake dealing DoT for 4s', req: ['met_dmg'] },
      { id: 'met_morph_shower', name: '★ METEOR SHOWER', type: 'keystone', cost: 2, x: 420, y: 210, desc: 'Bombards with 3 consecutive Celestial Meteors!', req: ['met_magma'] }
    ]
  },
  dash: {
    skillKey: 'dash',
    title: 'SHADOW DASH MASTERY TREE',
    nodes: [
      { id: 'dsh_dist', name: 'Warp Step', type: 'minor', cost: 1, x: 120, y: 150, desc: '+60px Dash Distance', req: [] },
      { id: 'dsh_cd', name: 'Flicker', type: 'minor', cost: 1, x: 120, y: 270, desc: '-0.3s Cooldown', req: [] },
      { id: 'dsh_morph_double', name: '★ DOUBLE PHANTOM DASH', type: 'keystone', cost: 2, x: 380, y: 210, desc: 'Grants 2 consecutive dash charges with clone decoy!', req: ['dsh_dist', 'dsh_cd'] }
    ]
  }
};

/**
 * Socketed Active Gem Sockets (Hotbar mapping: LMB, Q, W, E, Space)
 */
export const skillSocketBoard = {
  slash: { activeGem: 'gem_slash', supports: ['support_echo'] },
  fireball: { activeGem: 'gem_fireball', supports: ['support_gmp', 'support_fire'] },
  frost: { activeGem: 'gem_frost', supports: [] },
  meteor: { activeGem: 'gem_meteor', supports: [] },
  dash: { activeGem: 'gem_dash', supports: [] }
};

/**
 * Allocated Mastery Nodes per Skill
 */
export const allocatedMasteryNodes = {
  slash: new Set(['sl_reach', 'sl_morph_wave']),
  fireball: new Set(['fb_dmg_1', 'fb_aoe_1', 'fb_morph_nova']),
  frost: new Set(['fr_aoe', 'fr_shield']),
  meteor: new Set(['met_dmg']),
  dash: new Set(['dsh_dist'])
};

export function isNodeAllocated(skillKey, nodeId) {
  return allocatedMasteryNodes[skillKey]?.has(nodeId) || false;
}

export function allocateNode(skillKey, nodeId, player) {
  const tree = SKILL_MASTERY_TREES[skillKey];
  if (!tree) return false;

  const node = tree.nodes.find(n => n.id === nodeId);
  if (!node || isNodeAllocated(skillKey, nodeId)) return false;

  // Check prerequisites
  if (node.req && node.req.length > 0) {
    const hasReq = node.req.some(r => isNodeAllocated(skillKey, r));
    if (!hasReq) return false;
  }

  // Check SMP (Skill Mastery Points = Skill Level - Nodes Spent)
  const spentPoints = getSpentMasteryPoints(skillKey);
  const totalPoints = SKILLS[skillKey]?.level || 1;
  if (spentPoints + node.cost > totalPoints) return false;

  if (!allocatedMasteryNodes[skillKey]) allocatedMasteryNodes[skillKey] = new Set();
  allocatedMasteryNodes[skillKey].add(nodeId);
  return true;
}

export function respecSkillTree(skillKey) {
  if (allocatedMasteryNodes[skillKey]) {
    allocatedMasteryNodes[skillKey].clear();
  }
}

export function getSpentMasteryPoints(skillKey) {
  let spent = 0;
  const set = allocatedMasteryNodes[skillKey];
  if (!set) return 0;

  const tree = SKILL_MASTERY_TREES[skillKey];
  if (!tree) return 0;

  set.forEach(id => {
    const node = tree.nodes.find(n => n.id === id);
    if (node) spent += node.cost;
  });
  return spent;
}

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
