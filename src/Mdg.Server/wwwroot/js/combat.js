/**
 * Combat Calculations, Ailments (Ignite, Freeze, Bleed, Shock), Support Gems & Keystone Morphs
 */

import { player, monsters, trainingDummies, projectiles, particles, floatingTexts, mouse } from './state.js';
import { SKILLS, skillSocketBoard, isNodeAllocated } from './data/skills.js';
import { AudioEngine } from './audio.js';
import { dropMonsterLoot } from './main.js';

export function getMonsterLoreBonus(monsterType, isBoss = false) {
  const kills = (player.monsterKills && player.monsterKills[monsterType]) || 0;
  if (isBoss) {
    if (kills >= 120) return { tier: 4, name: 'Apex Nemesis 👑', bonusDmg: 0.25, bonusCrit: 15, bonusCritMulti: 35, iir: 35 };
    if (kills >= 50)  return { tier: 3, name: 'Master Inquisitor 🥇', bonusDmg: 0.18, bonusCrit: 10, bonusCritMulti: 25, iir: 20 };
    if (kills >= 20)  return { tier: 2, name: 'Adept Slayer 🥈', bonusDmg: 0.10, bonusCrit: 5, bonusCritMulti: 0, iir: 10 };
    if (kills >= 5)   return { tier: 1, name: 'Novice Hunter 🎖️', bonusDmg: 0.05, bonusCrit: 0, bonusCritMulti: 0, iir: 0 };
    return { tier: 0, name: 'Unfamiliar', bonusDmg: 0, bonusCrit: 0, bonusCritMulti: 0, iir: 0 };
  }
  if (kills >= 3000) return { tier: 4, name: 'Apex Nemesis 👑', bonusDmg: 0.25, bonusCrit: 15, bonusCritMulti: 35, iir: 35 };
  if (kills >= 1000) return { tier: 3, name: 'Master Inquisitor 🥇', bonusDmg: 0.18, bonusCrit: 10, bonusCritMulti: 25, iir: 20 };
  if (kills >= 250)  return { tier: 2, name: 'Adept Slayer 🥈', bonusDmg: 0.10, bonusCrit: 5, bonusCritMulti: 0, iir: 10 };
  if (kills >= 50)   return { tier: 1, name: 'Novice Hunter 🎖️', bonusDmg: 0.05, bonusCrit: 0, bonusCritMulti: 0, iir: 0 };
  return { tier: 0, name: 'Unfamiliar', bonusDmg: 0, bonusCrit: 0, bonusCritMulti: 0, iir: 0 };
}

