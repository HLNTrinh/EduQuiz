import { useState } from "react";
import TeacherSidebar from "../components/teacher/TeacherSidebar";

export default function TeacherLayout({ children }) {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (

        <div className="teacher-layout">

            <TeacherSidebar
                open={sidebarOpen}
                setOpen={setSidebarOpen}
            />

            <main className="teacher-main">

                {children}

            </main>

        </div>

    );

}