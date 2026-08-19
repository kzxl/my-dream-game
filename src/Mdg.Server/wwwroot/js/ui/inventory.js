/**
 * MDG: Aethelis - Advanced Inventory & Paperdoll Controller (ARPG Pro System)
 * 32-Slot Backpack, HTML5 Drag & Drop, Right-Click Context Menu,
 * Dynamic Live Gear Calculator, Side-by-Side Tooltip Comparison & Multi-Mode Auto-Sort
 */

import { player, groundLoot } from '../state.js';
import { RARITY_COLORS, SET_DEFINITIONS, getActiveSetBonuses } from '../data/items.js';
import { assets, drawItemSpriteToCanvas } from '../assets.js';
import { AudioEngine } from '../audio.js';
import { spawnDamageNumber } from '../combat.js';
import { saveToDatabase } from '../save-system.js';
import { companion } from '../companion.js';

export const MAX_BACKPACK_SLOTS = 32;

// Active Drag & Drop State
let draggedItemInfo = null;

// Active Context Menu State
let contextItemData = null;

/**
 * Categorize item for Tab Filtering
 */
export function getItemCategory(item) {
  if (!item) return 'empty';
  if (item.slot === 'MainHand' || item.category === 'weapon') return 'weapon';
  if (['BodyArmor', 'Helm', 'OffHand', 'Boots'].includes(item.slot) || item.category === 'armor') return 'armor';
  if (['Ring', 'Amulet'].includes(item.slot) || item.category === 'accessory') return 'accessory';
  if (item.slot === 'Currency' || item.rarity === 'Currency' || item.slot === 'Gem' || item.rarity === 'SkillGem' || item.rarity === 'SupportGem') return 'currency';
  if (item.category === 'consumable' || item.id === 'scroll_resurrection' || item.category === 'map' || item.slot === 'Map') return 'consumable';
  return 'other';
}

/**
 * Refresh Tab Counts
 */
export function updateCategoryTabCounts() {
  const counts = { all: player.bag.length, weapon: 0, armor: 0, accessory: 0, currency: 0, consumable: 0 };

  player.bag.forEach(item => {
    if (!item) return;
    const cat = getItemCategory(item);
    if (counts[cat] !== undefined) counts[cat]++;
  });

  for (let key in counts) {
    const badge = document.getElementById(`tab-cnt-${key}`);
    if (badge) badge.innerText = counts[key];
  }
}

/**
 * Update Wealth & Currency Summary Footer Bar
 */
export function updateWealthBar() {
  let gold = player.gold || 1500;
  let sparks = 0;
  let prisms = 0;
  let cores = 0;
  let scrolls = 0;

  player.bag.forEach(item => {
    if (!item) return;
    const name = item.name || '';
    const stack = item.stack || 1;
    if (name.includes('Aether Spark')) sparks += stack;
    else if (name.includes('Genesis Prism')) prisms += stack;
    else if (name.includes('Fracture Core')) cores += stack;
    else if (name.includes('Resurrection') || item.id === 'scroll_resurrection') scrolls += stack;
  });

  const elGold = document.getElementById('wealth-gold');
  if (elGold) elGold.innerText = gold.toLocaleString();
  const elSparks = document.getElementById('wealth-sparks');
  if (elSparks) elSparks.innerText = sparks;
  const elPrisms = document.getElementById('wealth-prisms');
  if (elPrisms) elPrisms.innerText = prisms;
  const elCores = document.getElementById('wealth-cores');
  if (elCores) elCores.innerText = cores;
  const elScrolls = document.getElementById('wealth-scrolls');
  if (elScrolls) elScrolls.innerText = scrolls;
}

/**
 * Filter items according to active Tab & Search input
 */
function getFilteredBagItems() {
  const filter = player.bagFilter || 'all';
  const query = (player.bagSearchQuery || '').toLowerCase().trim();

  return player.bag.map((item, originalIndex) => ({ item, originalIndex })).filter(({ item }) => {
    if (!item) return false;

    // 1. Category tab filter
    if (filter !== 'all') {
      const cat = getItemCategory(item);
      if (cat !== filter) return false;
    }

    // 2. Search query filter
    if (query) {
      const name = (item.name || '').toLowerCase();
      const rarity = (item.rarity || '').toLowerCase();
      const baseType = (item.baseType || item.slot || '').toLowerCase();
      const mods = (item.mods || []).join(' ').toLowerCase();
      const crafted = (item.craftedMods || []).join(' ').toLowerCase();
      const stats = JSON.stringify(item.stats || {}).toLowerCase();
      const match = name.includes(query) || rarity.includes(query) || baseType.includes(query) ||
                    mods.includes(query) || crafted.includes(query) || stats.includes(query);
      if (!match) return false;
    }

    return true;
  });
}

/**
 * Main Backpack Grid Renderer
 */