export function dealDamage(target, rawPhysical, rawFire, rawCold, rawLightning, rawChaos, canCrit = true, sourcePos = null, isSlash = false) {
  if (!target.isAlive) return;

  // 1. Monster Evasion / Dodge Check (Skip damage & knockback if dodged)
  if (target.evasionChance && Math.random() * 100 < target.evasionChance) {
    spawnDamageNumber(target.x, target.y - 35 * (target.scale || 1), 'DODGED!', false, '#a0a8b7');
    AudioEngine.playTone(320, 'sine', 0.08, 0.05);
    return;
  }

  // 2. Monster Shield / Weapon Block Check (75% damage mitigation)
  let blockMultiplier = 1.0;
  if (target.blockChance && Math.random() * 100 < target.blockChance) {
    blockMultiplier = 0.25; // 75% Damage Reduction on Block
    spawnDamageNumber(target.x, target.y - 45 * (target.scale || 1), '🛡️ BLOCKED!', true, '#e5c07b');
    AudioEngine.playTone(160, 'square', 0.15, 0.12);

    for (let i = 0; i < 8; i++) {
      particles.push({
        x: target.x,
        y: target.y - 15,
        vx: (Math.random() - 0.5) * 160,
        vy: (Math.random() - 0.5) * 160,
        color: '#ffd700',
        life: 0.25,
        maxLife: 0.25,
        size: 3
      });
    }
  }

  // Monster Lore Mastery Amplifications
  const lore = getMonsterLoreBonus(target.type || 'monster', target.type === 'boss');
  let effectiveCritChance = (player.critChance || 25) + lore.bonusCrit;
  if (isSlash && isNodeAllocated('slash', 'sl_crit')) {
    effectiveCritChance += 15; // +15% Crit chance for Slash
  }
  const effectiveCritMulti = (player.critMulti || 200) + lore.bonusCritMulti;

  let isCrit = false;
  let multiplier = 1.0;
  if (canCrit && Math.random() * 100 <= effectiveCritChance) {
    isCrit = true;
    multiplier = effectiveCritMulti / 100;
  }

  // Lore bonus extra damage against familiar monster species
  multiplier *= (1.0 + lore.bonusDmg) * blockMultiplier;

  // Shock Ailment (+30% damage multiplier)
  if (target.shockTimer > 0) {
    multiplier *= 1.30;
  }

  const physDmg = (rawPhysical || 0) * multiplier;
  let physMitigation = 0;
  if (target.armor > 0 && physDmg > 0) {
    physMitigation = Math.min(0.9, target.armor / (target.armor + 5 * physDmg));
  }
  const finalPhys = physDmg * (1 - physMitigation);
  const finalFire = ((rawFire || 0) * multiplier) * (1 - (target.fireRes || 0) / 100);
  const finalCold = ((rawCold || 0) * multiplier) * (1 - (target.coldRes || 0) / 100);
  const finalLight = ((rawLightning || 0) * multiplier) * (1 - (target.lightningRes || target.lightRes || 0) / 100);
  const finalChaos = ((rawChaos || 0) * multiplier) * (1 - (target.chaosRes || 0) / 100);
  const totalDamage = Math.max(1, Math.round(finalPhys + finalFire + finalCold + finalLight + finalChaos));

  if (target.life < 90000) target.life -= totalDamage;
  target.hurtTimer = 0.25;

  // Leech Life for Slash
  if (isSlash && isNodeAllocated('slash', 'sl_leech')) {
    const leeched = Math.max(1, Math.round(totalDamage * 0.05));
    player.life = Math.min(player.maxLife, player.life + leeched);
  }

  // Dynamic Impact Knockback away from source
  if (target.life < 90000 && target.speed !== undefined) {
    const sX = sourcePos ? sourcePos.x : player.x;
    const sY = sourcePos ? sourcePos.y : player.y;
    const kAngle = Math.atan2(target.y - sY, target.x - sX);
    target.vx = (target.vx || 0) + Math.cos(kAngle) * 90;
    target.vy = (target.vy || 0) + Math.sin(kAngle) * 90;
  }

  // Ailment Proc Chances
  if (rawFire > 0 && (isCrit || isNodeAllocated('fireball', 'fb_ignite') || Math.random() < 0.4)) {
    applyIgnite(target, Math.round(totalDamage * 0.45));
  }
  if (rawCold > 0) {
    applyChill(target, 2.0); // 45% Movement speed reduction
    if (isCrit || isNodeAllocated('frost', 'fr_freeze')) {
      const freezeDur = isNodeAllocated('frost', 'fr_freeze') ? 0.75 : 0.5;
      applyFreeze(target, freezeDur); // Balanced micro-stun
    }
  }
  if (rawPhysical > 0 && isNodeAllocated('slash', 'sl_bleed')) {
    applyBleed(target, Math.round(totalDamage * 0.35));
  }

  AudioEngine.playHit(isCrit);
  const color = isCrit ? '#ffd700' : (rawFire > 0 ? '#ff7849' : (rawCold > 0 ? '#4facfe' : (rawLightning > 0 ? '#ffe066' : (rawChaos > 0 ? '#c678dd' : '#ffffff'))));
  spawnDamageNumber(target.x, target.y - 30 * (target.scale || 1), totalDamage, isCrit, color);

  for (let i = 0; i < (isCrit ? 12 : 6); i++) {
    particles.push({
      x: target.x,
      y: target.y - 10,
      vx: (Math.random() - 0.5) * 200,
      vy: (Math.random() - 0.5) * 200,
      color: rawFire > 0 ? '#ff5722' : (rawCold > 0 ? '#00f2fe' : (rawLightning > 0 ? '#ffd700' : '#c678dd')),
      life: 0.35,
      maxLife: 0.35,
      size: 3 + Math.random() * 4
    });
  }

  if (target.life <= 0 && target.life < 90000) {
    handleMonsterDefeated(target);
  }
}

