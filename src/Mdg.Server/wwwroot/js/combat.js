/**
 * Combat Calculations, Ailments (Ignite, Freeze, Bleed, Shock), Support Gems & Keystone Morphs
 */

import { player, monsters, trainingDummies, projectiles, particles, floatingTexts, groundLoot, mouse } from './state.js';
import { SKILLS, skillSocketBoard, isNodeAllocated, isSkillUnlocked } from './data/skills.js';
import { generateLootItem, AWAKENING_ESSENCES } from './data/items.js';
import { AudioEngine } from './audio.js';
import { showDefeatModal } from './ui/defeat-ui.js';
import { ApiClient } from './services/api-client.js';
import { MONSTERS, MONSTER_FAMILIES, getMonsterDiscoveryProfile } from './data/monsters.js';
import { addSkillExp } from './ui/skills-ui.js';
import { addFlaskCharges } from './systems/flask-system.js';
import { spawnExtractableCorpse } from './systems/shadow-extraction.js';
import { handleMonsterSkinningDrop } from './systems/gathering-system.js';

export const PROFICIENCY_THRESHOLDS = [
  { rank: 'F', exp: 0, title: 'Novice Practitioner (F)', bonusDmg: 0 },
  { rank: 'E', exp: 500, title: 'Adept Adept (E)', bonusDmg: 6 },
  { rank: 'D', exp: 2000, title: 'Hardened Combatant (D)', bonusDmg: 14 },
  { rank: 'C', exp: 8000, title: 'Skilled Specialist (C)', bonusDmg: 25 },
  { rank: 'B', exp: 25000, title: 'Master Virtuoso (B)', bonusDmg: 40 },
  { rank: 'A', exp: 75000, title: 'Grandmaster Ascendant (A - Awakened Eligible)', bonusDmg: 65 },
  { rank: 'S', exp: 200000, title: '👑 S-Rank Calamity (S)', bonusDmg: 95 },
  { rank: 'SSS', exp: 600000, title: '🌟 SSS-Rank Monarch (SSS)', bonusDmg: 135 },
  { rank: 'Mythic', exp: 1800000, title: '✨ Primordial Mythic Awakening', bonusDmg: 180 }
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

export function dealDamage(target, rawPhysical, rawFire, rawCold, rawLightning, rawChaos, canCrit = true, sourcePos = null, isSlash = false, isProc = false, skillSource = null) {
  if (!target || !target.isAlive || target.defeatedHandled) return;

  // Award Skill EXP & Proficiency ONLY when landing a successful hit on a target!
  if (skillSource && !isProc) {
    const expMap = { slash: 12, fireball: 15, frost: 15, meteor: 25, dash: 10 };
    const expGain = expMap[skillSource] || 10;
    addSkillExp(skillSource, expGain);
    recordSkillProficiency(skillSource, expGain);
  }

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

  // Active Shrine Blessing: Cataclysmic Might (+60% damage, +35% Crit, +75% Multi)
  const hasMightBuff = player.activeBuffs && player.activeBuffs.some(b => b.buffType === 'CataclysmicMight');
  const hasFrostBuff = player.activeBuffs && player.activeBuffs.some(b => b.buffType === 'AbsoluteFrost');

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

  // Active Shrine Buff: Absolute Frost (All attacks discharge glacial freeze)
  if (!isProc && hasFrostBuff) {
    applyFreeze(target, 1.5);
    applyChill(target, 4.0);
  }

  // Active Shrine Buff: Abyssal Leech
  if (!isProc && player.activeBuffs && player.activeBuffs.some(b => b.buffType === 'AbyssalLeech')) {
    const healAmount = Math.min(25, Math.round((rawPhysical + rawChaos) * 0.15));
    if (healAmount > 0) {
      player.life = Math.min(player.maxLife, player.life + healAmount);
    }
  }

  // Monster Lore Mastery Amplifications & Might Shrine
  const lore = getMonsterLoreBonus(target.type || 'monster', target.type === 'boss');
  let effectiveCritChance = (player.critChance || 25) + lore.bonusCrit + (hasMightBuff ? 35 : 0);
  if (isSlash && isNodeAllocated('slash', 'sl_crit')) {
    effectiveCritChance += 15; // +15% Crit chance for Slash
  }
  const effectiveCritMulti = (player.critMulti || 200) + lore.bonusCritMulti + (hasMightBuff ? 75 : 0);

  let isCrit = false;
  let multiplier = hasMightBuff ? 1.60 : 1.0;
  if (canCrit && !isProc && Math.random() * 100 <= effectiveCritChance) {
    isCrit = true;
    multiplier = (effectiveCritMulti / 100) * (hasMightBuff ? 1.60 : 1.0);
  }

  // Lore bonus extra damage against familiar monster species
  multiplier *= (1.0 + lore.bonusDmg) * blockMultiplier;

  // Shock Ailment (+30% damage multiplier)
  if (target.shockTimer > 0) {
    multiplier *= 1.30;
  }

  // Boss & Elite Stagger Resonance Window (+50% Damage)
  const isBossOrElite = target.type === 'boss' || target.isBoss || target.rarity === 'rare';
  if (isBossOrElite) {
    target.stagger = target.stagger || 0;
    target.maxStagger = target.maxStagger || 100;
    if (target.isStaggered) {
      multiplier *= 1.50; // +50% Resonance Burst Damage
    }
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

  // Accumulate Stagger Points on Bosses
  if (isBossOrElite && !target.isStaggered) {
    target.stagger = Math.min(target.maxStagger, target.stagger + Math.min(25, Math.max(3, Math.round(totalDamage * 0.08))));
    if (target.stagger >= target.maxStagger) {
      target.isStaggered = true;
      target.staggerTimer = 6.0;
      target.stagger = 0;
      spawnDamageNumber(target.x, target.y - 70, '⚡ STAGGERED! (+50% RESONANCE BURST)', true, '#ffd700');
      AudioEngine.playTone(620, 'sawtooth', 0.4, 0.2);
    }
  }

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

  // Refill potion flasks charges on kill
  addFlaskCharges(target.type === 'boss' ? 10 : (target.rarity === 'rare' ? 4 : 1));

  // Spawn Extractable Shadow Corpse (Solo Leveling Shadow Monarch)
  spawnExtractableCorpse(target);

  // Harvesting & Skinning Crafting Materials Drop from Monsters
  handleMonsterSkinningDrop(target);

  if (window.gainExp) {
    const hasFortune = player.activeBuffs && player.activeBuffs.some(b => b.buffType === 'CelestialFortune');
    const baseExp = target.expValue || 35;
    window.gainExp(hasFortune ? Math.round(baseExp * 2.0) : baseExp);
  }

  // Solar Inferno Shrine: Corpse Explosion
  if (player.activeBuffs && player.activeBuffs.some(b => b.buffType === 'SolarInferno')) {
    spawnDamageNumber(target.x, target.y - 45, '💥 SOLAR CORPSE EXPLOSION!', true, '#ff5722');
    for (let i = 0; i < 16; i++) {
      particles.push({
        x: target.x,
        y: target.y,
        vx: (Math.random() - 0.5) * 220,
        vy: (Math.random() - 0.5) * 220,
        color: '#ff7849',
        life: 0.45,
        maxLife: 0.45,
        size: 5
      });
    }
    monsters.forEach(otherM => {
      if (otherM !== target && otherM.isAlive && Math.hypot(otherM.x - target.x, otherM.y - target.y) < 140) {
        dealDamage(otherM, 0, 160, 0, 0, 0, false, { x: target.x, y: target.y }, false, true);
      }
    });
  }

  const rTier = target.rarityTier || target.rarity || (target.type === 'boss' ? 'boss' : 'normal');
  dropMonsterLoot(target.x, target.y, target.type === 'boss' || target.isBoss, rTier, mType);

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
  else if (zoneId === 'InfernalCaldera') monsterLevel = 45;
  else if (zoneId === 'AethelisCitadel') monsterLevel = 60;
  else if (zoneId === 'VoidAbyss') monsterLevel = 70;
  else if (zoneId === 'GenesisCore') monsterLevel = 90;
  else if (zoneId === 'ArenaCaldera') monsterLevel = 78;
  else if (zoneId === 'ArenaGlacial') monsterLevel = 80;
  else if (zoneId === 'ArenaVoid') monsterLevel = 84;

  const lore = getMonsterLoreBonus(monsterType, isBoss);
  const hasFortune = player.activeBuffs && player.activeBuffs.some(b => b.buffType === 'CelestialFortune');
  const playerIir = (player.iir || 0) + (lore.iir || 0) + (hasFortune ? 150 : 0);
  const playerIiq = (player.iiq || 0) + (lore.iiq || 0) + (hasFortune ? 100 : 0);

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

  if (monsterType === 'treasure_goblin') {
    spawnDamageNumber(x, y - 90, '💰 HOARDER GOBLIN SLAIN! (+1500 GOLD FOUNTAIN)', true, '#ffd700');
    AudioEngine.playLevelUp?.();
    const goblinDrops = [
      { name: 'Fracture Core', slot: 'Currency', rarity: 'Rare', color: '#ffd700', icon: '🔮' },
      { name: 'Genesis Prism', slot: 'Currency', rarity: 'Rare', color: '#f59e0b', icon: '💎' },
      { name: 'Adamantite Ingot', slot: 'Currency', rarity: 'Rare', color: '#ffd700', icon: '🪨' },
      { name: 'Mithril Chunk', slot: 'Currency', rarity: 'Uncommon', color: '#00f2fe', icon: '💎' },
      POSSIBLE_LOOT[Math.floor(Math.random() * POSSIBLE_LOOT.length)],
      POSSIBLE_LOOT[Math.floor(Math.random() * POSSIBLE_LOOT.length)],
      POSSIBLE_LOOT[Math.floor(Math.random() * POSSIBLE_LOOT.length)]
    ];
    itemsToDrop.push(...goblinDrops);
  } else if (serverResult && Array.isArray(serverResult.items)) {
    itemsToDrop = serverResult.items;
  } else {
    // Local fallback if server unreachable
    const isMutant = monsterRarity === 'mutant';
    const isChampion = monsterRarity === 'champion' || monsterRarity === 'magic' || monsterRarity === 'elite';
    const isRare = monsterRarity === 'rare';
    let dropCount = isBoss ? (Math.floor(Math.random() * 4) + 4) : isMutant ? (Math.floor(Math.random() * 3) + 2) : isRare ? (Math.floor(Math.random() * 2) + 1) : isChampion ? 1 : (Math.random() < 0.22 ? 1 : 0);
    for (let i = 0; i < dropCount; i++) {
      itemsToDrop.push(generateLootItem(monsterLevel, isBoss, monsterRarity));
    }
  }

  // Ultra-Rare Awakening Essence Drop Check (Boss: 5.0%, Mutant: 2.5%, Elite/Rare: 0.8%)
  const isMutant = monsterRarity === 'mutant';
  const isEliteOrRare = isBoss || monsterRarity === 'rare' || monsterRarity === 'champion' || monsterRarity === 'elite' || isMutant;
  const essenceDropChance = isBoss ? 0.05 : (isMutant ? 0.025 : (isEliteOrRare ? 0.008 : 0.0));
  if (Math.random() < essenceDropChance && Array.isArray(AWAKENING_ESSENCES) && AWAKENING_ESSENCES.length > 0) {
    const randomEssence = AWAKENING_ESSENCES[Math.floor(Math.random() * AWAKENING_ESSENCES.length)];
    itemsToDrop.push({
      ...randomEssence,
      beamHeight: 450
    });
    spawnDamageNumber(x, y - 80, `✨ PRIMORDIAL ESSENCE: ${randomEssence.name}!`, true, '#ffd700');
    AudioEngine.playLevelUp?.();
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

// 1. HEAVY SLASH (With Wind Blade, Rend & Titan Cleave Morphs + Void Dimension Cleave Awakening)
export function castSlash() {
  if (player.isDead) return;
  const s = SKILLS.slash;
  if (player.cooldowns.slash > 0) return;
  player.cooldowns.slash = Math.max(0.32, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

  const angle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
  if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
    player.facing = Math.cos(angle) > 0 ? 'right' : 'left';
  } else {
    player.facing = Math.sin(angle) > 0 ? 'down' : 'up';
  }
  player.isAttacking = true;
  player.attackTimer = 0.24;

  const isAwakened = !!player.awakenedSkills?.slash;
  let reach = s.baseReach + (s.level - 1) * s.reachPerLvl + (player.classSpec === 'Vanguard' ? 20 : 0) + (isAwakened ? 40 : 0);
  if (isNodeAllocated('slash', 'sl_reach')) reach += 25;

  const slashX = player.x + Math.cos(angle) * 40;
  const slashY = player.y + Math.sin(angle) * 40;
  let dmg = s.baseDmg + (s.level - 1) * s.dmgPerLvl + (player.classSpec === 'Vanguard' ? 35 : 0);

  if (isAwakened) {
    dmg = Math.round(dmg * 2.2); // 2.2x Awakened Dimension Cleave
  }

  const isTitanCleave = isNodeAllocated('slash', 'sl_morph_crush');
  if (isTitanCleave) {
    dmg = Math.round(dmg * 2.5); // 2.5x damage
  }

  monsters.forEach(m => {
    if (m.isAlive && Math.hypot(m.x - slashX, m.y - slashY) < reach) {
      dealDamage(m, dmg, 20, 0, 0, isAwakened ? 80 : 0, true, { x: player.x, y: player.y }, true, false, 'slash');
      if (isTitanCleave) {
        applyFreeze(m, 1.0); // 1.0s Stun
        spawnDamageNumber(m.x, m.y - 45, '⚡ STUNNED!', true, '#ffd700');
      }
    }
  });

  trainingDummies.forEach(d => {
    if (Math.hypot(d.x - slashX, d.y - slashY) < reach) dealDamage(d, dmg, 20, 0, 0, isAwakened ? 80 : 0, true, { x: player.x, y: player.y }, true, false, 'slash');
  });

  // Awakened Form Special: Void Dimension Vacuum Rift
  if (isAwakened) {
    spawnDamageNumber(slashX, slashY - 50, '🌌 VOID DIMENSION CLEAVE!', true, '#9b59b6');
    monsters.forEach(m => {
      if (m.isAlive && Math.hypot(m.x - slashX, m.y - slashY) <= 220) {
        const pullAngle = Math.atan2(slashY - m.y, slashX - m.x);
        m.vx = (m.vx || 0) + Math.cos(pullAngle) * 320;
        m.vy = (m.vy || 0) + Math.sin(pullAngle) * 320;
        dealDamage(m, 0, 0, 0, 0, 95, false, { x: slashX, y: slashY }, false, true);
      }
    });
    for (let i = 0; i < 25; i++) {
      const a = Math.random() * Math.PI * 2;
      particles.push({
        x: slashX + Math.cos(a) * 30,
        y: slashY + Math.sin(a) * 30,
        vx: Math.cos(a) * 180,
        vy: Math.sin(a) * 180,
        color: '#be2edd',
        life: 0.35,
        maxLife: 0.35,
        size: 5
      });
    }
  }

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
      color: isAwakened ? '#9b59b6' : (isTitanCleave ? '#ffd700' : (isNodeAllocated('slash', 'sl_morph_wave') ? '#00f2fe' : (player.classSpec === 'ShadowRogue' ? '#c678dd' : '#e5c07b'))),
      life: 0.22,
      maxLife: 0.22,
      size: isAwakened ? 7 : (isTitanCleave ? 6 : 4)
    });
  }
}

// 2. PYRO FIREBALL (With GMP Support, Hellfire Chaos & Supernova Celestial Orb Awakening)
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

  const baseAngle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
  const isAwakened = !!player.awakenedSkills?.fireball;

  let dmg = s.baseDmg + (s.level - 1) * s.dmgPerLvl + (player.classSpec === 'Arcanist' ? 40 : 0);
  if (isAwakened) dmg = Math.round(dmg * 2.5); // 2.5x Awakened Supernova
  if (isNodeAllocated('fireball', 'fb_dmg_1')) dmg = Math.round(dmg * 1.25);

  let radius = s.baseRadius + (s.level - 1) * s.radiusPerLvl + (isAwakened ? 25 : 0);
  if (isNodeAllocated('fireball', 'fb_aoe_1')) radius = Math.round(radius * 1.35);

  let speedMult = 1.0;
  if (isNodeAllocated('fireball', 'fb_spd_1')) speedMult = 1.30;

  const isHellfireChaos = isNodeAllocated('fireball', 'fb_morph_chaos');
  const fireDmg = isHellfireChaos ? Math.round(dmg * 0.5) : dmg;
  const chaosDmg = isHellfireChaos ? Math.round(dmg * 0.5) : (isAwakened ? 120 : 0);

  const hasNova = isNodeAllocated('fireball', 'fb_morph_nova');
  const hasGmp = skillSocketBoard.fireball?.supports.includes('support_gmp');

  if (isAwakened) {
    spawnDamageNumber(player.x, player.y - 50, '☀️ SUPERNOVA CELESTIAL ORB!', true, '#ff7675');
    // Awakened Supernova: Fires 1 giant supernova + 4 radiating radiant sparks
    projectiles.push({
      x: player.x,
      y: player.y - 10,
      vx: Math.cos(baseAngle) * 380 * speedMult,
      vy: Math.sin(baseAngle) * 380 * speedMult,
      type: 'fireball',
      damage: dmg,
      fireDmg: fireDmg,
      chaosDmg: chaosDmg,
      radius: radius + 15,
      life: 2.0
    });
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
      projectiles.push({
        x: player.x,
        y: player.y - 10,
        vx: Math.cos(baseAngle + a) * 280,
        vy: Math.sin(baseAngle + a) * 280,
        type: 'fireball',
        damage: Math.round(dmg * 0.5),
        fireDmg: Math.round(fireDmg * 0.5),
        chaosDmg: 0,
        radius: radius,
        life: 1.2
      });
    }
  } else if (hasNova) {
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

// 3. FROST NOVA (With Frost Shield, Ice Shatter & Glacial Domain of Oblivion Awakening)
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

  const isAwakened = !!player.awakenedSkills?.frost;
  let novaRadius = s.baseRadius + (s.level - 1) * s.radiusPerLvl + (player.classSpec === 'Arcanist' ? 40 : 0);
  if (isNodeAllocated('frost', 'fr_aoe')) novaRadius = Math.round(novaRadius * 1.30);
  if (isAwakened) novaRadius = Math.round(novaRadius * 1.60);

  let dmg = s.baseDmg + (s.level - 1) * s.dmgPerLvl;
  if (isAwakened) dmg = Math.round(dmg * 2.0);

  let hitsCount = 0;
  monsters.forEach(m => {
    if (m.isAlive && Math.hypot(m.x - player.x, m.y - player.y) <= novaRadius) {
      dealDamage(m, 15, 0, dmg, 0, 0, true, { x: player.x, y: player.y }, false, false, 'frost');
      hitsCount++;

      if (isAwakened) {
        applyFreeze(m, 2.5); // 2.5s Absolute Permafrost Freeze
      }

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
    if (Math.hypot(d.x - player.x, d.y - player.y) <= novaRadius) dealDamage(d, 15, 0, dmg, 0, 0, true, { x: player.x, y: player.y }, false, false, 'frost');
  });

  if (isAwakened) {
    player.es = Math.min(player.maxEs, (player.es || 0) + 500);
    spawnDamageNumber(player.x, player.y - 65, '❄️ GLACIAL DOMAIN OF OBLIVION (+500 ES)!', true, '#00f2fe');
  }

  if (isNodeAllocated('frost', 'fr_shield') && hitsCount > 0) {
    const esGained = hitsCount * 35;
    player.es = Math.min(player.maxEs, player.es + esGained);
    spawnDamageNumber(player.x, player.y - 45, `+${esGained} ES (Frost Shield)`, false, '#56b6c2');
  }

  for (let a = 0; a < Math.PI * 2; a += 0.25) {
    particles.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(a) * (isAwakened ? 340 : 260),
      vy: Math.sin(a) * (isAwakened ? 340 : 260),
      color: isAwakened ? '#00f2fe' : (isNodeAllocated('frost', 'fr_morph_vortex') ? '#c678dd' : '#00f2fe'),
      life: isAwakened ? 0.65 : 0.45,
      maxLife: isAwakened ? 0.65 : 0.45,
      size: isAwakened ? 8 : 6
    });
  }
}

