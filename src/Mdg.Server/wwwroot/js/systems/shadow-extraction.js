/**
 * MDG: Aethelis - Shadow Extraction Engine (Solo Leveling / Shadow Monarch Style)
 * Allows extracting slain monster souls into active Shadow Soldiers that follow, fight and defend
 */

import { player, monsters, particles, floatingTexts } from '../state.js';
import { AudioEngine } from '../audio.js';
import { dealDamage, spawnDamageNumber } from '../combat.js';

export const shadowCorpses = [];
export const shadowArmy = [];
export const MAX_SHADOW_ARMY = 3;

export function spawnExtractableCorpse(monster) {
  if (!monster) return;
  shadowCorpses.push({
    id: 'corpse_' + Math.random().toString(36).substring(2, 9),
    name: monster.name || 'Fallen Entity',
    monsterType: monster.type || 'monster',
    rarity: monster.rarity || 'Normal',
    x: monster.x,
    y: monster.y,
    life: monster.maxLife || 200,
    damage: monster.attackDmg || monster.damage || 40,
    timer: 8.0, // 8s to extract before dissolving into aether
    maxTimer: 8.0
  });
}

export function extractShadow() {
  if (player.isDead) return;

  // Find closest corpse within 140px
  let nearest = null;
  let minDist = 140;

  for (let i = 0; i < shadowCorpses.length; i++) {
    const c = shadowCorpses[i];
    const dist = Math.hypot(player.x - c.x, player.y - c.y);
    if (dist < minDist) {
      minDist = dist;
      nearest = { corpse: c, index: i };
    }
  }

  if (!nearest) {
    AudioEngine.playTone(180, 'triangle', 0.1, 0.08);
    spawnDamageNumber(player.x, player.y - 30, '⚠️ No Extractable Shadow nearby', false, '#a855f7');
    return;
  }

  const { corpse, index } = nearest;
  shadowCorpses.splice(index, 1);

  // Sound: Deep resonant Arise harmonic
  AudioEngine.playTone(120, 'sawtooth', 0.35, 0.2);
  setTimeout(() => AudioEngine.playTone(440, 'sine', 0.2, 0.15), 100);
  setTimeout(() => AudioEngine.playTone(660, 'sine', 0.25, 0.15), 200);
  setTimeout(() => AudioEngine.playTone(880, 'sine', 0.3, 0.2), 300);

  // Purple shadowy eruption pillar
  for (let i = 0; i < 28; i++) {
    particles.push({
      x: corpse.x + (Math.random() - 0.5) * 40,
      y: corpse.y + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 80,
      vy: -Math.random() * 140 - 40,
      color: '#c084fc',
      radius: Math.random() * 4 + 2,
      life: 0.8,
      maxLife: 0.8
    });
  }

  spawnDamageNumber(corpse.x, corpse.y - 50, `👑 ARISE! SHADOW ${corpse.name.toUpperCase()}`, true, '#c084fc');

  // Enforce Max Capacity
  if (shadowArmy.length >= MAX_SHADOW_ARMY) {
    const dissolved = shadowArmy.shift();
    spawnDamageNumber(dissolved.x, dissolved.y - 30, `💨 Shadow ${dissolved.name} Dissolved`, false, '#94a3b8');
  }

  // Create Shadow Soldier
  shadowArmy.push({
    id: 'shadow_' + Math.random().toString(36).substring(2, 9),
    name: corpse.name,
    monsterType: corpse.monsterType,
    rarity: corpse.rarity,
    x: corpse.x,
    y: corpse.y,
    maxLife: Math.max(120, Math.round(corpse.life * 0.60)),
    life: Math.max(120, Math.round(corpse.life * 0.60)),
    damage: Math.max(25, Math.round(corpse.damage * 0.60)),
    attackCooldown: 0,
    animTimer: 0,
    duration: 75.0, // 75s lifetime
    maxDuration: 75.0
  });

  renderShadowArmyHUD();
}

