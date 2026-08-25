/**
 * MDG: Aethelis - Colossal Celestial Devotion Starmap & Constellations Grid (Phím V)
 * Features:
 *   - 45+ Connected Celestial Nodes across 8 Zodiac Constellations + Primordial Nexus
 *   - Interactive Canvas/SVG Pan & Zoom Viewport (0.6x to 2.0x)
 *   - Real-Time Search & Stat Highlight Filter Bar
 *   - Combat Proc Skill Mastery (Phoenix Cataclysm, Frostward, Chain Lightning, Nether Siphon, Starlight Barrage...)
 *   - Anti-Inflation Economy Respec Tax (Gold + Starlight Dust)
 */

import { player } from '../state.js';
import { AudioEngine } from '../audio.js';
import { saveToDatabase } from '../save-system.js';
import { getLanguage, t } from '../i18n.js';

export const DEVOTION_TREE_NODES = {
  // =========================================================================
  // CORE ORIGIN: PRIMORDIAL GENESIS NEXUS (5 Nodes)
  // =========================================================================
  nexus_root: {
    id: 'nexus_root',
    name: 'Genesis Nexus Core',
    constellation: 'Genesis Nexus',
    lore: 'The primordial cosmic singularity where all celestial leylines converge.',
    desc: '+15 to All Core Attributes',
    stat: 'allStats',
    val: 15,
    x: 50,
    y: 50,
    parentId: null,
    color: '#00f2fe',
    icon: '✨',
    isRoot: true
  },
  nexus_sol: {
    id: 'nexus_sol',
    name: 'Solar Focal Eye',
    constellation: 'Genesis Nexus',
    desc: '+20% Fire Damage & +50 Maximum Life',
    stat: 'fireDmg',
    val: 20,
    x: 55,
    y: 44,
    parentId: 'nexus_root',
    color: '#ff7700',
    icon: '☀️'
  },
  nexus_glac: {
    id: 'nexus_glac',
    name: 'Glacial Focal Eye',
    constellation: 'Genesis Nexus',
    desc: '+60 Energy Shield & +80 Armor',
    stat: 'es',
    val: 60,
    x: 45,
    y: 44,
    parentId: 'nexus_root',
    color: '#00f2fe',
    icon: '❄️'
  },
  nexus_temp: {
    id: 'nexus_temp',
    name: 'Tempest Focal Eye',
    constellation: 'Genesis Nexus',
    desc: '+8% Attack & Cast Speed, +40 Max Mana',
    stat: 'speed',
    val: 8,
    x: 55,
    y: 56,
    parentId: 'nexus_root',
    color: '#ffd700',
    icon: '⚡'
  },
  nexus_void: {
    id: 'nexus_void',
    name: 'Umbral Focal Eye',
    constellation: 'Genesis Nexus',
    desc: '+20% Chaos Damage & +3% Life Leech',
    stat: 'chaosDmg',
    val: 20,
    x: 45,
    y: 56,
    parentId: 'nexus_root',
    color: '#c678dd',
    icon: '🌑'
  },

  // =========================================================================
  // 1. THE SOLAR PHOENIX (Hỏa / Thiêu Đốt / Crit - Top Right, 5 Nodes)
  // =========================================================================
  ph_1: {
    id: 'ph_1',
    name: 'Ember Heart',
    constellation: 'The Solar Phoenix',
    desc: '+20% Fire Damage',
    stat: 'fireDmg',
    val: 20,
    x: 65,
    y: 35,
    parentId: 'nexus_sol',
    color: '#ff7700',
    icon: '🔥'
  },
  ph_2: {
    id: 'ph_2',
    name: 'Ash Walker',
    constellation: 'The Solar Phoenix',
    desc: '+20% Fire Resistance & +30% Ignite Chance',
    stat: 'fireRes',
    val: 20,
    x: 74,
    y: 26,
    parentId: 'ph_1',
    color: '#ff7700',
    icon: '🛡️'
  },
  ph_3: {
    id: 'ph_3',
    name: 'Ignited Fury',
    constellation: 'The Solar Phoenix',
    desc: '+30% Critical Strike Multiplier',
    stat: 'critMulti',
    val: 30,
    x: 82,
    y: 19,
    parentId: 'ph_2',
    color: '#ff5500',
    icon: '⚡'
  },
  ph_4: {
    id: 'ph_4',
    name: 'Solar Conflagration',
    constellation: 'The Solar Phoenix',
    desc: '+35% Burn Damage & Ignite Spreads on Kill',
    stat: 'fireDmg',
    val: 35,
    x: 89,
    y: 14,
    parentId: 'ph_3',
    color: '#ff3300',
    icon: '☄️'
  },
  ph_proc: {
    id: 'ph_proc',
    name: '★ Phoenix Cataclysm',
    constellation: 'The Solar Phoenix',
    desc: 'Proc on Crit: Calls down a towering celestial flame pillar dealing 350% Fire AOE',
    stat: 'proc',
    val: 'proc_phoenix_firestorm',
    x: 95,
    y: 8,
    parentId: 'ph_4',
    color: '#ff1100',
    icon: '🦅',
    isProc: true
  },

  // =========================================================================
  // 2. THE GLACIAL AEGIS (Băng / ES / Giáp - Top Left, 5 Nodes)
  // =========================================================================
  ga_1: {
    id: 'ga_1',
    name: 'Frozen Veins',
    constellation: 'The Glacial Aegis',
    desc: '+80 Maximum Energy Shield',
    stat: 'es',
    val: 80,
    x: 35,
    y: 35,
    parentId: 'nexus_glac',
    color: '#00f2fe',
    icon: '❄️'
  },
  ga_2: {
    id: 'ga_2',
    name: 'Glacial Plating',
    constellation: 'The Glacial Aegis',
    desc: '+150 Armor Mitigation',
    stat: 'armor',
    val: 150,
    x: 26,
    y: 26,
    parentId: 'ga_1',
    color: '#00f2fe',
    icon: '🛡️'
  },
  ga_3: {
    id: 'ga_3',
    name: 'Absolute Zero',
    constellation: 'The Glacial Aegis',
    desc: '+20% Cold Resistance & +15% Freeze Duration',
    stat: 'coldRes',
    val: 20,
    x: 18,
    y: 19,
    parentId: 'ga_2',
    color: '#00f2fe',
    icon: '💎'
  },
  ga_4: {
    id: 'ga_4',
    name: 'Permafrost Bastion',
    constellation: 'The Glacial Aegis',
    desc: '+25% Cold Damage & +100 Max ES',
    stat: 'es',
    val: 100,
    x: 11,
    y: 14,
    parentId: 'ga_3',
    color: '#38bdf8',
    icon: '🧊'
  },
  ga_proc: {
    id: 'ga_proc',
    name: '★ Absolute Frostward',
    constellation: 'The Glacial Aegis',
    desc: 'Proc on Low Life (<35% HP): Summons an impassable glacial barrier absorbing 500 dmg',
    stat: 'proc',
    val: 'proc_glacial_barrier',
    x: 5,
    y: 8,
    parentId: 'ga_4',
    color: '#00e5ff',
    icon: '🛡️',
    isProc: true
  },

  // =========================================================================
  // 3. THE STORM TEMPEST (Lôi / Shock / Tốc Độ - Bottom Right, 5 Nodes)
  // =========================================================================
  st_1: {
    id: 'st_1',
    name: 'Static Surge',
    constellation: 'The Storm Tempest',
    desc: '+12% Attack & Cast Speed',
    stat: 'speed',
    val: 12,
    x: 65,
    y: 65,
    parentId: 'nexus_temp',
    color: '#ffd700',
    icon: '⚡'
  },
  st_2: {
    id: 'st_2',
    name: 'Storm Conduit',
    constellation: 'The Storm Tempest',
    desc: '+25% Lightning Damage',
    stat: 'lightDmg',
    val: 25,
    x: 74,
    y: 74,
    parentId: 'st_1',
    color: '#ffd700',
    icon: '🌩️'
  },
  st_3: {
    id: 'st_3',
    name: 'High Voltage',
    constellation: 'The Storm Tempest',
    desc: '+10% Critical Strike Chance',
    stat: 'critChance',
    val: 10,
    x: 82,
    y: 81,
    parentId: 'st_2',
    color: '#ffd700',
    icon: '🔮'
  },
  st_4: {
    id: 'st_4',
    name: 'Overcharged Capacitor',
    constellation: 'The Storm Tempest',
    desc: '+20% Shock Damage Amplification',
    stat: 'lightDmg',
    val: 20,
    x: 89,
    y: 86,
    parentId: 'st_3',
    color: '#ffea00',
    icon: '⚡'
  },
  st_proc: {
    id: 'st_proc',
    name: '★ Chain Lightning Arc',
    constellation: 'The Storm Tempest',
    desc: 'Proc on Hit: 30% chance to discharge a 4-target bouncing arc lightning',
    stat: 'proc',
    val: 'proc_chain_lightning',
    x: 95,
    y: 92,
    parentId: 'st_4',
    color: '#fff000',
    icon: '🌩️',
    isProc: true
  },

  // =========================================================================
  // 4. THE VOID SOVEREIGN (Chaos / Leech / Bleed - Bottom Left, 5 Nodes)
  // =========================================================================
  vs_1: {
    id: 'vs_1',
    name: 'Shadow Infusion',
    constellation: 'The Void Sovereign',
    desc: '+20% Chaos Resistance',
    stat: 'chaosRes',
    val: 20,
    x: 35,
    y: 65,
    parentId: 'nexus_void',
    color: '#c678dd',
    icon: '☠️'
  },
  vs_2: {
    id: 'vs_2',
    name: 'Reaper Harvest',
    constellation: 'The Void Sovereign',
    desc: '+6% Life Leech on Hit',
    stat: 'leech',
    val: 6,
    x: 26,
    y: 74,
    parentId: 'vs_1',
    color: '#c678dd',
    icon: '🩸'
  },
  vs_3: {
    id: 'vs_3',
    name: 'Nether Touch',
    constellation: 'The Void Sovereign',
    desc: '+30% Chaos Damage',
    stat: 'chaosDmg',
    val: 30,
    x: 18,
    y: 81,
    parentId: 'vs_2',
    color: '#c678dd',
    icon: '🌌'
  },
  vs_4: {
    id: 'vs_4',
    name: 'Soul Rot',
    constellation: 'The Void Sovereign',
    desc: '+25% Bleed & Poison Duration',
    stat: 'chaosDmg',
    val: 25,
    x: 11,
    y: 86,
    parentId: 'vs_3',
    color: '#d500f9',
    icon: '💀'
  },
  vs_proc: {
    id: 'vs_proc',
    name: '★ Nether Siphon Nova',
    constellation: 'The Void Sovereign',
    desc: 'Proc on Kill: Siphons 12% Maximum Life & unleashes a crushing void shockwave',
    stat: 'proc',
    val: 'proc_void_siphon',
    x: 5,
    y: 92,
    parentId: 'vs_4',
    color: '#aa00ff',
    icon: '💀',
    isProc: true
  },

  // =========================================================================
  // 5. THE CELESTIAL ARCHER (Tốc Bắn / Xuyên Thấu - Top Middle, 5 Nodes)
  // =========================================================================
  ca_1: {
    id: 'ca_1',
    name: 'Hawkeye Focus',
    constellation: 'The Celestial Archer',
    desc: '+15% Projectile Speed & +10% Accuracy',
    stat: 'speed',
    val: 15,
    x: 50,
    y: 30,
    parentId: 'nexus_root',
    color: '#4ade80',
    icon: '🎯'
  },
  ca_2: {
    id: 'ca_2',
    name: 'Piercing Starlight',
    constellation: 'The Celestial Archer',
    desc: '+1 Additional Projectile Pierce',
    stat: 'speed',
    val: 10,
    x: 50,
    y: 21,
    parentId: 'ca_1',
    color: '#4ade80',
    icon: '🏹'
  },
  ca_3: {
    id: 'ca_3',
    name: 'Windrunner Stride',
    constellation: 'The Celestial Archer',
    desc: '+15% Movement Speed',
    stat: 'speed',
    val: 15,
    x: 43,
    y: 13,
    parentId: 'ca_2',
    color: '#4ade80',
    icon: '💨'
  },
  ca_4: {
    id: 'ca_4',
    name: 'Keen Sights',
    constellation: 'The Celestial Archer',
    desc: '+25% Projectile Damage & +8% Crit',
    stat: 'critChance',
    val: 8,
    x: 57,
    y: 13,
    parentId: 'ca_2',
    color: '#22c55e',
    icon: '🌠'
  },
  ca_proc: {
    id: 'ca_proc',
    name: '★ Starlight Arrow Barrage',
    constellation: 'The Celestial Archer',
    desc: 'Proc on Hit: Fires 5 homing starlight arrows seeking out distant targets',
    stat: 'proc',
    val: 'proc_starlight_barrage',
    x: 50,
    y: 5,
    parentId: 'ca_4',
    color: '#16a34a',
    icon: '🏹',
    isProc: true
  },

  // =========================================================================
  // 6. THE PRIMORDIAL BEHEMOTH (Sinh Mệnh / Kháng Choáng - Bottom Middle, 5 Nodes)
  // =========================================================================
  pb_1: {
    id: 'pb_1',
    name: 'Colossus Vigor',
    constellation: 'The Primordial Behemoth',
    desc: '+100 Maximum Life',
    stat: 'allStats',
    val: 10,
    x: 50,
    y: 70,
    parentId: 'nexus_root',
    color: '#f59e0b',
    icon: '❤️'
  },
  pb_2: {
    id: 'pb_2',
    name: 'Titan Hide',
    constellation: 'The Primordial Behemoth',
    desc: '+180 Armor & +15% Health Regen Rate',
    stat: 'armor',
    val: 180,
    x: 50,
    y: 79,
    parentId: 'pb_1',
    color: '#f59e0b',
    icon: '🛡️'
  },
  pb_3: {
    id: 'pb_3',
    name: 'Iron Will',
    constellation: 'The Primordial Behemoth',
    desc: '+40% Stun & Knockback Resistance',
    stat: 'armor',
    val: 100,
    x: 43,
    y: 87,
    parentId: 'pb_2',
    color: '#d97706',
    icon: '🪨'
  },
  pb_4: {
    id: 'pb_4',
    name: 'Gargantuan Heart',
    constellation: 'The Primordial Behemoth',
    desc: '+20% Increased Maximum Life',
    stat: 'allStats',
    val: 20,
    x: 57,
    y: 87,
    parentId: 'pb_2',
    color: '#b45309',
    icon: '🐲'
  },
  pb_proc: {
    id: 'pb_proc',
    name: '★ Behemoth Roar',
    constellation: 'The Primordial Behemoth',
    desc: 'Proc on Hit Taken: Roars with titanic might, stunning all nearby enemies for 2.0s',
    stat: 'proc',
    val: 'proc_behemoth_roar',
    x: 50,
    y: 95,
    parentId: 'pb_4',
    color: '#92400e',
    icon: '🐉',
    isProc: true
  },

  // =========================================================================
  // 7. THE BLADE SOVEREIGN (Vật Lý / Xuyên Giáp / Bleed - Right Wing, 5 Nodes)
  // =========================================================================
  bs_1: {
    id: 'bs_1',
    name: 'Honed Edge',
    constellation: 'The Blade Sovereign',
    desc: '+20% Physical Damage',
    stat: 'critMulti',
    val: 15,
    x: 70,
    y: 50,
    parentId: 'nexus_root',
    color: '#f43f5e',
    icon: '🗡️'
  },
  bs_2: {
    id: 'bs_2',
    name: 'Sundering Strike',
    constellation: 'The Blade Sovereign',
    desc: '+25% Armor Penetration',
    stat: 'critMulti',
    val: 20,
    x: 80,
    y: 47,
    parentId: 'bs_1',
    color: '#f43f5e',
    icon: '⚔️'
  },
  bs_3: {
    id: 'bs_3',
    name: 'Bloodletting',
    constellation: 'The Blade Sovereign',
    desc: '+35% Bleed Damage (x3.0 when moving)',
    stat: 'critMulti',
    val: 25,
    x: 88,
    y: 44,
    parentId: 'bs_2',
    color: '#e11d48',
    icon: '🩸'
  },
  bs_4: {
    id: 'bs_4',
    name: 'Dance of Steel',
    constellation: 'The Blade Sovereign',
    desc: '+15% Attack Speed & +10% Movement Speed',
    stat: 'speed',
    val: 15,
    x: 88,
    y: 56,
    parentId: 'bs_2',
    color: '#be123c',
    icon: '🌀'
  },
  bs_proc: {
    id: 'bs_proc',
    name: '★ Phantom Blade Vortex',
    constellation: 'The Blade Sovereign',
    desc: 'Proc on Hit: Summons a spinning vortex of spectral phantom swords slashing foes',
    stat: 'proc',
    val: 'proc_phantom_blade',
    x: 96,
    y: 50,
    parentId: 'bs_3',
    color: '#9f1239',
    icon: '⚔️',
    isProc: true
  },

  // =========================================================================
  // 8. THE GATE OF ETERNITY KEYSTONE (Endgame Omnipotence - Left Wing, 5 Nodes)
  // =========================================================================
  ge_1: {
    id: 'ge_1',
    name: 'Aether Resonance',
    constellation: 'The Gate of Eternity',
    desc: '+15% to All Elemental Resistances',
    stat: 'allStats',
    val: 15,
    x: 30,
    y: 50,
    parentId: 'nexus_root',
    color: '#a855f7',
    icon: '🔮'
  },
  ge_2: {
    id: 'ge_2',
    name: 'Chrono Rift Flux',
    constellation: 'The Gate of Eternity',
    desc: '-15% Skill Cooldown Recovery Time',
    stat: 'speed',
    val: 15,
    x: 20,
    y: 47,
    parentId: 'ge_1',
    color: '#a855f7',
    icon: '⏳'
  },
  ge_3: {
    id: 'ge_3',
    name: 'Leyline Conduit',
    constellation: 'The Gate of Eternity',
    desc: '-30% Mana Cost of All Skills',
    stat: 'allStats',
    val: 10,
    x: 12,
    y: 44,
    parentId: 'ge_2',
    color: '#9333ea',
    icon: '🌌'
  },
  ge_4: {
    id: 'ge_4',
    name: 'Celestial Mastery',
    constellation: 'The Gate of Eternity',
    desc: '+25% Sunder Damage & +150 Energy Shield',
    stat: 'es',
    val: 150,
    x: 12,
    y: 56,
    parentId: 'ge_2',
    color: '#7e22ce',
    icon: '✨'
  },
  ge_proc: {
    id: 'ge_proc',
    name: '★ Celestial Supernova',
    constellation: 'The Gate of Eternity',
    desc: 'Proc on Skill Cast (15%): Triggers a screen-wide prismatic supernova obliteration',
    stat: 'proc',
    val: 'proc_celestial_supernova',
    x: 4,
    y: 50,
    parentId: 'ge_3',
    color: '#6b21a8',
    icon: '🌌',
    isProc: true
  }
};

