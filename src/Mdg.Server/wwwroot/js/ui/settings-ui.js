/**
 * MDG: Aethelis - Game Settings Modal & Configuration Engine
 * Features:
 *  - 5 Categorized Tabs: Language & Interface, Audio, Graphics, Gameplay, Data & Backup
 *  - Live Hot-reloading Language Switch (Vi / En)
 *  - Master / SFX / BGM Volume Sliders & Mute
 *  - Screen Shake, Floating Damage Numbers, Loot Beams, Particle Quality
 *  - Auto-Loot Currencies & Materials
 *  - Force Cloud Save, Export Backup JSON, Import Backup JSON
 */

import { player } from '../state.js';
import { AudioEngine } from '../audio.js';
import { t, getLanguage, setLanguage, applyLocalization } from '../i18n.js';
import { saveToDatabase, loadFromDatabase } from '../save-system.js';
import { spawnDamageNumber } from '../combat.js';

const SETTINGS_STORAGE_KEY = 'mdg_game_settings';

export const DEFAULT_SETTINGS = {
  language: 'vi',
  showDamageNumbers: true,
  showEnemyHealthBars: true,
  showTooltipsComparison: true,
  masterVolume: 80,
  sfxVolume: 90,
  bgmVolume: 70,
  isMuted: false,
  screenShake: true,
  showLootBeams: true,
  particlesQuality: 'high', // 'high' | 'med' | 'low'
  autoLootCurrencies: true
};

export let gameSettings = { ...DEFAULT_SETTINGS };

export function loadGameSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      gameSettings = { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('[Settings] Failed to load saved settings, using defaults:', e);
    gameSettings = { ...DEFAULT_SETTINGS };
  }

  // Ensure i18n language syncs with settings
  if (gameSettings.language) {
    setLanguage(gameSettings.language);
  }

  // Apply audio settings
  applyAudioSettings();
  return gameSettings;
}

export function saveGameSettings() {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(gameSettings));
  } catch (e) {
    console.warn('[Settings] Failed to save settings to localStorage:', e);
  }
}

export function getGameSetting(key) {
  return gameSettings[key] !== undefined ? gameSettings[key] : DEFAULT_SETTINGS[key];
}

export function setGameSetting(key, value) {
  gameSettings[key] = value;
  saveGameSettings();

  if (key === 'language') {
    setLanguage(value);
    renderSettingsModal();
  } else if (key === 'masterVolume' || key === 'sfxVolume' || key === 'isMuted') {
    applyAudioSettings();
  }
}

function applyAudioSettings() {
  const master = (gameSettings.masterVolume ?? 80) / 100;
  const sfx = (gameSettings.sfxVolume ?? 90) / 100;
  const muted = !!gameSettings.isMuted;

  AudioEngine.setMasterVolume(master);
  AudioEngine.setSfxVolume(sfx);
  AudioEngine.setMuted(muted);
}

let activeSettingsTab = 'general'; // 'general' | 'audio' | 'graphics' | 'gameplay' | 'data'

export function toggleSettingsModal() {
  let modal = document.getElementById('settingsModal');
  if (!modal) {
    renderSettingsModal();
    modal = document.getElementById('settingsModal');
  }

  if (modal.style.display !== 'none' && !modal.classList.contains('hidden')) {
    modal.style.display = 'none';
    modal.classList.remove('active');
    modal.classList.add('hidden');
  } else {
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    modal.classList.add('active');
    renderSettingsModal();
  }
}

