/**
 * Combat Calculations, Damage Formulas & Skill Execution
 */

import { player, monsters, trainingDummies, projectiles, particles, floatingTexts, mouse } from './state.js';
import { SKILLS } from './data/skills.js';
import { AudioEngine } from './audio.js';
import { addSkillExp } from './ui/skills-ui.js';
import { dropMonsterLoot } from './main.js';

export function dealDamage(target, rawPhysical, rawFire, rawCold, rawLightning, rawChaos, canCrit = true) {
  if (!target.isAlive) return;

  let isCrit = false;
  let multiplier = 1.0;
  if (canCrit && Math.random() * 100 <= player.critChance) {
    isCrit = true;
    multiplier = player.critMulti / 100;
  }

  const physDmg = rawPhysical * multiplier;
  let physMitigation = 0;
  if (target.armor > 0 && physDmg > 0) {
    physMitigation = Math.min(0.9, target.armor / (target.armor + 5 * physDmg));
  }
  const finalPhys = physDmg * (1 - physMitigation);
  const finalFire = (rawFire * multiplier) * (1 - (target.fireRes || 0) / 100);
  const finalCold = (rawCold * multiplier) * (1 - (target.coldRes || 0) / 100);
  const totalDamage = Math.max(1, Math.round(finalPhys + finalFire + finalCold));

  if (target.life < 90000) target.life -= totalDamage;
  target.hurtTimer = 0.25;

  AudioEngine.playHit(isCrit);
  const color = isCrit ? '#ffd700' : (rawFire > 0 ? '#ff7849' : (rawCold > 0 ? '#4facfe' : '#ffffff'));
  spawnDamageNumber(target.x, target.y - 30 * (target.scale || 1), totalDamage, isCrit, color);

  for (let i = 0; i < (isCrit ? 12 : 6); i++) {
    particles.push({
      x: target.x,
      y: target.y - 10,
      vx: (Math.random() - 0.5) * 200,
      vy: (Math.random() - 0.5) * 200,
      color: rawFire > 0 ? '#ff5722' : '#00f2fe',
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

  for (let i = 0; i < 12; i++) {
    const spread = angle + (Math.random() - 0.5) * 1.4;
    particles.push({
      x: player.x + Math.cos(spread) * 30,
      y: player.y + Math.sin(spread) * 30,
      vx: Math.cos(spread) * 160,
      vy: Math.sin(spread) * 160,
      color: player.classSpec === 'ShadowRogue' ? '#c678dd' : '#e5c07b',
      life: 0.22,
      maxLife: 0.22,
      size: 4
    });
  }
}

export function castFireball() {
  const s = SKILLS.fireball;
  if (player.cooldowns.fireball > 0 || player.mana < s.manaCost) return;
  player.mana -= s.manaCost;
  player.cooldowns.fireball = Math.max(0.4, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

  const angle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
  projectiles.push({
    x: player.x,
    y: player.y - 10,
    vx: Math.cos(angle) * 480,
    vy: Math.sin(angle) * 480,
    type: 'fireball',
    damage: s.baseDmg + (s.level - 1) * s.dmgPerLvl + (player.classSpec === 'Arcanist' ? 40 : 0),
    radius: s.baseRadius + (s.level - 1) * s.radiusPerLvl,
    life: 1.6
  });
}

export function castFrostNova() {
  const s = SKILLS.frost;
  if (player.cooldowns.frost > 0 || player.mana < s.manaCost) return;
  player.mana -= s.manaCost;
  player.cooldowns.frost = Math.max(1.0, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

  const novaRadius = s.baseRadius + (s.level - 1) * s.radiusPerLvl + (player.classSpec === 'Arcanist' ? 40 : 0);
  const dmg = s.baseDmg + (s.level - 1) * s.dmgPerLvl;

  monsters.forEach(m => {
    if (m.isAlive && Math.hypot(m.x - player.x, m.y - player.y) <= novaRadius) dealDamage(m, 15, 0, dmg, 0, 0);
  });

  trainingDummies.forEach(d => {
    if (Math.hypot(d.x - player.x, d.y - player.y) <= novaRadius) dealDamage(d, 15, 0, dmg, 0, 0);
  });

  for (let a = 0; a < Math.PI * 2; a += 0.25) {
    particles.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(a) * 260,
      vy: Math.sin(a) * 260,
      color: '#00f2fe',
      life: 0.45,
      maxLife: 0.45,
      size: 6
    });
  }
}

export function castMeteor() {
  const s = SKILLS.meteor;
  if (player.cooldowns.meteor > 0 || player.mana < s.manaCost) return;
  player.mana -= s.manaCost;
  player.cooldowns.meteor = Math.max(2.0, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

  const targetX = mouse.worldX;
  const targetY = mouse.worldY;

  particles.push({
    x: targetX,
    y: targetY,
    vx: 0,
    vy: 0,
    color: 'rgba(255, 65, 108, 0.45)',
    life: 0.45,
    maxLife: 0.45,
    size: 50,
    isRing: true
  });

  setTimeout(() => {
    const radius = s.baseRadius + (s.level - 1) * s.radiusPerLvl + (player.classSpec === 'Arcanist' ? 40 : 0);
    const dmg = s.baseDmg + (s.level - 1) * s.dmgPerLvl;

    monsters.forEach(m => {
      if (m.isAlive && Math.hypot(m.x - targetX, m.y - targetY) <= radius) dealDamage(m, 50, dmg, 0, 0, 30);
    });

    trainingDummies.forEach(d => {
      if (Math.hypot(d.x - targetX, d.y - targetY) <= radius) dealDamage(d, 50, dmg, 0, 0, 30);
    });

    for (let i = 0; i < 45; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 260;
      particles.push({
        x: targetX,
        y: targetY,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        color: Math.random() > 0.3 ? '#ff3b00' : '#ffd700',
        life: 0.65,
        maxLife: 0.65,
        size: 6 + Math.random() * 6
      });
    }
  }, 420);
}

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