let hoveredNodeId = null;
let searchQuery = '';
let viewScale = 1.0;
let panOffsetX = 0;
let panOffsetY = 0;
let isPanning = false;
let startPanX = 0;
let startPanY = 0;

export function renderDevotionModal(forceOpen = false) {
  let modal = document.getElementById('devotionModal');
  if (!forceOpen && modal && modal.style.display !== 'none') {
    modal.style.display = 'none';
    return;
  }
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'devotionModal';
    modal.className = 'game-modal-backdrop';
    document.body.appendChild(modal);
  }

  // Ensure player state
  if (!player.devotionPoints) player.devotionPoints = 35;
  if (!player.devotionAllocated) player.devotionAllocated = ['nexus_root'];
  if (!player.devotionProcs) player.devotionProcs = [];

  const lang = getLanguage() || 'vi';
  const allocatedCount = player.devotionAllocated.length;
  const unspent = Math.max(0, player.devotionPoints - allocatedCount);
  const starlightDust = player.materials?.mat_starlight_dust || 12;

  modal.innerHTML = `
    <div class="devotion-modal-card">
      <div class="devotion-top-header">
        <div class="header-left">
          <span style="font-size:26px;">✨</span>
          <div>
            <h2 style="margin:0; font-size:18px; color:#ffd700;">CELESTIAL DEVOTION STARMAP 2.0</h2>
            <span style="font-size:11px; color:#888;">8 Đại Chòm Sao Hoàng Đạo & 45+ Tinh Cầu Nguyên Thủy [V]</span>
          </div>
        </div>

        <div class="devotion-search-wrap">
          <span style="font-size:14px;">🔍</span>
          <input type="text" id="devotionSearchInput" class="devotion-search-input" placeholder="Tìm kiếm thuộc tính (Fire, Cold, Life, Crit, Leech...)" value="${searchQuery}">
        </div>

        <div class="header-points-tag">
          <span>🌟 ${lang === 'vi' ? 'Điểm Tinh Tú:' : 'Devotion Points:'} <b style="color:#00f2fe; font-size:16px;">${unspent}</b></span>
          <span style="font-size:11px; color:#94a3b8; margin-left:8px;">(Đã cộng: ${allocatedCount})</span>
        </div>

        <div class="header-actions">
          <button id="btnRefundDevotion" class="devotion-respec-btn" title="Hoàn điểm tiêu tốn Vàng + Bụi Tinh Tú (Chống lạm phát)">
            🔄 ${lang === 'vi' ? 'Tẩy Điểm (Respec)' : 'Respec Tree'}
          </button>
          <button class="close-btn" id="closeDevotionBtn">✕</button>
        </div>
      </div>

      <div class="devotion-canvas-viewport" id="devotionViewport">
        <!-- SVG Connecting Leylines -->
        <svg class="devotion-svg-lines" id="devotionSvgLines" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          ${renderSvgLines()}
        </svg>

        <!-- Starmap Nodes Container -->
        <div class="devotion-nodes-layer" id="devotionNodesLayer">
          ${renderDevotionNodes()}
        </div>

        <!-- Floating Tooltip Box -->
        <div id="devotionTooltip" class="devotion-floating-tooltip" style="display:none;"></div>

        <!-- Zoom Control Widget -->
        <div class="devotion-zoom-widget">
          <button id="btnDevZoomIn" class="d-zoom-btn">🔍 +</button>
          <button id="btnDevZoomReset" class="d-zoom-btn">1x</button>
          <button id="btnDevZoomOut" class="d-zoom-btn">🔍 -</button>
        </div>
      </div>

      <!-- Footer Active Procs & Stats Summary -->
      <div class="devotion-footer-bar">
        <div style="font-size:12px; color:#ffd700; font-weight:700;">
          ⚡ ${lang === 'vi' ? 'Tuyệt Kỹ Tinh Tú Đã Khai Mở:' : 'Active Celestial Procs:'}
        </div>
        <div class="active-procs-pill-list">
          ${renderActiveProcsList(lang)}
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  AudioEngine.playTone?.(520, 'triangle', 0.1, 0.1);

  setupDevotionEvents(modal);
}

function renderSvgLines() {
  let lines = '';
  for (const key in DEVOTION_TREE_NODES) {
    const node = DEVOTION_TREE_NODES[key];
    if (node.parentId && DEVOTION_TREE_NODES[node.parentId]) {
      const parent = DEVOTION_TREE_NODES[node.parentId];
      const isAllocated = player.devotionAllocated.includes(node.id) && player.devotionAllocated.includes(parent.id);
      const strokeColor = isAllocated ? node.color : '#334155';
      const strokeWidth = isAllocated ? '0.75' : '0.35';
      const strokeDash = isAllocated ? 'none' : '1.5, 1';
      const filterAttr = isAllocated ? 'filter="url(#glow)"' : '';

      lines += `<line x1="${parent.x}" y1="${parent.y}" x2="${node.x}" y2="${node.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" ${filterAttr} />`;
    }
  }
  return lines;
}

function renderDevotionNodes() {
  let html = '';
  const q = searchQuery.toLowerCase().trim();

  for (const key in DEVOTION_TREE_NODES) {
    const node = DEVOTION_TREE_NODES[key];
    const isAllocated = player.devotionAllocated.includes(node.id);
    const parentAllocated = !node.parentId || player.devotionAllocated.includes(node.parentId);
    const canAllocate = !isAllocated && parentAllocated && (player.devotionPoints - player.devotionAllocated.length > 0);

    const isMatch = !q || node.name.toLowerCase().includes(q) || node.desc.toLowerCase().includes(q) || node.constellation.toLowerCase().includes(q);
    const matchClass = isMatch ? 'search-match' : 'search-dim';

    let stateClass = isAllocated ? 'allocated' : canAllocate ? 'available' : 'locked';
    if (node.isRoot) stateClass += ' is-root';
    if (node.isProc) stateClass += ' is-proc';

    html += `
      <div class="devotion-star-node ${stateClass} ${matchClass}"
           id="node_${node.id}"
           data-id="${node.id}"
           style="left: ${node.x}%; top: ${node.y}%; --node-color: ${node.color};">
        <span class="node-icon">${node.icon}</span>
        ${node.isProc ? '<span class="proc-star-aura"></span>' : ''}
      </div>
    `;
  }
  return html;
}

function renderActiveProcsList(lang) {
  const activeProcs = player.devotionAllocated.map(id => DEVOTION_TREE_NODES[id]).filter(n => n && n.isProc);
  if (activeProcs.length === 0) {
    return `<span style="color:#64748b; font-size:11px;">${lang === 'vi' ? 'Chưa kích hoạt kỹ năng tinh tú nào. Hãy thắp sáng đỉnh các chòm sao!' : 'No celestial procs active. Reach constellation peaks!'}</span>`;
  }

  return activeProcs.map(p => `
    <span class="active-proc-tag" style="border-color:${p.color}; color:${p.color};">
      ${p.icon} ${p.name}
    </span>
  `).join('');
}

function setupDevotionEvents(modal) {
  document.getElementById('closeDevotionBtn').onclick = () => {
    modal.style.display = 'none';
    AudioEngine.playTone?.(330, 'triangle', 0.1, 0.08);
  };

  // Search input
  const searchInput = document.getElementById('devotionSearchInput');
  if (searchInput) {
    searchInput.oninput = (e) => {
      searchQuery = e.target.value;
      updateNodesDisplay();
    };
  }

  // Respec button
  const btnRespec = document.getElementById('btnRefundDevotion');
  if (btnRespec) {
    btnRespec.onclick = () => {
      const respecCostGold = player.devotionAllocated.length * 250;
      if (player.devotionAllocated.length <= 1) {
        return alert('No allocated stars to refund.');
      }
      if ((player.gold || 0) < respecCostGold) {
        return alert(`You need ${respecCostGold.toLocaleString()} Gold for Devotion Respec tax.`);
      }

      player.gold -= respecCostGold;
      player.devotionAllocated = ['nexus_root'];
      player.devotionProcs = [];
      AudioEngine.playTone?.(300, 'sawtooth', 0.3, 0.2);
      spawnDamageNumber?.(player.x, player.y - 45, `🔄 DEVOTION RESET (-${respecCostGold} Gold)!`, true, '#00f2fe');
      saveToDatabase(true);
      renderDevotionModal(true);
    };
  }

  // Zoom controls
  document.getElementById('btnDevZoomIn')?.addEventListener('click', () => {
    viewScale = Math.min(2.0, viewScale + 0.2);
    applyViewportTransform();
  });
  document.getElementById('btnDevZoomOut')?.addEventListener('click', () => {
    viewScale = Math.max(0.6, viewScale - 0.2);
    applyViewportTransform();
  });
  document.getElementById('btnDevZoomReset')?.addEventListener('click', () => {
    viewScale = 1.0;
    panOffsetX = 0;
    panOffsetY = 0;
    applyViewportTransform();
  });

  // Node clicks & tooltips
  const nodes = modal.querySelectorAll('.devotion-star-node');
  const tooltip = document.getElementById('devotionTooltip');

  nodes.forEach(nodeEl => {
    const id = nodeEl.getAttribute('data-id');
    const node = DEVOTION_TREE_NODES[id];

    nodeEl.onclick = () => {
      if (!Array.isArray(player.devotionAllocated)) player.devotionAllocated = ['nexus_root'];
      if (!Array.isArray(player.devotionProcs)) player.devotionProcs = [];

      const isAllocated = player.devotionAllocated.includes(node.id);
      const parentAllocated = !node.parentId || player.devotionAllocated.includes(node.parentId);

      if (isAllocated) {
        // Cannot unallocate root
        if (node.isRoot) return;
        // Check if any child depends on it
        const hasChildAllocated = Object.values(DEVOTION_TREE_NODES).some(
          n => n.parentId === node.id && player.devotionAllocated.includes(n.id)
        );
        if (hasChildAllocated) {
          AudioEngine.playTone?.(220, 'sawtooth', 0.1, 0.1);
          return alert('Cannot unallocate this star while connected stars are active.');
        }

        player.devotionAllocated = player.devotionAllocated.filter(x => x !== node.id);
        if (node.isProc) {
          player.devotionProcs = player.devotionProcs.filter(p => p !== node.val);
        }
        AudioEngine.playTone?.(350, 'sine', 0.1, 0.08);
      } else {
        if (!parentAllocated) {
          AudioEngine.playTone?.(220, 'sawtooth', 0.1, 0.1);
          return alert('You must allocate connecting precursor stars first.');
        }
        if ((player.devotionPoints || 8) - player.devotionAllocated.length <= 0) {
          AudioEngine.playTone?.(220, 'sawtooth', 0.1, 0.1);
          return alert('No available Devotion Points remaining.');
        }

        player.devotionAllocated.push(node.id);
        if (node.isProc) {
          player.devotionProcs.push(node.val);
        }
        AudioEngine.playTone?.(680, 'triangle', 0.25, 0.15);
      }

      player.allocatedDevotionNodes = [...player.devotionAllocated];
      saveToDatabase(true);
      renderDevotionModal(true);
    };

    nodeEl.onmouseenter = (e) => {
      const isAlloc = player.devotionAllocated.includes(node.id);
      tooltip.style.display = 'block';
      tooltip.innerHTML = `
        <div style="font-size:14px; font-weight:800; color:${node.color}; margin-bottom:2px;">${node.icon} ${node.name}</div>
        <div style="font-size:11px; color:#38bdf8; margin-bottom:6px;">✨ ${node.constellation}</div>
        <div style="font-size:12px; color:#f1f5f9; line-height:1.5;">${node.desc}</div>
        ${node.lore ? `<div style="font-style:italic; font-size:10px; color:#94a3b8; margin-top:6px; border-top:1px dashed #334155; padding-top:4px;">${node.lore}</div>` : ''}
        <div style="margin-top:8px; font-size:11px; font-weight:700; color:${isAlloc ? '#00e676' : '#ffd700'};">
          ${isAlloc ? '✓ ALREADY ALLOCATED' : 'CLICK TO ALLOCATE (1 Point)'}
        </div>
      `;
      positionTooltip(e, tooltip);
    };

    nodeEl.onmousemove = (e) => positionTooltip(e, tooltip);
    nodeEl.onmouseleave = () => { tooltip.style.display = 'none'; };
  });
}

function updateNodesDisplay() {
  const container = document.getElementById('devotionNodesLayer');
  if (container) container.innerHTML = renderDevotionNodes();
}

function applyViewportTransform() {
  const layer = document.getElementById('devotionNodesLayer');
  const svg = document.getElementById('devotionSvgLines');
  const transform = `translate(${panOffsetX}px, ${panOffsetY}px) scale(${viewScale})`;
  if (layer) layer.style.transform = transform;
  if (svg) svg.style.transform = transform;
}

function positionTooltip(e, tooltip) {
  const vp = document.getElementById('devotionViewport');
  if (!vp) return;
  const rect = vp.getBoundingClientRect();
  const x = e.clientX - rect.left + 15;
  const y = e.clientY - rect.top + 15;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

export async function fetchMasterDevotionFromServer() {
  try {
    const res = await fetch('/api/v1/data/devotion');
    if (!res.ok) return;
    const serverDevotion = await res.json();
    if (Array.isArray(serverDevotion) && serverDevotion.length > 0) {
      serverDevotion.forEach(sd => {
        if (DEVOTION_TREE_NODES[sd.id]) {
          DEVOTION_TREE_NODES[sd.id].name = sd.name || DEVOTION_TREE_NODES[sd.id].name;
          DEVOTION_TREE_NODES[sd.id].desc = sd.desc || DEVOTION_TREE_NODES[sd.id].desc;
        }
      });
    }
  } catch (e) {
    // Bundled fallback
  }
}

