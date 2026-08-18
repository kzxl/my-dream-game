/**
 * SQLite Save & Auto-Sync System (With Skill Gems & Mastery Trees)
 */

import { player } from './state.js';
import { SKILLS, skillSocketBoard, allocatedMasteryNodes } from './data/skills.js';
import { updateBackpackUI, updatePaperdollUI } from './ui/inventory.js';
import { updateSkillBadges, renderSkillUpgradeModal } from './ui/skills-ui.js';
import { spawnDamageNumber } from './combat.js';

let isSaving = false;

export async function saveToDatabase(silent = false) {
  if (isSaving) return;
  isSaving = true;

  const skillsPayload = {};
  for (let k in SKILLS) {
    skillsPayload[k] = {
      level: SKILLS[k].level,
      exp: SKILLS[k].exp,
      expToNext: SKILLS[k].expToNext,
      socketBoard: skillSocketBoard[k] || { activeGem: null, supports: [] },
      allocatedNodes: Array.from(allocatedMasteryNodes[k] || [])
    };
  }

  const payload = {
    characterId: 'hero_default',
    name: document.getElementById('hud-name')?.innerText || 'Novice Adventurer',
    gender: player.gender,
    classSpec: player.classSpec,
    level: player.level,
    currentExp: player.currentExp,
    expToNext: player.expToNext,
    skillPoints: player.skillPoints,
    life: player.life,
    maxLife: player.maxLife,
    mana: player.mana,
    maxMana: player.maxMana,
    es: player.es,
    maxEs: player.maxEs,
    zoneId: window.currentZoneId || 'SanctuaryHaven',
    positionX: player.x,
    positionY: player.y,
    skills: skillsPayload,
    equippedGear: player.equipped,
    backpackItems: player.bag
  };

  try {
    localStorage.setItem('mdg_savegame_backup', JSON.stringify(payload));
  } catch (e) {}

  try {
    const res = await fetch('/api/v1/savegame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok && !silent) {
      spawnDamageNumber(player.x, player.y - 45, '💾 Progress Saved', true, '#98c379');
    }
  } catch (err) {
    console.warn('SQLite auto-save network fallback:', err);
  } finally {
    isSaving = false;
  }
}

export async function loadFromDatabase() {
  try {
    const res = await fetch('/api/v1/savegame?characterId=hero_default');
    if (!res.ok) return false;

    const data = await res.json();
    if (!data || !data.characterId) return false;

    player.gender = data.gender || 'Male';
    player.classSpec = data.classSpec || 'Novice';
    player.level = data.level || 1;
    player.currentExp = data.currentExp || 0;
    player.expToNext = data.expToNext || 100;
    player.skillPoints = data.skillPoints !== undefined ? data.skillPoints : 3;

    player.maxLife = data.maxLife || 250;
    player.life = data.life || player.maxLife;
    player.maxMana = data.maxMana || 120;
    player.mana = data.mana || player.maxMana;
    player.maxEs = data.maxEs || 100;
    player.es = data.es || player.maxEs;

    player.x = data.positionX || 2000;
    player.y = data.positionY || 2000;

    if (data.skills) {
      for (let k in data.skills) {
        if (SKILLS[k]) {
          SKILLS[k].level = data.skills[k].level || 1;
          SKILLS[k].exp = data.skills[k].exp || 0;
          SKILLS[k].expToNext = data.skills[k].expToNext || 120;
        }
        if (data.skills[k].socketBoard) {
          skillSocketBoard[k] = data.skills[k].socketBoard;
        }
        if (data.skills[k].allocatedNodes) {
          allocatedMasteryNodes[k] = new Set(data.skills[k].allocatedNodes);
        }
      }
    }

    if (data.equippedGear) player.equipped = data.equippedGear;
    if (data.backpackItems) player.bag = data.backpackItems;

    updateBackpackUI();
    updatePaperdollUI();
    updateSkillBadges();
    renderSkillUpgradeModal();

    const hudLevel = document.getElementById('hud-level');
    if (hudLevel) hudLevel.innerText = `Lv.${player.level}`;

    return true;
  } catch (err) {
    console.warn('Could not load from SQLite API, using default/local state:', err);
    return false;
  }
}

export function startAutoSave(intervalMs = 10000) {
  setInterval(() => {
    saveToDatabase(true);
  }, intervalMs);
}
