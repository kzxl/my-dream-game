# MDG: Aethelis - Crafting Materials, Reagents, Gathering & Genesis Forge Design

## 1. Executive Summary & Vòng Lặp Chế Tác Hoàn Chỉnh
Hệ thống **Nguyên Liệu Chế Tác, Nghề Nghiệp Khai Thác & Bàn Rèn Genesis Forge** mở rộng chiều sâu cho nền kinh tế ARPG Aethelis, hoàn thiện vòng lặp chơi:
**Khám phá Bản Đồ & Săn Quái $\to$ Khai thác Nốt Tài Nguyên / Thu Thập Bí Kíp Blueprint $\to$ Tích lũy Nguyên Liệu & Phân Rã Trang Bị $\to$ Nâng Cấp Nghề Nghiệp & Độ Thông Thạo Bàn Rèn $\to$ Đúc Trang Bị Masterwork & Khảm Nạp Metamods**.

```mermaid
graph TD
    A[Bản Đồ Dã Ngoại / Nodes] -->|1. Nghề Mining / Herbalism / Skinning| B[Kho Nguyên Liệu / Materials Vault]
    C[Quái Vật & Boss Đặc Thù] -->|2. Rơi Nguyên Liệu & Cuộn Bí Kíp Blueprint| D[Túi Đồ: Bí Kíp Chế Tác]
    E[Trang Bị Rác / Thừa] -->|3. Phân Rã / Salvage Anvil| B
    
    D -->|Click Học Vĩnh Viễn| F[Mở Khóa Công Thức Bàn Rèn]
    
    B & F --> G[Genesis Forge Bench 2.0]
    G -->|Tích Lũy Crafting EXP| H[Độ Thông Thạo Chế Tác Lv.1-50]
    H -->|Kích Hoạt Đặc Quyền| I[🍀 Tiết Kiệm NL / ⭐ Đại Thành Công +25% / 💎 Thêm Socket]
    G -->|Đúc Thành Phẩm| J[Trang Bị Masterwork Tinh Xảo]
```

---

## 2. Bàn Rèn Genesis Forge 2.0 (ARPG Grid & Visual Experience)

### 2.1. Triết lý Giao Diện & Trải Nghiệm Người Dùng
* **Ô Lưới ARPG Chuẩn ($56\times 56\text{px}$):** Thiết kế đồng bộ phong cách hòm đồ ARPG cao cấp với viền màu phẩm chất phát quang (Rarity Glow) và huy hiệu số lượng (Stack Badges).
* **Tự Động Ẩn Nguyên Liệu Bằng 0 (Auto-Hide Zero Quantity):** Kho nguyên liệu (Materials Vault) và bảng chi phí chế tác tự động ẩn các loại tài nguyên chưa sở hữu ($count \le 0$), loại bỏ cảm giác rối mắt.
* **Rich Floating Tooltips:** Rê chuột lên bất kỳ ô nguyên liệu/trang bị nào đều mở bảng thông tin động với độ hiếm, xuất xứ và công dụng chi tiết.
* **5 Phân Hệ Tabs Chức Năng:**
  1. 🔨 **Relic Anvil:** Khóa Affix (Metamods Prefix/Suffix Lock), Reroll Socket/Links, Bench Affix và Chaos Slam.
  2. ♻️ **Salvage Anvil:** Phân rã trang bị rác thành nguyên liệu thô theo độ hiếm.
  3. 🗡️ **Base Forging:** Lò luyện kim đúc phôi trang bị theo bản vẽ.
  4. 🎒 **Materials Vault:** Kho lưu trữ 13 loại tài nguyên vô hạn stack.
  5. 🛠️ **Professions:** Quản lý cấp độ và bậc mở khóa của 3 nghề thu thập.

---

## 3. Hệ Thống 3 Nghề Nghiệp Thu Thập (Gathering Professions System)

Để khai thác các nốt tài nguyên trên bản đồ thế giới, người chơi cần rèn luyện nghề nghiệp tương ứng (Cấp độ $1 \to 50$):

