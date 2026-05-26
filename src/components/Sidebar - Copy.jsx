import React, { useContext, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../css/Sidebar.css";
import { LogoContext } from "../context/LogoContext";
import { useAuth } from "../context/AuthContext";
import { useStudent } from "../context/StudentContext";
import { ChevronRight } from "lucide-react";

export default function Sidebar({ open, onClose }) {
  const logoCtx = useContext(LogoContext);
  // const logoUrl = logoCtx?.logoUrl || "/images/default-logo.png";
  const { logoUrl } = useContext(LogoContext);
  // console.log("Active logoUrl:", logoUrl);
  const { user } = useAuth();
  const { activeStudent } = useStudent();
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    document.body.classList.toggle("no-scroll", open);
    return () => document.body.classList.remove("no-scroll");
  }, [open]);

  /* ================= MENU DATA ================= */


  const adminItems = [
    { id: "admin-dashboard", label: "Dashboard", path: "/admin/dashboard" },
    { id: "parents", label: "Parents", path: "/admin/all-parents" },
    { id: "payments", label: "Payments", path: "/admin/payment-history" },
    { id: "students", label: "Students", path: "/admin/students" },


    {
      id: "attendance", label: "Attendance", path: "/admin/attendance",
      children: [
        // {
        //   id: "markAttendance",
        //   label: "Mark Attendance",
        //   path: "/admin/mark-attendance"
        // },
        {
          id: "attendanceHistory",
          label: "Attendance History",
          path: "/admin/attendance-History"
        },
      ]
    },
    {
      id: 'academic', label: 'Academic', children: [
        { id: "academic-year", label: "Add Year", path: "/admin/academic-year", },
        { id: "academic-term", label: "Add Term", path: "/admin/academic-term", },
      ]
    },

    {
      id: "addfees", label: "Class & Fees",
      children: [
        {
          id: "classes",
          label: "Class Fees List",
          path: "/admin/class-fees",
        },
        {
          id: "add-teacher",
          label: "Add Class & Fees",
          path: "/admin/add-new-class",
        },

      ]
    },
    {
      id: "teachers", label: "Teachers", children: [
        { id: "add-teacher", label: "Add Teacher", path: "/admin/add-teacher", },
        { id: "teachers", label: "Teacher List", path: "/admin/teachers", },
      ]
    },
    {
      id: 'subject', label: 'Subject',
      children: [
        { id: "subjects", label: "Add Subjects", path: "/admin/subjects", },
        { id: "text-books", label: "Add Text Books", path: "/admin/text-books", },
        { id: "themes", label: "Add Themes", path: "/admin/themes", },
      ]
    },

    {
      id: "teachingplan", label: "Templates",
      children: [
        { id: "create-super-syllabus", label: "Add Super Syllabus", path: "/admin/create-super-syllabus" }, 
        { id: "addtemplate", label: "Add Template", path: "/admin/add-template" }, 
         { id: "viewtemplate", label: "View Template", path: "/admin/view-template" },  
      ],
    },

    {
      id: "academicplan", label: "Academic Plan",
      children: [ 
        { id: "create-syllabus", label: "Add Syllabus", path: "/admin/create-syllabus" },
        { id: "syllabus-list", label: "Syllabus List", path: "/admin/syllabus-list" },
        { id: "addacademicplan", label: "Add Academic Plan", path: "/admin/add-academic-plan" }, 
         { id: "viewacademicplan", label: "View Academic Plan", path: "/admin/view-academic-plan" }, 
      ],
    },







    // {id:"syllabus", label: "Syllabus Topics",
    //   children: [
    //     { id: "add-topic", label: "Add Topic", path: "/admin/add-topic" },
    //     { id: "topic-list", label: "Topic List", path: "/admin/topic-list" },
    //   ],
    // },
    // {id: "lesson-plan-list", label: "Lesson Plan",
    //   children: [
    //     { id: "add-lesson-plan", label: "Add lesson Plan", path: "/admin/add-lesson-plan" },
    //     { id: "lesson-plan-list", label: "Lesson Plan List", path: "/admin/lesson-plan-list" },
    //   ],
    // },
    // {id: "daily-activities", label: "Daily Activities",
    //   children: [
    //     { id: "daily-activities", label: "Add Daily Activity", path: "/admin/daily-activities" },
    //     { id: "daily-activities-list", label: "Daily Activities List", path: "/admin/daily-activities-list" },
    //   ],
    // },    
    {id: "homework", label:"Homework",
      children: [
        // {id:"add-homework", label: "Add Homework", path: "/admin/add-homework", },
        // {id:"homework-list", label: "Homework List", path: "/admin/homework-list", },
        {
          id: "homework-forwarded",
          label: "Forwarded Homework",
          path: "/admin/forwarded-homework-list",
        },
        // {id:"homework-audio-list", label: "Audio Work List", path: "/admin/HomeWorkList" },
      ]
    },
    { id: "monthly-plan-list", label: "Monthly Plan", path: "/admin/monthly-plan-list" },

    { id: "events", label: "Events", path: "/admin/add-event" },
    { id: "enquiry", label: "Enquiries", path: "/admin/enquiries" },

    { id: "whatsapp", label: "Link Whats app", path: "/admin/link-whats-app" },






    // { id: "theme", label: "Theme Color", path: "/admin/theme-setting" },
  ];

  const teacherItems = [
    { id: "teacher-dashboard", label: "Dashboard", path: "/teacher/dashboard" },
    { id: "teacher-profile", label: "Profile", path: "/teacher/profile" },
    // { id: "student-attendence", label: "Attendence", path: "/teacher/mark-attendence" },
    {
      id: "student-attendence", label: "Attendance",
      children: [
        {
          id: "markAttendance",
          label: "Mark Attendance",
          path: "/teacher/mark-attendance"
        },
        {
          id: "attendanceHistory",
          label: "Attendance History",
          path: "/teacher/attendance-History"
        },
      ]
    },
    { id: "viewplan", label: "Teaching Plan", path: "/teacher/view-planner" },
    // { id: "daily-activity-upload", label: "Daily Activity Upload", path: "/teacher/daily-activity-upload" },
    // { id: "activities-list", label: "Activity List", path: "/teacher/activities-list" },
    { id: "homework-list", label: "Homework List", path: "/teacher/homework-list", },
    { id: "allotted-homework", label: "Allotted Homework", path: "/teacher/allotted-homework", },
    { id: "events", label: "Events", path: "/teacher/events" },
  ];
  const admittedStudentItems = [
    { id: "dashboard", label: "Dashboard", path: "/student/dashboard" },
    { id: "profile", label: "Profile", path: "/student/profile" },
    // { id: "timetable", label: "Timetable", path: "/student/timetable" },
    { id: "syllabus", label: "Syllabus", path: "/student/syllabus" },
    // { id: "assignments", label: "Assignments", path: "/student/assignments" },
    { id: "fees", label: "Fees", path: "/student/fees" },
    { id: "events", label: "Events", path: "/student/events" },
    { id: "homework", label: "Homework", path: "/student/homework-list" },
    // { id: "teachers", label: "Teachers", path: "/student/teachers" },
  ];
  const nonAdmittedStudentItems = [
    { id: "dashboard", label: "Dashboard", path: "/student/dashboard" },
    // { id: "profile", label: "Profile", path: "/student/profile" },
    // { id: "timetable", label: "Timetable", path: "/student/timetable" },
    // { id: "syllabus", label: "Syllabus", path: "/student/syllabus" },
    // { id: "assignments", label: "Assignments", path: "/student/assignments" },
    // { id: "fees", label: "Fees", path: "/student/fees" },
    { id: "events", label: "Events", path: "/student/events" },
    // { id: "teachers", label: "Teachers", path: "/student/teachers" },
    // { id: "admission-form-view", label: "Admission Form View", path: "/student/admission-form-view" },
    //  {id:"apply-for-admission", label: "Apply for admission",  path: "/student/admission-form" },
  ];



  let menuItems = [];
  if (user?.role === "PARENT") {
    menuItems = activeStudent?.status === "ADMITTED"
      ? admittedStudentItems
      : nonAdmittedStudentItems;
  } else if (user?.role === "ADMIN") {
    menuItems = adminItems;
  } else {
    menuItems = teacherItems;
  }

  const MenuItem = ({ item, level = 0, onClose }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.id];
    const isChildActive = item.children?.some(
      (child) => location.pathname === child.path
    );

    return (
      <li className={`menu-item level-${level} ${isOpen || isChildActive ? "active" : ""}`}>
        {hasChildren ? (
          <>
            <div className="menu-link submenu-toggle" onClick={() => toggleMenu(item.id)}>
              <span>{item.label}</span>
              <span className={`arrow ${isOpen || isChildActive ? "open" : ""}`}>
                <ChevronRight size={16} />
              </span>
            </div>
            {(isOpen || isChildActive) && (
              <ul className="submenu">
                {item.children.map((child) => (
                  <MenuItem key={child.id} item={child} level={level + 1} onClose={onClose} />
                ))}
              </ul>
            )}
          </>
        ) : (
          <NavLink
            to={item.path}
            className="menu-link"
            onClick={() => {
              toggleMenu(item.id);
              onClose();
            }}
          >
            <span>{item.label}</span>
          </NavLink>
        )}
      </li>
    );
  };

  return (
    <>
      <div className={`sidebar-overlay ${open ? "show" : ""}`} onClick={onClose}></div>

      <aside className={`sidebar-drawer ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="user-info">
            <div className="avatar">{user?.name?.charAt(0) || "U"}</div>
            <div>
              <h4>{user?.name || "User"}</h4>
              <p>{user?.role === "PARENT" ? "Student" : user?.role === "TEACHER" ? "Teacher" : "Admin"}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <nav className="sidebar-menu">
          <ul>{menuItems.map((item) => <MenuItem key={item.id} item={item} onClose={onClose} />)}</ul>
        </nav>
      </aside>

      <aside className="desktop-sidebar">
        <div className="userinfo">
          <img src={logoUrl || "/images/default-logo.png"} alt="Logo" />
        </div>
        <nav className="sidebar-menu">
          <ul>{menuItems.map((item) => <MenuItem key={item.id} item={item} onClose={onClose} />)}</ul>
        </nav>
      </aside>
    </>
  );
}

