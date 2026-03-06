# AutoCarousel - Tài liệu Sản phẩm Chi tiết

AutoCarousel là công cụ hỗ trợ người tạo nội dung tự động chuyển đổi văn bản dài thành các chuỗi ảnh slide (Carousel) chuyên nghiệp cho mạng xã hội (Instagram, LinkedIn, Facebook).

## 1. Giao diện Người dùng (UI)

Giao diện được thiết kế theo phong cách hiện đại, tối giản với 4 khu vực chính:

### Thanh điều khiển bên trái (Input Panel)
- **Nhập liệu văn bản**: Ô nhập tiêu đề và nội dung chính của bài viết.
- **Tải ảnh nền**: Hỗ trợ tải lên một ảnh dùng chung hoặc hai ảnh (một cho trang bìa, một cho các trang nội dung).
- **Trình tách Slide**: Nút bấm tự động thực hiện thuật toán chia cắt đoạn văn để tạo ra danh sách slide.

### Bàn làm việc trung tâm (Canvas Preview)
- **Bản xem trước trực tiếp**: Hiển thị slide đang được chọn với độ chính xác cao so với ảnh xuất bản.
- **Tự động co giãn (Auto-scaling)**: Khung xem trước tự động thu nhỏ để vừa vặn với kích thước cửa sổ trình duyệt nhưng vẫn giữ đúng tỷ lệ thiết kế.
- **Tương tác trực tiếp**: Cho phép người dùng kéo thả trực tiếp cụm nội dung (Title/Content) trên slide để thay đổi vị trí. 
- **Hệ thống Snap**: Tự động "hút" nội dung vào tâm hoặc các trục chính để căn chỉnh nhanh.

### Bảng điều khiển bên phải (Design System)
- **Presets**: Lưu và tải nhanh các cấu hình thiết kế đã thiết lập.
- **Tỷ lệ khung hình (Aspect Ratio)**: Hỗ trợ 4 tỷ lệ phổ biến: 1:1 (Square), 4:5 (Portrait), 9:16 (Stories), 3:4.
- **Thiết kế Glassmorphism**: Tùy chỉnh màu nền, độ mờ (Blur), độ trong suốt (Opacity) và bo góc (Border Radius) của khung chứa chữ.
- **Typography (Kiểu chữ)**:
    - Chỉnh sửa riêng biệt cho Tiêu đề và Nội dung.
    - Tùy biến: Font chữ, Kích thước, Độ cao dòng (Line Height), Khoảng cách đoạn, Màu sắc và Căn lề (Trái/Giữa/Phải/Hai bên).
- **Branding (Thương hiệu)**:
    - Chèn Logo cá nhân.
    - Nhập tên thương hiệu/tác giả.
    - Watermark tự động xuất hiện ở góc dưới slide.

### Thanh dòng thời gian (Timeline Panel)
- **Quản lý Slide**: Hiển thị danh sách slide dưới dạng thumbnail.
- **Điều hướng**: Click để chọn slide cần chỉnh sửa.
- **Tải ảnh đơn lẻ**: Nút tải nhanh từng ảnh ngay trên thumbnail.
- **Xuất bản**: Chức năng tải toàn bộ ảnh (PNG rời) hoặc nén thành tệp ZIP.

---

## 2. Thuật toán Chia cắt Đoạn văn (Text Splitting Algorithm)

Đây là "trái tim" của ứng dụng, giúp biến văn bản dài thành các trang slide vừa vặn, dễ đọc mà không cần can thiệp thủ công nhiều.

### Nguyên lý hoạt động
Thuật toán sử dụng một "DOM ẩn" (Off-screen DOM) để mô phỏng chính xác cách chữ sẽ hiển thị trên ảnh thực tế và thực hiện đo lường chiều cao theo thời gian thực.

### Quy trình phân cấp tách chữ
Thuật toán ưu tiên giữ tính toàn vẹn của nội dung theo thứ tự ưu tiên giảm dần:

1.  **Ưu tiên Đoạn văn (\n\n)**: Tìm các điểm xuống dòng kép để tách. Nếu một đoạn văn vừa vặn trong slide, nó sẽ được giữ nguyên.
2.  **Tách theo Câu**: Nếu một đoạn văn quá dài, thuật toán sẽ tìm các dấu kết thúc câu (`.`, `?`, `!`) để chia nhỏ đoạn đó ra.
3.  **Tách theo Từ**: Trong trường hợp cực hạn khi một câu vẫn dài hơn diện tích cho phép của một slide, thuật toán sẽ đếm từng từ cho đến khi đạt ngưỡng giới hạn chiều cao thì ngắt slide.

### Cơ chế "Cứu mồ côi" (Orphan Cleanup)
Để tránh tình trạng slide cuối cùng chỉ có 1-2 từ (trông mất thẩm mỹ), thuật toán có bước quét ngược:
- Nếu slide cuối quá ngắn (< 10 từ), nó sẽ tự động "mượn" một phần nội dung từ slide phía trước để bù vào, giúp độ dài các slide trông cân xứng hơn.

---

## 3. Các tính năng Nổi bật

### Phân rã Vị trí (Decoupled Layout)
Trang Bìa (Cover) và các trang Nội dung (Content) có hệ tọa độ riêng biệt. Bạn có thể để tiêu đề ở trên cùng slide bìa nhưng nội dung ở giữa các slide sau mà không bị xung đột.

### Chế độ Ảnh nền Linh hoạt
- **Single**: Dùng 1 ảnh duy nhất cho toàn bộ Carousel.
- **Dual**: Thiết lập ảnh bìa rực rỡ và ảnh nội dung tối giản hơn để tập trung vào chữ.

### Branding thông minh
- Tự động căn giữa trên trang Bìa để tạo sự trang trọng.
- Tự động căn trái trên các trang nội dung để thẳng hàng với văn bản, tạo sự nhất quán.
- Tự động đánh số trang (Ví dụ: 1/5, 2/5...) bắt đầu từ slide nội dung đầu tiên.

### Xuất bản Chất lượng cao
- **Độ phân giải**: Ảnh xuất ra luôn đạt chuẩn 1080px (chiều ngang) để đảm bảo sắc nét nhất khi đăng tải.
- **Đa dạng định dạng**: Hỗ trợ xuất ảnh PNG chất lượng cao, tải lẻ hoặc tải nhanh hàng loạt file rời.