export function updateBackpackUI() {
  const grid = document.getElementById('backpack-grid');
  if (!grid) return;
  grid.innerHTML = '';

  updateCategoryTabCounts();
  updateWealthBar();

  const filteredEntries = getFilteredBagItems();
  const isFiltering = (player.bagFilter && player.bagFilter !== 'all') || (player.bagSearchQuery && player.bagSearchQuery.trim() !== '');

  for (let i = 0; i < MAX_BACKPACK_SLOTS; i++) {
    const slot = document.createElement('div');
    slot.setAttribute('data-slot-idx', i);

    let item = null;
    let realIndex = i;

    if (isFiltering) {
      if (i < filteredEntries.length) {
        item = filteredEntries[i].item;
        realIndex = filteredEntries[i].originalIndex;
      }
    } else {
      item = player.bag[i];
      realIndex = i;
    }

    if (item) {
      slot.className = `bag-slot-card rarity-${item.rarity || 'Normal'}`;
      slot.setAttribute('draggable', 'true');

      // Sprite Canvas or Emoji
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

      // Quantity stack badge
      if (item.stack && item.stack > 1) {
        const stackBadge = document.createElement('span');
        stackBadge.className = 'item-stack-badge';
        stackBadge.innerText = `x${item.stack}`;
        slot.appendChild(stackBadge);
      }

      // Lock badge
      if (item.locked) {
        const lockBadge = document.createElement('span');
        lockBadge.className = 'item-lock-badge';
        lockBadge.innerText = '🔒';
        lockBadge.title = 'Item is Locked (Protected)';
        slot.appendChild(lockBadge);
      }

      // Tier / iLvl tag
      if (item.iLvl || item.tier) {
        const tierTag = document.createElement('span');
        tierTag.className = 'item-tier-tag';
        tierTag.innerText = item.tier ? `T${item.tier}` : `i${item.iLvl}`;
        slot.appendChild(tierTag);
      }

      // Tooltip events
      slot.addEventListener('mouseenter', e => showItemTooltip(e, item, 'bag'));
      slot.addEventListener('mousemove', e => positionItemTooltip(e));
      slot.addEventListener('mouseleave', hideItemTooltip);

      // Left-Click: Equip or Toggle Lock on Alt+Click
      slot.addEventListener('click', e => {
        if (e.altKey) {
          // Alt+Click -> Toggle Lock
          toggleItemLock(item);
          e.stopPropagation();
          return;
        }

        // Fast Equip / Use on Left Click
        handleQuickEquipOrUse(item, realIndex);
      });

      // Right-Click: Open Context Menu
      slot.addEventListener('contextmenu', e => {
        e.preventDefault();
        e.stopPropagation();
        openContextMenu(e, item, 'bag', realIndex);
      });

      // Drag & Drop Start
      slot.addEventListener('dragstart', e => {
        draggedItemInfo = { source: 'bag', index: realIndex, item: item };
        slot.classList.add('dragging');
        e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'bag', index: realIndex }));
        e.dataTransfer.effectAllowed = 'move';
        hideItemTooltip();
      });

      slot.addEventListener('dragend', () => {
        slot.classList.remove('dragging');
        document.querySelectorAll('.bag-slot-card, .doll-slot-frame').forEach(el => el.classList.remove('drag-over'));
        draggedItemInfo = null;
      });

    } else {
      slot.className = 'bag-slot-card empty-slot';
      slot.innerHTML = `<span class="empty-slot-idx">${i + 1}</span>`;
    }

    // Drag Over & Drop Events on Bag Slot (occupied or empty)
    slot.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      slot.classList.add('drag-over');
    });

    slot.addEventListener('dragleave', () => {
      slot.classList.remove('drag-over');
    });

    slot.addEventListener('drop', e => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      handleBagDrop(realIndex);
    });

    grid.appendChild(slot);
  }

  const tag = document.getElementById('bag-count-tag');
  if (tag) tag.innerText = `${player.bag.length} / ${MAX_BACKPACK_SLOTS}`;
}

/**
 * Handle Drag & Drop onto a Bag Slot
 */
function handleBagDrop(targetIndex) {
  if (!draggedItemInfo) return;

  const { source, index: sourceIndex, slot: sourceSlot, item } = draggedItemInfo;

  if (source === 'bag') {
    if (sourceIndex === targetIndex) return;

    // Swap items in bag
    const temp = player.bag[targetIndex];
    player.bag[targetIndex] = player.bag[sourceIndex];
    if (temp) {
      player.bag[sourceIndex] = temp;
    } else {
      player.bag.splice(sourceIndex, 1);
    }
    // Clean nulls
    player.bag = player.bag.filter(Boolean);

    AudioEngine.playPickup();
    updateBackpackUI();
    saveToDatabase(true);

  } else if (source === 'paperdoll') {
    // Unequip from paperdoll into bag target
    if (player.bag.length >= MAX_BACKPACK_SLOTS && !player.bag[targetIndex]) {
      spawnDamageNumber(player.x, player.y - 40, 'BACKPACK FULL!', true, '#e06c75');
      return;
    }

    const currentGear = player.equipped[sourceSlot];
    delete player.equipped[sourceSlot];

    if (player.bag[targetIndex]) {
      // If target bag slot has item and matches slot, equip target item!
      const targetBagItem = player.bag[targetIndex];
      if (targetBagItem.slot === sourceSlot) {
        player.equipped[sourceSlot] = targetBagItem;
        player.bag[targetIndex] = currentGear;
      } else {
        player.bag.push(currentGear);
      }
    } else {
      player.bag[targetIndex] = currentGear;
      player.bag = player.bag.filter(Boolean);
    }

    AudioEngine.playPickup();
    updatePaperdollUI();
    updateBackpackUI();
    renderSkillUpgradeModal();
    saveToDatabase(true);
  }
}

