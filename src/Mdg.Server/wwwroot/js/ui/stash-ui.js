/**
 * MDG: Aethelis - Advanced Multi-Tab Shared Account Stash Vault UI
 * Tab 1: General Gear Vault (32 Slots)
 * Tab 2: Currency Affinity Vault (8 Genesis Orbs with Unlimited Stacking)
 * Tab 3: Gems & Rift Maps Vault (32 Slots)
 * Quick Actions: Deposit All Currency, Deposit All Gear, 1-Click Transfers
 */

import { player } from '../state.js';
import { AudioEngine } from '../audio.js';
import { updateBackpackUI, MAX_BACKPACK_SLOTS } from './inventory.js';
import { saveToDatabase } from '../save-system.js';
import { spawnDamageNumber } from '../combat.js';
import { getCurrentUser } from '../auth.js';

let currentStashTab = 'gear'; // 'gear', 'currency', 'gems'

let stashData = {
  gear: [],
  currency: {
    'Aether Spark': 5,
    'Flux Catalyst': 3,
    'Genesis Prism': 2,
    'Fracture Core': 4,
    'Ascendant Catalyst': 1,
    'Origin Matrix': 0,
    'Socketing Core': 3,
    'Harmonic Tether': 2
  },
  gems: []
};

export async function renderSharedStashModal() {
  // Only allow opening Stash in Sanctuary Haven
  if (player.zoneId && player.zoneId !== 'SanctuaryHaven') {
    spawnDamageNumber(player.x, player.y - 50, '🏛️ Stash Vault only accessible in Town (Sanctuary Haven)!', true, '#e5c07b');
    AudioEngine.playTone(220, 'sawtooth', 0.2, 0.2);
    return;
  }

  let modal = document.getElementById('sharedStashModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'sharedStashModal';
    modal.className = 'game-modal-backdrop';
    modal.innerHTML = `
      <div class="stash-modal-card">
        <div class="modal-header">
          <h2>📦 Account Shared Stash Vault</h2>
          <button class="close-btn" id="closeStashBtn">✕</button>
        </div>

        <!-- Stash Navigation Tabs -->
        <div class="stash-nav-tabs">
          <button class="stash-tab-btn active" data-tab="gear" id="tabBtnGear">🏛️ Equipment Vault (32 Slots)</button>
          <button class="stash-tab-btn" data-tab="currency" id="tabBtnCurrency">🔮 Genesis Currency Vault</button>
          <button class="stash-tab-btn" data-tab="gems" id="tabBtnGems">💎 Gems & Maps (32 Slots)</button>
          
          <div class="stash-quick-actions">
            <button class="forge-btn btn-craft" id="btnDepositAllCurrency" style="padding:6px 12px; font-size:11px;">🔮 Deposit All Currency</button>
            <button class="forge-btn btn-lock" id="btnDepositAllGear" style="padding:6px 12px; font-size:11px;">📦 Deposit All Gear</button>
          </div>
        </div>

        <div class="stash-body-grid">
          <!-- Active Tab Vault Panel -->
          <div class="stash-vault-panel">
            <h3 id="stashTabTitle">🏛️ Equipment Vault (32 Slots)</h3>
            <div id="stashContentArea"></div>
          </div>

          <!-- Player Backpack Panel -->
          <div class="stash-backpack-panel">
            <h3>🎒 Inventory (<span id="stashBagCount">0 / 32</span>)</h3>
            <div class="stash-player-grid" id="stashPlayerGrid"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeStashBtn').onclick = () => {
      modal.style.display = 'none';
    };

    setupStashEventListeners();
  }

  await loadSharedStash();
  updateStashUI();
  modal.style.display = 'flex';
}

function setupStashEventListeners() {
  document.querySelectorAll('.stash-tab-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.stash-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStashTab = btn.getAttribute('data-tab');
      updateStashUI();
    };
  });

  // Deposit All Currency 1-Click
  document.getElementById('btnDepositAllCurrency').onclick = async () => {
    let transferred = 0;
    for (let i = player.bag.length - 1; i >= 0; i--) {
      const item = player.bag[i];
      if (item && (item.slot === 'Currency' || item.rarity === 'Currency')) {
        const count = item.stack || 1;
        const key = getMatchingCurrencyKey(item.name);
        stashData.currency[key] = (stashData.currency[key] || 0) + count;
        player.bag.splice(i, 1);
        transferred += count;
      }
    }

    if (transferred > 0) {
      AudioEngine.playPickup();
      await saveSharedStash();
      updateStashUI();
      updateBackpackUI();
      saveToDatabase(true);
    } else {
      alert('No Genesis Currency or Orbs in your backpack!');
    }
  };

  // Deposit All Gear 1-Click
  document.getElementById('btnDepositAllGear').onclick = async () => {
    let transferred = 0;
    for (let i = player.bag.length - 1; i >= 0; i--) {
      const item = player.bag[i];
      if (item && item.slot !== 'Currency' && item.slot !== 'Gem') {
        if (stashData.gear.length < 32) {
          stashData.gear.push(item);
          player.bag.splice(i, 1);
          transferred++;
        }
      }
    }

    if (transferred > 0) {
      AudioEngine.playPickup();
      await saveSharedStash();
      updateStashUI();
      updateBackpackUI();
      saveToDatabase(true);
    }
  };
}

function getMatchingCurrencyKey(name) {
  if (name.includes('Aether Spark')) return 'Aether Spark';
  if (name.includes('Flux Catalyst')) return 'Flux Catalyst';
  if (name.includes('Genesis Prism')) return 'Genesis Prism';
  if (name.includes('Fracture Core')) return 'Fracture Core';
  if (name.includes('Ascendant Catalyst')) return 'Ascendant Catalyst';
  if (name.includes('Origin Matrix')) return 'Origin Matrix';
  if (name.includes('Socketing Core')) return 'Socketing Core';
  if (name.includes('Harmonic Tether')) return 'Harmonic Tether';
  return 'Aether Spark';
}

async function loadSharedStash() {
  const user = getCurrentUser();
  try {
    const res = await fetch(`/api/v1/stash?accountId=${encodeURIComponent(user.id)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        // Legacy list format fallback
        stashData.gear = data.filter(it => it && it.slot !== 'Currency');
      } else if (data && typeof data === 'object') {
        stashData = {
          gear: data.gear || [],
          currency: { ...stashData.currency, ...(data.currency || {}) },
          gems: data.gems || []
        };
      }
    }
  } catch (e) {
    console.error(e);
  }
}

