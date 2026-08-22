# MDG: Aethelis - Báo Cáo Rà Soát Toàn Diện Thiết Kế & Chuẩn Hóa Kiến Trúc Hệ Thống
*Tài liệu tổng hợp đối chiếu chéo 18 bản thiết kế, giải quyết mâu thuẫn tính năng và xác lập Single Source of Truth*

---

## 1. Bảng Đối Chiếu Chéo 18 Phân Hệ Thiết Kế (Cross-System Consistency Matrix)

Dưới đây là kết quả rà soát toàn bộ 18 tài liệu thiết kế trong thư mục `docs/design/` đối chiếu với mã nguồn thực tế:

| STT | Tài Liệu Thiết Kế | Phân Hệ | Trọng Tâm Thiết Kế | Đối Chiếu Triển Khai Thực Tế | Đánh Giá Tính Nhất Quán |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **1** | `arpg_mechanics_synthesis.md` | Core RPG | Tiến trình 4 Bậc (Novice -> 3 Ascendant Archetypes), Support Links | Đã khớp với `data/skills.js`, `save-system.js` | Nhất quán 100% |
| **2** | `gameplay_progression_and_systems.md` | Gameplay Loop | Vòng lặp RPG, 8 Catalysts & Cores, 3 Tầng Thế Giới, SAO Inspirations | Khớp với `main.js`, `items.js`, `zones.js` | Nhất quán 100% |
| **3** | `combat_formulas_and_mitigation_design.md` | Combat Engine | 5 bước Outgoing Damage, 6 lớp Giảm Thương, Phạt Kháng theo Act | Khớp với `combat.js`, `ServerAuthoritativeServicesTests.cs` | Nhất quán 100% |
| **4** | `item_affixes_and_crafting_mod_system_design.md` | Itemization | 3 Prefixes + 3 Suffixes, 5 Tiers iLvl, 8 Genesis Catalysts | Khớp với `items.js`, `forge-ui.js`, `GenesisCraftingEngine.cs` | Nhất quán 100% |
| **5** | `crafting_materials_and_salvage_system_design.md` | Crafting 2.0 | 4 Nhóm Nguyên Liệu (Khoáng thạch, Da thú, Thảo dược, Lõi), Bàn Phân Rã | Bổ trợ cho Genesis Catalysts, không xung đột | Nhất quán 100% |
| **6** | `monster_affixes_and_boss_phases_design.md` | Monster AI | 4 Bậc quái, 8 Affixes quái tinh anh, Hào quang chia sẻ, Boss 3 Phases | Khớp với `monsters.js`, `renderer.js` | Nhất quán 100% |
| **7** | `monster_lore_mastery_design.md` | Hunter Lore | 4 Cột mốc tiêu diệt quái, Mở khóa chỉ số và điểm yếu | Kế thừa và nâng cấp thành Sương mù tuyệt đối | Đã chuẩn hóa |
| **8** | `monster_mastery_and_difficulty_overhaul_design.md` | Bestiary Overhaul | Sương Mù Khám Phá Tuyệt Đối, Cây Thiên Phú 3 Nhánh (Harvest/Combat/Survival) | Khớp với `bestiary-ui.js`, `data/monsters.js` | Nhất quán 100% |
| **9** | `multiplayer_and_character_roster_architecture.md` | Network / Cloud | Multi-character Roster, Shared Stash, 4 Kênh Thế Giới SignalR | Khớp với `GameHub.cs`, `roster-ui.js`, `hud.js` | Nhất quán 100% |
| **10** | `shrines_and_celestial_blessings_design.md` | Environment | 7 Đền Thần Chúc Phúc, Không xuất hiện ở Haven, 1-2 đền/map, Channeling 2.5s | Khớp với `data/shrines.js`, `main.js`, `renderer.js` | Nhất quán 100% |
| **11** | `fog_of_war_and_minimap_exploration_design.md` | Exploration | Sương mù đen Obsidian, Tầm nhìn 7 tiles, Ẩn quái ngoài tầm nhìn (320px) | Khớp với `renderer.js`, `main.js` | Nhất quán 100% |
| **12** | `branching_lore_and_storyline_codex_design.md` | Lore & Narrative | 5 Đại Nhánh Cốt Truyện, 8 Chòm Sao Thần Kỷ, Biên Niên Sử 9 Hồi Chiến Dịch | Khớp với `data/lore.js`, `bestiary-ui.js` | Nhất quán 100% |
| **13** | `map_biomes_and_environmental_hazards_design.md` | Map Engine | Biomes môi trường, Vực dung nham, Đầm lầy độc, Bão tuyết | Khớp với `map-generator.js`, `zones.js` | Nhất quán 100% |
| **14** | `skill_gem_and_mastery_tree_design.md` | Skills System | Cây Tinh Hoa Kỹ Năng (Per-Skill Mastery), Keystones Morphs, GMP | Khớp với `data/skills.js`, `skills-ui.js` | Nhất quán 100% |
| **15** | `design_system_synthesis_and_consistency_audit.md` | Meta Standard | Báo cáo rà soát, giải quyết mâu thuẫn & Single Source of Truth | Tài liệu tổng hòa kiến trúc toàn dự án | Chuẩn hóa cao nhất |
| **16** | `combat_resolution_and_leech_cap_design.md` | Combat Resolution | Xuyên Kháng, Exposure, Curses Order of Operations & Leech Cap 20%/s | Khớp với `LeechEngine.cs`, `DamageCalculator.cs`, `combat.js` | Nhất quán 100% |
| **17** | `asynchronous_marketplace_and_economy_design.md` | Economy | Chợ Giao Thương Haven Trade Board, Thuế Vàng 5% Gold Sink | Khớp với `MarketService.cs`, `trade-market-ui.js`, `Program.cs` | Nhất quán 100% |
| **18** | `gamepad_controls_and_netcode_reconciliation_design.md` | Input & Netcode | Gamepad Controls, Soft Target Auto-Lock, Radial Menu, Smooth Lerp | Khớp với `gamepad-controller.js`, `multiplayer-client.js` | Nhất quán 100% |