| Nghề Nghiệp (Profession) | Biểu Tượng | Đối Tượng Khai Thác | Nguồn Thu Thập | Bậc Phân Cấp Nguyên Liệu Mở Khóa |
| :--- | :---: | :--- | :--- | :--- |
| **Mining (Khai Khoáng)** | ⛏️ | Quặng sắt, Tinh thể ma pháp, Lõi kim cương | Nốt mỏ đá trên bản đồ & Quái hệ Golem/Construct | • Lv. 1: Iron Ore (Common)<br>• Lv. 10: Mithril Chunk (Uncommon)<br>• Lv. 25: Aether Crystal (Rare)<br>• Lv. 40: Adamantite Ingot (Mythic) |
| **Herbalism (Thảo Dược)** | 🌿 | Rễ huyết thảo, Hoa ma lực, Lá gió thần | Bụi hoa/cây thảo mộc bản đồ & Quái hệ Thực vật | • Lv. 1: Bloodroot Herb (Common)<br>• Lv. 10: Mana Bloom (Uncommon)<br>• Lv. 25: Windstrider Leaf (Rare) |
| **Skinning & Hunting (Lột Da / Săn Bắt)** | 🐺 | Da thú rừng, Sừng quỷ dị giới, Vảy rồng lửa | Thu hoạch sau khi hạ gục Quái Thú (Beasts / Dragons) | • Lv. 1: Beast Leather (Common)<br>• Lv. 15: Fiend Demon Horn (Rare)<br>• Lv. 35: Dragon Scale (Mythic) |

---

## 4. Cơ Chế Độ Thông Thạo Chế Tác (Crafting Mastery Engine)

Độ Thông Thạo Chế Tác phản ánh kinh nghiệm rèn đúc của thợ rèn ($1 \to 50$), mở khóa các đặc quyền bị động:

### 4.1. 6 Bậc Danh Hiệu (Mastery Ranks)
* **Apprentice (Lv. 1 - 9):** 🛠️ Novice Apprentice
* **Journeyman (Lv. 10 - 19):** ⚒️ Adept Journeyman
* **Artisan (Lv. 20 - 29):** 💎 Skilled Artisan
* **MasterSmith (Lv. 30 - 39):** 🔨 Master Forger
* **Grandmaster (Lv. 40 - 49):** 🌟 Grandmaster Artificer
* **PrimordialGodSmith (Lv. 50):** 👑 Primordial God-Smith (Tối Thượng)

### 4.2. Thuật Toán Tích Lũy Kinh Nghiệm (Crafting EXP Formula)
* $\text{EXP To Next Level} = 150 \times 1.12^{\text{Level} - 1}$
* **Nguồn tích lũy EXP:**
  * **Đúc phôi trang bị (`Base Forging`):** $+35\text{ EXP}$
  * **Đập bùa Anvil (`Chaos Slam` / `Metamods`):** $+20 \to +30\text{ EXP}$
  * **Bench Affix / Socket Reforge:** $+15 \to +25\text{ EXP}$
  * **Phân rã trang bị (`Salvage`):** $+15\text{ EXP}$

### 4.3. 3 Đặc Quyền Kích Hoạt Tự Động (Mastery Perks)
1. 🍀 **Tiết Kiệm Nguyên Liệu (Resource Conservation):** Tỷ lệ $5\% \to 30\%$ không tiêu hao bất kỳ nguyên liệu nào khi đúc.
2. ⭐ **Đại Thành Công (Masterwork Critical):** Tỷ lệ $5\% \to 25\%$ trang bị đúc ra nhận thêm $+25\%$ chỉ số cơ bản, phẩm chất `Rare`, tiền tố `⭐ Masterwork` và hiệu ứng hào quang vàng rực rỡ.
3. 💎 **Ban Phước Socket (Extra Socket Blessing):** Tỷ lệ $5\% \to 35\%$ trang bị tự động mở thêm $+1$ Socket (tối đa 6 sockets).

---