// Unified Monster Defeated Lifecycle Handler
export function handleMonsterDefeated(target) {
  if (!target.isAlive) return;
  target.isAlive = false;
  target.life = 0;
  spawnDamageNumber(target.x, target.y - 50, 'DEFEATED!', true, '#e5c07b');

  // Keystone / Node: Ice Shatter
  if ((target.freezeTimer > 0 || target.chillTimer > 0) && isNodeAllocated('frost', 'fr_shatter')) {
    monsters.forEach(m => {
      if (m !== target && m.isAlive && Math.hypot(m.x - target.x, m.y - target.y) <= 120) {
        dealDamage(m, 0, 0, 120, 0, 0, false, { x: target.x, y: target.y });
      }
    });
    for (let i = 0; i < 20; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 50 + Math.random() * 200;
      particles.push({
        x: target.x,
        y: target.y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        color: '#00f2fe',
        life: 0.4,
        maxLife: 0.4,
        size: 5
      });
    }
  }

  // Increment Monster Lore Mastery Kill Count
  if (!player.monsterKills) player.monsterKills = {};
  const mType = target.type || 'monster';
  const oldTier = getMonsterLoreBonus(mType, target.type === 'boss').tier;
  player.monsterKills[mType] = (player.monsterKills[mType] || 0) + 1;
  const newLore = getMonsterLoreBonus(mType, target.type === 'boss');

  if (newLore.tier > oldTier) {
    AudioEngine.playLevelUp();
    spawnDamageNumber(target.x, target.y - 70, `📖 LORE UP: ${newLore.name} (+${Math.round(newLore.bonusDmg * 100)}% Dmg)!`, true, '#ffd700');
  }

  if (window.gainExp) window.gainExp(target.expValue || 35);
  dropMonsterLoot(target.x, target.y, target.type === 'boss');

  if (target.type === 'boss' && player.classSpec === 'Novice') {
    document.getElementById('btn-ascend-trigger')?.classList.remove('hidden');
  }
}

// Ailment Helper Applications
export function applyIgnite(target, dotPerSec) {
  target.igniteTimer = 3.5;
  target.igniteDmg = dotPerSec;
}

export function applyChill(target, durationSec) {
  target.chillTimer = durationSec;
}

export function applyFreeze(target, durationSec) {
  target.freezeTimer = durationSec;
}

export function applyBleed(target, dotPerSec) {
  target.bleedTimer = 4.0;
  target.bleedDmg = dotPerSec;
}

// Update Ailments per Frame (DoT & Status Ticks)
export function updateTargetAilments(target, dt) {
  if (!target.isAlive) return;

  // 1. Ignite Tick (Fire DoT)
  if (target.igniteTimer > 0) {
    target.igniteTimer -= dt;
    const dot = Math.max(1, Math.round(target.igniteDmg * dt));
    if (target.life < 90000) target.life -= dot;
    if (Math.random() < 0.25) {
      spawnDamageNumber(target.x, target.y - 20, `${dot} 🔥`, false, '#ff5722');
    }
  }

  // 2. Chill & Freeze
  if (target.chillTimer > 0) {
    target.chillTimer -= dt;
  }
  if (target.freezeTimer > 0) {
    target.freezeTimer -= dt;
  }

  // 3. Bleed Tick (Physical DoT - 3x if target is moving)
  if (target.bleedTimer > 0) {
    target.bleedTimer -= dt;
    const isMoving = target.speed > 0 && target.state !== 'idle';
    const dot = Math.max(1, Math.round(target.bleedDmg * (isMoving ? 3 : 1) * dt));
    if (target.life < 90000) target.life -= dot;
    if (Math.random() < 0.2) {
      spawnDamageNumber(target.x, target.y - 20, `${dot} 🩸`, false, '#e06c75');
    }
  }

  if (target.life <= 0 && target.life < 90000) {
    handleMonsterDefeated(target);
  }
}

