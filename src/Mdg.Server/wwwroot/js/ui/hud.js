/**
 * HUD, Modals & User Interface Controller (With Detailed Attributes & Multi-Character Roster)
 */

import { player, camera } from '../state.js';
import { AudioEngine } from '../audio.js';
import { spawnDamageNumber } from '../combat.js';
import { updateBackpackUI, updatePaperdollUI, sortAndConsolidateBackpack, setupContextMenuListeners } from './inventory.js';
import { updateSkillBadges, renderSkillUpgradeModal } from './skills-ui.js';
import { saveToDatabase, renderCharacterRosterUI, createNewCharacter } from '../save-system.js';
import { renderWorldMapUI } from './worldmap-ui.js';
import { renderForgeBenchModal } from './forge-ui.js';
import { renderMapDeviceModal } from './map-device-ui.js';
import { renderDevotionModal } from './devotion-ui.js';
import { renderSharedStashModal } from './stash-ui.js';
import { renderRosterModal } from './roster-ui.js';
import { sendPetToTown, companion } from '../companion.js';
import { openGoogleAuthModal } from '../auth.js';
import { MPClient } from '../services/multiplayer-client.js';
import { CHANNELS } from '../data/channels.js';

export function showZoneBanner(title, sub) {
  const banner = document.getElementById('zone-banner');
  if (!banner) return;
  document.getElementById('zone-banner-title').innerText = title.toUpperCase();
  document.getElementById('zone-banner-sub').innerText = sub;
  banner.classList.remove('zone-banner-hide');
  clearTimeout(banner._timeout);
  banner._timeout = setTimeout(() => banner.classList.add('zone-banner-hide'), 3500);
}

/**
 * Gets high-quality avatar portrait path for given class and gender
 */
export function getAvatarPath(classSpec, gender) {
  const spec = (classSpec || 'Novice').toLowerCase();
  const gen = (gender || 'Male').toLowerCase();
  if (spec.includes('vanguard') || spec.includes('knight') || spec.includes('paladin')) {
    return `/assets/avatars/vanguard_${gen}.svg`;
  } else if (spec.includes('arcanist') || spec.includes('mage') || spec.includes('wizard')) {
    return `/assets/avatars/arcanist_${gen}.svg`;
  } else if (spec.includes('rogue') || spec.includes('assassin') || spec.includes('shadow')) {
    return `/assets/avatars/shadowrogue_${gen}.svg`;
  }
  return `/assets/avatars/novice_${gen}.svg`;
}

/**
 * Updates HUD portrait & gender badge according to player's class & gender
 */
export function updateHudAvatar() {
  const avatar = document.getElementById('hud-avatar');
  const tag = document.getElementById('hud-gender-tag');
  const nameEl = document.getElementById('hud-name');
  const levelEl = document.getElementById('hud-level');
  if (!avatar) return;

  const avatarSrc = getAvatarPath(player.classSpec, player.gender);
  avatar.innerHTML = `<img src="${avatarSrc}" alt="Avatar" class="hud-avatar-img" />`;

  if (tag) {
    if (player.gender === 'Female') {
      tag.innerText = '♀ Female';
      tag.style.color = '#ff79c6';
    } else {
      tag.innerText = '♂ Male';
      tag.style.color = '#61afef';
    }
  }

  if (nameEl) nameEl.innerText = player.name || player.classSpec || 'Novice Adventurer';
  if (levelEl) levelEl.innerText = `Lv.${player.level || 1}`;
}

/**
 * Updates Experience Bar progression at bottom of screen
 */
export function updateExpBar() {
  const fill = document.getElementById('bottom-exp-fill');
  const text = document.getElementById('bottom-exp-text');
  if (!fill || !text) return;

  const current = player.currentExp || 0;
  const target = player.expToNext || 100;
  const pct = Math.min(100, Math.max(0, (current / target) * 100));

  fill.style.width = `${pct.toFixed(1)}%`;
  text.innerText = `Lv.${player.level} • EXP: ${current} / ${target} (${pct.toFixed(1)}%)`;
}

/**
 * Quaff Flask Potions (Life, Mana, Quicksilver)
 */
let flaskCooldowns = { 1: 0, 2: 0, 3: 0 };

