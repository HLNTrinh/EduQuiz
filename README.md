# 🏗️ Kiến trúc ứng dụng web

## 📌 1. Tổng quan kiến trúc

Website **Kiểm tra trắc nghiệm trực tuyến** được thiết kế theo mô hình **Three-Tier Architecture (Kiến trúc 3 tầng)** nhằm đảm bảo tính mở rộng, dễ bảo trì và tăng cường bảo mật.

Hệ thống bao gồm ba tầng chính:

- 🖥️ **Presentation Layer (Tầng giao diện):** Giao tiếp với học sinh, giáo viên và quản trị viên.
- ⚙️ **Business Logic Layer (Tầng xử lý nghiệp vụ):** Xử lý các nghiệp vụ và giao tiếp với cơ sở dữ liệu.
- 🗄️ **Data Layer (Tầng dữ liệu):** Lưu trữ toàn bộ dữ liệu của hệ thống.

---

## 🏛️ Kiến trúc tổng thể

```text
                     👨‍🎓👩‍🏫👨‍💼
                   Người sử dụng
      (Học sinh - Giáo viên - Quản trị viên)
                          │
                     🌐 HTTP/HTTPS
                          │
                ┌────────────────────┐
                │ 🖥️ Frontend         │
                │ ReactJS + Vite + MUI│
                └─────────┬──────────┘
                          │
                     🔄 REST API
                          │
                ┌─────────▼──────────┐
                │ ⚙️ Backend          │
                │ Node.js + Express  │
                └─────────┬──────────┘
                          │
                ┌─────────▼──────────┐
                │ 🗄️ MongoDB          │
                └─────────┬──────────┘
                          │
      ┌──────────┬──────────┬──────────┬──────────┐
      │ 👤 Users │ 📝 Exams │ ❓Questions │ 📊 Results │
      └──────────┴──────────┴──────────┴──────────┘
```

---

# 🖥️ 2. Presentation Layer (Frontend)

Frontend được phát triển bằng **ReactJS**, **Vite** và **Material UI**.

### ✨ Chức năng

- 🔐 Đăng nhập
- 📝 Đăng ký
- 👤 Quản lý hồ sơ
- 📚 Danh sách bài thi
- ✅ Làm bài thi
- 📈 Xem kết quả
- 🧑‍🏫 Quản lý đề thi
- 👨‍💼 Quản lý người dùng

### 🛠️ Công nghệ

- ⚛️ ReactJS
- ⚡ Vite
- 🎨 Material UI
- 🔄 Axios
- 🧭 React Router DOM

---

# ⚙️ 3. Business Logic Layer (Backend)

Backend được xây dựng bằng **Node.js** và **Express.js**.

### 🚀 Chức năng

- 🔐 Xác thực JWT
- 👤 Quản lý người dùng
- 📄 Quản lý đề thi
- ❓ Quản lý câu hỏi
- 🧮 Chấm điểm tự động
- 💾 Lưu kết quả
- 🏫 Quản lý lớp học
- 🛡️ Phân quyền

---

### 🔄 Luồng xử lý

```text
🖥️ Frontend
      │
POST /api/exams/start
      │
⚙️ Backend
      │
🔒 Kiểm tra quyền
      │
📂 MongoDB
      │
📄 Đề thi
      │
🖥️ Frontend
```

---

# 🗄️ 4. Data Layer

Hệ thống sử dụng **MongoDB**.

## 📦 Các Collection

- 👤 Users
- 📝 Exams
- ❓ Questions
- 📊 Results
- 🏫 Classes
- 📖 Subjects

---

### 👤 User

```json
{
  "_id": "...",
  "fullname": "Nguyen Van A",
  "email": "student@gmail.com",
  "role": "student"
}
```

### 📝 Exam

```json
{
  "_id": "...",
  "title": "Kiểm tra giữa kỳ",
  "duration": 45,
  "totalQuestions": 40
}
```

### 📊 Result

```json
{
  "_id": "...",
  "studentId": "...",
  "examId": "...",
  "score": 9.0
}
```

---

# 🔄 5. Luồng hoạt động

## 🔐 Đăng nhập

```text
👤 Người dùng
      │
🔑 Đăng nhập
      │
🖥️ Frontend
      │
POST /login
      │
⚙️ Backend
      │
🗄️ MongoDB
      │
🎫 JWT
      │
🖥️ Frontend
```

---

## 📝 Làm bài thi

```text
👨‍🎓 Học sinh
      │
📚 Chọn bài thi
      │
🖥️ Frontend
      │
GET /api/exams/{id}
      │
⚙️ Backend
      │
🗄️ MongoDB
      │
📄 Danh sách câu hỏi
      │
🖥️ Frontend
```

---

## 📤 Nộp bài

```text
👨‍🎓 Học sinh
      │
📤 Nộp bài
      │
🖥️ Frontend
      │
POST /api/results
      │
⚙️ Backend
      │
🧮 Chấm điểm
      │
💾 Lưu kết quả
      │
🗄️ MongoDB
      │
📊 Trả điểm
      │
🖥️ Frontend
```

---

## 🧑‍🏫 Giáo viên tạo đề

```text
🧑‍🏫 Giáo viên
      │
➕ Tạo đề
      │
🖥️ Frontend
      │
POST /api/exams
      │
⚙️ Backend
      │
🗄️ MongoDB
      │
💾 Lưu đề thi
```

---

# 📁 6. Kiến trúc thư mục

```text
📦 online-quiz-system
│
├── 🎨 frontend
│   ├── 📁 public
│   ├── 📁 src
│   │   ├── 📁 assets
│   │   ├── 📁 components
│   │   ├── 📁 pages
│   │   ├── 📁 layouts
│   │   ├── 📁 contexts
│   │   ├── 📁 services
│   │   ├── 📁 routes
│   │   └── App.jsx
│
├── ⚙️ backend
│   ├── 📁 config
│   ├── 📁 controllers
│   ├── 📁 middleware
│   ├── 📁 models
│   ├── 📁 routes
│   ├── 📁 services
│   ├── app.js
│   └── server.js
│
├── 🗄️ database
│
├── 🐳 docker-compose.yml
│
└── 📖 README.md
```

---

# 🔌 7. Kiến trúc API

```text
                  🖥️ Frontend
                        │
                    🌐 REST API
                        │
                 ⚙️ Express Router
                        │
      ┌──────────┬──────────┬──────────┐
      │          │          │
 🔐 Auth     📝 Exam     📊 Result
 Controller Controller Controller
      │          │          │
      ├──────────┼──────────┤
      │
 ❓ Question Controller
      │
 👤 User Controller
      │
 🗄️ MongoDB
```

---

# ☁️ 8. Kiến trúc triển khai

```text
              🌍 Internet
                   │
             🔒 HTTPS
                   │
            🌐 Nginx Server
                   │
        ┌──────────┴──────────┐
        │                     │
🖥️ React Frontend      ⚙️ Express API
        │                     │
        └──────────┬──────────┘
                   │
              🗄️ MongoDB
```

---

# ⭐ 9. Ưu điểm

- ✅ Kiến trúc rõ ràng, dễ bảo trì.
- 🚀 Frontend và Backend phát triển độc lập.
- 🔐 Bảo mật với JWT và phân quyền.
- 📈 Dễ mở rộng tính năng.
- 👥 Hỗ trợ nhiều vai trò: **Học sinh**, **Giáo viên**, **Quản trị viên**.
- 🧪 Dễ kiểm thử và triển khai bằng Docker.