## 5. Hệ Thống Bản Vẽ Chế Tác Rơi Từ Quái Đặc Thù (Monster-Specific Blueprint Drop System)

Trang bị cao cấp không thể đúc tự do mà bắt buộc phải sở hữu **Cuộn Bí Kíp Bản Vẽ (Recipe Blueprint Scroll)** thu thập từ các Boss và Quái Tinh Anh đặc thù.

```mermaid
graph LR
    Boss[Boss / Quái Tinh Anh] -->|Hạ gục (Tỷ lệ drop)| Scroll[📜 Cuộn Bí Kíp Blueprint]
    Scroll -->|Click / Chuột Phải trong Túi| Learn[Học vĩnh viễn vào Bàn Rèn]
    Learn --> Unlock[Mở khóa công thức đúc tại Tab Base Forging]
```

### 5.1. Danh Mục Bản Vẽ & Nguồn Rơi Quái Vật

| Mã Công Thức | Tên Trang Bị | Cấp Độ | Vị Trí | Trạng Thái Ban Đầu | Quái Vật & Boss Rơi Bí Kíp | Khu Vực / Biome |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `forge_iron_sword` | **Iron Longsword** | Lv. 1 | MainHand | 🔓 **Mặc định** | *Tân thủ có sẵn* | Sanctuary Haven |
| `forge_iron_armor` | **Reinforced Iron Cuirass** | Lv. 1 | BodyArmor | 🔓 **Mặc định** | *Tân thủ có sẵn* | Sanctuary Haven |
| `forge_aether_ring` | **Aetherium Band of Resilience** | Lv. 20 | Ring | 🔒 **Cần Bí Kíp** | • **Malakor the Shadow Fiend** (Boss $85\%$)<br>• **Crypt Undead Warrior** ($12\%$) | Forgotten Crypts (Act 1) |
| `forge_mithril_blade` | **Mithril Arcane Blade** | Lv. 25 | MainHand | 🔒 **Cần Bí Kíp** | • **Cryomancer Vael** (Boss $100\%$)<br>• **Frost Elemental** ($15\%$) | Frozen Spires (Act 2) |
| `forge_mithril_hauberk` | **Mithril Ward Hauberk** | Lv. 25 | BodyArmor | 🔒 **Cần Bí Kíp** | • **Yeti Frost Goliath** ($25\%$)<br>• **Cryomancer Vael** ($100\%$) | Frozen Spires (Act 2) |
| `forge_prismatic_amulet` | **Prismatic Star Amulet** | Lv. 40 | Amulet | 🔒 **Cần Bí Kíp** | • **Ignis the Scourge Wyrm** (Boss $85\%$)<br>• **Magma Colossus Golem** ($18\%$) | Volcanic Core (Act 3) |
| `forge_adamantite_greatsword` | **Adamantite Colossus Greatsword** | Lv. 50 | MainHand | 🔒 **Cần Bí Kíp** | • **Ignis the Scourge Wyrm** (Boss $100\%$) | Volcanic Core (Act 3) |
| `forge_adamantite_plate` | **Adamantite Titan Warplate** | Lv. 50 | BodyArmor | 🔒 **Cần Bí Kíp** | • **Ignis the Scourge Wyrm** (Boss $100\%$) | Volcanic Core (Act 3) |

### 5.2. Giao Diện & Bộ Lọc Base Forging
* **4 Chế Độ Lọc:** `Tất Cả` | `🔓 Đã Học` | `🔒 Chưa Học` | `✨ Đủ NL`.
* **Công thức bị khóa:** Hiển thị mờ (`recipe-locked`), icon `🔒`, dòng chữ nguồn rơi `🔒 Rơi từ: [Tên Quái/Boss]`.
* **Khung Xem Trước (Preview):** Banner đỏ cảnh báo **BẢN VẼ BÍ TRUYỀN CHƯA MỞ KHÓA** kèm gợi ý vị trí địa lý săn quái, nút Đúc bị vô hiệu hóa `🔒 Yêu Cầu Học Bản Vẽ Từ Quái Vật`.