export function useFlask(slot) {
  const now = Date.now();
  if (flaskCooldowns[slot] && now < flaskCooldowns[slot]) return;

  if (slot === 1) { // Life Flask
    if (player.life >= player.maxLife) return;
    const healAmount = 120;
    player.life = Math.min(player.maxLife, player.life + healAmount);
    flaskCooldowns[1] = now + 4000;
    AudioEngine.playPotion();
    spawnDamageNumber(player.x, player.y - 30, `+${healAmount} HP`, false, '#2ecc71');
  } else if (slot === 2) { // Mana Flask
    if (player.mana >= player.maxMana) return;
    const manaAmount = 80;
    player.mana = Math.min(player.maxMana, player.mana + manaAmount);
    flaskCooldowns[2] = now + 4000;
    AudioEngine.playPotion();
    spawnDamageNumber(player.x, player.y - 30, `+${manaAmount} MP`, false, '#3498db');
  } else if (slot === 3) { // Quicksilver Flask
    flaskCooldowns[3] = now + 6000;
    const origSpeed = player.speed;
    player.speed = origSpeed * 1.4;
    AudioEngine.playDash();
    spawnDamageNumber(player.x, player.y - 30, `💨 +40% Speed!`, false, '#f1c40f');
    setTimeout(() => {
      player.speed = origSpeed;
    }, 4000);
  }

  // Visual feedback on slot
  const slotEl = document.getElementById(`slot-flask-${slot}`);
  if (slotEl) {
    slotEl.classList.add('flask-used');
    setTimeout(() => slotEl.classList.remove('flask-used'), 300);
  }
}

export function selectClassSpecialization(spec) {
  player.classSpec = spec;
  document.getElementById('ascension-modal').classList.add('hidden');
  document.getElementById('btn-ascend-trigger').classList.add('hidden');

  if (spec === 'Vanguard') {
    player.armor += 300;
    player.maxLife += 150;
    player.life = player.maxLife;
    document.getElementById('hud-name').innerText = `${player.gender === 'Male' ? 'Vanguard Knight' : 'Vanguard Valkyrie'}`;
    document.getElementById('icon-slot-1').innerText = '🪓';
    document.getElementById('icon-slot-4').innerText = '🛡️';
  } else if (spec === 'Arcanist') {
    player.maxEs += 200;
    player.es = player.maxEs;
    document.getElementById('hud-name').innerText = `${player.gender === 'Male' ? 'Grand Arcanist' : 'High Sorceress'}`;
    document.getElementById('icon-slot-1').innerText = '✨';
    document.getElementById('icon-slot-4').innerText = '☄️';
  } else if (spec === 'ShadowRogue') {
    player.evasion += 350;
    player.critChance += 25;
    document.getElementById('hud-name').innerText = `${player.gender === 'Male' ? 'Shadow Assassin' : 'Nightshade Rogue'}`;
    document.getElementById('icon-slot-1').innerText = '🗡️';
    document.getElementById('icon-slot-4').innerText = '💨';
  }

  AudioEngine.playLevelUp();
  spawnDamageNumber(player.x, player.y - 60, `ASCENDED: ${spec.toUpperCase()}!`, true, '#ffd700');
  renderSkillUpgradeModal();
  updateAttributesModal();
  saveToDatabase();
}

export function updateAttributesModal() {
  const subTitle = document.getElementById('stat-hero-sub');
  if (subTitle) subTitle.innerText = `Level ${player.level} ${player.classSpec} • ${player.gender === 'Male' ? '♂ Hero' : '♀ Heroine'}`;

  // Base Attributes
  let baseStr = 25 + (player.level * 2) + (player.classSpec === 'Vanguard' ? 25 : 0);
  let baseDex = 20 + (player.level * 2) + (player.classSpec === 'ShadowRogue' ? 25 : 0);
  let baseInt = 20 + (player.level * 2) + (player.classSpec === 'Arcanist' ? 25 : 0);

  const strEl = document.getElementById('val-str');
  if (strEl) strEl.innerText = baseStr;
  const dexEl = document.getElementById('val-dex');
  if (dexEl) dexEl.innerText = baseDex;
  const intEl = document.getElementById('val-int');
  if (intEl) intEl.innerText = baseInt;

  // Defenses
  const armorEl = document.getElementById('stat-armor');
  if (armorEl) armorEl.innerText = `${player.armor} (58% PDR)`;
  const evasionEl = document.getElementById('stat-evasion');
  if (evasionEl) evasionEl.innerText = `${player.evasion || 350} (42% Evade)`;
  const blockEl = document.getElementById('stat-block');
  if (blockEl) blockEl.innerText = `28% (Cap 75%)`;

  // Offense
  const critEl = document.getElementById('stat-crit-chance');
  if (critEl) critEl.innerText = `${player.critChance.toFixed(1)}%`;
  const multiEl = document.getElementById('stat-crit-multi');
  if (multiEl) multiEl.innerText = `${player.critMulti}% (${(player.critMulti / 100).toFixed(1)}x)`;
}

