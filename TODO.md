# TODO: Sửa lỗi import CSV câu hỏi

## Kế hoạch
- [x] Đọc file QuestionManager.js để hiểu code hiện tại
- [x] Xác định nguyên nhân lỗi font & "CSV không có dữ liệu"
- [x] Sửa hàm `handleCSVImport`:
  - [x] Đọc file qua FileReader + TextDecoder tự nhận diện encoding (UTF-8/UTF-16/Windows-1258)
  - [x] Tự động xóa BOM
  - [x] Trim tên cột header (transformHeader)
  - [x] Hỗ trợ dấu phân cách `,` và `;` (delimiter tự dò)
  - [x] Kiểm tra cột bắt buộc và báo lỗi cụ thể
- [x] Thêm nút "Tải file mẫu" để tải template CSV chuẩn
- [ ] Kiểm tra lại trên trình duyệt
