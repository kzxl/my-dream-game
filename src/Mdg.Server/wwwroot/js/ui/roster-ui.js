/**
 * MDG: Aethelis - Multi-Character Roster UI
 * Hero Selection, Character Creation (Gender, Archetype, Name) & Character Deletion (English)
 * Integrated with Google OAuth & Account-bound Cloud Saves
 */

import { player } from '../state.js';
import { AudioEngine } from '../audio.js';
import { loadFromDatabase, saveToDatabase } from '../save-system.js';
import { updateHudAvatar, getAvatarPath } from './hud.js';
import { getCurrentUser, renderAuthHeaderWidget, isUserLoggedIn } from '../auth.js';

export async function renderRosterModal() {
  let modal = document.getElementById('rosterModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'rosterModal';
    modal.className = 'game-modal-backdrop';
    modal.innerHTML = `
      <div class="roster-modal-card">
        <div class="modal-header">
          <h2>👥 Character Roster & Hero Selection</h2>
          <button class="close-btn" id="closeRosterBtn">✕</button>
        </div>

        <!-- Google Auth Status & Profile Widget -->
        <div id="authHeaderWidget" style="padding: 14px 20px 0 20px;"></div>

        <div class="roster-body">
          <div class="roster-characters-list" id="rosterCharList">
            <div style="color:#aaa; text-align:center; padding:20px;">Loading characters from server...</div>
          </div>

          <!-- Create New Character Section -->
          <div class="create-char-panel">
            <h3>✨ Forge New Character</h3>
            <div class="create-form-row">
              <input type="text" id="newCharName" placeholder="Hero Name (e.g. Kaelen)" class="form-input" maxlength="20" />
              <select id="newCharGender" class="form-select">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <select id="newCharClass" class="form-select">
                <option value="Novice">The Unbound (Novice)</option>
                <option value="Vanguard">Iron Vanguard (Knight)</option>
                <option value="Seeker">Aether Seeker (Arcanist)</option>
                <option value="Syndicate">Shadow Syndicate (Rogue)</option>
              </select>
              <button class="forge-btn btn-craft" id="btnCreateChar">➕ Create Hero</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeRosterBtn').onclick = () => {
      modal.style.display = 'none';
    };

    document.getElementById('btnCreateChar').onclick = async () => {
      const user = getCurrentUser();
      const name = document.getElementById('newCharName').value.trim();
      const gender = document.getElementById('newCharGender').value;
      const classSpec = document.getElementById('newCharClass').value;

      if (!name) return alert('Please enter a valid character name!');

      const newId = 'char_' + Date.now();
      const payload = {
        id: newId,
        accountId: user.id,
        name: name,
        gender: gender,
        classSpec: classSpec,
        level: 1,
        life: 250,
        maxLife: 250,
        mana: 120,
        maxMana: 120,
        es: 100,
        maxEs: 100,
        zoneId: 'SanctuaryHaven',
        positionX: 2000,
        positionY: 2000
      };

      try {
        const res = await fetch('/api/v1/characters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          AudioEngine.playTone(660, 'sine', 0.25, 0.2);
          document.getElementById('newCharName').value = '';
          await fetchAndRenderCharacters();
        } else {
          alert('Failed to create character on server.');
        }
      } catch (err) {
        console.error(err);
      }
    };

    // Listen for Google Auth changes to refresh characters
    window.addEventListener('auth_state_changed', async (e) => {
      renderAuthHeaderWidget('authHeaderWidget');
      await fetchAndRenderCharacters();
    });
  }

  renderAuthHeaderWidget('authHeaderWidget');
  await fetchAndRenderCharacters();
  modal.style.display = 'flex';
}

async function fetchAndRenderCharacters() {
  const container = document.getElementById('rosterCharList');
  if (!container) return;

  const user = getCurrentUser();

  try {
    const res = await fetch(`/api/v1/characters?accountId=${encodeURIComponent(user.id)}`);
    let list = [];
    if (res.ok) {
      list = await res.json();
    }

    if (list.length === 0) {
      // If none, provide initial character for this account
      list = [{
        id: 'hero_' + user.id.replace(/[^a-zA-Z0-9]/g, '_'),
        accountId: user.id,
        name: user.name ? user.name.split(' ')[0] : 'The Unbound',
        gender: 'Male',
        classSpec: 'Novice',
        level: 1,
        zoneId: 'SanctuaryHaven'
      }];
    }

    container.innerHTML = '';
    list.forEach(c => {
      const card = document.createElement('div');
      card.className = `roster-hero-card ${player.id === c.id ? 'active-hero' : ''}`;
      const avatarPath = getAvatarPath(c.classSpec, c.gender);
      card.innerHTML = `
        <div class="hero-avatar-box">
          <img src="${avatarPath}" alt="${c.name}" class="roster-avatar-img" />
        </div>
        <div class="hero-info-box">
          <div class="hero-name-row">
            <span class="hero-name">${c.name}</span>
            <span class="hero-lvl">Lv. ${c.level}</span>
          </div>
          <div class="hero-details">${c.classSpec} • Location: ${c.zoneId || 'SanctuaryHaven'}</div>
        </div>
        <div class="hero-actions-box">
          <button class="forge-btn btn-craft btn-play-hero" data-id="${c.id}">🎮 Play</button>
          ${c.id !== 'hero_default' ? `<button class="forge-btn btn-lock btn-del-hero" data-id="${c.id}" style="color:#ff6666;">🗑️</button>` : ''}
        </div>
      `;

      card.querySelector('.btn-play-hero').onclick = async () => {
        player.id = c.id;
        player.accountId = user.id;
        player.name = c.name;
        player.gender = c.gender;
        player.classSpec = c.classSpec;
        await loadFromDatabase(c.id);
        updateHudAvatar();
        AudioEngine.playTone(523, 'sine', 0.25, 0.2);
        document.getElementById('rosterModal').style.display = 'none';
      };

      const delBtn = card.querySelector('.btn-del-hero');
      if (delBtn) {
        delBtn.onclick = async () => {
          if (confirm(`Permanently delete character ${c.name}?`)) {
            await fetch(`/api/v1/characters/${c.id}`, { method: 'DELETE' });
            await fetchAndRenderCharacters();
          }
        };
      }

      container.appendChild(card);
    });
  } catch (e) {
    console.error(e);
  }
}
