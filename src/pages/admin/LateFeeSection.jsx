import React, { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import Popup from "../../components/Popup";
import axiosInstance from "../../utills/axiosInstance";

export default function LateFeeSection({ 
  selectedAcademicYear, 
  academicYearsList, 
  onSuccess, 
  formatDate 
}) {
  const [lateFeeList, setLateFeeList] = useState([]);
  const [lateFeeHeads, setLateFeeHeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [errors, setErrors] = useState({});
  const [editData, setEditData] = useState({
    lateFeeAmount: "",
    dateFrom: "",
    dateTo: ""
  });

  const fetchLateFees = async () => {
    if (!selectedAcademicYear) return;
    try {
      const response = await axiosInstance.get("/api/v1/late-fee/getByYear", {
        params: { academicYear: selectedAcademicYear }
      });
      if (response.data.status === "Success") {
        setLateFeeList(response.data.data.lateFees);
        setLateFeeHeads(response.data.data.feeHeads);
      }
    } catch (error) {
      console.error("Error fetching late fees:", error);
    }
  };

  useEffect(() => { fetchLateFees(); }, [selectedAcademicYear]);

  const openEditModal = (plan) => {
    let defaultHeadId = plan.headId;
    let defaultHeadName = plan.headName;
    let defaultStartDate = plan.dateFrom || "";
    let defaultEndDate = plan.dateTo || "";

    // logic for NULL records (New Entry)
    if (!plan.lateFeeMasterId) {
      // Find TUITION head from the heads returned by the Late Fee API
      const tuitionHead = lateFeeHeads.find(h => h.headCode === "TUITION");
      if (tuitionHead) {
        defaultHeadId = tuitionHead.headId;
        defaultHeadName = tuitionHead.headName;
      }
      const yearData = academicYearsList.find(y => y.academicYear === selectedAcademicYear);
      if (yearData) {
        defaultStartDate = yearData.startDate;
        defaultEndDate = yearData.endDate;
      }
    }

    setSelectedPlan({ ...plan, headId: defaultHeadId, headName: defaultHeadName });
    setEditData({
      lateFeeAmount: plan.lateFeeAmount || "",
      dateFrom: defaultStartDate,
      dateTo: defaultEndDate
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleUpdateLateFee = async () => {
    const currentYearData = academicYearsList.find(y => y.academicYear === selectedAcademicYear);
    if (!currentYearData) return;

    const { startDate, endDate } = currentYearData;
    const { lateFeeAmount, dateFrom, dateTo } = editData;
    let newErrors = {};

    // --- VALIDATIONS ---
    if (!lateFeeAmount || parseFloat(lateFeeAmount) <= 0) {
      newErrors.lateFeeAmount = "Late fee amount must be greater than 0.";
    }

    if (!dateFrom) {
      newErrors.dateFrom = "Effective From date is required.";
    } else if (dateFrom < startDate) {
      newErrors.dateFrom = `Cannot be before start date (${formatDate(startDate)}).`;
    }

    if (dateTo) {
      if (dateTo < dateFrom) {
        newErrors.dateTo = "Cannot be earlier than Effective From date.";
      } else if (dateTo > endDate) {
        newErrors.dateTo = `Cannot exceed end date (${formatDate(endDate)}).`;
      }
    }

    setErrors(newErrors);

    // --- FOCUS LOGIC ---
    const errorFields = Object.keys(newErrors);
    if (errorFields.length > 0) {
      document.getElementsByName(errorFields[0])[0]?.focus();
      return;
    }

    // --- API CALL ---
    try {
      const payload = {
        lateFeeMasterId: selectedPlan.lateFeeMasterId,
        academicYear: selectedAcademicYear,
        feePlanId: selectedPlan.feePlanId,
        headId: selectedPlan.headId, // This is the TUITION head ID for new entries
        lateFeeAmount: parseFloat(lateFeeAmount),
        dateFrom: dateFrom,
        dateTo: dateTo || null,
      };

      const response = await axiosInstance.post("/api/v1/late-fee/save", payload);
      
      if (response.data.status === "Success") {
        setIsModalOpen(false);
        // Refresh the list locally to see the update
        fetchLateFees();
        // Trigger the success notification in AddFees.jsx
        onSuccess(response.data.data);
      } else {
          alert(response.data.message || "An error occurred while saving.");
      }
    } catch (error) {
      console.error("Error updating late fee:", error);
      const errorMsg = error.response?.data?.metadata?.error || "Server connection failed.";
      alert(`Error: ${errorMsg}`);
    }
  };

  return (
    <div className="listsec syllabus-master" style={{ marginTop: '40px' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: '600' }}>
        Late Fee Details ({selectedAcademicYear})
      </h3>
      
      <div className="listbox theading" style={{ display: 'grid', gridTemplateColumns: '0.5fr 4fr 2fr 2fr 2fr 1fr', gap: '10px', width: '100%' }}>
        <div>Sl.</div>
        <div>Plan Name</div>
        <div>Late Fee (₹)</div>
        <div>Effective From</div>
        <div>Effective To</div>
        <div style={{ textAlign: 'center' }}>Action</div>
      </div>

      <ul>
        {lateFeeList.map((plan, index) => (
          <li key={plan.feePlanId}>
            <div className="listbox" style={{ display: 'grid', gridTemplateColumns: '0.5fr 4fr 2fr 2fr 2fr 1fr', gap: '10px', alignItems: 'center', width: '100%' }}>
              <div>{index + 1}</div>
              <div>{plan.planName}</div>
              <div>{plan.lateFeeAmount ? `₹${plan.lateFeeAmount}` : "---"}</div>
              <div>{formatDate(plan.dateFrom)}</div>
              <div>{formatDate(plan.dateTo)}</div>
              <div className="actionbtns" style={{ justifyContent: 'center' }}>
                <button className="editbtn" title="Edit Late Fee" onClick={() => openEditModal(plan)}>
                  <Pencil size={16} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {isModalOpen && (
        <Popup title="Modify Late Fee" onClose={() => setIsModalOpen(false)} onSave={handleUpdateLateFee} saveText="Update">
          <div className="formbox">
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Plan Name :</label>
              <span>{selectedPlan?.planName}</span>
            </div>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Late Fee Amount (₹) :</label>
              <input name="lateFeeAmount" type="number" className="form-control" style={{borderColor: errors.lateFeeAmount ? 'red' : ''}} value={editData.lateFeeAmount} onChange={handleInputChange} />
              {errors.lateFeeAmount && <small style={{color:'red'}}>{errors.lateFeeAmount}</small>}
            </div>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Effective From :</label>
              <input name="dateFrom" type="date" className="form-control" style={{width: '100%', height: '40px', padding: '8px', borderColor: errors.dateFrom ? 'red' : ''}} value={editData.dateFrom} onChange={handleInputChange} />
              {errors.dateFrom && <small style={{color:'red'}}>{errors.dateFrom}</small>}
            </div>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Effective To :</label>
              <input name="dateTo" type="date" className="form-control" style={{borderColor: errors.dateTo ? 'red' : ''}} value={editData.dateTo} onChange={handleInputChange} />
              {errors.dateTo && <small style={{color:'red'}}>{errors.dateTo}</small>}
            </div>
          </div>
        </Popup>
      )}
    </div>
  );
}