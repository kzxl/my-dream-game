/**
 * MDG: Aethelis - Advanced Map Device & Spatial Rift Keystone System
 * 4-Slot Dimensional Conduit: Map Keystone Insertion, Modifier Crafting & Spatial Tear Activation (English)
 */

import { player, portals } from '../state.js';
import { AudioEngine } from '../audio.js';
import { spawnDamageNumber } from '../combat.js';
import { updateBackpackUI } from './inventory.js';
import { saveToDatabase } from '../save-system.js';

let selectedMapItem = null;

const DEFAULT_MAP_KEYS = [
  {
    id: 'map_tier_1',
    name: '🌿 Verdant Hollow Map (Tier 1)',
    tier: 1,
    targetZone: 'WhisperingPlains',
    rarity: 'Magic',
    color: '#8888ff',
    mods: ['+35% Item Quantity (IIQ)', '+50% Item Rarity (IIR)', 'Ancient Meadow Crypts']
  },
  {
    id: 'map_tier_5',
    name: '💀 Forgotten Crypt Map (Tier 5)',
    tier: 5,
    targetZone: 'ForgottenCrypt',
    rarity: 'Rare',
    color: '#ffd700',
    mods: ['+65% IIQ', '+90% IIR', '+20% Elite Monster Density']
  },
  {
    id: 'map_tier_14',
    name: '🌋 Pinnacle Caldera Map (Tier 14)',
    tier: 14,
    targetZone: 'ArenaCaldera',
    rarity: 'Unique',
    color: '#ff416c',
    mods: ['Ignis Ancient Boss Arena', '+120% IIQ', '+160% IIR']
  },
  {
    id: 'map_tier_15',
    name: '❄️ Pinnacle Glacial Chasm Map (Tier 15)',
    tier: 15,
    targetZone: 'ArenaGlacial',
    rarity: 'Unique',
    color: '#00f2fe',
    mods: ['Glacial Sovereign Vael Arena', '+130% IIQ', '+180% IIR']
  },
  {
    id: 'map_tier_16',
    name: '🌌 Pinnacle Void Sanctum Map (Tier 16)',
    tier: 16,
    targetZone: 'ArenaVoid',
    rarity: 'Unique',
    color: '#c678dd',
    mods: ['Malakor Void Citadel', '+150% IIQ', '+220% IIR', 'Guaranteed Mythic Loot']
  }
];