/**
 * Live Dynamic Gear Stats Calculator & Paperdoll Renderer
 */
export function updatePaperdollUI() {
  const slots = ['Helm', 'Amulet', 'MainHand', 'BodyArmor', 'OffHand', 'Ring', 'Boots'];
  let totalArmor = 0;
  let totalES = 0;
  let totalPhysDmg = 0;
  let totalElemDmg = 0;
  let totalAllRes = 0;
  let totalCritChance = 0;
  let totalCritMulti = 0;
  let totalMoveSpeed = 0;
  let totalAttackSpeed = 0;
  let totalGearScore = 0;

  slots.forEach(slotKey => {
    const item = player.equipped[slotKey];
    const slotEl = document.querySelector(`.doll-slot-frame[data-slot="${slotKey}"]`);
    if (!slotEl) return;

    slotEl.className = `doll-slot-frame slot-${slotKey.toLowerCase()} ${item ? 'rarity-' + (item.rarity || 'Normal') : ''}`;
    const iconEl = slotEl.querySelector('.doll-slot-icon');

    if (item) {
      slotEl.setAttribute('draggable', 'true');

      if (item.sprite && assets.equipment && assets.equipment.complete) {
        iconEl.innerHTML = '';
        const cvs = document.createElement('canvas');
        cvs.width = 44;
        cvs.height = 44;
        cvs.className = 'doll-slot-canvas';
        drawItemSpriteToCanvas(cvs, item.sprite);
        iconEl.appendChild(cvs);
      } else {
        iconEl.innerHTML = '';
        iconEl.innerText = item.icon || getSlotDefaultIcon(slotKey);
      }

      slotEl.onmouseenter = e => showItemTooltip(e, item, 'paperdoll');
      slotEl.onmousemove = e => positionItemTooltip(e);
      slotEl.onmouseleave = hideItemTooltip;

      // Left-click to unequip
      slotEl.onclick = () => {
        unequipItemToBag(slotKey, item);
      };

      // Right-click context menu
      slotEl.oncontextmenu = e => {
        e.preventDefault();
        e.stopPropagation();
        openContextMenu(e, item, 'paperdoll', slotKey);
      };

      // Drag start from paperdoll
      slotEl.ondragstart = e => {
        draggedItemInfo = { source: 'paperdoll', slot: slotKey, item: item };
        slotEl.classList.add('dragging');
        e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'paperdoll', slot: slotKey }));
        e.dataTransfer.effectAllowed = 'move';
        hideItemTooltip();
      };

      slotEl.ondragend = () => {
        slotEl.classList.remove('dragging');
        document.querySelectorAll('.bag-slot-card, .doll-slot-frame').forEach(el => el.classList.remove('drag-over'));
        draggedItemInfo = null;
      };

      // Calculate stats from item
      if (item.primaryStats) {
        if (item.primaryStats['Armor']) totalArmor += parseInt(item.primaryStats['Armor']) || 0;
        if (item.primaryStats['Energy Shield']) totalES += parseInt(item.primaryStats['Energy Shield']) || 0;
        if (item.primaryStats['Physical Damage']) totalPhysDmg += parseInt(item.primaryStats['Physical Damage']) || 0;
      }
      if (item.baseStats) {
        if (item.baseStats.damage) totalPhysDmg += item.baseStats.damage;
        if (item.baseStats.armor) totalArmor += item.baseStats.armor;
        if (item.baseStats.es) totalES += item.baseStats.es;
        if (item.baseStats.speed) totalMoveSpeed += item.baseStats.speed;
        if (item.baseStats.critChance) totalCritChance += item.baseStats.critChance;
        if (item.baseStats.critMulti) totalCritMulti += item.baseStats.critMulti;
      }
      if (item.stats) {
        if (item.stats.armor) totalArmor += parseInt(item.stats.armor) || 0;
        if (item.stats.es) totalES += parseInt(item.stats.es) || 0;
        if (item.stats.damage || item.stats.flatPhys) totalPhysDmg += parseInt(item.stats.damage || item.stats.flatPhys) || 0;
        if (item.stats.flatLife) totalArmor += Math.round((item.stats.flatLife || 0) * 0.5);
        if (item.stats.fireRes || item.stats.coldRes || item.stats.lightningRes) {
          totalAllRes += Math.round(((item.stats.fireRes || 0) + (item.stats.coldRes || 0) + (item.stats.lightningRes || 0)) / 3);
        }
        if (item.stats.allRes) totalAllRes += item.stats.allRes;
        if (item.stats.attackSpeed) totalAttackSpeed += item.stats.attackSpeed;
        if (item.stats.critChance) totalCritChance += item.stats.critChance;
        if (item.stats.critMulti) totalCritMulti += item.stats.critMulti;
      }

      totalGearScore += (item.iLvl || 10) * (item.rarity === 'Unique' ? 4 : item.rarity === 'Set' ? 3.5 : item.rarity === 'Rare' ? 2.5 : 1.5);

    } else {
      slotEl.removeAttribute('draggable');
      iconEl.innerHTML = '';
      iconEl.innerText = getSlotDefaultIcon(slotKey);
      slotEl.onmouseenter = null;
      slotEl.onmouseleave = null;
      slotEl.onclick = null;
      slotEl.oncontextmenu = null;
      slotEl.ondragstart = null;
    }

    // Drag Over on Paperdoll slot
    slotEl.ondragover = e => {
      e.preventDefault();
      if (draggedItemInfo && draggedItemInfo.item && draggedItemInfo.item.slot === slotKey) {
        e.dataTransfer.dropEffect = 'move';
        slotEl.classList.add('drag-over');
      }
    };

    slotEl.ondragleave = () => {
      slotEl.classList.remove('drag-over');
    };

    slotEl.ondrop = e => {
      e.preventDefault();
      slotEl.classList.remove('drag-over');
      if (draggedItemInfo && draggedItemInfo.source === 'bag') {
        const itemToEquip = draggedItemInfo.item;
        if (itemToEquip && itemToEquip.slot === slotKey) {
          handleQuickEquipOrUse(itemToEquip, draggedItemInfo.index);
        }
      }
    };
  });

  // Calculate & Apply Active Set Bonuses
  const { activeSets, totalBonusStats, hiddenSynergies } = getActiveSetBonuses(player);
  player.activeSets = activeSets;
  player.setBonusStats = totalBonusStats;
  player.activeHiddenSynergies = hiddenSynergies;

  if (totalBonusStats.armorPct) totalArmor = Math.round(totalArmor * (1 + totalBonusStats.armorPct / 100));
  if (totalBonusStats.es) totalES += totalBonusStats.es;
  if (totalBonusStats.allRes) totalAllRes += totalBonusStats.allRes;
  if (totalBonusStats.elemDmgPct) totalElemDmg += totalBonusStats.elemDmgPct;
  if (totalBonusStats.critMulti) totalCritMulti += totalBonusStats.critMulti;

  // Render Set Bonus Badges in Paperdoll
  const setsBox = document.getElementById('paperdoll-sets-container');
  const setsList = document.getElementById('paperdoll-sets-list');
  if (setsBox && setsList) {
    if (activeSets && activeSets.length > 0) {
      setsBox.classList.remove('hidden');
      setsList.innerHTML = activeSets.map(s => `
        <div class="set-bonus-badge">
          ★ ${s.name} (${s.count}/${s.totalPieces}) • +${s.unlockedBonus}
        </div>
      `).join('');
    } else {
      setsBox.classList.add('hidden');
      setsList.innerHTML = '';
    }
  }

  // Update Dynamic Stats Grid
  const gArmor = document.getElementById('gss-armor');
  if (gArmor) gArmor.innerText = `+${totalArmor}`;
  const gEs = document.getElementById('gss-es');
  if (gEs) gEs.innerText = `+${totalES}`;
  const gPhys = document.getElementById('gss-phys');
  if (gPhys) gPhys.innerText = `+${totalPhysDmg}`;
  const gElem = document.getElementById('gss-elem');
  if (gElem) gElem.innerText = `+${totalElemDmg}%`;
  const gRes = document.getElementById('gss-res');
  if (gRes) gRes.innerText = `+${totalAllRes}%`;
  const gCrit = document.getElementById('gss-crit');
  if (gCrit) gCrit.innerText = `+${totalCritChance}% / +${totalCritMulti}%`;
  const gSpeed = document.getElementById('gss-speed');
  if (gSpeed) gSpeed.innerText = `+${totalMoveSpeed}%`;
  const gAs = document.getElementById('gss-as');
  if (gAs) gAs.innerText = `+${totalAttackSpeed}%`;

  const scoreEl = document.getElementById('paperdoll-gear-score');
  if (scoreEl) scoreEl.innerText = `Score: ${Math.round(totalGearScore)}`;
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
 * 1-Click / Fast Equip or Use
 */
