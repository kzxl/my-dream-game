/**
 * MDG: Aethelis - Player Defeat & Resurrection System UI (Thin UI Presentation Layer)
 * Delegates all authoritative decision-making & validation to C# ASP.NET Core WebAPI.
 * Renders UI animations, audio, and visual particle feedback based on Server responses.
 */

import { player, particles, floatingTexts } from '../state.js';
import { updateBackpackUI } from './inventory.js';
import { spawnDamageNumber } from '../combat.js';
import { AudioEngine } from '../audio.js';
import { saveToDatabase } from '../save-system.js';

export const MAX_MAP_RESURRECTIONS = 5;

export function countResurrectionScrolls() {
  let count = 0;
  if (!player.bag || !Array.isArray(player.bag)) return 0;
  player.bag.forEach(it => {
    if (it && (it.id === 'scroll_resurrection' || it.name === 'Scroll of Resurrection' || (it.category === 'consumable' && it.name?.includes('Resurrection')))) {
      count += (it.stack || 1);
    }
  });
  return count;
}

export function showDefeatModal() {
  const modal = document.getElementById('defeat-modal');
  if (!modal) return;

  // Populate hero stats
  const heroNameEl = document.getElementById('defeat-hero-name');
  const heroClassEl = document.getElementById('defeat-hero-class');
  const zoneNameEl = document.getElementById('defeat-zone-name');
  const scrollBadgeEl = document.getElementById('defeat-scroll-count-badge');
  const mapLimitBadgeEl = document.getElementById('defeat-map-limit-badge');
  const resurrectDescEl = document.getElementById('defeat-resurrect-desc');
  const btnResurrect = document.getElementById('btn-defeat-resurrect');

  if (heroNameEl) heroNameEl.innerText = player.name || 'The Unbound';
  if (heroClassEl) heroClassEl.innerText = `Lv.${player.level} ${player.classSpec}`;
  if (zoneNameEl) {
    const curZone = window.currentZoneId || 'SanctuaryHaven';
    zoneNameEl.innerText = curZone;
  }

  const scrollCount = countResurrectionScrolls();
  const used = player.zoneResurrectionsUsed || 0;
  const remaining = Math.max(0, MAX_MAP_RESURRECTIONS - used);

  if (scrollBadgeEl) {
    scrollBadgeEl.innerText = `📜 Scrolls: x${scrollCount}`;
  }

  if (mapLimitBadgeEl) {
    if (remaining > 0) {
      mapLimitBadgeEl.innerText = `⚡ Zone Attempts: ${remaining}/${MAX_MAP_RESURRECTIONS}`;
      mapLimitBadgeEl.style.borderColor = '#00f2fe';
      mapLimitBadgeEl.style.color = '#00f2fe';
    } else {
      mapLimitBadgeEl.innerText = `⚡ Zone Attempts: 0/${MAX_MAP_RESURRECTIONS} (Depleted)`;
      mapLimitBadgeEl.style.borderColor = '#e06c75';
      mapLimitBadgeEl.style.color = '#ff7875';
    }
  }

  if (resurrectDescEl) {
    if (remaining > 0) {
      resurrectDescEl.innerHTML = `Rise instantly on the spot with 100% Life & 3.5s Divine Shield (<b>${remaining}/${MAX_MAP_RESURRECTIONS}</b> attempts remaining in this zone).`;
    } else {
      resurrectDescEl.innerHTML = `<span style="color:#ff4d4f; font-weight:bold;">⚠️ ZONE RESURRECTION LIMIT REACHED (0/${MAX_MAP_RESURRECTIONS})! You must return to town.</span>`;
    }
  }

  if (btnResurrect) {
    if (remaining <= 0) {
      btnResurrect.classList.add('disabled');
      btnResurrect.title = `Zone limit of ${MAX_MAP_RESURRECTIONS}/${MAX_MAP_RESURRECTIONS} resurrections exhausted! Must return to town.`;
    } else if (scrollCount <= 0) {
      btnResurrect.classList.add('disabled');
      btnResurrect.title = 'No Scroll of Resurrection in your backpack!';
    } else {
      btnResurrect.classList.remove('disabled');
      btnResurrect.title = `Consume 1x Scroll of Resurrection (${remaining}/${MAX_MAP_RESURRECTIONS} attempts left)`;
    }
  }

  modal.classList.remove('hidden');
}

export function hideDefeatModal() {
  const modal = document.getElementById('defeat-modal');
  if (modal) modal.classList.add('hidden');
}

