import * as yup from "yup";

export const homeworkSchema = yup.object({
  academicYear: yup.string().required("Academic year is required"),
  classId: yup
    .number()
    .required("Class is required")
    .typeError("Class is required"),
  subjectId: yup
    .number()
    .required("Subject is required")
    .typeError("Subject is required"),
  topicId: yup
    .number()
    .required("Topic is required")
    .typeError("Topic is required"),
  syllabusId: yup
    .number()
    .required("Syllabus is required")
    .typeError("Syllabus is required"),
  activityId: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .optional()
    .nullable(),
  homeworkTitle: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  totalMarks: yup
    .number()
    .typeError("Number Only")
    .positive("Must be greater than 0")
    .required("Total marks required"),
  // submissionType: yup
  //   .string()
  //   .required("Submission type required")
  //   .oneOf(submissionType, "Invalid submission type"),
  visibleToParents: yup
    .string()
    .required("Visibility to parents is required")
    .oneOf(["Y", "N"], "Invalid option"),
  attachments: yup.array().of(
    yup.object({
      file: yup
        .mixed()
        .required("File is required")
        .test("file", "File must be provided", (value) => {
          const file = value?.[0];
          return !!file;
        })
        .test("fileType", "Unsupported file format", (value) => {
          const file = value?.[0];
          if (!file) return false;
          const allowedTypes = [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ];
          return allowedTypes.includes(file.type);
        })
        .test("fileSize", "File size must be less than 1MB", (value) => {
          const file = value?.[0];
          if (!file) return false;
          return file.size <= 1 * 1024 * 1024;
        }),

      caption: yup
        .string()
        .nullable()
        .max(100, "Caption cannot exceed 100 characters")
        .when("file", {
          is: (file) => !!file?.length,
          then: (schema) => schema.required("Caption is required"),
          otherwise: (schema) => schema.nullable(),
        }),

      description: yup
        .string()
        .nullable()
        .max(500, "Description cannot exceed 500 characters")
        .when("file", {
          is: (file) => !!file?.length,
          then: (schema) => schema.required("Description is required"),
          otherwise: (schema) => schema.nullable(),
        }),
    }),
  ),
});

const today = new Date().toISOString().split("T")[0];

export const homeworkAssignSchema = yup.object({
  dailyTeachingPlanId: yup.number().required("Plan id is required"),
  teacherToAdminRemrk: yup.string().optional(),
  dueDate: yup
    .string()
    .required("Due date is required")
    .test(
      "is-befor-today",
      "Due date cannot be in the past",
      function (dueDate) {
        const input = new Date(dueDate).toDateString();
        const today = new Date().toDateString();
        return new Date(input) >= new Date(today);
      },
    ),
  // visibleTill: yup
  //   .string()
  //   .required("VisibleTill is required")
  //   .test(
  //     "is-befor-today",
  //     "Visible till cannot be in the past",
  //     function (visibleDate) {
  //       const input = new Date(visibleDate).toDateString();
  //       const today = new Date().toDateString();
  //       return new Date(input) >= new Date(today);
  //     },
  //   ),
  submissionType: yup.string().required("Submission Type is required"),
  teacherId: yup.number().required("Teacher is required"),
  studentIds: yup
    .array()
    .of(yup.number().required())
    .min(1, "Students are required")
    .required("Students are required"),
});