export function renderSettingsModal() {
  let modal = document.getElementById('settingsModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'settingsModal';
    modal.className = 'game-modal-backdrop modal-overlay hidden';
    document.body.appendChild(modal);
  }

  const currentLang = getLanguage();

  modal.innerHTML = `
    <div class="modal-content settings-modal-box">
      <div class="modal-header settings-modal-header">
        <div class="settings-title-group">
          <span class="settings-icon">⚙️</span>
          <div>
            <h2 class="settings-main-title">${t('settings.title')}</h2>
            <span class="settings-sub-title">${t('settings.sub')}</span>
          </div>
        </div>
        <button id="btnCloseSettingsModal" class="close-btn" title="Close (ESC)">&times;</button>
      </div>

      <div class="settings-modal-body">
        <!-- Sidebar Navigation Tabs -->
        <div class="settings-tabs-sidebar">
          <button class="settings-tab-btn ${activeSettingsTab === 'general' ? 'active' : ''}" data-tab="general">
            <span>🌐</span> ${t('settings.tab_general')}
          </button>
          <button class="settings-tab-btn ${activeSettingsTab === 'audio' ? 'active' : ''}" data-tab="audio">
            <span>🔊</span> ${t('settings.tab_audio')}
          </button>
          <button class="settings-tab-btn ${activeSettingsTab === 'graphics' ? 'active' : ''}" data-tab="graphics">
            <span>🖥️</span> ${t('settings.tab_graphics')}
          </button>
          <button class="settings-tab-btn ${activeSettingsTab === 'gameplay' ? 'active' : ''}" data-tab="gameplay">
            <span>⚔️</span> ${t('settings.tab_gameplay')}
          </button>
          <button class="settings-tab-btn ${activeSettingsTab === 'data' ? 'active' : ''}" data-tab="data">
            <span>💾</span> ${t('settings.tab_data')}
          </button>
        </div>

        <!-- Main Content Area -->
        <div class="settings-content-panel" id="settingsTabContent">
          ${renderTabContent(activeSettingsTab, currentLang)}
        </div>
      </div>
    </div>
  `;

  attachSettingsEvents(modal);
}

