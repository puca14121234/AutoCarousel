# Tech Stack Detail - AutoCarouselV3

Tài liệu này chi tiết hóa các công nghệ được lựa chọn để giải quyết bài toán biến văn bản thành chuỗi ảnh Carousel chất lượng cao, tập trung vào trải nghiệm người dùng chuyên nghiệp và hiệu suất render.

---

## 🏗️ 1. Nền tảng Core (Structural Foundation)

### **Next.js 15 (React 19) + TypeScript**
- **Vai trò**: Quản lý toàn bộ vòng đời ứng dụng, routing, và giao diện người dùng.
- **Tại sao chọn?**:
    - **TypeScript**: Bắt buộc để quản lý các "Design Tokens" phức tạp (màu sắc, font-size, tọa độ layer) một cách chặt chẽ.
    - **App Router**: Tối ưu hóa việc tải dữ liệu và các thành phần giao diện.
    - **Server Components**: Giảm tải JavaScript cho phía client, giúp ứng dụng khởi động nhanh hơn.

### **Tailwind CSS + Lucide React**
- **Vai trò**: Xây dựng UI nhanh chóng, nhất quán và bộ icon hiện đại.
- **Đặc trưng**: Sử dụng các tiện ích của Tailwind để tạo hiệu ứng Glassmorphism (`backdrop-blur`) một cách dễ dàng và hiệu quả.

---

## 🎨 2. Công nghệ Chỉnh sửa (Creative Engine)

### **Fabric.js v6+**
- **Vai trò**: Trái tim của trình biên tập (Canvas Preview).
- **Tính năng chính**:
    - **Object Model**: Coi văn bản, ảnh, logo là các đối tượng riêng biệt.
    - **Interactivity**: Hỗ trợ kéo thả (drag), xoay (rotate), thay đổi kích thước (resizing) mượt mà với cảm giác "native".
    - **Snap System**: Thuật toán tự chế dựa trên sự kiện `object:moving` để tạo các đường Guides và "hút" đối tượng vào tâm/trục.
    - **SVG Support**: Cho phép xuất bản bản thiết kế dưới dạng vector nếu cần in ấn chất lượng cao.

---

## 🖼️ 3. Công nghệ Kết xuất (Rendering Pipeline)

### **html-to-image**
- **Vai trò**: Chuyển đổi vùng làm việc (HTML/CSS) thành file ảnh PNG/WebP.
- **Tại sao chọn?**:
    - Tốt hơn `html2canvas` trong việc xử lý các hiệu ứng CSS hiện đại như `backdrop-filter: blur()`.
    - **pixelRatio**: Cho phép xuất ảnh với độ phân giải gấp 2-3 lần kích thước hiển thị để đạt chuẩn **1080px** (hoặc cao hơn) mà vẫn giữ được độ sắc nét của chữ.

### **WebAssembly (Wasm) - Pica** (Optional - nếu cần tối ưu ảnh)
- **Vai trò**: Giảm dung lượng ảnh mà không làm giảm chất lượng khi xử lý ngay trên trình duyệt.

---

## 📥 4. Công nghệ Phân phối (Output & Download)

### **File System Access API**
- **Vai trò**: Cho phép người dùng lưu "hàng loạt" ảnh vào thư mục máy tính mà không cần nén ZIP.
- **Ưu điểm**: 
    - Click 1 lần, lưu 10 ảnh vào đúng folder mong muốn.
    - Trải nghiệm giống như phần mềm Desktop thực thụ.

### **JSZip + FileSaver.js**
- **Vai trò**: Phương án dự phòng (Fallback) cho các trình duyệt không hỗ trợ File System API.
- **Tính năng**: Nén toàn bộ slide thành 1 file duy nhất với tốc độ cực nhanh.

---

## 🧠 5. Logic & Quản lý (Application Logic)

### **Zustand**
- **Vai trò**: Quản lý state toàn cục (Global State Management).
- **Ứng dụng**: Đồng bộ hóa dữ liệu từ văn bản đầu vào -> các slide được tách -> thuộc tính thiết kế trên Canvas.

### **Canvas Off-screen Measurement**
- **Vai trò**: Thuật toán tách chữ (Text Splitting).
- **Cơ chế**: Sử dụng một DOM element ẩn để "ướm" thử chữ. Nếu chữ vượt quá giới hạn chiều cao cho phép, thuật toán sẽ tự động ngắt trang slide.

---

## 🚀 Tổng kết
Sự kết hợp giữa **Fabric.js** (tương tác) và **html-to-image** (render) giúp AutoCarouselV3 vừa có được sự linh hoạt của một trình thiết kế chuyên nghiệp, vừa giữ được vẻ đẹp hiện đại của CSS mà các thư viện Canvas thuần khó đạt được.
