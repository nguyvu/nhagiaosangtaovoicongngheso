# Nhà kiến tạo hình học

Bản mẫu tiếng Việt giúp học sinh lớp 5 khám phá hình lập phương và hình hộp chữ nhật bằng mô hình 3D. AI hỗ trợ xây dựng phần mềm; ứng dụng không tích hợp chatbot hoặc API AI.

## Chạy dự án

Yêu cầu Node.js từ 22.12 (khuyến nghị Node 22 LTS), npm và trình duyệt có WebGL.

```bash
cd /Users/nguyenvu/nha-kien-tao-hinh-hoc
npm ci
npm run dev
```

Mở địa chỉ Vite in ra, mặc định `http://127.0.0.1:5173`. Lần đầu nếu chưa có lockfile, dùng `npm install` thay `npm ci`.

```bash
npm run lint     # kiểm tra mã nguồn và quy tắc Hooks
npm test         # kiểm tra toán học, đáp án, khối đơn vị
npm run build    # tạo dist/
npm run preview  # xem bản build, mặc định cổng 4173
npm run check    # lint + test + build
npm run test:browser # tùy chọn: Chrome headless cài sẵn, xem docs/TESTING.md
```

Không cần file môi trường, tài khoản, backend hoặc cơ sở dữ liệu. Sau khi cài thư viện, ứng dụng không tải font, mô hình hay nội dung từ CDN khi chạy.

## Chức năng bản 0.1

- Chọn một trong hai hình; đổi hình sẽ đặt lại kích thước, góc nhìn, nội dung và bài tập.
- Xoay bằng kéo chuột/cảm ứng; zoom bằng cuộn/chụm; có nút xoay trái/phải, zoom và đặt lại để dùng bàn phím.
- Mở/đóng từng nội dung: đỉnh/cạnh/mặt, kích thước, diện tích, thể tích, bài tập.
- Kích thước nguyên 1–10 cm, nhãn kích thước chỉ hiện ở mục tương ứng.
- Làm nổi bật nhóm đỉnh/cạnh/mặt; phân biệt 4 mặt bên và 2 mặt đáy theo trục đứng Y.
- Công thức, thay số và đơn vị cm²/cm³ cập nhật theo kích thước.
- Minh họa tối đa 216 khối đơn vị; vượt giới hạn sẽ hiện hướng dẫn giảm kích thước.
- 4 bài tập mỗi hình; kiểm tra đáp án, lời giải, bài tiếp theo và làm lại.
- Giao diện hồng nhạt, responsive, focus bàn phím và phản hồi có chữ.

## Hướng dẫn thao tác

1. Chọn hình ở hai thẻ đầu trang.
2. Kéo hình để quan sát; dùng các nút bên dưới nếu thao tác bằng bàn phím.
3. Mở “Kích thước” và kéo thanh trượt (hoặc dùng phím mũi tên khi thanh trượt có focus).
4. Mở “Diện tích” hoặc “Thể tích” để xem kết quả theo hình vừa chỉnh.
5. Mở “Bài tập”. Sử dụng số liệu trong đề, không lấy kích thước của mô hình hiện tại. “Kiểm tra đáp án” chỉ báo đúng/sai; bấm “Xem đáp án” mới hiển thị đáp án và lời giải.

Bấm mục đang mở để đóng. Nút “Góc nhìn ban đầu” chỉ đặt lại camera. Chọn hình khác sẽ bắt đầu lượt khám phá mới. Camera tự căn khoảng cách khi kích thước lớn nhất thay đổi để hình vừa khung; zoom không sửa số đo.

## Công nghệ và lựa chọn

React 19 + JavaScript + Vite; Three.js, React Three Fiber 9 và Drei cho camera, đường viền và nhãn. React Three Fiber giúp đồng bộ trạng thái React với hình 3D; Drei giảm mã thiết lập. Không nhúng GeoGebra vì mô hình hai hình hộp đủ đơn giản để dựng trực tiếp, không cần iframe hoặc phụ thuộc dịch vụ ngoài.

