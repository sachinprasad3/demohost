
import { Placeholder } from "react-bootstrap";
import useAdmissionFormContext from "../../hooks/useAdmissionFormContext";
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { X } from "lucide-react";
import RhfSelect from "./customField/RhfSelect";
import RhfInput from "./customField/RhfInput";
// import axios from "axios";
// import { mapApiToFormValues, sanitizeValue } from "./hooks/AdmissionHeleperFunction";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useForm } from "react-hook-form";
// import { contactDetailsSchema } from "../../validations/step1admissionContact.schema";
// import {  useMobileAvailabilityChecker, useGetCandidateContactDetails, useGetStudentContactDetails } from "../../services/admission.services";
import useStep1ContactDetails from "./hooks/useStep1ContactDetails";
import { useLocation } from "react-router-dom";
import OtpInput from "../../auth/OtpInput";
import Popup from "../Popup";
import { usePopup } from "../../context/PopupContext";



const Step1ContactDetails = forwardRef((props, ref) => {
  // const { candidateId, studentId } = useAdmissionFormContext();
  // console.log("props.userId", props)
  const {
    register,
    
    watch,
    setValue,
    clearErrors,
    setError,

    trigger,
    getValues,
    formState: { errors },
getAdmissionAddressId,
    primary,
    selectedRelations,
    isPrimaryLocked,
handleEmailCheck,
handleMobileCheck,
    handlePrimaryChange,
    handleFormDataChange,
    fetchAddressDetail,
    saveFamilyDetails,
    handleSendOtp,
    activeModal,
    closePopup,
    sendingOtp,
    verifyOtpPending,
    modalData,
    handleVerifyOtp,
    emailOtpVerified,
    ignoreNextBlurRef,
    otpSent,
    timer,
    canResend

  } = useStep1ContactDetails(props);
  
  const appUserId = props.userId;
const { onDisableChange } = props;
useEffect(() => {
  const shouldDisable =
    !emailOtpVerified || sendingOtp || verifyOtpPending;

  onDisableChange?.(shouldDisable);

}, [emailOtpVerified, sendingOtp, verifyOtpPending, onDisableChange]);
  const loaction = useLocation()

  useImperativeHandle(ref, () => ({
    // validateStep: async () => {
    //   return await trigger(); // validates this step
    // },
    validateStep: async () => {
      const isFormValid = await trigger();

      if (!isFormValid) return false;
      const emailFieldName = `${primary.toLowerCase()}Email`;

      // if (!emailOtpVerified) {
      //   setError(emailFieldName, {
      //     type: "manual",
      //     message: "Please verify email before proceeding"
      //   });

      //   return false;
      // }
      // Check if any manual/API errors exist
      const hasErrors = Object.keys(errors).length > 0;

      if (hasErrors) return false;

      return true;
    },
    getValues: () => getValues(),
    saveFamilyDetails: saveFamilyDetails,
  }));
  

  const pathname = loaction.pathname; 
  const PrimaryContactAcademicOptions = [
    { label: "Mother", value: "MOTHER" },
    { label: "Father", value: "FATHER" },
    { label: "Guardian", value: "GUARDIAN" }
  ];

  const educationOptions = [
    { label: "Matriculation", value: "MATRICULATION" },
    { label: "Intermediate", value: "INTERMEDIATE" },
    { label: "Graduate", value: "GRADUATE" },
    { label: "Masters", value: "MASTER" },

    { label: "Phd", value: "PHD" }

  ];
  


  

  const renderRelation = (REL, LABEL, isPrimary = false) => {
    const prefix = REL.toLowerCase();
    const isReadOnly = isPrimary && isPrimaryLocked;
    const hasAdmissionAddressId = getAdmissionAddressId(REL)

    return (
      <section className="whitebox">
        {!hasAdmissionAddressId && primary !== REL && (
          <button
            type="button"
            className="crossbtn"
            onClick={() => {
              setValue(`selectedRelations.${REL}`, false);
              clearErrors();
              props.clearStepErrors(1);
            }}
          >
            <X size={16} />
          </button>
        )}

        <h4>{LABEL} Details</h4>

        <div className="formbox stapform">
          <ul>

            {/* Name */}
            <li className="fullsec">
              <RhfInput
                name={`${prefix}Name`}
                label={`${LABEL}’s Name`}
                placeholder={`Enter ${LABEL}’s Name`}
                {...register(`${prefix}Name`)}
                onChange={(e) => handleFormDataChange(e, "alpha", 50)}
                error={errors?.[`${prefix}Name`]?.message}
                required
                readOnly={isReadOnly}
              />
            </li>

            {/* Occupation */}
            <li className="fullsec">
              <RhfInput
                name={`${prefix}Occupation`}
                label="Occupation"
                placeholder="Enter Occupation"
                {...register(`${prefix}Occupation`)}
                onChange={(e) => handleFormDataChange(e, "alpha", 50)}
                error={errors?.[`${prefix}Occupation`]?.message}
                readOnly={isReadOnly}
              />
            </li>

            {/* Phone */}
            <li>
              <RhfInput
                name={REL === "GUARDIAN" ? `${prefix}PhoneHome` : `${prefix}Phone`}
                label="Contact No."
                placeholder="Enter Contact No."
                {...register(
                  REL === "GUARDIAN"
                    ? `${prefix}PhoneHome`
                    : `${prefix}Phone`
                )}

                onBlur={
                  isPrimary && !isPrimaryLocked && pathname !== "/admin/admin-admission-review"
                    ? (e) => handleMobileCheck(e.target.value, REL === "GUARDIAN" ? `${prefix}PhoneHome` : `${prefix}Phone`)
                    : undefined
                }
                onChange={(e) => handleFormDataChange(e, "numeric", 10)}
                error={
                  errors?.[
                    REL === "GUARDIAN"
                      ? `${prefix}PhoneHome`
                      : `${prefix}Phone`
                  ]?.message
                }
                required
                readOnly={isReadOnly}
              />
            </li>

            {/* Office Phone */}
            <li>
              <RhfInput
                name={`${prefix}OfficePhone`}
                label="Office Contact No."
                placeholder="Enter Contact No."
                {...register(`${prefix}OfficePhone`)}
                onChange={(e) => handleFormDataChange(e, "numeric", 10)}
                error={errors?.[`${prefix}OfficePhone`]?.message}
                readOnly={isReadOnly}
              />
            </li>

            {/* Email */}
            <li className="fullsec">
              <RhfInput
                name={`${prefix}Email`}
                label="Email"
                placeholder="Enter Email"
                {...register(`${prefix}Email`)}
                onChange={(e) => handleFormDataChange(e)}
                // onBlur={isPrimary ? (e) => handleEmailCheck(e.target.value,`${prefix}Email`) : undefined}
                onBlur={
                  isPrimary && !isPrimaryLocked  && !activeModal && pathname !== "/admin/admin-admission-review"
                    ? (e) => {
                      if (ignoreNextBlurRef.current) {
                        ignoreNextBlurRef.current = false;
                        return;
                      }

                      handleEmailCheck(e.target.value, `${prefix}Email`)
                    }
                    : undefined
                }
                suffix={
                  isPrimary && !isPrimaryLocked && getValues(`${prefix}Email`) && pathname !== "/admin/admin-admission-review" && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      disabled={sendingOtp || emailOtpVerified}
                      onClick={() => handleSendOtp(getValues(`${prefix}Email`))}>
                      {sendingOtp ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : emailOtpVerified ? (
                        "✓"
                      ) : (
                        "Verify"
                      )}
                    </button>
                  )
                }
                isLoading={isPrimary && sendingOtp}
                error={errors?.[`${prefix}Email`]?.message}
                required={isPrimary}
                readOnly={isReadOnly}
              />
            </li>

            {/* Education */}
            <li>
              <RhfSelect
                name={`${prefix}Education`}
                label="Education"
                options={educationOptions}
                placeholder="Select education"
                {...register(`${prefix}Education`)}
                error={errors?.[`${prefix}Education`]?.message}
                readOnly={isReadOnly}
              />
            </li>

            {/* Designation */}
            <li>
              <RhfInput
                name={`${prefix}Designation`}
                label="Designation"
                placeholder="Enter Designation"
                {...register(`${prefix}Designation`)}
                onChange={(e) => handleFormDataChange(e, "alpha", 50)}
                error={errors?.[`${prefix}Designation`]?.message}
                readOnly={isReadOnly}
              />
            </li>

            {/* Organization */}
            <li className="fullsec">
              <RhfInput
                name={`${prefix}Organisation`}
                label="Organization"
                placeholder="Enter Organization"
                {...register(`${prefix}Organisation`)}
                onChange={(e) => handleFormDataChange(e, "alpha", 50)}
                error={errors?.[`${prefix}Organisation`]?.message}
                readOnly={isReadOnly}
              />
            </li>

            {/* Address Line 1 */}
            <li className="fullsec">
              <RhfInput
                name={`${prefix}HomeAddressLine1`}
                label="Address Line 1"
                placeholder="Enter Home Address"
                {...register(`${prefix}HomeAddressLine1`)}
                onChange={(e) => handleFormDataChange(e)}
                error={errors?.[`${prefix}HomeAddressLine1`]?.message}
                required
                readOnly={isReadOnly}
              />
            </li>

            {/* Address Line 2 */}
            <li className="fullsec">
              <RhfInput
                name={`${prefix}HomeAddressLine2`}
                label="Address Line 2"
                placeholder="Enter Home Address (Optional)"
                {...register(`${prefix}HomeAddressLine2`)}
                onChange={(e) => handleFormDataChange(e)}
                error={errors?.[`${prefix}HomeAddressLine2`]?.message}
                readOnly={isReadOnly}
              />
            </li>

            {/* Pin Code */}
            <li>
              <RhfInput
                name={`${prefix}PinCode`}
                label="Pin Code"
                placeholder="Enter Pin Code"
                {...register(`${prefix}PinCode`)}
                onChange={(e) => handleFormDataChange(e, "numeric", 6)}
                onBlur={(e) =>
                  fetchAddressDetail(e.target.value, `${prefix}PinCode`)
                }
                error={errors?.[`${prefix}PinCode`]?.message}
                required
                readOnly={isReadOnly}
              />
            </li>

            {/* City */}
            <li>
              <RhfInput
                name={`${prefix}City`}
                label="City"
                placeholder="Enter City"
                {...register(`${prefix}City`)}
                onChange={(e) => handleFormDataChange(e, "alpha", 50)}
                error={errors?.[`${prefix}City`]?.message}
                required
                readOnly={isReadOnly}
              />
            </li>

            {/* State */}
            <li className="fullsec">
              <RhfInput
                name={`${prefix}State`}
                label="State"
                placeholder="Enter State"
                {...register(`${prefix}State`)}
                onChange={(e) => handleFormDataChange(e, "alpha", 50)}
                error={errors?.[`${prefix}State`]?.message}
                required
                readOnly={isReadOnly}
              />
            </li>

            {/* Office Address */}
            <li className="fullsec">
              <RhfInput
                name={`${prefix}OfficeAddress`}
                label="Office Address"
                placeholder="Enter Office Address"
                {...register(`${prefix}OfficeAddress`)}
                onChange={(e) => handleFormDataChange(e)}
                error={errors?.[`${prefix}OfficeAddress`]?.message}
                readOnly={isReadOnly}
              />
            </li>

          </ul>
        </div>
      </section>
    );
  };



  const isFatherComplete = () => {
    const values = getValues();
    return Boolean(values.fatherName && values.fatherPhone);
  };

  const isMotherComplete = () => {
    const values = getValues();
    return Boolean(values.motherName && values.motherPhone);
  };

  const isGuardianComplete = () => {
    const values = getValues();
    return Boolean(values.guardianName && values.guardianPhoneHome);
  };



  const areAllSelectedRelationsComplete = () => {
    const selected = watch("selectedRelations") || {};

    if (selected.FATHER && !isFatherComplete()) return false;
    if (selected.MOTHER && !isMotherComplete()) return false;
    if (selected.GUARDIAN && !isGuardianComplete()) return false;

    return true;
  };


  const isAnyRelationMissing = () => {
    const selected = watch("selectedRelations") || {};
    if(Object.keys(selected).length === 0) return false
// console.log("Object.keys(selected)",selected)

    return (
      !selected.FATHER ||
      !selected.MOTHER ||
      !selected.GUARDIAN
    );
  };


  const shouldShowAddRelationSelect = isAnyRelationMissing() && areAllSelectedRelationsComplete();


  


  return (
    <>
      {/* ---------------- PRIMARY CONTACT SELECTION ---------------- */}
      <section className="whitebox">
        <h3>Parents’ Details</h3>

        <label className="form-label">
          Whom you want to set as primary contact{" "}
          <span className="text-danger">*</span>
        </label>

        <div className="msf-familyradio">
          {PrimaryContactAcademicOptions.map((opt) => (
            <div className="mb-2" key={opt.value}>
              <label className="me-3">
                <input
                  type="radio"
                  value={opt.value}
                  checked={primary === opt.value}
                  onChange={() => handlePrimaryChange(opt.value)}
                  disabled={appUserId || isPrimaryLocked}
                />{" "}
                {opt.label}
              </label>
            </div>
          ))}

          {errors?.primaryContactAcademic && (
            <div className="text-danger">
              {errors.primaryContactAcademic.message}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- PRIMARY RELATION (ALWAYS FIRST) ---------------- */}
      {primary === "FATHER" && renderRelation("FATHER", "Father", true)}
      {primary === "MOTHER" && renderRelation("MOTHER", "Mother", true)}
      {primary === "GUARDIAN" && renderRelation("GUARDIAN", "Guardian", true)}

      {/* ---------------- OTHER SELECTED RELATIONS ---------------- */}
      {selectedRelations.FATHER && primary !== "FATHER" &&
        renderRelation("FATHER", "Father", false)}

      {selectedRelations.MOTHER && primary !== "MOTHER" &&
        renderRelation("MOTHER", "Mother", false)}

      {selectedRelations.GUARDIAN && primary !== "GUARDIAN" &&
        renderRelation("GUARDIAN", "Guardian", false)}

      {/* ---------------- ADD ANOTHER RELATION ---------------- */}
      {shouldShowAddRelationSelect && (
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Add Another Relation (Optional)
          </label>

          <select
            className="form-select"
            value=""
            onChange={(e) => {
              const rel = e.target.value;
              if (!rel) return;

              setValue(`selectedRelations.${rel}`, true);
            }}
          >
            <option value="">-- Select Relation --</option>

            {!selectedRelations.FATHER && <option value="FATHER">Father</option>}
            {!selectedRelations.MOTHER && <option value="MOTHER">Mother</option>}
            {!selectedRelations.GUARDIAN && <option value="GUARDIAN">Guardian</option>}
          </select>
        </div>
      )}
      {activeModal === "otpInput" && <Popup
        title={"Enter Otp"}
        closeOnOutsideClick={false}
        // children={

        //   <OtpInput email={modalData?.email}
        //     onComplete={handleVerifyOtp}

        //   />



        // }
        children={
          <div>
            <OtpInput
              email={modalData?.email}
              onComplete={handleVerifyOtp}
            />

            {otpSent && <div style={{ marginTop: "12px", textAlign: "center" }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!canResend}
                onClick={() => handleSendOtp(modalData?.email)}
              >
                {canResend ? sendingOtp ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : "Resend OTP" : `Resend in ${timer}s`}
                
              </button>
            </div>}
          </div>
        }
        onClose={closePopup}
      />}
    </>

  );
});

export default Step1ContactDetails;




