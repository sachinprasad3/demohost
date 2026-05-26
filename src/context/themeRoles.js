// themeRoles.js
export const ACTIVE_SCHOOL = "ANKURAM"; // "NEEV" "ANKURAM" "SCHOOL_DEMO"
const SCHOOL_CONFIG = {
  NEEV: {
    ROLE_START: 14, ID: "SCH001", NAME: "Neev Play School",
    ADDRESS:"BHUVI, Ratu Road, Sukhdev Nagar, Near Central bank, Ranchi - 834005 | +91 95075 00002, +91 95072 00002",
  },
  ANKURAM: {
    ROLE_START: 18,  ID: "SCH002",  NAME: "Ankuram Play School",
    ADDRESS:"Karamtoli Chowk, Bariatu Rd, Beside Rahul Hero Showroom, Ranchi-834001",
  },
   SCHOOL_DEMO: {
    ROLE_START: 22,  ID: "SCH003",  NAME: "Play School",
    ADDRESS:"Ranchi, Jharkhand",
  },
};

const CURRENT = SCHOOL_CONFIG[ACTIVE_SCHOOL];
export const UPLOAD_IMAGE_PATH="https://cargofile.s3.ap-south-1.amazonaws.com/PlaySchool/Homeworklist/"
export const ROLE_START = CURRENT.ROLE_START;
export const ROLE_IDS = {OWNER: ROLE_START, ADMIN: ROLE_START+1, TEACHER: ROLE_START + 2, PARENT: ROLE_START + 3,};
export const ROLE_LABELS = { [ROLE_IDS.OWNER]: "OWNER",[ROLE_IDS.ADMIN]: "ADMIN", [ROLE_IDS.TEACHER]: "TEACHER", [ROLE_IDS.PARENT]: "PARENT",};
export const ROLE_OPTIONS = [ { label: "OWNER", value: ROLE_IDS.OWNER }, { label: "ADMIN", value: ROLE_IDS.ADMIN }, { label: "TEACHER", value: ROLE_IDS.TEACHER }, { label: "PARENT", value: ROLE_IDS.PARENT },];
export const SCHOOL_DEFAULT = { ID: CURRENT.ID, NAME: CURRENT.NAME, ADDRESS: CURRENT.ADDRESS,};
export const SCHOOL_KEYS = { ID: "schoolId", NAME: "schoolName", ADDRESS: "schoolAddress",};
export const getRoleIdByLabel = (role) => {
  return ROLE_IDS[role.toUpperCase()] ?? null;
};
