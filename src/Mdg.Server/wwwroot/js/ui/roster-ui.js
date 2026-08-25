/**
 * Character Roster & Selection Modal UI
 * Allows managing multiple characters per account with independent progression.
 */

import { ApiClient } from '../services/api-client.js';
import { player } from '../state.js';
import { AudioEngine } from '../audio.js';
import { getTownForAct } from '../data/campaign.js';
import { getCurrentUser } from '../auth.js';
import { setActiveCharacterId } from '../save-system.js';
import { MPClient } from '../services/multiplayer-client.js';

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

  // Handle Google Auth state changes automatically
  window.addEventListener('auth_state_changed', async (e) => {
    const user = e.detail?.user || getCurrentUser();
    const chars = e.detail?.characters;
    if (chars && chars.length > 0) {
      setActiveCharacterId(chars[0].id);
      await switchActiveCharacter(chars[0].id);
    } else {
      await refreshRosterList();
    }
  });
}

let currentRosterOptions = {};

export function ensureCharacterSelection(user) {
  return new Promise((resolve) => {
    openRosterUI({
      isGate: true,
      onSelect: (chosenChar) => {
        resolve(chosenChar);
      }
    });
  });
}

export async function openRosterUI(options = {}) {
  currentRosterOptions = options;
  const modal = document.getElementById('rosterModal');
  if (!modal) return;
  modal.classList.add('active');
  modal.style.display = 'flex';
  AudioEngine.playTone(480, 'sine', 0.15, 0.1);
  await refreshRosterList();
}

