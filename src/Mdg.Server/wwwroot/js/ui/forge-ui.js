/**
 * MDG: Aethelis - Genesis Forge Bench & Crafting UI 2.0 (High-Fantasy Dark Glassmorphism)
 * 4 Tabs: Relic Anvil (Metamods/Sockets), Salvage Anvil, Base Forging & Materials Vault
 */

import { player } from '../state.js?v=11';
import { AudioEngine } from '../audio.js?v=11';
import { updateBackpackUI, updatePaperdollUI } from './inventory.js?v=11';
import { ApiClient } from '../services/api-client.js?v=11';
import { MATERIALS_CATALOG, FORGING_RECIPES, getMaterialInfo, previewSalvageItem } from '../data/materials.js?v=11';
import { spawnDamageNumber } from '../combat.js?v=11';
import { saveToDatabase } from '../save-system.js?v=11';

let activeForgeTab = 'anvil'; // 'anvil' | 'salvage' | 'base_forge' | 'vault'
let selectedItemIndex = -1;
let selectedSalvageIndex = -1;
let selectedRecipeId = 'forge_iron_sword';

export function renderForgeBenchModal() {
  let modal = document.getElementById('forgeBenchModal');
  if (modal && modal.style.display !== 'none') {
    modal.style.display = 'none';
    modal.classList.remove('active');
    modal.classList.add('hidden');
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

        <!-- 4-Tab Navigation Bar -->
        <div class="forge-tabs-nav">
          <button class="forge-nav-tab active" data-tab="anvil">🔨 Relic Anvil</button>
          <button class="forge-nav-tab" data-tab="salvage">♻️ Salvage Anvil</button>
          <button class="forge-nav-tab" data-tab="base_forge">🗡️ Base Forging</button>
          <button class="forge-nav-tab" data-tab="vault">🎒 Materials Vault</button>
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
      AudioEngine.playTone(330, 'triangle', 0.1, 0.08);
    };

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        modal.classList.add('hidden');
      }
    });

    modal.querySelectorAll('.forge-nav-tab').forEach(btn => {
      btn.onclick = () => {
        modal.querySelectorAll('.forge-nav-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeForgeTab = btn.getAttribute('data-tab');
        AudioEngine.playTone(520, 'sine', 0.08, 0.05);
        renderActiveForgeTab();
      };
    });
  }

  modal.classList.remove('hidden');
  modal.classList.add('active');
  modal.style.display = 'flex';
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
  }
}

