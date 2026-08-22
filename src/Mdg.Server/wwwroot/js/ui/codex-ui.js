/**
 * MDG: Aethelis - Branching Lore & Storyline Mythos Codex UI (Phím L)
 * 5 Rich Lore Chapters with Dynamic Discovery Progression
 */

import { player } from '../state.js';
import { AudioEngine } from '../audio.js';
import { getLanguage, t } from '../i18n.js';

let activeLoreTab = 'mythos';

export const LORE_CHAPTERS = {
  mythos: {
    id: 'mythos',
    title: { vi: '🌌 Thần Kỷ Cổ Đại & 4 Nguyên Tố', en: '🌌 Primordial Mythos & 4 Elements' },
    icon: '🌌',
    desc: { vi: 'Nguồn gốc vũ trụ Aethelis và 8 Chòm Sao Thần Kỷ', en: 'Cosmic origin of Aethelis and the 8 Astral Constellations' },
    content: {
      vi: `
        <div class="codex-article">
          <div class="codex-banner">
            <h3>🌌 KHỞI NGUYÊN EPOCH 0: TRÁI TIM GENESIS CORE</h3>
            <p>Vào thuở sơ khai, toàn bộ vũ trụ Aethelis được đúc kết từ <b>Genesis Core</b> – một tinh cầu năng lượng vô tận trôi dạt giữa hư vô. Khi lõi khởi nguyên dao động, 4 dòng chảy nguyên tố thuần khiết bộc phát và kiến tạo nên vạn vật:</p>
          </div>
          <div class="codex-grid-4">
            <div class="codex-card fire">
              <div class="card-icon">🔥</div>
              <h4>Solar Ignis</h4>
              <p>Lửa Thiêng Khởi Nguyên: Đại diện cho sức sống mãnh liệt, sự tái sinh bất diệt và nhiệt năng cuồng nộ.</p>
            </div>
            <div class="codex-card cold">
              <div class="card-icon">❄️</div>
              <h4>Abyssal Glacies</h4>
              <p>Băng Cực Vĩnh Cửu: Đại diện cho sự trường tồn, lớp phòng hộ kiên cố và khả năng đóng băng thời gian.</p>
            </div>
            <div class="codex-card light">
              <div class="card-icon">⚡</div>
              <h4>Tempest Fulmen</h4>
              <p>Lôi Đình Cuồng Phong: Biểu tượng của tốc độ ánh sáng, sấm sét thanh trừng và đòn đánh chí mạng.</p>
            </div>
            <div class="codex-card void">
              <div class="card-icon">🔮</div>
              <h4>Astral Umbra</h4>
              <p>Hư Không & Ma Lực: Cội nguồn của trí tuệ Arcane, lá chắn năng lượng (ES) và chiều không gian vô tận.</p>
            </div>
          </div>
          <div class="codex-quote">
            "Từ bốn ngọn nguồn vô tận, các Đại Chòm Sao Thiên Ân (Astral Devotion) thành hình, soi rọi con đường tiến hóa của các bậc hiền nhân."
          </div>
        </div>
      `,
      en: `
        <div class="codex-article">
          <div class="codex-banner">
            <h3>🌌 EPOCH 0: THE PRIMORDIAL GENESIS CORE</h3>
            <p>In the beginning, all existence in Aethelis coalesced from the <b>Genesis Core</b> – an infinite celestial heart adrift in the cosmos. Its primordial pulse gave birth to the 4 Pure Elemental Fonts:</p>
          </div>
          <div class="codex-grid-4">
            <div class="codex-card fire">
              <div class="card-icon">🔥</div>
              <h4>Solar Ignis</h4>
              <p>Sacred Flame of Vitality, fiery wrath, and eternal rebirth from embers.</p>
            </div>
            <div class="codex-card cold">
              <div class="card-icon">❄️</div>
              <h4>Abyssal Glacies</h4>
              <p>Eternal Permafrost of preservation, unyielding warding, and glacial stasis.</p>
            </div>
            <div class="codex-card light">
              <div class="card-icon">⚡</div>
              <h4>Tempest Fulmen</h4>
              <p>Thunder of lightning storms, divine swiftness, and critical devastation.</p>
            </div>
            <div class="codex-card void">
              <div class="card-icon">🔮</div>
              <h4>Astral Umbra</h4>
              <p>Font of Arcane intellect, protective Energy Shields, and dimension warping.</p>
            </div>
          </div>
        </div>
      `
    }
  },

  sundering: {
    id: 'sundering',
    title: { vi: '🏛️ Đại Phân Triệt & Đế Chế Sụp Đổ', en: '🏛️ The Great Sundering' },
    icon: '🏛️',
    desc: { vi: 'Thời hoàng kim Magiteck và sự ra đời của Haven Sanctuary', en: 'The golden Magiteck era and founding of Haven Sanctuary' },
    content: {
      vi: `
        <div class="codex-article">
          <div class="codex-banner">
            <h3>🏛️ KỶ NGUYÊN HOÀNG KIM & THẢM HỌA ĐẠI PHÂN TRIỆT</h3>
            <p>Từng có một thời, nền văn minh Aethelis đạt tới đỉnh cao chưa từng thấy. Họ sáng tạo nên <b>Genesis Forge</b> (Bàn Rèn Khởi Nguyên), học cách dung hợp tinh thể vào trang bị và điều khiển năng lượng dòng chảy Ley Lines.</p>
          </div>
          <div class="codex-split-box">
            <div class="split-col">
              <h4>💀 Bi Kịch Hội Đồng Pháp Sư</h4>
              <p>Vì tham vọng bất tử và làm chủ cội nguồn Hư Không, Hội đồng Đại Pháp Sư đã đục thủng Lớp Màng Không Gian (The Void Veil). Dòng chảy tha hóa tràn ra, biến dã thú thành quái vật đột biến và xóa sổ các siêu đô thành trong một đêm bi kịch.</p>
            </div>
            <div class="split-col">
              <h4>🌿 Pháo Đài Haven Sanctuary</h4>
              <p>Những người sống sót tụ họp dưới tán Cổ Thụ Sylvan Đại Ngàn, dựng nên pháo đài <b>Sanctuary Haven</b> – thành trì an toàn cuối cùng bảo vệ nhân loại trước bóng đêm vô tận.</p>
            </div>
          </div>
        </div>
      `,
      en: `
        <div class="codex-article">
          <div class="codex-banner">
            <h3>🏛️ THE GOLDEN AGE & THE CATACLYSMIC SUNDERING</h3>
            <p>Long ago, mortal kingdoms mastered Runecraft and built the <b>Genesis Forge</b>, forging relics imbued with astral sockets and elemental catalysts.</p>
          </div>
          <div class="codex-split-box">
            <div class="split-col">
              <h4>💀 The Synod's Folly</h4>
              <p>Seeking immortality, the High Synod breached the Void Veil. Corrupting aether swept the world, mutating wildlife into monstrosities and shattering empires.</p>
            </div>
            <div class="split-col">
              <h4>🌿 Haven Sanctuary</h4>
              <p>Refugees gathered beneath the ancient Sylvan Greatwood to found <b>Sanctuary Haven</b> – humanity's last stronghold of light.</p>
            </div>
          </div>
        </div>
      `
    }
  },

  campaign: {
    id: 'campaign',
    title: { vi: '🗺️ Biên Niên Sử 9 Hồi Chiến Dịch', en: '🗺️ 9 Acts Campaign Chronicles' },
    icon: '🗺️',
    desc: { vi: 'Hành trình diệt Boss qua các vùng đất từ Rừng Thiêng đến Genesis Core', en: 'Journey across 9 Acts from Whispering Plains to Genesis Core' },
    content: {
      vi: `
        <div class="codex-article">
          <div class="codex-banner">
            <h3>🗺️ BIÊN NIÊN SỬ 9 HỒI HÀNH TRÌNH HIỆP SĨ</h3>
            <p>Theo dõi tiến trình các vùng đất và trùm cuối từng hồi chiến dịch:</p>
          </div>
          <div class="codex-acts-table-wrap">
            <table class="codex-acts-table">
              <thead>
                <tr>
                  <th>Hồi</th>
                  <th>Phân Vùng</th>
                  <th>Cấp Độ</th>
                  <th>Boss Tối Thượng</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Act I</td><td>🌿 Sylvan Frontier</td><td>Lv. 1 - 15</td><td>🔥 Malakor the Shadow Fiend</td></tr>
                <tr><td>Act II</td><td>❄️ Frozen Spires</td><td>Lv. 15 - 30</td><td>❄️ Cryomancer Vael</td></tr>
                <tr><td>Act III</td><td>🌋 Molten Caldera</td><td>Lv. 30 - 45</td><td>🌋 Lord Ignis the Ash Titan</td></tr>
                <tr><td>Act IV</td><td>🌊 Sunken Catacombs</td><td>Lv. 45 - 55</td><td>🌊 Leviathan Broodlord</td></tr>
                <tr><td>Act V</td><td>🐍 Sunken Fens</td><td>Lv. 55 - 65</td><td>🐍 Queen Venomfang</td></tr>
                <tr><td>Act VI</td><td>⚡ Stormpeak Citadel</td><td>Lv. 65 - 75</td><td>⚡ Tempest Overlord</td></tr>
                <tr><td>Act VII</td><td>🌌 Void Abyss</td><td>Lv. 75 - 85</td><td>🌌 Archon of the Void</td></tr>
                <tr><td>Act VIII</td><td>🐉 Scorched Wastelands</td><td>Lv. 85 - 90</td><td>🐉 Magma Wyrm King</td></tr>
                <tr><td>Act IX</td><td>👑 Genesis Core</td><td>Lv. 90 - 100</td><td>👑 The Corrupted Sovereign</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      `,
      en: `
        <div class="codex-article">
          <div class="codex-banner">
            <h3>🗺️ 9 ACTS CAMPAIGN PROGRESSION CHRONICLES</h3>
            <p>Overview of campaign acts, recommended levels and pinnacle act bosses:</p>
          </div>
          <div class="codex-acts-table-wrap">
            <table class="codex-acts-table">
              <thead>
                <tr><th>Act</th><th>Zone Realm</th><th>Level</th><th>Pinnacle Sovereign</th></tr>
              </thead>
              <tbody>
                <tr><td>Act I</td><td>🌿 Sylvan Frontier</td><td>Lv. 1 - 15</td><td>🔥 Malakor the Shadow Fiend</td></tr>
                <tr><td>Act II</td><td>❄️ Frozen Spires</td><td>Lv. 15 - 30</td><td>❄️ Cryomancer Vael</td></tr>
                <tr><td>Act III</td><td>🌋 Molten Caldera</td><td>Lv. 30 - 45</td><td>🌋 Lord Ignis the Ash Titan</td></tr>
                <tr><td>Act IV</td><td>🌊 Sunken Catacombs</td><td>Lv. 45 - 55</td><td>🌊 Leviathan Broodlord</td></tr>
                <tr><td>Act V</td><td>🐍 Sunken Fens</td><td>Lv. 55 - 65</td><td>🐍 Queen Venomfang</td></tr>
                <tr><td>Act VI</td><td>⚡ Stormpeak Citadel</td><td>Lv. 65 - 75</td><td>⚡ Tempest Overlord</td></tr>
                <tr><td>Act VII</td><td>🌌 Void Abyss</td><td>Lv. 75 - 85</td><td>🌌 Archon of the Void</td></tr>
                <tr><td>Act VIII</td><td>🐉 Scorched Wastelands</td><td>Lv. 85 - 90</td><td>🐉 Magma Wyrm King</td></tr>
                <tr><td>Act IX</td><td>👑 Genesis Core</td><td>Lv. 90 - 100</td><td>👑 The Corrupted Sovereign</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      `
    }
  },

  factions: {
    id: 'factions',
    title: { vi: '👥 Tứ Đại Phe Phái Aethelis', en: '👥 The Four Great Factions' },
    icon: '👥',
    desc: { vi: 'Hội Thánh Thể, Pháp Sư Aetherium, Bóng Tối Du Mục và Dị Tộc Cổ', en: 'Silver Aegis, Arcane Synod, Shadow Weavers, and Ancient Constructs' },
    content: {
      vi: `
        <div class="codex-article">
          <div class="codex-banner">
            <h3>👥 TỨ ĐẠI PHE PHÁI ĐỒNG MINH VÀ HUYỀN THOẠI</h3>
          </div>
          <div class="codex-factions-grid">
            <div class="faction-card">
              <div class="f-header">🛡️ Hội Thánh Thể (Order of Silver Aegis)</div>
              <p><b>Đại diện:</b> Iron Vanguard • <b>Nhân vật:</b> Elder Aethel, Master Doran.</p>
              <p class="f-desc">Những hiệp sĩ thiết giáp kiên cường, giữ vững phòng tuyến bảo vệ người tị nạn.</p>
            </div>
            <div class="faction-card">
              <div class="f-header">🔮 Hội Pháp Sư Aetherium (The Arcane Synod)</div>
              <p><b>Đại diện:</b> Aether Arcanist • <b>Nhân vật:</b> High Scholar Morwen.</p>
              <p class="f-desc">Các học giả nghiên cứu Cổng Không Gian và giải mã sức mạnh nguyên tố khởi nguyên.</p>
            </div>
            <div class="faction-card">
              <div class="f-header">🗡️ Bóng Tối Du Mục (The Shadow Weavers)</div>
              <p><b>Đại diện:</b> Shadow Rogue • <b>Nhân vật:</b> Kaelen the Vault Keeper.</p>
              <p class="f-desc">Những thợ săn tốc độ di chuyển trong bóng đêm, thám hiểm di tích và thu hồi bảo vật.</p>
            </div>
            <div class="faction-card">
              <div class="f-header">⚙️ Dị Tộc Người Kiến Tạo (Ancient Constructs)</div>
              <p><b>Đại diện:</b> Runic Golems & Frostpeak Clans.</p>
              <p class="f-desc">Những cỗ máy cổ đại mang linh hồn bảo vệ mạch ngầm năng lượng Aethelis.</p>
            </div>
          </div>
        </div>
      `,
      en: `
        <div class="codex-article">
          <div class="codex-banner">
            <h3>👥 THE FOUR GREAT FACTIONS OF AETHELIS</h3>
          </div>
          <div class="codex-factions-grid">
            <div class="faction-card">
              <div class="f-header">🛡️ Order of the Silver Aegis</div>
              <p><b>Archetype:</b> Iron Vanguard • <b>Key Figures:</b> Elder Aethel, Master Doran.</p>
              <p class="f-desc">Armored knights devoted to defending Haven refugees and crushing fiends.</p>
            </div>
            <div class="faction-card">
              <div class="f-header">🔮 The Arcane Synod</div>
              <p><b>Archetype:</b> Aether Arcanist • <b>Key Figures:</b> High Scholar Morwen.</p>
              <p class="f-desc">Scholars unlocking leylines, spatial rifts, and elemental spellcraft.</p>
            </div>
            <div class="faction-card">
              <div class="f-header">🗡️ The Shadow Weavers</div>
              <p><b>Archetype:</b> Shadow Rogue • <b>Key Figures:</b> Kaelen the Vault Keeper.</p>
              <p class="f-desc">Deadly scouts traversing ruins to recover forgotten relics.</p>
            </div>
            <div class="faction-card">
              <div class="f-header">⚙️ Ancient Constructs & Clans</div>
              <p><b>Archetype:</b> Runic Golems & Frostpeak Primals.</p>
              <p class="f-desc">Ancient sentinels guarding the subterranean leylines of Genesis.</p>
            </div>
          </div>
        </div>
      `
    }
  },

  endgame: {
    id: 'endgame',
    title: { vi: '🌌 Cổng Vĩnh Hằng & Endgame Rifts', en: '🌌 Astral Gate & Endgame Rifts' },
    icon: '🌌',
    desc: { vi: 'Hệ thống Map Device, Tháp Vô Tận Spire và Trùm Hư Không', en: 'Map Device rift maps, Endless Spire, and Apex Void Sovereigns' },
    content: {
      vi: `
        <div class="codex-article">
          <div class="codex-banner">
            <h3>🌌 VẾT NỨT THỜI KHÔNG & CỔNG VĨNH HẰNG ENDGAME</h3>
            <p>Khi đạt cấp độ đỉnh cao, người chơi kích hoạt <b>Map Device (Phím O)</b> tại trung tâm Haven để bước vào các dòng thời gian song song.</p>
          </div>
          <div class="codex-split-box">
            <div class="split-col">
              <h4>🌌 Mảnh Bản Đồ & Map Affixes</h4>
              <p>Các mảnh Map Tablet sở hữu những dòng thuộc tính biến dị (Monster Turbo, Extra Elemental, Reflect Damage) mang lại phần thưởng Rơi Đồ Thần Thoại và Catalyst cực phẩm.</p>
            </div>
            <div class="split-col">
              <h4>🗼 Tháp Vô Tận (Endless Spire - Phím U)</h4>
              <p>Thử thách 100 tầng tháp ngục tối liên tục, nơi quái vật tăng tiến sức mạnh không giới hạn và ban tặng danh hiệu Monarch.</p>
            </div>
          </div>
        </div>
      `,
      en: `
        <div class="codex-article">
          <div class="codex-banner">
            <h3>🌌 ASTRAL GATE & ENDGAME RIFT SYSTEM</h3>
            <p>At max level, use the <b>Map Device (Key O)</b> in Haven to open portals to shattered alternate timelines.</p>
          </div>
          <div class="codex-split-box">
            <div class="split-col">
              <h4>🌌 Rift Map Affixes</h4>
              <p>Engrave Tablets with dangerous mods (Turbo, Elemental Damage, Reflect) for colossal Item Rarity and Quantity multipliers.</p>
            </div>
            <div class="split-col">
              <h4>🗼 Endless Spire (Key U)</h4>
              <p>Climb 100 floors of relentless battles to claim SSS-Rank Monarch prestige and primordial loot.</p>
            </div>
          </div>
        </div>
      `
    }
  }
};

