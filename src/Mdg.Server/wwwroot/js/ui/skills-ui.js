/**
 * Skill Gem Socket Board & Interactive Skill Mastery Tree UI (Last Epoch / PoE Hybrid)
 */

import { player } from '../state.js';
import { SKILLS, SKILL_MASTERY_TREES, skillSocketBoard, isNodeAllocated, allocateNode, respecSkillTree, getSpentMasteryPoints, getSkillExpMultiplier } from '../data/skills.js';
import { POSSIBLE_LOOT, RARITY_COLORS } from '../data/items.js';
import { AudioEngine } from '../audio.js';
import { spawnDamageNumber } from '../combat.js';
import { saveToDatabase } from '../save-system.js';

let selectedTreeSkillKey = 'fireball';

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
    const badge = document.getElementById(`lvl-badge-${k}`);
    if (badge) {
      const isSocketed = skillSocketBoard[k]?.activeGem;
      badge.innerText = isSocketed ? `Lv.${SKILLS[k].level}` : 'Empty';
      badge.style.background = isSocketed ? '#1abc9c' : '#4b5263';
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
      <small>Khảm ngọc chủ động và tối đa 2 ngọc hỗ trợ theo từng phím tắt</small>
    </div>
    <div class="socket-slots-grid" id="socket-board-grid"></div>
  `;

  const sbGrid = socketBoardSection.querySelector('#socket-board-grid');
  const hotbarKeys = [
    { key: 'LMB', skill: 'slash' },
    { key: 'Q', skill: 'fireball' },
    { key: 'W', skill: 'frost' },
    { key: 'E', skill: 'meteor' },
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
        <span class="slot-gem-lvl">Lv.${s.level}</span>
      </div>
      <div class="slot-gem-visual">
        <div class="active-gem-box ${activeGemItem ? 'has-gem' : 'empty-gem'}" title="Active Gem: ${activeGemItem ? activeGemItem.name : 'None'}">
          ${activeGemItem ? activeGemItem.icon : '💠'}
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

    slotCard.querySelector('.open-tree-btn').addEventListener('click', () => {
      selectedTreeSkillKey = hk.skill;
      renderSkillUpgradeModal();
    });

    sbGrid.appendChild(slotCard);
  });

  container.appendChild(socketBoardSection);

  // 2. BOTTOM SECTION: PER-SKILL MASTERY TREE GRAPH
  const currentTree = SKILL_MASTERY_TREES[selectedTreeSkillKey];
  const s = SKILLS[selectedTreeSkillKey];
  const totalSmp = s ? s.level : 1;
  const spentSmp = getSpentMasteryPoints(selectedTreeSkillKey);
  const remainingSmp = Math.max(0, totalSmp - spentSmp);

  const treeSection = document.createElement('div');
  treeSection.className = 'skill-tree-interactive-section';
  treeSection.innerHTML = `
    <div class="tree-header-bar">
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
