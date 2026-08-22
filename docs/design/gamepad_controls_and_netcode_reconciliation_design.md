# Gamepad Controller, Virtual Radial Menu & Netcode Lag Compensation

## 1. Gamepad Input Controller Architecture
Module Gamepad hỗ trợ đầy đủ các tay cầm Xbox, PlayStation và Generic Gamepad thông qua W3C Gamepad API.

### 1.1. Bảng Phân Bổ Nút Bấm (Button Mapping)
| Phím Tay Cầm | Chức Năng | Phím Tương Đương PC |
|---|---|---|
| **Left Stick** | Di chuyển nhân vật 360 độ | W, A, S, D |
| **Right Stick** | Ngắm bắn & Xoay góc nhìn | Con trỏ chuột ảo |
| **Button A (Cross)** | Tấn công chính (Slash) | Chuột trái (LMB) |
| **Button X (Square)** | Cầu Lửa (Fireball) | Q |
| **Button Y (Triangle)** | Băng Chấn (Frost Nova) | W |
| **Button B (Circle)** | Sao Băng (Meteor) | E |
| **LB / LT** | Lướt Nhanh (Dash) | Space |
| **RB / RT** | Tương tác môi trường | F |
| **D-Pad (Up, Down, Left, Right)** | Bình Máu / Năng Lượng / Kháng | 1, 2, 3, 4 |
| **Select / Back / Start** | Mở/Đóng Radial Menu | Tab / ESC |

### 1.2. Soft Target Auto-Lock
- Khi ngắm skill bằng Right Stick hoặc hướng di chuyển, hệ thống tự động quét quái vật sống trong hình nón $\pm 45^\circ$ với tầm quét tối đa $550\text{px}$.
- Góc ngắm sẽ tự động snap nhẹ vào tâm quái gần nhất giúp điều khiển mượt mà trên tay cầm mà không làm mất tính tự do ngắm bắn.

---

## 2. Virtual Radial Wheel Menu (Vòng Bánh Xe 8 Hướng)
Khi nhấn `Select/Back` trên Gamepad hoặc `Tab` trên bàn phím, vòng điều hướng tròn 8 hướng xuất hiện:
1. 🎒 **Inventory (I):** Túi đồ & Trang bị.
2. 📜 **Skills Tree (K):** Cây Kỹ năng tiến hóa.
3. 📊 **Character Stats (C):** Bảng chỉ số nhân vật.
4. 🔨 **Genesis Forge (B):** Bàn rèn 7 phân hệ.
5. 📖 **Bestiary Lore (Y):** Bách khoa quái vật & Độ thuần thục.
6. 🏛️ **Haven Market (T):** Chợ giao thương Trade Board.
7. ⭐ **Devotion (V):** Chòm sao thần thánh.
8. 🗺️ **World Map (M):** Bản đồ thế giới & Atlas.

---

## 3. Netcode Lag Compensation & Smooth Reconciliation
- Khi nhận gói tin `PlayerMoved` từ server SignalR qua WebSocket:
  - Nếu khoảng cách $\Delta > 400\text{px}$: Dịch chuyển tức thời (tránh desync do teleport qua cổng/zone).
  - Nếu $1\text{px} < \Delta \le 400\text{px}$: Áp dụng **Exponential Lerp** với hệ số $\alpha = \min(1.0, dt \times 12)$.
- Giúp loại bỏ hoàn toàn hiện tượng rung giật giật (rubberbanding) khi mạng có độ trễ hoặc packet jitter dưới $48\text{px}$.
