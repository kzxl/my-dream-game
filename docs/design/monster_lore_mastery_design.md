# Đặc Tả Thiết Kế Hệ Thống Sổ Tay Am Hiểu & Khắc Tinh Quái Vật (Bestiary & Monster Lore Mastery)

---

## 1. Tổng Quan Triết Lý Thiết Kế `[ĐÃ HOÀN THÀNH - ACTIVE]`

Hệ thống **Monster Lore Mastery (Am Hiểu Quái Vật - Phím Y)** trong **My Dream Game (MDG)** được thiết kế nhằm khuyến khích cày cuốc (Grinding with Purpose), biến mỗi mạng hạ gục của người chơi thành một sự tiến bộ vĩnh viễn (Permanent Account/Character Progression).

Khi tiêu diệt một loài quái vật đủ nhiều lần, nhân vật sẽ tích lũy kinh nghiệm chiến đấu, thấu hiểu cấu trúc cơ thể, điểm yếu nguyên tố và thói quen ra đòn của chúng. Từ đó, người chơi nhận được các chỉ số gia tăng vượt trội: **tăng Sát thương cộng thêm**, **tăng Tỷ lệ Chí mạng**, **tăng Sát thương Chí mạng**, **giảm Sát thương nhận vào** và **tăng Tỷ lệ Rơi đồ (IIR/IIQ)** từ chính loài quái vật đó.

```mermaid
graph TD
    Kill[Tiêu diệt Quái vật] --> AddCount["Cộng dồn Kill Count (player.monsterKills[type]++)"]
    AddCount --> CheckTier{Đạt Ngưỡng Kills?}
    CheckTier -->|Tier 1: 50 Kills / 5 Boss| T1["🎖️ Tier 1 - Sơ Cấp (Novice Hunter)<br>• +5% Sát thương cộng thêm<br>• Hiển thị thanh máu & tên quái"]
    CheckTier -->|Tier 2: 250 Kills / 20 Boss| T2["🥈 Tier 2 - Thông Thạo (Adept Slayer)<br>• +10% Sát thương cộng thêm<br>• +5% Tỷ lệ Chí mạng (Crit Chance)<br>• +10% IIR Rơi Đồ"]
    CheckTier -->|Tier 3: 1,000 Kills / 50 Boss| T3["🥇 Tier 3 - Tinh Anh (Master Inquisitor)<br>• +18% Sát thương cộng thêm<br>• +10% Tỷ lệ Chí mạng<br>• +25% Sát thương Chí mạng<br>• +20% IIR / +10% IIQ"]
    CheckTier -->|Tier 4: 3,000 Kills / 120 Boss| T4["👑 Tier 4 - Khắc Tinh Tuyệt Đối (Apex Nemesis)<br>• +25% Sát thương cộng thêm<br>• +15% Tỷ lệ Chí mạng<br>• +35% Sát thương Chí mạng<br>• -15% Sát thương nhận vào<br>• +35% IIR / +20% IIQ"]
```

---

## 2. Bảng Phân Tầng Bậc Am Hiểu (Lore Mastery Tiers & Milestones) `[ĐÃ HOÀN THÀNH - ACTIVE]`

| Bậc Am Hiểu | Danh Hiệu Hunter | Ngưỡng Kills Thường | Ngưỡng Kills Boss | Tăng Sát Thương (Extra Damage) | Tăng Tỷ Lệ Crit (Bonus Crit) | Tăng Sát Thương Crit (Bonus Crit Multi) | Giảm Thương Nhận Vào (Dmg Taken Reduction) | Thưởng Rơi Đồ (Drop Multipliers) | Trạng Thái |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Tier 0** | *Unfamiliar (Chưa Biết)* | `0` | `0` | $+0\%$ | $+0\%$ | $+0\%$ | $0\%$ | $0\%$ | `[ĐÃ HOÀN THÀNH]` |
| **Tier 1** | *Novice Hunter (Thợ Săn Mới)* | `50` | `5` | $+5\%$ | $+0\%$ | $+0\%$ | $0\%$ | $0\%$ | `[ĐÃ HOÀN THÀNH]` |
| **Tier 2** | *Adept Slayer (Sát Thủ Thông Thạo)* | `250` | `20` | $+10\%$ | $+5\%$ | $+0\%$ | $0\%$ | $+10\%\text{ IIR}$ | `[ĐÃ HOÀN THÀNH]` |
| **Tier 3** | *Master Inquisitor (Thầy Trừ Tà)* | `1,000` | `50` | $+18\%$ | $+10\%$ | $+25\%$ | $-5\%$ | $+20\%\text{ IIR} / +10\%\text{ IIQ}$ | `[ĐÃ HOÀN THÀNH]` |
| **Tier 4** | *Apex Nemesis (Khắc Tinh Tuyệt Đối)*| `3,000` | `120` | $+25\%$ | $+15\%$ | $+35\%$ | $-15\%$ | $+35\%\text{ IIR} / +20\%\text{ IIQ}$ | `[ĐÃ HOÀN THÀNH]` |

---

## 3. Công Thức Tác Động Vào Pipeline Chiến Đấu `[ĐÃ HOÀN THÀNH - ACTIVE]`

Khi đòn đánh hoặc kỹ năng của người chơi tác động lên mục tiêu loài quái $M$:

$$\text{Effective Crit Chance} = \text{PlayerBaseCrit} + \text{LoreBonusCrit}(M)$$

$$\text{Effective Crit Multiplier} = \text{PlayerBaseCritMulti} + \text{LoreBonusCritMulti}(M)$$

$$\text{Total Damage} = \text{BaseCalculatedDamage} \times \left(1 + \frac{\text{LoreBonusDamage}(M)}{100}\right)$$

Khi người chơi nhận sát thương từ loài quái $M$:

$$\text{Damage Received} = \text{RawMonsterDamage} \times \left(1 - \frac{\text{LoreDamageReduction}(M)}{100}\right)$$

---

## 4. Giao Diện Sổ Tay & Mở Rộng Tiếp Theo `[ĐÃ HOÀN THÀNH & KẾ HOẠCH MỞ RỘNG]`

1. **Sổ Tay Bách Quái (Bestiary Codex Modal - Phím Y):** `[ĐÃ HOÀN THÀNH]`
   - Xem danh sách toàn bộ quái vật, số lượng đã tiêu diệt, cấp độ am hiểu, lore và điểm yếu nguyên tố.
2. **Boss Weakness Scouting & Prep (Cảm hứng SAO):** `[CẦN MỞ RỘNG - PLANNED]`
   - Xem trước các giai đoạn biến hình (Boss Phases) và chuẩn bị các bình kháng trước khi bước vào phòng đấu trùm.
