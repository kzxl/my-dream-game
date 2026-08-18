/**
 * Inventory & Equipment Paperdoll UI Controller
 */

import { player, groundLoot } from '../state.js';
import { RARITY_COLORS } from '../data/items.js';
import { assets, drawItemSpriteToCanvas } from '../assets.js';
import { AudioEngine } from '../audio.js';
import { spawnDamageNumber } from '../combat.js';
import { renderSkillUpgradeModal } from './skills-ui.js';

export function updateBackpackUI() {
  const grid = document.getElementById('backpack-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const filteredItems = player.bag.filter(item => {
    if (player.bagFilter === 'all') return true;
    if (player.bagFilter === 'weapon') return item.category === 'weapon';
    if (player.bagFilter === 'armor') return item.category === 'armor';
    if (player.bagFilter === 'currency') return item.category === 'currency';
    return true;
  });

  for (let i = 0; i < 16; i++) {
    const slot = document.createElement('div');
    const item = filteredItems[i];

    if (item) {
      slot.className = `bag-slot-card rarity-${item.rarity}`;

      if (item.sprite && assets.equipment.complete) {
        const cvs = document.createElement('canvas');
        cvs.width = 44;
        cvs.height = 44;
        cvs.className = 'bag-slot-canvas';
        drawItemSpriteToCanvas(cvs, item.sprite);
        slot.appendChild(cvs);
      } else {
        const span = document.createElement('span');
        span.className = 'bag-slot-emoji';
        span.innerText = item.icon || '📦';
        slot.appendChild(span);
      }

      slot.addEventListener('mouseenter', e => showItemTooltip(e, item));
      slot.addEventListener('mouseleave', hideItemTooltip);

      slot.addEventListener('click', () => {
        if (item.slot) {
          const prev = player.equipped[item.slot];
          const realIndex = player.bag.indexOf(item);
          if (realIndex !== -1) {
            if (prev) player.bag[realIndex] = prev;
            else player.bag.splice(realIndex, 1);
            player.equipped[item.slot] = item;
            AudioEngine.playPickup();
            updateBackpackUI();
            updatePaperdollUI();
            renderSkillUpgradeModal();
            hideItemTooltip();
          }
        } else if (item.rarity === 'Currency') {
          spawnDamageNumber(player.x, player.y - 40, `Used ${item.name}!`, true, '#e5c07b');
          const realIndex = player.bag.indexOf(item);
          if (realIndex !== -1) player.bag.splice(realIndex, 1);
          AudioEngine.playPickup();
          updateBackpackUI();
          hideItemTooltip();
        }
      });
    } else {
      slot.className = 'bag-slot-card empty-slot';
    }

    grid.appendChild(slot);
  }

  const tag = document.getElementById('bag-count-tag');
  if (tag) tag.innerText = `${player.bag.length} / 16`;
}

export function updatePaperdollUI() {
  const slots = ['Helm', 'Amulet', 'MainHand', 'BodyArmor', 'OffHand', 'Ring', 'Boots'];
  let totalAddedArmor = 0;
  let totalAddedES = 0;

  slots.forEach(slotKey => {
    const item = player.equipped[slotKey];
    const slotEl = document.querySelector(`.doll-slot-frame[data-slot="${slotKey}"]`);
    if (!slotEl) return;

    slotEl.className = `doll-slot-frame slot-${slotKey.toLowerCase()} ${item ? 'rarity-' + item.rarity : ''}`;
    const iconEl = slotEl.querySelector('.doll-slot-icon');

    if (item) {
      if (item.sprite && assets.equipment.complete) {
        iconEl.innerHTML = '';
        const cvs = document.createElement('canvas');
        cvs.width = 38;
        cvs.height = 38;
        cvs.className = 'doll-slot-canvas';
        drawItemSpriteToCanvas(cvs, item.sprite);
        iconEl.appendChild(cvs);
      } else {
        iconEl.innerText = item.icon || '🛡️';
      }

      slotEl.onmouseenter = e => showItemTooltip(e, item);
      slotEl.onmouseleave = hideItemTooltip;
      slotEl.onclick = () => {
        if (player.bag.length < 16) {
          player.bag.push(item);
          delete player.equipped[slotKey];
          AudioEngine.playPickup();
          updatePaperdollUI();
          updateBackpackUI();
          renderSkillUpgradeModal();
          hideItemTooltip();
        } else {
          spawnDamageNumber(player.x, player.y - 40, 'BACKPACK FULL!', true, '#e06c75');
        }
      };

      if (item.primaryStats) {
        if (item.primaryStats['Armor']) totalAddedArmor += parseInt(item.primaryStats['Armor']) || 0;
        if (item.primaryStats['Energy Shield']) totalAddedES += parseInt(item.primaryStats['Energy Shield']) || 0;
      }
    } else {
      iconEl.innerHTML = '';
      iconEl.innerText = getSlotDefaultIcon(slotKey);
      slotEl.onmouseenter = null;
      slotEl.onmouseleave = null;
      slotEl.onclick = null;
    }
  });

  const gArmor = document.getElementById('gss-armor');
  if (gArmor) gArmor.innerText = `+${totalAddedArmor || 770}`;
  const gEs = document.getElementById('gss-es');
  if (gEs) gEs.innerText = `+${totalAddedES || 120}`;
}

