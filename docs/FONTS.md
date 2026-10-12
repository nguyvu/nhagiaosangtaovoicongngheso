# Font chữ của website

Giao diện dùng **Nunito**, font có nét bo tròn và hỗ trợ tiếng Việt. Hai file WOFF2 của cùng một phiên bản được lưu tại `public/fonts/` và phục vụ từ chính website:

| File | Ký tự |
| --- | --- |
| `nunito-v32-latin.woff2` | Chữ Latin, chữ số, dấu câu và các ký tự Latin có dấu |
| `nunito-v32-vietnamese.woff2` | Các ký tự bổ sung cho tiếng Việt, như ơ, ư, ở, ấ, ễ, ự |

CSS dùng tên riêng `Geometry Nunito`, khai báo `@font-face` với cùng dải độ đậm 400–800 cho cả hai bộ ký tự. Không dùng `local()` để tránh lấy nhầm phiên bản font đã cài trên máy. Nội dung dùng độ đậm 600, nút/tiêu đề phụ 700, tiêu đề lớn 750. Giữ cỡ chữ học tập từ 18 px và giãn dòng 1,65. File HTML preload cả hai bộ ký tự qua `%BASE_URL%` để hoạt động ở cả đường dẫn GitHub Pages và tên miền riêng.

Các file được lấy ngày 12/10/2026 từ [Google Fonts — Nunito](https://fonts.google.com/specimen/Nunito), qua CSS cho dải độ đậm 400–800. Nguồn tải: [Latin v32](https://fonts.gstatic.com/s/nunito/v32/XRXV3I6Li01BKofINeaB.woff2), [Vietnamese v32](https://fonts.gstatic.com/s/nunito/v32/XRXV3I6Li01BKofIOuaBXso.woff2). Tổng dung lượng hai file khoảng 51 kB.

Nunito do The Nunito Project Authors phát hành theo SIL Open Font License 1.1. Giữ [giấy phép đi kèm](../public/fonts/OFL-Nunito.txt) khi phân phối hoặc deploy; Vite sao chép giấy phép và font vào `dist/fonts/` trong bản build. Xem [nguồn dự án font](https://github.com/googlefonts/nunito).

Website không gọi Google Fonts khi người dùng mở trang. Khi kiểm tra, cần đợi font tải xong và xác nhận cả chữ Latin lẫn tiếng Việt trong tiêu đề dùng font Nunito, không bị rơi về font dự phòng. Nếu thay font, chọn đủ bộ ký tự tiếng Việt và kiểm lại những từ như “Mở”, “ở”, “hình học”, “kích thước”, “Thể tích”, “đáp án”.
