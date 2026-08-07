{/* Profile card */}
<div className="profile-card">
  <div className="profile-card-top">
    <AvatarInitials
      name={user?.name}
      avatar={user?.avatar}
      size={80}
    />
  </div>

  <div className="profile-card-body">
    <h3>{user?.name || "Học sinh"}</h3>
    <p>
      {studentClasses.length > 0
        ? studentClasses.map((c) => c.name).join(", ")
        : "Chưa có lớp"}
    </p>

    <div className="profile-stats">
      <div>
        <span className="profile-stat-label">XẾP HẠNG</span>
        <strong>#14</strong>
      </div>
      <div className="profile-stat-divider" />
      <div>
        <span className="profile-stat-label">HUY HIỆU</span>
        <strong>08</strong>
      </div>
    </div>

    <Link to="/student/profile" className="btn-profile-full">
      Xem hồ sơ đầy đủ
    </Link>
  </div>
</div>