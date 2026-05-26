import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";

import { buildContactPayload, mapApiToFormValues, sanitizeValue } from "../hooks/AdmissionHeleperFunction";
import useAdmissionFormContext from "../../../hooks/useAdmissionFormContext";
import { contactDetailsSchema } from "../../../validations/step1admissionContact.schema";
import {  useMobileAvailabilityChecker, useEmailAvailabilityChecker, useGetCandidateContactDetails, useGetStudentContactDetails, useSaveAdmissionContactsCandidate,useSaveAdmissionContactsStudent, useHandleVerifyEmailBySendingOtp, useVerifyOtpRegistration } from "../../../services/admission.services";
import { useNotification } from "../../../context/NotificationContext";
import { usePopup } from "../../../context/PopupContext";

export default function useStep1ContactDetails(props) {
  const { candidateId, studentId } = useAdmissionFormContext();
  const appUserId = props?.userId ?? null;
const [otpSent, setOtpSent] = useState(false);
const [timer, setTimer] = useState(15);
const [canResend, setCanResend] = useState(false);
  const form = useForm({
    resolver: yupResolver(contactDetailsSchema),
    mode: "onBlur",
  });
  const { openPopup, activeModal, closePopup,modalData } = usePopup();

  const {
    watch,
    getValues,
    setValue,
    clearErrors,
    setError,
    trigger,
    reset,
    formState: { errors, isValid },
  } = form;
// console.log("use form",form)
  const primary = watch("primaryContactAcademic");
  const selectedRelations = watch("selectedRelations") || {};
const checkEmailExist = useEmailAvailabilityChecker();
    const { showNotification } = useNotification();
const [emailOtpVerified, setEmailOtpVerified] = useState(false);
const checkMobileExist = useMobileAvailabilityChecker()
  const admissionAddressMapRef = useRef({
    FATHER: null,
    MOTHER: null,
    GUARDIAN: null,
  });
const initialEmailsRef = useRef({});
  const saveCandidateAdmissionContactsMutation = useSaveAdmissionContactsCandidate()
  const saveStudentAdmissionContactsMutation = useSaveAdmissionContactsStudent();
  const ignoreNextBlurRef = useRef(false);
const { mutateAsync:sendOtp, isPending:sendingOtp, isSuccess, isError } = useHandleVerifyEmailBySendingOtp();
  const { data: studentContact } = useGetStudentContactDetails(studentId,{refetchOnWindowFocus: false});
  const { data: candidateContact } = useGetCandidateContactDetails(candidateId,{refetchOnWindowFocus: false});
  const studentData = studentContact?.length ? studentContact : candidateContact;
  const primaryContactUserId = studentData?.find((data)=>(data?.contactRelationshipCode === primary))?.appUserId || null;
  const primaryContactEmailId = studentData?.find((data)=>(data?.contactRelationshipCode === primary))?.contactEmail || "";

// console.log("studentData",primaryContactUserId)
// console.log("candidateContactuse",candidateContact)
  const { mutateAsync: verifyOtp, isPending:verifyOtpPending } =
    useVerifyOtpRegistration();

  const isPrimaryLocked = Boolean(appUserId)   ;

  /* ---------------- Hydrate Address IDs ---------------- */
  // const [otp, setOtp] = useState("");

  const hydrateAddressIds = (apiData) => {
    apiData?.forEach((c) => {
      admissionAddressMapRef.current[c.contactRelationshipCode] =
        c.admissionAddressId || null;
    });
  };

 const didHydrateRef = useRef(false);
// console.log("emailOtpVerified", emailOtpVerified)

useEffect(() => {
  if (!studentData?.length) return;

  if (didHydrateRef.current) return;   // ? ignore refetches

  didHydrateRef.current = true;

  hydrateAddressIds(studentData);
  const mapped = mapApiToFormValues(studentData);
  
  reset(mapped);

  // Store initial emails
  initialEmailsRef.current = {
    fatherEmail: mapped.fatherEmail || "",
    motherEmail: mapped.motherEmail || "",
    guardianEmail: mapped.guardianEmail || "",
  };
  const primary = watch("primaryContactAcademic");

   const primaryEmail =
    mapped[`${primary?.toLowerCase()}Email`] || "";
// console.log("primaryEmail", primary)
  setEmailOtpVerified(Boolean(primaryEmail));

}, [studentData, reset]);

useEffect(() => {
  didHydrateRef.current = false;
}, [candidateId, studentId]);

useEffect(() => {
  if (!otpSent) return;

  if (timer <= 0) {
    setCanResend(true);
    return;
  }

  const interval = setInterval(() => {
    setTimer((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [timer, otpSent]);
const handleEmailCheck = async (email,fieldName) => {
  if (!email?.trim()) return;
    const isValid = await trigger(fieldName);
  if (!isValid) return;
const initialEmail = initialEmailsRef.current[fieldName];

  //  If email is same as original → do nothing
  if (initialEmail === email) {
    // console.log("i am setting emailotpverified")
  setEmailOtpVerified(true)

    return;
  }
  setEmailOtpVerified(false)
  const res = await checkEmailExist(email);
  // console.log("checkEmailExist",res)

  const exists = res.data === true;
  const noError = res.error === false;

  if (exists && noError) {
    setError(`${fieldName}`, {
      type: "manual",
      message: "Email already exists"
    });

    setValue(`${fieldName}`, "");
    return;
  }

  clearErrors(`${fieldName}`);
// handleSendOtp(email,fieldName)
};

// import { useVerifyOtpRegistration } from "../../services/admission.services";
// import { usePopup } from "../../context/PopupContext";
// import { useNotification } from "../../context/NotificationContext";





  const handleVerifyOtp = async (otp) => {
    if (!otp.trim()) return;

    try {
      const message = await verifyOtp({ email: modalData?.email, otp });
      // console.log("message",message)
      if(message === "OTP verified."){
        setEmailOtpVerified(true)
      }
      showNotification({
        message,
        type: "success",
        duration: 2000
      });

      closePopup();

      // OPTIONAL: mark email verified in parent form
      // setValue("emailVerified", true);

    } catch (error) {
      showNotification({
        message:
          error.response?.data?.data?.msg ||
          error.message ||
          "OTP verification failed",
        type: "error",
        duration: 2000
      });
    }
  };

 const startTimer = () => {
  setCanResend(false);
  setTimer(15);
};


const handleSendOtp = async (email, fieldName) => {
    if (sendingOtp) return;
  if (!email?.trim()) {
    setError(fieldName, {
      type: "manual",
      message: "Email is required"
    });
    return;
  }

  try {
    await sendOtp(email);   // ✅ wait for API
setOtpSent(true);
  startTimer();
    clearErrors(fieldName);

    showNotification({
      message: "OTP sent successfully",
      type: "success",
      duration: 2000
    });
ignoreNextBlurRef.current = true;
    openPopup("otpInput", { email });

  } catch (error) {
    setError(fieldName, {
      type: "manual",
      message:
        error.response?.data?.data?.msg ||
        error.message ||
        "Failed to send OTP"
    });
  }
};
const handleMobileCheck = async (mobile,fieldName) => {
  if (!mobile) return;

  const res = await checkMobileExist(mobile);

  const exists = res.data === true;
  const noError = res.error === false;

  if (exists && noError) {
    setError(`${fieldName}`, {
      type: "manual",
      message: "Mobile already exists"
    });

    setValue(`${fieldName}`, "");
    return;
  }

  clearErrors(`${fieldName}`);
};




  
  /* ---------------- Handlers ---------------- */

  const handleFormDataChange = (e, allow, maxLength) => {
    const { name, value } = e.target;

    let cleanValue = value;
    if (allow && maxLength) {
      cleanValue = sanitizeValue(value, allow, maxLength);
    }

    setValue(name, cleanValue, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const fetchAddressDetail = async (pinCode, fieldName) => {
    const fieldMap = {
      fatherPinCode: { city: "fatherCity", state: "fatherState" },
      motherPinCode: { city: "motherCity", state: "motherState" },
      guardianPinCode: { city: "guardianCity", state: "guardianState" },
    };

    const mapping = fieldMap[fieldName];
    if (!mapping) return;

    try {
      const res = await axios.get(
        `https://api.postalpincode.in/pincode/${pinCode}`
      );

    //   const postOffice = res.data?.[0]?.PostOffice?.[0];
     const result = res.data?.[0];
      const postOffice = result?.PostOffice?.[0];

    //   if (postOffice) {
    //     setValue(mapping.city, postOffice.Block || "", { shouldDirty: true });
    //     setValue(mapping.state, postOffice.State || "", { shouldDirty: true });

    //     clearErrors([fieldName, mapping.city, mapping.state]);
    //     return;
    //   }

    //   setError(fieldName, {
    //     type: "manual",
    //     message: "Invalid pincode",
    //   });
     /* ---------- VALID PINCODE ---------- */
      if (postOffice) {
        setValue(mapping.city, postOffice.Block || "", {
          shouldDirty: true,
          shouldValidate: true,
        });

        setValue(mapping.state, postOffice.State || "", {
          shouldDirty: true,
          shouldValidate: true,
        });

        clearErrors([fieldName, mapping.city, mapping.state]);
        return;
      }

      /* ---------- INVALID PINCODE ---------- */
      if (result?.Status === "Error") {
        setValue(mapping.city, "", { shouldDirty: true });
        setValue(mapping.state, "", { shouldDirty: true });

        setError(fieldName, {
          type: "manual",
          message: "Invalid pincode",
        });
      }
    } catch {
      setError(fieldName, {
        type: "manual",
        message: "Unable to verify pincode",
      });
    }
  };

  const handlePrimaryChange = (relation) => {
    setValue("primaryContactAcademic", relation, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue(`selectedRelations.${relation}`, true, {
      shouldDirty: true,
    });

    clearErrors();
    props.clearStepErrors?.(1);
  };

  /* ---------------- Save Logic ---------------- */

  const getAdmissionAddressId = (relation) =>
    admissionAddressMapRef.current[relation] ?? null;


 const admissionTarget = useMemo(() => {
    if (studentId) {
      return { mode: "STUDENT", id: studentId };
    }
    return { mode: "CANDIDATE", id: candidateId };
  }, [studentId, candidateId]);
 const saveFamilyDetails = async () => {
  const isValid = await trigger();   // ✅ capture result
  // console.log("is valid",isValid)

  if (!isValid) {
     showNotification({
                message: "Fill all required details",
                type: "success",
                duration: 2000
            });
    return {success:false}     // ✅ STOP EXECUTION
  }                         // ? CRITICAL SAFETY

  const values = getValues();
  const payload = [];

 

    if (values.selectedRelations?.FATHER) {
  payload.push(
    buildContactPayload({
      rel: "FATHER",
      values,
      candidateId,
      studentId,
      appUserId,
      getAdmissionAddressId,
      primary: values.primaryContactAcademic,
    })
  );
}

  if (values.selectedRelations?.MOTHER) {
    payload.push(
      buildContactPayload({
        rel: "MOTHER",
        values,
        candidateId,
        studentId,
        appUserId,
        getAdmissionAddressId,
        primary: values.primaryContactAcademic,
      })
    );
  }

  if (values.selectedRelations?.GUARDIAN) {
    payload.push(
      buildContactPayload({
        rel: "GUARDIAN",
        values,
        candidateId,
        studentId,
        appUserId,
        getAdmissionAddressId,
        primary: values.primaryContactAcademic,
      })
    );
  }

  if (!payload.length) return { success: true };

  

  let res;

  if (admissionTarget.mode === "STUDENT") {
    res = await saveStudentAdmissionContactsMutation.mutateAsync(payload);
  } else {
    res = await saveCandidateAdmissionContactsMutation.mutateAsync(payload);
  }

  return { success: true, data: res };
};


  return {
    ...form,
    getAdmissionAddressId,
    otpSent,
    canResend ,
    timer,
    errors,
     activeModal, 
     ignoreNextBlurRef,
     closePopup,
     setError,
     handleVerifyOtp,
     sendingOtp,
handleSendOtp,

     verifyOtpPending,
     emailOtpVerified,
     modalData,
    primary,
    selectedRelations,
    isPrimaryLocked,
    handleEmailCheck,
    handleMobileCheck,
    handleFormDataChange,
    fetchAddressDetail,
    handlePrimaryChange,
    saveFamilyDetails,
  };
}
