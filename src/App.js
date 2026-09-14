import { BrowserRouter, Route, Routes } from "react-router-dom";
import MyCourses from "./components/mycomponents/students/MyCourses";
import MasterLayout from "./masterLayout/MasterLayout";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import HomePageOne from "./pages/HomePageOne";
import "./index.css";
import CourseDetail from "./pages/mypages/CourseDetail";
import CompletedCourses from "./pages/mypages/CompletedCourses";
import AttendanceReport from "./pages/mypages/AttendanceReport";
import ComplainForm from "./pages/mypages/ComplainForm";
import FeeDetails from "./pages/mypages/FeeDetails";
import SignInPage from "./pages/SignInPage";
import AdminDashboard from "./pages/mypages/AdminDashboard";
import AdminTeacher from "./pages/mypages/AdminTeacher";
import AddTeacher from "./pages/mypages/AddTeacher";
import AdminStudents from "./pages/mypages/AdminStudents";
import AddStudent from "./pages/mypages/AddStudents";
import AdminCourse from "./pages/mypages/AdminCourse";
import AddCourse from "./pages/mypages/AddCourse";
import RevenueStudentsFees from "./pages/mypages/RevenueStudentsFees";
import AdminProfile from "./pages/mypages/AdminProfile";
import TeacherDashboard from "./pages/mypages/TeacherDashboard";
import TeacherAssigment from "./pages/mypages/TeacherAssigment";
import UploadAssignment from "./pages/mypages/UploadAssignment";
import TeacherPaySLip from "./pages/mypages/TeacherPaySLip";
import TeacherProfile from "./pages/mypages/TeacherProfile";
import TransactionsPage from "./pages/mypages/TransactionsPage";
import AllSessions from "./pages/mypages/AllSessions";
import ClassCalendar from "./pages/mypages/ClassCalendar";
import MonthlyProgress from "./pages/mypages/MonthlyProgress";
import TeacherMonthlyProgress from "./pages/mypages/TeacherMonthlyProgress";
import AdminReviews from "./pages/mypages/AdminReviews";
import TeacherReviews from "./pages/mypages/TeacherReviews";
import StudentProfile from "./pages/mypages/StudentProfile";
import { AuthProvider } from "./context/AppContext";
import SessionCreate from "./pages/mypages/SessionCreate";
import EditAssignment from "./pages/mypages/EditAssignment";
import AdminCourseDetail from "./pages/mypages/AdminCourseDetail";
import ClassRoomPage from "./pages/mypages/ClassRoomPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouteScrollToTop />
        <Routes>
          <Route path="/" element={<SignInPage />} />
          <Route element={<MasterLayout />}>
            {/* Student Routes Start */}

            <Route path="/student-dashboard" element={<HomePageOne />} />
            <Route path="/monthly-progress" element={<MonthlyProgress />} />
            <Route path="/courses" element={<MyCourses />} />
            <Route path="/assigments" element={<CourseDetail />} />
            <Route path="/completed-course" element={<CompletedCourses />} />

            <Route path="/attendance" element={<AttendanceReport />} />
            <Route path="/complain-form" element={<ComplainForm />} />
            <Route path="/fee-section" element={<FeeDetails />} />
            <Route path="/view-profile" element={<StudentProfile />} />
            {/* Student Routes End */}

            {/* Admin Routes Start */}

            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/all-teacher" element={<AdminTeacher />} />
            <Route path="/add-teacher" element={<AddTeacher />} />
            <Route path="/all-students" element={<AdminStudents />} />
            <Route path="/add-student" element={<AddStudent />} />
            <Route path="/all-courses" element={<AdminCourse />} />
            <Route path="/add-course" element={<AddCourse />} />
            <Route path="/course/:id" element={<AdminCourseDetail />} />
            <Route path="/admin-reviews" element={<AdminReviews />} />
            <Route path="/edit-course/:id" element={<AddCourse />} />
            <Route path="/revenue" element={<RevenueStudentsFees />} />
            <Route path="/admin-profile" element={<AdminProfile />} />
          
            {/* Admin Routes End */}
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/assignments" element={<TeacherAssigment />} />
            <Route path="/upload-assignment" element={<UploadAssignment />} />
            <Route path="/pay-slip" element={<TeacherPaySLip />} />
            <Route path="/teacher-profile" element={<TeacherProfile />} />
            <Route path="/transaction" element={<TransactionsPage />} />
            <Route path="/all-session" element={<AllSessions />} />
            <Route path="/class-calendar" element={<ClassCalendar />} />
            <Route path="/classroom/:sessionId" element={<ClassRoomPage />} />
            <Route path="/create-session" element={<SessionCreate />} />
            <Route path="/edit-assignment/:id" element={<EditAssignment />} />
            <Route
              path="/students-progress"
              element={<TeacherMonthlyProgress />}
            />
            <Route path="/teacher-review" element={<TeacherReviews />} />
            {/* Teacher Routes End */}
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
