# Kiểm thử bản mẫu

Môi trường kiểm tra: macOS, Node 25.9.0, npm 11.12.1, Chrome headless. Chrome dùng profile tạm, không dùng profile cá nhân.

## Giao diện vàng–xanh 1.1 — 13/10/2026

Nhánh `feature/HHCN_HLPver1.1` được kiểm tra bằng `npm run check` và `QA_PREVIEW=1 npm run test:browser` trên bản build cục bộ. Kết quả này áp dụng cho bản giao diện mới, chưa phải bản đã triển khai trên GitHub Pages.

| Kiểm tra | Kết quả |
| --- | --- |
| Lint, kiểm thử logic, build | Đạt; 20/20 kiểm thử logic, còn cảnh báo chunk 3D lớn hơn 500 kB |
| Desktop 1280 px; tablet 768/1024 px; mobile giả lập 360/390 px | Mở toàn bộ chủ đề, công thức dài và lời giải; không tràn ngang trang hoặc bị cắt trong khối nội dung |
| Chữ và nút | Nội dung học tập/nhãn nút tối thiểu 18 px; vùng bấm ít nhất 44 px; nút xoay/zoom luôn có nhãn chữ |
| Bàn phím | Tab chuyển focus có viền rõ; Enter/Space mở và đóng chủ đề; ArrowRight thay đổi thanh trượt; Enter ghép hình giữ focus trên cùng nút cả trong chuyển động và sau khi đổi lại nhãn trải |
| Nhãn kích thước | Ba nhãn hộp chữ nhật nằm trọn khung ở 360 px tại góc mặc định; đã chụp thêm góc xoay và phóng to |
| Trải mặt hai hình hộp | Một nút chủ đề đổi nhãn trải/ghép, không có nút lặp bên dưới. Các mặt WebGL gập/mở quanh cạnh nối; kiểm thử ma trận xác nhận đúng sáu vị trí đóng, mặt phẳng không chồng nhau và cạnh nối luôn trùng ở góc trung gian. Ảnh Chrome ở giữa chuyển động khác ảnh khối và ảnh trải cuối. Ghép lại khôi phục ảnh khối/góc nhìn; đổi hình hủy chuyển động; reduced motion đổi ngay |
| Nhãn mặt trải | Kiểm thử cỡ số 28–36 px; mặt hẹp dùng số ngoài mặt có đường nối, không ẩn số. Chú giải và diện tích gọi “Hình số …” |
| Camera trong chuyển động | Kiểm thử phép chiếu các đỉnh/mép mặt tại các góc trung gian và số đo cực trị trên khung desktop/mobile; camera giữ lề cho các mặt đang mở, không chỉ cho hình triển khai cuối |
| Khung 3D | Hình ban đầu của ba khối hồng sáng trên nền hồng gần trắng; camera tự lùi khi tăng số đo. Ảnh WebGL tại cạnh lập phương 3, 4 và 10 cm được so kích thước thực; khối 10 cm còn lề quanh khung |
| Hình trụ | Thẻ màu hồng; chỉ bốn chủ đề đặc điểm, trải mặt, kích thước và bài tập. Đổi bán kính/cao cập nhật mô hình và nhãn. Không hiển thị diện tích/thể tích hoặc công thức π |
| Trải hình trụ | Một nút chủ đề “Trải mặt hình trụ” tự chạy hoạt ảnh và đổi thành “Ghép thành khối”; không có nút trong nội dung. Ghép xong đóng mục và trở lại nhãn trải, giữ focus bàn phím. Mặt cong WebGL duỗi liên tục thành chữ nhật dài bằng chu vi đáy, hai đáy xoay quanh điểm nối. Kiểm thử xác nhận đường khép kín, độ dài cung không đổi và bản lề hai đáy không hở. Chrome chụp trạng thái giữa mở/ghép và kiểm tra trả về ảnh khối/góc nhìn cũ; reduced motion đổi ngay. Màn 360 px kiểm tra r=1/h=10, r=10/h=1 và r=10/h=10; net và khối lớn nhất còn trong khung, thu nhỏ vẫn hoạt động |
| Bài tập hình trụ | Bốn bài nhận biết, đáp án 2/1/0/1. Kiểm tra rỗng/sai/đúng không tự mở lời giải; làm lại, đổi bài và đổi hình đặt lại trạng thái |
| Chức năng hiện có | Công thức, camera, đổi hình/reset, giới hạn khối đơn vị và luồng bài tập đều đạt |
| Nhân vật học sinh | Hai nhân vật SVG xuất hiện trên desktop và điện thoại; vẫy tay ngắn mỗi 5 giây và đứng yên giữa các lần vẫy; Chrome giả lập reduced motion xác nhận tắt toàn bộ hoạt ảnh nhân vật |
| Lỗi JavaScript | Không ghi nhận trong kịch bản kiểm tra |

