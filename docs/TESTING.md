# Kiểm thử bản mẫu

Môi trường kiểm tra: macOS, Node 25.9.0, npm 11.12.1, Chrome headless. Chrome dùng profile tạm, không dùng profile cá nhân.

## Giao diện vàng–xanh 1.1 — 13/10/2026

Nhánh `feature/HHCN_HLPver1.1` được kiểm tra bằng `npm run check` và `QA_PREVIEW=1 npm run test:browser` trên bản build cục bộ. Kết quả này áp dụng cho bản giao diện mới, chưa phải bản đã triển khai trên GitHub Pages.

| Kiểm tra | Kết quả |
| --- | --- |
| Lint, kiểm thử logic, build | Đạt; 10/10 kiểm thử logic, còn cảnh báo chunk 3D lớn hơn 500 kB |
| Desktop 1280 px; tablet 768/1024 px; mobile giả lập 360/390 px | Mở toàn bộ chủ đề, công thức dài và lời giải; không tràn ngang trang hoặc bị cắt trong khối nội dung |
| Chữ và nút | Nội dung học tập/nhãn nút tối thiểu 18 px; vùng bấm ít nhất 44 px; nút xoay/zoom luôn có nhãn chữ |
| Bàn phím | Tab chuyển focus có viền rõ; Enter/Space mở và đóng chủ đề; ArrowRight thay đổi thanh trượt |
| Nhãn kích thước | Ba nhãn hộp chữ nhật nằm trọn khung ở 360 px tại góc mặc định; đã chụp thêm góc xoay và phóng to |
| Trải mặt hai hình | Lập phương có sáu mặt vuông; hộp chữ nhật có hai mặt `d × h`, hai mặt `r × h`, hai đáy `d × r`; diện tích cập nhật khi đổi số đo. Đã kiểm tra hộp 1×10×10 cm trên màn 360 px. Ghép lại có hoạt ảnh ngược, đóng chủ đề và đổi hình trả về mô hình; Chrome giả lập reduced motion tắt hiệu ứng trải và ghép mặt |
| Khung 3D | Hình ban đầu của hai khối hồng sáng trên nền hồng gần trắng; camera tự lùi khi tăng cạnh. Ảnh WebGL tại cạnh lập phương 3, 4 và 10 cm được so kích thước thực; khối 10 cm còn lề quanh khung |
| Chức năng hiện có | Công thức, camera, đổi hình/reset, giới hạn khối đơn vị và luồng bài tập đều đạt |
| Nhân vật học sinh | Hai nhân vật SVG xuất hiện trên desktop và điện thoại; vẫy tay ngắn mỗi 5 giây và đứng yên giữa các lần vẫy; Chrome giả lập reduced motion xác nhận tắt toàn bộ hoạt ảnh nhân vật |
| Lỗi JavaScript | Không ghi nhận trong kịch bản kiểm tra |

Các cặp màu chính đã tính tương phản: chữ `#333333`/nền hồng `#FFF8FB` là 12,08:1; chữ trắng/nút xanh `#176B47` là 6,50:1; biểu tượng `#76520c`/nền vàng được chọn `#ffe58c` là 5,65:1; biểu tượng `#176B47`/nền xanh được chọn `#c8eba9` là 4,93:1. Đây là kiểm tra các cặp màu thiết kế, không thay thế rà soát toàn bộ khả năng tiếp cận bằng thiết bị thật.

Ảnh bản 1.1: [Desktop](screenshots/desktop.png), [Lập phương 3 cm](screenshots/cube-3cm.png), [4 cm](screenshots/cube-4cm.png), [10 cm](screenshots/cube-10cm.png), [Hộp chữ nhật ban đầu](screenshots/cuboid-initial.png), [Trải lập phương](screenshots/desktop-net.png), [Trải hộp chữ nhật](screenshots/desktop-cuboid-net.png), [Công thức desktop](screenshots/desktop-panel.png), [Tablet](screenshots/tablet.png), [Mobile](screenshots/mobile.png), [Trải lập phương mobile](screenshots/mobile-net.png), [Trải hộp chữ nhật mobile](screenshots/mobile-cuboid-net.png), [Công thức mobile](screenshots/mobile-panel.png), [Bài tập mobile](screenshots/mobile-exercise.png), [Nhãn kích thước 360 px](screenshots/mobile-dimensions.png), [Sau xoay](screenshots/mobile-dimensions-rotated.png), [Sau xoay và phóng to](screenshots/mobile-dimensions-zoomed.png).

## Kết quả bản mẫu 0.1 — 10/10/2026

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

Ảnh trong `docs/screenshots/` được cập nhật theo lần kiểm tra giao diện mới nhất ở trên.

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
