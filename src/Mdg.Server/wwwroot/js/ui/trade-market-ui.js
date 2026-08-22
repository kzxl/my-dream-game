/**
 * Asynchronous Marketplace & Haven Trade Board UI
 * Allows players to asynchronously browse, buy, sell items with Genesis Catalysts / Gold, featuring a 5% Gold sink tax.
 */

import { player } from '../state.js';
import { ApiClient } from '../services/api-client.js';
import { AudioEngine } from '../audio.js';
import { spawnDamageNumber } from '../combat.js';
import { updateBackpackUI } from './inventory.js';
import { t } from '../i18n.js';

let activeTab = 'browse';
let currentMarketListings = [];
let myMarketListings = [];
let selectedSellItemIndex = -1;

export async function openMarketModal(initialTab = 'browse') {
  activeTab = initialTab;
  let modal = document.getElementById('marketModal');
  if (!modal) {
    createMarketModalHtml();
    modal = document.getElementById('marketModal');
  }

  modal.classList.remove('hidden');
  modal.style.display = 'flex';

  await refreshMarketData();
}

export function closeMarketModal() {
  const modal = document.getElementById('marketModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

export function toggleMarketModal() {
  const modal = document.getElementById('marketModal');
  if (modal && modal.style.display !== 'none' && !modal.classList.contains('hidden')) {
    closeMarketModal();
  } else {
    openMarketModal();
  }
}

export async function refreshMarketData() {
  if (activeTab === 'browse') {
    const cat = document.getElementById('market-filter-cat')?.value || 'all';
    const rarity = document.getElementById('market-filter-rarity')?.value || 'all';
    const search = document.getElementById('market-search-input')?.value || '';

    try {
      const res = await fetch(`/api/v1/market/listings?category=${encodeURIComponent(cat)}&rarity=${encodeURIComponent(rarity)}&search=${encodeURIComponent(search)}`);
      if (res.ok) {
        currentMarketListings = await res.json();
      }
    } catch (e) {
      console.warn('Failed to load market listings:', e);
    }
  } else if (activeTab === 'my_listings') {
    const accId = player.accountId || 'guest';
    try {
      const res = await fetch(`/api/v1/market/my-listings?accountId=${encodeURIComponent(accId)}`);
      if (res.ok) {
        myMarketListings = await res.json();
      }
    } catch (e) {
      console.warn('Failed to load my market listings:', e);
    }
  }

  renderMarketContent();
}

function createMarketModalHtml() {
  const div = document.createElement('div');
  div.id = 'marketModal';
  div.className = 'modal-backdrop hidden';
  div.innerHTML = `
    <div class="market-modal-panel">
      <div class="market-header">
        <div class="market-title">
          <span class="market-icon">🏛️</span>
          <h2>HAVEN TRADE BOARD (CHỢ GIAO THƯƠNG AETHELIS)</h2>
        </div>
        <button class="modal-close-btn" id="btnCloseMarket">✕</button>
      </div>

      <div class="market-tabs">
        <button class="market-tab-btn active" data-tab="browse">🔍 BROWSE LISTINGS</button>
        <button class="market-tab-btn" data-tab="my_listings">📜 MY LISTINGS</button>
        <button class="market-tab-btn" data-tab="sell">💎 SELL ITEM (KÝ GỬI)</button>
      </div>

      <div class="market-body" id="marketBodyContent">
        <!-- Injected dynamically -->
      </div>
    </div>
  `;
  document.body.appendChild(div);

  // Setup tab click listeners
  div.querySelectorAll('.market-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      div.querySelectorAll('.market-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.tab;
      refreshMarketData();
    });
  });

  div.querySelector('#btnCloseMarket')?.addEventListener('click', closeMarketModal);
}

function renderMarketContent() {
  const container = document.getElementById('marketBodyContent');
  if (!container) return;

  if (activeTab === 'browse') {
    renderBrowseTab(container);
  } else if (activeTab === 'my_listings') {
    renderMyListingsTab(container);
  } else if (activeTab === 'sell') {
    renderSellTab(container);
  }
}