function renderTabContent(tab, currentLang) {
  switch (tab) {
    case 'general':
      return `
        <div class="settings-section">
          <div class="settings-section-header">🌐 ${t('settings.tab_general')}</div>

          <!-- Language Selector -->
          <div class="settings-row-card">
            <div class="settings-row-info">
              <label class="settings-row-label">${t('settings.lang_select')}</label>
              <span class="settings-row-desc">Chọn ngôn ngữ bạn muốn trải nghiệm trong toàn bộ hệ thống Aethelis.</span>
            </div>
            <div class="settings-row-control">
              <select id="setting-language-select" class="settings-select-input">
                <option value="vi" ${currentLang === 'vi' ? 'selected' : ''}>🇻🇳 Tiếng Việt (Vietnamese)</option>
                <option value="en" ${currentLang === 'en' ? 'selected' : ''}>🇬🇧 English (English)</option>
              </select>
            </div>
          </div>

          <!-- Show Damage Numbers Toggle -->
          <div class="settings-row-card">
            <div class="settings-row-info">
              <label class="settings-row-label">${t('settings.show_dmg_nums')}</label>
              <span class="settings-row-desc">${t('settings.show_dmg_nums_desc')}</span>
            </div>
            <div class="settings-row-control">
              <label class="toggle-switch">
                <input type="checkbox" id="setting-show-damage-numbers" ${gameSettings.showDamageNumbers ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Show Enemy Health Bars Toggle -->
          <div class="settings-row-card">
            <div class="settings-row-info">
              <label class="settings-row-label">${t('settings.show_enemy_hp')}</label>
              <span class="settings-row-desc">${t('settings.show_enemy_hp_desc')}</span>
            </div>
            <div class="settings-row-control">
              <label class="toggle-switch">
                <input type="checkbox" id="setting-show-enemy-hp" ${gameSettings.showEnemyHealthBars ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Side-by-side Tooltips Comparison -->
          <div class="settings-row-card">
            <div class="settings-row-info">
              <label class="settings-row-label">${t('settings.show_tooltips_comp')}</label>
              <span class="settings-row-desc">${t('settings.show_tooltips_comp_desc')}</span>
            </div>
            <div class="settings-row-control">
              <label class="toggle-switch">
                <input type="checkbox" id="setting-show-tooltips-comp" ${gameSettings.showTooltipsComparison ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      `;

    case 'audio':
      return `
        <div class="settings-section">
          <div class="settings-section-header">🔊 ${t('settings.tab_audio')}</div>

          <!-- Mute All Toggle -->
          <div class="settings-row-card">
            <div class="settings-row-info">
              <label class="settings-row-label">${t('settings.mute_all')}</label>
              <span class="settings-row-desc">Tắt toàn bộ âm thanh và tiếng động trong game.</span>
            </div>
            <div class="settings-row-control">
              <label class="toggle-switch">
                <input type="checkbox" id="setting-is-muted" ${gameSettings.isMuted ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Master Volume Slider -->
          <div class="settings-row-card">
            <div class="settings-row-info">
              <label class="settings-row-label">${t('settings.master_vol')}</label>
              <span class="settings-row-desc">Điều chỉnh âm lượng tổng thể của trò chơi.</span>
            </div>
            <div class="settings-row-control slider-control-group">
              <input type="range" id="setting-master-vol" min="0" max="100" value="${gameSettings.masterVolume}" class="settings-slider">
              <span class="slider-val-badge" id="val-badge-master">${gameSettings.masterVolume}%</span>
            </div>
          </div>

          <!-- SFX Volume Slider -->
          <div class="settings-row-card">
            <div class="settings-row-info">
              <label class="settings-row-label">${t('settings.sfx_vol')}</label>
              <span class="settings-row-desc">Hiệu ứng âm thanh khi chém quái, tung phép, nhặt đồ và lên cấp.</span>
            </div>
            <div class="settings-row-control slider-control-group">
              <input type="range" id="setting-sfx-vol" min="0" max="100" value="${gameSettings.sfxVolume}" class="settings-slider">
              <span class="slider-val-badge" id="val-badge-sfx">${gameSettings.sfxVolume}%</span>
            </div>
          </div>

          <!-- BGM Volume Slider -->
          <div class="settings-row-card">
            <div class="settings-row-info">
              <label class="settings-row-label">${t('settings.bgm_vol')}</label>
              <span class="settings-row-desc">Âm lượng nhạc nền và âm hưởng khu vực.</span>
            </div>
            <div class="settings-row-control slider-control-group">
              <input type="range" id="setting-bgm-vol" min="0" max="100" value="${gameSettings.bgmVolume}" class="settings-slider">
              <span class="slider-val-badge" id="val-badge-bgm">${gameSettings.bgmVolume}%</span>
            </div>
          </div>
        </div>
      `;

    case 'graphics':
      return `
        <div class="settings-section">
          <div class="settings-section-header">🖥️ ${t('settings.tab_graphics')}</div>

          <!-- Screen Shake on Crit -->
          <div class="settings-row-card">
            <div class="settings-row-info">
              <label class="settings-row-label">${t('settings.screen_shake')}</label>
              <span class="settings-row-desc">${t('settings.screen_shake_desc')}</span>
            </div>
            <div class="settings-row-control">
              <label class="toggle-switch">
                <input type="checkbox" id="setting-screen-shake" ${gameSettings.screenShake ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Loot Light Beams -->
          <div class="settings-row-card">
            <div class="settings-row-info">
              <label class="settings-row-label">${t('settings.loot_beams')}</label>
              <span class="settings-row-desc">${t('settings.loot_beams_desc')}</span>
            </div>
            <div class="settings-row-control">
              <label class="toggle-switch">
                <input type="checkbox" id="setting-loot-beams" ${gameSettings.showLootBeams ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Particles VFX Quality -->
          <div class="settings-row-card">
            <div class="settings-row-info">
              <label class="settings-row-label">${t('settings.particles_density')}</label>
              <span class="settings-row-desc">Điều chỉnh số lượng hạt tia lửa, ma pháp và vụn nổ khi chiến đấu.</span>
            </div>
            <div class="settings-row-control">
              <select id="setting-particles-quality" class="settings-select-input">
                <option value="high" ${gameSettings.particlesQuality === 'high' ? 'selected' : ''}>✨ ${t('settings.particles_high')}</option>
                <option value="med" ${gameSettings.particlesQuality === 'med' ? 'selected' : ''}>⚡ ${t('settings.particles_med')}</option>
                <option value="low" ${gameSettings.particlesQuality === 'low' ? 'selected' : ''}>🔋 ${t('settings.particles_low')}</option>
              </select>
            </div>
          </div>
        </div>
      `;

    case 'gameplay':
      return `
        <div class="settings-section">
          <div class="settings-section-header">⚔️ ${t('settings.tab_gameplay')}</div>

          <!-- Auto Loot Currency & Materials -->
          <div class="settings-row-card">
            <div class="settings-row-info">
              <label class="settings-row-label">${t('settings.auto_loot')}</label>
              <span class="settings-row-desc">${t('settings.auto_loot_desc')}</span>
            </div>
            <div class="settings-row-control">
              <label class="toggle-switch">
                <input type="checkbox" id="setting-auto-loot" ${gameSettings.autoLootCurrencies ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Keybindings Cheat Sheet -->
          <div class="settings-keybindings-box">
            <div class="settings-kb-title">${t('settings.keybindings_title')}</div>
            <div class="settings-kb-grid">
              <div class="kb-item"><span class="kb-key">W A S D</span> <span class="kb-desc">Di chuyển nhân vật</span></div>
              <div class="kb-item"><span class="kb-key">LMB / 1</span> <span class="kb-desc">Đánh thường / Chém Slash</span></div>
              <div class="kb-item"><span class="kb-key">Q</span> <span class="kb-desc">Hỏa Cầu Pyro Fireball</span></div>
              <div class="kb-item"><span class="kb-key">W</span> <span class="kb-desc">Băng Tinh Frost Nova</span></div>
              <div class="kb-item"><span class="kb-key">E</span> <span class="kb-desc">Thiên Thạch Cataclysm Meteor</span></div>
              <div class="kb-item"><span class="kb-key">Space</span> <span class="kb-desc">Tốc Biến Dash</span></div>
              <div class="kb-item"><span class="kb-key">1 2 3 4</span> <span class="kb-desc">Bình Thuốc (Flasks 1-4)</span></div>
              <div class="kb-item"><span class="kb-key">I</span> <span class="kb-desc">Túi Đồ & Trang Bị</span></div>
              <div class="kb-item"><span class="kb-key">K</span> <span class="kb-desc">Cây Kỹ Năng & Thăng Cấp</span></div>
              <div class="kb-item"><span class="kb-key">C</span> <span class="kb-desc">Thuộc Tính & Phòng Thủ</span></div>
              <div class="kb-item"><span class="kb-key">B</span> <span class="kb-desc">Bàn Rèn & Chế Tác Genesis</span></div>
              <div class="kb-item"><span class="kb-key">Y</span> <span class="kb-desc">Bách Khoa Quái Vật (Bestiary)</span></div>
              <div class="kb-item"><span class="kb-key">P</span> <span class="kb-desc">Danh Sách Nhân Vật (Roster)</span></div>
              <div class="kb-item"><span class="kb-key">O</span> <span class="kb-desc">Thiết Bị Cổng Hư Không (Rifts)</span></div>
              <div class="kb-item"><span class="kb-key">V</span> <span class="kb-desc">Lưới Tinh Tú Devotion</span></div>
              <div class="kb-item"><span class="kb-key">X</span> <span class="kb-desc">Hòm Đồ Chung Tài Khoản</span></div>
              <div class="kb-item"><span class="kb-key">M</span> <span class="kb-desc">Bản Đồ Thế Giới & Chiến Dịch</span></div>
              <div class="kb-item"><span class="kb-key">F</span> <span class="kb-desc">Tương Tác / Khai Thác / Nhặt Đồ</span></div>
              <div class="kb-item"><span class="kb-key">ESC</span> <span class="kb-desc">Cài Đặt Game / Đóng Cửa Sổ</span></div>
            </div>
          </div>
        </div>
      `;

    case 'data':
      return `
        <div class="settings-section">
          <div class="settings-section-header">💾 ${t('settings.tab_data')}</div>

          <!-- Force Save to Server -->
          <div class="settings-row-card">
            <div class="settings-row-info">
              <label class="settings-row-label">${t('settings.force_save')}</label>
              <span class="settings-row-desc">${t('settings.force_save_desc')}</span>
            </div>
            <div class="settings-row-control">
              <button id="btn-force-save-action" class="settings-action-btn primary-action">
                💾 Lưu Ngay
              </button>
            </div>
          </div>

          <!-- Export Backup JSON -->
          <div class="settings-row-card">
            <div class="settings-row-info">
              <label class="settings-row-label">${t('settings.export_json')}</label>
              <span class="settings-row-desc">${t('settings.export_json_desc')}</span>
            </div>
            <div class="settings-row-control">
              <button id="btn-export-backup-action" class="settings-action-btn">
                📤 Xuất JSON
              </button>
            </div>
          </div>

          <!-- Import Backup JSON -->
          <div class="settings-row-card">
            <div class="settings-row-info">
              <label class="settings-row-label">${t('settings.import_json')}</label>
              <span class="settings-row-desc">${t('settings.import_json_desc')}</span>
            </div>
            <div class="settings-row-control">
              <input type="file" id="input-import-backup" accept=".json" style="display:none;" />
              <button id="btn-import-backup-action" class="settings-action-btn warning-action">
                📥 Nhập JSON
              </button>
            </div>
          </div>

          <div class="settings-notify-msg" id="settingsDataFeedback"></div>
        </div>
      `;
  }
  return '';
}

