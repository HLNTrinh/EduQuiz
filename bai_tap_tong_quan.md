# CHƯƠNG 1: TỔNG QUAN

## 1.1. Lý do chọn đề tài

Hiện nay, công nghệ thông tin đã len lỏi vào hầu hết các lĩnh vực của đời sống, trong đó có giáo dục. Việc dạy và học không còn bị giới hạn trong bốn bức tường lớp học hay những quyển sách giấy truyền thống. Thay vào đó, các nền tảng học tập trực tuyến ngày càng phổ biến, giúp thầy cô và học sinh kết nối, trao đổi và kiểm tra kiến thức một cách linh hoạt hơn, mọi lúc mọi nơi.

Trong quá trình học tập, kiểm tra, đánh giá là một khâu rất quan trọng. Nó giúp giáo viên nắm được mức độ tiếp thu của học sinh, đồng thời giúp các em nhận ra những phần kiến thức còn yếu để kịp thời bổ sung. Tuy nhiên, cách kiểm tra truyền thống với giấy bút vẫn còn nhiều hạn chế: mất nhiều thời gian để ra đề, in ấn, chấm bài và tổng hợp kết quả; việc chấm điểm bằng tay dễ xảy ra sai sót; đồng thời mỗi giáo viên phải tự quản lý ngân hàng câu hỏi của riêng mình, khó chia sẻ và tái sử dụng.

Nhận thấy được những khó khăn đó, chúng tôi quyết định chọn đề tài **"Xây dựng website kiểm tra trắc nghiệm trực tuyến"** làm sản phẩm cho báo cáo của mình. Sản phẩm được xây dựng với mong muốn giúp quá trình kiểm tra, đánh giá trở nên nhanh chóng, chính xác và thuận tiện hơn, giảm bớt gánh nặng thủ công cho giáo viên và tạo hứng thú cho học sinh khi làm bài.

## 1.2. Mục tiêu của đề tài

Đề tài hướng đến những mục tiêu cụ thể sau:

- **Xây dựng một trang web làm bài kiểm tra trắc nghiệm trực tuyến** hoạt động ổn định, giao diện thân thiện, dễ sử dụng cho cả giáo viên và học sinh.
- **Hỗ trợ giáo viên quản lý ngân hàng câu hỏi** một cách có tổ chức: thêm, sửa, xóa câu hỏi, nhập câu hỏi từ file CSV, phân loại theo môn học và mức độ khó dễ.
- **Tự động chấm điểm và trả kết quả** ngay sau khi học sinh nộp bài, giúp tiết kiệm thời gian và giảm sai sót so với chấm tay.
- **Phân chia quyền rõ ràng** giữa các vai trò: quản trị viên, giáo viên và học sinh, đảm bảo dữ liệu được quản lý an toàn, đúng người đúng quyền.

## 1.3. Đối tượng và phạm vi sử dụng

- **Đối tượng sử dụng:** giáo viên, học sinh và quản trị viên của nhà trường hoặc trung tâm giáo dục.
- **Phạm vi:** hệ thống tập trung vào việc tổ chức các bài kiểm tra trắc nghiệm khách quan (mỗi câu có bốn đáp án và một đáp án đúng), phù hợp với các môn học có tính chất lý thuyết, ghi nhớ và vận dụng kiến thức.

## 1.4. Phương pháp nghiên cứu

Để hoàn thành đề tài, chúng tôi đã kết hợp nhiều phương pháp nghiên cứu khoa học và thực tiễn, cụ thể như sau:

- **Phương pháp khảo sát và thu thập thông tin:** tìm hiểu, thu thập các tài liệu, bài viết về các hệ thống kiểm tra trắc nghiệm trực tuyến hiện có, cũng như khảo sát nhu cầu thực tế của giáo viên và học sinh để xác định những chức năng cần thiết.
- **Phương pháp phân tích và tổng hợp:** từ những thông tin thu thập được, tiến hành phân tích ưu nhược điểm, từ đó tổng hợp thành các yêu cầu chức năng cụ thể cho hệ thống.
- **Phương pháp thiết kế mô hình:** xây dựng cấu trúc dữ liệu, sơ đồ phân vai người dùng và luồng hoạt động của hệ thống trước khi tiến hành lập trình.
- **Phương pháp thực nghiệm (lập trình và kiểm thử):** xây dựng sản phẩm thực tế, chạy thử các chức năng, phát hiện lỗi và cải tiến dần để hệ thống hoạt động ổn định.
- **Phương pháp đánh giá kết quả:** so sánh kết quả đạt được với mục tiêu ban đầu, rút ra bài học kinh nghiệm và hướng phát triển trong tương lai.

## 1.5. Nội dung nghiên cứu

Nội dung nghiên cứu của đề tài tập trung vào các vấn đề chính sau:

- **Nghiên cứu về bài toán kiểm tra trắc nghiệm trực tuyến:** tìm hiểu bản chất của hình thức trắc nghiệm khách quan, các yêu cầu cơ bản khi tổ chức một bài kiểm tra trực tuyến như ra đề, quản lý đề, chấm điểm và lưu trữ kết quả.
- **Nghiên cứu về công nghệ xây dựng hệ thống:** tìm hiểu và lựa chọn các công nghệ, công cụ phù hợp để xây dựng giao diện người dùng (phần front-end) và bộ phận xử lý dữ liệu, quản lý cơ sở dữ liệu (phần back-end).
- **Nghiên cứu thiết kế cơ sở dữ liệu:** xác định các bảng dữ liệu cần thiết như người dùng, môn học, câu hỏi, bài kiểm tra, kết quả làm bài và mối quan hệ giữa chúng để đảm bảo hệ thống lưu trữ chính xác và truy xuất nhanh chóng.
- **Nghiên cứu phân quyền và bảo mật:** xây dựng các vai trò khác nhau (quản trị viên, giáo viên, học sinh) và quy định quyền hạn tương ứng nhằm đảm bảo tính an toàn, riêng tư cho dữ liệu.
- **Nghiên cứu xây dựng và kiểm thử hệ thống:** lập trình các chức năng chính, tiến hành kiểm thử để đảm bảo hệ thống hoạt động đúng, ổn định và đáp ứng được nhu cầu sử dụng thực tế.

## 1.6. Ý nghĩa của đề tài

Về mặt thực tiễn, sản phẩm giúp giảm tải công việc thủ công cho giáo viên, nâng cao tính chính xác trong chấm điểm và giúp học sinh làm bài chủ động, linh hoạt hơn. Về mặt học tập, quá trình thực hiện đề tài giúp chúng tôi củng cố kiến thức về lập trình web, thiết kế cơ sở dữ liệu và kỹ năng làm việc nhóm, giải quyết vấn đề.

Tóm lại, đề tài **"Xây dựng website kiểm tra trắc nghiệm trực tuyến"** không chỉ giải quyết một nhu cầu thực tế trong giảng dạy mà còn là cơ hội để chúng tôi áp dụng những kiến thức đã học vào một sản phẩm cụ thể, có ý nghĩa ứng dụng cao.
