/**
 * MDG: Aethelis - Genesis Forge Bench & Crafting UI 2.0 (Overhauled ARPG Grid & Materials Tooltip)
 * 4 Tabs: Relic Anvil, Salvage Anvil, Base Forging & Materials Vault
 * Features:
 *  - ARPG Item/Material Slot Grids (56x56px) with Rarity Glow & Stack Badges
 *  - Auto-hiding materials with 0 quantity in Materials Vault & Crafting
 *  - Dynamic Floating Rich Tooltips on mouse hover
 *  - Craftable-Only Filter for Base Forging
 */

import { player } from '../state.js';
import { AudioEngine } from '../audio.js';
import { updateBackpackUI, updatePaperdollUI, showItemTooltip, positionItemTooltip, hideItemTooltip } from './inventory.js';
import { MATERIALS_CATALOG, FORGING_RECIPES, getMaterialInfo, previewSalvageItem } from '../data/materials.js';
import { spawnDamageNumber } from '../combat.js';
import { saveToDatabase } from '../save-system.js';
import { assets, drawItemSpriteToCanvas } from '../assets.js';

let activeForgeTab = 'anvil'; // 'anvil' | 'salvage' | 'base_forge' | 'vault'
let selectedItemIndex = -1;
let selectedSalvageIndex = -1;
let selectedRecipeId = 'forge_iron_sword';
let onlyCraftableFilter = false;

export function getCraftingMasteryPerks() {
  if (!player.craftingMastery) {
    player.craftingMastery = { level: 1, exp: 0, rank: 'Apprentice', rankTitle: '🛠️ Novice Apprentice' };
  }
  const level = Math.max(1, Math.min(50, player.craftingMastery.level || 1));
  const exp = player.craftingMastery.exp || 0;
  const expToNext = level >= 50 ? 0 : Math.round(150 * Math.pow(1.12, level - 1));

  let rank = 'Apprentice';
  let rankTitle = '🛠️ Novice Apprentice';
  if (level >= 50) {
    rank = 'PrimordialGodSmith';
    rankTitle = '👑 Primordial God-Smith';
  } else if (level >= 40) {
    rank = 'Grandmaster';
    rankTitle = '🌟 Grandmaster Artificer';
  } else if (level >= 30) {
    rank = 'MasterSmith';
    rankTitle = '🔨 Master Forger';
  } else if (level >= 20) {
    rank = 'Artisan';
    rankTitle = '💎 Skilled Artisan';
  } else if (level >= 10) {
    rank = 'Journeyman';
    rankTitle = '⚒️ Adept Journeyman';
  }

  const saveChance = Math.min(30.0, +(5.0 + (level - 1) * 0.52).toFixed(1));
  const critChance = Math.min(25.0, +(5.0 + (level - 1) * 0.41).toFixed(1));
  const extraSocketChance = Math.min(35.0, +(5.0 + (level - 1) * 0.62).toFixed(1));
  const qualityBonus = Math.min(25.0, +((level - 1) * 0.51).toFixed(1));

  player.craftingMastery.rank = rank;
  player.craftingMastery.rankTitle = rankTitle;

  return {
    level,
    exp,
    expToNext,
    rank,
    rankTitle,
    resourceSaveChance: saveChance,
    masterworkCritChance: critChance,
    extraSocketChance,
    qualityBonus
  };
}

export function addCraftingExp(amount, sourceLabel = 'Crafting') {
  if (!player.craftingMastery) {
    player.craftingMastery = { level: 1, exp: 0, rank: 'Apprentice', rankTitle: '🛠️ Novice Apprentice' };
  }
  if (player.craftingMastery.level >= 50) return;

  player.craftingMastery.exp += amount;
  let leveledUp = false;

  while (player.craftingMastery.level < 50) {
    const req = Math.round(150 * Math.pow(1.12, player.craftingMastery.level - 1));
    if (player.craftingMastery.exp >= req) {
      player.craftingMastery.exp -= req;
      player.craftingMastery.level++;
      leveledUp = true;
    } else {
      break;
    }
  }

  if (player.craftingMastery.level >= 50) {
    player.craftingMastery.exp = 0;
  }

  const perks = getCraftingMasteryPerks();

  if (leveledUp) {
    AudioEngine.playLevelUp?.() || AudioEngine.playTone(980, 'sine', 0.4, 0.25);
    spawnDamageNumber(player.x, player.y - 70, `🌟 CRAFTING MASTERY UP! Lv.${perks.level} ${perks.rankTitle}`, true, '#ffd700');
  } else {
    spawnDamageNumber(player.x, player.y - 40, `+${amount} Crafting EXP`, false, '#c084fc');
  }

  updateCraftingMasteryHeader();
  saveToDatabase();
}

export function updateCraftingMasteryHeader() {
  const headerEl = document.getElementById('forgeMasteryHeaderBar');
  if (!headerEl) return;

  const perks = getCraftingMasteryPerks();
  const pct = perks.level >= 50 ? 100 : Math.min(100, Math.round((perks.exp / perks.expToNext) * 100));

  headerEl.innerHTML = `
    <div class="mastery-title-row">
      <div class="mastery-rank-badge">
        <span class="mastery-rank-name">${perks.rankTitle}</span>
        <span class="mastery-lvl-tag">Lv. ${perks.level}/50</span>
      </div>
      <div class="mastery-perks-row">
        <span class="mastery-perk-chip" title="Chance to preserve raw materials upon forging">🍀 Tiết Kiệm NL: <b>${perks.resourceSaveChance}%</b></span>
        <span class="mastery-perk-chip" title="Chance to forge Masterwork item with +25% bonus stats">⭐ Đại Thành Công: <b>${perks.masterworkCritChance}%</b></span>
        <span class="mastery-perk-chip" title="Chance to forge extra sockets">💎 Thêm Socket: <b>${perks.extraSocketChance}%</b></span>
      </div>
    </div>
    <div class="mastery-progress-track">
      <div class="mastery-progress-fill" style="width: ${pct}%;"></div>
      <span class="mastery-progress-text">${perks.level >= 50 ? 'MAX PROFICIENCY (Primordial God-Smith)' : `${perks.exp} / ${perks.expToNext} EXP (${pct}%)`}</span>
    </div>
  `;
}