function attachSettingsEvents(modal) {
  // Close Button
  const closeBtn = modal.querySelector('#btnCloseSettingsModal');
  if (closeBtn) {
    closeBtn.onclick = () => toggleSettingsModal();
  }

  // Tabs Switching
  const tabBtns = modal.querySelectorAll('.settings-tab-btn');
  tabBtns.forEach(btn => {
    btn.onclick = () => {
      activeSettingsTab = btn.getAttribute('data-tab');
      renderSettingsModal();
    };
  });

  // 1. Language Selector
  const langSelect = modal.querySelector('#setting-language-select');
  if (langSelect) {
    langSelect.onchange = (e) => {
      setGameSetting('language', e.target.value);
    };
  }

  // 2. Damage Numbers Toggle
  const dmgNumToggle = modal.querySelector('#setting-show-damage-numbers');
  if (dmgNumToggle) {
    dmgNumToggle.onchange = (e) => {
      setGameSetting('showDamageNumbers', e.target.checked);
    };
  }

  // 3. Monster HP Bars Toggle
  const enemyHpToggle = modal.querySelector('#setting-show-enemy-hp');
  if (enemyHpToggle) {
    enemyHpToggle.onchange = (e) => {
      setGameSetting('showEnemyHealthBars', e.target.checked);
    };
  }

  // 4. Side-by-side Tooltips Toggle
  const ttCompToggle = modal.querySelector('#setting-show-tooltips-comp');
  if (ttCompToggle) {
    ttCompToggle.onchange = (e) => {
      setGameSetting('showTooltipsComparison', e.target.checked);
    };
  }

  // 5. Mute All Toggle
  const muteToggle = modal.querySelector('#setting-is-muted');
  if (muteToggle) {
    muteToggle.onchange = (e) => {
      setGameSetting('isMuted', e.target.checked);
    };
  }

  // 6. Master Volume Slider
  const masterSlider = modal.querySelector('#setting-master-vol');
  const masterBadge = modal.querySelector('#val-badge-master');
  if (masterSlider) {
    masterSlider.oninput = (e) => {
      const val = parseInt(e.target.value, 10);
      if (masterBadge) masterBadge.textContent = `${val}%`;
      setGameSetting('masterVolume', val);
    };
  }

  // 7. SFX Volume Slider
  const sfxSlider = modal.querySelector('#setting-sfx-vol');
  const sfxBadge = modal.querySelector('#val-badge-sfx');
  if (sfxSlider) {
    sfxSlider.oninput = (e) => {
      const val = parseInt(e.target.value, 10);
      if (sfxBadge) sfxBadge.textContent = `${val}%`;
      setGameSetting('sfxVolume', val);
    };
    sfxSlider.onchange = () => {
      AudioEngine.playTone(600, 'triangle', 0.15, 0.1);
    };
  }

  // 8. BGM Volume Slider
  const bgmSlider = modal.querySelector('#setting-bgm-vol');
  const bgmBadge = modal.querySelector('#val-badge-bgm');
  if (bgmSlider) {
    bgmSlider.oninput = (e) => {
      const val = parseInt(e.target.value, 10);
      if (bgmBadge) bgmBadge.textContent = `${val}%`;
      setGameSetting('bgmVolume', val);
    };
  }

  // 9. Screen Shake Toggle
  const shakeToggle = modal.querySelector('#setting-screen-shake');
  if (shakeToggle) {
    shakeToggle.onchange = (e) => {
      setGameSetting('screenShake', e.target.checked);
    };
  }

  // 10. Loot Light Beams Toggle
  const beamsToggle = modal.querySelector('#setting-loot-beams');
  if (beamsToggle) {
    beamsToggle.onchange = (e) => {
      setGameSetting('showLootBeams', e.target.checked);
    };
  }

  // 11. Particles Quality Select
  const partSelect = modal.querySelector('#setting-particles-quality');
  if (partSelect) {
    partSelect.onchange = (e) => {
      setGameSetting('particlesQuality', e.target.value);
    };
  }

  // 12. Auto Loot Toggle
  const autoLootToggle = modal.querySelector('#setting-auto-loot');
  if (autoLootToggle) {
    autoLootToggle.onchange = (e) => {
      setGameSetting('autoLootCurrencies', e.target.checked);
    };
  }

  // 13. Force Save Action
  const btnForceSave = modal.querySelector('#btn-force-save-action');
  if (btnForceSave) {
    btnForceSave.onclick = async () => {
      btnForceSave.disabled = true;
      btnForceSave.textContent = '⏳ Đang lưu...';
      await saveToDatabase(true);
      showDataFeedback(t('settings.save_success'), 'success');
      btnForceSave.disabled = false;
      btnForceSave.textContent = '💾 Lưu Ngay';
    };
  }

  // 14. Export Backup JSON Action
  const btnExport = modal.querySelector('#btn-export-backup-action');
  if (btnExport) {
    btnExport.onclick = () => {
      exportSaveDataAsJson();
    };
  }

  // 15. Import Backup JSON Action
  const btnImport = modal.querySelector('#btn-import-backup-action');
  const inputImport = modal.querySelector('#input-import-backup');
  if (btnImport && inputImport) {
    btnImport.onclick = () => inputImport.click();
    inputImport.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        importSaveDataFromJson(file);
      }
    };
  }
}

