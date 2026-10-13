# Nhà kiến tạo hình học

Bản mẫu tiếng Việt giúp học sinh khám phá hình lập phương, hình hộp chữ nhật và hình trụ bằng mô hình 3D. Phần hình trụ là nội dung mở rộng của bản mẫu lớp 5. AI hỗ trợ xây dựng phần mềm; ứng dụng không tích hợp chatbot hoặc API AI.

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

- Chọn một trong ba hình; đổi hình sẽ đặt lại kích thước, góc nhìn, nội dung và bài tập.
- Xoay bằng kéo chuột/cảm ứng; zoom bằng cuộn/chụm; có nút xoay trái/phải, zoom và đặt lại để dùng bàn phím.
- Mở/đóng từng nội dung: đỉnh/cạnh/mặt, kích thước, diện tích, thể tích, bài tập.
- Với hai hình hộp, bấm “Trải hình thành 6 mặt hình vuông/chữ nhật” để sáu mặt 3D mở quanh các cạnh nối. Lập phương có 6 hình vuông diện tích `a × a`; hộp chữ nhật có hai mặt `d × h`, hai mặt `r × h` và hai đáy `d × r`. Với hình trụ, bấm “Trải mặt hình trụ”: hai đáy xoay ra, mặt cong duỗi liên tục thành hình chữ nhật. Cả ba hình dùng chính nút chủ đề đổi thành “Ghép thành khối”; bấm để ghép và đóng nội dung.
- Kích thước nguyên 1–10 cm, nhãn kích thước chỉ hiện ở mục tương ứng.
- Làm nổi bật đỉnh/cạnh/mặt của hai hình hộp; hình trụ làm nổi bật đường tròn đáy và mặt cong. Hai đáy luôn theo trục đứng Y.
- Công thức, thay số và đơn vị cm²/cm³ cập nhật theo kích thước.
- Hai hình hộp minh họa tối đa 216 khối đơn vị; vượt giới hạn sẽ hiện hướng dẫn giảm kích thước. Hình trụ chỉ học nhận biết, kích thước và trải mặt.
- 4 bài tập mỗi hình; kiểm tra đáp án, lời giải, bài tiếp theo và làm lại.
- Giao diện nền hồng pastel rất nhạt `#FFF8FB`, ô lựa chọn vàng–xanh lá, chữ chính `#333333` từ 18 px, nút lớn có biểu tượng và nhãn; hỗ trợ focus bàn phím và phản hồi có chữ.

## Giao diện phiên bản 1.1

Nhánh `feature/HHCN_HLPver1.1` dùng nền hồng pastel nhạt, màu nhấn xanh lá và các ô lựa chọn vàng–xanh. Ô được chọn có nền đậm hơn, viền rõ và dấu chọn hoặc biểu tượng đóng. Khối nội dung trắng, góc bo mềm và khoảng cách thoáng. Nội dung học tập và nhãn nút tối thiểu 18 px, dòng chữ giãn 1,65; nhãn phụ dùng 16 px. Nút cao tối thiểu 52 px; nút xoay/zoom luôn hiện chữ trên cả điện thoại. Biểu tượng SVG có sẵn trong mã nguồn, không thêm thư viện.

Hai nhân vật học sinh SVG ở đầu trang vẫy tay ngắn mỗi 5 giây và nhún nhẹ khi mở trang. Hình minh họa thu gọn trên điện thoại, không nhận focus hoặc được đọc như nội dung học. Khi thiết bị bật giảm chuyển động (`prefers-reduced-motion`), hoạt ảnh nhân vật và trải/ghép mặt đều được tắt.

Tablet và điện thoại (chiều rộng đến 1040 px) xếp mô hình và nội dung học theo chiều dọc. Điện thoại đến 650 px dùng thẻ chọn hình và danh sách chủ đề một cột. Nền mô hình và phần mở đầu được giảm chi tiết trang trí; các màu đánh dấu đỉnh, cạnh và mặt 3D vẫn giữ ý nghĩa học tập. Font Nunito bo tròn có đầy đủ ký tự tiếng Việt được đóng gói trong dự án, không phụ thuộc font cài trên máy và không gọi Google Fonts khi chạy. Xem [font và giấy phép](docs/FONTS.md).

Các khối 3D ban đầu có các mặt hồng sáng trên nền hồng gần trắng. Camera tăng khoảng cách theo kích thước để lập phương tiếp tục lớn dần từ 4 đến 10 cm mà vẫn nằm trong khung; nhãn “Kéo để xoay hình” ở góc trên phải để không che đáy khối. Màu đánh dấu trong các bài học vẫn giữ ý nghĩa riêng.

Hình trụ mặc định có bán kính 2 cm, cao 4 cm; số đo từ 1–10 cm. Mặt cong trải thành một hình chữ nhật; hai đáy là hai hình tròn bằng nhau. Bốn bài tập nhận biết hai đáy, một mặt cong, không có đỉnh và một hình chữ nhật khi trải. Không hiển thị diện tích, thể tích hoặc lớp thể tích hình trụ.

Trải/ghép diễn ra trực tiếp trên WebGL trong khoảng 2,4 giây, giữ cạnh nối và kích thước các mặt. Camera lùi và chuyển dần sang góc nhìn thẳng khi trải phẳng; ghép xong khôi phục góc nhìn và zoom trước khi trải. Có thể bấm ghép khi đang mở để đảo chiều. Đóng chủ đề hoặc đổi hình hủy chuyển động ngay; thiết bị bật giảm chuyển động đổi trạng thái tức thì. Sơ đồ SVG chỉ là phương án dự phòng cho trình duyệt thiếu WebGL. Các đường cong 3D dùng π của thư viện toán để khép kín; giao diện hình trụ không dạy công thức π.

