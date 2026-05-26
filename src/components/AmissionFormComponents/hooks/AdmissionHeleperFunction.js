export  function parseSiblingsFromApi (data)  {
  const result = [];
const RELATION_CODE_TO_LABEL = {
  BROTHER: "Brother",
  SISTER: "Sister"
};
  for (let i = 1; i <= 5; i++) { // safe upper limit
    if (!data[`sibling${i}Name`]) break;

    result.push({
      id: i,
      type: RELATION_CODE_TO_LABEL[data[`sibling${i}RelationCode`]],
      name: data[`sibling${i}Name`],
      school: data[`sibling${i}School`],
      standard: data[`sibling${i}Class`]
    });
  }

  return result;
};



export function   parseLanguagesFromApi  (data)  {
  const result = [];

  if (data.languageKnownEnglish) {
    result.push({
      language: "English",
      skills: data.languageKnownEnglish
        .split(",")
        .map(s => s.toLowerCase())
    });
  }

  if (data.languageKnownHindi) {
    result.push({
      language: "Hindi",
      skills: data.languageKnownHindi
        .split(",")
        .map(s => s.toLowerCase())
    });
  }

  if (data.languageKnownOthers) {
    const [lang, ...skills] = data.languageKnownOthers.split(",");

    result.push({
      language: lang,
      skills: skills.map(s => s.toLowerCase())
    });
  }

  return result;
};


export function  buildLanguageFields  (languages)  {
  const payload = {
    languageKnownEnglish: "",
    languageKnownHindi: "",
    languageKnownOthers: ""
  };;

  languages.forEach(({ language, skills }) => {
    if (!skills || skills.length === 0) return;

    const skillStr = skills.map(s => s.toUpperCase()).join(",");

    if (language === "English") {
      payload.languageKnownEnglish = skillStr;
    } 
    else if (language === "Hindi") {
      payload.languageKnownHindi = skillStr;
    } 
    else {
      payload.languageKnownOthers = `${language},${skillStr}`;
    }
  });

  return payload;
};

export function  buildSiblingFields (siblings)  {
    const RELATION_CODE_MAP = {
  Brother: "BROTHER",
  Sister: "SISTER"
};
  const payload = {};

  siblings.forEach((sib, index) => {
    const i = index + 1;

    payload[`sibling${i}Name`] = sib.name || "";
    payload[`sibling${i}RelationCode`] =
      RELATION_CODE_MAP[sib.type] || "";
    payload[`sibling${i}School`] = sib.school || "";
    payload[`sibling${i}Class`] = sib.standard || "";
  });

  return payload;
};

export function mapGetDocumentsToState (apiDocs = [])  {
  return apiDocs.reduce((acc, doc) => {
    let documentName = null;

    if (doc.ownerType === "CANDIDATE" && doc.documentCode === 1) {
      documentName = "childPhoto";
    }else if (doc.ownerType === "CANDIDATE" && doc.documentCode === 5) {
      documentName = "childAadhar";
    }else if (doc.ownerType === "CANDIDATE" && doc.documentCode === 2) {
      documentName = "childDobCertificate";
    }
    
    else if (doc.ownerType === "MOTHER" && doc.documentCode === 1) {
      documentName = "motherPhoto";
    } else if (doc.ownerType === "FATHER" && doc.documentCode === 1) {
      documentName = "fatherPhoto";
    }else if (doc.ownerType === "GUARDIAN" && doc.documentCode === 1) {
      documentName = "guardianPhoto";
    }

    // Skip unknown mappings
    if (!documentName) return acc;

    acc[documentName] = {
      ownerId: doc.ownerId,
      ownerType: doc.ownerType,
      documentCode: doc.documentCode,
      documentStage: doc.documentStage,
      academicYear: doc.academicYear,
      candidateId: doc.candidateId,

      documentId: doc.documentId,
      file: doc?.storagePath,
      // storagePath: doc.storagePath,

      // frontend-only
      // file: null,
      // isUploaded: true
    };

    return acc;
  }, {});
};

export const sanitizeValue = (value, allow, maxLength) => {
  if (value == null) return "";

  // 1?? Detect if user typed a trailing space
  const hasTrailingSpace = value.endsWith(" ");

  let result = value;

  // 2?? Remove unwanted characters
  switch (allow) {
    case "alpha":
      result = result.replace(/[^a-zA-Z\s]/g, "");
      break;
    case "numeric":
      result = result.replace(/[^0-9]/g, "");
      break;
    case "alphanumeric":
      result = result.replace(/[^a-zA-Z0-9\s]/g, "");
      break;
    default:
      break;
  }

  // 3?? Collapse multiple spaces into one
  result = result.replace(/\s+/g, " ");

  // 4?? Remove ALL leading spaces
  result = result.replace(/^ +/, "");

  // 5?? Restore exactly ONE trailing space if user typed one
  if (hasTrailingSpace && result !== "" && !result.endsWith(" ")) {
    result += " ";
  }

  // 6?? Enforce max length
  if (maxLength) {
    result = result.slice(0, maxLength);
  }

  return result;
};


