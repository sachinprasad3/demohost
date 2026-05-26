import * as yup from "yup";

export const subjectSchema = yup.object({
  subjectName: yup
    .string()
    .required("Subject name is required")
    .max(100, "Max 100 characters"),

  subjectCode: yup
    .string()
    .required("Subject code is required")
    .max(20, "Max 20 characters"),

  // displayOrder: yup
  //   .number()
  //   .typeError("Display order must be a number")
  //   .positive("Must be greater than 0")
  //   .nullable(),

  active: yup.string().oneOf(["Y", "N"]).required("Status is required"),
});
