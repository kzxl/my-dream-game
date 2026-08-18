/**
 * HUD, Modals & User Interface Controller (With Detailed Attributes & Multi-Character Roster)
 */

import { player, camera } from '../state.js';
import { AudioEngine } from '../audio.js';
import { spawnDamageNumber } from '../combat.js';
import { updateBackpackUI, updatePaperdollUI } from './inventory.js';
import { updateSkillBadges, renderSkillUpgradeModal } from './skills-ui.js';
import { saveToDatabase, renderCharacterRosterUI, createNewCharacter } from '../save-system.js';
import { renderWorldMapUI } from './worldmap-ui.js';

export function showZoneBanner(title, sub) {
  const banner = document.getElementById('zone-banner');
  if (!banner) return;
  document.getElementById('zone-banner-title').innerText = title.toUpperCase();
  document.getElementById('zone-banner-sub').innerText = sub;
  banner.classList.remove('zone-banner-hide');
  clearTimeout(banner._timeout);
  banner._timeout = setTimeout(() => banner.classList.add('zone-banner-hide'), 3500);
}

export function setGender(newGender) {
  player.gender = newGender;
  const avatar = document.getElementById('hud-avatar');
  const tag = document.getElementById('hud-gender-tag');

  if (newGender === 'Female') {
    avatar.classList.add('avatar-female');
    tag.innerText = '♀ Female';
    tag.style.color = '#ff79c6';
  } else {
    avatar.classList.remove('avatar-female');
    tag.innerText = '♂ Male';
    tag.style.color = '#61afef';
  }
  spawnDamageNumber(player.x, player.y - 40, `Hero: ${newGender}`, false, '#98c379');
  saveToDatabase(true);
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

  // Gender Switch
  document.getElementById('btn-toggle-gender')?.addEventListener('click', () => {
    setGender(player.gender === 'Male' ? 'Female' : 'Male');
  });

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

  // Inventory Filters
  document.querySelectorAll('.bag-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.bag-tab').forEach(t => t.classList.remove('active-tab'));
      tab.classList.add('active-tab');
      player.bagFilter = tab.getAttribute('data-filter');
      updateBackpackUI();
    });
  });

  // Sort Bag
  document.getElementById('btn-sort-bag')?.addEventListener('click', () => {
    const rarityPriority = { Unique: 1, Rare: 2, Magic: 3, Currency: 4, Normal: 5 };
    player.bag.sort((a, b) => (rarityPriority[a.rarity] || 9) - (rarityPriority[b.rarity] || 9));
    AudioEngine.playPickup();
    updateBackpackUI();
    saveToDatabase(true);
  });

  // Character Roster & Creation Listeners
  document.getElementById('btn-toggle-roster')?.addEventListener('click', () => toggleModal('character-roster-modal'));
  document.getElementById('btn-close-roster')?.addEventListener('click', () => toggleModal('character-roster-modal'));
  document.getElementById('btn-submit-create-hero')?.addEventListener('click', async () => {
    const name = document.getElementById('new-hero-name')?.value.trim() || 'New Hero';
    const gender = document.querySelector('input[name="new-hero-gender"]:checked')?.value || 'Male';
    const spec = document.getElementById('new-hero-class')?.value || 'Novice';

    const success = await createNewCharacter(name, gender, spec);
    if (success) {
      AudioEngine.playLevelUp();
      renderCharacterRosterUI();
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
}