function renderBrowseTab(container) {
  container.innerHTML = `
    <div class="market-filter-bar">
      <input type="text" id="market-search-input" class="market-input" placeholder="Search item name..." />
      <select id="market-filter-cat" class="market-select">
        <option value="all">All Categories</option>
        <option value="Weapon">Weapons</option>
        <option value="Armor">Armor</option>
        <option value="Jewelry">Jewelry / Rings</option>
        <option value="Material">Reagents & Catalysts</option>
        <option value="Flask">Flasks</option>
      </select>
      <select id="market-filter-rarity" class="market-select">
        <option value="all">All Rarities</option>
        <option value="Normal">Normal (White)</option>
        <option value="Magic">Magic (Blue)</option>
        <option value="Rare">Rare (Yellow)</option>
        <option value="Unique">Unique (Orange)</option>
      </select>
      <button class="market-btn-action" id="btnRefreshMarket">🔄 Search / Refresh</button>
    </div>

    <div class="market-cards-grid" id="marketCardsGrid">
      ${currentMarketListings.length === 0 ? `
        <div class="market-empty-hint">
          <span>📭</span>
          <p>No active listings found matching your search criteria.</p>
        </div>
      ` : currentMarketListings.map(item => renderListingCard(item, false)).join('')}
    </div>
  `;

  document.getElementById('btnRefreshMarket')?.addEventListener('click', refreshMarketData);
  document.getElementById('market-filter-cat')?.addEventListener('change', refreshMarketData);
  document.getElementById('market-filter-rarity')?.addEventListener('change', refreshMarketData);

  container.querySelectorAll('.btn-buy-listing').forEach(btn => {
    btn.addEventListener('click', () => buyListing(btn.dataset.id));
  });
}

function renderMyListingsTab(container) {
  container.innerHTML = `
    <div class="market-my-header">
      <h3>Active Trade Listings for Account: <span>${player.name || 'Hero'}</span></h3>
      <p class="tax-info-hint">💡 Items will remain active for 7 days or until purchased.</p>
    </div>

    <div class="market-cards-grid">
      ${myMarketListings.length === 0 ? `
        <div class="market-empty-hint">
          <span>📦</span>
          <p>You currently have no active listings on the Trade Board.</p>
        </div>
      ` : myMarketListings.map(item => renderListingCard(item, true)).join('')}
    </div>
  `;

  container.querySelectorAll('.btn-cancel-listing').forEach(btn => {
    btn.addEventListener('click', () => cancelListing(btn.dataset.id));
  });
}