Tài liệu gốc: [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/installation), [Vite](https://vite.dev/guide/).

## Cấu trúc

```text
src/
  App.jsx                  Ghép bố cục, chọn hình và quản lý nội dung đang mở
  main.jsx                 Khởi động React và CSS
  components/              Thẻ chọn hình, điều khiển và panel học tập
  scene/
    GeometryScene.jsx      Canvas, ánh sáng, camera và OrbitControls
    BoxModel.jsx           Dựng mặt/cạnh/đỉnh và nhãn chung
    CubeModel.jsx          Mô hình lập phương
    CuboidModel.jsx        Mô hình hộp chữ nhật
    UnitCubeVisualization.jsx  Instanced mesh cho khối đơn vị
  hooks/                   Kích thước và luồng bài tập
  utils/                   Hàm toán học và kiểm tra đáp án thuần
  data/                    Nội dung tiếng Việt, số liệu bài tập
  styles/                  CSS nền tảng và bố cục responsive
tests/                     Kiểm tra logic bằng Node test runner
scripts/                   Kiểm thử trình duyệt bằng Chrome DevTools Protocol
docs/                      Phạm vi, kiến trúc và checklist kiểm thử
```

Đọc [GUIDELINES.md](GUIDELINES.md) trước khi phát triển; [AGENTS.md](AGENTS.md) là quy tắc dành cho coding agent. [BRIEF.md](docs/BRIEF.md) tóm tắt phạm vi và [TESTING.md](docs/TESTING.md) ghi kiểm thử thực tế cùng những mục cần kiểm thủ công.

## Git và giới hạn

Website GitHub Pages: [Nhà kiến tạo hình học](https://nguyvu.github.io/nhagiaosangtaovoicongngheso/).

Workflow `.github/workflows/deploy.yml` tự triển khai mỗi lần push lên `feature/HHCN_HLP`, hoặc chạy thủ công từ tab Actions trên nhánh này. GitHub dùng Node.js 22, chạy `npm ci` và `npm run check`; chỉ đưa `dist/` lên Pages khi lint, test và build đều đạt. Trong Settings → Pages, chọn nguồn **GitHub Actions**.

Để cập nhật website: sửa mã nguồn, chạy `npm run check`, kiểm tra giao diện, commit rồi push lên `feature/HHCN_HLP`. Theo dõi workflow **Deploy GitHub Pages** trong tab Actions. Không commit `dist/` hoặc `node_modules/`. Nếu kiểm tra/build lỗi, bước deploy không chạy và bản đang phục vụ được giữ nguyên.

`base` trong `vite.config.js` là `/nhagiaosangtaovoicongngheso/`. Khi đổi tên repository hoặc địa chỉ hosting, sửa `base` cho khớp rồi build/deploy lại; nếu chuyển sang tên miền riêng ở đường dẫn gốc thì dùng `/`. Đổi `base` không tự đổi tên repository hay cấu hình tên miền.

Dự án có repository Git cục bộ riêng tại `/Users/nguyenvu/nha-kien-tao-hinh-hoc`, độc lập với repository bài học React. Repository GitHub: [nguyvu/nhagiaosangtaovoicongngheso](https://github.com/nguyvu/nhagiaosangtaovoicongngheso), nhánh phát triển `feature/HHCN_HLP`. `.gitignore` loại bỏ dependencies, build, file môi trường và dữ liệu nhạy cảm thông thường.

Đây là bản mẫu, chưa có lưu tiến độ hay chế độ offline/PWA. WebGL cần được trình duyệt và thiết bị hỗ trợ. Mô hình dùng khe nhỏ giữa khối đơn vị để nhìn rõ, không làm thay đổi thể tích toán học. Xem giới hạn xác minh trong `docs/TESTING.md`. Nội dung kiến thức cần giáo viên rà soát trước khi dùng trong lớp.