export function closeRosterUI() {
  const modal = document.getElementById('rosterModal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.style.display = 'none';
  AudioEngine.playTone(330, 'triangle', 0.1, 0.08);
}

export const renderRosterModal = openRosterUI;

export async function refreshRosterList() {
  const container = document.getElementById('rosterContent');
  if (!container) return;

  container.innerHTML = `<div style="text-align:center; padding:40px; color:#ffd700;">⏳ Đang tải danh sách nhân vật...</div>`;

  const user = getCurrentUser();
  rosterList = await ApiClient.fetchCharacters(user.id);
  if (!rosterList) rosterList = [];

  const isGate = !!currentRosterOptions.isGate;

  container.innerHTML = `
    <div class="roster-split-layout">
      <!-- Left: Character List -->
      <div class="roster-list-col">
        <h3 class="roster-col-title">📜 DANH SÁCH ANH HÙNG (${rosterList.length})</h3>
        ${rosterList.length === 0 ? `
          <div style="padding:25px; text-align:center; color:#94a3b8; background:rgba(20,26,38,0.6); border-radius:8px; border:1px dashed rgba(255,255,255,0.15);">
            <div style="font-size:32px; margin-bottom:8px;">⚔️</div>
            <b style="color:#ffd700;">Tài khoản chưa có nhân vật nào</b>
            <p style="font-size:11px; margin-top:4px;">Hãy tạo nhân vật đầu tiên ở khung bên phải để bước vào thế giới Aethelis!</p>
          </div>
        ` : `
          <div class="roster-card-stack">
            ${rosterList.map(c => {
              const isCurrent = (player.id === c.id);
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
                      <span class="rcc-lvl">Cấp ${c.level || 1}</span>
                      <span class="rcc-zone">📍 ${c.zoneId || 'SanctuaryHaven'}</span>
                    </div>
                  </div>
                  <div class="rcc-actions">
                    <button class="rcc-btn-select forge-btn btn-craft" style="padding:6px 12px; font-size:11px; font-weight:800; background: linear-gradient(90deg, #10b981, #059669);" data-char-id="${c.id}">
                      ⚔️ ${isGate ? 'VÀO THẾ GIỚI' : (isCurrent ? 'ĐANG CHỌN' : 'CHUYỂN SANG')}
                    </button>
                    ${rosterList.length > 1 && !isCurrent ? `<button class="rcc-btn-del" data-char-id="${c.id}" title="Xóa Nhân Vật">🗑️</button>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- Right: Create New Character Form -->
      <div class="roster-create-col">
        <h3 class="roster-col-title">✨ TẠO ANH HÙNG MỚI</h3>
        <div class="create-hero-box">
          <div class="ch-field">
            <label>Tên Nhân Vật (Hero Name)</label>
            <input type="text" id="newHeroName" placeholder="Nhập tên nhân vật..." maxlength="20" value="Hero_${Math.random().toString(36).substring(2,6).toUpperCase()}" />
          </div>

          <div class="ch-field">
            <label>Chọn Hệ Phái (Class Archetype)</label>
            <div class="class-select-grid">
              <div class="cs-option ${selectedClass === 'Vanguard' ? 'selected' : ''}" data-class="Vanguard">
                <span class="cs-icon">🛡️</span>
                <span class="cs-name">Iron Vanguard</span>
                <span class="cs-desc">Giáp Hạng Nặng, Cận Chiến & Lượng Máu Lớn</span>
              </div>
              <div class="cs-option ${selectedClass === 'Arcanist' ? 'selected' : ''}" data-class="Arcanist">
                <span class="cs-icon">🔮</span>
                <span class="cs-name">Aether Arcanist</span>
                <span class="cs-desc">Phép Thuật Nguyên Tố, Cầu Lửa & Khiên Năng Lượng</span>
              </div>
              <div class="cs-option ${selectedClass === 'ShadowRogue' ? 'selected' : ''}" data-class="ShadowRogue">
                <span class="cs-icon">🗡️</span>
                <span class="cs-name">Shadow Rogue</span>
                <span class="cs-desc">Chí Mạng Cao, Né Đòn & Tốc Độ Xuất Chiêu</span>
              </div>
            </div>
          </div>

          <div class="ch-field">
            <label>Giới Tính & Ngoại Hình</label>
            <div class="gender-toggle-row">
              <button class="gender-btn ${selectedGender === 'Male' ? 'active' : ''}" data-gender="Male">♂ Nam (Male)</button>
              <button class="gender-btn ${selectedGender === 'Female' ? 'active' : ''}" data-gender="Female">♀ Nữ (Female)</button>
            </div>
          </div>

          <button id="btnCreateAndEnter" class="btn-create-enter">🌟 TẠO NHÂN VẬT & VÀO THẾ GIỚI</button>
        </div>
      </div>
    </div>
  `;

  // Attach Event Listeners
  container.querySelectorAll('.rcc-btn-select').forEach(btn => {
    btn.onclick = async () => {
      const charId = btn.getAttribute('data-char-id');
      const loaded = await applyCharacterData(charId);
      closeRosterUI();
      if (currentRosterOptions.onSelect) {
        currentRosterOptions.onSelect(loaded);
      } else {
        MPClient.joinCurrentZone();
      }
    };
  });

  container.querySelectorAll('.rcc-btn-del').forEach(btn => {
    btn.onclick = async () => {
      const charId = btn.getAttribute('data-char-id');
      if (confirm('Bạn có chắc chắn muốn xóa nhân vật này vĩnh viễn không?')) {
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
      if (!name) return alert('Vui lòng nhập tên nhân vật.');

      btnCreate.disabled = true;
      btnCreate.innerText = '⏳ Đang Tạo Nhân Vật...';

      const user = getCurrentUser();
      const res = await ApiClient.createCharacter(name, selectedClass, selectedGender, user.id);
      if (res && res.id) {
        AudioEngine.playLevelUp();
        const loaded = await applyCharacterData(res.id);
        closeRosterUI();
        if (currentRosterOptions.onSelect) {
          currentRosterOptions.onSelect(loaded);
        } else {
          MPClient.joinCurrentZone();
        }
      } else {
        alert('Không thể tạo nhân vật.');
        btnCreate.disabled = false;
        btnCreate.innerText = '🌟 TẠO NHÂN VẬT & VÀO THẾ GIỚI';
      }
    };
  }
}

export async function applyCharacterData(characterId) {
  setActiveCharacterId(characterId);
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
    player.zoneId = savegame.zoneId || 'SanctuaryHaven';

    if (savegame.equipped) player.equipped = savegame.equipped;
    if (savegame.bag) player.bag = savegame.bag;
    if (savegame.skills) player.skills = savegame.skills;
    if (savegame.currencies) player.currencies = savegame.currencies;
    if (savegame.materials) player.materials = savegame.materials;
    if (savegame.allocatedDevotionNodes) player.allocatedDevotionNodes = savegame.allocatedDevotionNodes;

    AudioEngine.playTone(600, 'sine', 0.2, 0.15);
    return savegame;
  }
  return null;
}

export const switchActiveCharacter = applyCharacterData;

