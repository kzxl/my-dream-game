/**
 * MDG: Aethelis - Progressive Discovery Bestiary Codex & Branching Family Mastery Trees
 * 100% English UI, Absolute Fog of Discovery (No Spoilers), 3-Branch Talent Specialization & Respec
 */

import { player } from '../state.js';
import { MONSTERS, MONSTER_FAMILIES, getMonsterDiscoveryProfile } from '../data/monsters.js';
import { LORE_BRANCHES } from '../data/lore.js';
import { AudioEngine } from '../audio.js';
import { saveToDatabase } from '../save-system.js';

let activeMainTab = 'codex'; // 'codex' | 'family_trees' | 'lore'
let activeFilter = 'all'; // 'all', 'act1', 'act2', 'act3', 'act4', 'boss', 'Beast', 'Undead', 'Fiend', 'Elemental', 'Construct'
let selectedMonsterKey = 'goblin_scout';
let selectedFamilyKey = 'Beast';
let selectedLoreBranchId = 'branch_genesis';

export function setupBestiaryUI() {
  const modal = document.getElementById('bestiaryModal');
  if (!modal) return;

  const btnClose = document.getElementById('closeBestiaryBtn');
  if (btnClose) {
    btnClose.onclick = () => closeBestiaryUI();
  }

  // Hotkey Y
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'y' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
      toggleBestiaryUI();
    }
  });
}

export function toggleBestiaryUI() {
  const modal = document.getElementById('bestiaryModal');
  if (!modal) return;

  if (modal.classList.contains('active')) {
    closeBestiaryUI();
  } else {
    openBestiaryUI();
  }
}

export function openBestiaryUI() {
  const modal = document.getElementById('bestiaryModal');
  if (!modal) return;
  modal.classList.add('active');
  AudioEngine.playTone(440, 'triangle', 0.1, 0.1);
  renderBestiaryContent();
}

export function closeBestiaryUI() {
  const modal = document.getElementById('bestiaryModal');
  if (!modal) return;
  modal.classList.remove('active');
  AudioEngine.playTone(330, 'triangle', 0.1, 0.08);
}

export function renderBestiaryContent() {
  const container = document.getElementById('bestiaryContent');
  if (!container) return;

  // Initialize state structures if missing
  if (!player.monsterKills) player.monsterKills = { goblin_scout: 120, direwolf: 45, skeleton_warrior: 620 };
  if (!player.allocatedFamilyTalents) player.allocatedFamilyTalents = {};
  if (!player.familyMasteryPoints) player.familyMasteryPoints = { Beast: 3, Undead: 2, Fiend: 1, Elemental: 1, Construct: 1 };

  const monsterEntries = Object.entries(MONSTERS);
  const filtered = monsterEntries.filter(([key, m]) => {
    if (activeFilter === 'boss') return m.isBoss;
    if (activeFilter.startsWith('act')) {
      const actNum = parseInt(activeFilter.replace('act', ''), 10);
      return m.act === actNum;
    }
    if (activeFilter in MONSTER_FAMILIES) {
      return m.family === activeFilter;
    }
    return true;
  });

  const activeMonster = MONSTERS[selectedMonsterKey] || monsterEntries[0][1];
  const kills = player.monsterKills[selectedMonsterKey] || 0;
  const profile = getMonsterDiscoveryProfile(selectedMonsterKey, kills, activeMonster.isBoss);

  container.innerHTML = `
    <!-- Top Navigation Header -->
    <div class="bestiary-top-nav">
      <div class="bestiary-nav-tabs">
        <button class="bnt-tab ${activeMainTab === 'codex' ? 'active-tab' : ''}" id="tab-nav-codex">
          📖 MONSTER LORE CODEX
        </button>
        <button class="bnt-tab ${activeMainTab === 'family_trees' ? 'active-tab' : ''}" id="tab-nav-family">
          🌳 FAMILY MASTERY TREES
        </button>
        <button class="bnt-tab ${activeMainTab === 'lore' ? 'active-tab' : ''}" id="tab-nav-lore">
          📜 WORLD LORE & CHRONICLES
        </button>
      </div>
      <div class="total-mastery-badge">
        <span>👑 Apex Nemesis Mastered: <strong>${countApexMonsters()} / ${monsterEntries.length}</strong></span>
      </div>
    </div>

    ${activeMainTab === 'codex' ? renderCodexView(filtered, activeMonster, kills, profile) : (activeMainTab === 'family_trees' ? renderFamilyTreesView() : renderWorldLoreView())}
  `;

  attachBestiaryEvents(container);
}

