// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import SummaryCards from "../../components/SummaryCards";
import ReportsPanel from "../../components/ReportsPanel";
import useStudentsData from "../../hooks/useStudentData";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utills/axiosInstance";
import MixDetailSummary from "../../components/AdminDashboard/MixDetailSummary";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import TeachingActivityCalendar from "../../components/AdminDashboard/TeachingActivityCalendar";
import TodaysAttendanceCard from "../../components/AdminDashboard/TodaysAttendanceCard";

export default function Dashboard() {
  const { user } = useAuth();

  const isOwner = user?.role === "OWNER";
  const isAdmin = user?.role === "ADMIN";
  const isStudent = user?.role === "PARENT";

  const [summary, setSummary] = useState({});
  const [classAmounts, setClassAmounts] = useState([]);

  /* ---------- OWNER: DASHBOARD SUMMARY ---------- */
  useEffect(() => {
    if (!isOwner) return;

    axiosInstance
      .get("/api/v1/dashboard/summary")
      .then(res => setSummary(res.data))
      .catch(err => console.error("Summary API error", err));
  }, [isOwner]);

  /* ---------- OWNER: CLASS AMOUNT REPORT ---------- */
  useEffect(() => {
    if (!isOwner) return;

    const fetchDashboardData = async () => {
      try {
        const res = await axiosInstance.get("/api/v1/dashboard/classamount");
        setClassAmounts(res.data || []);
      } catch (err) {
        console.error("Dashboard API error", err);
      }
    };

    fetchDashboardData();
  }, [isOwner]);

  return (
    <div className="mainpro">
      <div className="container">
        <h2>
          {isOwner
            ? "Owner Dashboard"
            : isAdmin
              ? "Admin Dashboard"
              : "Student Dashboard"}
        </h2>

        {/* OWNER FULL DASHBOARD */}
        {isOwner && (
          <div className="da-slider owner-view">
            <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={10}
                slidesPerView={1}
                pagination={{ clickable: true }}
                autoplay={{ delay: 3500, disableOnInteraction: false }}
                breakpoints={{
                  640: { slidesPerView: 1 },
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 2 },
                }}
              >
              <SwiperSlide>
                <SummaryCards summary={summary} />
              </SwiperSlide>
              <SwiperSlide>
                <MixDetailSummary />
              </SwiperSlide>
            </Swiper>

            <ReportsPanel />
            <TeachingActivityCalendar />
          </div>
        )}

        {/* ADMIN LIMITED DASHBOARD */}
        {isAdmin && (
          <div className="da-slider">
            <Swiper modules={[Pagination, Autoplay]}>
              <SwiperSlide>
                <MixDetailSummary />
              </SwiperSlide>
            </Swiper>
             <div className="whitebox">
              <TodaysAttendanceCard />
             </div>

            <TeachingActivityCalendar />
          </div>
        )}

        {/* STUDENT DASHBOARD */}
        {isStudent && (
          <div className="mt-4">
            <div className="card shadow-sm rounded-3 border-0">
              <h6 className="fw-semibold text-secondary mb-3">
                Welcome back, {user?.name} 👋
              </h6>
              <p className="text-muted mb-2">
                Here's your current fee summary and academic overview.
              </p>

              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <strong>Total Fee:</strong>{" "}
                  ₹{user?.totalFee ? user.totalFee.toLocaleString() : "N/A"}
                </li>
                <li className="list-group-item">
                  <strong>Paid Amount:</strong>{" "}

                  ₹{user?.paid ? user.paid.toLocaleString() : "N/A"}
                </li>
                <li className="list-group-item">
                  <strong>Balance:</strong>{" "}
                  ₹
                  {user?.totalFee && user?.paid
                    ? (user.totalFee - user.paid).toLocaleString()
                    : "N/A"}
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
