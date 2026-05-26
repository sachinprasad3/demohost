// themeRoles.js
export const ROLE_START = 15 //Neev;  18; //Ankuram
export const ROLE_IDS = { ADMIN: ROLE_START,  TEACHER: ROLE_START + 1,  PARENT: ROLE_START + 2,};

export const ROLE_LABELS = { [ROLE_IDS.ADMIN]: "ADMIN",  [ROLE_IDS.TEACHER]: "TEACHER",  [ROLE_IDS.PARENT]: "PARENT"};

export const ROLE_OPTIONS = [
  { label: ROLE_LABELS[ROLE_IDS.ADMIN], value: ROLE_IDS.ADMIN },
  { label: ROLE_LABELS[ROLE_IDS.TEACHER], value: ROLE_IDS.TEACHER },
  { label: ROLE_LABELS[ROLE_IDS.PARENT], value: ROLE_IDS.PARENT },
];

export const SCHOOL_DEFAULT = {
  // ID: "SCH002",
  // NAME: "Ankuram Play School",
  // ADDRESS:"Karamtoli Chowk, Bariatu Rd, Beside Rahul Hero Showroom, Ranchi-834001",

  ID: "SCH001",
  NAME: "Neev Play School",
  ADDRESS:"BHUVI, Ratu Road, Sukhdev Nagar, Near Central bank, Ranchi - 834005 | +91 95075 00002, +91 95072 00002",
};

export const SCHOOL_KEYS = {
  ID: "schoolId",
  NAME: "schoolName",
  ADDRESS: "schoolAddress",
};

export const getRoleIdByLabel = (role) => {
console.log("getRoleIdByLabel", role  )


  return (
    ROLE_OPTIONS.find((roleOpt) => roleOpt.label === role)?.value || ROLE_START
  );
};