import Dashboard from "../pages/admin/Dashboard";
import Settings from "../pages/admin/Settings";
import Students from "../pages/admin/Students";
import StudentsList from "../components/StudentsList";
import AddEvent from "../pages/admin/AddEvent";
import AddFees from "../pages/admin/AddFees";
import Invoices from "../pages/admin/Invoices";
import EnquiryListPage from "../pages/admin/EnquiryListPage";
import ReportPage from "../pages/admin/Reports";
import PickupLocation from "../pages/admin/PickupLocation";
import ThemeSetting from "../pages/admin/ThemeSetting";
import AdminPaymentHistory from "../pages/admin/AdminPaymentHistory";
import DailyActivities from "../pages/admin/DailyActivities";
import DailyActivitiesList from "../pages/admin/DailyActivitiesList";
import AcademicPlanForm from "../pages/admin/AcademicPlanForm";
import AcademicPlanView from "../pages/admin/AcademicPlanView";


// ===== PARENT (STUDENT) ROUTES =====
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentProfile from "../pages/student/StudentProfile";
import Timetable from "../pages/student/Timetable";
import Syllabus from "../pages/student/Syllabus";
import Assignments from "../pages/student/Assignments";
import Events from "../pages/student/Events";
import Teachers from "../pages/student/Teachers";
import ReportsPanel from "../components/ReportsPanel";
import ExamPage from "../pages/student/ExamPage";
import StudentResult from "../pages/student/StudentResult";
import StudentFeeStructure from "../pages/student/StudentFeeStructure";
import StudentAttendanceCalender from "../components/Attendance/StudentAttendanceCalender";
import AdmissionFormView from "../pages/student/AdmissionFormView";
import ThemeSetting from "../pages/admin/ThemeSetting";
import NotificationList from "../pages/student/NotificationList";

// ===== TEACHER ROUTES =====
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import TeacherProfile from "../pages/teacher/TeacherProfile";
import DailyActivityUpload from "../pages/teacher/DailyActivityUpload";
import TeacherDailyActivities from "../pages/teacher/TeacherDailyActivities";
import StudentAttendance from "../pages/teacher/StudentAttendance";
import StudentAttendanceHistory from "../pages/admin/StudentAttendanceHistory";
import Events from "../pages/student/Events";

const HomeworkList = () =>  import("../pages/teacher/homework/HomeworkList");
const AllottedHomework = () =>  import("../pages/teacher/homework/AllottedHomework");


export const ADMIN_ROUTES = [
  { path: "dashboard", label: "Dashboard", component: Dashboard },
  { path: "students", label: "Students", component: Students },
  { path: "student-list", label: "Student List", component: StudentsList },
  { path: "reports", label: "Reports", component: ReportPage },
  { path: "settings", label: "Settings", component: Settings },
  { path: "transport", label: "Transport", component: PickupLocation },
  { path: "theme-setting", label: "Theme Setting", component: ThemeSetting },
  { path: "add-event", label: "Add Event", component: AddEvent },
  { path: "class-fees", label: "Class Fees", component: AddFees },
  { path: "invoices", label: "Invoices", component: Invoices },
  { path: "payment-history", label: "Payment History", component: AdminPaymentHistory },
  { path: "daily-activities", label: "Daily Activities", component: DailyActivities },
  { path: "daily-activities-list", label: "Daily Activities List", component: DailyActivitiesList },
  { path: "add-planner", label: "Add Planner", component: AcademicPlanForm },
  { path: "view-planner", label: "View Planner", component: AcademicPlanView },
  { path: "enquiries", label: "Enquiries", component: EnquiryListPage },
];



export const PARENT_ROUTES = [
  { path: "dashboard", label: "Dashboard", component: StudentDashboard },
  { path: "profile", label: "Profile", component: StudentProfile },
  { path: "fees", label: "Fees", component: StudentFeeStructure },
  { path: "timetable", label: "Timetable", component: Timetable },
  { path: "syllabus", label: "Syllabus", component: Syllabus },
  { path: "assignments", label: "Assignments", component: Assignments },
  { path: "events", label: "Events", component: Events },
  { path: "teachers", label: "Teachers", component: Teachers },
  { path: "reports", label: "Reports", component: ReportsPanel },
  { path: "exam", label: "Exam", component: ExamPage },
  { path: "results", label: "Results", component: StudentResult },
  { path: "attendance", label: "Attendance", component: StudentAttendanceCalender },
  { path: "notifications", label: "Notifications", component: NotificationList },
  { path: "admission-form-view", label: "Admission Form View", component: AdmissionFormView },
  { path: "theme-setting", label: "Theme Setting", component: ThemeSetting },
];




export const TEACHER_ROUTES = [
  {path: "dashboard", label: "Dashboard", component: TeacherDashboard, },
  {path: "profile", label: "Profile", component: TeacherProfile, },
  {path: "mark-attendance", label: "Mark Attendance", component: StudentAttendance, },
  {path: "attendance-History", label: "Attendance History", component: StudentAttendanceHistory, },
  {path: "daily-activity-upload", label: "Daily Activity Upload", component: DailyActivityUpload, },
  {path: "activities-list", label: "Daily Activities List", component: TeacherDailyActivities, },
  {path: "homework-list", label: "Homework List", component: HomeworkList,},
  {path: "allotted-homework", label: "Allotted Homework", component: AllottedHomework,},
  {path: "events", label: "Events", component: Events,},
];
