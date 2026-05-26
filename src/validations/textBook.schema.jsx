import * as yup from "yup";

export const textBookSchema = yup.object({
  academicYear: yup.string().required("Academic year is required"),
  classId: yup
    .number()
    .required("Class is required")
    .typeError("Class is required"),
  subjectId: yup
    .number()
    .required("Subject is required")
    .typeError("Subject is required"),
  textBookName: yup
    .string()
    .required("Text book name is required")
    .max(100, "Max 100 characters"),

  author: yup
    .string()
    .required("Author is required")
    .max(200, "Max 200 characters"),

  publisher: yup
    .string()
    .required("Publisher is required")
    .max(200, "Max 200 characters"),

  publishedYear: yup
    .string()
    .required("Published year is required")
    .matches(/^\d{4}$/, "Enter valid year"),
});
