# ĐẶC TẢ THIẾT KẾ: HỆ THỐNG THUỘC TÍNH VẬT PHẨM & CƠ CHẾ CHẾ TÁC (ITEM AFFIXES & CRAFTING SYSTEM)
*Tài liệu kiến trúc hệ thống Thuộc Tính Tiền Tố / Hậu Tố (Prefixes & Suffixes), Phân Tầng Chỉ Số (Affix Tiers) & Cơ Chế Luyện Kim (Genesis Crafting Engine) cho MDG (Aethelis)*

---

## 1. Tổng Quan Triết Lý Thiết Kế Mod Vật Phẩm (Item Modifiers Philosophy)

Hệ thống vật phẩm trong **MDG (Aethelis)** tuân theo chuẩn mực chiều sâu của thể loại ARPG kinh điển (Path of Exile / Diablo II):
1. **Phân Tách Rõ Ràng Tiền Tố (Prefix) & Hậu Tố (Suffix):** Mỗi nhóm mod đại diện cho các trường chỉ số chuyên biệt, ngăn ngừa việc trang bị bị mất cân bằng hoặc quá lệch một chiều.
2. **Quy Tắc Giới Hạn Theo Phẩm Cấp (Rarity Cap):**
   - **Magic (Xanh dương):** Tối đa 1 Prefix + 1 Suffix = **2 Mods**.
   - **Rare (Vàng kim):** Tối đa 3 Prefixes + 3 Suffixes = **6 Mods**.
   - **Unique (Cam nâu):** Sở hữu bộ Mod độc bản cố định, không thể can thiệp bằng chế tác thông thường.
3. **Phân Tầng Theo Cấp Độ Vật Phẩm (Item Level - iLvl & Tier Scaling):** Cấp độ phôi trang bị (iLvl) quyết định trần Tier của Affix (Tier 1 là mạnh nhất - God Roll, Tier 5 là cơ bản).
4. **Luyện Kim Ngẫu Nhiên & Có Điều Hướng (Deterministic & RNG Crafting):** Người chơi có thể dùng các loại Tinh Thể Khởi Nguyên (Genesis Catalysts) hoặc Bàn Luyện Kim (Forge Bench) để thêm, xóa, reroll hoặc khóa thuộc tính.

```mermaid
graph TD
    Base[Phôi Trang Bị Trắng - Normal Base<br>Chỉ có chỉ số cơ bản & Implicit Mod] -->|Aether Spark| Magic[Trang Bị Ma Thuật - Magic Item<br>1-2 Mods: 1 Prefix / 1 Suffix]
    Magic -->|Flux Catalyst| Magic2[Reroll Lại Thuộc Tính Magic]
    Magic2 -->|Genesis Prism| Rare3[Trang Bị Hiếm - Rare Item<br>4-6 Mods Ngẫu Nhiên]
    Rare3 -->|Ascendant Catalyst| Rare6[Rare Item Hoàn Chỉnh - 6 Mods<br>3 Prefixes + 3 Suffixes]
    Rare6 -->|Fracture Core| RareNew[Reroll Toàn Bộ 4-6 Mods Mới]
    Rare6 -->|Origin Matrix| RarePefect[Reroll Giá Trị Min-Max Trong Cùng Tier Lên Max]
    Rare6 -->|Null Void Core| RareMinus[Xóa Ngẫu Nhiên 1 Mod Để Lấy Lại Slot Trống]
```

---

## 2. Cấu Trúc Affix: Tiền Tố (Prefix) vs Hậu Tố (Suffix)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🪓 [RARE] Dragonbone Greataxe (Item Level 78)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ TIỀN TỐ (PREFIXES) [Tối đa 3]:                                              │
│  [P1 - T1] +45 to Physical Damage (FlatPhys: 35-50)                         │
│  [P2 - T1] +58% Increased Physical Damage (IncPhys: 50-65%)                 │
│  [P3 - T2] +75 to Maximum Life (FlatLife: 70-85)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ HẬU TỐ (SUFFIXES) [Tối đa 3]:                                               │
│  [S1 - T1] +24% Increased Attack Speed (AttackSpeed: 20-25%)                │
│  [S2 - T1] +42% to Global Critical Strike Multiplier (CritMulti: 35-45%)   │
│  [S3 - T2] +32% to Fire Resistance (FireRes: 30-35%)                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.1. Danh Mục Tiền Tố (Prefix Pool)
Tiền tố tập trung vào **Sát thương gốc (Flat/Scaling Damage)** và **Chỉ số sinh tồn cốt lõi (Life / Energy Shield / Armor)**:

