/**
 * MDG: Aethelis - Advanced Inventory & Equipment Paperdoll Controller
 * 32-Slot Backpack, Auto-Sort, Smart Stacking & Comparison Tooltips
 */

import { player, groundLoot } from '../state.js';
import { RARITY_COLORS, SET_DEFINITIONS, getActiveSetBonuses } from '../data/items.js';
import { assets, drawItemSpriteToCanvas } from '../assets.js';
import { AudioEngine } from '../audio.js';
import { spawnDamageNumber } from '../combat.js';
import { renderSkillUpgradeModal } from './skills-ui.js';
import { saveToDatabase } from '../save-system.js';

export const MAX_BACKPACK_SLOTS = 32;

export function updateBackpackUI() {
  const grid = document.getElementById('backpack-grid');
  if (!grid) return;
  grid.innerHTML = '';

  // Clean and filter
  const filter = player.bagFilter || 'all';
  const filteredItems = player.bag.filter(item => {
    if (!item) return false;
    if (filter === 'all') return true;
    if (filter === 'weapon' || filter === 'gear') return item.slot !== 'Currency' && item.slot !== 'Gem';
    if (filter === 'gem') return item.slot === 'Gem' || (item.name && item.name.includes('Gem'));
    if (filter === 'currency') return item.slot === 'Currency' || item.rarity === 'Currency';
    return true;
  });

  for (let i = 0; i < MAX_BACKPACK_SLOTS; i++) {
    const slot = document.createElement('div');
    const item = filteredItems[i];

    if (item) {
      slot.className = `bag-slot-card rarity-${item.rarity || 'Normal'}`;

      if (item.sprite && assets.equipment && assets.equipment.complete) {
        const cvs = document.createElement('canvas');
        cvs.width = 44;
        cvs.height = 44;
        cvs.className = 'bag-slot-canvas';
        drawItemSpriteToCanvas(cvs, item.sprite);
        slot.appendChild(cvs);
      } else {
        const span = document.createElement('span');
        span.className = 'bag-slot-emoji';
        span.innerText = item.icon || (item.slot === 'Currency' ? '🔮' : '📦');
        slot.appendChild(span);
      }

      // Quantity stack badge for currency
      if (item.stack && item.stack > 1) {
        const stackBadge = document.createElement('span');
        stackBadge.className = 'item-stack-badge';
        stackBadge.innerText = item.stack;
        slot.appendChild(stackBadge);
      }

      slot.addEventListener('mouseenter', e => showItemTooltip(e, item));
      slot.addEventListener('mouseleave', hideItemTooltip);

      // 1-Click Equip or Use
      slot.addEventListener('click', () => {
        if (item.slot && item.slot !== 'Currency' && item.slot !== 'Gem' && item.category !== 'map') {
          // Check level requirement
          if (item.requiredLevel && player.level < item.requiredLevel) {
            spawnDamageNumber(player.x, player.y - 45, `⚠️ Requires Level ${item.requiredLevel}! (Lv.${player.level})`, true, '#e06c75');
            AudioEngine.playTone(220, 'sawtooth', 0.2, 0.2);
            return;
          }

          // Equip gear to Paperdoll
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
            saveToDatabase(true);
          }
        } else if (item.slot === 'Currency' || item.rarity === 'Currency') {
          // Quick hint or use
          spawnDamageNumber(player.x, player.y - 40, `🔮 ${item.name}`, false, '#ffd700');
          AudioEngine.playPickup();
        } else if (item.id === 'scroll_resurrection' || item.category === 'consumable') {
          spawnDamageNumber(player.x, player.y - 40, `📜 ${item.name} (Auto-consumed upon defeat)`, false, '#ffd700');
          AudioEngine.playPickup();
        }
      });
    } else {
      slot.className = 'bag-slot-card empty-slot';
      slot.innerHTML = `<span class="empty-slot-idx">${i + 1}</span>`;
    }

    grid.appendChild(slot);
  }

  const tag = document.getElementById('bag-count-tag');
  if (tag) tag.innerText = `${player.bag.length} / ${MAX_BACKPACK_SLOTS}`;
}

