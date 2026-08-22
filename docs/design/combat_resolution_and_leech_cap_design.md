# Combat Resolution, Resistance Order of Operations & Leech Cap Engine

## 1. Triết Lý Thiết Kế (Design Philosophy)
Hệ thống Combat Resolution của **Aethelis** tuân thủ tính toán số học chính xác, rõ ràng và ngăn chặn triệt để tình trạng bất tử (immortality exploit) hoặc stack hiệu ứng vô hạn.

---

## 2. Thứ Tự Giải Quyết Kháng Nguyên Tố (Order of Operations for Mitigations)

Kháng tính của mục tiêu (Target Elemental Resistance) được tính toán theo 3 giai đoạn nghiêm ngặt:

$$\text{Effective Resist} = \text{Clamp}(\text{Base Resist} - \text{Exposure} - \text{Curse Reduction}, -100\%, 75\%) - \text{Penetration}$$

1. **Flat Exposures (Phơi nhiễm nguyên tố):**
   - Áp dụng trừ thẳng vào Base Resist (VD: Scorched $-15\%$ Fire Resist, Brittle $-15\%$ Cold Resist).
2. **Curse Reductions (Nguyền rủa suy giảm):**
   - Áp dụng trừ thêm sau Exposure (VD: Flammability Curse $-20\%$).
3. **Hard Cap Clamp $[-100\%, +75\%]$:**
   - Giá trị kháng tính sau Exposure & Curses được ép trong khoảng tối thiểu $-100\%$ và tối đa $+75\%$ (Maximum Resistance Cap).
4. **Resistance Penetration (Xuyên Kháng):**
   - Xuyên kháng được trừ **sau cùng**, không bị chặn bởi Hard Cap $+75\%$, và có thể đẩy kháng thực tế xuống sâu dưới $-100\%$.

---

## 3. Leech Rate Cap Engine (Cơ Chế Hút Máu / Hồi Năng Lượng)

### 3.1. Vấn đề giải quyết
Trong ARPG cổ điển, cơ chế Leech tức thời khi DPS quá lớn khiến người chơi hồi đầy HP trong $0.01\text{s}$, làm mất đi độ căng thẳng khi né tránh skill trùm.

### 3.2. Cơ chế Leech Instances & Hard Cap
1. **Duration:** Mỗi đòn đánh Leech tạo ra 1 `LeechInstance` kéo dài trong $3.0\text{s}$.
2. **Rate per Instance:** Lượng hồi phục của mỗi instance = $\text{TotalLeechAmount} / 3.0\text{s}$.
3. **Max Leech Rate Cap:** Tổng lượng hồi phục từ tất cả các instance trong 1 giây không được vượt quá **$20\%$ Max Life** (hoặc Max ES).
4. **Instance Pruning:** Khi instance hết thời gian hoặc cạn kiệt lượng máu, nó sẽ tự động bị hủy để giải phóng bộ nhớ.

```csharp
// Ví dụ tính toán trần hồi phục trong LeechEngine.cs
float maxAllowedPerSecond = maxPool * (MaxLeechRatePercent / 100.0f); // 20%
float actualLeeched = Math.Min(totalDesiredLeechRate, maxAllowedPerSecond) * dt;
```
