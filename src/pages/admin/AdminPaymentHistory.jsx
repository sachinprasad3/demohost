import React, { useState, useEffect } from "react";
import { usePopup } from "../../context/PopupContext";
import FeeReceiptPopup from "../../components/FeeReceiptPopup";
import { Check, Eye, X, Loader2, Search } from "lucide-react"; 
import axiosInstance from "../../utills/axiosInstance";
import { useNavigate } from "react-router-dom";
import SearchPanel from "../../components/SearchPanel";

export default function AdminPaymentHistory() {
  const { openPopup, activeModal, closePopup } = usePopup();
  const navigate = useNavigate();
  
  // --- STATE ---
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [academicYear, setAcademicYear] = useState(""); 
  const [academicYearList, setAcademicYearList] = useState([]);
  const [activeTab, setActiveTab] = useState("monthly"); 
  const [selectedClass, setSelectedClass] = useState("");

  // --- SEARCH & FILTER STATE ---
  const [inputValue, setInputValue] = useState(""); 
  const [searchKey, setSearchKey] = useState("");   
  const [classList, setClassList] = useState([]);   

  // For Popups
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  // --- CONSTANTS ---
  const PLAN_TYPE_MAP = {
    monthly: "MONTHLY",
    quarterly: "QUARTERLY",
    "half-yearly": "HALF-YEARLY",
    yearly: "ANNUALLY"
  };

  const MONTH_MAP = [
    { ui: "Apr", api: "April" }, { ui: "May", api: "May" }, { ui: "Jun", api: "June" },
    { ui: "Jul", api: "July" }, { ui: "Aug", api: "August" }, { ui: "Sep", api: "September" },
    { ui: "Oct", api: "October" }, { ui: "Nov", api: "November" }, { ui: "Dec", api: "December" },
    { ui: "Jan", api: "January" }, { ui: "Feb", api: "February" }, { ui: "Mar", api: "March" },
  ];

  const QUARTER_MAP = [
    { ui: "Q1", api: "QTR-1" }, { ui: "Q2", api: "QTR-2" }, 
    { ui: "Q3", api: "QTR-3" }, { ui: "Q4", api: "QTR-4" }
  ];

  const HALF_YEAR_MAP = [
    { ui: "H1", api: "H1" }, { ui: "H2", api: "H2" }
  ];

  const COVERAGE_MAP = {
    "January":   ["Qtr-4", "QTR-4", "H2", "Full-Year"],
    "February":  ["Qtr-4", "QTR-4", "H2", "Full-Year"],
    "March":     ["Qtr-4", "QTR-4", "H2", "Full-Year"],
    "April":     ["Qtr-1", "QTR-1", "H1", "Full-Year"],
    "May":       ["Qtr-1", "QTR-1", "H1", "Full-Year"],
    "June":      ["Qtr-1", "QTR-1", "H1", "Full-Year"],
    "July":      ["Qtr-2", "QTR-2", "H1", "Full-Year"],
    "August":    ["Qtr-2", "QTR-2", "H1", "Full-Year"],
    "September": ["Qtr-2", "QTR-2", "H1", "Full-Year"],
    "October":   ["Qtr-3", "QTR-3", "H2", "Full-Year"],
    "November":  ["Qtr-3", "QTR-3", "H2", "Full-Year"],
    "December":  ["Qtr-3", "QTR-3", "H2", "Full-Year"],
    "QTR-1": ["H1", "Full-Year"],
    "QTR-2": ["H1", "Full-Year"],
    "QTR-3": ["H2", "Full-Year"],
    "QTR-4": ["H2", "Full-Year"],
  };

  // 1. FETCH ACADEMIC YEARS ON MOUNT
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await axiosInstance.get("/api/academicYear");
        const years = res.data || [];
        setAcademicYearList(years);
        if (years.length > 0) {
          setAcademicYear(years[0].academicYear);
        }
      } catch (error) {
        console.error("Error fetching academic years", error);
      }
    };
    fetchYears();
  }, []);

  // 2. FETCH CLASSES BASED ON ACADEMIC YEAR
  useEffect(() => {
    const fetchClasses = async () => {
      if (!academicYear) {
        setClassList([]);
        return;
      }
      try {
        const response = await axiosInstance.get(`/api/v1/class/getAllClassesByAcademicYear?academicYear=${academicYear}`);
        if (response.data.status === "Success") {
          setClassList(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, [academicYear]);

  // 3. FINANCIAL DATA FETCH
  useEffect(() => {
    if (academicYear) fetchFinancialData();
  }, [academicYear, activeTab, searchKey, selectedClass]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/v1/finance/data", {
        params: {
          academicYear: academicYear,
          feePlanType: PLAN_TYPE_MAP[activeTab],
          searchKey: searchKey || null,
          classId: selectedClass || null,
          page: 0,
          size: 50
        }
      });
      if (response.data.status === "Success") {
        setStudents(response.data.data.students || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleSearch = () => { setSearchKey(inputValue); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); }; 
  const handleClearSearch = () => { setInputValue(""); setSelectedClass(""); setSearchKey(""); }; 
  const handleClassSelect = (e) => {
  const val = e.target.value;
  setSelectedClass(val);
};
 
  const getPaymentInfo = (student, targetPeriod) => {
    const payments = student.recurringPaymentsReceived || [];
    return payments.find(p => {
      const paidPeriod = p.billingPeriod; 
      if (paidPeriod && paidPeriod.toUpperCase() === targetPeriod.toUpperCase()) return true;
      const coveredBy = COVERAGE_MAP[targetPeriod]; 
      if (coveredBy && coveredBy.includes(paidPeriod)) return true;
      return false;
    });
  };

  const handleOpenDetail = (student, periodApiName, modalType) => {
    const actualPayment = getPaymentInfo(student, periodApiName);
    setSelectedStudent(student);
    setSelectedPeriod(actualPayment ? actualPayment.billingPeriod : periodApiName);
    openPopup(modalType);
  };

  const handleNavigateToFees = (studentId, year) => {
    navigate(`/admin/payment-details?studentId=${studentId}&academicYear=${year}`);
  };

  return (
    <div className="mainpro">
      <div className="container"> 
        <div className="whitebox">
          <h4>Search</h4>
          <SearchPanel type="simple"
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleKeyDown={handleKeyDown}
            handleSearch={handleSearch}
            handleClearSearch={handleClearSearch}
            classList={classList}
            academicYear={academicYear}
            setAcademicYear={setAcademicYear}
            academicYearList={academicYearList}
            handleClassSelect={handleClassSelect}
            selectedClass={selectedClass}
          />
        </div> 

        <div className="tabs">
          <button className={activeTab === "monthly" ? "tab activeTab" : "tab"} onClick={() => setActiveTab("monthly")}>Monthly</button>
          <button className={activeTab === "quarterly" ? "tab activeTab" : "tab"} onClick={() => setActiveTab("quarterly")}>Quarterly</button>
          <button className={activeTab === "half-yearly" ? "tab activeTab" : "tab"} onClick={() => setActiveTab("half-yearly")}>Half-Yearly</button>
          <button className={activeTab === "yearly" ? "tab activeTab" : "tab"} onClick={() => setActiveTab("yearly")}>Yearly</button>
        </div>

        <div className="listsec syllabus-master">
          {!loading && students.length > 0 && (
          <div className="theading paymentbox listbox ">
            <div>S.No</div><div>Roll</div><div>Name</div><div>Class</div><div>Contact</div>
            {activeTab === "monthly" && MONTH_MAP.map(m => <div key={m.ui} className="monthly-heading">{m.ui}</div>)}
            {activeTab === "quarterly" && QUARTER_MAP.map(q => <div key={q.ui}>{q.ui}</div>)}
            {activeTab === "half-yearly" && HALF_YEAR_MAP.map(h => <div key={h.ui}>{h.ui}</div>)}
            {activeTab === "yearly" && <div>Year</div>}
            <div className="actionbtns action-heading">Action</div>
          </div>
          )}

          {loading ? (
            <div className="p-5 text-center"><Loader2 className="animate-spin mx-auto" /> Loading Data...</div>
          ) : students.length === 0 ? (
            <div className="whitebox text-center">No students found matching your criteria.</div>
          ) : (
            <ul>
              {students.map((stu, i) => (
                <li key={stu.studentId}>
                  <div className={stu.status === "INACTIVE" ? "inactive listbox paymentbox" : "listbox paymentbox"}>
                    <div data-head="Sl.">{i + 1}</div>
                    <div data-head="Roll">{stu.rollNumber || "-"}</div>
                    <div data-head="Name">{stu.firstName} {stu.lastName}</div>
                    <div data-head="Class" className="classname">{stu.className}</div>
                    <div data-head="Contact">{stu.contactNo || "---"}</div>

                    {activeTab === "monthly" && MONTH_MAP.map(m => {
                      const payment = getPaymentInfo(stu, m.api);
                      const isPaid = !!payment;
                      return (
                        <div key={m.api} className="monthly-heading">
                          <button type="button" onClick={() => handleOpenDetail(stu, m.api, "Month")} className={`pay-btn ${isPaid ? "successbtn" : "crossbtn"}`}>
                            <div className="months">{m.ui}</div>
                            {isPaid ? <Check size={16} /> : <X size={16} />}
                          </button>
                        </div>
                      );
                    })}

                    {activeTab === "quarterly" && QUARTER_MAP.map(q => {
                      const payment = getPaymentInfo(stu, q.api);
                      const isPaid = !!payment;
                      return (
                        <div key={q.api} className="quaterly-heading">
                          <button type="button" onClick={() => handleOpenDetail(stu, q.api, "Quarter")} className={`pay-btn ${isPaid ? "successbtn" : "crossbtn"}`} >
                            <div>{q.ui}</div>
                            {isPaid ? <Check size={16} /> : <X size={16} />}
                          </button>
                        </div>
                      );
                    })}

                    {activeTab === "half-yearly" && HALF_YEAR_MAP.map(h => {
                      const payment = getPaymentInfo(stu, h.api);
                      const isPaid = !!payment;
                      return (
                        <div key={h.api} className="quaterly-heading">
                          <button type="button" onClick={() => handleOpenDetail(stu, h.api, "Half-Year")} className={`pay-btn ${isPaid ? "successbtn" : "crossbtn"}`} >
                            <div>{h.ui}</div>
                            {isPaid ? <Check size={16} /> : <X size={16} />}
                          </button>
                        </div>
                      );
                    })}

                    {activeTab === "yearly" && (
                      <div>  
                        {(() => {
                          const payment = getPaymentInfo(stu, "Full-Year"); 
                          const isPaid = !!payment;
                          return (
                            <button type="button" onClick={() => handleOpenDetail(stu, "Full-Year", "Year")} className={`pay-btn ${isPaid ? "successbtn" : "crossbtn"}`}>
                              {isPaid ? <Check size={16} /> : <X size={16} />} {academicYear}
                            </button>
                          );
                        })()}
                      </div>
                    )}

                    <div className="actionbtns action-heading">
                      <button onClick={() => handleNavigateToFees(stu.studentId, academicYear)} title="View Fee Structure">
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div> 
      </div>
 
      {activeModal === "Month" && (
        <FeeReceiptPopup type="Month" selected={selectedStudent} period={selectedPeriod} currentYear={academicYear} onClose={closePopup}
          onAddPayment={() => console.log("Add payment")} feeConfig={{ baseFeeLabel: "Monthly Fee", baseFeeValue: 0 }} 
        />
      )}
      {activeModal === "Quarter" && (
        <FeeReceiptPopup type="Quarter" selected={selectedStudent} period={selectedPeriod} currentYear={academicYear} onClose={closePopup}
          onAddPayment={() => console.log("Add payment")} feeConfig={{ baseFeeLabel: "Quarterly Fee", baseFeeValue: 0 }} 
        />
      )}
      {activeModal === "Half-Year" && (
        <FeeReceiptPopup type="Half-Year" selected={selectedStudent} period={selectedPeriod} currentYear={academicYear} onClose={closePopup}
          onAddPayment={() => console.log("Add payment")} feeConfig={{ baseFeeLabel: "Half-Yearly Fee", baseFeeValue: 0 }} 
        />
      )}
      {activeModal === "Year" && (
        <FeeReceiptPopup type="Year" selected={selectedStudent} period={selectedPeriod} currentYear={academicYear} onClose={closePopup}
          onAddPayment={() => console.log("Add payment")} feeConfig={{ baseFeeLabel: "Yearly Fee", baseFeeValue: 0 }} 
        />
      )} 
    </div>
  );
}