Workflow hiện chỉ triển khai nhánh `feature/HHCN_HLP`; bản giao diện 1.1 cần được đưa vào nhánh đó để xuất hiện trên website công khai.

## Hướng dẫn thao tác

1. Chọn hình ở ba thẻ đầu trang. Bấm “Trải hình thành 6 mặt…” với hình hộp hoặc “Trải mặt hình trụ” để xem hình triển khai.
2. Kéo hình để quan sát; dùng các nút bên dưới nếu thao tác bằng bàn phím.
3. Mở “Kích thước” và kéo thanh trượt (hoặc dùng phím mũi tên khi thanh trượt có focus).
4. Mở “Diện tích” hoặc “Thể tích” để xem kết quả theo hình vừa chỉnh.
5. Mở “Bài tập”. Sử dụng số liệu trong đề, không lấy kích thước của mô hình hiện tại. “Kiểm tra đáp án” chỉ báo đúng/sai; bấm “Xem đáp án” mới hiển thị đáp án và lời giải.

Bấm mục đang mở để đóng. Nút “Góc nhìn ban đầu” chỉ đặt lại camera. Chọn hình khác sẽ bắt đầu lượt khám phá mới. Camera tự căn khoảng cách khi kích thước lớn nhất thay đổi để hình vừa khung và vẫn thấy mức tăng kích thước; zoom không sửa số đo.

## Công nghệ và lựa chọn

React 19 + JavaScript + Vite; Three.js, React Three Fiber 9 và Drei cho camera, đường viền và nhãn. React Three Fiber giúp đồng bộ trạng thái React với hình 3D; Drei giảm mã thiết lập. Ba hình được dựng trực tiếp bằng Three.js, không cần iframe hoặc phụ thuộc dịch vụ ngoài.

Tài liệu gốc: [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/installation), [Vite](https://vite.dev/guide/).

## Cấu trúc

```text
src/
  App.jsx                  Ghép bố cục, chọn hình và quản lý nội dung đang mở
  main.jsx                 Khởi động React và CSS
  components/              Thẻ chọn hình, điều khiển và panel học tập
  scene/
    GeometryScene.jsx      Canvas, ánh sáng, camera và OrbitControls
    cameraFit.js            Khoảng cách camera theo kích thước khối và tỉ lệ khung
    BoxModel.jsx           Dựng mặt/cạnh/đỉnh và nhãn chung
    CubeModel.jsx          Mô hình lập phương
    CuboidModel.jsx        Mô hình hộp chữ nhật
    CylinderModel.jsx      Mô hình hình trụ và đường tròn đáy
    UnfoldingModel.jsx     Điều khiển thời gian trải/ghép và camera
    BoxUnfolding.jsx       Các mặt hộp gập quanh cạnh nối
    CylinderUnfolding.jsx  Mặt cong trụ duỗi thành chữ nhật, hai đáy gập/mở
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

Xem [hướng dẫn triển khai và cập nhật website](docs/DEPLOYMENT.md) để sửa code rồi deploy lại, chạy triển khai thủ công, đổi `base`, xử lý lỗi và hoàn tác bản cập nhật.

Workflow `.github/workflows/deploy.yml` tự triển khai mỗi lần push lên `feature/HHCN_HLP`, hoặc chạy thủ công từ tab Actions trên nhánh này. GitHub dùng Node.js 22, chạy `npm ci` và `npm run check`; chỉ đưa `dist/` lên Pages khi lint, test và build đều đạt. Trong Settings → Pages, chọn nguồn **GitHub Actions**.

Để cập nhật website: sửa mã nguồn, chạy `npm run check`, kiểm tra giao diện, commit rồi push lên `feature/HHCN_HLP`. Theo dõi workflow **Deploy GitHub Pages** trong tab Actions. Không commit `dist/` hoặc `node_modules/`. Nếu kiểm tra/build lỗi, bước deploy không chạy và bản đang phục vụ được giữ nguyên.

`base` trong `vite.config.js` là `/nhagiaosangtaovoicongngheso/`. Khi đổi tên repository hoặc địa chỉ hosting, sửa `base` cho khớp rồi build/deploy lại; nếu chuyển sang tên miền riêng ở đường dẫn gốc thì dùng `/`. Đổi `base` không tự đổi tên repository hay cấu hình tên miền.

Dự án có repository Git cục bộ riêng tại `/Users/nguyenvu/nha-kien-tao-hinh-hoc`, độc lập với repository bài học React. Repository GitHub: [nguyvu/nhagiaosangtaovoicongngheso](https://github.com/nguyvu/nhagiaosangtaovoicongngheso), nhánh phát triển `feature/HHCN_HLP`. `.gitignore` loại bỏ dependencies, build, file môi trường và dữ liệu nhạy cảm thông thường.

Đây là bản mẫu, chưa có lưu tiến độ hay chế độ offline/PWA. WebGL cần được trình duyệt và thiết bị hỗ trợ. Mô hình dùng khe nhỏ giữa khối đơn vị để nhìn rõ, không làm thay đổi thể tích toán học. Xem giới hạn xác minh trong `docs/TESTING.md`. Nội dung kiến thức cần giáo viên rà soát trước khi dùng trong lớp.

Số trên mặt trải giữ cỡ dễ đọc; với mặt quá hẹp, số nằm ngoài mặt và có đường nối. Chú giải dùng “Hình số …”. Camera tự căn hình trải theo khung, độc lập với zoom trước đó, và khôi phục zoom sau khi ghép.
