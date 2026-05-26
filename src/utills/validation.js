export const validateMobile = (mobile) => {
  if (!mobile) return false;

  // Must start with 6–9 and be exactly 10 digits
  const regex = /^[6-9]\d{9}$/;

  return regex.test(mobile);
};




export const validateGmail = (email) => {
  if (typeof email !== "string") return false;

  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  return re.test(email);
};
export const validateEmail = (email) => {
  if (typeof email !== "string") return "Email must be a string";

  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!re.test(email)) return "Please enter a valid email id";

  return null; //  Valid
};


// Password validation: min 8 characters, at least one number (can customize)
export const validatePassword = (password) => {
  if (typeof password !== "string") return "Password must be a string";

  if (password.length < 8 || password.length > 32)
    return "Password must be between 8 and 32 characters";

  const validCharsRegex = /^[A-Za-z0-9!@#$%^&*()_+\-=`~[\]\\{}|;':",./<>?]*$/;
  if (!validCharsRegex.test(password))
    return "Password contains invalid characters";

  if (!/[A-Z]/.test(password))
    return "Password must include at least one uppercase letter";

  if (!/[a-z]/.test(password))
    return "Password must include at least one lowercase letter";

  if (!/\d/.test(password))
    return "Password must include at least one number";

  if (!/[!@#$%^&*()_+\-=`~[\]\\{}|;':",./<>?]/.test(password))
    return "Password must include at least one special character";

  return null; // ✅ No errors
};


// Name validation: non-empty, only letters and spaces allowed
export const validateName = (name) => {
  if (typeof name !== "string") return "Name must be a string";

  const trimmed = name.trim();
  if (trimmed.length < 5 || trimmed.length > 50)
    return "Name must be between 5 and 50 characters";

  // Allow letters, spaces, hyphens, and apostrophes
  const re = /^[A-Za-z\s'-]+$/;

  if (!re.test(trimmed))
    return "Name can only contain letters, spaces, hyphens (-), or apostrophes (')";

  return null; // ✅ Valid
};



// Phone validation: basic pattern for digits, min 7 digits (adjust as needed)
export const validatePhoneNO = (phone) => {
  if (typeof phone !== "string") return "Phone number must be a string";

  // const re = /^\+?\d+$/;
  // if (!re.test(phone)) return "Phone number must contain only digits and may start with +";

  const re = /^\+?\d[\d\s]*$/;
if (!re.test(phone)) return "Phone number must contain only digits";


  const digitCount = phone.replace(/\D/g, "").length;
  if (digitCount < 10 || digitCount > 16) return "Phone number must be between 10 and 16 digits";

  return null; //  Valid
};



export function validateDob(dob) {
  if (!dob) return "Invalid date format";

  let date;

  if (dob instanceof Date) {
    date = dob;
  } else {
    const [year, month, day] = dob.split("-").map(Number);
    date = new Date(year, month - 1, day); // local date
  }

  if (Number.isNaN(date.getTime())) {
    return "Invalid date format";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // cutoff = today - 2 years 6 months
  const minDob = new Date(today);
  minDob.setFullYear(minDob.getFullYear() - 2);
  minDob.setMonth(minDob.getMonth() - 6);

  if (date > minDob) {
    return "Age must be at least 2.5 years";
  }

  return null;
}

export function validateGender(gender) {
  const allowed = ["male", "female", "other"]; // adjust as needed

  

  const normalized = gender.trim().toLowerCase();
  if (!allowed.includes(normalized)) {
    return `Gender must be one of: ${allowed.join(", ")}`;
  }

  return null; //  valid, no error
}

// Confirm password check (simple equality)
export const validateConfirmPassword = (password, confirmPassword) => {
  return password === confirmPassword;
};


