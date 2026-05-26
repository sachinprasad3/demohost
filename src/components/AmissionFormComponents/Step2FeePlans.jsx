

import React, { useCallback, useEffect, useRef, useState } from "react";
import useAdmissionFormContext from "../../hooks/useAdmissionFormContext";
import { Modal } from "bootstrap";
import Popup from "../Popup";
import TransportLocationSelector from "./TransportLocationSelector";
import Select from "./customField/Select";
import axiosInstance from "../../utills/axiosInstance";
import { RadioButton } from "./customField/RadioButton";
import Input from "./customField/Input";
import { useAuth } from "../../context/AuthContext";
import { sanitizeValue } from "./hooks/AdmissionHeleperFunction";
const Step2FeePlans = React.memo(({ errors, clearFieldError }) => {
  const { feePlanID, updateFormData, setFormData, pickUpLocation, formData, fetchFeePlanId } = useAdmissionFormContext()

  const [planEstimates, setPlanEstimates] = useState([])

  const { user } = useAuth()
  // console.log("fee Plan", feePlanID)
  const [showModal, setShowModal] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const modalRef = useRef(null);
  const transPortOptions = [
    { label: "Yes", value: "true" },
    { label: "No", value: "false" }
  ]
  useEffect(() => {
    if (showModal && modalRef.current) {
      const modalInstance = new Modal(modalRef.current);
      modalInstance.show();
    }
  }, [showModal]);

  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleFormDataChange = (e, allow, maxLength) => {
      const { name, value } = e.target;
      let cleanValue = value
      if (allow && maxLength) {
  
        cleanValue = sanitizeValue(value, allow, maxLength);
      }
  
      updateFormData(name, cleanValue)
      clearFieldError(name);
    }


  
const getAdmissionYearRange = (admissionYear) => {
  if (!admissionYear) return {};

  const [startYear, endYear] = admissionYear.split("-").map(Number);

  const academicStart = new Date(startYear, 3, 1); // April 1
  const academicEnd = new Date(endYear, 2, 31);    // March 31

  academicStart.setHours(0, 0, 0, 0);
  academicEnd.setHours(0, 0, 0, 0);

  return {
    min: getLocalDateString(academicStart),
    max: getLocalDateString(academicEnd),
  };
};
  const { min, max } = getAdmissionYearRange(formData?.admissionYear);

// console.log("ormData?.admissionYear",min,max)

  useEffect(() => {

    const getFeeEstimates = async () => {
      if (!formData?.candidateId) return;

      try {
        const res = await axiosInstance.get(
          "/api/fee-plans/estimates",
          {
            params: {
              candidateId: formData.candidateId,
              ...(formData.pickupLocationId && {
                pickupLocationId: formData.pickupLocationId,
              }),
              ...(formData.joiningDate && {
                joiningDate: formData.joiningDate,
              }),
            }

          }
        );

        const feePlans = formData.transportFacility === "false" ? res?.data?.data.filter((plan) => (plan.planCode.slice(-2) !== "VF")) : res?.data?.data?.filter((plan) => (plan.planCode.slice(-3) !== "XXX"))
        setPlanEstimates(feePlans)

      } catch (error) {
        console.error("error in fetching estimates", error);
      }
    };

    getFeeEstimates();
  }, [
    formData?.candidateId,
    formData?.pickupLocationId,
    formData?.joiningDate,
    formData.transportFacility
  ]);

  // console.log("fee Plan Id",feePlanID)

  useEffect(() => {
    if (modalRef.current) {
      const modalElement = modalRef.current;

      const handler = () => setShowModal(false);
      modalElement.addEventListener("hidden.bs.modal", handler);

      return () => {
        modalElement.removeEventListener("hidden.bs.modal", handler);
      };
    }
  }, []);

  // const feePlanOption = formData.transportFacility === "false" ? feePlanID?.filter((plan) => (plan.planCode.slice(-2) !== "VF")).map((plan) => ({
  //   label: plan?.planName, value: plan?.feePlanId
  // })) : feePlanID.filter((plan) => (plan.planCode.slice(-3) !== "XXX")).map((plan) => ({
  //   label: plan?.planName

  //   , value: plan?.feePlanId
  // }))
  const isTransportFalse = formData?.transportFacility === "false";

  const feePlanOption = (feePlanID || [])
    .filter(plan => {
      const code = plan?.planCode || "";

      return isTransportFalse
        ? !code.endsWith("VF")
        : !code.endsWith("XXX");
    })
    .map(plan => ({
      label: plan?.planName,
      value: plan?.feePlanId,
    }));

  const handleLocationSelect = (fareRes) => {

    setFormData(prev => ({
      ...prev,
      ...fareRes,
    }));

  };

  return (
    <>



      <section className="whitebox">
        <h4>Transport Information</h4>
        <div className="formbox searchsec">
          <ul>
            <li className="deskfull">
              <RadioButton name="transportFacility"
                label="Do you want to avail transportation facility?"
                required
                value={formData.transportFacility}
                options={[
                  { label: "Yes", value: "true" },
                  { label: "No", value: "false" }
                ]}
                error={errors.transportFacility}
                
                onChange={(e)=>{handleFormDataChange(e)}}
              />
            </li>





            {formData.transportFacility === "true" && (
              <>
                <TransportLocationSelector onLocationSelect={handleLocationSelect} formData={formData} />
                <input type="hidden" name="pickupLocationId" value={formData.pickupLocationId || ""} />
                {errors?.pickupLocationId && (
                  <div className="invalid-feedback d-block mt-2">
                    Please select a location and click "Get Fare Details" to confirm.
                  </div>
                )}
              </>
            )}
          </ul>
        </div>
      </section>

      <section className="whitebox">
        <Input name="joiningDate" label="Joining Date" type="date" required
          min={min}
          max={max}
          value={formData.joiningDate}
          error={errors.joiningDate}
          disabled={formData.studentId && user.role === "ADMIN"}
          onKeyDown={(e) => {
          if ( e.key !== "Tab") {
            e.preventDefault();
          }
        }}
          onChange={handleFormDataChange}
        />

      </section>
      <section className="whitebox">
        <h4 className="msf-fatitle">Payment Information</h4>
        <div className="formbox">

          <Select
            name="feePlanId"
            label="How do you want to pay the school fee?"
            value={formData?.feePlanId ?? ""}
            options={feePlanOption}
            placeholder=" Please Select Fee Plan "
            error={errors.feePlanId}
            
            onChange={handleFormDataChange}
            disabled={!feePlanID || !formData?.joiningDate}
            required
          />
        </div>
        {!formData?.joiningDate && <small className="px-2 py-1 rounded" style={{ background: "#eef2f7", color: "#333" }}>
          Please enter joining Date to select fee plan
        </small>}

      </section>
      {user?.role !== "ADMIN" && <div className="d-flex align-items-center gap-2">
        <input type="checkbox" id="terms" name="termsAgreed" checked={formData.termsAgreed === "Y"}
          
          onChange={(e) => {updateFormData(  "termsAgreed", e.target.checked ? "Y" : "N"); clearFieldError("termsAgreed")}}
           
           />
        <button type="button" className="btn btn-link p-0" onClick={() => setShowTerms(true)}>Accept Terms & Conditions</button>
        {errors?.termsAgreed && (
          <div className="invalid-feedback d-block">
            {errors.termsAgreed}
          </div>
        )}
      </div>}


      {showTerms && (
        <Popup
          title="TERMS & CONDITIONS"
          onClose={() => setShowTerms(false)}
          saveText="Accept"
          onSave={() => {
            
             updateFormData( "termsAgreed", "Y");
            clearFieldError("termsAgreed")
          }}
        >

          <p>I hereby provide consent to utilize my child's pictures, artwork and creations done during activity time for marketing purpose.</p>
          <p>I hereby acknowledge to receive all promotional and transactional updates through E-mails / SMS from Play School.</p>
          <p>Any fees paid shall be non-refundable.</p>
          <p>Fees can be paid in form of Cash / Cheque.</p>
          <p>Un-informed leave of consecutive 20 days or above shall be considered as Drop-out.</p>
          <p>For any complain or queries, please feel free to write us at{" "} <a href="mailto:info@gurukulworldplayschool.com">fo@gurukulworldplayschool.com</a></p>


          <div className="d-flex gap-2 align-items-center">
            <input
              type="checkbox"
              id="terms"
              checked={formData.termsAgreed === "Y"}
              onChange={(e) => { 
                updateFormData( "termsAgreed", e.target.checked ? "Y" : "N")
                clearFieldError("termsAgreed")
              }}
            />
            <label htmlFor="terms">Accept Terms & Conditions</label>
          </div>
        </Popup>
      )}
      {planEstimates?.length > 0 && formData?.feePlanId && (
        <FeePlansMobile
          key={formData.feePlanId}
          plans={planEstimates.filter(
            (plan) => String(plan.feePlanId) === String(formData.feePlanId)
          )}
        />
      )}


    </>
  );
});

