/**
 * MDG: Aethelis - Genesis Forge Bench & Crafting UI (PoE Bench Style - English)
 * Prefix/Suffix Locking, Guaranteed Affix Crafting, Socket Rerolling & Links
 */

import { player } from '../state.js';
import { AudioEngine } from '../audio.js';
import { updateBackpackUI, updatePaperdollUI } from './inventory.js';
import { ApiClient } from '../services/api-client.js';

let selectedItemIndex = -1;

export function renderForgeBenchModal() {
  let modal = document.getElementById('forgeBenchModal');
  if (modal && modal.style.display !== 'none') {
    modal.style.display = 'none';
    return;
  }
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'forgeBenchModal';
    modal.className = 'game-modal-backdrop';
    modal.innerHTML = `
      <div class="forge-modal-card">
        <div class="modal-header">
          <h2>🔨 Genesis Crafting Forge Bench</h2>
          <button class="close-btn" id="closeForgeBtn">✕</button>
        </div>
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
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeForgeBtn').onclick = () => {
      modal.style.display = 'none';
    };

    setupForgeEventListeners();
  }

  updateForgeUI();
  modal.style.display = 'flex';
}

function updateForgeUI() {
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
        updateForgeUI();
      };
    }
    backpackList.appendChild(div);
  });

  // Update Anvil Slot
  const anvilSlot = document.getElementById('anvilSlot');
  const details = document.getElementById('anvilItemDetails');
  const selectedItem = player.bag[selectedItemIndex];

  if (!selectedItem || selectedItem.slot === 'Currency' || selectedItem.slot === 'Gem' || selectedItem.category === 'map') {
    anvilSlot.innerHTML = `<div class="empty-anvil-text">No equipment selected</div>`;
    details.innerHTML = '';
  } else {
    // Generate Sockets visual
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
        <div style="font-size:12px; color:#aaa">${selectedItem.rarity} ${selectedItem.slot} (iLvl 65)</div>
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

  // Update Currency Summary
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

function setupForgeEventListeners() {
  document.getElementById('btnLockPrefixes').onclick = () => {
    const item = player.bag[selectedItemIndex];
    if (!item) return alert('Please place a piece of equipment onto the anvil.');
    if (countCurrency('Fracture Core') < 2) return alert('Requires 2x Fracture Cores!');

    consumeCurrency('Fracture Core', 2);
    item.prefixesLocked = true;
    AudioEngine.playTone(587, 'sine', 0.2, 0.15);
    alert('🔒 Prefixes Locked successfully!');
    updateForgeUI();
  };

  document.getElementById('btnLockSuffixes').onclick = () => {
    const item = player.bag[selectedItemIndex];
    if (!item) return alert('Please place a piece of equipment onto the anvil.');
    if (countCurrency('Fracture Core') < 2) return alert('Requires 2x Fracture Cores!');

    consumeCurrency('Fracture Core', 2);
    item.suffixesLocked = true;
    AudioEngine.playTone(587, 'sine', 0.2, 0.15);
    alert('🔒 Suffixes Locked successfully!');
    updateForgeUI();
  };

  document.getElementById('btnRerollSockets').onclick = async () => {
    const item = player.bag[selectedItemIndex];
    if (!item) return alert('Please place a piece of equipment onto the anvil.');
    
    // Allow using Socketing Core or Aether Spark
    if (!consumeCurrency('Socketing Core', 1) && !consumeCurrency('Aether Spark', 1)) {
      return alert('Requires 1x Socketing Core or 1x Aether Spark!');
    }

    const serverRes = await ApiClient.applyForgeCurrency('Currency_Jeweller', item);
    if (serverRes && serverRes.success && serverRes.item) {
      Object.assign(item, serverRes.item);
    } else {
      item.sockets = Math.floor(Math.random() * 3) + 2;
      item.links = Math.min(item.sockets, item.links || 1);
    }
    AudioEngine.playTone(440, 'triangle', 0.15, 0.15);
    updateForgeUI();
    updatePaperdollUI();
  };

  document.getElementById('btnRerollLinks').onclick = async () => {
    const item = player.bag[selectedItemIndex];
    if (!item) return alert('Please place a piece of equipment onto the anvil.');
    
    if (!consumeCurrency('Harmonic Tether', 1) && !consumeCurrency('Flux Catalyst', 1)) {
      return alert('Requires 1x Harmonic Tether or 1x Flux Catalyst!');
    }

    const serverRes = await ApiClient.applyForgeCurrency('Currency_Fusing', item);
    if (serverRes && serverRes.success && serverRes.item) {
      Object.assign(item, serverRes.item);
    } else {
      item.links = Math.min(item.sockets || 2, Math.floor(Math.random() * (item.sockets || 2)) + 1);
    }
    AudioEngine.playTone(659, 'sine', 0.2, 0.15);
    updateForgeUI();
    updatePaperdollUI();
  };

  document.getElementById('btnCraftAffix').onclick = async () => {
    const item = player.bag[selectedItemIndex];
    if (!item) return alert('Please place a piece of equipment onto the anvil.');
    if (!consumeCurrency('Ascendant Catalyst', 1) && !consumeCurrency('Genesis Prism', 1)) {
      return alert('Requires 1x Ascendant Catalyst or 1x Genesis Prism!');
    }

    const select = document.getElementById('forgeAffixSelect');
    const chosenText = select.options[select.selectedIndex].text;

    const serverRes = await ApiClient.applyForgeCurrency('Currency_Exalted', item);
    if (serverRes && serverRes.success && serverRes.item) {
      Object.assign(item, serverRes.item);
    } else {
      item.craftedMods = item.craftedMods || [];
      item.craftedMods.push(chosenText);
      item.rarity = 'Rare';
      item.color = '#ffff77';
      if (chosenText.includes('Life')) item.stats.life = (item.stats.life || 0) + 65;
      if (chosenText.includes('Physical')) item.stats.damage = (item.stats.damage || 0) + 35;
      if (chosenText.includes('Energy Shield')) item.stats.es = (item.stats.es || 0) + 50;
      if (chosenText.includes('Fire Resistance')) player.fireRes = Math.min(90, (player.fireRes || 0) + 10);
      if (chosenText.includes('Attack Speed')) item.stats.attackSpeed = (item.stats.attackSpeed || 0) + 15;
    }

    AudioEngine.playTone(880, 'sine', 0.3, 0.2);
    updateForgeUI();
    updateBackpackUI();
    updatePaperdollUI();
  };

  document.getElementById('btnChaosReroll').onclick = async () => {
    const item = player.bag[selectedItemIndex];
    if (!item) return alert('Please place a piece of equipment onto the anvil.');
    if (!consumeCurrency('Fracture Core', 1) && !consumeCurrency('Chaos Orb', 1)) {
      return alert('Requires 1x Fracture Core to chaos reroll all affixes!');
    }

    const serverRes = await ApiClient.applyForgeCurrency('Currency_Chaos', item);
    if (serverRes && serverRes.success && serverRes.item) {
      Object.assign(item, serverRes.item);
    } else {
      item.rarity = 'Rare';
      item.color = '#ffff77';
      item.stats = {
        damage: Math.floor(Math.random() * 40) + 25,
        armor: Math.floor(Math.random() * 60) + 40,
        life: Math.floor(Math.random() * 70) + 30
      };
      item.craftedMods = [];
    }

    AudioEngine.playTone(330, 'sawtooth', 0.25, 0.18);
    updateForgeUI();
    updateBackpackUI();
    updatePaperdollUI();
  };
}
