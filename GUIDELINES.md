# Hướng dẫn phát triển

## Nguyên tắc sản phẩm

Phục vụ học sinh lớp 5, mỗi lần tập trung một nội dung. Chỉ dạy lập phương và hộp chữ nhật. Hướng dẫn tiếng Việt ngắn, gọi trực tiếp “em”. Không thêm đăng nhập, bảng xếp hạng, quản trị, backend hoặc chatbot trong phiên bản đầu.

## Quy trình

1. Đọc README, AGENTS và phạm vi trong `docs/BRIEF.md`.
2. Xác định thay đổi thuộc dữ liệu, toán học, trạng thái React, hình 3D hay giao diện.
3. Sửa module đúng trách nhiệm; ưu tiên giải pháp ít phụ thuộc.
4. Khi đổi công thức, xử lý đáp án hoặc ánh xạ mặt 3D, bổ sung kiểm thử hồi quy có ý nghĩa.
5. Chạy `npm run check`; kiểm tra màn hình và tương tác liên quan theo `docs/TESTING.md`.
6. Cập nhật tài liệu khi thay đổi cách chạy hoặc hành vi. Chỉ ghi đạt cho kiểm tra đã thực sự chạy.

## Quy ước mã

- JavaScript ES modules, functional component và Hooks. Tên component PascalCase; hook bắt đầu `use`; biến/hàm camelCase.
- Không đưa công thức vào JSX. Hàm thuần ở `utils`, nội dung ở `data`, trạng thái ở `hooks`, WebGL ở `scene`.
- Không mutate state. Không tạo class kiểu Java; trường hợp error boundary React cần class phải có lý do rõ.
- Giữ đơn vị tính trong UI; số liệu bên trong là số, không phải chuỗi có “cm”.
- Dùng named export cho utility/hook; default export cho component. Comment giải thích lý do hoặc quy ước dễ nhầm.
- Giữ `package-lock.json`, dùng `npm ci` để tái tạo môi trường. Không thêm thư viện chỉ để làm một nút hoặc icon đơn giản.

## Quy ước hình học

- `d` theo trục X, `h` theo Y, `r` theo Z; hai đáy là +Y và −Y. Xoay camera không thay đổi định nghĩa đáy.
- BoxGeometry có thứ tự vật liệu: +X, −X, +Y, −Y, +Z, −Z. Diện tích xung quanh bỏ index 2 và 3.
- Lập phương chỉ lưu `a`, suy ra `d = r = h = a`; không cho phép ba cạnh khác nhau.
- Mọi kích thước nguyên 1–10 cm. Khi hỗ trợ thập phân sau này phải sửa đồng thời UI, giới hạn, minh họa và kiểm thử.
- Sxq/Stp dùng cm², V dùng cm³. Phóng to camera không sửa số đo.
- Khối đơn vị chỉ tạo khi kích thước nguyên và thể tích ≤216; dùng instancing, không tạo hàng nghìn mesh riêng.

## Giao diện và khả năng tiếp cận

- Nền chính hồng pastel rất nhạt `#FFF8FB`, chữ chính `#333333`, khối nội dung trắng/xanh rất nhạt. Ô lựa chọn dùng vàng và xanh lá, màu nhấn xanh `#176B47`. Tái sử dụng biến CSS trong `global.css`, giữ tương phản chữ khi thêm màu mới và giữ ý nghĩa màu trên mô hình 3D.
- Nội dung học tập, hướng dẫn, nhãn nút và input tối thiểu 18 px; nhãn phụ tối thiểu 16 px. Dòng chữ chính giãn 1,65, không giảm cỡ chữ trên điện thoại để ép vừa bố cục.
- Dùng Nunito được đóng gói trong `public/fonts/` qua font-family `Geometry Nunito`; giữ đủ bộ Latin và tiếng Việt cùng độ đậm, không lấy font qua `local()`. Khi thay font, kiểm tra cả chữ có dấu và giữ giấy phép theo [docs/FONTS.md](docs/FONTS.md).
- Nút cao tối thiểu 52 px; vùng chạm tối thiểu 44 px. Luôn giữ focus rõ, label cho input, trạng thái `aria-pressed`/`aria-expanded` đúng. Nút xoay/zoom có cả biểu tượng và nhãn chữ nhìn thấy.
- Không chỉ dùng màu báo đúng/sai. Nội dung và nút điều khiển nằm ngoài Canvas, không che hình.
- Tablet/điện thoại đến 1040 px xếp dọc; thử màn 360/390, 768/1024 và desktop 1280 px. Điện thoại đến 650 px xếp thẻ hình và chủ đề một cột. Không khóa cuộn trang ngoài vùng thao tác 3D.
- Không tự xoay liên tục; tôn trọng reduced motion. Có nút xoay/zoom tương đương thao tác chuột.
- Hình triển khai áp dụng cho cả hai hình: lập phương có 6 hình vuông bằng nhau; hộp chữ nhật có hai mặt `d × h`, hai mặt `r × h` và hai đáy `d × r`. Bốn mặt bên màu hồng, hai đáy màu xanh. Nút trải/ghép là trạng thái của một chủ đề; đóng chủ đề hoặc đổi hình phải trả về mô hình 3D. Trạng thái này không thay đổi số đo hay camera.
- Khi ghép mặt, giữ hình triển khai đến hết hoạt ảnh rồi hiện mô hình 3D; nếu thiết bị yêu cầu giảm chuyển động thì ghép ngay. Khoảng cách camera theo `scene/cameraFit.js` phải giúp cạnh 3, 4 rồi 10 cm lớn dần trên màn hình, đồng thời khối 10 cm còn lề trong khung.
- Nhân vật học sinh chỉ trang trí phần đầu trang, dùng SVG và CSS, không thêm thư viện. Hai nhân vật vẫy tay ngắn mỗi 5 giây, đứng yên giữa các lần vẫy và tắt hoàn toàn khi `prefers-reduced-motion: reduce`.

## Bài tập

Mỗi bài có ID ổn định, câu hỏi, đáp án số, đơn vị và lời giải. Đề phải nêu rõ số đo. Mặc định bài độc lập với hình đang chỉnh. “Kiểm tra đáp án” chỉ báo đúng/sai (hoặc yêu cầu nhập số hợp lệ); chỉ hiện đáp án và lời giải khi bấm “Xem đáp án”. Chấp nhận dấu phẩy/dấu chấm và sai số tuyệt đối 0,001; không dùng `parseFloat` để chấp nhận nhầm chuỗi như `3cm`.

## Bàn giao

Nêu thay đổi, lệnh kiểm tra đã chạy, kết quả và hạn chế thật. Không tự push hoặc triển khai. Giáo viên phải rà soát nội dung trước khi dùng trên lớp.
