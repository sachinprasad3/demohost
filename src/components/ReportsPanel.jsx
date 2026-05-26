// ReportsPanel.jsx
import React from "react";
import { formatINR } from "../utils";
import { Line, Pie, Bar } from "react-chartjs-2";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import TodaysAttendanceCard from "./AdminDashboard/TodaysAttendanceCard";
import { useDashboardFinanceReport } from "../hooks/useDashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function ReportsPanel() {

  // const isSingleSlide = students?.length === 1;

  const { data: financedata, isLoading, error, } = useDashboardFinanceReport();
  // console.log("finnace data rp", financedata)

  const classWiseData = financedata?.financeData?.currentAcademicYear?.classWise ?? [];

  const collectionTrend =
    financedata?.financeData?.collectionTrend ?? [];

  const ALL_CLASSES = [
    "Toddlers",
    "Nursery",
    "Junior KG",
    "Senior KG",
  ];

  const classColorMap = {
    Toddlers: "#f59e0b",
    Nursery: "#3b82f6",
    "Junior KG": "#14b8a6",
    "Senior KG": "#8b5cf6",
  };


  const monthlyChartData = React.useMemo(() => {
    if (collectionTrend.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = collectionTrend.map(m =>
      m.monthName.slice(0, 3)
    );

    const schoolDataset = {
      label: "School Total",
      data: collectionTrend.map(m => m.schoolTotal),
      borderColor: "#e53935",
      borderWidth: 3,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: "#e53935",
    };

    const classDatasets = ALL_CLASSES.map(className => ({
      label: className,
      data: collectionTrend.map(month => {
        const classEntry = month.classDetails.find(
          c => c.className === className
        );
        return classEntry ? classEntry.collectedAmount : 0;
      }),
      borderColor: classColorMap[className],
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 4,
    }));

    return {
      labels,
      datasets: [...classDatasets, schoolDataset],
    };
  }, [collectionTrend]);

  const hasMonthlyData =
    monthlyChartData.labels?.length > 0 &&
    monthlyChartData.datasets?.length > 0;

  return (
    <>
      <div className="report-container p-0">
        <ul>
          <li >
            <div className="whitebox chart-section">
              <h5>Month Wise Collection</h5>

              {isLoading ? (
                <div className="no-data">Loading chart...</div>
              ) : error ? (
                <div className="no-data error">
                  Failed to load data
                </div>
              ) : hasMonthlyData ? (
                <Line data={monthlyChartData} />
              ) : (
                <div className="no-data">
                  No collection data available
                </div>
              )}
            </div>

          </li>

          <li >
            <div className="whitebox chart-section pie">
              <TodaysAttendanceCard />
            </div>
          </li>

        </ul>
      </div>


      {classWiseData.length > 0 && (
        <div className="fee-slider">
          <h3>Class-wise Fee Collection</h3>

          <Swiper
            modules={[Pagination]}
            spaceBetween={10}
            breakpoints={{
              0: { slidesPerView: classWiseData.length === 1 ? 1 : 1.2 },
              576: { slidesPerView: 2.2 },
              992: { slidesPerView: 3 },
              1200: { slidesPerView: 4 },
            }}
          >
            {classWiseData.map((c) => {
              const percent =
                c.totalAmount > 0
                  ? Math.round((c.collectedAmount / c.totalAmount) * 100)
                  : 0;

              return (
                <>
                <SwiperSlide key={c.classId}>
                  <ul>
                    <li>
                      <div className="class-fee-card">
                        <h6 className="class-title">{c.className}</h6>

                        <div className="fee-row">
                          <span className="label">Total:</span>
                          <span className="fw-bold">
                            {formatINR(c.totalAmount)}
                          </span>
                        </div>

                        <div className="fee-row">
                          <span className="label">Collected:</span>
                          <span className="value success">
                            {formatINR(c.collectedAmount)}
                          </span>
                        </div>

                        <div className="fee-row">
                          <span className="label">Pending:</span>
                          <span className="value danger">
                            {formatINR(c.pendingAmount)}
                          </span>
                        </div>

                        <div className="progress-wrapper">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <small className="progress-text">
                            {percent}% collected
                          </small>
                        </div>
                      </div>
                    </li>
                  </ul>
                </SwiperSlide>
                </>
              );
            })}
          </Swiper>
        </div>
      )}

    </>
  );
}
