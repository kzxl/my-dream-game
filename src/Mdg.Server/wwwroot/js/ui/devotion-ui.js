/**
 * MDG: Aethelis - Celestial Devotion Constellation Tree
 * Interactive Star Map with Root Nexus, Connected Constellation Branches, SVG Leylines & Combat Proc Skills
 */

import { player } from '../state.js';
import { AudioEngine } from '../audio.js';
import { saveToDatabase } from '../save-system.js';

export const DEVOTION_TREE_NODES = {
  nexus_root: {
    id: 'nexus_root',
    name: 'Genesis Nexus',
    lore: 'The primordial origin where all celestial leylines converge.',
    desc: '+10 to All Attributes (Core Origin)',
    stat: 'allStats',
    val: 10,
    x: 50,
    y: 50,
    parentId: null,
    color: '#00f2fe',
    icon: '✨',
    isRoot: true
  },

  // Branch 1: The Phoenix (Fire / Crit - Top Right)
  ph_1: {
    id: 'ph_1',
    name: 'Ember Heart',
    constellation: 'The Phoenix',
    desc: '+15% Fire Damage',
    stat: 'fireDmg',
    val: 15,
    x: 63,
    y: 38,
    parentId: 'nexus_root',
    color: '#ff7700',
    icon: '🔥'
  },
  ph_2: {
    id: 'ph_2',
    name: 'Ash Walker',
    constellation: 'The Phoenix',
    desc: '+15% Fire Resistance',
    stat: 'fireRes',
    val: 15,
    x: 74,
    y: 28,
    parentId: 'ph_1',
    color: '#ff7700',
    icon: '🛡️'
  },
  ph_3: {
    id: 'ph_3',
    name: 'Ignited Fury',
    constellation: 'The Phoenix',
    desc: '+20% Critical Strike Multiplier',
    stat: 'critMulti',
    val: 20,
    x: 84,
    y: 20,
    parentId: 'ph_2',
    color: '#ff7700',
    icon: '⚡'
  },
  ph_proc: {
    id: 'ph_proc',
    name: '★ Phoenix Firestorm',
    constellation: 'The Phoenix',
    desc: 'Proc on Crit: Calls down a blazing celestial flame pillar',
    stat: 'proc',
    val: 'proc_phoenix_firestorm',
    x: 92,
    y: 12,
    parentId: 'ph_3',
    color: '#ff4400',
    icon: '🦅',
    isProc: true
  },

  // Branch 2: The Frost Warden (Cold / ES - Top Left)
  fw_1: {
    id: 'fw_1',
    name: 'Frozen Veins',
    constellation: 'The Frost Warden',
    desc: '+60 Maximum Energy Shield',
    stat: 'es',
    val: 60,
    x: 37,
    y: 38,
    parentId: 'nexus_root',
    color: '#00f2fe',
    icon: '❄️'
  },
  fw_2: {
    id: 'fw_2',
    name: 'Glacial Plating',
    constellation: 'The Frost Warden',
    desc: '+100 Armor Mitigation',
    stat: 'armor',
    val: 100,
    x: 26,
    y: 28,
    parentId: 'fw_1',
    color: '#00f2fe',
    icon: '🛡️'
  },
  fw_3: {
    id: 'fw_3',
    name: 'Absolute Zero',
    constellation: 'The Frost Warden',
    desc: '+15% Cold Resistance',
    stat: 'coldRes',
    val: 15,
    x: 16,
    y: 20,
    parentId: 'fw_2',
    color: '#00f2fe',
    icon: '💎'
  },
  fw_proc: {
    id: 'fw_proc',
    name: '★ Glacial Barrier',
    constellation: 'The Frost Warden',
    desc: 'Proc on Low Life (<35% HP): Grants +400 Temporary Energy Shield',
    stat: 'proc',
    val: 'proc_glacial_barrier',
    x: 8,
    y: 12,
    parentId: 'fw_3',
    color: '#00e5ff',
    icon: '🧊',
    isProc: true
  },

  // Branch 3: The Thunder Lord (Lightning / Speed - Bottom Right)
  tl_1: {
    id: 'tl_1',
    name: 'Static Surge',
    constellation: 'The Thunder Lord',
    desc: '+10% Attack & Cast Speed',
    stat: 'speed',
    val: 10,
    x: 63,
    y: 62,
    parentId: 'nexus_root',
    color: '#ffd700',
    icon: '⚡'
  },
  tl_2: {
    id: 'tl_2',
    name: 'Storm Conduit',
    constellation: 'The Thunder Lord',
    desc: '+15% Lightning Damage',
    stat: 'lightDmg',
    val: 15,
    x: 74,
    y: 72,
    parentId: 'tl_1',
    color: '#ffd700',
    icon: '🌩️'
  },
  tl_3: {
    id: 'tl_3',
    name: 'High Voltage',
    constellation: 'The Thunder Lord',
    desc: '+8% Critical Strike Chance',
    stat: 'critChance',
    val: 8,
    x: 84,
    y: 80,
    parentId: 'tl_2',
    color: '#ffd700',
    icon: '🔮'
  },
  tl_proc: {
    id: 'tl_proc',
    name: '★ Chain Lightning',
    constellation: 'The Thunder Lord',
    desc: 'Proc on Hit: 25% chance to discharge 3-target arc lightning',
    stat: 'proc',
    val: 'proc_chain_lightning',
    x: 92,
    y: 88,
    parentId: 'tl_3',
    color: '#ffeb3b',
    icon: '⚡',
    isProc: true
  },

  // Branch 4: The Void Reaper (Chaos / Leech - Bottom Left)
  vr_1: {
    id: 'vr_1',
    name: 'Shadow Infusion',
    constellation: 'The Void Reaper',
    desc: '+15% Chaos Resistance',
    stat: 'chaosRes',
    val: 15,
    x: 37,
    y: 62,
    parentId: 'nexus_root',
    color: '#c678dd',
    icon: '☠️'
  },
  vr_2: {
    id: 'vr_2',
    name: 'Reaper Harvest',
    constellation: 'The Void Reaper',
    desc: '+5% Life Leech on Hit',
    stat: 'leech',
    val: 5,
    x: 26,
    y: 72,
    parentId: 'vr_1',
    color: '#c678dd',
    icon: '🩸'
  },
  vr_3: {
    id: 'vr_3',
    name: 'Nether Touch',
    constellation: 'The Void Reaper',
    desc: '+20% Chaos Damage',
    stat: 'chaosDmg',
    val: 20,
    x: 16,
    y: 80,
    parentId: 'vr_2',
    color: '#c678dd',
    icon: '🌌'
  },
  vr_proc: {
    id: 'vr_proc',
    name: '★ Void Siphon',
    constellation: 'The Void Reaper',
    desc: 'Proc on Kill: Siphons 10% Maximum Life & Energy Shield',
    stat: 'proc',
    val: 'proc_void_siphon',
    x: 8,
    y: 88,
    parentId: 'vr_3',
    color: '#d500f9',
    icon: '💀',
    isProc: true
  }
};