export function handleQuickEquipOrUse(item, bagIndex) {
  if (!item) return;

  if (item.slot && item.slot !== 'Currency' && item.slot !== 'Gem' && item.category !== 'map') {
    // Check level requirement
    if (item.requiredLevel && player.level < item.requiredLevel) {
      spawnDamageNumber(player.x, player.y - 45, `⚠️ Requires Level ${item.requiredLevel}! (Lv.${player.level})`, true, '#e06c75');
      AudioEngine.playTone(220, 'sawtooth', 0.2, 0.2);
      return;
    }

    // Equip gear to Paperdoll
    const prev = player.equipped[item.slot];
    if (bagIndex !== undefined && bagIndex >= 0) {
      if (prev) player.bag[bagIndex] = prev;
      else player.bag.splice(bagIndex, 1);
    } else {
      const idx = player.bag.indexOf(item);
      if (idx !== -1) {
        if (prev) player.bag[idx] = prev;
        else player.bag.splice(idx, 1);
      }
    }

    player.equipped[item.slot] = item;
    playItemEquipAudio(item);
    spawnDamageNumber(player.x, player.y - 40, `Equipped: ${item.name}`, false, RARITY_COLORS[item.rarity] || '#00e676');

    updateBackpackUI();
    updatePaperdollUI();
    renderSkillUpgradeModal();
    hideItemTooltip();
    saveToDatabase(true);

  } else if (item.slot === 'Currency' || item.rarity === 'Currency') {
    spawnDamageNumber(player.x, player.y - 40, `🔮 ${item.name} (Use at Genesis Forge Bench [B])`, false, '#ffd700');
    AudioEngine.playPickup();
  } else if (item.id === 'scroll_resurrection' || item.category === 'consumable') {
    spawnDamageNumber(player.x, player.y - 40, `📜 ${item.name} (Auto-consumed upon defeat)`, false, '#ffd700');
    AudioEngine.playPickup();
  } else if (item.category === 'map' || item.slot === 'Map') {
    spawnDamageNumber(player.x, player.y - 40, `🌌 ${item.name} (Insert into Map Device [O])`, false, '#00f2fe');
    AudioEngine.playPickup();
  }
}