// ----------------------------------------------------
// TAB 1: RELIC ANVIL & METAMODS
// ----------------------------------------------------
function renderRelicAnvilTab(container) {
  container.innerHTML = `
    <div class="forge-content-grid">
      <!-- Item Selection & Anvil -->
      <div class="forge-anvil-panel">
        <h3>🗡️ Relic Anvil</h3>
        <div id="anvilSlot" class="anvil-slot">
          <div class="empty-anvil-text">Click an item below to place it onto the Forge Anvil</div>
        </div>
        <div class="anvil-item-details" id="anvilItemDetails"></div>
        
        <h4>📦 Inventory Backpack Gear</h4>
        <div class="forge-backpack-list" id="forgeBackpackList"></div>
      </div>

      <!-- Crafting Operations -->
      <div class="forge-actions-panel">
        <h3>✨ Alchemy Rituals & Forging</h3>
        
        <!-- Currency Inventory Status -->
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
    const div = document.createElement('div');
    div.className = `forge-bag-item ${selectedItemIndex === idx ? 'selected' : ''} ${!isEquipable ? 'disabled' : ''}`;
    div.style.borderColor = item.color || '#fff';
    div.innerHTML = `
      <span class="item-name" style="color:${item.color || '#fff'}">${item.name}</span>
      <span class="item-slot">${item.slot || 'Gear'} (${item.rarity || 'Normal'})</span>
    `;

    if (isEquipable) {
      div.onclick = () => {
        selectedItemIndex = idx;
        updateAnvilUI();
      };
    }
    backpackList.appendChild(div);
  });

  const anvilSlot = document.getElementById('anvilSlot');
  const details = document.getElementById('anvilItemDetails');
  const selectedItem = player.bag[selectedItemIndex];

  if (!selectedItem || selectedItem.slot === 'Currency' || selectedItem.slot === 'Gem' || selectedItem.category === 'map') {
    anvilSlot.innerHTML = `<div class="empty-anvil-text">No equipment selected</div>`;
    details.innerHTML = '';
  } else {
    const sockets = selectedItem.sockets || 2;
    const links = selectedItem.links || 1;
    let socketsHtml = `<div class="item-sockets-row">Sockets: `;
    for (let s = 0; s < sockets; s++) {
      socketsHtml += `<span class="socket-gem-pip">${s < links ? '🔗⚪' : '⚪'}</span> `;
    }
    socketsHtml += `</div>`;

    anvilSlot.innerHTML = `
      <div class="anvil-placed-item" style="border-color:${selectedItem.color}">
        <div style="font-weight:bold; font-size:16px; color:${selectedItem.color}">${selectedItem.name}</div>
        <div style="font-size:12px; color:#aaa">${selectedItem.rarity} ${selectedItem.slot} (iLvl ${selectedItem.level || 65})</div>
        ${socketsHtml}
      </div>
    `;

    let modsHtml = `<ul class="forge-mods-list">`;
    if (selectedItem.stats) {
      for (const [k, v] of Object.entries(selectedItem.stats)) {
        modsHtml += `<li>• +${v} ${k}</li>`;
      }
    }
    if (selectedItem.craftedMods) {
      selectedItem.craftedMods.forEach(m => {
        modsHtml += `<li style="color:#00f2fe">• [Forge] ${m}</li>`;
      });
    }
    modsHtml += `</ul>`;
    details.innerHTML = modsHtml;
  }

  const currencySum = document.getElementById('forgeCurrencySummary');
  if (currencySum) {
    const fractureCores = countCurrency('Fracture Core');
    const ascendantCatalysts = countCurrency('Ascendant Catalyst');
    const socketingCores = countCurrency('Socketing Core') + countCurrency('Aether Spark');
    const harmonicTethers = countCurrency('Harmonic Tether') + countCurrency('Flux Catalyst');

    currencySum.innerHTML = `
      <span>🔮 Fracture Cores: <b>${fractureCores}</b></span> |
      <span>✨ Ascendant Catalysts: <b>${ascendantCatalysts}</b></span> |
      <span>⚪ Sockets/Tethers: <b>${socketingCores}/${harmonicTethers}</b></span>
    `;
  }
}

function setupAnvilListeners() {
  document.getElementById('btnLockPrefixes')?.addEventListener('click', () => {
    const item = player.bag[selectedItemIndex];
    if (!item) return alert('Please place a piece of equipment onto the anvil.');
    if (countCurrency('Fracture Core') < 2) return alert('Requires 2x Fracture Cores!');
    consumeCurrency('Fracture Core', 2);
    item.prefixesLocked = true;
    AudioEngine.playTone(587, 'sine', 0.2, 0.15);
    spawnDamageNumber(player.x, player.y - 45, '🔒 PREFIXES LOCKED!', true, '#ffd700');
    updateAnvilUI();
    saveToDatabase();
  });

  document.getElementById('btnLockSuffixes')?.addEventListener('click', () => {
    const item = player.bag[selectedItemIndex];
    if (!item) return alert('Please place a piece of equipment onto the anvil.');
    if (countCurrency('Fracture Core') < 2) return alert('Requires 2x Fracture Cores!');
    consumeCurrency('Fracture Core', 2);
    item.suffixesLocked = true;
    AudioEngine.playTone(587, 'sine', 0.2, 0.15);
    spawnDamageNumber(player.x, player.y - 45, '🔒 SUFFIXES LOCKED!', true, '#ffd700');
    updateAnvilUI();
    saveToDatabase();
  });

  document.getElementById('btnRerollSockets')?.addEventListener('click', async () => {
    const item = player.bag[selectedItemIndex];
    if (!item) return alert('Please place a piece of equipment onto the anvil.');
    if (!consumeCurrency('Socketing Core', 1) && !consumeCurrency('Aether Spark', 1)) {
      return alert('Requires 1x Socketing Core or 1x Aether Spark!');
    }
    item.sockets = Math.floor(Math.random() * 3) + 2;
    item.links = Math.min(item.sockets, item.links || 1);
    AudioEngine.playTone(440, 'triangle', 0.15, 0.15);
    spawnDamageNumber(player.x, player.y - 45, `⚪ REFORGED: ${item.sockets} SOCKETS!`, true, '#00f2fe');
    updateAnvilUI();
    updatePaperdollUI();
    saveToDatabase();
  });

  document.getElementById('btnRerollLinks')?.addEventListener('click', async () => {
    const item = player.bag[selectedItemIndex];
    if (!item) return alert('Please place a piece of equipment onto the anvil.');
    if (!consumeCurrency('Harmonic Tether', 1) && !consumeCurrency('Flux Catalyst', 1)) {
      return alert('Requires 1x Harmonic Tether or 1x Flux Catalyst!');
    }
    item.links = Math.min(item.sockets || 2, Math.floor(Math.random() * (item.sockets || 2)) + 1);
    AudioEngine.playTone(659, 'sine', 0.2, 0.15);
    spawnDamageNumber(player.x, player.y - 45, `🔗 REFORGED: ${item.links} LINKS!`, true, '#a855f7');
    updateAnvilUI();
    updatePaperdollUI();
    saveToDatabase();
  });

  document.getElementById('btnCraftAffix')?.addEventListener('click', async () => {
    const item = player.bag[selectedItemIndex];
    if (!item) return alert('Please place a piece of equipment onto the anvil.');
    if (!consumeCurrency('Ascendant Catalyst', 1) && !consumeCurrency('Genesis Prism', 1)) {
      return alert('Requires 1x Ascendant Catalyst or 1x Genesis Prism!');
    }
    const select = document.getElementById('forgeAffixSelect');
    const chosenText = select.options[select.selectedIndex].text;
    item.craftedMods = item.craftedMods || [];
    item.craftedMods.push(chosenText);
    item.rarity = 'Rare';
    item.color = '#ffff77';
    if (chosenText.includes('Life')) item.stats.life = (item.stats.life || 0) + 65;
    if (chosenText.includes('Physical')) item.stats.damage = (item.stats.damage || 0) + 35;
    if (chosenText.includes('Energy Shield')) item.stats.es = (item.stats.es || 0) + 50;
    if (chosenText.includes('Fire Resistance')) player.fireRes = Math.min(90, (player.fireRes || 0) + 10);
    if (chosenText.includes('Attack Speed')) item.stats.attackSpeed = (item.stats.attackSpeed || 0) + 15;
    AudioEngine.playTone(880, 'sine', 0.3, 0.2);
    spawnDamageNumber(player.x, player.y - 45, `✨ BENCH CRAFTED: ${chosenText.split('(')[0]}!`, true, '#ffd700');
    updateAnvilUI();
    updateBackpackUI();
    updatePaperdollUI();
    saveToDatabase();
  });

  document.getElementById('btnChaosReroll')?.addEventListener('click', async () => {
    const item = player.bag[selectedItemIndex];
    if (!item) return alert('Please place a piece of equipment onto the anvil.');
    if (!consumeCurrency('Fracture Core', 1) && !consumeCurrency('Chaos Orb', 1)) {
      return alert('Requires 1x Fracture Core to chaos reroll all affixes!');
    }
    item.rarity = 'Rare';
    item.color = '#ffff77';
    item.stats = {
      damage: Math.floor(Math.random() * 40) + 25,
      armor: Math.floor(Math.random() * 60) + 40,
      life: Math.floor(Math.random() * 70) + 30
    };
    item.craftedMods = [];
    AudioEngine.playTone(330, 'sawtooth', 0.25, 0.18);
    spawnDamageNumber(player.x, player.y - 45, '🌀 CHAOS REFORGED ALL AFFIXES!', true, '#eab308');
    updateAnvilUI();
    updateBackpackUI();
    updatePaperdollUI();
    saveToDatabase();
  });
}

// ----------------------------------------------------
// TAB 2: SALVAGE ANVIL (RECLAIM MATERIALS FROM JUNK)
// ----------------------------------------------------
function renderSalvageTab(container) {
  container.innerHTML = `
    <div class="forge-content-grid">
      <!-- Item Selection for Salvage -->
      <div class="forge-anvil-panel">
        <h3>♻️ Select Gear to Salvage</h3>
        <p style="font-size:12px; color:#888; margin-top:-5px;">Break down redundant equipment into valuable raw ores, beast hides & Genesis Shards.</p>
        <div class="forge-backpack-list" id="salvageBackpackList"></div>
      </div>

      <!-- Salvage Preview & Action -->
      <div class="forge-actions-panel">
        <h3>🔥 Salvage Reclamation Anvil</h3>
        <div id="salvageTargetSlot" class="anvil-slot">
          <div class="empty-anvil-text">Select an item on the left to inspect salvage yields</div>
        </div>

        <div class="salvage-yield-box" id="salvageYieldBox"></div>

        <div style="margin-top:20px;">
          <button class="forge-btn btn-salvage" id="btnExecuteSalvage">♻️ Salvage Item Into Materials</button>
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
    const isEquipable = item.slot !== 'Currency' && item.slot !== 'Gem' && item.category !== 'map';
    const div = document.createElement('div');
    div.className = `forge-bag-item ${selectedSalvageIndex === idx ? 'selected' : ''} ${!isEquipable ? 'disabled' : ''}`;
    div.style.borderColor = item.color || '#fff';
    div.innerHTML = `
      <span class="item-name" style="color:${item.color || '#fff'}">${item.name}</span>
      <span class="item-slot">${item.slot || 'Gear'} (${item.rarity || 'Normal'})</span>
    `;

    if (isEquipable) {
      div.onclick = () => {
        selectedSalvageIndex = idx;
        updateSalvageUI();
      };
    }
    backpackList.appendChild(div);
  });

  const targetSlot = document.getElementById('salvageTargetSlot');
  const yieldBox = document.getElementById('salvageYieldBox');
  const selectedItem = player.bag[selectedSalvageIndex];

  if (!selectedItem || selectedItem.slot === 'Currency' || selectedItem.slot === 'Gem') {
    targetSlot.innerHTML = `<div class="empty-anvil-text">No equipment selected for salvage</div>`;
    yieldBox.innerHTML = '';
  } else {
    targetSlot.innerHTML = `
      <div class="anvil-placed-item" style="border-color:${selectedItem.color}">
        <div style="font-weight:bold; font-size:16px; color:${selectedItem.color}">${selectedItem.name}</div>
        <div style="font-size:12px; color:#aaa">${selectedItem.rarity} ${selectedItem.slot} (iLvl ${selectedItem.level || 65})</div>
      </div>
    `;

    const yields = previewSalvageItem(selectedItem);
    yieldBox.innerHTML = `
      <h4 style="color:#ffd700; margin-bottom:10px;">📦 Guaranteed Salvage Materials:</h4>
      <div class="salvage-yield-grid">
        ${yields.map(y => {
          const matInfo = getMaterialInfo(y.id);
          return `
            <div class="salvage-yield-card">
              <span class="syc-icon">${y.isCurrency ? '🔮' : matInfo.icon}</span>
              <div class="syc-info">
                <div class="syc-name" style="color:${matInfo.color || '#ffd700'}">${y.isCurrency ? 'Fracture Core' : matInfo.name}</div>
                <div class="syc-count">Quantity: +${y.count}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
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

      updateSalvageUI();
      updateBackpackUI();
      saveToDatabase();
    };
  }
}

