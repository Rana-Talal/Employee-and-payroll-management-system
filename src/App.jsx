import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./components/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import EditEmployee from "./pages/EditEmployee";
// import DataEmployee from "./pages/DataEmployee";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Logout from "./pages/Logout";
import Users from "./pages/Users";
import EditUser from "./pages/EditUser";
import ViewUser from "./pages/ViewUser";
import HRDepartmentPage from "./pages/HRDepartmentPage";
import SalaryDepartmentPage from "./pages/SalaryDepartmentPage";
import AuditDepartmentPage from "./components/AuditDepartmentPage";
import EmployeeSearch from "./components/EmployeeSearch";
import SalaryPage from "./pages/SalaryPage";
import SalaryDetailsPage from "./pages/SalaryDetailsPage";
import UserProfile from "./pages/UserProfile";
import NewEmployee from "./pages/NewEmployee";
import Audit from "./pages/Audit";
import EmployeeTabsPage from "./pages/EmployeeTabsPage";
import AddBranchDeptUnit from "./pages/AddBranchDeptUnit";
import CourseList from "./pages/CourseList";
import Dashboard from "./pages/Dashboard";
import EmployeeSummary from "./pages/EmployeeSummary";
import SalaryEmployeeView from "./pages/SalaryEmployeeView";
import ChangeReportsPage from "./pages/ChangeReportsPage";
import EntitlementsDeductionsManagement from "./pages/EntitlementsDeductionsManagement";

// New Dashboards
import MainDashboard from "./pages/MainDashboard";
import HRDashboard from "./pages/HRDashboard";
import AccountingDashboard from "./pages/AccountingDashboard";
import AuditDashboard from "./pages/AuditDashboard";
import AccountingChangeReportsPage from "./pages/AccountingChangeReportsPage";
import AuditChangeReportsPage from "./pages/AuditChangeReportsPage";
import ServiceManagementPage from "./pages/ServiceManagementPage";
import AppreciationLettersPage from "./pages/AppreciationLettersPage";
import AddServicePage from "./pages/AddServicePage";
import EditServicePage from "./pages/EditServicePage";
import AddAppreciationLetterPage from "./pages/AddAppreciationLetterPage";
import HREmployeeDetailPage from "./pages/HREmployeeDetailPage";
import AuditEmployeeView from "./pages/AuditEmployeeView";
import PositionManagement from "./pages/PositionManagement";
import GradeSalaryManagement from "./pages/GradeSalaryManagement";


export default function App() {
  const location = useLocation();
  const { username, token } = useAuth(); // ✅ نأخذ التوكن أيضاً
  const isLoggedIn = Boolean(username && token); // ✅ نتحقق من الاثنين معاً

  const showHeader = location.pathname !== "/login";
  const showNavbar = isLoggedIn && location.pathname !== "/login";

  return (
    <div className="max-w-screen min-h-screen bg-gray-100">
      <div className="max-w-full mx-auto bg-white shadow-md">
        {showHeader && <Header className="print:hidden" />}
        {showNavbar && <Navbar className="print:hidden" />}

        <main className="py-8 px-4">
          <Routes>
            <Route
              path="/login"
              element={<Login />}
            />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={<Navigate to="/login" replace />}
            />

            {isLoggedIn && (
              <>
                {/* Main Dashboard - Department Selection */}
                <Route path="/dashboard" element={<MainDashboard />} />

                {/* Old Dashboard with Sidebar - keeping for backward compatibility */}
                <Route path="/old-dashboard" element={<Dashboard />} />

                {/* New Department Dashboards */}
                <Route path="/hr-dashboard" element={<HRDashboard />} />
                <Route path="/accounting-dashboard" element={<AccountingDashboard />} />
                <Route path="/audit-dashboard" element={<AuditDashboard />} />

                {/* Change Reports - New Separated Pages */}
                <Route path="/accounting-change-reports" element={<AccountingChangeReportsPage />} />
                <Route path="/audit-change-reports" element={<AuditChangeReportsPage />} />

                {/* Old Change Reports - keeping for backward compatibility */}
                <Route path="/change-reports" element={<ChangeReportsPage />} />

                {/* HR Management Pages */}
                <Route path="/service-management" element={<ServiceManagementPage />} />
                <Route path="/add-service" element={<AddServicePage />} />
                <Route path="/edit-service/:id" element={<EditServicePage />} />
                <Route path="/appreciation-letters" element={<AppreciationLettersPage />} />
                <Route path="/add-appreciation-letter" element={<AddAppreciationLetterPage />} />
                <Route path="/entitlements-deductions" element={<EntitlementsDeductionsManagement />} />
                <Route path="/hr-employee-detail/:employeeId" element={<HREmployeeDetailPage />} />
                <Route path="/audit-employee-view/:employeeId" element={<AuditEmployeeView />} />
                <Route path="/employee-summary/:employeeId" element={<EmployeeSummary />} />
                <Route path="/salary-view/:employeeId" element={<SalaryEmployeeView />} />
                <Route path="/main" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/add-branch-dept-unit"
                  element={<AddBranchDeptUnit />}
                />
                {/* <Route path="/add-course" element={<AddCourse />} /> */}
                <Route path="/courses" element={<CourseList />} />
                <Route path="/positions" element={<PositionManagement />} />
                <Route path="/salary-scale" element={<GradeSalaryManagement />} />
                <Route path="/hr-department" element={<HRDepartmentPage />} />
                <Route path="/salary-department" element={<SalaryDepartmentPage />} />
                <Route path="/audit-department" element={<AuditDepartmentPage />} />

                <Route path="/edit-employee/:employeeId" element={<EditEmployee />} />

                {/* <Route path="/data-employee" element={<DataEmployee />} /> */}
                <Route path="/salary/:employeeId" element={<SalaryPage />} />
                <Route path="/salary-details/:salaryId" element={<SalaryDetailsPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/users" element={<Users />} />
                <Route path="/profile/:userName" element={<UserProfile />} />
                <Route path="/edit-user/:userId" element={<EditUser />} />
                <Route path="/view-user/:userName" element={<ViewUser />} />
                <Route path="/employee-search" element={<EmployeeSearch />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/data-NewEmployee" element={<NewEmployee />} />
                <Route path="/data-Audit" element={<Audit />} />
                <Route
                  path="/data-EmployeeTabsPage"
                  element={<EmployeeTabsPage />}
                />
              </>
            )}

            <Route
              path="*"
              element={
                isLoggedIn ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}