---

## 2. Rà Soát & Xử Lý Các Mâu Thuẫn Tính Năng Tiềm Tàng

### 2.1. Chuẩn Hóa Danh Xưng Hệ Phái (Class & Ascendance Naming)
* **Vấn đề phát hiện:** Trong `arpg_mechanics_synthesis.md` sử dụng tên mô tả (*Iron Vanguard*, *Aether Seeker*, *Shadow Syndicate*), trong khi cơ sở dữ liệu `Characters.ClassSpec` và `roster-ui.js` dùng mã định danh `Vanguard`, `Arcanist`, `ShadowRogue`.
* **Quy chuẩn giải quyết (Single Source of Truth):**
  * **Mã kỹ thuật (Enums / DB):** `'Novice'`, `'Vanguard'`, `'Arcanist'`, `'ShadowRogue'`.
  * **Danh hiệu hiển thị (Display Title):**
    1. `Novice` -> **The Unbound Novice** (Kẻ Khởi Đầu Vô Định).
    2. `Vanguard` -> **Iron Vanguard** (Hiệp Sĩ Thánh Thể - Giáp & Khiên Trọng Sĩ).
    3. `Arcanist` -> **Aether Arcanist** (Đại Pháp Sư Cổ Ngữ - Ma Pháp & Khiên ES).
    4. `ShadowRogue` -> **Shadow Nightshade** (Bóng Ma Du Mục - Độc Dược & Bạo Kích).

---