export function SetFamilyDetails  (relationshipCode, contact)  {
  if(!relationshipCode) return
  switch (relationshipCode) {

    case "FATHER":
      setFormData((prev) => ({
        ...prev,
        fatherName: contact.contactName,
        fatherOccupation: contact.contactOccupation,
        fatherPhone: contact.phonePrimary,
        fatherOfficePhone: contact.contactOfficePhone,
        fatherEmail: contact.contactEmail,
        fatherEducation: contact.contactEducation,
        fatherDesignation: contact.contactDesignation,
        fatherOrganisation: contact.contactOrganisation,
        fatherOfficeAddress: contact.contactOfficeAddress,
        fatherDefaultAddress: contact.defaultAddress,
        fatherCity: contact.city,
        fatherState: contact.state,
        fatherPinCode: contact.pinCode,
        fatherFeePayer: contact.feePayer,
        fatherEmergencyContact:contact.primaryContactEmergency,
        fatherPrimaryPickup:contact.primaryPickupPerson,
        fatherHomeAddressLine1:contact.addressLine1,
        fatherHomeAddressLine2:contact.addressLine2
        
      }));
      break;

    case "MOTHER":
      setFormData((prev) => ({
        ...prev,
        motherName: contact.contactName,
        motherOccupation: contact.contactOccupation,
        motherPhone: contact.phonePrimary,
        motherOfficePhone: contact.contactOfficePhone,
        motherEmail: contact.contactEmail,
        motherEducation: contact.contactEducation,
        motherDesignation: contact.contactDesignation,
        motherOrganisation: contact.contactOrganisation,
        motherOfficeAddress: contact.contactOfficeAddress,
        motherDefaultAddress: contact.defaultAddress,
        motherCity: contact.city,
        motherState: contact.state,
        motherPinCode: contact.pinCode,
        motherFeePayer:contact.feePayer,
        motherEmergencyContact:contact.primaryContactEmergency,
        motherPrimaryPickup:contact.primaryPickupPerson,
        motherHomeAddressLine1:contact.addressLine1,
        motherHomeAddressLine2:contact.addressLine2
      }));
      break;

    case "GUARDIAN":
      setFormData((prev) => ({
        ...prev,
        guardianName: contact.contactName,
        guardianOccupation: contact.contactOccupation,
        guardianPhoneHome: contact.phonePrimary,
        guardianPhoneOffice: contact.contactOfficePhone,
        guardianEmail: contact.contactEmail,
        guardianEducation:contact.contactEducation,
        guardianDesignation:contact.contactDesignation,
        guardianOrganisation:contact.contactOrganisation,
        // guardianRelationCode: contact.contactRelationshipCode,
        guardianOfficeAddress: contact.contactOfficeAddress,
        guardianDefaultAddress:contact.defaultAddress,
        guardianCity:contact.city,
        guardianState:contact.state,
        guardianPinCode:contact.pinCode,
        guardianHomeAddressLine1:contact.addressLine1,
        guardianHomeAddressLine2:contact.addressLine2
      }));
      break;

    default:
      break;
  }
};



const ADMISSION_PAYLOAD_KEYS = [
  "studentId",
  "admissionRegistrationNo",
  "candidateId",
  "academicYear",
  "termId",
  "payerId",
  "classId",
  "sectionId",
  "feePlanId",
  "pickupLocationId",
  "pickupLocationName",
  "pickupLatitude",
  "pickupLongitude",
  "pickupDistanceInKm",
  "pickupMonthlyFare",
  "rollNumber",

  "studentFirstName",
  "studentMiddleName",
  "studentLastName",
  "joiningDate",
  "gender",
  "dateOfBirth",
  "placeOfBirth",
  "heightInInches",
  "weightInKg",
  "bloodGroup",
  "languageSpokenHome",

  "languageKnownEnglish",
  "languageKnownHindi",
  "languageKnownOthers",

  "alergyDisabilityEtc",
  "familyPhysicianName",
  "familyPhysicianPhone",

  "previousSchoolAttended",
  "prevClassAttended",

  "siblingStudentId",
  "sibling1Name",
  "sibling1RelationCode",
  "sibling1School",
  "sibling1Class",
  "sibling2Name",
  "sibling2RelationCode",
  "sibling2School",
  "sibling2Class",
  "siblingInfo",

  "documentsUploaded",
  "enrollmentDate",
  "studentPickupLocation",
  "remarks",

  "effectiveFrom",
  "effectiveTo",
  "feesClearedTill",

  "status",
  "createdBy",
  "lastUpdatedBy",

  "feePlanEffectiveDate",
  "promotedToClassId",
  "promotionYear",
  "promotionEnteredBy",
  "promotionEntryDate"
];

