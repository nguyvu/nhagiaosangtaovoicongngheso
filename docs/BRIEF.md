# Phạm vi bản mẫu

## Mục tiêu

“Nhà kiến tạo hình học” hỗ trợ học sinh quan sát, thử nghiệm và khám phá ba hình không gian, dùng để trình bày với Ban Giám hiệu. Hình trụ được thêm theo yêu cầu, là nội dung mở rộng của bản mẫu lớp 5; chỉ dạy nhận biết, kích thước và trải mặt.

## Nội dung

| Chủ đề | Lập phương | Hộp chữ nhật | Hình trụ |
| --- | --- | --- | --- |
| Đặc điểm | 8 đỉnh, 12 cạnh, 6 mặt vuông bằng nhau | 8 đỉnh, 12 cạnh, 6 mặt chữ nhật; mặt đối diện bằng nhau | Không có đỉnh/cạnh thẳng; hai đáy tròn, một mặt cong xung quanh |
| Kích thước mặc định | a = 3 cm | d = 5, r = 3, h = 2 cm | Bán kính r = 2 cm, cao h = 4 cm |
| Diện tích xung quanh | 4 × a × a | 2 × (d + r) × h | Không dạy |
| Diện tích toàn phần | 6 × a × a | 2 × (d × r + d × h + r × h) | Không dạy |
| Thể tích | a × a × a | d × r × h | Không dạy |
| Bài tập | Nhận biết, Sxq, Stp, V | Nhận biết, Sxq, Stp, V | Nhận biết đáy, mặt cong, đỉnh và mặt trải |

## Giả định

- Kích thước nguyên 1–10 cm trong toàn ứng dụng, phù hợp thanh trượt và khối đơn vị.
- Hai hình hộp dùng tối đa 216 khối đơn vị. Hình trụ không có nội dung diện tích/thể tích hoặc lớp thể tích.
- Bốn bài tập hình trụ đều là nhận biết, đáp án lần lượt 2, 1, 0, 1.
- Mặc định chọn lập phương, chưa mở kiến thức. Trạng thái chỉ giữ trong lần mở trang.
- Bài tập cố định, độc lập kích thước; không chấm điểm, lưu tiến độ hoặc thu dữ liệu học sinh.
- Không thêm dịch vụ AI; AI chỉ hỗ trợ quá trình phát triển.
- Giao diện 1.1: nền hồng pastel rất nhạt `#FFF8FB`, ô lựa chọn vàng–xanh lá–hồng, chữ chính `#333333` từ 18 px, khối nội dung bo góc, nút lớn có nhãn và biểu tượng; tablet/điện thoại xếp nội dung dọc. Hai nhân vật học sinh vẫy tay ngắn mỗi 5 giây, đứng yên giữa các lần vẫy; tắt hoạt ảnh khi thiết bị yêu cầu giảm chuyển động. Giữ nguyên nội dung học và chức năng bản mẫu.
- Theo yêu cầu tách dự án, dùng repository Git cục bộ riêng tại `/Users/nguyenvu/nha-kien-tao-hinh-hoc`, độc lập với bộ bài học React.
- Cả ba hình có chế độ trải mặt và ghép lại. Lập phương có sáu hình vuông bằng nhau; hộp chữ nhật có ba cặp hình chữ nhật kích thước `d × h`, `r × h`, `d × r`; hình trụ có hình chữ nhật dài bằng chu vi đáy, rộng bằng chiều cao, kèm hai đáy tròn. Hai hình hộp hiển thị diện tích các cặp mặt; hình trụ chỉ mô tả mặt chữ nhật và hai đáy tròn.

## Kiến trúc

`App → Exploration (key theo hình) → useGeometry + useExercises → controls/panels/scene`.

`getDimensions` ánh xạ cạnh cube thành ba chiều, giữ `radius/h` riêng cho cylinder; `calculateGeometry` tạo kết quả thuần. Scene đọc số đo nhưng không chỉnh chúng. Panel chỉ gửi thao tác về hook hoặc state cục bộ. Camera command có ID để thao tác lặp lại vẫn có hiệu lực.

`BoxModel` dùng chung cấu trúc hai hình, wrappers thể hiện vai trò của Cube/Cuboid. UnitCubeVisualization dùng một instanced mesh. Canvas render theo nhu cầu (`frameloop="demand"`), scene được lazy load để tách phần 3D khỏi giao diện ban đầu.

`CylinderModel` dựng mặt cong, hai đáy và đường tròn bao quanh đáy bằng Three.js có sẵn. `CylinderKnowledge` dùng dữ liệu riêng cho đặc điểm hình trụ và tái sử dụng điều khiển kích thước, bài tập. Không thêm dependency.

`UnfoldingModel` điều khiển chuyển động 2,4 giây và camera qua refs; `BoxUnfolding` xoay sáu mặt quanh cạnh nối, `CylinderUnfolding` mở hai đáy và giảm độ cong mặt xung quanh đến chữ nhật. Phép biến đổi thuần ở `utils/unfolding.js`; camera khôi phục góc nhìn/zoom trước khi trải. Không cập nhật state React mỗi frame. `ShapeNet`/`CylinderNet` giữ sơ đồ SVG dự phòng khi WebGL không khả dụng; trên WebGL sơ đồ được dựng từ các mặt 3D thực.

Mặt mặc định dùng màu hồng sáng ổn định trên nền gần trắng. Khoảng cách camera phụ thuộc kích thước lớn nhất và tỉ lệ khung, nhưng không thay đổi số đo toán học; lập phương 4–10 cm tiếp tục lớn dần trong khung. Hình triển khai trải và ghép bằng hoạt ảnh; khi giảm chuyển động, trạng thái đổi ngay.

## Các bước tiếp theo

1. Giáo viên duyệt lời giải, thuật ngữ và cách xác định hai đáy.
2. Thử trên máy tính, điện thoại và máy chiếu dùng thực tế tại trường.
3. Thu phản hồi về cỡ chữ, thao tác và mức khó bài tập trước khi mở rộng.

Cả ba hình dùng cùng một nút đổi nhãn trải/ghép; ghép xong đóng nội dung. Số mặt đủ 1–6; mặt hẹp có số ngoài mặt và đường nối; chú giải gọi “Hình số …”.