### 2.2. Phân Định Giữa Tinh Thể Khởi Nguyên (Catalysts) vs Nguyên Liệu Chế Tác (Materials)
* **Vấn đề phát hiện:** Có sự xuất hiện của hai phân hệ chế tác: **Genesis Crafting** (8 loại Tinh thể Catalysts & Cores) và **Crafting Materials & Salvage** (Khoáng thạch, Da thú, Thảo dược).
* **Quy chuẩn giải quyết (Non-Collision Architecture):**
  * **Nhóm 1 - Genesis Catalysts & Cores (8 loại):** Là *Tiền tệ Luyện kim trực tiếp (Currency)*. Dùng để can thiệp vào Affixes, Reroll mods, đục lỗ Sockets và nối Socket Links trên trang bị hiện có.
  * **Nhóm 2 - Raw Materials & Beast Parts (13 loại):** Là *Nguyên liệu Thô*. Dùng để Đúc Phôi Trang Bị Mới (Base Item Forging), Phân rã đồ rác (Salvage Anvil) và Pha chế Dược phẩm (Alchemy Flasks).
  * **Cơ chế ô chứa:** Cả 2 nhóm đều có cơ chế **Auto-Stack 9999** và có ngăn chứa riêng, không làm chiếm dụng 16 ô chứa của Túi Trang Bị (`BackpackJson`).

---

### 2.3. Cây Chòm Sao Thiên Ân (Devotion Tree) vs Thần Thoại 8 Đại Chòm Sao
* **Vấn đề phát hiện:** Trong `branching_lore_and_storyline_codex_design.md` đề cập 8 chòm sao thần thoại, trong khi giao diện Devotion UI (`devotionModal`) và mã nguồn `devotion-ui.js` vận hành 4 chòm sao chính.
* **Quy chuẩn giải quyết:**
  * **4 Chòm Sao Chiến Đấu Trực Tiếp (Active Combat Procs):**
    1. *The Solar Phoenix* -> Kích hoạt `ph_proc` (*Phoenix Firestorm* khi Crit).
    2. *The Frost Warden* -> Kích hoạt `fw_proc` (*Glacial Barrier* khi máu < 35%).
    3. *The Thunder Lord* -> Kích hoạt `tl_proc` (*Chain Lightning* 25% khi trúng đòn).
    4. *The Void Reaper* -> Kích hoạt `vr_proc` (*Void Siphon* hồi Máu & ES khi diệt quái).
  * **4 Biểu Tượng Thần Khí Thế Giới (World Alignment Lore):** Là 4 chòm sao thần thoại đại diện cho các trường phái triết học và phe phái lớn của lục địa Aethelis (*Silver Aegis*, *Shadow Viper*, *Aether Weaver*, *Cataclysmic Titan*), mở rộng cốt truyện không làm rối bảng nâng cấp kỹ năng.

---

### 2.4. Phân Tách Quyền Hạn Dữ Liệu: Toàn Tài Khoản (Account-Wide) vs Từng Nhân Vật (Character-Specific)
* **Quy chuẩn thiết kế được thống nhất toàn diện:**

| Hạng Mục Dữ Liệu | Phạm Vi (Scope) | Cơ Chế Lưu Trữ DB | Ý Nghĩa Trải Nghiệm |
| :--- | :---: | :--- | :--- |
| **Cấp Độ & Kinh Nghiệm** | Nhân vật | Cột `Level`, `CurrentExp` bảng `Characters` | Mỗi nhân vật cày cấp độc lập |
| **Trang Bị & Túi Đồ Mang Theo** | Nhân vật | Cột `EquippedJson`, `BackpackJson` | Tự do trang bị build riêng |
| **Cây Kỹ Năng (Skill Mastery)** | Nhân vật | Cột `SkillsJson` | Tùy biến nhánh kỹ năng cho từng nhân vật |
| **Điểm Chòm Sao (Devotion Tree)** | Nhân vật | Cột `DevotionNodesJson` | Build hướng Devotion phù hợp từng Class |
| **Tiến Trình Nhiệm Vụ 9 Hồi** | Nhân vật | Cột `CompletedQuestsJson`, `ActiveQuestsJson` | Trải nghiệm cốt truyện từ đầu |
| **Rương Đồ Chung (Shared Stash)** | **Toàn Tài Khoản** | Bảng `SharedStash` (Key theo `AccountId`) | Chuyển đồ Unique, Ngọc xịn cho nhân vật phụ |
| **Điểm Mở Khóa Codex (Bestiary)** | **Toàn Tài Khoản** | Cột `MonsterKillsJson` / Cache Tài Khoản | Dữ liệu khám phá quái vật được bảo lưu |
| **Định Danh Kênh (World Channel)** | Phiên chơi | `localStorage.mdg_current_channel` | Nhớ kênh đã chọn giữa các lần mở game |