function showDataFeedback(msg, type = 'success') {
  const fb = document.getElementById('settingsDataFeedback');
  if (!fb) return;
  fb.textContent = msg;
  fb.className = `settings-notify-msg ${type}`;
  fb.style.display = 'block';
  setTimeout(() => {
    if (fb) fb.style.display = 'none';
  }, 4000);
}

function exportSaveDataAsJson() {
  const exportPayload = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    character: player,
    settings: gameSettings
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `mdg_save_${player.name || 'hero'}_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showDataFeedback(t('settings.export_success'), 'success');
}

function importSaveDataFromJson(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed || !parsed.character) {
        showDataFeedback(t('settings.import_error'), 'error');
        return;
      }

      Object.assign(player, parsed.character);
      if (parsed.settings) {
        gameSettings = { ...DEFAULT_SETTINGS, ...parsed.settings };
        saveGameSettings();
      }

      await saveToDatabase(true);
      showDataFeedback(t('settings.import_success'), 'success');
      spawnDamageNumber(player.x, player.y - 60, 'RESTORED HERO SAVE DATA', true, '#00e676');
    } catch (err) {
      console.error('Failed to import JSON save:', err);
      showDataFeedback(t('settings.import_error'), 'error');
    }
  };
  reader.readAsText(file);
}
