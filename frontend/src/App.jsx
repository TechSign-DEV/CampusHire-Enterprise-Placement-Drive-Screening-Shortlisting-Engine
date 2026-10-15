
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import StudentProfile from "./pages/StudentProfile";
import Students from "./pages/Students";

import CompanyProfile from "./pages/CompanyProfile";
import Companies from "./pages/Companies";

import Drives from "./pages/Drives";
import Screening from "./pages/Screening";
import StudentApplications from "./pages/StudentApplications";

import InterviewScheduling from "./pages/InterviewScheduling";
import StudentInterviews from "./pages/StudentInterviews";
import Analytics from "./pages/Analytics";
import UserManagement from "./pages/UserManagement";
import Reports from "./pages/Reports";
function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading CampusHire...</div>;
  }

  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading CampusHire...</div>;
  }

  return user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    children
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Guest routes */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      {/* Routes accessible to all authenticated users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/drives" element={<Drives />} />
      </Route>

      {/* Student routes */}
      <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
        <Route path="/student/profile" element={<StudentProfile />} />

        <Route
          path="/student/applications"
          element={<StudentApplications />}
        />

        <Route
          path="/student/interviews"
          element={<StudentInterviews />}
        />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin/students" element={<Students />} />

        <Route path="/admin/companies" element={<Companies />} />
      </Route>
<Route
  path="/admin/users"
  element={<UserManagement />}
/>
      {/* Admin and Recruiter routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "RECRUITER"]} />
        }
      >
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/screening" element={<Screening />} />

<Route path="/reports" element={<Reports />} />
        <Route
          path="/interviews"
          element={<InterviewScheduling />}
        />
      </Route>

      {/* Recruiter routes */}
      <Route element={<ProtectedRoute allowedRoles={["RECRUITER"]} />}>
        <Route
          path="/company-profile"
          element={<CompanyProfile />}
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
