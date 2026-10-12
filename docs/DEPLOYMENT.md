# Hướng dẫn triển khai và cập nhật website

Áp dụng cho dự án **Nhà kiến tạo hình học**, cấu hình ngày 12/10/2026. Website đã triển khai bằng GitHub Pages. Nếu chỉ cần sửa nội dung hoặc chức năng, thực hiện mục 2; không cần thiết lập lại hosting.

## 1. Thông tin đang sử dụng

| Thành phần | Giá trị |
| --- | --- |
| Website cho người dùng | https://nguyvu.github.io/nhagiaosangtaovoicongngheso/ |
| Repository chứa mã nguồn | https://github.com/nguyvu/nhagiaosangtaovoicongngheso |
| Nhánh triển khai | `feature/HHCN_HLP` |
| Thư mục trên máy hiện tại | `/Users/nguyenvu/nha-kien-tao-hinh-hoc` |
| Cấu hình tự động | [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) |
| Tên workflow trên GitHub | **Deploy GitHub Pages** |
| Node.js trên GitHub Actions | Node.js 22 |
| Đường dẫn `base` | `/nhagiaosangtaovoicongngheso/` |
| Thư mục build được đưa lên web | `dist/` |

Luồng cập nhật của dự án:

```text
Sửa mã nguồn → Kiểm tra trên máy → Commit → Push lên feature/HHCN_HLP
                                                ↓
                          GitHub Actions: npm ci → npm run check
                                                ↓
                            Kiểm tra đạt → Đưa dist/ lên GitHub Pages
```

`src/` chứa mã nguồn để chỉnh sửa. `dist/` là kết quả tạo tự động khi build. GitHub Actions tạo `dist/` trên máy chủ rồi triển khai; không cần tải từng file lên web hoặc commit thư mục này.

## 2. Cập nhật website sau khi sửa code

### Bước 1: Kiểm tra đúng thư mục và nhánh

Mở Terminal và chạy:

```bash
cd /Users/nguyenvu/nha-kien-tao-hinh-hoc
git status --short --branch
git branch --show-current
git remote -v
```

Nhánh cần dùng là `feature/HHCN_HLP`; remote `origin` phải trỏ đến `https://github.com/nguyvu/nhagiaosangtaovoicongngheso.git`. Dự án đã có Git, không chạy lại `git init`.

Nếu đang ở nhánh khác, lưu công việc đang làm trước khi chuyển sang nhánh triển khai. Nếu làm trên nhiều máy, đồng bộ bằng `git pull --ff-only origin feature/HHCN_HLP` khi đang ở đúng nhánh và thư mục làm việc sạch, trước khi bắt đầu sửa.

### Bước 2: Sửa và xem thử

Chỉnh các file cần thiết trong `src/`, rồi chạy:

```bash
npm run dev
```

Mở địa chỉ Vite in ra, thường là `http://127.0.0.1:5173/nhagiaosangtaovoicongngheso/`. Nhấn `Ctrl+C` để dừng máy chủ khi đã xem xong.

Chạy `npm ci` nếu mới lấy dự án về máy hoặc cần cài lại dependencies theo `package-lock.json`. Không cần cài lại sau mỗi lần sửa giao diện.

### Bước 3: Kiểm tra trước khi đưa lên web

```bash
npm run check
npm run preview
```

Chỉ tiếp tục nếu `npm run check` thành công. Lệnh này chạy lint, các kiểm thử logic và build. `npm run preview` phục vụ bản build vừa tạo, thường tại `http://127.0.0.1:4173/nhagiaosangtaovoicongngheso/`; dùng địa chỉ thực tế Vite in ra nếu cổng thay đổi.

