/**
 * Character Roster & Selection Modal UI
 * Allows managing multiple characters per account with independent progression.
 */

import { ApiClient } from '../services/api-client.js';
import { player } from '../state.js';
import { AudioEngine } from '../audio.js';
import { getTownForAct } from '../data/campaign.js';

let rosterList = [];
let selectedClass = 'Vanguard';
let selectedGender = 'Male';

export function setupRosterUI() {
  const modal = document.getElementById('rosterModal');
  if (!modal) return;

  const btnClose = document.getElementById('closeRosterBtn');
  if (btnClose) {
    btnClose.onclick = () => closeRosterUI();
  }
}

export async function openRosterUI() {
  const modal = document.getElementById('rosterModal');
  if (!modal) return;
  modal.classList.add('active');
  AudioEngine.playTone(480, 'sine', 0.15, 0.1);
  await refreshRosterList();
}

export function closeRosterUI() {
  const modal = document.getElementById('rosterModal');
  if (!modal) return;
  modal.classList.remove('active');
  AudioEngine.playTone(330, 'triangle', 0.1, 0.08);
}

export const renderRosterModal = openRosterUI;

export async function refreshRosterList() {
  const container = document.getElementById('rosterContent');
  if (!container) return;

  container.innerHTML = `<div style="text-align:center; padding:40px; color:#ffd700;">⏳ Loading character roster...</div>`;

  rosterList = await ApiClient.fetchCharacters('guest');
  if (!rosterList || rosterList.length === 0) {
    // If empty, add active character as first default
    rosterList = [{
      id: player.id || 'hero_default',
      name: player.name || 'Aethel Hero',
      classSpec: player.classSpec || 'Vanguard',
      gender: player.gender || 'Male',
      level: player.level || 1,
      zoneId: player.zoneId || 'SanctuaryHaven',
      updatedAt: new Date().toISOString()
    }];
  }

  container.innerHTML = `
    <div class="roster-split-layout">
      <!-- Left: Character List -->
      <div class="roster-list-col">
        <h3 class="roster-col-title">📜 YOUR ACTIVE HEROES (${rosterList.length})</h3>
        <div class="roster-card-stack">
          ${rosterList.map(c => {
            const isCurrent = (player.id === c.id || (player.name === c.name && !player.id));
            return `
              <div class="roster-char-card ${isCurrent ? 'is-active-char' : ''}" data-char-id="${c.id}">
                <div class="rcc-avatar">
                  ${c.classSpec === 'Arcanist' ? '🔮' : (c.classSpec === 'ShadowRogue' ? '🗡️' : '🛡️')}
                </div>
                <div class="rcc-info">
                  <div class="rcc-name-row">
                    <span class="rcc-name">${c.name}</span>
                    <span class="rcc-class-pill ${c.classSpec.toLowerCase()}">${c.classSpec}</span>
                  </div>
                  <div class="rcc-meta-row">
                    <span class="rcc-lvl">Level ${c.level || 1}</span>
                    <span class="rcc-zone">📍 ${c.zoneId || 'SanctuaryHaven'}</span>
                  </div>
                </div>
                <div class="rcc-actions">
                  ${isCurrent ? '<span class="rcc-playing-tag">PLAYING</span>' : `<button class="rcc-btn-select" data-char-id="${c.id}">Select</button>`}
                  ${rosterList.length > 1 && !isCurrent ? `<button class="rcc-btn-del" data-char-id="${c.id}" title="Delete Hero">🗑️</button>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Right: Create New Character Form -->
      <div class="roster-create-col">
        <h3 class="roster-col-title">✨ CREATE NEW HERO</h3>
        <div class="create-hero-box">
          <div class="ch-field">
            <label>Hero Name</label>
            <input type="text" id="newHeroName" placeholder="Enter hero name..." maxlength="20" value="Valerius" />
          </div>

          <div class="ch-field">
            <label>Select Archetype Class</label>
            <div class="class-select-grid">
              <div class="cs-option ${selectedClass === 'Vanguard' ? 'selected' : ''}" data-class="Vanguard">
                <span class="cs-icon">🛡️</span>
                <span class="cs-name">Iron Vanguard</span>
                <span class="cs-desc">Heavy Armor, Melee Cleave & Life Pool</span>
              </div>
              <div class="cs-option ${selectedClass === 'Arcanist' ? 'selected' : ''}" data-class="Arcanist">
                <span class="cs-icon">🔮</span>
                <span class="cs-name">Aether Arcanist</span>
                <span class="cs-desc">Elemental Magic, Fireballs & Energy Shield</span>
              </div>
              <div class="cs-option ${selectedClass === 'ShadowRogue' ? 'selected' : ''}" data-class="ShadowRogue">
                <span class="cs-icon">🗡️</span>
                <span class="cs-name">Shadow Rogue</span>
                <span class="cs-desc">Critical Strikes, Evasion & Fast Attacks</span>
              </div>
            </div>
          </div>

          <div class="ch-field">
            <label>Gender & Voice</label>
            <div class="gender-toggle-row">
              <button class="gender-btn ${selectedGender === 'Male' ? 'active' : ''}" data-gender="Male">♂ Male</button>
              <button class="gender-btn ${selectedGender === 'Female' ? 'active' : ''}" data-gender="Female">♀ Female</button>
            </div>
          </div>

          <button id="btnCreateAndEnter" class="btn-create-enter">🌟 FORGE HERO & ENTER WORLD</button>
        </div>
      </div>
    </div>
  `;

  // Attach Event Listeners
  container.querySelectorAll('.rcc-btn-select').forEach(btn => {
    btn.onclick = async () => {
      const charId = btn.getAttribute('data-char-id');
      await switchActiveCharacter(charId);
    };
  });

  container.querySelectorAll('.rcc-btn-del').forEach(btn => {
    btn.onclick = async () => {
      const charId = btn.getAttribute('data-char-id');
      if (confirm('Are you sure you want to delete this hero permanently?')) {
        await ApiClient.deleteCharacter(charId);
        AudioEngine.playTone(200, 'sawtooth', 0.2, 0.1);
        await refreshRosterList();
      }
    };
  });

  container.querySelectorAll('.cs-option').forEach(opt => {
    opt.onclick = () => {
      selectedClass = opt.getAttribute('data-class');
      AudioEngine.playTone(500, 'sine', 0.08, 0.08);
      refreshRosterList();
    };
  });

  container.querySelectorAll('.gender-btn').forEach(btn => {
    btn.onclick = () => {
      selectedGender = btn.getAttribute('data-gender');
      AudioEngine.playTone(400, 'triangle', 0.08, 0.08);
      refreshRosterList();
    };
  });

  const btnCreate = document.getElementById('btnCreateAndEnter');
  if (btnCreate) {
    btnCreate.onclick = async () => {
      const nameInput = document.getElementById('newHeroName');
      const name = nameInput ? nameInput.value.trim() : 'Hero';
      if (!name) return alert('Please enter a character name.');

      btnCreate.disabled = true;
      btnCreate.innerText = '⏳ Creating Hero...';

      const res = await ApiClient.createCharacter(name, selectedClass, selectedGender, 'guest');
      if (res && res.id) {
        AudioEngine.playLevelUp();
        await switchActiveCharacter(res.id);
        closeRosterUI();
      } else {
        alert('Failed to create character.');
        btnCreate.disabled = false;
        btnCreate.innerText = '🌟 FORGE HERO & ENTER WORLD';
      }
    };
  }
}

export async function switchActiveCharacter(characterId) {
  const savegame = await ApiClient.loadSavegame(characterId);
  if (savegame) {
    player.id = savegame.id;
    player.name = savegame.name;
    player.classSpec = savegame.classSpec || 'Vanguard';
    player.gender = savegame.gender || 'Male';
    player.level = savegame.level || 1;
    player.currentExp = savegame.currentExp || 0;
    player.expToNext = savegame.expToNext || 100;
    player.life = savegame.life || 500;
    player.maxLife = savegame.maxLife || 500;
    player.mana = savegame.mana || 200;
    player.maxMana = savegame.maxMana || 200;
    player.es = savegame.es || 0;
    player.maxEs = savegame.maxEs || 0;
    player.zoneId = getTownForAct(savegame.zoneId || 'SanctuaryHaven');

    if (savegame.equipped) player.equipped = savegame.equipped;
    if (savegame.bag) player.bag = savegame.bag;
    if (savegame.skills) player.skills = savegame.skills;

    AudioEngine.playTone(600, 'sine', 0.2, 0.15);
    window.location.reload();
  }
}