function renderSellTab(container) {
  const backpackItems = player.backpack || [];
  const selectedItem = selectedSellItemIndex >= 0 && backpackItems[selectedSellItemIndex] ? backpackItems[selectedSellItemIndex] : null;

  container.innerHTML = `
    <div class="market-sell-layout">
      <div class="market-sell-backpack">
        <h4>Select Item to Sell from Backpack:</h4>
        <div class="market-inventory-grid">
          ${backpackItems.map((it, idx) => {
            if (!it) return `<div class="market-slot empty"></div>`;
            const isSel = idx === selectedSellItemIndex;
            const rarityClass = (it.rarity || 'normal').toLowerCase();
            return `
              <div class="market-slot filled rarity-${rarityClass} ${isSel ? 'selected' : ''}" data-idx="${idx}">
                <span class="item-icon">${it.icon || '📦'}</span>
                <span class="item-title">${it.name}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="market-sell-form">
        <h4>Listing Price & 5% Gold Sink Tax</h4>
        ${selectedItem ? `
          <div class="selected-item-preview rarity-${(selectedItem.rarity || 'normal').toLowerCase()}">
            <div class="preview-header">
              <span class="preview-icon">${selectedItem.icon || '🗡️'}</span>
              <div>
                <strong class="preview-name">${selectedItem.name}</strong>
                <span class="preview-rarity">${selectedItem.rarity || 'Normal'} (iLvl ${selectedItem.iLvl || selectedItem.level || 1})</span>
              </div>
            </div>
          </div>

          <div class="form-row">
            <label>Price Currency:</label>
            <select id="sell-currency-select" class="market-select">
              <option value="fracture_core">🔮 Fracture Core</option>
              <option value="genesis_prism">💎 Genesis Prism</option>
              <option value="aether_spark">🔵 Aether Spark</option>
              <option value="gold">🪙 Gold (Vàng)</option>
            </select>
          </div>

          <div class="form-row">
            <label>Price Amount:</label>
            <input type="number" id="sell-price-amount" class="market-input" min="1" max="999999" value="1" />
          </div>

          <div class="tax-calculation-box">
            <div class="tax-row">
              <span>Listing Tax (5% Gold Sink):</span>
              <strong id="sell-tax-gold" class="text-gold">125 🪙</strong>
            </div>
            <span class="tax-subtext">Tax is deducted immediately upon listing to regulate server economy.</span>
          </div>

          <button class="market-btn-confirm" id="btnConfirmList">✨ CONFIRM & LIST FOR SALE</button>
        ` : `
          <div class="no-selection-box">
            <span>👈</span>
            <p>Click on any item in your backpack on the left to set up price and list it on the Haven Trade Board.</p>
          </div>
        `}
      </div>
    </div>
  `;

  // Item slot selection click
  container.querySelectorAll('.market-slot.filled').forEach(slot => {
    slot.addEventListener('click', () => {
      selectedSellItemIndex = parseInt(slot.dataset.idx, 10);
      renderMarketContent();
    });
  });

  const priceInput = document.getElementById('sell-price-amount');
  const currSelect = document.getElementById('sell-currency-select');
  const taxEl = document.getElementById('sell-tax-gold');

  const updateTax = () => {
    if (!priceInput || !currSelect || !taxEl) return;
    const p = Math.max(1, parseInt(priceInput.value, 10) || 1);
    const curr = currSelect.value;
    let tax = 25;
    if (curr === 'gold') {
      tax = Math.max(25, Math.ceil(p * 0.05));
    } else if (curr === 'fracture_core') {
      tax = Math.max(25, Math.ceil(p * 2500 * 0.05));
    } else if (curr === 'genesis_prism') {
      tax = Math.max(25, Math.ceil(p * 500 * 0.05));
    } else if (curr === 'aether_spark') {
      tax = Math.max(25, Math.ceil(p * 100 * 0.05));
    }
    taxEl.innerText = `${tax} 🪙`;
  };

  priceInput?.addEventListener('input', updateTax);
  currSelect?.addEventListener('change', updateTax);
  updateTax();

  document.getElementById('btnConfirmList')?.addEventListener('click', submitListing);
}

function renderListingCard(item, isOwner) {
  const currencyIcons = {
    fracture_core: '🔮 Fracture Core',
    genesis_prism: '💎 Genesis Prism',
    aether_spark: '🔵 Aether Spark',
    gold: '🪙 Gold'
  };

  const rarityClass = (item.itemRarity || 'normal').toLowerCase();
  let itemObj = {};
  try {
    itemObj = JSON.parse(item.itemJson || '{}');
  } catch (e) { }

  return `
    <div class="market-card rarity-${rarityClass}">
      <div class="card-top">
        <span class="card-icon">${itemObj.icon || '📦'}</span>
        <div class="card-info">
          <strong class="card-name">${item.itemName}</strong>
          <span class="card-rarity">${item.itemRarity} • iLvl ${item.itemLevel}</span>
        </div>
      </div>

      <div class="card-seller">
        <span>Seller: <strong>${item.sellerCharacterName}</strong></span>
      </div>

      <div class="card-price-bar">
        <span class="price-label">Price:</span>
        <span class="price-value">${item.priceAmount} ${currencyIcons[item.priceCurrency] || item.priceCurrency}</span>
      </div>

      <div class="card-action">
        ${isOwner ? `
          <button class="market-btn-cancel btn-cancel-listing" data-id="${item.id}">❌ Cancel Listing</button>
        ` : `
          <button class="market-btn-buy btn-buy-listing" data-id="${item.id}">🛒 Buy Item</button>
        `}
      </div>
    </div>
  `;
}

async function submitListing() {
  if (selectedSellItemIndex < 0 || !player.backpack[selectedSellItemIndex]) return;
  const item = player.backpack[selectedSellItemIndex];
  const priceInput = document.getElementById('sell-price-amount');
  const currSelect = document.getElementById('sell-currency-select');
  const price = Math.max(1, parseInt(priceInput?.value, 10) || 1);
  const currency = currSelect?.value || 'fracture_core';

  let tax = 25;
  if (currency === 'gold') tax = Math.max(25, Math.ceil(price * 0.05));
  else if (currency === 'fracture_core') tax = Math.max(25, Math.ceil(price * 2500 * 0.05));
  else if (currency === 'genesis_prism') tax = Math.max(25, Math.ceil(price * 500 * 0.05));
  else if (currency === 'aether_spark') tax = Math.max(25, Math.ceil(price * 100 * 0.05));

  if ((player.gold || 0) < tax) {
    alert(`Not enough gold to pay listing tax! Required: ${tax} Gold. Current: ${player.gold || 0} Gold.`);
    return;
  }

  const payload = {
    accountId: player.accountId || 'guest',
    characterName: player.name || 'Hero',
    itemJson: JSON.stringify(item),
    itemName: item.name || 'Item',
    itemRarity: item.rarity || 'Normal',
    itemCategory: item.category || item.slot || 'General',
    itemLevel: item.iLvl || item.level || 1,
    priceAmount: price,
    priceCurrency: currency
  };

  try {
    const res = await fetch('/api/v1/market/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      player.gold -= tax;
      player.backpack.splice(selectedSellItemIndex, 1);
      selectedSellItemIndex = -1;
      AudioEngine.playLevelUp?.();
      spawnDamageNumber(player.x, player.y - 70, `🏛️ ITEM LISTED ON TRADE BOARD! (-${tax} 🪙)`, true, '#ffd700');
      updateBackpackUI();
      activeTab = 'my_listings';
      await refreshMarketData();
    } else {
      alert(data.message || 'Failed to list item.');
    }
  } catch (e) {
    alert('Server error listing item.');
  }
}

async function buyListing(listingId) {
  const listing = currentMarketListings.find(l => l.id === listingId);
  if (!listing) return;

  if (listing.sellerAccountId === (player.accountId || 'guest')) {
    alert('You cannot buy your own listing.');
    return;
  }

  // Check currency
  const curr = listing.priceCurrency;
  const cost = listing.priceAmount;

  if (curr === 'gold') {
    if ((player.gold || 0) < cost) {
      alert(`Not enough gold! Required: ${cost} 🪙.`);
      return;
    }
  } else {
    const userCurrencies = player.currencies || {};
    const count = userCurrencies[curr] || 0;
    if (count < cost) {
      alert(`Not enough ${curr}! Required: ${cost}. Current: ${count}.`);
      return;
    }
  }

  if (player.backpack && player.backpack.length >= 16) {
    alert('Backpack is full! Need at least 1 free slot.');
    return;
  }

  try {
    const res = await fetch('/api/v1/market/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: listing.id,
        buyerAccountId: player.accountId || 'guest',
        buyerCharacterName: player.name || 'Hero'
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (curr === 'gold') {
        player.gold -= cost;
      } else {
        player.currencies[curr] = (player.currencies[curr] || 0) - cost;
      }

      const itemObj = JSON.parse(listing.itemJson);
      player.backpack.push(itemObj);

      AudioEngine.playLevelUp?.();
      spawnDamageNumber(player.x, player.y - 70, `🛒 PURCHASE SUCCESSFUL: ${listing.itemName}!`, true, '#00e676');
      updateBackpackUI();
      await refreshMarketData();
    } else {
      alert(data.message || 'Purchase failed.');
    }
  } catch (e) {
    alert('Error connecting to marketplace server.');
  }
}

async function cancelListing(listingId) {
  try {
    const res = await fetch('/api/v1/market/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: listingId,
        sellerAccountId: player.accountId || 'guest'
      })
    });

    const data = await res.json();
    if (res.ok && data.success && data.listing) {
      const itemObj = JSON.parse(data.listing.itemJson);
      if (player.backpack && player.backpack.length < 16) {
        player.backpack.push(itemObj);
      }
      AudioEngine.playTone?.(350, 'sine', 0.15, 0.1);
      spawnDamageNumber(player.x, player.y - 70, `❌ LISTING CANCELLED & RETURNED!`, false, '#ff9800');
      updateBackpackUI();
      await refreshMarketData();
    } else {
      alert(data.message || 'Failed to cancel listing.');
    }
  } catch (e) {
    alert('Error cancelling listing.');
  }
}
