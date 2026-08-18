/**
 * Multi-Character Save & Auto-Sync System (With Character Roster Management)
 */

import { player } from './state.js';
import { SKILLS, skillSocketBoard, allocatedMasteryNodes } from './data/skills.js';
import { updateBackpackUI, updatePaperdollUI } from './ui/inventory.js';
import { updateSkillBadges, renderSkillUpgradeModal } from './ui/skills-ui.js';
import { updateAttributesModal, updateHudAvatar, updateExpBar } from './ui/hud.js';
import { spawnDamageNumber } from './combat.js';

export let activeCharacterId = localStorage.getItem('mdg_active_char_id') || 'hero_default';
let isSaving = false;

export function setActiveCharacterId(id) {
  activeCharacterId = id;
  localStorage.setItem('mdg_active_char_id', id);
}

export async function fetchCharacterList() {
  try {
    const res = await fetch('/api/v1/characters');
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Error fetching character list:', e);
  }
  return [];
}

export async function createNewCharacter(name, gender, classSpec) {
  const newId = 'hero_' + Math.random().toString(36).substring(2, 9);
  try {
    const res = await fetch('/api/v1/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newId, name, gender, classSpec })
    });
    if (res.ok) {
      await switchToCharacter(newId);
      return true;
    }
  } catch (e) {
    console.error('Failed to create character:', e);
  }
  return false;
}

export async function deleteCharacter(characterId) {
  if (characterId === activeCharacterId) {
    alert('Cannot delete the active character currently in session!');
    return false;
  }
  try {
    const res = await fetch(`/api/v1/characters/${characterId}`, { method: 'DELETE' });
    if (res.ok) {
      renderCharacterRosterUI();
      return true;
    }
  } catch (e) {
    console.error('Failed to delete character:', e);
  }
  return false;
}

export async function switchToCharacter(characterId) {
  await saveToDatabase(true);
  setActiveCharacterId(characterId);
  await loadFromDatabase(characterId);
  document.getElementById('character-roster-modal')?.classList.add('hidden');
  spawnDamageNumber(player.x, player.y - 60, `Switched to Hero: ${player.classSpec}`, true, '#ffd700');
}

export async function renderCharacterRosterUI() {
  const listEl = document.getElementById('roster-characters-list');
  if (!listEl) return;
  listEl.innerHTML = '<div style="text-align:center; color:#abb2bf; font-size:11px;">Loading heroes...</div>';

  const chars = await fetchCharacterList();
  listEl.innerHTML = '';

  if (chars.length === 0) {
    listEl.innerHTML = '<div style="text-align:center; color:#abb2bf; font-size:11px;">No characters yet. Forge one!</div>';
    return;
  }

  chars.forEach(c => {
    const isActive = c.id === activeCharacterId;
    const card = document.createElement('div');
    card.className = `roster-char-card ${isActive ? 'roster-active-hero' : ''}`;
    card.innerHTML = `
      <div class="char-info-col">
        <div class="char-title-line">
          <span class="char-name-txt">${c.name}</span>
          <span class="char-spec-tag">${c.classSpec} [Lv.${c.level}]</span>
          <span>${c.gender === 'Male' ? '♂' : '♀'}</span>
        </div>
        <span class="char-loc-txt">📍 ${c.zoneId} &nbsp;•&nbsp; ${new Date(c.updatedAt).toLocaleTimeString()}</span>
      </div>
      <div class="char-actions-col">
        ${isActive ? '<span style="font-size:10px; font-weight:bold; color:#ffd700;">★ Active</span>' : `<button class="btn-select-hero">⚔️ Play</button>`}
        ${!isActive ? `<button class="btn-delete-hero" title="Delete Hero">🗑️</button>` : ''}
      </div>
    `;

    card.querySelector('.btn-select-hero')?.addEventListener('click', () => switchToCharacter(c.id));
    card.querySelector('.btn-delete-hero')?.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete "${c.name}"?`)) deleteCharacter(c.id);
    });

    listEl.appendChild(card);
  });
}

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
    characterId: activeCharacterId,
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
    const res = await fetch('/api/v1/savegame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok && !silent) {
      spawnDamageNumber(player.x, player.y - 45, '💾 Progress Saved', true, '#98c379');
    }
  } catch (err) {
    console.warn('Auto-save network fallback:', err);
  } finally {
    isSaving = false;
  }
}

export async function loadFromDatabase(charId) {
  const targetId = charId || activeCharacterId;
  try {
    const res = await fetch(`/api/v1/savegame?characterId=${targetId}`);
    if (!res.ok) {
      // Create initial character if not found
      await createNewCharacter('Novice Hero', 'Male', 'Novice');
      return true;
    }

    const data = await res.json();
    if (!data || !data.characterId) return false;

    setActiveCharacterId(data.characterId);
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

    player.x = (data.positionX && data.positionX >= 48 && data.positionX <= 1850) ? data.positionX : 672;
    player.y = (data.positionY && data.positionY >= 48 && data.positionY <= 1850) ? data.positionY : 672;
    player.zoneId = data.zoneId || 'SanctuaryHaven';

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
    updateAttributesModal();

    const hudLevel = document.getElementById('hud-level');
    if (hudLevel) hudLevel.innerText = `Lv.${player.level}`;
    const hudName = document.getElementById('hud-name');
    if (hudName) hudName.innerText = data.name || 'Novice Adventurer';

    updateHudAvatar();
    updateExpBar();

    return true;
  } catch (err) {
    console.warn('Could not load character from API:', err);
    return false;
  }
}

export function startAutoSave(intervalMs = 10000) {
  setInterval(() => {
    saveToDatabase(true);
  }, intervalMs);
}
