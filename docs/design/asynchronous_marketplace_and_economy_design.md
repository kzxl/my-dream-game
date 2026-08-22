# Asynchronous Marketplace & Haven Trade Board Design

## 1. Tổng Quan Hệ Thống (System Overview)
Haven Trade Board là hệ thống chợ giao thương bất đồng bộ (Asynchronous Marketplace) liên kết toàn server. Cho phép người chơi treo bán (listing), tìm kiếm (search/browse) và mua trang bị/đá quý kể cả khi người bán đang offline.

---

## 2. Tiền Tệ Giao Dịch & Bảng Định Giá (Currencies)

Hệ thống hỗ trợ 4 loại tiền tệ thanh toán:
1. **🔮 Fracture Core (Mảnh Vỡ Hạch Tâm):** Tiền tệ trao đổi trung tâm cao cấp (quy đổi cơ sở: $2,500\text{ Gold}$).
2. **💎 Genesis Prism (Lăng Kính Khởi Nguyên):** Tiền tệ rèn đúc và trao đổi tầm trung ($500\text{ Gold}$).
3. **🔵 Aether Spark (Tia Sáng Aether):** Tiền tệ phụ gia tinh chỉnh ($100\text{ Gold}$).
4. **🪙 Gold (Vàng Tiền Tệ):** Đồng tiền lưu thông cơ bản.

---

## 3. Cơ Chế Thuế Niêm Yết 5% (5% Gold Sink Tax)

Để kiểm soát lạm phát và ngăn chặn hành vi spam niêm yết rác lên Trade Board:
- **Công thức thuế:**
  $$\text{Listing Tax} = \max(25\text{ Gold}, \lceil\text{Price In Gold} \times 0.05\rceil)$$
- **Quy tắc thu:** Thuế vàng bị trừ ngay lập tức khi người chơi đăng bài ký gửi vật phẩm.
- **Hủy ký gửi:** Người bán có thể hủy tin bất kỳ lúc nào để nhận lại vật phẩm, nhưng **khoản thuế vàng 5% sẽ không được hoàn lại** (Gold Sink tiêu hủy vĩnh viễn khỏi nền kinh tế).

---

## 4. Kiến Trúc & API Endpoints

- `GET /api/v1/market/listings`: Lấy danh sách vật phẩm đang chào bán (hỗ trợ lọc theo `category`, `rarity`, `search`, `page`, `pageSize`).
- `GET /api/v1/market/my-listings`: Lấy danh sách vật phẩm của tài khoản hiện tại.
- `POST /api/v1/market/list`: Đăng ký gửi vật phẩm mới lên Trade Board.
- `POST /api/v1/market/buy`: Mua vật phẩm và chuyển tiền tệ cho người bán.
- `POST /api/v1/market/cancel`: Hủy tin ký gửi và rút vật phẩm về túi.
