


import { useEffect, useState } from "react";
import { Outlet, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StudentRoutes from "../Routes/StudentRoutes";
import TeacherRoutes from "../Routes/TeacherRoutes";
import AdminRoutes from "../Routes/AdminRoutes";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BackHeader from "./BackHeader";
import BottomNav from "./BottomNav";
import PullToRefresh from "../components/PullToRefresh";

// import { AnimatePresence } from "framer-motion";
import { PageSlide } from "./PageSlide";
import { usePopup } from "../context/PopupContext";
import Popup from "./Popup";

function Layout({ logoUrl, setLogoUrl }) {
    const { pathname } = useLocation();
    const { user } = useAuth();
    const hideLayout = pathname === "/login";

    const [sidebarOpen, setSidebarOpen] = useState(false);
    // const [studentsData, setStudentsData] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const { isOpen,popupConfig, closePopup } = usePopup();
    const API_URL = import.meta.env.VITE_API_URL;

    const hideBackHeader =
        pathname === "/admin/dashboard" ||
        pathname === "/student/dashboard" ||
        pathname === "/teacher/dashboard";

    // Fetch students data for admin
    // useEffect(() => {
    //     if (user?.role === "ADMIN") {
    //         fetch(`${API_URL}/students`)
    //             .then((res) => res.json())
    //             .then((data) => setStudentsData(Array.isArray(data) ? data : []))
    //             .catch(() => setStudentsData([]));
    //     }
    // }, [user]);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Role-based page rendering
    const renderRoleRoutes = () => {
        if (!user) return null;
        const role = user.role.toUpperCase(); // normalize roles
        if (role === "PARENT") return <StudentRoutes />;
        if (role === "ADMIN") return <AdminRoutes />;
        if (role === "TEACHER") return <TeacherRoutes />;
        return null;
    };

    return (
        <div>
            {!hideLayout && (
                <Sidebar
                    user={user}
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    logoUrl={logoUrl}
                />
            )}

            <div className="maincontainer">
                {!hideLayout &&
                    (pathname === "/admin/dashboard" ||
                        pathname === "/student/dashboard" ||
                        pathname === "/teacher/dashboard") && (
                        <Topbar
                            user={user}
                            onMenuClick={() => setSidebarOpen(true)}
                            logoUrl={logoUrl}
                        />
                    )}

                {!hideBackHeader && <BackHeader logoUrl={logoUrl} />}


                <div className={`mainbody ${isMobile ? "mobile" : "desktop"}`}>
  {/* <AnimatePresence mode="wait"></AnimatePresence> */}
    <PageSlide key={pathname}>
      <PullToRefresh disabled={!isMobile}>
        <Outlet />
      </PullToRefresh>
    </PageSlide>

</div>

            </div>
            <div id="popup-root"></div>

            {!hideLayout && <BottomNav user={user} logoUrl={logoUrl} onClose={()=> setSidebarOpen(false)} />}
        </div>
    );
}

export default Layout;
