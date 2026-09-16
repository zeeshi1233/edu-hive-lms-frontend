import { BrowserRouter, Route, Routes } from "react-router-dom";
import MyCourses from "./components/mycomponents/students/MyCourses";
import MasterLayout from "./masterLayout/MasterLayout";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import HomePageOne from "./pages/HomePageOne";
import "./index.css";
import "./lms-panel.css";
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
import TeacherProfile from "./pages/mypages/TeacherProfile";
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
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import NotFoundRedirect from "./components/NotFoundRedirect";
import AppToast from "./components/common/AppToast";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouteScrollToTop />
        <AppToast />
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <SignInPage />
              </PublicRoute>
            }
          />

          {/* All app pages require login */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MasterLayout />}>
              {/* Student */}
              <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                <Route path="/student-dashboard" element={<HomePageOne />} />
                <Route path="/monthly-progress" element={<MonthlyProgress />} />
                <Route path="/courses" element={<MyCourses />} />
                <Route path="/assigments" element={<CourseDetail />} />
                <Route path="/completed-course" element={<CompletedCourses />} />
                <Route path="/attendance" element={<AttendanceReport />} />
                <Route path="/complain-form" element={<ComplainForm />} />
                <Route path="/fee-section" element={<FeeDetails />} />
                <Route path="/view-profile" element={<StudentProfile />} />
              </Route>

              {/* Admin */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
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
                <Route path="/create-session" element={<SessionCreate />} />
              </Route>

              {/* Teacher */}
              <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
                <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                <Route path="/assignments" element={<TeacherAssigment />} />
                <Route path="/upload-assignment" element={<UploadAssignment />} />
                <Route path="/teacher-profile" element={<TeacherProfile />} />
                <Route path="/edit-assignment/:id" element={<EditAssignment />} />
                <Route path="/students-progress" element={<TeacherMonthlyProgress />} />
                <Route path="/teacher-review" element={<TeacherReviews />} />
              </Route>

              {/* Shared authenticated pages */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={["admin", "teacher", "student"]} />
                }
              >
                <Route path="/all-session" element={<AllSessions />} />
                <Route path="/class-calendar" element={<ClassCalendar />} />
                <Route path="/classroom/:sessionId" element={<ClassRoomPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