// ----------------------------------------------------
// TAB 3: BASE EQUIPMENT FORGING
// ----------------------------------------------------
function renderBaseForgingTab(container) {
  container.innerHTML = `
    <div class="forge-content-grid">
      <!-- Recipe List -->
      <div class="forge-anvil-panel">
        <h3>🗡️ Blacksmith Relic Blueprints</h3>
        <div class="forge-recipe-list" id="forgeRecipeList"></div>
      </div>

      <!-- Recipe Details & Forging Action -->
      <div class="forge-actions-panel">
        <h3>🔨 Smelting & Relic Forging</h3>
        <div id="recipePreviewBox" class="recipe-preview-box"></div>
        <div style="margin-top:20px;">
          <button class="forge-btn btn-craft" id="btnExecuteForgeBase">✨ Forge Equipment Base</button>
        </div>
      </div>
    </div>
  `;

  updateBaseForgingUI();
}

function updateBaseForgingUI() {
  const recipeList = document.getElementById('forgeRecipeList');
  if (!recipeList) return;

  recipeList.innerHTML = '';
  FORGING_RECIPES.forEach(recipe => {
    const div = document.createElement('div');
    div.className = `forge-recipe-card ${selectedRecipeId === recipe.id ? 'selected' : ''}`;
    div.innerHTML = `
      <div class="frc-left">
        <span class="frc-icon">${recipe.icon}</span>
        <div>
          <div class="frc-title">${recipe.name} (Lv. ${recipe.level})</div>
          <div class="frc-sub">${recipe.slot} • ${recipe.desc}</div>
        </div>
      </div>
    `;
    div.onclick = () => {
      selectedRecipeId = recipe.id;
      updateBaseForgingUI();
    };
    recipeList.appendChild(div);
  });

  const previewBox = document.getElementById('recipePreviewBox');
  const recipe = FORGING_RECIPES.find(r => r.id === selectedRecipeId) || FORGING_RECIPES[0];

  if (!player.materials) player.materials = {};

  let canAfford = true;
  let costHtml = `<div class="recipe-costs-grid">`;
  for (const [matId, reqCount] of Object.entries(recipe.costs)) {
    const matInfo = getMaterialInfo(matId);
    const currentCount = player.materials[matId] || 0;
    const hasEnough = currentCount >= reqCount;
    if (!hasEnough) canAfford = false;

    costHtml += `
      <div class="recipe-cost-badge ${hasEnough ? 'enough' : 'lacking'}">
        <span>${matInfo.icon} ${matInfo.name}: <b>${currentCount} / ${reqCount}</b></span>
      </div>
    `;
  }
  costHtml += `</div>`;

  previewBox.innerHTML = `
    <div class="recipe-preview-card">
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:32px;">${recipe.icon}</span>
        <div>
          <h3 style="margin:0; color:#ffd700;">${recipe.name}</h3>
          <div style="font-size:12px; color:#a0a8b7;">Requires Level ${recipe.level} • Slot: ${recipe.slot}</div>
        </div>
      </div>
      <p style="font-size:13px; color:#cbd5e1; margin:12px 0;">${recipe.desc}</p>
      <div style="background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border-left:3px solid #00f2fe; margin-bottom:15px;">
        <span style="color:#00f2fe; font-size:13px;">Inherent Base Modifiers: ${recipe.baseStats}</span>
      </div>
      <h4 style="color:#ffd700; margin-bottom:8px;">Required Raw Materials:</h4>
      ${costHtml}
    </div>
  `;

  const btnForge = document.getElementById('btnExecuteForgeBase');
  if (btnForge) {
    btnForge.disabled = !canAfford;
    btnForge.className = `forge-btn ${canAfford ? 'btn-craft' : 'disabled'}`;
    btnForge.onclick = () => {
      if (!canAfford) return alert('Insufficient raw materials to forge this relic.');

      if (player.bag.length >= 16) {
        return alert('Inventory backpack is full! (Max 16 slots)');
      }

      // Deduct materials
      for (const [matId, reqCount] of Object.entries(recipe.costs)) {
        player.materials[matId] -= reqCount;
      }

      // Generate forged Normal equipment item with sockets
      const sockets = (recipe.slot === 'MainHand' || recipe.slot === 'BodyArmor') ? 2 : (recipe.slot === 'Ring' || recipe.slot === 'Amulet' ? 0 : 1);
      const links = sockets > 1 ? 1 : 0;

      const newItem = {
        name: recipe.name,
        baseType: recipe.baseType,
        slot: recipe.slot,
        rarity: 'Normal',
        level: recipe.level,
        color: '#ffffff',
        icon: recipe.icon,
        sockets: sockets,
        links: links,
        stats: {
          damage: recipe.slot === 'MainHand' ? (recipe.level * 2 + 15) : 0,
          armor: recipe.slot === 'BodyArmor' ? (recipe.level * 4 + 40) : 0,
          life: recipe.slot === 'BodyArmor' ? (recipe.level * 2 + 20) : 0
        },
        craftedMods: []
      };

      player.bag.push(newItem);

      AudioEngine.playLevelUp?.() || AudioEngine.playTone(880, 'sine', 0.3, 0.2);
      spawnDamageNumber(player.x, player.y - 50, `✨ FORGED ${recipe.name}!`, true, '#ffd700');

      updateBaseForgingUI();
      updateBackpackUI();
      saveToDatabase();
    };
  }
}