/**
 * Unequip item back to Bag
 */
export function unequipItemToBag(slotKey, item) {
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
}

/**
 * Toggle Item Lock Protection
 */
export function toggleItemLock(item) {
  if (!item) return;
  item.locked = !item.locked;
  AudioEngine.playTone(item.locked ? 600 : 400, 'sine', 0.15, 0.15);
  spawnDamageNumber(player.x, player.y - 40, item.locked ? `🔒 Locked: ${item.name}` : `🔓 Unlocked: ${item.name}`, false, '#e5c07b');
  updateBackpackUI();
  saveToDatabase(true);
}

/**
 * Drop Item to Ground Map
 */
export function dropItemToGround(item, bagIndex) {
  if (!item) return;
  if (item.locked) {
    spawnDamageNumber(player.x, player.y - 40, '⚠️ Item is Locked! Unlock first.', true, '#e06c75');
    AudioEngine.playTone(220, 'sawtooth', 0.2, 0.2);
    return;
  }

  // Remove from bag or equipped
  if (bagIndex !== undefined && bagIndex >= 0) {
    player.bag.splice(bagIndex, 1);
  } else {
    const idx = player.bag.indexOf(item);
    if (idx !== -1) player.bag.splice(idx, 1);
  }

  // Add to ground loot
  groundLoot.push({
    x: player.x + (Math.random() * 30 - 15),
    y: player.y + (Math.random() * 30 - 15),
    item: item,
    time: 0
  });

  AudioEngine.playTone(280, 'triangle', 0.2, 0.15);
  spawnDamageNumber(player.x, player.y - 40, `🗑️ Dropped: ${item.name}`, false, '#e06c75');

  updateBackpackUI();
  updatePaperdollUI();
  saveToDatabase(true);
}

/**
 * Sound Variation for Gear Types
 */
function playItemEquipAudio(item) {
  const slot = item.slot || '';
  if (slot === 'MainHand') {
    AudioEngine.playTone(480, 'triangle', 0.18, 0.15);
  } else if (slot === 'BodyArmor' || slot === 'OffHand' || slot === 'Helm') {
    AudioEngine.playTone(320, 'square', 0.2, 0.12);
  } else if (slot === 'Ring' || slot === 'Amulet') {
    AudioEngine.playTone(840, 'sine', 0.15, 0.18);
  } else {
    AudioEngine.playPickup();
  }
}

/**
 * Auto-Sorts items by Rarity / iLvl / Category and merges currency stacks
 */
export function sortAndConsolidateBackpack(sortMode = 'rarity') {
  const currencyStacks = {};
  const regularItems = [];

  player.bag.forEach(item => {
    if (!item) return;
    if (item.slot === 'Currency' || item.rarity === 'Currency' || item.id === 'scroll_resurrection') {
      const key = item.name;
      if (!currencyStacks[key]) {
        currencyStacks[key] = { ...item, stack: item.stack || 1 };
      } else {
        currencyStacks[key].stack = (currencyStacks[key].stack || 1) + (item.stack || 1);
      }
    } else {
      regularItems.push(item);
    }
  });

  const rarityPriority = { Unique: 1, Set: 2, Rare: 3, Magic: 4, SkillGem: 5, SupportGem: 5, Normal: 6, Currency: 7 };
  const typePriority = { weapon: 1, armor: 2, accessory: 3, consumable: 4, gem: 5, currency: 6, other: 7 };

  if (sortMode === 'rarity') {
    regularItems.sort((a, b) => (rarityPriority[a.rarity] || 9) - (rarityPriority[b.rarity] || 9));
  } else if (sortMode === 'ilvl') {
    regularItems.sort((a, b) => (b.iLvl || b.tier * 15 || 0) - (a.iLvl || a.tier * 15 || 0));
  } else if (sortMode === 'type') {
    regularItems.sort((a, b) => {
      const catA = typePriority[getItemCategory(a)] || 9;
      const catB = typePriority[getItemCategory(b)] || 9;
      return catA - catB;
    });
  }

  player.bag = [...regularItems, ...Object.values(currencyStacks)];
  AudioEngine.playPickup();
  spawnDamageNumber(player.x, player.y - 45, `⚡ Backpack Sorted (${sortMode.toUpperCase()})`, false, '#ffd700');
  updateBackpackUI();
  saveToDatabase(true);
}

