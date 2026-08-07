<div className="profile-info-top">
  <div className="avatar-wrap">
    <AvatarInitials
      name={profileData.name}
      avatar={profileData.avatar}
      size={96}
    />
    <button
      className="avatar-edit"
      onClick={handleAvatarUpload}
      title="Thay đổi ảnh đại diện"
    >
      <CameraIcon />
    </button>
  </div>

  <div className="profile-name-block">
    <h2>{profileData.name}</h2>
    <div className="badges">
      <span className="role-badge">
        {ROLE_BADGE[user?.role] || 'HỌC SINH'}
      </span>
      <span className="status-dot" /> Hoạt động
    </div>
    <button
      className="btn-primary"
      onClick={() => {
        setIsEditing(true);
        setEditName(profileData.name);
        setEditPhone(profileData.phone);
      }}
    >
      <EditIcon /> Cập nhật thông tin
    </button>
  </div>
</div>