export function updateShadowArmy(dt) {
  // 1. Update Corpses Expiry
  for (let i = shadowCorpses.length - 1; i >= 0; i--) {
    shadowCorpses[i].timer -= dt;
    if (shadowCorpses[i].timer <= 0) {
      shadowCorpses.splice(i, 1);
    }
  }

  // 2. Update Active Shadow Soldiers
  for (let i = shadowArmy.length - 1; i >= 0; i--) {
    const soldier = shadowArmy[i];
    soldier.duration -= dt;
    soldier.animTimer += dt * 4;
    if (soldier.attackCooldown > 0) soldier.attackCooldown -= dt;

    if (soldier.duration <= 0 || soldier.life <= 0) {
      for (let k = 0; k < 12; k++) {
        particles.push({
          x: soldier.x,
          y: soldier.y,
          vx: (Math.random() - 0.5) * 60,
          vy: -Math.random() * 60,
          color: '#a855f7',
          radius: 3,
          life: 0.4
        });
      }
      shadowArmy.splice(i, 1);
      renderShadowArmyHUD();
      continue;
    }

    // AI: Find nearest hostile monster within 360px
    let target = null;
    let minMDist = 360;
    monsters.forEach(m => {
      if (m.isAlive) {
        const d = Math.hypot(m.x - soldier.x, m.y - soldier.y);
        if (d < minMDist) {
          minMDist = d;
          target = m;
        }
      }
    });

    if (target) {
      // Move towards target and attack
      const angle = Math.atan2(target.y - soldier.y, target.x - soldier.x);
      if (minMDist > 45) {
        soldier.x += Math.cos(angle) * 140 * dt;
        soldier.y += Math.sin(angle) * 140 * dt;
      } else if (soldier.attackCooldown <= 0) {
        // Strike target
        soldier.attackCooldown = 0.9;
        AudioEngine.playTone(320, 'square', 0.08, 0.06);
        dealDamage(target, soldier.damage, 0, 0, 0, Math.round(soldier.damage * 0.35), false, { x: soldier.x, y: soldier.y });
        spawnDamageNumber(target.x, target.y - 25, `⚔️ ${soldier.damage}`, false, '#c084fc');
      }
    } else {
      // Return / orbit near player (within 100px)
      const pDist = Math.hypot(player.x - soldier.x, player.y - soldier.y);
      if (pDist > 90) {
        const pAngle = Math.atan2(player.y - soldier.y, player.x - soldier.x);
        soldier.x += Math.cos(pAngle) * 160 * dt;
        soldier.y += Math.sin(pAngle) * 160 * dt;
      }
    }
  }

  renderShadowArmyHUD();
}

export function renderShadowCorpses(ctx) {
  shadowCorpses.forEach(c => {
    ctx.save();
    const pulse = Math.sin(Date.now() * 0.006) * 4;

    // Glowing shadow pool
    const grad = ctx.createRadialGradient(c.x, c.y, 5, c.x, c.y, 35 + pulse);
    grad.addColorStop(0, 'rgba(168, 85, 247, 0.8)');
    grad.addColorStop(0.7, 'rgba(88, 28, 135, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 35 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Text prompt
    ctx.fillStyle = '#f3e8ff';
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`💀 [T] EXTRACT SHADOW (${Math.ceil(c.timer)}s)`, c.x, c.y - 35);

    ctx.restore();
  });
}

export function renderShadowArmy(ctx) {
  shadowArmy.forEach(s => {
    ctx.save();
    const pulse = Math.sin(s.animTimer) * 3;

    // Shadow Minion Silhouette Aura
    const grad = ctx.createRadialGradient(s.x, s.y, 4, s.x, s.y, 25 + pulse);
    grad.addColorStop(0, 'rgba(192, 132, 252, 0.9)');
    grad.addColorStop(0.6, 'rgba(107, 33, 168, 0.6)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 25 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Neon Eyes
    ctx.fillStyle = '#00f2fe';
    ctx.beginPath();
    ctx.arc(s.x - 4, s.y - 6, 2.5, 0, Math.PI * 2);
    ctx.arc(s.x + 4, s.y - 6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Name badge
    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 10px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`👑 Shadow ${s.name}`, s.x, s.y - 28);

    // Life Bar
    const barW = 32;
    const hpPct = s.life / s.maxLife;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(s.x - barW / 2, s.y - 24, barW, 4);
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(s.x - barW / 2, s.y - 24, barW * hpPct, 4);

    ctx.restore();
  });
}

export function renderShadowArmyHUD() {
  let tray = document.getElementById('shadow-army-tray');
  if (!tray) {
    const hudTopLeft = document.getElementById('hud-player-bars');
    if (hudTopLeft) {
      tray = document.createElement('div');
      tray.id = 'shadow-army-tray';
      tray.className = 'shadow-army-tray-container';
      hudTopLeft.appendChild(tray);
    }
  }

  if (!tray) return;

  if (shadowArmy.length === 0) {
    tray.innerHTML = '';
    return;
  }

  tray.innerHTML = `
    <div class="shadow-army-badge-header">
      <span>👑 SHADOW ARMY (${shadowArmy.length}/${MAX_SHADOW_ARMY})</span>
    </div>
    <div class="shadow-army-units-row">
      ${shadowArmy.map(s => `
        <div class="shadow-unit-card" title="Shadow ${s.name} (HP: ${s.life}/${s.maxLife}, DMG: ${s.damage})">
          <span class="suc-icon">👤</span>
          <div class="suc-info">
            <span class="suc-name">${s.name}</span>
            <div class="suc-hp-bar"><div class="suc-hp-fill" style="width:${(s.life/s.maxLife)*100}%;"></div></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