/**
 * Context Action Menu Controller
 */
export function openContextMenu(e, item, source, indexOrSlot) {
  const menu = document.getElementById('inv-context-menu');
  if (!menu || !item) return;

  contextItemData = { item, source, indexOrSlot };

  const nameEl = document.getElementById('ctx-item-name');
  if (nameEl) {
    nameEl.innerText = item.name + (item.stack && item.stack > 1 ? ` (x${item.stack})` : '');
    nameEl.style.color = RARITY_COLORS[item.rarity] || '#ffd700';
  }

  // Update button texts
  const btnEquip = document.getElementById('ctx-btn-equip');
  if (btnEquip) {
    if (source === 'paperdoll') {
      btnEquip.querySelector('span').innerText = 'Unequip to Bag';
    } else if (item.slot && item.slot !== 'Currency' && item.slot !== 'Gem') {
      btnEquip.querySelector('span').innerText = 'Equip Gear';
    } else {
      btnEquip.querySelector('span').innerText = 'Use Item';
    }
  }

  const btnLock = document.getElementById('ctx-btn-lock');
  if (btnLock) {
    btnLock.querySelector('span').innerText = item.locked ? 'Unlock Item' : 'Lock Item (Protect)';
  }

  menu.classList.remove('hidden');

  const menuW = 180;
  const menuH = 220;
  const posX = Math.min(window.innerWidth - menuW - 10, Math.max(10, e.clientX + 5));
  const posY = Math.min(window.innerHeight - menuH - 10, Math.max(10, e.clientY + 5));

  menu.style.left = `${posX}px`;
  menu.style.top = `${posY}px`;
}

export function closeContextMenu() {
  const menu = document.getElementById('inv-context-menu');
  if (menu) menu.classList.add('hidden');
  contextItemData = null;
}

/**
 * Setup Context Menu Buttons Listeners
 */
export function setupContextMenuListeners() {
  document.getElementById('ctx-btn-equip')?.addEventListener('click', () => {
    if (!contextItemData) return;
    const { item, source, indexOrSlot } = contextItemData;
    if (source === 'paperdoll') {
      unequipItemToBag(indexOrSlot, item);
    } else {
      handleQuickEquipOrUse(item, indexOrSlot);
    }
    closeContextMenu();
  });

  document.getElementById('ctx-btn-lock')?.addEventListener('click', () => {
    if (!contextItemData) return;
    toggleItemLock(contextItemData.item);
    closeContextMenu();
  });

  document.getElementById('ctx-btn-pet')?.addEventListener('click', () => {
    if (!contextItemData) return;
    const { item, source, indexOrSlot } = contextItemData;
    if (companion.muleBag.length >= companion.muleMaxSlots) {
      spawnDamageNumber(player.x, player.y - 40, '🐾 Pet Mule Bag is FULL!', true, '#e06c75');
    } else {
      companion.muleBag.push(item);
      if (source === 'bag') player.bag.splice(indexOrSlot, 1);
      else delete player.equipped[indexOrSlot];
      AudioEngine.playPickup();
      spawnDamageNumber(player.x, player.y - 40, `🐾 Sent to Pet: ${item.name}`, false, '#61afef');
      updateBackpackUI();
      updatePaperdollUI();
      saveToDatabase(true);
    }
    closeContextMenu();
  });

  document.getElementById('ctx-btn-stash')?.addEventListener('click', () => {
    if (!contextItemData) return;
    spawnDamageNumber(player.x, player.y - 40, '📦 Open Stash Vault [X] to store items', false, '#98c379');
    closeContextMenu();
  });

  document.getElementById('ctx-btn-forge')?.addEventListener('click', () => {
    if (!contextItemData) return;
    spawnDamageNumber(player.x, player.y - 40, '🔨 Open Genesis Forge [B] to craft', false, '#ffd700');
    closeContextMenu();
  });

  document.getElementById('ctx-btn-drop')?.addEventListener('click', () => {
    if (!contextItemData) return;
    dropItemToGround(contextItemData.item, contextItemData.indexOrSlot);
    closeContextMenu();
  });

  // Close context menu on outside click
  window.addEventListener('click', e => {
    if (!e.target.closest('#inv-context-menu')) {
      closeContextMenu();
    }
  });
}