// ----------------------------------------------------
// TAB 4: MATERIALS VAULT
// ----------------------------------------------------
function renderMaterialsVaultTab(container) {
  if (!player.materials) player.materials = {};

  const matEntries = Object.values(MATERIALS_CATALOG);

  container.innerHTML = `
    <div class="materials-vault-wrap">
      <div class="mv-header">
        <h3 style="color:#ffd700; margin:0;">🎒 Account Crafting Materials Vault</h3>
        <span style="font-size:12px; color:#a0a8b7;">Auto-stacking raw ores, beast trophies, herbs and elemental catalyst shards</span>
      </div>

      <div class="materials-vault-grid">
        ${matEntries.map(mat => {
          const count = player.materials[mat.id] || 0;
          return `
            <div class="mat-vault-card ${count > 0 ? 'has-stock' : 'empty-stock'}">
              <div class="mvc-top">
                <span class="mvc-icon">${mat.icon}</span>
                <span class="mvc-count" style="color:${count > 0 ? '#4ade80' : '#64748b'}">x${count}</span>
              </div>
              <div class="mvc-name" style="color:${mat.color}">${mat.name}</div>
              <div class="mvc-type">${mat.category} • ${mat.rarity}</div>
              <div class="mvc-desc">${mat.desc}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
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
