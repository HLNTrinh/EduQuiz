import { useMemo, useState, useEffect, useRef } from "react";
import { FiUser, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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

    const initials = useMemo(() => {
        if (!user?.name) return "GV";

        const words = user.name.trim().split(/\s+/);

        if (words.length === 1)
            return words[0][0].toUpperCase();

        return (
            words[0][0] +
            words[words.length - 1][0]
        ).toUpperCase();
    }, [user]);

    return (
        <div className="teacher-avatar-wrapper" ref={ref}>
            <button
                className="teacher-avatar-btn"
                onClick={() => setOpen(!open)}
            >
                <div className="teacher-avatar-circle">
                    {initials}
                </div>
            </button>

            {open && (
                <div className="teacher-avatar-menu">

                    <div className="teacher-avatar-header">

                        <div className="teacher-avatar-large">
                            {initials}
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