// BackHeader.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom"; 
import { ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
export default function BackHeader() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { enquiryId } = useParams();
const { logout } = useAuth();
  // ✅ Make it reactive
  const [enquiryName, setEnquiryName] = useState(
    sessionStorage.getItem("enquiryHeaderName") || ""
  );

  // 🔁 ADD 1: Sync on route change (VERY IMPORTANT)
  useEffect(() => {
    setEnquiryName(sessionStorage.getItem("enquiryHeaderName") || "");
  }, [pathname]);

  // 🔁 ADD 2: Listen to custom update event (same-tab updates)
  useEffect(() => {
    const syncName = () => {
      setEnquiryName(sessionStorage.getItem("enquiryHeaderName") || "");
    };

    window.addEventListener("enquiryHeaderUpdate", syncName);
    return () => window.removeEventListener("enquiryHeaderUpdate", syncName);
  }, []);

  // Hide on specific page
  if (pathname === "/student/dashboard") return null;

  // Static meta
  const pageMeta = {
    "/student/fee-structure": {
      title: "Fee Structure",
      subtitle: "Your monthly fee details",
    },
    "/students": {
      title: "All Students",
      subtitle: " ",
    },
    "/admin-events": {
      title: "Add Event",
      subtitle: " ",
    },
    "/student/admission-form-view": {
      title: "Admission Form",
      subtitle: "Student personal & academic details",
    },
    "/student/admission-enquiry": {
      title: "Admission Enquiry",
      subtitle: "Submit your admission related queries",
    },
    "/student/profile": {
      title: "Student Profile",
      subtitle: "Student Information Overview",
    },
    "/student/events": {
      title: "School Events",
      subtitle: "Upcoming programs & celebrations",
    },
    "/student/reports": {
      title: "Report Card",
      subtitle: "Your academic performance",
    },
    "/student/timetable": {
      title: "Weekly Timetable",
      subtitle: " ",
    },
  };

  let title = pageMeta[pathname]?.title;
  let subtitle = pageMeta[pathname]?.subtitle;

  // ✅ Enquiry detail page (ID + Name — LIVE)
  if (pathname.startsWith("/admin/enquiries/") && enquiryId) {
    title = `Enquiries #${enquiryId}`;
    subtitle = enquiryName;
  }

  if (!title) {
    title = pathname
      .split("/")
      .pop()
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <div className="back-header">
      <div className="d-flex gap-1">
        <button className="back-btn"
        onClick={() => {
    if (window?.history?.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }}
        >
        <ArrowLeft />
      </button>

      <div className="title-group">
        <h2 className="page-title">{title}</h2>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      </div>

      <div>
        <button className="btn" onClick={logout}>
                  <LogOut size={18} />{" "}
                  <span className="d-sm-inline">Logout</span>
                </button>
      </div>
    </div>
  );
}