Các cặp màu chính đã tính tương phản: chữ `#333333`/nền hồng `#FFF8FB` là 12,08:1; chữ trắng/nút xanh `#176B47` là 6,50:1; biểu tượng `#76520c`/nền vàng được chọn `#ffe58c` là 5,65:1; biểu tượng `#176B47`/nền xanh được chọn `#c8eba9` là 4,93:1. Đây là kiểm tra các cặp màu thiết kế, không thay thế rà soát toàn bộ khả năng tiếp cận bằng thiết bị thật.

Ảnh bản 1.1: [Desktop](screenshots/desktop.png), [Lập phương 3 cm](screenshots/cube-3cm.png), [4 cm](screenshots/cube-4cm.png), [10 cm](screenshots/cube-10cm.png), [Hộp chữ nhật ban đầu](screenshots/cuboid-initial.png), [Trải lập phương](screenshots/desktop-net.png), [Trải hộp chữ nhật](screenshots/desktop-cuboid-net.png), [Công thức desktop](screenshots/desktop-panel.png), [Tablet](screenshots/tablet.png), [Mobile](screenshots/mobile.png), [Trải lập phương mobile](screenshots/mobile-net.png), [Trải hộp chữ nhật mobile](screenshots/mobile-cuboid-net.png), [Công thức mobile](screenshots/mobile-panel.png), [Bài tập mobile](screenshots/mobile-exercise.png), [Nhãn kích thước 360 px](screenshots/mobile-dimensions.png), [Sau xoay](screenshots/mobile-dimensions-rotated.png), [Sau xoay và phóng to](screenshots/mobile-dimensions-zoomed.png).

Ảnh hình trụ: [Ban đầu](screenshots/cylinder-initial.png), [Hai đường tròn đáy](screenshots/cylinder-rims.png), [Trải mặt desktop](screenshots/desktop-cylinder-net.png), [Trải mặt mobile](screenshots/mobile-cylinder-net.png), [Bán kính/cao 10 cm trên mobile](screenshots/cylinder-10cm-mobile.png). Mobile dùng Chrome giả lập, chưa kiểm tra cảm ứng trên thiết bị thật; giáo viên cần rà soát nội dung hình trụ mở rộng trước khi dùng trong lớp.

Ảnh mặt hẹp: [Hộp chữ nhật 1 × 10 × 10 cm ở 360 px](screenshots/cuboid-extreme-labels.png).

Ảnh chuyển động WebGL: [Lập phương đang mở](screenshots/cube-unfolding.png), [Đang ghép](screenshots/cube-folding.png), [Hộp chữ nhật đang mở](screenshots/cuboid-unfolding.png), [Hình trụ đang mở](screenshots/cylinder-unfolding.png), [Hình trụ đang ghép](screenshots/cylinder-folding.png). So sánh camera/khối bằng pixel ảnh render, cho phép sai khác khử răng cưa rất nhỏ. Số trong SVG dự phòng cũng dùng bố trí nhãn chung, không ẩn mặt hẹp; chưa kiểm chứng chế độ này trên thiết bị thiếu WebGL; chưa đo độ mượt trên máy cấu hình thấp hoặc máy chiếu trường học.

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

Gói scene khoảng 961 kB (261 kB gzip), được lazy load riêng. Đây là cảnh báo dung lượng, không phải lỗi build. Chưa đo tốc độ trên thiết bị trường học hoặc mạng chậm.

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
