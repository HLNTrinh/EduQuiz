import { useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa6";
import { getNotifications } from "../../services/adminService";
import "./Notification.css";

const NotificationDropdown = () => {
    const dropdownRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {

            const response = await getNotifications({
                page: 1,
                limit: 10,
            });

            setNotifications(response.notifications || []);

        } catch (err) {
            console.error("Lỗi lấy thông báo", err);
            setNotifications([]);
        }
    };

    return (
        <div className="notification-dropdown-wrapper" ref={dropdownRef}>
            <button
                type="button"
                className={`navbar-icon-btn ${open ? "navbar-icon-btn-active" : ""}`}
                onClick={() => setOpen(prev => !prev)}
            >
                <FaBell size={18} />

                {notifications.length > 0 && (
                    <span className="navbar-badge">
                        {notifications.length}
                    </span>
                )}
            </button>

            {open && (
                <div className="notification-popup-panel">
                    <div className="notification-popup-header">
                        <h3>Thông báo</h3>
                        <span>{notifications.length} thông báo</span>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="notification-popup-list" style={{ padding: '18px' }}>
                            Chưa có thông báo
                        </div>
                    ) : (
                        <div className="notification-popup-list">
                            {notifications.map((item) => (
                                <div className="notification-popup-item" key={item._id}>
                                    <div className="notification-icon">📢</div>
                                    <div className="notification-content">
                                        <h4>{item.title}</h4>
                                        <p>{item.content}</p>
                                        <span>{new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;