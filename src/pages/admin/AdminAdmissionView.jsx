


import React, { useState, useRef, useEffect } from "react";
import { Save, CreditCard } from "lucide-react";

import AdmissionFormProvider from "../../context/AdmissionFormContext";


import Step0StudentDetails from "../../components/AmissionFormComponents/Step0StudentDetails";
import Step1ContactDetails from "../../components/AmissionFormComponents/Step1ContactDetails";
import Step2FeePlans from "../../components/AmissionFormComponents/Step2FeePlans";
import Step3DocumentUpload from "../../components/AmissionFormComponents/Step3DocumentUpload";
import Step4ProceedToPayment from "../../components/AmissionFormComponents/Step4ProceedToPayment";
import { useAdmissionController } from "../../components/AmissionFormComponents/hooks/useAdmissionController";
import useAdmissionFormContext from "../../hooks/useAdmissionFormContext";
import { useLocation } from "react-router-dom";
import useFetchCandidateDetails from "../../components/AmissionFormComponents/hooks/useFetchCandidateDetails";
import useUpdateStudentDetailsByAdmin from "../../components/AmissionFormComponents/hooks/useUpdateStudentDetailsByAdmin";
import { useNotification } from "../../context/NotificationContext";
import useStep1ContactDetails from "../../components/AmissionFormComponents/hooks/useStep1ContactDetails";
import { useAuth } from "../../context/AuthContext";