// 4. CATACLYSM METEOR (With Meteor Shower Morph & Starfall Cataclysm Awakening)
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

  const targetX = mouse.worldX;
  const targetY = mouse.worldY;
  const isAwakened = !!player.awakenedSkills?.meteor;

  const dropSingleImpact = (x, y, delayMs, isExtra = false) => {
    particles.push({
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      color: isAwakened ? 'rgba(255, 120, 0, 0.6)' : 'rgba(255, 65, 108, 0.45)',
      life: delayMs / 1000,
      maxLife: delayMs / 1000,
      size: isAwakened ? 75 : 50,
      isRing: true
    });

    setTimeout(() => {
      const radius = s.baseRadius + (s.level - 1) * s.radiusPerLvl + (player.classSpec === 'Arcanist' ? 40 : 0) + (isAwakened ? 35 : 0);
      let dmg = s.baseDmg + (s.level - 1) * s.dmgPerLvl;
      if (isAwakened) dmg = Math.round(dmg * 2.8);
      if (isNodeAllocated('meteor', 'met_dmg')) dmg = Math.round(dmg * 1.30);

      monsters.forEach(m => {
        if (m.isAlive && Math.hypot(m.x - x, m.y - y) <= radius) dealDamage(m, 50, dmg, 0, 0, isAwakened ? 120 : 30, true, { x, y }, false, false, 'meteor');
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
        if (Math.hypot(d.x - x, d.y - y) <= radius) dealDamage(d, 50, dmg, 0, 0, isAwakened ? 120 : 30, true, { x, y }, false, false, 'meteor');
      });

      for (let i = 0; i < 40; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 60 + Math.random() * 260;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          color: isAwakened ? '#ffd700' : (Math.random() > 0.3 ? '#ff3b00' : '#ffd700'),
          life: 0.65,
          maxLife: 0.65,
          size: 6 + Math.random() * 6
        });
      }
    }, delayMs);
  };

  if (isAwakened) {
    spawnDamageNumber(targetX, targetY - 70, '☄️ STARFALL CATACLYSM BARRAGE!', true, '#ffd700');
    dropSingleImpact(targetX, targetY, 300);
    dropSingleImpact(targetX + 100, targetY - 60, 550, true);
    dropSingleImpact(targetX - 90, targetY + 70, 800, true);
    dropSingleImpact(targetX + 150, targetY + 80, 1050, true);
    dropSingleImpact(targetX - 130, targetY - 70, 1300, true);
  } else {
    dropSingleImpact(targetX, targetY, 400);
    if (isNodeAllocated('meteor', 'met_morph_shower')) {
      dropSingleImpact(targetX + 60, targetY - 40, 650);
      dropSingleImpact(targetX - 50, targetY + 50, 900);
    }
  }
}

