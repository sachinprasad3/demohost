
// hooks/useAdmissionController.js
import { useState } from "react";
import { useAdmissionValidation } from "./useAdmissionValidation";

export function useAdmissionController({ formData, languages, siblings,hasSibling }) {
  const [step, setStep] = useState(0);
  
  
  const [errors, setErrors] = useState({
    0: {},
    1: {},
    2: {},
    3: {}
  });
  const { validateAll,validateAllStepsStepWise } = useAdmissionValidation({formData,languages,siblings,hasSibling,errors});


  
  const [admissionContextErrors, setAdmissionContextErrors] = useState({});





const validateCurrentStep = () => {
  const { stepErrors, siblingErrors, hasErrors } = validateAll(step);

  setErrors(prev => ({
    ...prev,
    [step]: {
      ...prev[step],   
      ...stepErrors
    }
  }));

  setAdmissionContextErrors(prev => {
    const next = { ...prev };

    Object.keys(next).forEach(key => {
      if (key.startsWith("siblings.")) {
        delete next[key];
      }
    });

    return {
      ...next,
      ...siblingErrors
    };
  });

 
  const hasAnyErrors =
    // hasErrors || Object.keys(errors[step] || {}).length > 0;
    hasErrors 

  return hasAnyErrors;
};

const setFieldError = (fieldName, message, step) => {
  setErrors(prev => ({
    ...prev,
    [step]: {
      ...(prev[step] || {}),
      [fieldName]: message
    }
  }));
};




  
const clearFieldError = (fieldName) => {
  setErrors(prev => {
    let changed = false;
    const next = { ...prev };

    Object.keys(next).forEach(stepKey => {
      if (next[stepKey]?.[fieldName]) {
        const updated = { ...next[stepKey] };
        delete updated[fieldName];
        next[stepKey] = updated;
        changed = true;
      }
    });

    return changed ? next : prev;
  });
};


  const clearSiblingFieldError = (key) => {
    setAdmissionContextErrors(prev => {
      if (!prev?.[key]) return prev;

      const next = { ...prev };
      delete next[key];
      return next;
    });
  };
const clearStepErrors = (stepIndex) => {
  setErrors(prev => ({
    ...prev,
    [stepIndex]: {},
  }));
};

 const validateAllStepAtOnceHandler = () => {
  const { stepErrors, siblingErrors, hasErrors } = validateAllStepsStepWise();
  console.log("step error",stepErrors)

  if (hasErrors) {
    setErrors(stepErrors);
    setAdmissionContextErrors(siblingErrors);
    return true; 
  }

  return false; 
};


  return {
    step,
    setStep,
clearStepErrors,
    errors,
    admissionContextErrors,
    validateAllStepAtOnceHandler,
setFieldError,
    validateCurrentStep,
    clearFieldError,
    clearSiblingFieldError
  };
}