let hoveredNodeId = null;

export function renderDevotionModal() {
  let modal = document.getElementById('devotionModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'devotionModal';
    modal.className = 'game-modal-backdrop';
    document.body.appendChild(modal);
  }

  // Ensure root nexus is always allocated
  if (!player.allocatedDevotionNodes) {
    player.allocatedDevotionNodes = ['nexus_root', 'ph_1', 'fw_1'];
  } else if (!player.allocatedDevotionNodes.includes('nexus_root')) {
    player.allocatedDevotionNodes.unshift('nexus_root');
  }

  if (player.devotionPoints === undefined) {
    player.devotionPoints = 6;
  }

  modal.innerHTML = `
    <div class="devotion-tree-modal-card">
      <!-- Modal Header -->
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:22px;">🌌</span>
          <h2>Celestial Devotion Tree (Constellations)</h2>
        </div>
        <button class="close-btn" id="closeDevotionBtn">✕</button>
      </div>

      <!-- Main Devotion Tree Layout -->
      <div class="devotion-tree-layout">
        
        <!-- Left / Center: Interactive Constellation Star Canvas -->
        <div class="devotion-canvas-viewport">
          <div class="devotion-top-bar">
            <div class="dev-points-pill">
              <span>🌟 Available Devotion Points:</span>
              <strong id="devPointsCount">${player.devotionPoints}</strong>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="forge-btn btn-lock" id="btnResetDevotion" style="padding:6px 12px; font-size:11px;">🔄 Refund All Points</button>
            </div>
          </div>

          <!-- Cosmos Starfield Board -->
          <div class="devotion-cosmos-board" id="devotionCosmosBoard">
            <!-- Background Starry Grid -->
            <div class="devotion-nebula-bg"></div>

            <!-- SVG Constellation Connecting Lines -->
            <svg class="devotion-lines-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <filter id="devotion-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="1.2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              ${renderDevotionSvgLines()}
            </svg>

            <!-- Star Nodes Layer -->
            <div class="devotion-nodes-layer">
              ${Object.values(DEVOTION_TREE_NODES).map(node => {
                const isAllocated = player.allocatedDevotionNodes.includes(node.id);
                const parentAllocated = !node.parentId || player.allocatedDevotionNodes.includes(node.parentId);
                const canAllocate = !isAllocated && parentAllocated && player.devotionPoints > 0;
                const isLocked = !isAllocated && !parentAllocated;

                return `
                  <div class="dev-star-node-item ${isAllocated ? 'is-allocated' : ''} ${canAllocate ? 'is-available' : ''} ${isLocked ? 'is-locked' : ''} ${node.isProc ? 'is-keystone-proc' : ''} ${node.isRoot ? 'is-root-nexus' : ''}"
                       style="left: ${node.x}%; top: ${node.y}%; border-color: ${isAllocated ? (node.color || '#00f2fe') : '#3d4452'};"
                       data-node-id="${node.id}">
                    <div class="node-star-pulse" style="border-color: ${node.color || '#00f2fe'};"></div>
                    <span class="node-star-icon">${node.icon || '⭐'}</span>
                    <span class="node-mini-name">${node.name}</span>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Hover Floating Tooltip -->
            <div id="devotionHoverTooltip" class="devotion-tooltip hidden"></div>
          </div>
        </div>

        <!-- Right Side: Active Constellation Bonuses & Lore Dossier -->
        <div class="devotion-sidebar-dossier">
          <h3 class="dossier-title">📜 CELESTIAL ALIGNMENT</h3>
          <p class="dossier-lore">Allocate Devotion Points earned from cleansing ancient shrines to chart constellations and awaken godlike combat procs.</p>

          <div class="dossier-section-title">✨ ACTIVE CELESTIAL PROCS</div>
          <div class="active-procs-stack">
            ${renderActiveProcsList()}
          </div>

          <div class="dossier-section-title">📊 TOTAL DEVOTION STAT BONUSES</div>
          <div class="devotion-stats-summary">
            ${renderDevotionStatsSummary()}
          </div>
        </div>

      </div>
    </div>
  `;

  document.getElementById('closeDevotionBtn').onclick = () => {
    modal.style.display = 'none';
  };

  document.getElementById('btnResetDevotion').onclick = () => {
    if (confirm('Refund all allocated Devotion points? (Genesis Nexus remains unlocked)')) {
      const allocatedCount = (player.allocatedDevotionNodes || []).filter(id => id !== 'nexus_root').length;
      player.devotionPoints = (player.devotionPoints || 0) + allocatedCount;
      player.allocatedDevotionNodes = ['nexus_root'];
      saveToDatabase(true);
      AudioEngine.playTone(330, 'square', 0.2, 0.15);
      renderDevotionModal();
    }
  };

  attachDevotionNodeEvents(modal);
  modal.style.display = 'flex';
}

function renderDevotionSvgLines() {
  let lines = '';
  Object.values(DEVOTION_TREE_NODES).forEach(node => {
    if (!node.parentId) return;
    const parent = DEVOTION_TREE_NODES[node.parentId];
    if (!parent) return;

    const isLinkActive = player.allocatedDevotionNodes.includes(node.id) && player.allocatedDevotionNodes.includes(parent.id);
    const strokeColor = isLinkActive ? (node.color || '#00f2fe') : 'rgba(75, 85, 105, 0.4)';
    const strokeWidth = isLinkActive ? '2.2' : '1.2';
    const strokeDash = isLinkActive ? 'none' : '3 3';

    lines += `
      <line x1="${parent.x}" y1="${parent.y}" x2="${node.x}" y2="${node.y}"
            stroke="${strokeColor}"
            stroke-width="${strokeWidth}"
            stroke-dasharray="${strokeDash}"
            filter="${isLinkActive ? 'url(#devotion-glow)' : 'none'}"
            class="${isLinkActive ? 'constellation-line-active' : 'constellation-line-inactive'}" />
    `;
  });
  return lines;
}

function attachDevotionNodeEvents(modal) {
  const tooltip = modal.querySelector('#devotionHoverTooltip');

  modal.querySelectorAll('.dev-star-node-item').forEach(el => {
    const nodeId = el.getAttribute('data-node-id');
    const node = DEVOTION_TREE_NODES[nodeId];
    if (!node) return;

    // Hover Tooltip
    el.onmouseenter = (e) => {
      if (!tooltip) return;
      const isAllocated = player.allocatedDevotionNodes.includes(node.id);
      const parentAllocated = !node.parentId || player.allocatedDevotionNodes.includes(node.parentId);

      tooltip.innerHTML = `
        <div class="tooltip-header" style="color: ${node.color || '#ffd700'};">
          <span>${node.icon || '⭐'}</span>
          <strong>${node.name}</strong>
        </div>
        ${node.constellation ? `<div class="tooltip-constellation">${node.constellation}</div>` : ''}
        <div class="tooltip-desc">${node.desc}</div>
        <div class="tooltip-status ${isAllocated ? 'status-allocated' : (parentAllocated ? 'status-available' : 'status-locked')}">
          ${isAllocated ? '✅ ALLOCATED & ACTIVE' : (parentAllocated ? '🌟 CLICK TO ALLOCATE (1 Point)' : '🔒 REQUIRES PARENT STAR')}
        </div>
      `;

      tooltip.style.left = `${node.x > 50 ? (node.x - 24) : (node.x + 4)}%`;
      tooltip.style.top = `${node.y > 50 ? (node.y - 18) : (node.y + 4)}%`;
      tooltip.classList.remove('hidden');
    };

    el.onmouseleave = () => {
      tooltip?.classList.add('hidden');
    };

    // Node Click Allocation
    el.onclick = () => {
      if (node.isRoot) return;

      const isAllocated = player.allocatedDevotionNodes.includes(node.id);
      if (isAllocated) return;

      const parentAllocated = !node.parentId || player.allocatedDevotionNodes.includes(node.parentId);
      if (!parentAllocated) {
        alert('You must allocate the preceding connecting star node first!');
        AudioEngine.playTone(220, 'sawtooth', 0.15, 0.1);
        return;
      }

      if (player.devotionPoints <= 0) {
        alert('Not enough Devotion Points! Cleanse celestial shrines to earn points.');
        AudioEngine.playTone(220, 'sawtooth', 0.15, 0.1);
        return;
      }

      player.allocatedDevotionNodes.push(node.id);
      player.devotionPoints--;
      AudioEngine.playTone(784, 'sine', 0.2, 0.2);
      saveToDatabase(true);
      renderDevotionModal();
    };
  });
}

function renderActiveProcsList() {
  const procs = Object.values(DEVOTION_TREE_NODES)
    .filter(n => n.isProc && player.allocatedDevotionNodes.includes(n.id));

  if (procs.length === 0) {
    return `<div style="font-size:11px; color:#7f848e; font-style:italic;">No keystones active. Allocate final stars in branch constellations.</div>`;
  }

  return procs.map(p => `
    <div class="active-proc-card" style="border-left: 3px solid ${p.color || '#ffd700'};">
      <span class="ap-icon">${p.icon}</span>
      <div>
        <div class="ap-name" style="color:${p.color || '#ffd700'}">${p.name}</div>
        <div class="ap-desc">${p.desc}</div>
      </div>
    </div>
  `).join('');
}

function renderDevotionStatsSummary() {
  const allocated = Object.values(DEVOTION_TREE_NODES)
    .filter(n => player.allocatedDevotionNodes.includes(n.id));

  if (allocated.length <= 1) {
    return `<div style="font-size:11px; color:#7f848e;">+10 All Core Attributes</div>`;
  }

  return allocated.map(n => `
    <div class="dev-stat-row">
      <span style="color:${n.color || '#ffd700'}">• ${n.name}:</span>
      <span>${n.desc}</span>
    </div>
  `).join('');
}

export async function fetchMasterDevotionFromServer() {
  try {
    const res = await fetch('/api/v1/data/devotion');
    if (!res.ok) return;
    const data = await res.json();
    if (data && Array.isArray(data.nodes) && data.nodes.length > 0) {
      data.nodes.forEach(dn => {
        DEVOTION_TREE_NODES[dn.id] = {
          id: dn.id,
          name: dn.name,
          lore: dn.lore,
          desc: dn.description,
          stat: dn.statKey,
          val: dn.isProc ? dn.stringValue : dn.statValue,
          x: dn.x,
          y: dn.y,
          parentId: dn.parentNodeId,
          color: dn.color,
          icon: dn.icon,
          isRoot: !!dn.isRoot,
          isProc: !!dn.isProc
        };
      });
      console.log(`[MasterData] Hydrated ${data.nodes.length} Devotion Stars from SQLite database.`);
    }
  } catch (e) {
    console.warn('[MasterData] Using bundled offline devotion fallback:', e.message);
  }
}

