/**
 * Bestiary Codex UI - Monster Lore Mastery, Kill Tracking & Hunter Perks
 */

import { MONSTERS } from '../data/monsters.js';
import { getMonsterLoreBonus } from '../combat.js';
import { player } from '../state.js';
import { AudioEngine } from '../audio.js';

let selectedMonsterKey = 'goblin_scout';
let activeFilter = 'all'; // 'all', 'act1', 'act2', 'act3', 'act4', 'act5', 'boss'

export function setupBestiaryUI() {
  const modal = document.getElementById('bestiaryModal');
  if (!modal) return;

  const btnClose = document.getElementById('closeBestiaryBtn');
  if (btnClose) {
    btnClose.onclick = () => closeBestiaryUI();
  }

  // Keyboard shortcut [Y]
  window.addEventListener('keydown', (e) => {
    if (e.key === 'y' || e.key === 'Y') {
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
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
  AudioEngine.playTone(520, 'sine', 0.15, 0.1);
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

  if (!player.monsterKills) player.monsterKills = {};

  const monsterEntries = Object.entries(MONSTERS);
  const filtered = monsterEntries.filter(([key, m]) => {
    if (activeFilter === 'boss') return m.isBoss;
    if (activeFilter.startsWith('act')) {
      const actNum = parseInt(activeFilter.replace('act', ''), 10);
      return m.act === actNum;
    }
    return true;
  });

  const activeMonster = MONSTERS[selectedMonsterKey] || monsterEntries[0][1];
  const kills = player.monsterKills[selectedMonsterKey] || 0;
  const loreBonus = getMonsterLoreBonus(selectedMonsterKey, activeMonster.isBoss);

  const t1Threshold = activeMonster.isBoss ? 5 : 50;
  const t2Threshold = activeMonster.isBoss ? 20 : 250;
  const t3Threshold = activeMonster.isBoss ? 50 : 1000;
  const t4Threshold = activeMonster.isBoss ? 120 : 3000;

  let nextThreshold = t1Threshold;
  if (kills >= t4Threshold) nextThreshold = t4Threshold;
  else if (kills >= t3Threshold) nextThreshold = t4Threshold;
  else if (kills >= t2Threshold) nextThreshold = t3Threshold;
  else if (kills >= t1Threshold) nextThreshold = t2Threshold;

  const progressPercent = Math.min(100, Math.round((kills / nextThreshold) * 100));

  container.innerHTML = `
    <!-- Top Filter Tabs -->
    <div class="bestiary-filter-row">
      <button class="bf-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">📜 All Species</button>
      <button class="bf-btn ${activeFilter === 'act1' ? 'active' : ''}" data-filter="act1">Act I</button>
      <button class="bf-btn ${activeFilter === 'act2' ? 'active' : ''}" data-filter="act2">Act II</button>
      <button class="bf-btn ${activeFilter === 'act3' ? 'active' : ''}" data-filter="act3">Act III</button>
      <button class="bf-btn ${activeFilter === 'act4' ? 'active' : ''}" data-filter="act4">Act IV</button>
      <button class="bf-btn ${activeFilter === 'act5' ? 'active' : ''}" data-filter="act5">Act V</button>
      <button class="bf-btn bf-boss ${activeFilter === 'boss' ? 'active' : ''}" data-filter="boss">👑 Bosses Only</button>
    </div>

    <!-- Main Layout: Grid Left, Dossier Right -->
    <div class="bestiary-body-grid">
      <!-- Left: Monster Species Cards Grid -->
      <div class="bestiary-species-list">
        ${filtered.map(([key, m]) => {
          const mKills = player.monsterKills[key] || 0;
          const mBonus = getMonsterLoreBonus(key, m.isBoss);
          const isSelected = selectedMonsterKey === key;

          return `
            <div class="species-card ${isSelected ? 'is-selected' : ''} ${m.isBoss ? 'is-boss-card' : ''}" data-monster-key="${key}">
              <div class="sc-icon">${m.icon || '👾'}</div>
              <div class="sc-info">
                <div class="sc-name-row">
                  <span class="sc-name">${m.name}</span>
                  ${m.isBoss ? '<span class="sc-boss-tag">BOSS</span>' : ''}
                </div>
                <div class="sc-tier-row">
                  <span class="sc-tier-badge tier-${mBonus.tier}">${mBonus.name}</span>
                  <span class="sc-kills">⚔️ ${mKills.toLocaleString()} Kills</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Right: Detailed Hunter Dossier & Lore Tiers -->
      <div class="bestiary-dossier-card">
        <div class="bdc-header">
          <div class="bdc-icon-large">${activeMonster.icon || '👾'}</div>
          <div>
            <h3 class="bdc-title">${activeMonster.name}</h3>
            <span class="bdc-sub">Act ${activeMonster.act} • ${activeMonster.biome} Biome • ${activeMonster.element} Element</span>
          </div>
        </div>

        <!-- Kill Progress Bar -->
        <div class="bdc-progress-box">
          <div class="bpb-header">
            <span>Current Hunter Mastery: <b class="tier-text-${loreBonus.tier}">${loreBonus.name}</b></span>
            <span><b>${kills.toLocaleString()}</b> / ${nextThreshold.toLocaleString()} Kills</span>
          </div>
          <div class="bpb-bar-bg">
            <div class="bpb-bar-fill" style="width: ${progressPercent}%;"></div>
          </div>
        </div>

        <!-- Monster Intel Info -->
        <div class="bdc-intel-grid">
          <div class="intel-item">
            <span class="ii-label">🛡️ Primary Weakness</span>
            <span class="ii-val weakness-val">${activeMonster.weakness}</span>
          </div>
          <div class="intel-item">
            <span class="ii-label">⚔️ Base Threat</span>
            <span class="ii-val">${activeMonster.baseHp} Base HP</span>
          </div>
          <div class="intel-item ii-full">
            <span class="ii-label">🎁 Notable Drops</span>
            <span class="ii-val">${activeMonster.drops}</span>
          </div>
          <div class="intel-item ii-full">
            <span class="ii-label">📜 Hunter Lore Notes</span>
            <span class="ii-val-lore">"${activeMonster.desc}"</span>
          </div>
        </div>

        <!-- 4 Hunter Lore Mastery Tiers -->
        <h4 class="bdc-tiers-title">🎖️ HUNTER LORE MASTERY PERKS</h4>
        <div class="bdc-tier-milestones">
          <!-- Tier 1 -->
          <div class="tier-milestone ${loreBonus.tier >= 1 ? 'unlocked' : 'locked'}">
            <div class="tm-head">
              <span>🎖️ Tier 1: Novice Hunter (${t1Threshold} Kills)</span>
              <span>${loreBonus.tier >= 1 ? '✅ UNLOCKED' : '🔒 LOCKED'}</span>
            </div>
            <p class="tm-desc">• +5% Extra Damage dealt to this species</p>
          </div>

          <!-- Tier 2 -->
          <div class="tier-milestone ${loreBonus.tier >= 2 ? 'unlocked' : 'locked'}">
            <div class="tm-head">
              <span>🥈 Tier 2: Adept Slayer (${t2Threshold} Kills)</span>
              <span>${loreBonus.tier >= 2 ? '✅ UNLOCKED' : '🔒 LOCKED'}</span>
            </div>
            <p class="tm-desc">• +10% Extra Damage • +5% Critical Strike Chance • +10% Item Rarity (IIR)</p>
          </div>

          <!-- Tier 3 -->
          <div class="tier-milestone ${loreBonus.tier >= 3 ? 'unlocked' : 'locked'}">
            <div class="tm-head">
              <span>🥇 Tier 3: Master Inquisitor (${t3Threshold} Kills)</span>
              <span>${loreBonus.tier >= 3 ? '✅ UNLOCKED' : '🔒 LOCKED'}</span>
            </div>
            <p class="tm-desc">• +18% Extra Damage • +10% Crit Chance • +25% Crit Multi • +20% IIR / +10% IIQ</p>
          </div>

          <!-- Tier 4 -->
          <div class="tier-milestone ${loreBonus.tier >= 4 ? 'unlocked' : 'locked'}">
            <div class="tm-head">
              <span>👑 Tier 4: Apex Nemesis (${t4Threshold} Kills)</span>
              <span>${loreBonus.tier >= 4 ? '✅ UNLOCKED' : '🔒 LOCKED'}</span>
            </div>
            <p class="tm-desc">• +25% Extra Damage • +15% Crit Chance • +35% Crit Multi • -15% Damage Taken • +35% IIR / +20% IIQ</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach Event Listeners
  container.querySelectorAll('.bf-btn').forEach(btn => {
    btn.onclick = () => {
      activeFilter = btn.getAttribute('data-filter');
      AudioEngine.playTone(440, 'triangle', 0.08, 0.08);
      renderBestiaryContent();
    };
  });

  container.querySelectorAll('.species-card').forEach(card => {
    card.onclick = () => {
      selectedMonsterKey = card.getAttribute('data-monster-key');
      AudioEngine.playTone(550, 'sine', 0.1, 0.08);
      renderBestiaryContent();
    };
  });
}
