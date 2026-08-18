/**
 * Skill Tree Modal & SP Allocation UI
 */

import { player } from '../state.js';
import { SKILLS, getSkillExpMultiplier } from '../data/skills.js';
import { AudioEngine } from '../audio.js';
import { spawnDamageNumber } from '../combat.js';

export function addSkillExp(skillKey, amount) {
  const s = SKILLS[skillKey];
  if (!s || s.level >= s.maxLevel) return;

  const rate = getSkillExpMultiplier(skillKey, player);
  const gained = Math.round(amount * rate);

  s.exp += gained;
  while (s.exp >= s.expToNext && s.level < s.maxLevel) {
    s.exp -= s.expToNext;
    s.level++;
    s.expToNext = Math.round(s.expToNext * 1.35);
    AudioEngine.playSkillLevelUp();
    spawnDamageNumber(player.x, player.y - 50, `${s.name} Lv.${s.level}!`, true, '#61afef');
    updateSkillBadges();
    renderSkillUpgradeModal();
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
  spawnDamageNumber(player.x, player.y - 50, `${s.name} Lv.${s.level}!`, true, '#ffd700');
  updateSkillBadges();
  renderSkillUpgradeModal();
}

export function updateSkillBadges() {
  for (let k in SKILLS) {
    const badge = document.getElementById(`lvl-badge-${k}`);
    if (badge) badge.innerText = `Lv.${SKILLS[k].level}`;
  }
  const spEl = document.getElementById('sp-points-text');
  if (spEl) spEl.innerText = `${player.skillPoints} SP`;
}

export function renderSkillUpgradeModal() {
  const container = document.getElementById('skills-upgrade-container');
  if (!container) return;
  container.innerHTML = '';

  for (let k in SKILLS) {
    const s = SKILLS[k];
    const card = document.createElement('div');
    card.className = 'skill-upgrade-card';

    const curDmg = s.baseDmg ? Math.round(s.baseDmg + (s.level - 1) * s.dmgPerLvl) : 0;
    const nextDmg = s.baseDmg ? Math.round(s.baseDmg + s.level * s.dmgPerLvl) : 0;
    const curCd = Math.max(0.2, (s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl)).toFixed(2);
    const expPct = Math.min(100, (s.exp / s.expToNext) * 100);
    const expRate = getSkillExpMultiplier(k, player);

    let statLine = k === 'dash'
      ? `Distance: <b>${Math.round(s.baseDistance + (s.level - 1) * s.distancePerLvl)}px</b> | CD: <b>${curCd}s</b>`
      : `Damage: <b>${curDmg}</b> (Next: <b style="color:#ffd700;">${nextDmg}</b>) | CD: <b>${curCd}s</b>`;

    const tagsHtml = (s.tags || []).map(t => `<span class="tag-badge tag-${t}">${t}</span>`).join('');

    card.innerHTML = `
      <div class="suc-icon">${s.icon}</div>
      <div class="suc-info">
        <div class="suc-name-row">
          <span class="suc-name">${s.name} [${s.key}]</span>
          <span class="suc-level">Level ${s.level} / ${s.maxLevel}</span>
        </div>
        <div class="skill-tags-row">
          ${tagsHtml}
          <span class="exp-rate-tag" title="EXP Rate calculated from Class Affinity and Gear">⚡ ${expRate.toFixed(1)}x EXP Speed</span>
        </div>
        <div class="suc-desc">${s.desc}</div>
        <div class="suc-exp-bar-wrap" title="Skill EXP: ${s.exp} / ${s.expToNext}">
          <div class="suc-exp-fill" style="width: ${expPct}%;"></div>
        </div>
        <div class="suc-stats">${statLine}</div>
      </div>
      <button class="suc-btn" ${player.skillPoints <= 0 || s.level >= s.maxLevel ? 'disabled' : ''} data-skill="${k}">
        ${s.level >= s.maxLevel ? 'MAX' : '➕ Upgrade (+1 SP)'}
      </button>
    `;

    card.querySelector('.suc-btn').addEventListener('click', () => levelUpSkillWithPoint(k));
    container.appendChild(card);
  }
}
