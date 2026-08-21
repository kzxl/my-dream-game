/**
 * MDG: Aethelis - Flask System Engine (PoE-Style Charge Flasks)
 * Handles consumption, refill charges on kill, continuous regen, stat buffs & HUD visualization
 */

import { player, particles } from '../state.js';
import { AudioEngine } from '../audio.js';
import { spawnDamageNumber } from '../combat.js';
import { STARTER_FLASKS } from '../data/flasks.js';

export function initFlasks() {
  if (!player.flasks || !Array.isArray(player.flasks) || player.flasks.length < 4) {
    player.flasks = JSON.parse(JSON.stringify(STARTER_FLASKS));
  }
  if (!player.activeFlaskBuffs) {
    player.activeFlaskBuffs = [];
  }
}

export function useFlask(slotIndex) {
  initFlasks();
  if (player.isDead) return;

  const flask = player.flasks[slotIndex];
  if (!flask) return;

  if (flask.currentCharges < flask.chargesPerUse) {
    AudioEngine.playTone(180, 'triangle', 0.1, 0.08);
    spawnDamageNumber(player.x, player.y - 30, `⚠️ EMPTY FLASK (${flask.currentCharges}/${flask.chargesPerUse})`, false, '#ef4444');
    return;
  }

  // Deduct charges
  flask.currentCharges -= flask.chargesPerUse;

  // Sound effect
  AudioEngine.playTone(520, 'sine', 0.15, 0.1);

  // Particle aura burst around player
  const pColor = flask.color || '#4ade80';
  for (let i = 0; i < 14; i++) {
    particles.push({
      x: player.x + (Math.random() - 0.5) * 20,
      y: player.y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 60,
      vy: -Math.random() * 80 - 20,
      color: pColor,
      radius: Math.random() * 3 + 2,
      life: 0.5,
      maxLife: 0.5
    });
  }

  // Floating text
  spawnDamageNumber(player.x, player.y - 45, `${flask.icon} ${flask.name.split('of')[0].trim()}`, true, pColor);

  // Register active flask buff
  const existingIdx = player.activeFlaskBuffs.findIndex(b => b.flaskId === flask.id);
  const buffData = {
    flaskId: flask.id,
    type: flask.type,
    name: flask.name,
    icon: flask.icon,
    color: pColor,
    duration: flask.duration || 4.0,
    maxDuration: flask.duration || 4.0,
    healLifePerSec: flask.healLifePerSec || 0,
    healManaPerSec: flask.healManaPerSec || 0,
    healEsPerSec: flask.healEsPerSec || 0,
    speedBonusPct: flask.speedBonusPct || 0,
    attackSpeedBonusPct: flask.attackSpeedBonusPct || 0,
    armorFlat: flask.armorFlat || 0,
    allResPct: flask.allResPct || 0
  };

  if (existingIdx !== -1) {
    player.activeFlaskBuffs[existingIdx] = buffData; // Refresh duration
  } else {
    player.activeFlaskBuffs.push(buffData);
  }

  renderFlaskHUD();
}

export function addFlaskCharges(amount = 1) {
  initFlasks();
  player.flasks.forEach(flask => {
    if (flask) {
      flask.currentCharges = Math.min(flask.maxCharges, (flask.currentCharges || 0) + amount);
    }
  });
  renderFlaskHUD();
}

export function updateFlasks(dt) {
  initFlasks();
  if (player.isDead) return;

  for (let i = player.activeFlaskBuffs.length - 1; i >= 0; i--) {
    const buff = player.activeFlaskBuffs[i];
    buff.duration -= dt;

    // Apply continuous recovery
    if (buff.healLifePerSec > 0 && player.life < player.maxLife) {
      player.life = Math.min(player.maxLife, player.life + buff.healLifePerSec * dt);
    }
    if (buff.healManaPerSec > 0 && player.mana < player.maxMana) {
      player.mana = Math.min(player.maxMana, player.mana + buff.healManaPerSec * dt);
    }
    if (buff.healEsPerSec > 0 && player.es < player.maxEs) {
      player.es = Math.min(player.maxEs, player.es + buff.healEsPerSec * dt);
    }

    if (buff.duration <= 0) {
      player.activeFlaskBuffs.splice(i, 1);
    }
  }

  renderFlaskHUD();
}

export function renderFlaskHUD() {
  const container = document.getElementById('flask-hud-tray');
  if (!container) return;
  initFlasks();

  container.innerHTML = player.flasks.map((flask, idx) => {
    if (!flask) return '';
    const pct = Math.max(0, Math.min(100, (flask.currentCharges / flask.maxCharges) * 100));
    const isBuffActive = player.activeFlaskBuffs.some(b => b.flaskId === flask.id);
    const activeBuff = player.activeFlaskBuffs.find(b => b.flaskId === flask.id);
    const buffDurPct = activeBuff ? (activeBuff.duration / activeBuff.maxDuration) * 100 : 0;

    return `
      <div class="flask-slot ${isBuffActive ? 'flask-active' : ''}" data-slot="${idx}" title="${flask.name}\nCharges: ${flask.currentCharges}/${flask.maxCharges} (Uses ${flask.chargesPerUse})\n${flask.mods.join('\n')}">
        <div class="flask-glass">
          <div class="flask-liquid" style="height:${pct}%; background:${flask.color};"></div>
          ${isBuffActive ? `<div class="flask-active-glow" style="border-color:${flask.color}"></div>` : ''}
          <span class="flask-icon">${flask.icon}</span>
        </div>
        <div class="flask-key">[${idx + 1}]</div>
        <div class="flask-charge-text">${flask.currentCharges}/${flask.maxCharges}</div>
      </div>
    `;
  }).join('');

  // Setup click to drink
  container.querySelectorAll('.flask-slot').forEach(slotEl => {
    slotEl.onclick = () => {
      const idx = parseInt(slotEl.getAttribute('data-slot'), 10);
      useFlask(idx);
    };
  });
}
