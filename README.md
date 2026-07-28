
##  🎓 THIẾT KẾ VÀ XÂY DỰNG WEBSITE KIỂM TRA TRẮC NGHIỆM TRỰC TUYẾN

## 🛠️ Công nghệ sử dụng

<a href="https://react.dev/" target="_blank">
    <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>
</a>

<a href="https://vitejs.dev/" target="_blank">
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
</a>

<a href="https://nodejs.org/" target="_blank">
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
</a>

<a href="https://expressjs.com/" target="_blank">
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white"/>
</a>

<a href="https://www.mongodb.com/" target="_blank">
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
</a>

<a href="https://axios-http.com/" target="_blank">
    <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white"/>
</a>

<a href="https://jwt.io/" target="_blank">
    <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
</a>

<a href="https://www.docker.com/" target="_blank">
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
</a>

<a href="https://git-scm.com/" target="_blank">
    <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white"/>
</a>

<a href="https://github.com/" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/>
</a>



---

## 🛠️ Công nghệ sử dụng

| Công nghệ | Vai trò |
|-----------|----------|
| ⚛️ ReactJS | Xây dựng giao diện người dùng |
| ⚡ Vite | Công cụ build Frontend |
| 🟢 Node.js | Phát triển Backend |
| 🚀 Express.js | Xây dựng RESTful API |
| 🍃 MongoDB | Cơ sở dữ liệu NoSQL |
| 📡 Axios | Giao tiếp giữa Frontend và Backend |
| 🔐 JWT | Xác thực người dùng |
| 🐳 Docker | Đóng gói và triển khai ứng dụng |
| 🌿 Git & GitHub | Quản lý mã nguồn |
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
