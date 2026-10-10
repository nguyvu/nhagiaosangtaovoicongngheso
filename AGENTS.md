# Quy tắc cho coding agent

Áp dụng trong thư mục `nha-kien-tao-hinh-hoc/`. Đọc `README.md`, `GUIDELINES.md` và `docs/BRIEF.md` trước khi sửa.

## Phạm vi

- Giữ React + JavaScript + Vite, functional components và Hooks.
- Chỉ có hình lập phương và hình hộp chữ nhật; giao diện học sinh bằng tiếng Việt.
- Không thêm backend, tài khoản, tracking, AI API, hình khác hoặc thư viện không cần thiết nếu chưa có yêu cầu.
- Không sửa các project bài học ở thư mục bên ngoài để phục vụ project này.
- Dự án dùng repository Git riêng tại `/Users/nguyenvu/nha-kien-tao-hinh-hoc`; không init thêm Git lồng nhau. Không tự commit/push, tạo remote hoặc publish.

## Bất biến phải giữ

- Mở một nội dung một lúc; ban đầu chỉ có hình và hướng dẫn. Bấm mục đang chọn phải đóng được.
- Đổi hình phải reset kích thước mặc định, góc nhìn, nội dung và bài tập. `Exploration` hiện dùng React `key={shape}` cho vòng đời này.
- Cube chỉ lưu một cạnh. Số đo 1–10 cm; zoom không đổi số đo.
- Hai đáy theo trục Y; xung quanh chỉ tô 4 mặt bên; toàn phần tô 6 mặt.
- Khối đơn vị có thể tích 1 cm³, kích thước nguyên, tối đa 216 khối. Không tạo khối vượt giới hạn.
- Bài tập độc lập với hình; không lộ lời giải trước khi kiểm tra hoặc chủ động xem.
- Giữ focus, label, nút bàn phím và phản hồi chữ đúng/sai.

## Tổ chức và kiểm chứng

- Công thức trong `src/utils/geometry.js`; kiểm tra đáp án trong `answerValidation.js`; dữ liệu học tập trong `src/data/`.
- Phân biệt state camera và state toán học. Không gọi setState trong render/frame nếu không cần.
- Dùng `npm run check` sau thay đổi có ảnh hưởng mã. Chạy kiểm tra UI khi có công cụ; không khẳng định kiểm tra trình duyệt nếu chưa chạy.
- Mốc bắt buộc: cube a=3 → 36/54/27; cuboid d=5,r=3,h=2 → 32/62/30; cả hai có 8/12/6 đỉnh/cạnh/mặt.
- Không commit `node_modules`, `dist`, `.env*`, token hoặc bí mật. Giữ lockfile.
- Cập nhật docs theo hành vi thật và nêu rõ hạn chế còn lại.