export function toggleModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.toggle('hidden');
    if (id === 'skills-modal' && !el.classList.contains('hidden')) renderSkillUpgradeModal();
    if (id === 'stats-modal' && !el.classList.contains('hidden')) updateAttributesModal();
    if (id === 'character-roster-modal' && !el.classList.contains('hidden')) renderCharacterRosterUI();
    if (id === 'worldmap-modal' && !el.classList.contains('hidden')) renderWorldMapUI();
    if (id === 'inventory-modal' && !el.classList.contains('hidden')) {
      updateBackpackUI();
      updatePaperdollUI();
    }
  }
}

export function setupUIListeners() {
  // Zoom Controls
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
    camera.targetZoom = Math.min(camera.maxZoom, camera.targetZoom + 0.25);
  });
  document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
    camera.targetZoom = Math.max(camera.minZoom, camera.targetZoom - 0.25);
  });
  document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
    camera.targetZoom = 1.0;
  });

  // Flask Click Handlers
  document.getElementById('slot-flask-1')?.addEventListener('click', () => useFlask(1));
  document.getElementById('slot-flask-2')?.addEventListener('click', () => useFlask(2));
  document.getElementById('slot-flask-3')?.addEventListener('click', () => useFlask(3));

  // Flask Keybinds (1, 2, 3)
  window.addEventListener('keydown', (e) => {
    if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
    if (e.key === '1') useFlask(1);
    if (e.key === '2') useFlask(2);
    if (e.key === '3') useFlask(3);

    // Expansion Hotkeys
    if (e.key.toLowerCase() === 'b') renderForgeBenchModal();
    if (e.key.toLowerCase() === 'o') renderMapDeviceModal();
    if (e.key.toLowerCase() === 'v') renderDevotionModal();
    if (e.key.toLowerCase() === 'x') renderSharedStashModal();
    if (e.key.toLowerCase() === 'p') renderRosterModal();
  });

  // Expansion Action Buttons (if present in DOM)
  document.getElementById('btn-google-auth')?.addEventListener('click', openGoogleAuthModal);
  document.getElementById('btn-forge')?.addEventListener('click', renderForgeBenchModal);
  document.getElementById('btn-map-device')?.addEventListener('click', renderMapDeviceModal);
  document.getElementById('btn-devotion')?.addEventListener('click', renderDevotionModal);
  document.getElementById('btn-stash')?.addEventListener('click', renderSharedStashModal);
  document.getElementById('btn-roster')?.addEventListener('click', renderRosterModal);
  document.getElementById('btn-pet-sell')?.addEventListener('click', sendPetToTown);

  // Ascension Modal (Trigger & Close)
  document.getElementById('btn-ascend-trigger')?.addEventListener('click', () => {
    document.getElementById('ascension-modal')?.classList.remove('hidden');
  });
  document.getElementById('btn-close-ascension')?.addEventListener('click', () => {
    document.getElementById('ascension-modal')?.classList.add('hidden');
  });

  document.querySelectorAll('.class-choice-card').forEach(card => {
    card.addEventListener('click', () => {
      const spec = card.getAttribute('data-class');
      selectClassSpecialization(spec);
    });
  });

  // Setup Inventory Context Menu
  setupContextMenuListeners();

  // Inventory Filters
  document.querySelectorAll('.bag-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.bag-tab').forEach(t => t.classList.remove('active-tab'));
      tab.classList.add('active-tab');
      player.bagFilter = tab.getAttribute('data-filter');
      updateBackpackUI();
    });
  });

  // Inventory Live Search
  const searchInput = document.getElementById('bag-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      player.bagSearchQuery = e.target.value;
      updateBackpackUI();
    });
  }

  const btnClearSearch = document.getElementById('btn-clear-search');
  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      player.bagSearchQuery = '';
      updateBackpackUI();
    });
  }

  // Sort Bag & Consolidate Currency Stacks
  document.getElementById('btn-sort-bag')?.addEventListener('click', () => {
    const sortMode = document.getElementById('bag-sort-select')?.value || 'rarity';
    sortAndConsolidateBackpack(sortMode);
  });

  document.getElementById('bag-sort-select')?.addEventListener('change', e => {
    sortAndConsolidateBackpack(e.target.value);
  });

  // Character Roster & Creation Listeners
  document.getElementById('btn-toggle-roster')?.addEventListener('click', renderRosterModal);
  document.getElementById('btn-close-roster')?.addEventListener('click', () => toggleModal('character-roster-modal'));
  document.getElementById('btn-submit-create-hero')?.addEventListener('click', async () => {
    const name = document.getElementById('new-hero-name')?.value.trim() || 'New Hero';
    const gender = document.querySelector('input[name="new-hero-gender"]:checked')?.value || 'Male';
    const spec = document.getElementById('new-hero-class')?.value || 'Novice';

    const success = await createNewCharacter(name, gender, spec);
    if (success) {
      AudioEngine.playLevelUp();
      renderCharacterRosterUI();
      updateHudAvatar();
    }
  });

  // Modal Buttons
  document.getElementById('btn-toggle-skills')?.addEventListener('click', () => toggleModal('skills-modal'));
  document.getElementById('btn-close-skills')?.addEventListener('click', () => toggleModal('skills-modal'));
  document.getElementById('btn-toggle-worldmap')?.addEventListener('click', () => toggleModal('worldmap-modal'));
  document.getElementById('btn-close-worldmap')?.addEventListener('click', () => toggleModal('worldmap-modal'));
  document.getElementById('btn-toggle-stats')?.addEventListener('click', () => toggleModal('stats-modal'));
  document.getElementById('btn-close-stats')?.addEventListener('click', () => toggleModal('stats-modal'));
  document.getElementById('btn-toggle-inventory')?.addEventListener('click', () => toggleModal('inventory-modal'));
  document.getElementById('btn-close-inventory')?.addEventListener('click', () => toggleModal('inventory-modal'));

  // World Channel Switcher Trigger & Modal Listeners
  document.getElementById('channelSelectBtn')?.addEventListener('click', openChannelModal);
  document.getElementById('closeChannelBtn')?.addEventListener('click', closeChannelModal);
  
  const chModal = document.getElementById('channelModal');
  if (chModal) {
    chModal.addEventListener('click', (e) => {
      if (e.target === chModal) closeChannelModal();
    });
  }

  // Pre-render channel list
  renderChannelList();
}

