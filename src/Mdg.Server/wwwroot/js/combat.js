/**
 * Combat Calculations, Ailments (Ignite, Freeze, Bleed, Shock), Support Gems & Keystone Morphs
 */

import { player, monsters, trainingDummies, projectiles, particles, floatingTexts, groundLoot, mouse } from './state.js';
import { SKILLS, skillSocketBoard, isNodeAllocated, isSkillUnlocked } from './data/skills.js';
import { generateLootItem } from './data/items.js';
import { AudioEngine } from './audio.js';
import { showDefeatModal } from './ui/defeat-ui.js';
import { ApiClient } from './services/api-client.js';
import { MONSTERS, MONSTER_FAMILIES, getMonsterDiscoveryProfile } from './data/monsters.js';

export const PROFICIENCY_THRESHOLDS = [
  { rank: 'F', exp: 0, title: 'Novice Practitioner (F)', bonusDmg: 0 },
  { rank: 'E', exp: 100, title: 'Adept Adept (E)', bonusDmg: 5 },
  { rank: 'D', exp: 350, title: 'Hardened Combatant (D)', bonusDmg: 10 },
  { rank: 'C', exp: 900, title: 'Skilled Specialist (C)', bonusDmg: 18 },
  { rank: 'B', exp: 2200, title: 'Master Virtuoso (B)', bonusDmg: 28 },
  { rank: 'A', exp: 5000, title: 'Grandmaster Ascendant (A)', bonusDmg: 40 },
  { rank: 'S', exp: 12000, title: '👑 S-Rank Calamity (S)', bonusDmg: 60 },
  { rank: 'SSS', exp: 30000, title: '🌟 SSS-Rank Monarch (SSS)', bonusDmg: 85 },
  { rank: 'Mythic', exp: 80000, title: '✨ Primordial Mythic Awakening', bonusDmg: 120 }
];

export function recordSkillProficiency(skillKey, gain = 10) {
  if (!player.skillProficiencies) player.skillProficiencies = {};
  if (!player.skillProficiencies[skillKey]) {
    player.skillProficiencies[skillKey] = { exp: 0, rank: 'F', rankName: 'Novice Practitioner (F)' };
  }
  const prof = player.skillProficiencies[skillKey];
  const oldRank = prof.rank;
  prof.exp += gain;

  let currentTier = PROFICIENCY_THRESHOLDS[0];
  for (let i = PROFICIENCY_THRESHOLDS.length - 1; i >= 0; i--) {
    if (prof.exp >= PROFICIENCY_THRESHOLDS[i].exp) {
      currentTier = PROFICIENCY_THRESHOLDS[i];
      break;
    }
  }

  prof.rank = currentTier.rank;
  prof.rankName = currentTier.title;
  prof.bonusDmg = currentTier.bonusDmg;

  if (prof.rank !== oldRank) {
    AudioEngine.playLevelUp?.();
    spawnDamageNumber(player.x, player.y - 75, `🌟 PROFICIENCY RANK UP: ${skillKey.toUpperCase()} -> [${prof.rank}]!`, true, '#ffd700');
  }
}

export function getMonsterLoreBonus(monsterType, isBoss = false) {
  const kills = (player.monsterKills && player.monsterKills[monsterType]) || 0;
  const profile = getMonsterDiscoveryProfile(monsterType, kills, isBoss);
  return {
    tier: profile.rank,
    name: profile.title,
    bonusDmg: profile.bonusDmg / 100,
    bonusCrit: profile.bonusCrit,
    bonusCritMulti: profile.bonusCrit * 2,
    iir: profile.bonusIir,
    iiq: profile.bonusIiq,
    dmgReduction: profile.dmgReduction
  };
}

