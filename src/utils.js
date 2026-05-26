// Demo student data
export const initialStudents = Array.from({ length: 12 }).map((_, i) => ({
  id: 1000 + i,
  name: `Student ${i + 1}`,
  class: ["Nursery", "1st", "2nd", "3rd", "4th"][i % 5],
  roll: i + 1,
  totalFee: 20000,
  paid: Math.floor(Math.random() * 20000),
}));

// ✅ Read from localStorage safely
export function readFromStorage(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (err) {
    console.error("Error reading from localStorage:", err);
    return fallback;
  }
}

// ✅ Save to localStorage safely
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Error saving to localStorage:", err);
  }
}

export const formatDate = (dateStr) => {
  if (!dateStr) return "-";

  const date = new Date(dateStr);
  if (isNaN(date)) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


// ✅ Format amount in Indian Rupees (INR)
export function formatINR(amount) {
  if (isNaN(amount)) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export function getCurrentAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // Months are zero-indexed
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

export const isUpcomingAcademicYear = (academicYear) => {
  if (!academicYear) return false;

  const startYear = academicYear.split("-")[0];

  const academicStartDate = new Date(startYear, 3, 1); // month is 0-based → 3 = April
  const now = new Date();

  return academicStartDate > now;
};

export const dateFormaterWithTime = (date) => {
  if (!date) return "-";

  const isDate = new Date(date);
  if (isNaN(isDate)) return "-";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getFullName = (s) => {
    const first = s.studentFirstName || " ";
    const middle = s.studentMiddleName ? s.studentMiddleName + " " : " ";
    const last = s.studentLastName || "";
    return `${first} ${middle} ${last}`.trim();
  };
