# 🎮 Hướng Dẫn Khởi Chạy MDG Godot Client (Offline Singleplayer First)

Tài liệu này hướng dẫn cách mở, chỉnh sửa và chạy client game **MDG: Aethelis** bằng **Godot Engine 4.x (C# .NET 8)**.

---

## 📋 Yêu Cầu Cần Chuẩn Bị (Prerequisites)

1. **[.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)** (đã cài đặt trên máy).
2. **[Godot Engine 4.3+ (Bản .NET / C# Support)](https://godotengine.org/download/)**:
   - Lưu ý tải bản có tên: `Godot_v4.x.x-stable_mono_win64.zip` (hoặc bản .NET).
   - Giải nén ra thư mục bất kỳ (ví dụ `D:\Tools\Godot\`).

---

## 🚀 Cách Mở & Chạy Dự Án

### 1. Import Dự Án Vào Godot Editor
1. Mở **Godot Engine (.NET version)**.
2. Tại màn hình **Project Manager**, bấm **Import** $\to$ Chọn đường dẫn đến file:
   ```text
   d:\Project\mdg\src\Mdg.Client.Godot\project.godot
   ```
3. Bấm **Import & Edit**.

### 2. Build & Chạy Thử
- Tại góc trên bên phải của Godot Editor, bấm nút **Build** (biểu tượng búa 🔨) để Godot biên dịch mã nguồn C# liên kết với `Mdg.Core` và `Mdg.Client.Adapter`.
- Bấm nút **Play** (hoặc phím tắt **`F5`**) để chạy Main Scene (`res://Scenes/Main.tscn`).

---

## ⌨️ Phím Tắt Điều Khiển Game (Offline Mode)

| Phím / Thao Tác | Hành Động Trong Game | Cơ Chế Xử Lý Trong Core |
| :--- | :--- | :--- |
| **W, A, S, D** / Mũi tên | Di chuyển nhân vật 8 hướng | `MoveAndSlide` + Cập nhật `Character.Position` |
| **Chuột Trái / Phím 1** | Chém thường (Slash / Cleave) | `DamageCalculator.CalculateHit` bán kính 90px |
| **Phím Q / 2** | Tung Hỏa Cầu (Pyro Fireball) | Gây sát thương Lửa diện rộng tại vị trí con trỏ chuột |
| **Phím E / 3** | Băng Hoàn (Frost Nova) | Vòng tròn băng xung quanh nhân vật |
| **Phím Space / 5** | Lướt né chiêu (Phase Dash) | Dịch chuyển nhanh 150px theo hướng di chuyển |

---

## 🏛️ Cấu Trúc Mã Nguồn Godot Client

```text
src/Mdg.Client.Godot/
├── project.godot                     # Cấu hình engine, viewport, input actions
├── Mdg.Client.Godot.csproj           # C# project tham chiếu Mdg.Core & Mdg.Client.Adapter
├── Scenes/                           # Các cảnh đồ họa & prefabs
│   ├── Main.tscn                     # Scene chính (World, Camera, HUD, GameManager)
│   ├── Player.tscn                   # Node nhân vật người chơi
│   ├── Monster.tscn                  # Node quái vật (Sprite, HP bar, Nhãn độ hiếm)
│   ├── FloatingText.tscn             # Số sát thương nổi lên (Tween fade out)
│   └── Hud.tscn                      # Giao diện HUD (Life, Mana, Energy Shield, Quái)
└── Scripts/                          # Mã nguồn C# điều phối logic
    ├── Core/
    │   └── GameManager.cs            # Khởi tạo GameWorld, Fixed-Tick loop, Presentation Bridge
    ├── Entities/
    │   ├── PlayerController.cs       # Đọc input, điều khiển nhân vật và thi triển skill
    │   └── MonsterView.cs            # Hiển thị sprite, nhận sát thương, animation chết
    ├── UI/
    │   ├── FloatingCombatText.cs     # Hiệu ứng số damage bay lên
    │   └── HudController.cs          # Cập nhật thông số nhân vật lên thanh UI
    └── Common/
        └── GodotMathExtensions.cs    # Chuyển đổi giữa FixVector2 và Vector2
```

---

## 🔄 Luồng Vận Hành Kết Nối Với `Mdg.Core`

1. **Fixed-Tick Simulation:** Trong hàm `_PhysicsProcess`, `GameManager` gọi `Scheduler.Advance(delta)`.
2. **Tương tác Sát thương:** Khi người chơi tung chiêu, `DamageCalculator` tính toán chính xác theo cơ chế ARPG (Né tránh, Đỡ đòn, Giáp, Kháng nguyên tố, Chí mạng).
3. **Phản hồi Hiển thị:** `PresentationEventBridge` bắt sự kiện `EntityDamagedEvent`, `EntityDiedEvent` để hiển thị hiệu ứng sát thương và trigger hoạt cảnh.