/**
 * Side-by-Side Comparison Tooltip Controller
 */
export function positionItemTooltip(e) {
  const tooltipContainer = document.getElementById('item-tooltip-container');
  const compareTooltipEl = document.getElementById('item-compare-tooltip');
  if (!tooltipContainer || tooltipContainer.classList.contains('hidden') || !e) return;

  const isCompareVisible = compareTooltipEl && !compareTooltipEl.classList.contains('hidden');
  const containerW = isCompareVisible ? 590 : 290;
  const containerH = 380;

  let posX = 0;
  // If mouse is in right half of screen, position tooltip to the left of the cursor
  if (e.clientX > window.innerWidth / 2) {
    posX = e.clientX - containerW - 16;
  } else {
    posX = e.clientX + 16;
  }

  // Clamp X
  if (posX < 10) posX = 10;
  if (posX + containerW > window.innerWidth - 10) {
    posX = window.innerWidth - containerW - 10;
  }

  // Y positioning
  let posY = e.clientY - 30;
  if (posY + containerH > window.innerHeight - 10) {
    posY = window.innerHeight - containerH - 10;
  }
  if (posY < 10) posY = 10;

  tooltipContainer.style.left = `${Math.round(posX)}px`;
  tooltipContainer.style.top = `${Math.round(posY)}px`;
}

export function showItemTooltip(e, item, source = 'bag') {
  const tooltipContainer = document.getElementById('item-tooltip-container');
  const tooltipEl = document.getElementById('item-tooltip');
  const compareTooltipEl = document.getElementById('item-compare-tooltip');
  if (!tooltipContainer || !tooltipEl || !item) return;

  renderSingleTooltipData(tooltipEl, item, false);

  // Check if we should render side-by-side comparison tooltip
  const slotKey = item.slot;
  const equippedItem = (slotKey && player.equipped) ? player.equipped[slotKey] : null;

  if (source === 'bag' && equippedItem && equippedItem !== item && compareTooltipEl && item.slot !== 'Currency' && item.slot !== 'Gem' && item.category !== 'consumable' && item.category !== 'map') {
    compareTooltipEl.classList.remove('hidden');
    renderSingleTooltipData(compareTooltipEl, equippedItem, true);

    // Compute stat diffs on main tooltip
    injectComparisonDiffs(tooltipEl, item, equippedItem);
  } else if (compareTooltipEl) {
    compareTooltipEl.classList.add('hidden');
  }

  tooltipContainer.classList.remove('hidden');
  positionItemTooltip(e);
}

export function hideItemTooltip() {
  const tooltipContainer = document.getElementById('item-tooltip-container');
  const compareTooltipEl = document.getElementById('item-compare-tooltip');
  if (tooltipContainer) tooltipContainer.classList.add('hidden');
  if (compareTooltipEl) compareTooltipEl.classList.add('hidden');
}

/**
 * Render tooltip content inside a single tooltip box
 */