export function spawnDamageNumber(x, y, text, isCrit, color) {
  floatingTexts.push({
    x: x + (Math.random() - 0.5) * 24,
    y: y,
    text: text.toString(),
    isCrit: isCrit,
    color: color || '#ffffff',
    life: 0.85,
    maxLife: 0.85,
    vy: isCrit ? -80 : -55
  });
}

// 1. HEAVY SLASH (With Wind Blade, Rend & Titan Cleave Morphs)
export function castSlash() {
  const s = SKILLS.slash;
  if (player.cooldowns.slash > 0) return;
  player.cooldowns.slash = Math.max(0.18, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

  const angle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
  if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
    player.facing = Math.cos(angle) > 0 ? 'right' : 'left';
  } else {
    player.facing = Math.sin(angle) > 0 ? 'down' : 'up';
  }
  player.isAttacking = true;
  player.attackTimer = 0.18;

  let reach = s.baseReach + (s.level - 1) * s.reachPerLvl + (player.classSpec === 'Vanguard' ? 20 : 0);
  if (isNodeAllocated('slash', 'sl_reach')) reach += 25;

  const slashX = player.x + Math.cos(angle) * 40;
  const slashY = player.y + Math.sin(angle) * 40;
  let dmg = s.baseDmg + (s.level - 1) * s.dmgPerLvl + (player.classSpec === 'Vanguard' ? 35 : 0);

  const isTitanCleave = isNodeAllocated('slash', 'sl_morph_crush');
  if (isTitanCleave) {
    dmg = Math.round(dmg * 2.5); // 2.5x damage
  }

  monsters.forEach(m => {
    if (m.isAlive && Math.hypot(m.x - slashX, m.y - slashY) < reach) {
      dealDamage(m, dmg, 20, 0, 0, 0, true, { x: player.x, y: player.y }, true);
      if (isTitanCleave) {
        applyFreeze(m, 1.0); // 1.0s Stun
        spawnDamageNumber(m.x, m.y - 45, '⚡ STUNNED!', true, '#ffd700');
      }
    }
  });

  trainingDummies.forEach(d => {
    if (Math.hypot(d.x - slashX, d.y - slashY) < reach) dealDamage(d, dmg, 20, 0, 0, 0, true, { x: player.x, y: player.y }, true);
  });

  // Keystone Morph: Wind Blade Wave
  if (isNodeAllocated('slash', 'sl_morph_wave')) {
    projectiles.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * 520,
      vy: Math.sin(angle) * 520,
      type: 'windblade',
      damage: Math.round(dmg * 0.85),
      radius: 20,
      life: 0.75
    });
  }

  for (let i = 0; i < 12; i++) {
    const spread = angle + (Math.random() - 0.5) * 1.4;
    particles.push({
      x: player.x + Math.cos(spread) * 30,
      y: player.y + Math.sin(spread) * 30,
      vx: Math.cos(spread) * 160,
      vy: Math.sin(spread) * 160,
      color: isTitanCleave ? '#ffd700' : (isNodeAllocated('slash', 'sl_morph_wave') ? '#00f2fe' : (player.classSpec === 'ShadowRogue' ? '#c678dd' : '#e5c07b')),
      life: 0.22,
      maxLife: 0.22,
      size: isTitanCleave ? 6 : 4
    });
  }
}