export async function resurrectAtTown() {
  hideDefeatModal();

  // Call Server-Authoritative Town Resurrection API
  try {
    const res = await fetch('/api/v1/player/resurrect/town', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        characterId: player.id || 'hero_default',
        maxLife: player.maxLife,
        maxMana: player.maxMana,
        maxEs: player.maxEs
      })
    });

    if (res.ok) {
      const serverResult = await res.json();
      player.life = serverResult.newLife;
      player.mana = serverResult.newMana;
      player.es = serverResult.newEs;
      player.invulnerableTimer = serverResult.invulnerableDuration || 3.0;
    } else {
      player.life = player.maxLife;
      player.mana = player.maxMana;
      player.es = player.maxEs;
      player.invulnerableTimer = 3.0;
    }
  } catch {
    player.life = player.maxLife;
    player.mana = player.maxMana;
    player.es = player.maxEs;
    player.invulnerableTimer = 3.0;
  }

  player.freezeTimer = 0;
  player.isDead = false;

  await loadZone('SanctuaryHaven');

  spawnDamageNumber(player.x, player.y - 50, '✨ Returned to Sanctuary Haven safely!', true, '#00e676');
  AudioEngine.playTone(523.25, 'sine', 0.2, 0.15); // C5
  setTimeout(() => AudioEngine.playTone(659.25, 'sine', 0.25, 0.15), 120); // E5
  setTimeout(() => AudioEngine.playTone(783.99, 'sine', 0.35, 0.2), 240); // G5

  saveToDatabase(true);
}

export async function resurrectOnSpot() {
  const scrollCount = countResurrectionScrolls();

  // Call Server-Authoritative Spot Resurrection API
  try {
    const res = await fetch('/api/v1/player/resurrect/spot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        characterId: player.id || 'hero_default',
        zoneId: window.currentZoneId || 'SanctuaryHaven',
        scrollCount: scrollCount,
        maxLife: player.maxLife,
        maxMana: player.maxMana,
        maxEs: player.maxEs
      })
    });

    if (res.ok) {
      const serverResult = await res.json();
      if (!serverResult.success) {
        spawnDamageNumber(player.x, player.y - 50, `⚠️ ${serverResult.message}`, true, '#e06c75');
        AudioEngine.playTone(150, 'sawtooth', 0.3, 0.25);
        return;
      }

      // Consume 1 scroll from player.bag
      const bagIdx = player.bag.findIndex(it => it && (it.id === 'scroll_resurrection' || it.name === 'Scroll of Resurrection' || (it.category === 'consumable' && it.name?.includes('Resurrection'))));
      if (bagIdx !== -1) {
        const item = player.bag[bagIdx];
        if (item.stack && item.stack > 1) {
          item.stack -= 1;
        } else {
          player.bag.splice(bagIdx, 1);
        }
      }

      player.zoneResurrectionsUsed = MAX_MAP_RESURRECTIONS - serverResult.remainingZoneResurrections;

      hideDefeatModal();

      // Apply Authoritative Stats
      player.life = serverResult.newLife;
      player.mana = serverResult.newMana;
      player.es = serverResult.newEs;
      player.invulnerableTimer = serverResult.invulnerableDuration || 3.5;
      player.freezeTimer = 0;
      player.isDead = false;

      // Divine holy revival particles
      for (let i = 0; i < 28; i++) {
        const angle = (i / 28) * Math.PI * 2;
        particles.push({
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * 190,
          vy: Math.sin(angle) * 190,
          color: '#ffd700',
          life: 0.6,
          maxLife: 0.6,
          size: 5
        });
      }

      spawnDamageNumber(player.x, player.y - 50, `✨ ${serverResult.message}`, true, '#ffd700');
      AudioEngine.playTone(440, 'triangle', 0.2, 0.15);
      setTimeout(() => AudioEngine.playTone(554.37, 'triangle', 0.2, 0.15), 100);
      setTimeout(() => AudioEngine.playTone(659.25, 'triangle', 0.2, 0.15), 200);
      setTimeout(() => AudioEngine.playTone(880, 'sine', 0.45, 0.25), 320);

      updateBackpackUI();
      saveToDatabase(true);
      return;
    }
  } catch (err) {
    console.error('Resurrection API call failed:', err);
  }
}

export function initDefeatUI() {
  const btnTown = document.getElementById('btn-defeat-town');
  const btnResurrect = document.getElementById('btn-defeat-resurrect');

  if (btnTown) {
    btnTown.addEventListener('click', () => {
      resurrectAtTown();
    });
  }

  if (btnResurrect) {
    btnResurrect.addEventListener('click', () => {
      resurrectOnSpot();
    });
  }
}
