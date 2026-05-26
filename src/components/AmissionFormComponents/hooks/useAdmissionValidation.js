
import { useAuth } from "../../../context/AuthContext";
import useAdmissionFormContext from "../../../hooks/useAdmissionFormContext";
import { validateDob, validateGmail, validateMobile } from "../../../utills/validation";

export function useAdmissionValidation({
  languages = [],
  siblings = [],
  formData = {},
  hasSibling,
  errors
} = {}) {
const {user} = useAuth()
  const {studentDocuments} = useAdmissionFormContext()

  const isFather = formData.primaryContactAcademic === "FATHER";
  const isMother = formData.primaryContactAcademic === "MOTHER";
  const isGuardian = formData.primaryContactAcademic === "GUARDIAN";


  const validateSiblings = (hasSibling, siblings) => {
    const errors = {};
    
    if (!hasSibling) return errors;

    if (!siblings || siblings.length === 0) {
      errors["siblings"] = "Please add sibling details";
      return errors;
    }

    siblings.forEach((sib, index) => {
      if (!sib.name)
        errors[`siblings.${index}.name`] = "Name is required";
      if (!sib.school)
        errors[`siblings.${index}.school`] = "School is required";
      if (!sib.standard)
        errors[`siblings.${index}.standard`] = "Standard is required";
    });

    return errors;
  };

  const selected = formData.selectedRelations || {};

  const isFatherSelected = !!selected.FATHER;
  const isMotherSelected = !!selected.MOTHER;
  const isGuardianSelected = !!selected.GUARDIAN;


  const validateRelations = () => {
    const newErrors = {};

    /* ================== FATHER ================== */
    if (isFatherSelected) {
      if (!formData.fatherName)
        newErrors.fatherName = "Father's name is required";

      if (!formData.fatherPhone) {
        newErrors.fatherPhone = "Father's phone number is required";
      } else if (!validateMobile(formData.fatherPhone)) {
        newErrors.fatherPhone = "Starts with 6–9, 10 digits total";
      }

      if (formData.fatherOfficePhone && !validateMobile(formData.fatherOfficePhone)) {
        newErrors.fatherOfficePhone = "Starts with 6–9, 10 digits total";
      }

      if (!formData.fatherCity)
        newErrors.fatherCity = "City is required";

      if (!formData.fatherState)
        newErrors.fatherState = "State is required";

      if (!formData.fatherPinCode){
        newErrors.fatherPinCode = "Pin Code is required";
      }else if(formData.fatherPinCode.length<6){
      
        newErrors.fatherPinCode = "Enter 6 digit pin code";

      }

      if (!formData.fatherHomeAddressLine1)
        newErrors.fatherHomeAddressLine1 = "Father's home address is required";
    }

    /* ================== MOTHER ================== */
    if (isMotherSelected) {
      if (!formData.motherName)
        newErrors.motherName = "Mother's name is required";

      if (!formData.motherPhone) {
        newErrors.motherPhone = "Mother's phone number is required";
      } else if (!validateMobile(formData.motherPhone)) {
        newErrors.motherPhone = "Starts with 6–9, 10 digits total";
      }

      if (formData.motherOfficePhone && !validateMobile(formData.motherOfficePhone)) {
        newErrors.motherOfficePhone = "Starts with 6–9, 10 digits total";
      }

      if (!formData.motherCity)
        newErrors.motherCity = "City is required";

      if (!formData.motherState)
        newErrors.motherState = "State is required";

      if (!formData.motherPinCode)
        newErrors.motherPinCode = "Pin Code is required";
      else if(formData.motherPinCode.length<6){
      
        newErrors.motherPinCode = "Enter 6 digit pin code";

      }

      if (!formData.motherHomeAddressLine1)
        newErrors.motherHomeAddressLine1 = "Mother's Home address is required";
    }

    /* ================== GUARDIAN ================== */
    if (isGuardianSelected) {
      if (!formData.guardianName)
        newErrors.guardianName = "Guardian name is required";

      if (!formData.guardianPhoneHome) {
        newErrors.guardianPhoneHome = "Guardian phone number is required";
      } else if (!validateMobile(formData.guardianPhoneHome)) {
        newErrors.guardianPhoneHome = "Starts with 6–9, 10 digits total";
      }

      if (!formData.guardianCity)
        newErrors.guardianCity = "City is required";

      if (!formData.guardianState)
        newErrors.guardianState = "State is required";

      if (!formData.guardianPinCode)
        newErrors.guardianPinCode = "Pin Code is required";
      else if(formData.guardianPinCode.length<6){
      
        newErrors.guardianPinCode = "Enter 6 digit pin code";

      }

      if (!formData.guardianHomeAddressLine1)
        newErrors.guardianHomeAddressLine1 = "Guardian Home address is required";
    }

    return newErrors;
  };





  const validateLanguages = (languages) => {
    const errors = {};

    if (!languages || languages.length === 0) {
      errors.languagesKnown = "Please select at least one language";
      return errors;
    }

    languages.forEach((lang) => {
      if (!lang.skills || lang.skills.length === 0) {
        errors.languagesKnown = `Select at least one skill for ${lang.language}`;
      }
    });

    return errors;
  };



  const validateStep = (currentStep, formData) => {
    let newErrors = {};
    switch (currentStep) {
      case 0: { // Applicant Details (IMPORTANT: block scope)

        if (!formData.studentFirstName) {
          newErrors.studentFirstName = "First name is required";
        } else if (formData.studentFirstName.length > 20) {
          newErrors.studentFirstName = "First name cannot be more than 20 characters";
        }

        if (!formData.studentLastName) {
          newErrors.studentLastName = "Last name is required";
        } else if (formData.studentLastName.length > 20) {
          newErrors.studentLastName = "Last name cannot be more than 20 characters";
        }


        if (!formData.gender)
          newErrors.gender = "Please select gender";

        if (!formData.dateOfBirth) {
         newErrors.dateOfBirth = "Date of birth is required";
        } 
          if (!formData.bloodGroup)
          newErrors.bloodGroup = "Please select blood group";

        if (!formData.classId)
          newErrors.classId = "Please select class";

        if (!formData.placeOfBirth)
          newErrors.placeOfBirth = "Please enter Place of birth";

        if (!formData.heightInInches)
          newErrors.heightInInches = "Please enter Height";

        if (!formData.weightInKg)
          newErrors.weightInKg = "Please enter weight";

        if (!formData.languageSpokenHome)
          newErrors.languageSpokenHome = "Please enter language spoken at home";

        if (formData.email && !validateGmail(formData.email)) {
          newErrors.email = "Please enter a valid Gmail address";
        }
        if (!formData.admissionYear)
          newErrors.admissionYear = "Please Select Year"

         if (formData.familyPhysicianPhone) {
              if (!validateMobile(formData.familyPhysicianPhone)) {
                newErrors.familyPhysicianPhone = "Starts with 6–9, 10 digits total";
              }
            }
        // ===== Language validation =====
        //     Object.assign(newErrors, validateLanguages(languages));


        //     // ===== Sibling validation =====
        //     Object.assign(
        //   newErrors,
        //   validateSiblings(formData.haveSibling, siblings)
        // );

        break;
      }
      case 1: //Contact Details
        {
          if (!formData?.primaryContactAcademic) newErrors.primaryContactAcademic = "Please select any one as primary Contact"
          if (isFather) {
            if (!formData.fatherName) newErrors.fatherName = "Father's name is required";
            if (!formData.fatherPhone) {
              newErrors.fatherPhone = "Father's phone number is required";
            } else if (!validateMobile(formData.fatherPhone)) {
              newErrors.fatherPhone = "Starts with 6–9, 10 digits total";
            }
            if (formData.fatherOfficePhone) {
              if (!validateMobile(formData.fatherOfficePhone)) {
                newErrors.fatherOfficePhone = "Starts with 6–9, 10 digits total";
              }
            }
            if (!formData.fatherCity) newErrors.fatherCity = "City is required";
            if (!formData.fatherState) newErrors.fatherState = "State is required";
            if (!formData.fatherPinCode) newErrors.fatherPinCode = "Pin Code is required";
            else if(formData.fatherPinCode.length<6){
       
        newErrors.fatherPinCode = "Enter 6 digit pin code";

      }
            // if (!formData.fatherOfficeAddress) newErrors.fatherOfficeAddress = "Father's office is required";
           if(!formData.fatherEmail) {newErrors.fatherEmail = "Father's Gmail is required"}
            else if ( !validateGmail(formData.fatherEmail)) {
          newErrors.fatherEmail = "Please enter a valid Gmail address";
        }
          }
          if (isMother) {
            if (!formData.motherName) newErrors.motherName = "Mother's name is required";
            if (!formData.motherPhone) {
              newErrors.motherPhone = "Mother's phone number is required";
            } else if (!validateMobile(formData.motherPhone)) {
              newErrors.motherPhone = "Starts with 6–9, 10 digits total";
            }
            if (formData.motherOfficePhone) {
              if (!validateMobile(formData.motherPhone)) {
                newErrors.motherOfficePhone = "Starts with 6–9, 10 digits total";
              }
            }
            if (!formData.motherCity) newErrors.motherCity = "City is required";
            if (!formData.motherState) newErrors.motherState = "State is required";
            if (!formData.motherPinCode) newErrors.motherPinCode = "Pin Code is required";
            else if(formData.motherPinCode.length<6){
      
        newErrors.motherPinCode = "Enter 6 digit pin code";

      }
            // if (!formData.motherOfficeAddress) newErrors.motherOfficeAddress = "Mother's office address is required";
            if(!formData.motherEmail) {newErrors.motherEmail = "Mother's Gmail is required"}
            else if ( !validateGmail(formData.motherEmail)) {
          newErrors.motherEmail = "Please enter a valid Gmail address";
        }
          }

          if (isGuardian) {
            if (!formData.guardianName) newErrors.guardianName = "Guardian name is required";
            if (!formData.guardianPhoneHome) {
              newErrors.guardianPhoneHome = "Guardian phone number is required";
            } else if (!validateMobile(formData.guardianPhoneHome)) {
              newErrors.guardianPhoneHome = "Starts with 6–9, 10 digits total";
            }
            if (!formData.guardianCity) newErrors.guardianCity = "City is required";
            if (!formData.guardianState) newErrors.guardianState = "State is required";
            if (!formData.guardianPinCode) newErrors.guardianPinCode = "Pin Code is required";
            else if(formData.guardianPinCode.length<6){
      
        newErrors.guardianPinCode = "Enter 6 digit pin code";

      }
            if(!formData.guardianEmail) {newErrors.guardianEmail = "Guardian's Gmail is required"}
            else if ( !validateGmail(formData.guardianEmail)) {
          newErrors.guardianEmail = "Please enter a valid Gmail address";
        }
        //     if (formData.guardianEmail && !validateGmail(formData.guardianEmail)) {
        //   newErrors.guardianEmail = "Please enter a valid Gmail address";
        // }
          }
          const existingStepErrors = errors?.[currentStep] || {};
Object.assign(newErrors, existingStepErrors);
          const relationErrors = validateRelations();
          Object.assign(newErrors, relationErrors);
          if (Object.keys(newErrors).length > 0) {
            return newErrors;
          }
        }
        break;
      case 2:
        
        if (!("transportFacility" in formData)) {
          newErrors.transportFacility = "Transport facility field is missing";
        }
        else if (formData.transportFacility === null || formData.transportFacility === undefined) {
          newErrors.transportFacility = "Select transport facility";
        }
        else if (formData.transportFacility === "true" && !formData.pickupLocationId) {
          newErrors.pickupLocationId = "Select pickup location";
        }
        if (!formData.feePlanId) newErrors.feePlanId = "Please select fee plan";
        // if (!formData.joiningDate) {
        //   newErrors.joiningDate = "Select joining date";
        // }
        if (!formData.joiningDate) {
  newErrors.joiningDate = "Select joining date";
} else if(!formData?.studentId && formData?.joiningDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // remove time

  const joiningDate = new Date(formData.joiningDate);
  joiningDate.setHours(0, 0, 0, 0);

  // if (joiningDate < today) {
  //   newErrors.joiningDate = "Joining date cannot be before today";
  // }
  if (formData.admissionYear) {
    const [startYear, endYear] = formData.admissionYear
      .split("-")
      .map(Number);

    const academicStart = new Date(startYear, 3, 1); // 1 April
    academicStart.setHours(0, 0, 0, 0);

    const academicEnd = new Date(endYear, 2, 31); // 31 March
    academicEnd.setHours(0, 0, 0, 0);

    if (joiningDate < academicStart || joiningDate > academicEnd) {
      newErrors.joiningDate =
        `Joining date must be between 1 April ${startYear} and 31 March ${endYear}`;
    }
  }
}


        else if (formData.createdAt) {
          const joiningDate = new Date(formData.joiningDate);
          const createdAt = new Date(formData.createdAt);
          joiningDate.setHours(0, 0, 0, 0);
          createdAt.setHours(0, 0, 0, 0);

          const diffDays =
            (joiningDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        }
        if (user?.role !== "ADMIN") {
  if (!formData.termsAgreed || formData.termsAgreed === "N") {
    newErrors.termsAgreed = "Please check Terms and Condition";
  }
}

        break;
       case 3: {
  const MIN_SIZE = 20 * 1024;
  const MAX_SIZE = 100 * 1024;

  const docs = studentDocuments || {};

  if (docs.childPhoto?.file) {
    const size = docs.childPhoto.file.size;
    if (size < MIN_SIZE || size > MAX_SIZE) {
      newErrors.childPhoto = "Child photo must be between 20 KB and 100 KB";
    }
  }

  if (docs.childAadhar?.file) {
    const size = docs.childAadhar.file.size;
    if (size < MIN_SIZE || size > MAX_SIZE) {
      newErrors.childAadhar = "Child Aadhar must be between 20 KB and 100 KB";
    }
  }

  if (docs.childDobCertificate?.file) {
    const size = docs.childDobCertificate.file.size;
    if (size < MIN_SIZE || size > MAX_SIZE) {
      newErrors.childDobCertificate =
        "DOB certificate must be between 20 KB and 100 KB";
    }
  }

  if (docs.fatherPhoto?.file) {
    const size = docs.fatherPhoto.file.size;
    if (size < MIN_SIZE || size > MAX_SIZE) {
      newErrors.fatherPhoto = "Father photo must be between 20 KB and 100 KB";
    }
  }

  if (docs.motherPhoto?.file) {
    const size = docs.motherPhoto.file.size;
    if (size < MIN_SIZE || size > MAX_SIZE) {
      newErrors.motherPhoto = "Mother photo must be between 20 KB and 100 KB";
    }
  }

  if (docs.guardianPhoto?.file) {
    const size = docs.guardianPhoto.file.size;
    if (size < MIN_SIZE || size > MAX_SIZE) {
      newErrors.guardianPhoto = "Guardian photo must be between 20 KB and 100 KB";
    }
  }

  break;
}

      default:
        break;
    }
    return newErrors;
  };


  const validateAll = (step) => {
    // 1️⃣ Step-specific validation
    const stepErrors = validateStep(step, formData);

    // 2️⃣ Cross-step validation
    const languageErrors = validateLanguages(languages);
    const siblingErrors = validateSiblings(hasSibling, siblings);
    // 3️⃣ Merge everything
    const mergedErrors = {
      ...stepErrors,
      ...languageErrors,
      ...siblingErrors
    };

    // 4️⃣ Extract sibling-only errors (for context UI)
    const extractedSiblingErrors = {};
    Object.keys(siblingErrors).forEach(key => {
      extractedSiblingErrors[key] = siblingErrors[key];
    });

    return {
      stepErrors: mergedErrors,
      siblingErrors: extractedSiblingErrors,
      hasErrors: Object.keys(mergedErrors).length > 0
    };
  };
const validateAllStepsStepWise = () => {
  const stepWiseErrors = {
    0: {},
    1: {},
    2: {},
    3: {}
  };

  let hasErrors = false;

  // 1️⃣ Validate each step independently
  [0,  2, 3].forEach(step => {
    const stepErrors = validateStep(step, formData);

    if (Object.keys(stepErrors).length > 0) {
      stepWiseErrors[step] = stepErrors;
      hasErrors = true;
    }
  });

  // 2️⃣ Cross-step validation (languages & siblings)
  const languageErrors = validateLanguages(languages);
  const siblingErrors = validateSiblings(hasSibling, siblings);

  if (Object.keys(languageErrors).length > 0) {
    stepWiseErrors[0] = {
      ...stepWiseErrors[0],
      ...languageErrors
    };
    hasErrors = true;
  }

  if (Object.keys(siblingErrors).length > 0) {
    stepWiseErrors[0] = {
      ...stepWiseErrors[0],
      ...siblingErrors
    };
    hasErrors = true;
  }

  // 3️⃣ Extract sibling-only errors (for context UI)
  const extractedSiblingErrors = {};
  Object.keys(siblingErrors).forEach(key => {
    extractedSiblingErrors[key] = siblingErrors[key];
  });

  return {
    stepErrors: stepWiseErrors,        // 👈 STEP-WISE
    siblingErrors: extractedSiblingErrors,
    hasErrors
  };
};



  return {validateAllStepsStepWise, validateStep, validateAll };

  // return { validateStep };
}
