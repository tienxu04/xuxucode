# Google Drive View-Only PDF Downloader

Một đoạn script JavaScript tự động chạy trên Developer Console của trình duyệt để tải các file PDF bị khóa quyền tải/in (view-only) trên Google Drive bằng cách tự động cuộn (auto-scroll), chụp lại dữ liệu trang dạng `blob` và xuất ra file PDF hoàn chỉnh.

## 🚀 Tính năng nổi bật

- **Tự động cuộn trang (Auto-scroll):** Tự nhận diện khung cuộn (scroll root) của Google Drive và cuộn qua toàn bộ tài liệu.
- **Hỗ trợ Virtualized Rendering:** Google Drive xóa các trang đã cuộn khỏi DOM để tiết kiệm RAM; script sẽ chủ động chụp lại từng trang dưới dạng thẻ Canvas ngay khi xuất hiện để tránh mất dữ liệu.
- **Lắp ghép chuẩn kích thước:** Tự động định dạng lại kích thước từng trang PDF xuất ra phù hợp với độ phân giải gốc của ảnh chụp.
- **Tự động lấy tên file:** Lấy tên tài liệu trực tiếp từ thẻ Meta/Title của trang Google Drive.

---

## 📋 Hướng dẫn sử dụng

### Bước 1: Mở file PDF trên Google Drive
1. Mở file PDF bị hạn chế quyền tải trong trình duyệt Google Chrome (hoặc bất kỳ trình duyệt Chromium nào).
2. Cuộn nhẹ xuống một chút để Google Drive tải các phần tử ảnh ban đầu.

### Bước 2: Chạy Script
1. Nhấn `F12` (hoặc phím tắt `Ctrl + Shift + I` trên Windows / `Cmd + Option + I` trên Mac) để mở **Developer Tools**.
2. Chuyển sang tab **Console**.
3. *Nếu trình duyệt chặn paste code*, hãy gõ lệnh `allow pasting` và nhấn Enter trước.
4. Copy toàn bộ mã nguồn từ file [`improved-google-drive-pdf-downloader.js`](./improved-google-drive-pdf-downloader.js), dán vào **Console** rồi nhấn **Enter**.

### Bước 3: Đợi quá trình hoàn tất
- Script sẽ tự động cuộn từ trên xuống dưới để nạp ảnh.
- Hãy **giữ nguyên tab trình duyệt** cho đến khi thấy thông báo trong Console:
  ```text
  PDF downloaded! X page(s).
  ```
- File PDF sẽ tự động được tải về máy tính của bạn.

---

## ⚙️ Cấu hình tùy chỉnh (Configuration)

Bạn có thể thay đổi các tham số trong đối tượng `CONFIG` ở đầu script nếu gặp vấn đề về tốc độ mạng hoặc máy yếu:

```javascript
const CONFIG = {
  renderWaitMs: 700,        // Thời gian chờ (ms) sau mỗi lần cuộn để trang kịp render
  stableBottomPasses: 8,    // Số lần kiểm tra đáy trang để xác nhận đã cuộn hết file
  scrollFraction: 0.85,     // Tỷ lệ khoảng cách cuộn so với chiều cao khung nhìn
  maxPasses: 10000,         // Số lần cuộn tối đa tránh vòng lặp vô tận
};
```

---

## ⚠️ Lưu ý quan trọng

1. **Yêu cầu kết nối mạng:** Script sử dụng thư viện `jsPDF` nạp từ CDN (`unpkg.com`). Hãy đảm bảo kết nối mạng không chặn domain này.
2. **Nguyên lý hoạt động:** Script phụ thuộc vào việc Google Drive hiển thị nội dung dưới dạng các phần tử `<img>` có đường dẫn `blob:https://drive.google.com/`. Nếu Google Drive thay đổi giao diện/cơ chế render trong tương lai, script có thể cần được cập nhật.
3. **Mục đích sử dụng:** Script này được tạo ra nhằm mục đích học tập và hỗ trợ cá nhân trong việc sao lưu tài liệu bị hạn chế. Vui lòng tôn trọng bản quyền tài liệu.

---

## 🛠️ Công nghệ sử dụng

- Vanilla JavaScript (ES6+, Async/Await)
- HTML5 Canvas API
- Thư viện [jsPDF](https://github.com/parallax/jsPDF)

---

## 📄 License

Project này được phát hành dưới giấy phép [MIT License](LICENSE).