export function getSlotDefaultIcon(slotKey) {
  switch (slotKey) {
    case 'Helm': return '👑';
    case 'Amulet': return '📿';
    case 'MainHand': return '⚔️';
    case 'BodyArmor': return '🛡️';
    case 'OffHand': return '🛡️';
    case 'Ring': return '💍';
    case 'Boots': return '👢';
    default: return '📦';
  }
}

const tooltipEl = document.getElementById('item-tooltip');

export function showItemTooltip(e, item) {
  if (!tooltipEl || !item) return;

  document.getElementById('tt-name').innerText = item.name;
  document.getElementById('tt-name').style.color = RARITY_COLORS[item.rarity] || '#ffffff';
  document.getElementById('tt-type').innerText = `${item.rarity} ${item.baseType || ''}`;
  document.getElementById('tt-type').style.color = RARITY_COLORS[item.rarity] || '#abb2bf';

  const iconWrap = document.getElementById('tt-icon-wrap');
  iconWrap.innerHTML = '';
  if (item.sprite && assets.equipment.complete) {
    const cvs = document.createElement('canvas');
    cvs.width = 34;
    cvs.height = 34;
    cvs.className = 'poe-tt-icon-canvas';
    drawItemSpriteToCanvas(cvs, item.sprite);
    iconWrap.appendChild(cvs);
  } else {
    iconWrap.innerHTML = `<span>${item.icon || '📦'}</span>`;
  }

  const statsEl = document.getElementById('tt-stats');
  statsEl.innerHTML = '';
  if (item.primaryStats) {
    for (let k in item.primaryStats) {
      statsEl.innerHTML += `<div>${k}: <b>${item.primaryStats[k]}</b></div>`;
    }
  }

  const modsEl = document.getElementById('tt-mods');
  modsEl.innerHTML = (item.mods || []).map(m => `<div>✦ ${m}</div>`).join('');

  const loreEl = document.getElementById('tt-lore');
  loreEl.innerText = item.lore ? `"${item.lore}"` : '';

  tooltipEl.classList.remove('hidden');
  tooltipEl.style.left = `${Math.min(window.innerWidth - 320, e.clientX + 16)}px`;
  tooltipEl.style.top = `${Math.min(window.innerHeight - 240, e.clientY - 40)}px`;
}

export function hideItemTooltip() {
  if (tooltipEl) tooltipEl.classList.add('hidden');
}

export function pickUpLoot(lootIndex) {
  if (lootIndex < 0 || lootIndex >= groundLoot.length) return;
  const loot = groundLoot[lootIndex];

  if (player.bag.length >= 16) {
    spawnDamageNumber(player.x, player.y - 40, 'BACKPACK FULL!', true, '#e06c75');
    return;
  }

  player.bag.push(loot.item);
  groundLoot.splice(lootIndex, 1);

  AudioEngine.playPickup();
  spawnDamageNumber(player.x, player.y - 45, `+ ${loot.item.name}`, false, RARITY_COLORS[loot.item.rarity]);

  updateBackpackUI();
}
