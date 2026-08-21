/**
 * Skill Gem Socket Board & Interactive Skill Mastery Tree UI (Last Epoch / PoE Hybrid)
 */

import { player } from '../state.js';
import { SKILLS, SKILL_MASTERY_TREES, skillSocketBoard, isNodeAllocated, allocateNode, respecSkillTree, getSpentMasteryPoints, getSkillExpMultiplier, isSkillUnlocked } from '../data/skills.js';
import { POSSIBLE_LOOT, RARITY_COLORS } from '../data/items.js';
import { AudioEngine } from '../audio.js';
import { spawnDamageNumber } from '../combat.js';
import { saveToDatabase } from '../save-system.js';
import { updateBackpackUI } from './inventory.js';

let selectedTreeSkillKey = 'slash';

export function addSkillExp(skillKey, amount) {
  const s = SKILLS[skillKey];
  if (!s || s.level >= s.maxLevel || !amount || amount <= 0) return;
  if (!s.expToNext || s.expToNext <= 0) s.expToNext = 120;

  const rate = getSkillExpMultiplier(skillKey, player);
  const gained = Math.round(amount * rate);

  s.exp = (s.exp || 0) + gained;
  let skillLeveled = false;
  let loops = 0;
  while (s.exp >= s.expToNext && s.level < s.maxLevel && loops < 50) {
    loops++;
    s.exp -= s.expToNext;
    s.level++;
    s.expToNext = Math.max(50, Math.round(s.expToNext * 1.35));
    skillLeveled = true;
    AudioEngine.playSkillLevelUp();
    spawnDamageNumber(player.x, player.y - 50, `${s.name} Lv.${s.level}! (+1 SMP)`, true, '#1abc9c');
  }

  if (skillLeveled) {
    updateSkillBadges();
    const modal = document.getElementById('skills-modal');
    if (modal && !modal.classList.contains('hidden')) {
      renderSkillUpgradeModal();
    }
  }
}

export function levelUpSkillWithPoint(skillKey) {
  if (player.skillPoints <= 0) return;
  const s = SKILLS[skillKey];
  if (!s || s.level >= s.maxLevel) return;
  player.skillPoints--;
  s.level++;
  s.exp = 0;
  s.expToNext = Math.round(s.expToNext * 1.35);
  AudioEngine.playSkillLevelUp();
  spawnDamageNumber(player.x, player.y - 50, `${s.name} Lv.${s.level}! (+1 SMP)`, true, '#ffd700');
  updateSkillBadges();
  renderSkillUpgradeModal();
  saveToDatabase(true);
}

export function updateSkillBadges() {
  for (let k in SKILLS) {
    const slotEl = document.getElementById(`slot-${k}`);
    const badge = document.getElementById(`lvl-badge-${k}`);
    const unlocked = isSkillUnlocked(k);

    if (slotEl) {
      if (unlocked) {
        slotEl.classList.remove('slot-locked');
        slotEl.title = `[${SKILLS[k].key}] ${SKILLS[k].name} (Lv.${SKILLS[k].level})`;
      } else {
        slotEl.classList.add('slot-locked');
        slotEl.title = `[${SKILLS[k].key}] ${SKILLS[k].name} (Locked - Socket Skill Gem to Activate)`;
      }
    }

    if (badge) {
      if (unlocked) {
        const lvl = SKILLS[k].level || 1;
        badge.innerText = `${lvl}`;
        badge.style.display = 'block';
      } else {
        badge.innerText = '🔒';
        badge.style.display = 'block';
      }
    }
  }
  const spEl = document.getElementById('sp-points-text');
  if (spEl) spEl.innerText = `${player.skillPoints} SP`;
}

