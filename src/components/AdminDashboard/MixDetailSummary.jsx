// components/SummaryCards.jsx
import React from "react";
import {
  Users,
  UserCheck,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { useDashboardBirthdayReport, useDashboardFinanceReport } from "../../hooks/useDashboard";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MixDetailSummary() {
    const { user } = useAuth();
     const isAdmin = user?.role === "ADMIN";
     const navigate = useNavigate();
  // const academicYear = getCurrentAcademicYear();
  const { data: birthdayData = {} } = useDashboardBirthdayReport();
   const { data: financedata, isLoading, error, } = useDashboardFinanceReport();
     const financeYear = financedata?.financeData?.currentAcademicYear;
     const totalStudents = financeYear?.totalStudents ?? 0;
  // console.log("birthday data ", birthdayData)

  const totalteacherFromBirthday = birthdayData?.totalTeacher ?? 0;
  const newadmissionFromBirthday = birthdayData?.newAdmission ?? 0;
  const totalenquiryFromBirthday = birthdayData?.totalEnquiry ?? 0;
  const totalMaleFromBirthday = birthdayData?.totalMale ?? 0;
  const totalFemaleFromBirthday = birthdayData?.totalFemale ?? 0;

  return (
    <ul>
      <li>
        <div className="adminsection2">
          <div className={`admincards ${isAdmin && "adminbox"}`}>
            {isAdmin && (
          <div className="admincards">
                  <div className="admin-cardbody" onClick={() => navigate("/admin/students")}>
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
               ) }
                
          <div className="admincards purple">
            <div className="admin-cardbody" onClick={() => navigate("/admin/teachers")}>
              <h6>Total Teachers</h6>

              <div className="data-icon">
                <h4 className="present">{totalteacherFromBirthday}</h4>
                <span className="icon-box">
                  <Users />
                </span>
              </div>

              <small className="card-subtext present">
                present today
              </small>
            </div>
          </div>
          </div>
          <div className="admincards red">
            <div className="admin-cardbody" onClick={() => navigate("/admin/today-enquiries?filter=today")}>
              <h6>Today's Enquiry</h6>

              <div className="data-icon">
                <h4 className="absent">{totalenquiryFromBirthday}</h4>
                <span className="icon-box">
                  <HelpCircle />
                </span>
              </div>

              <small className="card-subtext absent">
                This year
              </small>
            </div>
          </div>


          <div className="admincards blue">
            <div className="admin-cardbody" onClick={() => navigate("/admin/students")}>
              <h6>New Admissions</h6>

              <div className="data-icon">
                <h4 className="present">{newadmissionFromBirthday}</h4>
                <span className="icon-box">
                  <TrendingUp />
                </span>
              </div>

              <small className="card-subtext present">
                This month
              </small>
            </div>
          </div>
          <div className={`admincards green ${isAdmin && "boysgirl"}`}>
            <div className="admin-cardbody">
              <h6>Boys : Girls</h6>
              <div className="data-icon">
                <h4 className="present"> {totalMaleFromBirthday} : {totalFemaleFromBirthday}</h4>
                <span className="icon-box">
                  <Users />
                </span>
              </div>

              <small className="card-subtext present">
                Student present
              </small>
            </div>
          </div>
        </div>

      </li>
    </ul>
  );
}
