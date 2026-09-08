import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { Toaster } from "react-hot-toast";
import { AuthContext, AuthProvider } from "./context/AuthContext";

// 1. Import Components ពិតប្រាកដចេញពី Folder pages
import Login from "./pages/Login";
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import ClassManagement from "./pages/ClassManagement";
import StudentManagement from "./pages/StudentManagement";
import AttendanceBoard from "./pages/AttendanceBoard";
import StudentIDCards from "./pages/StudentIDCards";
import UserManagement from "./pages/UserManagement";
import AttendanceReport from "./pages/AttendanceReport";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading)
    return <div className="p-8 text-center text-slate-500">កំពុងផ្ទុក...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Pages ទាំងអស់នឹងបង្ហាញ UI និងទិន្នន័យពេញលេញ */}
            <Route index element={<Dashboard />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="attendance" element={<AttendanceBoard />} />
            <Route path="id-cards" element={<StudentIDCards />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="attendance-report" element={<AttendanceReport />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
