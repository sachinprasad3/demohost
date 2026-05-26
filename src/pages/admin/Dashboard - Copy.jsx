// src/pages/Dashboard.jsx
import React from "react";
import SummaryCards from "../../components/SummaryCards";
import ReportsPanel from "../../components/ReportsPanel";
import useStudentsData from "../../hooks/useStudentData";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard({
  // students = [],
  // user,
  onOpenInvoice,
  onCreateStudent,
}) {
  const {user} = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isStudent = user?.role === "PARENT";
const {students} = useStudentsData();
  return (
    <div className="mainpro">
      <div className="container">
        <h2>{isAdmin ? "Admin Dashboard" : "Student Dashboard"}</h2>        
        <SummaryCards students={students} /> 
        {isAdmin && ( 
            <div className="mt-4">
              <h6 className="fw-semibold text-secondary mb-2">
                Reports & Insights
              </h6> 
                <ReportsPanel students={students} />

            </div>

        )}
 
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