export const buildAdmissionPayload = (finalFormData) => {
  const payload = {};

  ADMISSION_PAYLOAD_KEYS.forEach(key => {
    if (finalFormData[key] !== undefined && finalFormData[key] !== null) {
      payload[key] = finalFormData[key];
    }
  });

  return payload;
};


export const mapApiToFormValues = (apiData = []) => {
  const values = {
    primaryContactAcademic: "",
    selectedRelations: {
      FATHER: false,
      MOTHER: false,
      GUARDIAN: false,
    },
  };

  if (!Array.isArray(apiData)) return values;

  // -------- PRIMARY CONTACT --------
  const primaryContact = apiData.find(
    (c) => c?.primaryContactAcademic === "Y"
  );

  if (primaryContact) {
    values.primaryContactAcademic = primaryContact.contactRelationshipCode;
  }

  // -------- RELATION DATA --------
  apiData.forEach((c) => {
    const rel = c.contactRelationshipCode;
    if (!rel) return;

    values.selectedRelations[rel] = true;
    const prefix = rel.toLowerCase();

    values[`${prefix}Name`] = c.contactName || "";
    values[`${prefix}Occupation`] = c.contactOccupation || "";

    // ?? PHONE MAPPING (Guardian differs)
    if (rel === "GUARDIAN") {
      values.guardianPhoneHome = c.phonePrimary || "";
      values.guardianOfficePhone = c.contactOfficePhone || "";
    } else {
      values[`${prefix}Phone`] = c.phonePrimary || "";
      values[`${prefix}OfficePhone`] = c.contactOfficePhone || "";
    }

    values[`${prefix}Email`] = c.contactEmail || "";
    values[`${prefix}Education`] = c.contactEducation || "";
    values[`${prefix}Designation`] = c.contactDesignation || "";
    values[`${prefix}Organisation`] = c.contactOrganisation || "";
    values[`${prefix}OfficeAddress`] = c.contactOfficeAddress || "";

    values[`${prefix}HomeAddressLine1`] = c.addressLine1 || "";
    values[`${prefix}HomeAddressLine2`] = c.addressLine2 || "";
    values[`${prefix}City`] = c.city || "";
    values[`${prefix}State`] = c.state || "";
    values[`${prefix}PinCode`] = c.pinCode || "";
  });

  return values;
};

export const yn = (c) => (c ? "Y" : "N");

export function buildContactPayload({
  rel,
  values,
  candidateId,
  studentId,
  getAdmissionAddressId,
  appUserId,
  primary,
}) {
  const p = rel.toLowerCase();
  const isPrimary = primary === rel;

  return {
    contactRelationshipCode: rel,
    admissionAddressId: getAdmissionAddressId(rel),
    candidateId,
    studentId,
    appUserId,
    active: "Y",

    contactName: values[`${p}Name`],
    contactOccupation: values[`${p}Occupation`],

    phonePrimary:
      rel === "GUARDIAN"
        ? values.guardianPhoneHome
        : values[`${p}Phone`],

    contactOfficePhone: values[`${p}OfficePhone`],
    contactEmail: values[`${p}Email`],
    contactEducation: values[`${p}Education`],
    contactDesignation: values[`${p}Designation`],
    contactOrganisation: values[`${p}Organisation`],
    contactOfficeAddress: values[`${p}OfficeAddress`],

    addressLine1: values[`${p}HomeAddressLine1`],
    addressLine2: values[`${p}HomeAddressLine2`],
    city: values[`${p}City`],
    state: values[`${p}State`],
    pinCode: values[`${p}PinCode`],

    guardian: yn(isPrimary),
    defaultAddress: yn(isPrimary),
    feePayer: yn(isPrimary),
    primaryPickupPerson: yn(isPrimary),
    primaryContactEmergency: yn(isPrimary),
    primaryContactAcademic: yn(isPrimary),
  };
}
