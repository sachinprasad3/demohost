// src/components/BottomNav.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  User,
  Wallet2, NotebookPen,
  CalendarDays,
  ReceiptIndianRupee,
  Users,
} from "lucide-react";
import { useStudent } from "../context/StudentContext";

export default function BottomNav({ user, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeStudent } = useStudent()

  const role = (location.pathname.startsWith("/admin") ? "admin" : location.pathname.startsWith("/teacher") ? "teacher" : "student");

  const filterByRole = (items, role) =>
    items.filter(item => {
      if (!item.allowedRoles) return true;
      return item.allowedRoles.includes(role);
    });


  const navItems = {
    admin: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <Home size={20} />,
        path: "/admin/dashboard",
      },
      {
        id: "students",
        label: "Students",
        icon: <User size={20} />,
        path: "/admin/students",
      },
      {
        id: "all-parents",
        label: "Parents",
        icon: <Users size={20} />,
        path: "/admin/all-parents",
        allowedRoles: ["ADMIN"],
      },
      {
        id: "events",
        label: "Events",
        icon: <CalendarDays size={20} />,
        path: "/admin/add-event",
      },
      {
        id: "payments",
        label: "Payments",
        icon: <Wallet2 size={20} />,
        path: "/admin/payment-history",
        allowedRoles: ["OWNER"],
      },
    ],
    teacher: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <Home size={20} />,
        path: "/teacher/dashboard",
      },
      // {
      //   id: "students",
      //   label: "Activity",
      //   icon: <User size={20} />,
      //   path: "/teacher/daily-activity-upload",
      // },
      {
        id: "events",
        label: "Events",
        icon: <CalendarDays size={20} />,
        path: "/teacher/events"
      },
      {
        id: "profile",
        label: "Profile",
        icon: <User size={20} />,
        path: "/teacher/profile",
      },
      {
        id: "homework",
        label: "Homework",
        icon: <NotebookPen size={20} />,
        path: "/teacher/homework-list",
      },
    ],
    student: {
      admittedStudentItems: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: <Home size={20} />,
          path: "/student/dashboard",
        },
        {
          id: "events",
          label: "Events",
          icon: <CalendarDays size={20} />,
          path: "/student/events",
        },
        {
          id: "fees",
          label: "Fees",
          icon: <ReceiptIndianRupee size={20} />,
          path: "/student/fees",
        },
        {
          id: "profile",
          label: "Profile",
          icon: <User size={20} />,
          path: "/student/profile",
        },
      ],
      nonAdmittedStudentItems: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: <Home size={20} />,
          path: "/student/dashboard",
        },
        {
          id: "events",
          label: "Events",
          icon: <CalendarDays size={20} />,
          path: "/student/events",
        },
      ],
      inActiveStudentItems: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: <Home size={20} />,
          path: "/student/dashboard",
        },
      ]
    },
  };

  // let items = [];
  // if (user?.role === "PARENT") {
  //   if (activeStudent?.status === "ADMITTED") {
  //     items = navItems.student?.admittedStudentItems;
  //   } else {
  //     items = navItems.student.nonAdmittedStudentItems;
  //   }
  // } else if (user?.role === "ADMIN") {
  //   items = navItems.admin;
  // } else {
  //   items = navItems.teacher;
  // }
  let items = [];

  if (user?.role === "PARENT") {
    items =
      activeStudent?.data?.status === "INACTIVE" ? navItems.student.inActiveStudentItems : activeStudent?.status === "ADMITTED"
        ? navItems.student.admittedStudentItems
        : navItems.student.nonAdmittedStudentItems;
  }
  else if (user?.role === "ADMIN" || user?.role === "OWNER") {
    items = filterByRole(navItems.admin, user.role);
  }
  else if (user?.role === "TEACHER") {
    items = navItems.teacher;
  }
  // const items = navItems[role] || [];

  return (
    <nav className="bottom-nav ">
      <div className="bottom-nav-separator">
        {items.map((it) => {
          const isActive =
            location.pathname === it.path ||
            location.pathname.startsWith(it.path + "/");

          return (
            <button
              key={it.id}
              type="button"
              onClick={() => { navigate(it.path); onClose() }}
              className={`flex-fill btn py-2 ${isActive ? "text-primary" : "text-secondary"
                }`}
            >
              <div className="d-flex flex-column align-items-center">
                {it.icon}
                <span className="small mt-1">{it.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