| Key Affix | Tên Hiển Thị Template | Stat Key | Dải Giá Trị Cơ Bản (Min - Max) | Nhóm Trang Bị Hợp Lệ |
| :--- | :--- | :--- | :---: | :--- |
| `flat_phys` | `+{0} to Physical Damage` | `FlatPhys` | $15 - 45$ | Vũ khí (Weapons) |
| `inc_phys` | `+{0}% Increased Physical Damage` | `IncPhys` | $20\% - 60\%$ | Vũ khí (Weapons) |
| `flat_fire` | `+{0} Fire Damage to Attacks` | `FlatFire` | $10 - 35$ | Vũ khí, Nhẫn, Dây chuyền |
| `flat_cold` | `+{0} Cold Damage to Attacks` | `FlatCold` | $8 - 30$ | Vũ khí, Nhẫn, Dây chuyền |
| `flat_lightning`| `+{0} Lightning Damage to Attacks`| `FlatLightning`| $5 - 50$ | Vũ khí, Nhẫn, Dây chuyền |
| `flat_life` | `+{0} to Maximum Life` | `FlatLife` | $30 - 90$ | Tất cả Áo/Nón/Găng/Giày/Nhẫn/Dây chuyền |
| `flat_es` | `+{0} to Maximum Energy Shield` | `FlatEs` | $25 - 80$ | Giáp Năng Lượng (ES Armor), Nón, Khiên |
| `flat_armor` | `+{0} to Armor` | `Armor` | $50 - 200$ | Giáp Sắt (Body Armor), Khiên, Mũ |

### 2.2. Danh Mục Hậu Tố (Suffix Pool)
Hậu tố tập trung vào **Kháng tính (Resistances)**, **Tốc độ (Speed)**, **Chí mạng (Crit)** và **Chỉ số đặc trưng (Attributes)**:

| Key Affix | Tên Hiển Thị Template | Stat Key | Dải Giá Trị Cơ Bản (Min - Max) | Nhóm Trang Bị Hợp Lệ |
| :--- | :--- | :--- | :---: | :--- |
| `fire_res` | `+{0}% to Fire Resistance` | `FireRes` | $15\% - 35\%$ | Áo, Nón, Giày, Khiên, Nhẫn, Dây chuyền |
| `cold_res` | `+{0}% to Cold Resistance` | `ColdRes` | $15\% - 35\%$ | Áo, Nón, Giày, Khiên, Nhẫn, Dây chuyền |
| `lightning_res`| `+{0}% to Lightning Resistance` | `LightningRes` | $15\% - 35\%$ | Áo, Nón, Giày, Khiên, Nhẫn, Dây chuyền |
| `chaos_res` | `+{0}% to Chaos Resistance` | `ChaosRes` | $10\% - 25\%$ | Tất cả trang bị phòng thủ & Trang sức |
| `attack_speed` | `+{0}% Increased Attack Speed` | `AttackSpeed` | $8\% - 25\%$ | Vũ khí, Găng tay |
| `cast_speed` | `+{0}% Increased Cast Speed` | `CastSpeed` | $8\% - 25\%$ | Gậy phép, Nhẫn, Dây chuyền |
| `crit_chance` | `+{0}% Increased Critical Strike Chance`| `CritChance` | $15\% - 35\%$ | Vũ khí, Nón, Nhẫn |
| `crit_multi` | `+{0}% to Global Critical Strike Multiplier`| `CritMulti`| $15\% - 45\%$ | Dây chuyền, Vũ khí |
| `all_attr` | `+{0} to All Attributes` | `AllAttributes`| $5 - 20$ | Dây chuyền, Nhẫn |

---

## 3. Hệ Thống Phân Tầng Affix Tiers & Cấp Độ Vật Phẩm (iLvl)

Mỗi Affix có **5 Tiers**, yêu cầu cấp độ vật phẩm (`iLvl`) tương ứng để có thể roll ra:

