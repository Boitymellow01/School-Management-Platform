import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Assignments from "./components/Assignments";
import Events from "./components/Events";
import Profile from "./components/Profile";
import ClassPerformance from "./pages/teacher/ClassPerformance";
import MyPerformance from "./pages/student/MyPerformance";
import ManageLibrary from "./pages/admin/ManageLibrary";
import SettingsProfile from "./pages/admin/SettingsProfile";
import StudentLibrary from "./pages/student/Library";
import MyStudents from "./pages/teacher/MyStudents";
import TeachersDirectory from "./pages/teacher/TeachersDirectory";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageTeachers from "./pages/admin/ManageTeachers";
import ManageClasses from "./pages/admin/ManageClasses";
import ManageExams from "./pages/admin/ManageExams";
import ManageAttendance from "./pages/admin/ManageAttendance";
import ManageAnnouncements from "./pages/admin/ManageAnnouncements";

import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClasses from "./pages/teacher/MyClasses";
import TakeAttendance from "./pages/teacher/TakeAttendance";
import EnterMarks from "./pages/teacher/EnterMarks";
import TeacherAnnouncements from "./pages/teacher/TeacherAnnouncements";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentClasses from "./pages/student/MyClasses";
import MyAttendance from "./pages/student/MyAttendance";
import MyExams from "./pages/student/MyExams";
import StudentAnnouncements from "./pages/student/StudentAnnouncements";

const guard = (role) => (
  <ProtectedRoute roles={[role]}><Layout /></ProtectedRoute>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Landing />} />

      <Route path="/admin" element={guard("admin")}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="teachers" element={<ManageTeachers />} />
        <Route path="classes" element={<ManageClasses />} />
        <Route path="exams" element={<ManageExams />} />
        <Route path="attendance" element={<ManageAttendance />} />
        <Route path="announcements" element={<ManageAnnouncements />} />
        <Route path="assignments" element={<Assignments canPost />} />
        <Route path="events" element={<Events canPost />} />
        <Route path="library" element={<ManageLibrary />} />
        <Route path="performance" element={<ClassPerformance />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<SettingsProfile />} />
      </Route>

      <Route path="/teacher" element={guard("teacher")}>
        <Route index element={<TeacherDashboard />} />
        <Route path="classes" element={<TeacherClasses />} />
        <Route path="attendance" element={<TakeAttendance />} />
        <Route path="marks" element={<EnterMarks />} />
        <Route path="students" element={<MyStudents />} />
        <Route path="teachers" element={<TeachersDirectory />} />
        <Route path="announcements" element={<TeacherAnnouncements />} />
        <Route path="assignments" element={<Assignments canPost />} />
        <Route path="events" element={<Events />} />
        <Route path="performance" element={<ClassPerformance />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/student" element={guard("student")}>
        <Route index element={<StudentDashboard />} />
        <Route path="classes" element={<StudentClasses />} />
        <Route path="attendance" element={<MyAttendance />} />
        <Route path="exams" element={<MyExams />} />
        <Route path="library" element={<StudentLibrary />} />
        <Route path="announcements" element={<StudentAnnouncements />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="events" element={<Events />} />
        <Route path="performance" element={<MyPerformance />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