export function dealDamage(target, rawPhysical, rawFire, rawCold, rawLightning, rawChaos, canCrit = true, sourcePos = null, isSlash = false, isProc = false) {
  if (!target || !target.isAlive || target.defeatedHandled) return;

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

  // Active Shrine Buff: Tempest Aura Chain Lightning Proc
  if (!isProc && player.activeBuffs && player.activeBuffs.some(b => b.buffType === 'TempestAura')) {
    monsters.forEach(otherM => {
      if (otherM !== target && otherM.isAlive && Math.hypot(otherM.x - target.x, otherM.y - target.y) < 140) {
        dealDamage(otherM, 0, 0, 0, 85, 0, false, { x: target.x, y: target.y }, false, true);
        particles.push({
          x: (target.x + otherM.x) / 2,
          y: (target.y + otherM.y) / 2,
          vx: 0,
          vy: 0,
          color: '#00f2fe',
          life: 0.2,
          maxLife: 0.2,
          size: 6
        });
      }
    });
  }

  // Active Shrine Buff: Abyssal Leech
  if (!isProc && player.activeBuffs && player.activeBuffs.some(b => b.buffType === 'AbyssalLeech')) {
    const healAmount = Math.min(25, Math.round((rawPhysical + rawChaos) * 0.15));
    if (healAmount > 0) {
      player.life = Math.min(player.maxLife, player.life + healAmount);
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
  if (canCrit && !isProc && Math.random() * 100 <= effectiveCritChance) {
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

  // Ailment Proc Chances (only for direct attacks, not recursive procs)
  if (!isProc) {
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

  // ONLY PRIMARY HITS TRIGGER SECONDARY PROCS (Prevents Infinite Recursion / Freeze)
  if (!isProc) {
    // Set Synergy: Ignis Raining Mini-Meteors on Attack (35% chance)
    if ((player.activeHiddenSynergies || []).includes('raining_mini_meteors') && Math.random() < 0.35) {
      spawnDamageNumber(target.x, target.y - 65, '☄️ MINI METEOR!', true, '#ff5722');
      dealDamage(target, 0, 160, 0, 0, 0, false, { x: target.x, y: target.y - 120 }, false, true);
      for (let i = 0; i < 12; i++) {
        particles.push({
          x: target.x,
          y: target.y,
          vx: (Math.random() - 0.5) * 160,
          vy: (Math.random() - 0.5) * 160,
          color: '#ff5722',
          life: 0.35,
          maxLife: 0.35,
          size: 5
        });
      }
    }

    // Devotion Proc: Phoenix Firestorm on Crit
    if (isCrit && player.allocatedDevotionNodes && player.allocatedDevotionNodes.includes('ph_proc')) {
      spawnDamageNumber(target.x, target.y - 65, '🔥 PHOENIX FIRESTORM!', true, '#ff7700');
      monsters.forEach(m => {
        if (m !== target && m.isAlive && Math.hypot(m.x - target.x, m.y - target.y) <= 150) {
          dealDamage(m, 0, 180, 0, 0, 0, false, { x: target.x, y: target.y }, false, true);
        }
      });
      for (let i = 0; i < 15; i++) {
        particles.push({
          x: target.x + (Math.random() - 0.5) * 40,
          y: target.y + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 120,
          vy: -80 - Math.random() * 100,
          color: '#ff5722',
          life: 0.5,
          maxLife: 0.5,
          size: 4
        });
      }
    }

    // Devotion Proc: Chain Lightning on Hit (25% chance)
    if (player.allocatedDevotionNodes && player.allocatedDevotionNodes.includes('tl_proc') && Math.random() < 0.25) {
      spawnDamageNumber(target.x, target.y - 50, '⚡ CHAIN LIGHTNING!', true, '#ffd700');
      let chained = 0;
      monsters.forEach(m => {
        if (m !== target && m.isAlive && chained < 3 && Math.hypot(m.x - target.x, m.y - target.y) <= 220) {
          dealDamage(m, 0, 0, 0, 140, 0, false, { x: target.x, y: target.y }, false, true);
          chained++;
        }
      });
    }

    // Devotion Proc: Glacial Barrier on Low Life (< 35% HP)
    if (player.life > 0 && player.life < player.maxLife * 0.35 && player.allocatedDevotionNodes && player.allocatedDevotionNodes.includes('fw_proc')) {
      if (!player.glacialBarrierCooldown) {
        player.glacialBarrierCooldown = true;
        player.es = Math.min(player.maxEs + 400, player.es + 400);
        spawnDamageNumber(player.x, player.y - 50, '❄️ GLACIAL BARRIER +400 ES!', true, '#00f2fe');
        AudioEngine.playTone(587, 'sine', 0.3, 0.2);
        setTimeout(() => { player.glacialBarrierCooldown = false; }, 15000);
      }
    }
  }

  if (target.life <= 0 && target.life < 90000 && !target.defeatedHandled) {
    handleMonsterDefeated(target);
  }
}

// Unified Monster Defeated Lifecycle Handler
export function handleMonsterDefeated(target) {
  if (!target || target.defeatedHandled) return;
  target.defeatedHandled = true;
  target.isAlive = false;
  target.life = 0;
  spawnDamageNumber(target.x, target.y - 50, 'DEFEATED!', true, '#e5c07b');

  // Devotion Proc: Void Siphon on Kill (Heal 10% HP & ES)
  if (player.allocatedDevotionNodes && player.allocatedDevotionNodes.includes('vr_proc')) {
    const healHp = Math.round(player.maxLife * 0.10);
    const healEs = Math.round(player.maxEs * 0.10);
    player.life = Math.min(player.maxLife, player.life + healHp);
    player.es = Math.min(player.maxEs, player.es + healEs);
    spawnDamageNumber(player.x, player.y - 65, `☠️ VOID SIPHON +${healHp} HP`, false, '#c678dd');
  }

  // Keystone / Node: Ice Shatter
  if ((target.freezeTimer > 0 || target.chillTimer > 0) && isNodeAllocated('frost', 'fr_shatter')) {
    monsters.forEach(m => {
      if (m !== target && m.isAlive && Math.hypot(m.x - target.x, m.y - target.y) <= 120) {
        dealDamage(m, 0, 0, 120, 0, 0, false, { x: target.x, y: target.y }, false, true);
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

  // Set Synergy: Vael Permafrost Shatter (8 Ice Shards detonation)
  if ((player.activeHiddenSynergies || []).includes('ice_shards_shatter')) {
    spawnDamageNumber(target.x, target.y - 65, '❄️ PERMAFROST SHATTER!', true, '#00f2fe');
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      projectiles.push({
        x: target.x,
        y: target.y,
        vx: Math.cos(a) * 350,
        vy: Math.sin(a) * 350,
        type: 'frost',
        damage: 95,
        radius: 16,
        life: 0.6
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
    spawnDamageNumber(target.x, target.y - 70, `📖 DISCOVERY UNLOCKED: ${newLore.name}!`, true, '#ffd700');
    
    // Award Family Mastery Point if Apex reached
    if (newLore.tier === 4) {
      const mDef = MONSTERS[mType];
      const fam = mDef?.family || 'Beast';
      if (!player.familyMasteryPoints) player.familyMasteryPoints = {};
      player.familyMasteryPoints[fam] = (player.familyMasteryPoints[fam] || 0) + 1;
      spawnDamageNumber(target.x, target.y - 100, `🌟 +1 ${fam} Mastery Point Earned!`, true, '#00f2fe');
    }
  }

  if (window.gainExp) window.gainExp(target.expValue || 35);
  dropMonsterLoot(target.x, target.y, target.type === 'boss' || target.isBoss, target.rarity || (target.type === 'boss' ? 'boss' : 'normal'), mType);

  if (target.type === 'boss' && player.classSpec === 'Novice') {
    document.getElementById('btn-ascend-trigger')?.classList.remove('hidden');
  }
}

export async function dropMonsterLoot(x, y, isBoss, monsterRarity = 'normal', monsterType = 'monster') {
  const zoneId = window.currentZoneId || player.zoneId || 'SanctuaryHaven';
  let monsterLevel = player.level || 1;
  if (zoneId === 'WhisperingPlains') monsterLevel = 10;
  else if (zoneId === 'ForgottenCrypt') monsterLevel = 22;
  else if (zoneId === 'FrostpeakTundra') monsterLevel = 28;
  else if (zoneId === 'StormpeakRidge') monsterLevel = 36;
  else if (zoneId === 'MoltenCaldera') monsterLevel = 42;
  else if (zoneId === 'VoidAbyss') monsterLevel = 60;
  else if (zoneId === 'ArenaCaldera') monsterLevel = 78;
  else if (zoneId === 'ArenaGlacial') monsterLevel = 80;
  else if (zoneId === 'ArenaVoid') monsterLevel = 84;

  const lore = getMonsterLoreBonus(monsterType, isBoss);
  const playerIir = (player.iir || 0) + (lore.iir || 0);
  const playerIiq = (player.iiq || 0) + (lore.iiq || 0);

  // Server-Authoritative Drop Generation (Using monsterType, MasteryRank & Kills)
  const kills = (player.monsterKills && player.monsterKills[monsterType]) || 0;
  const profile = getMonsterDiscoveryProfile(monsterType, kills, isBoss);

  const serverResult = await ApiClient.generateMonsterLoot(
    monsterType,
    monsterRarity,
    isBoss,
    monsterLevel,
    zoneId,
    playerIir,
    playerIiq,
    profile.rank,
    kills
  );

  let itemsToDrop = [];

  if (serverResult && Array.isArray(serverResult.items)) {
    itemsToDrop = serverResult.items;
  } else {
    // Local fallback if server unreachable
    const isChampion = monsterRarity === 'champion' || monsterRarity === 'magic';
    const isRare = monsterRarity === 'rare';
    let dropCount = isBoss ? (Math.floor(Math.random() * 4) + 3) : isRare ? (Math.floor(Math.random() * 2) + 1) : isChampion ? 1 : (Math.random() < 0.18 ? 1 : 0);
    for (let i = 0; i < dropCount; i++) {
      itemsToDrop.push(generateLootItem(monsterLevel, isBoss, monsterRarity));
    }
  }

  // Animate items spawning with physics onto groundLoot
  for (const item of itemsToDrop) {
    const dropAngle = Math.random() * Math.PI * 2;
    const dropDistance = 40 + Math.random() * 80;

    let beamHeight = item.beamHeight || 0;
    if (!beamHeight) {
      if (item.rarity === 'Unique' || item.rarity === 'Set' || item.rarity === 'Gem' || item.rarity === 'SkillGem') {
        beamHeight = 350;
      } else if (item.rarity === 'Rare' || item.rarity === 'Currency' || item.rarity === 'Consumable') {
        beamHeight = 240;
      }
    }

    groundLoot.push({
      id: item.id || Math.random().toString(36).substring(2, 9),
      x: x,
      y: y,
      targetX: x + Math.cos(dropAngle) * dropDistance,
      targetY: y + Math.sin(dropAngle) * dropDistance,
      item: item,
      bounceTimer: 0.5,
      beamHeight: beamHeight
    });

    AudioEngine.playLootDrop(item.rarity);
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
  if (player.isDead) return;
  const s = SKILLS.slash;
  if (player.cooldowns.slash > 0) return;
  player.cooldowns.slash = Math.max(0.32, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);
  recordSkillProficiency('slash', 10);

  const angle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
  if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
    player.facing = Math.cos(angle) > 0 ? 'right' : 'left';
  } else {
    player.facing = Math.sin(angle) > 0 ? 'down' : 'up';
  }
  player.isAttacking = true;
  player.attackTimer = 0.24;

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
      vx: Math.cos(angle) * 380,
      vy: Math.sin(angle) * 380,
      type: 'windblade',
      damage: Math.round(dmg * 0.85),
      radius: 20,
      life: 0.9
    });
  }

  // Set Synergy: Vanguard Triple Holy Blade Waves
  if ((player.activeHiddenSynergies || []).includes('holy_blade_waves')) {
    [-0.22, 0, 0.22].forEach(offset => {
      projectiles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle + offset) * 400,
        vy: Math.sin(angle + offset) * 400,
        type: 'windblade',
        damage: Math.round(dmg * 1.15),
        radius: 24,
        life: 0.95
      });
    });
    spawnDamageNumber(player.x, player.y - 60, '⚔️ TRIPLE HOLY BLADE WAVES!', true, '#00e676');
    AudioEngine.playTone(880, 'sine', 0.18, 0.12);
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
  if (player.isDead) return;
  if (!isSkillUnlocked('fireball')) {
    spawnDamageNumber(player.x, player.y - 45, '🔒 Pyro Fireball Not Socketed!', false, '#a0a8b7');
    AudioEngine.playTone(200, 'square', 0.1, 0.08);
    return;
  }
  const s = SKILLS.fireball;
  if (player.cooldowns.fireball > 0 || player.mana < s.manaCost) return;
  player.mana -= s.manaCost;
  player.cooldowns.fireball = Math.max(0.4, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);
  recordSkillProficiency('fireball', 12);

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
        vx: Math.cos(a) * 330 * speedMult,
        vy: Math.sin(a) * 330 * speedMult,
        type: 'fireball',
        damage: Math.round(dmg * 0.7),
        fireDmg: isHellfireChaos ? Math.round(dmg * 0.35) : Math.round(dmg * 0.7),
        chaosDmg: isHellfireChaos ? Math.round(dmg * 0.35) : 0,
        radius: radius,
        life: 1.4
      });
    }
  } else if (hasGmp) {
    [-0.22, 0, 0.22].forEach(offset => {
      projectiles.push({
        x: player.x,
        y: player.y - 10,
        vx: Math.cos(baseAngle + offset) * 360 * speedMult,
        vy: Math.sin(baseAngle + offset) * 360 * speedMult,
        type: 'fireball',
        damage: Math.round(dmg * 0.85),
        fireDmg: isHellfireChaos ? Math.round(fireDmg * 0.85) : Math.round(dmg * 0.85),
        chaosDmg: isHellfireChaos ? Math.round(chaosDmg * 0.85) : 0,
        radius: radius,
        life: 1.7
      });
    });
  } else {
    projectiles.push({
      x: player.x,
      y: player.y - 10,
      vx: Math.cos(baseAngle) * 360 * speedMult,
      vy: Math.sin(baseAngle) * 360 * speedMult,
      type: 'fireball',
      damage: dmg,
      fireDmg: fireDmg,
      chaosDmg: chaosDmg,
      radius: radius,
      life: 1.8
    });
  }
}

// 3. FROST NOVA (With Frost Shield, Ice Shatter & Glacial Vortex Morph)
export function castFrostNova() {
  if (player.isDead) return;
  if (!isSkillUnlocked('frost')) {
    spawnDamageNumber(player.x, player.y - 45, '🔒 Frost Nova Not Socketed!', false, '#a0a8b7');
    AudioEngine.playTone(200, 'square', 0.1, 0.08);
    return;
  }
  const s = SKILLS.frost;
  if (player.cooldowns.frost > 0 || player.mana < s.manaCost) return;
  player.mana -= s.manaCost;
  player.cooldowns.frost = Math.max(1.0, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);
  recordSkillProficiency('frost', 14);

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
  if (player.isDead) return;
  if (!isSkillUnlocked('meteor')) {
    spawnDamageNumber(player.x, player.y - 45, '🔒 Meteor Not Socketed!', false, '#a0a8b7');
    AudioEngine.playTone(200, 'square', 0.1, 0.08);
    return;
  }
  const s = SKILLS.meteor;
  if (player.cooldowns.meteor > 0 || player.mana < s.manaCost) return;
  player.mana -= s.manaCost;
  const cdReduction = isNodeAllocated('meteor', 'met_cd') ? 1.0 : 0;
  player.cooldowns.meteor = Math.max(1.0, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl - cdReduction);
  recordSkillProficiency('meteor', 20);

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

      // Set Synergy: Malakor Cosmic Singularity Void Rift
      if ((player.activeHiddenSynergies || []).includes('cosmic_singularity')) {
        spawnDamageNumber(x, y - 60, '🌌 VOID SINGULARITY!', true, '#c678dd');
        monsters.forEach(m => {
          if (m.isAlive && Math.hypot(m.x - x, m.y - y) <= 220) {
            const pullAngle = Math.atan2(y - m.y, x - m.x);
            m.vx = (m.vx || 0) + Math.cos(pullAngle) * 380;
            m.vy = (m.vy || 0) + Math.sin(pullAngle) * 380;
            dealDamage(m, 0, 0, 0, 0, 180, false, { x, y }, false, true);
          }
        });
      }

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
  if (player.isDead) return;
  const s = SKILLS.dash;
  if (player.cooldowns.dash > 0) return;
  player.cooldowns.dash = Math.max(0.4, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);
  recordSkillProficiency('dash', 8);

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

// 6. DEAL DAMAGE TO PLAYER (With Armor, Block, Resistances & Energy Shield)
export function dealDamageToPlayer(monster) {
  if (!monster || !monster.isAlive || player.isDead || (player.invulnerableTimer && player.invulnerableTimer > 0)) return;

  // 1. Player Evasion Check
  const pEvasion = player.evasionChance || 15;
  if (Math.random() * 100 < pEvasion) {
    spawnDamageNumber(player.x, player.y - 45, 'DODGED!', false, '#a0a8b7');
    AudioEngine.playTone(320, 'sine', 0.08, 0.05);
    return;
  }

  // 2. Player Shield Block Check (75% Damage Mitigation)
  let blockMult = 1.0;
  const pBlock = player.blockChance || 0;
  if (pBlock > 0 && Math.random() * 100 < pBlock) {
    blockMult = 0.25;
    spawnDamageNumber(player.x, player.y - 45, '🛡️ BLOCKED!', true, '#ffd700');
    AudioEngine.playTone(160, 'square', 0.15, 0.12);
  }

  // 3. Raw Damage Calculation & Defense Mitigations (Scaled Difficulty)
  const lore = getMonsterLoreBonus(monster.type || 'monster', monster.isBoss || monster.type === 'boss');
  const rawAttack = (monster.attackDmg || 32) * 1.55; // +55% difficulty baseline
  let familyMitigation = (lore.dmgReduction || 0) / 100;

  // Family Mastery Talents Check
  const mDef = MONSTERS[monster.type];
  const fam = mDef?.family;
  if (fam && player.allocatedFamilyTalents?.[fam]) {
    const talents = player.allocatedFamilyTalents[fam];
    if (talents.includes('beast_t3') || talents.includes('undead_t3') || talents.includes('fiend_t3')) {
      familyMitigation += 0.20; // -20% extra damage taken from this family
    }
  }

  const baseDmg = rawAttack * (1 - Math.min(0.60, familyMitigation)) * blockMult;
  let finalDmg = 0;

  if (monster.dmgType === 'fire') {
    finalDmg = baseDmg * (1 - (player.fireRes || 0) / 100);
  } else if (monster.dmgType === 'cold') {
    finalDmg = baseDmg * (1 - (player.coldRes || 0) / 100);
    if (Math.random() < 0.25) applyChill(player, 1.5);
  } else if (monster.dmgType === 'lightning') {
    finalDmg = baseDmg * (1 - (player.lightningRes || player.lightRes || 0) / 100);
  } else if (monster.dmgType === 'chaos') {
    finalDmg = baseDmg * (1 - (player.chaosRes || 0) / 100);
  } else {
    // Physical Armor Mitigation
    const pArmor = player.armor || 60;
    const physMitigation = Math.min(0.85, pArmor / (pArmor + 5 * baseDmg));
    finalDmg = baseDmg * (1 - physMitigation);
  }

  const totalDmg = Math.max(1, Math.round(finalDmg));

  // 4. Energy Shield Absorption First
  if (player.es > 0) {
    if (player.es >= totalDmg) {
      player.es -= totalDmg;
    } else {
      const remainingDmg = totalDmg - player.es;
      player.es = 0;
      player.life = Math.max(0, player.life - remainingDmg);
    }
  } else {
    player.life = Math.max(0, player.life - totalDmg);
  }

  // Visual Hit & Sound
  AudioEngine.playHit(false);
  const dmgColor = monster.dmgType === 'fire' ? '#ff7849' : (monster.dmgType === 'cold' ? '#4facfe' : (monster.dmgType === 'chaos' ? '#c678dd' : '#ff4d4f'));
  spawnDamageNumber(player.x, player.y - 35, `-${totalDmg}`, false, dmgColor);

  // Blood / Impact Particles
  for (let i = 0; i < 6; i++) {
    particles.push({
      x: player.x,
      y: player.y - 10,
      vx: (Math.random() - 0.5) * 140,
      vy: (Math.random() - 0.5) * 140,
      color: '#ff4d4f',
      life: 0.25,
      maxLife: 0.25,
      size: 3
    });
  }

  // 5. Player Defeated / Death Handler
  if (player.life <= 0) {
    handlePlayerDefeated();
  }
}

export function handlePlayerDefeated() {
  if (player.isDead) return;
  player.isDead = true;
  player.life = 0;
  spawnDamageNumber(player.x, player.y - 60, '☠️ YOU ARE DEFEATED!', true, '#e06c75');
  AudioEngine.playTone(110, 'sawtooth', 0.6, 0.4);

  // Show defeat popup modal with 2 resurrection options
  setTimeout(() => {
    showDefeatModal();
  }, 650);
}
