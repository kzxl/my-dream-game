/**
 * MDG: Aethelis - Unified Compendium & Lore Codex Hub (Phím Y / L)
 * 4 Consolidated Master Sections:
 *   1. 📖 Bestiary & Monster Lore
 *   2. 💎 Material Lore & Harvesting Mastery (New!)
 *   3. 🌳 Monster Family Mastery Trees
 *   4. 📜 World Mythos, 9 Acts Chronicles & Great Factions
 */

import { player } from '../state.js';
import { MONSTERS, MONSTER_FAMILIES, getMonsterDiscoveryProfile } from '../data/monsters.js';
import { MATERIALS_CATALOG, getMaterialInfo, getMaterialInsightProfile } from '../data/materials.js';
import { LORE_CHAPTERS } from './codex-ui.js';
import { AudioEngine } from '../audio.js';
import { getLanguage, t } from '../i18n.js';

let activeCompendiumTab = 'bestiary'; // 'bestiary' | 'materials' | 'family_trees' | 'lore'
let selectedMonsterKey = 'goblin_scout';
let selectedMaterialKey = 'mat_silica_sand';
let selectedFamilyKey = 'Beast';
let selectedLoreChapter = 'mythos';
let monsterFilter = 'all';
let materialCategoryFilter = 'all'; // 'all' | 'Ore' | 'Vessel' | 'Refined' | 'Skinning' | 'Herb' | 'Catalyst'

export function setupCompendiumUI() {
  const modal = document.getElementById('bestiaryModal') || document.getElementById('compendiumModal');
  if (!modal) return;

  const btnClose = document.getElementById('closeBestiaryBtn') || document.getElementById('closeCompendiumBtn');
  if (btnClose) {
    btnClose.onclick = () => closeCompendiumUI();
  }

  // Bind Hotkeys Y and L
  window.addEventListener('keydown', (e) => {
    if ((e.code === 'KeyY' || e.code === 'KeyL') && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
      
      // If pressing L, auto switch to lore tab; if pressing Y, default to bestiary tab
      if (e.code === 'KeyL') {
        activeCompendiumTab = 'lore';
      }
      toggleCompendiumUI();
    }
  });
}

export function toggleCompendiumUI(targetTab = null) {
  const modal = document.getElementById('bestiaryModal') || document.getElementById('compendiumModal');
  if (!modal) return;

  if (targetTab) {
    activeCompendiumTab = targetTab;
  }

  if (modal.classList.contains('active') || modal.style.display === 'flex') {
    closeCompendiumUI();
  } else {
    openCompendiumUI();
  }
}

export function openCompendiumUI(tabName = null) {
  const modal = document.getElementById('bestiaryModal') || document.getElementById('compendiumModal');
  if (!modal) return;

  if (tabName) activeCompendiumTab = tabName;

  modal.classList.remove('hidden');
  modal.classList.add('active');
  modal.style.display = 'flex';
  AudioEngine.playTone?.(440, 'triangle', 0.1, 0.1);
  renderCompendiumContent();
}

