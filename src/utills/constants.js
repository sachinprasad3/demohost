import { useNavigate } from "react-router-dom";

export const ROLES = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  PARENT: "PARENT",
};



export const getRoleBasedRedirect = (role) => {
  const redirects = {
    ADMIN: "/admin",
    TEACHER: "/teacher",
    PARENT: "/student"
  };
  return redirects[role] ;
};

export const getCandidateField = (candidate, field) => {
  // console.log("i am running get candidate field",candidate.studentFirstName, field)
  if (!candidate) return null

  switch (field) {
    case 'studentName':
      return [
        candidate.studentFirstName,
        candidate.studentMiddleName,
        candidate.studentLastName
      ].filter(Boolean).join(' ')

    case 'gender':
      return candidate.gender

    case 'dob':
      return candidate.dateOfBirth

    case 'admissionStatus':
      return candidate.admissionStatus

    case 'primaryContact':
      return candidate.contacts?.find(c => c.defaultAddress === 'Y') || null

    case 'mother':
      return candidate.contacts?.find(
        c => c.relationship === 'MOTHER'
      ) || null

    case 'father':
      return candidate.contacts?.find(
        c => c.relationship === 'FATHER'
      ) || null

    case 'guardian':
      return candidate.contacts?.find(
        c => c.relationship === 'GUARDIAN'
      ) || null

    default:
      return candidate[field] ?? null
  }
}

export const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')

   export function formatDateDDMMYYYY (date)  {
  if (!date) return "";
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};



export function extractStudentDetails(studentDetails = {}) {
  const contacts = studentDetails.contacts || [];
      console.log("contacts from fetchStudentDetails",contacts)

  const getContactByRelation = (relation) =>
    contacts.find(
      c => c.contactRelationshipCode?.toUpperCase() === relation
    ) || null;

  const father = getContactByRelation("FATHER");
  const mother = getContactByRelation("MOTHER");
  const guardian = getContactByRelation("GUARDIAN");
    const primaryContact = contacts.find((con)=>con?.primaryContactAcademic === "Y")?.contactRelationshipCode || null;
    const feePayer = contacts.find((con)=>con?.feePayer === "Y")?.contactRelationshipCode || null;
const emergencyContact = contacts.find((con)=>con?.primaryContactEmergency === "Y")?.contactRelationshipCode || null;
  const buildAddress = (c) =>
    [c?.addressLine1, c?.addressLine2].filter(Boolean).join(", ") || null;

  /* ================= PERSONAL DETAILS ================= */
  const personalDetails = {
    candidateId: studentDetails.candidateId,
    academicYear: studentDetails.academicYear,
    inquiryId: studentDetails.inquiryId,
    rollNumber: studentDetails.rollNumber,
    sectionName: studentDetails.sectionName,
    
    classId: studentDetails.classId,
    className: studentDetails.className,

    admissionRegistrationNo: studentDetails.admissionRegistrationNo,
    appliedOn: studentDetails.appliedOn,
    joiningDate: studentDetails.joiningDate,

    studentFirstName: studentDetails.studentFirstName,
    studentMiddleName: studentDetails.studentMiddleName,
    studentLastName: studentDetails.studentLastName,
    studentName: [
      studentDetails.studentFirstName,
      studentDetails.studentMiddleName,
      studentDetails.studentLastName
    ].filter(Boolean).join(" "),

    gender: studentDetails.gender,
    dateOfBirth: studentDetails.dateOfBirth,
    placeOfBirth: studentDetails.placeOfBirth,

    heightInInches: studentDetails.heightInInches,
    weightInKg: studentDetails.weightInKg,
    bloodGroup: studentDetails.bloodGroup,

    languageSpokenHome: studentDetails.languageSpokenHome,
    languageKnownEnglish: studentDetails.languageKnownEnglish,
    languageKnownHindi: studentDetails.languageKnownHindi,
    languageKnownOthers: studentDetails.languageKnownOthers,

    alergyDisabilityEtc: studentDetails.alergyDisabilityEtc,
    familyPhysicianName: studentDetails.familyPhysicianName,
    familyPhysicianPhone: studentDetails.familyPhysicianPhone,

    previousSchoolAttended: studentDetails.previousSchoolAttended,
    prevClassAttended: studentDetails.prevClassAttended,
    primaryContact,
    feePayer,
    emergencyContact,
    documentsUploaded: studentDetails.documentsUploaded,
    sourceAboutSchool: studentDetails.sourceAboutSchool,

    feePlanId: studentDetails.feePlanId,
    termsAgreed: studentDetails.termsAgreed,

    admissionStatus: studentDetails.admissionStatus,
    remarks: studentDetails.remarks,

    createdBy: studentDetails.createdBy,
    createdAt: studentDetails.createdAt,
    lastUpdatedBy: studentDetails.lastUpdatedBy,
    lastUpdatedAt: studentDetails.lastUpdatedAt,

    childPhoto: studentDetails.childPhoto,
    pickupLocationId: studentDetails.pickupLocationId,
    studentPickupLocation:studentDetails.studentPickupLocation
  };

  /* ================= FATHER DETAILS ================= */
  const fatherDetails = father
    ? {
        ...father,
        fullAddress: buildAddress(father)
      }
    : null;

  /* ================= MOTHER DETAILS ================= */
  const motherDetails = mother
    ? {
        ...mother,
        fullAddress: buildAddress(mother)
      }
    : null;

  /* ================= GUARDIAN DETAILS ================= */
  const guardianDetails = guardian
    ? {
        ...guardian,
        fullAddress: buildAddress(guardian)
      }
    : null;

    const userDocument = studentDetails?.appDocDto ;
  /* ================= SIBLING DETAILS ================= */
  const siblingDetails = {
    siblingName: studentDetails.siblingName,
    classIdSibling: studentDetails.classIdSibling,
    rollNoSibling: studentDetails.rollNoSibling,

    sibling1: {
      name: studentDetails.sibling1Name,
      relationCode: studentDetails.sibling1RelationCode,
      school: studentDetails.sibling1School,
      class: studentDetails.sibling1Class
    },

    sibling2: {
      name: studentDetails.sibling2Name,
      relationCode: studentDetails.sibling2RelationCode,
      school: studentDetails.sibling2School,
      class: studentDetails.sibling2Class
    },

    siblingInfo: studentDetails.siblingInfo
  };

  return {
    personalDetails,
    fatherDetails,
    motherDetails,
    guardianDetails,
    siblingDetails,
    userDocument,

    // keeping raw contacts if ever needed
    contacts
  };
}


  export const getAcademicYear = (date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // Jan=0, Feb=1, Mar=2, Apr=3

    // Jan, Feb, March ? previous financial year
    if (month < 3) {
      return `${year - 1}-${year}`;
    }

    // April onwards ? current financial year
    return `${year}-${year + 1}`;
  };
export function  getImageUrl (url) {
  if (!url) return "";
  return `${url}?t=${Date.now()}`;
};
