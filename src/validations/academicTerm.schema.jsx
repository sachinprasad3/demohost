import * as yup from "yup";

export const academicTermSchema = yup.object({
  academicYear: yup.string().required("Academic year is required"),

  termName: yup
    .string()
    .required("Term name is required")
    .max(20, "Max 20 characters"),

  startDate: yup
    .string()
    .required("Start date is required")
    .test(
      "valid-start-date",
      "Start date must be 1st april of academic year start",
      function (startDate) {
        const { academicYear } = this.parent;
        if (!startDate || !academicYear) return true;

        const [startYear] = academicYear.split("-").map(Number);
        const date = new Date(startDate);

        const year = date.getFullYear();
        const month = date.getMonth(); // 0-based (April = 3)
        const day = date.getDate();

        return year === startYear && month === 3 && day === 1;
      },
    ),

  endDate: yup
    .string()
    .required("End date is required")
    .test(
      "valid-end-date",
      "End date must be 31st march of academic year end",
      function (endDate) {
        const { academicYear } = this.parent;
        if (!endDate || !academicYear) return true;

        const [, endYear] = academicYear.split("-").map(Number);
        const date = new Date(endDate);

        const year = date.getFullYear();
        const month = date.getMonth(); // 0-based (March = 2)
        const day = date.getDate();
        return year === endYear && month === 2 && day === 31;
      },
    )
    .test(
      "is-after-start",
      "End date must be after start date",
      function (endDate) {
        const { startDate } = this.parent;
        if (!startDate || !endDate) return true;
        return new Date(endDate) >= new Date(startDate);
      },
    ),

  termSequence: yup
    .number()
    .typeError("Sequence must be a number")
    .positive()
    .required("Sequence is required"),

  isCurrent: yup.string().oneOf(["Y", "N"]).required("Required"),
});
