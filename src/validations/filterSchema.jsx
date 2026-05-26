import * as yup from "yup";

export const filterSchema = yup.object({
  phoneNo: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Only numbers are allowed")
    .min(10, "Phone number must be 10 digits")
    .max(10, "Phone number must be 10 digits"),
});
