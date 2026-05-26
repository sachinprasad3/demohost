import { useRef, useState } from "react";



import useAdmissionFormContext from "../../hooks/useAdmissionFormContext";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import useStudentCandidateIds from "../../hooks/useStudentCandidateIds";
import { useStudent } from "../../context/StudentContext";
import Step0StudentDetails from "./Step0StudentDetails";
import Step1ContactDetails from "./Step1ContactDetails";
import Step2FeePlans from "./Step2FeePlans";
import Step3DocumentUpload from "./Step3DocumentUpload";
import Step4ProceedToPayment from "./Step4ProceedToPayment";

import { useAdmissionController } from "./hooks/useAdmissionController";


const MultiStepFormmm = ({userId}) => {
  const {
    formData,
    saveCurrentStep,
    saveFamilyDetails,
    fetchCandidateDetails,
    uploadDocuments,
    languages,
    siblings,
    hasSibling,
    candidateId,
    AdmissionContextLoading
  } = useAdmissionFormContext();
const steps = ["Student Details",  "Contact Detail","Fee Plan Details","Document Upload", "Payment Summary",];
  const { showNotification } = useNotification();
  const step5Ref = useRef(null);
const {user} = useAuth()
const {propagateCandidates} = useStudent()
const {refetch} = useStudentCandidateIds(user?.userId);
  
const {
  step,
  setStep,
  errors,
  admissionContextErrors,
  validateCurrentStep,
  clearFieldError,
  clearSiblingFieldError,
  setFieldError,
  clearStepErrors
} = useAdmissionController({ formData, languages, siblings,hasSibling });

  const currentErrors = errors[step] || {};
    const step1Ref = useRef(null);
const [step1DisableNext, setStep1DisableNext] = useState(false);
//   const handleNext = async () => {
//   //  Validate current step
//   const hasErrors = validateCurrentStep();

//   //  STOP HERE
//   if (hasErrors) return;
//   let isValid = true;
//   //  Step-specific logic
//   if (step === 1&& step1Ref.current) {
//     isValid = await step1Ref.current.validateStep();
//     if (!isValid) return;
//     const res = await saveFamilyDetails();
//     if (!res?.success) {
//       showNotification({
//         message: "Failed to save data. Try again.",
//         type: "error",
//         duration: 2000
//       });
//       return;
//     }
//   }

//   if (step === 3) {
//     await uploadDocuments();
//     const updatedCandidates = await refetch();
//     await propagateCandidates(updatedCandidates);
//     setStep(step + 1);
//     return;
//   }

//   //  Save current step (API call)
//   const res = await saveCurrentStep();
//   if (!res?.success) {
//     showNotification({
//       message: "Failed to save data. Try again.",
//       type: "error",
//       duration: 2000
//     });
//     return;
//   }
// const updatedCandidates = await refetch();
//     await propagateCandidates(updatedCandidates);
//   //  Move to next step
//   setStep(step + 1);
// };

const handleNext = async () => {
  /* ================= STEP 1 (RHF + Yup) ================= */
  if (step === 1 && step1Ref.current) {
    const isValid = await step1Ref.current.validateStep();
    if (!isValid) return;
// const values = step1Ref.current.getValues();
    // const res = await saveFamilyDetails(values);
    const res = await step1Ref.current.saveFamilyDetails();
    if (!res?.success) {
      showNotification({
        message: "Failed to save data. Try again.",
        type: "error",
        duration: 2000,
      });
      return;
    }

    setStep(prev => prev + 1);
    return;
  }

  /* ================= OTHER STEPS (Custom Validation) ================= */
  const hasErrors = validateCurrentStep();
  if (hasErrors) return;

  /* ================= STEP 3 SPECIAL CASE ================= */
  if (step === 3) {
    await uploadDocuments();

    const updatedCandidates = await refetch();
    await propagateCandidates(updatedCandidates);

    setStep(prev => prev + 1);
    return;
  }

  /* ================= DEFAULT SAVE ================= */
  const res = await saveCurrentStep();

if (!res?.success) {
  showNotification({
    message: "Failed to save data. Try again.",
    type: "error",
    duration: 2000,
  });
  return;
}

const latestCandidateId = res?.data?.data?.candidateId ?? candidateId;

await fetchCandidateDetails(
  latestCandidateId ? { candidateId: latestCandidateId } : undefined
);


  // const updatedCandidates = await refetch();
  // await propagateCandidates(updatedCandidates);

  setStep(prev => prev + 1);
};

const handleProceedToPayment = () => {
    step5Ref.current?.startPayment();
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <Step0StudentDetails errors={currentErrors} admissionContextErrors={admissionContextErrors} clearSiblingFieldError={clearSiblingFieldError} clearFieldError={clearFieldError} setFieldError={setFieldError} />;
      case 1:
        return <Step1ContactDetails userId={userId} onDisableChange={setStep1DisableNext} ref={step1Ref} errors={currentErrors} clearFieldError={clearFieldError} setFieldError={setFieldError} clearStepErrors={clearStepErrors} />;
      case 2:
        return <Step2FeePlans  errors={currentErrors} clearFieldError={clearFieldError} />;
      case 3:
        return <Step3DocumentUpload  errors={currentErrors} clearFieldError={clearFieldError} />;
      case 4:
        return <Step4ProceedToPayment ref={step5Ref} />;
      default:
        return null;
    }
  };

  return (
    <>

    <div className="multistep-form">
        {steps.map((label, index) => (
          <div key={label} className="msf-boxes"> 
            {index > 0 && (
              <div className={`msf-stepline ${step >= index ? "active" : ""}`} ></div>
            )} 
            <div className={`msf-stepcircle ${ step >= index ? "active" : "" } ${step === index ? "current" : ""}`} >
              {index + 1}
            </div> 
            <small className={`msf-small ${step >= index ? "active" : ""}`}>{label}</small>
          </div>
        ))}
      </div> 
      {renderStep()}

      <div className="d-flex justify-content-between mt-4"> 
        <div>
          {step > 0 && (
            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>Previous</button>
          )}
        </div>
        <div>
          {step < 4 && (
            <button className="btn btn-primary" onClick={handleNext} disabled={AdmissionContextLoading 
            // || (step === 1 && step1DisableNext)
            }>
             {AdmissionContextLoading  ? "Saving..." : "Next"}
            </button>
          )}
          {/* {step === 4 && (
            <button className="btn btn-success" onClick={handleProceedToPayment}  >Proceed To Payment</button>
          )} */}
        </div>

      </div>
    </>
  );
};

export default MultiStepFormmm;
