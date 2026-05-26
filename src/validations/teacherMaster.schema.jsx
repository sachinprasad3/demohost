// teacherMaster.schema.js
import * as yup from "yup";

const phoneRegExp = /^[6-9]\d{9}$/;
const nameRegExp = /^[a-zA-Z\s]*$/;

export const teacherSchema = yup.object().shape({
  fullName: yup
    .string()
    .trim()
    .required("Full Name is required")
    .matches(nameRegExp, "Full Name can only contain letters and spaces"),
  gender: yup.string().required("Gender is required"),
  dateOfBirth: yup
    .string()
    .required("Date of Birth is required")
    .typeError("Invalid Date")
    .test("age", "Must be at least 18 years old", (value) => {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 18;
    }),
  staffType: yup.string().required("Staff Type is required"),
  
  // Custom logic for "Others" is handled in the component via 2 fields, 
  // but validation ensures at least one is present.
  designation: yup.string().required("Designation is required"),
  designationOther: yup.string().when('designation', {
      is: 'Others',
      then: (schema) => schema.required("Please specify designation"),
      otherwise: (schema) => schema.notRequired()
  }),

  phone: yup
    .string()
    .required("Phone is required")
    .matches(phoneRegExp, "Phone must be 10 digits starting with 6-9"),
  email: yup.string().email("Invalid email").required("Email is required"),
  
  qualification: yup.string().required("Qualification is required"),
  qualificationOther: yup.string().when('qualification', {
    is: 'Others',
    then: (schema) => schema.required("Please specify qualification"),
    otherwise: (schema) => schema.notRequired()
  }),

  specialization: yup.string().required("Specialization is required"),
  specializationOther: yup.string().when('specialization', {
    is: 'Others',
    then: (schema) => schema.required("Please specify specialization"),
    otherwise: (schema) => schema.notRequired()
  }),

  basicSalary: yup
  .mixed()
  .required("Basic Salary is required")
  .test("is-positive", "Salary must be greater than 0", (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  })
  .test("is-decimal", "Invalid format (max 10 digits and 2 decimals)", (value) => {
    if (!value) return false;
    // Regex ensures 1-10 digits before decimal, optional .yy
    return /^\d{1,10}(\.\d{1,2})?$/.test(value.toString());
  }),

  // joiningDate: yup.string().required("Joining Date is required").typeError("Invalid Date"),
  joiningDate: yup
  .string()
  .required("Joining Date is required"),
  // .test("no-backdate", "Backdating is not allowed for new records", function (value) {
  //   const { isNew } = this.options.context || {}; // Get the flag from context
  //   if (!isNew || !value) return true; // Skip validation if editing or empty

  //   const today = new Date().toISOString().split("T")[0];
  //   return value >= today; // Lexicographical comparison works for YYYY-MM-DD
  // }),
  
  effectiveFrom: yup
    .string()
    .required("Effective From is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    
effectiveTo: yup
  .string()
  .nullable()
  .transform((curr, orig) => (orig === "" ? null : curr))
  .matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid date format",
    excludeEmptyString: true
  }),
});