| Tier | Yêu Cầu iLvl | Hệ Số Sức Mạnh (Scale Multiplier) | Màu Hiển Thị (Alt Detail) | Tỷ Lệ Trọng Số (Weight) |
| :---: | :---: | :---: | :---: | :---: |
| **Tier 1 (God Roll)** | $\text{iLvl} \ge 75$ | $100\%$ Max Value | `#FFD700` (Vàng kim) | $5\%$ (Rất hiếm) |
| **Tier 2 (Pinnacle)** | $\text{iLvl} \ge 60$ | $80\% - 90\%$ Max Value | `#00F2FE` (Xanh ngọc) | $15\%$ |
| **Tier 3 (Adept)** | $\text{iLvl} \ge 45$ | $65\% - 79\%$ Max Value | `#C678DD` (Tím nhạt) | $25\%$ |
| **Tier 4 (Seasoned)** | $\text{iLvl} \ge 25$ | $50\% - 64\%$ Max Value | `#98C379` (Xanh lá) | $30\%$ |
| **Tier 5 (Novice)** | $\text{iLvl} \ge 1$ | $35\% - 49\%$ Max Value | `#ABB2BF` (Trắng xám) | $25\%$ |

---

## 4. Cơ Chế Luyện Kim & Chế Tác Vật Phẩm (Genesis Crafting Catalyst Pipeline)

Hệ thống cung cấp **8 loại Tinh thể Khởi Nguyên (Genesis Catalysts)** để thao tác với Affix Slots:

| Tên Catalyst | Icon | Chức Năng Luyện Kim | Quy Tắc Nghiệp Vụ |
| :--- | :---: | :--- | :--- |
| **Aether Spark** | 🔵 | Nâng cấp trang bị Normal thành **Magic** | Sinh ngẫu nhiên 1 hoặc 2 Affixes (1P hoặc 1P+1S). |
| **Flux Catalyst** | 🔄 | Reroll lại toàn bộ thuộc tính trang bị **Magic** | Xóa sạch mod cũ, roll lại 1-2 Affixes mới. |
| **Genesis Prism** | 💎 | Nâng cấp trang bị Normal thành **Rare** | Sinh ngẫu nhiên từ $4$ đến $6$ Affixes mới (2P+2S tới 3P+3S). |
| **Fracture Core** | 🔮 | Reroll ngẫu nhiên toàn bộ trang bị **Rare** | Xóa sạch mod cũ, roll lại ngẫu nhiên từ $4$ đến $6$ Affixes mới. |
| **Ascendant Catalyst** | ✨ | Thêm 1 Affix cao cấp vào trang bị **Rare** (Exalt Slam) | Chỉ áp dụng khi Rare item có $< 6$ mods. Giữ nguyên các mod cũ. |
| **Null Void Core** | ❌ | Xóa ngẫu nhiên $1$ Affix trên trang bị | Giúp giải phóng 1 slot mod xấu để tiếp tục craft. |
| **Origin Matrix** | 👑 | Reroll giá trị số bên trong cùng Tier lên max range | Không làm đổi Tier của mod, roll lại điểm Min-Max tối ưu trong dải Tier đó. |
| **Socketing Core** | ⚪ | Tái cấu trúc số lượng Socket (1 đến 4 lỗ) | Phân bố lại số lượng ngọc có thể khảm vào trang bị. |
| **Harmonic Tether** | 🔗 | Liên kết chuỗi các Socket (Socket Links) | Kích hoạt hiệu ứng liên kết hỗ trợ kỹ năng (Support Gem Links). |

---

## 5. Bàn Luyện Kim Khởi Nguyên (Genesis Forge Bench)

Bên cạnh luyện kim bằng Orb ngẫu nhiên, **Bàn Chế Tác (Genesis Forge Bench)** cho phép người chơi chế tạo **chính xác 1 Mod mong muốn** vào slot còn trống:
* **Chi phí:** Tiêu hao *Ascendant Catalysts* (thu thập từ Boss và Endgame Rifts).
* **Giới hạn:** Mỗi trang bị chỉ được phép có tối đa **1 Crafted Mod** từ Forge Bench.
* **Tẩy Mod Chế Tác:** Người chơi có thể trả phí nhỏ để xóa Mod chế tác cũ và thay bằng Mod chế tác khác phù hợp hơn với Build mới.
