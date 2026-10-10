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
- Theo yêu cầu tách dự án, dùng repository Git cục bộ riêng tại `/Users/nguyenvu/nha-kien-tao-hinh-hoc`, độc lập với bộ bài học React.

## Kiến trúc

`App → Exploration (key theo hình) → useGeometry + useExercises → controls/panels/scene`.

`getDimensions` ánh xạ cạnh cube thành ba chiều; `calculateGeometry` tạo kết quả thuần. Scene đọc số đo nhưng không chỉnh chúng. Panel chỉ gửi thao tác về hook hoặc state cục bộ. Camera command có ID để thao tác lặp lại vẫn có hiệu lực.

`BoxModel` dùng chung cấu trúc hai hình, wrappers thể hiện vai trò của Cube/Cuboid. UnitCubeVisualization dùng một instanced mesh. Canvas render theo nhu cầu (`frameloop="demand"`), scene được lazy load để tách phần 3D khỏi giao diện ban đầu.

## Các bước tiếp theo

1. Giáo viên duyệt lời giải, thuật ngữ và cách xác định hai đáy.
2. Thử trên máy tính, điện thoại và máy chiếu dùng thực tế tại trường.
3. Thu phản hồi về cỡ chữ, thao tác và mức khó bài tập trước khi mở rộng.
