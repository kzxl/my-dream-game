/**
 * MDG: Aethelis - Bilingual (i18n) Engine
 * Languages: Vietnamese ('vi' 🇻🇳) & English ('en' 🇬🇧)
 */

export const DICTIONARY = {
  vi: {
    // --- HUD & Main Bar ---
    'hud.online': '🟢 Trực Tuyến',
    'hud.offline': '🔴 Ngoại Tuyến',
    'hud.ascend_ready': '⭐ Đột Phá Nghề Nghiệp!',
    'hud.account_login': '🔑 Tài Khoản / Đăng Nhập',
    'hud.roster': '👥 Nhân Vật (P)',
    'hud.bestiary': '📖 Quái Vật (Y)',
    'hud.forge': '🔨 Bàn Rèn (B)',
    'hud.rifts': '🌌 Hư Không (O)',
    'hud.devotion': '✨ Tinh Tú (V)',
    'hud.stash': '📦 Rương Đồ (X)',
    'hud.pet_sell': '🐾 Bán Thú Cưng',
    'hud.spire': '🗼 Tháp Vô Tận (U)',
    'hud.map': '🗺️ Bản Đồ (M)',
    'hud.skills': '⚡ Kỹ Năng (K)',
    'hud.bag': '🎒 Túi Đồ (I)',
    'hud.stats': '📊 Chỉ Số (C)',
    'hud.settings': '⚙️ Cài Đặt (ESC)',
    'hud.zoom_reset': '1x',
    'hud.channel': '🌐 Kênh',
    'hud.controls_hint': '🎮 <b>WASD</b>: Di chuyển | <b>I</b>: Túi | <b>K</b>: Kỹ năng | <b>C</b>: Chỉ số | <b>B</b>: Rèn | <b>Y</b>: Quái | <b>P</b>: Nhân vật | <b>O</b>: Hư không | <b>V</b>: Tinh tú | <b>X</b>: Rương | <b>M</b>: Bản đồ | <b>F</b>: Tương tác | <b>ESC</b>: Cài đặt / Đóng',

    // --- Inventory & Equipment ---
    'inv.main_title': '🎒 TÚI ĐỒ & TRANG BỊ',
    'inv.sub_title': 'Kho Vũ Khí & Bảo Vật Aethelis',
    'inv.search_placeholder': 'Tìm vật phẩm, chỉ số, phẩm cấp...',
    'inv.equipped_gear': '⚔️ TRANG BỊ HIỆN TẠI',
    'inv.gear_score': 'Lực Chiến:',
    'inv.active_set_bonuses': '🌿 HIỆU ỨNG BỘ TRANG BỊ',
    'inv.total_gear_bonuses': '📊 TỔNG CHỈ SỐ TRANG BỊ',
    'inv.stat_armor': 'Giáp:',
    'inv.stat_es': 'Lá Chắn Năng Lượng:',
    'inv.stat_phys': 'Sát Thương Vật Lý:',
    'inv.stat_elem': 'Sát Thương Nguyên Tố:',
    'inv.stat_res': 'Kháng Toàn Phần:',
    'inv.stat_crit': 'Chí Mạng (Tỷ lệ/Sát thương):',
    'inv.stat_speed': 'Tốc Độ Di Chuyển:',
    'inv.stat_as': 'Tốc Độ Đánh/Phép:',
    'inv.tab_all': 'Tất Cả',
    'inv.tab_weapon': 'Vũ Khí',
    'inv.tab_armor': 'Giáp Trụ',
    'inv.tab_accessory': 'Trang Sức',
    'inv.tab_currency': 'Tiền Tệ',
    'inv.tab_consumable': 'Dược Phẩm',
    'inv.sort_btn': '⚡ Sắp Xếp',
    'inv.sort_rarity': 'Phẩm Cấp',
    'inv.sort_ilvl': 'Cấp Vật Phẩm',
    'inv.sort_type': 'Phân Loại',
    'inv.slot_helm': 'NÓN',
    'inv.slot_amulet': 'DÂY CHUYỀN',
    'inv.slot_mainhand': 'TAY CHÍNH',
    'inv.slot_chest': 'ÁO GIÁP',
    'inv.slot_offhand': 'TAY PHỤ',
    'inv.slot_ring': 'NHẪN',
    'inv.slot_boots': 'GIÀY',
    'inv.hint_footer': '💡 <b>Chuột trái</b>: Chọn/Trang bị | <b>Chuột phải</b>: Thao tác nhanh | <b>Kéo thả</b>: Di chuyển | <b>Alt+Chuột trái</b>: Khóa',

    // --- Context Menu ---
    'ctx.equip': '⚡ Trang Bị / Sử Dụng',
    'ctx.lock': '🔒 Khóa / Mở Khóa Vật Phẩm',
    'ctx.pet': '🐾 Chuyển Vào Thú Cưng',
    'ctx.stash': '📦 Chuyển Vào Hòm Chung',
    'ctx.forge': '🔨 Đặt Lên Bàn Rèn',
    'ctx.drop': '🗑️ Vứt Ra Đất',

    // --- Character Attributes (Stats Modal) ---
    'stats.main_title': '📊 THUỘC TÍNH & PHÒNG THỦ NHÂN VẬT',
    'stats.primary_attr': '💪 THUỘC TÍNH NỀN TẢNG',
    'stats.str': '💪 SỨC MẠNH (STR)',
    'stats.dex': '🏹 KHÉO LÉO (DEX)',
    'stats.int': '🔮 TRÍ TUỆ (INT)',
    'stats.str_desc': '+2 Máu & +0.4% Sát Thương Vật Lý mỗi điểm',
    'stats.dex_desc': '+2 Độ Chính Xác & +2 Né Tránh mỗi điểm',
    'stats.int_desc': '+2 Năng Lượng & +0.5% Lá Chắn Năng Lượng mỗi điểm',
    'stats.move_speed': 'Tốc Độ Di Chuyển:',
    'stats.life_regen': 'Hồi Phục Máu:',
    'stats.mana_regen': 'Hồi Phục Năng Lượng:',
    'stats.defenses': '🛡️ PHÒNG NGỰ & KHÁNG CỰ',
    'stats.armor_rating': 'Chỉ Số Giáp:',
    'stats.evasion_rating': 'Chỉ Số Né Tránh:',
    'stats.block_chance': 'Tỷ Lệ Đỡ Đòn:',
    'stats.es_recharge': 'Hồi Phục Lá Chắn:',
    'stats.fire_res': '🔥 Kháng Lửa',
    'stats.cold_res': '❄️ Kháng Băng',
    'stats.light_res': '⚡ Kháng Lôi',
    'stats.chaos_res': '☠️ Kháng Hỗn Loạn',
    'stats.offenses': '⚔️ SỨC MẠNH TẤN CÔNG',
    'stats.dps': 'Sát Thương Mỗi Giây (DPS):',
    'stats.phys_dmg': 'Sát Thương Đòn Đánh:',
    'stats.fire_dmg': 'Sát Thương Kèm Lửa:',
    'stats.atk_speed': 'Tốc Độ Tấn Công:',
    'stats.crit_chance': 'Tỷ Lệ Chí Mạng:',
    'stats.crit_multi': 'Sát Thương Chí Mạng:',
    'stats.accuracy': 'Độ Chính Xác:',
    'stats.penetration': 'Xuyên Kháng Nguyên Tố:',
    'stats.hint_footer': '💡 Thuộc tính gốc tự động gia tăng theo Cấp độ, Đột phá Nghề nghiệp và Trang bị.',

    // --- Skills & Skill Gems ---
    'skills.main_title': '⚡ CÂY KỸ NĂNG & ĐỘ THÔNG THẠO (NGỌC KỸ NĂNG)',
    'skills.sp_available': 'Điểm Kỹ Năng Khả Dụng:',
    'skills.sp_hint': 'Nhận 1 SP mỗi khi lên cấp nhân vật hoặc rèn luyện qua chiến đấu thực tế!',

    // --- Defeat Modal ---
    'defeat.title': 'BẠN ĐÃ GỤC NGÃ',
    'defeat.sub': 'Sinh lực của bạn đã cạn kiệt trước hiểm nguy nơi cõi Aethelis.',
    'defeat.hero': 'Anh Hùng:',
    'defeat.class': 'Nghề Nghiệp:',
    'defeat.loc': 'Vị Trí Gục Ngã:',
    'defeat.town_btn': 'QUY VỀ THÀNH THỊ',
    'defeat.town_desc': 'Hồi phục 100% Máu & Năng Lượng, an toàn rút lui về Thánh Địa Haven.',
    'defeat.town_badge': 'Miễn Phí • Sanctuary Haven',
    'defeat.revive_btn': 'HỒI SINH TẠI CHỖ',
    'defeat.revive_desc': 'Đứng dậy ngay tức thì với 100% Máu và 3.5s Khiên Bất Tử.',
    'defeat.scroll_badge': '📜 Cuộn Hồi Sinh: x{0}',
    'defeat.attempts_badge': '⚡ Lượt Hồi Sinh Bản Đồ: {0}/5',
    'defeat.hint': '💡 Mẹo: Nhặt Cuộn Hồi Sinh từ Boss, Quái Tinh Anh hoặc mua tại Cửa Hàng.',

    // --- Settings Modal ---
    'settings.title': '⚙️ CÀI ĐẶT TRÒ CHƠI',
    'settings.sub': 'Tùy chỉnh Trải nghiệm, Ngôn ngữ, Đồ họa, Âm thanh & Dữ liệu',
    'settings.tab_general': '🌐 Ngôn Ngữ & Giao Diện',
    'settings.tab_audio': '🔊 Âm Thanh',
    'settings.tab_graphics': '🖥️ Đồ Họa & Hiệu Năng',
    'settings.tab_gameplay': '⚔️ Lối Chơi & Trợ Năng',
    'settings.tab_data': '💾 Dữ Liệu & Sao Lưu',

    'settings.lang_select': 'Ngôn Ngữ Hiển Thị (Display Language)',
    'settings.lang_vi': 'Tiếng Việt 🇻🇳 (Vietnamese)',
    'settings.lang_en': 'English 🇬🇧 (Tiếng Anh)',
    'settings.show_dmg_nums': 'Hiển Thị Số Sát Thương Bay (Floating Damage Numbers)',
    'settings.show_dmg_nums_desc': 'Hiển thị lượng sát thương nhảy số khi tung đòn đánh hoặc phép thuật.',
    'settings.show_enemy_hp': 'Thanh Máu Quái Vật Trên Đầu (Monster Health Bars)',
    'settings.show_enemy_hp_desc': 'Hiển thị thanh máu nổi của quái vật trong tầm nhìn.',
    'settings.show_tooltips_comp': 'So Sánh Trang Bị Trực Quan (Side-by-side Tooltips)',
    'settings.show_tooltips_comp_desc': 'Tự động hiển thị trang bị đang mặc bên cạnh để dễ so sánh.',

    'settings.master_vol': 'Âm Lượng Tổng (Master Volume)',
    'settings.sfx_vol': 'Hiệu Ứng Âm Thanh (SFX Volume)',
    'settings.bgm_vol': 'Nhạc Nền (Music / BGM Volume)',
    'settings.mute_all': 'Tắt Toàn Bộ Âm Thanh (Mute All)',

    'settings.screen_shake': 'Rung Màn Hình Khi Chí Mạng (Screen Shake on Crit)',
    'settings.screen_shake_desc': 'Tạo độ nảy và rung giật màn hình khi gây sát thương chí mạng.',
    'settings.loot_beams': 'Chùm Sáng Vật Phẩm Rơi (Loot Rarity Beams)',
    'settings.loot_beams_desc': 'Chiếu cột sáng thẳng đứng theo độ hiếm của đồ rơi ra đất.',
    'settings.particles_density': 'Mật Độ Hiệu Ứng Hạt (Particle VFX Quality)',
    'settings.particles_high': 'Cao (Đẹp nhất, nhiều hiệu ứng)',
    'settings.particles_med': 'Vừa (Cân bằng hiệu năng)',
    'settings.particles_low': 'Thấp (Tối ưu cho máy yếu)',

    'settings.auto_loot': 'Tự Động Nhặt Tiền Tệ & Nguyên Liệu (Auto-Loot Currencies & Materials)',
    'settings.auto_loot_desc': 'Tự động hút vàng, đá rèn và nguyên liệu chế tác khi đi ngang qua.',
    'settings.keybindings_title': '📋 Bảng Tra Cứu Phím Tắt (Keybindings Reference)',

    'settings.force_save': '💾 Lưu Game Ngay Lên Server',
    'settings.force_save_desc': 'Đồng bộ hóa dữ liệu nhân vật và hòm đồ tức thì.',
    'settings.export_json': '📤 Xuất Dữ Liệu Dự Phòng (Export JSON)',
    'settings.export_json_desc': 'Tải tệp JSON chứa toàn bộ dữ liệu nhân vật để lưu trữ cục bộ.',
    'settings.import_json': '📥 Nhập Dữ Liệu Khôi Phục (Import JSON)',
    'settings.import_json_desc': 'Khôi phục nhân vật từ tệp sao lưu JSON trên máy tính.',
    'settings.save_success': '✅ Đã lưu dữ liệu thành công!',
    'settings.export_success': '✅ Đã xuất tệp sao lưu thành công!',
    'settings.import_success': '✅ Đã khôi phục dữ liệu thành công!',
    'settings.import_error': '❌ Tệp dữ liệu không hợp lệ hoặc bị lỗi!',

    // --- Chat & Zones ---
    'chat.placeholder': 'Nhập tin nhắn kênh khu vực...',
    'chat.send': 'Gửi',
    'chat.welcome': 'Chào mừng đến với thế giới Aethelis. Đã kết nối máy chủ SignalR.',
    'zone.haven': 'Thánh Địa Haven',
    'zone.plains': 'Đồng Bằng Gió Thầm',
    'zone.crypt': 'Hầm Mộ Cổ Bị Lãng Quên',
    'zone.tundra': 'Đỉnh Núi Băng Tuyết',
    'zone.caldera': 'Lõi Lửa Núi Lửa Vực Sâu',
    'zone.void': 'Thánh Đường Hư Không Tối Thượng'
  },

  en: {
    // --- HUD & Main Bar ---
    'hud.online': '🟢 Online',
    'hud.offline': '🔴 Offline',
    'hud.ascend_ready': '⭐ Class Ascension Ready!',
    'hud.account_login': '🔑 Account / Login',
    'hud.roster': '👥 Roster (P)',
    'hud.bestiary': '📖 Bestiary (Y)',
    'hud.forge': '🔨 Forge (B)',
    'hud.rifts': '🌌 Rifts (O)',
    'hud.devotion': '✨ Devotion (V)',
    'hud.stash': '📦 Stash (X)',
    'hud.pet_sell': '🐾 Pet Sell',
    'hud.spire': '🗼 Spire (U)',
    'hud.map': '🗺️ Map (M)',
    'hud.skills': '⚡ Skills (K)',
    'hud.bag': '🎒 Bag (I)',
    'hud.stats': '📊 Stats (C)',
    'hud.settings': '⚙️ Settings (ESC)',
    'hud.zoom_reset': '1x',
    'hud.channel': '🌐 Channel',
    'hud.controls_hint': '🎮 <b>WASD</b>: Move | <b>I</b>: Bag | <b>K</b>: Skills | <b>C</b>: Stats | <b>B</b>: Forge | <b>Y</b>: Bestiary | <b>P</b>: Roster | <b>O</b>: Rifts | <b>V</b>: Devotion | <b>X</b>: Stash | <b>M</b>: Map | <b>F</b>: Interact | <b>ESC</b>: Settings / Close',

    // --- Inventory & Equipment ---
    'inv.main_title': '🎒 INVENTORY & EQUIPMENT',
    'inv.sub_title': 'Aethelis Armory & Artifact Vault',
    'inv.search_placeholder': 'Search item, stats, tier, rarity...',
    'inv.equipped_gear': '⚔️ EQUIPPED GEAR',
    'inv.gear_score': 'Gear Score:',
    'inv.active_set_bonuses': '🌿 ACTIVE SET BONUSES',
    'inv.total_gear_bonuses': '📊 TOTAL EQUIPMENT BONUSES',
    'inv.stat_armor': 'Armor:',
    'inv.stat_es': 'Energy Shield:',
    'inv.stat_phys': 'Physical Damage:',
    'inv.stat_elem': 'Elemental Damage:',
    'inv.stat_res': 'All Resistances:',
    'inv.stat_crit': 'Critical (Chance/Damage):',
    'inv.stat_speed': 'Movement Speed:',
    'inv.stat_as': 'Atk/Cast Speed:',
    'inv.tab_all': 'All',
    'inv.tab_weapon': 'Weapons',
    'inv.tab_armor': 'Armor',
    'inv.tab_accessory': 'Jewelry',
    'inv.tab_currency': 'Currency',
    'inv.tab_consumable': 'Usables',
    'inv.sort_btn': '⚡ Sort',
    'inv.sort_rarity': 'Rarity',
    'inv.sort_ilvl': 'Item Lvl',
    'inv.sort_type': 'Category',
    'inv.slot_helm': 'HELM',
    'inv.slot_amulet': 'AMULET',
    'inv.slot_mainhand': 'MAIN HAND',
    'inv.slot_chest': 'CHEST',
    'inv.slot_offhand': 'OFF HAND',
    'inv.slot_ring': 'RING',
    'inv.slot_boots': 'BOOTS',
    'inv.hint_footer': '💡 <b>LMB</b>: Select/Equip | <b>RMB</b>: Quick Action | <b>Drag & Drop</b>: Move/Equip | <b>Alt+LMB</b>: Lock (🔒)',

    // --- Context Menu ---
    'ctx.equip': '⚡ Equip / Use Item',
    'ctx.lock': '🔒 Toggle Lock (Protect)',
    'ctx.pet': '🐾 Send to Pet Mule',
    'ctx.stash': '📦 Send to Stash Vault',
    'ctx.forge': '🔨 Place on Forge Anvil',
    'ctx.drop': '🗑️ Drop to Ground',

    // --- Character Attributes (Stats Modal) ---
    'stats.main_title': '📊 CHARACTER ATTRIBUTES & DEFENSES',
    'stats.primary_attr': '💪 PRIMARY ATTRIBUTES',
    'stats.str': '💪 STRENGTH (STR)',
    'stats.dex': '🏹 DEXTERITY (DEX)',
    'stats.int': '🔮 INTELLIGENCE (INT)',
    'stats.str_desc': '+2 Max Life & +0.4% Melee Physical Damage per point',
    'stats.dex_desc': '+2 Accuracy Rating & +2 Evasion Rating per point',
    'stats.int_desc': '+2 Max Mana & +0.5% Energy Shield per point',
    'stats.move_speed': 'Movement Speed:',
    'stats.life_regen': 'Life Regeneration:',
    'stats.mana_regen': 'Mana Regeneration:',
    'stats.defenses': '🛡️ DEFENSES & RESISTANCES',
    'stats.armor_rating': 'Armor Rating:',
    'stats.evasion_rating': 'Evasion Rating:',
    'stats.block_chance': 'Block Chance:',
    'stats.es_recharge': 'ES Recharge:',
    'stats.fire_res': '🔥 Fire Resistance',
    'stats.cold_res': '❄️ Cold Resistance',
    'stats.light_res': '⚡ Lightning Resistance',
    'stats.chaos_res': '☠️ Chaos Resistance',
    'stats.offenses': '⚔️ OFFENSIVE CAPABILITIES',
    'stats.dps': 'Main-Hand Attack DPS:',
    'stats.phys_dmg': 'Physical Strike Damage:',
    'stats.fire_dmg': 'Fire Damage to Attacks:',
    'stats.atk_speed': 'Attack Speed:',
    'stats.crit_chance': 'Critical Strike Chance:',
    'stats.crit_multi': 'Critical Multiplier:',
    'stats.accuracy': 'Accuracy Rating:',
    'stats.penetration': 'Elemental Penetration:',
    'stats.hint_footer': '💡 Primary Attributes scale automatically with Level, Class Ascension, and Equipped Gear.',

    // --- Skills & Skill Gems ---
    'skills.main_title': '⚡ SKILL TREE & LEVEL UPGRADE (GEM MASTERY)',
    'skills.sp_available': 'Available Skill Points:',
    'skills.sp_hint': 'Earn 1 SP per Character Level or level up skills naturally via combat EXP!',

    // --- Defeat Modal ---
    'defeat.title': 'DEFEATED & WOUNDED',
    'defeat.sub': 'Your life force was exhausted against the perilous threats of Aethelis.',
    'defeat.hero': 'Hero:',
    'defeat.class': 'Class & Tier:',
    'defeat.loc': 'Location of Fall:',
    'defeat.town_btn': 'RETURN TO TOWN',
    'defeat.town_desc': 'Recover 100% Life & Mana, safe retreat to Sanctuary Haven.',
    'defeat.town_badge': 'Free • Sanctuary Haven',
    'defeat.revive_btn': 'REVIVE ON SPOT',
    'defeat.revive_desc': 'Rise instantly on the spot with 100% Life and 3.5s Divine Shield.',
    'defeat.scroll_badge': '📜 Scrolls: x{0}',
    'defeat.attempts_badge': '⚡ Zone Attempts: {0}/5',
    'defeat.hint': '💡 Hint: Acquire Scrolls of Resurrection from boss encounters, elite monsters, or town vendors.',

    // --- Settings Modal ---
    'settings.title': '⚙️ GAME SETTINGS',
    'settings.sub': 'Customize Experience, Language, Graphics, Audio & Data',
    'settings.tab_general': '🌐 Language & Interface',
    'settings.tab_audio': '🔊 Audio',
    'settings.tab_graphics': '🖥️ Graphics & VFX',
    'settings.tab_gameplay': '⚔️ Gameplay & Controls',
    'settings.tab_data': '💾 Data & Backup',

    'settings.lang_select': 'Display Language',
    'settings.lang_vi': 'Tiếng Việt 🇻🇳 (Vietnamese)',
    'settings.lang_en': 'English 🇬🇧 (English)',
    'settings.show_dmg_nums': 'Floating Damage Numbers',
    'settings.show_dmg_nums_desc': 'Display floating damage numbers when hitting enemies with attacks or spells.',
    'settings.show_enemy_hp': 'Monster Overhead Health Bars',
    'settings.show_enemy_hp_desc': 'Show overhead health bars above visible enemies in combat.',
    'settings.show_tooltips_comp': 'Side-by-Side Equipment Comparison',
    'settings.show_tooltips_comp_desc': 'Show equipped item comparison tooltip when hovering inventory items.',

    'settings.master_vol': 'Master Volume',
    'settings.sfx_vol': 'Sound Effects (SFX Volume)',
    'settings.bgm_vol': 'Music & Ambient (BGM Volume)',
    'settings.mute_all': 'Mute All Audio',

    'settings.screen_shake': 'Screen Shake on Critical Hit',
    'settings.screen_shake_desc': 'Trigger camera shake on critical strikes and heavy explosions.',
    'settings.loot_beams': 'Loot Rarity Light Beams',
    'settings.loot_beams_desc': 'Display vertical glowing light beams for dropped valuable items.',
    'settings.particles_density': 'Particle VFX Quality',
    'settings.particles_high': 'High (Full particle effects & sparks)',
    'settings.particles_med': 'Medium (Balanced performance)',
    'settings.particles_low': 'Low (Optimized for low-end devices)',

    'settings.auto_loot': 'Auto-Loot Currencies & Materials',
    'settings.auto_loot_desc': 'Automatically collect gold, crafting catalysts, and materials when walking nearby.',
    'settings.keybindings_title': '📋 Keybindings Quick Reference',

    'settings.force_save': '💾 Force Save to Cloud Server',
    'settings.force_save_desc': 'Immediately sync character progression and inventory to database.',
    'settings.export_json': '📤 Export Backup JSON',
    'settings.export_json_desc': 'Download character and stash save state file to your computer.',
    'settings.import_json': '📥 Import Backup JSON',
    'settings.import_json_desc': 'Restore hero state from a previously saved JSON file.',
    'settings.save_success': '✅ Game data saved successfully!',
    'settings.export_success': '✅ Backup file exported successfully!',
    'settings.import_success': '✅ Data imported and restored successfully!',
    'settings.import_error': '❌ Invalid backup file format!',

    // --- Chat & Zones ---
    'chat.placeholder': 'Say something in zone...',
    'chat.send': 'Send',
    'chat.welcome': 'Welcome to Aethelis. Connected to SignalR GameHub.',
    'zone.haven': 'Sanctuary Haven',
    'zone.plains': 'Whispering Plains',
    'zone.crypt': 'Forgotten Crypts',
    'zone.tundra': 'Frozen Spires',
    'zone.caldera': 'Volcanic Core Caldera',
    'zone.void': 'Pinnacle Void Sanctum'
  }
};

let currentLanguage = localStorage.getItem('mdg_language') || 'vi';

export function getLanguage() {
  return currentLanguage;
}

export function setLanguage(lang) {
  if (lang !== 'vi' && lang !== 'en') lang = 'vi';
  currentLanguage = lang;
  localStorage.setItem('mdg_language', lang);
  applyLocalization();
  window.dispatchEvent(new CustomEvent('mdg:languageChanged', { detail: { language: lang } }));
}

export function t(key, params = {}) {
  const langDict = DICTIONARY[currentLanguage] || DICTIONARY.vi;
  let text = langDict[key] || DICTIONARY.en[key] || key;

  if (typeof params === 'object' && params !== null) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`{${k}}`, v);
    }
  }
  return text;
}

export function applyLocalization(root = document) {
  // 1. Elements with data-i18n
  const elements = root.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.innerHTML = t(key);
    }
  });

  // 2. Elements with data-i18n-title
  const titleElements = root.querySelectorAll('[data-i18n-title]');
  titleElements.forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (key) {
      el.setAttribute('title', t(key));
    }
  });

  // 3. Elements with data-i18n-placeholder
  const placeholderElements = root.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      el.setAttribute('placeholder', t(key));
    }
  });
}
