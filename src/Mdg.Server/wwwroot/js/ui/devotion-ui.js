/**
 * MDG: Aethelis - Celestial Devotion Constellation Grid (Grim Dawn Devotion Style)
 * 4 Ancient Constellations, Node Allocation & Combat Proc Skills
 */

import { player } from '../state.js';
import { AudioEngine } from '../audio.js';

export const DEVOTION_CONSTELLATIONS = [
  {
    key: 'phoenix',
    name: '🔥 The Phoenix',
    lore: 'Primordial Flame of the Genesis Core',
    color: '#ff7700',
    nodes: [
      { id: 'ph_1', name: 'Ember Heart', desc: '+15% Fire Damage', stat: 'fireDmg', val: 15 },
      { id: 'ph_2', name: 'Ash Walker', desc: '+15% Fire Resistance', stat: 'fireRes', val: 15 },
      { id: 'ph_3', name: 'Ignited Fury', desc: '+20% Critical Strike Multiplier', stat: 'critMulti', val: 20 },
      { id: 'ph_proc', name: '★ Phoenix Firestorm', desc: 'Proc on Crit: Calls down pillar of blazing flame', stat: 'proc', val: 'proc_phoenix_firestorm' }
    ]
  },
  {
    key: 'frost_warden',
    name: '❄️ The Frost Warden',
    lore: 'Eternal Guardian of the Glacial Pinnacle',
    color: '#00f2fe',
    nodes: [
      { id: 'fw_1', name: 'Frozen Veins', desc: '+60 Maximum Energy Shield', stat: 'es', val: 60 },
      { id: 'fw_2', name: 'Glacial Plating', desc: '+100 Armor', stat: 'armor', val: 100 },
      { id: 'fw_3', name: 'Absolute Zero', desc: '+15% Cold Resistance', stat: 'coldRes', val: 15 },
      { id: 'fw_proc', name: '★ Glacial Barrier', desc: 'Proc on Low Life (<35% HP): Grants 400 Shield', stat: 'proc', val: 'proc_glacial_barrier' }
    ]
  },
  {
    key: 'thunder_lord',
    name: '⚡ The Thunder Lord',
    lore: 'Unleashes Unrestrained Celestial Plasma',
    color: '#ffd700',
    nodes: [
      { id: 'tl_1', name: 'Static Surge', desc: '+10% Attack & Cast Speed', stat: 'speed', val: 10 },
      { id: 'tl_2', name: 'Storm Conduit', desc: '+15% Lightning Damage', stat: 'lightDmg', val: 15 },
      { id: 'tl_3', name: 'High Voltage', desc: '+8% Critical Strike Chance', stat: 'critChance', val: 8 },
      { id: 'tl_proc', name: '★ Chain Lightning', desc: 'Proc on Hit: 25% chance to discharge 3-target arc lightning', stat: 'proc', val: 'proc_chain_lightning' }
    ]
  },
  {
    key: 'void_reaper',
    name: '☠️ The Void Reaper',
    lore: 'Reaps Vitality of Fallen Enemies',
    color: '#c678dd',
    nodes: [
      { id: 'vr_1', name: 'Shadow Infusion', desc: '+15% Chaos Resistance', stat: 'chaosRes', val: 15 },
      { id: 'vr_2', name: 'Reaper Harvest', desc: '+5% Life Leech on Hit', stat: 'leech', val: 5 },
      { id: 'vr_3', name: 'Nether Touch', desc: '+20% Chaos Damage', stat: 'chaosDmg', val: 20 },
      { id: 'vr_proc', name: '★ Void Siphon', desc: 'Proc on Kill: Siphons 10% Max Life & ES', stat: 'proc', val: 'proc_void_siphon' }
    ]
  }
];

export function renderDevotionModal() {
  let modal = document.getElementById('devotionModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'devotionModal';
    modal.className = 'game-modal-backdrop';
    modal.innerHTML = `
      <div class="devotion-modal-card">
        <div class="modal-header">
          <h2>✨ Celestial Devotion Constellation Grid</h2>
          <button class="close-btn" id="closeDevotionBtn">✕</button>
        </div>

        <div class="devotion-body">
          <div class="devotion-header-info">
            <span class="dev-points-badge">🌟 Available Devotion Points: <b id="devPointsCount">${player.devotionPoints ?? 6}</b></span>
            <button class="forge-btn btn-lock" id="btnResetDevotion" style="padding:6px 14px; font-size:12px;">🔄 Respec Points</button>
          </div>

          <div class="constellations-grid" id="constellationsGrid"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeDevotionBtn').onclick = () => {
      modal.style.display = 'none';
    };

    document.getElementById('btnResetDevotion').onclick = () => {
      if (confirm('Tẩy toàn bộ điểm Devotion đã cộng?')) {
        player.allocatedDevotionNodes = [];
        player.devotionPoints = 8;
        AudioEngine.playTone(330, 'square', 0.2, 0.15);
        updateDevotionUI();
      }
    };
  }

  updateDevotionUI();
  modal.style.display = 'flex';
}

export function updateDevotionUI() {
  player.devotionPoints = player.devotionPoints ?? 6;
  player.allocatedDevotionNodes = player.allocatedDevotionNodes ?? ['ph_1', 'fw_1'];

  const pointsCount = document.getElementById('devPointsCount');
  if (pointsCount) pointsCount.textContent = player.devotionPoints;

  const grid = document.getElementById('constellationsGrid');
  if (!grid) return;

  grid.innerHTML = '';

  DEVOTION_CONSTELLATIONS.forEach(constellation => {
    const card = document.createElement('div');
    card.className = 'constellation-card';
    card.style.borderColor = constellation.color;

    let nodesHtml = '';
    constellation.nodes.forEach(node => {
      const isAllocated = player.allocatedDevotionNodes.includes(node.id);
      const isProc = node.id.includes('proc');

      nodesHtml += `
        <div class="dev-star-node ${isAllocated ? 'allocated' : ''} ${isProc ? 'proc-keystone' : ''}" 
             data-id="${node.id}" 
             style="border-color:${constellation.color}">
          <div class="star-name">${node.name}</div>
          <div class="star-desc">${node.desc}</div>
          <div class="star-status">${isAllocated ? '✅ ALLOCATED' : '⭐ CLICK TO ALLOCATE (1 Point)'}</div>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="constellation-title" style="color:${constellation.color}">${constellation.name}</div>
      <div class="constellation-lore">${constellation.lore}</div>
      <div class="constellation-nodes-list">${nodesHtml}</div>
    `;

    grid.appendChild(card);
  });

  // Attach node click handlers
  grid.querySelectorAll('.dev-star-node').forEach(elem => {
    elem.onclick = () => {
      const nodeId = elem.getAttribute('data-id');
      if (player.allocatedDevotionNodes.includes(nodeId)) return;

      if (player.devotionPoints <= 0) {
        alert('Not enough Devotion Points! Cleanse more celestial shrines.');
        return;
      }

      player.allocatedDevotionNodes.push(nodeId);
      player.devotionPoints--;
      AudioEngine.playTone(880, 'sine', 0.25, 0.2);
      updateDevotionUI();
    };
  });
}
