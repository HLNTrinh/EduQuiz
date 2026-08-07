# TODO - Hoàn thành: Hiệu ứng chạy cho "Quy trình 3 bước đơn giản"

## ✅ Đã hoàn thành

### 1. `frontend/src/pages/EduQuizPage.js` (trang chủ chính)
- [x] Thêm `useEffect` với `IntersectionObserver` phát hiện khi section workflow xuất hiện
- [x] Thêm class `.run-flow` vào `.workflow-grid` + class `.visible` tuần tự cho 3 bước (1→2→3, delay 200ms)
- [x] Fallback cho trình duyệt cũ không hỗ trợ IntersectionObserver

### 2. `frontend/src/styles/EduQuiz.css`
- [x] Đường nối động (`::after`): gradient chạy liên tục (`@keyframes flowDash`)
- [x] Vòng sáng conic xoay quanh số bước (`::before` với `@keyframes stepSpin`)
- [x] Scroll reveal: các bước mờ dần + trượt lên (`opacity: 0 → 1`, `translateY(40px → 0)`)
- [x] Hover: số bước scale + thẻ nâng lên + shadow
- [x] `prefers-reduced-motion: reduce`: tắt hết animation cho người có nhu cầu
- [x] Lớp nền đường nối cố định (`::before`) giữ layout ngay cả khi chưa kích hoạt

### 3. `frontend/src/layouts/EduQuizPage.jsx`
- Không cần sửa: file không được import bởi bất kỳ component nào trong `App.js`

## Kết quả
- Hiệu ứng đầy đủ: scroll reveal → đường nối chạy → vòng sáng xoay → hover
- Tương thích: không ảnh hưởng các section khác, hỗ trợ reduced-motion
- Sẵn sàng chạy thử: `npm start` trong `frontend/`