export function closeCompendiumUI() {
  const modal = document.getElementById('bestiaryModal') || document.getElementById('compendiumModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('active');
  modal.style.display = 'none';
  AudioEngine.playTone?.(330, 'triangle', 0.1, 0.08);
}

export function renderCompendiumContent() {
  const container = document.getElementById('bestiaryContent') || document.getElementById('compendiumContent');
  if (!container) return;

  const lang = getLanguage() || 'vi';

  // Initialize state structures if missing
  if (!player.monsterKills) player.monsterKills = { goblin_scout: 120, direwolf: 45, skeleton_warrior: 620 };
  if (!player.materialMastery) player.materialMastery = { mat_silica_sand: 45, mat_iron_ore: 80, mat_blood_herb: 25, item_empty_vial: 20 };
  if (!player.allocatedFamilyTalents) player.allocatedFamilyTalents = {};
  if (!player.familyMasteryPoints) player.familyMasteryPoints = { Beast: 3, Undead: 2, Fiend: 1, Elemental: 1, Construct: 1 };

  // Top Nav Bar
  const navHtml = `
    <div class="compendium-top-nav">
      <button class="compendium-tab-btn ${activeCompendiumTab === 'bestiary' ? 'active' : ''}" data-tab="bestiary">
        📖 ${lang === 'vi' ? 'Quái Vật & Săn Bắt' : 'Monster Bestiary'}
      </button>
      <button class="compendium-tab-btn ${activeCompendiumTab === 'materials' ? 'active' : ''}" data-tab="materials">
        💎 ${lang === 'vi' ? 'Thông Thạo Nguyên Liệu' : 'Material Mastery'}
      </button>
      <button class="compendium-tab-btn ${activeCompendiumTab === 'family_trees' ? 'active' : ''}" data-tab="family_trees">
        🌳 ${lang === 'vi' ? 'Thiên Phú Dòng Quái' : 'Family Mastery'}
      </button>
      <button class="compendium-tab-btn ${activeCompendiumTab === 'lore' ? 'active' : ''}" data-tab="lore">
        📜 ${lang === 'vi' ? 'Bí Sử & Biên Niên' : 'World Mythos'}
      </button>
    </div>
  `;

  let bodyHtml = '';
  if (activeCompendiumTab === 'bestiary') {
    bodyHtml = renderBestiaryTab(lang);
  } else if (activeCompendiumTab === 'materials') {
    bodyHtml = renderMaterialsMasteryTab(lang);
  } else if (activeCompendiumTab === 'family_trees') {
    bodyHtml = renderFamilyTreesTab(lang);
  } else if (activeCompendiumTab === 'lore') {
    bodyHtml = renderLoreTab(lang);
  }

  container.innerHTML = `
    <div class="compendium-root-layout">
      ${navHtml}
      <div class="compendium-body-content">
        ${bodyHtml}
      </div>
    </div>
  `;

  // Bind Top Nav switching
  container.querySelectorAll('.compendium-tab-btn').forEach(btn => {
    btn.onclick = () => {
      activeCompendiumTab = btn.getAttribute('data-tab');
      AudioEngine.playTone?.(540, 'sine', 0.08, 0.05);
      renderCompendiumContent();
    };
  });

  // Bind Tab-specific handlers
  bindTabEvents(container, lang);
}

function renderBestiaryTab(lang) {
  const monsterEntries = Object.entries(MONSTERS);
  const filtered = monsterEntries.filter(([key, m]) => {
    if (monsterFilter === 'boss') return m.isBoss;
    if (monsterFilter.startsWith('act')) {
      const actNum = parseInt(monsterFilter.replace('act', ''), 10);
      return m.act === actNum;
    }
    if (monsterFilter in MONSTER_FAMILIES) {
      return m.family === monsterFilter;
    }
    return true;
  });

  const activeMonster = MONSTERS[selectedMonsterKey] || monsterEntries[0][1];
  const kills = player.monsterKills[selectedMonsterKey] || 0;
  const profile = getMonsterDiscoveryProfile(selectedMonsterKey, kills, activeMonster.isBoss);

  let listHtml = `<div class="compendium-grid-list">`;
  filtered.forEach(([key, m]) => {
    const kCount = player.monsterKills[key] || 0;
    const prof = getMonsterDiscoveryProfile(key, kCount, m.isBoss);
    const isSelected = key === selectedMonsterKey;
    listHtml += `
      <div class="compendium-entry-card ${isSelected ? 'selected' : ''}" data-key="${key}">
        <div class="card-icon-frame" style="background:${prof.auraColor}15; border-color:${prof.auraColor};">
          <span style="font-size:24px;">${m.icon || (m.isBoss ? '💀' : '👾')}</span>
        </div>
        <div class="card-info-wrap">
          <div class="card-title">${m.name} ${m.isBoss ? '<span class="boss-tag">BOSS</span>' : ''}</div>
          <div class="card-sub">${m.family} • ${lang === 'vi' ? 'Đã diệt:' : 'Kills:'} <b>${kCount}</b></div>
          <div class="card-tier-pill" style="color:${prof.auraColor};">${prof.title}</div>
        </div>
      </div>
    `;
  });
  listHtml += `</div>`;

  const detailHtml = `
    <div class="compendium-detail-pane">
      <div class="detail-header-banner" style="border-left: 4px solid ${profile.auraColor};">
        <div style="font-size: 32px;">${activeMonster.icon || '👾'}</div>
        <div>
          <h3 style="color:${profile.auraColor}; margin:0 0 4px 0;">${activeMonster.name}</h3>
          <div style="font-size:12px; color:#94a3b8;">${activeMonster.family} • Act ${activeMonster.act || 1} • ${profile.title}</div>
        </div>
      </div>

      <div class="detail-stats-box">
        <h4>📊 ${lang === 'vi' ? 'Tiến Trình Thấu Hiểu (Hunter Lore Mastery)' : 'Discovery Progress'}</h4>
        <div style="margin: 8px 0;">
          <div style="display:flex; justify-content:space-between; font-size:12px; color:#cbd5e1; margin-bottom:4px;">
            <span>${lang === 'vi' ? 'Số lần săn được:' : 'Total Slain:'} <b>${kills}</b></span>
            <span>${profile.nextKills ? `${kills} / ${profile.nextKills}` : 'MAX RANK'}</span>
          </div>
          <div class="compendium-progress-bar">
            <div class="progress-fill" style="width: ${profile.progressPct}%; background: ${profile.auraColor};"></div>
          </div>
        </div>
        <div class="lore-perk-box">
          <div style="font-size:12px; font-weight:700; color:#ffd700; margin-bottom:4px;">✨ ${lang === 'vi' ? 'Bổng Lộc Tác Chiến Vĩnh Viễn:' : 'Permanent Combat Bonus:'}</div>
          <div style="font-size:11px; color:#cbd5e1; line-height:1.5;">
            • ${lang === 'vi' ? 'Sát thương tăng thêm:' : 'Bonus Damage:'} <b>+${profile.bonusDmg}%</b><br>
            • ${lang === 'vi' ? 'Tỉ lệ Bạo kích:' : 'Crit Chance:'} <b>+${profile.bonusCrit}%</b> | ${lang === 'vi' ? 'Sát thương Bạo kích:' : 'Crit Multi:'} <b>+${profile.bonusCrit * 2}%</b><br>
            • ${lang === 'vi' ? 'Tỉ lệ Rơi Đồ (IIR/IIQ):' : 'Item Rarity/Quantity:'} <b>+${profile.bonusIir}% / +${profile.bonusIiq}%</b><br>
            • ${lang === 'vi' ? 'Giảm thương nhận vào:' : 'Damage Mitigation:'} <b>-${profile.dmgReduction}%</b>
          </div>
        </div>
      </div>

      <div class="detail-desc-box">
        <h4>📖 ${lang === 'vi' ? 'Hồ Sơ Đặc Tính & Điểm Yếu' : 'Species Lore & Weaknesses'}</h4>
        <p style="font-size:12px; color:#94a3b8; line-height:1.6;">${activeMonster.desc || 'A creature roaming the wild lands of Aethelis.'}</p>
        <div style="margin-top:10px; font-size:11px; color:#38bdf8;">
          💡 <b>${lang === 'vi' ? 'Mẹo Chiến Thuật:' : 'Combat Tip:'}</b> ${lang === 'vi' ? 'Khai thác điểm yếu kháng tính nguyên tố để kết liễu nhanh hơn.' : 'Exploit elemental weakness to defeat faster.'}
        </div>
      </div>
    </div>
  `;

  return `
    <div class="compendium-split-layout">
      <div class="compendium-list-pane">
        <div class="filter-pills-row">
          <button class="f-pill ${monsterFilter === 'all' ? 'active' : ''}" data-mfilter="all">${lang === 'vi' ? 'Tất cả' : 'All'}</button>
          <button class="f-pill ${monsterFilter === 'boss' ? 'active' : ''}" data-mfilter="boss">👑 Boss</button>
          <button class="f-pill ${monsterFilter === 'Beast' ? 'active' : ''}" data-mfilter="Beast">🐺 Beast</button>
          <button class="f-pill ${monsterFilter === 'Undead' ? 'active' : ''}" data-mfilter="Undead">💀 Undead</button>
          <button class="f-pill ${monsterFilter === 'Fiend' ? 'active' : ''}" data-mfilter="Fiend">😈 Fiend</button>
        </div>
        ${listHtml}
      </div>
      ${detailHtml}
    </div>
  `;
}

function renderMaterialsMasteryTab(lang) {
  const matEntries = Object.entries(MATERIALS_CATALOG);
  const filtered = matEntries.filter(([k, m]) => {
    if (materialCategoryFilter === 'all') return true;
    return m.category === materialCategoryFilter;
  });

  const activeMat = MATERIALS_CATALOG[selectedMaterialKey] || matEntries[0][1];
  const exp = player.materialMastery?.[selectedMaterialKey] || 0;
  const profile = getMaterialInsightProfile(selectedMaterialKey, exp);

  let listHtml = `<div class="compendium-grid-list">`;
  filtered.forEach(([key, m]) => {
    const mExp = player.materialMastery?.[key] || 0;
    const prof = getMaterialInsightProfile(key, mExp);
    const isSelected = key === selectedMaterialKey;
    listHtml += `
      <div class="compendium-entry-card ${isSelected ? 'selected' : ''}" data-matkey="${key}">
        <div class="card-icon-frame" style="background:${m.color}15; border-color:${m.color};">
          <span style="font-size:24px;">${m.icon || '📦'}</span>
        </div>
        <div class="card-info-wrap">
          <div class="card-title">${lang === 'vi' ? (m.nameVi || m.name) : m.name}</div>
          <div class="card-sub">${m.category} • ${lang === 'vi' ? 'Hiểu biết:' : 'Insight:'} <b>${mExp} EXP</b></div>
          <div class="card-tier-pill" style="color:${m.color || '#ffd700'};">Tier ${prof.tier}: ${prof.title[lang] || prof.title.vi}</div>
        </div>
      </div>
    `;
  });
  listHtml += `</div>`;

  const detailHtml = `
    <div class="compendium-detail-pane">
      <div class="detail-header-banner" style="border-left: 4px solid ${activeMat.color || '#ffd700'};">
        <div style="font-size: 32px;">${activeMat.icon || '📦'}</div>
        <div>
          <h3 style="color:${activeMat.color || '#ffd700'}; margin:0 0 4px 0;">${lang === 'vi' ? (activeMat.nameVi || activeMat.name) : activeMat.name}</h3>
          <div style="font-size:12px; color:#94a3b8;">${activeMat.category} • ${activeMat.rarity} • Tier ${profile.tier}</div>
        </div>
      </div>

      <div class="detail-stats-box">
        <h4>💎 ${lang === 'vi' ? 'Cấp Độ Thấu Hiểu Nguyên Liệu (Material Insight)' : 'Material Insight Progression'}</h4>
        <div style="margin: 8px 0;">
          <div style="display:flex; justify-content:space-between; font-size:12px; color:#cbd5e1; margin-bottom:4px;">
            <span>${lang === 'vi' ? 'Điểm Thông Thạo:' : 'Mastery EXP:'} <b>${exp} EXP</b></span>
            <span>${profile.nextExp ? `${exp} / ${profile.nextExp} EXP` : 'MAX TIER 5'}</span>
          </div>
          <div class="compendium-progress-bar">
            <div class="progress-fill" style="width: ${profile.progressPct}%; background: ${activeMat.color || '#ffd700'};"></div>
          </div>
        </div>
        <div class="lore-perk-box">
          <div style="font-size:12px; font-weight:700; color:#ffd700; margin-bottom:4px;">✨ ${lang === 'vi' ? 'Đặc Quyền Bậc Hiện Tại:' : 'Active Tier Perk:'}</div>
          <div style="font-size:12px; color:#4ade80; font-weight:600;">${profile.bonus[lang] || profile.bonus.vi}</div>
        </div>
      </div>

      <div class="detail-desc-box">
        <h4>📜 ${lang === 'vi' ? 'Đặc Tính & Nguồn Gốc Tự Nhiên' : 'Origin & Crafting Utility'}</h4>
        <p style="font-size:12px; color:#cbd5e1; line-height:1.6;">${activeMat.desc}</p>
        <div style="margin-top:12px; font-size:11px; color:#38bdf8;">
          💡 <b>${lang === 'vi' ? 'Cách Tích Lũy Điểm:' : 'How to Gain Insight:'}</b> ${lang === 'vi' ? 'Khai thác tại các nốt tài nguyên tự nhiên, lột da quái vật, hoặc nung nấu chế tác tại Genesis Forge & Alchemy Lab.' : 'Harvest from resource nodes, skin wild beasts, or craft at Genesis Forge.'}
        </div>
      </div>
    </div>
  `;

  return `
    <div class="compendium-split-layout">
      <div class="compendium-list-pane">
        <div class="filter-pills-row">
          <button class="f-pill ${materialCategoryFilter === 'all' ? 'active' : ''}" data-matfilter="all">${lang === 'vi' ? 'Tất cả' : 'All'}</button>
          <button class="f-pill ${materialCategoryFilter === 'Ore' ? 'active' : ''}" data-matfilter="Ore">⛏️ Ore</button>
          <button class="f-pill ${materialCategoryFilter === 'Vessel' ? 'active' : ''}" data-matfilter="Vessel">🧪 Vessel</button>
          <button class="f-pill ${materialCategoryFilter === 'Refined' ? 'active' : ''}" data-matfilter="Refined">🧱 Refined</button>
          <button class="f-pill ${materialCategoryFilter === 'Skinning' ? 'active' : ''}" data-matfilter="Skinning">🐺 Leather</button>
          <button class="f-pill ${materialCategoryFilter === 'Herb' ? 'active' : ''}" data-matfilter="Herb">🌿 Herb</button>
        </div>
        ${listHtml}
      </div>
      ${detailHtml}
    </div>
  `;
}

function renderFamilyTreesTab(lang) {
  const famList = Object.keys(MONSTER_FAMILIES);
  const fam = MONSTER_FAMILIES[selectedFamilyKey] || MONSTER_FAMILIES.Beast;
  const unspentPoints = player.familyMasteryPoints?.[selectedFamilyKey] || 0;
  const allocated = player.allocatedFamilyTalents?.[selectedFamilyKey] || [];

  let navHtml = `<div class="filter-pills-row" style="margin-bottom:14px;">`;
  famList.forEach(k => {
    const isSel = k === selectedFamilyKey;
    navHtml += `<button class="f-pill ${isSel ? 'active' : ''}" data-fam="${k}">${MONSTER_FAMILIES[k].icon} ${k}</button>`;
  });
  navHtml += `</div>`;

  let tiersHtml = `<div class="family-tiers-grid">`;
  fam.tiers.forEach((tData, idx) => {
    const isAlloc = allocated.includes(tData.id);
    tiersHtml += `
      <div class="family-tier-card ${isAlloc ? 'allocated' : ''}" data-talentid="${tData.id}">
        <div class="tier-badge">Tier ${idx + 1}</div>
        <div class="tier-name">${tData.name}</div>
        <div class="tier-desc">${tData.desc}</div>
        <button class="tier-allocate-btn ${isAlloc ? 'done' : (unspentPoints > 0 ? 'can-learn' : 'locked')}" data-talentid="${tData.id}">
          ${isAlloc ? '✓ ' + (lang === 'vi' ? 'Đã kích hoạt' : 'Active') : (unspentPoints > 0 ? (lang === 'vi' ? 'Học thiên phú' : 'Learn') : (lang === 'vi' ? 'Khóa' : 'Locked'))}
        </button>
      </div>
    `;
  });
  tiersHtml += `</div>`;

  return `
    <div class="family-mastery-container">
      ${navHtml}
      <div class="family-header-card">
        <h3>${fam.icon} ${fam.name}</h3>
        <p>${fam.desc}</p>
        <div class="points-badge">🌟 ${lang === 'vi' ? 'Điểm Thiên Phú Khả Dụng:' : 'Unspent Mastery Points:'} <b>${unspentPoints}</b></div>
      </div>
      ${tiersHtml}
    </div>
  `;
}

function renderLoreTab(lang) {
  const chapterKeys = Object.keys(LORE_CHAPTERS);
  let navHtml = `<div class="codex-tabs-nav" style="margin-bottom:14px;">`;
  chapterKeys.forEach(k => {
    const ch = LORE_CHAPTERS[k];
    const isSel = k === selectedLoreChapter;
    navHtml += `
      <button class="codex-tab-btn ${isSel ? 'active' : ''}" data-chapter="${k}">
        <span class="tab-icon">${ch.icon}</span>
        <span class="tab-title">${ch.title[lang] || ch.title.vi}</span>
      </button>
    `;
  });
  navHtml += `</div>`;

  const curChapter = LORE_CHAPTERS[selectedLoreChapter] || LORE_CHAPTERS.mythos;
  const contentHtml = `
    <div class="codex-body-pane">
      ${curChapter.content[lang] || curChapter.content.vi}
    </div>
  `;

  return `
    <div class="lore-mythos-container">
      ${navHtml}
      ${contentHtml}
    </div>
  `;
}

function bindTabEvents(container, lang) {
  // Monster selection
  container.querySelectorAll('.compendium-entry-card[data-key]').forEach(card => {
    card.onclick = () => {
      selectedMonsterKey = card.getAttribute('data-key');
      AudioEngine.playTone?.(600, 'sine', 0.06, 0.04);
      renderCompendiumContent();
    };
  });

  // Monster filters
  container.querySelectorAll('.f-pill[data-mfilter]').forEach(btn => {
    btn.onclick = () => {
      monsterFilter = btn.getAttribute('data-mfilter');
      AudioEngine.playTone?.(500, 'triangle', 0.06, 0.04);
      renderCompendiumContent();
    };
  });

  // Material selection
  container.querySelectorAll('.compendium-entry-card[data-matkey]').forEach(card => {
    card.onclick = () => {
      selectedMaterialKey = card.getAttribute('data-matkey');
      AudioEngine.playTone?.(600, 'sine', 0.06, 0.04);
      renderCompendiumContent();
    };
  });

  // Material filters
  container.querySelectorAll('.f-pill[data-matfilter]').forEach(btn => {
    btn.onclick = () => {
      materialCategoryFilter = btn.getAttribute('data-matfilter');
      AudioEngine.playTone?.(500, 'triangle', 0.06, 0.04);
      renderCompendiumContent();
    };
  });

  // Family selection
  container.querySelectorAll('.f-pill[data-fam]').forEach(btn => {
    btn.onclick = () => {
      selectedFamilyKey = btn.getAttribute('data-fam');
      AudioEngine.playTone?.(500, 'triangle', 0.06, 0.04);
      renderCompendiumContent();
    };
  });

  // Family talent learn
  container.querySelectorAll('.tier-allocate-btn.can-learn').forEach(btn => {
    btn.onclick = () => {
      const talentId = btn.getAttribute('data-talentid');
      if (!player.allocatedFamilyTalents[selectedFamilyKey]) player.allocatedFamilyTalents[selectedFamilyKey] = [];
      player.allocatedFamilyTalents[selectedFamilyKey].push(talentId);
      player.familyMasteryPoints[selectedFamilyKey] = Math.max(0, (player.familyMasteryPoints[selectedFamilyKey] || 1) - 1);
      AudioEngine.playLevelUp?.();
      renderCompendiumContent();
    };
  });

  // Lore chapter selection
  container.querySelectorAll('.codex-tab-btn[data-chapter]').forEach(btn => {
    btn.onclick = () => {
      selectedLoreChapter = btn.getAttribute('data-chapter');
      AudioEngine.playTone?.(600, 'sine', 0.06, 0.04);
      renderCompendiumContent();
    };
  });
}
