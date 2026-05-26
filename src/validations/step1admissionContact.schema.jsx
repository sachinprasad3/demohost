import * as yup from "yup";
const mobileRegex = /^[6-9]\d{9}$/;
const pinCodeRegex = /^\d{6}$/;
const gmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const mobileSchema = yup
  .string()
  .matches(mobileRegex, "Starts with 6–9, 10 digits total");

const pinCodeSchema = yup
  .string()
  .matches(pinCodeRegex, "Enter 6 digit pin code");

export const contactDetailsSchema = yup.object({
  primaryContactAcademic: yup
    .string()
    .required("Please select any one as primary Contact"),

  selectedRelations: yup.object({
    FATHER: yup.boolean(),
    MOTHER: yup.boolean(),
    GUARDIAN: yup.boolean(),
  }),

  /* ======================= FATHER ======================= */
  fatherName: yup.string().when("selectedRelations.FATHER", {
    is: true,
    then: (s) => s.required("Father's name is required"),
  }),

  fatherPhone: yup.string().when("selectedRelations.FATHER", {
    is: true,
    then: (s) =>
      s.required("Father's phone number is required")
        .matches(mobileRegex, "Starts with 6–9, 10 digits total"),
  }),

  fatherOfficePhone: yup.string().nullable().test(
    "father-office-phone",
    "Starts with 6–9, 10 digits total",
    (val) => !val || mobileRegex.test(val)
  ),

  fatherCity: yup.string().when("selectedRelations.FATHER", {
    is: true,
    then: (s) => s.required("City is required"),
  }),

  fatherState: yup.string().when("selectedRelations.FATHER", {
    is: true,
    then: (s) => s.required("State is required"),
  }),

  fatherPinCode: yup.string().when("selectedRelations.FATHER", {
    is: true,
    then: (s) =>
      s.required("Pin Code is required")
        .matches(pinCodeRegex, "Enter 6 digit pin code"),
  }),

  fatherHomeAddressLine1: yup.string().when("selectedRelations.FATHER", {
    is: true,
    then: (s) => s.required("Father's home address is required"),
  }),

  fatherEmail: yup.string().when("primaryContactAcademic", {
    is: "FATHER",
    then: (s) =>
      s.required("Father's Gmail is required")
        .matches(gmailRegex, "Please enter a valid Gmail address"),
  }),

  /* ======================= MOTHER ======================= */
  motherName: yup.string().when("selectedRelations.MOTHER", {
    is: true,
    then: (s) => s.required("Mother's name is required"),
  }),

  motherPhone: yup.string().when("selectedRelations.MOTHER", {
    is: true,
    then: (s) =>
      s.required("Mother's phone number is required")
        .matches(mobileRegex, "Starts with 6–9, 10 digits total"),
  }),

  motherOfficePhone: yup.string().nullable().test(
    "mother-office-phone",
    "Starts with 6–9, 10 digits total",
    (val) => !val || mobileRegex.test(val)
  ),

  motherCity: yup.string().when("selectedRelations.MOTHER", {
    is: true,
    then: (s) => s.required("City is required"),
  }),

  motherState: yup.string().when("selectedRelations.MOTHER", {
    is: true,
    then: (s) => s.required("State is required"),
  }),

  motherPinCode: yup.string().when("selectedRelations.MOTHER", {
    is: true,
    then: (s) =>
      s.required("Pin Code is required")
        .matches(pinCodeRegex, "Enter 6 digit pin code"),
  }),

  motherHomeAddressLine1: yup.string().when("selectedRelations.MOTHER", {
    is: true,
    then: (s) => s.required("Mother's Home address is required"),
  }),

  motherEmail: yup.string().when("primaryContactAcademic", {
    is: "MOTHER",
    then: (s) =>
      s.required("Mother's Gmail is required")
        .matches(gmailRegex, "Please enter a valid Gmail address"),
  }),

  /* ======================= GUARDIAN ======================= */
  guardianName: yup.string().when("selectedRelations.GUARDIAN", {
    is: true,
    then: (s) => s.required("Guardian name is required"),
  }),

  guardianPhoneHome: yup.string().when("selectedRelations.GUARDIAN", {
    is: true,
    then: (s) =>
      s.required("Guardian phone number is required")
        .matches(mobileRegex, "Starts with 6–9, 10 digits total"),
  }),

  guardianCity: yup.string().when("selectedRelations.GUARDIAN", {
    is: true,
    then: (s) => s.required("City is required"),
  }),

  guardianState: yup.string().when("selectedRelations.GUARDIAN", {
    is: true,
    then: (s) => s.required("State is required"),
  }),

  guardianPinCode: yup.string().when("selectedRelations.GUARDIAN", {
    is: true,
    then: (s) =>
      s.required("Pin Code is required")
        .matches(pinCodeRegex, "Enter 6 digit pin code"),
  }),

  guardianHomeAddressLine1: yup.string().when("selectedRelations.GUARDIAN", {
    is: true,
    then: (s) => s.required("Guardian Home address is required"),
  }),

  guardianEmail: yup.string().when("primaryContactAcademic", {
    is: "GUARDIAN",
    then: (s) =>
      s.required("Guardian's Gmail is required")
        .matches(gmailRegex, "Please enter a valid Gmail address"),
  }),
});
