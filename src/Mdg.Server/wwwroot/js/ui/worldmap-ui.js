/**
 * Overhauled World Map, Campaign Acts & Story Quest Interface
 */

import { CAMPAIGN_ACTS } from '../data/campaign.js';
import { loadZone } from '../main.js';
import { toggleModal } from './hud.js';
import { AudioEngine } from '../audio.js';
import { saveToDatabase } from '../save-system.js';

let selectedActIndex = 0;

export function renderWorldMapUI() {
  const container = document.getElementById('worldmap-overhaul-container');
  if (!container) return;

  const currentAct = CAMPAIGN_ACTS[selectedActIndex];

  container.innerHTML = `
    <!-- Act Navigation Tabs -->
    <div class="act-nav-tabs">
      ${CAMPAIGN_ACTS.map((act, idx) => `
        <button class="act-tab-btn ${idx === selectedActIndex ? 'active-act-tab' : ''}" data-act-idx="${idx}">
          <span class="act-num">${act.actNumber}</span>
          <span class="act-name">${act.name}</span>
        </button>
      `).join('')}
    </div>

    <!-- Act Content Main Grid -->
    <div class="act-content-grid">
      <!-- Left: Act Art & Interactive Map Region -->
      <div class="act-map-panel">
        <div class="act-art-banner" style="background-image: linear-gradient(180deg, rgba(20,24,33,0.3), rgba(20,24,33,0.95)), url('${currentAct.coverArt}');">
          <div class="act-banner-badge">${currentAct.actNumber} • ${currentAct.levelRange}</div>
          <h2 class="act-banner-title">${currentAct.name.toUpperCase()}</h2>
          <p class="act-banner-sub">${currentAct.subtitle}</p>
          <div class="act-boss-tag">👑 Act Major Boss: <b>${currentAct.boss}</b></div>
        </div>

        <div class="act-zones-list">
          <div class="panel-section-title">REGIONAL WAYPOINTS & DUNGEONS</div>
          <div class="zone-cards-flex">
            ${currentAct.zones.map(z => `
              <div class="zone-card-item ${window.currentZoneId === z.id ? 'current-location-card' : ''}">
                <div class="zc-info">
                  <div class="zc-title-row">
                    <span class="zc-name">${z.name}</span>
                    <span class="zc-lvl">${z.level}</span>
                    ${window.currentZoneId === z.id ? '<span class="zc-here-badge">📍 HERE</span>' : ''}
                  </div>
                  <span class="zc-type">${z.type}</span>
                  <p class="zc-desc">${z.desc}</p>
                </div>
                <button class="btn-fast-travel" data-zone-id="${z.id}">⚔️ Travel</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Right: Story Quests & Lore Synopsis -->
      <div class="act-quest-panel">
        <div class="panel-section-title">📜 CAMPAIGN QUESTS & OBJECTIVES</div>
        
        <div class="quests-flow-list">
          ${currentAct.quests.map((q, qIdx) => `
            <div class="quest-entry-card">
              <div class="quest-num-col">${qIdx + 1}</div>
              <div class="quest-details-col">
                <div class="quest-title-txt">${q.title}</div>
                <div class="quest-desc-txt">${q.desc}</div>
                <div class="quest-reward-txt">🎁 Reward: <b>${q.reward}</b></div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="act-lore-box">
          <span class="lore-title">📖 REALM CHRONICLES</span>
          <p class="lore-txt">
            "The fracturing of the World Stone shattered the barrier between realms. Only by conquering all three continental anchors can the gate to the Abyssal Void Core be unlocked."
          </p>
        </div>
      </div>
    </div>
  `;

  // Attach Act Tab Click Listeners
  container.querySelectorAll('.act-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedActIndex = parseInt(btn.getAttribute('data-act-idx'), 10);
      AudioEngine.playPickup();
      renderWorldMapUI();
    });
  });

  // Attach Fast Travel Click Listeners
  container.querySelectorAll('.btn-fast-travel').forEach(btn => {
    btn.addEventListener('click', () => {
      const zoneId = btn.getAttribute('data-zone-id');
      if (zoneId === 'VoidAtlasDevice') {
        alert('🌌 The Void Atlas Device unlocks after completing Act III: The Infernal Caldera!');
        return;
      }
      AudioEngine.playPortal();
      toggleModal('worldmap-modal');
      loadZone(zoneId);
      saveToDatabase(true);
    });
  });
}
