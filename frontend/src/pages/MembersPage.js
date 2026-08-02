//import React, { useState, useMemo } from 'react';
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TeacherSidebar from "../components/teacher/TeacherSidebar";
import '../styles/Members.css';

export const MembersPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  
// Thêm useEffect để lấy danh sách lớp từ API
useEffect(() => {
  if (!user?._id) return;

  fetch(`http://localhost:8080/api/classes/teacher/${user._id}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        setClasses(data.data);

        if (data.data.length > 0) {
          setSelectedClass(data.data[0]);

          setStudents(data.data[0].students);
        }
      }
    })
    .catch(console.error);
}, [user]);

    const filteredStudents = useMemo(() => {
    const query = search.toLowerCase();

    return students.filter((student) =>
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.status.toLowerCase().includes(query)
    );
  }, [students, search]);

  return (
    <div className="dash-shell">
      {/* Sidebar component menu trái */}
        <TeacherSidebar />

      <main className="dash-main">
        <header className="dash-header dash-header--overview">
          <div>
            <p className="overview-badge">Quản lý thành viên</p>
            <h1 className="dash-greeting">Chào buổi sáng {user?.name ?? 'An'}!</h1>
            <p className="dash-subtitle">Hôm nay hãy kiểm tra danh sách lớp học và thành viên trong lớp.</p>
          </div>
          <div className="overview-actions">
            <button className="btn-outline" onClick={() => navigate('/teacher/exams')}>Tạo kiểm tra mới</button>
            <button className="btn-start" onClick={() => navigate('/teacher/questions')}>Thêm câu hỏi</button>
          </div>
        </header>

        <section className="members-hero-card">
          <div>
            <p className="overview-badge">Danh sách lớp phụ trách</p>
            <h2>Lớp học đang quản lý</h2>
            <p>Hiện tại bạn đang phụ trách {classes.length} lớp với tổng số {classes.reduce((sum, item) => sum + item.students.length, 0)} học sinh.</p>
          </div>
          <div className="hero-stat">
            <div className="stat-card stat-card--primary" style={{ padding: '20px 24px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)' }}>
              <p className="stat-card-label" style={{ color: 'rgba(255,255,255,0.88)' }}>Lớp đang quản lý</p>
              <p className="stat-card-value" style={{ color: 'white' }}>{classes.length}</p>
            </div>
            <div className="stat-card" style={{ padding: '20px 24px', borderRadius: '20px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <p className="stat-card-label" style={{ color: 'rgba(255,255,255,0.88)' }}>Học sinh hiện tại</p>
              <p className="stat-card-value" style={{ color: 'white' }}>{classes.reduce((sum, item) => sum + item.students.length, 0)}</p>
            </div>
          </div>
        </section>

        <section className="members-card-section">
          <div className="members-section-heading">
            <div>
              <h2 className="panel-title">Danh sách lớp</h2>
              <p className="panel-subtitle">Xem nhanh lớp học và số lượng học sinh</p>
            </div>
            <button className="btn-outline" onClick={() => navigate('/teacher/exams')}>Xem tất cả lớp</button>
          </div>

          <div className="members-card-grid">
            {classes.map((item) => (
              <div className="members-card" key={item._id}>
                <div className="class-card-header">
                  <div>
                    <p className="class-card-title">{item.name}</p>
                    <p className="class-card-subtitle">Môn: {item.subject}</p>
                  </div>
                  <button className="btn-outline" onClick={() => { setSelectedClass(item); setStudents(item.students);}} >
    Xem học sinh
</button>
                </div>
                <p className="class-card-meta">{item.students?.length || 0} học sinh</p>
                <div className="summary-score-row" style={{ background: 'rgba(47, 111, 235, 0.08)', padding: '16px', borderRadius: '20px' }}>
                  <div>
                    <p className="summary-score-value" style={{ color: '#1f4ec5' }}>{item.progress}%</p>
                    <p className="summary-score-note">Tiến độ hoàn thành</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="members-table-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title"> Danh sách học sinh: {selectedClass?.name}</h2>
              <p className="panel-subtitle">Hiển thị thông tin cơ bản của tất cả học sinh trong lớp.</p>
            </div>
            <div className="members-search-group">
              <input
                type="text"
                placeholder="Tìm học sinh..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn-outline">Bộ lọc</button>
            </div>
          </div>

          <table className="members-table">
            <thead>
              <tr>
                <th>Mã học sinh</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td>{student._id}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>
                  <span className={`status-pill ${ student.status === "active" ? "status-pill--active": "status-pill--inactive"}`}>
                      {student.status}
                  </span>
                  </td>
                  <td>
                    <button className="btn-outline" onClick={() => alert(`Xem ${student.name}`)}>Xem</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="members-table-footer">
            <span>Hiển thị 1-4 trong số {filteredStudents.length} học sinh</span>
            <div>
              <button className="btn-outline">1</button>
              <button className="btn-outline">2</button>
              <button className="btn-outline">3</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