async function saveSharedStash() {
  const user = getCurrentUser();
  try {
    await fetch(`/api/v1/stash?accountId=${encodeURIComponent(user.id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stashData)
    });
  } catch (e) {
    console.error(e);
  }
}

function updateStashUI() {
  const contentArea = document.getElementById('stashContentArea');
  const playerGrid = document.getElementById('stashPlayerGrid');
  const bagCount = document.getElementById('stashBagCount');
  if (!contentArea || !playerGrid) return;

  if (bagCount) bagCount.innerText = `${player.bag.length} / ${MAX_BACKPACK_SLOTS}`;

  // 1. Render Current Vault Tab
  if (currentStashTab === 'currency') {
    renderCurrencyVaultTab(contentArea);
  } else if (currentStashTab === 'gems') {
    renderGemsVaultTab(contentArea);
  } else {
    renderGearVaultTab(contentArea);
  }

  // 2. Render Player Backpack Slots
  playerGrid.innerHTML = '';
  for (let i = 0; i < MAX_BACKPACK_SLOTS; i++) {
    const item = player.bag[i];
    const slot = document.createElement('div');
    slot.className = `stash-slot ${item ? 'has-item' : 'empty'}`;

    if (item) {
      slot.style.borderColor = item.color || '#fff';
      const stackText = item.stack && item.stack > 1 ? ` (x${item.stack})` : '';
      slot.innerHTML = `
        <div class="slot-item-name" style="color:${item.color || '#fff'}">${item.name}${stackText}</div>
        <div class="slot-item-type">${item.slot || 'Item'}</div>
      `;
      slot.onclick = async () => {
        // Quick Transfer from Player Bag to Vault
        if (item.slot === 'Currency' || item.rarity === 'Currency') {
          const key = getMatchingCurrencyKey(item.name);
          const count = item.stack || 1;
          stashData.currency[key] = (stashData.currency[key] || 0) + count;
          player.bag.splice(i, 1);
        } else if (item.slot === 'Gem' || (item.name && item.name.includes('Gem'))) {
          if (stashData.gems.length >= 32) return alert('Kho Ngọc & Bản Đồ đã đầy (32/32)!');
          stashData.gems.push(item);
          player.bag.splice(i, 1);
        } else {
          if (stashData.gear.length >= 32) return alert('Kho Trang Bị đã đầy (32/32)!');
          stashData.gear.push(item);
          player.bag.splice(i, 1);
        }

        AudioEngine.playPickup();
        await saveSharedStash();
        updateStashUI();
        updateBackpackUI();
        saveToDatabase(true);
      };
    } else {
      slot.innerHTML = `<span class="empty-slot-num">${i + 1}</span>`;
    }
    playerGrid.appendChild(slot);
  }
}

function renderGearVaultTab(container) {
  document.getElementById('stashTabTitle').innerText = '🏛️ Kho Trang Bị Chung (32 Ô)';
  container.innerHTML = `<div class="stash-grid-32" id="vaultGrid32"></div>`;
  const grid = container.querySelector('#vaultGrid32');

  for (let i = 0; i < 32; i++) {
    const item = stashData.gear[i];
    const slot = document.createElement('div');
    slot.className = `stash-slot ${item ? 'has-item' : 'empty'}`;

    if (item) {
      slot.style.borderColor = item.color || '#fff';
      slot.innerHTML = `
        <div class="slot-item-name" style="color:${item.color || '#fff'}">${item.name}</div>
        <div class="slot-item-type">${item.slot || 'Gear'}</div>
      `;
      slot.onclick = async () => {
        // Withdraw to Player Bag
        if (player.bag.length >= MAX_BACKPACK_SLOTS) return alert('Túi đồ nhân vật đã đầy!');
        stashData.gear.splice(i, 1);
        player.bag.push(item);
        AudioEngine.playPickup();
        await saveSharedStash();
        updateStashUI();
        updateBackpackUI();
        saveToDatabase(true);
      };
    } else {
      slot.innerHTML = `<span class="empty-slot-num">${i + 1}</span>`;
    }
    grid.appendChild(slot);
  }
}

function renderGemsVaultTab(container) {
  document.getElementById('stashTabTitle').innerText = '💎 Kho Ngọc & Bản Đồ (32 Ô)';
  container.innerHTML = `<div class="stash-grid-32" id="vaultGemsGrid32"></div>`;
  const grid = container.querySelector('#vaultGemsGrid32');

  for (let i = 0; i < 32; i++) {
    const item = stashData.gems[i];
    const slot = document.createElement('div');
    slot.className = `stash-slot ${item ? 'has-item' : 'empty'}`;

    if (item) {
      slot.style.borderColor = '#00f2fe';
      slot.innerHTML = `
        <div class="slot-item-name" style="color:#00f2fe">${item.name}</div>
        <div class="slot-item-type">${item.slot || 'Gem/Map'}</div>
      `;
      slot.onclick = async () => {
        if (player.bag.length >= MAX_BACKPACK_SLOTS) return alert('Túi đồ nhân vật đã đầy!');
        stashData.gems.splice(i, 1);
        player.bag.push(item);
        AudioEngine.playPickup();
        await saveSharedStash();
        updateStashUI();
        updateBackpackUI();
        saveToDatabase(true);
      };
    } else {
      slot.innerHTML = `<span class="empty-slot-num">${i + 1}</span>`;
    }
    grid.appendChild(slot);
  }
}

function renderCurrencyVaultTab(container) {
  document.getElementById('stashTabTitle').innerText = '🔮 Genesis Alchemy Currency Vault (Unlimited Stacking)';
  
  const orbList = [
    { key: 'Aether Spark', desc: 'Normal ➔ Magic (1-2 Mods)', icon: '🔵', color: '#8888ff' },
    { key: 'Flux Catalyst', desc: 'Reroll Magic Modifiers', icon: '🔷', color: '#00f2fe' },
    { key: 'Genesis Prism', desc: 'Normal ➔ Rare (4-6 Mods)', icon: '💎', color: '#ffd700' },
    { key: 'Fracture Core', desc: 'Reroll Rare Modifiers (Chaos)', icon: '🔮', color: '#ff7700' },
    { key: 'Ascendant Catalyst', desc: 'Add 1 High-Tier Mod (Exalt)', icon: '✨', color: '#ffd700' },
    { key: 'Origin Matrix', desc: 'Reroll Mod Min-Max Values (Divine)', icon: '👑', color: '#e5c07b' },
    { key: 'Socketing Core', desc: 'Reforge Number of Sockets', icon: '⚪', color: '#98c379' },
    { key: 'Harmonic Tether', desc: 'Reforge Socket Links', icon: '🔗', color: '#c678dd' }
  ];

  let html = `<div class="currency-vault-grid">`;
  orbList.forEach(orb => {
    const count = stashData.currency[orb.key] || 0;
    html += `
      <div class="currency-vault-cell" style="border-color:${orb.color};">
        <div class="currency-cell-icon">${orb.icon}</div>
        <div class="currency-cell-name" style="color:${orb.color};">${orb.key}</div>
        <div class="currency-cell-desc">${orb.desc}</div>
        <div class="currency-cell-count">x${count}</div>
        <div class="currency-cell-actions">
          <button class="forge-btn btn-craft btn-withdraw-orb" data-key="${orb.key}" style="padding:4px 8px; font-size:10px;">Withdraw 1x</button>
          <button class="forge-btn btn-lock btn-withdraw-orb-10" data-key="${orb.key}" style="padding:4px 8px; font-size:10px;">Withdraw 10x</button>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;

  container.querySelectorAll('.btn-withdraw-orb').forEach(btn => {
    btn.onclick = async () => {
      const key = btn.getAttribute('data-key');
      withdrawCurrencyToBag(key, 1);
    };
  });

  container.querySelectorAll('.btn-withdraw-orb-10').forEach(btn => {
    btn.onclick = async () => {
      const key = btn.getAttribute('data-key');
      withdrawCurrencyToBag(key, 10);
    };
  });
}

async function withdrawCurrencyToBag(key, count) {
  const current = stashData.currency[key] || 0;
  if (current <= 0) return alert(`No ${key} left in the vault!`);
  if (player.bag.length >= MAX_BACKPACK_SLOTS) return alert('Inventory backpack is full!');

  const withdrawAmount = Math.min(current, count);
  stashData.currency[key] -= withdrawAmount;

  // Add stack to player bag
  player.bag.push({
    id: 'c_' + Date.now(),
    name: key,
    slot: 'Currency',
    rarity: 'Currency',
    color: '#ffd700',
    stack: withdrawAmount,
    description: `Genesis Crafting Catalyst (${key})`
  });

  AudioEngine.playPickup();
  await saveSharedStash();
  updateStashUI();
  updateBackpackUI();
  saveToDatabase(true);
}