function renderSingleTooltipData(boxEl, item, isCompareBox = false) {
  if (!boxEl || !item) return;

  const prefix = isCompareBox ? 'tt-comp-' : 'tt-';

  const nameEl = boxEl.querySelector(`#${prefix}name`);
  if (nameEl) {
    nameEl.innerText = (item.name || 'Unknown Item') + (item.stack && item.stack > 1 ? ` (x${item.stack})` : '');
    nameEl.style.color = RARITY_COLORS[item.rarity] || '#ffffff';
  }

  const typeEl = boxEl.querySelector(`#${prefix}type`);
  if (typeEl) {
    typeEl.innerText = `${item.rarity || 'Normal'} ${item.baseType || item.slot || ''} ${item.iLvl ? `(iLvl ${item.iLvl})` : ''}`.trim();
    typeEl.style.color = RARITY_COLORS[item.rarity] || '#abb2bf';
  }

  const iconWrap = boxEl.querySelector(`#${prefix}icon-wrap`);
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

  const statsEl = boxEl.querySelector(`#${prefix}stats`);
  if (statsEl) {
    statsEl.innerHTML = '';

    const reqLvl = item.requiredLevel || 1;
    const meetsReq = (player.level || 1) >= reqLvl;
    statsEl.innerHTML += `
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:11px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:4px;">
        <span>Item Level: <b style="color:#ffd700;">${item.iLvl || (item.tier ? item.tier * 15 : 1)}</b></span>
        <span style="color:${meetsReq ? '#98c379' : '#e06c75'}; font-weight:700;">
          Requires Level: <b>${reqLvl}</b> ${meetsReq ? '✓' : '⚠️'}
        </span>
      </div>
    `;

    if (item.primaryStats) {
      for (let k in item.primaryStats) {
        statsEl.innerHTML += `<div data-stat-key="${k}">${k}: <b>${item.primaryStats[k]}</b></div>`;
      }
    }
    if (item.baseStats) {
      for (let [k, v] of Object.entries(item.baseStats)) {
        statsEl.innerHTML += `<div data-stat-key="${k}">${k}: <b>${v}</b></div>`;
      }
    }
    if (item.stats) {
      for (let [k, v] of Object.entries(item.stats)) {
        statsEl.innerHTML += `<div data-stat-key="${k}">+${v} ${k}</div>`;
      }
    }
  }

  const modsEl = boxEl.querySelector(`#${prefix}mods`);
  if (modsEl) {
    let modsHtml = (item.mods || []).map(m => {
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

    // Set pieces description
    if (item.setId && SET_DEFINITIONS && SET_DEFINITIONS[item.setId]) {
      const setDef = SET_DEFINITIONS[item.setId];
      const equippedPieces = Object.values(player.equipped || {}).filter(it => it && it.setId === item.setId);
      const activeCount = equippedPieces.length;

      let piecesListHtml = (setDef.pieces || []).map(p => {
        const isEquipped = equippedPieces.some(ep => ep.name === p.name);
        return `<div style="color:${isEquipped ? '#00e676' : '#7f8c8d'}; font-size:11px; margin-left:8px;">
          ${isEquipped ? '✔' : '○'} ${p.name}
        </div>`;
      }).join('');

      let bonusesListHtml = (setDef.bonuses || []).map(b => {
        const isUnlocked = activeCount >= b.count;
        return `<div style="color:${isUnlocked ? '#00e676' : '#666'}; font-size:11px; margin-top:2px; font-weight:${isUnlocked ? '600' : 'normal'};">
          ${isUnlocked ? '★' : '☆'} (${b.count}) Set: ${b.desc}
        </div>`;
      }).join('');

      modsHtml += `
        <div class="tt-set-panel" style="margin-top:8px; padding-top:6px; border-top:1px dashed #00e676;">
          <div style="color:#00e676; font-weight:700; font-size:12px; margin-bottom:4px;">
            🌿 Set: ${setDef.name} (${activeCount}/${(setDef.pieces || []).length})
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

  const loreEl = boxEl.querySelector(`#${prefix}lore`);
  if (loreEl) loreEl.innerText = item.lore || item.description ? `"${item.lore || item.description}"` : '';
}

/**
 * Inject Diff comparisons (+ / -) between hovered item and equipped item
 */
function injectComparisonDiffs(mainTooltipBox, newItem, equippedItem) {
  if (!mainTooltipBox || !newItem || !equippedItem) return;

  const statsEl = mainTooltipBox.querySelector('#tt-stats');
  if (!statsEl) return;

  // Compare armor
  const newArmor = (newItem.primaryStats && newItem.primaryStats['Armor']) || (newItem.stats && newItem.stats.armor) || (newItem.baseStats && newItem.baseStats.armor) || 0;
  const eqArmor = (equippedItem.primaryStats && equippedItem.primaryStats['Armor']) || (equippedItem.stats && equippedItem.stats.armor) || (equippedItem.baseStats && equippedItem.baseStats.armor) || 0;
  if (newArmor && eqArmor) {
    const diff = newArmor - eqArmor;
    appendDiffTag(statsEl, 'Armor', diff);
  }

  // Compare ES
  const newEs = (newItem.primaryStats && newItem.primaryStats['Energy Shield']) || (newItem.stats && newItem.stats.es) || (newItem.baseStats && newItem.baseStats.es) || 0;
  const eqEs = (equippedItem.primaryStats && equippedItem.primaryStats['Energy Shield']) || (equippedItem.stats && equippedItem.stats.es) || (equippedItem.baseStats && equippedItem.baseStats.es) || 0;
  if (newEs && eqEs) {
    const diff = newEs - eqEs;
    appendDiffTag(statsEl, 'Energy Shield', diff);
  }

  // Compare damage
  const newDmg = (newItem.baseStats && newItem.baseStats.damage) || (newItem.stats && newItem.stats.damage) || 0;
  const eqDmg = (equippedItem.baseStats && equippedItem.baseStats.damage) || (equippedItem.stats && equippedItem.stats.damage) || 0;
  if (newDmg && eqDmg) {
    const diff = newDmg - eqDmg;
    appendDiffTag(statsEl, 'damage', diff);
  }
}

function appendDiffTag(statsEl, keyName, diff) {
  if (diff === 0) return;
  const line = Array.from(statsEl.children).find(el => el.innerText.toLowerCase().includes(keyName.toLowerCase()));
  if (line) {
    const diffSpan = document.createElement('span');
    diffSpan.className = diff > 0 ? 'tt-diff-plus' : 'tt-diff-minus';
    diffSpan.innerText = diff > 0 ? ` (+${diff} ▲)` : ` (${diff} ▼)`;
    line.appendChild(diffSpan);
  }
}

/**
 * Pick Up Ground Loot Item
 */
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
  spawnDamageNumber(player.x, player.y - 45, `+ ${loot.item.name}`, false, RARITY_COLORS[loot.item.rarity] || '#ffffff');

  updateBackpackUI();
  saveToDatabase(true);
}

window.showItemTooltip = showItemTooltip;
window.hideItemTooltip = hideItemTooltip;
