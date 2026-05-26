// components/SummaryCards.jsx
import React from "react";
import { formatINR, getCurrentAcademicYear } from "../utils";
import { Users, IndianRupee, CheckCircle, Clock } from "lucide-react";
import { useDashboardFinanceReport } from "../hooks/useDashboard";
import { useNavigate } from "react-router-dom";

export default function SummaryCards() {

  // const academicYear = getCurrentAcademicYear();
  const navigate = useNavigate();
  const { data: financedata, isLoading, error, } = useDashboardFinanceReport();

  const financeYear = financedata?.financeData?.currentAcademicYear;
  const totalStudents = financeYear?.totalStudents ?? 0;
  const totalFee = financeYear?.totalFee ?? 0;
  const totalCollected = financeYear?.collected ?? 0;
  const totalPending = financeYear?.pending ?? 0;

  return (
    <ul>
      <li>
        <div className="adminsection1">
          <div className="admincards" onClick={() => navigate("/admin/students")}>
            <div className="admin-cardbody">
              <h6>Total Students</h6>
              <div className="data-icon">
                <h4 className="present">{totalStudents}</h4>
                <span className="icon-box">
                  <Users />
                </span>
              </div>
              <small className="card-subtext present">
                Active students
              </small>
            </div>
          </div>

          <div className="admincards">
            <div className="admin-cardbody">
              <h6>Total Fee</h6>
              <div className="data-icon">
                <h4 className="warning">{formatINR(totalFee)}</h4>
                <span className="icon-box">
                  <IndianRupee />
                </span>
              </div>
              <small className="card-subtext text-warning">
                Expected collection
              </small>
            </div>
          </div>

          <div className="admincards">
            <div className="admin-cardbody">
              <h6>Collected</h6>
              <div className="data-icon">
                <h4 className="present">{formatINR(totalCollected)}</h4>
                <span className="icon-box">
                  <CheckCircle />
                </span>
              </div>

              <small className="card-subtext present">
                Successfully received
              </small>
            </div>
          </div>

          <div className="admincards">
            <div className="admin-cardbody">
              <h6>Pending</h6>
              <div className="data-icon">
                <h4 className="absent">{formatINR(totalPending)}</h4>
                <span className="icon-box">
                  <Clock />
                </span>
              </div>

              <small className="card-subtext absent">
                Awaiting payment
              </small>
            </div>
          </div>
        </div>
      </li>
    </ul>
  );
}
