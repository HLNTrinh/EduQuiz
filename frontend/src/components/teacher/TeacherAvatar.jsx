import { useState, useEffect, useRef } from "react";
import { FiUser, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AvatarInitials from "../student/AvatarInitials";
import "./TeacherAvatar.css";

export default function TeacherAvatar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const close = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", close);

        return () => document.removeEventListener("mousedown", close);
    }, []);

    return (
        <div className="teacher-avatar-wrapper" ref={ref}>
            <button
                className="teacher-avatar-btn"
                onClick={() => setOpen(!open)}
            >
<div className="teacher-avatar-circle">
                    <AvatarInitials name={user?.name} size={46} />
                </div>
            </button>

            {open && (
                <div className="teacher-avatar-menu">

                    <div className="teacher-avatar-header">

<div className="teacher-avatar-large">
                            <AvatarInitials name={user?.name} size={48} />
                        </div>

                        <div>
                            <h3>{user?.name}</h3>
                            <span>Giáo viên</span>
                        </div>

                    </div>

                    <button
                        className="teacher-menu-item"
                        onClick={() => navigate("/teacher/profile")}
                    >
                        <FiUser />
                        Hồ sơ
                    </button>

                    <button
                        className="teacher-menu-item logout"
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                    >
                        <FiLogOut />
                        Đăng xuất
                    </button>

                </div>
            )}
        </div>
    );
}