// 5. SHADOW DASH (With Flash Phantasm Mirage Awakening)
export function castDash() {
  if (player.isDead) return;
  const s = SKILLS.dash;
  if (player.cooldowns.dash > 0) return;
  player.cooldowns.dash = Math.max(0.4, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

  const startX = player.x;
  const startY = player.y;
  const isAwakened = !!player.awakenedSkills?.dash;

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

  const dist = s.baseDistance + (s.level - 1) * s.distancePerLvl + (isAwakened ? 80 : 0);
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
      color: isAwakened ? '#ffd700' : 'rgba(255, 255, 255, 0.4)',
      life: 0.25,
      maxLife: 0.25,
      size: isAwakened ? 18 : 14
    });
  }

  if (isAwakened) {
    spawnDamageNumber(player.x, player.y - 45, '⚡ FLASH PHANTASM MIRAGE!', true, '#ffd700');
    [startX, (startX + player.x) / 2].forEach((cloneX, idx) => {
      const cloneY = idx === 0 ? startY : (startY + player.y) / 2;
      monsters.forEach(m => {
        if (m.isAlive && Math.hypot(m.x - cloneX, m.y - cloneY) <= 130) {
          dealDamage(m, 180, 0, 0, 90, 0, true, { x: cloneX, y: cloneY });
        }
      });
      for (let a = 0; a < Math.PI * 2; a += 0.4) {
        particles.push({
          x: cloneX,
          y: cloneY,
          vx: Math.cos(a) * 220,
          vy: Math.sin(a) * 220,
          color: '#ffd700',
          life: 0.3,
          maxLife: 0.3,
          size: 5
        });
      }
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

  // Active Shrine Blessing: Aegis Sanctuary (-35% damage taken)
  const hasAegisSanctuary = player.activeBuffs && player.activeBuffs.some(b => b.buffType === 'AegisSanctuary');
  if (hasAegisSanctuary) {
    familyMitigation += 0.35;
  }

  // Family Mastery Talents Check
  const mDef = MONSTERS[monster.type];
  const fam = mDef?.family;
  if (fam && player.allocatedFamilyTalents?.[fam]) {
    const talents = player.allocatedFamilyTalents[fam];
    if (talents.includes('beast_t3') || talents.includes('undead_t3') || talents.includes('fiend_t3')) {
      familyMitigation += 0.20; // -20% extra damage taken from this family
    }
  }

  const baseDmg = rawAttack * (1 - Math.min(0.75, familyMitigation)) * blockMult;
  let finalDmg = 0;

  const resBonus = hasAegisSanctuary ? 35 : 0;
  if (monster.dmgType === 'fire') {
    finalDmg = baseDmg * (1 - Math.min(0.85, ((player.fireRes || 0) + resBonus) / 100));
  } else if (monster.dmgType === 'cold') {
    finalDmg = baseDmg * (1 - Math.min(0.85, ((player.coldRes || 0) + resBonus) / 100));
    if (Math.random() < 0.25) applyChill(player, 1.5);
  } else if (monster.dmgType === 'lightning') {
    finalDmg = baseDmg * (1 - Math.min(0.85, ((player.lightningRes || player.lightRes || 0) + resBonus) / 100));
  } else if (monster.dmgType === 'chaos') {
    finalDmg = baseDmg * (1 - Math.min(0.85, ((player.chaosRes || 0) + resBonus) / 100));
  } else {
    // Physical Armor Mitigation
    const pArmor = (player.armor || 60) * (hasAegisSanctuary ? 1.8 : 1.0);
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
