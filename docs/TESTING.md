# Kiểm thử bản mẫu

Ngày kiểm tra: 10/10/2026. Môi trường thực tế: macOS, Node 25.9.0, npm 11.12.1, Chrome headless. Chrome dùng profile tạm, không dùng profile cá nhân.

## Kết quả thực tế

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run lint` | Đạt |
| `npm test` | 9/9 đạt |
| `npm run build` | Đạt; cảnh báo chunk 3D lớn hơn 500 kB |
| Dev server | HTTP 200 |
| Chrome: desktop 1365 × 1100 | Canvas render; ban đầu chưa mở nội dung |
| Camera | Ảnh render thay đổi khi zoom/xoay; đặt lại trả về ảnh ban đầu |
| Lập phương a=3 | Sxq=36 cm², Stp=54 cm², V=27 cm³ |
| Hộp chữ nhật 5×3×2 | Sxq=32 cm², Stp=62 cm², V=30 cm³ |
| Kích thước | Đổi cạnh lên 10: V=1000 cm³, khóa minh họa khối đơn vị |
| Khối đơn vị | Kiểm tra vị trí, không trùng, số khối bằng V; trình duyệt bật được 27 khối |
| Diện tích | Unit test xác nhận index 0,1,4,5 là mặt bên; toàn phần đủ 6 mặt |
| Đỉnh/cạnh/mặt | UI hiển thị lần lượt 8/12/6 |
| Đổi hình | Đóng mục; trả kích thước và bài tập về mặc định |
| Bài tập | Cả hai hình: kiểm tra sai/đúng vẫn ẩn lời giải; nhập trống báo số không hợp lệ và không mở lời giải; chỉ “Xem đáp án” mới mở lời giải; làm lại/bài tiếp theo ẩn lời giải |
| Mobile giả lập 390 px và 360 px | Không tràn ngang; panel nằm dưới mô hình |
| Lỗi JavaScript/console.error | Không ghi nhận trong kịch bản Chrome |

Ảnh đã chụp và xem lại: [Desktop](screenshots/desktop.png), [Mobile](screenshots/mobile.png).

Gói scene khoảng 948 kB (256 kB gzip), được lazy load riêng. Đây là cảnh báo dung lượng, không phải lỗi build. Chưa đo tốc độ trên thiết bị trường học hoặc mạng chậm.

## Chạy lại

Kiểm tra cấu hình GitHub Pages ngày 12/10/2026: `npm run check` đạt (9/9 tests); Chrome headless chạy bản build tại `/nhagiaosangtaovoicongngheso/` đạt toàn bộ kịch bản desktop/mobile, công thức, camera, bài tập và tải lại trang, không ghi nhận lỗi JavaScript. Cảnh báo chunk 3D lớn hơn 500 kB vẫn còn.

Sau triển khai, cùng kịch bản Chrome headless đã chạy trực tiếp trên [website công khai](https://nguyvu.github.io/nhagiaosangtaovoicongngheso/) và đạt toàn bộ kiểm tra, không ghi nhận lỗi JavaScript. [Workflow triển khai đầu tiên](https://github.com/nguyvu/nhagiaosangtaovoicongngheso/actions/runs/38265101424) hoàn tất thành công cả build và deploy; GitHub Pages bật HTTPS. Mobile là giả lập 390/360 px, chưa kiểm tra bằng điện thoại thật.

```bash
npm run check
npm run test:browser
```

`test:browser` dùng Chrome cài sẵn tại đường dẫn mặc định trên macOS. Với hệ điều hành khác, đặt biến `QA_CHROME_PATH` thành đường dẫn executable Chrome/Chromium. Cần trống cổng 5183 và 9233 và cho phép tiến trình mở localhost/chạy Chrome headless. Script tự chạy/dừng Vite và Chrome, xóa profile tạm, ghi lại ảnh vào `docs/screenshots/`.

Script lấy đường dẫn mặc định từ `base` của Vite. Để kiểm tra bản build sau `npm run check`, chạy `QA_PREVIEW=1 npm run test:browser`. Để kiểm tra website đã triển khai, chạy `QA_BASE_URL=https://nguyvu.github.io/nhagiaosangtaovoicongngheso/ npm run test:browser`; chế độ này chỉ chạy Chrome, không mở Vite. Có thể đặt `QA_SCREENSHOT_DIR` thành thư mục tạm để không thay ảnh tài liệu.

Script dùng Chrome DevTools Protocol qua WebSocket của Node, không cần tải browser hoặc thêm thư viện kiểm thử. Nếu kiểm thử dừng giữa chừng do ngắt tiến trình, kiểm tra các cổng trước khi chạy lại. Không dùng script này trong máy chủ production.

## Checklist thủ công trước khi trình bày

Các mục dưới đây chưa được xác nhận bằng thiết bị thật:

- [ ] Chuột kéo xoay, cuộn zoom; cảm ứng kéo một ngón và chụm hai ngón trên điện thoại/tablet.
- [ ] Đi hết bằng Tab, Enter, Space và phím mũi tên trên slider; kiểm tra focus và trình đọc màn hình.
- [ ] Xoay ra mặt sau: giáo viên xác nhận cách tô mặt bên/hai đáy dễ hiểu, các cạnh/đỉnh nhận biết được.
- [ ] Đủ 216 khối trên máy cấu hình thấp, hình 10×10×10 vừa khung.
- [ ] Thử Safari, Firefox; trạng thái không có WebGL và khi WebGL context bị mất.
- [ ] Kiểm tra cỡ chữ và tương phản trên máy chiếu lớp học.
- [ ] Giáo viên rà soát công thức, thuật ngữ, câu hỏi và lời giải.

Kiểm thử Chrome headless không thay thế kiểm thử cảm ứng, hiệu năng thiết bị thật hoặc thẩm định sư phạm.
