/**
 * MDG: Aethelis - Endless Spire 100 Floors UI Modal (Aincrad / Greater Rift Style)
 */

import { player } from '../state.js';
import { AudioEngine } from '../audio.js';
import { getSpireFloorData, MAX_SPIRE_FLOOR } from '../data/spire.js';
import { ApiClient } from '../services/api-client.js';

let selectedFloor = 1;

export function renderSpireModal() {
  let modal = document.getElementById('spireModal');
  if (modal && modal.style.display !== 'none') {
    modal.style.display = 'none';
    modal.classList.remove('active');
    modal.classList.add('hidden');
    return;
  }

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'spireModal';
    modal.className = 'game-modal-backdrop modal-overlay hidden';
    modal.innerHTML = `
      <div class="spire-modal-card">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:26px;">🗼</span>
            <div>
              <h2 style="margin:0; font-size:18px; color:#00f2fe;">ENDLESS SPIRE OF AETHELIS</h2>
              <span style="font-size:11px; color:#888;">100-Floor Tower of Ascendance & Guardian Sovereigns [U]</span>
            </div>
          </div>
          <button class="close-btn" id="closeSpireBtn">✕</button>
        </div>

        <div class="spire-content-grid">
          <!-- Left Wing: Floor Selection Grid -->
          <div class="spire-floors-panel">
            <div class="spire-progress-header">
              <span>🏆 Highest Cleared: <b id="spireHighestFloor" style="color:#ffd700;">Floor 0 / 100</b></span>
            </div>
            <div class="spire-floor-list" id="spireFloorList"></div>
          </div>

          <!-- Right Wing: Floor Details & Launch -->
          <div class="spire-details-panel">
            <div id="spireFloorDetailsCard" class="spire-details-card"></div>
            <div style="margin-top:20px;">
              <button class="spire-enter-btn" id="btnEnterSpireFloor">🚀 ENTER SPIRE FLOOR</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeSpireBtn').onclick = () => {
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

    document.getElementById('btnEnterSpireFloor').onclick = () => {
      window.selectedSpireFloor = selectedFloor;
      modal.style.display = 'none';
      modal.classList.remove('active');
      modal.classList.add('hidden');
      AudioEngine.playTone(600, 'sawtooth', 0.3, 0.2);
      if (window.loadZone) {
        window.loadZone('SpireArena');
      }
    };
  }

  modal.classList.remove('hidden');
  modal.classList.add('active');
  modal.style.display = 'flex';

  updateSpireUI();
}

function updateSpireUI() {
  const highest = player.highestClearedSpireFloor || 0;
  const maxAccessible = Math.min(MAX_SPIRE_FLOOR, highest + 1);

  document.getElementById('spireHighestFloor').innerText = `Floor ${highest} / ${MAX_SPIRE_FLOOR}`;

  const floorList = document.getElementById('spireFloorList');
  if (!floorList) return;

  floorList.innerHTML = '';
  for (let f = 1; f <= maxAccessible; f++) {
    const isBoss = (f % 10 === 0);
    const div = document.createElement('div');
    div.className = `spire-floor-node ${selectedFloor === f ? 'selected' : ''} ${isBoss ? 'boss-floor' : ''}`;
    div.innerHTML = `
      <span class="sfn-icon">${isBoss ? '👑' : '⚔️'}</span>
      <span class="sfn-num">Floor ${f}</span>
      ${isBoss ? '<span class="sfn-tag">BOSS</span>' : ''}
    `;
    div.onclick = () => {
      selectedFloor = f;
      AudioEngine.playTone(480, 'sine', 0.06, 0.04);
      updateSpireUI();
    };
    floorList.appendChild(div);
  }

  const detailsCard = document.getElementById('spireFloorDetailsCard');
  if (!detailsCard) return;

  const data = getSpireFloorData(selectedFloor);
  detailsCard.innerHTML = `
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
      <span style="font-size:36px;">${data.isBoss ? '👑' : '🗼'}</span>
      <div>
        <h3 style="margin:0; color:#00f2fe; font-size:18px;">${data.name}</h3>
        <div style="font-size:12px; color:#ffd700;">${data.isBoss ? `Guardian Sovereign: ${data.bossName}` : 'Ascendant Combat Trial'}</div>
      </div>
    </div>

    <div class="spire-stats-grid">
      <div class="spire-stat-badge">
        <span>Monster HP: <b>x${data.hpScale.toFixed(2)}</b></span>
      </div>
      <div class="spire-stat-badge">
        <span>Monster Damage: <b>x${data.dmgScale.toFixed(2)}</b></span>
      </div>
      <div class="spire-stat-badge" style="color:#ef4444;">
        <span>Resistance Penalty: <b>-${data.resPenalty}%</b></span>
      </div>
      <div class="spire-stat-badge" style="color:#4ade80;">
        <span>Bonus Rarity (IIR): <b>+${data.iirBonus}%</b></span>
      </div>
    </div>

    <h4 style="color:#ffd700; margin:16px 0 8px 0;">⚠️ Floor Modifiers:</h4>
    <ul class="spire-mods-list">
      ${data.mods.map(m => `<li>${m}</li>`).join('')}
    </ul>
  `;

  document.getElementById('btnEnterSpireFloor').innerText = `🚀 ENTER SPIRE FLOOR ${selectedFloor}`;
}

export async function claimSpireFloorReward(floorNumber) {
  const highest = player.highestClearedSpireFloor || 0;
  const res = await ApiClient.claimSpireFloor(floorNumber, highest, player.id || 'hero_default');
  if (res && res.success) {
    player.highestClearedSpireFloor = res.highestClearedFloor;
    if (res.rewardCurrencies) {
      if (!player.currencies) player.currencies = {};
      if (!player.materials) player.materials = {};
      for (const [k, v] of Object.entries(res.rewardCurrencies)) {
        if (k === 'gold') {
          player.gold = (player.gold || 0) + v;
        } else if (k === 'fracture_core') {
          for (let i = 0; i < v; i++) {
            player.bag.push({ name: 'Fracture Core', slot: 'Currency', rarity: 'Rare', color: '#ffd700', icon: '🔮' });
          }
        } else {
          player.materials[k] = (player.materials[k] || 0) + v;
        }
      }
    }
    return res;
  }
  return null;
}