export function renderMapDeviceModal() {
  let modal = document.getElementById('mapDeviceModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'mapDeviceModal';
    modal.className = 'game-modal-backdrop';
    document.body.appendChild(modal);
  }

  // Find Map items in player backpack
  const mapItemsInBag = player.bag.filter(it => it && (it.category === 'map' || it.slot === 'Map' || it.name.includes('Map')));
  if (!selectedMapItem && mapItemsInBag.length > 0) {
    selectedMapItem = mapItemsInBag[0];
  } else if (!selectedMapItem) {
    selectedMapItem = DEFAULT_MAP_KEYS[0];
  }

  modal.innerHTML = `
    <div class="map-device-card">
      <div class="modal-header">
        <h2>🌌 Gate of Eternity — Dimensional Map Device</h2>
        <button class="close-btn" id="closeMapDeviceBtn">✕</button>
      </div>
      
      <div class="map-device-body">
        <p class="device-desc">Insert a Map Keystone into the Celestial Conduit to open a Spatial Rift fracture.</p>

        <div class="map-device-grid-layout">
          <!-- Left: Map Selection from Bag -->
          <div class="map-inventory-section">
            <div class="section-title-row">
              <h3>🎒 Map Keystones in Backpack</h3>
              <button class="forge-btn btn-craft" id="btnClaimFreeMapKeys" style="padding:2px 8px; font-size:10px;">🎁 Claim Test Maps</button>
            </div>
            <div class="map-items-list" id="mapItemsContainer"></div>
          </div>

          <!-- Right: Active Conduit Slot & Modifiers -->
          <div class="map-active-conduit-section">
            <div class="conduit-preview-box" id="conduitPreviewBox">
              <div class="conduit-rune-circle">
                <span class="conduit-map-icon">🗺️</span>
              </div>
              <div class="conduit-active-details">
                <h4 id="activeMapName" style="color:${selectedMapItem.color || '#ffd700'}; margin:0 0 4px 0;">${selectedMapItem.name}</h4>
                <div class="active-tier-tag">Tier ${selectedMapItem.tier || 1} • ${selectedMapItem.rarity || 'Magic'}</div>
              </div>
            </div>

            <!-- Modifiers Summary -->
            <div class="device-modifiers-panel">
              <h4>📜 Spatial Rift Modifiers:</h4>
              <ul id="activeMapModsList">
                ${(selectedMapItem.mods || ['+35% Item Quantity (IIQ)', '+50% Item Rarity (IIR)']).map(m => `<li>• ${m}</li>`).join('')}
              </ul>
              <div class="device-bonus-stats">
                <span>💎 IIQ: <b id="totalIiq">+${(selectedMapItem.tier || 1) * 10 + 25}%</b></span> |
                <span>👑 IIR: <b id="totalIir">+${(selectedMapItem.tier || 1) * 12 + 35}%</b></span> |
                <span>👾 Packs: <b id="totalPack">+${(selectedMapItem.tier || 1) * 3 + 15}%</b></span>
              </div>
            </div>

            <!-- Action Button -->
            <div class="device-actions-row">
              <button class="forge-btn btn-chaos" id="btnRerollMapAffixes">🌀 Reroll Mods (1x Fracture)</button>
              <button class="forge-btn btn-craft" id="btnOpenDimensionalRift" style="font-size:15px; padding:12px 20px; background:linear-gradient(90deg, #7f00ff, #00f2fe);">
                🌌 ACTIVATE SPATIAL RIFT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('closeMapDeviceBtn').onclick = () => {
    modal.style.display = 'none';
  };

  renderMapItemsList();
  setupMapDeviceHandlers();
  modal.style.display = 'flex';
  AudioEngine.playTone(330, 'triangle', 0.15, 0.15);
}

function renderMapItemsList() {
  const container = document.getElementById('mapItemsContainer');
  if (!container) return;

  const mapItemsInBag = player.bag.filter(it => it && (it.category === 'map' || it.slot === 'Map' || it.name.includes('Map')));
  const displayList = mapItemsInBag.length > 0 ? mapItemsInBag : DEFAULT_MAP_KEYS;

  container.innerHTML = '';
  displayList.forEach(item => {
    const isSelected = selectedMapItem && selectedMapItem.name === item.name;
    const card = document.createElement('div');
    card.className = `map-item-card ${isSelected ? 'selected-map' : ''}`;
    card.style.borderColor = item.color || '#ffd700';
    card.innerHTML = `
      <div class="map-card-icon">🗺️</div>
      <div class="map-card-info">
        <strong style="color:${item.color || '#ffd700'};">${item.name}</strong>
        <span>Tier ${item.tier || 1} • Zone: ${item.targetZone || 'Endgame'}</span>
      </div>
    `;

    card.onclick = () => {
      selectedMapItem = item;
      renderMapDeviceModal();
    };

    container.appendChild(card);
  });
}

function setupMapDeviceHandlers() {
  // Claim Free Map Keystones Test Button
  document.getElementById('btnClaimFreeMapKeys')?.addEventListener('click', () => {
    DEFAULT_MAP_KEYS.forEach(k => {
      player.bag.push({
        id: 'map_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        name: k.name,
        category: 'map',
        slot: 'Map',
        tier: k.tier,
        targetZone: k.targetZone,
        rarity: k.rarity,
        color: k.color,
        mods: [...k.mods]
      });
    });
    AudioEngine.playPickup();
    updateBackpackUI();
    renderMapDeviceModal();
    spawnDamageNumber(player.x, player.y - 45, '🎁 Received 5 Map Keystones!', true, '#00f2fe');
  });

  // Reroll Map Affixes
  document.getElementById('btnRerollMapAffixes')?.addEventListener('click', () => {
    if (!selectedMapItem) return;
    AudioEngine.playTone(440, 'sawtooth', 0.15, 0.15);
    const pool = [
      '• Monsters gain +45% Attack & Cast Speed',
      '• Monsters deal +50% Extra Fire & Cold Damage',
      '• Players have -25% Maximum Elemental Resistances',
      '• +35% Monster Density & Void Elites',
      '• Twin Pinnacle Guardians present'
    ];
    selectedMapItem.mods = [pool[Math.floor(Math.random() * pool.length)], pool[Math.floor(Math.random() * pool.length)]];
    const list = document.getElementById('activeMapModsList');
    if (list) list.innerHTML = selectedMapItem.mods.map(m => `<li>${m}</li>`).join('');
  });

  // Open Dimensional Rift Portal Activation
  document.getElementById('btnOpenDimensionalRift')?.addEventListener('click', () => {
    if (!selectedMapItem) return;

    // Consume 1 map from bag if exists
    const idx = player.bag.findIndex(it => it && it.name === selectedMapItem.name);
    if (idx !== -1) {
      player.bag.splice(idx, 1);
      updateBackpackUI();
    }

    const tier = selectedMapItem.tier || 1;
    const targetZoneId = selectedMapItem.targetZone || 'WhisperingPlains';

    // Remove existing rift portal in town if any
    const existingRiftIdx = portals.findIndex(p => p.isRift);
    if (existingRiftIdx !== -1) {
      portals.splice(existingRiftIdx, 1);
    }

    // Spawn Dimensional Rift Portal at Map Device Platform (x: 2150, y: 2020)
    const riftPortal = {
      x: 2150,
      y: 2020,
      targetZone: targetZoneId,
      targetX: 600,
      targetY: 600,
      name: `🌌 [Tier ${tier}] RIFT - ${selectedMapItem.name}`,
      isRift: true,
      tier: tier,
      color: selectedMapItem.color || '#00f2fe',
      createdAt: Date.now()
    };
    portals.push(riftPortal);

    document.getElementById('mapDeviceModal').style.display = 'none';

    // Epic Activation Sound & Feedback
    AudioEngine.playTone(150, 'sawtooth', 0.5, 0.4);
    setTimeout(() => AudioEngine.playTone(600, 'sine', 0.8, 0.5), 200);
    spawnDamageNumber(player.x, player.y - 55, `🌌 [Tier ${tier}] Spatial Rift Opened!`, true, '#00f2fe');
    saveToDatabase(true);
  });
}