export function setupCodexUI() {
  const closeBtn = document.getElementById('closeCodexBtn');
  if (closeBtn) {
    closeBtn.onclick = () => toggleCodexModal(false);
  }
}

export function toggleCodexModal(forceOpen = null) {
  const modal = document.getElementById('codexModal');
  if (!modal) return;

  const isHidden = modal.classList.contains('hidden') || modal.style.display === 'none';
  const shouldOpen = forceOpen !== null ? forceOpen : isHidden;

  if (shouldOpen) {
    renderCodexModal();
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    AudioEngine.playTone?.(520, 'triangle', 0.15, 0.1);
  } else {
    modal.classList.add('hidden');
    modal.style.display = 'none';
    AudioEngine.playTone?.(260, 'triangle', 0.12, 0.08);
  }
}

export function renderCodexModal() {
  const contentEl = document.getElementById('codexContent');
  if (!contentEl) return;

  const lang = getLanguage() || 'vi';
  const chapterKeys = Object.keys(LORE_CHAPTERS);

  let navHtml = `<div class="codex-tabs-nav">`;
  chapterKeys.forEach(k => {
    const ch = LORE_CHAPTERS[k];
    const isActive = k === activeLoreTab;
    navHtml += `
      <button class="codex-tab-btn ${isActive ? 'active' : ''}" data-chapter="${k}">
        <span class="tab-icon">${ch.icon}</span>
        <span class="tab-title">${ch.title[lang] || ch.title.vi}</span>
      </button>
    `;
  });
  navHtml += `</div>`;

  const activeChapter = LORE_CHAPTERS[activeLoreTab] || LORE_CHAPTERS.mythos;
  const bodyHtml = `
    <div class="codex-body-pane">
      ${activeChapter.content[lang] || activeChapter.content.vi}
    </div>
  `;

  contentEl.innerHTML = `
    <div class="codex-modal-layout">
      ${navHtml}
      ${bodyHtml}
    </div>
  `;

  // Bind tab switching
  contentEl.querySelectorAll('.codex-tab-btn').forEach(btn => {
    btn.onclick = () => {
      activeLoreTab = btn.getAttribute('data-chapter');
      AudioEngine.playTone?.(600, 'sine', 0.08, 0.05);
      renderCodexModal();
    };
  });
}