function renderCodexView(filtered, activeMonster, kills, profile) {
  return `
    <!-- Filter Tabs Row -->
    <div class="bestiary-filter-row">
      <button class="bf-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">📜 All Species</button>
      <button class="bf-btn ${activeFilter === 'act1' ? 'active' : ''}" data-filter="act1">Act I</button>
      <button class="bf-btn ${activeFilter === 'act2' ? 'active' : ''}" data-filter="act2">Act II</button>
      <button class="bf-btn ${activeFilter === 'act3' ? 'active' : ''}" data-filter="act3">Act III</button>
      <button class="bf-btn ${activeFilter === 'act4' ? 'active' : ''}" data-filter="act4">Act IV</button>
      <button class="bf-btn ${activeFilter === 'Beast' ? 'active' : ''}" data-filter="Beast">🐺 Beasts</button>
      <button class="bf-btn ${activeFilter === 'Undead' ? 'active' : ''}" data-filter="Undead">💀 Undead</button>
      <button class="bf-btn ${activeFilter === 'Fiend' ? 'active' : ''}" data-filter="Fiend">🔥 Fiends</button>
      <button class="bf-btn ${activeFilter === 'Elemental' ? 'active' : ''}" data-filter="Elemental">⚡ Elementals</button>
      <button class="bf-btn bf-boss ${activeFilter === 'boss' ? 'active' : ''}" data-filter="boss">👑 Bosses Only</button>
    </div>

    <!-- Main Layout: Species List Left, Hunter Dossier Right -->
    <div class="bestiary-body-grid">
      <!-- Left: Monster Species Cards List -->
      <div class="bestiary-species-list">
        ${filtered.map(([key, m]) => {
          const mKills = player.monsterKills[key] || 0;
          const mProfile = getMonsterDiscoveryProfile(key, mKills, m.isBoss);
          const isSelected = selectedMonsterKey === key;
          const isFogged = mProfile.rank === 0;

          return `
            <div class="species-card ${isSelected ? 'is-selected' : ''} ${m.isBoss ? 'is-boss-card' : ''} ${isFogged ? 'is-fogged-card' : ''}" data-monster-key="${key}">
              <div class="sc-icon ${isFogged ? 'silhouette-icon' : ''}">${isFogged ? '❓' : (m.icon || '👾')}</div>
              <div class="sc-info">
                <div class="sc-name-row">
                  <span class="sc-name" style="color: ${isFogged ? '#7f848e' : '#fff'};">${isFogged ? '??? Uncharted Entity' : m.name}</span>
                  ${m.isBoss ? '<span class="sc-boss-tag">BOSS</span>' : ''}
                </div>
                <div class="sc-tier-row">
                  <span class="sc-tier-badge" style="border-color: ${mProfile.color}; color: ${mProfile.color};">
                    ${mProfile.title}
                  </span>
                  <span class="sc-kills">⚔️ ${mKills.toLocaleString()} Slain</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Right: Hunter Dossier (Absolute Fog of Discovery) -->
      <div class="bestiary-dossier-card">
        <div class="bdc-header">
          <div class="bdc-icon-large ${profile.rank === 0 ? 'silhouette-icon' : ''}">
            ${profile.rank === 0 ? '❓' : (activeMonster.icon || '👾')}
          </div>
          <div>
            <h3 class="bdc-title" style="color: ${profile.rank === 0 ? '#7f848e' : '#ffd700'};">
              ${profile.rank === 0 ? '??? Uncharted Entity' : activeMonster.name}
            </h3>
            <span class="bdc-sub">
              ${profile.rank === 0 
                ? `Act ${activeMonster.act} • [🔒 Discovery Fog - Slay specimens in combat to decipher]` 
                : `Act ${activeMonster.act} • ${activeMonster.biome} Biome • ${activeMonster.family || 'Beast'} Family`}
            </span>
          </div>
        </div>

        <!-- Hunter Discovery Status Bar -->
        <div class="bdc-progress-box">
          <div class="bpb-header">
            <span>Discovery Status: <strong style="color: ${profile.color};">${profile.title}</strong></span>
            <span><b>${kills.toLocaleString()}</b> Total Slain</span>
          </div>
          <p class="bpb-hint">
            ${profile.isMax 
              ? '👑 Apex Mastery complete! Full drop rate multiplier active & Family Mastery Point awarded.' 
              : '✨ Continue slaying specimens of this species in combat to decipher hidden anatomical weaknesses and signature relic drops.'}
          </p>
        </div>

        <!-- Progressively Deciphered Intel Grid (No Spoilers) -->
        <div class="bdc-intel-grid">
          ${profile.revealStats ? `
            <div class="intel-item">
              <span class="ii-label">⚔️ Threat Attributes</span>
              <span class="ii-val">${activeMonster.baseHp} Base HP • ${activeMonster.element} Damage</span>
            </div>
          ` : `
            <div class="intel-item locked-intel-item">
              <span class="ii-label">⚔️ Threat Attributes</span>
              <span class="ii-val locked-text">??? • Uncharted Intel</span>
            </div>
          `}

          ${profile.revealWeakness ? `
            <div class="intel-item">
              <span class="ii-label">🛡️ Primary Weakness</span>
              <span class="ii-val weakness-val">${activeMonster.weakness}</span>
            </div>
          ` : `
            <div class="intel-item locked-intel-item">
              <span class="ii-label">🛡️ Primary Weakness</span>
              <span class="ii-val locked-text">??? • Uncharted Intel</span>
            </div>
          `}

          ${profile.revealSkills ? `
            <div class="intel-item ii-full">
              <span class="ii-label">⚡ Combat Behaviors & Hazards</span>
              <span class="ii-val">${activeMonster.skills}</span>
            </div>
          ` : `
            <div class="intel-item ii-full locked-intel-item">
              <span class="ii-label">⚡ Combat Behaviors & Hazards</span>
              <span class="ii-val locked-text">??? • Uncharted Intel (Fight specimens to study combat patterns)</span>
            </div>
          `}

          ${profile.revealDrops ? `
            <div class="intel-item ii-full">
              <span class="ii-label">🎁 Discovered Item Drops</span>
              <span class="ii-val">${activeMonster.drops}</span>
            </div>
          ` : `
            <div class="intel-item ii-full locked-intel-item">
              <span class="ii-label">🎁 Discovered Item Drops</span>
              <span class="ii-val locked-text">??? • Uncharted Drops (Common base items only)</span>
            </div>
          `}

          <!-- Signature Monster Unique Artifact Box -->
          <div class="intel-item ii-full signature-drop-box ${profile.revealSignature ? 'sig-unlocked' : 'sig-locked'}">
            <div class="sig-header">
              <span class="sig-tag">✨ SIGNATURE MONSTER RELIC</span>
              <span class="sig-status">${profile.revealSignature ? '✅ ACTIVE IN DROP POOL' : '🔒 CONCEALED IN MYSTERY'}</span>
            </div>
            ${activeMonster.signatureDrop ? `
              <div class="sig-content">
                <span class="sig-icon">${profile.revealSignature ? activeMonster.signatureDrop.icon : '❓'}</span>
                <div>
                  <div class="sig-name" style="color: ${profile.revealSignature ? '#ff7700' : '#7f848e'};">
                    ${profile.revealSignature ? activeMonster.signatureDrop.name : '??? Hidden Signature Artifact'}
                  </div>
                  <div class="sig-desc">
                    ${profile.revealSignature 
                      ? activeMonster.signatureDrop.desc 
                      : 'Achieve advanced tactical mastery over this species to awaken this unique relic in the drop table.'}
                  </div>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Deep Lore Codex Notes -->
          ${profile.revealLore ? `
            <div class="intel-item ii-full">
              <span class="ii-label">📜 Hunter Lore Notes</span>
              <span class="ii-val-lore">"${activeMonster.desc}"</span>
            </div>
          ` : `
            <div class="intel-item ii-full locked-intel-item">
              <span class="ii-label">📜 Hunter Lore Notes</span>
              <span class="ii-val locked-text">??? • Ancient lore cipher locked</span>
            </div>
          `}
        </div>

        <!-- Active Combat Perks -->
        <div class="bdc-perks-footer">
          <div class="bpf-title">🎖️ ACTIVE HUNTER PERKS VS THIS SPECIES:</div>
          <div class="bpf-badges">
            <span class="bpf-badge ${profile.bonusDmg > 0 ? 'badge-on' : 'badge-off'}">⚔️ +${profile.bonusDmg}% Extra Damage</span>
            <span class="bpf-badge ${profile.bonusCrit > 0 ? 'badge-on' : 'badge-off'}">⚡ +${profile.bonusCrit}% Crit Chance</span>
            <span class="bpf-badge ${profile.bonusIir > 0 ? 'badge-on' : 'badge-off'}">🎁 +${profile.bonusIir}% Rare Drop Rarity</span>
            <span class="bpf-badge ${profile.dmgReduction > 0 ? 'badge-on' : 'badge-off'}">🛡️ -${profile.dmgReduction}% Damage Taken</span>
          </div>
        </div>

      </div>
    </div>
  `;
}

function renderFamilyTreesView() {
  const family = MONSTER_FAMILIES[selectedFamilyKey] || MONSTER_FAMILIES.Beast;
  const availablePoints = player.familyMasteryPoints[selectedFamilyKey] || 0;
  const allocated = player.allocatedFamilyTalents[selectedFamilyKey] || [];
  const isRootAllocated = allocated.includes(family.root.id);

  return `
    <div class="family-trees-layout">
      <!-- Left: 5 Monster Families Selector Sidebar -->
      <div class="family-selector-sidebar">
        <h4 class="fss-title">🐾 MONSTER FAMILIES</h4>
        ${Object.values(MONSTER_FAMILIES).map(f => {
          const isSelected = selectedFamilyKey === f.id;
          const points = player.familyMasteryPoints[f.id] || 0;
          return `
            <div class="family-tab-btn ${isSelected ? 'is-selected' : ''}" data-family-id="${f.id}" style="border-left-color: ${f.color};">
              <span class="ftb-icon">${f.icon}</span>
              <div class="ftb-info">
                <div class="ftb-name">${f.name}</div>
                <div class="ftb-points">🌟 ${points} Mastery Points</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Right: 3-Branch Family Talent Tree Viewport -->
      <div class="family-tree-viewport">
        
        <!-- Viewport Header Strip with Respec Button -->
        <div class="ftv-header" style="border-left: 4px solid ${family.color};">
          <div>
            <h3 class="ftv-title">${family.icon} ${family.name} Mastery Tree</h3>
            <p class="ftv-desc">${family.desc}</p>
          </div>
          <div class="ftv-actions-box">
            <div class="ftv-points-pill">
              <span>Points Available:</span>
              <strong style="color: ${family.color};">${availablePoints} FMP</strong>
            </div>
            <button class="btn-respec-family" id="btnRespecFamily" data-family-id="${family.id}">
              🔄 Respec Points
            </button>
          </div>
        </div>

        <!-- Root Foundation Node -->
        <div class="tree-root-container">
          <div class="branch-node-card root-node-card ${isRootAllocated ? 'node-allocated' : (availablePoints > 0 ? 'node-available' : 'node-locked')}">
            <div class="bnc-icon">${family.root.icon || '🎯'}</div>
            <div class="bnc-info">
              <div class="bnc-name">${family.root.name} (Foundation)</div>
              <div class="bnc-desc">${family.root.desc}</div>
            </div>
            <div class="bnc-action">
              ${isRootAllocated ? `
                <span class="badge-allocated">✅ ACTIVE</span>
              ` : `
                <button class="btn-alloc-node ${availablePoints > 0 ? 'btn-alloc-active' : 'btn-alloc-disabled'}" 
                        data-talent-id="${family.root.id}" 
                        data-family-id="${family.id}"
                        ${availablePoints > 0 ? '' : 'disabled'}>
                  Unlock Foundation (1 Point)
                </button>
              `}
            </div>
          </div>
        </div>

        <!-- 3 Branching Specializations (Harvest / Combat / Survival) -->
        <div class="tree-branches-grid">
          ${family.branches.map(branch => {
            return `
              <div class="tree-branch-column">
                <div class="tbc-header" style="color: ${branch.color}; border-color: ${branch.color};">
                  ${branch.title}
                </div>
                <div class="tbc-nodes-stack">
                  ${branch.nodes.map((node, nIdx) => {
                    const isAllocated = allocated.includes(node.id);
                    const prevNodeId = nIdx === 0 ? family.root.id : branch.nodes[nIdx - 1].id;
                    const prevAllocated = allocated.includes(prevNodeId);
                    const canAllocate = !isAllocated && prevAllocated && availablePoints >= 1;

                    return `
                      <div class="branch-node-card ${isAllocated ? 'node-allocated' : ''} ${canAllocate ? 'node-available' : ''} ${!isAllocated && !prevAllocated ? 'node-locked' : ''} ${node.isKeystone ? 'bnc-keystone' : ''}">
                        <div class="bnc-icon" style="border-color: ${isAllocated ? branch.color : '#3d4452'};">${node.icon}</div>
                        <div class="bnc-info">
                          <div class="bnc-name" style="color:${isAllocated ? branch.color : (node.isKeystone ? '#ffd700' : '#fff')};">
                            ${node.name}
                          </div>
                          <div class="bnc-desc">${node.desc}</div>
                        </div>
                        <div class="bnc-action">
                          ${isAllocated ? `
                            <span class="badge-allocated">✅ ACTIVE</span>
                          ` : `
                            <button class="btn-alloc-node ${canAllocate ? 'btn-alloc-active' : 'btn-alloc-disabled'}"
                                    data-talent-id="${node.id}"
                                    data-family-id="${family.id}"
                                    ${canAllocate ? '' : 'disabled'}>
                              ${prevAllocated ? 'Learn (1 Point)' : '🔒 Locked'}
                            </button>
                          `}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Footer Hint -->
        <div class="family-tree-footer-hint">
          💡 Earn Family Mastery Points (FMP) by defeating monster species up to <strong>👑 Apex Nemesis</strong> status. Specialize your builds across Harvest, Lethality, or Survival paths!
        </div>

      </div>
    </div>
  `;
}

function renderWorldLoreView() {
  const activeBranch = LORE_BRANCHES.find(b => b.id === selectedLoreBranchId) || LORE_BRANCHES[0];

  return `
    <div class="lore-body-grid">
      <!-- Left: 5 Lore Branches Selector -->
      <div class="lore-branches-list">
        <h3 class="lore-col-title">📜 FIVE ANCIENT CHRONICLES</h3>
        <div class="lore-branch-cards">
          ${LORE_BRANCHES.map(b => {
            const isSelected = (selectedLoreBranchId === b.id);
            return `
              <div class="lore-branch-card ${isSelected ? 'is-active-branch' : ''}" data-branch-id="${b.id}">
                <div class="lbc-icon" style="color:${b.color};">${b.icon}</div>
                <div class="lbc-info">
                  <div class="lbc-title" style="color:${isSelected ? '#ffd700' : '#f1f5f9'};">${b.name}</div>
                  <div class="lbc-sub">${b.vietnameseName}</div>
                  <div class="lbc-chap-count">${b.chapters.length} Ancient Chapters</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Right: Detailed Chapter Lore Dossier -->
      <div class="lore-reading-pane">
        <div class="lore-branch-header">
          <div class="lbh-icon" style="color:${activeBranch.color}; font-size:32px;">${activeBranch.icon}</div>
          <div style="flex: 1;">
            <h2 class="lbh-title" style="color:${activeBranch.color}; margin:0; font-size:18px;">${activeBranch.name.toUpperCase()}</h2>
            <div class="lbh-vn" style="color:#ffd700; font-size:12px; margin-top:2px; font-weight:700;">${activeBranch.vietnameseName}</div>
            <p class="lbh-summary" style="color:#94a3b8; font-size:11px; margin-top:6px; line-height:1.4;">${activeBranch.summary}</p>
          </div>
        </div>

        <div class="lore-chapters-stack">
          ${activeBranch.chapters.map((chap, idx) => `
            <div class="lore-chapter-card">
              <div class="lcc-header">
                <div class="lcc-num">CHAPTER 0${idx + 1}</div>
                <div class="lcc-era">⏳ ${chap.era}</div>
              </div>
              <h3 class="lcc-title">${chap.title}</h3>
              <blockquote class="lcc-excerpt">"${chap.excerpt}"</blockquote>
              <div class="lcc-content">${chap.content.replace(/\n/g, '<br/>')}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function countApexMonsters() {
  let count = 0;
  if (!player.monsterKills) return 0;
  Object.entries(MONSTERS).forEach(([key, m]) => {
    const kills = player.monsterKills[key] || 0;
    const req = m.isBoss ? 250 : 5000;
    if (kills >= req) count++;
  });
  return count;
}

function attachBestiaryEvents(container) {
  // Main Navigation Tabs
  container.querySelector('#tab-nav-codex')?.addEventListener('click', () => {
    activeMainTab = 'codex';
    AudioEngine.playPickup();
    renderBestiaryContent();
  });

  container.querySelector('#tab-nav-family')?.addEventListener('click', () => {
    activeMainTab = 'family_trees';
    AudioEngine.playPickup();
    renderBestiaryContent();
  });

  container.querySelector('#tab-nav-lore')?.addEventListener('click', () => {
    activeMainTab = 'lore';
    AudioEngine.playPickup();
    renderBestiaryContent();
  });

  // Lore Branch Card selection
  container.querySelectorAll('.lore-branch-card').forEach(card => {
    card.onclick = () => {
      selectedLoreBranchId = card.getAttribute('data-branch-id');
      AudioEngine.playPickup();
      renderBestiaryContent();
    };
  });

  // Filter buttons in Codex
  container.querySelectorAll('.bf-btn').forEach(btn => {
    btn.onclick = () => {
      activeFilter = btn.getAttribute('data-filter');
      AudioEngine.playPickup();
      renderBestiaryContent();
    };
  });

  // Species Cards click
  container.querySelectorAll('.species-card').forEach(card => {
    card.onclick = () => {
      selectedMonsterKey = card.getAttribute('data-monster-key');
      AudioEngine.playPickup();
      renderBestiaryContent();
    };
  });

  // Family tab selector in Trees view
  container.querySelectorAll('.family-tab-btn').forEach(btn => {
    btn.onclick = () => {
      selectedFamilyKey = btn.getAttribute('data-family-id');
      AudioEngine.playPickup();
      renderBestiaryContent();
    };
  });

  // Talent Node Allocation
  container.querySelectorAll('.btn-alloc-node').forEach(btn => {
    btn.onclick = () => {
      const talentId = btn.getAttribute('data-talent-id');
      const familyId = btn.getAttribute('data-family-id');

      if ((player.familyMasteryPoints[familyId] || 0) <= 0) return;

      if (!player.allocatedFamilyTalents[familyId]) {
        player.allocatedFamilyTalents[familyId] = [];
      }

      player.allocatedFamilyTalents[familyId].push(talentId);
      player.familyMasteryPoints[familyId]--;

      AudioEngine.playTone(880, 'sine', 0.25, 0.2);
      saveToDatabase(true);
      renderBestiaryContent();
    };
  });

  // Respec Talents Button
  container.querySelector('#btnRespecFamily')?.addEventListener('click', () => {
    const familyId = selectedFamilyKey;
    const allocated = player.allocatedFamilyTalents[familyId] || [];
    if (allocated.length === 0) return;

    if (confirm(`Refund all allocated talent points for ${familyId} Family?`)) {
      player.familyMasteryPoints[familyId] = (player.familyMasteryPoints[familyId] || 0) + allocated.length;
      player.allocatedFamilyTalents[familyId] = [];
      AudioEngine.playTone(330, 'square', 0.2, 0.15);
      saveToDatabase(true);
      renderBestiaryContent();
    }
  });
}