export function updatePaperdollUI() {
  const slots = ['Helm', 'Amulet', 'MainHand', 'BodyArmor', 'OffHand', 'Ring', 'Boots'];
  let totalAddedArmor = 0;
  let totalAddedES = 0;

  slots.forEach(slotKey => {
    const item = player.equipped[slotKey];
    const slotEl = document.querySelector(`.doll-slot-frame[data-slot="${slotKey}"]`);
    if (!slotEl) return;

    slotEl.className = `doll-slot-frame slot-${slotKey.toLowerCase()} ${item ? 'rarity-' + (item.rarity || 'Normal') : ''}`;
    const iconEl = slotEl.querySelector('.doll-slot-icon');

    if (item) {
      if (item.sprite && assets.equipment && assets.equipment.complete) {
        iconEl.innerHTML = '';
        const cvs = document.createElement('canvas');
        cvs.width = 38;
        cvs.height = 38;
        cvs.className = 'doll-slot-canvas';
        drawItemSpriteToCanvas(cvs, item.sprite);
        iconEl.appendChild(cvs);
      } else {
        iconEl.innerText = item.icon || getSlotDefaultIcon(slotKey);
      }

      slotEl.onmouseenter = e => showItemTooltip(e, item);
      slotEl.onmouseleave = hideItemTooltip;
      slotEl.onclick = () => {
        // Unequip item back to Backpack
        if (player.bag.length < MAX_BACKPACK_SLOTS) {
          player.bag.push(item);
          delete player.equipped[slotKey];
          AudioEngine.playPickup();
          updatePaperdollUI();
          updateBackpackUI();
          renderSkillUpgradeModal();
          hideItemTooltip();
          saveToDatabase(true);
        } else {
          spawnDamageNumber(player.x, player.y - 40, 'BACKPACK FULL!', true, '#e06c75');
        }
      };

      if (item.primaryStats) {
        if (item.primaryStats['Armor']) totalAddedArmor += parseInt(item.primaryStats['Armor']) || 0;
        if (item.primaryStats['Energy Shield']) totalAddedES += parseInt(item.primaryStats['Energy Shield']) || 0;
      }
      if (item.stats) {
        if (item.stats.armor) totalAddedArmor += parseInt(item.stats.armor) || 0;
        if (item.stats.es) totalAddedES += parseInt(item.stats.es) || 0;
      }
    } else {
      iconEl.innerHTML = '';
      iconEl.innerText = getSlotDefaultIcon(slotKey);
      slotEl.onmouseenter = null;
      slotEl.onmouseleave = null;
      slotEl.onclick = null;
    }
  });

  // Calculate & Apply Active Set Bonuses
  const { activeSets, totalBonusStats, hiddenSynergies } = getActiveSetBonuses(player);
  player.activeSets = activeSets;
  player.setBonusStats = totalBonusStats;
  player.activeHiddenSynergies = hiddenSynergies;

  if (totalBonusStats.armorPct) totalAddedArmor = Math.round(totalAddedArmor * (1 + totalBonusStats.armorPct / 100));
  if (totalBonusStats.es) totalAddedES += totalBonusStats.es;

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

/**
 * Auto-Sorts items by Rarity priority and consolidates currency stacks
 */
export function sortAndConsolidateBackpack() {
  const currencyStacks = {};
  const nonCurrencyItems = [];

  player.bag.forEach(item => {
    if (!item) return;
    if (item.slot === 'Currency' || item.rarity === 'Currency') {
      const key = item.name;
      if (!currencyStacks[key]) {
        currencyStacks[key] = { ...item, stack: item.stack || 1 };
      } else {
        currencyStacks[key].stack = (currencyStacks[key].stack || 1) + (item.stack || 1);
      }
    } else {
      nonCurrencyItems.push(item);
    }
  });

  const rarityPriority = { Unique: 1, Rare: 2, Magic: 3, Gem: 4, Normal: 5 };
  nonCurrencyItems.sort((a, b) => (rarityPriority[a.rarity] || 9) - (rarityPriority[b.rarity] || 9));

  player.bag = [...nonCurrencyItems, ...Object.values(currencyStacks)];
  AudioEngine.playPickup();
  updateBackpackUI();
  saveToDatabase(true);
}

const tooltipEl = document.getElementById('item-tooltip');

export function showItemTooltip(e, item) {
  if (!tooltipEl || !item) return;

  const ttName = document.getElementById('tt-name');
  if (ttName) {
    ttName.innerText = item.name + (item.stack && item.stack > 1 ? ` (x${item.stack})` : '');
    ttName.style.color = RARITY_COLORS[item.rarity] || '#ffffff';
  }

  const ttType = document.getElementById('tt-type');
  if (ttType) {
    ttType.innerText = `${item.rarity || 'Normal'} ${item.baseType || item.slot || ''} ${item.iLvl ? `(iLvl ${item.iLvl})` : ''}`;
    ttType.style.color = RARITY_COLORS[item.rarity] || '#abb2bf';
  }

  const iconWrap = document.getElementById('tt-icon-wrap');
  if (iconWrap) {
    iconWrap.innerHTML = '';
    if (item.sprite && assets.equipment && assets.equipment.complete) {
      const cvs = document.createElement('canvas');
      cvs.width = 34;
      cvs.height = 34;
      cvs.className = 'poe-tt-icon-canvas';
      drawItemSpriteToCanvas(cvs, item.sprite);
      iconWrap.appendChild(cvs);
    } else {
      iconWrap.innerHTML = `<span>${item.icon || (item.slot === 'Currency' ? '🔮' : '📦')}</span>`;
    }
  }

  const statsEl = document.getElementById('tt-stats');
  if (statsEl) {
    statsEl.innerHTML = '';

    // Item Level & Level Requirement Row
    const reqLvl = item.requiredLevel || 1;
    const meetsReq = (player.level || 1) >= reqLvl;
    statsEl.innerHTML += `
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:11px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:4px;">
        <span>Item Level: <b style="color:#ffd700;">${item.iLvl || 1}</b></span>
        <span style="color:${meetsReq ? '#98c379' : '#e06c75'}; font-weight:700;">
          Requires Level: <b>${reqLvl}</b> ${meetsReq ? '✓' : '⚠️'}
        </span>
      </div>
    `;

    if (item.primaryStats) {
      for (let k in item.primaryStats) {
        statsEl.innerHTML += `<div>${k}: <b>${item.primaryStats[k]}</b></div>`;
      }
    }
    if (item.stats) {
      for (let [k, v] of Object.entries(item.stats)) {
        statsEl.innerHTML += `<div>+${v} ${k}</div>`;
      }
    }
  }

  const modsEl = document.getElementById('tt-mods');
  if (modsEl) {
    let modsHtml = (item.mods || []).map(m => {
      // Highlight Tier tags like (T1), (T2)
      const coloredMod = m.replace(/\(T1\)/g, '<b style="color:#ffd700;">(T1)</b>')
                          .replace(/\(T2\)/g, '<b style="color:#00f2fe;">(T2)</b>')
                          .replace(/\(T3\)/g, '<b style="color:#c678dd;">(T3)</b>')
                          .replace(/\(T4\)/g, '<b style="color:#8888ff;">(T4)</b>')
                          .replace(/\(T5\)/g, '<b style="color:#abb2bf;">(T5)</b>');
      return `<div>✦ ${coloredMod}</div>`;
    }).join('');

    if (item.craftedMods) {
      modsHtml += item.craftedMods.map(m => `<div style="color:#00f2fe">🔨 [Forge] ${m}</div>`).join('');
    }

    // --- SET ITEMS & HIDDEN SYNERGIES SECTION ---
    if (item.setId && SET_DEFINITIONS[item.setId]) {
      const setDef = SET_DEFINITIONS[item.setId];
      const equippedPieces = Object.values(player.equipped || {}).filter(it => it && it.setId === item.setId);
      const activeCount = equippedPieces.length;

      let piecesListHtml = setDef.pieces.map(p => {
        const isEquipped = equippedPieces.some(ep => ep.name === p.name);
        return `<div style="color:${isEquipped ? '#00e676' : '#7f8c8d'}; font-size:11px; margin-left:8px;">
          ${isEquipped ? '✔' : '○'} ${p.name}
        </div>`;
      }).join('');

      let bonusesListHtml = setDef.bonuses.map(b => {
        const isUnlocked = activeCount >= b.count;
        return `<div style="color:${isUnlocked ? '#00e676' : '#666'}; font-size:11px; margin-top:2px; font-weight:${isUnlocked ? '600' : 'normal'};">
          ${isUnlocked ? '★' : '☆'} (${b.count}) Set: ${b.desc}
        </div>`;
      }).join('');

      modsHtml += `
        <div class="tt-set-panel" style="margin-top:8px; padding-top:6px; border-top:1px dashed #00e676;">
          <div style="color:#00e676; font-weight:700; font-size:12px; margin-bottom:4px;">
            🌿 Set: ${setDef.name} (${activeCount}/${setDef.pieces.length})
          </div>
          <div style="margin-bottom:6px;">${piecesListHtml}</div>
          <div style="background:rgba(0,230,118,0.06); padding:4px 6px; border-radius:4px;">
            ${bonusesListHtml}
          </div>
        </div>
      `;
    }

    modsEl.innerHTML = modsHtml;
  }

  const loreEl = document.getElementById('tt-lore');
  if (loreEl) loreEl.innerText = item.lore || item.description ? `"${item.lore || item.description}"` : '';

  tooltipEl.classList.remove('hidden');
  tooltipEl.style.left = `${Math.min(window.innerWidth - 340, e.clientX + 16)}px`;
  tooltipEl.style.top = `${Math.min(window.innerHeight - 260, e.clientY - 40)}px`;
}

export function hideItemTooltip() {
  if (tooltipEl) tooltipEl.classList.add('hidden');
}

export function pickUpLoot(lootIndex) {
  if (lootIndex < 0 || lootIndex >= groundLoot.length) return;
  const loot = groundLoot[lootIndex];

  if (player.bag.length >= MAX_BACKPACK_SLOTS) {
    spawnDamageNumber(player.x, player.y - 40, 'BACKPACK FULL!', true, '#e06c75');
    return;
  }

  player.bag.push(loot.item);
  groundLoot.splice(lootIndex, 1);

  AudioEngine.playPickup();
  spawnDamageNumber(player.x, player.y - 45, `+ ${loot.item.name}`, false, RARITY_COLORS[loot.item.rarity]);

  updateBackpackUI();
}
