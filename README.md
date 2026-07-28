# Kiến trúc ứng dụng web

## 1. Tổng quan kiến trúc

Website kiểm tra trắc nghiệm trực tuyến được thiết kế theo mô hình **Three-Tier Architecture (Kiến trúc 3 tầng)** nhằm đảm bảo tính mở rộng, dễ bảo trì và tăng cường bảo mật. Hệ thống bao gồm ba tầng chính:

- **Presentation Layer (Tầng giao diện):** Cung cấp giao diện tương tác cho học sinh, giáo viên và quản trị viên.
- **Business Logic Layer (Tầng xử lý nghiệp vụ):** Xử lý các yêu cầu từ người dùng, quản lý nghiệp vụ thi trắc nghiệm và giao tiếp với cơ sở dữ liệu.
- **Data Layer (Tầng dữ liệu):** Lưu trữ thông tin người dùng, đề thi, câu hỏi, kết quả và các dữ liệu liên quan.

### Kiến trúc tổng thể

```text
                     +----------------------+
                     |      Người dùng      |
                     | Học sinh | Giáo viên |
                     |    Quản trị viên     |
                     +----------+-----------+
                                |
                           HTTP/HTTPS
                                |
                    +-----------v-----------+
                    |       Frontend        |
                    | ReactJS + Vite + MUI  |
                    +-----------+-----------+
                                |
                           REST API
                                |
                    +-----------v-----------+
                    |       Backend         |
                    | Node.js + Express.js  |
                    +-----------+-----------+
                                |
                           MongoDB Database
                                |
       +------------------------+------------------------+
       |           |             |          |            |
     Users       Exams      Questions    Results     Classes
```

---

# 2. Kiến trúc các tầng

## 2.1. Presentation Layer (Frontend)

Frontend được phát triển bằng **ReactJS** kết hợp **Vite** và **Material UI (MUI)** nhằm tạo giao diện hiện đại, thân thiện và dễ sử dụng.

### Chức năng

- Đăng ký tài khoản
- Đăng nhập
- Quản lý hồ sơ cá nhân
- Xem danh sách bài thi
- Làm bài trắc nghiệm
- Xem kết quả
- Quản lý đề thi (Giáo viên)
- Quản lý người dùng (Quản trị viên)

### Công nghệ sử dụng

- ReactJS
- Vite
- Material UI
- Axios
- React Router DOM

---

## 2.2. Business Logic Layer (Backend)

Backend được xây dựng bằng **Node.js** và **Express.js**, chịu trách nhiệm xử lý toàn bộ nghiệp vụ của hệ thống.

### Chức năng

- Xác thực người dùng (JWT)
- Quản lý tài khoản
- Quản lý đề thi
- Quản lý câu hỏi
- Chấm điểm tự động
- Lưu kết quả bài thi
- Quản lý lớp học
- Phân quyền người dùng

### Luồng xử lý

```text
Frontend
      |
POST /api/exams/start
      |
Backend
      |
Kiểm tra quyền truy cập
      |
Lấy dữ liệu đề thi
      |
MongoDB
      |
Trả dữ liệu bài thi
      |
Frontend
```

---

## 2.3. Data Layer

Hệ thống sử dụng **MongoDB** để lưu trữ dữ liệu.

### Các Collection

- Users
- Exams
- Questions
- Results
- Classes
- Subjects

### Ví dụ cấu trúc User

```json
{
  "_id": "...",
  "fullname": "Nguyen Van A",
  "email": "student@gmail.com",
  "password": "hashedPassword",
  "role": "student"
}
```

### Ví dụ cấu trúc Exam

```json
{
  "_id": "...",
  "title": "Kiểm tra giữa kỳ",
  "subject": "Lập trình Web",
  "duration": 45,
  "totalQuestions": 40
}
```

### Ví dụ cấu trúc Result

```json
{
  "_id": "...",
  "studentId": "...",
  "examId": "...",
  "score": 8.5,
  "submitTime": "2026-07-28T10:30:00"
}
```

---

# 3. Luồng hoạt động của hệ thống

## 3.1. Đăng nhập

```text
Người dùng
      |
Đăng nhập
      |
Frontend
      |
POST /login
      |
Backend
      |
MongoDB
      |
JWT Token
      |
Frontend
```

---

## 3.2. Làm bài thi

```text
Học sinh
      |
Chọn bài thi
      |
Frontend
      |
GET /api/exams/{id}
      |
Backend
      |
MongoDB
      |
Danh sách câu hỏi
      |
Frontend
```

---

## 3.3. Nộp bài

```text
Học sinh
      |
Nộp bài
      |
Frontend
      |
POST /api/results
      |
Backend
      |
Chấm điểm tự động
      |
Lưu kết quả
      |
MongoDB
      |
Trả điểm
      |
Frontend
```

---

## 3.4. Giáo viên tạo đề thi

```text
Giáo viên
      |
Tạo đề thi
      |
Frontend
      |
POST /api/exams
      |
Backend
      |
MongoDB
      |
Lưu đề thi
```

---

# 4. Kiến trúc thư mục

```text
online-quiz-system/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── database/
│
├── docker-compose.yml
│
└── README.md
```

---

# 5. Kiến trúc API

```text
                     Frontend
                         |
                     REST API
                         |
                  Express Router
                         |
      +------------------+------------------+
      |                  |                  |
 AuthController   ExamController   ResultController
      |                  |                  |
 QuestionController  UserController  ClassController
      |                  |                  |
      +------------------+------------------+
                         |
                      MongoDB
```

---

# 6. Kiến trúc triển khai

```text
                      Internet
                          |
                     HTTPS Request
                          |
                   +--------------+
                   |    Nginx     |
                   +------+-------+
                          |
          +---------------+---------------+
          |                               |
 +--------v--------+              +--------v--------+
 | React Frontend  |              | Express Backend |
 | (Vite Build)    |              | Node.js API     |
 +--------+--------+              +--------+--------+
                                           |
                                   +-------v-------+
                                   |   MongoDB     |
                                   |   Database    |
                                   +---------------+
```

---

# 7. Ưu điểm của kiến trúc

- Phân tách rõ ràng giữa giao diện, xử lý nghiệp vụ và tầng dữ liệu.
- Hỗ trợ phát triển và bảo trì độc lập giữa Frontend và Backend.
- Đảm bảo tính bảo mật thông qua xác thực JWT và phân quyền người dùng.
- Dễ dàng mở rộng để tích hợp các tính năng như thông báo, thống kê kết quả, xuất báo cáo hoặc giám sát trực tuyến.
- Phù hợp với các hệ thống kiểm tra trắc nghiệm trực tuyến có nhiều vai trò như **Học sinh, Giáo viên và Quản trị viên**.
## Cấu Trúc Dự Án

```
myapp/
├── frontend/              # React Application
│   ├── src/
│   │   ├── components/    # React Components
│   │   ├── pages/         # Pages
│   │   ├── App.js         # Main App Component
│   │   ├── index.js       # Entry Point
│   │   └── index.css      # Global Styles
│   ├── public/
│   │   └── index.html     # HTML Template
│   ├── Dockerfile         # Frontend Docker Configuration
│   └── package.json
|   └── .env
│
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── routes/        # API Routes
│   │   ├── models/        # MongoDB Schemas
│   │   ├── controllers/   # Business Logic
│   │   └── server.js      # Express Server
│   ├── Dockerfile         # Backend Docker Configuration
│   ├── package.json
│   └── .env
│
├── docker-compose.yml     # Docker Compose Configuration
├── .gitignore
└── README.md
```
