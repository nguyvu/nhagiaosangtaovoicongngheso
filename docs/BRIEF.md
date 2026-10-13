# Phạm vi bản mẫu 0.1

## Mục tiêu

“Nhà kiến tạo hình học” hỗ trợ học sinh lớp 5 quan sát, thử nghiệm và khám phá hai hình không gian, dùng để trình bày với Ban Giám hiệu. Đây là bản sơ bộ chạy cục bộ theo bản mô tả được cung cấp.

## Nội dung

| Chủ đề | Lập phương | Hộp chữ nhật |
| --- | --- | --- |
| Đặc điểm | 8 đỉnh, 12 cạnh, 6 mặt vuông bằng nhau | 8 đỉnh, 12 cạnh, 6 mặt chữ nhật; mặt đối diện bằng nhau |
| Kích thước mặc định | a = 3 cm | d = 5, r = 3, h = 2 cm |
| Diện tích xung quanh | 4 × a × a | 2 × (d + r) × h |
| Diện tích toàn phần | 6 × a × a | 2 × (d × r + d × h + r × h) |
| Thể tích | a × a × a | d × r × h |
| Bài tập | Nhận biết, Sxq, Stp, V | Nhận biết, Sxq, Stp, V |

## Giả định

- Kích thước nguyên 1–10 cm trong toàn ứng dụng, phù hợp thanh trượt và khối đơn vị.
- Tối đa 216 khối minh họa. Kích thước lớn hơn vẫn xem mô hình, diện tích và thể tích bình thường.
- Mặc định chọn lập phương, chưa mở kiến thức. Trạng thái chỉ giữ trong lần mở trang.
- Bài tập cố định, độc lập kích thước; không chấm điểm, lưu tiến độ hoặc thu dữ liệu học sinh.
- Không thêm dịch vụ AI; AI chỉ hỗ trợ quá trình phát triển.
- Giao diện 1.1: nền hồng pastel rất nhạt `#FFF8FB`, ô lựa chọn vàng–xanh lá, chữ chính `#333333` từ 18 px, khối nội dung bo góc, nút lớn có nhãn và biểu tượng; tablet/điện thoại xếp nội dung dọc. Hai nhân vật học sinh vẫy tay ngắn mỗi 5 giây, đứng yên giữa các lần vẫy; tắt hoạt ảnh khi thiết bị yêu cầu giảm chuyển động. Giữ nguyên nội dung học và chức năng bản mẫu.
- Theo yêu cầu tách dự án, dùng repository Git cục bộ riêng tại `/Users/nguyenvu/nha-kien-tao-hinh-hoc`, độc lập với bộ bài học React.
- Cả hai hình có chế độ trải sáu mặt thành hình triển khai và ghép lại. Lập phương có sáu hình vuông bằng nhau; hộp chữ nhật có ba cặp hình chữ nhật kích thước `d × h`, `r × h`, `d × r`. Nội dung cho biết diện tích từng mặt/cặp mặt, bốn mặt bên và cả sáu mặt theo số đo hiện tại.

## Kiến trúc

`App → Exploration (key theo hình) → useGeometry + useExercises → controls/panels/scene`.

`getDimensions` ánh xạ cạnh cube thành ba chiều; `calculateGeometry` tạo kết quả thuần. Scene đọc số đo nhưng không chỉnh chúng. Panel chỉ gửi thao tác về hook hoặc state cục bộ. Camera command có ID để thao tác lặp lại vẫn có hiệu lực.

`BoxModel` dùng chung cấu trúc hai hình, wrappers thể hiện vai trò của Cube/Cuboid. UnitCubeVisualization dùng một instanced mesh. Canvas render theo nhu cầu (`frameloop="demand"`), scene được lazy load để tách phần 3D khỏi giao diện ban đầu.

Mặt mặc định dùng màu hồng sáng ổn định trên nền gần trắng. Khoảng cách camera phụ thuộc kích thước lớn nhất và tỉ lệ khung, nhưng không thay đổi số đo toán học; lập phương 4–10 cm tiếp tục lớn dần trong khung. Hình triển khai trải và ghép bằng hoạt ảnh; khi giảm chuyển động, trạng thái đổi ngay.

## Các bước tiếp theo

1. Giáo viên duyệt lời giải, thuật ngữ và cách xác định hai đáy.
2. Thử trên máy tính, điện thoại và máy chiếu dùng thực tế tại trường.
3. Thu phản hồi về cỡ chữ, thao tác và mức khó bài tập trước khi mở rộng.