export function renderSkillUpgradeModal() {
  const container = document.getElementById('skills-upgrade-container');
  if (!container) return;
  container.innerHTML = '';

  // 1. TOP SECTION: SKILL GEM SOCKET BOARD
  const socketBoardSection = document.createElement('div');
  socketBoardSection.className = 'socket-board-panel';
  socketBoardSection.innerHTML = `
    <div class="socket-board-title">
      <span>💎 ACTIVE SKILL GEMS & SUPPORT SOCKETS</span>
      <small>Socket Skill Gems from your backpack to unlock hotkey spells (Q, W, E)</small>
    </div>
    <div class="socket-slots-grid" id="socket-board-grid"></div>
  `;

  const sbGrid = socketBoardSection.querySelector('#socket-board-grid');
  const hotbarKeys = [
    { key: 'LMB', skill: 'slash' },
    { key: 'Q', skill: 'fireball', expectedGem: 'gem_fireball' },
    { key: 'W', skill: 'frost', expectedGem: 'gem_frost' },
    { key: 'E', skill: 'meteor', expectedGem: 'gem_meteor' },
    { key: 'SPACE', skill: 'dash' }
  ];

  hotbarKeys.forEach(hk => {
    const s = SKILLS[hk.skill];
    const sockData = skillSocketBoard[hk.skill] || { activeGem: null, supports: [] };
    const activeGemItem = POSSIBLE_LOOT.find(it => it.id === sockData.activeGem);
    const supportsItems = sockData.supports.map(sid => POSSIBLE_LOOT.find(it => it.id === sid)).filter(Boolean);

    const slotCard = document.createElement('div');
    slotCard.className = `socket-slot-card ${hk.skill === selectedTreeSkillKey ? 'selected-socket-card' : ''}`;
    slotCard.innerHTML = `
      <div class="slot-card-header">
        <span class="slot-key-badge">${hk.key}</span>
        <span class="slot-skill-name">${s.name}</span>
        <span class="slot-gem-lvl">${sockData.activeGem ? `Lv.${s.level}` : '<span style="color:#8892b0;">Locked</span>'}</span>
      </div>
      <div class="slot-gem-visual">
        <div class="active-gem-box ${activeGemItem ? 'has-gem' : 'empty-gem'}" id="gem-socket-${hk.skill}" style="cursor:pointer;" title="${activeGemItem ? `Socketed: ${activeGemItem.name} (Click to toggle/socket)` : 'Empty Socket (Click to socket from Bag)'}">
          ${activeGemItem ? activeGemItem.icon : (hk.skill === 'slash' || hk.skill === 'dash' ? '⚔️' : '🔒')}
        </div>
        <div class="support-links-row">
          <div class="support-gem-box ${supportsItems[0] ? 'has-support' : ''}" title="Support 1: ${supportsItems[0] ? supportsItems[0].name : 'Empty Slot'}">
            ${supportsItems[0] ? supportsItems[0].icon : '➕'}
          </div>
          <div class="support-gem-box ${supportsItems[1] ? 'has-support' : ''}" title="Support 2: ${supportsItems[1] ? supportsItems[1].name : 'Empty Slot'}">
            ${supportsItems[1] ? supportsItems[1].icon : '➕'}
          </div>
        </div>
      </div>
      <button class="open-tree-btn ${hk.skill === selectedTreeSkillKey ? 'active-tree-btn' : ''}">🌿 Open Tree</button>
    `;

    // Interactive Socketing: Click to socket gem if found in bag or toggle
    const gemBox = slotCard.querySelector(`#gem-socket-${hk.skill}`);
    if (gemBox && hk.expectedGem) {
      gemBox.addEventListener('click', () => {
        if (skillSocketBoard[hk.skill]?.activeGem) {
          // Unsocket -> Return Gem Item to Player Bag
          const curGemId = skillSocketBoard[hk.skill].activeGem;
          const gemTpl = POSSIBLE_LOOT.find(it => it.id === curGemId || it.gemId === curGemId) || {
            id: curGemId,
            gemId: curGemId,
            name: s.name + ' Skill Gem',
            baseType: 'Active Skill Gem',
            category: 'gem',
            rarity: 'SkillGem',
            color: '#1abc9c',
            icon: '💎',
            skillKey: hk.skill,
            description: `Socket to cast ${s.name}`
          };

          if (player.bag) {
            player.bag.push({
              ...gemTpl,
              id: 'gem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
            });
          }

          skillSocketBoard[hk.skill].activeGem = null;
          updateBackpackUI();
          AudioEngine.playPickup();
          spawnDamageNumber(player.x, player.y - 45, `Unsocketed ${s.name} Gem back to Bag`, false, '#a0a8b7');
        } else {
          // Socket -> Look for Gem in Player Bag
          const bagIndex = (player.bag || []).findIndex(it => it && (it.gemId === hk.expectedGem || it.id === hk.expectedGem || it.skillKey === hk.skill));

          if (bagIndex >= 0) {
            // Remove from bag and socket
            player.bag.splice(bagIndex, 1);
            skillSocketBoard[hk.skill] = { activeGem: hk.expectedGem, supports: [] };
            updateBackpackUI();
            AudioEngine.playLevelUp();
            spawnDamageNumber(player.x, player.y - 45, `💎 Socketed ${s.name} Gem from Bag!`, true, '#00f2fe');
          } else {
            // Not found in bag
            AudioEngine.playTone(180, 'sawtooth', 0.15, 0.1);
            spawnDamageNumber(player.x, player.y - 45, `⚠️ ${s.name} Gem not in Bag! Farm monsters!`, true, '#ff5722');
          }
        }
        updateSkillBadges();
        renderSkillUpgradeModal();
        saveToDatabase(true);
      });
    }

    slotCard.querySelector('.open-tree-btn').addEventListener('click', () => {
      selectedTreeSkillKey = hk.skill;
      renderSkillUpgradeModal();
    });

    sbGrid.appendChild(slotCard);
  });

  container.appendChild(socketBoardSection);

  // 2. BOTTOM SECTION: PER-SKILL MASTERY TREE GRAPH & AWAKENING CARD
  const currentTree = SKILL_MASTERY_TREES[selectedTreeSkillKey];
  const s = SKILLS[selectedTreeSkillKey];
  const totalSmp = s ? s.level : 1;
  const spentSmp = getSpentMasteryPoints(selectedTreeSkillKey);
  const remainingSmp = Math.max(0, totalSmp - spentSmp);

  if (!player.skillProficiencies) player.skillProficiencies = {};
  if (!player.skillProficiencies[selectedTreeSkillKey]) {
    player.skillProficiencies[selectedTreeSkillKey] = { exp: 0, rank: 'F', rankName: 'Novice Practitioner (F)', bonusDmg: 0 };
  }
  const prof = player.skillProficiencies[selectedTreeSkillKey];

  if (!player.awakenedSkills) player.awakenedSkills = {};
  const isAwakened = !!player.awakenedSkills[selectedTreeSkillKey];

  const awkDefs = {
    slash: { name: 'Void Dimension Cleave', icon: '🌌', essenceId: 'essence_blade', essenceName: 'Essence of the Blade Sovereign', desc: 'Rips open a dimensional vacuum rift on slash, pulling in enemies and dealing catastrophic chaos impact.' },
    fireball: { name: 'Supernova Celestial Orb', icon: '☀️', essenceId: 'essence_pyro', essenceName: 'Essence of the Solar Archon', desc: 'Hurls a celestial supernova that continuously radiates lethal plasma bolts before exploding in a 360° solar blast.' },
    frost: { name: 'Glacial Domain of Oblivion', icon: '❄️', essenceId: 'essence_frost', essenceName: 'Essence of Absolute Zero', desc: 'Expands a permafrost singularity freezing all monsters for 2.5s and granting +500 Energy Shield ward.' },
    meteor: { name: 'Starfall Cataclysm', icon: '☄️', essenceId: 'essence_meteor', essenceName: 'Essence of the Cosmic Void', desc: 'Summons 5 consecutive cosmic meteors raining down across the entire battlefield with apocalyptic area coverage.' },
    dash: { name: 'Flash Phantasm Mirage', icon: '⚡', essenceId: 'essence_dash', essenceName: 'Essence of the Phantom Mirage', desc: 'Phases forward leaving behind dual phantasm clones that execute instant critical slashes upon nearby foes.' }
  };
  const curAwkDef = awkDefs[selectedTreeSkillKey];

  const rankOrder = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SSS', 'Mythic'];
  const rankIndex = rankOrder.indexOf(prof.rank || 'F');
  const isRankAOrHigher = rankIndex >= rankOrder.indexOf('A');
  const hasEssence = (player.bag || []).some(it => it && (it.id === curAwkDef?.essenceId || it.skillKey === selectedTreeSkillKey && it.baseType === 'Awakening Catalyst'));

  const expReqs = { F: 500, E: 2000, D: 8000, C: 25000, B: 75000, A: 200000, S: 600000, SSS: 1800000, Mythic: 1800000 };
  const currentCap = expReqs[prof.rank || 'F'] || 1000;
  const profPercent = Math.min(100, Math.round((prof.exp / currentCap) * 100));

  const treeSection = document.createElement('div');
  treeSection.className = 'skill-tree-interactive-section';
  treeSection.innerHTML = `
    <!-- Proficiency & Awakening Header -->
    <div class="skill-prof-panel">
      <div class="skill-prof-header">
        <span style="font-weight:800; font-size:12px; color:#e5c07b;">⚡ SKILL PROFICIENCY MASTERY</span>
        <span class="skill-prof-rank-badge">[RANK ${prof.rank || 'F'}] ${prof.rankName || 'Novice'}</span>
      </div>
      <div class="skill-prof-bar-wrap">
        <div class="skill-prof-bar-fill" style="width: ${profPercent}%;"></div>
        <div class="skill-prof-bar-text">${prof.exp || 0} / ${currentCap} EXP (${profPercent}%)</div>
      </div>
      <div class="skill-prof-stats-row">
        <span>Damage: <b>+${prof.bonusDmg || 0}%</b></span>
        <span>Area: <b>+${prof.rank === 'Mythic' ? 70 : (prof.rank === 'SSS' ? 50 : (prof.rank === 'S' ? 35 : (prof.rank === 'A' ? 20 : (prof.rank === 'B' ? 10 : 0))))}%</b></span>
        <span>Crit: <b>+${prof.rank === 'Mythic' ? 25 : (prof.rank === 'SSS' ? 15 : (prof.rank === 'S' ? 8 : 0))}%</b></span>
        <span style="margin-left:auto; color:#ffd700;">Status: <b>${isAwakened ? '👑 AWAKENED' : (isRankAOrHigher ? '✨ Awakening Eligible' : '🔒 Requires Rank A')}</b></span>
      </div>
    </div>

    <!-- Skill Awakening Card -->
    <div class="skill-awakening-card ${isAwakened ? 'is-awakened' : ''}">
      <div class="awakening-title-row">
        <div class="awakening-name">
          <span>${curAwkDef.icon}</span>
          <span>${isAwakened ? `[AWAKENED] ${curAwkDef.name}` : `Awakened Form: ${curAwkDef.name}`}</span>
        </div>
        ${isAwakened ? '<span class="awakened-active-tag">👑 AWAKENED FORM ACTIVE</span>' : ''}
      </div>
      <div style="font-size:11px; color:#abb2bf; line-height:1.4;">${curAwkDef.desc}</div>
      ${!isAwakened ? `
        <div class="awakening-req-list">
          <div class="awakening-req-item ${isRankAOrHigher ? 'met' : 'unmet'}">
            <span>${isRankAOrHigher ? '✓' : '✗'}</span>
            <span>Reach Skill Proficiency <b>Rank A</b> (Current: Rank ${prof.rank || 'F'})</span>
          </div>
          <div class="awakening-req-item ${hasEssence ? 'met' : 'unmet'}">
            <span>${hasEssence ? '✓' : '✗'}</span>
            <span>Possess 1x <b>${curAwkDef.essenceName}</b> in inventory (Ultra-Rare drop from Elites & Bosses)</span>
          </div>
        </div>
        <div style="margin-top:6px;">
          ${(isRankAOrHigher && hasEssence) ? `
            <button class="btn-awaken-skill" id="btn-trigger-awakening">✨ AWAKEN SKILL NOW</button>
          ` : `
            <button class="btn-awaken-disabled" disabled>🔒 Requirements Not Met (Farm Bosses & Monsters)</button>
          `}
        </div>
      ` : ''}
    </div>

    <div class="tree-header-bar" style="margin-top:12px;">
      <div class="tree-title-group">
        <span class="tree-title-text">${currentTree.title}</span>
        <span class="tree-smp-badge">💎 Available SMP: <b class="gold-text">${remainingSmp} / ${totalSmp}</b></span>
      </div>
      <button id="btn-respec-tree" class="respec-btn">↺ Reset Points</button>
    </div>
    <div class="tree-graph-canvas-wrap" id="tree-canvas-wrap">
      <svg class="tree-links-svg" id="tree-svg-links"></svg>
      <div class="tree-nodes-container" id="tree-nodes-box"></div>
    </div>
  `;

  const awakenBtn = treeSection.querySelector('#btn-trigger-awakening');
  if (awakenBtn) {
    awakenBtn.addEventListener('click', () => {
      // Find essence in bag and consume
      const essenceIdx = (player.bag || []).findIndex(it => it && (it.id === curAwkDef?.essenceId || it.skillKey === selectedTreeSkillKey && it.baseType === 'Awakening Catalyst'));
      if (essenceIdx >= 0) {
        player.bag.splice(essenceIdx, 1);
        player.awakenedSkills[selectedTreeSkillKey] = true;
        updateBackpackUI();
        AudioEngine.playLevelUp();
        spawnDamageNumber(player.x, player.y - 70, `👑 SKILL AWAKENED: ${curAwkDef.name.toUpperCase()}!`, true, '#ffd700');
        renderSkillUpgradeModal();
        saveToDatabase(true);
      }
    });
  }

  treeSection.querySelector('#btn-respec-tree').addEventListener('click', () => {
    respecSkillTree(selectedTreeSkillKey);
    AudioEngine.playPickup();
    renderSkillUpgradeModal();
    saveToDatabase(true);
  });

  const nodesBox = treeSection.querySelector('#tree-nodes-box');
  const svgEl = treeSection.querySelector('#tree-svg-links');

  // Render Nodes
  currentTree.nodes.forEach(node => {
    const isAlloc = isNodeAllocated(selectedTreeSkillKey, node.id);
    let canAlloc = !isAlloc;
    if (node.req && node.req.length > 0) {
      canAlloc = canAlloc && node.req.some(r => isNodeAllocated(selectedTreeSkillKey, r));
    }
    canAlloc = canAlloc && (remainingSmp >= node.cost);

    const nodeEl = document.createElement('div');
    nodeEl.className = `tree-node-item node-${node.type} ${isAlloc ? 'node-allocated' : (canAlloc ? 'node-available' : 'node-locked')}`;
    nodeEl.style.left = `${node.x}px`;
    nodeEl.style.top = `${node.y}px`;

    const iconEmoji = node.type === 'keystone' ? '⭐' : (node.type === 'major' ? '✦' : '•');
    nodeEl.innerHTML = `
      <div class="node-glyph">${iconEmoji}</div>
      <div class="node-tooltip">
        <b>${node.name}</b>
        <span>${node.desc}</span>
        <small>Cost: ${node.cost} SMP | Status: ${isAlloc ? 'Allocated' : (canAlloc ? 'Click to Unlock' : 'Locked')}</small>
      </div>
    `;

    nodeEl.addEventListener('click', () => {
      if (allocateNode(selectedTreeSkillKey, node.id, player)) {
        AudioEngine.playSkillLevelUp();
        spawnDamageNumber(player.x, player.y - 45, `Unlocked: ${node.name}`, true, '#1abc9c');
        renderSkillUpgradeModal();
        saveToDatabase(true);
      }
    });

    nodesBox.appendChild(nodeEl);
  });

  // Render SVG connecting lines
  setTimeout(() => {
    let svgHtml = '';
    currentTree.nodes.forEach(node => {
      (node.req || []).forEach(reqId => {
        const parentNode = currentTree.nodes.find(n => n.id === reqId);
        if (parentNode) {
          const isLinkActive = isNodeAllocated(selectedTreeSkillKey, reqId) && isNodeAllocated(selectedTreeSkillKey, node.id);
          svgHtml += `
            <line x1="${parentNode.x + 22}" y1="${parentNode.y + 22}" x2="${node.x + 22}" y2="${node.y + 22}"
                  stroke="${isLinkActive ? '#1abc9c' : '#3e4451'}"
                  stroke-width="${isLinkActive ? '3' : '2'}"
                  stroke-dasharray="${isLinkActive ? 'none' : '4,4'}" />
          `;
        }
      });
    });
    svgEl.innerHTML = svgHtml;
  }, 10);

  container.appendChild(treeSection);
}