// 2. PYRO FIREBALL (With GMP Support, Hellfire Chaos & Nova Cataclysm Morph)
export function castFireball() {
  const s = SKILLS.fireball;
  if (player.cooldowns.fireball > 0 || player.mana < s.manaCost) return;
  player.mana -= s.manaCost;
  player.cooldowns.fireball = Math.max(0.4, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

  const baseAngle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
  let dmg = s.baseDmg + (s.level - 1) * s.dmgPerLvl + (player.classSpec === 'Arcanist' ? 40 : 0);
  if (isNodeAllocated('fireball', 'fb_dmg_1')) dmg = Math.round(dmg * 1.25);

  let radius = s.baseRadius + (s.level - 1) * s.radiusPerLvl;
  if (isNodeAllocated('fireball', 'fb_aoe_1')) radius = Math.round(radius * 1.35);

  let speedMult = 1.0;
  if (isNodeAllocated('fireball', 'fb_spd_1')) speedMult = 1.30;

  const isHellfireChaos = isNodeAllocated('fireball', 'fb_morph_chaos');
  const fireDmg = isHellfireChaos ? Math.round(dmg * 0.5) : dmg;
  const chaosDmg = isHellfireChaos ? Math.round(dmg * 0.5) : 0;

  const hasNova = isNodeAllocated('fireball', 'fb_morph_nova');
  const hasGmp = skillSocketBoard.fireball?.supports.includes('support_gmp');

  if (hasNova) {
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      projectiles.push({
        x: player.x,
        y: player.y - 10,
        vx: Math.cos(a) * 440 * speedMult,
        vy: Math.sin(a) * 440 * speedMult,
        type: 'fireball',
        damage: Math.round(dmg * 0.7),
        fireDmg: isHellfireChaos ? Math.round(dmg * 0.35) : Math.round(dmg * 0.7),
        chaosDmg: isHellfireChaos ? Math.round(dmg * 0.35) : 0,
        radius: radius,
        life: 1.2
      });
    }
  } else if (hasGmp) {
    [-0.22, 0, 0.22].forEach(offset => {
      projectiles.push({
        x: player.x,
        y: player.y - 10,
        vx: Math.cos(baseAngle + offset) * 480 * speedMult,
        vy: Math.sin(baseAngle + offset) * 480 * speedMult,
        type: 'fireball',
        damage: Math.round(dmg * 0.85),
        fireDmg: isHellfireChaos ? Math.round(fireDmg * 0.85) : Math.round(dmg * 0.85),
        chaosDmg: isHellfireChaos ? Math.round(chaosDmg * 0.85) : 0,
        radius: radius,
        life: 1.5
      });
    });
  } else {
    projectiles.push({
      x: player.x,
      y: player.y - 10,
      vx: Math.cos(baseAngle) * 480 * speedMult,
      vy: Math.sin(baseAngle) * 480 * speedMult,
      type: 'fireball',
      damage: dmg,
      fireDmg: fireDmg,
      chaosDmg: chaosDmg,
      radius: radius,
      life: 1.6
    });
  }
}

// 3. FROST NOVA (With Frost Shield, Ice Shatter & Glacial Vortex Morph)
export function castFrostNova() {
  const s = SKILLS.frost;
  if (player.cooldowns.frost > 0 || player.mana < s.manaCost) return;
  player.mana -= s.manaCost;
  player.cooldowns.frost = Math.max(1.0, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

  let novaRadius = s.baseRadius + (s.level - 1) * s.radiusPerLvl + (player.classSpec === 'Arcanist' ? 40 : 0);
  if (isNodeAllocated('frost', 'fr_aoe')) novaRadius = Math.round(novaRadius * 1.30);

  const dmg = s.baseDmg + (s.level - 1) * s.dmgPerLvl;

  let hitsCount = 0;
  monsters.forEach(m => {
    if (m.isAlive && Math.hypot(m.x - player.x, m.y - player.y) <= novaRadius) {
      dealDamage(m, 15, 0, dmg, 0, 0, true, { x: player.x, y: player.y });
      hitsCount++;

      if (isNodeAllocated('frost', 'fr_morph_vortex')) {
        const pullAngle = Math.atan2(player.y - m.y, player.x - m.x);
        const nx = m.x + Math.cos(pullAngle) * 90;
        const ny = m.y + Math.sin(pullAngle) * 90;
        if (window.canWalk && window.canWalk(nx, m.y)) m.x = nx;
        if (window.canWalk && window.canWalk(m.x, ny)) m.y = ny;
      }
    }
  });

  trainingDummies.forEach(d => {
    if (Math.hypot(d.x - player.x, d.y - player.y) <= novaRadius) dealDamage(d, 15, 0, dmg, 0, 0, true, { x: player.x, y: player.y });
  });

  if (isNodeAllocated('frost', 'fr_shield') && hitsCount > 0) {
    const esGained = hitsCount * 35;
    player.es = Math.min(player.maxEs, player.es + esGained);
    spawnDamageNumber(player.x, player.y - 45, `+${esGained} ES (Frost Shield)`, false, '#56b6c2');
  }

  for (let a = 0; a < Math.PI * 2; a += 0.25) {
    particles.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(a) * 260,
      vy: Math.sin(a) * 260,
      color: isNodeAllocated('frost', 'fr_morph_vortex') ? '#c678dd' : '#00f2fe',
      life: 0.45,
      maxLife: 0.45,
      size: 6
    });
  }
}

