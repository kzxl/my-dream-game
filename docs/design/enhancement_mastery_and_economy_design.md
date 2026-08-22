# 🔨 Aethelis Economy, Enhancement Infusion & Blacksmithing Mastery Design

---

## 1. Triết Lý Thiết Kế: Loại Bỏ Bùa — Thay Bằng Khay Nạp Nguyên Liệu Bổ Trợ

Thay vì cơ chế dùng bùa bảo hiểm đơn điệu, game áp dụng **Khay Nạp Nguyên Liệu Bổ Trợ (Infusion Matrix Slot)**:
- Người chơi tự do bỏ nguyên liệu vào khay cường hóa để tăng tỷ lệ thành công và loại bỏ rủi ro vỡ phôi.
- Nguyên liệu càng cao cấp và số lượng càng nhiều $\to$ Tỷ lệ thành công càng tăng cao.
- **Hệ số giá trị bổ trợ (Infusion Value per Material):**
  * `mat_iron_ingot` (Thỏi Sắt): $+1\%$ Tỷ lệ / 5 thỏi.
  * `mat_mithril_ingot` (Thỏi Mithril): $+2.5\%$ Tỷ lệ / 3 thỏi.
  * `mat_adamantite_ingot` (Thỏi Adamantite): $+5\%$ Tỷ lệ / 2 thỏi.
  * `mat_aether_crystal` (Tinh Thể Aether): $+4\%$ Tỷ lệ / 1 tinh thể.
  * `mat_shard_genesis` (Mảnh Vỡ Khởi Nguyên): $+10\%$ Tỷ lệ / 1 mảnh (Giảm tối đa $90\%$ nguy cơ hạ cấp).

---

## 2. Hệ Thống Thông Thạo Nghề Rèn & Cường Hóa (Blacksmithing Mastery)

Người chơi tích lũy **Điểm Kinh Nghiệm Nghề Rèn (Forging Mastery EXP)** qua từng lượt chế tác, nung luyện, cường hóa và phân rã trang bị.

| Bậc Thông Thạo | Yêu Cầu EXP | Đặc Quyền Nghề Rèn & Cường Hóa |
| :--- | :---: | :--- |
| **Bậc 1: Học Việc (Novice Smith)** | 0 EXP | Tỷ lệ cơ bản ban đầu. |
| **Bậc 2: Thợ Lành Nghề (Journeyman)** | 150 EXP | **$+3\%$ Tỷ lệ thành công cơ bản**, $+10\%$ Hiệu suất nguyên liệu nạp vào khay. |
| **Bậc 3: Nghệ Nhân (Artisan Smith)** | 500 EXP | **$+6\%$ Tỷ lệ thành công**, giảm $-20\%$ nguy cơ hạ cấp khi cường hóa thất bại. |
| **Bậc 4: Bậc Thầy Rèn Đúc (Master Forger)** | 1,500 EXP | **$+10\%$ Tỷ lệ thành công**, **Miễn nhiễm vỡ phôi ($0\%$ Shatter)** từ cấp $+1 \to +7$. |
| **Bậc 5: Đại Tông Sư Khởi Nguyên (Grandmaster)** | 4,000 EXP | **$+15\%$ Tỷ lệ thành công**, cơ hội $10\%$ **Đại Thành Công ($+2$ cấp cường hóa)** trong 1 lần đập! |

---

## 3. Hệ Thống Rớt Tiền Vàng (Gold Drops) & Tự Động Thu Gom (Magnet Auto-Loot)

- Quái vật khi chết nổ ra các đống tiền vàng `🪙` rơi trên mặt đất (`groundLoot`).
- Khi người chơi hoặc Thú cưng đi qua trong cự ly $80$px, đống vàng tự động hút vào người chơi và cộng thẳng vào `player.gold`.
- Hiển thị số nhảy `+XX Vàng` và âm thanh leng keng kim loại cổ điển.

---

## 4. Đại Cung Thiên Hà Tinh Tú Devotion Grid (Phím V)

- 45+ Tinh cầu Nodes kết nối thành **Tâm Điểm Genesis Nexus (5 nodes)** và **8 Đại Chòm Sao Hoàng Đạo (40 nodes)**.
- Tích hợp kỹ năng kích hoạt chiến đấu (Celestial Proc Skills) khi đạt đỉnh mỗi chòm sao.
- Tương tác Zoom, Pan, thanh tìm kiếm từ khóa tinh cầu theo thuộc tính.
