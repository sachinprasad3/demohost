// routes/AdminRoutes.jsx
import { lazy } from "react";
import { Route } from "react-router-dom";
import Dashboard from "../pages/admin/Dashboard";
// import Settings from "../pages/admin/Settings";
import Students from "../pages/admin/Students";
import StudentsList from "../components/StudentsList";
import AddEvent from "../pages/admin/AddEvent";
import AddFees from "../pages/admin/AddFees";
import StudentEdit from "../pages/admin/StudentEdit";
// import ThemeSetting from "../pages/admin/ThemeSetting";
import Invoices from "../pages/admin/Invoices";
import EnquiryListPage from "../pages/admin/EnquiryListPage";
import ReportPage from "../pages/admin/Reports";
import Teachers from "../pages/student/Teachers";
import PickupLocation from "../pages/admin/PickupLocation";
import AdminPaymentHistory from "../pages/admin/AdminPaymentHistory";
import EnquiryDetailPage from "../pages/admin/EnquiryDetailPage";
import SyllabusTopics from "../pages/admin/SyllabusTopics";
import AdminAdmissionView from "../pages/admin/AdminAdmissionView";
import StudentProfile from "../pages/student/StudentProfile";
import StudentFeeStructure from "../pages/student/StudentFeeStructure";
import DailyActivities from "../pages/admin/DailyActivities";
import DailyActivitiesList from "../pages/admin/DailyActivitiesList";
import SyllabusMaster from "../pages/admin/SyllabusMaster";
import LessonPlanList from "../pages/admin/LessonPlanList";
import LessonPlanFormPage from "../pages/admin/LessonPlanFormPage";
import HomeWorkList from "../pages/admin/HomeWorkList";
import AdmissionFormProvider from "../context/AdmissionFormContext";
import AllStudentOfParent from "../pages/admin/AllStudentOfParent";
import AllParents from "../pages/admin/AllParents";
import AdmissionForm from "../pages/student/AdmissionForm";
import ClassForm from "../pages/admin/ClassForm";
import SyllabusList from "../pages/admin/SyllabusList";
import MarkStudentAttendance from "../pages/teacher/MarkStudentAttendance";
import StudentAttendanceHistory from "../pages/admin/StudentAttendanceHistory";
import ThemeHero from "../pages/admin/master/Theme";
import LinkWhatsapp from "../pages/admin/LinkWhatsapp";
import SpellCheckPage from "../components/SpellCheckPage";
import TeacherProfile from "../pages/teacher/TeacherProfile";
import MonthlySyllabus from "../pages/admin/MonthlyPlan";
import MonthlySyllabusList from "../pages/admin/MonthlyPlanList";
import CreateSuperSyllabus from "../pages/admin/CreateSuperSyllabus";
import SuperSyllabusList from "../pages/admin/SuperSyllabusList";
import { useAuth } from "../context/AuthContext";
import BannerSlider from "../pages/admin/BannerSlider";

const AcademicYearHero = lazy(() => import("../pages/admin/master/AcademicYear"));
const AcademicTermHero = lazy(() => import("../pages/admin/master/AcademicTerm"));
const SubjectHero = lazy(() => import("../pages/admin/master/Subject"));
const TextBookHero = lazy(() => import("../pages/admin/master/TextBook"));
const TeacherMasterHero = lazy(() => import("../pages/admin/master/teacherMaster/TeacherMaster"));
const TeacherMasterForm = lazy(() => import("../pages/admin/master/teacherMaster/TeacherMasterForm"));
const TeacherMasterView = lazy(() => import("../pages/admin/master/teacherMaster/TeacherMasterView"));
const SendNotification = lazy(() => import("../pages/admin/SendNotification"));
const AcademicPlanForm = lazy(() => import("../pages/admin/AcademicPlanForm"));
const AcademicPlanView = lazy(() => import("../pages/admin/AcademicPlanView"));
const ForwardedHomeworkList = lazy(() => import("../pages/admin/homework/ForwardedHomeworkList"));
const ForwardedHomeworkView = lazy(() => import("../pages/admin/homework/ForwardedHomeworkView"));
const AdminTemplateForm = lazy(() => import("../pages/admin/AdminTemplateForm"));
const AdminTemplateView = lazy(() => import("../pages/admin/AdminTemplateView"));

