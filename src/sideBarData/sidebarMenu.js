export const sidebarMenu = {
  student: [
    { name: "Dashboard", path: "/student-dashboard", icon: "lucide:layout-dashboard" },
    { name: "Class Calendar", path: "/class-calendar", icon: "mdi:calendar-month-outline" },
    { name: "My Courses", path: "/courses", icon: "mdi:book-open-page-variant" },
    { name: "Completed Courses", path: "/completed-course", icon: "mdi:check-decagram" },
    { name: "Attendance Report", path: "/attendance", icon: "mdi:clipboard-check-outline" },
    { name: "Complaint Form", path: "/complain-form", icon: "mdi:message-alert-outline" },
    { name: "Fee Details", path: "/fee-section", icon: "mdi:currency-inr" },
    { name: "Monthly Progress", path: "/monthly-progress", icon: "mdi:chart-bar" },
  ],

  teacher: [
    { name: "Home", path: "/teacher-dashboard", icon: "mdi:home" },
    { name: "Assignments", path: "/assignments", icon: "mdi:file-edit-outline" },
    { name: "Student Progress", path: "/students-progress", icon: "mdi:chart-bar" },
    { name: "Class Calendar", path: "/class-calendar", icon: "mdi:calendar-month-outline" },
    { name: "Transaction", path: "/transaction", icon: "mdi:swap-horizontal-circle" },
    { name: "My Account", path: "/teacher-profile", icon: "mdi:account-circle" },
    { name: "Earning", path: "/pay-slip", icon: "mdi:cash-multiple" },
    { name: "Reviews", path: "/teacher-review", icon: "mdi:message-text-outline" },
  ],

  admin: [
    { name: "Dashboard", path: "/admin-dashboard", icon: "mdi:view-dashboard-outline" },
    { name: "Class Calendar", path: "/class-calendar", icon: "mdi:calendar-month-outline" },
    { name: "Teachers", path: "/all-teacher", icon: "mdi:account-tie" },
    { name: "Students", path: "/all-students", icon: "mdi:account-group" },
    { name: "All Sessions", path: "/all-session", icon: "mdi:calendar-multiple-check" },
    { name: "Courses", path: "/all-courses", icon: "mdi:book-education-outline" },
    { name: "Reviews", path: "/admin-reviews", icon: "mdi:message-text-outline" },
  ],
};
