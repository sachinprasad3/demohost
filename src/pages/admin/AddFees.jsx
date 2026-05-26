// AddFees.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Pencil } from "lucide-react";
import axiosInstance from "../../utills/axiosInstance";
import Popup from "../../components/Popup";
import DiscountSection from "./DiscountSection";
import LateFeeSection from "./LateFeeSection";
import TransportSlabSection from "./TransportSlabSection";

export default function ClassList() {
  const navigate = useNavigate();

  // --- Constants ---
  const SCHOOL_ID = "SCH001";
  
  // --- State ---
  const [academicYearsList, setAcademicYearsList] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(""); 
  const [classList, setClassList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dynamicHeads, setDynamicHeads] = useState([]);
  const [discountList, setDiscountList] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [availableHeads, setAvailableHeads] = useState([]);

  // 1. Fetch Academic Years
  const fetchAcademicYears = async () => {
    try {
        const response = await axiosInstance.get("/api/academicYear");
        const data = response.data;
        if (Array.isArray(data)) {
            setAcademicYearsList(data);
            const currentYearObj = data.find(y => y.isCurrent === 'Y');
            if (currentYearObj) {
                setSelectedAcademicYear(currentYearObj.academicYear);
            } else if (data.length > 0) {
                setSelectedAcademicYear(data[0].academicYear);
            }
        }
    } catch (error) {
        console.error("Error fetching academic years:", error);
    }
  };

  // 2. Fetch Classes
  const fetchClasses = async () => {
    if (!selectedAcademicYear) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/v1/class/getByYear", {
        params: { academicYear: selectedAcademicYear }
      });
      const result = response.data;
      
      if (result.status === "Success") {
        const classes = result.data.classes;
        setClassList(classes);

        // Dynamic Head Extraction
        const headsMap = new Map();
        classes.forEach(cls => {
            if(cls.feeStructure) {
                cls.feeStructure.forEach(fee => {
                    if (!headsMap.has(fee.headId)) {
                        headsMap.set(fee.headId, fee.headName);
                    }
                });
            }
        });
        const sortedHeads = Array.from(headsMap.entries())
            .map(([id, label]) => ({ id, label }))
            .sort((a, b) => a.id - b.id);
        setDynamicHeads(sortedHeads);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClassList([]); 
      setDynamicHeads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscounts = async () => {
    if (!selectedAcademicYear) return;

    // Clear the previous list immediately to prevent "ghost" rows
    setDiscountList([]);

    try {
      const response = await axiosInstance.get("/api/v1/plan-discounts/getByYear", {
        params: { academicYear: selectedAcademicYear }
      });
      if (response.data.status === "Success") {
        setDiscountList(response.data.data.discounts);
        setAvailableHeads(response.data.data.feeHeads);
      }
    } catch (error) {
      console.error("Error fetching discounts:", error);
      setDiscountList([]);
    }
  };
  // --- Effects ---
  useEffect(() => { fetchAcademicYears(); }, []);
  useEffect(() => { fetchClasses(); fetchDiscounts(); }, [selectedAcademicYear]);

  // --- Handlers ---

  const handleYearChange = (e) => {
    setSelectedAcademicYear(e.target.value);
  };

  // --- UPDATED HELPER FUNCTION ---
  const getFeeDisplay = (classObj, headId) => {
    const fee = classObj.feeStructure?.find(f => f.headId === headId);
    // Check if fee exists and amount is greater than 0
    if (fee && fee.amount > 0) {
        return `₹${fee.amount}`;
    }
    return "---";
  };

  // --- Navigation Handlers ---

  const goToAddClass = () => {
    navigate("/admin/add-new-class");
  };

  const goToEditClass = (cls) => {
    navigate("/admin/edit-class", { 
        state: { 
            mode: "EDIT", 
            academicYear: selectedAcademicYear,
            dynamicHeads: dynamicHeads,
            classData: cls 
        } 
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const openEditModal = (plan) => {
    // Determine default values if the plan currently has no discount
    let defaultHeadId = plan.headId;
    let defaultHeadName = plan.headName;
    let defaultStartDate = plan.dateFrom || "";
    let defaultEndDate = plan.dateTo || "";

    // logic for NULL discounts (New Entry)
    if (!plan.planDiscountId) {
      // 1. Find "TUITION" head from the availableHeads list
      const tuitionHead = availableHeads.find(h => h.headCode === "TUITION");
      if (tuitionHead) {
        defaultHeadId = tuitionHead.headId;
        defaultHeadName = tuitionHead.headName;
      }

      // 2. Find the dates for the currently selected academic year
      const yearData = academicYearsList.find(y => y.academicYear === selectedAcademicYear);
      if (yearData) {
        defaultStartDate = yearData.startDate;
        defaultEndDate = yearData.endDate;
      }
    }

    setSelectedPlan({
      ...plan,
      headId: defaultHeadId,
      headName: defaultHeadName
    });

    setEditData({
      discountAmount: plan.discountAmount || "",
      dateFrom: defaultStartDate,
      dateTo: defaultEndDate
    });
    setIsModalOpen(true);
  };

  const handleUpdateSuccess = (msg) => {
    setSuccessMsg(msg);
    setIsSuccessOpen(true);
    fetchDiscounts(); // Refresh discount data
  };


  return (
    <div className="mainpro">
      <div className="container">
        <div className="addfee-head">
          <div className="formbox">
            <ul>
              <li>
                <div className="form-group">
                  <label style={{ fontWeight: 'bold' }}>Academic Year:</label>
                  {academicYearsList.length > 0 ? (
                    <select
                      className="form-control"
                      value={selectedAcademicYear}
                      onChange={handleYearChange}
                    >
                      {academicYearsList.map(item => (
                        <option key={item.academicYear} value={item.academicYear}>
                          {item.academicYear} {item.isCurrent === 'Y' ? '(Current)' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span>Loading Years...</span>
                  )}
                </div>
              </li>
            </ul>
          </div>


          <button className="btn btn-primary" onClick={goToAddClass} disabled={!selectedAcademicYear}>
            + Add Class
          </button>
        </div>

        <div className="listsec syllabus-master">
          <div className="listbox studentlist theading">
            <div>Sl.</div>
            <div>Class</div>
            <div>Class Teacher</div>
            {dynamicHeads.map(head => ( <div key={head.id}>{head.label}</div> ))}
            <div>Action</div>
          </div>

          {loading ? <p style={{ padding: "20px" }}>Loading classes...</p> : (
            <ul>
              {classList.map((cls, index) => (
                <li key={cls.classId}>
                  <div className="listbox studentlist">
                    <div data-head="Sl.">{index + 1}</div>
                    <div data-head="Class">{cls.className}</div>
                    <div data-head="Teacher">{cls.classTeacherName || "Unassigned"}</div>

                    {dynamicHeads.map(head => (
                      <div key={head.id} data-head={head.label}>
                        {getFeeDisplay(cls, head.id)}
                      </div>
                  ))}

                  <div className="actionbtns">
                    <button className="editbtn" onClick={() => goToEditClass(cls)}>
                      <Pencil size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          )}
          
          {!loading && classList.length === 0 && (
              <p style={{padding: "20px"}}>
                  {selectedAcademicYear ? `No classes found for ${selectedAcademicYear}` : 'Please select an academic year.'}
              </p>
          )}
        </div>

        <DiscountSection 
          selectedAcademicYear={selectedAcademicYear}
          discountList={discountList}
          availableHeads={availableHeads}
          academicYearsList={academicYearsList}
          onSuccess={handleUpdateSuccess}
          formatDate={formatDate}
        />

        {/* --- ADDED LATE FEE SECTION --- */}
        <LateFeeSection 
          selectedAcademicYear={selectedAcademicYear}
          academicYearsList={academicYearsList}
          onSuccess={handleUpdateSuccess}
          formatDate={formatDate}
        />

        <TransportSlabSection 
          formatDate={formatDate} 
          onSuccess={handleUpdateSuccess} 
        />

        {/* --- SUCCESS POPUP --- */}
        {isSuccessOpen && (
          <Popup
            title="Notification"
            onClose={() => setIsSuccessOpen(false)}
            onSave={() => setIsSuccessOpen(false)}
            saveText="OK"
          >
            <div style={{
              textAlign: "center",
              padding: "20px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px"
            }}>
              <CheckCircle size={48} color="#28a745" />
              <p style={{ fontSize: "16px", fontWeight: "500" }}>{successMsg}</p>
            </div>
          </Popup>
        )}

      </div>
    </div>
  );
}