export default Step2FeePlans;





function FeePlansMobile({ plans, selectedPlanId, onSelect }) {
  return (
    <div className=" ">
      {plans?.map((plan) => (
        <div
          key={plan.feePlanId}
          className={`card mb-3 shadow-sm ${selectedPlanId === plan.feePlanId
            ? "border-primary"
            : ""
            }`}
        >
          <div className="card-body">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 className="mb-1 fw-semibold">{plan.planName}</h6>

              </div>

              {plan.transportFee > 0 && (
                <span className="badge bg-success">Transport</span>
              )}
            </div>

            {/* Net Payable */}
            <div className="mb-3">
              <h4 className="text-primary fw-bold mb-0">
                {plan.netPayable}
              </h4>
              <small className="text-muted">
                per {plan.billingPeriod}
              </small>
            </div>

            {/* Fee Breakdown */}
            <ul className="list-group list-group-flush mb-3">
              <li className="list-group-item px-0 d-flex justify-content-between">
                <span>Base Fee</span>
                <span> {plan.baseFee}</span>
              </li>

              <li className="list-group-item px-0 d-flex justify-content-between">
                <span>Transport Fee</span>
                <span>
                  {plan.transportFee > 0
                    ? ` ${plan.transportFee}`
                    : "Not Included"}
                </span>
              </li>

              {plan.discountAmount > 0 && (
                <li className="list-group-item px-0 d-flex justify-content-between text-success fw-semibold">
                  <span>Discount</span>
                  <span>{plan.discountAmount}</span>
                </li>
              )}
            </ul>

          </div>
        </div>
      ))}
    </div>
  );
}