---

### 2.5. Xác Nhận Triết Lý Không Độ Bền Trang Bị (No-Durability & No-Repair Tax Policy)
* **Quy chuẩn thiết kế:** Aethelis **KHÔNG áp dụng cơ chế độ bền trang bị (Durability)** và không thu phí sửa chữa (Repair cost).
* **Lý do thiết kế:**
  1. Tránh làm gián đoạn nhịp chơi dồn dập (Fast-paced ARPG loop) bằng việc ép người chơi phải teleport về làng sửa đồ sau mỗi lần chết.
  2. Nền kinh tế được điều tiết bằng các Gold Sink hiện đại và hiệu quả hơn: **Thuế giao dịch 5% Chợ Haven**, phí mở Rift Device, phí tẩy điểm Kỹ năng & Devotion, và hình phạt mất 10% Exp khi tử trận ở Endgame.

---

## 3. Bản Đồ Phím Tắt Toàn Cục Chuẩn Hóa (Unified Master Hotkeys)

Mọi phím tắt trong game đã được đồng bộ chuẩn mực:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              MASTER CONTROLS & HOTKEYS                                 │
├───────────────┬──────────────────────────────────┬─────────────────────────────────────┤
│ PHÍM / NÚT    │ CHỨC NĂNG CHÍNH                  │ GIAO DIỆN MODAL TƯƠNG ỨNG           │
├───────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ W, A, S, D    │ Di chuyển nhân vật 8 hướng       │ Viewport Game                       │
│ Gamepad L-Stk │ Di chuyển mượt 360 độ (Gamepad)  │ Viewport Game                       │
│ Gamepad R-Stk │ Ngắm bắn & Soft Target Auto-Lock │ Viewport Game                       │
│ LMB (Chuột T) │ Tấn công cơ bản / Đánh chiêu     │ Combat Engine                       │
│ RMB (Chuột P) │ Tung kỹ năng phụ (Fireball)      │ Combat Engine                       │
│ Space         │ Lướt né đòn (Dash)               │ Combat Engine                       │
│ F             │ Nhặt đồ / Tương tác NPC / Shrines│ Interactive World                   │
│ I             │ Mở Túi Đồ & Trang Bị (Inventory) │ #inventory-modal                    │
│ K             │ Cây Tinh Hoa Kỹ Năng (Skill Tree)│ #skills-modal                       │
│ C             │ Bảng Chỉ Số Thuộc Tính (Stats)   │ #stats-modal                        │
│ B             │ Bàn Rèn Khởi Nguyên (Forge Bench)│ #forgeModal                         │
│ Y             │ Bách Khoa Quái Vật & Lore Codex  │ #bestiaryModal                      │
│ T             │ Chợ Giao Thương Haven Trade Board│ #marketModal                        │
│ G             │ Trích Xuất Hồn Ma (Shadow Army)  │ Shadow Extraction System            │
│ Tab           │ Vòng Điều Hướng Tròn Radial Wheel│ #radialMenuOverlay                  │
│ M             │ Bản Đồ Thế Giới & Atlas Viễn Chinh│ #worldmap-modal                     │
│ ESC           │ Đóng toàn bộ Modal / Mở Settings │ #settingsModal                      │
└───────────────┴──────────────────────────────────┴─────────────────────────────────────┘
```
