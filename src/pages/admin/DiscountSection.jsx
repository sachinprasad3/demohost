import React, { useState } from "react";
import { Pencil } from "lucide-react";
import Popup from "../../components/Popup";
import axiosInstance from "../../utills/axiosInstance";

export default function DiscountSection({ 
  selectedAcademicYear, 
  discountList, 
  availableHeads, 
  academicYearsList, 
  refreshData, 
  formatDate 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [errors, setErrors] = useState({});
  const [editData, setEditData] = useState({ discountAmount: "", dateFrom: "", dateTo: "" });

  const openEditModal = (plan) => {
    let defaultHeadId = plan.headId;
    let defaultHeadName = plan.headName;
    let defaultStartDate = plan.dateFrom || "";
    let defaultEndDate = plan.dateTo || "";

    if (!plan.planDiscountId) {
      const tuitionHead = availableHeads.find(h => h.headCode === "TUITION");
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
        discountAmount: plan.discountAmount || "", 
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

  const handleUpdateDiscount = async () => {
    const currentYearData = academicYearsList.find(y => y.academicYear === selectedAcademicYear);
    if (!currentYearData) return;

    const { startDate, endDate } = currentYearData;
    const { discountAmount, dateFrom, dateTo } = editData;
    let newErrors = {};

    if (!discountAmount || parseFloat(discountAmount) <= 0) {
        newErrors.discountAmount = "Discount amount must be greater than 0.";
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
    const errorFields = Object.keys(newErrors);
    if (errorFields.length > 0) {
      document.getElementsByName(errorFields[0])[0]?.focus();
      return;
    }

    try {
      const payload = {
        planDiscountId: selectedPlan.planDiscountId,
        academicYear: selectedAcademicYear,
        feePlanId: selectedPlan.feePlanId,
        headId: selectedPlan.headId,
        discountAmount,
        dateFrom,
        dateTo,
      };

      const response = await axiosInstance.post("/api/v1/plan-discounts/save", payload);
      if (response.data.status === "Success") {
        setIsModalOpen(false);
        refreshData(response.data.data);
      }
    } catch (error) { 
        console.error("Error updating discount:", error); 
    }
  };

  return (
    <div className="listsec syllabus-master" style={{ marginTop: '40px' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: '600' }}>
        Plan Discounts ({selectedAcademicYear})
      </h3>
      <div className="listbox theading" style={{ display: 'grid', gridTemplateColumns: '0.5fr 4fr 2fr 2fr 2fr 1fr', gap: '10px' }}>
        <div>Sl.</div><div>Plan Name</div><div>Discount</div><div>Effective From</div><div>Effective To</div><div style={{ textAlign: 'center' }}>Action</div>
      </div>
      <ul>
        {discountList.map((plan, index) => (
          <li key={plan.feePlanId}>
            <div className="listbox" style={{ display: 'grid', gridTemplateColumns: '0.5fr 4fr 2fr 2fr 2fr 1fr', gap: '10px', alignItems: 'center' }}>
              <div>{index + 1}</div>
              <div>{plan.planName}</div>
              <div>{plan.discountAmount ? `₹${plan.discountAmount}` : "---"}</div>
              <div>{formatDate(plan.dateFrom)}</div>
              <div>{formatDate(plan.dateTo)}</div>
              <div className="actionbtns" style={{ justifyContent: 'center' }}>
                <button className="editbtn" title="Edit Discount" onClick={() => openEditModal(plan)}>
                    <Pencil size={16} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {isModalOpen && (
        <Popup title="Modify Plan Discount" onClose={() => setIsModalOpen(false)} onSave={handleUpdateDiscount} saveText="Update">
          {/* Restored 500px logic and detailed Labels/Fields */}
          <div className="formbox">
            
            {/* 1. Plan Name */}
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block',  fontWeight: 'bold' }}>Plan Name :</label>
              <span>{selectedPlan?.planName}</span>
            </div>

            {/* 3. Discount Amount */}
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Discount Amount (₹) :</label>
              <input 
                name="discountAmount" 
                type="number" 
                className="form-control" 
                style={{ borderColor: errors.discountAmount ? 'red' : '' }} 
                value={editData.discountAmount} 
                onChange={handleInputChange} 
                placeholder="e.g. 2000"
              />
              {errors.discountAmount && <small style={{ color: 'red' }}>{errors.discountAmount}</small>}
            </div>

            {/* 4. Effective From */}
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Effective From :</label>
              <input 
                name="dateFrom" 
                type="date" 
                className="form-control" 
                style={{ width: '100%', height: '40px', padding: '8px', borderColor: errors.dateFrom ? 'red' : '' }} 
                min={academicYearsList.find(y => y.academicYear === selectedAcademicYear)?.startDate}
                max={academicYearsList.find(y => y.academicYear === selectedAcademicYear)?.endDate}
                value={editData.dateFrom} 
                onChange={handleInputChange} 
              />
              {errors.dateFrom && <small style={{ color: 'red' }}>{errors.dateFrom}</small>}
            </div>

            {/* 5. Effective To */}
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Effective To :</label>
              <input 
                name="dateTo" 
                type="date" 
                className="form-control" 
                style={{ borderColor: errors.dateTo ? 'red' : '' }} 
                min={editData.dateFrom || academicYearsList.find(y => y.academicYear === selectedAcademicYear)?.startDate}
                max={academicYearsList.find(y => y.academicYear === selectedAcademicYear)?.endDate}
                value={editData.dateTo} 
                onChange={handleInputChange} 
              />
              {errors.dateTo && <small style={{ color: 'red' }}>{errors.dateTo}</small>}
            </div>
          </div>
        </Popup>
      )}
    </div>
  );
}