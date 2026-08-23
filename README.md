# 🎓 Xây dựng Website Kiểm Tra Trắc Nghiệm

Hệ thống quản lý và tổ chức kiểm tra trắc nghiệm trực tuyến toàn diện cho trường học và trung tâm giáo dục. Website hỗ trợ đầy đủ quy trình kiểm tra — từ quản lý ngân hàng câu hỏi, tạo đề, phân phối đề theo lớp, làm bài trực tuyến đến tự động chấm điểm và theo dõi kết quả.

<a href="https://react.dev/" target="_blank">
    <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>
</a>
<a href="https://nodejs.org/" target="_blank">
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
</a>
<a href="https://www.mongodb.com/" target="_blank">
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
</a>
<a href="https://expressjs.com/" target="_blank">
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white"/>
</a>
<a href="https://jwt.io/" target="_blank">
    <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
</a>
<a href="https://www.docker.com/" target="_blank">
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
</a>
<a href="https://nginx.org/" target="_blank">
    <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white"/>
</a>

## 📑 Mục lục
- 📖 [Giới Thiệu Đồ Án](#giới-thiệu-đồ-án)
- 🌟 [Tính Năng Chính](#tính-năng-chính)
- 🏗️ [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
- 🗄️ [Cơ Sở Dữ Liệu](#cơ-sở-dữ-liệu)
- 🔌 [Tài Liệu API](#tài-liệu-api)
- 🚀 [Hướng Dẫn Cài Đặt](#hướng-dẫn-cài-đặt)
- 🐳 [Triển Khai với Docker](#triển-khai-với-docker)
- 📝 [Scripts Có Sẵn](#scripts-có-sẵn)
- 🛠️ [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- 🤝 [Đóng Góp và Phát Triển](#đóng-góp-và-phát-triển)
- 📞 [Liên Hệ và Hỗ Trợ](#liên-hệ-và-hỗ-trợ)

---

## 📖 Giới Thiệu Đồ Án

Đây là đồ án báo cáo kết thúc môn **Công Nghệ Phần Mềm** tại Trường **Đại học Trà Vinh** — **Khoa Công nghệ Thông tin**. Dự án xây dựng hệ thống website kiểm tra trắc nghiệm trực tuyến nhằm số hóa toàn bộ quy trình kiểm tra đánh giá: giảm tải các thao tác thủ công cho giáo viên (soạn đề, phát đề, chấm bài, tổng hợp điểm), tiết kiệm thời gian tổ chức kiểm tra, đồng thời tạo môi trường làm bài trực tuyến thuận tiện, linh hoạt cho học viên.

### 👥 Thông Tin Nhóm
| Thông tin | Chi tiết |
|-----------|----------|
| 🏫 Trường | Đại học Trà Vinh — Trường Kỹ thuật và Công nghệ |
| 🎓 Khoa | Công nghệ Thông tin |
| 📚 Môn học | Công Nghệ Phần Mềm |
| 👨‍🏫 Giáo viên hướng dẫn | TS. Nguyễn Bảo Ân |
| 📅 Năm học | 2025 - 2026 |
| 📍 Địa điểm | Vĩnh Long, tháng 8 năm 2026 |

**Thành viên thực hiện:**
| Họ và tên | MSSV – Lớp | Vai trò |
|-----------|-----------|---------|
| Huỳnh Lê Ngọc Trinh | 110123058 – DA23TTB | Trưởng nhóm & Full-stack Developer |
| Nguyễn Thị Thúy Duy | 110123081 – DA23TTB | Full-stack Developer |
| Trần Thị Yến Khoa | 110123020 – DA23TTB | Full-stack Developer |

### 🎯 Mục Tiêu Đồ Án
- Xây dựng website làm bài kiểm tra trắc nghiệm trực tuyến hoạt động ổn định, giao diện thân thiện, dễ sử dụng cho cả giáo viên và học viên.
- Hỗ trợ giáo viên quản lý **ngân hàng câu hỏi** một cách có tổ chức: thêm, sửa, xóa, tìm kiếm, phân loại theo môn học và mức độ khó; nhập câu hỏi thủ công hoặc từ file CSV.
- **Tự động chấm điểm** và trả kết quả ngay sau khi học viên nộp bài, giúp tiết kiệm thời gian và giảm sai sót so với chấm tay.
- **Phân chia quyền rõ ràng** giữa ba vai trò: quản trị viên, giáo viên và học viên, đảm bảo dữ liệu được quản lý an toàn, đúng người đúng quyền.
- Áp dụng kiến thức về React, Node.js, Express, MongoDB, Docker vào dự án thực tế có quy mô đầy đủ.

### 📌 Đối Tượng Sử Dụng
Hệ thống phục vụ **giáo viên**, **học viên** và **quản trị viên** của nhà trường hoặc trung tâm giáo dục, tập trung vào các bài kiểm tra trắc nghiệm khách quan (mỗi câu có bốn đáp án, một đáp án đúng).

---

## 🌟 Tính Năng Chính

### 👥 Quản Lý Người Dùng & Phân Quyền
- **Ba vai trò** riêng biệt: Quản trị viên (Admin), Giáo viên (Teacher), Học viên (Student).
- **Đăng nhập/đăng ký** với xác thực JWT (JSON Web Token) và mã hóa mật khẩu bằng bcryptjs.
- **Quản lý tài khoản** (Admin): thêm, sửa, xóa, tìm kiếm, phân trang, khóa/mở khóa tài khoản.
- **Hồ sơ cá nhân**: cập nhật thông tin, ảnh đại diện, đổi mật khẩu.

### ❓ Quản Lý Ngân Hàng Câu Hỏi
- **CRUD câu hỏi** trắc nghiệm (4 đáp án, 1 đáp án đúng) với kiểm tra hợp lệ nghiêm ngặt.
- **Phân loại** câu hỏi theo môn học và mức độ khó (dễ, trung bình, khó).
- **Chống trùng lặp** câu hỏi tự động theo nội dung (chuẩn hóa NFKC, bỏ khoảng trắng thừa, không phân biệt hoa thường).
- **Nhập câu hỏi từ file CSV** với mẫu file (template) có sẵn, tự dò encoding và dấu phân cách; kèm **cảnh báo câu hỏi trùng** khi nhập hàng loạt.
- **Phân quyền theo môn**: giáo viên chỉ thao tác trên các môn được phân công giảng dạy.
### 📝 Quản Lý Bài Kiểm Tra & Phân Phối Đề
- **Tạo/Chỉnh sửa/Xóa đề thi**: chọn câu hỏi từ ngân hàng, đặt thời gian làm bài, số lần làm tối đa, tổng điểm, điểm đạt.
- **Lọc câu hỏi theo môn** khi tạo đề giúp giáo viên chọn nhanh đúng ngân hàng của mình.
- **Công bố & giao đề cho lớp**: chọn lớp được phân công dạy để xuất bản đề, giới hạn đúng đối tượng học viên.
- Quản lý trạng thái đề: **bản nháp / đã công bố**.

### 📚 Làm Bài & Chấm Điểm Tự Động
- Học viên xem danh sách bài được giao, **làm bài trực tuyến** với bộ đếm thời gian đếm ngược.
- Lưu đáp án từng câu, tự động **nộp bài** và xử lý hết giờ.
- **Tự động chấm điểm**: tính điểm, tỷ lệ phần trăm, số câu đúng, thời gian làm bài, trạng thái đạt/không đạt.
- **Xem kết quả chi tiết** từng câu sau khi nộp bài, lịch sử làm bài của học viên.

### 🏫 Quản Lý Lớp Học & Phân Công Giảng Dạy
- **Admin** quản lý lớp học: tạo, sửa, xóa lớp, chọn giáo viên chủ nhiệm.
- **Thêm/Xóa học viên** vào lớp; **import danh sách học viên từ file CSV/Excel** (tự động tạo tài khoản, báo cáo email trùng).
- **Phân công giảng dạy** giáo viên – môn – lớp (unique index: một môn ở một lớp chỉ một giáo viên phụ trách).
- **Danh sách thành viên lớp** có tìm kiếm và phân trang.

### 📊 Dashboard & Thống Kê (Admin)
- Tổng quan số liệu hệ thống: người dùng, môn học, lớp học, đề thi, bài làm.
- **Biểu đồ thống kê**, phân bố vai trò, các hoạt động gần đây.

### 🔔 Thông Báo
- Admin tạo/quản lý thông báo, **ghim** thông báo quan trọng.
- Học viên xem danh sách thông báo và **đánh dấu đã đọc**.

---


## 🏗️ Kiến Trúc Hệ Thống

### 📋 Tổng Quan Kiến Trúc
Hệ thống được thiết kế theo **Three-Tier Architecture (Kiến trúc 3 tầng)** kết hợp mô hình **MVC (Model – View – Controller)**:

- 🖥️ **Presentation Layer (Tầng giao diện):** Giao diện người dùng cho quản trị viên, giáo viên và học viên (ReactJS).
- ⚙️ **Business Logic Layer (Tầng xử lý nghiệp vụ):** Xử lý các nghiệp vụ và giao tiếp với cơ sở dữ liệu (Node.js + Express).
- 🗄️ **Data Layer (Tầng dữ liệu):** Lưu trữ toàn bộ dữ liệu của hệ thống (MongoDB / MongoDB Atlas).

### 🏛️ Sơ Đồ Kiến Trúc Tổng Thể
```text
               👨‍🎓👩‍🏫👨‍💼
             Người sử dụng
   (Học viên - Giáo viên - Quản trị viên)
                    │
               🌐 HTTP/HTTPS
                    │
       ┌────────────▼────────────┐
       │  🖥️ Frontend (ReactJS)  │
       │  React Router + Axios   │
       └────────────┬────────────┘
                    │  🔄 REST API
       ┌────────────▼────────────┐
       │  ⚙️ Backend (Express)   │
│  Controllers → Services │
       └────────────┬────────────┘
       ┌────────────▼────────────┐
       │  🗄️ MongoDB (Mongoose)  │
       └─────────────────────────┘
```

### 🔄 Luồng Hoạt Động Chính
```text
🔐 Đăng nhập:  Người dùng → Frontend → POST /api/auth/login → Backend → MongoDB → JWT → Frontend

📝 Làm bài:    Học viên → Chọn bài → Frontend → GET /api/quizzes/:id → Backend → MongoDB → Danh sách câu hỏi → Frontend

📤 Nộp bài:    Học viên → Nộp bài → Frontend → POST /api/quiz-attempts/:id/submit → Backend → Tự động chấm điểm → Lưu kết quả → Trả điểm → Frontend

🧑‍🏫 Tạo đề:   Giáo viên → Tạo đề → Frontend → POST /api/quizzes → Backend → MongoDB → Lưu đề thi
```

### 📁 Kiến Trúc Thư Mục

**🎨 Frontend Architecture (React 18 + CRA)**
```text
frontend/
├── Dockerfile                  # Build đa giai đoạn (Node + Nginx)
├── nginx.conf                  # Cấu hình Nginx serve file tĩnh & proxy /api
├── .env                        # Biến môi trường (REACT_APP_API_URL)
├── audio/                      # File âm thanh
├── build/                      # Output build production
├── public/
│   ├── index.html
│   └── fonts/                  # Font chữ (NotoSans-Bold, NotoSans-Regular)
└── src/
    ├── components/             # Component UI tái sử dụng
    │   ├── admin/
    │   │   ├── AdminHeader.js
    │   │   ├── AdminLayout.js
    │   │   ├── AdminSidebar.js
    │   │   └── TeacherAutocomplete.jsx
    │   ├── teacher/
    │   │   ├── Notification.css
    │   │   ├── NotificationDropdown.jsx
    │   │   ├── TeacherAvatar.css
    │   │   ├── TeacherAvatar.jsx
    │   │   ├── TeacherSidebar.css
    │   │   └── TeacherSidebar.jsx
    │   ├── student/
    │   │   ├── AvatarInitials.jsx
    │   │   ├── NotificationBell.jsx
    │   │   ├── Sidebar.css
    │   │   ├── Sidebar.jsx
    │   │   └── UserMenu.jsx
    │   └── common/
    │       └── Avatar.js
    ├── context/
    │   └── AuthContext.js      # Quản lý trạng thái đăng nhập
    ├── layouts/
    │   ├── ExamList.jsx        # Danh sách đề thi
    │   ├── Profile.jsx         # Hồ sơ người dùng
    │   ├── Results.jsx         # Kết quả
    │   ├── StudentDashboardPage.jsx  # Dashboard học viên
    │   └── StudentLayout.jsx   # Layout khu vực học viên
    ├── pages/                  # Các trang chính của ứng dụng
    │   ├── AuthPages.js        # Đăng nhập / đăng ký
    │   ├── EduQuizPage.js      # Trang chính hệ thống
    │   ├── ExamManager.js      # Quản lý đề thi
    │   ├── MembersPage.js      # Danh sách thành viên
    │   ├── QuestionManager.js  # Quản lý ngân hàng câu hỏi (import CSV)
│   ├── ResultPage.js       # Kết quả làm bài
    │   ├── TakeQuizPage.js     # Trang làm bài thi
    │   ├── TeacherDashboardPage.js    # Dashboard giáo viên
    │   ├── TeacherResultPage.js       # Kết quả (giáo viên)
    │   ├── TeacherClassResultPage.js  # Kết quả theo lớp (giáo viên)
    │   └── Admin*.js           # Admin: Assignment, Class, Dashboard, Login,
    │                           #   Notification, Setting, Subject, User Management
    ├── services/               # Service gọi API
    │   ├── api.js              # Axios instance
    │   ├── authService.js      # Auth service
    │   ├── adminService.js     # Admin service
    │   └── services.js
    ├── utils/
    │   └── formatTime.js       # Hàm định dạng thời gian
    ├── styles/                 # File CSS cho từng trang
    ├── App.js
    ├── App.css
    ├── index.js
    └── index.css
```

**⚙️ Backend Architecture (Node.js + Express Monolithic)**
```text
backend/
├── src/
│   ├── controllers/         # Xử lý logic nghiệp vụ
│   │   ├── authController.js
│   │   ├── questionController.js
│   │   ├── quizController.js
│   │   ├── quizAttemptController.js
│   │   ├── classController.js
│   │   ├── teacherAssignmentController.js
│   │   ├── notificationController.js
│   │   └── admin*Controller.js   # Admin: users, classes, subjects, dashboard...
│   ├── models/              # Định nghĩa schema Mongoose
│   │   ├── User.js, Question.js, Quiz.js, QuizAttempt.js
│   │   ├── QuizAssignment.js, Class.js, Subject.js
│   │   ├── TeacherAssignment.js, Notification.js
│   ├── routes/              # Định nghĩa API endpoints
│   ├── middlewares/         # auth.js (authenticate, authorize)
│   ├── services/            # permissionService.js (phân quyền theo môn)
│   └── server.js            # Khởi tạo server
├── scripts/                 # Script hỗ trợ (seed, createTestUser...)
├── Dockerfile
└── package.json
```

---

## 🗄️ Cơ Sở Dữ Liệu

MongoDB single database `examdb` (MongoDB Atlas) với các collection chính:

| Collection | Mô tả | Các trường tiêu biểu |
|-----------|-------|---------------------|
| `users` | Người dùng (3 vai trò) | name, userCode, email, password, role, status, settings |
| `questions` | Ngân hàng câu hỏi | content, options[4], category(Subject), difficulty, explanation, createdBy |
| `quizzes` | Đề thi | title, questions[], duration, maxAttempts, totalPoints, passingScore, isPublished, subject |
| `quizattempts` | Bài làm của học viên | studentId, quizId, subject, class, answers[], score, percentage, isPassed |
| `quizassignments` | Giao đề cho lớp | quiz, class, teacher, startTime, deadline, status |
| `classes` | Lớp học | name, homeroomTeacher, students[], year, status |
| `subjects` | Môn học | code, name, department, status |
| `teacherassignments` | Phân công giảng dạy | teacher, subject, class, schoolYear, status |
| `notifications` | Thông báo | title, content, status, pinned, sender, views |

**Ghi chú thiết kế NoSQL:** quan hệ giữa collection dùng `ObjectId + ref` kết hợp `populate()` thay vì JOIN; denormalize có chủ đích (lưu sẵn `subject`, `class`, `categoryName`) để tối ưu hiệu năng đọc; ràng buộc nghiệp vụ đảm bảo bằng unique index (`{subject, class}`, `{quiz, class}`).

---


## 🔌 Tài Liệu API

Tất cả endpoint có tiền tố `/api` (ví dụ: `http://localhost:8080/api`).

### 🔐 Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký tài khoản mới |
| POST | `/api/auth/login` | Đăng nhập (học viên/giáo viên) |
| POST | `/api/auth/admin-login` | Đăng nhập cho admin |
| GET | `/api/auth/me` | Thông tin người dùng hiện tại (cần token) |
| PUT | `/api/auth/profile` | Cập nhật hồ sơ |
| PUT | `/api/auth/change-password` | Đổi mật khẩu |
| PUT | `/api/auth/settings` | Cập nhật cài đặt |

### ❓ Câu Hỏi
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/questions` | Tạo câu hỏi (teacher/admin) |
| GET | `/api/questions` | Danh sách câu hỏi (phân trang, lọc theo môn) |
| GET | `/api/questions/categories` | Môn học được phân công dạy |
| GET | `/api/questions/:id` | Chi tiết câu hỏi |
| PUT | `/api/questions/:id` | Cập nhật câu hỏi (chống trùng) |
| DELETE | `/api/questions/:id` | Xóa câu hỏi |

### 📝 Đề Thi & Bài Làm
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/quizzes` | Tạo đề thi (teacher/admin) |
| GET | `/api/quizzes` | Danh sách đề thi |
| PUT | `/api/quizzes/:id` | Cập nhật đề thi |
| DELETE | `/api/quizzes/:id` | Xóa đề thi |
| POST | `/api/quizzes/:id/publish` | Công bố & giao đề cho lớp |
| POST | `/api/quiz-attempts/start/:quizId` | Bắt đầu làm bài (student) |
| POST | `/api/quiz-attempts/:attemptId/answer` | Lưu đáp án |
| POST | `/api/quiz-attempts/:attemptId/submit` | Nộp bài |
| GET | `/api/quiz-attempts/:attemptId/result` | Kết quả bài làm |
| GET | `/api/quiz-attempts` | Lịch sử bài làm của học viên |
| GET | `/api/quiz-attempts/teacher` | Danh sách bài làm (teacher/admin) |
| GET | `/api/quiz-attempts/class/:classId/results` | Điểm cả lớp theo môn |

### 🏫 Lớp Học & Môn Học
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/classes/teacher/:teacherId` | Lớp của giáo viên (lọc theo môn) |
| GET | `/api/classes/:classId/members` | Danh sách thành viên lớp (phân trang) |
| GET | `/api/classes/homeroom` | Lớp chủ nhiệm của giáo viên |
| GET | `/api/classes/student` | Lớp của học viên |
| GET | `/api/subjects` | Danh sách môn học đang hoạt động |
| CRUD | `/api/assignments` | Quản lý phân công giảng dạy (admin) |

### 🔔 Thông Báo & Admin
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/notifications/student` | Thông báo cho học viên |
| PUT | `/api/notifications/:id/read` | Đánh dấu đã đọc |
| CRUD | `/api/admin/users` | Quản lý người dùng (admin) |
| PATCH | `/api/admin/users/:id/toggle-lock` | Khóa/mở khóa tài khoản |
| CRUD | `/api/admin/subjects` | Quản lý môn học |
| CRUD | `/api/admin/classes` | Quản lý lớp học |
| POST | `/api/admin/classes/:id/import-students` | Import học viên từ CSV/Excel |
| CRUD | `/api/admin/notifications` | Quản lý thông báo |
| GET | `/api/admin/dashboard/*` | Thống kê dashboard |
| GET/PUT | `/api/admin/settings` | Cài đặt hệ thống |

---

## 🚀 Hướng Dẫn Cài Đặt

### 📋 Yêu Cầu Hệ Thống
- Node.js (phiên bản 18 trở lên, khuyến nghị 20)
- MongoDB (local hoặc MongoDB Atlas)
- Docker & Docker Compose (khuyên dùng)
- Git để clone repository

### 🛠️ Các Bước Cài Đặt Chi Tiết

**1. Clone Repository**
```bash
git clone https://github.com/HLNTrinh/websitektrtracnghiem.git
cd websitektrtracnghiem
```

**2. Cài Đặt Dependencies**
```bash
# Backend
cd backend
npm install

# Frontend (mở terminal mới)
cd ../frontend
npm install
```

**3. Thiết Lập Environment Variables**

Tạo file `.env` trong thư mục `backend/`:
```env
NODE_ENV=development
PORT=8080

# MongoDB (local hoặc MongoDB Atlas)
MONGO_URI=mongodb://localhost:27017/examdb
# Ví dụ Atlas: mongodb+srv://<user>:<password>@<cluster>.mongodb.net/EduQuizDB

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# CORS (danh sách origin hợp lệ, phân tách bằng dấu phẩy)
CORS_ORIGIN=http://localhost:3000,http://localhost:8080
```

Tạo file `.env` trong thư mục `frontend/`:
```env
REACT_APP_API_URL=http://localhost:8080/api
```

> ⚠️ **Lưu ý bảo mật:** Không bao giờ commit file `.env` chứa thông tin đăng nhập thật (đặc biệt là connection string MongoDB Atlas) lên Git.

**4. Khởi Chạy Ứng Dụng**

*Phương pháp 1: Chạy từng service riêng biệt*
```bash
# Terminal 1: Backend (chạy tại http://localhost:8080)
cd backend
npm run dev

# Terminal 2: Frontend (chạy tại http://localhost:3000)
cd frontend
npm start
```

*Phương pháp 2: Sử dụng Docker (khuyên dùng)*
```bash
docker-compose up --build
```

**5. Truy Cập Ứng Dụng**
| Thành phần | URL |
|-----------|-----|
| 🖥️ Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:8080 |
| 💚 Health Check | http://localhost:8080/api/health |
| 🗄️ MongoDB | mongodb://localhost:27017 |

---


## 🐳 Triển Khai với Docker

Dự án sử dụng **Docker Compose** để đóng gói và chạy 3 thành phần: MongoDB, Backend, Frontend.

```bash
# Build và chạy toàn bộ hệ thống
docker-compose up --build

# Chạy ở background
docker-compose up --build -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down

# Xóa volumes và containers
docker-compose down -v --remove-orphans
```

**Cấu hình services:**
| Service | Image | Port | Mô tả |
|---------|-------|------|-------|
| `mongodb` | mongo:7.0 | 27017 | Cơ sở dữ liệu (có healthcheck) |
| `backend` | node:20-alpine | 8080 | REST API Express |
| `frontend` | nginx:stable-alpine | 3000 | SPA React + Nginx (proxy `/api` → backend) |

Backend và Frontend được build từ `Dockerfile` đa giai đoạn; frontend dùng **Nginx** phục vụ file tĩnh và reverse-proxy request `/api/` sang backend.

---

## 📝 Scripts Có Sẵn

**🎨 Frontend (React)**
```bash
cd frontend
npm start        # Chạy development server (port 3000)
npm run build    # Build production
npm test         # Chạy unit tests
```

**⚙️ Backend (Node.js)**
```bash
cd backend
npm run dev      # Development server với nodemon (auto-restart)
npm start        # Chạy production server
```

**🛠️ Script Hỗ Trợ (backend/scripts)**
```bash
node scripts/seedQuizzes.js          # Seed dữ liệu mẫu
node scripts/createTestUser.js       # Tạo tài khoản test
node scripts/testLogin.js            # Test đăng nhập
node scripts/fixMaxAttempts.js       # Sửa số lần làm bài
node scripts/map-class-teacher.js    # Map giáo viên - lớp
```

---

## 🛠️ Công Nghệ Sử Dụng

### 🎨 Frontend Technologies
| Công nghệ | Vai trò |
|-----------|---------|
| ⚛️ React 18 | Thư viện xây dựng giao diện người dùng |
| 🔀 React Router DOM v6 | Client-side routing |
| 📡 Axios | Giao tiếp Frontend – Backend |
| 📄 PapaParse | Parse file CSV (import câu hỏi) |
| 📊 jsPDF + autotable | Xuất báo cáo PDF |
| 🎨 lucide-react & react-icons | Icon library |
| 🚀 React Scripts (CRA) | Build tool & dev server |

### ⚙️ Backend Technologies
| Công nghệ | Vai trò |
|-----------|---------|
| 🟢 Node.js 18/20 | JavaScript runtime |
| 🚀 Express.js | Web framework xây dựng RESTful API |
| 🍃 MongoDB + Mongoose 8 | Cơ sở dữ liệu NoSQL & ODM |
| 🔐 JWT (jsonwebtoken) | Xác thực & phân quyền |
| 🔒 bcryptjs | Mã hóa mật khẩu |
| 🛡️ Helmet | Bảo mật HTTP headers |
| 🌐 CORS | Quản lý cross-origin requests |
| 📦 Multer | Upload file (import học viên) |
| 📊 ExcelJS | Đọc/ghi file Excel (import danh sách) |
| ✅ express-validator | Kiểm tra dữ liệu đầu vào |
| 📝 Morgan | Logging HTTP requests |
| ⚙️ dotenv | Quản lý biến môi trường |

### 🐳 DevOps & Deployment
| Công nghệ | Vai trò |
|-----------|---------|
| 🐳 Docker & Docker Compose | Containerization & orchestration |
| 🌿 Nginx | Serve static files & reverse proxy |
| ☁️ MongoDB Atlas | Cloud database service |
| 🌿 Git & GitHub | Quản lý mã nguồn |

---


## 🤝 Đóng Góp và Phát Triển

### 🔄 Quy Trình Phát Triển
1. **Fork** repository về tài khoản cá nhân.
2. Tạo branch mới cho feature: `git checkout -b feature/ten-tinh-nang`.
3. Commit changes với message rõ ràng: `git commit -m "feat: mô tả tính năng"`.
4. Push lên branch: `git push origin feature/ten-tinh-nang`.
5. Tạo **Pull Request** để review code.

### 📋 Coding Standards
- **JavaScript:** ES6+ với `async/await` patterns.
- **React:** Functional components với Hooks.
- **API:** RESTful design principles.
- **Database:** MongoDB với Mongoose ODM và optimized queries (indexes).
- **Naming:** `camelCase` cho variables/functions, `PascalCase` cho components.
- **Git:** Conventional commits với feature branch workflow.

### 🚧 Roadmap Tương Lai
- 🔄 Bổ sung thêm nhiều dạng câu hỏi (nhiều đáp án đúng, tự luận).
- 🔄 Hỗ trợ đa ngôn ngữ (i18n).
- 🔄 Ứng dụng mobile (React Native).
- 🔄 Push notification real-time.
- 🔄 Thống kê chi tiết cho giáo viên (phân tích năng lực học viên theo câu hỏi).

---

## 📞 Liên Hệ và Hỗ Trợ

### 👥 Thành Viên Nhóm
| Họ và tên | MSSV | GitHub |
|-----------|------|--------|
| Huỳnh Lê Ngọc Trinh | 110123058 | `HLNTrinh` |
| Nguyễn Thị Thúy Duy | 110123081 | `NTTD-ttb` |
| Trần Thị Yến Khoa | 110123020 | `yenkhoa200` |

### 📚 Tài Nguyên Tham Khảo
- React Documentation: https://react.dev/
- Node.js Guides: https://nodejs.org/en/docs/
- Express.js: https://expressjs.com/
- MongoDB Manual: https://docs.mongodb.com/
- Mongoose: https://mongoosejs.com/
- Docker Documentation: https://docs.docker.com/

---

## 🎉 Lời Cảm Ơn

Cảm ơn tất cả thành viên nhóm đã đóng góp vào dự án này. Đây là kết quả của sự nỗ lực, tinh thần làm việc nhóm và đam mê công nghệ. Cảm ơn **TS. Nguyễn Bảo Ân** đã tận tình hướng dẫn trong suốt quá trình thực hiện đồ án.

Được phát triển với ❤️ bởi nhóm báo cáo môn Công Nghệ Phần Mềm — **Trường Đại học Trà Vinh**.

> ⭐ Nếu dự án hữu ích với bạn, hãy cho chúng mình một **star** nhé!