// 4. CATACLYSM METEOR (With Meteor Shower Morph)
export function castMeteor() {
  const s = SKILLS.meteor;
  if (player.cooldowns.meteor > 0 || player.mana < s.manaCost) return;
  player.mana -= s.manaCost;
  const cdReduction = isNodeAllocated('meteor', 'met_cd') ? 1.0 : 0;
  player.cooldowns.meteor = Math.max(1.0, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl - cdReduction);

  const targetX = mouse.worldX;
  const targetY = mouse.worldY;

  const dropSingleImpact = (x, y, delayMs) => {
    particles.push({
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      color: 'rgba(255, 65, 108, 0.45)',
      life: delayMs / 1000,
      maxLife: delayMs / 1000,
      size: 50,
      isRing: true
    });

    setTimeout(() => {
      const radius = s.baseRadius + (s.level - 1) * s.radiusPerLvl + (player.classSpec === 'Arcanist' ? 40 : 0);
      let dmg = s.baseDmg + (s.level - 1) * s.dmgPerLvl;
      if (isNodeAllocated('meteor', 'met_dmg')) dmg = Math.round(dmg * 1.30);

      monsters.forEach(m => {
        if (m.isAlive && Math.hypot(m.x - x, m.y - y) <= radius) dealDamage(m, 50, dmg, 0, 0, 30, true, { x, y });
      });

      trainingDummies.forEach(d => {
        if (Math.hypot(d.x - x, d.y - y) <= radius) dealDamage(d, 50, dmg, 0, 0, 30, true, { x, y });
      });

      for (let i = 0; i < 40; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 60 + Math.random() * 260;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          color: Math.random() > 0.3 ? '#ff3b00' : '#ffd700',
          life: 0.65,
          maxLife: 0.65,
          size: 6 + Math.random() * 6
        });
      }
    }, delayMs);
  };

  dropSingleImpact(targetX, targetY, 400);

  if (isNodeAllocated('meteor', 'met_morph_shower')) {
    dropSingleImpact(targetX + 60, targetY - 40, 650);
    dropSingleImpact(targetX - 50, targetY + 50, 900);
  }
}

// 5. SHADOW DASH
export function castDash() {
  const s = SKILLS.dash;
  if (player.cooldowns.dash > 0) return;
  player.cooldowns.dash = Math.max(0.4, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

  let dx = 0, dy = 0;
  if (window.keys && (window.keys['KeyW'] || window.keys['ArrowUp'])) dy -= 1;
  if (window.keys && (window.keys['KeyS'] || window.keys['ArrowDown'])) dy += 1;
  if (window.keys && (window.keys['KeyA'] || window.keys['ArrowLeft'])) dx -= 1;
  if (window.keys && (window.keys['KeyD'] || window.keys['ArrowRight'])) dx += 1;

  if (dx === 0 && dy === 0) {
    const angle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
    dx = Math.cos(angle);
    dy = Math.sin(angle);
  } else {
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;
  }

  const dist = s.baseDistance + (s.level - 1) * s.distancePerLvl;
  let remainingDist = dist;
  const stepSize = 14;

  while (remainingDist > 0) {
    const curStep = Math.min(stepSize, remainingDist);
    const nx = player.x + dx * curStep;
    const ny = player.y + dy * curStep;

    if (window.canWalk && !window.canWalk(nx, ny)) {
      AudioEngine.playTone(160, 'triangle', 0.1, 0.08);
      break;
    }

    player.x = nx;
    player.y = ny;
    remainingDist -= curStep;
  }

  for (let i = 0; i < 8; i++) {
    particles.push({
      x: player.x - dx * (i * 15),
      y: player.y - dy * (i * 15),
      vx: 0,
      vy: 0,
      color: 'rgba(255, 255, 255, 0.4)',
      life: 0.25,
      maxLife: 0.25,
      size: 14
    });
  }
}
