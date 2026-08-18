/**
 * Combat Calculations, Ailments (Ignite, Freeze, Bleed, Shock), Support Gems & Keystone Morphs
 */

import { player, monsters, trainingDummies, projectiles, particles, floatingTexts, mouse } from './state.js';
import { SKILLS, skillSocketBoard, isNodeAllocated } from './data/skills.js';
import { AudioEngine } from './audio.js';
import { dropMonsterLoot } from './main.js';

export function dealDamage(target, rawPhysical, rawFire, rawCold, rawLightning, rawChaos, canCrit = true) {
  if (!target.isAlive) return;

  let isCrit = false;
  let multiplier = 1.0;
  if (canCrit && Math.random() * 100 <= player.critChance) {
    isCrit = true;
    multiplier = player.critMulti / 100;
  }

  // Shock Ailment (+30% damage multiplier)
  if (target.shockTimer > 0) {
    multiplier *= 1.30;
  }

  const physDmg = rawPhysical * multiplier;
  let physMitigation = 0;
  if (target.armor > 0 && physDmg > 0) {
    physMitigation = Math.min(0.9, target.armor / (target.armor + 5 * physDmg));
  }
  const finalPhys = physDmg * (1 - physMitigation);
  const finalFire = (rawFire * multiplier) * (1 - (target.fireRes || 0) / 100);
  const finalCold = (rawCold * multiplier) * (1 - (target.coldRes || 0) / 100);
  const finalChaos = (rawChaos * multiplier) * (1 - (target.chaosRes || 0) / 100);
  const totalDamage = Math.max(1, Math.round(finalPhys + finalFire + finalCold + finalChaos));

  if (target.life < 90000) target.life -= totalDamage;
  target.hurtTimer = 0.25;

  // Ailment Proc Chances
  if (rawFire > 0 && (isCrit || isNodeAllocated('fireball', 'fb_ignite') || Math.random() < 0.4)) {
    applyIgnite(target, Math.round(totalDamage * 0.45));
  }
  if (rawCold > 0 && (isCrit || Math.random() < 0.5)) {
    applyFreeze(target, isNodeAllocated('frost', 'fr_freeze') ? 2.2 : 1.5);
  }
  if (rawPhysical > 0 && isNodeAllocated('slash', 'sl_bleed')) {
    applyBleed(target, Math.round(totalDamage * 0.35));
  }

  AudioEngine.playHit(isCrit);
  const color = isCrit ? '#ffd700' : (rawFire > 0 ? '#ff7849' : (rawCold > 0 ? '#4facfe' : (rawChaos > 0 ? '#c678dd' : '#ffffff')));
  spawnDamageNumber(target.x, target.y - 30 * (target.scale || 1), totalDamage, isCrit, color);

  for (let i = 0; i < (isCrit ? 12 : 6); i++) {
    particles.push({
      x: target.x,
      y: target.y - 10,
      vx: (Math.random() - 0.5) * 200,
      vy: (Math.random() - 0.5) * 200,
      color: rawFire > 0 ? '#ff5722' : (rawCold > 0 ? '#00f2fe' : '#c678dd'),
      life: 0.35,
      maxLife: 0.35,
      size: 3 + Math.random() * 4
    });
  }

  if (target.life <= 0 && target.life < 90000) {
    target.isAlive = false;
    target.life = 0;
    spawnDamageNumber(target.x, target.y - 50, 'DEFEATED!', true, '#e5c07b');
    window.gainExp(target.expValue || 35);
    dropMonsterLoot(target.x, target.y, target.type === 'boss');

    if (target.type === 'boss' && player.classSpec === 'Novice') {
      document.getElementById('btn-ascend-trigger')?.classList.remove('hidden');
    }
  }
}