// ✅ Route Config
export const ADMIN_ROUTES = [
  { path: "dashboard", element: Dashboard, label: "Dashboard" },
  { path: "student-list", element: StudentsList, label: "Student List" },
  { path: "students", element: Students, label: "Students" },
  { path: "all-parents", element: AllParents, label: "All Parents" },
  { path: "all-parents/students", element: AllStudentOfParent, label: "Parent Students" },
  { path: "profile", element: StudentProfile, label: "Profile" },
  { path: "reports", element: ReportPage, label: "Reports" },
  // { path: "settings", element: Settings, label: "Settings" },
  { path: "transport", element: PickupLocation, label: "Transport" },
  // { path: "theme-setting", element: ThemeSetting, label: "Theme Setting" },
  { path: "add-event", element: AddEvent, label: "Add Event" },
  { path: "class-fees", element: AddFees, label: "Class Fees" },
  { path: "add-new-class", element: ClassForm, label: "Add Class" },
  { path: "invoices", element: Invoices, label: "Invoices" },
  { path: "payment-history", element: AdminPaymentHistory, label: "Payment History", allowedRoles: ["OWNER"], },
  { path: "payment-details", element: StudentFeeStructure, label: "Payment Details", allowedRoles: ["OWNER"], },
  { path: "enquiries", element: EnquiryListPage, label: "Enquiries" },
  { path: "mark-attendance", element: MarkStudentAttendance, label: "Mark Attendance" },
  { path: "attendance-history", element: StudentAttendanceHistory, label: "Attendance History" },
  { path: "create-syllabus", element: SyllabusMaster, label: "Create Syllabus" },
  { path: "create-super-syllabus", element: CreateSuperSyllabus, label: "Create Super Syllabus" },
  { path: "edit-super-syllabus/:id/:slug", element: CreateSuperSyllabus, hideInTheme: true },

  { path: "syllabus-list", element: SyllabusList, label: "Syllabus List" },
  { path: "super-syllabus-list", element: SuperSyllabusList, label: "Super Syllabus List" },
  { path: "daily-activities", element: DailyActivities, label: "Daily Activities" },
  { path: "daily-activities-list", element: DailyActivitiesList, label: "Daily Activities List" },
  { path: "add-lesson-plan", element: LessonPlanFormPage, label: "Add Lesson Plan" },
  { path: "lesson-plan-list", element: LessonPlanList, label: "Lesson Plan List" },
  { path: "academic-year", element: AcademicYearHero, label: "Academic Year" },
  { path: "academic-term", element: AcademicTermHero, label: "Academic Term" },
  { path: "subjects", element: SubjectHero, label: "Subjects" },
  { path: "text-books", element: TextBookHero, label: "Text Books" },
  { path: "teachers", element: TeacherMasterHero, label: "Teachers" },
  { path: "add-teacher", element: TeacherMasterForm, label: "Add Teacher" },
  { path: "send-notification", element: SendNotification, label: "Send Notification" },
  { path: "teacher-profile", element: TeacherProfile, label: "Teacher Profile" },
  { path: "homework-list", element: ForwardedHomeworkList, label: "Forwarded Homework" },
  { path: "themes", element: ThemeHero, label: "Themes" },
  { path: "spell", element: SpellCheckPage, label: "Spell Check" },
  { path: "add-template", element: AdminTemplateForm, label: "Add Template" },
  { path: "edit-template", element: AdminTemplateForm, label: "Edit Template" },
  { path: "view-template", element: AdminTemplateView, label: "View Template" },
  { path: "add-academic-plan", element: AcademicPlanForm, label: "Add Academic Plan" },
  { path: "view-academic-plan", element: AcademicPlanView, label: "View Academic Plan" },
  { path: "link-whats-app", element: LinkWhatsapp, label: "Link Whats App" },
  { path: "edit-class", element: ClassForm, label: "Edit Class" },
  { path: "edit-teacher", element: TeacherMasterForm, label: "Edit Teacher" },
  { path: "monthly-plan", element: MonthlySyllabus, label: "Add Monthly Plan" },
  { path: "monthly-plan-list", element: MonthlySyllabusList, label: "Monthly Plan List" },
  { path: "edit-academic-plan", element: AcademicPlanForm, label: "Edit Academic Plan" },
   { path: "banner-slider", element: BannerSlider, label: "Banner Slider" },
  
  // Wrapped
  {
    path: "admin-admission-review",
    element: () => (
      <AdmissionFormProvider>
        <AdminAdmissionView />
      </AdmissionFormProvider>
    ),
    label: "Admission Review",
  },
  {
    path: "admission-form",
    element: () => (
      <AdmissionFormProvider>
        <AdmissionForm />
      </AdmissionFormProvider>
    ),
    label: "Admission Form",
  },

  // Dynamic routes (hidden)
  { path: "admin/edit-student/:id", element: StudentEdit, hideInTheme: true },
  { path: "enquiries/:enquiryId", element: EnquiryDetailPage, hideInTheme: true },
  { path: "edit-syllabus/:id/:slug", element: SyllabusMaster, hideInTheme: true },
  { path: "teacher/edit/:id", element: TeacherMasterForm, hideInTheme: true },
  { path: "teacher/view/:id", element: TeacherMasterView, hideInTheme: true },
  { path: "forwarded-homework/view/:title", element: ForwardedHomeworkView, hideInTheme: true },
];
