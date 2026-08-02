import { Outlet } from "react-router-dom";
import Sidebar from "../components/student/Sidebar";
import "../styles/Dashboard.css";

export default function StudentLayout() {
    return (
        <div className="page-shell">
            <Sidebar />
            <main className="dash-main">
                <Outlet />
            </main>
        </div>
    );
}