export function renderForgeBenchModal() {
  let modal = document.getElementById('forgeBenchModal');
  if (modal && modal.style.display !== 'none') {
    modal.style.display = 'none';
    modal.classList.remove('active');
    modal.classList.add('hidden');
    hideForgeTooltip();
    return;
  }

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'forgeBenchModal';
    modal.className = 'game-modal-backdrop modal-overlay hidden';
    modal.innerHTML = `
      <div class="forge-modal-card">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:24px;">🔨</span>
            <div>
              <h2 style="margin:0; font-size:18px; color:#ffd700;">GENESIS FORGE BENCH 2.0</h2>
              <span style="font-size:11px; color:#888;">Ancient Relic Anvil, Salvage Reclamation, Base Forging & Materials Vault [B]</span>
            </div>
          </div>
          <button class="close-btn" id="closeForgeBtn">✕</button>
        </div>

        <!-- Crafting Mastery & Proficiency Header Widget -->
        <div id="forgeMasteryHeaderBar" class="forge-mastery-header-bar"></div>

        <!-- 5-Tab Navigation Bar -->
        <div class="forge-tabs-nav">
          <button class="forge-nav-tab active" data-tab="anvil">🔨 Relic Anvil</button>
          <button class="forge-nav-tab" data-tab="salvage">♻️ Salvage Anvil</button>
          <button class="forge-nav-tab" data-tab="base_forge">🗡️ Base Forging</button>
          <button class="forge-nav-tab" data-tab="vault">🎒 Materials Vault</button>
          <button class="forge-nav-tab" data-tab="professions">🛠️ Professions</button>
        </div>

        <!-- Main Body Container -->
        <div id="forgeTabContent" class="forge-tab-body"></div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeForgeBtn').onclick = () => {
      modal.style.display = 'none';
      modal.classList.remove('active');
      modal.classList.add('hidden');
      hideForgeTooltip();
      AudioEngine.playTone(330, 'triangle', 0.1, 0.08);
    };

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        modal.classList.add('hidden');
        hideForgeTooltip();
      }
    });

    modal.querySelectorAll('.forge-nav-tab').forEach(btn => {
      btn.onclick = () => {
        modal.querySelectorAll('.forge-nav-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeForgeTab = btn.getAttribute('data-tab');
        AudioEngine.playTone(520, 'sine', 0.08, 0.05);
        hideForgeTooltip();
        renderActiveForgeTab();
      };
    });
  }

  ensureForgeTooltipElement();

  modal.classList.remove('hidden');
  modal.classList.add('active');
  modal.style.display = 'flex';
  updateCraftingMasteryHeader();
  renderActiveForgeTab();
}

function renderActiveForgeTab() {
  const container = document.getElementById('forgeTabContent');
  if (!container) return;

  if (activeForgeTab === 'anvil') {
    renderRelicAnvilTab(container);
  } else if (activeForgeTab === 'salvage') {
    renderSalvageTab(container);
  } else if (activeForgeTab === 'base_forge') {
    renderBaseForgingTab(container);
  } else if (activeForgeTab === 'vault') {
    renderMaterialsVaultTab(container);
  } else if (activeForgeTab === 'professions') {
    renderProfessionsTab(container);
  }
}

// =========================================================================
// TAB 1: RELIC ANVIL & METAMODS
// =========================================================================
function renderRelicAnvilTab(container) {
  container.innerHTML = `
    <div class="forge-content-grid">
      <!-- Left: Anvil Pedestal & Inventory Grid -->
      <div class="forge-anvil-panel">
        <div class="forge-panel-title-row">
          <h3>🗡️ Relic Anvil Pedestal</h3>
          <span style="font-size:11px; color:#888;">Select gear from bag below</span>
        </div>

        <div id="anvilSlot" class="anvil-pedestal-card">
          <div class="empty-anvil-text">Click a gear slot below to place onto Forge Anvil</div>
        </div>
        <div class="anvil-item-details" id="anvilItemDetails"></div>
        
        <div class="forge-panel-title-row" style="margin-top:15px;">
          <h4>📦 Backpack Equipment</h4>
          <span style="font-size:11px; color:#ffd700;">Click to place • Hover for stats</span>
        </div>
        <div class="forge-bag-grid" id="forgeBackpackList"></div>
      </div>

      <!-- Right: Crafting Actions & Currency Cost -->
      <div class="forge-actions-panel">
        <div class="forge-panel-title-row">
          <h3>✨ Alchemy Rituals & Forging</h3>
        </div>
        
        <div class="forge-currency-summary" id="forgeCurrencySummary"></div>

        <div class="forge-action-group">
          <h4>🔒 Metamods (Affix Locking)</h4>
          <button class="forge-btn btn-lock" id="btnLockPrefixes">🔒 Lock Prefixes (Cannot Be Changed) — 2x Fracture Core</button>
          <button class="forge-btn btn-lock" id="btnLockSuffixes">🔒 Lock Suffixes (Cannot Be Changed) — 2x Fracture Core</button>
        </div>

        <div class="forge-action-group">
          <h4>💎 Sockets & Links</h4>
          <button class="forge-btn btn-socket" id="btnRerollSockets">⚪ Reforge Sockets (1-4 Sockets) — 1x Socketing Core</button>
          <button class="forge-btn btn-socket" id="btnRerollLinks">🔗 Reforge Links (Socket Links) — 1x Harmonic Tether</button>
        </div>

        <div class="forge-action-group">
          <h4>📜 Guaranteed Bench Craft — 1x Ascendant Catalyst</h4>
          <select id="forgeAffixSelect" class="forge-select">
            <option value="flat_life">+65 to Maximum Life (Prefix)</option>
            <option value="flat_phys">+35 to Physical Damage (Prefix)</option>
            <option value="flat_es">+50 to Energy Shield (Prefix)</option>
            <option value="fire_res">+28% to Fire Resistance (Suffix)</option>
            <option value="cold_res">+28% to Cold Resistance (Suffix)</option>
            <option value="lightning_res">+28% to Lightning Resistance (Suffix)</option>
            <option value="attack_speed">+15% Increased Attack Speed (Suffix)</option>
            <option value="crit_multi">+30% Critical Strike Multiplier (Suffix)</option>
          </select>
          <button class="forge-btn btn-craft" id="btnCraftAffix">✨ Apply Selected Mod</button>
        </div>

        <div class="forge-action-group">
          <h4>🌀 Chaos Slam (Total Reroll)</h4>
          <button class="forge-btn btn-chaos" id="btnChaosReroll">🌀 Reroll 4-6 Random Mods — 1x Fracture Core</button>
        </div>
      </div>
    </div>
  `;

  updateAnvilUI();
  setupAnvilListeners();
}

function updateAnvilUI() {
  const backpackList = document.getElementById('forgeBackpackList');
  if (!backpackList) return;

  backpackList.innerHTML = '';
  player.bag.forEach((item, idx) => {
    if (!item) return;
    const isEquipable = item.slot !== 'Currency' && item.slot !== 'Gem' && item.category !== 'map';
    const slotEl = document.createElement('div');
    slotEl.className = `forge-slot-card rarity-${item.rarity || 'Normal'} ${selectedItemIndex === idx ? 'selected' : ''} ${!isEquipable ? 'disabled' : ''}`;

    if (item.sprite && assets.equipment && assets.equipment.complete) {
      const cvs = document.createElement('canvas');
      cvs.width = 40;
      cvs.height = 40;
      cvs.className = 'bag-slot-canvas';
      drawItemSpriteToCanvas(cvs, item.sprite);
      slotEl.appendChild(cvs);
    } else {
      const span = document.createElement('span');
      span.className = 'forge-slot-icon';
      span.innerText = item.icon || '⚔️';
      slotEl.appendChild(span);
    }

    if (item.sockets && item.sockets > 0) {
      const sockBadge = document.createElement('span');
      sockBadge.className = 'item-socket-badge';
      sockBadge.innerText = '⚪'.repeat(item.sockets);
      slotEl.appendChild(sockBadge);
    }

    // Tooltips
    slotEl.addEventListener('mouseenter', e => showItemTooltip(e, item, 'bag'));
    slotEl.addEventListener('mousemove', e => positionItemTooltip(e));
    slotEl.addEventListener('mouseleave', hideItemTooltip);

    if (isEquipable) {
      slotEl.onclick = () => {
        selectedItemIndex = idx;
        AudioEngine.playTone(440, 'sine', 0.06, 0.04);
        updateAnvilUI();
      };
    }
    backpackList.appendChild(slotEl);
  });

  const anvilSlot = document.getElementById('anvilSlot');
  const details = document.getElementById('anvilItemDetails');
  const selectedItem = player.bag[selectedItemIndex];

  if (!selectedItem || selectedItem.slot === 'Currency' || selectedItem.slot === 'Gem' || selectedItem.category === 'map') {
    anvilSlot.innerHTML = `<div class="empty-anvil-text">Click an item below to place it onto the Forge Anvil</div>`;
    details.innerHTML = '';
  } else {
    anvilSlot.innerHTML = `
      <div class="anvil-placed-item" style="border-color:${selectedItem.color}">
        <span style="font-size:28px;">${selectedItem.icon || '⚔️'}</span>
        <div style="text-align:left;">
          <div style="font-weight:bold; font-size:15px; color:${selectedItem.color}">${selectedItem.name}</div>
          <div style="font-size:11px; color:#94a3b8;">${selectedItem.rarity} ${selectedItem.slot} (iLvl ${selectedItem.level || 65})</div>
        </div>
      </div>
    `;

    details.innerHTML = `
      <div class="anvil-meta-box">
        <div>🔒 Prefixes Locked: <b>${selectedItem.prefixesLocked ? '<span style="color:#ffd700">YES</span>' : 'NO'}</b></div>
        <div>🔒 Suffixes Locked: <b>${selectedItem.suffixesLocked ? '<span style="color:#ffd700">YES</span>' : 'NO'}</b></div>
        <div>⚪ Sockets: <b>${selectedItem.sockets || 0}</b> | Links: <b>${selectedItem.links || 0}</b></div>
        ${selectedItem.craftedMods && selectedItem.craftedMods.length > 0 ? `<div style="color:#4ade80; margin-top:4px;">✨ Crafted Mod: ${selectedItem.craftedMods.join(', ')}</div>` : ''}
      </div>
    `;
  }

  // Update Currencies Summary
  const curSummary = document.getElementById('forgeCurrencySummary');
  if (curSummary) {
    curSummary.innerHTML = `
      <span>🔮 Fracture Cores: <b style="color:#ffd700;">${countCurrency('Fracture Core')}</b></span>
      <span>⚪ Socketing Cores: <b style="color:#00f2fe;">${countCurrency('Socketing Core')}</b></span>
      <span>🔗 Harmonic Tethers: <b style="color:#c678dd;">${countCurrency('Harmonic Tether')}</b></span>
      <span>✨ Ascendant Catalysts: <b style="color:#4ade80;">${countCurrency('Ascendant Catalyst')}</b></span>
    `;
  }
}

function setupAnvilListeners() {
  const btnLockPre = document.getElementById('btnLockPrefixes');
  const btnLockSuf = document.getElementById('btnLockSuffixes');
  const btnSockets = document.getElementById('btnRerollSockets');
  const btnLinks = document.getElementById('btnRerollLinks');
  const btnCraft = document.getElementById('btnCraftAffix');
  const btnChaos = document.getElementById('btnChaosReroll');

  if (btnLockPre) {
    btnLockPre.onclick = () => {
      const item = player.bag[selectedItemIndex];
      if (!item) return alert('Select an equipment piece on the anvil first.');
      if (item.prefixesLocked) return alert('Prefixes are already locked on this item.');
      if (countCurrency('Fracture Core') < 2) return alert('You need 2x Fracture Core to lock prefixes.');

      consumeCurrency('Fracture Core', 2);
      item.prefixesLocked = true;
      AudioEngine.playTone(650, 'sawtooth', 0.25, 0.15);
      spawnDamageNumber(player.x, player.y - 45, '🔒 PREFIXES LOCKED!', true, '#ffd700');
      addCraftingExp(20, 'Prefix Lock');
      updateAnvilUI();
      saveToDatabase();
    };
  }

  if (btnLockSuf) {
    btnLockSuf.onclick = () => {
      const item = player.bag[selectedItemIndex];
      if (!item) return alert('Select an equipment piece on the anvil first.');
      if (item.suffixesLocked) return alert('Suffixes are already locked on this item.');
      if (countCurrency('Fracture Core') < 2) return alert('You need 2x Fracture Core to lock suffixes.');

      consumeCurrency('Fracture Core', 2);
      item.suffixesLocked = true;
      AudioEngine.playTone(650, 'sawtooth', 0.25, 0.15);
      spawnDamageNumber(player.x, player.y - 45, '🔒 SUFFIXES LOCKED!', true, '#ffd700');
      addCraftingExp(20, 'Suffix Lock');
      updateAnvilUI();
      saveToDatabase();
    };
  }

  if (btnSockets) {
    btnSockets.onclick = () => {
      const item = player.bag[selectedItemIndex];
      if (!item) return alert('Select an equipment piece on the anvil first.');
      if (countCurrency('Socketing Core') < 1) return alert('You need 1x Socketing Core.');

      consumeCurrency('Socketing Core', 1);
      const newSockets = Math.floor(Math.random() * 4) + 1;
      item.sockets = newSockets;
      if (item.links > item.sockets) item.links = item.sockets;
      AudioEngine.playTone(520, 'sine', 0.2, 0.1);
      spawnDamageNumber(player.x, player.y - 45, `⚪ REFORGED: ${newSockets} SOCKETS!`, true, '#00f2fe');
      addCraftingExp(15, 'Socket Reforge');
      updateAnvilUI();
      saveToDatabase();
    };
  }

  if (btnLinks) {
    btnLinks.onclick = () => {
      const item = player.bag[selectedItemIndex];
      if (!item) return alert('Select an equipment piece on the anvil first.');
      if (!item.sockets || item.sockets < 2) return alert('Item must have at least 2 sockets to form links.');
      if (countCurrency('Harmonic Tether') < 1) return alert('You need 1x Harmonic Tether.');

      consumeCurrency('Harmonic Tether', 1);
      const newLinks = Math.floor(Math.random() * item.sockets) + 1;
      item.links = newLinks;
      AudioEngine.playTone(580, 'sine', 0.2, 0.1);
      spawnDamageNumber(player.x, player.y - 45, `🔗 REFORGED: ${newLinks}-LINK!`, true, '#c678dd');
      addCraftingExp(15, 'Link Reforge');
      updateAnvilUI();
      saveToDatabase();
    };
  }

  if (btnCraft) {
    btnCraft.onclick = () => {
      const item = player.bag[selectedItemIndex];
      if (!item) return alert('Select an equipment piece on the anvil first.');
      if (countCurrency('Ascendant Catalyst') < 1) return alert('You need 1x Ascendant Catalyst.');

      const select = document.getElementById('forgeAffixSelect');
      const modValue = select.value;
      const modText = select.options[select.selectedIndex].text;

      consumeCurrency('Ascendant Catalyst', 1);
      if (!item.craftedMods) item.craftedMods = [];
      item.craftedMods = [modText]; // Replace existing bench crafted mod

      AudioEngine.playTone(720, 'triangle', 0.3, 0.2);
      spawnDamageNumber(player.x, player.y - 45, `✨ BENCH CRAFTED: ${modText}!`, true, '#4ade80');
      addCraftingExp(25, 'Bench Affix Craft');
      updateAnvilUI();
      saveToDatabase();
    };
  }

  if (btnChaos) {
    btnChaos.onclick = () => {
      const item = player.bag[selectedItemIndex];
      if (!item) return alert('Select an equipment piece on the anvil first.');
      if (countCurrency('Fracture Core') < 1) return alert('You need 1x Fracture Core.');

      consumeCurrency('Fracture Core', 1);
      item.rarity = 'Rare';
      item.color = '#ffd700';

      AudioEngine.playTone(380, 'sawtooth', 0.35, 0.2);
      spawnDamageNumber(player.x, player.y - 45, '🌀 CHAOS SLAM REROLLED!', true, '#ffd700');
      addCraftingExp(30, 'Chaos Slam');
      updateAnvilUI();
      saveToDatabase();
    };
  }
}

// =========================================================================
// TAB 2: SALVAGE ANVIL (DISMANTLING & RECLAMATION)
// =========================================================================
function renderSalvageTab(container) {
  container.innerHTML = `
    <div class="forge-content-grid">
      <!-- Left: Dismantling Pedestal & Bag -->
      <div class="forge-anvil-panel">
        <div class="forge-panel-title-row">
          <h3>♻️ Salvage Anvil Pedestal</h3>
          <span style="font-size:11px; color:#888;">Select gear to dismantle into raw materials</span>
        </div>

        <div id="salvageTargetSlot" class="anvil-pedestal-card">
          <div class="empty-anvil-text">Click a piece of equipment below to salvage</div>
        </div>

        <div class="forge-panel-title-row" style="margin-top:15px;">
          <h4>📦 Backpack Equipment</h4>
          <span style="font-size:11px; color:#4ade80;">Click to preview raw materials yield</span>
        </div>
        <div class="forge-bag-grid" id="salvageBackpackList"></div>
      </div>

      <!-- Right: Yield Preview & Execute -->
      <div class="forge-actions-panel">
        <div class="forge-panel-title-row">
          <h3>📦 Reclamation Material Yields</h3>
        </div>

        <div id="salvageYieldBox" class="salvage-yield-box"></div>
        <div style="margin-top:20px;">
          <button class="forge-btn btn-salvage" id="btnExecuteSalvage">♻️ Salvage & Reclaim Materials</button>
        </div>
      </div>
    </div>
  `;

  updateSalvageUI();
}

function updateSalvageUI() {
  const backpackList = document.getElementById('salvageBackpackList');
  if (!backpackList) return;

  backpackList.innerHTML = '';
  player.bag.forEach((item, idx) => {
    if (!item) return;
    const isSalvageable = item.slot !== 'Currency' && item.slot !== 'Gem' && item.category !== 'map';
    const slotEl = document.createElement('div');
    slotEl.className = `forge-slot-card rarity-${item.rarity || 'Normal'} ${selectedSalvageIndex === idx ? 'selected' : ''} ${!isSalvageable ? 'disabled' : ''}`;

    if (item.sprite && assets.equipment && assets.equipment.complete) {
      const cvs = document.createElement('canvas');
      cvs.width = 40;
      cvs.height = 40;
      cvs.className = 'bag-slot-canvas';
      drawItemSpriteToCanvas(cvs, item.sprite);
      slotEl.appendChild(cvs);
    } else {
      const span = document.createElement('span');
      span.className = 'forge-slot-icon';
      span.innerText = item.icon || '⚔️';
      slotEl.appendChild(span);
    }

    // Tooltips
    slotEl.addEventListener('mouseenter', e => showItemTooltip(e, item, 'bag'));
    slotEl.addEventListener('mousemove', e => positionItemTooltip(e));
    slotEl.addEventListener('mouseleave', hideItemTooltip);

    if (isSalvageable) {
      slotEl.onclick = () => {
        selectedSalvageIndex = idx;
        AudioEngine.playTone(420, 'sine', 0.06, 0.04);
        updateSalvageUI();
      };
    }
    backpackList.appendChild(slotEl);
  });

  const targetSlot = document.getElementById('salvageTargetSlot');
  const yieldBox = document.getElementById('salvageYieldBox');
  const selectedItem = player.bag[selectedSalvageIndex];

  if (!selectedItem || selectedItem.slot === 'Currency' || selectedItem.slot === 'Gem') {
    targetSlot.innerHTML = `<div class="empty-anvil-text">No equipment selected for salvage</div>`;
    yieldBox.innerHTML = `<div style="color:#64748b; font-size:12px; text-align:center; padding:20px 0;">Select an item on the left to preview guaranteed materials yield.</div>`;
  } else {
    targetSlot.innerHTML = `
      <div class="anvil-placed-item" style="border-color:${selectedItem.color}">
        <span style="font-size:28px;">${selectedItem.icon || '⚔️'}</span>
        <div style="text-align:left;">
          <div style="font-weight:bold; font-size:15px; color:${selectedItem.color}">${selectedItem.name}</div>
          <div style="font-size:11px; color:#94a3b8;">${selectedItem.rarity} ${selectedItem.slot} (iLvl ${selectedItem.level || 65})</div>
        </div>
      </div>
    `;

    const yields = previewSalvageItem(selectedItem);
    yieldBox.innerHTML = `
      <h4 style="color:#ffd700; margin-bottom:12px;">📦 Guaranteed Materials Yield:</h4>
      <div class="materials-slot-grid">
        ${yields.map(y => {
          const matInfo = y.isCurrency ? { id: 'fracture_core', name: 'Fracture Core', category: 'Currency', rarity: 'Rare', icon: '🔮', color: '#ffd700', desc: 'Precious crafting currency.' } : getMaterialInfo(y.id);
          return `
            <div class="mat-inventory-slot" style="--slot-glow-color:${matInfo.color || '#ffd700'}; border-color:${matInfo.color || '#ffd700'};"
                 data-mat-id="${matInfo.id}">
              <span class="mat-slot-icon">${matInfo.icon}</span>
              <span class="mat-slot-count">+${y.count}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Add tooltips to yield slots
    yieldBox.querySelectorAll('.mat-inventory-slot').forEach(slot => {
      const matId = slot.getAttribute('data-mat-id');
      const matInfo = matId === 'fracture_core' ? { id: 'fracture_core', name: 'Fracture Core', category: 'Currency', rarity: 'Rare', icon: '🔮', color: '#ffd700', desc: 'Precious metamod currency for locking affixes and total chaotic rerolls.' } : getMaterialInfo(matId);
      slot.addEventListener('mouseenter', e => showForgeMaterialTooltip(e, matInfo, 1));
      slot.addEventListener('mousemove', e => positionForgeTooltip(e));
      slot.addEventListener('mouseleave', hideForgeTooltip);
    });
  }

  const btnSalvage = document.getElementById('btnExecuteSalvage');
  if (btnSalvage) {
    btnSalvage.onclick = () => {
      const item = player.bag[selectedSalvageIndex];
      if (!item) return alert('Please select a piece of equipment to salvage.');

      const yields = previewSalvageItem(item);
      if (!player.materials) player.materials = {};

      yields.forEach(y => {
        if (y.isCurrency) {
          player.bag.push({ name: 'Fracture Core', slot: 'Currency', rarity: 'Rare', color: '#ffd700', icon: '🔮' });
        } else {
          player.materials[y.id] = (player.materials[y.id] || 0) + y.count;
        }
      });

      const itemName = item.name;
      player.bag.splice(selectedSalvageIndex, 1);
      selectedSalvageIndex = -1;

      AudioEngine.playTone(300, 'sawtooth', 0.25, 0.2);
      spawnDamageNumber(player.x, player.y - 45, `♻️ SALVAGED ${itemName}!`, true, '#4ade80');
      addCraftingExp(15, 'Salvage Reclamation');

      updateSalvageUI();
      updateBackpackUI();
      saveToDatabase();
    };
  }
}

// =========================================================================
// TAB 3: BASE EQUIPMENT FORGING
// =========================================================================
function renderBaseForgingTab(container) {
  container.innerHTML = `
    <div class="forge-content-grid">
      <!-- Left: Recipe List with Craftable Toggle -->
      <div class="forge-anvil-panel">
        <div class="forge-panel-title-row">
          <h3>🗡️ Relic Blueprints</h3>
          <label class="craftable-toggle-label">
            <input type="checkbox" id="chkCraftableOnly" ${onlyCraftableFilter ? 'checked' : ''} />
            <span>Craftable Only</span>
          </label>
        </div>
        <div class="forge-recipe-list" id="forgeRecipeList"></div>
      </div>

      <!-- Right: Recipe Preview, Material Cost Slots & Forging Action -->
      <div class="forge-actions-panel">
        <div class="forge-panel-title-row">
          <h3>🔨 Smelting & Relic Forging</h3>
        </div>
        <div id="recipePreviewBox" class="recipe-preview-box"></div>
        <div style="margin-top:20px;">
          <button class="forge-btn btn-craft" id="btnExecuteForgeBase">✨ Forge Equipment Base</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('chkCraftableOnly')?.addEventListener('change', e => {
    onlyCraftableFilter = e.target.checked;
    updateBaseForgingUI();
  });

  updateBaseForgingUI();
}

function updateBaseForgingUI() {
  const recipeList = document.getElementById('forgeRecipeList');
  if (!recipeList) return;

  if (!player.materials) player.materials = {};

  recipeList.innerHTML = '';

  const displayedRecipes = FORGING_RECIPES.filter(recipe => {
    if (!onlyCraftableFilter) return true;
    for (const [matId, reqCount] of Object.entries(recipe.costs)) {
      if ((player.materials[matId] || 0) < reqCount) return false;
    }
    return true;
  });

  if (displayedRecipes.length === 0) {
    recipeList.innerHTML = `
      <div style="color:#64748b; font-size:12px; text-align:center; padding:30px 10px;">
        No craftable blueprints with current materials.<br>Uncheck "Craftable Only" to view all blueprints.
      </div>
    `;
  } else {
    displayedRecipes.forEach(recipe => {
      let isCraftable = true;
      for (const [matId, reqCount] of Object.entries(recipe.costs)) {
        if ((player.materials[matId] || 0) < reqCount) {
          isCraftable = false;
          break;
        }
      }

      const div = document.createElement('div');
      div.className = `forge-recipe-card ${selectedRecipeId === recipe.id ? 'selected' : ''} ${!isCraftable ? 'lacking-mats' : ''}`;
      div.innerHTML = `
        <div class="frc-left">
          <span class="frc-icon">${recipe.icon}</span>
          <div>
            <div class="frc-title">${recipe.name} <span style="font-size:10px; color:#4ade80;">(Lv. ${recipe.level})</span></div>
            <div class="frc-sub">${recipe.slot} • ${recipe.desc}</div>
          </div>
        </div>
        ${isCraftable ? '<span class="frc-ready-tag">READY</span>' : ''}
      `;
      div.onclick = () => {
        selectedRecipeId = recipe.id;
        AudioEngine.playTone(460, 'sine', 0.06, 0.04);
        updateBaseForgingUI();
      };
      recipeList.appendChild(div);
    });
  }

  const previewBox = document.getElementById('recipePreviewBox');
  const recipe = FORGING_RECIPES.find(r => r.id === selectedRecipeId) || displayedRecipes[0] || FORGING_RECIPES[0];

  let canAfford = true;
  let costSlotsHtml = `<div class="materials-slot-grid">`;
  for (const [matId, reqCount] of Object.entries(recipe.costs)) {
    const matInfo = getMaterialInfo(matId);
    const currentCount = player.materials[matId] || 0;
    const hasEnough = currentCount >= reqCount;
    if (!hasEnough) canAfford = false;

    costSlotsHtml += `
      <div class="mat-inventory-slot ${hasEnough ? 'enough' : 'lacking'}"
           style="--slot-glow-color:${hasEnough ? '#22c55e' : '#ef4444'}; border-color:${hasEnough ? '#22c55e' : '#ef4444'};"
           data-mat-id="${matId}">
        <span class="mat-slot-icon">${matInfo.icon}</span>
        <span class="mat-slot-count" style="color:${hasEnough ? '#4ade80' : '#f87171'}">${currentCount}/${reqCount}</span>
      </div>
    `;
  }
  costSlotsHtml += `</div>`;

  previewBox.innerHTML = `
    <div class="recipe-preview-card">
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:36px;">${recipe.icon}</span>
        <div>
          <h3 style="margin:0; color:#ffd700; font-size:16px;">${recipe.name}</h3>
          <div style="font-size:11px; color:#a0a8b7;">Requires Hero Level ${recipe.level} • Slot: ${recipe.slot}</div>
        </div>
      </div>
      <p style="font-size:12px; color:#cbd5e1; margin:10px 0;">${recipe.desc}</p>
      <div style="background:rgba(0,0,0,0.35); padding:8px 12px; border-radius:6px; border-left:3px solid #00f2fe; margin-bottom:12px;">
        <span style="color:#00f2fe; font-size:12px;">Inherent Base Modifiers: <b>${recipe.baseStats}</b></span>
      </div>
      <h4 style="color:#ffd700; margin-bottom:8px; font-size:12px;">Required Raw Materials:</h4>
      ${costSlotsHtml}
    </div>
  `;

  // Attach tooltips to material requirement slots
  previewBox.querySelectorAll('.mat-inventory-slot').forEach(slot => {
    const matId = slot.getAttribute('data-mat-id');
    const matInfo = getMaterialInfo(matId);
    const count = player.materials[matId] || 0;
    slot.addEventListener('mouseenter', e => showForgeMaterialTooltip(e, matInfo, count));
    slot.addEventListener('mousemove', e => positionForgeTooltip(e));
    slot.addEventListener('mouseleave', hideForgeTooltip);
  });

  const btnForge = document.getElementById('btnExecuteForgeBase');
  if (btnForge) {
    btnForge.disabled = !canAfford;
    btnForge.className = `forge-btn ${canAfford ? 'btn-craft' : 'disabled'}`;
    btnForge.onclick = () => {
      if (!canAfford) return alert('Insufficient raw materials to forge this relic.');

      if (player.bag.length >= 16) {
        return alert('Inventory backpack is full! (Max 16 slots)');
      }

      // 1. Evaluate Crafting Mastery Perks
      const perks = getCraftingMasteryPerks();

      // Check Resource Conservation / Refund
      const isSaved = Math.random() * 100 < perks.resourceSaveChance;
      if (!isSaved) {
        for (const [matId, reqCount] of Object.entries(recipe.costs)) {
          player.materials[matId] -= reqCount;
        }
      } else {
        AudioEngine.playTone(660, 'sine', 0.25, 0.15);
        spawnDamageNumber(player.x, player.y - 65, '🍀 RESOURCE REFUND: Materials Preserved!', true, '#4ade80');
      }

      // Check Extra Socket Blessing
      let sockets = (recipe.slot === 'MainHand' || recipe.slot === 'BodyArmor') ? 2 : (recipe.slot === 'Ring' || recipe.slot === 'Amulet' ? 0 : 1);
      const isExtraSocket = Math.random() * 100 < perks.extraSocketChance;
      if (isExtraSocket && sockets < 6 && recipe.slot !== 'Ring' && recipe.slot !== 'Amulet') {
        sockets = Math.min(6, sockets + 1);
      }
      const links = sockets > 1 ? 1 : 0;

      // Base Stats
      let baseDmg = recipe.slot === 'MainHand' ? (recipe.level * 2 + 15) : 0;
      let baseArmor = recipe.slot === 'BodyArmor' ? (recipe.level * 4 + 40) : 0;
      let baseLife = recipe.slot === 'BodyArmor' ? (recipe.level * 2 + 20) : 0;

      // Check Masterwork Critical (+25% Stats & Superior Quality)
      const isMasterwork = Math.random() * 100 < perks.masterworkCritChance;
      let itemName = recipe.name;
      let itemRarity = 'Normal';
      let itemColor = '#ffffff';
      const craftedMods = [];

      if (isMasterwork) {
        itemName = '⭐ Masterwork ' + recipe.name;
        itemRarity = 'Rare';
        itemColor = '#ffd700';
        baseDmg = Math.round(baseDmg * 1.25);
        baseArmor = Math.round(baseArmor * 1.25);
        baseLife = Math.round(baseLife * 1.25);
        craftedMods.push('✨ Masterwork: +25% Superior Base Stats');
      }

      const newItem = {
        name: itemName,
        baseType: recipe.baseType,
        slot: recipe.slot,
        rarity: itemRarity,
        level: recipe.level,
        color: itemColor,
        icon: recipe.icon,
        sockets: sockets,
        links: links,
        isMasterwork: isMasterwork,
        quality: isMasterwork ? 20 : 0,
        stats: {
          damage: baseDmg,
          armor: baseArmor,
          life: baseLife
        },
        craftedMods: craftedMods
      };

      player.bag.push(newItem);

      if (isMasterwork) {
        AudioEngine.playLevelUp?.() || AudioEngine.playTone(1100, 'sine', 0.4, 0.3);
        spawnDamageNumber(player.x, player.y - 45, `⭐ MASTERWORK CRIT: ${itemName}!`, true, '#ffd700');
      } else {
        AudioEngine.playTone(880, 'sine', 0.3, 0.2);
        spawnDamageNumber(player.x, player.y - 45, `✨ FORGED ${newItem.name}!`, true, '#ffd700');
      }

      addCraftingExp(35, 'Base Forging');

      updateBaseForgingUI();
      updateBackpackUI();
      saveToDatabase();
    };
  }
}

// =========================================================================
// TAB 4: MATERIALS VAULT (AUTO-HIDE ZERO QUANTITY & INVENTORY SLOTS GRID)
// =========================================================================
function renderMaterialsVaultTab(container) {
  if (!player.materials) player.materials = {};

  // Auto-hide materials with count <= 0 as requested
  const ownedMaterials = Object.values(MATERIALS_CATALOG).filter(mat => (player.materials[mat.id] || 0) > 0);

  if (ownedMaterials.length === 0) {
    container.innerHTML = `
      <div class="empty-materials-vault">
        <span style="font-size:52px; filter:drop-shadow(0 0 15px rgba(255,215,0,0.4));">🎒</span>
        <h3 style="color:#ffd700; margin:12px 0 6px 0;">Kho Nguyên Liệu Đang Trống</h3>
        <p style="color:#94a3b8; font-size:13px; max-width:440px; text-align:center; line-height:1.6;">
          Hiện tại bạn chưa có nguyên liệu nào trong kho.<br>
          Hãy phân rã (Salvage) trang bị rác tại Tab 2 hoặc khám phá dã ngoại, săn quái và mở Rương Hư Không để thu thập!
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="materials-vault-wrap">
      <div class="mv-header">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="color:#ffd700; margin:0; font-size:16px;">🎒 Kho Nguyên Liệu Chế Tác</h3>
            <span style="font-size:11px; color:#a0a8b7;">Tự động gộp ô • Rê chuột lên ô để xem chi tiết thuộc tính</span>
          </div>
          <span class="vault-count-badge">💎 ${ownedMaterials.length} / 13 Loại Nguyên Liệu</span>
        </div>
      </div>

      <div class="materials-slot-grid" id="matVaultSlotGrid"></div>
    </div>
  `;

  const grid = document.getElementById('matVaultSlotGrid');
  if (!grid) return;

  ownedMaterials.forEach(mat => {
    const count = player.materials[mat.id] || 0;
    const slotEl = document.createElement('div');
    slotEl.className = 'mat-inventory-slot';
    slotEl.style.setProperty('--slot-glow-color', mat.color);
    slotEl.style.borderColor = mat.color;
    slotEl.innerHTML = `
      <span class="mat-slot-icon">${mat.icon}</span>
      <span class="mat-slot-count">x${count}</span>
    `;

    slotEl.addEventListener('mouseenter', e => showForgeMaterialTooltip(e, mat, count));
    slotEl.addEventListener('mousemove', e => positionForgeTooltip(e));
    slotEl.addEventListener('mouseleave', hideForgeTooltip);

    grid.appendChild(slotEl);
  });
}

// =========================================================================
// RICH FLOATING TOOLTIP FOR FORGE MATERIALS
// =========================================================================
function ensureForgeTooltipElement() {
  let tooltip = document.getElementById('forgeFloatingTooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'forgeFloatingTooltip';
    tooltip.className = 'forge-floating-tooltip hidden';
    document.body.appendChild(tooltip);
  }
  return tooltip;
}

export function showForgeMaterialTooltip(e, mat, count) {
  const tooltip = ensureForgeTooltipElement();
  if (!tooltip || !mat) return;

  tooltip.innerHTML = `
    <div class="ft-header">
      <span class="ft-icon">${mat.icon}</span>
      <div>
        <div class="ft-name" style="color:${mat.color}">${mat.name}</div>
        <div class="ft-cat">${mat.category} Material • ${mat.rarity}</div>
      </div>
    </div>
    <div class="ft-divider"></div>
    <div class="ft-desc">${mat.desc}</div>
    <div class="ft-footer">
      <span>Kho sở hữu: <b style="color:#4ade80;">x${count}</b></span>
      <span style="color:#64748b;">Max Stack: 9999</span>
    </div>
  `;

  tooltip.classList.remove('hidden');
  positionForgeTooltip(e);
}

export function positionForgeTooltip(e) {
  const tooltip = document.getElementById('forgeFloatingTooltip');
  if (!tooltip || tooltip.classList.contains('hidden') || !e) return;

  const w = 260;
  const h = 130;

  let x = e.clientX + 14;
  let y = e.clientY + 14;

  if (x + w > window.innerWidth - 10) x = e.clientX - w - 14;
  if (y + h > window.innerHeight - 10) y = window.innerHeight - h - 10;

  tooltip.style.left = `${Math.round(x)}px`;
  tooltip.style.top = `${Math.round(y)}px`;
}

export function hideForgeTooltip() {
  const tooltip = document.getElementById('forgeFloatingTooltip');
  if (tooltip) tooltip.classList.add('hidden');
}

// Helper utilities
function countCurrency(name) {
  return player.bag.filter(it => it && it.name && it.name.toLowerCase().includes(name.toLowerCase())).length;
}

function consumeCurrency(name, count) {
  let consumed = 0;
  for (let i = player.bag.length - 1; i >= 0; i--) {
    if (player.bag[i] && player.bag[i].name && player.bag[i].name.toLowerCase().includes(name.toLowerCase())) {
      player.bag.splice(i, 1);
      consumed++;
      if (consumed >= count) return true;
    }
  }
  return false;
}

// =========================================================================
// TAB 5: GATHERING PROFESSIONS
// =========================================================================
function renderProfessionsTab(container) {
  if (!player.professions) {
    player.professions = {
      mining: { level: 1, exp: 0 },
      herbalism: { level: 1, exp: 0 },
      skinning: { level: 1, exp: 0 }
    };
  }

  const profs = [
    {
      id: 'mining',
      name: 'Mining (Khai Khoáng)',
      icon: '⛏️',
      color: '#00f2fe',
      data: player.professions.mining || { level: 1, exp: 0 },
      tiers: [
        { name: 'Iron Ore (Quặng Sắt)', levelReq: 1, icon: '⛏️', color: '#a0a8b7' },
        { name: 'Mithril Chunk (Mithril Băng)', levelReq: 10, icon: '💎', color: '#00f2fe' },
        { name: 'Aether Crystal (Tinh Thể Bí Thuật)', levelReq: 25, icon: '🔮', color: '#c678dd' },
        { name: 'Adamantite Ingot (Lõi Kim Cương Hỏa)', levelReq: 40, icon: '🪨', color: '#ffd700' }
      ]
    },
    {
      id: 'herbalism',
      name: 'Herbalism (Thảo Dược Học)',
      icon: '🌿',
      color: '#4ade80',
      data: player.professions.herbalism || { level: 1, exp: 0 },
      tiers: [
        { name: 'Bloodroot Herb (Cỏ Rễ Máu)', levelReq: 1, icon: '🌿', color: '#ff4d4f' },
        { name: 'Mana Bloom (Hoa Mana Tinh Tú)', levelReq: 10, icon: '🌸', color: '#1890ff' },
        { name: 'Windstrider Leaf (Lá Gió Phiêu Phong)', levelReq: 25, icon: '🍃', color: '#52c41a' }
      ]
    },
    {
      id: 'skinning',
      name: 'Skinning & Hunting (Lột Da / Săn Thú)',
      icon: '🐺',
      color: '#ffd700',
      data: player.professions.skinning || { level: 1, exp: 0 },
      tiers: [
        { name: 'Beast Leather (Da Thú Rừng)', levelReq: 1, icon: '🐺', color: '#d48806' },
        { name: 'Fiend Demon Horn (Sừng Quỷ Dị Giới)', levelReq: 15, icon: '👹', color: '#eb2f96' },
        { name: 'Dragon Scale (Vảy Rồng Lửa Cổ)', levelReq: 35, icon: '🐉', color: '#fa541c' }
      ]
    }
  ];

  container.innerHTML = `
    <div class="materials-vault-wrap">
      <div class="mv-header">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="color:#ffd700; margin:0; font-size:16px;">🛠️ Gathering Professions & Mastery Tiers</h3>
            <span style="font-size:11px; color:#a0a8b7;">Harvest world nodes and slain monsters to level up your gathering mastery</span>
          </div>
          <span class="vault-count-badge">Max Level 50</span>
        </div>
      </div>

      <div class="professions-grid">
        ${profs.map(p => {
          const maxExp = p.data.level * 100;
          const pct = Math.min(100, (p.data.exp / maxExp) * 100);
          return `
            <div class="profession-card" style="border-color:${p.color}40;">
              <div class="prof-card-header">
                <span style="font-size:28px;">${p.icon}</span>
                <div style="flex:1;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:800; font-size:14px; color:${p.color}">${p.name}</span>
                    <span style="font-weight:800; font-size:13px; color:#ffd700;">Lv. ${p.data.level} / 50</span>
                  </div>
                  <div class="prof-exp-bar-wrap">
                    <div class="prof-exp-fill" style="width:${pct}%; background:${p.color};"></div>
                  </div>
                  <div style="display:flex; justify-content:space-between; font-size:10px; color:#94a3b8; margin-top:2px;">
                    <span>Proficiency EXP</span>
                    <span>${p.data.exp} / ${maxExp} (${Math.round(pct)}%)</span>
                  </div>
                </div>
              </div>

              <div class="prof-tiers-list">
                <div style="font-size:11px; font-weight:700; color:#ffd700; margin-bottom:4px;">🔓 Unlocked Gathering Tiers:</div>
                <div style="display:flex; flex-direction:column; gap:4px;">
                  ${p.tiers.map(t => {
                    const isUnlocked = p.data.level >= t.levelReq;
                    return `
                      <div class="prof-tier-row ${isUnlocked ? 'unlocked' : 'locked'}">
                        <span>${t.icon} ${t.name}</span>
                        <span style="font-weight:700; color:${isUnlocked ? '#4ade80' : '#ef4444'};">
                          ${isUnlocked ? '✓ UNLOCKED' : `Req Lv.${t.levelReq}`}
                        </span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

