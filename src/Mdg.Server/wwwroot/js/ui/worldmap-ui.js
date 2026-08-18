import { ZONES } from '../data/zones.js';
import { CAMPAIGN_ACTS } from '../data/campaign.js';
import { AudioEngine } from '../audio.js';
import { saveToDatabase } from '../save-system.js';
import { player } from '../state.js';

let selectedActIndex = 0;
let selectedZoneId = 'SanctuaryHaven';

export function renderWorldMapUI() {
  const container = document.getElementById('worldmap-overhaul-container');
  if (!container) return;

  const currentAct = CAMPAIGN_ACTS[selectedActIndex] || CAMPAIGN_ACTS[0];
  const actNumber = selectedActIndex + 1;

  // Filter all zones that belong to this Act
  const actZones = Object.values(ZONES).filter(z => z.act === actNumber);

  // Default selected zone in this act if not set
  if (!actZones.some(z => z.id === selectedZoneId)) {
    selectedZoneId = actZones.find(z => z.id === window.currentZoneId)?.id || actZones[0]?.id || 'SanctuaryHaven';
  }

  const activeZone = ZONES[selectedZoneId] || actZones[0] || ZONES['SanctuaryHaven'];
  const playerLvl = player.level || 1;
  const isCurrentZone = window.currentZoneId === activeZone.id;
  const isLocked = playerLvl < (activeZone.minLevel || 1);

  container.innerHTML = `
    <!-- Top Act Navigation Bar -->
    <div class="act-nav-tabs">
      ${CAMPAIGN_ACTS.map((act, idx) => {
        const isCurrentAct = act.zones && act.zones.some(z => z.id === window.currentZoneId);
        return `
          <button class="act-tab-btn ${idx === selectedActIndex ? 'active-act-tab' : ''}" data-act-idx="${idx}">
            <span class="act-num">${act.actNumber}</span>
            <span class="act-name">${act.name}</span>
            ${isCurrentAct ? '<span class="act-indicator-dot" title="You are in this Act"></span>' : ''}
          </button>
        `;
      }).join('')}
    </div>

    <!-- Main Atlas Layout Grid -->
    <div class="atlas-main-grid">
      
      <!-- Left: Interactive Continental Map with Leylines -->
      <div class="atlas-map-viewport">
        <div class="atlas-header-strip">
          <span class="atlas-realm-badge">CONTINENTAL ATLAS • ${currentAct.name.toUpperCase()}</span>
          <span class="atlas-level-badge">${currentAct.levelRange}</span>
        </div>

        <div class="atlas-canvas-container" id="atlas-canvas-board">
          <!-- Ambient Map Background Grid -->
          <div class="atlas-grid-overlay"></div>

          <!-- SVG Leylines connecting waypoints in this Act -->
          <svg class="atlas-leylines-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="leyline-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.8" />
                <stop offset="50%" stop-color="#ffd700" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#c678dd" stop-opacity="0.8" />
              </linearGradient>
              <filter id="glow-blur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            ${renderLeylineSvgPaths(actZones)}
          </svg>

          <!-- Interactive Waypoint Nodes -->
          <div class="atlas-nodes-layer">
            ${actZones.map((z, idx) => {
              const isHere = window.currentZoneId === z.id;
              const isSelected = selectedZoneId === z.id;
              const locked = playerLvl < (z.minLevel || 1);
              const xPos = z.coords ? z.coords.x : (20 + idx * 30);
              const yPos = z.coords ? z.coords.y : (30 + (idx % 2) * 35);

              return `
                <div class="waypoint-node ${isHere ? 'is-here' : ''} ${isSelected ? 'is-selected' : ''} ${locked ? 'is-locked' : 'is-unlocked'} ${z.isTown ? 'node-town-haven' : ''}"
                     style="left: ${xPos}%; top: ${yPos}%;"
                     data-zone-id="${z.id}"
                     title="${z.name} (${z.levelRange})">
                  
                  <div class="node-ring-pulse"></div>
                  <div class="node-icon-disc" style="border-color: ${z.themeColor || '#ffd700'};">
                    <span class="node-emoji">${locked ? '🔒' : (z.icon || '🌀')}</span>
                  </div>
                  
                  <div class="node-label-pill">
                    <span class="nlp-name">${z.name}</span>
                    <span class="nlp-lvl">${z.levelRange}</span>
                    ${z.isTown ? '<span class="nlp-town">🏰 TOWN</span>' : ''}
                    ${isHere ? '<span class="nlp-here">📍 HERE</span>' : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Quick Region Synopsis Footer -->
        <div class="atlas-map-footer">
          <span class="amf-lore">📜 <i>"${currentAct.subtitle || 'The continental frontier awaits your blade.'}"</i></span>
        </div>
      </div>

      <!-- Right: Detailed Region Intel Dossier & Fast Travel Actions -->
      <div class="atlas-dossier-panel">
        <div class="dossier-header" style="border-left: 4px solid ${activeZone.themeColor || '#ffd700'};">
          <div class="dh-title-row">
            <span class="dh-icon">${activeZone.icon || '🗺️'}</span>
            <div>
              <h3 class="dh-name">${activeZone.name}</h3>
              <span class="dh-sub">${activeZone.subtitle}</span>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
            ${activeZone.isTown ? '<span class="tag-town">🏰 SAFE-HAVEN</span>' : ''}
            <div class="dh-level-tag ${isLocked ? 'tag-locked' : 'tag-ready'}">
              ${isLocked ? `🔒 Required: Lv. ${activeZone.minLevel}` : `⚔️ Recommended: ${activeZone.levelRange}`}
            </div>
          </div>
        </div>

        <div class="dossier-body-scroll">
          <!-- Boss Dossier Card -->
          <div class="dossier-card">
            <div class="dc-label">👑 REGIONAL ARCH-RIVAL / BOSS</div>
            <div class="dc-value dc-boss">${activeZone.boss || 'Regional Monsters & Outlaws'}</div>
          </div>

          <!-- Tactical Resistances & Hazards -->
          <div class="dossier-card">
            <div class="dc-label">🛡️ RECOMMENDED DEFENSES</div>
            <div class="dc-value dc-res">${activeZone.recommendedRes || 'Standard Physical Armor'}</div>
          </div>

          <div class="dossier-card">
            <div class="dc-label">⚠️ ENVIRONMENTAL HAZARDS</div>
            <div class="hazards-tags-wrap">
              ${(activeZone.hazards || ['Standard Wilderness']).map(h => `
                <span class="hazard-badge">⚡ ${h}</span>
              `).join('')}
            </div>
          </div>

          <!-- Campaign Quest Trackers for this Act -->
          <div class="dossier-card">
            <div class="dc-label">📜 CHAPTER OBJECTIVES</div>
            <div class="quests-mini-list">
              ${(currentAct.quests || []).map((q, qIdx) => `
                <div class="q-mini-row">
                  <span class="q-mini-idx">#${qIdx + 1}</span>
                  <div class="q-mini-content">
                    <span class="q-mini-title">${q.title}</span>
                    <span class="q-mini-desc">${q.desc}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Fast Travel Button Action -->
        <div class="dossier-action-foot">
          ${isCurrentZone ? `
            <button class="btn-atlas-action btn-atlas-current" disabled>
              📍 ALREADY AT CURRENT WAYPOINT
            </button>
          ` : isLocked ? `
            <button class="btn-atlas-action btn-atlas-locked" disabled>
              🔒 LOCKED (Reach Lv. ${activeZone.minLevel} to Unlock)
            </button>
          ` : `
            <button class="btn-atlas-action btn-atlas-travel" id="btn-atlas-fast-travel" data-zone-id="${activeZone.id}">
              🌀 TELEPORT TO WAYPOINT (Fast Travel)
            </button>
          `}
        </div>
      </div>

    </div>
  `;

  // Attach Act Navigation Tab Listeners
  container.querySelectorAll('.act-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedActIndex = parseInt(btn.getAttribute('data-act-idx'), 10);
      AudioEngine.playPickup();
      renderWorldMapUI();
    });
  });

  // Attach Node Click Listeners
  container.querySelectorAll('.waypoint-node').forEach(node => {
    node.addEventListener('click', () => {
      selectedZoneId = node.getAttribute('data-zone-id');
      AudioEngine.playPickup();
      renderWorldMapUI();
    });
  });

  // Attach Fast Travel Action Listener
  document.getElementById('btn-atlas-fast-travel')?.addEventListener('click', () => {
    const targetZoneId = activeZone.id;
    AudioEngine.playPortal();
    document.getElementById('worldmap-modal')?.classList.add('hidden');
    if (window.loadZone) {
      window.loadZone(targetZoneId);
    }
    saveToDatabase(true);
    if (window.showZoneBanner) {
      window.showZoneBanner(activeZone.name, activeZone.subtitle || activeZone.levelRange);
    }
  });
}

function renderLeylineSvgPaths(zones) {
  if (zones.length < 2) return '';

  let paths = '';
  for (let i = 0; i < zones.length - 1; i++) {
    const z1 = zones[i];
    const z2 = zones[i + 1];
    const x1 = z1.coords ? z1.coords.x : (20 + i * 30);
    const y1 = z1.coords ? z1.coords.y : (30 + (i % 2) * 35);
    const x2 = z2.coords ? z2.coords.x : (20 + (i + 1) * 30);
    const y2 = z2.coords ? z2.coords.y : (30 + ((i + 1) % 2) * 35);

    // Quadratic curve control point for mystical curved leyline arc
    const cx = (x1 + x2) / 2;
    const cy = Math.min(y1, y2) - 10;

    paths += `
      <path d="M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}" 
            stroke="url(#leyline-glow)" 
            stroke-width="1.8" 
            stroke-dasharray="4 2" 
            fill="none" 
            filter="url(#glow-blur)" 
            class="leyline-pulse-path" />
    `;
  }
  return paths;
}