Kiểm tra hai hình, xoay/zoom, kích thước, công thức, bài tập và tải lại trang. Dừng preview bằng `Ctrl+C`. Preview chỉ dùng để kiểm tra trên máy, không phải máy chủ website công khai. [Hướng dẫn Vite](https://vite.dev/guide/static-deploy.html#testing-the-app-locally)

Có thể chạy thêm `QA_PREVIEW=1 npm run test:browser` trên macOS với Chrome đã cài. Xem yêu cầu môi trường và cách chọn thư mục ảnh trong [TESTING.md](TESTING.md). Kiểm thử trình duyệt này hiện chạy riêng, chưa nằm trong workflow GitHub Actions.

### Bước 4: Lưu thay đổi và đẩy lên GitHub

Xem các thay đổi trước:

```bash
git status --short
git diff
```

Thêm đúng các file đã sửa. Ví dụ dưới đây dành cho trường hợp chỉ sửa `src/App.jsx`; thay tên file bằng những file thực tế của bạn:

```bash
git add src/App.jsx
git diff --cached
git commit -m "Cap nhat giao dien bai hoc"
git push origin feature/HHCN_HLP
```

Không thêm `node_modules/`, `dist/`, `.env*`, mật khẩu hoặc token. Giữ `package-lock.json` và đưa nó vào commit nếu có thay đổi dependencies hợp lệ. Nếu `git status` không có thay đổi thì không cần tạo commit mới; có thể chạy triển khai thủ công theo mục 4.

### Bước 5: Theo dõi và kiểm tra kết quả

1. Mở [workflow Deploy GitHub Pages](https://github.com/nguyvu/nhagiaosangtaovoicongngheso/actions/workflows/deploy.yml).
2. Chọn lần chạy ứng với commit vừa push.
3. Chờ cả hai job **build** và **deploy** thành công.
4. Mở [website](https://nguyvu.github.io/nhagiaosangtaovoicongngheso/) và kiểm tra nội dung vừa thay đổi. Nếu còn bản cũ, thử tải lại không dùng cache hoặc mở cửa sổ riêng tư.

Push thành công chỉ xác nhận mã nguồn đã lên GitHub. Website chỉ cập nhật sau khi job **deploy** thành công. Theo cấu hình hiện tại, push chỉ sửa tài liệu cũng kích hoạt workflow.

## 3. Cấu hình triển khai lần đầu hoặc kiểm tra lại cấu hình

Các bước này đã được thực hiện cho repository hiện tại.

Trong [vite.config.js](../vite.config.js), cấu hình đang dùng là:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/nhagiaosangtaovoicongngheso/',
});
```

Mở [Settings → Pages](https://github.com/nguyvu/nhagiaosangtaovoicongngheso/settings/pages), trong **Build and deployment → Source**, chọn **GitHub Actions**. Cần quyền quản trị repository để đổi thiết lập này. [Hướng dẫn GitHub](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

File [deploy.yml](../.github/workflows/deploy.yml) là cấu hình thực tế cần giữ trong Git. Job `build` dùng Node.js 22, cài bằng `npm ci`, chạy `npm run check` và upload `dist/`. Job `deploy` phụ thuộc vào `build`, chỉ cho nhánh `feature/HHCN_HLP`, dùng môi trường `github-pages` và các quyền `pages: write`, `id-token: write`. Workflow không cần bạn tự tạo token hoặc chép token vào mã nguồn.

Không cần tạo nhánh `gh-pages`, backend hoặc tài khoản đăng nhập cho học sinh. Nếu thiết lập một repository khác, cập nhật nhánh ở cả `on.push.branches` và điều kiện `jobs.deploy.if` trong workflow cho khớp.

## 4. Triển khai lại mà không sửa code

1. Mở tab **Actions** của repository.
2. Chọn **Deploy GitHub Pages**.
3. Chọn **Run workflow**.
4. Chọn nhánh **feature/HHCN_HLP**, rồi bấm **Run workflow** để chạy.
5. Theo dõi cả `build` và `deploy` như mục 2.

Workflow đã có `workflow_dispatch` để hỗ trợ thao tác này. Nút chạy thủ công cần workflow có trên nhánh mặc định; nhánh mặc định tại thời điểm thiết lập là `feature/HHCN_HLP`. Nếu đổi nhánh mặc định sau này, kiểm tra lại điều kiện đó. [Hướng dẫn GitHub](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)

Nếu dùng GitHub CLI đã đăng nhập, có thể chạy:

```bash
gh workflow run deploy.yml --ref feature/HHCN_HLP --repo nguyvu/nhagiaosangtaovoicongngheso
gh run list --workflow deploy.yml --repo nguyvu/nhagiaosangtaovoicongngheso --limit 5
```

## 5. Đổi tên repository, `base` hoặc tên miền

| Địa chỉ dự kiến | `base` tương ứng |
| --- | --- |
| `https://nguyvu.github.io/nhagiaosangtaovoicongngheso/` | `'/nhagiaosangtaovoicongngheso/'` |
| `https://nguyvu.github.io/ten-repo-moi/` | `'/ten-repo-moi/'` |
| Website đặt ở gốc tên miền riêng, ví dụ `https://hinhhoc.vn/` | `'/'` |

Đặt `base` theo đường dẫn hosting rồi build lại để Vite tạo đường dẫn tài nguyên phù hợp. Đổi `base` không tự đổi tên repository hoặc đăng ký tên miền. [Quy tắc của Vite](https://vite.dev/guide/static-deploy.html#github-pages)

Khi repository thực sự đã đổi tên, cập nhật remote của bản sao trên máy. Ví dụ sau dùng tên minh họa `ten-repo-moi`, cần thay bằng tên đã chọn:

```bash
git remote set-url origin https://github.com/nguyvu/ten-repo-moi.git
```

Sau đó sửa `base`, cập nhật liên kết trong README và tài liệu, chạy `npm run check`, kiểm tra bản build rồi commit/push. Kiểm tra địa chỉ mới trong Settings → Pages; cập nhật các liên kết đã chia sẻ cho học sinh.

Với tên miền riêng, cần cấu hình thêm tên miền trong GitHub Pages và DNS tại nhà cung cấp tên miền. Dự án hiện chưa có tên miền riêng; không chỉ đổi `base` rồi coi là hoàn tất.

## 6. Xử lý lỗi thường gặp

| Hiện tượng | Cách kiểm tra và xử lý |
| --- | --- |
| Push xong nhưng không có workflow mới | Kiểm tra đang push đúng `feature/HHCN_HLP`, file workflow đã lên GitHub và Actions được bật. |
| Job `build` báo đỏ | Mở bước bị lỗi; chạy lại `npm ci` và `npm run check` trên máy để sửa nguyên nhân, rồi commit/push. |
| `npm ci` báo lockfile không khớp | Nếu bạn chủ động thay dependencies, chạy `npm install` để cập nhật lockfile, kiểm tra lại rồi commit cả `package.json` và `package-lock.json`. |
| Job `deploy` lỗi quyền hoặc Pages chưa bật | Kiểm tra Source là GitHub Actions, quyền trong job `deploy` và quy tắc môi trường `github-pages` có cho nhánh triển khai hay không. |
| Deploy bị `skipped` | Kiểm tra job `build` có lỗi hoặc bạn chạy thủ công trên nhánh khác `feature/HHCN_HLP`. |
| Website trắng hoặc JavaScript/CSS trả về 404 | Kiểm tra `base` và địa chỉ đang mở, build/deploy lại; xem Console và Network của trình duyệt. |
| Chưa thấy nội dung mới | Kiểm tra đúng commit đã deploy thành công, đúng địa chỉ website, rồi tải lại không dùng cache. |
| Push yêu cầu đăng nhập | Nếu đã cài GitHub CLI, chạy `gh auth status`; khi chưa đăng nhập, dùng `gh auth login --hostname github.com --git-protocol https --web` và hoàn tất xác thực trên trình duyệt. |
| Push bị từ chối vì remote có commit mới | Dùng `git fetch origin`, xem khác biệt và đồng bộ thay đổi trước khi push; không dùng force push để bỏ qua lỗi. |
| Build cảnh báo chunk lớn hơn 500 kB | Đây là cảnh báo hiện có ở phần 3D. Nếu lệnh vẫn thành công thì không chặn deploy; tiếp tục kiểm tra thời gian tải trên thiết bị thật. |

Khi `build` lỗi, job `deploy` không chạy nên bản website trước đó vẫn được phục vụ. Kiểm thử tự động không phát hiện mọi lỗi giao diện; nếu bản mới đã deploy nhưng hoạt động sai thì cần sửa hoặc hoàn tác và triển khai lại.

## 7. Hoàn tác một thay đổi đã triển khai

Với một commit thông thường gây lỗi, có thể dùng `git revert` để tạo commit đảo ngược thay đổi mà vẫn giữ lịch sử. Trước tiên lưu công việc đang làm, đồng bộ nhánh triển khai và xác định đúng commit:

```bash
git status
git log --oneline -10
```

Chạy `git revert MA_COMMIT_GAY_LOI`, thay `MA_COMMIT_GAY_LOI` bằng mã commit cần đảo ngược, không phải mã bản tốt muốn quay về. Sau khi xử lý xung đột nếu có, chạy `npm run check`, kiểm tra giao diện rồi `git push origin feature/HHCN_HLP` để triển khai bản đã hoàn tác.

Cách này dành cho commit thông thường đã xác định rõ. Với merge commit hoặc nhiều thay đổi phụ thuộc nhau, cần xem lại phạm vi trước khi hoàn tác. Không cần xóa lịch sử hoặc force push.

## 8. Checklist sau triển khai và giới hạn

- [ ] Cả `build` và `deploy` của đúng commit đều thành công.
- [ ] Website mở được qua HTTPS và tải lại trang vẫn có hình 3D.
- [ ] Hình lập phương cạnh 3 cho kết quả 36 / 54 / 27; hộp chữ nhật 5 × 3 × 2 cho kết quả 32 / 62 / 30.
- [ ] Xoay, zoom, đổi kích thước, đổi hình và mở/đóng nội dung hoạt động.
- [ ] Bài tập không lộ lời giải trước khi bấm “Xem đáp án”.
- [ ] Giao diện dùng được trên máy tính và điện thoại.

Lần triển khai ban đầu đã đạt lint, 9/9 kiểm thử logic, build và kiểm tra Chrome trực tiếp trên website; xem [TESTING.md](TESTING.md). Kiểm tra mobile là giả lập, chưa thay thế thử trên điện thoại thật. Phần 3D còn cảnh báo dung lượng; thiết bị cần hỗ trợ WebGL. Ứng dụng hiện không lưu tiến độ học và không có backend.