// Ailment Helper Applications
export function applyIgnite(target, dotPerSec) {
  target.igniteTimer = 3.5;
  target.igniteDmg = dotPerSec;
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

  // 2. Freeze (Stunned)
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
    target.isAlive = false;
    target.life = 0;
    window.gainExp(target.expValue || 35);
    dropMonsterLoot(target.x, target.y, target.type === 'boss');
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

// 1. HEAVY SLASH (With Wind Blade & Rend Morphs)
export function castSlash() {
  const s = SKILLS.slash;
  if (player.cooldowns.slash > 0) return;
  player.cooldowns.slash = Math.max(0.18, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

  const angle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
  const reach = s.baseReach + (s.level - 1) * s.reachPerLvl + (player.classSpec === 'Vanguard' ? 20 : 0);
  const slashX = player.x + Math.cos(angle) * 40;
  const slashY = player.y + Math.sin(angle) * 40;
  const dmg = s.baseDmg + (s.level - 1) * s.dmgPerLvl + (player.classSpec === 'Vanguard' ? 35 : 0);

  monsters.forEach(m => {
    if (m.isAlive && Math.hypot(m.x - slashX, m.y - slashY) < reach) dealDamage(m, dmg, 20, 0, 0, 0);
  });

  trainingDummies.forEach(d => {
    if (Math.hypot(d.x - slashX, d.y - slashY) < reach) dealDamage(d, dmg, 20, 0, 0, 0);
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
      color: isNodeAllocated('slash', 'sl_morph_wave') ? '#00f2fe' : (player.classSpec === 'ShadowRogue' ? '#c678dd' : '#e5c07b'),
      life: 0.22,
      maxLife: 0.22,
      size: 4
    });
  }
}

// 2. PYRO FIREBALL (With GMP Support & Nova Cataclysm Morph)
export function castFireball() {
  const s = SKILLS.fireball;
  if (player.cooldowns.fireball > 0 || player.mana < s.manaCost) return;
  player.mana -= s.manaCost;
  player.cooldowns.fireball = Math.max(0.4, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

  const baseAngle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
  const dmg = s.baseDmg + (s.level - 1) * s.dmgPerLvl + (player.classSpec === 'Arcanist' ? 40 : 0);
  const radius = s.baseRadius + (s.level - 1) * s.radiusPerLvl;

  const hasNova = isNodeAllocated('fireball', 'fb_morph_nova');
  const hasGmp = skillSocketBoard.fireball?.supports.includes('support_gmp');

  if (hasNova) {
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      projectiles.push({
        x: player.x,
        y: player.y - 10,
        vx: Math.cos(a) * 440,
        vy: Math.sin(a) * 440,
        type: 'fireball',
        damage: Math.round(dmg * 0.7),
        radius: radius,
        life: 1.2
      });
    }
  } else if (hasGmp) {
    [-0.22, 0, 0.22].forEach(offset => {
      projectiles.push({
        x: player.x,
        y: player.y - 10,
        vx: Math.cos(baseAngle + offset) * 480,
        vy: Math.sin(baseAngle + offset) * 480,
        type: 'fireball',
        damage: Math.round(dmg * 0.85),
        radius: radius,
        life: 1.5
      });
    });
  } else {
    projectiles.push({
      x: player.x,
      y: player.y - 10,
      vx: Math.cos(baseAngle) * 480,
      vy: Math.sin(baseAngle) * 480,
      type: 'fireball',
      damage: dmg,
      radius: radius,
      life: 1.6
    });
  }
}

// 3. FROST NOVA (With Frost Shield & Glacial Vortex Morph)
export function castFrostNova() {
  const s = SKILLS.frost;
  if (player.cooldowns.frost > 0 || player.mana < s.manaCost) return;
  player.mana -= s.manaCost;
  player.cooldowns.frost = Math.max(1.0, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

  const novaRadius = s.baseRadius + (s.level - 1) * s.radiusPerLvl + (player.classSpec === 'Arcanist' ? 40 : 0);
  const dmg = s.baseDmg + (s.level - 1) * s.dmgPerLvl;

  let hitsCount = 0;
  monsters.forEach(m => {
    if (m.isAlive && Math.hypot(m.x - player.x, m.y - player.y) <= novaRadius) {
      dealDamage(m, 15, 0, dmg, 0, 0);
      hitsCount++;

      if (isNodeAllocated('frost', 'fr_morph_vortex')) {
        const pullAngle = Math.atan2(player.y - m.y, player.x - m.x);
        m.x += Math.cos(pullAngle) * 120;
        m.y += Math.sin(pullAngle) * 120;
      }
    }
  });

  trainingDummies.forEach(d => {
    if (Math.hypot(d.x - player.x, d.y - player.y) <= novaRadius) dealDamage(d, 15, 0, dmg, 0, 0);
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
  player.cooldowns.meteor = Math.max(2.0, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

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
      const dmg = s.baseDmg + (s.level - 1) * s.dmgPerLvl;

      monsters.forEach(m => {
        if (m.isAlive && Math.hypot(m.x - x, m.y - y) <= radius) dealDamage(m, 50, dmg, 0, 0, 30);
      });

      trainingDummies.forEach(d => {
        if (Math.hypot(d.x - x, d.y - y) <= radius) dealDamage(d, 50, dmg, 0, 0, 30);
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
  player.x += dx * dist;
  player.y += dy * dist;

  for (let i = 0; i < 8; i++) {
    particles.push({
      x: player.x - dx * (i * 20),
      y: player.y - dy * (i * 20),
      vx: 0,
      vy: 0,
      color: 'rgba(255, 255, 255, 0.4)',
      life: 0.25,
      maxLife: 0.25,
      size: 16
    });
  }
}