const AdminAdmissionView = () => {
    const location = useLocation();
    const { showNotification } = useNotification();

    const {
        formData,
        languages,
        siblings,
        hasSibling,
        setStudentId,
        setCandidateId,
        SetFamilyDetails,
        AdmissionContextLoading
    } = useAdmissionFormContext();

    const {
        step,
        setStep,
        errors,
        admissionContextErrors,
        validateCurrentStep,
        clearFieldError,
        clearSiblingFieldError,
        setFieldError,
        clearStepErrors,
        validateAllStepAtOnceHandler

    } = useAdmissionController({ formData, languages, siblings, hasSibling });
    const { studentId, candidateId } = location.state || {};
    const [isSaving, setIsSaving] = useState(false)
    const step1Ref = useRef(null);
   const{user} = useAuth()

// const prevPathRef = useRef(location.pathname);

// useEffect(() => {
//     console.log("pathname",location.pathname)
//   if (prevPathRef.current !== location.pathname) {
//     localStorage.removeItem("studentId");
//     localStorage.removeItem("candidateId");
//   }
//   prevPathRef.current = location.pathname;
// }, [location.pathname]);


    const {
        saveCurrentStep,
        // saveFamilyDetails,
        uploadDocuments
    } = useUpdateStudentDetailsByAdmin();
    const { fetchCandidateDetails } = useFetchCandidateDetails();
    // const { saveFamilyDetails } = useStep1ContactDetails()

    // console.log("formData from admin", formData)
    useEffect(() => {
        const sid = studentId || localStorage.getItem("studentId");
        const cid = candidateId || localStorage.getItem("candidateId");

        if (sid) setStudentId(sid);
        if (cid) setCandidateId(cid);
    }, [studentId, candidateId, setStudentId, setCandidateId]);
const stepRefs = [
  useRef(null), // Step 0 - Student Details
  useRef(null), // Step 1 - Contact Details
  useRef(null), // Step 2 - Fee & Transport
  useRef(null), // Step 3 - Documents
];

    const paymentRef = useRef(null);
    const handleProceedToPayment = () => {
        if (paymentRef.current) {
            paymentRef.current.startPayment();
        }
    };
        //  console.log("errors for scrollToFirstErrorStep",errors)

    const scrollToFirstErrorStep = (errorsObj) => {
  const stepKeys = Object.keys(errorsObj)
    .map(Number)
    .sort((a, b) => a - b);

  for (const stepIndex of stepKeys) {
    const stepErrors = errorsObj[stepIndex];

    if (stepErrors && Object.keys(stepErrors).length > 0) {
      stepRefs[stepIndex]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      break;
    }
  }
};


    const handleUpdateStudent = async () => {
        const hasErrors = validateAllStepAtOnceHandler();
       const isValid = await step1Ref?.current?.validateStep()
        if (hasErrors) {
            scrollToFirstErrorStep(errors);
            return;
        }else if(!isValid){
            stepRefs[1]?.current?.scrollIntoView({
                behavior:"smooth",
                block:"start"
            })
            return
        }

        // proceed with API calls

        try {
            setIsSaving(true);

            // STEP 1: Save main form
            const stepRes = await saveCurrentStep();
            if (!stepRes?.success) {
                throw new Error("Failed to save student details");
            }

            // STEP 2: Save family details
            const familyRes = await step1Ref?.current?.saveFamilyDetails();
            console.log("familyRes",familyRes)
            if (!familyRes?.success) {
                throw new Error("Failed to save family details");
            }

            // STEP 3: Upload documents
            const docRes = await uploadDocuments();
            if (!docRes?.success) {
                throw new Error("Failed to upload documents");
            }

            if (studentId) {
                fetchCandidateDetails({ studentId });
            } else {
                fetchCandidateDetails({ candidateId });
            }

            showNotification({
                message: "Student details updated successfully",
                type: "success",
                duration: 2000
            });


        } catch (error) {
            console.error(error);

            showNotification({
                message: error.message || "Something went wrong",
                type: "error",
                duration: 2000
            });
        } finally {
            setIsSaving(false);
        }
    };
    // console.log("errors from admin edit", errors)

    return (
        // <AdmissionFormProvider>
        <div className="mainpro">
            <div className="container">
                {/* <AdminSinglePageContent /> */}
                <div className="whitebox1">
                    <h4> Student Details</h4>
                    <div ref={stepRefs[0]}>
                    <Step0StudentDetails errors={errors[0]}  admissionContextErrors={admissionContextErrors} clearSiblingFieldError={clearSiblingFieldError} clearFieldError={clearFieldError} setFieldError={setFieldError} />
</div>
                    <h4> Contact Details</h4>
                    <div ref={stepRefs[1]}>
                    <Step1ContactDetails errors={errors[1]} ref={step1Ref} clearFieldError={clearFieldError} setFieldError={setFieldError} clearStepErrors={clearStepErrors} />
                    </div>
                        {formData?.contacts?.length !== 0 && <>
                        
                         <h4>3. Fee & Transport</h4>
                         <div ref={stepRefs[2]}>
                    <Step2FeePlans errors={errors[2]} clearFieldError={clearFieldError} />
                    </div>
                        </>}
                   

                    <h4> Documents</h4>
                    <div ref={stepRefs[3]}>
                    <Step3DocumentUpload errors={errors[3]} clearFieldError={clearFieldError} />
</div>
                    {(!formData?.studentId && formData?.admissionStatus === "INVOICE_GENERATED") && (
                        <>
                            <h4 className="mt-5 mb-3 text-secondary border-bottom pb-2">
                                 Payment Details
                            </h4>
                            <Step4ProceedToPayment ref={paymentRef} />
                        </>
                    )}

                    <div className="mt-4  pt-3 border-top d-flex justify-between">
                        {(!formData?.studentId && formData?.admissionStatus === "INVOICE_GENERATED") && <button
                            className="btn btn-primary btn-lg d-flex align-items-center gap-2"
                            onClick={handleProceedToPayment}
                        >
                            <CreditCard size={20} />
                            Proceed To Payment
                        </button>}
                        <button
                            className="btn btn-success btn-lg d-flex align-items-center gap-2 px-4"
                            onClick={handleUpdateStudent}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>

                </div>

            </div>
        </div>
        // </AdmissionFormProvider>
    );
};

export default AdminAdmissionView;