export function openChannelModal() {
  const modal = document.getElementById('channelModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('active');
  modal.style.display = 'flex';
  renderChannelList();
  AudioEngine.playTone(520, 'sine', 0.1, 0.08);
}

export function closeChannelModal() {
  const modal = document.getElementById('channelModal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.classList.add('hidden');
  modal.style.display = 'none';
  AudioEngine.playTone(330, 'triangle', 0.1, 0.08);
}

export function renderChannelList() {
  const container = document.getElementById('channelContent');
  if (!container) return;

  container.innerHTML = `
    <div class="channel-card-stack">
      ${CHANNELS.map(ch => {
        const isCurrent = (MPClient.currentChannel === ch.id);
        return `
          <div class="channel-card ${isCurrent ? 'is-active-channel' : ''}" data-channel="${ch.id}">
            <div class="cc-left">
              <span class="cc-icon">${ch.icon}</span>
              <div class="cc-text-wrap">
                <div class="cc-title">${ch.name} ${isCurrent ? '<span class="cc-badge active">CONNECTED</span>' : ''}</div>
                <div class="cc-desc">${ch.region} Shard • Real-time Multi-Character Instance</div>
              </div>
            </div>
            <button class="cc-btn ${isCurrent ? 'active' : ''}" data-channel="${ch.id}">${isCurrent ? 'Active Shard' : 'Switch Shard'}</button>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.querySelectorAll('.cc-btn, .channel-card').forEach(el => {
    el.onclick = (e) => {
      e.stopPropagation();
      const chId = el.getAttribute('data-channel');
      if (chId) {
        MPClient.changeChannel(chId);
        AudioEngine.playTone(650, 'sine', 0.15, 0.1);
        renderChannelList();
        setTimeout(closeChannelModal, 300);
      }
    };
  });
}

/**
 * Updates Active Shrine Blessing Buffs on HUD
 */
export function updateBuffsHUD() {
  let container = document.getElementById('hud-buffs-container');
  if (!container) {
    const hudPanel = document.getElementById('player-hud');
    if (hudPanel) {
      container = document.createElement('div');
      container.id = 'hud-buffs-container';
      container.className = 'hud-buffs-container';
      hudPanel.appendChild(container);
    } else {
      return;
    }
  }

  if (!player.activeBuffs || player.activeBuffs.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = player.activeBuffs.map(b => {
    const durSec = Math.ceil(b.duration);
    const col = b.color || '#ffd700';
    return `
      <div class="hud-buff-pill" style="border-color:${col}; box-shadow: 0 0 10px ${col}66;" title="${b.name}\n${b.description || ''}">
        <span class="buff-icon">${b.icon || '✨'}</span>
        <span class="buff-name" style="color:${col};">${b.name.replace(/^[^\w]+/, '')}</span>
        <span class="buff-time" style="color:${col};">(${durSec}s)</span>
      </div>
    `;
  }).join('');
}
